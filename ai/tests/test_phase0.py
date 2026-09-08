import sys
from pathlib import Path
import pytest

# Ensure ai directory is on sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi.testclient import TestClient
from app.main import app
from app.config import settings

client = TestClient(app)
AUTH_HEADERS = {"X-Internal-Secret": settings.INTERNAL_SERVICE_SECRET}


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "providers" in data


def test_unauthorized_access():
    # Without X-Internal-Secret header
    response = client.post("/infer/chat", json={"model": "GPT-4o", "messages": []})
    assert response.status_code == 401


def test_chat_inference_contract():
    payload = {
        "model": "GPT-4o",
        "messages": [{"role": "user", "content": "How do I optimize system architecture?"}],
        "systemPrompt": "You are a Principal Software Engineer.",
        "temperature": 0.7,
        "maxTokens": 1024
    }
    response = client.post("/infer/chat", json=payload, headers=AUTH_HEADERS)
    assert response.status_code == 200
    data = response.json()
    
    # Verify strict camelCase contract
    assert "id" in data
    assert data["role"] == "assistant"
    assert "content" in data
    assert data["model"] == "GPT-4o"
    
    # Usage contract check
    usage = data["usage"]
    assert "inputTokens" in usage
    assert "outputTokens" in usage
    assert "totalTokens" in usage
    assert isinstance(usage["totalTokens"], int)
    assert usage["totalTokens"] > 0
    
    # Meta contract check
    meta = data["meta"]
    assert "latencyMs" in meta
    assert isinstance(meta["latencyMs"], int)


def test_rag_ingest_and_search_contracts():
    ingest_payload = {
        "title": "Architecture Blueprint",
        "category": "Architecture",
        "content": "Microservices communicate asynchronously via message buses and strict gRPC contracts."
    }
    ingest_res = client.post("/rag/ingest", json=ingest_payload, headers=AUTH_HEADERS)
    assert ingest_res.status_code == 200
    ingest_data = ingest_res.json()
    assert ingest_data["success"] is True
    assert ingest_data["chunksCount"] >= 1
    assert len(ingest_data["chunksSample"]) > 0

    search_payload = {"query": "microservices architecture"}
    search_res = client.post("/rag/search", json=search_payload, headers=AUTH_HEADERS)
    assert search_res.status_code == 200
    search_data = search_res.json()
    assert search_data["success"] is True
    assert len(search_data["results"]) > 0
    
    # Verify UI result shape
    item = search_data["results"][0]
    assert "documentId" in item
    assert "title" in item
    assert "category" in item
    assert "similarityScore" in item
    assert "snippet" in item
    assert "vectorModel" in item


def test_agent_run_202_async_job():
    payload = {
        "goal": "Build an AI expense tracker for college students",
        "projectName": "College Expense Tracker"
    }
    response = client.post("/agents/run", json=payload, headers=AUTH_HEADERS)
    assert response.status_code == 202
    data = response.json()
    assert "jobId" in data
    assert data["status"] == "queued"
    
    job_id = data["jobId"]
    status_res = client.get(f"/agents/runs/{job_id}", headers=AUTH_HEADERS)
    assert status_res.status_code == 200
    job_data = status_res.json()
    assert job_data["jobId"] == job_id
    assert "status" in job_data
