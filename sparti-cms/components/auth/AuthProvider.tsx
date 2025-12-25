import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { Tenant } from '../admin/PostgresIntegration';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  tenant_id: string | null;
  is_super_admin: boolean;
}

interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signInWithAccessKey: (accessKey: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => void;
  loading: boolean;
  createAdminUser: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  currentTenantId: string | null;
  handleTenantChange: (tenantId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTenantId, setCurrentTenantId] = useState<string | null>(null);
  // Track if we've set tenant ID from sign-in to prevent resetting on user updates
  const hasSetTenantFromSignIn = useRef<boolean>(false);

  const signOut = useCallback(() => {
    setUser(null);
    localStorage.removeItem('sparti-user-session');
    localStorage.removeItem('sparti-access-key');
    setCurrentTenantId(null);
    localStorage.removeItem('sparti-current-tenant-id');
    hasSetTenantFromSignIn.current = false; // Reset flag on sign out
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      let validatedUser: User | null = null;
      // In development, use relative URLs to leverage Vite proxy
      const API_BASE_URL = import.meta.env.DEV 
        ? '' // Use relative URLs in development (Vite proxy handles /api)
        : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4173');

      // 1. Verify session with backend or use local data for demo
      const session = localStorage.getItem('sparti-user-session');
      if (session) {
        try {
          const sessionData = JSON.parse(session);
          if (sessionData.token) {
            const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${sessionData.token}`,
                'Content-Type': 'application/json',
              },
            });

            if (response.ok) {
              const data = await response.json();
              if (data.success && data.user) {
                validatedUser = {
                  id: data.user.id.toString(),
                  first_name: data.user.first_name,
                  last_name: data.user.last_name,
                  email: data.user.email,
                  role: data.user.role,
                  tenant_id: data.user.tenant_id,
                  is_super_admin: data.user.is_super_admin || false,
                };
                setUser(validatedUser);
              } else {
                signOut(); // Invalid user data from backend
              }
            } else {
              signOut(); // Token is invalid or expired
            }
          } else {
            // No token, assume it's a demo user from createAdminUser. Set user from session.
            validatedUser = sessionData as User;
            setUser(validatedUser);
          }
        } catch (error) {
          console.error('Error processing session data:', error);
          signOut();
        }
      }

      // 2. Determine and set tenant ID
      // Only restore from localStorage on initialization, don't set from user.tenant_id
      // (that should only happen during sign-in)
      let tenantIdToSet: string | null = null;
      const savedTenantId = localStorage.getItem('sparti-current-tenant-id');
      if (savedTenantId) {
        tenantIdToSet = savedTenantId;
      } else if (validatedUser && validatedUser.tenant_id) {
        // Only set from user.tenant_id if there's no saved value and user is not super admin
        // This handles the case where user refreshes page before signing in
        tenantIdToSet = validatedUser.tenant_id;
        hasSetTenantFromSignIn.current = true;
      }

      console.log('tenantIdToSet', tenantIdToSet);
      setCurrentTenantId(tenantIdToSet);

      setLoading(false);
    };

    initializeAuth();
  }, [signOut]);

  const handleTenantChange = useCallback((tenantId: string) => {
    // Handle clearing tenant selection (empty string or null)
    if (!tenantId || tenantId === '') {
      setCurrentTenantId(null);
      localStorage.removeItem('sparti-current-tenant-id');
      console.log('Cleared tenant selection');
    } else {
      setCurrentTenantId(tenantId);
      localStorage.setItem('sparti-current-tenant-id', tenantId);
      // Here you would typically fetch data for the selected tenant
      console.log(`Switched to tenant ID: ${tenantId}`);
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // In development, use relative URLs to leverage Vite proxy
      const API_BASE_URL = import.meta.env.DEV 
        ? '' // Use relative URLs in development (Vite proxy handles /api)
        : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4173');
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      // Check if response is ok and has content
      if (!response.ok) {
        // Try to parse error response as JSON
        let errorData;
        try {
          const text = await response.text();
          errorData = text ? JSON.parse(text) : {};
        } catch (parseError) {
          // If parsing fails, use status text
          errorData = { error: response.statusText || 'Login failed' };
        }
        
        const errorMessage = errorData.message || errorData.error || `Login failed (${response.status})`;
        console.error('[testing] Login failed:', errorMessage);
        return { 
          success: false, 
          error: errorMessage
        };
      }

      // Parse response as JSON
      let data;
      try {
        const text = await response.text();
        if (!text) {
          throw new Error('Empty response from server');
        }
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('[testing] Failed to parse login response:', parseError);
        return { 
          success: false, 
          error: 'Invalid response from server. Please try again.' 
        };
      }

      if (data.success && data.user) {
        const userData: User = {
          id: data.user.id.toString(),
          first_name: data.user.first_name,
          last_name: data.user.last_name,
          email: data.user.email,
          role: data.user.role,
          tenant_id: data.user.tenant_id,
          is_super_admin: data.user.is_super_admin || false
        };
        
        setUser(userData);
        localStorage.setItem('sparti-user-session', JSON.stringify({ ...userData, token: data.token }));
        
        // Set tenant ID from user.tenant_id only once on sign-in
        // This ensures it's set on sign-in but not when user is updated later
        if (!hasSetTenantFromSignIn.current) {
          const tenantIdToSet = userData.tenant_id && !userData.is_super_admin ? userData.tenant_id : null;
          
          if (tenantIdToSet) {
            setCurrentTenantId(tenantIdToSet);
            localStorage.setItem('sparti-current-tenant-id', tenantIdToSet);
            hasSetTenantFromSignIn.current = true;
          }
        }
        
        return { success: true };
      } else {
        // Return the specific error message from the server, or fallback to generic message
        const errorMessage = data.message || data.error || 'Invalid credentials';
        console.error('[testing] Login failed:', errorMessage);
        return { 
          success: false, 
          error: errorMessage
        };
      }
    } catch (error) {
      console.error('[testing] Login error:', error);
      // Check if it's a network error
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return { 
          success: false, 
          error: 'Unable to connect to server. Please check your connection and try again.' 
        };
      }
      // Check if it's a JSON parse error
      if (error instanceof SyntaxError && error.message.includes('JSON')) {
        return { 
          success: false, 
          error: 'Invalid response from server. Please try again.' 
        };
      }
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed. Please try again.' 
      };
    }
  }, []);

  const signInWithAccessKey = useCallback(async (accessKey: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // In development, use relative URLs to leverage Vite proxy
      const API_BASE_URL = import.meta.env.DEV 
        ? '' // Use relative URLs in development (Vite proxy handles /api)
        : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4173');
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-access-key?access_key=${encodeURIComponent(accessKey)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success && data.user) {
        const userData: User = {
          id: data.user.id.toString(),
          first_name: data.user.first_name,
          last_name: data.user.last_name,
          email: data.user.email,
          role: data.user.role,
          tenant_id: data.user.tenant_id,
          is_super_admin: data.user.is_super_admin || false
        };
        
        setUser(userData);
        localStorage.setItem('sparti-user-session', JSON.stringify(userData));
        localStorage.setItem('sparti-access-key', accessKey);
        
        // Set tenant ID from user.tenant_id only once on sign-in
        // This ensures it's set on sign-in but not when user is updated later
        if (!hasSetTenantFromSignIn.current) {
          const tenantIdToSet = userData.tenant_id && !userData.is_super_admin ? userData.tenant_id : null;
          
          if (tenantIdToSet) {
            setCurrentTenantId(tenantIdToSet);
            localStorage.setItem('sparti-current-tenant-id', tenantIdToSet);
            hasSetTenantFromSignIn.current = true;
          }
        }
        
        return { success: true };
      } else {
        return { 
          success: false, 
          error: data.error || 'Invalid access key' 
        };
      }
    } catch (error) {
      console.error('Access key login error:', error);
      return { 
        success: false, 
        error: 'Access key verification failed. Please try again.' 
      };
    }
  }, []);

  const createAdminUser = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Create a demo admin user directly in localStorage for development purposes
      const adminUser: User = {
        id: '1',
        first_name: 'Admin',
        last_name: 'User',
        email: email,
        role: 'admin',
        tenant_id: null,
        is_super_admin: true
      };
      
      // Store the admin user in localStorage
      localStorage.setItem('sparti-user-session', JSON.stringify(adminUser));
      
      // Set the user in state
      setUser(adminUser);
      
      // Store the credentials in localStorage for demo purposes
      localStorage.setItem('sparti-demo-credentials', JSON.stringify({ email, password }));
      
      return { success: true };
    } catch (error) {
      console.error('Create admin user error:', error);
      return { 
        success: false, 
        error: 'Failed to create admin user. Please try again.' 
      };
    }
  }, []);

  const value = {
    user,
    signIn,
    signInWithAccessKey,
    signOut,
    loading,
    createAdminUser,
    currentTenantId,
    handleTenantChange,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;