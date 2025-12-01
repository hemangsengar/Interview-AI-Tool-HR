@echo off
echo ========================================
echo Avatar Voice Interviewer - Quick Start
echo ========================================
echo.

echo Step 1: Setting up Backend...
cd backend

REM Check if venv exists
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)

REM Install dependencies in venv
echo Installing Python packages...
venv\Scripts\pip.exe install -q fastapi uvicorn sqlalchemy pydantic pydantic-settings python-jose passlib python-multipart google-generativeai httpx python-docx PyPDF2 email-validator

REM Check for .env
if not exist .env (
    echo.
    echo Creating .env file...
    echo # Add your API keys here > .env
    echo GEMINI_API_KEY=your-gemini-key-here >> .env
    echo SARVAM_API_KEY=your-sarvam-key-here >> .env
    echo.
    echo ========================================
    echo IMPORTANT: Add your API keys!
    echo ========================================
    echo.
    echo 1. Open: backend\.env
    echo 2. Add your GEMINI_API_KEY
    echo 3. Add your SARVAM_API_KEY
    echo 4. Run this script again
    echo.
    pause
    exit
)

echo.
echo Starting backend server...
start cmd /k "cd /d %CD% && venv\Scripts\python.exe run_simple.py"

cd ..

echo.
echo Step 2: Setting up Frontend...
cd frontend

REM Check if node_modules exists
if not exist node_modules (
    echo Installing Node packages...
    call npm install
)

echo.
echo Starting frontend...
timeout /t 3 /nobreak > nul
start cmd /k "cd /d %CD% && npm run dev"

cd ..

echo.
echo ========================================
echo ✓ Application Starting!
echo ========================================
echo.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo.
echo Opening browser in 5 seconds...
timeout /t 5 /nobreak > nul
start http://localhost:5173
echo.
echo Press any key to stop all servers...
pause > nul
taskkill /F /FI "WINDOWTITLE eq *python run_simple.py*"
taskkill /F /FI "WINDOWTITLE eq *npm run dev*"
