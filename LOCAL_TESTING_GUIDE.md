# Local Testing Guide - Conversational Interviewer System

## ✅ Servers Running

### Backend (FastAPI)
- **URL**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs (Swagger UI)
- **Status**: Running in terminal with hot reload
- **Model**: gemini-2.0-flash

### Frontend (React + Vite)
- **URL**: http://localhost:5173
- **Status**: Running with hot reload

---

## 🧪 Testing the Conversational Interviewer

### What's New to Test

The interview now has a more natural flow:
1. **Interviewer Responses**: After each answer, you'll hear a brief response like "Great answer!" or "Let me rephrase that."
2. **Follow-up Questions**: If your answer is weak or partial, the system will ask a follow-up question before moving on
3. **Adaptive Behavior**: Up to 2 follow-ups per topic, then automatically moves forward

---

## 📋 Test Scenarios

### Scenario 1: Strong Answer Flow
**Goal**: Test that good answers get positive feedback and move forward smoothly

1. Open http://localhost:5173
2. Create a job posting with technical skills (e.g., Python, React, SQL)
3. Create a candidate and upload a resume
4. Start the interview
5. Give a **strong, detailed answer** to the first technical question
6. **Expected behavior**:
   - ✅ Hear interviewer say: "Great answer!" or "That's exactly right."
   - ✅ Move directly to the next planned question (no follow-up)
   - ✅ Interview progresses smoothly

### Scenario 2: Weak Answer with Follow-up
**Goal**: Test that weak answers trigger follow-up questions

1. When asked a technical question, give a **vague or incorrect answer**
   - Example: Question: "Explain Python's garbage collection"
   - Weak Answer: "Um, it deletes variables automatically"
2. **Expected behavior**:
   - ✅ Hear interviewer say: "Let me rephrase that." or "I think there's some confusion here."
   - ✅ Get a **simplified follow-up question** on the same topic
   - ✅ System gives you a second chance

3. Give a **better answer** to the follow-up
4. **Expected behavior**:
   - ✅ Hear positive feedback
   - ✅ Move to next topic

### Scenario 3: Multiple Follow-ups (Max 2)
**Goal**: Test that system doesn't get stuck on one topic

1. Give a weak answer to a technical question
2. Give another weak answer to the follow-up
3. Give a weak answer to the second follow-up
4. **Expected behavior**:
   - ✅ After 2 follow-ups, system moves on regardless of answer quality
   - ✅ Won't ask more than 2 follow-ups per skill
   - ✅ Interview continues to next topic

### Scenario 4: Partial Answer Flow
**Goal**: Test responses for partially correct answers

1. Give a **partially correct answer** (covers some points but misses key details)
   - Example: Question: "Explain REST API principles"
   - Partial Answer: "It's an API that uses HTTP"
2. **Expected behavior**:
   - ✅ Hear: "Good start." or "You're on the right track."
   - ✅ Get a **rephrased follow-up** question to clarify
   - ✅ Encouraging but prompts for more detail

---

## 🔍 Monitoring During Tests

### Backend Terminal
Watch for these log messages:
```
[QUESTION GEN] Q#1, Type: technical, Skill: Python
[INTERVIEW] Answer quality: weak
[INTERVIEWER RESPONSE] Generated: Let me rephrase that.
[FOLLOW-UP LOGIC] Answer quality 'weak', asking follow-up #1
[FOLLOW-UP] Generated (124 chars): Let me ask something more basic...
```

### Frontend Behavior
Look for:
- **Two audio playbacks** per answer cycle:
  1. Interviewer response (short, encouraging)
  2. Next question or follow-up
- **Follow-up indicator** in UI (if implemented)
- **Smooth conversation flow** without jarring transitions

---

## 🛠️ API Testing with Swagger

### Test Individual Components

1. Open http://localhost:8000/docs

2. **Test Answer Classification**
   ```python
   # In Python console or through API
   evaluation = {
       "correctness": 2.0,
       "depth": 2.5,
       "relevance": 2.0
   }
   quality = llm_service.classify_answer_quality(evaluation)
   # Should return: "weak"
   ```

3. **Test Interviewer Response Generation**
   - Endpoint: `POST /api/test/interviewer-response` (if you create one)
   - Or test directly in backend terminal:
     ```bash
     cd /Users/ayush/Projects/GenAi.git/backend
     source venv/bin/activate
     python -c "
     import asyncio
     from app.services.llm_service import llm_service
     
     async def test():
         response = await llm_service.generate_interviewer_response(
             answer_quality='weak',
             question_text='Explain Python decorators',
             answer_text='Uh, they are functions that modify functions?',
             evaluation={'correctness': 2.0, 'depth': 1.5, 'relevance': 2.5},
             skill='Python'
         )
         print(f'Interviewer response: {response}')
     
     asyncio.run(test())
     "
     ```

4. **Test Follow-up Generation**
   ```bash
   python -c "
   import asyncio
   from app.services.llm_service import llm_service
   
   async def test():
       follow_up = await llm_service.generate_follow_up_question(
           original_question='Explain Python decorators',
           answer_text='They modify functions',
           skill='Python',
           follow_up_type='simplify'
       )
       print(f'Follow-up: {follow_up}')
   
   asyncio.run(test())
   "
   ```

---

## 📊 Expected Metrics

### Response Times (with good API quota)
- Answer classification: **< 1ms** (deterministic)
- Interviewer response: **2-4 seconds** (LLM call)
- Follow-up question: **2-4 seconds** (LLM call)
- Total delay between answer and next question: **4-8 seconds**

### Response Times (with quota exhausted)
- Answer classification: **< 1ms** (deterministic)
- Interviewer response: **< 1ms** (fallback)
- Follow-up question: **< 1ms** (fallback)
- Total delay: **< 100ms** (instant fallbacks)

### Cache Behavior (after first interview)
- Interview plan: **Cached for 1 hour**
- Questions: **Cached by type/skill/context**
- Subsequent interviews: **Much faster**

---

## 🐛 Common Issues & Solutions

### Issue 1: Backend crashes with quota error
**Solution**: System should automatically use fallbacks. Check logs for:
```
[QUESTION GEN] Skipping API call due to 2 consecutive quota errors, using fallback
```

### Issue 2: Interviewer response feels generic
**Expected**: When quota exhausted, fallback responses are simpler but still natural:
- "Great answer!"
- "Let me rephrase that."
- "Good start."

### Issue 3: Too many follow-ups on same topic
**Check**: Max is 2 follow-ups per skill. Logs should show:
```
[FOLLOW-UP LOGIC] Max follow-ups (2) reached, moving on
```

### Issue 4: No follow-up for weak answer
**Check**: 
1. Follow-up count might be at max (2)
2. Answer might be classified as "strong" despite seeming weak
3. Check evaluation scores in logs

---

## 🧰 Developer Tools

### Check LLM Service Status
```bash
cd /Users/ayush/Projects/GenAi.git/backend
source venv/bin/activate
python -c "
from app.services.llm_service import llm_service
import json

# Get quota status
status = llm_service.get_quota_status()
print('Quota Status:', json.dumps(status, indent=2))

# Get cache stats
cache_stats = llm_service.get_cache_stats()
print('\nCache Stats:', json.dumps(cache_stats, indent=2))
"
```

### Reset System State
```bash
# Clear cache
python -c "
from app.services.llm_service import llm_service
llm_service.clear_cache()
llm_service.reset_quota_tracking()
print('✅ Cache and quota tracking reset')
"
```

### View Database
```bash
cd /Users/ayush/Projects/GenAi.git/backend
python view_db_simple.py
```

---

## 📝 Test Checklist

- [ ] Backend server running on :8000
- [ ] Frontend server running on :5173
- [ ] Can access Swagger docs at /docs
- [ ] Can create job posting
- [ ] Can create candidate with resume
- [ ] Can start interview
- [ ] Strong answers get positive feedback
- [ ] Weak answers trigger follow-ups
- [ ] Follow-ups are limited to max 2
- [ ] System moves on after max follow-ups
- [ ] Interviewer responses sound natural
- [ ] Audio playback works (response + question)
- [ ] No crashes or errors in console
- [ ] Performance is acceptable

---

## 📖 Documentation Reference

- **Feature Guide**: `docs/features/CONVERSATIONAL_INTERVIEWER_GUIDE.md`
- **Integration Example**: `docs/features/INTEGRATION_EXAMPLE.py`
- **LLM Service**: `backend/app/services/llm_service.py`

---

## 🚀 Next Steps After Testing

1. **Gather Feedback**: Note which responses feel natural vs. robotic
2. **Adjust Thresholds**: If needed, change classification thresholds in `llm_service.py`
3. **Tune Follow-ups**: Adjust max follow-ups per skill (currently 2)
4. **Frontend Updates**: Add visual indicators for follow-up questions
5. **Deploy**: Push to Render after local testing confirms everything works

---

## 💡 Testing Tips

1. **Test with quota exhausted**: To simulate free tier limits, manually set consecutive quota errors:
   ```python
   llm_service.consecutive_quota_errors = 3
   ```
   This forces fallback behavior so you can test resilience.

2. **Vary answer quality**: Give different quality answers to see the full range of responses

3. **Check audio timing**: Make sure there's a natural pause between interviewer response and question

4. **Monitor cache hits**: After first interview, subsequent ones should be faster

5. **Test edge cases**: What happens at the very last question? When interview ends during a follow-up?

---

Happy Testing! 🎉

The system should now feel much more conversational and adaptive compared to the old robotic flow.
