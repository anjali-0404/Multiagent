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

    # No provider credentials available — cannot perform real task decomposition.
    raise RuntimeError(
        "Planner Agent requires a configured LLM provider API key (OPENAI_API_KEY or "
        "ANTHROPIC_API_KEY). Add the key to ai/.env and restart the service."
    )
