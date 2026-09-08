import sys
from pathlib import Path
import pytest

# Ensure ai directory is on sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi.testclient import TestClient
from app.main import app
from app.config import settings
from app.inference.router import (
    get_target_model,
    is_reasoning_model,
    calculate_cost,
    LOCAL_PRICE_PER_TOKEN
)

client = TestClient(app)
AUTH_HEADERS = {"X-Internal-Secret": settings.INTERNAL_SERVICE_SECRET}


def test_model_mappings():
    assert get_target_model("GPT-4o") == "gpt-4o"
    assert "claude" in get_target_model("Claude 3.5 Sonnet")
    assert "deepseek" in get_target_model("DeepSeek R1")
    assert "gemini" in get_target_model("Gemini 1.5 Pro")


def test_reasoning_model_detection():
    assert is_reasoning_model("deepseek/deepseek-reasoner") is True
    assert is_reasoning_model("o1-mini") is True
    assert is_reasoning_model("gpt-4o") is False
    assert is_reasoning_model("claude-3-5-sonnet") is False


def test_cost_calculation_fallback():
    # When litellm returns None or throws, fallback to local pricing table
    cost = calculate_cost(None, "GPT-4o", 1000)
    expected = round(1000 * LOCAL_PRICE_PER_TOKEN["GPT-4o"], 6)
    assert cost == expected
    assert cost > 0


def test_multimodel_infer_chat():
    for model in ["GPT-4o", "Claude 3.5 Sonnet", "DeepSeek R1", "Gemini 1.5 Pro"]:
        payload = {
            "model": model,
            "messages": [{"role": "user", "content": f"Test completion with {model}"}],
            "temperature": 0.7,
            "maxTokens": 500
        }
        res = client.post("/infer/chat", json=payload, headers=AUTH_HEADERS)
        assert res.status_code == 200
        data = res.json()
        assert data["model"] == model
        assert "content" in data
        assert data["usage"]["totalTokens"] > 0
        assert data["meta"]["latencyMs"] >= 0
        assert data["meta"]["costUsd"] >= 0


def test_streaming_sse_endpoint():
    payload = {
        "model": "GPT-4o",
        "messages": [{"role": "user", "content": "Stream this technical answer."}]
    }
    with client.stream("POST", "/infer/chat/stream", json=payload, headers=AUTH_HEADERS) as response:
        assert response.status_code == 200
        assert "text/event-stream" in response.headers.get("content-type", "")
        assert response.headers.get("x-accel-buffering") == "no"
        assert "no-cache" in response.headers.get("cache-control", "")
        
        chunks = []
        for line in response.iter_lines():
            if line.startswith("data: "):
                chunks.append(line)
        assert len(chunks) > 0
