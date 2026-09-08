import sys
import time
from pathlib import Path
import pytest

# Ensure ai directory is on sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi.testclient import TestClient
from app.main import app, JOBS_DB
from app.config import settings
from app.graph.forge_graph import forge_graph, build_forge_graph
from app.connectors.github import sanitize_repo_name, IDEMPOTENCY_STORE

client = TestClient(app)
AUTH_HEADERS = {"X-Internal-Secret": settings.INTERNAL_SERVICE_SECRET}


def test_sanitize_repo_name():
    assert sanitize_repo_name("My Great SaaS") == "forge-my-great-saas"
    assert sanitize_repo_name("forge-already-prefixed") == "forge-already-prefixed"
    assert sanitize_repo_name("special!@#$chars&*()") == "forge-special-chars"


def test_github_idempotency_cache():
    key = "test-idemp-12345"
    IDEMPOTENCY_STORE[key] = {
        "success": True,
        "repoUrl": "https://github.com/mock-user/forge-cached-repo",
        "repoName": "forge-cached-repo",
        "issuesCount": 5
    }
    from app.connectors.github import create_github_project
    res = create_github_project(
        token="mock-token",
        project_name="Cached Project",
        summary="Test summary",
        architecture={},
        tasks=[],
        idempotency_key=key
    )
    assert res["repoUrl"] == "https://github.com/mock-user/forge-cached-repo"
    assert res["issuesCount"] == 5


@pytest.mark.asyncio
async def test_langgraph_pipeline_execution():
    initial_state = {
        "goal": "Build an expense tracking SaaS for college students with budget planning",
        "project_name": "Student Budget AI",
        "category": "web",
        "create_github_repo": False,
        "step_logs": [],
        "repair_count": 0,
        "errors": []
    }

    final_state = await forge_graph.ainvoke(initial_state)

    # 1. Analyst Agent output
    reqs = final_state.get("requirements")
    assert reqs is not None
    assert len(reqs.get("personas", [])) > 0
    assert len(reqs.get("functional", [])) > 0

    # 2. Research Agent output
    research = final_state.get("research")
    assert research is not None
    assert len(research.get("techStack", [])) >= 3

    # 3. Architect Agent output
    arch = final_state.get("architecture")
    assert arch is not None
    assert "topology" in arch
    assert len(arch.get("dbSchema", {}).get("tables", [])) >= 3
    assert len(arch.get("apiEndpoints", [])) >= 3
    assert len(arch.get("keyDecisions", [])) >= 3

    # 4. Planner Agent output
    tasks = final_state.get("tasks")
    assert tasks is not None
    assert len(tasks) >= 5
    first_task = tasks[0]
    assert "title" in first_task
    assert "tag" in first_task
    assert "priority" in first_task
    assert "assignedAgent" in first_task

    # 5. Step logs
    logs = final_state.get("step_logs", [])
    assert len(logs) >= 4
    agents_logged = {l["agent"] for l in logs}
    assert "Analyst Agent" in agents_logged
    assert "Research Agent" in agents_logged
    assert "Architect Agent" in agents_logged
    assert "Planner Agent" in agents_logged


def test_agents_run_http202_background_job():
    payload = {
        "goal": "Build an AI code review bot for pull requests",
        "projectName": "PR Review Bot",
        "category": "ai"
    }
    res = client.post("/agents/run", json=payload, headers=AUTH_HEADERS)
    assert res.status_code == 202
    data = res.json()
    assert "jobId" in data
    job_id = data["jobId"]

    # Poll status until completed (with timeout)
    max_wait_seconds = 15
    start = time.time()
    completed = False
    
    while time.time() - start < max_wait_seconds:
        poll_res = client.get(f"/agents/runs/{job_id}", headers=AUTH_HEADERS)
        assert poll_res.status_code == 200
        job_data = poll_res.json()
        
        if job_data["status"] == "completed":
            completed = True
            assert job_data["progress"] == 100
            assert job_data["blueprint"] is not None
            assert len(job_data["blueprint"]["tasks"]) >= 5
            assert len(job_data["logs"]) >= 4
            break
        time.sleep(0.5)

    assert completed is True, f"Job {job_id} did not complete within {max_wait_seconds}s"
