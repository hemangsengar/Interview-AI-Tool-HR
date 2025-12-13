"""Interview management routes."""
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, WebSocket, WebSocketDisconnect, Form, Request
from sqlalchemy.orm import Session
from typing import Optional
import os
import uuid
from datetime import datetime
from pathlib import Path
from pydantic import BaseModel
from ..database import get_db
from ..auth import get_current_user
from ..models import (
    InterviewSession, InterviewQuestion, InterviewAnswer,
    Candidate, Job, User, InterviewStatus, RecommendationType, CandidateStatus
)
from ..schemas import (
    InterviewStartResponse, QuestionResponse, AnswerEvaluation,
    InterviewResults, QuestionDetail
)
from ..services.llm_service import llm_service
from ..services.speech_service import speech_service
from ..services.parsing_service import parsing_service
from ..config import settings
from ..middleware.rate_limiter import rate_limiter

router = APIRouter()


class TTSRequest(BaseModel):
    text: str
    speaker: Optional[str] = "abhilash"  # Default to abhilash (male voice)


@router.post("/tts")
async def generate_tts(http_request: Request, request: TTSRequest):
    """Generate TTS audio for any text using Sarvam API."""
    # Rate limit: 100 TTS requests per hour per IP
    client_ip = http_request.client.host if http_request.client else "unknown"
    rate_limiter.check_rate_limit(client_ip, max_requests=100, window_seconds=3600)
    
    print(f"[TTS ENDPOINT] Received request with speaker: {request.speaker}")
    print(f"[TTS ENDPOINT] Request object: {request}")
    try:
        audio_bytes = await speech_service.synthesize_speech(request.text, speaker=request.speaker)
        
        if not audio_bytes:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate audio"
            )
        
        from fastapi.responses import Response
        return Response(
            content=audio_bytes,
            media_type="audio/wav",
            headers={
                "Content-Disposition": "attachment; filename=speech.wav"
            }
        )
    except Exception as e:
        print(f"TTS error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"TTS generation failed: {str(e)}"
        )


class StartInterviewRequest(BaseModel):
    speaker: Optional[str] = "abhilash"


@router.post("/{session_id}/start", response_model=InterviewStartResponse)
async def start_interview(
    session_id: int,
    http_request: Request,
    request: StartInterviewRequest,
    db: Session = Depends(get_db)
):
    """Start an interview session and generate interview plan."""
    # Rate limit: 50 interview starts per hour (more relaxed for testing)
    client_ip = http_request.client.host if http_request.client else "unknown"
    rate_limiter.check_rate_limit(client_ip, max_requests=50, window_seconds=3600)
    
    # Get speaker preference
    speaker = request.speaker
    print(f"[START INTERVIEW] Speaker selected: {speaker}")
    print(f"[START INTERVIEW] Request body: {request}")
    # Get session
    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id
    ).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview session not found"
        )
    
    if session.status != InterviewStatus.SCHEDULED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Interview already started or completed"
        )
    
    # Get candidate and job
    candidate = session.candidate
    job = candidate.job
    
    # Parse JD
    jd_parsed = parsing_service.parse_jd(
        job.jd_raw_text,
        job.must_have_skills,
        job.good_to_have_skills
    )
    
    # Get resume parsed data
    resume_parsed = candidate.resume_parsed_json
    
    # Analyze skill gap
    skill_gap = parsing_service.analyze_skill_gap(jd_parsed, resume_parsed)
    
    # Generate interview plan
    interview_plan = llm_service.generate_interview_plan(
        job.jd_raw_text,
        {
            "must_have": job.must_have_skills,
            "good_to_have": job.good_to_have_skills
        },
        resume_parsed
    )
    
    # Store plan in session_metadata
    session.session_metadata = {
        "interview_plan": interview_plan,
        "skill_gap": skill_gap,
        "jd_parsed": jd_parsed,
        "current_question_index": 0,
        "speaker": speaker  # Store speaker preference
    }
    session.status = InterviewStatus.IN_PROGRESS
    session.started_at = datetime.utcnow()
    
    db.commit()
    
    return InterviewStartResponse(
        session_id=session.id,
        status="started",
        message="Interview started successfully"
    )


@router.post("/{session_id}/next-question", response_model=QuestionResponse)
async def get_next_question(
    session_id: int,
    db: Session = Depends(get_db)
):
    """Get the next interview question."""
    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id
    ).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview session not found"
        )
    
    if session.status != InterviewStatus.IN_PROGRESS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Interview not in progress"
        )
    
    # Get session_metadata
    metadata = session.session_metadata or {}
    interview_plan = metadata.get("interview_plan", [])
    current_index = metadata.get("current_question_index", 0)
    
    # HARD LIMIT: Maximum 12 questions per interview (more focused and dynamic)
    MAX_QUESTIONS = 12
    
    # Get count of questions already asked
    questions_asked = db.query(InterviewQuestion).filter(
        InterviewQuestion.session_id == session.id
    ).count()
    
    # Check if interview is complete (either plan finished OR max questions reached)
    if current_index >= len(interview_plan) or questions_asked >= MAX_QUESTIONS:
        # Finalize interview
        finalize_interview(session, db)
        
        # Return a special response indicating completion
        return QuestionResponse(
            question_id=0,
            question_text="Thank you for completing the interview! Your responses have been recorded and will be reviewed shortly.",
            question_number=questions_asked,
            total_questions=len(interview_plan),
            audio_url=None,
            is_last=True
        )
    
    # Get current plan item
    plan_item = interview_plan[current_index]
    
    print(f"[PLAN] Current index: {current_index}, Plan item: {plan_item}")
    
    # Generate question text
    candidate = session.candidate
    job = candidate.job
    resume_parsed = candidate.resume_parsed_json
    
    # Get previously asked questions to ensure uniqueness
    previous_questions = db.query(InterviewQuestion).filter(
        InterviewQuestion.session_id == session.id
    ).all()
    previous_questions_text = [q.question_text for q in previous_questions]
    
    # Get previous answers for adaptive questioning
    previous_context = None
    if previous_questions:
        last_question = previous_questions[-1]
        if last_question.answer:
            avg_score = (
                last_question.answer.correctness_score +
                last_question.answer.depth_score +
                last_question.answer.clarity_score +
                last_question.answer.relevance_score
            ) / 4
            previous_context = f"Previous answer scored {avg_score:.1f}/5. "
            if avg_score < 2.5:
                previous_context += "Consider asking an easier question or switching topics."
            elif avg_score > 4.0:
                previous_context += "Candidate is performing well, consider increasing difficulty."
    
    # Build context with all previous questions to ensure uniqueness
    previous_questions_context = ""
    if previous_questions_text:
        previous_questions_context = f"\n\nPREVIOUSLY ASKED QUESTIONS (DO NOT REPEAT OR ASK SIMILAR):\n" + "\n".join([f"- {q}" for q in previous_questions_text])
    
    question_text = await llm_service.generate_next_question(
        plan_item,
        job.jd_raw_text,
        resume_parsed,
        current_index + 1,
        f"{previous_context or ''}{previous_questions_context}"
    )
    
    # Ensure question is unique (check for exact match or high similarity)
    max_attempts = 3
    attempt = 0
    while attempt < max_attempts:
        # Check exact match
        if question_text in previous_questions_text:
            question_text = await llm_service.generate_next_question(
                plan_item,
                job.jd_raw_text,
                resume_parsed,
                current_index + 1,
                f"{previous_context or ''}{previous_questions_context}\n\nIMPORTANT: Generate a COMPLETELY DIFFERENT question. Attempt {attempt + 1}."
            )
            attempt += 1
        else:
            # Check similarity (simple word overlap check)
            is_similar = False
            question_words = set(question_text.lower().split())
            for prev_q in previous_questions_text:
                prev_words = set(prev_q.lower().split())
                overlap = len(question_words & prev_words) / max(len(question_words), len(prev_words))
                if overlap > 0.6:  # More than 60% word overlap (stricter than before)
                    is_similar = True
                    print(f"Question too similar ({overlap:.2%} overlap): {question_text[:50]}...")
                    break
            
            if is_similar:
                question_text = await llm_service.generate_next_question(
                    plan_item,
                    job.jd_raw_text,
                    resume_parsed,
                    current_index + 1,
                    f"{previous_context or ''}{previous_questions_context}\n\nIMPORTANT: The previous question was too similar. Generate a UNIQUE question on a different aspect. Attempt {attempt + 1}."
                )
                attempt += 1
            else:
                break
    
    # Create question record
    question = InterviewQuestion(
        session_id=session.id,
        index=current_index + 1,
        question_text=question_text,
        question_type=plan_item.get("type", "technical"),
        skill=plan_item.get("skill"),
        difficulty=plan_item.get("difficulty", "medium")
    )
    
    print(f"[QUESTION] Creating question #{current_index + 1}")
    print(f"[QUESTION] Plan type: {plan_item.get('type')}, Skill: {plan_item.get('skill')}")
    print(f"[QUESTION] Question text: {question_text[:100]}...")
    print(f"[QUESTION] Stored type: {question.question_type}, index: {question.index}")
    
    db.add(question)
    db.commit()
    db.refresh(question)
    
    print(f"[QUESTION] Question ID: {question.id}, Index in DB: {question.index}")
    
    # CRITICAL FIX: Update current_question_index IMMEDIATELY after creating question
    # This ensures the next question uses the correct index
    metadata["current_question_index"] = current_index + 1
    session.session_metadata = metadata
    db.commit()
    print(f"[QUESTION] Updated metadata: current_question_index = {current_index + 1}")
    
    # Generate TTS audio with speaker from session metadata
    speaker = metadata.get("speaker", "abhilash")  # Default to abhilash if not set
    audio_bytes = await speech_service.synthesize_speech(question_text, speaker=speaker)
    
    audio_url = None
    if audio_bytes:
        # Save audio file in candidate-specific folder
        candidate = session.candidate
        safe_name = "".join(c for c in candidate.name if c.isalnum() or c in (' ', '_')).strip()
        safe_name = safe_name.replace(' ', '_')
        
        candidate_folder = Path(settings.UPLOAD_DIR) / safe_name
        candidate_folder.mkdir(parents=True, exist_ok=True)
        
        audio_filename = f"q{question.index:02d}_question.wav"
        audio_path = candidate_folder / audio_filename
        
        print(f"[AUDIO] Saving question audio: {audio_path}")
        print(f"[AUDIO] Filename: {audio_filename}, Index: {question.index}")
        
        with open(audio_path, "wb") as f:
            f.write(audio_bytes)
        
        print(f"[AUDIO] Question audio saved successfully")
        audio_url = f"/uploads/{safe_name}/{audio_filename}"
    
    return QuestionResponse(
        question_id=question.id,
        question_text=question_text,
        question_number=current_index + 1,
        total_questions=len(interview_plan),
        audio_url=audio_url,
        is_last=(current_index + 1 >= len(interview_plan))
    )


class CodeAnswerRequest(BaseModel):
    code_text: str


@router.post("/{session_id}/code-answer", response_model=AnswerEvaluation)
async def submit_code_answer(
    session_id: int,
    request: CodeAnswerRequest,
    db: Session = Depends(get_db)
):
    """Submit a code answer to the current question."""
    code_text = request.code_text
    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id
    ).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview session not found"
        )
    
    # Get the latest question without an answer
    question = db.query(InterviewQuestion).filter(
        InterviewQuestion.session_id == session_id,
        ~InterviewQuestion.answer.has()
    ).order_by(InterviewQuestion.index.desc()).first()
    
    if not question:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No pending question found"
        )
    
    # Evaluate code answer
    candidate = session.candidate
    job = candidate.job
    
    evaluation = llm_service.evaluate_answer(
        job.jd_raw_text,
        question.question_text,
        f"Code Solution:\n{code_text}",
        question.skill
    )
    
    # Create answer record
    answer = InterviewAnswer(
        question_id=question.id,
        answer_transcript_text=f"[Code Answer]\n{code_text}",
        audio_file_path=None,
        correctness_score=evaluation["correctness"],
        depth_score=evaluation["depth"],
        clarity_score=evaluation["clarity"],
        relevance_score=evaluation["relevance"],
        comment_text=evaluation["comment"]
    )
    
    db.add(answer)
    
    # Update question index
    metadata = session.session_metadata or {}
    metadata["current_question_index"] = question.index
    session.session_metadata = metadata
    
    db.commit()
    
    # Check if this was the last question
    interview_plan = metadata.get("interview_plan", [])
    is_complete = question.index >= len(interview_plan)
    
    if is_complete:
        finalize_interview(session, db)
    
    return AnswerEvaluation(
        correctness=evaluation["correctness"],
        depth=evaluation["depth"],
        clarity=evaluation["clarity"],
        relevance=evaluation["relevance"],
        comment=evaluation["comment"],
        is_interview_complete=is_complete
    )


@router.post("/transcribe")
async def transcribe_audio_chunk(
    audio_file: UploadFile = File(...)
):
    """Transcribe a single audio chunk (for real-time chunking)."""
    try:
        audio_bytes = await audio_file.read()
        print(f"[TRANSCRIBE] Received audio chunk: {len(audio_bytes)} bytes")
        
        # Transcribe this chunk
        transcript = await speech_service.transcribe_audio(audio_bytes)
        
        if not transcript:
            transcript = ""
        
        print(f"[TRANSCRIBE] Result: '{transcript}'")
        
        return {"transcript": transcript}
    except Exception as e:
        print(f"[TRANSCRIBE] Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Transcription failed: {str(e)}"
        )


class TextAnswerRequest(BaseModel):
    transcript: str


@router.post("/{session_id}/text-answer", response_model=AnswerEvaluation)
async def submit_text_answer(
    session_id: int,
    request: TextAnswerRequest,
    db: Session = Depends(get_db)
):
    """Submit an answer as text transcript (from chunked transcription)."""
    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id
    ).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview session not found"
        )
    
    # Get the latest question without an answer
    question = db.query(InterviewQuestion).filter(
        InterviewQuestion.session_id == session_id,
        ~InterviewQuestion.answer.has()
    ).order_by(InterviewQuestion.index.desc()).first()
    
    if not question:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No pending question found"
        )
    
    transcript = request.transcript
    print(f"[TEXT ANSWER] Question ID: {question.id}, Index: {question.index}")
    print(f"[TEXT ANSWER] Transcript: '{transcript}'")
    
    # Evaluate answer
    candidate = session.candidate
    job = candidate.job
    
    evaluation = llm_service.evaluate_answer(
        job.jd_raw_text,
        question.question_text,
        transcript,
        question.skill
    )
    
    # Create answer record (no audio file)
    answer = InterviewAnswer(
        question_id=question.id,
        answer_transcript_text=transcript,
        audio_file_path=None,  # No audio file for chunked transcription
        correctness_score=evaluation["correctness"],
        depth_score=evaluation["depth"],
        clarity_score=evaluation["clarity"],
        relevance_score=evaluation["relevance"],
        comment_text=evaluation["comment"]
    )
    
    db.add(answer)
    
    # Update question index
    metadata = session.session_metadata or {}
    metadata["current_question_index"] = question.index
    session.session_metadata = metadata
    
    db.commit()
    
    # Check if this was the last question
    interview_plan = metadata.get("interview_plan", [])
    is_complete = question.index >= len(interview_plan)
    
    if is_complete:
        finalize_interview(session, db)
    
    return AnswerEvaluation(
        correctness=evaluation["correctness"],
        depth=evaluation["depth"],
        clarity=evaluation["clarity"],
        relevance=evaluation["relevance"],
        comment=evaluation["comment"],
        is_interview_complete=is_complete
    )


@router.post("/{session_id}/answers", response_model=AnswerEvaluation)
async def submit_answer(
    session_id: int,
    audio_file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Submit an answer to the current question."""
    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id
    ).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview session not found"
        )
    
    # Get the latest question without an answer
    question = db.query(InterviewQuestion).filter(
        InterviewQuestion.session_id == session_id,
        ~InterviewQuestion.answer.has()
    ).order_by(InterviewQuestion.index.desc()).first()
    
    if not question:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No pending question found"
        )
    
    # Save audio file in candidate-specific folder
    audio_bytes = await audio_file.read()
    
    candidate = session.candidate
    safe_name = "".join(c for c in candidate.name if c.isalnum() or c in (' ', '_')).strip()
    safe_name = safe_name.replace(' ', '_')
    
    candidate_folder = Path(settings.UPLOAD_DIR) / safe_name
    candidate_folder.mkdir(parents=True, exist_ok=True)
    
    audio_filename = f"q{question.index:02d}_answer.wav"
    audio_path = candidate_folder / audio_filename
    
    print(f"[ANSWER AUDIO] Question ID: {question.id}, Index: {question.index}")
    print(f"[ANSWER AUDIO] Saving to: {audio_path}")
    print(f"[ANSWER AUDIO] Filename: {audio_filename}")
    
    with open(audio_path, "wb") as f:
        f.write(audio_bytes)
    
    print(f"[ANSWER AUDIO] Answer audio saved successfully")
    # Store relative path for portability (just candidate_name/filename)
    relative_audio_path = f"{safe_name}/{audio_filename}"
    
    # Transcribe audio
    transcript = await speech_service.transcribe_audio(audio_bytes)
    
    if not transcript:
        transcript = "[Transcription failed - audio recorded]"
    
    # Evaluate answer
    candidate = session.candidate
    job = candidate.job
    
    evaluation = llm_service.evaluate_answer(
        job.jd_raw_text,
        question.question_text,
        transcript,
        question.skill
    )
    
    # Create answer record
    answer = InterviewAnswer(
        question_id=question.id,
        answer_transcript_text=transcript,
        audio_file_path=relative_audio_path,
        correctness_score=evaluation["correctness"],
        depth_score=evaluation["depth"],
        clarity_score=evaluation["clarity"],
        relevance_score=evaluation["relevance"],
        comment_text=evaluation["comment"]
    )
    
    db.add(answer)
    
    # Update question index
    metadata = session.session_metadata or {}
    metadata["current_question_index"] = question.index
    session.session_metadata = metadata
    
    db.commit()
    
    # Check if this was the last question
    interview_plan = metadata.get("interview_plan", [])
    is_complete = question.index >= len(interview_plan)
    
    if is_complete:
        finalize_interview(session, db)
    
    return AnswerEvaluation(
        correctness=evaluation["correctness"],
        depth=evaluation["depth"],
        clarity=evaluation["clarity"],
        relevance=evaluation["relevance"],
        comment=evaluation["comment"],
        is_interview_complete=is_complete
    )


def finalize_interview(session: InterviewSession, db: Session):
    """Finalize interview and generate report."""
    # Get all questions and answers
    questions = db.query(InterviewQuestion).filter(
        InterviewQuestion.session_id == session.id
    ).all()
    
    evaluations = []
    for question in questions:
        if question.answer:
            evaluations.append({
                "correctness": question.answer.correctness_score,
                "depth": question.answer.depth_score,
                "clarity": question.answer.clarity_score,
                "relevance": question.answer.relevance_score,
                "comment": question.answer.comment_text
            })
    
    if not evaluations:
        # No answers submitted
        session.status = InterviewStatus.COMPLETED
        session.ended_at = datetime.utcnow()
        session.final_score = 0.0
        session.final_recommendation = RecommendationType.REJECT
        session.final_report_text = "Interview completed with no answers submitted."
        db.commit()
        return
    
    # Calculate final score (0-100)
    avg_score = sum(
        (e["correctness"] + e["depth"] + e["clarity"] + e["relevance"]) / 4
        for e in evaluations
    ) / len(evaluations)
    
    final_score = (avg_score / 5.0) * 100  # Convert 0-5 to 0-100
    
    # Generate final report
    candidate = session.candidate
    job = candidate.job
    resume_parsed = candidate.resume_parsed_json
    
    report_data = llm_service.generate_final_report(
        job.jd_raw_text,
        resume_parsed,
        evaluations,
        final_score
    )
    
    # Determine recommendation based on score
    if final_score >= 80:
        recommendation = RecommendationType.STRONG
    elif final_score >= 60:
        recommendation = RecommendationType.MEDIUM
    elif final_score >= 40:
        recommendation = RecommendationType.WEAK
    else:
        recommendation = RecommendationType.REJECT
    
    # Update session
    session.status = InterviewStatus.COMPLETED
    session.ended_at = datetime.utcnow()
    session.final_score = round(final_score, 2)
    session.final_recommendation = recommendation
    session.final_report_text = report_data.get("report", "Interview completed successfully.")
    
    # Update candidate status based on recommendation
    candidate = session.candidate
    if recommendation == RecommendationType.STRONG or recommendation == RecommendationType.MEDIUM:
        candidate.status = CandidateStatus.SHORTLISTED
    else:
        candidate.status = CandidateStatus.REJECTED
    
    db.commit()
    db.refresh(session)
    db.refresh(candidate)


@router.get("/{session_id}/results", response_model=InterviewResults)
async def get_interview_results(
    session_id: int,
    db: Session = Depends(get_db)
):
    """Get complete interview results."""
    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id
    ).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview session not found"
        )
    
    candidate = session.candidate
    job = candidate.job
    
    # Get all questions and answers
    questions = db.query(InterviewQuestion).filter(
        InterviewQuestion.session_id == session_id
    ).order_by(InterviewQuestion.index).all()
    
    questions_and_answers = []
    for question in questions:
        qa = QuestionDetail(
            question_text=question.question_text,
            question_type=question.question_type,
            skill=question.skill,
            answer_transcript=question.answer.answer_transcript_text if question.answer else None,
            correctness_score=question.answer.correctness_score if question.answer else None,
            depth_score=question.answer.depth_score if question.answer else None,
            clarity_score=question.answer.clarity_score if question.answer else None,
            relevance_score=question.answer.relevance_score if question.answer else None,
            comment=question.answer.comment_text if question.answer else None
        )
        questions_and_answers.append(qa)
    
    return InterviewResults(
        session_id=session.id,
        candidate_name=candidate.name,
        candidate_email=candidate.email,
        job_title=job.title,
        jd_text=job.jd_raw_text,
        resume_summary=candidate.resume_parsed_json,
        questions_and_answers=questions_and_answers,
        final_score=session.final_score,
        final_recommendation=session.final_recommendation,
        final_report=session.final_report_text,
        status=session.status
    )


@router.post("/{session_id}/upload-video")
async def upload_interview_video(
    session_id: int,
    video_file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload compressed interview video organized by candidate name."""
    print("\n" + "="*60)
    print(f"📤 VIDEO UPLOAD REQUEST")
    print(f"Session ID: {session_id}")
    print(f"Filename: {video_file.filename}")
    print(f"Content-Type: {video_file.content_type}")
    print("="*60)
    
    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id
    ).first()
    
    if not session:
        print(f"❌ ERROR: Session {session_id} not found")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview session not found"
        )
    
    candidate = session.candidate
    print(f"👤 Candidate: {candidate.name}")
    
    # Create candidate-specific folder
    safe_name = "".join(c for c in candidate.name if c.isalnum() or c in (' ', '_')).strip()
    safe_name = safe_name.replace(' ', '_')
    
    candidate_folder = Path(settings.UPLOAD_DIR) / safe_name
    candidate_folder.mkdir(parents=True, exist_ok=True)
    print(f"📁 Folder: {candidate_folder}")
    
    # Save video with timestamp
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    video_filename = f"interview_video_{timestamp}.webm"
    video_path = candidate_folder / video_filename
    print(f"💾 Saving to: {video_path}")
    
    # Save video file
    video_bytes = await video_file.read()
    size_mb = len(video_bytes) / 1024 / 1024
    print(f"📊 Size: {len(video_bytes)} bytes ({size_mb:.2f} MB)")
    
    if len(video_bytes) == 0:
        print("❌ ERROR: Video file is empty!")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Video file is empty"
        )
    
    with open(video_path, "wb") as f:
        f.write(video_bytes)
    
    print(f"✅ File saved to disk")
    
    # Update database
    print(f"💾 Updating database...")
    session.video_file_path = str(video_path)
    session.video_size_mb = round(size_mb, 2)
    session.video_uploaded_at = datetime.utcnow()
    
    try:
        db.commit()
        db.refresh(session)
        
        # Verify
        if session.video_file_path:
            print(f"✅ DATABASE UPDATED")
            print(f"   Path in DB: {session.video_file_path}")
            print(f"   Size: {session.video_size_mb} MB")
        else:
            print(f"❌ ERROR: Path is None after commit!")
            raise Exception("Database update failed - path is None")
            
    except Exception as e:
        print(f"❌ DATABASE ERROR: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database update failed: {str(e)}"
        )
    
    print("="*60)
    print(f"✅ UPLOAD COMPLETE")
    print("="*60 + "\n")
    
    return {
        "message": "Video uploaded successfully",
        "path": str(video_path),
        "size_mb": round(size_mb, 2)
    }


@router.get("/{session_id}/video/download")
async def download_interview_video(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Download interview video."""
    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id
    ).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview session not found"
        )
    
    # Verify HR owns this job
    if session.candidate.job.hr_user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    print(f"[VIDEO DOWNLOAD] Session {session_id}")
    print(f"[VIDEO DOWNLOAD] Video path in DB: {session.video_file_path}")
    print(f"[VIDEO DOWNLOAD] File exists: {os.path.exists(session.video_file_path) if session.video_file_path else False}")
    
    if not session.video_file_path:
        print(f"[VIDEO DOWNLOAD] ERROR: No video path in database")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not uploaded yet"
        )
    
    if not os.path.exists(session.video_file_path):
        print(f"[VIDEO DOWNLOAD] ERROR: File does not exist at path: {session.video_file_path}")
        # Try to find the file
        candidate_name = "".join(c for c in session.candidate.name if c.isalnum() or c in (' ', '_')).strip().replace(' ', '_')
        candidate_folder = Path(settings.UPLOAD_DIR) / candidate_name
        print(f"[VIDEO DOWNLOAD] Checking folder: {candidate_folder}")
        if candidate_folder.exists():
            video_files = list(candidate_folder.glob("interview_video_*.webm"))
            print(f"[VIDEO DOWNLOAD] Found {len(video_files)} video files in folder")
            if video_files:
                print(f"[VIDEO DOWNLOAD] Using: {video_files[0]}")
                session.video_file_path = str(video_files[0])
                db.commit()
            else:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Video file not found in uploads folder"
                )
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Video not found"
            )
    
    # Return file for download
    from fastapi.responses import FileResponse
    return FileResponse(
        session.video_file_path,
        media_type='video/webm',
        filename=f"interview_{session.candidate.name}_{session_id}.webm"
    )


@router.post("/{session_id}/end")
async def end_interview_early(
    session_id: int,
    db: Session = Depends(get_db)
):
    """End interview early and finalize with current progress."""
    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id
    ).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview session not found"
        )
    
    if session.status == InterviewStatus.COMPLETED:
        return {"message": "Interview already completed"}
    
    # Finalize with current answers
    finalize_interview(session, db)
    
    return {
        "message": "Interview ended successfully",
        "final_score": session.final_score,
        "final_recommendation": session.final_recommendation
    }


@router.get("/{session_id}")
async def get_interview_session(
    session_id: int,
    db: Session = Depends(get_db)
):
    """Get interview session metadata."""
    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id
    ).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview session not found"
        )
    
    candidate = session.candidate
    job = candidate.job
    
    return {
        "session_id": session.id,
        "status": session.status.value,
        "candidate_name": candidate.name,
        "job_title": job.title,
        "started_at": session.started_at,
        "ended_at": session.ended_at
    }


# WebSocket for real-time status updates
@router.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: int):
    """WebSocket endpoint for real-time interview status."""
    await websocket.accept()
    
    try:
        while True:
            # Wait for messages from client
            data = await websocket.receive_json()
            
            # Echo status updates
            await websocket.send_json({
                "type": "status",
                "data": data
            })
    except WebSocketDisconnect:
        print(f"WebSocket disconnected for session {session_id}")
