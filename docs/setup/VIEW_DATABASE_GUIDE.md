# 📊 How to View Your Database Data

## Your PostgreSQL Database

**Connection Details:**
- Host: `dpg-d4nc22buibrs739a1vs0-a.oregon-postgres.render.com`
- Port: `5432`
- Database: `interview_db_cy4i`
- Username: `interview_user`
- Password: `z3WjOmLZhr6HVfnYwpQA4OlTpqvEIxrN`

## Method 1: Using Python Script (Easiest)

**Step 1: Install psycopg2**
```bash
cd backend
pip install psycopg2-binary
```

**Step 2: Run the script**
```bash
python view_db_simple.py
```

This will show all data from all tables!

## Method 2: Using pgAdmin (Best GUI)

**Step 1: Download pgAdmin**
- Go to: https://www.pgadmin.org/download/
- Download and install

**Step 2: Connect to Database**
1. Open pgAdmin
2. Right-click "Servers" → "Register" → "Server"
3. **General tab:**
   - Name: `Render Interview DB`
4. **Connection tab:**
   - Host: `dpg-d4nc22buibrs739a1vs0-a.oregon-postgres.render.com`
   - Port: `5432`
   - Database: `interview_db_cy4i`
   - Username: `interview_user`
   - Password: `z3WjOmLZhr6HVfnYwpQA4OlTpqvEIxrN`
5. Click "Save"

**Step 3: View Data**
1. Expand: Servers → Render Interview DB → Databases → interview_db_cy4i
2. Expand: Schemas → public → Tables
3. Right-click any table (users, jobs, candidates, interview_sessions)
4. Select "View/Edit Data" → "All Rows"

## Method 3: Using DBeaver (Free & Powerful)

**Step 1: Download DBeaver**
- Go to: https://dbeaver.io/download/
- Download Community Edition (free)

**Step 2: Connect**
1. Open DBeaver
2. Click "New Database Connection" (plug icon)
3. Select "PostgreSQL"
4. Click "Next"
5. Enter connection details:
   - Host: `dpg-d4nc22buibrs739a1vs0-a.oregon-postgres.render.com`
   - Port: `5432`
   - Database: `interview_db_cy4i`
   - Username: `interview_user`
   - Password: `z3WjOmLZhr6HVfnYwpQA4OlTpqvEIxrN`
6. Click "Test Connection"
7. Click "Finish"

**Step 3: Browse Data**
1. In left sidebar, expand your connection
2. Expand: Databases → interview_db_cy4i → Schemas → public → Tables
3. Double-click any table to view data

## Method 4: Using Render Dashboard

**Step 1: Go to Render**
1. Visit: https://render.com/dashboard
2. Click on your PostgreSQL database: `interview-db`

**Step 2: Connect via Shell**
1. Click "Connect" → "External Connection"
2. Copy the connection string
3. Use any PostgreSQL client

## Method 5: Using psql Command Line

**Step 1: Install PostgreSQL Client**
- Windows: Download from https://www.postgresql.org/download/
- Mac: `brew install postgresql`
- Linux: `sudo apt-get install postgresql-client`

**Step 2: Connect**
```bash
psql postgresql://interview_user:z3WjOmLZhr6HVfnYwpQA4OlTpqvEIxrN@dpg-d4nc22buibrs739a1vs0-a.oregon-postgres.render.com/interview_db_cy4i
```

**Step 3: View Data**
```sql
-- List all tables
\dt

-- View users
SELECT * FROM users;

-- View jobs
SELECT * FROM jobs;

-- View candidates
SELECT * FROM candidates;

-- View interview sessions
SELECT * FROM interview_sessions;

-- Count records
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM jobs;

-- Exit
\q
```

## Your Database Tables

1. **users** - HR users who create jobs
   - id, name, email, password_hash, role, created_at

2. **jobs** - Job postings
   - id, title, jd_raw_text, job_code, must_have_skills, good_to_have_skills, is_active, hr_id, created_at

3. **candidates** - People who applied
   - id, name, email, phone, resume_path, job_id, created_at

4. **interview_sessions** - Interview records
   - id, session_id, candidate_id, status, overall_score, started_at, completed_at

## Quick Commands

### View all users:
```sql
SELECT id, name, email, role FROM users;
```

### View all jobs:
```sql
SELECT id, title, job_code, is_active FROM jobs;
```

### View candidates with job info:
```sql
SELECT c.name, c.email, j.title 
FROM candidates c 
JOIN jobs j ON c.job_id = j.id;
```

### View interview results:
```sql
SELECT 
  c.name, 
  i.status, 
  i.overall_score, 
  i.completed_at 
FROM interview_sessions i 
JOIN candidates c ON i.candidate_id = c.id;
```

## Recommended Tools

1. **pgAdmin** - Best for beginners, full-featured GUI
2. **DBeaver** - Powerful, supports multiple databases
3. **Python script** - Quick view without installing anything
4. **psql** - Command line, for advanced users

## Security Note

⚠️ **Keep your database credentials secure!**
- Don't share the password
- Don't commit it to git
- Only use secure connections

---

**Choose any method above to view your database!** 📊
