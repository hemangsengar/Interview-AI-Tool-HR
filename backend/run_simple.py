"""Simple runner that sets up everything automatically."""
import os
import sys

if __name__ == "__main__":
    # Create uploads directory
    os.makedirs("uploads", exist_ok=True)

    # Create .env if it doesn't exist
    if not os.path.exists(".env"):
        print("Creating .env file...")
        with open(".env", "w") as f:
            f.write("# Add your API keys here\n")
            f.write("GEMINI_API_KEY=your-gemini-key-here\n")
            f.write("SARVAM_API_KEY=your-sarvam-key-here\n")
        print("✓ Created .env file - Please add your API keys!")
        print("  Edit backend/.env and add your keys, then run this again.")
        sys.exit(0)

    # Check if API keys are set
    from app.config import settings
    if settings.GEMINI_API_KEY == "your-gemini-key-here" or not settings.GEMINI_API_KEY:
        print("❌ Please add your GEMINI_API_KEY to backend/.env file")
        sys.exit(1)

    if settings.SARVAM_API_KEY == "your-sarvam-key-here" or not settings.SARVAM_API_KEY:
        print("❌ Please add your SARVAM_API_KEY to backend/.env file")
        sys.exit(1)

    # Create database tables
    print("Setting up database...")
    from app.database import engine, Base
    from app.models import User, Job, Candidate, InterviewSession, InterviewQuestion, InterviewAnswer

    Base.metadata.create_all(bind=engine)
    print("✓ Database ready!")

    # Start server
    print("\n" + "="*50)
    print("🚀 Starting Avatar Voice Interviewer Backend")
    print("="*50)
    print("\nBackend running at: http://localhost:8000")
    print("API docs at: http://localhost:8000/docs")
    print("\nPress Ctrl+C to stop\n")

    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=False)
