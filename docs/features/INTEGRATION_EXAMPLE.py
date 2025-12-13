# Example Integration: Conversational Interviewer in FastAPI Router

"""
This is a reference implementation showing how to integrate the conversational
interviewer system into your existing interviews.py router.

DO NOT copy-paste blindly. Adapt to your existing code structure.
"""

from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.services.llm_service import llm_service
from app.services.speech_service import speech_service

# ============================================================================
# HELPER FUNCTION: Track follow-ups per skill
# ============================================================================

def get_follow_up_tracker(session_id: int, db: Session) -> Dict[str, int]:
    """
    Get or initialize follow-up tracker for a session.
    
    Option 1: Store in database (persistent)
    Option 2: Store in memory/cache (simpler, but lost on restart)
    
    Returns: Dict mapping skill -> follow_up_count
    """
    # Option 2 (simple in-memory approach)
    # You could use Redis or a database table for persistence
    if not hasattr(get_follow_up_tracker, '_cache'):
        get_follow_up_tracker._cache = {}
    
    if session_id not in get_follow_up_tracker._cache:
        get_follow_up_tracker._cache[session_id] = {}
    
    return get_follow_up_tracker._cache[session_id]


def increment_follow_up_count(session_id: int, skill: str, db: Session):
    """Increment the follow-up count for a skill."""
    tracker = get_follow_up_tracker(session_id, db)
    tracker[skill] = tracker.get(skill, 0) + 1


def reset_follow_up_count(session_id: int, skill: str, db: Session):
    """Reset follow-up count when moving to a new skill."""
    tracker = get_follow_up_tracker(session_id, db)
    tracker[skill] = 0


# ============================================================================
# MAIN ENDPOINT: Submit Answer and Get Next Question
# ============================================================================

@router.post("/interviews/{interview_id}/answer")
async def submit_answer_and_get_next(
    interview_id: int,
    answer_data: Dict[str, Any],  # {"answer_text": "...", "question_id": ...}
    db: Session = Depends(get_db)
):
    """
    NEW FLOW with conversational interviewer:
    1. Save candidate's answer
    2. Evaluate the answer
    3. Classify answer quality (deterministic)
    4. Generate interviewer response
    5. Decide: follow-up or next question?
    6. Generate appropriate question
    7. Convert both to speech
    8. Return to frontend
    """
    
    # Get interview session
    session = db.query(InterviewSession).filter_by(id=interview_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Interview not found")
    
    # Get current question details
    current_question = db.query(InterviewQuestion).filter_by(
        id=answer_data["question_id"]
    ).first()
    
    if not current_question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    # Extract context
    skill = current_question.skill or "general"
    question_text = current_question.question_text
    answer_text = answer_data["answer_text"]
    
    # Load job and resume data
    job = session.job
    candidate = session.candidate
    resume_parsed = candidate.resume_data  # Assuming you store parsed resume
    
    # ========================================================================
    # STEP 1: Save the answer
    # ========================================================================
    answer = InterviewAnswer(
        session_id=interview_id,
        question_id=current_question.id,
        answer_text=answer_text,
        audio_path=answer_data.get("audio_path")
    )
    db.add(answer)
    db.commit()
    
    # ========================================================================
    # STEP 2: Evaluate the answer
    # ========================================================================
    evaluation = llm_service.evaluate_answer(
        jd_text=job.jd_raw_text,
        question_text=question_text,
        answer_text=answer_text,
        skill=skill
    )
    
    # Save evaluation scores
    answer.correctness_score = evaluation["correctness"]
    answer.depth_score = evaluation["depth"]
    answer.clarity_score = evaluation["clarity"]
    answer.relevance_score = evaluation["relevance"]
    answer.llm_feedback = evaluation["comment"]
    db.commit()
    
    # ========================================================================
    # STEP 3: Classify answer quality (deterministic)
    # ========================================================================
    answer_quality = llm_service.classify_answer_quality(evaluation)
    print(f"[INTERVIEW] Answer quality: {answer_quality}")
    
    # ========================================================================
    # STEP 4: Generate interviewer response
    # ========================================================================
    interviewer_response = await llm_service.generate_interviewer_response(
        answer_quality=answer_quality,
        question_text=question_text,
        answer_text=answer_text,
        evaluation=evaluation,
        skill=skill
    )
    
    print(f"[INTERVIEW] Interviewer says: '{interviewer_response}'")
    
    # Convert interviewer response to speech
    interviewer_audio = await speech_service.text_to_speech(
        text=interviewer_response,
        language="en-IN"
    )
    
    # ========================================================================
    # STEP 5: Decide - Follow-up or Next Question?
    # ========================================================================
    tracker = get_follow_up_tracker(interview_id, db)
    current_follow_up_count = tracker.get(skill, 0)
    
    should_follow_up = llm_service.should_ask_follow_up(
        answer_quality=answer_quality,
        follow_up_count=current_follow_up_count,
        max_follow_ups=2  # Configurable
    )
    
    if should_follow_up:
        # ====================================================================
        # PATH A: Generate Follow-up Question
        # ====================================================================
        print(f"[INTERVIEW] Asking follow-up for '{skill}' (attempt {current_follow_up_count + 1})")
        
        # Determine follow-up type
        follow_up_type = llm_service.get_follow_up_type(
            follow_up_count=current_follow_up_count,
            answer_quality=answer_quality
        )
        
        # Generate follow-up question
        next_question_text = await llm_service.generate_follow_up_question(
            original_question=question_text,
            answer_text=answer_text,
            skill=skill,
            follow_up_type=follow_up_type
        )
        
        # Increment follow-up counter
        increment_follow_up_count(interview_id, skill, db)
        
        # Create follow-up question record
        follow_up_question = InterviewQuestion(
            session_id=interview_id,
            question_text=next_question_text,
            skill=skill,
            difficulty=current_question.difficulty,
            question_type=current_question.question_type,
            is_follow_up=True,
            parent_question_id=current_question.id
        )
        db.add(follow_up_question)
        db.commit()
        
        response_type = "follow_up"
        
    else:
        # ====================================================================
        # PATH B: Move to Next Planned Question
        # ====================================================================
        print(f"[INTERVIEW] Moving to next question in plan")
        
        # Reset follow-up counter if moving to new skill
        reset_follow_up_count(interview_id, skill, db)
        
        # Get next question from interview plan
        plan = session.interview_plan  # Assuming you store the plan
        current_index = session.current_question_index
        
        if current_index + 1 >= len(plan):
            # End of interview
            return {
                "status": "completed",
                "interviewer_response": interviewer_response,
                "interviewer_audio": interviewer_audio,
                "message": "Interview completed!"
            }
        
        # Get next plan item
        next_plan_item = plan[current_index + 1]
        
        # Generate next question
        next_question_text = await llm_service.generate_next_question(
            plan_item=next_plan_item,
            jd_text=job.jd_raw_text,
            resume_summary=resume_parsed,
            question_index=current_index + 2,
            previous_context=None
        )
        
        # Create next question record
        follow_up_question = InterviewQuestion(
            session_id=interview_id,
            question_text=next_question_text,
            skill=next_plan_item.get("skill"),
            difficulty=next_plan_item.get("difficulty"),
            question_type=next_plan_item.get("type"),
            is_follow_up=False
        )
        db.add(follow_up_question)
        
        # Update session progress
        session.current_question_index = current_index + 1
        db.commit()
        
        response_type = "next_question"
    
    # ========================================================================
    # STEP 6: Convert next question to speech
    # ========================================================================
    question_audio = await speech_service.text_to_speech(
        text=next_question_text,
        language="en-IN"
    )
    
    # ========================================================================
    # STEP 7: Return response to frontend
    # ========================================================================
    return {
        "status": "success",
        "response_type": response_type,
        
        # Interviewer response
        "interviewer_response": {
            "text": interviewer_response,
            "audio_url": interviewer_audio["audio_url"]
        },
        
        # Next question
        "question": {
            "id": follow_up_question.id,
            "text": next_question_text,
            "audio_url": question_audio["audio_url"],
            "skill": follow_up_question.skill,
            "is_follow_up": follow_up_question.is_follow_up
        },
        
        # Metadata
        "answer_quality": answer_quality,
        "evaluation": evaluation,
        "follow_up_count": tracker.get(skill, 0)
    }


# ============================================================================
# FRONTEND INTEGRATION EXAMPLE
# ============================================================================

"""
Frontend should handle the two-part response:

1. Play interviewer response audio first
   - User hears: "Great answer!" or "Let me rephrase that."

2. After interviewer response finishes, play question audio
   - User hears the next question or follow-up

Example React/JavaScript:

async function submitAnswer(answer) {
    const response = await fetch(`/api/interviews/${interviewId}/answer`, {
        method: 'POST',
        body: JSON.stringify({ answer_text: answer, question_id: currentQuestionId })
    });
    
    const data = await response.json();
    
    // 1. Play interviewer response
    await playAudio(data.interviewer_response.audio_url);
    
    // 2. Then play next question
    await playAudio(data.question.audio_url);
    
    // 3. Update UI
    if (data.response_type === 'follow_up') {
        showFollowUpIndicator();
    }
    
    setCurrentQuestion(data.question);
}
"""
