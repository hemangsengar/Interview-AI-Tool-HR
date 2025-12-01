"""
Automatic cleanup script for old interview data.
Deletes interview folders (videos + audio) older than 90 days.

Run this script periodically (daily cron job recommended):
- Windows: Task Scheduler
- Linux: crontab -e → 0 2 * * * /path/to/python cleanup_old_interviews.py
"""
import os
import shutil
from datetime import datetime, timedelta
from pathlib import Path
from app.database import SessionLocal
from app.models import InterviewSession

# Configuration
RETENTION_DAYS = 90  # Keep interviews for 90 days
UPLOAD_DIR = Path("uploads")


def cleanup_old_interviews():
    """Delete interview data older than RETENTION_DAYS."""
    db = SessionLocal()
    
    try:
        cutoff_date = datetime.utcnow() - timedelta(days=RETENTION_DAYS)
        print(f"Cleaning up interviews older than {cutoff_date.strftime('%Y-%m-%d')}")
        
        # Find old completed interviews
        old_sessions = db.query(InterviewSession).filter(
            InterviewSession.ended_at < cutoff_date,
            InterviewSession.status == 'completed'
        ).all()
        
        deleted_count = 0
        freed_space_mb = 0
        
        for session in old_sessions:
            candidate = session.candidate
            candidate_name = candidate.name
            
            # Clean name for folder
            safe_name = "".join(c for c in candidate_name if c.isalnum() or c in (' ', '_')).strip()
            safe_name = safe_name.replace(' ', '_')
            
            candidate_folder = UPLOAD_DIR / safe_name
            
            if candidate_folder.exists():
                # Calculate folder size
                folder_size = sum(f.stat().st_size for f in candidate_folder.rglob('*') if f.is_file())
                folder_size_mb = folder_size / (1024 * 1024)
                
                # Delete entire candidate folder
                shutil.rmtree(candidate_folder)
                
                print(f"✓ Deleted folder: {safe_name} ({folder_size_mb:.2f} MB)")
                deleted_count += 1
                freed_space_mb += folder_size_mb
            
            # Clear video path in database
            session.video_file_path = None
            session.video_size_mb = None
        
        db.commit()
        
        print(f"\n✅ Cleanup completed!")
        print(f"   Deleted: {deleted_count} interview folders")
        print(f"   Freed space: {freed_space_mb:.2f} MB")
        
    except Exception as e:
        print(f"❌ Error during cleanup: {e}")
        db.rollback()
    finally:
        db.close()


def get_storage_stats():
    """Get current storage statistics."""
    if not UPLOAD_DIR.exists():
        print("No uploads directory found")
        return
    
    total_size = 0
    folder_count = 0
    file_count = 0
    
    for folder in UPLOAD_DIR.iterdir():
        if folder.is_dir():
            folder_count += 1
            for file in folder.rglob('*'):
                if file.is_file():
                    file_count += 1
                    total_size += file.stat().st_size
    
    total_size_mb = total_size / (1024 * 1024)
    total_size_gb = total_size_mb / 1024
    
    print(f"\n📊 Storage Statistics:")
    print(f"   Candidate folders: {folder_count}")
    print(f"   Total files: {file_count}")
    print(f"   Total size: {total_size_mb:.2f} MB ({total_size_gb:.2f} GB)")
    print(f"   Average per candidate: {total_size_mb/folder_count:.2f} MB" if folder_count > 0 else "")


if __name__ == "__main__":
    print("=" * 60)
    print("Interview Data Cleanup Script")
    print(f"Retention period: {RETENTION_DAYS} days")
    print("=" * 60)
    print()
    
    # Show current stats
    get_storage_stats()
    print()
    
    # Run cleanup
    cleanup_old_interviews()
    print()
    
    # Show updated stats
    get_storage_stats()
