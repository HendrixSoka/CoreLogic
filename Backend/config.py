# config.py
import os
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    DATABASE_URL: str
    CORS_ORIGINS : str
    CLOUD_NAME:str
    API_KEY:str
    API_SECRET:str
    GOOGLE_CLIENT_ID: str
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
