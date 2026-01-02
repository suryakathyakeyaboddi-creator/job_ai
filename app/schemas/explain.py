from pydantic import BaseModel
from typing import List


class ExplainRequest(BaseModel):
    job: dict
    resume: dict
    match: dict


class ExplainResponse(BaseModel):
    summary: str
    strengths: List[str]
    gaps: List[str]
    recommendation: str
