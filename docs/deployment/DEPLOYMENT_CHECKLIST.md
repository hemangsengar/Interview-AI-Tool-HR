# ✅ Deployment Checklist

## Pre-Deployment

- [ ] All features tested locally
- [ ] Environment variables documented
- [ ] API keys ready (Sarvam, Gemini)
- [ ] GitHub account created
- [ ] Repository created on GitHub

## GitHub Setup

- [ ] Code pushed to GitHub
- [ ] `.gitignore` configured
- [ ] Sensitive files excluded (.env, uploads, etc.)
- [ ] README.md updated

## Backend Deployment (Render)

- [ ] Render account created
- [ ] Web service created
- [ ] Build command configured
- [ ] Start command configured
- [ ] Environment variables added:
  - [ ] `SARVAM_API_KEY`
  - [ ] `GEMINI_API_KEY`
  - [ ] `FRONTEND_URL`
  - [ ] `DATABASE_URL` (if using PostgreSQL)
  - [ ] `UPLOAD_DIR`
- [ ] Persistent disk added (for file uploads)
- [ ] Service deployed successfully
- [ ] Backend URL copied

## Database Setup

- [ ] Database created (SQLite auto or PostgreSQL)
- [ ] Database initialized
- [ ] Test data added (optional)

## Frontend Deployment (Vercel)

- [ ] Vercel account created
- [ ] Project imported from GitHub
- [ ] Framework preset: Vite
- [ ] Root directory: `frontend`
- [ ] Environment variables added:
  - [ ] `VITE_API_BASE_URL`
- [ ] Deployment successful
- [ ] Frontend URL copied

## Configuration

- [ ] Backend CORS updated with frontend URL
- [ ] Frontend API URL points to backend
- [ ] Both services redeployed

## Testing

- [ ] Frontend loads successfully
- [ ] Backend API responds
- [ ] Can create HR account
- [ ] Can login
- [ ] Can create job
- [ ] Can register candidate
- [ ] Can start interview
- [ ] Video recording works
- [ ] Audio works (TTS/STT)
- [ ] Interview completion works
- [ ] Results page shows correctly
- [ ] Video download works

## Post-Deployment

- [ ] Custom domain configured (optional)
- [ ] SSL certificate active (auto on Vercel/Render)
- [ ] Monitoring setup (optional)
- [ ] Backup strategy planned
- [ ] Documentation updated with live URLs

## Maintenance

- [ ] Auto-deploy configured (GitHub → Render/Vercel)
- [ ] Error monitoring setup
- [ ] Database backup scheduled
- [ ] API key rotation planned

---

## 🚨 Common Issues

### Backend won't start
- Check Render logs
- Verify all environment variables
- Check requirements.txt

### CORS errors
- Verify FRONTEND_URL matches Vercel URL
- No trailing slashes
- Redeploy backend after changes

### Database errors
- Check DATABASE_URL format
- Verify database is running
- Initialize database tables

### File upload fails
- Verify disk is mounted
- Check UPLOAD_DIR path
- Ensure disk has space

---

## 📊 Monitoring

### Check Backend Health
```
https://your-backend.onrender.com/
```

### Check Frontend
```
https://your-app.vercel.app
```

### View Logs
- **Render**: Dashboard → Service → Logs
- **Vercel**: Dashboard → Project → Deployments → View Logs

---

## 🎉 Success!

When all checkboxes are ✅, your app is live and ready for users!

Share your URL: `https://your-app.vercel.app`
