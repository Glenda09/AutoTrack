from functools import lru_cache
from typing import Any

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", case_sensitive=False)

    APP_NAME: str = "AutoTrack"
    API_PREFIX: str = "/api/v1"
    SECRET_KEY: str = Field(default="change_me_please")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    MYSQL_HOST: str = "localhost"
    MYSQL_PORT: int = 3306
    MYSQL_USER: str = "autotrack"
    MYSQL_PASSWORD: str = "autotrack_pwd"
    MYSQL_DB: str = "autotrack"

    CORS_ORIGINS: str = Field(default="http://localhost:5173")
    LOG_LEVEL: str = "INFO"

    @property
    def sqlalchemy_database_uri(self) -> str:
        return (
            f"mysql+mysqldb://{self.MYSQL_USER}:{self.MYSQL_PASSWORD}"
            f"@{self.MYSQL_HOST}:{self.MYSQL_PORT}/{self.MYSQL_DB}"
        )

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    def as_dict(self) -> dict[str, Any]:
        return self.model_dump()


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
