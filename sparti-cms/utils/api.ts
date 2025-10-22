// API utility for consistent API calls
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4173';

export const api = {
  // Get the base URL
  getBaseUrl: () => API_BASE_URL,
  
  // Make API calls with proper base URL
  get: async (endpoint: string, options?: RequestInit) => {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    return fetch(url, {
      method: 'GET',
      ...options,
    });
  },
  
  post: async (endpoint: string, data?: any, options?: RequestInit) => {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  },
  
  put: async (endpoint: string, data?: any, options?: RequestInit) => {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    return fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  },
  
  delete: async (endpoint: string, options?: RequestInit) => {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    return fetch(url, {
      method: 'DELETE',
      ...options,
    });
  },
};

export default api;
