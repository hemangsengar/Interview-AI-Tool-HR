# Replacement for generate_next_question method
# This uses type-specific prompts to FORCE correct question generation

def generate_next_question(
    self,
    plan_item: Dict[str, Any],
    jd_text: str,
    resume_summary: Dict[str, Any],
    question_index: int,
    previous_context: Optional[str] = None,
) -> str:
    """Generate the actual question text based on a plan item."""
    
    question_type = plan_item['type']
    skill = plan_item.get('skill', 'General')
    
    print(f"[QUESTION GEN] Q#{question_index}, Type: {question_type}, Skill: {skill}")
    
    # CRITICAL: Use type-specific prompts to FORCE correct generation
    if question_type == "technical":
        prompt = f"""You are a technical interviewer. Generate ONE TECHNICAL question.

MANDATORY: Ask about {skill if skill else 'technical concepts'}.

JOB: {jd_text[:300]}
CANDIDATE SKILLS: {', '.join(resume_summary.get('skills', [])[:5])}
FOCUS: {plan_item['focus']}

Ask candidate to EXPLAIN, DESCRIBE, COMPARE, or DESIGN something technical about {skill if skill else 'their skills'}.

DO NOT ask about motivation, teamwork, or career.
ONLY technical questions.

Return ONLY the question."""

    elif question_type == "project":
        prompt = f"""Generate ONE PROJECT question about past work.

MANDATORY: Ask about candidate's PAST PROJECTS.

FOCUS: {plan_item['focus']}

Ask about: specific project, challenges faced, technical decisions, their role, impact.

DO NOT ask technical concepts.
DO NOT ask motivation/career.
ONLY past project experience.

Return ONLY the question."""

    elif question_type in ["hr", "behavioral"]:
        prompt = f"""Generate ONE BEHAVIORAL/HR question.

MANDATORY: Ask about SOFT SKILLS, not technical.

FOCUS: {plan_item['focus']}

Ask about: teamwork, leadership, conflicts, pressure, career goals, motivation.

DO NOT ask technical.
DO NOT ask projects.
ONLY behavioral/HR.

Return ONLY the question."""

    else:
        prompt = f"""Generate question: Type={question_type}, Skill={skill}, Focus={plan_item['focus']}"""

    try:
        response = self.model.generate_content(prompt)
        question = response.text.strip().strip('"').strip("'")
        print(f"[QUESTION GEN] Generated: {question[:60]}...")
        return question
    except Exception as e:
        print(f"[QUESTION GEN] Error: {e}, using fallback")
        return self._get_fallback_question(plan_item)
