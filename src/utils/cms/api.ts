// API utility for consistent API calls
// In development, use relative URLs to leverage Vite proxy
// In production, default to same-origin unless VITE_API_BASE_URL is explicitly set
const getApiBaseUrl = () => {
  if (import.meta.env.DEV) return '';

  const raw = String(import.meta.env.VITE_API_BASE_URL || '').trim();
  if (!raw) return '';

  // If a domain is provided without protocol, assume https
  if (!raw.startsWith('http://') && !raw.startsWith('https://')) {
    return `https://${raw}`;
  }

  return raw;
};

const API_BASE_URL = getApiBaseUrl();

// Get JWT token from localStorage
const getAuthToken = () => {
  const session = localStorage.getItem('sparti-user-session');
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

// Get access key from localStorage
const getAccessKey = () => {
  return localStorage.getItem('sparti-access-key');
};

// Get tenant API key from localStorage
// Supports both tenant-specific keys (sparti-tenant-api-key-{tenantId}) and global key (sparti-tenant-api-key)
const getTenantApiKey = (tenantId?: string) => {
  if (tenantId) {
    // Try tenant-specific key first
    const tenantSpecificKey = localStorage.getItem(`sparti-tenant-api-key-${tenantId}`);
    if (tenantSpecificKey) {
      return tenantSpecificKey;
    }
  }
  // Fallback to global tenant API key
  return localStorage.getItem('sparti-tenant-api-key');
};

// Get headers with authentication
const getAuthHeaders = (additionalHeaders: Record<string, string> = {}, tenantId?: string) => {
  const token = getAuthToken();
  const accessKey = getAccessKey();
  const tenantApiKey = getTenantApiKey(tenantId);
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...(accessKey && { 'X-Access-Key': accessKey }),
    ...(tenantApiKey && { 'X-Tenant-API-Key': tenantApiKey }),
    ...(tenantApiKey && { 'X-API-Key': tenantApiKey }), // Also support X-API-Key for backward compatibility
    // Automatically add X-Tenant-Id header if tenantId is provided
    ...(tenantId && { 'X-Tenant-Id': tenantId }),
    ...additionalHeaders,
  };
  console.log('[testing] API utility - Headers being sent:', headers);
  return headers;
};

export const api = {
  // Get the base URL
  getBaseUrl: () => API_BASE_URL,
  
  // Get tenant API key (exported for external use)
  getTenantApiKey: (tenantId?: string) => getTenantApiKey(tenantId),
  
  // Make API calls with proper base URL and authentication
  get: async (endpoint: string, options?: RequestInit & { tenantId?: string }) => {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    const { headers: additionalHeaders, tenantId, ...restOptions } = options || {};
    return fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(additionalHeaders as Record<string, string>, tenantId),
      ...restOptions,
    });
  },
  
  post: async (endpoint: string, data?: any, options?: RequestInit & { tenantId?: string }) => {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    const { headers: additionalHeaders, tenantId, ...restOptions } = options || {};
    return fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(additionalHeaders as Record<string, string>, tenantId),
      body: data ? JSON.stringify(data) : undefined,
      ...restOptions,
    });
  },
  
  put: async (endpoint: string, data?: any, options?: RequestInit & { tenantId?: string }) => {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    const { headers: additionalHeaders, tenantId, ...restOptions } = options || {};
    return fetch(url, {
      method: 'PUT',
      headers: getAuthHeaders(additionalHeaders as Record<string, string>, tenantId),
      body: data ? JSON.stringify(data) : undefined,
      ...restOptions,
    });
  },
  
  delete: async (endpoint: string, options?: RequestInit & { tenantId?: string }) => {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    const { headers: additionalHeaders, tenantId, ...restOptions } = options || {};
    return fetch(url, {
      method: 'DELETE',
      headers: getAuthHeaders(additionalHeaders as Record<string, string>, tenantId),
      ...restOptions,
    });
  },
};

export default api;