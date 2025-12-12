# 📊 How to View Your Interview Data

## 🚀 Quick Start (3 Easy Ways)

### 1️⃣ Python Database Viewer (Easiest - Works Now!)
```bash
python view_database.py
```
**Interactive menu with:**
- View all users, jobs, candidates
- Interview statistics
- Recent interviews
- Candidate details
- Run custom SQL queries

---

### 2️⃣ Export to Excel/CSV
```bash
python export_data.py
```
Creates `database_exports/` folder with CSV files:
- `users.csv`
- `jobs.csv`
- `candidates.csv`
- `interview_sessions.csv`
- `interview_questions.csv`
- `interview_answers.csv`
- `interview_report.csv` (combined report)

**Open in Excel for easy viewing!**

---

### 3️⃣ DB Browser for SQLite (Best for Exploration)
1. Download: https://sqlitebrowser.org/
2. Install and open
3. Open `backend/interview.db`
4. Browse visually with GUI

---

## 📁 What Data Can You See?

### Through Frontend (HR Portal)
- Login: `http://localhost:5173/hr/login`
- Dashboard → Jobs → Candidates → Interview Results
- Download resumes and videos
- View complete interview transcripts

### Through Database (Direct Access)
- All HR users
- All job postings with codes
- All candidates with scores
- Interview questions and answers
- Individual answer scores (correctness, depth, clarity, relevance)
- AI feedback comments
- Final recommendations
- Video file paths
- Audio file paths

---

## 📂 File Locations

**Database**: `backend/interview.db`

**Uploaded Files**: `backend/uploads/`
```
backend/uploads/
├── Candidate_Name/
│   ├── resume.pdf
│   ├── q01_question.wav
│   ├── q01_answer.wav
│   ├── q02_question.wav
│   ├── q02_answer.wav
│   └── interview_video_TIMESTAMP.webm
```

---

## 💡 Recommended Workflow

1. **Quick Check**: Run `python view_database.py` → Option 3 (View all candidates)
2. **Detailed Analysis**: Run `python export_data.py` → Open CSVs in Excel
3. **Deep Dive**: Use DB Browser for SQLite to explore relationships
4. **Custom Reports**: Use interactive SQL mode in `view_database.py`

---

## 📖 Full Documentation

- **DATABASE_ACCESS_GUIDE.md** - Complete database access guide
- **DATA_ACCESS_GUIDE.md** - Frontend data access guide
- **SARVAM_STT_FIX_SUMMARY.md** - Technical fix for 30s audio limit

---

## 🎯 Common Tasks

### See all candidates with scores
```bash
python view_database.py
# Choose option 3
```

### Export everything to Excel
```bash
python export_data.py
# Open database_exports/*.csv in Excel
```

### View specific candidate details
```bash
python view_database.py
# Choose option 6
# Enter candidate ID
```

### Run custom SQL query
```bash
python view_database.py
# Choose option 7
# Enter your SQL query
```

---

## ✅ No Installation Required!

All Python scripts use built-in libraries:
- `sqlite3` (built into Python)
- `csv` (built into Python)
- `pathlib` (built into Python)

Just run and go! 🚀
