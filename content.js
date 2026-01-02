// ================================
// CONFIG
// ================================
const API_BASE = "https://jobai-production-cf74.up.railway.app";

// ================================
// MESSAGE LISTENER
// ================================
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "GET_PAGE_TEXT") {
    const pageText = document.body.innerText;
    sendResponse({ pageText });
    return true;
  }

  if (request.type === "ANALYZE_JOB") {
    analyzeJobFromPage()
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // IMPORTANT: async response
  }
});

// ================================
// JOB ANALYSIS FUNCTION
// ================================
async function analyzeJobFromPage() {
  const pageText = document.body.innerText;

  const response = await fetch(`${API_BASE}/analyze-job`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      page_text: pageText
    })
  });

  if (!response.ok) {
    throw new Error("Failed to analyze job description");
  }

  return await response.json();
}
