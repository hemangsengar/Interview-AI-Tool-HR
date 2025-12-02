# 🚨 VERCEL 404 FIX - Step by Step

## Current Situation
- ✅ Backend working: 200 OK, 400 Bad Request (normal)
- ❌ Frontend: 404 NOT_FOUND when navigating to /hr/jobs
- ❌ Vercel is NOT configured to serve from frontend folder

## The Problem
Your Vercel project is looking in the **root directory** instead of the **frontend directory**.

## Solution: Configure Vercel (2 Options)

### Option 1: Via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your project

2. **Go to Settings**
   - Click "Settings" tab
   - Click "General" in sidebar

3. **Set Root Directory**
   - Find "Root Directory" section
   - Click "Edit"
   - Enter: `frontend`
   - Click "Save"

4. **Verify Build Settings**
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

5. **Redeploy**
   - Go to "Deployments" tab
   - Click "..." on latest deployment
   - Click "Redeploy"
   - **UNCHECK** "Use existing Build Cache"
   - Click "Redeploy"

6. **Wait 1-2 minutes** for deployment

7. **Test**
   - Go to your Vercel URL
   - Try signup/login
   - Should work! ✓

### Option 2: Delete and Recreate Project

If Option 1 doesn't work:

1. **Delete Current Vercel Project**
   - Vercel Dashboard → Your project
   - Settings → General
   - Scroll to bottom → "Delete Project"

2. **Create New Project**
   - Click "New Project"
   - Import your GitHub repo
   - **IMPORTANT**: Set Root Directory to `frontend`
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Add Environment Variables**
   - `VITE_API_BASE_URL`: Your Render backend URL

4. **Deploy**
   - Click "Deploy"
   - Wait 1-2 minutes

## How to Verify It's Working

### Test 1: Check if Vercel serves files
Visit: `https://your-app.vercel.app/test.html`
- Should show: "✅ Vercel is Working!"
- If 404: Root directory is wrong

### Test 2: Check if routing works
Visit: `https://your-app.vercel.app/hr/login`
- Should show: Login page
- If 404: vercel.json not working

### Test 3: Check if signup works
1. Go to signup page
2. Create account
3. Should redirect to dashboard
4. If 404: React Router issue

## Why This Happens

Your project structure:
```
/
├── backend/
├── frontend/     ← Your app is here!
│   ├── src/
│   ├── dist/
│   ├── package.json
│   └── vercel.json
└── README.md
```

Vercel is looking in `/` but your app is in `/frontend/`

## Current Logs Explained

```
POST /api/auth/signup → 400 Bad Request
```
This means: Email already registered (you signed up before)

```
POST /api/auth/login → 200 OK
```
This means: Login successful, token received

```
404 NOT_FOUND
```
This means: Vercel can't find /hr/jobs route

## After Fixing

Expected flow:
1. User logs in → 200 OK ✓
2. Frontend receives token ✓
3. React Router navigates to /hr/jobs ✓
4. Vercel serves index.html ✓
5. React Router loads dashboard ✓
6. No 404! ✓

## Troubleshooting

### Still getting 404 after setting Root Directory?

**Check Vercel Build Logs:**
1. Deployments → Latest deployment
2. Click "Building" section
3. Should show: "Building in /frontend"
4. Should show: "Output directory: dist"
5. If not, Root Directory is wrong

**Check Vercel Deployment URL:**
1. Go to your Vercel URL
2. Open browser DevTools (F12)
3. Go to Network tab
4. Try to navigate to /hr/jobs
5. Check the 404 response:
   - If it's HTML with Vercel error: Routing issue
   - If it's JSON: Backend issue

### 400 Bad Request on Signup?

This is normal! It means:
- Email already registered
- Try different email
- Or login with existing account

### Backend not responding?

Check Render:
1. Render Dashboard → Your service
2. Check "Logs" tab
3. Should show: "Application startup complete"
4. If not, redeploy with clear cache

## Quick Checklist

- [ ] Push changes to GitHub
- [ ] Go to Vercel Dashboard
- [ ] Settings → General
- [ ] Set Root Directory to `frontend`
- [ ] Save
- [ ] Deployments → Redeploy (uncheck cache)
- [ ] Wait 1-2 minutes
- [ ] Test: Visit /test.html
- [ ] Test: Visit /hr/login
- [ ] Test: Signup/Login
- [ ] Should work! ✓

## If Nothing Works

**Nuclear Option:**
1. Delete Vercel project
2. Create new project
3. Set Root Directory to `frontend` BEFORE first deploy
4. Deploy
5. Will work! ✓

---

**The fix is simple: Set Vercel Root Directory to `frontend`**

**This is a Vercel configuration issue, not a code issue!**
