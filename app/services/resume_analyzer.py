import json
from app.llm.groq_client import call_groq_llm


def analyze_resume(resume_text: str) -> dict:
    prompt = f"""
You are an expert resume analyzer.

TASK:
Extract structured resume data and return ONLY valid JSON with:

- summary (string)
- skills (array of strings)
- experience (string)
- education (array of strings)
- projects (array of strings)

RULES:
- Do not add explanations
- Do not add markdown
- Return ONLY JSON

RESUME TEXT:
{resume_text[:6000]}
"""

    response = call_groq_llm(
        user_prompt=prompt,
        system_prompt="You extract structured resume data accurately."
    )

    try:
        return json.loads(response)
    except json.JSONDecodeError:
        return {
            "summary": "Unable to extract summary",
            "skills": [],
            "experience": "Unknown",
            "education": [],
            "projects": []
        }
