# 🚨 FIX VERCEL 404 - IMMEDIATE STEPS

## Current Issue

You see: `404: NOT_FOUND` after signup
URL: `gen-ai-f8pblfnbc-akshat2003agarwal-3019s-projects.vercel.app/#/jobs`

**Cause**: Vercel hasn't deployed the HashRouter code yet

## IMMEDIATE FIX (3 Steps - 5 Minutes)

### Step 1: Push Latest Code to GitHub

```bash
git add .
git commit -m "Fix: HashRouter and PostgreSQL setup"
git push
```

### Step 2: Set Vercel Environment Variable

1. Go to https://vercel.com/dashboard
2. Select your project: `gen-ai-f8pblfnbc-akshat2003agarwal-3019s-projects`
3. Click "Settings" → "Environment Variables"
4. Add or update:
   ```
   Key: VITE_API_BASE_URL
   Value: https://genai-7vr6.onrender.com
   ```
5. Select: "Production", "Preview", "Development"
6. Click "Save"

### Step 3: Force Vercel Redeploy

1. Go to "Deployments" tab
2. Click "..." on the LATEST deployment
3. Click "Redeploy"
4. **UNCHECK "Use existing Build Cache"** ← CRITICAL!
5. Click "Redeploy"
6. Wait 2 minutes

### Step 4: Test

1. Go to your Vercel URL
2. **Clear browser cache**: Ctrl+Shift+Delete → Clear all
3. **Hard refresh**: Ctrl+Shift+R
4. Click "Sign Up"
5. Create account: newtest@example.com / password123
6. Should redirect to: `/#/hr/jobs`
7. Dashboard loads ✓

## Why This Happens

Vercel caches builds aggressively. When you:
1. Push new code
2. Vercel auto-deploys
3. But uses cached build (old code)
4. Result: 404 errors

**Solution**: Force redeploy with cache cleared

## Verify Deployment

After redeployment, check:

1. **Vercel Build Logs**:
   - Should show: "Building in /frontend"
   - Should show: "Output directory: dist"
   - Should show: "Build completed"

2. **Test URL**:
   - Visit: `https://your-app.vercel.app/`
   - Should load homepage
   - Click signup → Should work

3. **Check Console**:
   - Open DevTools (F12)
   - Console tab
   - Should see: "🔑 Token from localStorage: EXISTS"
   - Should see: "📡 Request to: /api/jobs"

## If Still 404

### Option 1: Check Vercel Root Directory

1. Vercel → Settings → General
2. Root Directory: Should be `frontend`
3. If not, set it to `frontend`
4. Save and redeploy

### Option 2: Delete and Recreate Vercel Project

1. Vercel → Settings → General
2. Scroll to bottom → "Delete Project"
3. Create new project:
   - Import from GitHub
   - Select your repo
   - **Root Directory**: `frontend`
   - **Framework**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - Environment Variables:
     ```
     VITE_API_BASE_URL=https://genai-7vr6.onrender.com
     ```
4. Deploy
5. Will work! ✓

## Expected Behavior After Fix

### Signup Flow
1. Fill form
2. POST /api/auth/signup → 201 Created ✓
3. Token saved ✓
4. Redirect to `/#/hr/jobs` ✓
5. Dashboard loads ✓
6. No 404! ✓

### URL Format
- Login: `https://your-app.vercel.app/#/hr/login`
- Signup: `https://your-app.vercel.app/#/hr/signup`
- Dashboard: `https://your-app.vercel.app/#/hr/jobs`

The `#` is normal and required!

## Quick Test

To verify everything works:
1. Open browser in incognito mode
2. Go to your Vercel URL
3. Sign up with fresh email
4. Should work without 404

---

**PUSH TO GITHUB, SET VERCEL ENV VAR, REDEPLOY (UNCHECK CACHE)!** 🚀
