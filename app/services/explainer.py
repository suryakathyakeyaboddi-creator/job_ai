import json
from app.llm.groq_client import call_groq_llm


def explain_match(job: dict, resume: dict, match: dict) -> dict:
    prompt = f"""
You are a career mentor helping a job seeker.

CONTEXT:
Job details:
{job}

Resume details:
{resume}

Match analysis:
{match}

TASK:
Explain the match result in SIMPLE, FRIENDLY language.
Return ONLY valid JSON with:

- summary (string)
- strengths (array of strings)
- gaps (array of strings)
- recommendation (string)

RULES:
- Be encouraging but honest
- No markdown
- No explanations outside JSON
- Return ONLY JSON
"""

    response = call_groq_llm(
        user_prompt=prompt,
        system_prompt="You explain job matching results clearly to candidates."
    )

    try:
        return json.loads(response)
    except json.JSONDecodeError:
        return {
            "summary": "Match explanation unavailable",
            "strengths": [],
            "gaps": [],
            "recommendation": "Please review the match details manually."
        }
