let jobData = null;
let resumeData = null;

/* UI Elements */
const analyzeBtn = document.getElementById("analyzeBtn");
const matchBtn = document.getElementById("matchBtn");

const homeScreen = document.getElementById("homeScreen");
const resultScreen = document.getElementById("resultScreen");

const jobRole = document.getElementById("jobRole");
const jobExperience = document.getElementById("jobExperience");
const jobSkills = document.getElementById("jobSkills");

const resumeFileInput = document.getElementById("resumeFile");
const matchResult = document.getElementById("matchResult");

const confidenceSection = document.getElementById("confidenceSection");
const confidenceFill = document.getElementById("confidenceFill");

const API_BASE = "https://jobai-production-cf74.up.railway.app";

/* Utility */
function resetAnalyzeBtn() {
  analyzeBtn.textContent = "Analyze This Job";
  analyzeBtn.disabled = false;
}

/* -----------------------------
   STEP 1: ANALYZE JOB
----------------------------- */
analyzeBtn.addEventListener("click", async () => {
  analyzeBtn.textContent = "Analyzing...";
  analyzeBtn.disabled = true;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.tabs.sendMessage(tab.id, { type: "ANALYZE_JOB" }, (response) => {
    if (!response || !response.success) {
      alert("Failed to analyze job. Please refresh the page and try again.");
      resetAnalyzeBtn();
      return;
    }

    jobData = response.data;

    homeScreen.style.display = "none";
    resultScreen.style.display = "block";

    jobRole.textContent = jobData.role;
    jobExperience.textContent = `Experience: ${jobData.experience}`;
    jobSkills.innerHTML = jobData.required_skills
      .map(skill => `<li>${skill}</li>`)
      .join("");

    resetAnalyzeBtn();
  });
});

/* -----------------------------
   STEP 2: MATCH RESUME
----------------------------- */
matchBtn.addEventListener("click", async () => {
  matchResult.innerHTML = "<p>Matching resume...</p>";

  if (!jobData) {
    matchResult.innerHTML = "<p>Please analyze the job first.</p>";
    return;
  }

  const file = resumeFileInput.files[0];
  if (!file) {
    matchResult.innerHTML = "<p>Please upload your resume.</p>";
    return;
  }

  try {
    /* Upload Resume */
    const formData = new FormData();
    formData.append("file", file);

    const resumeRes = await fetch(`${API_BASE}/parse-resume`, {
      method: "POST",
      body: formData
    });

    resumeData = await resumeRes.json();

    /* Match */
    const matchRes = await fetch(`${API_BASE}/match`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        job: jobData,
        resume: resumeData
      })
    });

    const matchData = await matchRes.json();

    /* Explain */
    const explainRes = await fetch(`${API_BASE}/explain`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        job: jobData,
        resume: resumeData,
        match: matchData
      })
    });

    const explainData = await explainRes.json();

    /* Confidence Bar */
    confidenceSection.style.display = "block";
    confidenceFill.style.width = "0%";
    confidenceFill.textContent = "0%";

    setTimeout(() => {
      confidenceFill.style.width = `${matchData.match_percentage}%`;
      confidenceFill.textContent = `${matchData.match_percentage}%`;
    }, 150);

    /* Result UI */
    let fitClass = "good";
    let fitEmoji = "✅";
    let fitText = "Good Match";

    if (matchData.match_percentage < 50) {
      fitClass = "bad";
      fitEmoji = "❌";
      fitText = "Low Match";
    } else if (matchData.match_percentage < 75) {
      fitClass = "warn";
      fitEmoji = "⚠️";
      fitText = "Partial Match";
    }

    matchResult.innerHTML = `
      <div class="card ${fitClass}">
        <h4>${fitEmoji} ${fitText} – ${matchData.match_percentage}%</h4>
      </div>

      <div class="card good">
        <p class="highlight">👍 Strengths</p>
        <ul>${explainData.strengths.map(s => `<li>${s}</li>`).join("")}</ul>
      </div>

      <div class="card warn">
        <p class="highlight">⚠️ Skill Gaps</p>
        <ul>${explainData.gaps.map(g => `<li>${g}</li>`).join("")}</ul>
      </div>

      <div class="card">
        <p class="highlight">🚀 Recommendation</p>
        <p>${explainData.recommendation}</p>
      </div>
    `;
  } catch (err) {
    matchResult.innerHTML = "<p>Something went wrong. Please try again.</p>";
  }
});
