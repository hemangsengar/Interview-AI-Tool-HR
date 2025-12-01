"""Service for parsing JD and resume documents."""
import re
from typing import Dict, List, Any
from io import BytesIO
import PyPDF2
import docx


class ParsingService:
    """Service for parsing job descriptions and resumes."""
    
    # Common technical skills keywords
    COMMON_SKILLS = [
        "Python", "Java", "JavaScript", "TypeScript", "C++", "C#", "Go", "Rust", "Ruby", "PHP",
        "React", "Angular", "Vue", "Node.js", "Django", "Flask", "FastAPI", "Spring", "Express",
        "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch",
        "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Jenkins", "CI/CD",
        "Git", "Linux", "REST", "GraphQL", "Microservices", "API",
        "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "NLP",
        "HTML", "CSS", "Tailwind", "Bootstrap", "Sass",
        "Agile", "Scrum", "Testing", "Jest", "Pytest", "Selenium"
    ]
    
    def parse_jd(self, jd_text: str, must_have_skills: List[str], good_to_have_skills: List[str]) -> Dict[str, Any]:
        """
        Parse job description to extract key information.
        
        Returns: Dict with parsed JD data
        """
        # Extract skills from text if not provided
        extracted_skills = self._extract_skills(jd_text)
        
        # Combine with provided skills
        all_must_have = list(set(must_have_skills + [s for s in extracted_skills if s in must_have_skills]))
        all_good_to_have = list(set(good_to_have_skills))
        
        # Extract experience requirements
        experience_years = self._extract_experience(jd_text)
        
        # Extract role level
        role_level = self._extract_role_level(jd_text)
        
        return {
            "must_have_skills": all_must_have if all_must_have else must_have_skills,
            "good_to_have_skills": all_good_to_have if all_good_to_have else good_to_have_skills,
            "experience_years": experience_years,
            "role_level": role_level,
            "summary": jd_text[:200] + "..." if len(jd_text) > 200 else jd_text
        }
    
    def parse_resume(self, resume_text: str) -> Dict[str, Any]:
        """
        Parse resume to extract skills, experience, and projects.
        
        Returns: Dict with parsed resume data
        """
        # Extract skills
        skills = self._extract_skills(resume_text)
        
        # Extract experience
        experience_years = self._extract_experience(resume_text)
        
        # Extract projects
        projects = self._extract_projects(resume_text)
        
        # Extract education
        education = self._extract_education(resume_text)
        
        return {
            "skills": skills,
            "experience_years": experience_years,
            "projects": projects,
            "education": education,
            "summary": resume_text[:300] + "..." if len(resume_text) > 300 else resume_text
        }
    
    def extract_text_from_pdf(self, pdf_bytes: bytes) -> str:
        """Extract text from PDF file."""
        try:
            pdf_file = BytesIO(pdf_bytes)
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            return text.strip()
        except Exception as e:
            print(f"Error extracting PDF text: {e}")
            return ""
    
    def extract_text_from_docx(self, docx_bytes: bytes) -> str:
        """Extract text from DOCX file."""
        try:
            doc_file = BytesIO(docx_bytes)
            doc = docx.Document(doc_file)
            text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
            return text.strip()
        except Exception as e:
            print(f"Error extracting DOCX text: {e}")
            return ""
    
    def _extract_skills(self, text: str) -> List[str]:
        """Extract technical skills from text."""
        found_skills = []
        text_lower = text.lower()
        
        for skill in self.COMMON_SKILLS:
            # Case-insensitive search with word boundaries
            pattern = r'\b' + re.escape(skill.lower()) + r'\b'
            if re.search(pattern, text_lower):
                found_skills.append(skill)
        
        return found_skills
    
    def _extract_experience(self, text: str) -> int:
        """Extract years of experience from text."""
        # Patterns like "5 years", "5+ years", "5-7 years"
        patterns = [
            r'(\d+)\+?\s*(?:years?|yrs?)',
            r'(\d+)\s*-\s*\d+\s*(?:years?|yrs?)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text.lower())
            if match:
                return int(match.group(1))
        
        return 0
    
    def _extract_role_level(self, text: str) -> str:
        """Extract role level from JD text."""
        text_lower = text.lower()
        
        if any(word in text_lower for word in ["senior", "lead", "principal", "staff"]):
            return "senior"
        elif any(word in text_lower for word in ["junior", "entry", "associate"]):
            return "junior"
        else:
            return "mid"
    
    def _extract_projects(self, text: str) -> List[Dict[str, str]]:
        """Extract project information from resume."""
        projects = []
        
        # Simple heuristic: look for "Project" headers
        lines = text.split('\n')
        current_project = None
        
        for i, line in enumerate(lines):
            line_lower = line.lower().strip()
            
            # Detect project headers
            if 'project' in line_lower and len(line) < 100:
                if current_project:
                    projects.append(current_project)
                
                current_project = {
                    "title": line.strip(),
                    "description": ""
                }
            elif current_project and line.strip():
                # Add to current project description
                current_project["description"] += " " + line.strip()
        
        if current_project:
            projects.append(current_project)
        
        # Limit description length
        for project in projects:
            if len(project["description"]) > 200:
                project["description"] = project["description"][:200] + "..."
        
        return projects[:5]  # Return max 5 projects
    
    def _extract_education(self, text: str) -> List[str]:
        """Extract education information."""
        education = []
        degrees = ["B.Tech", "B.E.", "M.Tech", "M.E.", "MBA", "MCA", "BCA", "B.Sc", "M.Sc", "PhD", "Bachelor", "Master"]
        
        for degree in degrees:
            if degree.lower() in text.lower():
                education.append(degree)
        
        return list(set(education))
    
    def analyze_skill_gap(
        self,
        jd_parsed: Dict[str, Any],
        resume_parsed: Dict[str, Any]
    ) -> Dict[str, List[str]]:
        """
        Analyze skill gap between JD requirements and candidate resume.
        
        Returns: Dict with matched, missing, and extra skills
        """
        jd_must_have = set(jd_parsed.get("must_have_skills", []))
        jd_good_to_have = set(jd_parsed.get("good_to_have_skills", []))
        resume_skills = set(resume_parsed.get("skills", []))
        
        # Matched skills
        matched_must_have = jd_must_have.intersection(resume_skills)
        matched_good_to_have = jd_good_to_have.intersection(resume_skills)
        
        # Missing skills
        missing_must_have = jd_must_have - resume_skills
        missing_good_to_have = jd_good_to_have - resume_skills
        
        # Extra skills
        all_jd_skills = jd_must_have.union(jd_good_to_have)
        extra_skills = resume_skills - all_jd_skills
        
        return {
            "matched_must_have": list(matched_must_have),
            "matched_good_to_have": list(matched_good_to_have),
            "missing_must_have": list(missing_must_have),
            "missing_good_to_have": list(missing_good_to_have),
            "extra_skills": list(extra_skills)
        }


# Singleton instance
parsing_service = ParsingService()
