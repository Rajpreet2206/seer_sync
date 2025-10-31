/// <reference types="chrome"/>
import { api } from '../api/client';

export interface GoogleUserInfo {
  email: string;
  name: string;
  picture: string;
  id: string;
}

export async function signInWithGoogle(): Promise<GoogleUserInfo> {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, async (token) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }

      if (!token) {
        reject(new Error('No token received'));
        return;
      }

      try {
        // Fetch user info from Google
        const response = await fetch(
          'https://www.googleapis.com/oauth2/v2/userinfo',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch user info');
        }

        const userInfo = await response.json();
        
        // Register user with backend
        const registerResult = await api.registerUser({
          email: userInfo.email,
          name: userInfo.name,
          google_id: userInfo.id,
          picture: userInfo.picture,
        });

        if (!registerResult.success) {
          console.error('Failed to register user with backend:', registerResult.error);
          // Continue anyway - user can still use extension
        } else {
          console.log('User registered with backend:', registerResult.data);
        }
        
        // Store in chrome storage
        await chrome.storage.local.set({
          user: {
            id: userInfo.id,
            email: userInfo.email,
            name: userInfo.name,
            picture: userInfo.picture,
          },
          token,
          isAuthenticated: true,
        });

        resolve(userInfo);
      } catch (error) {
        reject(error);
      }
    });
  });
}

export async function signOut(): Promise<void> {
  const result = await chrome.storage.local.get(['token']);
  
  if (result.token) {
    await chrome.identity.removeCachedAuthToken({ token: result.token });
  }

  await chrome.storage.local.remove(['user', 'token', 'isAuthenticated']);
}

export async function getCurrentUser(): Promise<GoogleUserInfo | null> {
  const result = await chrome.storage.local.get(['user', 'isAuthenticated']);
  
  if (result.isAuthenticated && result.user) {
    return result.user;
  }
  
  return null;
}