#!/bin/bash

echo "=== Avatar Voice Interviewer Setup ==="
echo ""

# Backend setup
echo "Setting up backend..."
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

# Install dependencies
pip install -r requirements.txt

# Create .env if not exists
if [ ! -f .env ]; then
    cp ../.env.example .env
    echo "Created .env file. Please update with your API keys and database credentials."
fi

# Create uploads directory
mkdir -p uploads

echo "Backend setup complete!"
echo ""

# Frontend setup
echo "Setting up frontend..."
cd ../frontend

# Install dependencies
npm install

# Create .env if not exists
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Created frontend .env file."
fi

echo "Frontend setup complete!"
echo ""

echo "=== Setup Complete ==="
echo ""
echo "Next steps:"
echo "1. Update backend/.env with your API keys and database credentials"
echo "2. Create PostgreSQL database: CREATE DATABASE voice_interviewer;"
echo "3. Run database migrations: cd backend && alembic upgrade head"
echo "4. Start backend: cd backend && python run.py"
echo "5. Start frontend: cd frontend && npm run dev"
echo ""
