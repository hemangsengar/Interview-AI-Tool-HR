"""SQLAlchemy ORM models for the application."""
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, JSON, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import enum
from .database import Base


class InterviewStatus(str, enum.Enum):
    """Interview session status."""
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class RecommendationType(str, enum.Enum):
    """Final recommendation types."""
    STRONG = "Strong"
    MEDIUM = "Medium"
    WEAK = "Weak"
    REJECT = "Reject"


class CandidateStatus(str, enum.Enum):
    """Candidate review status."""
    PENDING = "Pending"
    SHORTLISTED = "Shortlisted"
    REJECTED = "Rejected"


class UserRole(str, Enum):
    """User role enum."""
    HR = "hr"
    ADMIN = "admin"


class User(Base):
    """HR user model."""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="hr")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    jobs = relationship("Job", back_populates="hr_user")


class Job(Base):
    """Job posting model."""
    __tablename__ = "jobs"
    
    id = Column(Integer, primary_key=True, index=True)
    hr_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    jd_raw_text = Column(Text, nullable=False)
    must_have_skills = Column(JSON, default=list)  # List of strings
    good_to_have_skills = Column(JSON, default=list)  # List of strings
    job_code = Column(String(10), unique=True, nullable=True)  # Unique 6-digit code
    is_active = Column(Integer, default=1)  # SQLite uses INTEGER for boolean
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    hr_user = relationship("User", back_populates="jobs")
    candidates = relationship("Candidate", back_populates="job", cascade="all, delete-orphan")


class Candidate(Base):
    """Candidate model."""
    __tablename__ = "candidates"
    
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    resume_raw_text = Column(Text, nullable=False)
    resume_file_path = Column(String(500), nullable=True)  # Store uploaded resume file path
    resume_parsed_json = Column(JSON, default=dict)  # {skills: [], experience: [], projects: []}
    status = Column(Enum(CandidateStatus), default=CandidateStatus.PENDING)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    job = relationship("Job", back_populates="candidates")
    interview_session = relationship("InterviewSession", back_populates="candidate", uselist=False, cascade="all, delete-orphan")


class InterviewSession(Base):
    """Interview session model."""
    __tablename__ = "interview_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False, unique=True)
    status = Column(Enum(InterviewStatus), default=InterviewStatus.SCHEDULED)
    started_at = Column(DateTime(timezone=True))
    ended_at = Column(DateTime(timezone=True))
    final_score = Column(Float)  # 0-100
    final_recommendation = Column(Enum(RecommendationType))
    final_report_text = Column(Text)
    session_metadata = Column(JSON, default=dict)  # For future extensions (renamed from metadata)
    video_file_path = Column(String(500), nullable=True)  # Compressed video path
    video_size_mb = Column(Float, nullable=True)  # Video size in MB
    video_uploaded_at = Column(DateTime(timezone=True))  # Upload timestamp
    
    # Relationships
    candidate = relationship("Candidate", back_populates="interview_session")
    questions = relationship("InterviewQuestion", back_populates="session", cascade="all, delete-orphan")


class InterviewQuestion(Base):
    """Interview question model."""
    __tablename__ = "interview_questions"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("interview_sessions.id"), nullable=False)
    index = Column(Integer, nullable=False)  # Question number (1, 2, 3...)
    question_text = Column(Text, nullable=False)
    question_type = Column(String(50))  # technical, project, behavioral
    skill = Column(String(100))  # e.g., "Python", "SQL"
    difficulty = Column(String(20))  # basic, medium, advanced
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    session = relationship("InterviewSession", back_populates="questions")
    answer = relationship("InterviewAnswer", back_populates="question", uselist=False, cascade="all, delete-orphan")


class InterviewAnswer(Base):
    """Interview answer model."""
    __tablename__ = "interview_answers"
    
    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("interview_questions.id"), nullable=False, unique=True)
    answer_transcript_text = Column(Text)
    audio_file_path = Column(String(500))
    correctness_score = Column(Float)  # 0-5
    depth_score = Column(Float)  # 0-5
    clarity_score = Column(Float)  # 0-5
    relevance_score = Column(Float)  # 0-5
    comment_text = Column(Text)  # LLM feedback
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    question = relationship("InterviewQuestion", back_populates="answer")
