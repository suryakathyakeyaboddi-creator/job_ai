from pydantic import BaseModel

class JobAnalyzeRequest(BaseModel):
    page_text: str


class JobAnalyzeResponse(BaseModel):
    role: str
    required_skills: list[str]
    experience: str
    tools: list[str]
    responsibilities: list[str]
