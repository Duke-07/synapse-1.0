"""Application configuration for Synapse-Voice backend."""

import os

from dotenv import load_dotenv
from pydantic import BaseModel

load_dotenv()

class Settings(BaseModel):
    APP_NAME: str = "Synapse-Voice API"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    
    # CORS: Allow local dev and deployed frontend
    CORS_ORIGINS: list[str] = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:3000,http://127.0.0.1:3000,https://synapse-voice.vercel.app"
        ).split(",")
        if origin.strip()
    ]
    
    # LLM Settings
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "gemini")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    # Supabase Settings (Optional with automatic fallback)
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    STORAGE_BUCKET_NAME: str = os.getenv("STORAGE_BUCKET_NAME", "voice-recordings")
    
    # Upload limits
    MAX_AUDIO_SIZE_BYTES: int = 15 * 1024 * 1024 # 15 MB
    MAX_RECORDING_DURATION_SEC: float = 90.0

    # Auth & JWT Settings
    JWT_SECRET: str = os.getenv("JWT_SECRET", "synapse-voice-secret-key-epics-2026-screening-platform")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    # Email & Transactional Verification Settings
    RESEND_API_KEY: str = os.getenv("RESEND_API_KEY", "")
    BREVO_API_KEY: str = os.getenv("BREVO_API_KEY", "")
    SENDGRID_API_KEY: str = os.getenv("SENDGRID_API_KEY", "")
    SMTP_HOST: str = os.getenv("SMTP_HOST", "")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: str = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    SMTP_FROM_EMAIL: str = os.getenv("SMTP_FROM_EMAIL", "noreply@synapse-voice.org")
    SMTP_SSL: bool = os.getenv("SMTP_SSL", "false").lower() in ("true", "1", "yes")
    SMTP_TIMEOUT: int = int(os.getenv("SMTP_TIMEOUT", "10"))
    EMAIL_FROM_NAME: str = os.getenv("EMAIL_FROM_NAME", "Synapse-Voice")
    EMAIL_FROM_ADDRESS: str = os.getenv("EMAIL_FROM_ADDRESS", "")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")

settings = Settings()
