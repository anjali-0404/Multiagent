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


def test_workflow_dag_execution():
    payload = {
        "id": "wf-test-1",
        "name": "Lead Scoring & ICP Enrichment Flow",
        "trigger": "Webhook (Inbound Lead)",
        "nodes": [
            {"id": "n-1", "type": "trigger", "label": "Incoming Webhook Ingestion"},
            {"id": "n-2", "type": "rag", "label": "Search Enterprise Security Whitepaper"},
            {"id": "n-3", "type": "llm", "label": "ICP Scoring Evaluator"},
            {"id": "n-4", "type": "tool", "label": "CRM Connector"},
            {"id": "n-5", "type": "action", "label": "Slack Alert Broadcast"}
        ]
    }

    res = client.post("/workflows/run", json=payload, headers=AUTH_HEADERS)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["workflowId"] == "wf-test-1"
    assert data["durationMs"] >= 0
    assert data["tokensConsumed"] > 0
    assert len(data["logs"]) >= 6

    # Verify log traces for every node type
    log_text = " ".join(data["logs"])
    assert "[TRIGGER]" in log_text
    assert "[RAG]" in log_text
    assert "[LLM]" in log_text
    assert "[TOOL]" in log_text
    assert "[ACTION]" in log_text
    assert "[SUCCESS]" in log_text
