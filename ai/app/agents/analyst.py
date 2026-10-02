import json
import logging
from typing import Dict, Any
from ..schemas.agents import BlueprintRequirements
from ..schemas.chat import ChatCompletionRequest, ChatMessage
from ..inference.router import execute_chat_completion, has_provider_credentials

logger = logging.getLogger("forge.agents.analyst")


async def run_analyst_agent(goal: str, category: str = "web") -> Dict[str, Any]:
    """
    Deconstructs user goal into personas, functional, and non-functional requirements.
    Validates output with BlueprintRequirements schema.
    """
    system_prompt = (
        "You are the Lead Requirements Analyst Agent in FORGE. Given a project goal, analyze the domain "
        "and return a STRICT JSON object conforming to this schema:\n"
        "{\n"
        '  "summary": "Concise domain summary",\n'
        '  "personas": ["Persona 1 with role", "Persona 2", ...],\n'
        '  "functional": ["Requirement 1", "Requirement 2", ...],\n'
        '  "nonFunctional": ["SLA / Performance constraint", "Security constraint", ...]\n'
        "}\n"
        "Return ONLY the JSON object. Do not include markdown code block markers or conversational preamble."
    )

    if has_provider_credentials("gpt-4o") or has_provider_credentials("claude-3-5-sonnet"):
        try:
            req = ChatCompletionRequest(
                model="GPT-4o",
                messages=[ChatMessage(role="user", content=f"Goal: {goal}\nCategory: {category}")],
                systemPrompt=system_prompt,
                temperature=0.2,
                maxTokens=1200
            )
            resp = await execute_chat_completion(req)
            text = resp.content.strip()
            if text.startswith("```"):
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:].strip()
            data = json.loads(text)
            validated = BlueprintRequirements(**data)
            return validated.model_dump()
        except Exception as e:
            logger.warning(f"Analyst live LLM call failed ({e}). Using deterministic domain analysis.")

    # No provider credentials available — cannot perform real analysis.
    # Raising so the job pipeline marks the run 'failed' with an honest error
    # rather than silently returning fabricated requirements.
    raise RuntimeError(
        "Analyst Agent requires a configured LLM provider API key (OPENAI_API_KEY or "
        "ANTHROPIC_API_KEY). Add the key to ai/.env and restart the service."
    )
