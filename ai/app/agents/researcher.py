import json
import logging
from typing import Dict, Any, List
from ..schemas.agents import TechStackItem
from ..schemas.chat import ChatCompletionRequest, ChatMessage
from ..inference.router import execute_chat_completion, has_provider_credentials

logger = logging.getLogger("forge.agents.researcher")


async def run_research_agent(goal: str, requirements: Dict[str, Any], category: str = "web") -> List[Dict[str, Any]]:
    """
    Evaluates tech stack tradeoffs and recommends libraries.
    Validates output conforming to List[TechStackItem].
    """
    system_prompt = (
        "You are the Principal Tech Stack Research Agent in FORGE. Given project requirements, "
        "evaluate architectural alternatives and return a STRICT JSON array of stack choices conforming to:\n"
        "[\n"
        '  {"layer": "Frontend", "technology": "...", "rationale": "..."},\n'
        '  {"layer": "Backend API", "technology": "...", "rationale": "..."},\n'
        '  {"layer": "Database", "technology": "...", "rationale": "..."},\n'
        '  {"layer": "AI / ML Engine", "technology": "...", "rationale": "..."},\n'
        '  {"layer": "CI/CD & DevOps", "technology": "...", "rationale": "..."}\n'
        "]\n"
        "Return ONLY the JSON array."
    )

    if has_provider_credentials("gpt-4o") or has_provider_credentials("claude-3-5-sonnet"):
        try:
            req = ChatCompletionRequest(
                model="Claude 3.5 Sonnet",
                messages=[ChatMessage(role="user", content=f"Goal: {goal}\nRequirements: {json.dumps(requirements)}")],
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
            validated = [TechStackItem(**item).model_dump() for item in data]
            return validated
        except Exception as e:
            logger.warning(f"Research live LLM call failed ({e}). Using deterministic stack selection.")

    # No provider credentials available — cannot perform real tech-stack research.
    raise RuntimeError(
        "Research Agent requires a configured LLM provider API key (OPENAI_API_KEY or "
        "ANTHROPIC_API_KEY). Add the key to ai/.env and restart the service."
    )
