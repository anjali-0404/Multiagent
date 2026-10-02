import sys
from pathlib import Path
import pytest

# Ensure ai directory is on sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from app.graph.forge_graph import forge_graph
from app.schemas.agents import (
    ProjectBlueprint,
    BlueprintRequirements,
    BlueprintArchitecture,
    BlueprintTask,
    TechStackItem
)
from app.connectors.github import IDEMPOTENCY_STORE, create_github_project
from app.inference.router import has_provider_credentials

HAVE_LLM_CREDS = has_provider_credentials("gpt-4o") or has_provider_credentials("claude-3-5-sonnet")

GOLDEN_BENCHMARK_PROMPTS = [
    {
        "id": "bench-1",
        "goal": "Build an enterprise expense and budget management portal with real-time audit logs and multi-currency conversion",
        "category": "web",
        "expected_domain_keywords": ["expense", "budget", "audit", "currency"]
    },
    {
        "id": "bench-2",
        "goal": "Build a mobile IoT telemetry sensor dashboard monitoring temperature and humidity with edge alert rules",
        "category": "mobile",
        "expected_domain_keywords": ["iot", "sensor", "telemetry", "temperature", "alert"]
    },
    {
        "id": "bench-3",
        "goal": "Build a multi-agent automated code review and security vulnerability scanner for GitHub pull requests",
        "category": "ai",
        "expected_domain_keywords": ["review", "security", "vulnerability", "scanner", "github"]
    }
]


@pytest.mark.parametrize("benchmark", GOLDEN_BENCHMARK_PROMPTS)
@pytest.mark.asyncio
async def test_golden_dataset_blueprint_quality(benchmark):
    """
    When LLM credentials ARE present: evaluates that every golden-dataset prompt
    produces a structurally complete, Pydantic-compliant blueprint.

    When credentials are NOT present: asserts that the pipeline FAILS with a clear
    error rather than hallucinating a fake blueprint — which would be a false pass.
    """
    initial_state = {
        "goal": benchmark["goal"],
        "project_name": f"FORGE {benchmark['id']}",
        "category": benchmark["category"],
        "create_github_repo": False,
        "step_logs": [],
        "repair_count": 0,
        "errors": []
    }

    if not HAVE_LLM_CREDS:
        # Correct behaviour: pipeline raises rather than hallucinating output.
        with pytest.raises(Exception, match="API key"):
            await forge_graph.ainvoke(initial_state)
        return  # honest failure == passing this guard test

    # ---- Credentials present: assert real blueprint quality ----
    final_state = await forge_graph.ainvoke(initial_state)

    # 1. Requirements Quality Assertion
    req_data = final_state.get("requirements")
    assert req_data is not None
    reqs = BlueprintRequirements(**req_data)
    assert len(reqs.personas) >= 2, "Must specify at least 2 distinct user personas"
    assert len(reqs.functional) >= 3, "Must specify at least 3 functional requirements"
    assert len(reqs.nonFunctional) >= 2, "Must specify at least 2 non-functional constraints"

    # 2. Architecture Quality Assertion
    arch_data = final_state.get("architecture")
    assert arch_data is not None
    arch = BlueprintArchitecture(**arch_data)
    assert len(arch.techStack) >= 3, "Architecture must define at least 3 tech stack layers"
    assert len(arch.dbSchema.get("tables", [])) >= 3, "Database ERD must define at least 3 tables"
    assert len(arch.apiEndpoints) >= 3, "Must define at least 3 API endpoint contracts"
    assert len(arch.keyDecisions) >= 3, "Must provide at least 3 key architectural decisions"

    # 3. Tasks Breakdown Quality Assertion
    tasks_data = final_state.get("tasks")
    assert tasks_data is not None
    tasks = [BlueprintTask(**t) for t in tasks_data]
    assert len(tasks) >= 4, "Must decompose into at least 4 actionable sprint tasks"
    for t in tasks:
        assert t.id > 0
        assert len(t.title) > 5
        assert t.priority in ["High", "Medium", "Low"]
        assert t.status in ["Done", "In Progress", "To Do"]
        assert t.assignedAgent in ["Builder Agent", "Architect Agent", "QA Agent", "Reviewer Agent"]

    # 4. Step Trace Integrity Assertion
    logs = final_state.get("step_logs", [])
    assert len(logs) >= 4, "Every pipeline stage must record a step trace"


def test_idempotency_key_enforcement():
    """Verifies that repeat invocations with the same idempotency key return identical cached outputs."""
    key = "idemp-gold-eval-999"
    mock_cached = {
        "success": True,
        "repoUrl": "https://github.com/forge-org/cached-eval-repo",
        "repoName": "forge-cached-eval-repo",
        "issuesCount": 6
    }
    IDEMPOTENCY_STORE[key] = mock_cached

    res1 = create_github_project("mock-token", "Project 1", "Summary 1", {}, [], idempotency_key=key)
    res2 = create_github_project("mock-token", "Project 2", "Summary 2", {}, [], idempotency_key=key)

    assert res1 == res2
    assert res1["repoUrl"] == "https://github.com/forge-org/cached-eval-repo"
