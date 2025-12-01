"""Test if setup works."""
import os
import sys

print("Testing setup...")
print()

# Test 1: Check .env file
print("1. Checking .env file...")
if not os.path.exists(".env"):
    print("   ❌ .env file not found!")
    print("   Creating .env file...")
    with open(".env", "w") as f:
        f.write("# Add your API keys here\n")
        f.write("GEMINI_API_KEY=your-gemini-key-here\n")
        f.write("SARVAM_API_KEY=your-sarvam-key-here\n")
    print("   ✓ Created .env file")
    print("   Please add your API keys to backend/.env and run again")
    sys.exit(0)
else:
    print("   ✓ .env file exists")

# Test 2: Check API keys
print("2. Checking API keys...")
from app.config import settings

if not settings.GEMINI_API_KEY or settings.GEMINI_API_KEY == "your-gemini-key-here":
    print("   ❌ GEMINI_API_KEY not set!")
    print("   Please add your Gemini API key to backend/.env")
    sys.exit(1)
else:
    print(f"   ✓ GEMINI_API_KEY set (starts with: {settings.GEMINI_API_KEY[:10]}...)")

if not settings.SARVAM_API_KEY or settings.SARVAM_API_KEY == "your-sarvam-key-here":
    print("   ❌ SARVAM_API_KEY not set!")
    print("   Please add your Sarvam API key to backend/.env")
    sys.exit(1)
else:
    print(f"   ✓ SARVAM_API_KEY set (starts with: {settings.SARVAM_API_KEY[:10]}...)")

# Test 3: Check database models
print("3. Checking database models...")
try:
    from app.models import User, Job, Candidate, InterviewSession, InterviewQuestion, InterviewAnswer
    print("   ✓ All models imported successfully")
except Exception as e:
    print(f"   ❌ Error importing models: {e}")
    sys.exit(1)

# Test 4: Create database
print("4. Creating database...")
try:
    from app.database import engine, Base
    Base.metadata.create_all(bind=engine)
    print("   ✓ Database created successfully")
except Exception as e:
    print(f"   ❌ Error creating database: {e}")
    sys.exit(1)

# Test 5: Check uploads directory
print("5. Checking uploads directory...")
os.makedirs("uploads", exist_ok=True)
print("   ✓ Uploads directory ready")

print()
print("="*50)
print("✓ All checks passed! Ready to start server.")
print("="*50)
print()
print("Run: python run_simple.py")
