from pydantic_settings import BaseSettings
from functools import lru_cache
import os


class Settings(BaseSettings):
    # Server
    host: str = "0.0.0.0"
    port: int = 8020

    # Database
    database_url: str = ""

    # OpenAI
    openai_api_key: str = ""

    # Backend
    backend_url: str = "http://localhost:8010"

    # Paths
    upload_dir: str = "./uploads"
    generated_dir: str = "./generated"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

# Create directories if not exist
os.makedirs(settings.upload_dir, exist_ok=True)
os.makedirs(settings.generated_dir, exist_ok=True)
