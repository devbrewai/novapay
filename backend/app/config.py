from pathlib import Path

from pydantic_settings import BaseSettings

_BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    anthropic_api_key: str = ""
    openai_api_key: str = ""
    resend_api_key: str = ""
    escalation_to_email: str = "hello@devbrew.ai"
    escalation_from_email: str = "nova@notify.devbrew.ai"
    agent_from_name: str = "Nova"
    chroma_persist_dir: str = "./chroma_data"
    knowledge_base_dir: str = "./data/knowledge_base"
    cors_origins: str = "http://localhost:5173"
    log_level: str = "INFO"
    chat_rate_limit: int = 5

    model_config = {"env_file": str(_BASE_DIR / ".env")}


settings = Settings()
