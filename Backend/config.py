# config.py
import os
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    IMAGE_UPLOAD_DIR: str = os.path.join(os.getcwd(),"static", "problema_imagenes")
    USER_PHOTOS_DIR: str = os.path.join(os.getcwd(),"static",  "fotos_usuarios")
    IMAGE_GET_DIR: str = "problema_imagenes"
    USER_GET_DIR: str = "fotos_usuarios"
    DATABASE_URL: str
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
