# 🚀 Building AI Interview SaaS from Scratch - Complete Guide

## 📋 Table of Contents
1. [Product Overview](#product-overview)
2. [Technology Stack Breakdown](#technology-stack-breakdown)
3. [Phase-by-Phase Development](#phase-by-phase-development)
4. [Architecture Deep Dive](#architecture-deep-dive)
5. [Implementation Roadmap](#implementation-roadmap)
6. [Best Practices & Patterns](#best-practices--patterns)

---

## 🎯 Product Overview

### What Are We Building?
An **AI-Powered Voice Interview Platform** where:
- HR creates job postings with requirements
- Candidates apply and take AI-conducted voice interviews
- System records video, evaluates answers, and generates reports
- HR reviews transcripts, scores, and makes hiring decisions

### Core Value Proposition
- **Automated Screening:** Reduces HR workload by 70%
- **Consistent Evaluation:** AI removes human bias
- **Scalable:** Handle 1000s of interviews simultaneously
- **Data-Driven:** Structured scoring and recommendations

---

## 🛠️ Technology Stack Breakdown

### **Backend: Python FastAPI**

#### Why FastAPI?
```
✅ Fast performance (on par with Node.js/Go)
✅ Async support (handles concurrent requests)
✅ Auto-generated API docs (Swagger/OpenAPI)
✅ Type hints & validation (Pydantic)
✅ Easy WebSocket support
✅ Modern Python 3.8+ features
```

#### Alternatives Considered:
- **Django**: Too heavy, batteries-included approach
- **Flask**: Less modern, no async, manual validation
- **Node.js/Express**: Possible, but Python better for AI/ML integration

#### Key Libraries:
```python
fastapi==0.115.0          # Web framework
uvicorn==0.30.0           # ASGI server (async)
sqlalchemy==2.0.35        # ORM for database
pydantic==2.9.0           # Data validation
python-jose==3.3.0        # JWT tokens
bcrypt==5.0.0             # Password hashing
```

---

### **Frontend: React + Vite**

#### Why React?
```
✅ Component-based architecture
✅ Large ecosystem & community
✅ Virtual DOM for performance
✅ Hooks for state management
✅ Easy media (camera/mic) integration
✅ Job market demand
```

#### Why Vite (not Create React App)?
```
✅ 10-100x faster hot reload
✅ ES modules (modern bundling)
✅ Optimized production builds
✅ Better developer experience
✅ Smaller bundle sizes
```

#### Key Libraries:
```json
"react": "^18.2.0"              // UI library
"react-router-dom": "^6.21.0"   // Client-side routing
"axios": "^1.6.2"               // HTTP client
"zustand": "^4.4.7"             // State management (lighter than Redux)
"react-query": "^3.39.3"        // Server state caching
"tailwindcss": "^3.4.0"         // Utility-first CSS
```

---

### **Database: SQLite (Dev) / PostgreSQL (Production)**

#### Why SQLite for Development?
```
✅ Zero configuration
✅ File-based (no server needed)
✅ Perfect for local development
✅ Easy to reset/recreate
```

#### Why PostgreSQL for Production?
```
✅ ACID compliance
✅ Robust & scalable
✅ Advanced features (JSON, full-text search)
✅ Great performance under load
✅ Industry standard
```

#### ORM: SQLAlchemy
```python
# Benefits:
✅ Write Python, not SQL
✅ Database-agnostic
✅ Migration support (Alembic)
✅ Type safety
✅ Relationship handling
```

---

### **AI Services**

#### 1. Google Gemini API

**Purpose:** Question generation & answer evaluation

**Why Gemini?**
```
✅ Free tier (60 requests/minute)
✅ Large context window (32k tokens)
✅ Fast response time (~2-3 seconds)
✅ Good at structured output (JSON)
✅ Multimodal capabilities
✅ Better than GPT-3.5, cheaper than GPT-4
```

**Use Cases:**
- Generate interview questions based on JD + Resume
- Evaluate candidate answers with scores
- Create final recommendation reports
- Generate follow-up questions dynamically

**Alternative:** OpenAI GPT-4 (more expensive, similar quality)

#### 2. Sarvam AI (Text-to-Speech & Speech-to-Text)

**Why Sarvam?**
```
✅ Indian accent support (important for market)
✅ High-quality voice synthesis
✅ Natural-sounding speech
✅ Affordable pricing
✅ Low latency
✅ Multiple voice options
```

**Alternatives:**
- **Google Cloud TTS/STT:** More expensive
- **AWS Polly/Transcribe:** Complex setup
- **OpenAI Whisper:** Good for STT, but no TTS
- **ElevenLabs:** Expensive for high volume

---

## 📐 Architecture Deep Dive

### **System Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                        │
│  ┌────────────┐  ┌─────────────┐  ┌──────────────────┐     │
│  │  React UI  │  │  MediaAPIs  │  │  WebRTC Stream   │     │
│  │  (Vite)    │  │  (Camera/Mic)│ │  (Recording)     │     │
│  └─────┬──────┘  └──────┬──────┘  └────────┬─────────┘     │
└────────┼────────────────┼──────────────────┼────────────────┘
         │                │                  │
         │ HTTP/REST      │                  │
         ▼                ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                     FASTAPI BACKEND                          │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │   Routers    │  │   Services   │  │   Database      │   │
│  │              │  │              │  │   (SQLAlchemy)  │   │
│  │ - auth.py    │  │ - llm.py     │  │                 │   │
│  │ - jobs.py    │  │ - speech.py  │  │ - User          │   │
│  │ - interview  │  │ - parsing.py │  │ - Job           │   │
│  └──────┬───────┘  └──────┬───────┘  │ - Candidate     │   │
│         │                 │          │ - Interview     │   │
│         └────────┬────────┘          │ - Questions     │   │
│                  │                   │ - Answers       │   │
│                  ▼                   └─────────────────┘   │
└──────────────────┼──────────────────────────────────────────┘
                   │
                   ▼
         ┌─────────────────────┐
         │   External APIs     │
         │                     │
         │ - Google Gemini     │
         │ - Sarvam TTS/STT    │
         └─────────────────────┘
```

---

### **Database Schema Design**

```sql
-- Core Entities and Relationships

┌─────────────┐
│    Users    │ (HR Accounts)
├─────────────┤
│ id          │ PK
│ email       │ UNIQUE
│ password    │ (hashed)
│ name        │
│ role        │ (hr/admin)
└──────┬──────┘
       │
       │ 1:N (One HR creates many jobs)
       ▼
┌─────────────┐
│    Jobs     │ (Job Postings)
├─────────────┤
│ id          │ PK
│ hr_user_id  │ FK → Users
│ title       │
│ jd_text     │
│ skills      │ (JSON array)
│ job_code    │ UNIQUE (6 chars)
│ is_active   │
└──────┬──────┘
       │
       │ 1:N (One job has many candidates)
       ▼
┌──────────────┐
│  Candidates  │ (Applicants)
├──────────────┤
│ id           │ PK
│ job_id       │ FK → Jobs
│ name         │
│ email        │
│ resume_text  │
│ resume_json  │ (parsed data)
│ status       │ (pending/shortlisted/rejected)
└──────┬───────┘
       │
       │ 1:1 (One candidate = one interview)
       ▼
┌─────────────────────┐
│ InterviewSessions   │
├─────────────────────┤
│ id                  │ PK
│ candidate_id        │ FK → Candidates (UNIQUE)
│ status              │ (scheduled/in_progress/completed)
│ started_at          │
│ ended_at            │
│ final_score         │
│ recommendation      │
│ report_text         │
│ video_path          │
└──────┬──────────────┘
       │
       │ 1:N (One session has many questions)
       ▼
┌──────────────────────┐
│ InterviewQuestions   │
├──────────────────────┤
│ id                   │ PK
│ session_id           │ FK → InterviewSessions
│ index                │ (1, 2, 3...)
│ question_text        │
│ question_type        │ (technical/project/behavioral)
│ skill                │
│ difficulty           │
└──────┬───────────────┘
       │
       │ 1:1 (One question = one answer)
       ▼
┌──────────────────────┐
│  InterviewAnswers    │
├──────────────────────┤
│ id                   │ PK
│ question_id          │ FK → InterviewQuestions (UNIQUE)
│ transcript           │ (STT output)
│ audio_path           │
│ correctness_score    │ (0-5)
│ depth_score          │ (0-5)
│ clarity_score        │ (0-5)
│ relevance_score      │ (0-5)
│ comment              │ (AI feedback)
└──────────────────────┘
```

**Key Design Decisions:**

1. **Users → Jobs (1:N)**: One HR can create multiple jobs
2. **Jobs → Candidates (1:N)**: One job receives many applications
3. **Candidates → InterviewSessions (1:1)**: Each candidate gets exactly one interview per application
4. **Sessions → Questions (1:N)**: Dynamic number of questions (up to 12)
5. **Questions → Answers (1:1)**: Each question has one answer

---

## 🏗️ Phase-by-Phase Development

### **Phase 1: Project Setup & Foundation (Week 1)**

#### 1.1 Backend Setup
```bash
# Create project structure
mkdir ai-interview-saas
cd ai-interview-saas
mkdir backend frontend

# Backend initialization
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Install core dependencies
pip install fastapi uvicorn sqlalchemy pydantic python-dotenv

# Create initial structure
mkdir app
cd app
touch __init__.py main.py config.py database.py models.py schemas.py
mkdir routers services
```

**File: `backend/app/main.py`** (Starter)
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="AI Interview API",
    version="1.0.0"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "AI Interview API is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
```

**File: `backend/app/config.py`**
```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./interview.db"
    SECRET_KEY: str
    GEMINI_API_KEY: str
    SARVAM_API_KEY: str
    
    class Config:
        env_file = ".env"

settings = Settings()
```

**File: `backend/.env`**
```env
SECRET_KEY=generate-a-secure-random-key-here
GEMINI_API_KEY=your-gemini-key
SARVAM_API_KEY=your-sarvam-key
DATABASE_URL=sqlite:///./interview.db
```

#### 1.2 Frontend Setup
```bash
cd ../../
npm create vite@latest frontend -- --template react
cd frontend
npm install

# Install dependencies
npm install react-router-dom axios zustand react-query
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**File: `frontend/tailwind.config.js`**
```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**File: `frontend/src/main.jsx`**
```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import App from './App'
import './index.css'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
```

---

### **Phase 2: Authentication System (Week 1-2)**

#### Why JWT Tokens?
```
✅ Stateless (no server-side session storage)
✅ Scalable (works across multiple servers)
✅ Self-contained (carries user info)
✅ Secure (signed with secret key)
✅ Expirable (time-limited access)
```

#### 2.1 Backend Auth Implementation

**File: `backend/app/auth.py`**
```python
from datetime import datetime, timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
from .config import settings

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Token security
security = HTTPBearer()

def hash_password(password: str) -> str:
    """Hash a plain password using bcrypt"""
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain, hashed)

def create_access_token(data: dict) -> str:
    """Create JWT token with expiration"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=1440)  # 24 hours
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")

async def get_current_user(credentials = Depends(security), db = Depends(get_db)):
    """Dependency to get current authenticated user"""
    try:
        token = credentials.credentials
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        user_id = int(payload.get("sub"))
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

**Why Bcrypt?**
- Industry standard for password hashing
- Slow by design (prevents brute-force attacks)
- Automatic salt generation
- Forward-compatible (adjustable work factor)

#### 2.2 Auth Routes

**File: `backend/app/routers/auth.py`**
```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from ..schemas import UserSignup, UserLogin, Token
from ..auth import hash_password, verify_password, create_access_token

router = APIRouter()

@router.post("/signup", response_model=Token)
def signup(user_data: UserSignup, db: Session = Depends(get_db)):
    # Check if email exists
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        role="hr"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Return JWT token
    token = create_access_token({"sub": str(new_user.id)})
    return {"access_token": token, "token_type": "bearer"}

@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    # Find user
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Return JWT token
    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}
```

#### 2.3 Frontend Auth State (Zustand)

**Why Zustand over Redux?**
```
✅ 10x less boilerplate
✅ No providers needed
✅ Simple API
✅ TypeScript-friendly
✅ Tiny bundle size (1KB)
```

**File: `frontend/src/store/authStore.js`**
```javascript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      
      login: (token) => {
        localStorage.setItem('token', token)
        set({ token })
      },
      
      logout: () => {
        localStorage.removeItem('token')
        set({ token: null, user: null })
      },
      
      setUser: (user) => set({ user }),
    }),
    {
      name: 'auth-storage',
      getStorage: () => localStorage,
    }
  )
)
```

---

### **Phase 3: Database Models & Migrations (Week 2)**

#### 3.1 Define Models

**File: `backend/app/models.py`**
```python
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, JSON, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import enum
from .database import Base

class InterviewStatus(str, enum.Enum):
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="hr")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    jobs = relationship("Job", back_populates="hr_user")

class Job(Base):
    __tablename__ = "jobs"
    
    id = Column(Integer, primary_key=True, index=True)
    hr_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    jd_raw_text = Column(Text, nullable=False)
    must_have_skills = Column(JSON, default=list)
    good_to_have_skills = Column(JSON, default=list)
    job_code = Column(String(10), unique=True)
    is_active = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    hr_user = relationship("User", back_populates="jobs")
    candidates = relationship("Candidate", back_populates="job", cascade="all, delete-orphan")

class Candidate(Base):
    __tablename__ = "candidates"
    
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    resume_raw_text = Column(Text, nullable=False)
    resume_parsed_json = Column(JSON, default=dict)
    status = Column(String(20), default="Pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    job = relationship("Job", back_populates="candidates")
    interview_session = relationship("InterviewSession", back_populates="candidate", uselist=False)

class InterviewSession(Base):
    __tablename__ = "interview_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False, unique=True)
    status = Column(Enum(InterviewStatus), default=InterviewStatus.SCHEDULED)
    started_at = Column(DateTime(timezone=True))
    ended_at = Column(DateTime(timezone=True))
    final_score = Column(Float)
    final_recommendation = Column(String(50))
    final_report_text = Column(Text)
    video_file_path = Column(String(500))
    
    candidate = relationship("Candidate", back_populates="interview_session")
    questions = relationship("InterviewQuestion", back_populates="session", cascade="all, delete-orphan")

# ... Continue with InterviewQuestion and InterviewAnswer models
```

**Why JSON columns?**
- Store complex data (arrays, objects) without creating new tables
- Flexible schema (skills can vary per job)
- Easy to query and update
- PostgreSQL has excellent JSON support

#### 3.2 Database Initialization

**File: `backend/app/database.py`**
```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,      # Check connection health
    pool_size=10,            # Connection pool size
    max_overflow=20          # Max connections beyond pool_size
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """Dependency for database sessions"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Create all tables"""
    from . import models
    Base.metadata.create_all(bind=engine)
```

---

### **Phase 4: Resume Parsing Service (Week 2-3)**

#### Why Parse Resumes?
```
✅ Extract structured data (skills, experience)
✅ Enable intelligent matching
✅ Generate contextual questions
✅ Better candidate insights
```

**File: `backend/app/services/parsing_service.py`**
```python
import re
from typing import Dict, List
import PyPDF2
import docx
from io import BytesIO

class ParsingService:
    # Common technical skills
    COMMON_SKILLS = [
        "Python", "Java", "JavaScript", "React", "Node.js",
        "SQL", "PostgreSQL", "MongoDB", "AWS", "Docker",
        "Machine Learning", "REST", "GraphQL", "Git", "Linux"
    ]
    
    def parse_resume(self, resume_text: str) -> Dict:
        """Extract structured data from resume text"""
        return {
            "skills": self._extract_skills(resume_text),
            "experience_years": self._extract_experience(resume_text),
            "projects": self._extract_projects(resume_text),
            "education": self._extract_education(resume_text)
        }
    
    def _extract_skills(self, text: str) -> List[str]:
        """Find technical skills in text"""
        found_skills = []
        text_lower = text.lower()
        for skill in self.COMMON_SKILLS:
            if skill.lower() in text_lower:
                found_skills.append(skill)
        return found_skills
    
    def _extract_experience(self, text: str) -> int:
        """Extract years of experience using regex"""
        patterns = [
            r'(\d+)\s*\+?\s*years?',
            r'(\d+)\s*yrs?',
            r'experience:\s*(\d+)'
        ]
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return int(match.group(1))
        return 0
    
    def extract_text_from_pdf(self, pdf_bytes: bytes) -> str:
        """Extract text from PDF file"""
        pdf_file = BytesIO(pdf_bytes)
        reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text.strip()
    
    def extract_text_from_docx(self, docx_bytes: bytes) -> str:
        """Extract text from DOCX file"""
        doc_file = BytesIO(docx_bytes)
        doc = docx.Document(doc_file)
        text = "\n".join([p.text for p in doc.paragraphs])
        return text.strip()

parsing_service = ParsingService()
```

**Why PyPDF2 and python-docx?**
- Most resumes are in PDF or DOCX format
- Simple, lightweight libraries
- No external dependencies (no OCR needed)
- Fast processing

---

### **Phase 5: LLM Integration (Week 3-4)**

This is the BRAIN of your application. Most important phase!

#### 5.1 LLM Service Architecture

**File: `backend/app/services/llm_service.py`**
```python
import google.generativeai as genai
import json
from typing import Dict, List
from ..config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)

class LLMService:
    def __init__(self):
        # Auto-select best available model
        self.model = genai.GenerativeModel("gemini-2.0-flash")
    
    def generate_interview_plan(
        self, 
        jd_text: str, 
        jd_skills: Dict, 
        resume_parsed: Dict
    ) -> List[Dict]:
        """
        Generate interview plan (not actual questions, just structure)
        
        Returns: [
            {"type": "technical", "skill": "Python", "difficulty": "medium"},
            {"type": "project", "focus": "previous work", "difficulty": "basic"},
            ...
        ]
        """
        prompt = f"""
        You are designing an interview plan for a candidate.
        
        JOB REQUIREMENTS:
        {jd_text}
        
        Must-have skills: {jd_skills.get('must_have', [])}
        Good-to-have skills: {jd_skills.get('good_to_have', [])}
        
        CANDIDATE PROFILE:
        Skills: {resume_parsed.get('skills', [])}
        Experience: {resume_parsed.get('experience_years', 0)} years
        Projects: {len(resume_parsed.get('projects', []))} projects
        
        Generate a structured interview plan with 12-15 items.
        Distribution:
        - 1-2 warmup/HR questions
        - 4-5 technical conceptual questions
        - 1-2 coding questions (max)
        - 3-4 project-based questions
        - 2-3 behavioral questions
        
        Return as JSON array of objects with:
        - type: "technical" | "project" | "behavioral" | "hr"
        - skill: relevant skill name
        - difficulty: "basic" | "medium" | "advanced"
        - focus: brief description
        
        IMPORTANT: Return ONLY valid JSON, no markdown or explanation.
        """
        
        response = self.model.generate_content(prompt)
        plan = json.loads(response.text)
        return plan
    
    def generate_question(
        self,
        plan_item: Dict,
        jd_text: str,
        resume_parsed: Dict,
        previous_questions: List[str]
    ) -> str:
        """
        Generate actual question text based on plan item
        Ensures no repetition with previous questions
        """
        prompt = f"""
        Generate ONE interview question based on this plan:
        
        Type: {plan_item['type']}
        Skill: {plan_item.get('skill', 'general')}
        Difficulty: {plan_item['difficulty']}
        Focus: {plan_item.get('focus', '')}
        
        Job Description: {jd_text[:500]}
        Candidate Skills: {resume_parsed.get('skills', [])}
        
        Previous questions asked:
        {chr(10).join(previous_questions)}
        
        RULES:
        - Must be different from previous questions
        - Clear and conversational
        - Appropriate difficulty level
        - Takes 2-5 minutes to answer
        - For coding questions, focus on approach/logic, not implementation
        
        Return ONLY the question text, nothing else.
        """
        
        response = self.model.generate_content(prompt)
        return response.text.strip()
    
    def evaluate_answer(
        self,
        question: str,
        answer_transcript: str,
        question_type: str,
        skill: str
    ) -> Dict:
        """
        Evaluate candidate's answer and return scores
        
        Returns: {
            "correctness_score": 4.5,
            "depth_score": 3.0,
            "clarity_score": 4.0,
            "relevance_score": 4.5,
            "comment": "Good explanation of..."
        }
        """
        prompt = f"""
        You are an expert technical interviewer evaluating a candidate's answer.
        
        QUESTION: {question}
        TYPE: {question_type}
        SKILL: {skill}
        
        CANDIDATE'S ANSWER: {answer_transcript}
        
        Evaluate on these dimensions (0-5 scale):
        
        1. CORRECTNESS: Technical accuracy and factual correctness
           0 = Completely wrong, 5 = Perfectly accurate
        
        2. DEPTH: Level of detail and understanding shown
           0 = Superficial, 5 = Expert-level depth
        
        3. CLARITY: Communication quality and organization
           0 = Confusing, 5 = Crystal clear
        
        4. RELEVANCE: How well answer addresses the question
           0 = Off-topic, 5 = Directly on-point
        
        Provide brief constructive feedback (2-3 sentences).
        
        Return as JSON:
        {{
            "correctness_score": float,
            "depth_score": float,
            "clarity_score": float,
            "relevance_score": float,
            "comment": "string"
        }}
        
        IMPORTANT: Return ONLY valid JSON.
        """
        
        response = self.model.generate_content(prompt)
        evaluation = json.loads(response.text)
        return evaluation
    
    def finalize_interview(
        self,
        all_questions: List[Dict],
        all_answers: List[Dict]
    ) -> Dict:
        """
        Generate final interview report and recommendation
        
        Returns: {
            "overall_score": 78.5,
            "recommendation": "Strong",
            "report": "Detailed analysis..."
        }
        """
        # Calculate average scores
        total_questions = len(all_answers)
        if total_questions == 0:
            return {
                "overall_score": 0,
                "recommendation": "Reject",
                "report": "No answers provided"
            }
        
        avg_correctness = sum(a['correctness_score'] for a in all_answers) / total_questions
        avg_depth = sum(a['depth_score'] for a in all_answers) / total_questions
        avg_clarity = sum(a['clarity_score'] for a in all_answers) / total_questions
        avg_relevance = sum(a['relevance_score'] for a in all_answers) / total_questions
        
        overall_score = ((avg_correctness + avg_depth + avg_clarity + avg_relevance) / 4) * 20
        
        # Determine recommendation
        if overall_score >= 80:
            recommendation = "Strong"
        elif overall_score >= 60:
            recommendation = "Medium"
        elif overall_score >= 40:
            recommendation = "Weak"
        else:
            recommendation = "Reject"
        
        # Generate detailed report using LLM
        prompt = f"""
        Generate a comprehensive interview evaluation report.
        
        SCORES:
        - Correctness: {avg_correctness:.1f}/5
        - Depth: {avg_depth:.1f}/5
        - Clarity: {avg_clarity:.1f}/5
        - Relevance: {avg_relevance:.1f}/5
        - Overall: {overall_score:.1f}/100
        
        NUMBER OF QUESTIONS: {total_questions}
        
        RECOMMENDATION: {recommendation}
        
        Write a professional evaluation (150-200 words) covering:
        1. Overall performance summary
        2. Key strengths observed
        3. Areas for improvement
        4. Final hiring recommendation
        
        Be constructive and specific.
        """
        
        response = self.model.generate_content(prompt)
        
        return {
            "overall_score": round(overall_score, 1),
            "recommendation": recommendation,
            "report": response.text.strip()
        }

llm_service = LLMService()
```

**Why This LLM Architecture?**

1. **Separation of Concerns:**
   - Plan generation (structure)
   - Question generation (content)
   - Answer evaluation (scoring)
   - Final report (summary)

2. **Prevents Repetition:**
   - Pass previous questions to avoid duplicates
   - Use structured plan for variety

3. **Contextual Intelligence:**
   - Uses JD + Resume for relevant questions
   - Adapts difficulty based on experience
   - Focuses on candidate's background

4. **Structured Output:**
   - Forces JSON format for reliability
   - Easy to parse and validate
   - Consistent data structure

---

### **Phase 6: Speech Services (Week 4)**

#### 6.1 Text-to-Speech (Avatar Voice)

**File: `backend/app/services/speech_service.py`**
```python
import httpx
from ..config import settings

class SpeechService:
    def __init__(self):
        self.tts_url = settings.SARVAM_TTS_URL
        self.stt_url = settings.SARVAM_STT_URL
        self.api_key = settings.SARVAM_API_KEY
        self.headers = {
            "api-subscription-key": self.api_key,
            "Content-Type": "application/json"
        }
    
    async def synthesize_speech(self, text: str, speaker: str = "abhilash") -> bytes:
        """
        Convert text to speech using Sarvam TTS
        
        Args:
            text: Question text to synthesize
            speaker: Voice ID (abhilash/anushka)
        
        Returns:
            bytes: Audio data in WAV format
        """
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                self.tts_url,
                json={
                    "inputs": [text],
                    "target_language_code": "hi-IN",  # or "en-IN" for Indian English
                    "speaker": speaker,
                    "pitch": 0,
                    "pace": 1.0,
                    "loudness": 1.5,
                    "speech_sample_rate": 16000,
                    "enable_preprocessing": True,
                    "model": "bulbul:v1"
                },
                headers=self.headers
            )
            
            if response.status_code == 200:
                return response.content
            else:
                raise Exception(f"TTS failed: {response.text}")
    
    async def transcribe_audio(self, audio_bytes: bytes) -> str:
        """
        Convert audio to text using Sarvam STT
        
        Args:
            audio_bytes: Audio data in WAV format
        
        Returns:
            str: Transcribed text
        """
        # Convert audio to base64
        import base64
        audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                self.stt_url,
                json={
                    "language_code": "hi-IN",  # or "en-IN"
                    "audio": audio_base64,
                    "model": "saarika:v1"
                },
                headers=self.headers
            )
            
            if response.status_code == 200:
                result = response.json()
                return result.get("transcript", "")
            else:
                raise Exception(f"STT failed: {response.text}")

speech_service = SpeechService()
```

**Why Async?**
```
✅ Non-blocking I/O (handle multiple requests)
✅ Better performance for network calls
✅ Efficient resource usage
✅ FastAPI supports async natively
```

#### 6.2 Audio Processing on Frontend

**File: `frontend/src/services/audioRecorder.js`**
```javascript
export class AudioRecorder {
  constructor() {
    this.mediaRecorder = null
    this.audioChunks = []
  }
  
  async start(stream) {
    // Create MediaRecorder with WAV output
    const options = {
      mimeType: 'audio/webm',
      audioBitsPerSecond: 64000
    }
    
    this.mediaRecorder = new MediaRecorder(stream, options)
    this.audioChunks = []
    
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data)
      }
    }
    
    this.mediaRecorder.start(1000) // Collect data every second
  }
  
  async stop() {
    return new Promise((resolve) => {
      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.audioChunks, { type: 'audio/webm' })
        resolve(blob)
      }
      this.mediaRecorder.stop()
    })
  }
  
  // Convert WebM to WAV for better STT accuracy
  async convertToWAV(blob) {
    // Use pydub on backend or Web Audio API on frontend
    // Implementation depends on your needs
  }
}
```

---

### **Phase 7: Interview Flow Implementation (Week 5-6)**

This is where everything comes together!

#### 7.1 Interview State Machine

```
States:
┌─────────────┐
│  SCHEDULED  │ (Initial state after candidate applies)
└──────┬──────┘
       │ startInterview()
       ▼
┌─────────────┐
│ IN_PROGRESS │ (Interview ongoing)
└──────┬──────┘
       │ After all questions OR manual end
       ▼
┌─────────────┐
│  COMPLETED  │ (Final state)
└─────────────┘
```

#### 7.2 Interview Router

**File: `backend/app/routers/interviews.py`**
```python
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import InterviewSession, InterviewQuestion, InterviewAnswer
from ..services.llm_service import llm_service
from ..services.speech_service import speech_service
from ..services.parsing_service import parsing_service

router = APIRouter()

@router.post("/{session_id}/start")
async def start_interview(session_id: int, speaker: str, db: Session = Depends(get_db)):
    """
    Start interview and generate plan
    
    Flow:
    1. Get session, candidate, job
    2. Parse JD and resume
    3. Generate interview plan
    4. Store plan in session metadata
    5. Update status to IN_PROGRESS
    """
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    candidate = session.candidate
    job = candidate.job
    
    # Parse JD
    jd_parsed = parsing_service.parse_jd(
        job.jd_raw_text,
        job.must_have_skills,
        job.good_to_have_skills
    )
    
    # Generate interview plan
    plan = llm_service.generate_interview_plan(
        job.jd_raw_text,
        {"must_have": job.must_have_skills, "good_to_have": job.good_to_have_skills},
        candidate.resume_parsed_json
    )
    
    # Store in session
    session.session_metadata = {
        "interview_plan": plan,
        "current_question_index": 0,
        "speaker": speaker
    }
    session.status = InterviewStatus.IN_PROGRESS
    session.started_at = datetime.utcnow()
    
    db.commit()
    
    return {"status": "started", "message": "Interview started"}

@router.post("/{session_id}/next-question")
async def get_next_question(session_id: int, db: Session = Depends(get_db)):
    """
    Generate and return next question
    
    Flow:
    1. Get current plan item
    2. Get previously asked questions
    3. Use LLM to generate unique question
    4. Store question in DB
    5. Generate TTS audio
    6. Return question + audio URL
    """
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    metadata = session.session_metadata
    plan = metadata["interview_plan"]
    current_index = metadata["current_question_index"]
    
    # Check if interview complete
    if current_index >= len(plan) or current_index >= 12:
        # Finalize interview
        await finalize_interview(session, db)
        return {"is_last": True, "message": "Interview complete"}
    
    # Get previous questions to avoid repetition
    previous_questions = db.query(InterviewQuestion).filter(
        InterviewQuestion.session_id == session.id
    ).all()
    previous_texts = [q.question_text for q in previous_questions]
    
    # Generate question
    plan_item = plan[current_index]
    question_text = llm_service.generate_question(
        plan_item,
        session.candidate.job.jd_raw_text,
        session.candidate.resume_parsed_json,
        previous_texts
    )
    
    # Store question
    question = InterviewQuestion(
        session_id=session.id,
        index=current_index + 1,
        question_text=question_text,
        question_type=plan_item["type"],
        skill=plan_item.get("skill", "general"),
        difficulty=plan_item["difficulty"]
    )
    db.add(question)
    
    # Update index
    metadata["current_question_index"] = current_index + 1
    session.session_metadata = metadata
    db.commit()
    db.refresh(question)
    
    # Generate TTS audio
    speaker = metadata.get("speaker", "abhilash")
    audio_bytes = await speech_service.synthesize_speech(question_text, speaker)
    
    # Save audio file
    audio_path = f"uploads/audio/question_{question.id}.wav"
    with open(audio_path, "wb") as f:
        f.write(audio_bytes)
    
    return {
        "question_id": question.id,
        "question_text": question_text,
        "question_number": current_index + 1,
        "total_questions": len(plan),
        "audio_url": f"/uploads/audio/question_{question.id}.wav"
    }

@router.post("/{session_id}/submit-answer")
async def submit_answer(
    session_id: int,
    question_id: int,
    audio_file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Process candidate's audio answer
    
    Flow:
    1. Receive audio file
    2. Convert to text (STT)
    3. Evaluate answer (LLM)
    4. Store transcript + scores
    5. Save audio file
    """
    # Read audio file
    audio_bytes = await audio_file.read()
    
    # Transcribe
    transcript = await speech_service.transcribe_audio(audio_bytes)
    
    # Get question
    question = db.query(InterviewQuestion).filter(InterviewQuestion.id == question_id).first()
    
    # Evaluate answer
    evaluation = llm_service.evaluate_answer(
        question.question_text,
        transcript,
        question.question_type,
        question.skill
    )
    
    # Store answer
    answer = InterviewAnswer(
        question_id=question_id,
        answer_transcript_text=transcript,
        correctness_score=evaluation["correctness_score"],
        depth_score=evaluation["depth_score"],
        clarity_score=evaluation["clarity_score"],
        relevance_score=evaluation["relevance_score"],
        comment_text=evaluation["comment"]
    )
    db.add(answer)
    
    # Save audio
    audio_path = f"uploads/audio/answer_{question_id}.wav"
    with open(audio_path, "wb") as f:
        f.write(audio_bytes)
    answer.audio_file_path = audio_path
    
    db.commit()
    
    return {"status": "answer_submitted", "transcript": transcript}

async def finalize_interview(session: InterviewSession, db: Session):
    """
    Calculate final scores and generate report
    """
    # Get all questions and answers
    questions = db.query(InterviewQuestion).filter(
        InterviewQuestion.session_id == session.id
    ).all()
    
    answers_data = []
    for q in questions:
        if q.answer:
            answers_data.append({
                "correctness_score": q.answer.correctness_score,
                "depth_score": q.answer.depth_score,
                "clarity_score": q.answer.clarity_score,
                "relevance_score": q.answer.relevance_score
            })
    
    # Generate final report
    final_result = llm_service.finalize_interview(
        [{"id": q.id, "text": q.question_text} for q in questions],
        answers_data
    )
    
    # Update session
    session.status = InterviewStatus.COMPLETED
    session.ended_at = datetime.utcnow()
    session.final_score = final_result["overall_score"]
    session.final_recommendation = final_result["recommendation"]
    session.final_report_text = final_result["report"]
    
    db.commit()
```

---

### **Phase 8: Frontend Interview Room (Week 6-7)**

#### 8.1 Camera/Mic Access

**File: `frontend/src/pages/InterviewRoom.jsx`**
```jsx
import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'

export default function InterviewRoom() {
  const { sessionId } = useParams()
  const [videoStream, setVideoStream] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(null)
  
  const videoRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  
  // Get camera and mic on mount
  useEffect(() => {
    async function initMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720, facingMode: 'user' },
          audio: true
        })
        setVideoStream(stream)
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch (error) {
        console.error('Camera/mic access denied:', error)
        alert('Please allow camera and microphone access')
      }
    }
    initMedia()
    
    // Cleanup on unmount
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])
  
  // Start interview
  async function startInterview() {
    await interviewService.start(sessionId, 'abhilash')
    await getNextQuestion()
  }
  
  // Get next question
  async function getNextQuestion() {
    const response = await interviewService.getNextQuestion(sessionId)
    if (response.is_last) {
      // Interview complete
      alert('Interview completed!')
      return
    }
    setCurrentQuestion(response)
    
    // Play audio
    const audio = new Audio(response.audio_url)
    audio.play()
    
    // Show avatar speaking state
  }
  
  // Record answer
  function startRecording() {
    const recorder = new MediaRecorder(videoStream)
    audioChunksRef.current = []
    
    recorder.ondataavailable = (e) => {
      audioChunksRef.current.push(e.data)
    }
    
    recorder.start(1000)
    mediaRecorderRef.current = recorder
    setIsRecording(true)
  }
  
  async function stopRecording() {
    return new Promise((resolve) => {
      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        
        // Upload answer
        const formData = new FormData()
        formData.append('audio_file', blob)
        formData.append('question_id', currentQuestion.question_id)
        
        await interviewService.submitAnswer(sessionId, formData)
        
        setIsRecording(false)
        
        // Get next question
        await getNextQuestion()
        
        resolve()
      }
      mediaRecorderRef.current.stop()
    })
  }
  
  return (
    <div className="interview-room">
      {/* Video feed */}
      <video 
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="candidate-video"
      />
      
      {/* Avatar */}
      <div className="avatar-section">
        {/* Your avatar component */}
      </div>
      
      {/* Question */}
      {currentQuestion && (
        <div className="question-box">
          <p>{currentQuestion.question_text}</p>
          <span>Question {currentQuestion.question_number} of {currentQuestion.total_questions}</span>
        </div>
      )}
      
      {/* Controls */}
      <div className="controls">
        {!isRecording ? (
          <button onClick={startRecording}>🎤 Start Answer</button>
        ) : (
          <button onClick={stopRecording}>⏹️ Stop & Submit</button>
        )}
      </div>
    </div>
  )
}
```

---

### **Phase 9: Deployment (Week 8)**

#### 9.1 Backend Deployment (Render)

**File: `backend/render.yaml`**
```yaml
services:
  - type: web
    name: ai-interview-api
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn app.main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: interview_db
          property: connectionString
      - key: SECRET_KEY
        generateValue: true
      - key: GEMINI_API_KEY
        sync: false
      - key: SARVAM_API_KEY
        sync: false

databases:
  - name: interview_db
    databaseName: interview
    user: interview_user
```

#### 9.2 Frontend Deployment (Vercel)

**File: `frontend/vercel.json`**
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ],
  "env": {
    "VITE_API_URL": "https://your-backend.onrender.com"
  }
}
```

---

## 🎯 Development Timeline (8 Weeks)

| Week | Phase | Deliverables |
|------|-------|--------------|
| 1 | Setup + Auth | Backend running, Login/Signup working |
| 2 | Database + Parsing | Models defined, Resume parsing works |
| 3-4 | LLM Integration | Question generation, Answer evaluation |
| 4 | Speech Services | TTS and STT working |
| 5-6 | Interview Flow | Complete interview cycle functional |
| 6-7 | Frontend Polish | Professional UI, smooth UX |
| 8 | Deployment + Testing | Live production system |

---

## 💡 Key Design Patterns Used

### 1. **Service Layer Pattern**
```
Routes → Services → Database

Benefits:
- Separation of concerns
- Reusable business logic
- Easy to test
- Clean architecture
```

### 2. **Dependency Injection**
```python
def create_job(db: Session = Depends(get_db)):
    # db is automatically injected
```

### 3. **Repository Pattern** (via SQLAlchemy ORM)
```python
# Abstract database operations
db.query(User).filter(User.email == email).first()
```

### 4. **State Management** (Zustand)
```javascript
// Centralized state
const token = useAuthStore(state => state.token)
```

### 5. **Async/Await** (Non-blocking I/O)
```python
async def synthesize_speech(text: str):
    # Don't block other requests
```

---

## 🔒 Security Best Practices

1. **Password Hashing**: Never store plain passwords
2. **JWT Tokens**: Stateless authentication
3. **CORS Configuration**: Limit origins
4. **Input Validation**: Pydantic schemas
5. **SQL Injection Prevention**: ORM queries
6. **Rate Limiting**: Prevent abuse
7. **HTTPS Only**: Encrypt in transit
8. **Environment Variables**: Hide secrets

---

## 📊 Monitoring & Analytics

### Metrics to Track:
```
- Interviews completed per day
- Average interview duration
- Question distribution (type/difficulty)
- STT/TTS success rates
- LLM response times
- User satisfaction scores
- API error rates
```

### Tools:
- **Sentry**: Error tracking
- **PostHog**: Product analytics
- **LogRocket**: Session replay
- **Prometheus**: System metrics

---

## 🚀 Scaling Considerations

### When to Scale?

**Single Server (MVP):**
- Up to 1000 interviews/day
- Cost: ~$50/month

**Horizontal Scaling:**
- Load balancer + multiple backends
- Redis for session caching
- CDN for static assets
- Message queue for async tasks

**Database Optimization:**
- Indexing on frequently queried columns
- Connection pooling
- Read replicas for analytics

---

## 💰 Cost Breakdown (Monthly)

| Service | Usage | Cost |
|---------|-------|------|
| Render (Backend) | Starter | $7 |
| Vercel (Frontend) | Pro | $20 |
| PostgreSQL | 1GB | $7 |
| Gemini API | 50k requests | $0 (free tier) |
| Sarvam AI | 10k TTS/STT | ~$50 |
| **Total** | | **~$84/month** |

---

## 🎓 Learning Resources

### Backend (Python/FastAPI):
- FastAPI Docs: https://fastapi.tiangolo.com/
- SQLAlchemy Tutorial: https://docs.sqlalchemy.org/
- Real Python: https://realpython.com/

### Frontend (React):
- React Docs: https://react.dev/
- Vite Guide: https://vitejs.dev/guide/
- Tailwind CSS: https://tailwindcss.com/docs

### AI/LLM:
- Google AI Studio: https://ai.google.dev/
- Prompt Engineering Guide: https://www.promptingguide.ai/
- LangChain Docs: https://python.langchain.com/

---

## 🎯 Next-Level Features

Once MVP is working, consider:

1. **Multi-language Support**: Interview in Hindi, Tamil, etc.
2. **Video Analysis**: Detect body language, confidence
3. **Code Execution**: Run candidate's code in sandbox
4. **Live Interviews**: HR can join and ask questions
5. **Interview Scheduling**: Calendar integration
6. **Analytics Dashboard**: Detailed hiring insights
7. **API for Integrations**: Connect with ATS systems
8. **Mobile App**: Native iOS/Android apps

---

## 📝 Final Checklist

Before going live:

- [ ] All environment variables set
- [ ] Database backed up
- [ ] Error handling in place
- [ ] Logging configured
- [ ] Rate limiting enabled
- [ ] HTTPS configured
- [ ] Terms of Service page
- [ ] Privacy Policy page
- [ ] Contact/Support page
- [ ] Payment integration (if monetizing)
- [ ] Load testing completed
- [ ] Security audit done

---

## 🎉 Congratulations!

You now have a complete roadmap to build a production-ready AI Interview SaaS!

**Key Takeaways:**
1. Start simple (MVP first)
2. Use proven technologies
3. Focus on user experience
4. Test continuously
5. Deploy early, iterate fast
6. Monitor and improve

**Remember:** The best code is code that ships. Don't over-engineer in the beginning. Launch, learn, iterate!

---

## 📞 Questions?

Review the actual codebase for implementation details. Every file in this project follows the patterns described above.

**Good luck building! 🚀**
