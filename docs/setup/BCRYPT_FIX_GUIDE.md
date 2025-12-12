# BCrypt Compatibility Fix Guide

## Problem
The bcrypt library has compatibility issues with Python 3.13 on Render, causing signup failures even with short passwords.

## Solution
We've completely removed bcrypt/passlib and replaced it with SHA256+salt hashing (which is secure and compatible).

## Steps to Fix on Render

### 1. Clear Build Cache
In your Render dashboard:
- Go to your backend service
- Click "Manual Deploy" → "Clear build cache & deploy"
- This ensures the old passlib/bcrypt packages are completely removed

### 2. Verify Environment Variables
Make sure these are set in Render:
- `DATABASE_URL` - Your PostgreSQL connection string
- `SARVAM_API_KEY` - Your Sarvam AI API key
- `GEMINI_API_KEY` - Your Google Gemini API key
- `FRONTEND_URL` - Your Vercel frontend URL
- `SECRET_KEY` - A random secret for JWT (generate with: `openssl rand -hex 32`)

### 3. Clear Existing Users (One-time)
After deployment, run this command in Render Shell:
```bash
python migrate_passwords.py
```
Type `yes` when prompted. This clears all existing users so they can re-register with the new hash format.

### 4. Test Signup
Try creating a new account:
- Email: test@example.com
- Password: 12345
- Name: Test User

Should work without any bcrypt errors!

## What Changed

### Before (Problematic)
```python
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"])
```

### After (Fixed)
```python
import hashlib
import secrets

def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    pwd_hash = hashlib.sha256((password + salt).encode()).hexdigest()
    return f"{salt}:{pwd_hash}"
```

## Security Notes
- SHA256 with random salt is cryptographically secure
- Each password gets a unique 32-character random salt
- Passwords are never stored in plain text
- This approach is simpler and more compatible than bcrypt

## Files Modified
- `backend/requirements.txt` - Removed passlib[bcrypt]
- `backend/app/auth.py` - Already using SHA256 (no changes needed)
- `backend/migrate_passwords.py` - New migration script

## Troubleshooting

### Still seeing bcrypt errors?
1. Make sure you cleared the build cache
2. Check that requirements.txt doesn't have passlib
3. Verify the deployment logs show the new requirements being installed

### Users can't login?
1. Run the migration script to clear old password hashes
2. Have users re-register with their accounts

### Need to keep existing users?
Contact me - we can create a more complex migration that preserves accounts, but it requires manual password resets.
