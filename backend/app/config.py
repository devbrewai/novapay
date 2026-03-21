from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    anthropic_api_key: str = ""
    openai_api_key: str = ""
    chroma_persist_dir: str = "./chroma_data"
    knowledge_base_dir: str = "./data/knowledge_base"
    cors_origins: str = "http://localhost:5173"
    log_level: str = "INFO"

    model_config = {"env_file": ".env"}


settings = Settings()
