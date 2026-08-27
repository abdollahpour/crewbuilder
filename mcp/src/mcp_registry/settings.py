from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_username: str = "postgres"
    database_password: str = "postgres"
    database_connection_url: str = "localhost/mcp"
    agent_service_url: str = "http://localhost:8003"
    skill_service_url: str = "http://localhost:8002"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )


settings = Settings()
