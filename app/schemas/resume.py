from pydantic import BaseModel
from typing import List


class ResumeParseResponse(BaseModel):
    summary: str
    skills: List[str]
    experience: str
    education: List[str]
    projects: List[str]
