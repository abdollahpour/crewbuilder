from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    crew_service_url: str = "http://localhost:8006"
    agent_service_url: str = "http://localhost:8003"
    skill_service_url: str = "http://localhost:8002"
    mcp_service_url: str = "http://localhost:8004"
    knowledge_service_url: str = "http://localhost:8005"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )


settings = Settings()
