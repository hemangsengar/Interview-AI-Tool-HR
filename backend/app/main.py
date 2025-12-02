"""Main FastAPI application."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .config import settings
from .routers import auth, jobs, interviews
import os

# Create FastAPI app
app = FastAPI(
    title="Avatar Voice Interviewer API",
    description="AI-powered voice interview system with avatar",
    version="1.0.0"
)

# Configure CORS - Allow all origins for deployment
# Note: In production, set FRONTEND_URL environment variable for security
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https://.*\.vercel\.app|https://.*\.onrender\.com|http://localhost:\d+",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Create upload directory if it doesn't exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

# Initialize database on startup
from .database import init_db
init_db()

# Mount static files for audio
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(jobs.router, prefix="/api/jobs", tags=["Jobs"])
app.include_router(interviews.router, prefix="/api/interviews", tags=["Interviews"])


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Avatar Voice Interviewer API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
