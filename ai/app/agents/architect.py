import json
import logging
from typing import Dict, Any, List
from ..schemas.agents import BlueprintArchitecture, TechStackItem
from ..schemas.chat import ChatCompletionRequest, ChatMessage
from ..inference.router import execute_chat_completion, has_provider_credentials

logger = logging.getLogger("forge.agents.architect")


async def run_architect_agent(
    goal: str,
    requirements: Dict[str, Any],
    tech_stack: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Synthesizes system architecture, component topology, database ERD, and API contracts.
    Validates output conforming to BlueprintArchitecture.
    """
    system_prompt = (
        "You are the Principal System Architect Agent in FORGE. Given requirements and tech stack, "
        "synthesize a complete system architecture. Return a STRICT JSON object matching this schema:\n"
        "{\n"
        '  "topology": "High level topology name and summary",\n'
        '  "techStack": [...],\n'
        '  "dbSchema": {"tables": ["table1", "table2", ...], "relations": ["..."]},\n'
        '  "apiEndpoints": [{"path": "/api/...", "method": "GET|POST|PUT|DELETE", "description": "..."}],\n'
        '  "keyDecisions": ["Decision 1 with architectural rationale", "Decision 2", ...]\n'
        "}\n"
        "Return ONLY the JSON object."
    )

    if has_provider_credentials("gpt-4o") or has_provider_credentials("claude-3-5-sonnet"):
        try:
            req = ChatCompletionRequest(
                model="GPT-4o",
                messages=[ChatMessage(
                    role="user",
                    content=f"Goal: {goal}\nRequirements: {json.dumps(requirements)}\nTech Stack: {json.dumps(tech_stack)}"
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
            validated = BlueprintArchitecture(**data)
            return validated.model_dump()
        except Exception as e:
            logger.warning(f"Architect live LLM call failed ({e}). Using deterministic architecture synthesis.")

    # No provider credentials available — cannot perform real architecture synthesis.
    raise RuntimeError(
        "Architect Agent requires a configured LLM provider API key (OPENAI_API_KEY or "
        "ANTHROPIC_API_KEY). Add the key to ai/.env and restart the service."
    )
