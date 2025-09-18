
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

export interface CMSUser {
  id: string;
  email: string | null;
  role: string;
}

export const useCMSAuth = () => {
  const [user, setUser] = useState<CMSUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await checkAuth();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAdmin(false);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser) {
        // Get user role from the users table
        const { data: userData, error } = await supabase
          .from('users')
          .select('id, email, role')
          .eq('id', authUser.id)
          .single();

        if (error) {
          console.error('Error fetching user data:', error);
          setUser(null);
          setIsAdmin(false);
        } else if (userData) {
          const cmsUser: CMSUser = {
            id: userData.id,
            email: userData.email,
            role: userData.role || 'user'
          };
          setUser(cmsUser);
          setIsAdmin(userData.role === 'admin' || userData.role === 'editor');
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isAdmin,
    isLoading,
    checkAuth
  };
};
