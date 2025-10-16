console.log('Background service worker loaded - Chrome Comm Extension');

chrome.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed:', details.reason);
  
  if (details.reason === 'install') {
    console.log('First time installation');
    chrome.storage.local.set({
      isFirstRun: true,
      installedAt: Date.now(),
    });
  } else if (details.reason === 'update') {
    console.log('Extension updated');
  }
});

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  console.log('Background received message:', request);

  switch (request.type) {
    case 'PING':
      console.log('Ping received, sending pong');
      sendResponse({ success: true, message: 'Pong from background!' });
      break;

    case 'CONTENT_SCRIPT_READY':
      console.log('Content script ready on:', request.url);
      sendResponse({ success: true, message: 'Background acknowledged' });
      break;

    case 'GET_TAB_INFO':
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          sendResponse({
            success: true,
            tab: {
              id: tabs[0].id,
              url: tabs[0].url,
              title: tabs[0].title,
            },
          });
        } else {
          sendResponse({ success: false, error: 'No active tab found' });
        }
      });
      return true;

    default:
      console.log('Unknown message type:', request.type);
      sendResponse({ success: false, error: 'Unknown message type' });
  }

  return true;
});

chrome.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    console.log('Tab updated:', tab.url);
  }
});

console.log('Background service worker initialization complete');