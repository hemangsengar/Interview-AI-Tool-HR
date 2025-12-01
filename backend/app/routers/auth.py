"""Authentication routes."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from ..schemas import UserSignup, UserLogin, Token, UserResponse
from ..auth import hash_password, verify_password, create_access_token

router = APIRouter()


@router.post("/test-signup")
async def test_signup(data: dict):
    """Test endpoint to see what data is being received."""
    print(f"[TEST SIGNUP] Raw data received: {data}")
    return {"received": data}


@router.get("/migrate-db")
async def migrate_database(db: Session = Depends(get_db)):
    """Migrate database - add role column if missing."""
    from sqlalchemy import text
    try:
        # Try to add the role column
        db.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'hr'"))
        db.commit()
        return {"status": "success", "message": "Role column added"}
    except Exception as e:
        error_msg = str(e).lower()
        if "duplicate column" in error_msg or "already exists" in error_msg:
            return {"status": "success", "message": "Role column already exists"}
        else:
            # Recreate all tables
            from ..database import engine, Base
            from .. import models
            Base.metadata.drop_all(bind=engine)
            Base.metadata.create_all(bind=engine)
            return {"status": "success", "message": "Database recreated with new schema"}


@router.post("/signup", response_model=Token, status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserSignup, db: Session = Depends(get_db)):
    """Register a new HR user."""
    try:
        print(f"[SIGNUP] Received data: name={user_data.name}, email={user_data.email}")
        
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create new user
        print(f"[SIGNUP] Hashing password...")
        hashed_password = hash_password(user_data.password)
        
        print(f"[SIGNUP] Creating user object...")
        new_user = User(
            name=user_data.name,
            email=user_data.email,
            password_hash=hashed_password,
            role="hr"  # Default role is HR
        )
        
        print(f"[SIGNUP] Adding to database...")
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        print(f"[SIGNUP] User created with ID: {new_user.id}")
        
        # Create access token (sub must be string!)
        access_token = create_access_token(data={"sub": str(new_user.id)})
        
        print(f"[SIGNUP] Token created successfully")
        return Token(access_token=access_token)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[SIGNUP] ERROR: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Signup failed: {str(e)}"
        )


@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Login HR user."""
    # Find user
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Verify password
    if not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Create access token (sub must be string!)
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return Token(access_token=access_token)


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_db)):
    """Get current user information."""
    return current_user
