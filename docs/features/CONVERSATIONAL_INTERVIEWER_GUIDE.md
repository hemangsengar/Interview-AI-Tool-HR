# Conversational Interviewer System

## Overview

The system now includes a natural, human-like interviewer behavior that responds to candidate answers with appropriate feedback and follow-up questions when needed.

## New Interview Flow

```
┌─────────────────────────────────────────────────────────────┐
│  OLD FLOW (Robotic)                                         │
│  Question → Answer → Evaluation → Next Question            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  NEW FLOW (Conversational)                                  │
│  Question → Answer → Evaluation →                           │
│    → Interviewer Response →                                 │
│    → [Optional: Follow-up Question] →                       │
│    → Next Question                                          │
└─────────────────────────────────────────────────────────────┘
```

## Key Features

### 1. **Deterministic Answer Classification**

Answers are classified based on evaluation scores:

```python
# Classification logic (no LLM involved)
avg_score = (correctness + depth + relevance) / 3

if avg_score >= 4.0:    → "strong"
elif avg_score >= 2.5:  → "partial"
else:                   → "weak"
```

### 2. **Natural Interviewer Responses**

Short, conversational feedback before the next question:

| Answer Quality | Response Examples |
|----------------|-------------------|
| **Strong** | "Great answer!", "That's exactly right.", "Well explained." |
| **Partial** | "Good start.", "You're on the right track.", "That covers part of it." |
| **Weak** | "Let me rephrase that.", "Let's try a different angle.", "I think there's some confusion here." |

**Constraints:**
- Maximum 50 characters
- Natural spoken language
- Encouraging, not harsh

### 3. **Intelligent Follow-up Logic**

When a candidate struggles, the system asks follow-up questions instead of immediately moving on:

```python
# Deterministic rules
should_ask_follow_up = (
    answer_quality in ["weak", "partial"] and
    follow_up_count < 2  # Max 2 follow-ups per skill
)
```

**Follow-up Types:**

1. **Simplify** (for weak answers, 1st attempt)
   - Breaks down the concept into basics
   - Asks simpler, foundational questions

2. **Rephrase** (for partial answers, 1st attempt)
   - Asks the same thing in different words
   - Adds more context

3. **Hint** (2nd attempt for any quality)
   - Provides a small hint or example
   - Asks again with guidance

### 4. **Follow-up Tracking**

The system tracks follow-ups per skill to avoid getting stuck:

```python
# In your interview session state
follow_up_tracker = {
    "Python": 1,      # 1 follow-up asked
    "React": 0,       # No follow-ups yet
    "SQL": 2          # Max reached, will move on
}
```

## Implementation in Your API

### Example Integration Flow

```python
from app.services.llm_service import llm_service

# After receiving candidate's answer
async def process_answer(
    session_id: int,
    answer_text: str,
    current_question: str,
    skill: str,
    db: Session
):
    # 1. Evaluate the answer
    evaluation = llm_service.evaluate_answer(
        jd_text=job.jd_raw_text,
        question_text=current_question,
        answer_text=answer_text,
        skill=skill
    )
    
    # 2. Classify answer quality (deterministic)
    answer_quality = llm_service.classify_answer_quality(evaluation)
    
    # 3. Generate interviewer response
    interviewer_response = await llm_service.generate_interviewer_response(
        answer_quality=answer_quality,
        question_text=current_question,
        answer_text=answer_text,
        evaluation=evaluation,
        skill=skill
    )
    
    # 4. Convert interviewer response to speech and send to frontend
    audio_file = await speech_service.text_to_speech(interviewer_response)
    # ... send audio to frontend ...
    
    # 5. Check if follow-up is needed
    follow_up_count = get_follow_up_count(session_id, skill)  # Your tracking
    
    if llm_service.should_ask_follow_up(answer_quality, follow_up_count):
        # Generate follow-up question
        follow_up_type = llm_service.get_follow_up_type(follow_up_count, answer_quality)
        
        follow_up_question = await llm_service.generate_follow_up_question(
            original_question=current_question,
            answer_text=answer_text,
            skill=skill,
            follow_up_type=follow_up_type
        )
        
        # Increment follow-up counter
        increment_follow_up_count(session_id, skill)
        
        # Send follow-up question
        return {
            "type": "follow_up",
            "interviewer_response": interviewer_response,
            "question": follow_up_question,
            "is_follow_up": True
        }
    
    else:
        # Move to next question in plan
        next_question = await get_next_planned_question(session_id)
        
        return {
            "type": "next_question",
            "interviewer_response": interviewer_response,
            "question": next_question,
            "is_follow_up": False
        }
```

## API Methods

### Core Methods

#### `classify_answer_quality(evaluation: Dict) -> str`
- **Deterministic** - No LLM call
- Returns: `"strong"`, `"partial"`, or `"weak"`

#### `generate_interviewer_response(answer_quality, question_text, answer_text, evaluation, skill) -> str`
- **Async** - Uses LLM with fallback
- Returns: Short conversational response (max 50 chars)

#### `should_ask_follow_up(answer_quality: str, follow_up_count: int, max_follow_ups: int = 2) -> bool`
- **Deterministic** - No LLM call
- Returns: `True` if follow-up should be asked

#### `get_follow_up_type(follow_up_count: int, answer_quality: str) -> str`
- **Deterministic** - No LLM call
- Returns: `"simplify"`, `"rephrase"`, or `"hint"`

#### `generate_follow_up_question(original_question, answer_text, skill, follow_up_type) -> str`
- **Async** - Uses LLM with fallback
- Returns: Follow-up question (max 400 chars)

## Database Schema Suggestion

To track follow-ups, add to your interview session:

```python
# In models.py or your interview session state
class InterviewFollowUpTracking:
    session_id: int
    skill: str
    follow_up_count: int = 0
    last_question_id: int
```

Or use in-memory tracking during the interview session.

## Performance Considerations

### Caching
- Interviewer responses are NOT cached (should feel fresh)
- Follow-up questions are NOT cached (context-specific)

### Quota Management
- Uses same quota tracking as other LLM calls
- Automatically falls back to deterministic responses when quota exhausted
- Reduced retries (2 attempts max) for faster failure handling

### Response Times
- Classification: Instant (deterministic)
- Interviewer response: ~1-3 seconds (LLM call)
- Follow-up question: ~2-4 seconds (LLM call)
- Fallback responses: Instant

## Example Conversation

```
🤖 Interviewer: "Can you explain how Python's garbage collection works?"

👤 Candidate: "Uh, it automatically deletes variables?"

📊 System: [Evaluation: correctness=2.0, depth=1.5, relevance=2.5 → "weak"]

🤖 Interviewer: "Let me rephrase that." [interviewer_response]

🤖 Interviewer: "Let me ask something more basic: Can you explain what 
    garbage collection is and why it's important?" [follow_up]

👤 Candidate: "It's a memory management system that automatically 
    frees up memory that's no longer in use..."

📊 System: [Evaluation: correctness=4.0, depth=3.5, relevance=4.5 → "strong"]

🤖 Interviewer: "Great answer!" [interviewer_response]

🤖 Interviewer: "Now let's talk about decorators..." [next question]
```

## Configuration

### Adjustable Parameters

```python
# In your interview flow
MAX_FOLLOW_UPS_PER_SKILL = 2  # Default, can be changed

# Classification thresholds (in llm_service.py)
STRONG_THRESHOLD = 4.0   # avg_score >= 4.0
PARTIAL_THRESHOLD = 2.5  # avg_score >= 2.5
```

## Testing

Run the test suite:

```bash
cd backend
source venv/bin/activate
python -c "
import asyncio
from app.services.llm_service import llm_service

# Test classification
eval_result = {'correctness': 3.0, 'depth': 2.5, 'relevance': 3.5}
quality = llm_service.classify_answer_quality(eval_result)
print(f'Quality: {quality}')

# Test follow-up logic
should_follow = llm_service.should_ask_follow_up('weak', 0)
print(f'Should ask follow-up: {should_follow}')
"
```

## Benefits

✅ **More Natural**: Feels like a real conversation, not a quiz  
✅ **Adaptive**: Gives candidates a second chance on difficult topics  
✅ **Deterministic Core**: LLM only generates text, logic stays in Python  
✅ **Performance**: Quick fallbacks, efficient caching  
✅ **Configurable**: Easy to adjust thresholds and limits  
✅ **Robust**: Handles API failures gracefully  

## Migration Notes

### Backward Compatibility
- All existing methods still work
- New methods are opt-in
- No breaking changes to current API

### Gradual Adoption
You can implement this in stages:
1. **Phase 1**: Add interviewer responses only
2. **Phase 2**: Add follow-up logic
3. **Phase 3**: Fine-tune thresholds based on user feedback

## Support

For questions or issues, refer to:
- Main LLM Service: `backend/app/services/llm_service.py`
- Interview Router: `backend/app/routers/interviews.py`
- This guide: `docs/features/CONVERSATIONAL_INTERVIEWER_GUIDE.md`
