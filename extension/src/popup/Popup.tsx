import React, { useState, useEffect } from 'react';
import { api } from '../lib/api/client';
import { signInWithGoogle, signOut, getCurrentUser } from '../lib/auth/google-auth';
import type { User } from '../types/auth.types';
import type { Contact } from '../types/contact.types';

const Popup: React.FC = () => {
  const [status, setStatus] = useState<string>('Loading...');
  const [apiStatus, setApiStatus] = useState<string>('Checking...');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContactEmail, setNewContactEmail] = useState('');
  const [addingContact, setAddingContact] = useState(false);

  useEffect(() => {
    initializePopup();
  }, []);

  useEffect(() => {
    if (user?.id) {
      loadContacts();
    }
  }, [user]);

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

  const loadContacts = async () => {
    if (!user?.id) return;
    
    const result = await api.listContacts(user.id);
    if (result.success && result.data) {
      setContacts(result.data);
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
      setContacts([]);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleAddContact = async () => {
    if (!user?.id || !newContactEmail.trim()) return;

    setAddingContact(true);
    try {
      const result = await api.addContact(user.id, newContactEmail.trim());
      if (result.success) {
        setNewContactEmail('');
        setShowAddContact(false);
        await loadContacts();
      } else {
        alert(result.error || 'Failed to add contact');
      }
    } catch (error) {
      console.error('Add contact failed:', error);
      alert('Failed to add contact');
    } finally {
      setAddingContact(false);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!user?.id) return;
    
    if (!confirm('Remove this contact?')) return;

    const result = await api.deleteContact(contactId, user.id);
    if (result.success) {
      await loadContacts();
    } else {
      alert(result.error || 'Failed to remove contact');
    }
  };

  if (!user) {
    return (
      <div className="w-[400px] h-[600px] bg-gray-50">
        <div className="bg-primary-600 text-white p-4 shadow-md">
          <h1 className="text-xl font-bold">Chrome Comm</h1>
          <p className="text-sm text-primary-100">Real-time Communication</p>
        </div>

        <div className="p-4">
          <div className="flex flex-col items-center justify-center h-[500px]">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">💬</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Welcome to Chrome Comm
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

  return (
    <div className="w-[400px] h-[600px] bg-gray-50 flex flex-col">
      <div className="bg-primary-600 text-white p-4 shadow-md">
        <h1 className="text-xl font-bold">Chrome Comm</h1>
        <p className="text-sm text-primary-100">Real-time Communication</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* User Profile */}
        <div className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            {user.picture && (
              <img src={user.picture} alt={user.name} className="w-12 h-12 rounded-full"/>
            )}
            <div className="flex-1">
              <p className="font-semibold text-gray-800">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:text-red-700 px-3 py-1 rounded hover:bg-red-50 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Contacts Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="font-semibold text-gray-800">Contacts ({contacts.length})</h2>
            <button
              onClick={() => setShowAddContact(!showAddContact)}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              + Add
            </button>
          </div>

          {showAddContact && (
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <input
                type="email"
                placeholder="Enter email address"
                value={newContactEmail}
                onChange={(e) => setNewContactEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 text-sm"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddContact}
                  disabled={addingContact || !newContactEmail.trim()}
                  className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-700 disabled:opacity-50"
                >
                  {addingContact ? 'Adding...' : 'Add Contact'}
                </button>
                <button
                  onClick={() => {
                    setShowAddContact(false);
                    setNewContactEmail('');
                  }}
                  className="px-4 py-2 text-gray-600 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="max-h-64 overflow-y-auto">
            {contacts.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">
                No contacts yet. Add someone to start chatting!
              </div>
            ) : (
              contacts.map((contact) => (
                <div key={contact.id} className="p-3 border-b border-gray-100 hover:bg-gray-50 flex items-center gap-3">
                  {contact.contact_picture && (
                    <img src={contact.contact_picture} alt={contact.contact_name} className="w-10 h-10 rounded-full"/>
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 text-sm">{contact.contact_name}</p>
                    <p className="text-xs text-gray-500">{contact.contact_email}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteContact(contact.id)}
                    className="text-red-500 hover:text-red-700 text-xs"
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Messages</p>
            <p className="text-2xl font-bold text-primary-600">0</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Status</p>
            <p className="text-sm font-semibold text-green-600">Online</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Popup;