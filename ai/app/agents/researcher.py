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

    # Contextual tech stack evaluation
    is_mobile = category == "mobile"
    is_backend = category == "backend"

    stack = [
        TechStackItem(
            layer="Frontend / Client",
            technology="React 18 + Vite + Tailwind CSS" if not is_mobile else "React Native + Expo",
            rationale="Sub-second HMR development loop, component reusability, and minimal bundle size."
        ),
        TechStackItem(
            layer="Backend API Gateway",
            technology="Node.js Express (ESM) + Async Middleware",
            rationale="High concurrent I/O throughput, non-blocking event loop, and low cold-start latency."
        ),
        TechStackItem(
            layer="AI Microservice Engine",
            technology="Python 3.14 + FastAPI + LiteLLM + LangGraph",
            rationale="Multi-provider LLM abstraction, asynchronous durable workflows, and native Pydantic typing."
        ),
        TechStackItem(
            layer="Vector & Relational Storage",
            technology="PostgreSQL 16 with pgvector + Qdrant",
            rationale="Single ACID database layer with native cosine similarity vector indexing."
        ),
        TechStackItem(
            layer="DevOps & Deployment",
            technology="Docker + GitHub Actions + Render Web Services",
            rationale="Deterministic container builds, automated branch testing, and continuous zero-downtime deployment."
        )
    ]
    return [item.model_dump() for item in stack]
