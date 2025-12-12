# 📂 Project Structure Guide

## 🗂️ Complete Directory Layout

```
GenAi.git/
│
├── 📄 README.md                    # Main project documentation
├── 📄 LICENSE                      # MIT License
├── 🔧 setup.sh                     # Linux/Mac setup script
├── 🔧 setup.bat                    # Windows setup script
├── 🔧 start_local.sh               # Quick start script
├── 🔧 organize_docs_clean.sh       # Documentation organizer
│
├── 📁 backend/                     # Python FastAPI Backend
│   ├── 📄 requirements.txt         # Python dependencies
│   ├── 📄 render.yaml              # Render deployment config
│   ├── 📄 Dockerfile               # Docker configuration
│   ├── 📄 run.py                   # Production server start
│   ├── 📄 run_simple.py            # Development server start
│   ├── 📄 .env                     # Environment variables (SECRET!)
│   │
│   ├── 📁 app/                     # Main application code
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI app entry point
│   │   ├── config.py               # Configuration settings
│   │   ├── database.py             # Database connection
│   │   ├── models.py               # SQLAlchemy models
│   │   ├── schemas.py              # Pydantic schemas
│   │   ├── auth.py                 # Authentication logic
│   │   │
│   │   ├── 📁 routers/             # API endpoints
│   │   │   ├── auth.py             # /api/auth/* routes
│   │   │   ├── jobs.py             # /api/jobs/* routes
│   │   │   └── interviews.py       # /api/interviews/* routes
│   │   │
│   │   ├── 📁 services/            # Business logic
│   │   │   ├── llm_service.py      # AI (Gemini) integration
│   │   │   ├── speech_service.py   # Voice (Sarvam) integration
│   │   │   └── parsing_service.py  # Resume parsing
│   │   │
│   │   └── 📁 middleware/          # Custom middleware
│   │       ├── rate_limiter.py     # Rate limiting logic
│   │       └── __init__.py
│   │
│   ├── 📁 alembic/                 # Database migrations
│   │   ├── env.py
│   │   └── versions/
│   │
│   ├── 📁 uploads/                 # User uploaded files
│   │   └── resumes/                # Resume files
│   │
│   └── 📁 tests/                   # Backend tests
│       └── test_parsing.py
│
├── 📁 frontend/                    # React Frontend
│   ├── 📄 package.json             # NPM dependencies
│   ├── 📄 vite.config.js           # Vite configuration
│   ├── 📄 tailwind.config.js       # Tailwind CSS config
│   ├── 📄 vercel.json              # Vercel deployment config
│   ├── 📄 index.html               # HTML entry point
│   │
│   ├── 📁 public/                  # Static assets
│   │   ├── avatar.mp4              # Male avatar video (603KB)
│   │   ├── avatar_female.mp4       # Female avatar video (701KB)
│   │   └── avatar1.mp4             # Alternative avatar (345KB)
│   │
│   └── 📁 src/                     # React source code
│       ├── main.jsx                # React entry point
│       ├── App.jsx                 # Main app component
│       │
│       ├── 📁 pages/               # Page components
│       │   ├── LandingPage.jsx     # Home page
│       │   ├── SignupPage.jsx      # HR signup
│       │   ├── LoginPage.jsx       # HR login
│       │   ├── DashboardPage.jsx   # HR dashboard
│       │   ├── JobFormPage.jsx     # Create job
│       │   ├── CandidatesPage.jsx  # View candidates
│       │   ├── CandidateDetailsPage.jsx  # Candidate results
│       │   ├── ApplyPage.jsx       # Candidate application
│       │   └── InterviewRoom.jsx   # Interview interface
│       │
│       ├── 📁 components/          # Reusable components
│       │   └── ProfessionalVideoAvatar.jsx  # Avatar component
│       │
│       ├── 📁 api/                 # API client
│       │   ├── client.js           # Axios instance
│       │   ├── authService.js      # Auth API calls
│       │   ├── jobService.js       # Job API calls
│       │   └── interviewService.js # Interview API calls
│       │
│       ├── 📁 store/               # State management
│       │   └── authStore.js        # Zustand auth store
│       │
│       └── 📁 styles/              # CSS files
│           └── index.css           # Global styles
│
└── 📁 docs/                        # 📚 Documentation (ORGANIZED!)
    ├── 📄 README.md                # Documentation index
    │
    ├── 📁 setup/                   # 🛠️ Setup & Installation
    │   ├── README.md
    │   ├── LOCAL_SETUP_GUIDE.md    # ⭐ Start here for local dev
    │   ├── BUILD_FROM_SCRATCH_GUIDE.md
    │   ├── QUICK_START.md
    │   ├── VIEW_DATABASE_GUIDE.md
    │   ├── RENDER_POSTGRESQL_SETUP.md
    │   ├── DATABASE_ACCESS_GUIDE.md
    │   ├── BCRYPT_FIX_GUIDE.md
    │   ├── SECRET_KEY_INFO.md
    │   └── SECURITY_UPDATE.md
    │
    ├── 📁 features/                # ✨ Feature Documentation
    │   ├── README.md
    │   ├── FEATURE_GUIDE.md        # ⭐ All features explained
    │   ├── AVATAR_GUIDE.md         # Avatar system
    │   ├── RATE_LIMITING_GUIDE.md  # ⭐ Rate limiting (important!)
    │   ├── RATE_LIMITING_QUICKSTART.md
    │   ├── RATE_LIMITING_SUMMARY.md
    │   ├── RATE_LIMITING_VISUAL.md
    │   └── VIDEO_STORAGE_GUIDE.md
    │
    ├── 📁 troubleshooting/         # 🔧 Problem Solving
    │   ├── README.md
    │   ├── AUDIO_FILE_404_FIX.md   # ⭐ Audio issues
    │   ├── AUDIO_DOUBLE_SLASH_FIX.md
    │   ├── AUDIO_FIX_CHECKLIST.md
    │   ├── AUDIO_CHUNKING_FIX.md
    │   ├── CORS_FIX.md
    │   ├── FINAL_FIX_401.md        # Auth issues
    │   ├── VERCEL_404_FIX.md
    │   └── FIX_AUDIO_ISSUES.md
    │
    ├── 📁 deployment/              # 🚀 Production Deployment
    │   ├── README.md
    │   ├── DEPLOYMENT_GUIDE.md     # ⭐ Complete deploy guide
    │   ├── DEPLOYMENT_CHECKLIST.md
    │   ├── PRODUCTION_READY.md
    │   ├── VERCEL_SETUP_GUIDE.md
    │   ├── RENDER_ENV_VARS.txt
    │   └── README_DEPLOYMENT.md
    │
    ├── 📁 api/                     # 📡 API Documentation
    │   └── (Future: OpenAPI docs)
    │
    └── 📁 archived/                # 🗄️ Old/Deprecated Docs
        ├── FIX_VERCEL_404_NOW.md
        ├── IMMEDIATE_FIX.md
        ├── POSTGRESQL_DEPLOY.txt
        └── (Other old deployment docs)
```

## 🎯 Key Files Explained

### 🔥 Most Important Files

| File | Purpose | When to Edit |
|------|---------|--------------|
| `backend/.env` | API keys & secrets | Setup, add new services |
| `backend/app/main.py` | Backend entry point | Add new routes/middleware |
| `frontend/src/App.jsx` | Frontend routing | Add new pages |
| `docs/README.md` | Documentation index | Never - auto-generated |

### 🔑 Configuration Files

| File | Purpose | Format |
|------|---------|--------|
| `backend/requirements.txt` | Python packages | pip format |
| `frontend/package.json` | NPM packages | JSON |
| `backend/render.yaml` | Render deployment | YAML |
| `frontend/vercel.json` | Vercel deployment | JSON |
| `backend/alembic.ini` | Database migrations | INI |

### 🚀 Startup Scripts

| Script | Platform | Purpose |
|--------|----------|---------|
| `setup.sh` | Mac/Linux | First-time setup |
| `setup.bat` | Windows | First-time setup |
| `start_local.sh` | Mac/Linux | Start servers |
| `START_HERE.bat` | Windows | Start servers |
| `backend/run.py` | All | Production backend |
| `backend/run_simple.py` | All | Development backend |

## 📊 Data Flow

```
User Browser
    ↓ HTTP/WebSocket
Frontend (React)
    ↓ Axios API calls
Backend (FastAPI)
    ↓
Services Layer
    ├→ LLM Service → Gemini API (AI)
    ├→ Speech Service → Sarvam API (Voice)
    └→ Parsing Service → Local (Resume)
    ↓
Database (PostgreSQL/SQLite)
    ↓
File Storage (uploads/)
```

## 🗂️ Where to Find Things

### "I want to..."

**Add a new API endpoint:**
- Create route in `backend/app/routers/`
- Register in `backend/app/main.py`

**Add a new page:**
- Create component in `frontend/src/pages/`
- Add route in `frontend/src/App.jsx`

**Change the avatar:**
- Replace videos in `frontend/public/`
- Update `frontend/src/components/ProfessionalVideoAvatar.jsx`

**Add rate limiting:**
- Already done! See `backend/app/middleware/rate_limiter.py`
- Docs: `docs/features/RATE_LIMITING_GUIDE.md`

**Fix audio issues:**
- Check `docs/troubleshooting/AUDIO_FILE_404_FIX.md`
- Backend: `backend/app/routers/interviews.py`
- Frontend: `frontend/src/pages/InterviewRoom.jsx`

**Deploy to production:**
- Follow `docs/deployment/DEPLOYMENT_GUIDE.md`
- Backend: Push to GitHub → Render auto-deploys
- Frontend: Push to GitHub → Vercel auto-deploys

**View database:**
- Use `backend/view_database.py`
- Or follow `docs/setup/VIEW_DATABASE_GUIDE.md`

**Change AI model:**
- Edit `backend/app/services/llm_service.py`
- Update `GEMINI_API_KEY` in `backend/.env`

**Change voice service:**
- Edit `backend/app/services/speech_service.py`
- Update `SARVAM_API_KEY` in `backend/.env`

## 🧹 Files You Can Ignore

### Generated/Temporary Files
- `backend/__pycache__/` - Python bytecode
- `backend/venv/` - Virtual environment
- `frontend/node_modules/` - NPM packages
- `frontend/dist/` - Build output
- `backend/interview.db` - SQLite database (dev only)

### Git Files
- `.git/`, `HEAD`, `config`, `refs/`, etc. - Git internals
- `.gitignore` - Files to exclude from Git

### Old/Deprecated
- `docs/archived/` - Old documentation
- `backend/*.pyc` - Compiled Python

## 📝 Documentation Organization

### Before (❌ Cluttered)
```
GenAi.git/
├── RATE_LIMITING_GUIDE.md
├── AUDIO_FIX_CHECKLIST.md
├── LOCAL_SETUP_GUIDE.md
├── FIX_VERCEL_404_NOW.md
└── ... 20+ more files in root!
```

### After (✅ Clean)
```
GenAi.git/
├── README.md                    # Overview only
└── docs/                        # All docs organized!
    ├── setup/                   # Setup guides
    ├── features/                # Feature docs
    ├── troubleshooting/         # Fixes
    ├── deployment/              # Deploy guides
    └── archived/                # Old docs
```

## 🎯 Quick Reference

### File Extensions

| Extension | Type | Location |
|-----------|------|----------|
| `.py` | Python code | `backend/` |
| `.jsx`, `.js` | React/JavaScript | `frontend/src/` |
| `.md` | Documentation | `docs/` |
| `.json` | Configuration | Root, frontend/ |
| `.yaml`, `.yml` | Configuration | `backend/` |
| `.env` | Environment vars | `backend/` |
| `.mp4` | Avatar videos | `frontend/public/` |
| `.wav` | Audio files | `backend/uploads/` |

### Important URLs (Local Development)

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |
| API Schema | http://localhost:8000/openapi.json |

### Important URLs (Production)

| Service | URL |
|---------|-----|
| Frontend | https://your-app.vercel.app |
| Backend API | https://your-backend.onrender.com |
| API Docs | https://your-backend.onrender.com/docs |

## 🤝 Contributing

When adding new files:
1. **Code files** → Appropriate folder (`backend/app/`, `frontend/src/`)
2. **Documentation** → `docs/` subfolder
3. **Assets** → `frontend/public/`
4. **Tests** → `backend/tests/` or `frontend/tests/`

## 🆘 Need Help?

1. Check `docs/README.md` for documentation index
2. Search `docs/troubleshooting/` for your issue
3. Read the specific guide in `docs/setup/` or `docs/features/`
4. Check GitHub Issues

---

**Last Updated:** December 2025  
**Maintained By:** Project Team  
**Documentation Location:** `docs/`
