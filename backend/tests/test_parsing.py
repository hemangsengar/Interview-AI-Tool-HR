"""Tests for parsing service."""
import pytest
from app.services.parsing_service import parsing_service


def test_extract_skills():
    """Test skill extraction from text."""
    text = "I have experience with Python, React, and SQL databases. Also worked with Docker."
    skills = parsing_service._extract_skills(text)
    
    assert "Python" in skills
    assert "React" in skills
    assert "SQL" in skills
    assert "Docker" in skills


def test_extract_experience():
    """Test experience extraction."""
    text = "I have 5 years of experience in software development."
    years = parsing_service._extract_experience(text)
    assert years == 5
    
    text2 = "3+ years working with cloud technologies"
    years2 = parsing_service._extract_experience(text2)
    assert years2 == 3


def test_parse_resume():
    """Test resume parsing."""
    resume_text = """
    John Doe
    Software Engineer with 5 years of experience
    
    Skills: Python, JavaScript, React, SQL, Docker
    
    Project: E-commerce Platform
    Built a scalable e-commerce platform using React and Node.js
    """
    
    parsed = parsing_service.parse_resume(resume_text)
    
    assert "skills" in parsed
    assert "experience_years" in parsed
    assert "projects" in parsed
    assert len(parsed["skills"]) > 0
    assert parsed["experience_years"] >= 0


def test_skill_gap_analysis():
    """Test skill gap analysis."""
    jd_parsed = {
        "must_have_skills": ["Python", "SQL", "React"],
        "good_to_have_skills": ["Docker", "AWS"]
    }
    
    resume_parsed = {
        "skills": ["Python", "React", "JavaScript", "Git"]
    }
    
    gap = parsing_service.analyze_skill_gap(jd_parsed, resume_parsed)
    
    assert "Python" in gap["matched_must_have"]
    assert "React" in gap["matched_must_have"]
    assert "SQL" in gap["missing_must_have"]
    assert "JavaScript" in gap["extra_skills"]


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
