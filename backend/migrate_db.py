"""
Simple database migration script to add new columns.
Run this to update your existing database.
"""
import sqlite3
import random
import string

def generate_job_code():
    """Generate a unique 6-character job code."""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

def migrate():
    conn = sqlite3.connect('interview.db')
    cursor = conn.cursor()
    
    print("Starting database migration...")
    
    # Check if job_code column exists
    cursor.execute("PRAGMA table_info(jobs)")
    columns = [col[1] for col in cursor.fetchall()]
    
    if 'job_code' not in columns:
        print("Adding job_code column to jobs table...")
        cursor.execute("ALTER TABLE jobs ADD COLUMN job_code VARCHAR(10)")
        
        # Generate codes for existing jobs
        cursor.execute("SELECT id FROM jobs")
        job_ids = cursor.fetchall()
        for (job_id,) in job_ids:
            code = generate_job_code()
            cursor.execute("UPDATE jobs SET job_code = ? WHERE id = ?", (code, job_id))
        print(f"Generated job codes for {len(job_ids)} existing jobs")
    
    if 'is_active' not in columns:
        print("Adding is_active column to jobs table...")
        cursor.execute("ALTER TABLE jobs ADD COLUMN is_active INTEGER DEFAULT 1")
        cursor.execute("UPDATE jobs SET is_active = 1 WHERE is_active IS NULL")
        print("Added is_active column")
    
    # Check candidates table
    cursor.execute("PRAGMA table_info(candidates)")
    columns = [col[1] for col in cursor.fetchall()]
    
    if 'resume_file_path' not in columns:
        print("Adding resume_file_path column to candidates table...")
        cursor.execute("ALTER TABLE candidates ADD COLUMN resume_file_path VARCHAR(500)")
        print("Added resume_file_path column")
    
    conn.commit()
    conn.close()
    
    print("✅ Migration completed successfully!")
    print("\nYou can now:")
    print("1. Create jobs with unique job codes")
    print("2. Candidates can enter job codes to apply")
    print("3. HR can download candidate resumes")
    print("4. HR can delete candidate history")

if __name__ == "__main__":
    migrate()
