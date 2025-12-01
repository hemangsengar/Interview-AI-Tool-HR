# 🚀 Quick Deploy (5 Minutes)

## Step 1: Push to GitHub (2 min)

```bash
# Initialize git (if not already)
git init
git add .
git commit -m "Ready for deployment"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy Backend on Render (2 min)

1. Go to https://render.com → Sign up with GitHub
2. Click "New +" → "Web Service"
3. Select your repository
4. Settings:
   - **Name**: `interview-backend`
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add Environment Variables:
   - `SARVAM_API_KEY`: your_key_here
   - `GEMINI_API_KEY`: your_key_here
   - `FRONTEND_URL`: https://your-app.vercel.app (update later)
6. Click "Create Web Service"
7. **Copy your backend URL**: `https://interview-backend-xxxx.onrender.com`

## Step 3: Deploy Frontend on Vercel (1 min)

1. Go to https://vercel.com → Sign up with GitHub
2. Click "New Project" → Import your repository
3. Settings:
   - **Framework**: Vite
   - **Root Directory**: `frontend`
4. Environment Variables:
   - `VITE_API_BASE_URL`: `https://interview-backend-xxxx.onrender.com`
5. Click "Deploy"
6. **Copy your frontend URL**: `https://your-app.vercel.app`

## Step 4: Update Backend CORS

1. Go back to Render → Your backend service
2. Environment → Update `FRONTEND_URL` to your Vercel URL
3. Save (auto-redeploys)

## ✅ Done!

Your app is live at: `https://your-app.vercel.app`

---

## 🎯 First Time Setup

After deployment, create your first HR account:
1. Go to your app URL
2. Click "Sign Up"
3. Create HR account
4. Start creating jobs!

---

## 📝 Notes

- **First request slow?** Render free tier sleeps after 15 min
- **Need database?** Render auto-creates SQLite (or add PostgreSQL)
- **File uploads?** Add Render Disk (see full guide)
- **Custom domain?** Configure in Vercel settings

---

## 🔄 Updates

Push to GitHub → Auto-deploys to both Render and Vercel!

```bash
git add .
git commit -m "Update"
git push
```

That's it! 🎉
