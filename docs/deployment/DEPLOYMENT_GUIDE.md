# 🚀 Free Deployment Guide

## Overview

We'll deploy:
- **Frontend**: Vercel (Free)
- **Backend**: Render (Free)
- **Database**: Render PostgreSQL (Free)
- **File Storage**: Render Persistent Disk (Free)

## 📋 Prerequisites

1. GitHub account
2. Vercel account (sign up with GitHub)
3. Render account (sign up with GitHub)
4. Sarvam AI API key

---

## Part 1: Prepare the Project

### Step 1: Create Production Environment Files

Create `backend/.env.production`:
```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Sarvam AI API
SARVAM_API_KEY=your_sarvam_api_key_here
SARVAM_STT_URL=https://api.sarvam.ai/speech-to-text-translate
SARVAM_TTS_URL=https://api.sarvam.ai/text-to-speech

# Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# CORS
FRONTEND_URL=https://your-app.vercel.app

# Upload directory
UPLOAD_DIR=/opt/render/project/src/uploads
```

### Step 2: Update Backend for Production

Update `backend/app/config.py` to use PostgreSQL:
```python
import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./interview.db")
    
    # Use PostgreSQL in production
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    
    # ... rest of settings
```

### Step 3: Create Deployment Files

We'll create these files:
1. `backend/render.yaml` - Render configuration
2. `vercel.json` - Vercel configuration
3. `backend/Dockerfile` - Docker configuration (optional)

---

## Part 2: Deploy Backend to Render

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/your-repo.git
git push -u origin main
```

### Step 2: Create Render Account

1. Go to https://render.com
2. Sign up with GitHub
3. Authorize Render to access your repositories

### Step 3: Create PostgreSQL Database

1. Click "New +" → "PostgreSQL"
2. Name: `interview-db`
3. Database: `interview_db`
4. User: `interview_user`
5. Region: Choose closest to you
6. Plan: **Free**
7. Click "Create Database"
8. **Copy the Internal Database URL** (starts with `postgresql://`)

### Step 4: Create Web Service

1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `interview-backend`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: 
     ```bash
     pip install -r requirements.txt
     ```
   - **Start Command**: 
     ```bash
     uvicorn app.main:app --host 0.0.0.0 --port $PORT
     ```
   - **Plan**: **Free**

4. Add Environment Variables:
   - `DATABASE_URL`: (paste the Internal Database URL from Step 3)
   - `SARVAM_API_KEY`: your_sarvam_api_key
   - `SARVAM_STT_URL`: https://api.sarvam.ai/speech-to-text-translate
   - `SARVAM_TTS_URL`: https://api.sarvam.ai/text-to-speech
   - `GEMINI_API_KEY`: your_gemini_api_key
   - `FRONTEND_URL`: https://your-app.vercel.app (we'll update this later)
   - `UPLOAD_DIR`: /opt/render/project/src/uploads

5. Add Disk:
   - Click "Add Disk"
   - **Name**: `uploads`
   - **Mount Path**: `/opt/render/project/src/uploads`
   - **Size**: 1 GB (Free)

6. Click "Create Web Service"

7. Wait for deployment (5-10 minutes)

8. **Copy your backend URL**: `https://interview-backend-xxxx.onrender.com`

---

## Part 3: Deploy Frontend to Vercel

### Step 1: Update Frontend API URL

Update `frontend/src/api/client.js`:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://interview-backend-xxxx.onrender.com'
```

### Step 2: Create Vercel Account

1. Go to https://vercel.com
2. Sign up with GitHub
3. Authorize Vercel

### Step 3: Deploy Frontend

1. Click "Add New..." → "Project"
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. Add Environment Variables:
   - `VITE_API_BASE_URL`: `https://interview-backend-xxxx.onrender.com`

5. Click "Deploy"

6. Wait for deployment (2-3 minutes)

7. **Copy your frontend URL**: `https://your-app.vercel.app`

### Step 4: Update Backend CORS

Go back to Render:
1. Open your backend service
2. Go to "Environment"
3. Update `FRONTEND_URL` to your Vercel URL
4. Click "Save Changes"
5. Service will redeploy automatically

---

## Part 4: Initialize Database

### Option 1: Using Render Shell

1. Go to Render Dashboard → Your Backend Service
2. Click "Shell" tab
3. Run:
```bash
python -c "from app.database import init_db; init_db()"
```

### Option 2: Using Local Connection

1. Get External Database URL from Render
2. Update local `.env` with production database URL
3. Run locally:
```bash
cd backend
python -c "from app.database import init_db; init_db()"
```

---

## Part 5: Test Deployment

### Test Backend
```bash
curl https://interview-backend-xxxx.onrender.com/
```

Should return: `{"message": "Avatar Voice Interviewer API"}`

### Test Frontend
1. Open `https://your-app.vercel.app`
2. Should see the landing page
3. Try creating an account
4. Try creating a job
5. Try starting an interview

---

## 🎯 Final Configuration

### Backend URL
```
https://interview-backend-xxxx.onrender.com
```

### Frontend URL
```
https://your-app.vercel.app
```

### Database
```
PostgreSQL on Render (Free tier)
```

### File Storage
```
Render Persistent Disk (1 GB Free)
```

---

## 📊 Free Tier Limits

### Render (Backend)
- ✅ 750 hours/month (enough for 24/7)
- ✅ Spins down after 15 min inactivity
- ✅ First request after sleep: ~30 seconds
- ✅ 512 MB RAM
- ✅ 0.1 CPU

### Render PostgreSQL
- ✅ 1 GB storage
- ✅ Expires after 90 days (backup before!)
- ✅ 97 connections

### Render Disk
- ✅ 1 GB storage
- ✅ Persistent across deploys

### Vercel (Frontend)
- ✅ 100 GB bandwidth/month
- ✅ Unlimited deployments
- ✅ Automatic HTTPS
- ✅ Global CDN

---

## 🔧 Troubleshooting

### Backend won't start
- Check logs in Render dashboard
- Verify all environment variables are set
- Check `requirements.txt` has all dependencies

### Database connection fails
- Verify `DATABASE_URL` is correct
- Check if database is running
- Ensure using Internal Database URL (not External)

### CORS errors
- Verify `FRONTEND_URL` matches your Vercel URL
- Check backend CORS configuration
- Ensure no trailing slash in URLs

### File uploads fail
- Verify disk is mounted at `/opt/render/project/src/uploads`
- Check disk has space
- Verify `UPLOAD_DIR` environment variable

### Frontend can't reach backend
- Verify `VITE_API_BASE_URL` is correct
- Check backend is running
- Test backend URL directly

---

## 🚀 Deployment Checklist

- [ ] GitHub repository created
- [ ] Backend deployed to Render
- [ ] PostgreSQL database created
- [ ] Persistent disk added
- [ ] Environment variables configured
- [ ] Frontend deployed to Vercel
- [ ] CORS configured
- [ ] Database initialized
- [ ] Test account created
- [ ] Test interview completed
- [ ] Video upload/download tested

---

## 🔄 Updating Deployment

### Update Backend
```bash
git add .
git commit -m "Update backend"
git push
```
Render will auto-deploy.

### Update Frontend
```bash
git add .
git commit -m "Update frontend"
git push
```
Vercel will auto-deploy.

---

## 💰 Cost Optimization

### Keep Free Forever
1. **Render**: Service sleeps after 15 min → First request slow
2. **Database**: Backup before 90 days, recreate
3. **Vercel**: Stay under 100 GB bandwidth

### Upgrade Options (if needed)
- **Render Pro**: $7/month (no sleep, more resources)
- **Render PostgreSQL**: $7/month (persistent, more storage)
- **Vercel Pro**: $20/month (more bandwidth, analytics)

---

## 🎉 You're Live!

Your AI Interview Platform is now accessible worldwide at:
```
https://your-app.vercel.app
```

Share this URL with anyone to use your platform! 🚀
