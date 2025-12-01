# 🚀 Quick Start Guide

## Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

## Setup & Run

### 1. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python migrate_db.py  # Run migration (already done)
python run.py
```

Backend will run on: `http://localhost:8000`

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Frontend will run on: `http://localhost:5173`

## 🎯 Testing the New Features

### Test Job Code System:
1. Login as HR: `http://localhost:5173/hr/login`
2. Create a new job
3. Note the 6-character job code (e.g., "ABC123")
4. Open new browser tab: `http://localhost:5173/candidate`
5. Enter the job code
6. Apply for the job

### Test Resume Download:
1. After candidate applies, go to HR dashboard
2. Click on the job
3. Click "Download" button next to candidate's resume

### Test Delete Candidate:
1. In job details page
2. Click "Delete" button next to a candidate
3. Confirm deletion

### Test Interview Improvements:
1. Start an interview as a candidate
2. Notice:
   - Video recording is active
   - No question count shown
   - Greeting message is spoken
   - "End Interview Early" button available
   - Beautiful split-screen UI

## 🔑 Default HR Credentials
If you need to create an HR account:
- Go to: `http://localhost:5173/hr/signup`
- Create account with any email/password

## 📝 Important Notes

- Make sure both backend and frontend are running
- Allow camera and microphone permissions for interviews
- Job codes are case-insensitive
- Resumes are saved in `backend/uploads/resumes/`

## 🎨 What to Look For

### HR Dashboard:
- Beautiful gradient background
- Stats cards at the top
- Job codes displayed on each job card
- Modern glass-morphism design

### Candidate Entry:
- Gradient background with animations
- Large code input field
- Smooth transitions

### Interview Room:
- Split screen: Avatar left, Your video right
- Recording indicator
- No question numbers visible
- End interview button
- Professional avatar with suit

### Job Details:
- Download resume buttons
- Delete candidate buttons
- Beautiful table design
- Confirmation modals

---

**Enjoy your improved AI Interview System! 🎉**
