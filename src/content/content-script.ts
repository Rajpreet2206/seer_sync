console.log('Chrome Comm - Content script loaded on:', window.location.href);

chrome.runtime.sendMessage(
  {
    type: 'CONTENT_SCRIPT_READY',
    url: window.location.href,
    timestamp: Date.now(),
  },
  (response) => {
    if (chrome.runtime.lastError) {
      console.error('Error sending message:', chrome.runtime.lastError);
      return;
    }
    console.log('Background acknowledged:', response);
  }
);

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  console.log('Content script received message:', request);

  switch (request.type) {
    case 'GET_PAGE_INFO':
      sendResponse({
        success: true,
        pageInfo: {
          url: window.location.href,
          title: document.title,
          timestamp: Date.now(),
        },
      });
      break;

    default:
      sendResponse({ success: false, error: 'Unknown message type' });
  }

  return true;
});

console.log('Chrome Comm - Content script initialization complete');