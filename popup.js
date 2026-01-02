// ================================
// CONFIG
// ================================
const API_BASE = "https://jobai-production-cf74.up.railway.app";

// ================================
// STATE
// ================================
let jobData = null;
let resumeData = null;

// ================================
// UI ELEMENTS
// ================================
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

// ================================
// STEP 1: ANALYZE JOB
// ================================
analyzeBtn.addEventListener("click", async () => {
  analyzeBtn.textContent = "Analyzing...";
  analyzeBtn.disabled = true;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.tabs.sendMessage(tab.id, { type: "GET_PAGE_TEXT" }, async (response) => {
    if (!response?.pageText) {
      alert("Unable to read job description.");
      resetAnalyzeBtn();
      return;
    }

    try {
      const apiRes = await fetch(`${API_BASE}/analyze-job`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page_text: response.pageText })
      });

      if (!apiRes.ok) throw new Error("API error");

      jobData = await apiRes.json();

      // UI Switch
      homeScreen.style.display = "none";
      resultScreen.style.display = "block";

      // Populate Job Info
      jobRole.textContent = jobData.role || "Unknown Role";
      jobExperience.textContent = `Experience: ${jobData.experience || "N/A"}`;

      jobSkills.innerHTML = (jobData.required_skills || [])
        .map(skill => `<li>${skill}</li>`)
        .join("");

    } catch (err) {
      alert("Failed to analyze job. Please try again.");
    }

    resetAnalyzeBtn();
  });
});

function resetAnalyzeBtn() {
  analyzeBtn.textContent = "Analyze This Job";
  analyzeBtn.disabled = false;
}

// ================================
// STEP 2: MATCH RESUME
// ================================
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
    // ---- Parse Resume ----
    const formData = new FormData();
    formData.append("file", file);

    const resumeRes = await fetch(`${API_BASE}/parse-resume`, {
      method: "POST",
      body: formData
    });

    if (!resumeRes.ok) throw new Error("Resume parse failed");

    resumeData = await resumeRes.json();

    // ---- Match Resume ↔ Job ----
    const matchRes = await fetch(`${API_BASE}/match`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        job: jobData,
        resume: resumeData
      })
    });

    if (!matchRes.ok) throw new Error("Match failed");

    const matchData = await matchRes.json();

    // ---- Explain Match ----
    const explainRes = await fetch(`${API_BASE}/explain`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        job: jobData,
        resume: resumeData,
        match: matchData
      })
    });

    if (!explainRes.ok) throw new Error("Explain failed");

    const explainData = await explainRes.json();

    // ================================
    // CONFIDENCE BAR
    // ================================
    const percentage = matchData.match_percentage || 0;

    confidenceSection.style.display = "block";
    confidenceFill.style.width = "0%";
    confidenceFill.textContent = "0%";

    setTimeout(() => {
      confidenceFill.style.width = `${percentage}%`;
      confidenceFill.textContent = `${percentage}%`;
    }, 150);

    // ================================
    // RESULT UI
    // ================================
    let fitClass = "good";
    let fitEmoji = "✅";
    let fitText = "Good Match";

    if (percentage < 50) {
      fitClass = "bad";
      fitEmoji = "❌";
      fitText = "Low Match";
    } else if (percentage < 75) {
      fitClass = "warn";
      fitEmoji = "⚠️";
      fitText = "Partial Match";
    }

    matchResult.innerHTML = `
      <div class="card ${fitClass}">
        <h4>${fitEmoji} ${fitText} – ${percentage}%</h4>
      </div>

      <div class="card good">
        <p class="highlight">👍 Strengths</p>
        <ul>${(explainData.strengths || []).map(s => `<li>${s}</li>`).join("")}</ul>
      </div>

      <div class="card warn">
        <p class="highlight">⚠️ Skill Gaps</p>
        <ul>${(explainData.gaps || []).map(g => `<li>${g}</li>`).join("")}</ul>
      </div>

      <div class="card">
        <p class="highlight">🚀 Recommendation</p>
        <p>${explainData.recommendation || "No recommendation provided."}</p>
      </div>
    `;

  } catch (err) {
    matchResult.innerHTML = "<p>Something went wrong. Please try again.</p>";
  }
});
