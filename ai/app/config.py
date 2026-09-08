import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from ai/ or project root
base_dir = Path(__file__).resolve().parent.parent
env_path = base_dir / ".env"
root_env_path = base_dir.parent / ".env"

if env_path.exists():
    load_dotenv(dotenv_path=env_path)
elif root_env_path.exists():
    load_dotenv(dotenv_path=root_env_path)
else:
    load_dotenv()


class Settings:
    PORT: int = int(os.getenv("AI_PORT", "8000"))
    HOST: str = os.getenv("AI_HOST", "127.0.0.1")
    INTERNAL_SERVICE_SECRET: str = os.getenv("INTERNAL_SERVICE_SECRET", "forge_dev_secret_key_12345")
    
    # Provider Keys
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    DEEPSEEK_API_KEY: str = os.getenv("DEEPSEEK_API_KEY", "")
    
    # Connectors
    GITHUB_TOKEN: str = os.getenv("GITHUB_TOKEN", "")
    
    # Vector DB
    QDRANT_URL: str = os.getenv("QDRANT_URL", "")
    QDRANT_API_KEY: str = os.getenv("QDRANT_API_KEY", "")
    QDRANT_STORAGE_PATH: str = os.getenv("QDRANT_STORAGE_PATH", str(base_dir / "data" / "qdrant"))


settings = Settings()
