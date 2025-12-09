"""Job management routes."""
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form, Request
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
import random
import string
import os
import shutil
from pathlib import Path
from ..database import get_db
from ..models import User, Job, Candidate, InterviewSession, InterviewStatus
from ..schemas import JobCreate, JobResponse, CandidateCreate, CandidateResponse
from ..auth import get_current_user
from ..services.parsing_service import parsing_service
from datetime import datetime
from ..middleware.rate_limiter import rate_limiter

router = APIRouter()

# Ensure uploads directory exists
UPLOAD_DIR = Path("uploads/resumes")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def generate_job_code(db: Session) -> str:
    """Generate a unique 6-character job code."""
    while True:
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        existing = db.query(Job).filter(Job.job_code == code).first()
        if not existing:
            return code


@router.post("", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
async def create_job(
    request: Request,
    job_data: JobCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new job posting with unique job code."""
    # Rate limit: 20 job creations per day per IP
    client_ip = request.client.host if request.client else "unknown"
    rate_limiter.check_rate_limit(client_ip, max_requests=20, window_seconds=86400)
    
    job_code = generate_job_code(db)
    
    new_job = Job(
        hr_user_id=current_user.id,
        title=job_data.title,
        jd_raw_text=job_data.jd_raw_text,
        must_have_skills=job_data.must_have_skills,
        good_to_have_skills=job_data.good_to_have_skills,
        job_code=job_code,
        is_active=1
    )
    
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    
    response = JobResponse.model_validate(new_job)
    response.candidate_count = 0
    response.is_active = bool(new_job.is_active)
    return response


@router.get("", response_model=List[JobResponse])
async def list_jobs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all jobs for the current HR user."""
    jobs = db.query(Job).filter(Job.hr_user_id == current_user.id).all()
    
    result = []
    for job in jobs:
        job_response = JobResponse.model_validate(job)
        job_response.candidate_count = len(job.candidates)
        job_response.is_active = bool(job.is_active) if job.is_active is not None else True
        result.append(job_response)
    
    return result


@router.get("/by-code/{job_code}")
async def get_job_by_code(
    job_code: str,
    db: Session = Depends(get_db)
):
    """Get job by code for candidate application."""
    job = db.query(Job).filter(
        Job.job_code == job_code.upper(),
        Job.is_active == 1
    ).first()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job code not found or job is inactive"
        )
    
    return {
        "id": job.id,
        "title": job.title,
        "jd_raw_text": job.jd_raw_text,
        "must_have_skills": job.must_have_skills,
        "good_to_have_skills": job.good_to_have_skills,
        "job_code": job.job_code
    }


@router.get("/{job_id}", response_model=JobResponse)
async def get_job(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get job details."""
    job = db.query(Job).filter(
        Job.id == job_id,
        Job.hr_user_id == current_user.id
    ).first()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    job_response = JobResponse.model_validate(job)
    job_response.candidate_count = len(job.candidates)
    job_response.is_active = bool(job.is_active) if job.is_active is not None else True
    return job_response


@router.get("/{job_id}/candidates", response_model=List[CandidateResponse])
async def list_candidates(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all candidates for a job."""
    # Verify job belongs to current user
    job = db.query(Job).filter(
        Job.id == job_id,
        Job.hr_user_id == current_user.id
    ).first()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    candidates = db.query(Candidate).filter(Candidate.job_id == job_id).all()
    
    result = []
    for candidate in candidates:
        candidate_response = CandidateResponse.model_validate(candidate)
        if candidate.interview_session:
            candidate_response.interview_session_id = candidate.interview_session.id
            candidate_response.final_score = candidate.interview_session.final_score
            candidate_response.final_recommendation = candidate.interview_session.final_recommendation
        result.append(candidate_response)
    
    return result


@router.post("/{job_id}/candidates", status_code=status.HTTP_201_CREATED)
async def register_candidate(
    request: Request,
    job_id: int,
    name: str = Form(...),
    email: str = Form(...),
    resume_file: UploadFile = File(None),
    resume_text: str = Form(None),
    db: Session = Depends(get_db)
):
    """Register a candidate for a job and create interview session."""
    # Rate limit: 5 candidate applications per hour per IP
    client_ip = request.client.host if request.client else "unknown"
    rate_limiter.check_rate_limit(client_ip, max_requests=5, window_seconds=3600)
    
    # Verify job exists
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    resume_file_path = None
    
    # Extract resume text and save file
    if resume_file:
        file_bytes = await resume_file.read()
        filename = resume_file.filename.lower()
        
        # Save the file
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        safe_filename = f"{timestamp}_{name.replace(' ', '_')}_{resume_file.filename}"
        file_path = UPLOAD_DIR / safe_filename
        
        with open(file_path, "wb") as f:
            f.write(file_bytes)
        
        resume_file_path = str(file_path)
        
        if filename.endswith('.pdf'):
            resume_text = parsing_service.extract_text_from_pdf(file_bytes)
        elif filename.endswith('.docx'):
            resume_text = parsing_service.extract_text_from_docx(file_bytes)
        else:
            resume_text = file_bytes.decode('utf-8', errors='ignore')
    
    if not resume_text or len(resume_text.strip()) < 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resume text is required and must be at least 10 characters"
        )
    
    # Parse resume
    resume_parsed = parsing_service.parse_resume(resume_text)
    
    # Create candidate
    new_candidate = Candidate(
        job_id=job_id,
        name=name,
        email=email,
        resume_raw_text=resume_text,
        resume_file_path=resume_file_path,
        resume_parsed_json=resume_parsed
    )
    
    db.add(new_candidate)
    db.commit()
    db.refresh(new_candidate)
    
    # Create interview session
    interview_session = InterviewSession(
        candidate_id=new_candidate.id,
        status=InterviewStatus.SCHEDULED
    )
    
    db.add(interview_session)
    db.commit()
    db.refresh(interview_session)
    
    return {
        "candidate_id": new_candidate.id,
        "interview_session_id": interview_session.id,
        "message": "Candidate registered successfully",
        "interview_url": f"/interview/{interview_session.id}"
    }


@router.get("/candidates/{candidate_id}/resume")
async def download_resume(
    candidate_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Download candidate's resume file."""
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    # Verify HR owns this job
    job = db.query(Job).filter(
        Job.id == candidate.job_id,
        Job.hr_user_id == current_user.id
    ).first()
    
    if not job:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if not candidate.resume_file_path or not os.path.exists(candidate.resume_file_path):
        raise HTTPException(status_code=404, detail="Resume file not found")
    
    return FileResponse(
        candidate.resume_file_path,
        filename=os.path.basename(candidate.resume_file_path),
        media_type='application/octet-stream'
    )


@router.put("/{job_id}")
async def update_job(
    job_id: int,
    title: str = Form(...),
    jd_raw_text: str = Form(...),
    must_have_skills: str = Form(...),
    good_to_have_skills: str = Form(""),
    jd_file: UploadFile = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a job posting."""
    job = db.query(Job).filter(
        Job.id == job_id,
        Job.hr_user_id == current_user.id
    ).first()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # If JD file is uploaded, extract text
    if jd_file:
        file_bytes = await jd_file.read()
        filename = jd_file.filename.lower()
        
        if filename.endswith('.pdf'):
            jd_text_from_file = parsing_service.extract_text_from_pdf(file_bytes)
        elif filename.endswith('.docx') or filename.endswith('.doc'):
            jd_text_from_file = parsing_service.extract_text_from_docx(file_bytes)
        else:
            jd_text_from_file = file_bytes.decode('utf-8', errors='ignore')
        
        if jd_text_from_file and len(jd_text_from_file.strip()) > 10:
            jd_raw_text = jd_text_from_file
    
    # Update job fields
    job.title = title
    job.jd_raw_text = jd_raw_text
    job.must_have_skills = [s.strip() for s in must_have_skills.split(',') if s.strip()]
    job.good_to_have_skills = [s.strip() for s in good_to_have_skills.split(',') if s.strip()]
    
    db.commit()
    db.refresh(job)
    
    job_response = JobResponse.model_validate(job)
    job_response.candidate_count = len(job.candidates)
    job_response.is_active = bool(job.is_active) if job.is_active is not None else True
    return job_response


@router.delete("/{job_id}")
async def delete_job(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a job and all associated candidates and interviews."""
    job = db.query(Job).filter(
        Job.id == job_id,
        Job.hr_user_id == current_user.id
    ).first()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Delete all candidate resume files
    for candidate in job.candidates:
        if candidate.resume_file_path and os.path.exists(candidate.resume_file_path):
            try:
                os.remove(candidate.resume_file_path)
            except:
                pass
    
    # Delete job (cascade will delete candidates, interview sessions, and related data)
    db.delete(job)
    db.commit()
    
    return {"message": "Job deleted successfully"}


@router.delete("/candidates/{candidate_id}")
async def delete_candidate(
    candidate_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a candidate and their interview history."""
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    # Verify HR owns this job
    job = db.query(Job).filter(
        Job.id == candidate.job_id,
        Job.hr_user_id == current_user.id
    ).first()
    
    if not job:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Delete resume file if exists
    if candidate.resume_file_path and os.path.exists(candidate.resume_file_path):
        try:
            os.remove(candidate.resume_file_path)
        except:
            pass
    
    # Manually delete related data in correct order to avoid constraint issues
    if candidate.interview_session:
        session = candidate.interview_session
        
        # Delete all answers first
        for question in session.questions:
            if question.answer:
                db.delete(question.answer)
        
        # Delete all questions
        for question in session.questions:
            db.delete(question)
        
        # Delete interview session
        db.delete(session)
    
    # Delete candidate
    db.delete(candidate)
    db.commit()
    
    return {"message": "Candidate deleted successfully"}
