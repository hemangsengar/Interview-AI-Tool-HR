"""
Migration script to handle password hash format changes.
This script will clear all users so they can re-register with the new hash format.
Run this once after deploying the new authentication system.
"""
from app.database import SessionLocal, engine
from app.models import Base, User

def migrate_passwords():
    """Clear all users - they will need to re-register."""
    db = SessionLocal()
    try:
        # Delete all users
        deleted_count = db.query(User).delete()
        db.commit()
        print(f"✓ Cleared {deleted_count} users from database")
        print("✓ Users will need to re-register with the new system")
        return True
    except Exception as e:
        print(f"✗ Migration failed: {e}")
        db.rollback()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    print("Starting password migration...")
    print("This will clear all existing users.")
    
    response = input("Continue? (yes/no): ")
    if response.lower() == 'yes':
        if migrate_passwords():
            print("\n✓ Migration completed successfully!")
        else:
            print("\n✗ Migration failed!")
    else:
        print("Migration cancelled.")
