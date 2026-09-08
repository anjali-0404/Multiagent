from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class AgentRunRequest(BaseModel):
    goal: str
    projectName: Optional[str] = "FORGE Project"
    category: Optional[str] = "web"
    idempotencyKey: Optional[str] = None
    createGithubRepo: Optional[bool] = False
    githubToken: Optional[str] = None


class AgentRunAcceptedResponse(BaseModel):
    jobId: str
    status: str = "queued"
    message: str = "Agent execution job queued successfully."
    createdAt: str


class AgentStepLog(BaseModel):
    timestamp: str
    agent: str
    role: str
    action: str
    detail: str
    type: str = "info"  # "info", "success", "warning", "error"


class BlueprintRequirements(BaseModel):
    summary: str
    personas: List[str] = Field(default_factory=list)
    functional: List[str] = Field(default_factory=list)
    nonFunctional: List[str] = Field(default_factory=list)


class TechStackItem(BaseModel):
    layer: str
    technology: str
    rationale: str


class BlueprintArchitecture(BaseModel):
    topology: str
    techStack: List[TechStackItem] = Field(default_factory=list)
    dbSchema: Dict[str, Any] = Field(default_factory=dict)
    apiEndpoints: List[Dict[str, str]] = Field(default_factory=list)
    keyDecisions: List[str] = Field(default_factory=list)


class BlueprintTask(BaseModel):
    id: int
    title: str
    tag: str
    priority: str  # "High", "Medium", "Low"
    status: str = "To Do"
    description: Optional[str] = ""
    assignedAgent: Optional[str] = "Builder Agent"


class ProjectBlueprint(BaseModel):
    projectName: str
    summary: str
    requirements: Optional[BlueprintRequirements] = None
    architecture: Optional[BlueprintArchitecture] = None
    tasks: List[BlueprintTask] = Field(default_factory=list)
    githubRepoUrl: Optional[str] = None


class AgentJobStatus(BaseModel):
    jobId: str
    status: str  # "queued", "running", "completed", "failed"
    progress: int = 0  # 0 to 100
    currentAgent: Optional[str] = None
    logs: List[AgentStepLog] = Field(default_factory=list)
    blueprint: Optional[ProjectBlueprint] = None
    error: Optional[str] = None
    startedAt: Optional[str] = None
    completedAt: Optional[str] = None
