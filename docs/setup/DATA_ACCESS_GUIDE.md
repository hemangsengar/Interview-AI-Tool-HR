# Data Access Guide - Interview System

## Overview
This guide explains how to access and view all data in your AI Interview System, from HR portal to candidate interviews.

---

## 🎯 Quick Access Points

### 1. **HR Dashboard** (Main Entry Point)
- **URL**: `http://localhost:5173/hr/jobs` (after login)
- **Login**: `http://localhost:5173/hr/login`
- **What you see**:
  - Total jobs created
  - Total candidates across all jobs
  - List of all jobs with candidate counts
  - Job codes for sharing with candidates

### 2. **Job Details Page**
- **Access**: Click "View Details" on any job in HR Dashboard
- **URL**: `http://localhost:5173/hr/jobs/{job_id}`
- **What you see**:
  - Complete job description
  - Must-have and good-to-have skills
  - **Full candidate list** with:
    - Name, Email
    - Resume download link
    - Interview score (0-100)
    - Recommendation (Strong/Medium/Weak/Reject)
    - Status (Shortlisted/Rejected/Pending)
    - "View" button to see interview details

### 3. **Interview Results Page**
- **Access**: Click "View" button next to any candidate
- **URL**: `http://localhost:5173/hr/interviews/{session_id}`
- **What you see**:
  - Candidate information
  - Job details
  - **All questions asked** (with audio playback)
  - **All answers given** (with transcripts and audio)
  - Individual scores for each answer:
    - Correctness (0-5)
    - Depth (0-5)
    - Clarity (0-5)
    - Relevance (0-5)
  - AI comments on each answer
  - **Final score** (0-100)
  - **Final recommendation**
  - **Complete interview report**
  - **Video download** (if recorded)

---

## 📊 Data Flow

```
HR Dashboard
    ↓
Job Details (Select a job)
    ↓
Candidate List (All candidates for that job)
    ↓
Interview Results (Click "View" on candidate)
    ↓
Complete Interview Data
```

---

## 🗄️ Database Access (Direct)

If you need to access the database directly:

### Location
- **File**: `backend/interview.db` (SQLite database)

### View with Tools
1. **DB Browser for SQLite** (Recommended)
   - Download: https://sqlitebrowser.org/
   - Open `backend/interview.db`

2. **Command Line**
   ```bash
   cd backend
   sqlite3 interview.db
   ```

### Key Tables
- `users` - HR users
- `jobs` - Job postings
- `candidates` - Candidate applications
- `interview_sessions` - Interview metadata
- `interview_questions` - Questions asked
- `interview_answers` - Answers with scores

---

## 📁 File Storage Structure

All uploaded files are organized by candidate name:

```
backend/uploads/
├── Candidate_Name_1/
│   ├── resume.pdf
│   ├── q01_question.wav
│   ├── q01_answer.wav
│   ├── q02_question.wav
│   ├── q02_answer.wav
│   └── interview_video_20251129_123456.webm
├── Candidate_Name_2/
│   └── ...
```

---

## 🔍 API Endpoints (For Advanced Users)

### Get All Jobs
```bash
GET http://localhost:8000/api/jobs
Headers: Authorization: Bearer {token}
```

### Get Candidates for a Job
```bash
GET http://localhost:8000/api/jobs/{job_id}/candidates
Headers: Authorization: Bearer {token}
```

### Get Interview Results
```bash
GET http://localhost:8000/api/interviews/{session_id}/results
```

### Download Resume
```bash
GET http://localhost:8000/api/candidates/{candidate_id}/resume
Headers: Authorization: Bearer {token}
```

### Download Interview Video
```bash
GET http://localhost:8000/api/interviews/{session_id}/video/download
Headers: Authorization: Bearer {token}
```

---

## 📋 Complete Data Checklist

For each candidate, you can access:

- ✅ **Personal Info**: Name, Email
- ✅ **Resume**: PDF download
- ✅ **Resume Analysis**: Parsed skills and experience (in database)
- ✅ **Interview Plan**: Generated questions plan (in session_metadata)
- ✅ **Questions**: All questions asked with audio
- ✅ **Answers**: All answers with transcripts and audio
- ✅ **Scores**: Individual scores for each answer
- ✅ **AI Feedback**: Comments on each answer
- ✅ **Final Score**: Overall performance (0-100)
- ✅ **Recommendation**: Strong/Medium/Weak/Reject
- ✅ **Final Report**: Complete AI-generated report
- ✅ **Video Recording**: Full interview video (if recorded)
- ✅ **Timestamps**: When interview started/ended

---

## 🚀 Quick Start to View Data

1. **Start the system**:
   ```bash
   # Terminal 1 - Backend
   cd backend
   python run.py

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

2. **Login as HR**:
   - Go to `http://localhost:5173/hr/login`
   - Use your HR credentials

3. **Navigate**:
   - Dashboard → Select Job → View Candidates → Click "View" on any candidate

4. **Download**:
   - Resume: Click "Download" in candidate row
   - Video: Click "Download Video" in interview results page

---

## 💡 Tips

- **Search**: Use browser's Ctrl+F to search within pages
- **Export**: You can copy data from tables or use browser's print-to-PDF
- **Bulk Access**: Use the database directly for bulk data export
- **Audio Files**: Located in `backend/uploads/{candidate_name}/`
- **Videos**: Also in `backend/uploads/{candidate_name}/`

---

## 🔧 Troubleshooting

### Can't see candidates?
- Make sure you're logged in as the HR who created the job
- Check if candidates have actually applied

### Can't download resume/video?
- Check `backend/uploads/` folder exists
- Verify file paths in database

### Need raw data?
- Use DB Browser for SQLite to export tables as CSV
- Or use Python script to query database

---

## 📞 Need More?

If you need custom reports or data exports, you can:
1. Query the SQLite database directly
2. Use the API endpoints programmatically
3. Create custom SQL queries for specific data needs

Example SQL query to get all interview scores:
```sql
SELECT 
    c.name,
    c.email,
    j.title as job_title,
    s.final_score,
    s.final_recommendation,
    s.status
FROM candidates c
JOIN jobs j ON c.job_id = j.id
LEFT JOIN interview_sessions s ON c.id = s.candidate_id
ORDER BY s.final_score DESC;
```
