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
from app.inference.router import has_provider_credentials

client = TestClient(app)
AUTH_HEADERS = {"X-Internal-Secret": settings.INTERNAL_SERVICE_SECRET}

HAVE_LLM_CREDS = has_provider_credentials("gpt-4o") or has_provider_credentials("claude-3-5-sonnet")


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
async def test_langgraph_pipeline_requires_credentials():
    """
    Without LLM provider credentials, the agent pipeline must FAIL with a clear
    RuntimeError rather than silently returning a fabricated/hallucinated blueprint.

    With credentials present, the pipeline must produce a structurally valid blueprint.
    """
    initial_state = {
        "goal": "Build an expense tracking SaaS for college students with budget planning",
        "project_name": "Student Budget AI",
        "category": "web",
        "create_github_repo": False,
        "step_logs": [],
        "repair_count": 0,
        "errors": []
    }

    if not HAVE_LLM_CREDS:
        # Without credentials the graph should propagate the RuntimeError from the
        # analyst node. LangGraph wraps node exceptions, so we catch broadly.
        with pytest.raises(Exception, match="API key"):
            await forge_graph.ainvoke(initial_state)
        return  # Pass — honest failure is the correct behaviour

    # ---- Credentials present: assert real output quality ----
    final_state = await forge_graph.ainvoke(initial_state)

    reqs = final_state.get("requirements")
    assert reqs is not None
    assert len(reqs.get("personas", [])) > 0
    assert len(reqs.get("functional", [])) > 0

    research = final_state.get("research")
    assert research is not None
    assert len(research.get("techStack", [])) >= 3

    arch = final_state.get("architecture")
    assert arch is not None
    assert "topology" in arch
    assert len(arch.get("dbSchema", {}).get("tables", [])) >= 3
    assert len(arch.get("apiEndpoints", [])) >= 3
    assert len(arch.get("keyDecisions", [])) >= 3

    tasks = final_state.get("tasks")
    assert tasks is not None
    assert len(tasks) >= 5
    first_task = tasks[0]
    assert "title" in first_task
    assert "tag" in first_task
    assert "priority" in first_task
    assert "assignedAgent" in first_task

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

    # Poll status until completed or failed (with timeout)
    max_wait_seconds = 20
    start = time.time()
    final_status = None

    while time.time() - start < max_wait_seconds:
        poll_res = client.get(f"/agents/runs/{job_id}", headers=AUTH_HEADERS)
        assert poll_res.status_code == 200
        job_data = poll_res.json()

        if job_data["status"] in ("completed", "failed"):
            final_status = job_data["status"]
            break
        time.sleep(0.5)

    assert final_status is not None, f"Job {job_id} did not settle within {max_wait_seconds}s"

    if not HAVE_LLM_CREDS:
        # Without credentials the job must FAIL — not silently return a hallucinated blueprint.
        assert final_status == "failed", (
            "Expected job to fail without LLM credentials, but it completed. "
            "This indicates hallucinated output is being returned."
        )
        assert job_data.get("error") is not None, "Failed job must carry an error message"
    else:
        # With credentials the job must complete with a real blueprint.
        assert final_status == "completed"
        assert job_data["progress"] == 100
        assert job_data["blueprint"] is not None
        assert len(job_data["blueprint"]["tasks"]) >= 5
        assert len(job_data["logs"]) >= 4
