# """LLM service using Google Gemini for interview logic."""
# import google.generativeai as genai
# import json
# from typing import Dict, List, Any, Optional
# from ..config import settings

# # Configure Gemini
# genai.configure(api_key=settings.GEMINI_API_KEY)


# class LLMService:
#     """Service for all LLM-based operations."""
    
#     def __init__(self):
#         """
#         Initialize Gemini model with automatic model selection.

#         Instead of hardcoding a model (which can cause 404 errors if the
#         client / API version doesn't support it), we:
#         - List available models
#         - Filter those that support generateContent
#         - Prefer newer/better models if available
#         - Fall back safely to gemini-pro
#         """
#         try:
#             models = list(genai.list_models())
#             available_models: List[str] = []

#             for m in models:
#                 # Only consider models that support text generation
#                 if "generateContent" in getattr(m, "supported_generation_methods", []):
#                     name = m.name
#                     # Names are often like "models/gemini-1.5-flash"
#                     if name.startswith("models/"):
#                         name = name.split("/")[-1]
#                     available_models.append(name)

#             # Our preference order
#             preferred_models = [
#                 "gemini-2.0-flash",
#                 "gemini-1.5-flash",
#                 "gemini-1.5-pro",
#                 "gemini-1.0-pro",
#                 "gemini-pro",
#             ]

#             selected_model = None
#             for pm in preferred_models:
#                 if pm in available_models:
#                     selected_model = pm
#                     break

#             if not selected_model:
#                 # If nothing from preferred list is found,
#                 # fall back to first available or gemini-pro
#                 if available_models:
#                     selected_model = available_models[0]
#                 else:
#                     selected_model = "gemini-pro"

#             print(f"[LLMService] Using Gemini model: {selected_model}")
#         except Exception as e:
#             print(f"[LLMService] Could not list models ({e}), falling back to 'gemini-pro'")
#             selected_model = "gemini-pro"

#         self.model = genai.GenerativeModel(selected_model)
    
#     def generate_interview_plan(
#         self,
#         jd_text: str,
#         jd_skills: Dict[str, List[str]],
#         resume_parsed: Dict[str, Any]
#     ) -> List[Dict[str, Any]]:
#         """
#         Generate an interview plan based on JD and resume.
#         Maximum 15 questions with diverse types.
        
#         Returns: List of plan items with type, skill, difficulty, etc.
#         """
#         prompt = f"""You are a senior professional interviewer and hiring manager.
# Your job is to design a STRUCTURED INTERVIEW PLAN (not the actual questions) 
# for a candidate based on the Job Description and their Resume.

# This plan will be used by another system to generate the real spoken questions.

# JOB DESCRIPTION:
# {jd_text}

# REQUIRED SKILLS (Must-have): {', '.join(jd_skills.get('must_have', []))}
# GOOD-TO-HAVE SKILLS: {', '.join(jd_skills.get('good_to_have', []))}

# CANDIDATE RESUME SUMMARY:
# Skills: {', '.join(resume_parsed.get('skills', []))}
# Experience: {resume_parsed.get('experience_years', 'Unknown')} years
# Projects: {len(resume_parsed.get('projects', []))} projects

# ========================================
# GOAL OF THE INTERVIEW
# ========================================
# The AI interviewer should:
# - Start with a warm greeting and 1–2 basic, low-pressure questions.
# - Begin with SIMPLE, FOUNDATIONAL questions.
# - Gradually increase difficulty as the candidate answers well.
# - Ask a MIX of:
#   - technical conceptual questions,
#   - LIMITED coding-style questions,
#   - project-based questions (from the resume),
#   - behavioral and managerial/HR-style questions.
# - Avoid boring the candidate with many questions on the same topic in a row.
# - Cover different aspects of the candidate: knowledge, reasoning, projects, behavior, ownership.

# ========================================
# QUESTION DISTRIBUTION (STRICT)
# ========================================
# Generate an interview PLAN with TOTAL 12–15 items.

# You are NOT generating the question text, only a PLAN item per question.

# Distribution (enforced):

# 1. INTRO / WARMUP (1–2 items):
#    - Type: "hr" or "behavioral"
#    - Difficulty: "basic"
#    - Focus on:
#      - Greeting, comfort, understanding candidate’s background and interest in the role.

# 2. TECHNICAL CONCEPTUAL QUESTIONS (4–5 items):
#    - Type: "technical"
#    - Focus on EXPLAINING CONCEPTS, REASONING, ARCHITECTURE, TRADE-OFFS.
#    - DO NOT make these coding tasks.
#    - Cover DIFFERENT must-have skills where possible.
#    - Difficulty: mix of "basic" and "medium", and at most 1 "advanced".

# 3. CODING-ORIENTED QUESTIONS (MAX 1–2 items):
#    - Type: "technical"
#    - These can involve solving a problem, describing an approach, or pseudo-code.
#    - DO NOT overuse words like "write code", "implement", "write a function".
#    - Mark clearly in "focus" that this is a coding-oriented assessment.
#    - Difficulty: "medium" or "advanced".

# 4. PROJECT / EXPERIENCE QUESTIONS (3–4 items):
#    - Type: "project"
#    - Must be based on the candidate’s projects in the resume.
#    - Focus on:
#      - Challenges faced,
#      - Technical decisions,
#      - Impact,
#      - Collaboration and ownership.

# 5. BEHAVIORAL / MANAGERIAL / HR QUESTIONS (2–3 items):
#    - Type: "behavioral" or "hr"
#    - Focus on:
#      - Teamwork,
#      - Leadership / ownership,
#      - Conflict resolution,
#      - Handling pressure and deadlines,
#      - Career goals and motivation.

# ========================================
# FLOW & DIVERSITY RULES
# ========================================
# - The plan should feel like a NATURAL conversation:
#   - Start with intro/warmup.
#   - Then move into easier technical/project questions.
#   - Then some deeper technical/coding.
#   - Then behavioral/managerial towards the end.
# - DO NOT group all technical questions together blindly.
# - DO NOT group all behavioral questions together.
# - Alternate between types where it makes sense.
# - Each item must target a DIFFERENT angle (different skill, topic, or behavior).
# - Avoid repeating the same skill/topic in adjacent items unless difficulty is increasing.

# ========================================
# OUTPUT FORMAT (IMPORTANT)
# ========================================
# Return ONLY a single valid JSON array with NO extra text.
# Do NOT include explanations or comments outside of JSON.

# Each element must have exactly this structure:

# [
#   {{
#     "type": "technical" | "project" | "behavioral" | "hr",
#     "skill": "specific skill name or null",
#     "difficulty": "basic" | "medium" | "advanced",
#     "focus": "short description of what this question should assess (NO full question text)"
#   }},
#   ...
# ]

# Constraints:
# - For intro/warmup items, use type "hr" or "behavioral" and skill = null.
# - For project items, type = "project" and skill may be a relevant tech or null.
# - For behavioral/managerial items, use type "behavioral" or "hr" and skill = null.
# - For coding-oriented items, set type = "technical" and mention "coding-style assessment" in the focus.

# Ensure the JSON is valid and parseable."""

#         try:
#             response = self.model.generate_content(prompt)
#             text = response.text.strip()
            
#             # Extract JSON from markdown code blocks if present
#             if "```json" in text:
#                 text = text.split("```json")[1].split("```")[0].strip()
#             elif "```" in text:
#                 text = text.split("```")[1].split("```")[0].strip()
            
#             plan = json.loads(text)
#             # Ensure we have between 8-15 questions
#             if len(plan) > 15:
#                 plan = plan[:15]
#             elif len(plan) < 8:
#                 # Add fallback questions if too few
#                 plan.extend(self._get_fallback_plan(jd_skills, resume_parsed)[:15-len(plan)])
#             return plan
#         except Exception as e:
#             print(f"Error generating interview plan: {e}")
#             # Fallback plan
#             return self._get_fallback_plan(jd_skills, resume_parsed)
    
#     def _get_fallback_plan(
#         self,
#         jd_skills: Dict[str, List[str]],
#         resume_parsed: Dict[str, Any]
#     ) -> List[Dict[str, Any]]:
#         """Fallback interview plan if LLM fails. Maximum 15 diverse questions."""
#         plan: List[Dict[str, Any]] = []
#         must_have = jd_skills.get('must_have', [])
        
#         # Technical questions (6-7 questions) - varied difficulty
#         difficulties = ["basic", "medium", "medium", "advanced", "medium", "advanced"]
#         for i, skill in enumerate(must_have[:6]):
#             plan.append({
#                 "type": "technical",
#                 "skill": skill,
#                 "difficulty": difficulties[i] if i < len(difficulties) else "medium",
#                 "focus": f"Assess {skill} knowledge and experience"
#             })
        
#         # Project questions (3 questions)
#         plan.extend([
#             {
#                 "type": "project",
#                 "skill": None,
#                 "difficulty": "medium",
#                 "focus": "Discuss most challenging project"
#             },
#             {
#                 "type": "project",
#                 "skill": None,
#                 "difficulty": "medium",
#                 "focus": "Technical decision making in projects"
#             },
#             {
#                 "type": "project",
#                 "skill": None,
#                 "difficulty": "medium",
#                 "focus": "Team collaboration and project delivery"
#             }
#         ])
        
#         # Behavioral/HR questions (3 questions)
#         plan.extend([
#             {
#                 "type": "behavioral",
#                 "skill": None,
#                 "difficulty": "basic",
#                 "focus": "Teamwork and collaboration"
#             },
#             {
#                 "type": "hr",
#                 "skill": None,
#                 "difficulty": "basic",
#                 "focus": "Handling pressure and deadlines"
#             },
#             {
#                 "type": "behavioral",
#                 "skill": None,
#                 "difficulty": "basic",
#                 "focus": "Career goals and motivation"
#             }
#         ])
        
#         return plan[:15]  # Cap at 15 questions
    
#     def generate_next_question(
#         self,
#         plan_item: Dict[str, Any],
#         jd_text: str,
#         resume_summary: Dict[str, Any],
#         question_index: int,
#         previous_context: Optional[str] = None
#     ) -> str:
#         """Generate the actual question text based on plan item."""
#         prompt = f"""You are conducting a technical interview. Generate a clear, concise question.

# CONTEXT:
# - Question #{question_index}
# - Type: {plan_item['type']}
# - Skill: {plan_item.get('skill', 'General')}
# - Difficulty: {plan_item['difficulty']}
# - Focus: {plan_item['focus']}

# JOB REQUIREMENTS:
# {jd_text[:500]}

# CANDIDATE BACKGROUND:
# Skills: {', '.join(resume_summary.get('skills', [])[:10])}
# Experience: {resume_summary.get('experience_years', 'Unknown')} years

# {f"PREVIOUS CONTEXT: {previous_context}" if previous_context else ""}

# Generate ONE clear, spoken-friendly interview question. The question should:
# - Be conversational and natural
# - Be specific and focused
# - Take 10-30 seconds to ask
# - Be appropriate for voice interview

# Return ONLY the question text, no additional formatting or explanation."""

#         try:
#             response = self.model.generate_content(prompt)
#             question = response.text.strip().strip('"').strip("'")
#             return question
#         except Exception as e:
#             print(f"Error generating question: {e}")
#             return self._get_fallback_question(plan_item)
    
#     def _get_fallback_question(self, plan_item: Dict[str, Any]) -> str:
#         """Fallback question if LLM fails."""
#         if plan_item['type'] == 'technical':
#             skill = plan_item.get('skill', 'this technology')
#             return f"Can you explain your experience with {skill} and describe a challenging problem you solved using it?"
#         elif plan_item['type'] == 'project':
#             return "Tell me about a project you're most proud of. What was your role and what challenges did you face?"
#         else:
#             return "Describe a situation where you had to work with a difficult team member. How did you handle it?"
    
#     def evaluate_answer(
#         self,
#         jd_text: str,
#         question_text: str,
#         answer_text: str,
#         skill: Optional[str] = None
#     ) -> Dict[str, Any]:
#         """
#         Evaluate a candidate's answer.
        
#         Returns: Dict with scores and feedback.
#         """
#         prompt = f"""You are an expert technical interviewer evaluating a candidate's answer.

# JOB REQUIREMENTS:
# {jd_text[:500]}

# QUESTION ASKED:
# {question_text}

# CANDIDATE'S ANSWER:
# {answer_text}

# {f"SKILL BEING ASSESSED: {skill}" if skill else ""}

# Evaluate the answer on these dimensions (0-5 scale each):
# - Correctness: Technical accuracy and validity
# - Depth: Level of understanding and detail
# - Clarity: Communication effectiveness
# - Relevance: How well it addresses the question

# Also suggest next action:
# - "increase_difficulty": Answer was strong, increase challenge
# - "stay": Answer was adequate, continue at same level
# - "switch_skill": Answer was weak, move to different topic
# - "end": Sufficient questions asked

# Return ONLY valid JSON:
# {{
#   "correctness": 0-5,
#   "depth": 0-5,
#   "clarity": 0-5,
#   "relevance": 0-5,
#   "comment": "1-2 sentence feedback",
#   "suggested_next_action": "increase_difficulty|stay|switch_skill|end"
# }}"""

#         try:
#             response = self.model.generate_content(prompt)
#             text = response.text.strip()
            
#             # Extract JSON
#             if "```json" in text:
#                 text = text.split("```json")[1].split("```")[0].strip()
#             elif "```" in text:
#                 text = text.split("```")[1].split("```")[0].strip()
            
#             evaluation = json.loads(text)
            
#             # Validate scores
#             for key in ['correctness', 'depth', 'clarity', 'relevance']:
#                 if key not in evaluation:
#                     evaluation[key] = 3.0
#                 evaluation[key] = max(0, min(5, float(evaluation[key])))
            
#             if 'comment' not in evaluation:
#                 evaluation['comment'] = "Answer received and evaluated."
            
#             if 'suggested_next_action' not in evaluation:
#                 evaluation['suggested_next_action'] = "stay"
            
#             return evaluation
#         except Exception as e:
#             print(f"Error evaluating answer: {e}")
#             return {
#                 "correctness": 3.0,
#                 "depth": 3.0,
#                 "clarity": 3.0,
#                 "relevance": 3.0,
#                 "comment": "Answer evaluated.",
#                 "suggested_next_action": "stay"
#             }
    
#     def generate_final_report(
#         self,
#         jd_text: str,
#         resume_summary: Dict[str, Any],
#         all_evaluations: List[Dict[str, Any]],
#         final_score: float
#     ) -> Dict[str, Any]:
#         """
#         Generate final interview report and recommendation.
        
#         Returns: Dict with recommendation and report text.
#         """
#         avg_scores = {
#             'correctness': sum(e['correctness'] for e in all_evaluations) / len(all_evaluations),
#             'depth': sum(e['depth'] for e in all_evaluations) / len(all_evaluations),
#             'clarity': sum(e['clarity'] for e in all_evaluations) / len(all_evaluations),
#             'relevance': sum(e['relevance'] for e in all_evaluations) / len(all_evaluations)
#         }
        
#         prompt = f"""You are an HR consultant providing a hiring recommendation.

# JOB REQUIREMENTS:
# {jd_text[:500]}

# CANDIDATE PROFILE:
# Skills: {', '.join(resume_summary.get('skills', []))}
# Experience: {resume_summary.get('experience_years', 'Unknown')} years

# INTERVIEW PERFORMANCE:
# - Total Questions: {len(all_evaluations)}
# - Overall Score: {final_score}/100
# - Average Correctness: {avg_scores['correctness']:.1f}/5
# - Average Depth: {avg_scores['depth']:.1f}/5
# - Average Clarity: {avg_scores['clarity']:.1f}/5
# - Average Relevance: {avg_scores['relevance']:.1f}/5

# Based on this performance, provide:
# 1. Overall recommendation: Strong / Medium / Weak / Reject
# 2. A concise HR report (3-4 sentences) covering:
#    - Overall fit for the role
#    - Key strengths
#    - Areas of concern
#    - Hiring recommendation

# Return ONLY valid JSON:
# {{
#   "recommendation": "Strong|Medium|Weak|Reject",
#   "report": "Your HR report text here"
# }}"""

#         try:
#             response = self.model.generate_content(prompt)
#             text = response.text.strip()
            
#             # Extract JSON
#             if "```json" in text:
#                 text = text.split("```json")[1].split("```")[0].strip()
#             elif "```" in text:
#                 text = text.split("```")[1].split("```")[0].strip()
            
#             result = json.loads(text)
            
#             # Validate recommendation
#             valid_recs = ["Strong", "Medium", "Weak", "Reject"]
#             if result.get('recommendation') not in valid_recs:
#                 result['recommendation'] = self._score_to_recommendation(final_score)
            
#             if 'report' not in result:
#                 result['report'] = f"Candidate scored {final_score}/100 overall."
            
#             return result
#         except Exception as e:
#             print(f"Error generating final report: {e}")
#             return {
#                 "recommendation": self._score_to_recommendation(final_score),
#                 "report": f"Candidate completed interview with overall score of {final_score}/100. Performance was {'strong' if final_score >= 70 else 'moderate' if final_score >= 50 else 'weak'}."
#             }
    
#     def _score_to_recommendation(self, score: float) -> str:
#         """Convert numeric score to recommendation."""
#         if score >= 75:
#             return "Strong"
#         elif score >= 60:
#             return "Medium"
#         elif score >= 40:
#             return "Weak"
#         else:
#             return "Reject"


# # Singleton instance
# llm_service = LLMService()

"""LLM service using Google Gemini for interview logic."""
import json
from typing import Dict, List, Any, Optional

import google.generativeai as genai

from ..config import settings

# Configure Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)


class LLMService:
    """Service for all LLM-based operations."""

    def __init__(self):
        """
        Initialize Gemini model with automatic model selection.

        Instead of hardcoding a model (which can cause 404 errors if the
        client / API version doesn't support it), we:
        - List available models
        - Filter those that support generateContent
        - Prefer newer/better models if available
        - Fall back safely to gemini-pro
        """
        try:
            models = list(genai.list_models())
            available_models: List[str] = []

            for m in models:
                # Only consider models that support text generation
                if "generateContent" in getattr(m, "supported_generation_methods", []):
                    name = m.name
                    # Names are often like "models/gemini-1.5-flash"
                    if name.startswith("models/"):
                        name = name.split("/")[-1]
                    available_models.append(name)

            # Our preference order
            preferred_models = [
                "gemini-2.0-flash",
                "gemini-1.5-flash",
                "gemini-1.5-pro",
                "gemini-1.0-pro",
                "gemini-pro",
            ]

            selected_model = None
            for pm in preferred_models:
                if pm in available_models:
                    selected_model = pm
                    break

            if not selected_model:
                # If nothing from preferred list is found,
                # fall back to first available or gemini-pro
                if available_models:
                    selected_model = available_models[0]
                else:
                    selected_model = "gemini-pro"

            print(f"[LLMService] Using Gemini model: {selected_model}")
        except Exception as e:
            print(f"[LLMService] Could not list models ({e}), falling back to 'gemini-pro'")
            selected_model = "gemini-pro"

        self.model = genai.GenerativeModel(selected_model)

    # ------------------------------------------------------------------
    # INTERVIEW PLAN
    # ------------------------------------------------------------------
    def generate_interview_plan(
        self,
        jd_text: str,
        jd_skills: Dict[str, List[str]],
        resume_parsed: Dict[str, Any],
    ) -> List[Dict[str, Any]]:
        """
        Generate an interview plan based on JD and resume.
        Target: 12–15 items with a diverse mix of types.

        Returns: List of plan items with:
            - type: technical | project | behavioral | hr
            - skill: str or null
            - difficulty: basic | medium | advanced
            - focus: short description of what to assess
        """
        prompt = f"""You are a senior professional interviewer and hiring manager.
Your job is to design a STRUCTURED INTERVIEW PLAN (not the actual questions)
for a candidate based on the Job Description and their Resume.

This plan will be used by another system to generate the real spoken questions.

JOB DESCRIPTION:
{jd_text}

REQUIRED SKILLS (Must-have): {', '.join(jd_skills.get('must_have', []))}
GOOD-TO-HAVE SKILLS: {', '.join(jd_skills.get('good_to_have', []))}

CANDIDATE RESUME SUMMARY:
Skills: {', '.join(resume_parsed.get('skills', []))}
Experience: {resume_parsed.get('experience_years', 'Unknown')} years
Projects: {len(resume_parsed.get('projects', []))} projects

========================================
GOAL OF THE INTERVIEW
========================================
The AI interviewer should:
- Start with a warm greeting and 1–2 basic, low-pressure questions.
- Begin with SIMPLE, FOUNDATIONAL questions.
- Gradually increase difficulty as the candidate answers well.
- Ask a MIX of:
  - technical CONCEPTUAL questions,
  - LIMITED coding-style questions,
  - project-based questions (from the resume),
  - behavioral and managerial/HR-style questions.
- Avoid boring the candidate with many questions on the same topic in a row.
- Cover different aspects of the candidate: knowledge, reasoning, projects, behavior, ownership.

========================================
STRICT QUESTION TYPE DISTRIBUTION
========================================
You MUST create a plan with TOTAL 12–15 items.

The plan MUST approximately follow this distribution:

- INTRO / WARMUP: EXACTLY 1 item
  - type: "introduction"
  - difficulty: "basic"
  - This should ask candidate to introduce themselves

- TECHNICAL CONCEPTUAL: 4 or 5 items
  - type: "technical"
  - Focus on EXPLAINING CONCEPTS, REASONING, ARCHITECTURE, TRADE-OFFS.
  - DO NOT turn these into coding tasks.
  - Cover DIFFERENT must-have skills where possible.
  - difficulty: mix of "basic" and "medium", AT MOST 1 "advanced"

- CODING-ORIENTED: 1 or 2 items (MAX 2)
  - type: "technical"
  - Focus on solving a problem, describing an approach, or pseudo-code.
  - Avoid repeatedly saying "write code", "implement", "write a function".
  - difficulty: "medium" or "advanced"

- PROJECT / EXPERIENCE: 3 or 4 items
  - type: "project"
  - MUST be based on the candidate’s projects in the resume.
  - Focus on challenges, technical decisions, impact, collaboration, ownership.

- BEHAVIORAL / MANAGERIAL / HR: 2 items
  - type: "behavioral" OR "hr"
  - Focus on teamwork, leadership/ownership, conflict resolution, handling pressure, career goals.

VERY IMPORTANT CONSTRAINT:
- The TOTAL number of items with type "hr" OR "behavioral" combined MUST be 2 (not including introduction).
- The TOTAL number of items with type "technical" (including coding-oriented) MUST be at least 5.
- The TOTAL number of items with type "project" MUST be at least 3.

========================================
FLOW & DIVERSITY RULES
========================================
- The plan should feel like a NATURAL conversation:
  - Start with the 2 intro/warmup items.
  - Then move into easier technical/project questions.
  - Then some deeper technical/coding.
  - Then behavioral/managerial towards the end.
- DO NOT group all technical questions together blindly.
- DO NOT group all behavioral questions together.
- Alternate between types where it makes sense.
- Each item must target a DIFFERENT angle (different skill, topic, or behavior).
- Avoid repeating the same skill/topic in adjacent items unless difficulty is increasing.

========================================
OUTPUT FORMAT (IMPORTANT)
========================================
Return ONLY a single valid JSON array with NO extra text.
Do NOT include explanations or comments outside of JSON.

Each element must have exactly this structure:

[
  {{
    "type": "introduction" | "technical" | "project" | "behavioral" | "hr",
    "skill": "specific skill name or null",
    "difficulty": "basic" | "medium" | "advanced",
    "focus": "short description of what this question should assess (NO full question text)"
  }},
  ...
]

Constraints:
- For intro/warmup item, use type "introduction" and skill = null.
- For project items, type = "project" and skill may be a relevant tech or null.
- For behavioral/managerial items, use type "behavioral" or "hr" and skill = null.
- For coding-oriented items, set type = "technical" and mention "coding-style assessment" in the focus.

Ensure the JSON is valid and parseable."""

        try:
            response = self.model.generate_content(prompt)
            text = response.text.strip()

            # Extract JSON from markdown code blocks if present
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0].strip()
            elif "```" in text:
                text = text.split("```")[1].split("```")[0].strip()

            plan = json.loads(text)

            # Post-process to enforce diversity guarantees
            plan = self._rebalance_plan(plan, jd_skills, resume_parsed)

            # Ensure we have between 8-15 questions
            if len(plan) > 15:
                plan = plan[:15]
            elif len(plan) < 8:
                # Add fallback questions if too few
                plan.extend(
                    self._get_fallback_plan(jd_skills, resume_parsed)[: 15 - len(plan)]
                )
            print("[LLMService] Plan types:", [p.get("type") for p in plan])
            
            # CRITICAL: Verify the plan has proper distribution
            type_counts = {"technical": 0, "project": 0, "behavioral": 0, "hr": 0}
            for item in plan:
                t = item.get("type")
                if t in type_counts:
                    type_counts[t] += 1
            
            print(f"[LLMService] Type distribution: {type_counts}")
            
            # If plan is too HR-heavy, use fallback instead
            if type_counts["technical"] < 3 or (type_counts["hr"] + type_counts["behavioral"]) > 7:
                print("[LLMService] WARNING: Plan too HR-heavy, using fallback plan")
                return self._get_fallback_plan(jd_skills, resume_parsed)
            
            return plan
        except Exception as e:
            print(f"Error generating interview plan: {e}")
            # Fallback plan
            return self._get_fallback_plan(jd_skills, resume_parsed)

    def _rebalance_plan(
        self,
        plan: List[Dict[str, Any]],
        jd_skills: Dict[str, List[str]],
        resume_parsed: Dict[str, Any],
    ) -> List[Dict[str, Any]]:
        """
        Enforce minimum technical/project questions and cap HR/behavioral dominance
        even if the LLM output is biased.
        """
        type_counts = {"technical": 0, "project": 0, "behavioral": 0, "hr": 0}
        for item in plan:
            t = item.get("type")
            if t in type_counts:
                type_counts[t] += 1

        must_have = jd_skills.get("must_have", [])
        has_projects = len(resume_parsed.get("projects", [])) > 0

        max_hr_beh = 5
        hr_beh_indices = [
            i
            for i, it in enumerate(plan)
            if it.get("type") in ("hr", "behavioral")
        ]

        # Preserve first 2 as warmup; convert excess HR/behavioral items if needed
        for idx in hr_beh_indices[2:]:
            if type_counts["technical"] < 5 and must_have:
                plan[idx]["type"] = "technical"
                plan[idx]["skill"] = plan[idx].get("skill") or must_have[
                    type_counts["technical"] % len(must_have)
                ]
                plan[idx]["difficulty"] = plan[idx].get("difficulty") or "medium"
                plan[idx]["focus"] = plan[idx].get("focus") or (
                    f"Assess {plan[idx]['skill']} practical understanding"
                )
                type_counts["technical"] += 1
                # reduce whichever hr/behavioral bucket
                t = "hr" if plan[idx].get("type") == "hr" else "behavioral"
                type_counts[t] = max(0, type_counts[t] - 1)
            elif type_counts["project"] < 3 and has_projects:
                plan[idx]["type"] = "project"
                plan[idx]["skill"] = None
                plan[idx]["difficulty"] = plan[idx].get("difficulty") or "medium"
                plan[idx]["focus"] = plan[idx].get("focus") or (
                    "Discuss real project experience and decisions"
                )
                type_counts["project"] += 1
                t = "hr" if plan[idx].get("type") == "hr" else "behavioral"
                type_counts[t] = max(0, type_counts[t] - 1)

            if (
                type_counts["technical"] >= 5
                and type_counts["project"] >= 3
                and (type_counts["hr"] + type_counts["behavioral"]) <= max_hr_beh
            ):
                break

        return plan

    def _get_fallback_plan(
        self,
        jd_skills: Dict[str, List[str]],
        resume_parsed: Dict[str, Any],
    ) -> List[Dict[str, Any]]:
        """Fallback interview plan if LLM fails. Maximum 15 diverse questions."""
        plan: List[Dict[str, Any]] = []
        must_have = jd_skills.get("must_have", [])

        # Intro / warmup (1 item - just introduction)
        plan.append({
            "type": "introduction",
            "skill": None,
            "difficulty": "basic",
            "focus": "Ask candidate to introduce themselves and their background",
        })

        # Technical questions (4-5 based on must-have skills)
        num_technical = min(5, len(must_have))
        difficulties = ["basic", "medium", "medium", "advanced", "medium"]
        for i in range(num_technical):
            skill = must_have[i] if i < len(must_have) else "general technical"
            plan.append(
                {
                    "type": "technical",
                    "skill": skill,
                    "difficulty": difficulties[i] if i < len(difficulties) else "medium",
                    "focus": f"Assess {skill} knowledge and experience",
                }
            )

        # Project questions (2)
        plan.extend(
            [
                {
                    "type": "project",
                    "skill": None,
                    "difficulty": "medium",
                    "focus": "Discuss most challenging project and candidate's role",
                },
                {
                    "type": "project",
                    "skill": None,
                    "difficulty": "medium",
                    "focus": "Technical decision making in projects",
                },
            ]
        )

        # Behavioral/HR questions (2)
        plan.extend(
            [
                {
                    "type": "behavioral",
                    "skill": None,
                    "difficulty": "basic",
                    "focus": "Teamwork and handling challenges",
                },
                {
                    "type": "hr",
                    "skill": None,
                    "difficulty": "basic",
                    "focus": "Career goals and motivation for this role",
                },
            ]
        )

        return plan[:12]  # Cap at 12 questions (more dynamic, 1 intro + 5 tech + 2 project + 2 behavioral + 2 buffer)

    # ------------------------------------------------------------------
    # QUESTION GENERATION
    # ------------------------------------------------------------------
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
        
        # CRITICAL: Use type-specific prompts to FORCE correct question generation
        if question_type == "technical":
            prompt = f"""You are a technical interviewer. Generate ONE TECHNICAL question.

MANDATORY: This MUST be a TECHNICAL question about {skill if skill else 'technical concepts'}.

JOB REQUIREMENTS:
{jd_text[:300]}

CANDIDATE SKILLS: {', '.join(resume_summary.get('skills', [])[:10])}

FOCUS: {plan_item['focus']}
DIFFICULTY: {plan_item['difficulty']}

{f"CONTEXT: {previous_context}" if previous_context else ""}

Generate a technical question that asks the candidate to:
- EXPLAIN a concept related to {skill if skill else 'their technical skills'}
- DESCRIBE how they would solve a technical problem
- COMPARE different approaches or technologies
- DESIGN a system or architecture

CRITICAL RULES FOR VOICE INTERVIEW:
- Use FULL FORMS: "Artificial Intelligence" not "AI", "Machine Learning" not "ML", "Application Programming Interface" not "API"
- DO NOT use HTML tags like <html>, <div>, <script>
- DO NOT use special symbols or code syntax
- Speak naturally as if talking to someone
- MAXIMUM 400 CHARACTERS - Keep question concise and clear

DO NOT ask about motivation, teamwork, or career goals.
DO NOT ask about past projects (unless technical implementation details).
ONLY ask technical/conceptual questions.

Return ONLY the question text, no formatting. MUST be under 400 characters.

        elif question_type == "project":
            prompt = f"""You are interviewing about past projects. Generate ONE project-based question.

MANDATORY: This MUST ask about the candidate's PAST PROJECTS or WORK EXPERIENCE.

CANDIDATE BACKGROUND:
Skills: {', '.join(resume_summary.get('skills', [])[:10])}
Experience: {resume_summary.get('experience_years', 'Unknown')} years

FOCUS: {plan_item['focus']}

{f"CONTEXT: {previous_context}" if previous_context else ""}

Ask the candidate to describe:
- A specific project they worked on
- Technical challenges they faced
- Decisions they made and why
- Their role and contributions
- Impact of their work

CRITICAL RULES FOR VOICE INTERVIEW:
- Use FULL FORMS: "Artificial Intelligence" not "AI", "User Interface" not "UI"
- DO NOT use HTML tags or special symbols
- Speak naturally for voice conversation
- MAXIMUM 400 CHARACTERS - Keep question concise

DO NOT ask technical concept questions.
DO NOT ask about motivation or career goals.
ONLY ask about their actual project experience.

Return ONLY the question text, no formatting. MUST be under 400 characters.

        elif question_type == "introduction":
            prompt = f"""Generate ONE introduction question for the interview.

MANDATORY: Ask candidate to introduce themselves.

Ask candidate to briefly tell about:
- Their background and experience
- Their current role or recent work
- What brings them to this opportunity

CRITICAL RULES:
- Use FULL FORMS, not abbreviations (say "Artificial Intelligence" not "AI", "Machine Learning" not "ML")
- DO NOT use HTML tags like <html>, <div>, etc.
- DO NOT use special symbols or formatting
- Keep it conversational and friendly
- Make it suitable for voice/speech
- MAXIMUM 400 CHARACTERS - Keep it brief

Return ONLY the question text, no formatting. MUST be under 400 characters.

        elif question_type in ["hr", "behavioral"]:
            prompt = f"""You are conducting behavioral/HR interview. Generate ONE behavioral question.

MANDATORY: This MUST be a BEHAVIORAL or HR question about soft skills.

FOCUS: {plan_item['focus']}

{f"CONTEXT: {previous_context}" if previous_context else ""}

Ask about:
- Teamwork and collaboration
- Leadership and ownership
- Handling conflicts or pressure
- Career goals and motivation
- Cultural fit

CRITICAL RULES:
- Use FULL FORMS, not abbreviations (say "Artificial Intelligence" not "AI")
- DO NOT use HTML tags or special symbols
- Keep it conversational for voice interview
- MAXIMUM 400 CHARACTERS - Keep it concise

DO NOT ask technical questions.
DO NOT ask about specific projects or technologies.
ONLY ask about behavior, motivation, and soft skills.

Return ONLY the question text, no formatting. MUST be under 400 characters.

        else:
            prompt = f"""Generate an interview question based on:
Type: {question_type}
Skill: {skill}
Focus: {plan_item['focus']}

Return ONLY the question text."""

        try:
            response = self.model.generate_content(prompt)
            question = response.text.strip().strip('"').strip("'")
            
            # Enforce 400 character limit for TTS API (500 char limit with buffer)
            if len(question) > 400:
                print(f"[QUESTION GEN] Question too long ({len(question)} chars), truncating...")
                question = question[:397] + "..."
            
            print(f"[QUESTION GEN] Generated ({len(question)} chars): {question[:80]}...")
            return question
        except Exception as e:
            print(f"[QUESTION GEN] Error: {e}, using fallback")
            return self._get_fallback_question(plan_item)

    def _get_fallback_question(self, plan_item: Dict[str, Any]) -> str:
        """Fallback question if LLM fails."""
        if plan_item["type"] == "introduction":
            return "Please tell me about yourself, your background, and what brings you to this opportunity today."
        elif plan_item["type"] == "technical":
            skill = plan_item.get("skill", "this technology")
            return (
                f"Can you explain your experience with {skill} and describe a challenging "
                f"problem you solved using it?"
            )
        elif plan_item["type"] == "project":
            return (
                "Tell me about a project you're most proud of. "
                "What was your role and what challenges did you face?"
            )
        else:
            return (
                "Describe a situation where you had to work with a difficult team member. "
                "How did you handle it, and what was the outcome?"
            )

    # ------------------------------------------------------------------
    # ANSWER EVALUATION
    # ------------------------------------------------------------------
    def evaluate_answer(
        self,
        jd_text: str,
        question_text: str,
        answer_text: str,
        skill: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Evaluate a candidate's answer.

        Returns: Dict with scores and feedback.
        """
        prompt = f"""You are an expert technical interviewer evaluating a candidate's answer.

JOB REQUIREMENTS:
{jd_text[:500]}

QUESTION ASKED:
{question_text}

CANDIDATE'S ANSWER:
{answer_text}

{f"SKILL BEING ASSESSED: {skill}" if skill else ""}

Evaluate the answer on these dimensions (0-5 scale each):
- Correctness: Technical accuracy and validity
- Depth: Level of understanding and detail
- Clarity: Communication effectiveness
- Relevance: How well it addresses the question

Also suggest next action:
- "increase_difficulty": Answer was strong, increase challenge
- "stay": Answer was adequate, continue at same level
- "switch_skill": Answer was weak, move to different topic
- "end": Sufficient questions asked

Return ONLY valid JSON:
{{
  "correctness": 0-5,
  "depth": 0-5,
  "clarity": 0-5,
  "relevance": 0-5,
  "comment": "1-2 sentence feedback",
  "suggested_next_action": "increase_difficulty|stay|switch_skill|end"
}}"""

        try:
            response = self.model.generate_content(prompt)
            text = response.text.strip()

            # Extract JSON
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0].strip()
            elif "```" in text:
                text = text.split("```")[1].split("```")[0].strip()

            evaluation = json.loads(text)

            # Validate scores
            for key in ["correctness", "depth", "clarity", "relevance"]:
                if key not in evaluation:
                    evaluation[key] = 3.0
                evaluation[key] = max(0, min(5, float(evaluation[key])))

            if "comment" not in evaluation:
                evaluation["comment"] = "Answer received and evaluated."

            if "suggested_next_action" not in evaluation:
                evaluation["suggested_next_action"] = "stay"

            return evaluation
        except Exception as e:
            print(f"Error evaluating answer: {e}")
            return {
                "correctness": 3.0,
                "depth": 3.0,
                "clarity": 3.0,
                "relevance": 3.0,
                "comment": "Answer evaluated.",
                "suggested_next_action": "stay",
            }

    # ------------------------------------------------------------------
    # FINAL REPORT
    # ------------------------------------------------------------------
    def generate_final_report(
        self,
        jd_text: str,
        resume_summary: Dict[str, Any],
        all_evaluations: List[Dict[str, Any]],
        final_score: float,
    ) -> Dict[str, Any]:
        """
        Generate final interview report and recommendation.

        Returns: Dict with recommendation and report text.
        """
        avg_scores = {
            "correctness": sum(e["correctness"] for e in all_evaluations)
            / len(all_evaluations),
            "depth": sum(e["depth"] for e in all_evaluations) / len(all_evaluations),
            "clarity": sum(e["clarity"] for e in all_evaluations)
            / len(all_evaluations),
            "relevance": sum(e["relevance"] for e in all_evaluations)
            / len(all_evaluations),
        }

        prompt = f"""You are an HR consultant providing a hiring recommendation.

JOB REQUIREMENTS:
{jd_text[:500]}

CANDIDATE PROFILE:
Skills: {', '.join(resume_summary.get('skills', []))}
Experience: {resume_summary.get('experience_years', 'Unknown')} years

INTERVIEW PERFORMANCE:
- Total Questions: {len(all_evaluations)}
- Overall Score: {final_score}/100
- Average Correctness: {avg_scores['correctness']:.1f}/5
- Average Depth: {avg_scores['depth']:.1f}/5
- Average Clarity: {avg_scores['clarity']:.1f}/5
- Average Relevance: {avg_scores['relevance']:.1f}/5

Based on this performance, provide:
1. Overall recommendation: Strong / Medium / Weak / Reject
2. A concise HR report (3-4 sentences) covering:
   - Overall fit for the role
   - Key strengths
   - Areas of concern
   - Hiring recommendation

Return ONLY valid JSON:
{{
  "recommendation": "Strong|Medium|Weak|Reject",
  "report": "Your HR report text here"
}}"""

        try:
            response = self.model.generate_content(prompt)
            text = response.text.strip()

            # Extract JSON
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0].strip()
            elif "```" in text:
                text = text.split("```")[1].split("```")[0].strip()

            result = json.loads(text)

            # Validate recommendation
            valid_recs = ["Strong", "Medium", "Weak", "Reject"]
            if result.get("recommendation") not in valid_recs:
                result["recommendation"] = self._score_to_recommendation(final_score)

            if "report" not in result:
                result["report"] = f"Candidate scored {final_score}/100 overall."

            return result
        except Exception as e:
            print(f"Error generating final report: {e}")
            return {
                "recommendation": self._score_to_recommendation(final_score),
                "report": (
                    f"Candidate completed interview with overall score of {final_score}/100. "
                    f"Performance was "
                    f"{'strong' if final_score >= 75 else 'moderate' if final_score >= 60 else 'weak'}."
                ),
            }

    def _score_to_recommendation(self, score: float) -> str:
        """Convert numeric score to recommendation."""
        if score >= 75:
            return "Strong"
        elif score >= 60:
            return "Medium"
        elif score >= 40:
            return "Weak"
        else:
            return "Reject"


# Singleton instance
llm_service = LLMService()
