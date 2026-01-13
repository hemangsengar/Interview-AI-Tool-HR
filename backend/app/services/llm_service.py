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
    """Service for all LLM-based operations with multi-provider fallback."""

    def __init__(self):
        """
        Initialize LLM service with Gemini primary + Groq fallback.
        
        Provider priority:
        1. Google Gemini (primary)
        2. Groq (free, very fast fallback)
        3. Heuristic fallback (offline)
        """
        # Quota tracking
        self.quota_errors = 0
        self.last_quota_error = None
        self.consecutive_quota_errors = 0
        
        # Provider state
        self.gemini_available = False
        self.groq_available = False
        self.groq_client = None

        # Caching for interview plans and questions
        self.plan_cache = {}  # Cache interview plans by JD hash
        self.question_cache = {}  # Cache questions by plan_item hash
        self.cache_expiry = 3600  # 1 hour cache expiry

        # Initialize Gemini
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
                if available_models:
                    selected_model = available_models[0]
                else:
                    selected_model = "gemini-pro"

            self.model = genai.GenerativeModel(selected_model)
            self.gemini_available = True
            print(f"[LLMService] ✅ Gemini model: {selected_model}")
        except Exception as e:
            print(f"[LLMService] ❌ Gemini init failed: {e}")
            self.model = None
            self.gemini_available = False

        # Initialize Groq (fallback)
        self._init_groq()

    def _init_groq(self):
        """Initialize Groq client if API key is available."""
        try:
            if settings.GROQ_API_KEY:
                from groq import Groq
                self.groq_client = Groq(api_key=settings.GROQ_API_KEY)
                self.groq_available = True
                print("[LLMService] ✅ Groq fallback available (llama-3.3-70b)")
            else:
                print("[LLMService] ⚠️  GROQ_API_KEY not set, Groq fallback disabled")
                self.groq_available = False
        except ImportError:
            print("[LLMService] ⚠️  groq package not installed. Run: pip install groq")
            self.groq_available = False
        except Exception as e:
            print(f"[LLMService] ❌ Groq init failed: {e}")
            self.groq_available = False
        
        # Initialize LM Studio (Local LLM)
        self._init_lm_studio()

    def _init_lm_studio(self):
        """Initialize LM Studio client for local LLM via OpenAI-compatible API."""
        self.lm_studio_available = False
        self.lm_studio_client = None
        
        try:
            if settings.USE_LOCAL_LLM:
                import httpx
                # Test if LM Studio is running
                # LM_STUDIO_URL is like "http://127.0.0.1:1234/v1"
                # Models endpoint is at /v1/models, so we need to append /models
                models_url = f"{settings.LM_STUDIO_URL}/models"
                print(f"[LLMService] Checking LM Studio at: {models_url}")
                try:
                    response = httpx.get(models_url, timeout=3.0)
                    print(f"[LLMService] LM Studio response: {response.status_code}")
                    if response.status_code == 200:
                        from openai import OpenAI
                        self.lm_studio_client = OpenAI(
                            base_url=settings.LM_STUDIO_URL,
                            api_key="lm-studio"  # LM Studio doesn't need a real key
                        )
                        self.lm_studio_available = True
                        print(f"[LLMService] ✅ LM Studio available at {settings.LM_STUDIO_URL}")
                    else:
                        print(f"[LLMService] ⚠️  LM Studio returned {response.status_code} at {models_url}")
                except Exception as e:
                    print(f"[LLMService] ⚠️  LM Studio not running at {settings.LM_STUDIO_URL} - {e}")
            else:
                print("[LLMService] ℹ️  USE_LOCAL_LLM=False, LM Studio disabled")
        except ImportError:
            print("[LLMService] ⚠️  openai/httpx package not installed. Run: pip install openai httpx")
        except Exception as e:
            print(f"[LLMService] ❌ LM Studio init failed: {e}")

    async def _generate_with_lm_studio(self, prompt: str, max_tokens: int = 1024, system_prompt: str = None) -> Optional[str]:
        """Generate text using local LLM via LM Studio's OpenAI-compatible API."""
        if not self.lm_studio_available or not self.lm_studio_client:
            return None
        
        try:
            import asyncio
            
            default_system = "You are a professional technical interviewer having a natural conversation. Be conversational, warm, and engaging. Always respond with valid JSON when asked for JSON."
            
            def call_lm_studio():
                response = self.lm_studio_client.chat.completions.create(
                    model=settings.LM_STUDIO_MODEL,
                    messages=[
                        {"role": "system", "content": system_prompt or default_system},
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=max_tokens,
                    temperature=0.7
                )
                return response.choices[0].message.content
            
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(None, call_lm_studio)
            print("[LM_STUDIO] ✅ Generation successful")
            return result
        except Exception as e:
            print(f"[LM_STUDIO] ❌ Error: {e}")
            return None

    async def _try_lm_studio_conversation(
        self,
        answer_text: str,
        question_text: str,
        skill: Optional[str],
        question_type: str,
        jd_context: str,
        interview_history: List[Dict[str, Any]] = None,
        skills_unknown: List[str] = None
    ) -> Optional[Dict[str, Any]]:
        """Generate conversation response using local LM Studio LLM."""
        if not self.lm_studio_available:
            return None
        
        # Build conversation history context
        history_context = ""
        if interview_history:
            history_lines = []
            for h in interview_history[-5:]:  # Last 5 Q&A for context
                history_lines.append(f"Q: {h.get('question', '')[:80]}")
                history_lines.append(f"A: {h.get('answer', '')[:120]}")
            history_context = "\n".join(history_lines)
        
        history_section = ""
        if history_context:
            history_section = f"RECENT CONVERSATION:\n{history_context}"
        
        prompt = f"""You are conducting a professional but CONVERSATIONAL interview. Be natural and engaging!

CURRENT QUESTION: {question_text}
SKILL: {skill or 'General'}
TYPE: {question_type}

CANDIDATE'S RESPONSE: {answer_text}

{history_section}
{f"TOPICS TO SKIP (candidate doesn't know): {', '.join(skills_unknown or [])}" if skills_unknown else ""}

IMPORTANT - Check these scenarios:
1. Is candidate ASKING a question? → Answer it naturally, set answer_quality="question", next_action="answer_candidate"
2. Is candidate saying they DON'T KNOW this topic? → Acknowledge gracefully, set answer_quality="skip_skill", next_action="end_topic"
3. Otherwise evaluate their answer fairly

Your spoken_response should be NATURAL and CONVERSATIONAL (max 40 words):
- Acknowledge what they said
- Give brief feedback if appropriate
- Don't be robotic or overly formal

Return ONLY valid JSON:
{{
    "spoken_response": "Your natural response (max 40 words)",
    "scores": {{
        "correctness": 0.0-5.0,
        "depth": 0.0-5.0,
        "clarity": 3.0,
        "relevance": 0.0-5.0
    }},
    "answer_quality": "strong|partial|weak|question|skip_skill",
    "next_action": "continue|follow_up|end_topic|answer_candidate",
    "follow_up_question": null,
    "skill_to_skip": null,
    "internal_notes": "Brief note"
}}"""

        try:
            result_text = await self._generate_with_lm_studio(prompt, max_tokens=500)
            if not result_text:
                return None
            
            # Parse JSON
            text = result_text.strip()
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0].strip()
            elif "```" in text:
                text = text.split("```")[1].split("```")[0].strip()
            
            result = json.loads(text)
            result = self._validate_conversation_response(result)
            
            if len(result["spoken_response"]) > 200:
                result["spoken_response"] = result["spoken_response"][:197] + "..."
            
            print(f"[LM_STUDIO] ✅ Conversation: {result['answer_quality']}")
            return result
            
        except json.JSONDecodeError as e:
            print(f"[LM_STUDIO] ❌ JSON parse error: {e}")
            return None
        except Exception as e:
            print(f"[LM_STUDIO] ❌ Error: {e}")
            return None

    async def _generate_text_async(self, prompt: str, max_tokens: int = 1024, system_prompt: str = None) -> Optional[str]:
        """
        Unified generation method with provider priority:
        1. LM Studio (Local)
        2. Groq (Fast Fallback)
        3. Gemini (Primary Cloud)
        """
        # 1. Try LM Studio
        if settings.USE_LOCAL_LLM and self.lm_studio_available:
            print("[LLM_SERVICE] Trying LM Studio...")
            result = await self._generate_with_lm_studio(prompt, max_tokens, system_prompt)
            if result:
                return result
            print("[LLM_SERVICE] LM Studio failed, trying next provider...")

        # 2. Try Groq
        if self.groq_available:
            print("[LLM_SERVICE] Trying Groq...")
            result = await self._generate_with_groq(prompt, max_tokens)
            if result:
                return result
            print("[LLM_SERVICE] Groq failed, trying next provider...")

        # 3. Try Gemini
        if self.gemini_available and self.model:
            print("[LLM_SERVICE] Trying Gemini...")
            try:
                import asyncio
                # Use to_thread for the synchronous generate_content call
                response = await asyncio.to_thread(self.model.generate_content, prompt)
                self._record_success()
                return response.text.strip()
            except Exception as e:
                print(f"[LLM_SERVICE] Gemini failed: {e}")
                error_msg = str(e).lower()
                if "quota" in error_msg or "rate limit" in error_msg:
                    self._record_quota_error()
                
        return None

    async def _generate_with_groq(self, prompt: str, max_tokens: int = 1024) -> Optional[str]:
        """Generate text using Groq's Llama 3.3 70B model."""
        if not self.groq_available or not self.groq_client:
            return None
        
        try:
            import asyncio
            
            # Groq is synchronous, run in executor
            def call_groq():
                response = self.groq_client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=[
                        {"role": "system", "content": "You are a professional technical interviewer. Always respond with valid JSON when asked."},
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=max_tokens,
                    temperature=0.7
                )
                return response.choices[0].message.content
            
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(None, call_groq)
            print("[GROQ] ✅ Generation successful")
            return result
        except Exception as e:
            error_str = str(e).lower()
            if "rate" in error_str or "limit" in error_str:
                print(f"[GROQ] ⚠️  Rate limit hit: {e}")
            else:
                print(f"[GROQ] ❌ Error: {e}")
            return None

    async def _try_groq_conversation(
        self,
        answer_text: str,
        question_text: str,
        skill: Optional[str],
        question_type: str,
        jd_context: str,
        interview_history: List[Dict[str, Any]] = None,
        skills_unknown: List[str] = None
    ) -> Optional[Dict[str, Any]]:
        """Try to generate conversation response using Groq with full context."""
        if not self.groq_available:
            return None
        
        # Build conversation history context
        history_context = ""
        if interview_history:
            history_lines = []
            for h in interview_history:
                history_lines.append(f"Q ({h.get('skill', 'unknown')}): {h.get('question', '')[:100]}")
                history_lines.append(f"A: {h.get('answer', '')[:150]}")
            history_context = "\n".join(history_lines)
        
        if history_context:
            history_section = f"CONVERSATION HISTORY (ALL previous Q&A):\n{history_context}"
        else:
            history_section = "(This is the first question)"

        prompt = f"""You are a professional technical interviewer having a NATURAL conversation.

QUESTION ASKED: {question_text}
SKILL BEING ASSESSED: {skill or 'General'}
QUESTION TYPE: {question_type}

CANDIDATE'S ANSWER: {answer_text}

{history_section}

{f"SKILLS CANDIDATE ALREADY SAID THEY DON'T KNOW: {', '.join(skills_unknown or [])}" if skills_unknown else ""}

CRITICAL DETECTION - Check these FIRST:
1. IS CANDIDATE ASKING A QUESTION? (e.g., "Can you tell me about the job role?", "What kind of work?", "Could you clarify?")
   → If YES: Set answer_quality="question", next_action="answer_candidate", and ANSWER their question in spoken_response!
   
2. IS CANDIDATE SAYING THEY DON'T KNOW THIS SKILL? (e.g., "I don't have experience in...", "I haven't worked with...")
   → If YES: Set answer_quality="skip_skill", next_action="end_topic", skill_to_skip="{skill}"
   → spoken_response: "No problem, let's move on to something else."
   
3. HAS CANDIDATE ALREADY ANSWERED THIS? (Check conversation history!)
   → If YES: Don't ask the same thing. Set next_action="continue" to move forward.

INSTRUCTIONS FOR spoken_response (MAX 40 WORDS):
- If answer was good: Brief acknowledgment
- If answer was weak: Encouraging, move on
- If candidate asked a question: ANSWER IT
- If candidate doesn't know the skill: Accept gracefully
- Sound natural, like a real human

Return ONLY valid JSON:
{{
    "spoken_response": "Your natural spoken response (MAX 40 words)",
    "scores": {{
        "correctness": 0.0-5.0,
        "depth": 0.0-5.0,
        "clarity": 3.0,
        "relevance": 0.0-5.0
    }},
    "answer_quality": "strong|partial|weak|question|skip_skill",
    "next_action": "continue|follow_up|end_topic|answer_candidate",
    "follow_up_question": "Only if next_action is follow_up, otherwise null",
    "skill_to_skip": "Skill name if candidate doesn't know it, otherwise null",
    "internal_notes": "Brief evaluation"
}}"""

        try:
            result_text = await self._generate_with_groq(prompt, max_tokens=500)
            if not result_text:
                return None
            
            # Parse JSON
            text = result_text.strip()
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0].strip()
            elif "```" in text:
                text = text.split("```")[1].split("```")[0].strip()
            
            result = json.loads(text)
            result = self._validate_conversation_response(result)
            
            if len(result["spoken_response"]) > 200:
                result["spoken_response"] = result["spoken_response"][:197] + "..."
            
            print(f"[GROQ] ✅ Conversation response: {result['answer_quality']}")
            return result
            
        except json.JSONDecodeError as e:
            print(f"[GROQ] ❌ JSON parse error: {e}")
            return None
        except Exception as e:
            print(f"[GROQ] ❌ Error: {e}")
            return None

    def _get_cache_key(self, jd_text: str, resume_data: Dict[str, Any]) -> str:
        """Generate a cache key for interview plans."""
        import hashlib
        key_data = f"{jd_text[:500]}_{str(sorted(resume_data.get('skills', [])))}_{resume_data.get('experience_years', 0)}"
        return hashlib.md5(key_data.encode()).hexdigest()

    def _get_question_cache_key(self, plan_item: Dict[str, Any], jd_text: str, resume_summary: Dict[str, Any]) -> str:
        """Generate a cache key for questions."""
        import hashlib
        key_data = f"{plan_item['type']}_{plan_item.get('skill')}_{plan_item['difficulty']}_{jd_text[:200]}_{str(resume_summary.get('skills', [])[:5])}"
        return hashlib.md5(key_data.encode()).hexdigest()

    def _is_cache_valid(self, cache_entry: Dict[str, Any]) -> bool:
        """Check if cache entry is still valid."""
        import time
        return time.time() - cache_entry.get('timestamp', 0) < self.cache_expiry

    def _get_cached_plan(self, jd_text: str, resume_data: Dict[str, Any]) -> Optional[List[Dict[str, Any]]]:
        """Get cached interview plan if available and valid."""
        cache_key = self._get_cache_key(jd_text, resume_data)
        if cache_key in self.plan_cache:
            cache_entry = self.plan_cache[cache_key]
            if self._is_cache_valid(cache_entry):
                print(f"[CACHE] Using cached interview plan for key: {cache_key[:8]}")
                return cache_entry['plan']
            else:
                # Remove expired cache
                del self.plan_cache[cache_key]
        return None

    def _cache_plan(self, jd_text: str, resume_data: Dict[str, Any], plan: List[Dict[str, Any]]):
        """Cache an interview plan."""
        import time
        cache_key = self._get_cache_key(jd_text, resume_data)
        self.plan_cache[cache_key] = {
            'plan': plan,
            'timestamp': time.time()
        }
        print(f"[CACHE] Cached interview plan for key: {cache_key[:8]}")

    def _get_cached_question(self, plan_item: Dict[str, Any], jd_text: str, resume_summary: Dict[str, Any]) -> Optional[str]:
        """Get cached question if available and valid."""
        cache_key = self._get_question_cache_key(plan_item, jd_text, resume_summary)
        if cache_key in self.question_cache:
            cache_entry = self.question_cache[cache_key]
            if self._is_cache_valid(cache_entry):
                print(f"[CACHE] Using cached question for key: {cache_key[:8]}")
                return cache_entry['question']
            else:
                # Remove expired cache
                del self.question_cache[cache_key]
        return None

    def _cache_question(self, plan_item: Dict[str, Any], jd_text: str, resume_summary: Dict[str, Any], question: str):
        """Cache a question."""
        import time
        cache_key = self._get_question_cache_key(plan_item, jd_text, resume_summary)
        self.question_cache[cache_key] = {
            'question': question,
            'timestamp': time.time()
        }
        print(f"[CACHE] Cached question for key: {cache_key[:8]}")

    # ------------------------------------------------------------------
    # INTERVIEW PLAN
    # ------------------------------------------------------------------
    async def generate_interview_plan(
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
        # Check cache first
        cached_plan = self._get_cached_plan(jd_text, resume_parsed)
        if cached_plan:
            return cached_plan

        # Check if we should skip API call due to quota issues
        if self.consecutive_quota_errors >= 2:
            print(f"[PLAN GEN] Skipping API call due to {self.consecutive_quota_errors} consecutive quota errors, using fallback")
            plan = self._get_fallback_plan(jd_skills, resume_parsed)
            self._cache_plan(jd_text, resume_parsed, plan)  # Cache the fallback too
            return plan

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
            result_text = await self._generate_text_async(prompt)
            if not result_text:
                raise Exception("Generation failed on all providers")
            text = result_text.strip()

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
                plan = self._get_fallback_plan(jd_skills, resume_parsed)
                self._cache_plan(jd_text, resume_parsed, plan)
                return plan

            # Cache successful plan
            self._cache_plan(jd_text, resume_parsed, plan)
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
    async def generate_next_question(
        self,
        plan_item: Dict[str, Any],
        jd_text: str,
        resume_summary: Dict[str, Any],
        question_index: int,
        previous_context: Optional[str] = None,
    ) -> str:
        """Generate the actual question text based on a plan item."""

        # Check cache first
        cached_question = self._get_cached_question(plan_item, jd_text, resume_summary)
        if cached_question:
            return cached_question

        # Check if we should skip API call due to quota issues
        if self.consecutive_quota_errors >= 2:
            print(f"[QUESTION GEN] Skipping API call due to {self.consecutive_quota_errors} consecutive quota errors, using fallback")
            question = self._get_fallback_question(plan_item, jd_text, resume_summary)
            self._cache_question(plan_item, jd_text, resume_summary, question)  # Cache the fallback too
            return question

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

Return ONLY the question text, no formatting. MUST be under 400 characters."""

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

Return ONLY the question text, no formatting. MUST be under 400 characters."""

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

Return ONLY the question text, no formatting. MUST be under 400 characters."""

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

Return ONLY the question text, no formatting. MUST be under 400 characters."""

        else:
            prompt = f"""Generate an interview question based on:
Type: {question_type}
Skill: {skill}
Focus: {plan_item['focus']}

Return ONLY the question text."""

        try:
            # Use unified generator which handles LM Studio -> Groq -> Gemini
            question = await self._generate_text_async(prompt)
            if not question:
                raise Exception("Generation failed on all providers")

            question = question.strip().strip('"').strip("'")
            
            # Enforce 400 character limit for TTS API
            if len(question) > 400:
                print(f"[QUESTION GEN] Question too long ({len(question)} chars), truncating...")
                question = question[:397] + "..."

            print(f"[QUESTION GEN] Generated ({len(question)} chars): {question[:80]}...")
            self._cache_question(plan_item, jd_text, resume_summary, question)
            return question

        except Exception as e:
            print(f"[QUESTION GEN] Unexpected error: {e}, using fallback")
            question = self._get_fallback_question(plan_item, jd_text, resume_summary)
            self._cache_question(plan_item, jd_text, resume_summary, question)
            return question

    def _get_fallback_question(self, plan_item: Dict[str, Any], jd_text: str = "", resume_summary: Dict[str, Any] = None) -> str:
        """Fallback question if LLM fails. Now personalized with more variety."""
        import random
        
        question_type = plan_item.get("type", "technical")
        skill = plan_item.get("skill")
        difficulty = plan_item.get("difficulty", "medium")

        # Extract relevant info from JD and resume
        jd_skills = []
        if jd_text:
            # Simple extraction of potential skills from JD
            jd_lower = jd_text.lower()
            common_skills = ["python", "javascript", "java", "react", "node", "sql", "aws", "docker", "kubernetes", "git"]
            jd_skills = [s for s in common_skills if s in jd_lower]

        resume_skills = resume_summary.get("skills", []) if resume_summary else []

        if question_type == "introduction":
            intros = [
                "Please tell me about yourself, your background, and what brings you to this opportunity today.",
                "I'd love to hear about your journey into tech. What got you started and where are you now?",
                "Walk me through your professional background and what excites you about this role."
            ]
            return random.choice(intros)

        elif question_type == "technical":
            # Use skill from plan or extract from JD/resume
            target_skill = skill or (jd_skills[0] if jd_skills else (resume_skills[0] if resume_skills else "programming"))

            if difficulty == "basic":
                basic_templates = [
                    f"Can you explain what {target_skill} is and why it's useful in software development?",
                    f"What do you know about {target_skill}? How would you describe it to someone new to tech?",
                    f"In your own words, what is {target_skill} and where have you seen it used?"
                ]
                return random.choice(basic_templates)
            elif difficulty == "advanced":
                advanced_templates = [
                    f"Can you describe a complex problem you solved using {target_skill} and the technical challenges you faced?",
                    f"What's the most difficult aspect of working with {target_skill}? How do you handle those challenges?",
                    f"Tell me about a time when {target_skill} didn't work as expected. How did you debug and resolve it?",
                    f"How would you design a scalable solution using {target_skill}? Walk me through your approach."
                ]
                return random.choice(advanced_templates)
            else:  # medium
                medium_templates = [
                    f"Can you walk me through how you've used {target_skill} in your projects?",
                    f"What's your experience level with {target_skill}? Give me a specific example of how you've applied it.",
                    f"If I asked you to build something with {target_skill} today, what would be your approach?",
                    f"What are the key concepts in {target_skill} that you find most important?"
                ]
                return random.choice(medium_templates)

        elif question_type == "project":
            # Personalize based on resume experience
            experience_years = resume_summary.get("experience_years", 0) if resume_summary else 0

            if experience_years > 3:
                senior_templates = [
                    "Can you describe a significant project you led and the key technical decisions you made?",
                    "Tell me about a project where you had to make architectural decisions. What factors did you consider?",
                    "Describe a project where you mentored others. What was your approach to guiding the team?"
                ]
                return random.choice(senior_templates)
            else:
                junior_templates = [
                    "Tell me about a project you're most proud of. What was your role and what did you learn from it?",
                    "What's a coding project you've worked on recently? Walk me through the problem you were solving.",
                    "Describe any project, even a personal or academic one, that taught you something valuable."
                ]
                return random.choice(junior_templates)

        elif question_type == "behavioral":
            behavioral_templates = [
                "Describe a situation where you had to work with a team to solve a challenging problem. What was your role?",
                "Tell me about a time you had to learn something new quickly. How did you approach it?",
                "Can you share an example of when you received critical feedback? How did you respond?",
                "Describe a situation where you disagreed with a teammate. How did you handle it?"
            ]
            return random.choice(behavioral_templates)
        else:  # hr or unknown
            hr_templates = [
                "What interests you most about this role and our company?",
                "Where do you see yourself in the next few years?",
                "What are you looking for in your next role?"
            ]
            return random.choice(hr_templates)

    # ------------------------------------------------------------------
    # ANSWER EVALUATION
    # ------------------------------------------------------------------
    async def evaluate_answer(
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
            result_text = await self._generate_text_async(prompt)
            if not result_text:
                raise Exception("Generation failed on all providers")
            text = result_text.strip()

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
    # CONVERSATIONAL INTERVIEWER RESPONSE
    # ------------------------------------------------------------------
    def classify_answer_quality(self, evaluation: Dict[str, Any]) -> str:
        """
        Deterministic classification of answer quality based on evaluation scores.
        
        Returns: "strong" | "partial" | "weak"
        """
        correctness = evaluation.get("correctness", 3.0)
        depth = evaluation.get("depth", 3.0)
        relevance = evaluation.get("relevance", 3.0)
        
        # Calculate average of the three most important dimensions
        avg_score = (correctness + depth + relevance) / 3
        
        # Deterministic thresholds
        if avg_score >= 4.0:
            return "strong"
        elif avg_score >= 2.5:
            return "partial"
        else:
            return "weak"

    async def generate_interviewer_response(
        self,
        answer_quality: str,
        question_text: str,
        answer_text: str,
        evaluation: Dict[str, Any],
        skill: Optional[str] = None
    ) -> str:
        """
        Generate natural interviewer feedback based on answer quality.
        This should feel conversational and human-like.
        
        Returns: A short spoken response (1-2 sentences max)
        """
        # Check if we should skip API call due to quota
        if self.consecutive_quota_errors >= 2:
            print(f"[INTERVIEWER RESPONSE] Using fallback due to quota errors")
            return self._get_fallback_interviewer_response(answer_quality, skill)

        prompt = f"""You are a friendly, professional technical interviewer. 
The candidate just answered a question. Generate a brief, natural spoken response.

QUESTION ASKED:
{question_text[:200]}

CANDIDATE'S ANSWER:
{answer_text[:300]}

ANSWER QUALITY: {answer_quality}
{f"SKILL: {skill}" if skill else ""}

Based on the answer quality, generate ONE of these types of responses:

If STRONG:
- Acknowledge the good answer positively
- Show appreciation for depth/clarity
- Examples: "Great answer!", "That's exactly right.", "I like how you explained that."

If PARTIAL:
- Acknowledge what was correct
- Gently indicate something was missing
- Examples: "Good start, but...", "You're on the right track.", "That covers part of it."

If WEAK:
- Stay encouraging and professional
- Indicate the answer needs clarification
- Examples: "Let me rephrase that.", "I think there's some confusion here.", "Let's approach this differently."

CRITICAL RULES:
- MAXIMUM 50 characters - Keep it very brief
- Sound natural and conversational
- Be encouraging, not harsh
- Use simple, spoken language
- NO technical jargon in the feedback itself

Return ONLY the interviewer's spoken response, nothing else."""

        try:
            max_retries = 2
            retry_delay = 2

            for attempt in range(max_retries):
                try:
                    import asyncio
                    response = await asyncio.to_thread(self.model.generate_content, prompt)
                    feedback = response.text.strip().strip('"').strip("'")
                    
                    # Enforce 50 character limit for quick feedback
                    if len(feedback) > 50:
                        feedback = feedback[:47] + "..."
                    
                    print(f"[INTERVIEWER RESPONSE] Generated: {feedback}")
                    self._record_success()
                    return feedback

                except Exception as e:
                    error_msg = str(e).lower()
                    if "quota" in error_msg or "rate limit" in error_msg:
                        self._record_quota_error()
                        if attempt < max_retries - 1:
                            await asyncio.sleep(retry_delay)
                            retry_delay = min(retry_delay * 1.5, 8)
                            continue
                        else:
                            break
                    else:
                        break

            return self._get_fallback_interviewer_response(answer_quality, skill)

        except Exception as e:
            print(f"[INTERVIEWER RESPONSE] Error: {e}, using fallback")
            return self._get_fallback_interviewer_response(answer_quality, skill)

    def _get_fallback_interviewer_response(self, answer_quality: str, skill: Optional[str] = None) -> str:
        """Fallback interviewer responses for different answer qualities."""
        if answer_quality == "strong":
            responses = [
                "Great answer!",
                "That's exactly right.",
                "Well explained.",
                "Perfect, thank you."
            ]
        elif answer_quality == "partial":
            responses = [
                "Good start.",
                "You're on the right track.",
                "That covers part of it.",
                "Interesting point."
            ]
        else:  # weak
            responses = [
                "Let me rephrase that.",
                "Let's try a different angle.",
                "I think there's some confusion here.",
                "Let me clarify."
            ]
        
        # Simple rotation based on hash to add variety
        import hashlib
        idx = int(hashlib.md5(str(skill).encode()).hexdigest(), 16) % len(responses)
        return responses[idx]

    async def generate_follow_up_question(
        self,
        original_question: str,
        answer_text: str,
        skill: str,
        follow_up_type: str = "simplify"
    ) -> str:
        """
        Generate a follow-up question when the candidate's answer was weak/partial.
        
        follow_up_type options:
        - "simplify": Ask a simpler, foundational version
        - "rephrase": Rephrase the original question
        - "hint": Give a hint and ask again
        
        Returns: A follow-up question string
        """
        # Check cache and quota
        if self.consecutive_quota_errors >= 2:
            return self._get_fallback_follow_up(original_question, skill, follow_up_type)

        prompt = f"""You are a technical interviewer. The candidate gave an incomplete/unclear answer.
Generate a follow-up question to help them.

ORIGINAL QUESTION:
{original_question}

CANDIDATE'S ANSWER:
{answer_text[:300]}

SKILL: {skill}
FOLLOW-UP TYPE: {follow_up_type}

Based on the follow-up type, generate:

If SIMPLIFY:
- Ask a simpler, more foundational question about {skill}
- Break down the concept into basics
- Make it easier to answer

If REPHRASE:
- Ask the same thing but in different words
- Use simpler language
- Add a bit more context

If HINT:
- Give a small hint or example
- Then ask the question again with that guidance

CRITICAL RULES:
- MAXIMUM 400 characters
- Keep it conversational and spoken-friendly
- Sound encouraging, not condescending
- Use FULL FORMS (not abbreviations)

Return ONLY the follow-up question text."""

        try:
            max_retries = 2
            retry_delay = 2

            for attempt in range(max_retries):
                try:
                    import asyncio
                    response = await asyncio.to_thread(self.model.generate_content, prompt)
                    question = response.text.strip().strip('"').strip("'")
                    
                    if len(question) > 400:
                        question = question[:397] + "..."
                    
                    print(f"[FOLLOW-UP] Generated ({len(question)} chars): {question[:80]}...")
                    self._record_success()
                    return question

                except Exception as e:
                    error_msg = str(e).lower()
                    if "quota" in error_msg or "rate limit" in error_msg:
                        self._record_quota_error()
                        if attempt < max_retries - 1:
                            await asyncio.sleep(retry_delay)
                            retry_delay = min(retry_delay * 1.5, 8)
                            continue
                        else:
                            break
                    else:
                        break

            return self._get_fallback_follow_up(original_question, skill, follow_up_type)

        except Exception as e:
            print(f"[FOLLOW-UP] Error: {e}, using fallback")
            return self._get_fallback_follow_up(original_question, skill, follow_up_type)

    def _get_fallback_follow_up(self, original_question: str, skill: str, follow_up_type: str) -> str:
        """Fallback follow-up questions."""
        if follow_up_type == "simplify":
            return f"Let me ask something more basic: Can you explain what {skill} is and why it's important?"
        elif follow_up_type == "rephrase":
            return f"Let me ask that differently: In your own words, how would you describe {skill}?"
        else:  # hint
            return f"Here's a hint: Think about how {skill} is commonly used in real projects. Can you give me an example?"

    def should_ask_follow_up(
        self,
        answer_quality: str,
        follow_up_count: int,
        max_follow_ups: int = 2
    ) -> bool:
        """
        Deterministic logic: decide if we should ask a follow-up question.
        
        Rules:
        - Only for "weak" or "partial" answers
        - Maximum 2 follow-ups per skill
        - Then move on regardless
        """
        if follow_up_count >= max_follow_ups:
            print(f"[FOLLOW-UP LOGIC] Max follow-ups ({max_follow_ups}) reached, moving on")
            return False
        
        if answer_quality in ["weak", "partial"]:
            print(f"[FOLLOW-UP LOGIC] Answer quality '{answer_quality}', asking follow-up #{follow_up_count + 1}")
            return True
        
        print(f"[FOLLOW-UP LOGIC] Answer quality '{answer_quality}', no follow-up needed")
        return False

    def get_follow_up_type(self, follow_up_count: int, answer_quality: str) -> str:
        """
        Deterministic logic: decide what type of follow-up to use.
        
        First follow-up: Simplify (for weak) or Rephrase (for partial)
        Second follow-up: Always hint
        """
        if follow_up_count == 0:
            return "simplify" if answer_quality == "weak" else "rephrase"
        else:
            return "hint"

    # ------------------------------------------------------------------
    # UNIFIED CONVERSATION (Single LLM Call - Optimized)
    # ------------------------------------------------------------------
    async def process_answer_and_respond(
        self,
        answer_text: str,
        question_text: str,
        skill: Optional[str],
        jd_context: str,
        interview_history: List[Dict[str, Any]] = None,
        skills_unknown: List[str] = None,
        question_type: str = "technical"
    ) -> Dict[str, Any]:
        """
        UNIFIED SINGLE-CALL method that does everything in one LLM request:
        1. Evaluates the answer (scores)
        2. Generates natural interviewer response
        3. Decides next action (follow-up, next question, etc.)
        4. Detects if candidate asked a question
        5. Detects if candidate said they don't know a skill
        
        This reduces API calls by 50% and improves latency significantly.
        
        Returns:
        {
            "spoken_response": str,  # What to say to candidate (max 50 words)
            "scores": {"correctness": float, "depth": float, "relevance": float},
            "answer_quality": "strong" | "partial" | "weak" | "question" | "skip_skill",
            "next_action": "continue" | "follow_up" | "end_topic" | "answer_candidate",
            "follow_up_question": str | None,  # Only if next_action is "follow_up"
            "skill_to_skip": str | None,  # If candidate doesn't know this skill
            "internal_notes": str  # For database logging
        }
        """
        print(f"[UNIFIED] Processing answer for skill: {skill}, type: {question_type}")
        print(f"[UNIFIED] Interview history length: {len(interview_history) if interview_history else 0}")
        print(f"[UNIFIED] Skills unknown: {skills_unknown}")
        
        # Priority 1: LM Studio (local LLM) - if enabled and available
        if settings.USE_LOCAL_LLM and self.lm_studio_available:
            print("[UNIFIED] Trying LM Studio (local LLM)...")
            lm_result = await self._try_lm_studio_conversation(
                answer_text, question_text, skill, question_type, jd_context,
                interview_history, skills_unknown
            )
            if lm_result:
                return lm_result
            print("[UNIFIED] LM Studio failed, trying other providers...")
        
        # Priority 2: If Gemini quota exhausted, try Groq
        if self.consecutive_quota_errors >= 2:
            print("[UNIFIED] Gemini quota exhausted, trying Groq...")
            groq_result = await self._try_groq_conversation(
                answer_text, question_text, skill, question_type, jd_context,
                interview_history, skills_unknown
            )
            if groq_result:
                return groq_result
            print("[UNIFIED] Groq also failed, using heuristic fallback")
            return self._get_fallback_conversation_response(
                answer_text, question_text, skill, question_type, interview_history
            )
        
        # Build conversation history context
        history_context = ""
        if interview_history:
            history_lines = []
            for h in interview_history:
                history_lines.append(f"Q ({h.get('skill', 'unknown')}): {h.get('question', '')[:100]}")
                history_lines.append(f"A: {h.get('answer', '')[:150]}")
            history_context = "\n".join(history_lines)

        if history_context:
            history_section = f"CONVERSATION HISTORY (ALL previous Q&A):\n{history_context}"
        else:
            history_section = "(This is the first question)"

        prompt = f"""You are a professional technical interviewer having a NATURAL conversation with a candidate.

CURRENT QUESTION: {question_text}
SKILL BEING ASSESSED: {skill or 'General'}
QUESTION TYPE: {question_type}

CANDIDATE'S ANSWER: {answer_text}

JOB CONTEXT (relevant skills needed):
{jd_context[:400]}

{history_section}

{f"SKILLS CANDIDATE SAID THEY DON'T KNOW: {', '.join(skills_unknown or [])}" if skills_unknown else ""}

YOUR TASK:
Analyze the candidate's answer and respond naturally. Be CONTEXT-AWARE.

CRITICAL DETECTION - Check these FIRST:
1. IS CANDIDATE ASKING A QUESTION? (e.g., "Can you tell me about the job role?", "What kind of work?", "Could you clarify?")
   → If YES: Set answer_quality="question", next_action="answer_candidate", and ANSWER their question in spoken_response!
   
2. IS CANDIDATE SAYING THEY DON'T KNOW THIS SKILL? (e.g., "I don't have experience in...", "I haven't worked with...", "I don't know...")
   → If YES: Set answer_quality="skip_skill", next_action="end_topic", skill_to_skip=the skill they don't know
   → spoken_response: "No problem, let's move on to something else."
   
3. HAS CANDIDATE ALREADY ANSWERED THIS/SIMILAR QUESTION? (Check conversation history!)
   → If YES: Don't ask the same thing again. Set next_action="continue" to move forward.

INSTRUCTIONS FOR spoken_response (MAX 40 WORDS):
- If answer was good: Brief acknowledgment + smooth transition
- If answer was weak: Encouraging response, don't repeat the same question
- If candidate asked a question: ANSWER IT (e.g., explain the job role, clarify what you meant)
- If candidate doesn't know the skill: Accept gracefully and move on
- Sound natural, like a real human conversation

Respond ONLY with valid JSON (no markdown, no explanation):
{{
    "spoken_response": "Your natural spoken response (MAX 40 words)",
    "scores": {{
        "correctness": 0.0-5.0,
        "depth": 0.0-5.0,
        "relevance": 0.0-5.0
    }},
    "answer_quality": "strong|partial|weak|question|skip_skill",
    "next_action": "continue|follow_up|end_topic|answer_candidate",
    "follow_up_question": "Only if next_action is follow_up, otherwise null",
    "skill_to_skip": "Skill name if candidate doesn't know it, otherwise null",
    "internal_notes": "Brief evaluation notes for records (1-2 sentences)"
}}"""

        try:
            max_retries = 2
            retry_delay = 2

            for attempt in range(max_retries):
                try:
                    import asyncio
                    response = await asyncio.to_thread(self.model.generate_content, prompt)
                    text = response.text.strip()
                    
                    # Extract JSON from response
                    if "```json" in text:
                        text = text.split("```json")[1].split("```")[0].strip()
                    elif "```" in text:
                        text = text.split("```")[1].split("```")[0].strip()
                    
                    result = json.loads(text)
                    
                    # Validate and normalize response
                    result = self._validate_conversation_response(result)
                    
                    # Enforce spoken response length (for TTS speed)
                    if len(result["spoken_response"]) > 200:
                        result["spoken_response"] = result["spoken_response"][:197] + "..."
                    
                    print(f"[UNIFIED] Quality: {result['answer_quality']}, Action: {result['next_action']}")
                    print(f"[UNIFIED] Response: {result['spoken_response'][:60]}...")
                    
                    self._record_success()
                    return result

                except json.JSONDecodeError as e:
                    print(f"[UNIFIED] JSON parse error: {e}, retrying...")
                    if attempt < max_retries - 1:
                        continue
                    break
                    
                except Exception as e:
                    error_msg = str(e).lower()
                    if "quota" in error_msg or "rate limit" in error_msg:
                        self._record_quota_error()
                        if attempt < max_retries - 1:
                            print(f"[UNIFIED] Rate limit, retrying in {retry_delay}s...")
                            await asyncio.sleep(retry_delay)
                            retry_delay = min(retry_delay * 1.5, 8)
                            continue
                        else:
                            break
                    else:
                        print(f"[UNIFIED] Error: {e}")
                        break

            # Try Groq fallback before heuristic fallback
            if self.groq_available:
                print("[UNIFIED] Trying Groq fallback...")
                groq_result = await self._generate_with_groq(prompt, max_tokens=500)
                if groq_result:
                    try:
                        # Parse Groq response
                        text = groq_result.strip()
                        if "```json" in text:
                            text = text.split("```json")[1].split("```")[0].strip()
                        elif "```" in text:
                            text = text.split("```")[1].split("```")[0].strip()
                        
                        result = json.loads(text)
                        result = self._validate_conversation_response(result)
                        
                        if len(result["spoken_response"]) > 200:
                            result["spoken_response"] = result["spoken_response"][:197] + "..."
                        
                        print(f"[GROQ] Success! Quality: {result['answer_quality']}")
                        return result
                    except json.JSONDecodeError as e:
                        print(f"[GROQ] JSON parse error: {e}")

            # Heuristic fallback if all LLMs failed
            return self._get_fallback_conversation_response(
                answer_text, question_text, skill, question_type
            )

        except Exception as e:
            print(f"[UNIFIED] Unexpected error: {e}, using fallback")
            return self._get_fallback_conversation_response(
                answer_text, question_text, skill, question_type, interview_history
            )

    def _validate_conversation_response(self, result: Dict[str, Any]) -> Dict[str, Any]:
        """Validate and normalize the conversation response."""
        # Ensure all required fields exist
        if "spoken_response" not in result:
            result["spoken_response"] = "I see. Let me note that down."
        
        if "scores" not in result:
            result["scores"] = {"correctness": 3.0, "depth": 3.0, "clarity": 3.0, "relevance": 3.0}
        
        # Normalize scores - ensure all 4 required scores exist
        for key in ["correctness", "depth", "clarity", "relevance"]:
            if key not in result["scores"]:
                result["scores"][key] = 3.0
            result["scores"][key] = max(0.0, min(5.0, float(result["scores"][key])))
        
        if "answer_quality" not in result:
            avg = sum(result["scores"].values()) / 4
            result["answer_quality"] = "strong" if avg >= 4 else "partial" if avg >= 2.5 else "weak"
        
        # Validate answer_quality values
        valid_qualities = ["strong", "partial", "weak", "question", "skip_skill"]
        if result["answer_quality"] not in valid_qualities:
            result["answer_quality"] = "partial"
        
        if "next_action" not in result:
            result["next_action"] = "continue"
        
        # Validate next_action values
        valid_actions = ["continue", "follow_up", "end_topic", "answer_candidate"]
        if result["next_action"] not in valid_actions:
            result["next_action"] = "continue"
        
        if result["next_action"] == "follow_up" and not result.get("follow_up_question"):
            result["follow_up_question"] = f"Could you elaborate a bit more on that?"
        
        if "internal_notes" not in result:
            result["internal_notes"] = f"Answer quality: {result['answer_quality']}"
        
        if "skill_to_skip" not in result:
            result["skill_to_skip"] = None
        
        return result

    def _get_fallback_conversation_response(
        self,
        answer_text: str,
        question_text: str,
        skill: Optional[str],
        question_type: str,
        interview_history: List[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Smart fallback when API is unavailable.
        Handles: negative answers, off-topic responses, candidate questions, frustration.
        Now with interview history context!
        """
        import random
        
        answer_lower = answer_text.lower().strip()
        question_lower = question_text.lower()
        answer_words = answer_text.split()
        answer_length = len(answer_words)
        
        # Build context from interview history
        mentioned_skills = set()
        asked_questions = []
        if interview_history:
            for h in interview_history:
                if h.get('skill'):
                    mentioned_skills.add(h['skill'].lower())
                asked_questions.append(h.get('question', '').lower())
        
        print(f"[FALLBACK] History context: {len(interview_history or [])} Q&As, mentioned skills: {mentioned_skills}")
        
        # PRIORITY 1: Detect if candidate is asking a question to the interviewer
        candidate_asking = any(pattern in answer_lower for pattern in [
            "can you", "could you", "what is the", "tell me about", "what are",
            "please describe", "please tell", "what's the job", "job role",
            "what does this", "what will i", "what would i", "tell me more about"
        ])
        
        # PRIORITY 2: Detect frustration or asking same thing repeatedly
        frustrated_patterns = [
            "shut", "stop", "what i asked", "respond to", "answer my", "listen to me",
            "you're not", "you are not", "properly", "correctly", "rude", "stupid",
            "asking the same", "same question", "already answered", "already told"
        ]
        is_frustrated = any(pattern in answer_lower for pattern in frustrated_patterns)
        
        # PRIORITY 3: Detect candidate saying they don't know the skill
        skill_decline_patterns = [
            "don't have experience", "no experience", "haven't worked with",
            "not familiar with", "don't know", "never used", "no exposure",
            "not worked on", "not my area", "haven't used"
        ]
        is_skill_decline = any(pattern in answer_lower for pattern in skill_decline_patterns)
        
        # Handle candidate asking questions - ACTUALLY ANSWER THEM
        if candidate_asking:
            # If they asked about job role, give them some info!
            if any(phrase in answer_lower for phrase in ["job role", "position", "what kind", "what will i"]):
                responses = [
                    "Great question! This role involves working with the technologies I'm asking about. We're looking for someone who can contribute to building and maintaining our applications. Let me continue with a few more questions to understand your fit.",
                    "Absolutely! This position focuses on software development, and we're assessing your technical skills across different areas. Let me ask a few more questions so we can see where your strengths lie.",
                    "Happy to share! The role involves hands-on development work. The questions I'm asking help us understand which areas you'd excel in. Let's continue."
                ]
            else:
                responses = [
                    "That's a fair question! Let me clarify, and then we can continue. What specifically would you like to know?",
                    "Sure, I can help with that. Let me know what you'd like clarified, and then we'll proceed.",
                    "Good question! Let me address that briefly, then continue our discussion."
                ]
            return {
                "spoken_response": random.choice(responses),
                "scores": {"correctness": 2.5, "depth": 2.0, "clarity": 3.0, "relevance": 1.5},
                "answer_quality": "question",
                "next_action": "continue",  # Move on after answering
                "follow_up_question": None,
                "skill_to_skip": None,
                "internal_notes": "Candidate asked question. Provided brief answer."
            }
        
        # Handle frustration
        if is_frustrated:
            responses = [
                "I apologize if my questions weren't clear. Let me move to a different topic that might be more relevant to your experience.",
                "I understand. Let me adjust my approach. Let's try a different area.",
                "I hear you. Let's move on to something different that plays to your strengths."
            ]
            return {
                "spoken_response": random.choice(responses),
                "scores": {"correctness": 1.0, "depth": 1.0, "clarity": 2.0, "relevance": 1.0},
                "answer_quality": "weak",
                "next_action": "continue",
                "follow_up_question": None,
                "skill_to_skip": skill,  # Skip this skill since they're frustrated
                "internal_notes": "Candidate expressed frustration. Moving to different topic."
            }
        
        # Handle skill decline - DON'T ASK FOLLOW-UP, JUST MOVE ON
        if is_skill_decline:
            responses = [
                f"No problem at all! Not everyone has worked with {skill or 'every technology'}. Let's move on to something else.",
                f"That's perfectly fine. We'll skip {skill or 'this area'} and explore where your experience lies.",
                "Understood, no worries. Let's focus on areas where you have more experience.",
                "That's okay! Let's move on to the next topic."
            ]
            return {
                "spoken_response": random.choice(responses),
                "scores": {"correctness": 1.5, "depth": 1.0, "clarity": 3.0, "relevance": 1.0},
                "answer_quality": "skip_skill",
                "next_action": "end_topic",
                "follow_up_question": None,
                "skill_to_skip": skill,  # Mark this skill to skip
                "internal_notes": f"Candidate declined skill: {skill}. Skipping related questions."
            }
        
        # Detect negative/declining answers (general)
        negative_patterns = [
            "no", "nope", "i haven't", "i have not", "i don't", "i do not",
            "not used", "never used", "not familiar",
            "i'm not sure", "not really", "haven't worked"
        ]
        is_negative = any(pattern in answer_lower for pattern in negative_patterns)
        
        # Detect off-topic answers (question about X but answer doesn't mention X-related terms)
        is_off_topic = False
        if skill:
            skill_terms = skill.lower().split()
            # Check if answer mentions anything related to the skill
            skill_mentioned = any(term in answer_lower for term in skill_terms)
            # Check for completely unrelated content
            off_topic_indicators = ["government", "politics", "weather", "sports", "movies", "food"]
            has_off_topic = any(ind in answer_lower for ind in off_topic_indicators)
            is_off_topic = has_off_topic and not skill_mentioned
        
        # Handle based on detected patterns
        if is_off_topic:
            # Candidate went off-topic
            responses = [
                f"That's an interesting point. Let me bring us back to {skill or 'the topic'}. ",
                f"I appreciate your perspective. However, for this role, I'd like to focus on {skill or 'your technical background'}. ",
                f"Thanks for sharing. Let's get back to discussing your experience with {skill or 'the technologies in this role'}. "
            ]
            response = random.choice(responses) + "Let's move on to the next question."
            quality = "weak"
            next_action = "continue"  # Skip to next question, don't dwell
            follow_up = None
            scores = {"correctness": 1.0, "depth": 1.0, "clarity": 2.0, "relevance": 0.5}
            
        elif is_negative and answer_length < 15:
            # Short negative answer - acknowledge and move on gracefully
            if question_type == "introduction":
                responses = [
                    "That's alright! Let's move forward and learn more about you through other questions.",
                    "No problem. We can explore your background through the technical questions."
                ]
            else:
                responses = [
                    f"That's okay! Not everyone has experience with {skill or 'every technology'}. Let's move on.",
                    f"No worries. Let's see what other skills you can bring to the table.",
                    f"That's fine. We'll explore other areas where you have more experience.",
                    f"Understood. Let's continue with a different topic."
                ]
            response = random.choice(responses)
            quality = "weak"
            next_action = "continue"  # Move on, don't ask follow-up about something they don't know
            follow_up = None
            scores = {"correctness": 2.0, "depth": 1.5, "clarity": 3.0, "relevance": 2.0}
            
        elif answer_length < 8:
            # Very short answer (but not explicitly negative)
            if question_type == "introduction":
                responses = [
                    "Could you tell me a bit more about your background?",
                    "I'd love to hear more about your journey. What led you to this field?"
                ]
                follow_up = "What aspects of your experience are you most excited to bring to this role?"
            elif question_type == "project":
                responses = [
                    "I'd like to hear more about your project experience.",
                    "Could you share any project you've worked on, even a small one?"
                ]
                follow_up = "What's a problem you've solved recently that you're proud of?"
            else:
                responses = [
                    f"Could you elaborate a bit more on your experience with {skill or 'this'}?",
                    "I'd like to understand this better. Can you give me more details?"
                ]
                follow_up = f"Even if it's from coursework or personal projects, any experience with {skill or 'this technology'}?"
            
            response = random.choice(responses)
            quality = "weak"
            next_action = "follow_up"
            scores = {"correctness": 2.5, "depth": 1.5, "clarity": 2.5, "relevance": 2.5}
            
        elif answer_length < 25:
            # Medium-length answer - partial response
            if question_type == "introduction":
                responses = [
                    "Thanks for sharing! That gives me a good starting point.",
                    "Interesting background! Let's dive into the technical aspects."
                ]
            elif question_type == "project":
                responses = [
                    "Thanks for that overview. That sounds like valuable experience.",
                    "Interesting project! Let's explore your technical skills next."
                ]
            else:
                responses = [
                    f"Good start on {skill or 'this topic'}. Let's continue.",
                    "That's helpful context. Let's explore further.",
                    "Thanks for that explanation. Moving on."
                ]
            
            response = random.choice(responses)
            quality = "partial"
            next_action = "continue"
            follow_up = None
            scores = {"correctness": 3.0, "depth": 2.5, "clarity": 3.0, "relevance": 3.0}
            
        else:
            # Long, detailed answer - strong response
            if question_type == "introduction":
                responses = [
                    "Excellent introduction! You clearly have a rich background.",
                    "Great overview of your experience! I can see you've done interesting work."
                ]
            elif question_type == "project":
                responses = [
                    "That's a great project to highlight! You handled it well.",
                    "Impressive project experience! I can see your problem-solving skills."
                ]
            else:
                responses = [
                    f"Excellent explanation of {skill or 'this concept'}! You clearly have strong knowledge here.",
                    "Great depth of understanding! That's exactly the kind of insight I was looking for.",
                    "Very thorough answer! Let's move on to the next topic."
                ]
            
            response = random.choice(responses)
            quality = "strong"
            next_action = "continue"
            follow_up = None
            scores = {"correctness": 4.0, "depth": 3.5, "clarity": 4.0, "relevance": 4.0}
        
        return {
            "spoken_response": response,
            "scores": scores,
            "answer_quality": quality,
            "next_action": next_action,
            "follow_up_question": follow_up,
            "skill_to_skip": None,
            "internal_notes": f"Fallback: {quality}. Length: {answer_length} words. Negative: {is_negative}. Off-topic: {is_off_topic}."
        }

    # ------------------------------------------------------------------
    # FINAL REPORT
    # ------------------------------------------------------------------
    async def generate_final_report(
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
            result_text = await self._generate_text_async(prompt)
            if not result_text:
                raise Exception("Generation failed on all providers")
            text = result_text.strip()

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

    def _record_quota_error(self):
        """Record a quota/rate limit error."""
        import datetime
        self.quota_errors += 1
        self.last_quota_error = datetime.datetime.utcnow()
        self.consecutive_quota_errors += 1

    def _record_success(self):
        """Record a successful API call."""
        self.consecutive_quota_errors = 0

    def get_quota_status(self) -> Dict[str, Any]:
        """Get current quota status."""
        import datetime
        is_quota_exhausted = self.consecutive_quota_errors >= 3

        return {
            "quota_errors_today": self.quota_errors,
            "consecutive_quota_errors": self.consecutive_quota_errors,
            "last_quota_error": self.last_quota_error.isoformat() if self.last_quota_error else None,
            "is_quota_exhausted": is_quota_exhausted,
            "recommendation": "Switch to fallback mode" if is_quota_exhausted else "Normal operation"
        }

    def clear_cache(self):
        """Clear all caches."""
        self.plan_cache.clear()
        self.question_cache.clear()
        print("[CACHE] All caches cleared")

    def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache statistics."""
        import time
        current_time = time.time()
        
        plan_cache_size = len(self.plan_cache)
        question_cache_size = len(self.question_cache)
        
        # Count valid entries
        valid_plans = sum(1 for entry in self.plan_cache.values() if self._is_cache_valid(entry))
        valid_questions = sum(1 for entry in self.question_cache.values() if self._is_cache_valid(entry))
        
        return {
            "plan_cache": {
                "total_entries": plan_cache_size,
                "valid_entries": valid_plans,
                "hit_rate_estimate": f"{valid_plans}/{plan_cache_size}" if plan_cache_size > 0 else "0/0"
            },
            "question_cache": {
                "total_entries": question_cache_size,
                "valid_entries": valid_questions,
                "hit_rate_estimate": f"{valid_questions}/{question_cache_size}" if question_cache_size > 0 else "0/0"
            },
            "cache_expiry_seconds": self.cache_expiry
        }


# Singleton instance
llm_service = LLMService()
