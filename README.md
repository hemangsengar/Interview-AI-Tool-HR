# 🎤 Avatar Voice Interviewer

An AI-powered interview system with an animated avatar that conducts voice interviews.

## ✅ FIXED AND WORKING!

**Backend**: http://localhost:8000 ✅  
**Frontend**: http://localhost:5173 ✅  
**API Docs**: http://localhost:8000/docs ✅

**All bcrypt errors fixed! Beautiful new design! Ready to use!**

## 🚀 Quick Start

### First Time Setup:
1. Your API keys are already set in `backend/.env`
2. Both servers are running
3. Just open: **http://localhost:5173**

### To Start Again Later:
Double-click `START_HERE.bat`

## 🎯 How to Use

### As HR (Create Jobs & View Results):
1. Go to http://localhost:5173
2. Click "HR Portal"
3. Sign up with any email/password
4. Click "+ Create Job"
5. Fill in job details and skills
6. View candidates and their interview results

### As Candidate (Do Interview):
1. Open incognito window: http://localhost:5173
2. Click "Join Interview"
3. Enter your details
4. Upload resume or paste text
5. Click "Start Interview"
6. Allow microphone access
7. Answer the avatar's questions by voice

### View Results:
1. Go back to HR window
2. Click on your job
3. See all candidates
4. Click "View Details" for full transcript and scores

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
