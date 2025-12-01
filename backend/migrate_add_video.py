"""
Migration script to add video fields to interview_sessions table.
Run this once to update existing database.
"""
import sqlite3

DB_PATH = "interview.db"

def migrate():
    """Add video fields to interview_sessions table."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Add video_file_path column
        cursor.execute("""
            ALTER TABLE interview_sessions 
            ADD COLUMN video_file_path VARCHAR(500)
        """)
        print("✓ Added video_file_path column")
    except sqlite3.OperationalError as e:
        if "duplicate column" in str(e).lower():
            print("✓ video_file_path column already exists")
        else:
            raise
    
    try:
        # Add video_size_mb column
        cursor.execute("""
            ALTER TABLE interview_sessions 
            ADD COLUMN video_size_mb FLOAT
        """)
        print("✓ Added video_size_mb column")
    except sqlite3.OperationalError as e:
        if "duplicate column" in str(e).lower():
            print("✓ video_size_mb column already exists")
        else:
            raise
    
    try:
        # Add video_uploaded_at column
        cursor.execute("""
            ALTER TABLE interview_sessions 
            ADD COLUMN video_uploaded_at DATETIME
        """)
        print("✓ Added video_uploaded_at column")
    except sqlite3.OperationalError as e:
        if "duplicate column" in str(e).lower():
            print("✓ video_uploaded_at column already exists")
        else:
            raise
    
    conn.commit()
    conn.close()
    
    print("\n✅ Migration completed successfully!")
    print("Database is ready for video storage.")

if __name__ == "__main__":
    migrate()
