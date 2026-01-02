chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "GET_PAGE_TEXT") {
      const text = document.body.innerText;
      sendResponse({ pageText: text });
    }
  });
  