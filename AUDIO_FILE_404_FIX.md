# 🔧 Audio File 404 Fix Guide (Render + Vercel Deployment)

## 🔴 Problem

Audio files (TTS question audio and candidate answer recordings) are returning **404 errors** when fetched from the API, even though they're being saved.

## 🎯 Root Causes

### 1. **Ephemeral Filesystem on Render**
- Render's free tier has a **temporary filesystem**
- Files are **lost on restart/redeploy**
- Audio files saved during interview disappear

### 2. **Absolute Paths in Database**
- Code was storing full paths like `/opt/render/project/src/uploads/John_Doe/q01.wav`
- These paths don't work when app restarts or moves

### 3. **Missing Persistent Disk Configuration**
- Without persistent disk, all uploads vanish

## ✅ Solutions Implemented

### Fix 1: Configure Persistent Disk in Render

**File: `backend/render.yaml`**

```yaml
services:
  - type: web
    envVars:
      - key: UPLOAD_DIR
        value: /opt/render/project/src/uploads  # ← Must match mountPath
    disk:
      name: uploads-disk
      mountPath: /opt/render/project/src/uploads  # ← Persistent storage
      sizeGB: 1  # Free tier: 1GB included
```

### Fix 2: Store Relative Paths in Database

**Changed in: `backend/app/routers/interviews.py`**

**Before (❌ Wrong):**
```python
audio_path = str(candidate_folder / audio_filename)
# Stores: /opt/render/project/src/uploads/John_Doe/q01.wav

answer = InterviewAnswer(
    audio_file_path=audio_path  # Absolute path - breaks on restart
)
```

**After (✅ Correct):**
```python
relative_audio_path = f"{safe_name}/{audio_filename}"
# Stores: John_Doe/q01.wav

answer = InterviewAnswer(
    audio_file_path=relative_audio_path  # Relative path - portable
)
```

### Fix 3: Enhanced Logging for Debugging

**Changed in: `backend/app/main.py`**

```python
@app.get("/uploads/{candidate_name}/{filename}")
async def serve_audio(candidate_name: str, filename: str):
    file_path = Path(settings.UPLOAD_DIR) / candidate_name / filename
    
    # Detailed logging to debug issues
    print(f"[SERVE AUDIO] Requested: /uploads/{candidate_name}/{filename}")
    print(f"[SERVE AUDIO] Looking for file at: {file_path}")
    print(f"[SERVE AUDIO] File exists: {file_path.exists()}")
    
    if not file_path.exists():
        print(f"[SERVE AUDIO] ERROR: File not found")
        raise HTTPException(404, detail=f"Audio file not found: {candidate_name}/{filename}")
    
    return FileResponse(file_path, media_type="audio/wav")
```

## 🚀 Deployment Steps

### Step 1: Verify Render Configuration

1. Go to your Render dashboard
2. Click on your backend service
3. Go to **"Disks"** tab
4. Verify you see: `uploads-disk` mounted at `/opt/render/project/src/uploads`
5. If not, you need to add it manually:
   - Click **"Add Disk"**
   - Name: `uploads-disk`
   - Mount Path: `/opt/render/project/src/uploads`
   - Size: 1 GB

### Step 2: Set Environment Variable

In Render dashboard → Environment:
```
UPLOAD_DIR=/opt/render/project/src/uploads
```

### Step 3: Deploy Updated Code

```bash
git add backend/render.yaml backend/app/routers/interviews.py backend/app/main.py
git commit -m "Fix: Audio files 404 - use persistent disk and relative paths"
git push origin main
```

Render will auto-deploy.

### Step 4: Test the Fix

1. Start a new interview
2. Check Render logs for:
   ```
   [ANSWER AUDIO] Saving to: /opt/render/project/src/uploads/John_Doe/q01_answer.wav
   [ANSWER AUDIO] Answer audio saved successfully
   ```

3. Try fetching audio:
   ```
   GET https://your-backend.onrender.com/uploads/John_Doe/q01_answer.wav
   ```

4. Should see in logs:
   ```
   [SERVE AUDIO] Requested: /uploads/John_Doe/q01_answer.wav
   [SERVE AUDIO] File exists: True
   [SERVE AUDIO] Serving file: ...
   ```

## 🔍 Troubleshooting

### Issue: Still getting 404 after deploy

**Check 1: Is disk mounted?**
```bash
# In Render shell (Dashboard → Shell)
ls -la /opt/render/project/src/uploads
# Should show: drwxr-xr-x (directory exists)
```

**Check 2: Are files being saved?**
```bash
# After an interview, check:
find /opt/render/project/src/uploads -name "*.wav"
# Should list audio files
```

**Check 3: Check environment variable**
```bash
echo $UPLOAD_DIR
# Should show: /opt/render/project/src/uploads
```

### Issue: Old interviews still have broken paths

Old database records have absolute paths. You have two options:

**Option A: Update existing records (SQL)**
```sql
-- Run in Render PostgreSQL dashboard
UPDATE interview_answers 
SET audio_file_path = REGEXP_REPLACE(
    audio_file_path, 
    '.*/uploads/', 
    ''
)
WHERE audio_file_path LIKE '%/uploads/%';
```

**Option B: Just let old ones fail**
- New interviews will work fine
- Old 404s are expected (files were lost anyway)

### Issue: Disk full (1GB limit exceeded)

**Check disk usage:**
```bash
du -sh /opt/render/project/src/uploads
```

**Solution: Implement cleanup**

Create a cleanup script:

```python
# backend/cleanup_old_audio.py
import os
from datetime import datetime, timedelta
from pathlib import Path

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")
MAX_AGE_DAYS = 30

def cleanup_old_files():
    """Delete audio files older than MAX_AGE_DAYS."""
    cutoff = datetime.now() - timedelta(days=MAX_AGE_DAYS)
    upload_path = Path(UPLOAD_DIR)
    
    for audio_file in upload_path.rglob("*.wav"):
        file_age = datetime.fromtimestamp(audio_file.stat().st_mtime)
        if file_age < cutoff:
            print(f"Deleting old file: {audio_file}")
            audio_file.unlink()

if __name__ == "__main__":
    cleanup_old_files()
```

**Run it as a cron job** (Render doesn't support cron on free tier, so use GitHub Actions):

```yaml
# .github/workflows/cleanup.yml
name: Cleanup Old Audio Files

on:
  schedule:
    - cron: '0 0 * * 0'  # Every Sunday at midnight
  workflow_dispatch:

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger cleanup endpoint
        run: |
          curl -X POST https://your-backend.onrender.com/admin/cleanup \
            -H "Authorization: Bearer ${{ secrets.ADMIN_TOKEN }}"
```

## 📊 Monitoring Disk Usage

Add an admin endpoint to check disk usage:

```python
# backend/app/main.py
import shutil

@app.get("/admin/disk-usage")
async def get_disk_usage():
    """Check disk usage of uploads directory."""
    total, used, free = shutil.disk_usage(settings.UPLOAD_DIR)
    
    return {
        "total_gb": total / (1024**3),
        "used_gb": used / (1024**3),
        "free_gb": free / (1024**3),
        "used_percent": (used / total) * 100
    }
```

## 📝 Best Practices Going Forward

1. ✅ **Always use relative paths** in database
2. ✅ **Test with disk persistence** before deploying
3. ✅ **Monitor disk usage** regularly
4. ✅ **Implement cleanup** for old files
5. ✅ **Consider cloud storage** (S3, Cloudinary) for production scale

## 🎯 Alternative: Use Cloud Storage (For Production)

For production with high traffic, consider using **Cloudinary** or **AWS S3**:

### Benefits:
- ✅ Unlimited storage (pay per GB)
- ✅ Global CDN (faster downloads)
- ✅ Automatic backups
- ✅ No server disk concerns

### Quick Setup with Cloudinary:

```bash
pip install cloudinary
```

```python
# backend/app/services/storage_service.py
import cloudinary
import cloudinary.uploader

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

def upload_audio(audio_bytes, filename):
    """Upload audio to Cloudinary."""
    result = cloudinary.uploader.upload(
        audio_bytes,
        resource_type="video",  # audio files use 'video' type
        folder="interview_audio",
        public_id=filename
    )
    return result['secure_url']  # Returns CDN URL
```

Then store the CDN URL in database instead of local path.

## 🎉 Summary

**What was fixed:**
1. ✅ Added persistent disk storage in Render
2. ✅ Changed to relative paths in database
3. ✅ Added detailed logging for debugging
4. ✅ Enhanced error messages

**What to do now:**
1. Push the changes to GitHub
2. Wait for Render auto-deploy
3. Test with a new interview
4. Check Render logs to confirm files are saved

Your audio files will now persist across restarts! 🎤✨
