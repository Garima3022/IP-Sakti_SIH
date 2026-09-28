import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# Explicitly load .env from current directory or backend directory
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"))
load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "DR. Ayurvedic Sathi"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dr_ayurvedic_sathi_super_secret_jwt_key_2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # SQLite fallback by default for zero-config async DB execution
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./dr_ayurvedic_sathi.db")
    
    # Qdrant configuration (falls back to internal hybrid BM25 + dense index if server offline)
    QDRANT_HOST: str = os.getenv("QDRANT_HOST", "localhost")
    QDRANT_PORT: int = int(os.getenv("QDRANT_PORT", "6333"))

    # OpenAlex API configuration
    OPENALEX_BASE_URL: str = "https://api.openalex.org"

    # Gemini API Key
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # PDF Source Directory
    PDF_SOURCE_DIR: str = os.getenv("PDF_SOURCE_DIR", r"c:\Users\prayo\Downloads\DR. Ayurvedic sathi\DR. Ayurvedic sathi\IP-SAKTI")

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
