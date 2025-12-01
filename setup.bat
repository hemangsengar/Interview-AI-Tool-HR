@echo off
echo === Avatar Voice Interviewer Setup ===
echo.

REM Backend setup
echo Setting up backend...
cd backend

REM Create virtual environment
python -m venv venv

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install dependencies
pip install -r requirements.txt

REM Create .env if not exists
if not exist .env (
    copy ..\.env.example .env
    echo Created .env file. Please update with your API keys and database credentials.
)

REM Create uploads directory
if not exist uploads mkdir uploads

echo Backend setup complete!
echo.

REM Frontend setup
echo Setting up frontend...
cd ..\frontend

REM Install dependencies
call npm install

REM Create .env if not exists
if not exist .env (
    copy .env.example .env
    echo Created frontend .env file.
)

echo Frontend setup complete!
echo.

echo === Setup Complete ===
echo.
echo Next steps:
echo 1. Update backend\.env with your API keys and database credentials
echo 2. Create PostgreSQL database: CREATE DATABASE voice_interviewer;
echo 3. Run database migrations: cd backend ^&^& alembic upgrade head
echo 4. Start backend: cd backend ^&^& python run.py
echo 5. Start frontend: cd frontend ^&^& npm run dev
echo.

pause
