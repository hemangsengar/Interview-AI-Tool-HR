# 🚀 AI Interview Platform - Deployment

## 🎯 Quick Start

Choose your deployment speed:

1. **⚡ 5-Minute Deploy**: [QUICK_DEPLOY.md](QUICK_DEPLOY.md)
2. **📚 Complete Guide**: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
3. **✅ Checklist**: [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)

---

## 🌐 Deployment Architecture

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  Users → https://your-app.vercel.app           │
│           (Frontend - Vercel)                   │
│                    ↓                            │
│  API → https://backend.onrender.com            │
│         (Backend - Render)                      │
│                    ↓                            │
│  Database → PostgreSQL (Render)                 │
│  Files → Persistent Disk (Render)              │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 💰 Cost: 100% FREE

| Service | Free Tier | Limits |
|---------|-----------|--------|
| **Vercel** (Frontend) | ✅ Free Forever | 100 GB bandwidth/month |
| **Render** (Backend) | ✅ Free Forever | 750 hours/month, sleeps after 15 min |
| **PostgreSQL** (Database) | ✅ Free 90 days | 1 GB storage |
| **Disk** (Files) | ✅ Free Forever | 1 GB storage |

**Total Cost**: $0/month 🎉

---

## 📋 What You Need

1. **GitHub Account** (free)
2. **Vercel Account** (free, sign up with GitHub)
3. **Render Account** (free, sign up with GitHub)
4. **API Keys**:
   - Sarvam AI API Key ([Get it here](https://www.sarvam.ai/))
   - Google Gemini API Key ([Get it here](https://makersuite.google.com/app/apikey))

---

## 🚀 Deployment Steps

### Step 1: Prepare Code (1 minute)

```bash
# Make sure you're in the project root
cd your-project-folder

# Check if git is initialized
git status

# If not initialized:
git init
```

### Step 2: Push to GitHub (2 minutes)

```bash
# Add all files
git add .

# Commit
git commit -m "Ready for deployment"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy Backend (3 minutes)

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Select your repository
5. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add Environment Variables:
   ```
   SARVAM_API_KEY=your_sarvam_key
   GEMINI_API_KEY=your_gemini_key
   FRONTEND_URL=https://your-app.vercel.app
   ```
7. Click "Create Web Service"
8. **Copy your backend URL**

### Step 4: Deploy Frontend (2 minutes)

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "New Project"
4. Import your repository
5. Configure:
   - **Framework**: Vite
   - **Root Directory**: `frontend`
6. Add Environment Variable:
   ```
   VITE_API_BASE_URL=https://your-backend.onrender.com
   ```
7. Click "Deploy"
8. **Copy your frontend URL**

### Step 5: Update CORS (1 minute)

1. Go back to Render
2. Open your backend service
3. Environment → Update `FRONTEND_URL` to your Vercel URL
4. Save (auto-redeploys)

### ✅ Done!

Your app is live! 🎉

---

## 🧪 Test Your Deployment

1. Open your frontend URL
2. Create an HR account
3. Create a job posting
4. Register a candidate
5. Start an interview
6. Complete the interview
7. Download the video

---

## 🔄 Making Updates

After deployment, any push to GitHub auto-deploys:

```bash
# Make your changes
git add .
git commit -m "Update feature"
git push

# Render and Vercel auto-deploy! ✨
```

---

## 📊 Monitoring

### Check if services are running:

**Backend Health**:
```
https://your-backend.onrender.com/
```
Should return: `{"message": "Avatar Voice Interviewer API"}`

**Frontend**:
```
https://your-app.vercel.app
```
Should show the landing page

### View Logs:

- **Render**: Dashboard → Your Service → Logs tab
- **Vercel**: Dashboard → Your Project → Deployments → View Logs

---

## 🐛 Troubleshooting

### Backend is slow on first request
**Cause**: Render free tier sleeps after 15 minutes of inactivity
**Solution**: Normal behavior. First request takes ~30 seconds to wake up.

### CORS errors
**Cause**: Frontend URL not configured in backend
**Solution**: Update `FRONTEND_URL` in Render environment variables

### Database errors
**Cause**: Database not initialized
**Solution**: Run database initialization (see full guide)

### File upload fails
**Cause**: No persistent disk
**Solution**: Add disk in Render (see full guide)

---

## 🎯 Next Steps

### Optional Enhancements:

1. **Custom Domain**: Configure in Vercel settings
2. **PostgreSQL Database**: Add in Render for persistence
3. **Persistent Disk**: Add in Render for file uploads
4. **Monitoring**: Set up error tracking
5. **Analytics**: Add Google Analytics

### Upgrade Options (if needed):

- **Render Pro**: $7/month (no sleep, better performance)
- **Vercel Pro**: $20/month (more bandwidth, analytics)

---

## 📚 Documentation

- [Quick Deploy Guide](QUICK_DEPLOY.md) - 5-minute setup
- [Complete Deployment Guide](DEPLOYMENT_GUIDE.md) - Detailed instructions
- [Deployment Checklist](DEPLOYMENT_CHECKLIST.md) - Step-by-step checklist
- [Main README](README.md) - Project overview

---

## 🆘 Need Help?

1. Check the troubleshooting section
2. Review Render/Vercel logs
3. Verify all environment variables
4. Test backend URL directly
5. Check GitHub repository settings

---

## 🎉 Success!

Your AI Interview Platform is now live and accessible worldwide!

**Share your URL**: `https://your-app.vercel.app`

Anyone can now:
- Create HR accounts
- Post jobs
- Register candidates
- Conduct AI interviews
- Review results
- Download interview videos

**Congratulations on deploying your AI Interview Platform!** 🚀
