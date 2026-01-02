from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import tempfile

# JOB ANALYSIS
from app.schemas.job import JobAnalyzeRequest, JobAnalyzeResponse
from app.services.job_analyzer import analyze_job

# RESUME PARSING
from app.services.resume_analyzer import analyze_resume
from app.utils.resume_reader import read_resume_text
from app.schemas.resume import ResumeParseResponse

# MATCHING
from app.schemas.match import MatchRequest, MatchResponse
from app.services.matcher import match_resume_job

# EXPLANATION
from app.schemas.explain import ExplainRequest, ExplainResponse
from app.services.explainer import explain_match


app = FastAPI(
    title="AI Job Matching Brain",
    description="Backend for AI Job Analyzer Chrome Extension",
    version="1.0.0"
)

# ✅ CORS (REQUIRED FOR CHROME EXTENSION)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # later restrict to extension ID
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------
# HEALTH CHECK
# ------------------------
@app.get("/")
def root():
    return {"status": "AI backend running"}

# ------------------------
# ANALYZE JOB DESCRIPTION
# ------------------------
@app.post("/analyze-job", response_model=JobAnalyzeResponse)
def analyze_job_endpoint(data: JobAnalyzeRequest):
    return analyze_job(data.page_text)

# ------------------------
# PARSE RESUME
# ------------------------
@app.post("/parse-resume", response_model=ResumeParseResponse)
async def parse_resume(file: UploadFile = File(...)):
    suffix = "." + file.filename.split(".")[-1]

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    resume_text = read_resume_text(tmp_path)
    return analyze_resume(resume_text)

# ------------------------
# MATCH RESUME ↔ JOB
# ------------------------
@app.post("/match", response_model=MatchResponse)
def match_endpoint(data: MatchRequest):
    return match_resume_job(data.job, data.resume)

# ------------------------
# AI EXPLANATION
# ------------------------
@app.post("/explain", response_model=ExplainResponse)
def explain_endpoint(data: ExplainRequest):
    return explain_match(data.job, data.resume, data.match)
