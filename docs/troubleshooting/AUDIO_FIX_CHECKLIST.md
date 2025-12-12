# ✅ Audio File Fix - Quick Deployment Checklist

## 📋 Pre-Deployment Checklist

- [ ] **Code Changes Committed**
  - `backend/render.yaml` - Updated disk name
  - `backend/app/routers/interviews.py` - Fixed to use relative paths
  - `backend/app/main.py` - Added detailed logging

## 🚀 Render Dashboard Setup

### Step 1: Verify Persistent Disk
1. [ ] Go to [Render Dashboard](https://dashboard.render.com/)
2. [ ] Click on your backend service
3. [ ] Go to **"Disks"** tab
4. [ ] Check if `uploads-disk` exists at `/opt/render/project/src/uploads`
5. [ ] If not, click **"Add Disk"**:
   - Name: `uploads-disk`
   - Mount Path: `/opt/render/project/src/uploads`
   - Size: 1 GB
   - Click "Save"

### Step 2: Verify Environment Variables
1. [ ] Go to **"Environment"** tab
2. [ ] Verify these variables exist:
   ```
   UPLOAD_DIR=/opt/render/project/src/uploads
   DATABASE_URL=postgresql://...
   GEMINI_API_KEY=your_key
   SARVAM_API_KEY=your_key
   FRONTEND_URL=https://your-app.vercel.app
   ```

## 📤 Deploy

```bash
# In your terminal
cd /Users/ayush/Projects/GenAi.git

# Stage changes
git add backend/render.yaml
git add backend/app/routers/interviews.py
git add backend/app/main.py
git add AUDIO_FILE_404_FIX.md

# Commit
git commit -m "Fix: Audio 404 - persistent disk + relative paths"

# Push (triggers auto-deploy on Render)
git push origin main
```

## 🧪 Testing After Deploy

### Wait for Render Deploy (5-10 minutes)
- [ ] Watch Render dashboard for "Deploy succeeded ✓"

### Test 1: Check Logs
1. [ ] Go to Render → Your Service → **Logs**
2. [ ] Look for:
   ```
   ✓ Database ready!
   [RATE LIMITER] Cleaned up old entries
   ```

### Test 2: Start a Test Interview
1. [ ] Go to your Vercel frontend
2. [ ] Create a test job
3. [ ] Apply as candidate
4. [ ] Start interview
5. [ ] Answer a question

### Test 3: Check Audio Logs
In Render logs, you should see:
```
[ANSWER AUDIO] Question ID: 1, Index: 0
[ANSWER AUDIO] Saving to: /opt/render/project/src/uploads/John_Doe/q00_answer.wav
[ANSWER AUDIO] Filename: q00_answer.wav
[ANSWER AUDIO] Answer audio saved successfully
```

### Test 4: Try Fetching Audio
1. [ ] In browser console (F12), check network tab
2. [ ] Look for request to: `https://your-backend.onrender.com/uploads/...`
3. [ ] Should return **200 OK** (not 404)

### Test 5: Check File Persistence
1. [ ] Go to Render Dashboard → Your Service → **Shell**
2. [ ] Run:
   ```bash
   ls -la /opt/render/project/src/uploads
   ```
3. [ ] Should see candidate folders with .wav files

## 🔴 If Still Getting 404

### Debug Step 1: Check if files are being saved
```bash
# In Render Shell
find /opt/render/project/src/uploads -name "*.wav" | head -5
```

If **no files found**:
- Problem: Files not being saved
- Check: `UPLOAD_DIR` env variable is set correctly
- Check: Disk is mounted at correct path

If **files found**:
- Problem: Serving issue
- Continue to Debug Step 2

### Debug Step 2: Check file permissions
```bash
# In Render Shell
ls -la /opt/render/project/src/uploads/*/
```

Should show: `-rw-r--r--` (readable by all)

If permissions wrong:
```bash
chmod -R 755 /opt/render/project/src/uploads
```

### Debug Step 3: Check actual request
In Render logs, search for: `[SERVE AUDIO]`

Should see:
```
[SERVE AUDIO] Requested: /uploads/John_Doe/q00_answer.wav
[SERVE AUDIO] Looking for file at: /opt/render/project/src/uploads/John_Doe/q00_answer.wav
[SERVE AUDIO] File exists: True
[SERVE AUDIO] Serving file: ...
```

If `File exists: False`:
- Path mismatch issue
- Check that audio_file_path in database matches actual file location

## 📊 Monitor Disk Usage

### Check how much space you're using:
```bash
# In Render Shell
du -sh /opt/render/project/src/uploads
```

### If approaching 1GB limit:
- Implement cleanup (see AUDIO_FILE_404_FIX.md)
- Or upgrade to paid plan for more storage
- Or use cloud storage (Cloudinary, S3)

## 🆘 Emergency Rollback

If deployment breaks something:

```bash
# Rollback to previous commit
git revert HEAD
git push origin main
```

Or in Render Dashboard:
- Go to "Deploys" tab
- Find previous successful deploy
- Click "Redeploy"

## ✨ Success Criteria

You're done when:
- [ ] New interviews successfully save audio
- [ ] Audio files return 200 OK (not 404)
- [ ] Files persist after Render restart/redeploy
- [ ] Render logs show successful file saves
- [ ] Frontend plays audio without errors

## 📞 Support

If still stuck:
1. Check Render logs for errors
2. Check browser console for network errors
3. Verify disk is mounted: `df -h | grep uploads`
4. Check database: audio_file_path should be like `John_Doe/q00.wav` (relative, not absolute)

---

**Estimated Time:** 15-20 minutes  
**Difficulty:** ⭐⭐ (Intermediate)  
**Impact:** 🎯 High (Fixes critical audio feature)

Good luck! 🚀
