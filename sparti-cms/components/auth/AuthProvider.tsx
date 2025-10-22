import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Tenant } from '../admin/PostgresIntegration';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => void;
  loading: boolean;
  createAdminUser: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  tenants: Tenant[];
  currentTenant: Tenant;
  handleTenantChange: (tenant: Tenant) => void;
  isForcedTenant: boolean;
}

// Sample tenants data with simplified structure
const initialTenants: Tenant[] = [
  { 
    id: 'tenant-gosg', 
    name: 'GO SG CONSULTING', 
    createdAt: new Date().toISOString().split('T')[0]
  },
  {
    id: 'tenant-dev',
    name: 'Development',
    createdAt: new Date().toISOString().split('T')[0],
    isDevelopment: true
  }
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState<Tenant[]>(initialTenants);
  const [currentTenant, setCurrentTenant] = useState<Tenant>(initialTenants[0]);
  const [isForcedTenant, setIsForcedTenant] = useState(false);
  
  // Check for forced tenant environment variable
  const FORCED_TENANT_ID = import.meta.env.VITE_FORCED_TENANT_ID;

  useEffect(() => {
    // Check for existing session in localStorage
    const session = localStorage.getItem('sparti-demo-session');
    if (session) {
      try {
        const userData = JSON.parse(session);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing session data:', error);
        localStorage.removeItem('sparti-demo-session');
      }
    }

    // Handle forced tenant logic
    if (FORCED_TENANT_ID) {
      setIsForcedTenant(true);
      fetchForcedTenant();
    } else {
      // Check for saved tenant in localStorage
      const savedTenant = localStorage.getItem('sparti-current-tenant');
      if (savedTenant) {
        try {
          const tenantData = JSON.parse(savedTenant);
          setCurrentTenant(tenantData);
        } catch (error) {
          console.error('Error parsing tenant data:', error);
          localStorage.removeItem('sparti-current-tenant');
        }
      }

      // Load tenants from API
      fetchTenants();
    }
    
    setLoading(false);
  }, []);

  const fetchForcedTenant = async () => {
    try {
      const response = await fetch(`/api/tenants/${FORCED_TENANT_ID}`);
      if (response.ok) {
        const tenantData = await response.json();
        setCurrentTenant(tenantData);
        setTenants([tenantData]); // Only set the forced tenant
        localStorage.setItem('sparti-current-tenant', JSON.stringify(tenantData));
      } else if (response.status === 404) {
        console.error(`Forced tenant with ID '${FORCED_TENANT_ID}' not found`);
        // Set error state - could show error UI here
        setCurrentTenant(initialTenants[0]);
      } else {
        console.error('Error fetching forced tenant:', response.statusText);
        setCurrentTenant(initialTenants[0]);
      }
    } catch (error) {
      console.error('Error fetching forced tenant:', error);
      setCurrentTenant(initialTenants[0]);
    }
  };

  const fetchTenants = async () => {
    try {
      const response = await fetch('/api/tenants');
      if (response.ok) {
        const tenantsData = await response.json();
        if (Array.isArray(tenantsData) && tenantsData.length > 0) {
          setTenants(tenantsData);
          
          // If we have a current tenant, find it in the new data
          const currentTenantId = currentTenant.id;
          const updatedCurrentTenant = tenantsData.find(t => t.id === currentTenantId);
          if (updatedCurrentTenant) {
            setCurrentTenant(updatedCurrentTenant);
            localStorage.setItem('sparti-current-tenant', JSON.stringify(updatedCurrentTenant));
          } else {
            // If current tenant not found, use the first one
            setCurrentTenant(tenantsData[0]);
            localStorage.setItem('sparti-current-tenant', JSON.stringify(tenantsData[0]));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching tenants:', error);
      // Fall back to initial tenants if API call fails
    }
  };

  const handleTenantChange = (tenant: Tenant) => {
    setCurrentTenant(tenant);
    localStorage.setItem('sparti-current-tenant', JSON.stringify(tenant));
    // Here you would typically fetch data for the selected tenant
    console.log(`Switched to tenant: ${tenant.name}`);
  };

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success && data.user) {
        const userData: User = {
          id: data.user.id.toString(),
          first_name: data.user.first_name,
          last_name: data.user.last_name,
          email: data.user.email,
          role: data.user.role
        };
        
        setUser(userData);
        localStorage.setItem('sparti-demo-session', JSON.stringify(userData));
        
        return { success: true };
      } else {
        return { 
          success: false, 
          error: data.error || 'Invalid credentials' 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: 'Login failed. Please try again.' 
      };
    }
  };

  const createAdminUser = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Create a demo admin user directly in localStorage for development purposes
      const adminUser: User = {
        id: '1',
        first_name: 'Admin',
        last_name: 'User',
        email: email,
        role: 'admin'
      };
      
      // Store the admin user in localStorage
      localStorage.setItem('sparti-demo-session', JSON.stringify(adminUser));
      
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
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('sparti-demo-session');
  };

  const value = {
    user,
    signIn,
    signOut,
    loading,
    createAdminUser,
    tenants,
    currentTenant,
    handleTenantChange,
    isForcedTenant,
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