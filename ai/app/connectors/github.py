import os
import re
import logging
from typing import Dict, Any, List, Optional
from github import Github, GithubException

logger = logging.getLogger("forge.connectors.github")

# In-memory idempotency cache mapping idempotency_key -> repo_html_url
IDEMPOTENCY_STORE: Dict[str, Dict[str, Any]] = {}


def sanitize_repo_name(name: str) -> str:
    cleaned = re.sub(r"[^a-zA-Z0-9_-]", "-", name.lower().strip())
    cleaned = re.sub(r"-+", "-", cleaned).strip("-")
    if not cleaned.startswith("forge-"):
        cleaned = f"forge-{cleaned}"
    return cleaned[:90]


def create_github_project(
    token: str,
    project_name: str,
    summary: str,
    architecture: Dict[str, Any],
    tasks: List[Dict[str, Any]],
    idempotency_key: Optional[str] = None
) -> Dict[str, Any]:
    """
    Creates a real GitHub repository with scaffold files and labeled issues from Planner output.
    Protects against duplicate creation using idempotency_key.
    """
    if idempotency_key and idempotency_key in IDEMPOTENCY_STORE:
        logger.info(f"Idempotency hit for key: {idempotency_key}. Returning cached repo.")
        return IDEMPOTENCY_STORE[idempotency_key]

    if not token:
        raise ValueError("GitHub access token is required to create a repository.")

    repo_name = sanitize_repo_name(project_name)
    gh = Github(token)
    user = gh.get_user()

    try:
        # 1. Create or retrieve existing repository
        try:
            repo = user.create_repo(
                name=repo_name,
                description=summary[:350],
                private=False,
                auto_init=True
            )
            logger.info(f"Created new GitHub repository: {repo.html_url}")
        except GithubException as e:
            if e.status == 422:  # Repo name already exists
                repo = user.get_repo(repo_name)
                logger.info(f"Repository {repo_name} already exists. Using existing repo.")
            else:
                raise e

        # 2. Commit README.md
        readme_content = f"""# {project_name}

> Generated automatically by **FORGE Multi-Agent AI Workspace**

## Project Overview
{summary}

## Architecture Overview
- **Topology**: {architecture.get('topology', 'Microservice System')}
- **Database**: {', '.join(architecture.get('dbSchema', {}).get('tables', ['PostgreSQL']))}

## Quick Start
```bash
# Clone the repository
git clone {repo.html_url}.git
cd {repo_name}

# Install dependencies and start
npm install
npm run dev
```

---
*Created by [FORGE Autonomous AI Studio](https://github.com/anjali-0404/Multiagent)*
"""
        try:
            readme_file = repo.get_contents("README.md")
            repo.update_file(readme_file.path, "docs: update README from FORGE blueprint", readme_content, readme_file.sha)
        except GithubException:
            repo.create_file("README.md", "docs: initial README from FORGE blueprint", readme_content)

        # 3. Commit ARCHITECTURE.md
        tech_stack_lines = "\n".join([
            f"- **{ts.get('layer', 'Layer')}**: `{ts.get('technology', 'Tech')}` — {ts.get('rationale', '')}"
            for ts in architecture.get('techStack', [])
        ])
        endpoints_lines = "\n".join([
            f"- `{ep.get('method', 'GET')}` `{ep.get('path', '/')}`"
            for ep in architecture.get('apiEndpoints', [])
        ])
        arch_content = f"""# System Architecture & Technical Specifications

## Topology
{architecture.get('topology', 'Client-Server Architecture')}

## Tech Stack
{tech_stack_lines or 'Not specified'}

## Key Architectural Decisions
{chr(10).join(f"- {d}" for d in architecture.get('keyDecisions', []))}

## Core API Contracts
{endpoints_lines or 'Not specified'}
"""
        try:
            arch_file = repo.get_contents("ARCHITECTURE.md")
            repo.update_file(arch_file.path, "docs: update ARCHITECTURE.md from FORGE blueprint", arch_content, arch_file.sha)
        except GithubException:
            repo.create_file("ARCHITECTURE.md", "docs: initial ARCHITECTURE.md from FORGE blueprint", arch_content)

        # 4. Create Labels & Issues from Tasks
        existing_labels = {l.name for l in repo.get_labels()}
        required_labels = {
            "epic": "7C3AED",
            "backend": "2563EB",
            "frontend": "10B981",
            "auth": "F59E0B",
            "database": "336791",
            "priority-high": "EF4444",
            "priority-medium": "F97316",
            "priority-low": "64748B"
        }
        for lbl_name, color in required_labels.items():
            if lbl_name not in existing_labels:
                try:
                    repo.create_label(name=lbl_name, color=color)
                except Exception:
                    pass

        issues_created = 0
        for task in tasks:
            title = task.get("title", "Untitled Task")
            tag = task.get("tag", "General").lower()
            priority = task.get("priority", "Medium").lower()
            desc = task.get("description", "") or f"Actionable sprint task decomposed by FORGE Planner Agent.\n\nAssigned: {task.get('assignedAgent', 'Builder Agent')}"

            labels = []
            if tag in required_labels:
                labels.append(tag)
            if f"priority-{priority}" in required_labels:
                labels.append(f"priority-{priority}")

            try:
                repo.create_issue(title=title, body=desc, labels=labels)
                issues_created += 1
            except Exception as ie:
                logger.warning(f"Could not create issue '{title}': {ie}")

        result = {
            "success": True,
            "repoUrl": repo.html_url,
            "repoName": repo_name,
            "issuesCount": issues_created
        }

        if idempotency_key:
            IDEMPOTENCY_STORE[idempotency_key] = result

        return result

    except Exception as e:
        logger.error(f"GitHub project creation error: {e}")
        raise e
