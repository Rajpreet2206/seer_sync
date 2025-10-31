import React, { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api/client';
import { signInWithGoogle, signOut, getCurrentUser } from '../../extension/src/lib/auth/google-auth';
import type { User } from '../types/auth.types';
import type { Contact } from '../types/contact.types';
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_URL = 'http://localhost:8000';
const GEMINI_API_KEY = "AIzaSyBYiu0nNAURf96XWjnHf0Vt05Ndc2aUzUI";

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

const Popup: React.FC = () => {
  const [status, setStatus] = useState<string>('Loading...');
  const [apiStatus, setApiStatus] = useState<string>('Checking...');
  const [user, setUser] = useState<User | null>(null);
  const [internalUserId, setInternalUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContactEmail, setNewContactEmail] = useState('');
  const [addingContact, setAddingContact] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [sendingInvite, setSendingInvite] = useState(false);
  const [chatContact, setChatContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [showProcessMenu, setShowProcessMenu] = useState(false);
  const [selectedProcessType, setSelectedProcessType] = useState<string | null>(null);
  const [processingMessage, setProcessingMessage] = useState(false);
  const [processedPreview, setProcessedPreview] = useState<string | null>(null);
  const [pageContent, setPageContent] = useState<string>('');
  const [generatingResponse, setGeneratingResponse] = useState(false);
  const [contextData, setContextData] = useState<any>(null);
  const [showQuickSend, setShowQuickSend] = useState(false);
  const [sendingToContact, setSendingToContact] = useState(false);
  const [contextProcessType, setContextProcessType] = useState<string | null>(null);
  const [processingContextMessage, setProcessingContextMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasScrolledRef = useRef(false);
  //const [pollingMessages, setPollingMessages] = useState(false);
  useEffect(() => {
    initializePopup();
  }, []);

  useEffect(() => {
    if (user?.id) {
      getInternalUserId();
    }
  }, [user]);

  useEffect(() => {
    if (internalUserId) {
      loadContacts();
    }
  }, [internalUserId]);

  useEffect(() => {
    if (chatContact && internalUserId) {
      loadMessages();
    }
  }, [chatContact, internalUserId]);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (tabs[0]?.url && tabs[0].id) {
        setCurrentUrl(tabs[0].url);
        
        try {
          const results = await chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: () => document.body.innerText.substring(0, 500)
          });
          
          if (results && results[0]?.result) {
            setPageContent(results[0].result as string);
          }
        } catch (error) {
          console.error('Failed to get page content:', error);
        }
      }
    });
  }, []);


useEffect(() => {
  if (chatContact && messages.length > 0 && !hasScrolledRef.current) {
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        hasScrolledRef.current = true;
      }
    }, 100);
  }
}, [chatContact, messages.length]);


// Reset scroll flag when chat closes
useEffect(() => {
  if (!chatContact) {
    hasScrolledRef.current = false;
  }
}, [chatContact]);



useEffect(() => {
  if (!user) return;
  
  chrome.runtime.sendMessage({ type: 'GET_CONTEXT_DATA' }, (response) => {
    if (response && response.text) {
      console.log('Context data received:', response);
      setContextData(response);
      setShowQuickSend(true);
    }
  });
}, [user]);

useEffect(() => {
  if (internalUserId && contacts.length > 0) {
    chrome.runtime.sendMessage({
      type: 'UPDATE_CONTACTS',
      contacts: contacts,
      userId: internalUserId
    });
  }
}, [contacts, internalUserId]);



// Add this function to send selected text to a contact
const handleSendContextToContact = async (contact: Contact) => {
  if (!contextData || !internalUserId) return;

  setSendingToContact(true);
  try {
    let finalText = contextData.text;

    // Apply processing if selected
    if (contextProcessType) {
      setProcessingContextMessage(true);
      finalText = await processMessage(contextData.text, contextProcessType);
      setProcessingContextMessage(false);
    }

const messageContent = `📌 "${finalText}"\n\n📎 ${contextData.url}`;
    
    const resp = await fetch(
      `${API_URL}/api/v1/messages/send?sender_id=${internalUserId}&receiver_id=${contact.contact_user_id}&content=${encodeURIComponent(messageContent)}`,
      { method: 'POST' }
    ).then(r => r.json());

    if (resp.success) {
      alert(`Sent to ${contact.contact_name}!`);
      setContextData(null);
      setShowQuickSend(false);
      setContextProcessType(null);
    }
  } catch (error) {
    console.error('Send context failed:', error);
    alert('Failed to send');
  } finally {
    setSendingToContact(false);
  }
};

const generateMockReceiverResponse = async (userMessage: string): Promise<string> => {
  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = `You are a helpful assistant in a chat. The user just sent this message: "${userMessage}"\n\nRespond naturally and briefly (1-2 sentences) as if you're the other person in the conversation. Keep it conversational and friendly.`;
    
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Generate response error:', error);
    return "Thanks for your message!";
  }
};

  const initializePopup = async () => {
    const currentUser = await getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }

    chrome.runtime.sendMessage({ type: 'PING' }, (response) => {
      if (chrome.runtime.lastError) {
        setStatus('Error: ' + chrome.runtime.lastError.message);
        return;
      }
      if (response?.success) {
        setStatus('Connected ✓');
      } else {
        setStatus('Not connected');
      }
    });

    testApiConnection();
  };

  const testApiConnection = async () => {
    const result = await api.getHealth();
    if (result.success && result.data) {
      setApiStatus('Connected ✓');
    } else {
      setApiStatus(`Failed: ${result.error}`);
    }
  };

  const getInternalUserId = async () => {
    if (!user?.id) return;
    try {
      const resp = await fetch(
        `${API_URL}/api/v1/auth/by-google-id?google_id=${user.id}`
      ).then(r => r.json());
      if (resp.id) {
        setInternalUserId(resp.id);
      }
    } catch (error) {
      console.error('Get internal user ID failed:', error);
    }
  };

  const loadContacts = async () => {
    if (!internalUserId) return;
    const result = await api.listContacts(internalUserId);
    if (result.success && result.data) {
      setContacts(result.data as Contact[]);
    }
  };

const loadMessages = async () => {
  if (!chatContact || !internalUserId) return;
  setLoadingMessages(true);
  try {
    const resp = await fetch(
      `${API_URL}/api/v1/messages/history?user_id=${internalUserId}&contact_id=${chatContact.contact_user_id}`
    ).then(r => r.json());
    
    // Only update state if messages actually changed
    setMessages((prevMessages) => {
      const newMessagesJSON = JSON.stringify(resp || []);
      const oldMessagesJSON = JSON.stringify(prevMessages);
      
      if (newMessagesJSON !== oldMessagesJSON) {
        return resp || [];
      }
      return prevMessages;
    });
  } catch (error) {
    console.error('Load messages failed:', error);
  } finally {
    setLoadingMessages(false);
  }
};

// Update handleSendMessage to add mock response
const handleSendMessage = async (processType?: string) => {
  if (!messageInput.trim() || !internalUserId || !chatContact) return;

  if (processType && !processedPreview) {
    setProcessingMessage(true);
    const processed = await processMessage(messageInput.trim(), processType);
    setProcessedPreview(processed);
    setProcessingMessage(false);
    return;
  }

  const finalMessage = processedPreview || messageInput.trim();
  const messageWithUrl = `${finalMessage}\n\n📎 ${currentUrl}`;

  try {
    const resp = await fetch(
      `${API_URL}/api/v1/messages/send?sender_id=${internalUserId}&receiver_id=${chatContact.contact_user_id}&content=${encodeURIComponent(messageWithUrl)}`,
      { method: 'POST' }
    ).then(r => r.json());

    if (resp.success) {
      setMessageInput('');
      setShowProcessMenu(false);
      setSelectedProcessType(null);
      setProcessedPreview(null);
      await loadMessages();

      // Generate and show mock receiver response after a short delay
      setGeneratingResponse(true);
      setTimeout(async () => {
        const mockResponse = await generateMockReceiverResponse(finalMessage);
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: Date.now().toString(),
            sender_id: chatContact.contact_user_id,
            content: mockResponse,
            created_at: new Date().toISOString()
          }
        ]);
        setGeneratingResponse(false);
      }, 1000);
    }
  } catch (error) {
    console.error('Send message failed:', error);
  }
};

  const processMessage = async (text: string, type: string): Promise<string> => {
    console.log('Processing:', { text, type });
    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      
      const prompt = getPrompt(text, type);
      console.log('Prompt:', prompt);
      
      const result = await model.generateContent(prompt);
      const processedText = result.response.text();
      
      console.log('Processed text:', processedText);
      return processedText;
    } catch (error) {
      console.error('Gemini API error:', error);
      return text;
    }
  };

  const getPrompt = (text: string, type: string): string => {
    const context = pageContent ? `\n\nPage context: ${pageContent}` : '';
    const prompts: { [key: string]: string } = {
      proofread: `Fix grammar in this message:\n"${text}"${context}`,
      summarize: `Summarize in 1-3 sentences:\n"${text}"${context}`,
      translate: `Translate to English:\n"${text}"${context}`,
      rewrite: `Rewrite better:\n"${text}"${context}`,
      generate: `Generate professional version:\n"${text}"${context}`
    };
    return prompts[type] || text;
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const resp = await fetch(
        `${API_URL}/api/v1/messages/delete?message_id=${messageId}&user_id=${internalUserId}`,
        { method: 'DELETE' }
      ).then(r => r.json());

      if (resp.success) {
        await loadMessages();
      }
    } catch (error) {
      console.error('Delete message failed:', error);
    }
  };

  const handleOpenChat = (contact: Contact) => {
    setChatContact(contact);
  };

  const handleCloseChat = () => {
    setChatContact(null);
    setMessages([]);
  };

  const handleSendInvite = async () => {
    if (!internalUserId || !inviteEmail.trim()) return;

    setSendingInvite(true);
    try {
      const result = await fetch(
        `${API_URL}/api/v1/contacts/invite?user_id=${internalUserId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: inviteEmail.trim(),
            message: inviteMessage.trim() || ''
          })
        }
      ).then(r => r.json());

      if (result.success) {
        alert(`Invitation sent to ${inviteEmail}!`);
        setInviteEmail('');
        setInviteMessage('');
        setShowInvite(false);
      } else {
        alert(result.detail || result.message || 'Failed to send invite');
      }
    } catch (error) {
      console.error('Send invite failed:', error);
      alert('Failed to send invite');
    } finally {
      setSendingInvite(false);
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const userInfo = await signInWithGoogle();
      setUser(userInfo);
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setUser(null);
      setInternalUserId(null);
      setContacts([]);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleAddContact = async () => {
    if (!internalUserId || !newContactEmail.trim()) return;

    setAddingContact(true);
    try {
      const userResp = await fetch(
        `${API_URL}/api/v1/contacts/by-email?email=${encodeURIComponent(newContactEmail.trim())}`,
        { method: 'GET' }
      ).then(r => r.json());

      if (!userResp.id) {
        alert('User not found');
        return;
      }

      const addResp = await api.addContact(internalUserId, userResp.id);
      if (addResp.success) {
        setNewContactEmail('');
        setShowAddContact(false);
        await loadContacts();
      } else {
        alert(addResp.error || 'Failed to add contact');
      }
    } catch (error) {
      console.error('Add contact failed:', error);
      alert('Failed to add contact');
    } finally {
      setAddingContact(false);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!internalUserId) return;
    if (!confirm('Remove this contact?')) return;

    const result = await api.deleteContact(contactId, internalUserId);
    if (result.success) {
      await loadContacts();
    } else {
      alert(result.error || 'Failed to remove contact');
    }
  };

  if (!user) {
    return (
      <div className="w-[450px] h-[595px] bg-gray-50">
        <div className="bg-primary-600 text-white p-4 shadow-md">
          <h1 className="text-xl font-bold">Seer Sync</h1>
          <p className="text-sm text-primary-100">Real-time Communication</p>
        </div>

        <div className="p-4">
          <div className="flex flex-col items-center justify-center h-[550px]">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">💬</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Welcome to Seer Sync
              </h2>
              <p className="text-gray-600 mb-6">
                Sign in with Google to start messaging
              </p>
            </div>

            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="flex items-center gap-3 bg-white border-2 border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="font-semibold text-gray-700">
                {isLoading ? 'Signing in...' : 'Sign in with Google'}
              </span>
            </button>

            <div className="mt-8 space-y-1 text-xs text-gray-500 text-center">
              <p>Extension: {status}</p>
              <p>Backend: {apiStatus}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (chatContact) {
    return (
      <div className="w-[450px] h-[595px] bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4 shadow-lg flex justify-between items-center">
<div>
  <h1 className="text-lg font-bold">
    {chatContact.contact_name}
  </h1>
  <p className="text-xs text-primary-100">{chatContact.contact_email}</p>
</div>
          <button
            onClick={handleCloseChat}
            className="text-white hover:text-gray-200 text-2xl transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-white">
          {loadingMessages ? (
            <div className="text-center text-gray-500">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">No messages yet. Start the conversation!</div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`mb-4 flex ${msg.sender_id === internalUserId ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`px-5 py-3 rounded-2xl max-w-xs shadow-md ${
                    msg.sender_id === internalUserId
                      ? 'bg-primary-600 text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}
                >
                  <p className="text-base whitespace-pre-wrap leading-relaxed">
                    {msg.content.split('\n').map((line, idx) => 
                      line.startsWith('📎 http') ? (
                        <div key={idx} className="mt-2 pt-2 border-t border-current border-opacity-20">
                          <span className="mr-1">📎</span>
                          <a 
                            href={line.replace('📎 ', '')} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="underline hover:opacity-80 break-all text-xs"
                            title={line.replace('📎 ', '')}
                          >
                            {line.replace('📎 ', '').length > 40 
                              ? line.replace('📎 ', '').substring(0, 40) + '...' 
                              : line.replace('📎 ', '')}
                          </a>
                        </div>
                      ) : (
                        <div key={idx}>{line}</div>
                      )
                    )}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <p className="text-xs opacity-60">
                      {new Date(msg.created_at).toLocaleTimeString()}
                    </p>
                    {msg.sender_id === internalUserId && (
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="text-xs opacity-60 hover:opacity-100 transition-opacity"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          {generatingResponse && (
  <div className="mb-4 flex justify-start">
    <div className="px-5 py-3 rounded-2xl bg-gray-100 text-gray-800 rounded-bl-none shadow-md">
      <div className="flex gap-2 items-center">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
      </div>
    </div>
  </div>
)}
 <div ref={messagesEndRef} />
        </div>

        {processedPreview && (
          <>
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={() => setProcessedPreview(null)} />
            <div className="absolute inset-0 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl border-2 border-primary-500 p-8 max-w-md min-h-64">
                <p className="text-sm font-bold text-primary-700 mb-4">✨ Preview</p>
                <p className="text-lg text-gray-800 mb-6 leading-relaxed">{processedPreview}</p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setProcessedPreview(null)} 
                    className="flex-1 px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleSendMessage()}
                    className="flex-1 px-4 py-2 text-sm rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors font-medium"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="p-4 border-t border-gray-200 bg-white flex gap-2 rounded-t-xl relative">
          <input
            type="text"
            placeholder="Type message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
          />
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowProcessMenu(!showProcessMenu)}
              className="text-primary-600 hover:text-primary-700 text-xl transition-colors"
              title="Process message"
            >
              ✨
            </button>
            {selectedProcessType && (
              <span className="text-[7px] bg-primary-100 text-primary-700 px-2 py-1 rounded-full font-medium">
                {selectedProcessType}
              </span>
            )}
          </div>
          <button
            onClick={() => handleSendMessage(selectedProcessType || undefined)}
            disabled={!messageInput.trim() || processingMessage}
            className="bg-primary-600 text-white px-6 py-2 rounded-full text-xs font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors shadow-md"
          >
            {processingMessage ? 'Processing...' : 'Send'}
          </button>

          {showProcessMenu && (
            <div className="absolute bottom-16 right-4 bg-white rounded-lg shadow-lg border border-gray-200 z-10 w-48">
              <div className="p-3 border-b border-gray-200 bg-gray-50">
                <p className="text-xs font-medium text-gray-600">Selected: {selectedProcessType || 'None'}</p>
              </div>
              <button onClick={() => { setSelectedProcessType('proofread'); setShowProcessMenu(false); }} className={`w-full px-4 py-2 text-left text-sm border-b ${selectedProcessType === 'proofread' ? 'bg-[#122E34]/10' : 'hover:bg-gray-50'}`}>✏️ Proofread</button>
              <button onClick={() => { setSelectedProcessType('summarize'); setShowProcessMenu(false); }} className={`w-full px-4 py-2 text-left text-sm border-b ${selectedProcessType === 'summarize' ? 'bg-[#122E34]/10' : 'hover:bg-gray-50'}`}>📄 Summarize</button>
              <button onClick={() => { setSelectedProcessType('translate'); setShowProcessMenu(false); }} className={`w-full px-4 py-2 text-left text-sm border-b ${selectedProcessType === 'translate' ? 'bg-[#122E34]/10' : 'hover:bg-gray-50'}`}>🌐 Translate</button>
              <button onClick={() => { setSelectedProcessType('rewrite'); setShowProcessMenu(false); }} className={`w-full px-4 py-2 text-left text-sm border-b ${selectedProcessType === 'rewrite' ? 'bg-[#122E34]/10' : 'hover:bg-gray-50'}`}>✏️ Rewrite</button>
              <button onClick={() => { setSelectedProcessType('generate'); setShowProcessMenu(false); }} className={`w-full px-4 py-2 text-left text-sm ${selectedProcessType === 'generate' ? 'bg-[#122E34]/10' : 'hover:bg-gray-50'}`}>🔤 Generate</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-[450px] h-[650px] bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4 shadow-lg">
        <h1 className="text-xl font-bold">Seer Sync</h1>
        <p className="text-sm text-primary-100">Real-time Communication in Browser</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="bg-white rounded-2xl p-4 mb-4 shadow-md border border-gray-200">
          <div className="flex items-center gap-3">
            {user.picture && (
              <img src={user.picture} alt={user.name} className="w-12 h-12 rounded-full shadow-sm"/>
            )}
            <div className="flex-1">
              <p className="font-semibold text-gray-800">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:text-red-700 px-3 py-1 rounded-lg hover:bg-red-50 transition-colors font-medium"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-gray-200 mb-4">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="font-bold text-gray-800">Contacts ({contacts.length})</h2>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowAddContact(false);
                  setShowInvite(!showInvite);
                }}
                className="text-[#122E34] hover:text-[#122E34] text-sm font-medium transition-colors"
              >
                ✉️ Invite
              </button>
              <button
                onClick={() => {
                  setShowInvite(false);
                  setShowAddContact(!showAddContact);
                }}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors"
              >
                + Add
              </button>
            </div>
          </div>

          {showInvite && (
            <div className="p-4 border-b border-gray-200 bg-[#122E34]/5">
              <p className="text-xs text-[#122E34] mb-2 font-medium">Send an invite to someone new</p>
              <input
                type="email"
                placeholder="Enter email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#122E34]/20"
              />
              <textarea
                placeholder="Optional message"
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#122E34]/20"
                rows={2}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSendInvite}
                  disabled={sendingInvite || !inviteEmail.trim()}
                  className="flex-1 bg-[#122E34] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#122E34] disabled:opacity-50 font-medium transition-colors"
                >
                  {sendingInvite ? 'Sending...' : 'Send Invite'}
                </button>
                <button
                  onClick={() => {
                    setShowInvite(false);
                    setInviteEmail('');
                    setInviteMessage('');
                  }}
                  className="px-4 py-2 text-gray-600 text-sm hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {showAddContact && (
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <p className="text-xs text-gray-600 mb-2 font-medium">Add existing user as contact</p>
              <input
                type="email"
                placeholder="Enter email address"
                value={newContactEmail}
                onChange={(e) => setNewContactEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddContact}
                  disabled={addingContact || !newContactEmail.trim()}
                  className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-700 disabled:opacity-50 font-medium transition-colors"
                >
                  {addingContact ? 'Adding...' : 'Add Contact'}
                </button>
                <button
                  onClick={() => {
                    setShowAddContact(false);
                    setNewContactEmail('');
                  }}
                  className="px-4 py-2 text-gray-600 text-sm hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="max-h-64 overflow-y-auto">
            {contacts.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">
                No contacts yet. Invite friends or add existing users!
              </div>
            ) : (
              contacts.map((contact) => (
                <div key={contact.id} className="p-3 border-b border-gray-100 hover:bg-[#122E34]/5 flex items-center gap-3 transition-colors">
                  {contact.contact_picture && (
                    <img src={contact.contact_picture} alt={contact.contact_name} className="w-10 h-10 rounded-full shadow-sm"/>
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 text-sm">{contact.contact_name}</p>
                    <p className="text-xs text-gray-500">{contact.contact_email}</p>
                  </div>
                  <button
                    onClick={() => handleOpenChat(contact)}
                    className="text-[#122E34] hover:text-[#122E34] text-xs mr-2 font-medium transition-colors"
                  >
                    💬 Chat
                  </button>
                  <button
                    onClick={() => handleDeleteContact(contact.id)}
                    className="text-red-500 hover:text-red-700 text-xs font-medium transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

{showQuickSend && contextData && (
  <>
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={() => setShowQuickSend(false)} />
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-primary-500 p-6 max-w-md">
        <h3 className="text-lg font-bold text-gray-800 mb-2">Send Selected Text</h3>
        
        <div className="bg-gray-50 rounded-lg p-3 mb-4 max-h-24 overflow-y-auto">
          <p className="text-sm text-gray-600 italic">"{contextData.text}"</p>
          <p className="text-xs text-gray-500 mt-2">{contextData.title}</p>
        </div>

        <div className="mb-4 pb-4 border-b border-gray-200">
          <p className="text-xs font-medium text-gray-600 mb-2">Process:</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setContextProcessType(null)}
              className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                contextProcessType === null
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              None
            </button>
            <button
              onClick={() => setContextProcessType('proofread')}
              className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                contextProcessType === 'proofread'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ✏️ Proofread
            </button>
            <button
              onClick={() => setContextProcessType('summarize')}
              className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                contextProcessType === 'summarize'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📄 Summarize
            </button>
            <button
              onClick={() => setContextProcessType('rewrite')}
              className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                contextProcessType === 'rewrite'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ✏️ Rewrite
            </button>
          </div>
        </div>

        <p className="text-xs font-medium text-gray-600 mb-3">Send to:</p>
        
        <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
          {contacts.length === 0 ? (
            <p className="text-sm text-gray-500">No contacts available</p>
          ) : (
            contacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => handleSendContextToContact(contact)}
                disabled={sendingToContact || processingContextMessage}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-primary-50 hover:border-primary-300 transition-colors disabled:opacity-50"
              >
                {contact.contact_picture && (
                  <img src={contact.contact_picture} alt={contact.contact_name} className="w-8 h-8 rounded-full"/>
                )}
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-800">{contact.contact_name}</p>
                  <p className="text-xs text-gray-500">{contact.contact_email}</p>
                </div>
              </button>
            ))
          )}
        </div>

        <button
          onClick={() => {
            setShowQuickSend(false);
            setContextProcessType(null);
          }}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  </>
)}

{generatingResponse && (
  <div className="mb-4 flex justify-start">
    <div className="px-5 py-3 rounded-2xl bg-gray-100 text-gray-800 rounded-bl-none shadow-md">
      <div className="flex gap-2 items-center">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
      </div>
    </div>
  </div>
)}
    </div>
    
  );
};

export default Popup;