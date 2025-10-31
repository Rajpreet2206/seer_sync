const API_BASE_URL = 'http://localhost:8000';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  google_id: string;
  picture?: string;
}

export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('API request failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export const api = {
  async getHealth() {
    return apiRequest('/health');
  },

  async getRoot() {
    return apiRequest('/');
  },

  async registerUser(userData: {
    email: string;
    name: string;
    google_id: string;
    picture?: string;
  }) {
    return apiRequest('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  async getCurrentUser(googleId: string) {
    return apiRequest(`/api/v1/auth/me?google_id=${googleId}`);
  },

  async listUsers() {
    return apiRequest('/api/v1/auth/users');
  },

  // -----------------------------
  // New method to fetch user by email
  // -----------------------------
  async getUserByEmail(email: string) {
    return apiRequest(`/api/v1/users/by-email?email=${encodeURIComponent(email)}`);
  },

  // Updated to require user_id and contact_user_id
  async addContact(userId: string, contactUserId: string) {
    return apiRequest(`/api/v1/contacts/add?user_id=${userId}&contact_user_id=${contactUserId}`, {
      method: 'POST',
    });
  },

  async listContacts(userId: string) {
    return apiRequest(`/api/v1/contacts/list?user_id=${userId}`);
  },

  async deleteContact(contactId: string, userId: string) {
    return apiRequest(`/api/v1/contacts/${contactId}?user_id=${userId}`, {
      method: 'DELETE',
    });
  },

  async sendInvite(userId: string, email: string, message?: string) {
    return apiRequest(`/api/v1/contacts/invite?user_id=${userId}`, {
      method: 'POST',
      body: JSON.stringify({ email, message }),
    });
  },
};
