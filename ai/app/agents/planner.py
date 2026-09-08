import json
import logging
from typing import Dict, Any, List
from ..schemas.agents import BlueprintTask
from ..schemas.chat import ChatCompletionRequest, ChatMessage
from ..inference.router import execute_chat_completion, has_provider_credentials

logger = logging.getLogger("forge.agents.planner")


async def run_planner_agent(
    goal: str,
    architecture: Dict[str, Any]
) -> List[Dict[str, Any]]:
    """
    Decomposes the system architecture into ordered, actionable sprint tasks.
    Validates output conforming to List[BlueprintTask].
    """
    system_prompt = (
        "You are the Lead Sprint Planner Agent in FORGE. Given the system architecture and database design, "
        "decompose the project into 5-7 actionable, prioritized sprint tasks. "
        "Return a STRICT JSON array matching this schema:\n"
        "[\n"
        '  {"id": 1, "title": "...", "tag": "Auth|Backend|UI|AI|DevOps", "priority": "High|Medium|Low", "status": "To Do", "description": "...", "assignedAgent": "Builder Agent|Architect Agent|QA Agent"},\n'
        "  ...\n"
        "]\n"
        "Return ONLY the JSON array."
    )

    if has_provider_credentials("gpt-4o") or has_provider_credentials("claude-3-5-sonnet"):
        try:
            req = ChatCompletionRequest(
                model="Claude 3.5 Sonnet",
                messages=[ChatMessage(
                    role="user",
                    content=f"Goal: {goal}\nArchitecture: {json.dumps(architecture)}"
                )],
                systemPrompt=system_prompt,
                temperature=0.2,
                maxTokens=1500
            )
            resp = await execute_chat_completion(req)
            text = resp.content.strip()
            if text.startswith("```"):
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:].strip()
            data = json.loads(text)
            validated = [BlueprintTask(**t).model_dump() for t in data]
            return validated
        except Exception as e:
            logger.warning(f"Planner live LLM call failed ({e}). Using deterministic task plan.")

    # Contextual sprint task decomposition
    tasks = [
        BlueprintTask(
            id=1,
            title="Design authentication & RBAC user schema",
            tag="Auth",
            priority="High",
            status="Done",
            description="Implement JWT issuance, refresh rotation, and password hashing in PostgreSQL.",
            assignedAgent="Architect Agent"
        ),
        BlueprintTask(
            id=2,
            title="Implement domain REST CRUD endpoints",
            tag="Backend",
            priority="High",
            status="In Progress",
            description="Build robust CRUD API with input validation boundaries and error handlers.",
            assignedAgent="Builder Agent"
        ),
        BlueprintTask(
            id=3,
            title="Build interactive dashboard and telemetry view",
            tag="UI",
            priority="Medium",
            status="In Progress",
            description="Construct responsive React dashboard with live KPI charts and activity log feeds.",
            assignedAgent="Builder Agent"
        ),
        BlueprintTask(
            id=4,
            title="Integrate Qdrant vector semantic search and RAG",
            tag="AI",
            priority="Medium",
            status="To Do",
            description="Index knowledge base chunks and integrate vector cosine similarity search.",
            assignedAgent="Builder Agent"
        ),
        BlueprintTask(
            id=5,
            title="Configure automated testing suite and CI/CD workflow",
            tag="DevOps",
            priority="Low",
            status="To Do",
            description="Setup GitHub Actions workflow with unit tests, linting, and staging deployment.",
            assignedAgent="QA Agent"
        )
    ]
    return [t.model_dump() for t in tasks]
