const API_BASE = "https://jobai-production-cf74.up.railway.app";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "ANALYZE_JOB") {
    const pageText = document.body.innerText;

    fetch(`${API_BASE}/analyze-job`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page_text: pageText })
    })
      .then(res => res.json())
      .then(data => sendResponse({ success: true, data }))
      .catch(err => sendResponse({ success: false, error: err.message }));

    return true; // async
  }
});
