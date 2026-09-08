from typing import TypedDict, List, Dict, Any, Optional


class ForgeGraphState(TypedDict, total=False):
    goal: str
    project_name: str
    category: str
    idempotency_key: Optional[str]
    create_github_repo: bool
    github_token: Optional[str]

    # Outputs
    requirements: Optional[Dict[str, Any]]
    research: Optional[Dict[str, Any]]
    architecture: Optional[Dict[str, Any]]
    tasks: Optional[List[Dict[str, Any]]]
    github_repo_url: Optional[str]

    # Execution telemetry & step logs
    step_logs: List[Dict[str, Any]]
    current_agent: str
    progress: int
    repair_count: int
    errors: List[str]
