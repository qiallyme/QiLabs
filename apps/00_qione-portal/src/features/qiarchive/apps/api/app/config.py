import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_ENV: str = "production"
    LOG_LEVEL: str = "INFO"

    DATABASE_URL: str
    PAPERLESS_URL: str
    
    class Config:
        env_file = ".env"

settings = Settings()