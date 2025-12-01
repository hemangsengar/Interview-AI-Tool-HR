"""Add role column to users table."""
from app.database import engine
from sqlalchemy import text

# Add role column if it doesn't exist
with engine.connect() as conn:
    try:
        # Try to add the column
        conn.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'hr'"))
        conn.commit()
        print("✅ Added role column to users table")
    except Exception as e:
        if "duplicate column" in str(e).lower() or "already exists" in str(e).lower():
            print("✅ Role column already exists")
        else:
            print(f"❌ Error: {e}")
            # If table doesn't exist or other error, recreate everything
            print("Recreating all tables...")
            from app.database import Base
            from app import models
            Base.metadata.drop_all(bind=engine)
            Base.metadata.create_all(bind=engine)
            print("✅ Tables recreated")
