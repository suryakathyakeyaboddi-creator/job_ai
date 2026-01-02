def normalize(text: str) -> str:
    return text.lower().strip()


def match_resume_job(job: dict, resume: dict) -> dict:
    job_skills = set(normalize(skill) for skill in job.get("required_skills", []))
    resume_skills = set(normalize(skill) for skill in resume.get("skills", []))

    matched = job_skills & resume_skills
    missing = job_skills - resume_skills

    # Avoid division by zero
    if not job_skills:
        match_percentage = 0
    else:
        match_percentage = int((len(matched) / len(job_skills)) * 100)

    # Experience comparison (simple heuristic)
    resume_exp = resume.get("experience", "").lower()
    job_exp = job.get("experience", "").lower()

    if "fresher" in resume_exp or "0" in resume_exp:
        experience_match = "Good for fresher roles"
    elif resume_exp and job_exp:
        experience_match = "Experience details need review"
    else:
        experience_match = "Not specified"

    # Overall fit logic
    if match_percentage >= 75:
        overall_fit = "Strong fit"
    elif match_percentage >= 50:
        overall_fit = "Good fit"
    else:
        overall_fit = "Low fit – skill gaps present"

    return {
        "match_percentage": match_percentage,
        "matched_skills": list(matched),
        "missing_skills": list(missing),
        "experience_match": experience_match,
        "overall_fit": overall_fit
    }
