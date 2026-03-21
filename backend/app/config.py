from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    anthropic_api_key: str = ""
    chroma_persist_dir: str = "./chroma_data"
    cors_origins: str = "http://localhost:5173"
    log_level: str = "INFO"

    model_config = {"env_file": ".env"}


settings = Settings()
