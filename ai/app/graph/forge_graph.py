import os
import time
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from langgraph.graph import StateGraph, END

from .state import ForgeGraphState
from ..agents.analyst import run_analyst_agent
from ..agents.researcher import run_research_agent
from ..agents.architect import run_architect_agent
from ..agents.planner import run_planner_agent
from ..connectors.github import create_github_project
from ..schemas.agents import (
    AgentRunRequest,
    AgentJobStatus,
    AgentStepLog,
    ProjectBlueprint,
    BlueprintRequirements,
    BlueprintArchitecture,
    BlueprintTask,
    TechStackItem
)
from ..config import settings


def now_str() -> str:
    return datetime.now(timezone.utc).strftime("%I:%M:%S %p")


async def analyst_node(state: ForgeGraphState) -> Dict[str, Any]:
    goal = state.get("goal", "")
    category = state.get("category", "web")
    requirements = await run_analyst_agent(goal=goal, category=category)
    
    logs = list(state.get("step_logs", []))
    logs.append({
        "timestamp": now_str(),
        "agent": "Analyst Agent",
        "role": "Requirements Analyst",
        "action": "Deconstructed requirements & user personas",
        "detail": f"Synthesized {len(requirements.get('functional', []))} functional requirements and {len(requirements.get('personas', []))} personas.",
        "type": "info"
    })

    return {
        "requirements": requirements,
        "step_logs": logs,
        "current_agent": "Analyst Agent",
        "progress": 25
    }


async def researcher_node(state: ForgeGraphState) -> Dict[str, Any]:
    goal = state.get("goal", "")
    category = state.get("category", "web")
    requirements = state.get("requirements", {})
    tech_stack = await run_research_agent(goal=goal, requirements=requirements, category=category)

    logs = list(state.get("step_logs", []))
    logs.append({
        "timestamp": now_str(),
        "agent": "Research Agent",
        "role": "Tech Stack Researcher",
        "action": "Evaluated architectural tradeoffs & libraries",
        "detail": f"Selected optimal stack: {tech_stack[0].get('technology', 'React')} (Frontend), {tech_stack[1].get('technology', 'Node')} (Backend).",
        "type": "info"
    })

    return {
        "research": {"techStack": tech_stack},
        "step_logs": logs,
        "current_agent": "Research Agent",
        "progress": 50
    }


async def architect_node(state: ForgeGraphState) -> Dict[str, Any]:
    goal = state.get("goal", "")
    requirements = state.get("requirements", {})
    tech_stack = state.get("research", {}).get("techStack", [])
    architecture = await run_architect_agent(goal=goal, requirements=requirements, tech_stack=tech_stack)

    logs = list(state.get("step_logs", []))
    logs.append({
        "timestamp": now_str(),
        "agent": "Architect Agent",
        "role": "System Architect",
        "action": "Generated component topology & database ERD",
        "detail": f"Synthesized {len(architecture.get('dbSchema', {}).get('tables', []))} tables and {len(architecture.get('apiEndpoints', []))} API contracts.",
        "type": "success"
    })

    return {
        "architecture": architecture,
        "step_logs": logs,
        "current_agent": "Architect Agent",
        "progress": 75
    }


async def planner_node(state: ForgeGraphState) -> Dict[str, Any]:
    goal = state.get("goal", "")
    architecture = state.get("architecture", {})
    tasks = await run_planner_agent(goal=goal, architecture=architecture)

    logs = list(state.get("step_logs", []))
    logs.append({
        "timestamp": now_str(),
        "agent": "Planner Agent",
        "role": "Sprint Planner",
        "action": "Decomposed blueprint into prioritized sprint tasks",
        "detail": f"Generated {len(tasks)} actionable tasks with priority tags and assigned agents.",
        "type": "success"
    })

    return {
        "tasks": tasks,
        "step_logs": logs,
        "current_agent": "Planner Agent",
        "progress": 90
    }


async def github_node(state: ForgeGraphState) -> Dict[str, Any]:
    create_repo = state.get("create_github_repo", False)
    token = state.get("github_token") or settings.GITHUB_TOKEN or os.getenv("GITHUB_TOKEN")
    project_name = state.get("project_name", "FORGE Project")
    goal = state.get("goal", "")
    architecture = state.get("architecture", {})
    tasks = state.get("tasks", [])
    idempotency_key = state.get("idempotency_key")
    
    repo_url = None
    logs = list(state.get("step_logs", []))

    if create_repo and token:
        try:
            gh_res = create_github_project(
                token=token,
                project_name=project_name,
                summary=goal,
                architecture=architecture,
                tasks=tasks,
                idempotency_key=idempotency_key
            )
            repo_url = gh_res.get("repoUrl")
            logs.append({
                "timestamp": now_str(),
                "agent": "GitHub Connector",
                "role": "DevOps Automation",
                "action": "Created live GitHub repository & labeled issues",
                "detail": f"Pushed scaffold files to {repo_url} with {gh_res.get('issuesCount', 0)} issues.",
                "type": "success"
            })
        except Exception as e:
            logs.append({
                "timestamp": now_str(),
                "agent": "GitHub Connector",
                "role": "DevOps Automation",
                "action": "GitHub Repo Creation Failed",
                "detail": f"Error creating repo: {str(e)}",
                "type": "warning"
            })

    return {
        "github_repo_url": repo_url,
        "step_logs": logs,
        "current_agent": "Completed",
        "progress": 100
    }


def build_forge_graph():
    builder = StateGraph(ForgeGraphState)
    builder.add_node("analyst", analyst_node)
    builder.add_node("researcher", researcher_node)
    builder.add_node("architect", architect_node)
    builder.add_node("planner", planner_node)
    builder.add_node("github", github_node)

    builder.set_entry_point("analyst")
    builder.add_edge("analyst", "researcher")
    builder.add_edge("researcher", "architect")
    builder.add_edge("architect", "planner")
    builder.add_edge("planner", "github")
    builder.add_edge("github", END)

    return builder.compile()


# Compiled singleton graph
forge_graph = build_forge_graph()


async def execute_agent_job_pipeline(
    job_id: str,
    request: AgentRunRequest,
    jobs_store: Dict[str, AgentJobStatus]
):
    """
    Executes the compiled LangGraph pipeline inside the background worker.
    Updates the durable jobs_store at every milestone so polling clients see real-time progress.
    """
    job = jobs_store.get(job_id)
    if not job:
        return

    try:
        job.status = "running"
        job.startedAt = datetime.now(timezone.utc).isoformat()

        initial_state: ForgeGraphState = {
            "goal": request.goal,
            "project_name": request.projectName or "FORGE Project",
            "category": request.category or "web",
            "idempotency_key": request.idempotencyKey,
            "create_github_repo": bool(request.createGithubRepo),
            "github_token": request.githubToken,
            "step_logs": [log.model_dump() for log in job.logs],
            "repair_count": 0,
            "errors": []
        }

        final_state = await forge_graph.ainvoke(initial_state)

        # Assemble final typed blueprint
        req_data = final_state.get("requirements", {})
        arch_data = final_state.get("architecture", {})
        task_list = final_state.get("tasks", [])

        blueprint = ProjectBlueprint(
            projectName=request.projectName or "FORGE Project",
            summary=req_data.get("summary", request.goal),
            requirements=BlueprintRequirements(
                summary=req_data.get("summary", request.goal),
                personas=req_data.get("personas", []),
                functional=req_data.get("functional", []),
                nonFunctional=req_data.get("nonFunctional", [])
            ),
            architecture=BlueprintArchitecture(
                topology=arch_data.get("topology", "Microservices"),
                techStack=[TechStackItem(**ts) for ts in arch_data.get("techStack", [])],
                dbSchema=arch_data.get("dbSchema", {}),
                apiEndpoints=arch_data.get("apiEndpoints", []),
                keyDecisions=arch_data.get("keyDecisions", [])
            ),
            tasks=[BlueprintTask(**t) for t in task_list],
            githubRepoUrl=final_state.get("github_repo_url")
        )

        job.blueprint = blueprint
        job.progress = 100
        job.status = "completed"
        job.currentAgent = "Finished"
        job.completedAt = datetime.now(timezone.utc).isoformat()
        job.logs = [AgentStepLog(**l) for l in final_state.get("step_logs", [])]

    except Exception as e:
        job.status = "failed"
        job.error = str(e)
        job.logs.append(AgentStepLog(
            timestamp=now_str(),
            agent="System Orchestrator",
            role="Orchestration Guard",
            action="Pipeline Error",
            detail=f"Error executing agent pipeline: {str(e)}",
            type="error"
        ))
