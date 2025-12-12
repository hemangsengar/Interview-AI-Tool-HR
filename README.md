# 🎤 AI Interview Platform

An AI-powered interview system with animated avatars that conducts voice-based interviews using TTS and STT.

## 🚀 Quick Start

**New to the project?** See the [Quick Start Guide](./docs/setup/QUICK_START.md)

### Local Development
```bash
# Backend
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python run.py

# Frontend
cd frontend
npm install
npm run dev
```

**Access:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## 📚 Documentation

All documentation is now organized in the [`docs/`](./docs) folder:

### 📖 Essential Guides
- **[Documentation Index](./docs/README.md)** - Start here!
- **[Quick Start](./docs/setup/QUICK_START.md)** - Get running in 10 minutes
- **[Deployment Guide](./docs/deployment/DEPLOYMENT_GUIDE.md)** - Deploy to Render + Vercel
- **[Troubleshooting](./docs/troubleshooting/)** - Fix common issues

### 📁 Documentation Structure
```
docs/
├── README.md                    # Main documentation index
├── setup/                       # Installation & configuration
│   ├── QUICK_START.md
│   ├── LOCAL_SETUP_GUIDE.md
│   ├── BUILD_FROM_SCRATCH_GUIDE.md
│   └── ...
├── deployment/                  # Deployment guides
│   ├── DEPLOYMENT_GUIDE.md
│   ├── DEPLOYMENT_CHECKLIST.md
│   └── ...
├── features/                    # Feature documentation
│   ├── AVATAR_GUIDE.md
│   ├── RATE_LIMITING_GUIDE.md
│   └── ...
├── troubleshooting/             # Common issues & fixes
│   ├── AUDIO_FILE_404_FIX.md
│   ├── CORS_FIX.md
│   └── ...
└── archived/                    # Old/deprecated docs
```

## 🎯 How to Use

### As HR (Create Jobs & View Results):
1. Go to frontend URL
2. Click "HR Portal"
3. Sign up with email/password
4. Create a job posting
5. View candidates and interview results

### As Candidate (Take Interview):
1. Go to frontend URL
2. Click "Join Interview"
3. Enter job code and details
4. Upload resume
5. Complete AI voice interview
6. Wait for results

## 📁 Project Structure

```
├── backend/              Python FastAPI server
│   ├── app/             Main application code
│   ├── .env             Your API keys (already set!)
│   └── run_simple.py    Start backend
│
├── frontend/            React website
│   └── src/             UI code
│
└── START_HERE.bat       Run everything (double-click this!)
```

## 🎨 Features

- ✅ Animated avatar with 4 states (idle, speaking, listening, thinking)
- ✅ Real-time voice interaction (microphone + speakers)
- ✅ AI-powered questions based on job requirements
- ✅ Automatic scoring (correctness, depth, clarity, relevance)
- ✅ Final recommendations (Strong/Medium/Weak/Reject)
- ✅ Full transcripts for HR review

## 🛠️ Tech Stack

- **Backend**: Python, FastAPI, SQLite, Google Gemini, Sarvam AI
- **Frontend**: React, Vite, Tailwind CSS
- **AI**: Gemini for questions/evaluation, Sarvam for voice

## 🛑 To Stop

Close the command prompt windows or press Ctrl+C

## 📚 More Help

- **VISUAL_GUIDE.md** - Step-by-step with pictures
- **WHAT_IS_WHAT.md** - What each file does
- **START_HERE_README.md** - Detailed documentation

## 🎉 That's It!

Everything is working. Just open http://localhost:5173 and try it!
