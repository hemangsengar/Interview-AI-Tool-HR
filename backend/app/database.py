"""Database configuration and session management."""
from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, scoped_session
from .config import settings

# For in-memory SQLite, we need special handling to share across threads
is_memory_db = settings.DATABASE_URL == "sqlite:///:memory:"

if is_memory_db:
    # In-memory SQLite: use check_same_thread=False and StaticPool
    # This ensures the same connection is reused across all requests
    from sqlalchemy.pool import StaticPool
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        echo=False  # Set to True for SQL debugging
    )
else:
    # File-based SQLite or other databases
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20
    )

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for ORM models
Base = declarative_base()

# Track if demo data has been initialized
_demo_initialized = False


def get_db():
    """Dependency for getting database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database by creating all tables."""
    from . import models  # Import models to register them with Base
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully!")
    
    # Always try to initialize demo data (check inside the function)
    print(f"[INIT] DEMO_MODE setting: {settings.DEMO_MODE}")
    print(f"[INIT] DATABASE_URL: {settings.DATABASE_URL}")
    _init_demo_data()


def _init_demo_data():
    """Populate database with demo data for testing."""
    global _demo_initialized
    
    # Always check and create demo data on startup for in-memory DB
    # This ensures data exists even after cold starts
    print("[DEMO] Starting demo data initialization...")
    
    from .models import User, Job
    from passlib.context import CryptContext
    
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    db = SessionLocal()
    try:
        # Check if demo jobs already exist (more reliable than checking user)
        existing_jobs = db.query(Job).filter(Job.job_code.in_(['PY2024', 'JS2024', 'DS2024'])).count()
        if existing_jobs >= 3:
            print(f"[DEMO] Demo jobs already exist ({existing_jobs} found), skipping initialization")
            _demo_initialized = True
            return
        
        print(f"[DEMO] Found only {existing_jobs} demo jobs, creating/recreating demo data...")
        
        # Check if demo user already exists
        existing_user = db.query(User).filter(User.email == "demo@interview.ai").first()
        
        if existing_user:
            demo_user = existing_user
            print("[DEMO] Using existing demo user")
        else:
            # Create demo HR user
            print("[DEMO] Creating new demo user...")
            demo_user = User(
                name="Demo HR Manager",
                email="demo@interview.ai",
                password_hash=pwd_context.hash("demo123"),
                role="hr"
            )
            db.add(demo_user)
            db.flush()  # Get the user ID
        
        # Create demo job postings
        demo_jobs = [
            Job(
                hr_user_id=demo_user.id,
                title="Senior Python Developer",
                jd_raw_text="""
We are looking for a Senior Python Developer to join our engineering team.

Responsibilities:
- Design and implement scalable backend services using Python
- Work with FastAPI/Django for REST API development
- Optimize database queries and manage PostgreSQL/MongoDB
- Collaborate with frontend team on API design
- Write unit tests and maintain code quality
- Participate in code reviews and mentoring

Requirements:
- 5+ years of Python development experience
- Strong knowledge of FastAPI or Django
- Experience with SQL and NoSQL databases
- Familiarity with Docker and Kubernetes
- Understanding of CI/CD pipelines
- Excellent problem-solving skills
                """.strip(),
                job_code="PY2024",
                must_have_skills=["Python", "FastAPI", "PostgreSQL", "REST APIs", "Git"],
                good_to_have_skills=["Docker", "Kubernetes", "Redis", "AWS", "MongoDB"],
                is_active=1
            ),
            Job(
                hr_user_id=demo_user.id,
                title="Full Stack JavaScript Developer",
                jd_raw_text="""
Join our team as a Full Stack JavaScript Developer!

Responsibilities:
- Build responsive web applications using React.js
- Develop backend services with Node.js and Express
- Design and implement RESTful APIs
- Work with MongoDB and PostgreSQL databases
- Ensure application performance and security
- Collaborate with UX designers

Requirements:
- 3+ years of JavaScript/TypeScript experience
- Proficiency in React.js and Node.js
- Experience with Express.js or similar frameworks
- Knowledge of HTML5, CSS3, and responsive design
- Familiarity with Git and agile methodologies
- Strong communication skills
                """.strip(),
                job_code="JS2024",
                must_have_skills=["JavaScript", "React.js", "Node.js", "MongoDB", "HTML/CSS"],
                good_to_have_skills=["TypeScript", "Next.js", "GraphQL", "AWS", "Docker"],
                is_active=1
            ),
            Job(
                hr_user_id=demo_user.id,
                title="Data Scientist - Machine Learning",
                jd_raw_text="""
We're hiring a Data Scientist to work on cutting-edge ML projects!

Responsibilities:
- Develop and deploy machine learning models
- Analyze large datasets to extract insights
- Build data pipelines and ETL processes
- Create visualizations and dashboards
- Collaborate with product team on AI features
- Stay updated with latest ML research

Requirements:
- MS/PhD in Computer Science, Statistics, or related field
- 3+ years of experience in data science
- Strong Python skills with Pandas, NumPy, Scikit-learn
- Experience with deep learning frameworks (TensorFlow/PyTorch)
- Knowledge of SQL and data warehousing
- Excellent analytical and communication skills
                """.strip(),
                job_code="DS2024",
                must_have_skills=["Python", "Machine Learning", "Pandas", "SQL", "Statistics"],
                good_to_have_skills=["TensorFlow", "PyTorch", "Spark", "AWS SageMaker", "NLP"],
                is_active=1
            )
        ]
        
        db.add_all(demo_jobs)
        db.commit()
        
        _demo_initialized = True
        print("✅ Demo data initialized successfully!")
        print("   📧 Demo login: demo@interview.ai / demo123")
        print(f"   📋 Created {len(demo_jobs)} demo job postings")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error initializing demo data: {e}")
    finally:
        db.close()
