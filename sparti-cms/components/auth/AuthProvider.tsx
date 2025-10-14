import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Demo authentication - hardcoded admin/admin
    if (email === 'admin' && password === 'admin') {
      const userData: User = {
        id: 'demo-admin',
        email: 'admin@sparti-demo.com',
        role: 'admin'
      };
      
      setUser(userData);
      localStorage.setItem('sparti-demo-session', JSON.stringify(userData));
      
      return { success: true };
    } else {
      return { 
        success: false, 
        error: 'Invalid credentials. Use admin/admin for demo.' 
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
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};