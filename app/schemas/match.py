from pydantic import BaseModel
from typing import List


class MatchRequest(BaseModel):
    job: dict
    resume: dict


class MatchResponse(BaseModel):
    match_percentage: int
    matched_skills: List[str]
    missing_skills: List[str]
    experience_match: str
    overall_fit: str
