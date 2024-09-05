import os

from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv()


class Settings(BaseSettings):
    secret_key: str = os.getenv("SECRET_KEY")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 90
    PRODUCTION: bool = os.getenv("PRODUCTION", "False").lower() == "true"

    class Config:
        env_file = ".env"

settings = Settings()