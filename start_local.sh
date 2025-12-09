#!/bin/bash

echo "==================================="
echo "🚀 Starting Avatar Voice Interviewer"
echo "==================================="
echo ""

# Function to handle cleanup
cleanup() {
    echo ""
    echo "Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

# Start backend
echo "📦 Starting Backend Server..."
cd backend
source venv/bin/activate
python run.py &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "⏳ Waiting for backend to be ready..."
sleep 5

# Start frontend
echo "🎨 Starting Frontend Server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "==================================="
echo "✅ Both servers are starting!"
echo "==================================="
echo ""
echo "📍 Backend:  http://localhost:8000"
echo "📍 Frontend: http://localhost:5173"
echo "📍 API Docs: http://localhost:8000/docs"
echo ""
echo "⚠️  IMPORTANT: Add your API keys to backend/.env:"
echo "   - GEMINI_API_KEY (get from Google AI Studio)"
echo "   - SARVAM_API_KEY (get from Sarvam AI)"
echo ""
echo "Press Ctrl+C to stop both servers"
echo "==================================="
echo ""

# Wait for both processes
wait
