import json
from app.llm.groq_client import call_groq_llm
from app.utils.text_cleaner import clean_job_text


def analyze_job(page_text: str) -> dict:
    cleaned_text = clean_job_text(page_text)

    prompt = f"""
You are an expert job analyst.

TASK:
From the text below, identify the job description and return ONLY valid JSON
with the following fields:

- role (string)
- required_skills (array of strings)
- experience (string)
- tools (array of strings)
- responsibilities (array of strings)

RULES:
- Ignore ads, menus, footer text
- Do not add explanations
- Do not add markdown
- Return ONLY JSON

TEXT:
{cleaned_text}
"""

    llm_response = call_groq_llm(
        user_prompt=prompt,
        system_prompt="You extract structured job data accurately."
    )

    try:
        return json.loads(llm_response)
    except json.JSONDecodeError:
        # Fallback in case LLM slightly misformats
        return {
            "role": "Unknown",
            "required_skills": [],
            "experience": "Not specified",
            "tools": [],
            "responsibilities": []
        }
