// API utility for consistent API calls
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4173';

// Get JWT token from localStorage
const getAuthToken = () => {
  const session = localStorage.getItem('sparti-demo-session');
  console.log('[testing] API utility - Session data:', session);
  if (session) {
    try {
      const userData = JSON.parse(session);
      console.log('[testing] API utility - Token:', userData.token ? 'Present' : 'Missing');
      return userData.token;
    } catch (error) {
      console.error('Error parsing session data:', error);
      return null;
    }
  }
  console.log('[testing] API utility - No session found');
  return null;
};

// Get headers with authentication
const getAuthHeaders = (additionalHeaders: Record<string, string> = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...additionalHeaders,
  };
  console.log('[testing] API utility - Headers being sent:', headers);
  return headers;
};

export const api = {
  // Get the base URL
  getBaseUrl: () => API_BASE_URL,
  
  // Make API calls with proper base URL and authentication
  get: async (endpoint: string, options?: RequestInit) => {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    const { headers: additionalHeaders, ...restOptions } = options || {};
    return fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(additionalHeaders as Record<string, string>),
      ...restOptions,
    });
  },
  
  post: async (endpoint: string, data?: any, options?: RequestInit) => {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    const { headers: additionalHeaders, ...restOptions } = options || {};
    return fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(additionalHeaders as Record<string, string>),
      body: data ? JSON.stringify(data) : undefined,
      ...restOptions,
    });
  },
  
  put: async (endpoint: string, data?: any, options?: RequestInit) => {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    const { headers: additionalHeaders, ...restOptions } = options || {};
    return fetch(url, {
      method: 'PUT',
      headers: getAuthHeaders(additionalHeaders as Record<string, string>),
      body: data ? JSON.stringify(data) : undefined,
      ...restOptions,
    });
  },
  
  delete: async (endpoint: string, options?: RequestInit) => {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    const { headers: additionalHeaders, ...restOptions } = options || {};
    return fetch(url, {
      method: 'DELETE',
      headers: getAuthHeaders(additionalHeaders as Record<string, string>),
      ...restOptions,
    });
  },
};

export default api;
