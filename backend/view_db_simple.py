"""
Simple script to view database contents.
Run from backend folder: python view_db_simple.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app.database import SessionLocal
from app.models import User, Job, Candidate, InterviewSession
from sqlalchemy import inspect

def view_database():
    """View all data from database."""
    db = SessionLocal()
    
    try:
        print("\n" + "=" * 80)
        print("DATABASE CONTENTS")
        print("=" * 80)
        
        # View Users
        print("\n" + "-" * 80)
        print("USERS TABLE")
        print("-" * 80)
        users = db.query(User).all()
        if users:
            for user in users:
                print(f"\nID: {user.id}")
                print(f"Name: {user.name}")
                print(f"Email: {user.email}")
                print(f"Role: {user.role}")
                print(f"Created: {user.created_at}")
        else:
            print("(No users)")
        
        # View Jobs
        print("\n" + "-" * 80)
        print("JOBS TABLE")
        print("-" * 80)
        jobs = db.query(Job).all()
        if jobs:
            for job in jobs:
                print(f"\nID: {job.id}")
                print(f"Title: {job.title}")
                print(f"Job Code: {job.job_code}")
                print(f"Active: {job.is_active}")
                print(f"HR ID: {job.hr_id}")
                print(f"Must-have skills: {job.must_have_skills}")
                print(f"Created: {job.created_at}")
        else:
            print("(No jobs)")
        
        # View Candidates
        print("\n" + "-" * 80)
        print("CANDIDATES TABLE")
        print("-" * 80)
        candidates = db.query(Candidate).all()
        if candidates:
            for candidate in candidates:
                print(f"\nID: {candidate.id}")
                print(f"Name: {candidate.name}")
                print(f"Email: {candidate.email}")
                print(f"Phone: {candidate.phone}")
                print(f"Job ID: {candidate.job_id}")
                print(f"Resume: {candidate.resume_path}")
                print(f"Created: {candidate.created_at}")
        else:
            print("(No candidates)")
        
        # View Interview Sessions
        print("\n" + "-" * 80)
        print("INTERVIEW SESSIONS TABLE")
        print("-" * 80)
        sessions = db.query(InterviewSession).all()
        if sessions:
            for session in sessions:
                print(f"\nID: {session.id}")
                print(f"Session ID: {session.session_id}")
                print(f"Candidate ID: {session.candidate_id}")
                print(f"Status: {session.status}")
                print(f"Score: {session.overall_score}")
                print(f"Started: {session.started_at}")
                print(f"Completed: {session.completed_at}")
        else:
            print("(No interview sessions)")
        
        print("\n" + "=" * 80)
        print("END OF DATABASE")
        print("=" * 80 + "\n")
        
    except Exception as e:
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    view_database()
