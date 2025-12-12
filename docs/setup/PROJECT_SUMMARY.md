# AI Interview System - Project Summary

## Overview
Full-stack AI-powered interview application with voice interaction, video recording, and automated evaluation.

## Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: SQLite with SQLAlchemy ORM
- **AI Services**:
  - LLM: Google Gemini (question generation, evaluation)
  - TTS: Sarvam AI (voice: abhilash - male)
  - STT: Sarvam AI (speech-to-text)

### Frontend
- **Framework**: React + Vite
- **Styling**: Tailwind CSS
- **State**: React Query, Zustand
- **Routing**: React Router

## Key Features

### For HR
- Create/edit/delete job postings
- Upload JD files (PDF/DOC)
- View all candidates
- Review interview results
- Download resumes
- Delete candidates

### For Candidates
- Apply with resume upload
- AI-powered video interview
- Voice and code answers
- Real-time feedback

### Interview System
- Professional video avatar (your custom video)
- Voice interaction (Sarvam TTS/STT)
- Adaptive questioning (15 questions max)
- Unique questions (no repeats)
- Code editor for technical questions
- Automatic evaluation and scoring
- Final recommendation (Strong/Medium/Weak/Reject)

## Project Structure

```
project/
├── backend/
│   ├── app/
│   │   ├── routers/        # API endpoints
│   │   ├── services/       # LLM, TTS, STT services
│   │   ├── models.py       # Database models
│   │   └── schemas.py      # Pydantic schemas
│   ├── uploads/            # Resume files
│   └── run.py             # Server entry point
├── frontend/
│   ├── public/
│   │   └── avatar.mp4     # Your avatar video
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── api/           # API client
│   │   └── store/         # State management
│   └── package.json
└── README.md
```

## Setup

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables
```
# backend/.env
GEMINI_API_KEY=your_key
SARVAM_API_KEY=your_key
SARVAM_TTS_URL=https://api.sarvam.ai/text-to-speech
SARVAM_STT_URL=https://api.sarvam.ai/speech-to-text
SECRET_KEY=your_secret
```

## API Endpoints

### Auth
- POST `/api/auth/signup` - HR signup
- POST `/api/auth/login` - HR login

### Jobs
- POST `/api/jobs` - Create job
- GET `/api/jobs` - List jobs
- GET `/api/jobs/{id}` - Get job
- PUT `/api/jobs/{id}` - Edit job
- DELETE `/api/jobs/{id}` - Delete job
- GET `/api/jobs/by-code/{code}` - Get job by code

### Candidates
- POST `/api/jobs/{id}/candidates` - Register candidate
- GET `/api/jobs/{id}/candidates` - List candidates
- DELETE `/api/jobs/candidates/{id}` - Delete candidate

### Interviews
- POST `/api/interviews/{id}/start` - Start interview
- POST `/api/interviews/{id}/next-question` - Get question
- POST `/api/interviews/{id}/answers` - Submit voice answer
- POST `/api/interviews/{id}/code-answer` - Submit code answer
- POST `/api/interviews/{id}/end` - End early
- GET `/api/interviews/{id}/results` - Get results
- POST `/api/interviews/tts` - Generate TTS audio

## Key Components

### Backend Services
- `llm_service.py` - Question generation, answer evaluation
- `speech_service.py` - TTS/STT with Sarvam AI
- `parsing_service.py` - Resume/JD parsing

### Frontend Components
- `ProfessionalVideoAvatar.jsx` - Video avatar (plays/pauses)
- `InterviewRoom.jsx` - Main interview interface
- `HRDashboard.jsx` - HR management
- `JobDetails.jsx` - Job and candidate management
- `CodeEditor.jsx` - Code submission

## Database Models
- User (HR)
- Job
- Candidate
- InterviewSession
- InterviewQuestion
- InterviewAnswer

## Features Implemented
✅ Job CRUD with JD file upload
✅ Candidate management
✅ Video avatar with custom video
✅ Voice interaction (Sarvam TTS/STT)
✅ Adaptive questioning
✅ Unique questions (no repeats)
✅ Code editor for technical questions
✅ Automatic evaluation
✅ Final scoring and recommendation
✅ Video recording during interview
✅ Exit interview early
✅ Status updates (Pending/Shortlisted/Rejected)

## Voice Configuration
Current voice: **abhilash** (male, deep)

To change voice, edit `backend/app/services/speech_service.py` line 67:
```python
"speaker": "abhilash",  # Change to: arya, vidya, anushka, etc.
```

Available voices: arya, abhilash, karun, hitesh, anushka, manisha, vidya, etc.

## Avatar Video
Location: `frontend/public/avatar.mp4`
- Plays when AI speaks
- Pauses when AI listens
- Always visible

To replace: Place new video at `frontend/public/avatar.mp4`

## Important Notes
- Restart backend after changing voice
- Clear browser cache after frontend changes
- Camera/microphone permissions required
- HTTPS or localhost required for camera access

## Documentation
- `README.md` - Main documentation
- `FEATURE_GUIDE.md` - Feature details
- `QUICK_START.md` - Quick start guide
- `PROJECT_SUMMARY.md` - This file

---

**All systems operational and ready for production!** 🚀
