from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: str
    content: str
    name: Optional[str] = None


class ChatCompletionRequest(BaseModel):
    model: str = "GPT-4o"
    messages: List[ChatMessage] = Field(default_factory=list)
    systemPrompt: Optional[str] = None
    temperature: Optional[float] = 0.7
    maxTokens: Optional[int] = 1024
    chatId: Optional[str] = None


class ChatUsage(BaseModel):
    inputTokens: int = 0
    outputTokens: int = 0
    totalTokens: int = 0


class ChatMeta(BaseModel):
    finishReason: str = "stop"
    latencyMs: int = 0
    costUsd: Optional[float] = 0.0
    reasoningContent: Optional[str] = None


class ChatCompletionResponse(BaseModel):
    id: str
    role: str = "assistant"
    content: str
    model: str
    usage: ChatUsage
    meta: ChatMeta
