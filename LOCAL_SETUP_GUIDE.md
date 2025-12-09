# 🚀 Local Setup Complete!

## ✅ Your servers are now running!

### 🌐 Access URLs:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

---

## ⚠️ IMPORTANT: Configure API Keys

The application needs API keys to function. Update the file: `backend/.env`

### 1. Google Gemini API Key (Required for AI Interview Questions)
```env
GEMINI_API_KEY=your-actual-gemini-api-key-here
```

**How to get it:**
1. Go to https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key and paste it in the `.env` file

### 2. Sarvam AI API Key (Required for Voice/Speech)
```env
SARVAM_API_KEY=your-actual-sarvam-api-key-here
```

**How to get it:**
1. Go to https://www.sarvam.ai/
2. Sign up for an account
3. Get your API key from the dashboard
4. Copy and paste it in the `.env` file

---

## 📁 Current Status

### ✅ Completed Setup:
- [x] Python virtual environment created
- [x] Backend dependencies installed
- [x] Frontend dependencies installed
- [x] SQLite database initialized
- [x] Backend server running on port 8000
- [x] Frontend server running on port 5173

### ⚠️ Pending:
- [ ] Add GEMINI_API_KEY to `backend/.env`
- [ ] Add SARVAM_API_KEY to `backend/.env`

---

## 🎯 How to Use the Application

### As HR (Recruiter):

1. **Open Browser**: Go to http://localhost:5173
2. **Sign Up**: Click "HR Portal" → Create account
3. **Create Job**: 
   - Click "+ Create Job"
   - Fill in job details and required skills
   - System generates a unique 6-character job code
   - Share this code with candidates
4. **View Candidates**: Click on job to see all applicants
5. **Review Interviews**: Click "View Details" to see interview results

### As Candidate:

1. **Open Browser**: http://localhost:5173 (use incognito/private mode)
2. **Join Interview**: Click "Join Interview"
3. **Enter Job Code**: Use the 6-character code from HR
4. **Submit Application**:
   - Enter name and email
   - Upload resume (PDF/DOCX) or paste text
5. **Start Interview**:
   - Allow camera and microphone access
   - Choose interviewer voice (Aarush/Aarushi)
   - Answer questions using voice
   - Interview is recorded for HR review

---

## 🛑 Stop the Servers

To stop the servers, press `Ctrl+C` in the respective terminal windows.

Or run:
```bash
# Find and kill processes
lsof -ti:8000 | xargs kill -9  # Stop backend
lsof -ti:5173 | xargs kill -9  # Stop frontend
```

---

## 🔄 Restart the Servers

### Option 1: Manual Start
```bash
# Terminal 1 - Backend
cd /Users/ayush/Projects/GenAi.git/backend
./venv/bin/python run.py

# Terminal 2 - Frontend
cd /Users/ayush/Projects/GenAi.git/frontend
npm run dev
```

### Option 2: Use Startup Script
```bash
cd /Users/ayush/Projects/GenAi.git
./start_local.sh
```

---

## 🐛 Troubleshooting

### Backend Issues:

**Database errors:**
```bash
cd backend
./venv/bin/python -c "from app.database import init_db; init_db()"
```

**Port 8000 already in use:**
```bash
lsof -ti:8000 | xargs kill -9
```

### Frontend Issues:

**Port 5173 already in use:**
```bash
lsof -ti:5173 | xargs kill -9
```

**Dependencies missing:**
```bash
cd frontend
npm install
```

### API Key Issues:

If you see errors about "API key not valid":
1. Check `backend/.env` file
2. Ensure keys are on the correct lines (no spaces)
3. Restart the backend server after updating `.env`

---

## 📊 Project Features

### AI-Powered Interview:
- ✅ Dynamic question generation based on JD and resume
- ✅ Voice interaction (speak and listen)
- ✅ Video recording of interview
- ✅ Automatic evaluation and scoring
- ✅ Final recommendation (Strong/Medium/Weak/Reject)

### For HR:
- ✅ Job posting management
- ✅ Candidate tracking
- ✅ Interview transcripts
- ✅ Audio playback
- ✅ Video review
- ✅ Detailed scoring reports

### Technologies:
- **Backend**: Python, FastAPI, SQLAlchemy, SQLite
- **Frontend**: React, Vite, Tailwind CSS
- **AI**: Google Gemini (questions/evaluation), Sarvam AI (voice)

---

## 📚 Additional Resources

- **API Documentation**: http://localhost:8000/docs (Interactive Swagger UI)
- **Backend Code**: `/backend/app/`
- **Frontend Code**: `/frontend/src/`
- **Database**: `/backend/interview.db` (SQLite)

---

## 🎉 You're All Set!

Your AI Interview System is running locally!

**Next Steps:**
1. Add API keys to `backend/.env`
2. Restart backend server
3. Open http://localhost:5173
4. Start interviewing! 🎤

---

**Need Help?**
- Check logs in terminal windows
- Visit API docs at http://localhost:8000/docs
- Review README.md for more details
