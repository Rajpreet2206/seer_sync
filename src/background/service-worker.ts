console.log('🚀 Background service worker loaded - Seer Sync Extension');

const API_URL = 'http://localhost:8000';
const GEMINI_API_KEY = "AIzaSyBYiu0nNAURf96XWjnHf0Vt05Ndc2aUzUI";

let cachedContacts: any[] = [];
let cachedUserId: string | null = null;

// ============================================
// INITIALIZATION
// ============================================
chrome.runtime.onInstalled.addListener((details) => {
  console.log('📦 Extension installed:', details.reason);
  createContextMenus();
  
  if (details.reason === 'install') {
    chrome.storage.local.set({
      isFirstRun: true,
      installedAt: Date.now(),
    });
  }
});

// ============================================
// CONTEXT MENU CREATION
// ============================================
function createContextMenus() {
  chrome.contextMenus.removeAll(() => {
    console.log('📋 Creating context menus. Contacts:', cachedContacts.length);
    
    chrome.contextMenus.create({
      id: 'seer-sync-send',
      title: 'Send to Seer Sync',
      contexts: ['selection']
    });

    if (cachedContacts.length > 0) {
      cachedContacts.forEach((contact) => {
        chrome.contextMenus.create({
          id: `contact-${contact.id}`,
          parentId: 'seer-sync-send',
          title: contact.contact_name,
          contexts: ['selection']
        });

        chrome.contextMenus.create({
          id: `contact-${contact.id}-send`,
          parentId: `contact-${contact.id}`,
          title: '📤 Send as-is',
          contexts: ['selection']
        });

        chrome.contextMenus.create({
          id: `contact-${contact.id}-proofread`,
          parentId: `contact-${contact.id}`,
          title: '✏️ Proofread',
          contexts: ['selection']
        });

        chrome.contextMenus.create({
          id: `contact-${contact.id}-summarize`,
          parentId: `contact-${contact.id}`,
          title: '📄 Summarize',
          contexts: ['selection']
        });

        chrome.contextMenus.create({
          id: `contact-${contact.id}-rewrite`,
          parentId: `contact-${contact.id}`,
          title: '✏️ Rewrite',
          contexts: ['selection']
        });
      });
    } else {
      chrome.contextMenus.create({
        id: 'no-contacts',
        parentId: 'seer-sync-send',
        title: 'No contacts available',
        enabled: false,
        contexts: ['selection']
      });
    }
  });
}

// ============================================
// CONTEXT MENU CLICK HANDLER
// ============================================
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  console.log('🖱️ Context menu clicked:', info.menuItemId);
  
  const selectedText = info.selectionText || '';
  const pageUrl = tab?.url || '';

  if (!selectedText) {
    console.error('❌ No text selected');
    return;
  }

  const menuId = String(info.menuItemId);
  
  // Extract process type first (send, proofread, summarize, rewrite)
  let processType: string | null = null;
  let contactId = menuId.replace('contact-', '');
  
  if (contactId.includes('-send')) {
    processType = 'send';
    contactId = contactId.replace('-send', '');
  } else if (contactId.includes('-proofread')) {
    processType = 'proofread';
    contactId = contactId.replace('-proofread', '');
  } else if (contactId.includes('-summarize')) {
    processType = 'summarize';
    contactId = contactId.replace('-summarize', '');
  } else if (contactId.includes('-rewrite')) {
    processType = 'rewrite';
    contactId = contactId.replace('-rewrite', '');
  }
  
  console.log('📌 Extracted contactId:', contactId, 'processType:', processType);
  
  const contact = cachedContacts.find((c) => c.id === contactId);

  console.log('📍 Contact:', contact?.contact_name, 'UserId:', cachedUserId);

  if (!contact || !cachedUserId) {
    console.error('❌ Missing contact or userId');
    return;
  }

  try {
    let finalText = selectedText;

    if (processType && processType !== 'send') {
      console.log('🔄 Processing with Gemini:', processType);
      finalText = await processWithGemini(selectedText, processType);
    }

    const messageContent = `📌 "${finalText}"\n\n📎 ${pageUrl}`;

    console.log('📤 Sending message to:', contact.contact_name);
    const resp = await fetch(
      `${API_URL}/api/v1/messages/send?sender_id=${cachedUserId}&receiver_id=${contact.contact_user_id}&content=${encodeURIComponent(messageContent)}`,
      { method: 'POST' }
    ).then((r) => r.json());

    if (resp.success) {
      console.log(`✅ Message sent to ${contact.contact_name}!`);
    } else {
      console.error('❌ Send failed:', resp);
    }
  } catch (error) {
    console.error('❌ Send error:', error);
  }
});

// ============================================
// GEMINI PROCESSING
// ============================================
async function processWithGemini(text: string, type: string): Promise<string> {
  try {
    const module = await import('@google/generative-ai');
    const GoogleGenerativeAI = module.GoogleGenerativeAI;
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    let prompt = '';
    if (type === 'proofread') {
      prompt = `Fix grammar and spelling:\n"${text}"\n\nOnly return corrected text.`;
    } else if (type === 'summarize') {
      prompt = `Summarize in 1-2 sentences:\n"${text}"\n\nOnly return summary.`;
    } else if (type === 'rewrite') {
      prompt = `Rewrite professionally:\n"${text}"\n\nOnly return rewritten text.`;
    } else {
      return text;
    }

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('❌ Gemini error:', error);
    return text;
  }
}

// ============================================
// MESSAGE LISTENER (SINGLE HANDLER)
// ============================================
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  console.log('📨 Message received:', request.type);

  if (request.type === 'PING') {
    sendResponse({ success: true });
    return true;
  }

  if (request.type === 'UPDATE_CONTACTS') {
    console.log('✅ Updating contacts:', request.contacts?.length);
    cachedContacts = request.contacts || [];
    cachedUserId = request.userId || null;
    createContextMenus();
    sendResponse({ success: true });
    return true;
  }

  if (request.type === 'CONTENT_SCRIPT_READY') {
    sendResponse({ success: true });
    return true;
  }

  if (request.type === 'GET_TAB_INFO') {
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
  }

  sendResponse({ success: false, error: 'Unknown message type' });
  return true;
});

// ============================================
// TAB UPDATE LISTENER
// ============================================
chrome.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    console.log('📄 Tab updated:', tab.url);
  }
});

console.log('✅ Background service worker initialization complete');