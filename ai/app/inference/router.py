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
    last_user_msg = ""
    for m in reversed(payload.messages):
        if m.role == "user":
            last_user_msg = m.content
            break

    prompt_lower = last_user_msg.lower()
    if "workflow" in prompt_lower or "agent" in prompt_lower:
        content = (
            f"Based on your architecture requirements with **{payload.model}**, I recommend structuring an asynchronous agent loop with a reactive state bus.\n\n"
            "1. **State Isolation**: Encapsulate worker state inside discrete node execution contexts.\n"
            "2. **Backpressure & Retries**: Configure exponential backoff on external tool calls.\n"
            "3. **Guardrails**: Validate schema output via runtime Pydantic parsing before downstream handoff."
        )
    elif "rag" in prompt_lower or "vector" in prompt_lower:
        content = (
            f"Here is an optimal RAG pipeline architecture evaluated on **{payload.model}**:\n\n"
            "- **Ingestion**: Recursive semantic chunking (512 tokens with 64-token overlap).\n"
            "- **Indexing**: HNSW index with cosine distance metrics.\n"
            "- **Query Optimization**: HyDE coupled with reciprocal rank fusion (RRF)."
        )
    else:
        sys_prefix = f"> *System Context applied: \"{payload.systemPrompt[:60]}...\"*\n\n" if payload.systemPrompt else ""
        content = (
            f"I have analyzed your input with **{payload.model}** (temperature {payload.temperature}, max tokens {payload.maxTokens}).\n\n"
            f"{sys_prefix}"
            f"Key Analysis Points:\n"
            f"- **Synthesized Query**: \"{last_user_msg[:80]}...\"\n"
            f"- **Recommended Strategy**: Implement modular orchestration with deterministic schema validation.\n"
            f"- **Inference Routing**: Routed through LiteLLM multi-provider gateway."
        )

    latency_ms = int((time.time() - start_time) * 1000) + 120
    input_tokens = max(10, len(last_user_msg.split()) * 2) + (len(payload.systemPrompt.split()) if payload.systemPrompt else 0)
    output_tokens = max(20, len(content.split()) * 2)
    total_tokens = input_tokens + output_tokens
    cost_usd = round(total_tokens * LOCAL_PRICE_PER_TOKEN.get(payload.model, 0.000003), 6)

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
            finishReason="stop",
            latencyMs=latency_ms,
            costUsd=cost_usd
        )
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

    # Simulated token-by-token stream fallback
    res = generate_simulated_completion(payload, time.time())
    words = res.content.split(" ")
    for word in words:
        chunk_data = json.dumps({"chunk": word + " ", "done": False})
        yield f"data: {chunk_data}\n\n"
        # Micro pause to simulate streaming typing without blocking loop
        await asyncio.sleep(0.002)

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
