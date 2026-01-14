"""Application configuration using Pydantic settings."""
from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Database - In-memory SQLite for demo (resets on restart)
    # Use "sqlite:///./interview.db" for persistent storage
    DATABASE_URL: str = "sqlite:///:memory:"
    
    # Demo mode - auto-populate with sample data on startup
    DEMO_MODE: bool = True
    
    # Security
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    
    # Google Gemini (deprecated - kept for compatibility)
    GEMINI_API_KEY: str = ""
    
    # Groq (Primary LLM - very fast)
    GROQ_API_KEY: str = ""
    
    # HuggingFace Inference API (optional)
    HUGGINGFACE_API_KEY: str = ""
    HUGGINGFACE_MODEL: str = "meta-llama/Llama-3.3-70B-Instruct"
    
    # Anthropic Claude (Fallback LLM)
    ANTHROPIC_API_KEY: str = ""
    ANTHROPIC_MODEL: str = "claude-sonnet-4-20250514"
    
    # Primary LLM Provider: "groq" or "anthropic"
    # Groq is primary (fast, free), Anthropic is fallback
    PRIMARY_LLM_PROVIDER: str = "groq"
    
    # Local LLM (deprecated - kept for compatibility)
    LM_STUDIO_URL: str = "http://127.0.0.1:1234"
    LM_STUDIO_MODEL: str = "local-model"
    USE_LOCAL_LLM: bool = False  # Disabled by default
    
    # Sarvam AI
    SARVAM_API_KEY: str = ""
    SARVAM_STT_URL: str = "https://api.sarvam.ai/speech-to-text"
    SARVAM_TTS_URL: str = "https://api.sarvam.ai/text-to-speech"
    
    # CORS
    CORS_ORIGINS: str = "http://localhost:5173,https://*.vercel.app,https://*.onrender.com"
    FRONTEND_URL: str = "http://localhost:5173"
    
    # File Upload
    MAX_UPLOAD_SIZE: int = 10485760  # 10MB
    UPLOAD_DIR: str = "./uploads"
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins from comma-separated string."""
        origins = []
        for origin in self.CORS_ORIGINS.split(","):
            origin = origin.strip()
            if origin:
                origins.append(origin)
        
        # Add FRONTEND_URL if not already in list
        if self.FRONTEND_URL and self.FRONTEND_URL not in origins:
            origins.append(self.FRONTEND_URL)
        
        # Add common development and deployment origins
        default_origins = [
            "http://localhost:5173",
            "http://localhost:3000",
            "http://127.0.0.1:5173",
        ]
        for default_origin in default_origins:
            if default_origin not in origins:
                origins.append(default_origin)
        
        return origins
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"


settings = Settings()
