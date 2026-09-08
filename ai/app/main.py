import time
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from fastapi import FastAPI, HTTPException, Header, Depends, BackgroundTasks, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse

from .config import settings
from .inference.router import execute_chat_completion, stream_chat_completion
from .rag.store import rag_store
from .workflows.executor import execute_workflow_dag, WorkflowRunRequest, WorkflowRunResponse
from .schemas.chat import ChatCompletionRequest, ChatCompletionResponse, ChatUsage, ChatMeta
from .schemas.rag import IngestRequest, IngestResponse, SearchRequest, SearchResponse, SearchResultItem, ChunkInfo
from .schemas.agents import (
    AgentRunRequest,
    AgentRunAcceptedResponse,
    AgentJobStatus,
    AgentStepLog,
    ProjectBlueprint,
    BlueprintRequirements,
    BlueprintArchitecture,
    BlueprintTask,
    TechStackItem
)

app = FastAPI(
    title="FORGE Multi-Agent AI Engine",
    description="Asynchronous multi-agent orchestration, multi-model inference, and vector RAG service.",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory store for async agent jobs
JOBS_DB: Dict[str, AgentJobStatus] = {}


# Security Dependency: Validate internal secret between Express and FastAPI
async def verify_internal_secret(x_internal_secret: Optional[str] = Header(None)):
    expected = settings.INTERNAL_SERVICE_SECRET
    # If a secret is configured and does not match, reject
    if expected and x_internal_secret != expected:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized: Invalid internal service secret header (X-Internal-Secret)."
        )
    return True


@app.get("/health")
async def health_check():
    return {
        "status": "online",
        "service": "FORGE Multi-Agent AI Engine",
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "providers": {
            "openai": bool(settings.OPENAI_API_KEY),
            "anthropic": bool(settings.ANTHROPIC_API_KEY),
            "gemini": bool(settings.GEMINI_API_KEY),
            "deepseek": bool(settings.DEEPSEEK_API_KEY),
            "github": bool(settings.GITHUB_TOKEN),
            "qdrant": bool(settings.QDRANT_URL or settings.QDRANT_STORAGE_PATH),
        }
    }


# ==========================================
# INFERENCE ENDPOINTS
# ==========================================

@app.post("/infer/chat", response_model=ChatCompletionResponse, dependencies=[Depends(verify_internal_secret)])
async def chat_inference(payload: ChatCompletionRequest):
    return await execute_chat_completion(payload)


@app.post("/infer/chat/stream", dependencies=[Depends(verify_internal_secret)])
async def chat_streaming(payload: ChatCompletionRequest):
    return StreamingResponse(
        stream_chat_completion(payload),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )


# ==========================================
# RAG ENDPOINTS
# ==========================================

@app.post("/rag/ingest", response_model=IngestResponse, dependencies=[Depends(verify_internal_secret)])
async def rag_ingest(payload: IngestRequest):
    return rag_store.ingest_document(
        title=payload.title,
        category=payload.category,
        content=payload.content,
        document_id=payload.documentId,
        chunk_size=payload.chunkSize or 250,
        overlap=payload.overlap or 40
    )


@app.post("/rag/search", response_model=SearchResponse, dependencies=[Depends(verify_internal_secret)])
async def rag_search(payload: SearchRequest):
    return rag_store.search_knowledge_base(
        query=payload.query,
        limit=payload.limit or 5,
        category=payload.category
    )


# ==========================================
# WORKFLOW EXECUTION ENDPOINTS
# ==========================================

@app.post("/workflows/run", response_model=WorkflowRunResponse, dependencies=[Depends(verify_internal_secret)])
async def workflow_execution(payload: WorkflowRunRequest):
    return await execute_workflow_dag(payload)


# ==========================================
# MULTI-AGENT ASYNC DURABLE JOBS (HTTP 202)
# ==========================================

from .graph.forge_graph import execute_agent_job_pipeline


@app.post("/agents/run", response_model=AgentRunAcceptedResponse, status_code=status.HTTP_202_ACCEPTED, dependencies=[Depends(verify_internal_secret)])
async def trigger_agent_run(payload: AgentRunRequest, background_tasks: BackgroundTasks):
    """
    Non-blocking entrypoint: Returns HTTP 202 immediately with a jobId.
    The 4-agent FORGE chain runs asynchronously in background_tasks via LangGraph.
    """
    job_id = f"job-{uuid.uuid4().hex[:12]}"
    now_iso = datetime.now(timezone.utc).isoformat()
    
    new_job = AgentJobStatus(
        jobId=job_id,
        status="queued",
        progress=0,
        currentAgent="Queued",
        logs=[
            AgentStepLog(
                timestamp=datetime.now(timezone.utc).strftime("%I:%M:%S %p"),
                agent="Orchestrator",
                role="Job Scheduler",
                action="Job Queued",
                detail=f"Accepted goal: '{payload.goal[:80]}...'",
                type="info"
            )
        ],
        startedAt=now_iso
    )
    JOBS_DB[job_id] = new_job
    
    # Dispatch background worker
    background_tasks.add_task(execute_agent_job_pipeline, job_id, payload, JOBS_DB)
    
    return AgentRunAcceptedResponse(
        jobId=job_id,
        status="queued",
        message="Agent execution job queued successfully.",
        createdAt=now_iso
    )


@app.get("/agents/runs/{job_id}", response_model=AgentJobStatus, dependencies=[Depends(verify_internal_secret)])
async def get_agent_job_status(job_id: str):
    """Poll status, progress, step logs, and blueprint output of an agent run."""
    job = JOBS_DB.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Agent run job '{job_id}' not found.")
    return job
