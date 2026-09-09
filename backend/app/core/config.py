import os
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseModel):
    SECTORS_API_KEY: str = os.getenv("SECTORS_API_KEY", "")
    SECTORS_BASE_URL: str = os.getenv("SECTORS_BASE_URL", "https://api.sectors.app/v1")
    DEFAULT_MODE: str = os.getenv("DEFAULT_MODE", "mock")
    CREDIT_SOFT_LIMIT: int = int(os.getenv("CREDIT_SOFT_LIMIT", "4"))
    CORS_ORIGINS: list[str] = [
        origin.strip()
        for origin in os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")
        if origin.strip()
    ]

settings = Settings()
