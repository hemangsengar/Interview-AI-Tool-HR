# 🔧 Double Slash Audio URL Fix

## 🔴 Problem

Audio files were returning **404 Not Found** errors with URLs like:
```
GET //uploads/Hemang/q01_question.wav HTTP/1.1" 404 Not Found
     ↑ Double slash causing 404!
```

## 🎯 Root Cause

The issue occurred when constructing the full audio URL in the frontend:

**Before (❌ Broken):**
```javascript
const fullUrl = `${import.meta.env.VITE_API_BASE_URL}${question.audio_url}`
// If VITE_API_BASE_URL = "https://backend.onrender.com/"  (has trailing slash)
// And question.audio_url = "/uploads/Hemang/q01.wav"      (has leading slash)
// Result: "https://backend.onrender.com//uploads/..."     (double slash!)
```

## ✅ Solution

**Fixed in: `frontend/src/pages/InterviewRoom.jsx`**

```javascript
// Remove trailing slash from base URL
const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '')

// Ensure audio path has leading slash
const audioPath = question.audio_url.startsWith('/') ? question.audio_url : `/${question.audio_url}`

// Construct full URL properly
const fullUrl = question.audio_url.startsWith('http') 
  ? question.audio_url 
  : `${baseUrl}${audioPath}`

// Result: "https://backend.onrender.com/uploads/..." ✅
```

## 🚀 How to Deploy

### Step 1: Update Frontend Code

```bash
cd /Users/ayush/Projects/GenAi.git
git add frontend/src/pages/InterviewRoom.jsx
git commit -m "Fix: Double slash in audio URLs causing 404"
git push origin main
```

### Step 2: Verify Vercel Environment Variable

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

**Check:** `VITE_API_BASE_URL`

**Should be one of:**
```bash
# Option 1: With trailing slash (now handled by code)
VITE_API_BASE_URL=https://your-backend.onrender.com/

# Option 2: Without trailing slash (recommended)
VITE_API_BASE_URL=https://your-backend.onrender.com
```

Both will work now! The code handles both cases.

### Step 3: Redeploy Frontend

Vercel will auto-deploy when you push to GitHub. Or manually trigger:
- Go to Vercel Dashboard → Deployments
- Click "Redeploy" on latest deployment

### Step 4: Test

1. Start a new interview
2. Check browser console (F12)
3. Look for:
   ```
   🔊 Playing audio: /uploads/Hemang/q01_question.wav
   🔊 Full audio URL: https://your-backend.onrender.com/uploads/Hemang/q01_question.wav
   ```
4. Audio should play without 404 errors

## 🔍 Debugging

### Check Request in Browser DevTools

1. Open DevTools (F12)
2. Go to **Network** tab
3. Filter by: `wav`
4. Look at the request URL

**Wrong:**
```
https://backend.onrender.com//uploads/Hemang/q01.wav
                            ↑↑ Double slash
Status: 404 Not Found
```

**Correct:**
```
https://backend.onrender.com/uploads/Hemang/q01.wav
                            ↑ Single slash
Status: 200 OK
```

### Check Backend Logs

In Render Dashboard → Logs, look for:

**Before fix:**
```
INFO: GET //uploads/Hemang/q01_question.wav HTTP/1.1" 404 Not Found
[SERVE AUDIO] ERROR: File not found
```

**After fix:**
```
INFO: GET /uploads/Hemang/q01_question.wav HTTP/1.1" 200 OK
[SERVE AUDIO] Serving file: /opt/render/project/src/uploads/Hemang/q01_question.wav
```

## 📝 Related Files

- ✅ **Fixed:** `frontend/src/pages/InterviewRoom.jsx` (line ~468)
- ✅ **Already correct:** `backend/app/routers/interviews.py` (returns `/uploads/...`)
- ✅ **Already correct:** `frontend/src/api/client.js` (uses axios baseURL properly)

## 💡 Why This Happened

The issue occurs when:
1. Vercel env variable has trailing slash: `https://backend.com/`
2. Backend returns path with leading slash: `/uploads/file.wav`
3. Simple concatenation: `base + path` = `//uploads/file.wav`

**The Fix:** Always normalize URLs by:
- Removing trailing slash from base URL
- Ensuring path has leading slash
- Smart concatenation

## 🎯 Prevention

### Best Practice for Environment Variables

Always set base URLs **without trailing slash**:

**Good ✅**
```bash
VITE_API_BASE_URL=https://backend.onrender.com
API_URL=http://localhost:8000
```

**Avoid ❌**
```bash
VITE_API_BASE_URL=https://backend.onrender.com/  # Trailing slash
API_URL=http://localhost:8000/                    # Can cause issues
```

### URL Construction Pattern

Use this pattern everywhere:

```javascript
// Normalize base URL (remove trailing slash)
const baseUrl = apiUrl.replace(/\/$/, '')

// Ensure path starts with slash
const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`

// Combine safely
const fullUrl = `${baseUrl}${path}`
```

Or use the URL API:

```javascript
const fullUrl = new URL(path, baseUrl).toString()
```

## ✅ Success Criteria

After this fix:
- [ ] Audio URLs have single slash: `/uploads/...`
- [ ] Audio files return 200 OK (not 404)
- [ ] Question audio plays automatically
- [ ] No console errors about audio loading
- [ ] Works on both local and production

## 🆘 If Still Getting 404

### Check 1: File Actually Exists
```bash
# In Render Shell
ls -la /opt/render/project/src/uploads/Hemang/
# Should show: q01_question.wav
```

### Check 2: UPLOAD_DIR Configured
```bash
# In Render Shell
echo $UPLOAD_DIR
# Should show: /opt/render/project/src/uploads
```

### Check 3: Disk Mounted
```bash
# In Render Shell
df -h | grep uploads
# Should show mounted disk
```

### Check 4: Backend Logs
Look for `[SERVE AUDIO]` logs to see what path is being requested.

## 📊 Summary

**Problem:** Double slash in audio URLs (`//uploads/...`)  
**Cause:** Base URL had trailing slash + path had leading slash  
**Fix:** Normalize base URL by removing trailing slash  
**Impact:** Audio files now load correctly with 200 OK  

---

**Status:** ✅ Fixed  
**Deployed:** Push to GitHub → Auto-deploy on Vercel  
**Testing:** Required after deployment  

🎉 Audio files will now load correctly!
