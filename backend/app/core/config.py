from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "Chrome Comm API"
    API_V1_PREFIX: str = "/api/v1"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "chrome-extension://*"
    ]
    
    class Config:
        case_sensitive = True

settings = Settings()