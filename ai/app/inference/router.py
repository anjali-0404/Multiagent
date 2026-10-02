import os
import time
import asyncio
import json
import logging
from typing import Dict, Any, List, Optional, AsyncGenerator
import litellm
from litellm import acompletion, completion_cost

from ..config import settings
from ..schemas.chat import (
    ChatCompletionRequest,
    ChatCompletionResponse,
    ChatUsage,
    ChatMeta
)

logger = logging.getLogger("forge.inference")

# Suppress litellm noisy telemetry & logs
litellm.telemetry = False
litellm.drop_params = True

# Standardized model mappings
MODEL_MAPPING: Dict[str, str] = {
    "GPT-4o": "gpt-4o",
    "gpt-4o": "gpt-4o",
    "Claude 3.5 Sonnet": "claude-3-5-sonnet-20241022",
    "claude-3.5-sonnet": "claude-3-5-sonnet-20241022",
    "DeepSeek R1": "deepseek/deepseek-reasoner",
    "deepseek-r1": "deepseek/deepseek-reasoner",
    "Gemini 1.5 Pro": "gemini/gemini-1.5-pro",
    "gemini-1.5-pro": "gemini/gemini-1.5-pro"
}

# Reasoner models that reject `temperature` / sampling parameters
REASONING_MODELS = {
    "deepseek/deepseek-reasoner",
    "deepseek-reasoner",
    "o1",
    "o1-mini",
    "o1-preview",
    "o3-mini"
}

# Local price fallback per token ($ / token)
LOCAL_PRICE_PER_TOKEN: Dict[str, float] = {
    "GPT-4o": 0.000005,
    "Claude 3.5 Sonnet": 0.000003,
    "DeepSeek R1": 0.000001,
    "Gemini 1.5 Pro": 0.0000035
}


def get_target_model(model_name: str) -> str:
    return MODEL_MAPPING.get(model_name, model_name)


def is_reasoning_model(target_model: str) -> bool:
    target_lower = target_model.lower()
    return any(rm in target_lower for rm in REASONING_MODELS)


def has_provider_credentials(target_model: str) -> bool:
    target_lower = target_model.lower()
    if "claude" in target_lower or "anthropic" in target_lower:
        return bool(settings.ANTHROPIC_API_KEY or os.getenv("ANTHROPIC_API_KEY"))
    elif "deepseek" in target_lower:
        return bool(settings.DEEPSEEK_API_KEY or os.getenv("DEEPSEEK_API_KEY"))
    elif "gemini" in target_lower or "google" in target_lower:
        return bool(settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY"))
    elif "gpt" in target_lower or "openai" in target_lower or "o1" in target_lower:
        return bool(settings.OPENAI_API_KEY or os.getenv("OPENAI_API_KEY"))
    return False


def calculate_cost(completion_resp: Any, model_name: str, total_tokens: int) -> float:
    """Safely calculates completion cost with fallback to local price table."""
    try:
        cost = completion_cost(completion_response=completion_resp)
        if cost and cost > 0:
            return round(float(cost), 6)
    except Exception as e:
        logger.debug(f"litellm.completion_cost exception: {e}")
    
    # Fallback to local table
    price_per_token = LOCAL_PRICE_PER_TOKEN.get(model_name, 0.000003)
    return round(total_tokens * price_per_token, 6)


async def execute_chat_completion(payload: ChatCompletionRequest) -> ChatCompletionResponse:
    start_time = time.time()
    target_model = get_target_model(payload.model)
    has_creds = has_provider_credentials(target_model)

    # Format messages for LiteLLM
    formatted_messages: List[Dict[str, str]] = []
    if payload.systemPrompt:
        formatted_messages.append({"role": "system", "content": payload.systemPrompt})
        
    for msg in payload.messages:
        formatted_messages.append({"role": msg.role, "content": msg.content})

    if has_creds:
        try:
            # Sanitize parameters: strip temperature for reasoning models (DeepSeek R1 / o1)
            extra_params: Dict[str, Any] = {}
            if not is_reasoning_model(target_model):
                if payload.temperature is not None:
                    extra_params["temperature"] = payload.temperature
            if payload.maxTokens is not None:
                extra_params["max_tokens"] = payload.maxTokens

            response = await acompletion(
                model=target_model,
                messages=formatted_messages,
                **extra_params
            )

            message_obj = response.choices[0].message
            content = message_obj.content or ""
            
            # Extract reasoning trace if available (DeepSeek R1 / o1)
            reasoning_content = None
            if hasattr(message_obj, "reasoning_content") and message_obj.reasoning_content:
                reasoning_content = message_obj.reasoning_content
            elif hasattr(message_obj, "provider_specific_fields") and message_obj.provider_specific_fields:
                reasoning_content = message_obj.provider_specific_fields.get("reasoning_content")

            # Extract exact usage mapping to camelCase
            usage_obj = getattr(response, "usage", None)
            input_tokens = getattr(usage_obj, "prompt_tokens", 0) if usage_obj else 0
            output_tokens = getattr(usage_obj, "completion_tokens", 0) if usage_obj else 0
            total_tokens = getattr(usage_obj, "total_tokens", input_tokens + output_tokens) if usage_obj else 0

            latency_ms = int((time.time() - start_time) * 1000)
            cost_usd = calculate_cost(response, payload.model, total_tokens)

            return ChatCompletionResponse(
                id=f"msg-{int(time.time() * 1000)}",
                role="assistant",
                content=content,
                model=payload.model,
                usage=ChatUsage(
                    inputTokens=input_tokens,
                    outputTokens=output_tokens,
                    totalTokens=total_tokens
                ),
                meta=ChatMeta(
                    finishReason=response.choices[0].finish_reason or "stop",
                    latencyMs=latency_ms,
                    costUsd=cost_usd,
                    reasoningContent=reasoning_content
                )
            )
        except Exception as e:
            logger.warning(f"Live LLM call to {target_model} failed ({e}). Falling back to simulation.")

    # Graceful fallback simulation if credentials not provided or upstream error
    return generate_simulated_completion(payload, start_time)


def generate_simulated_completion(payload: ChatCompletionRequest, start_time: float) -> ChatCompletionResponse:
    """
    Honest offline fallback returned when no provider API key is configured or the
    upstream LLM call failed.  Does NOT fabricate a real-looking answer; instead it
    transparently discloses that the service is running in demo/offline mode so the
    user knows their message was not actually processed by an LLM.
    """
    PROVIDER_HINTS = {
        "gpt-4o":                     ("OPENAI_API_KEY",    "OpenAI"),
        "claude-3-5-sonnet-20241022":  ("ANTHROPIC_API_KEY", "Anthropic"),
        "deepseek/deepseek-reasoner":  ("DEEPSEEK_API_KEY",  "DeepSeek"),
        "gemini/gemini-1.5-pro":      ("GEMINI_API_KEY",    "Google"),
    }
    target = get_target_model(payload.model)
    env_var, provider_name = PROVIDER_HINTS.get(target, ("OPENAI_API_KEY", "the provider"))

    content = (
        "\u26a0\ufe0f **Offline / Demo Mode \u2014 no real inference was performed.**\n\n"
        f"The **{payload.model}** model requires a valid `{env_var}` key to be set in "
        f"`ai/.env` (or as a server environment variable).\n\n"
        f"**To enable live responses:**\n"
        f"1. Obtain an API key from {provider_name}.\n"
        f"2. Add it to `ai/.env`: `{env_var}=<your-key>`\n"
        f"3. Restart the Python AI service (`python ai/run.py`).\n\n"
        "Your message has **not** been answered. This placeholder is shown so the UI "
        "remains functional while the service is unconfigured."
    )

    latency_ms = int((time.time() - start_time) * 1000) + 10
    # Count tokens from the real user input only — do NOT inflate fake usage numbers
    user_words = " ".join(m.content for m in payload.messages if m.role == "user").split()
    input_tokens = max(1, len(user_words))
    output_tokens = max(1, len(content.split()))
    total_tokens = input_tokens + output_tokens

    return ChatCompletionResponse(
        id=f"msg-{int(time.time() * 1000)}",
        role="assistant",
        content=content,
        model=payload.model,
        usage=ChatUsage(
            inputTokens=input_tokens,
            outputTokens=output_tokens,
            totalTokens=total_tokens,
        ),
        meta=ChatMeta(
            finishReason="offline",
            latencyMs=latency_ms,
            costUsd=0.0,
        ),
    )

async def stream_chat_completion(payload: ChatCompletionRequest) -> AsyncGenerator[str, None]:
    """
    Server-Sent Events (SSE) generator for live typing.
    Yields data: {"chunk": "...", "done": false}\n\n
    """
    target_model = get_target_model(payload.model)
    has_creds = has_provider_credentials(target_model)

    if has_creds:
        try:
            extra_params: Dict[str, Any] = {}
            if not is_reasoning_model(target_model):
                if payload.temperature is not None:
                    extra_params["temperature"] = payload.temperature
            if payload.maxTokens is not None:
                extra_params["max_tokens"] = payload.maxTokens

            formatted_messages: List[Dict[str, str]] = []
            if payload.systemPrompt:
                formatted_messages.append({"role": "system", "content": payload.systemPrompt})
            for msg in payload.messages:
                formatted_messages.append({"role": msg.role, "content": msg.content})

            response = await acompletion(
                model=target_model,
                messages=formatted_messages,
                stream=True,
                **extra_params
            )

            total_output = ""
            async for chunk in response:
                delta = chunk.choices[0].delta
                content_chunk = getattr(delta, "content", "") or ""
                if content_chunk:
                    total_output += content_chunk
                    payload_chunk = json.dumps({"chunk": content_chunk, "done": False})
                    yield f"data: {payload_chunk}\n\n"

            # Final completion event
            input_tokens = 50
            output_tokens = max(10, len(total_output.split()) * 2)
            total_tokens = input_tokens + output_tokens
            final_payload = json.dumps({
                "chunk": "",
                "done": True,
                "usage": {
                    "inputTokens": input_tokens,
                    "outputTokens": output_tokens,
                    "totalTokens": total_tokens
                }
            })
            yield f"data: {final_payload}\n\n"
            return
        except Exception as e:
            logger.warning(f"Streaming failed for {target_model}: {e}. Falling back to chunked simulation.")

    # Offline disclosure — send in one shot. No fake typing delays.
    res = generate_simulated_completion(payload, time.time())
    # Emit the full disclosure as a single chunk so it's clearly not real inference
    chunk_data = json.dumps({"chunk": res.content, "done": False})
    yield f"data: {chunk_data}\n\n"

    final_data = json.dumps({
        "chunk": "",
        "done": True,
        "usage": {
            "inputTokens": res.usage.inputTokens,
            "outputTokens": res.usage.outputTokens,
            "totalTokens": res.usage.totalTokens
        }
    })
    yield f"data: {final_data}\n\n"
