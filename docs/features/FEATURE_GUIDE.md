# 🎯 Feature Guide - How to Use Everything

## 🔐 For HR Users

### 1. Creating a Job with Job Code

**Steps:**
1. Login to HR portal
2. Click "✨ Create New Job" button
3. Fill in the form:
   - Job Title (e.g., "Senior Python Developer")
   - Job Description
   - Must-Have Skills (comma-separated)
   - Good-to-Have Skills (comma-separated)
4. Click "Create Job & Generate Code"
5. **Your job code will be displayed** (e.g., "ABC123")

**What you'll see:**
- Job card with gradient background
- Job code badge in blue/indigo gradient
- "Active" status indicator
- Skills displayed as tags
- Candidate count

**Pro Tip:** Copy the job code and share it with candidates via email or messaging.

---

### 2. Sharing Job Code with Candidates

**How to share:**
```
Email Template:
--------------
Hi [Candidate Name],

Thank you for your interest in the [Job Title] position.

To apply, please:
1. Visit: [Your Website URL]/candidate
2. Enter Job Code: ABC123
3. Complete the application

Looking forward to your application!

Best regards,
[Your Name]
```

---

### 3. Viewing Candidates

**Steps:**
1. From HR Dashboard, click on a job card
2. You'll see the Job Details page with:
   - Job information at top
   - Candidates table below

**Candidate Table Shows:**
- Name
- Email
- Resume (Download button)
- Score (if interview completed)
- Recommendation (Strong/Medium/Weak/Reject)
- Status (Pending/Shortlisted/Rejected)
- Actions (View/Delete buttons)

---

### 4. Downloading Candidate Resumes

**Steps:**
1. Go to Job Details page
2. Find the candidate in the table
3. Click "📄 Download" button in Resume column
4. Resume file will download to your computer

**File naming:**
- Format: `YYYYMMDD_HHMMSS_CandidateName_resume.pdf`
- Example: `20231127_143022_John_Doe_resume.pdf`

---

### 5. Deleting Candidate History

**Steps:**
1. Go to Job Details page
2. Find the candidate you want to delete
3. Click red "Delete" button
4. Confirmation modal appears
5. Click "Yes, Delete" to confirm

**What gets deleted:**
- Candidate record
- Interview session
- All questions and answers
- Resume file from disk
- All related data

**Warning:** This action cannot be undone!

---

### 6. Reviewing Interview Results

**Steps:**
1. Go to Job Details page
2. Click "View" button next to a candidate
3. Interview Results page shows:
   - Overall score
   - Recommendation
   - Each question asked
   - Candidate's answer
   - Scores for each answer
   - AI feedback/comments

---

## 👤 For Candidates

### 1. Entering Job Code

**Steps:**
1. Go to the landing page
2. Click "🎤 Join Interview" button
3. You'll see the Candidate Entry page
4. Enter the 6-character job code (e.g., "ABC123")
5. Click "Continue to Application"

**What you'll see:**
- Beautiful gradient background (emerald/cyan/blue)
- Animated background elements
- Large code input field
- Error message if code is invalid

**Tips:**
- Code is case-insensitive (abc123 = ABC123)
- Must be exactly 6 characters
- Get the code from HR

---

### 2. Applying for the Job

**Steps:**
1. After entering valid code, you'll see the application form
2. Fill in:
   - Your Name
   - Your Email
   - Upload Resume (PDF or DOCX)
3. Click "Submit Application"
4. You'll be redirected to the interview room

---

### 3. Starting the Interview

**What you'll see:**
- Welcome screen
- Video preview of yourself
- "Camera Active" indicator
- "Start Interview" button

**Steps:**
1. Make sure camera and microphone are enabled
2. Click "Start Interview"
3. Avatar will greet you with a welcome message
4. First question will appear

**Greeting Message:**
"Hello! Welcome to your interview. I'm your AI interviewer today. I'll be asking you questions about your skills and experience. Please take your time with each answer and speak clearly. Let's begin!"

---

### 4. During the Interview

**Layout:**
```
┌─────────────────────────────────────┐
│  AI Interviewer    |    You         │
│                    |                 │
│  [Avatar]          |  [Your Video]  │
│  Speaking...       |  🔴 Recording   │
│                    |                 │
│  Question text     |  Status        │
│  appears here      |                 │
│                    |  [Start Answer] │
│                    |  [End Early]    │
└─────────────────────────────────────┘
```

**What you'll notice:**
- ✅ Avatar speaks each question (with voice)
- ✅ Your video is recorded
- ✅ Recording indicator shows
- ✅ **No question count visible** (you don't know how many questions)
- ✅ Clear status indicators

**Answering Questions:**
1. Listen to the question
2. Click "🎤 Start Answer" when ready
3. Speak your answer clearly
4. Click "⏹️ Stop & Submit" when done
5. AI evaluates your answer
6. Next question appears

---

### 5. Ending Interview Early

**If you need to leave:**
1. Click "End Interview Early" button
2. Confirmation modal appears
3. Click "Yes, End Now"
4. Interview ends gracefully
5. Your progress is evaluated

**Note:** You can end at any time. The AI will evaluate based on questions answered so far.

---

### 6. Interview Completion

**When interview is complete:**
- ✅ Success message appears
- ✅ Avatar speaks thank you message
- ✅ "Interview Completed!" status
- ✅ Instructions to close window

**What happens next:**
- HR reviews your interview
- You'll be contacted with results
- No further action needed from you

---

## 🎨 UI Features Explained

### Gradient Backgrounds
- **HR Dashboard:** Slate → Blue → Indigo
- **Candidate Entry:** Emerald → Cyan → Blue
- **Interview Room:** Purple → Indigo → Blue

### Glass-morphism Effects
- Semi-transparent backgrounds
- Backdrop blur
- Subtle borders
- Modern, professional look

### Status Indicators
- **Speaking:** 🗣️ Blue color
- **Listening:** 👂 Red color
- **Thinking:** 🤔 Purple color
- **Idle:** 😊 Gray color

### Recording Indicators
- Red dot with pulse animation
- "Recording" badge
- Animated dots while recording

---

## 🔧 Technical Features

### Video Recording
- Uses browser's MediaRecorder API
- Records candidate during interview
- Ensures authenticity
- Requires camera permission

### Text-to-Speech
- Uses Web Speech API
- Avatar speaks questions
- Speaks greeting and completion messages
- Natural voice synthesis

### Audio Recording
- Records candidate's answers
- Converts to audio blob
- Sends to backend for transcription
- Requires microphone permission

---

## 💡 Pro Tips

### For HR:
1. **Create descriptive job titles** - Helps candidates understand the role
2. **List specific skills** - AI generates better questions
3. **Share codes promptly** - Don't make candidates wait
4. **Review interviews regularly** - Stay on top of applications
5. **Download resumes early** - Have them ready for review

### For Candidates:
1. **Test camera/mic first** - Ensure they work before starting
2. **Find quiet space** - Minimize background noise
3. **Speak clearly** - AI needs to understand you
4. **Take your time** - No rush, think before answering
5. **Be honest** - AI can detect inconsistencies

---

## 🆘 Troubleshooting

### "Invalid job code"
- Check the code is correct
- Ensure it's 6 characters
- Try uppercase
- Contact HR for correct code

### "Camera access denied"
- Check browser permissions
- Allow camera access
- Refresh page and try again

### "Microphone access denied"
- Check browser permissions
- Allow microphone access
- Refresh page and try again

### Resume won't download
- Check file was uploaded
- Try different browser
- Contact support

---

**Enjoy the improved interview experience! 🎉**
