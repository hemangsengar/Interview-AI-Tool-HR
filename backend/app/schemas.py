"""Pydantic schemas for request/response validation."""
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum


# Enums
class InterviewStatusEnum(str, Enum):
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class RecommendationEnum(str, Enum):
    STRONG = "Strong"
    MEDIUM = "Medium"
    WEAK = "Weak"
    REJECT = "Reject"


class CandidateStatusEnum(str, Enum):
    PENDING = "Pending"
    SHORTLISTED = "Shortlisted"
    REJECTED = "Rejected"


# Auth Schemas
class UserSignup(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    created_at: datetime
    
    class Config:
        from_attributes = True


# Job Schemas
class JobCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    jd_raw_text: str = Field(..., min_length=10)
    must_have_skills: List[str] = Field(default_factory=list)
    good_to_have_skills: List[str] = Field(default_factory=list)


class JobResponse(BaseModel):
    id: int
    title: str
    jd_raw_text: str
    must_have_skills: List[str]
    good_to_have_skills: List[str]
    job_code: Optional[str] = None
    is_active: Optional[bool] = True
    created_at: datetime
    candidate_count: Optional[int] = 0
    
    class Config:
        from_attributes = True


# Candidate Schemas
class CandidateCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    resume_text: str = Field(..., min_length=10)


class CandidateResponse(BaseModel):
    id: int
    name: str
    email: str
    status: CandidateStatusEnum
    resume_file_path: Optional[str] = None
    created_at: datetime
    interview_session_id: Optional[int] = None
    final_score: Optional[float] = None
    final_recommendation: Optional[RecommendationEnum] = None
    
    class Config:
        from_attributes = True


# Interview Schemas
class InterviewStartResponse(BaseModel):
    session_id: int
    status: str
    message: str


class QuestionResponse(BaseModel):
    question_id: int
    question_text: str
    question_number: int
    total_questions: int
    audio_url: Optional[str] = None
    is_last: bool = False


class AnswerSubmit(BaseModel):
    transcript: Optional[str] = None  # Can be provided or extracted from audio


class AnswerEvaluation(BaseModel):
    correctness: float
    depth: float
    clarity: float
    relevance: float
    comment: str
    is_interview_complete: bool = False


class QuestionDetail(BaseModel):
    question_text: str
    question_type: str
    skill: Optional[str]
    answer_transcript: Optional[str]
    correctness_score: Optional[float]
    depth_score: Optional[float]
    clarity_score: Optional[float]
    relevance_score: Optional[float]
    comment: Optional[str]


class InterviewResults(BaseModel):
    session_id: int
    candidate_name: str
    candidate_email: str
    job_title: str
    jd_text: str
    resume_summary: Dict[str, Any]
    questions_and_answers: List[QuestionDetail]
    final_score: Optional[float]
    final_recommendation: Optional[RecommendationEnum]
    final_report: Optional[str]
    status: InterviewStatusEnum


# WebSocket Messages
class WSMessage(BaseModel):
    type: str  # "status", "question", "error"
    data: Dict[str, Any]
