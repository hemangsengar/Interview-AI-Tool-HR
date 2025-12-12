# SQLite Database Access Guide

## Database Location
**File**: `backend/interview.db`

---

## Method 1: DB Browser for SQLite (⭐ RECOMMENDED - Easiest)

### Installation
1. Download from: **https://sqlitebrowser.org/**
2. Install the application
3. Open DB Browser for SQLite

### Usage
1. Click **"Open Database"**
2. Navigate to your project folder
3. Select `backend/interview.db`
4. You'll see all tables in the left sidebar

### Features
- ✅ Visual table browser
- ✅ Run custom SQL queries
- ✅ Edit data directly
- ✅ Export to CSV/JSON
- ✅ View table relationships
- ✅ No coding required!

---

## Method 2: Python Database Viewer (⭐ WORKS IMMEDIATELY)

### Interactive Menu-Based Viewer
```bash
python view_database.py
```

This gives you an interactive menu with options:
1. View all HR users
2. View all jobs
3. View all candidates
4. View interview statistics
5. View recent interviews
6. View candidate details (by ID)
7. Interactive SQL mode (run custom queries)
8. Export all data to CSV

**No installation needed - uses Python's built-in sqlite3!**

---

## Method 3: Export to CSV/Excel

### Run the Export Script
```bash
python export_data.py
```

This creates a `database_exports/` folder with:
- `users.csv` - All HR users
- `jobs.csv` - All job postings
- `candidates.csv` - All candidates
- `interview_sessions.csv` - Interview metadata
- `interview_questions.csv` - All questions asked
- `interview_answers.csv` - All answers with scores
- `interview_report.csv` - Combined report

**Open these CSV files in Excel for easy viewing!**

---

## Method 4: Python Script (Custom Queries)

Create a file `query_db.py`:

```python
import sqlite3

conn = sqlite3.connect('backend/interview.db')
cursor = conn.cursor()

# Your custom query
cursor.execute("""
    SELECT 
        c.name,
        c.email,
        j.title,
        s.final_score,
        s.final_recommendation
    FROM candidates c
    JOIN jobs j ON c.job_id = j.id
    LEFT JOIN interview_sessions s ON c.id = s.candidate_id
    WHERE s.final_score > 70
    ORDER BY s.final_score DESC
""")

for row in cursor.fetchall():
    print(row)

conn.close()
```

Run: `python query_db.py`

---

## Database Schema

### Main Tables

**users** - HR users
- id, email, hashed_password, full_name, created_at

**jobs** - Job postings
- id, hr_user_id, title, jd_raw_text, job_code, must_have_skills, good_to_have_skills, is_active, created_at

**candidates** - Candidate applications
- id, job_id, name, email, resume_file_path, resume_parsed_json, status, created_at

**interview_sessions** - Interview metadata
- id, candidate_id, status, started_at, ended_at, final_score, final_recommendation, final_report_text, session_metadata, video_file_path

**interview_questions** - Questions asked
- id, session_id, index, question_text, question_type, skill, difficulty

**interview_answers** - Answers with scores
- id, question_id, answer_transcript_text, audio_file_path, correctness_score, depth_score, clarity_score, relevance_score, comment_text

---

## Useful SQL Queries

### 1. Get All Candidates with Interview Results
```sql
SELECT 
    c.name,
    c.email,
    j.title as job,
    s.final_score,
    s.final_recommendation,
    s.status
FROM candidates c
JOIN jobs j ON c.job_id = j.id
LEFT JOIN interview_sessions s ON c.id = s.candidate_id
ORDER BY s.final_score DESC;
```

### 2. Get Interview Questions and Answers
```sql
SELECT 
    c.name as candidate,
    q.question_text,
    a.answer_transcript_text,
    a.correctness_score,
    a.depth_score,
    a.clarity_score,
    a.relevance_score
FROM interview_questions q
JOIN interview_sessions s ON q.session_id = s.id
JOIN candidates c ON s.candidate_id = c.id
LEFT JOIN interview_answers a ON q.id = a.question_id
WHERE c.id = 1;  -- Replace with candidate ID
```

### 3. Get Average Scores by Job
```sql
SELECT 
    j.title,
    COUNT(s.id) as total_interviews,
    AVG(s.final_score) as avg_score,
    COUNT(CASE WHEN s.final_recommendation = 'Strong' THEN 1 END) as strong_count
FROM jobs j
LEFT JOIN candidates c ON j.id = c.job_id
LEFT JOIN interview_sessions s ON c.id = s.candidate_id
WHERE s.status = 'Completed'
GROUP BY j.id;
```

### 4. Get Top Performers
```sql
SELECT 
    c.name,
    j.title,
    s.final_score,
    s.final_recommendation
FROM interview_sessions s
JOIN candidates c ON s.candidate_id = c.id
JOIN jobs j ON c.job_id = j.id
WHERE s.status = 'Completed'
ORDER BY s.final_score DESC
LIMIT 10;
```

### 5. Get Detailed Answer Breakdown
```sql
SELECT 
    q.question_text,
    a.correctness_score,
    a.depth_score,
    a.clarity_score,
    a.relevance_score,
    (a.correctness_score + a.depth_score + a.clarity_score + a.relevance_score) / 4.0 as avg_score,
    a.comment_text
FROM interview_answers a
JOIN interview_questions q ON a.question_id = q.id
WHERE q.session_id = 1;  -- Replace with session ID
```

### 6. Get Candidates Without Interviews
```sql
SELECT 
    c.name,
    c.email,
    j.title,
    c.created_at
FROM candidates c
JOIN jobs j ON c.job_id = j.id
LEFT JOIN interview_sessions s ON c.id = s.candidate_id
WHERE s.id IS NULL;
```

---

## Quick Reference

| Task | Method | Command |
|------|--------|---------|
| Visual browsing | DB Browser | Open `interview.db` in app |
| Interactive viewer | Python script | `python view_database.py` ⭐ |
| Export to Excel | Python script | `python export_data.py` |
| Custom queries | Python | Create script with `sqlite3` |

---

## Tips

1. **Backup First**: Copy `interview.db` before making changes
2. **Read-Only**: Use `SELECT` queries to avoid accidental changes
3. **Excel Export**: Use `export_data.py` for easy Excel viewing
4. **DB Browser**: Best for exploring and understanding data structure
5. **Command Line**: Best for quick queries and automation

---

## Troubleshooting

### "Database is locked"
- Close the backend server first
- Or use read-only mode: `sqlite3 -readonly interview.db`

### "No such table"
- Make sure you're in the correct directory
- Check if database file exists: `dir backend\interview.db`

### "Command not found: sqlite3"
- Install SQLite: `winget install SQLite.SQLite`
- Or use DB Browser (no installation needed)

---

## Next Steps

1. **Try DB Browser first** - Easiest way to explore
2. **Run quick_db_queries.bat** - See your data instantly
3. **Export to CSV** - Open in Excel for analysis
4. **Write custom queries** - For specific reports

Enjoy exploring your data! 🎉
