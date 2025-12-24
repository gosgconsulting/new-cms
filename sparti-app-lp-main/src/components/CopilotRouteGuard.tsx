import { useCopilot } from '@/contexts/CopilotContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface CopilotRouteGuardProps {
  children: React.ReactNode;
}

export function CopilotRouteGuard({ children }: CopilotRouteGuardProps) {
  const { isLaunched, selectedBrand } = useCopilot();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Pages that are allowed without copilot being launched
  const allowedPaths = [
    '/app',
    '/app/copilot',
    '/app/account',
    '/app/brands',
    '/app/logs',
    '/app/settings',
    '/app/database-status',
    '/app/supabase-test',
    '/app/n8n',
    '/app/workflow',
    '/app/sem-campaigns',
    '/app/assets-campaigns',
    '/admin/brands' // Admin brand routes
  ];

  // Check if current path is allowed without copilot
  const isAllowedPath = () => {
    const currentPath = location.pathname;
    
    // Exact matches
    if (allowedPaths.includes(currentPath)) {
      return true;
    }
    
    // Special case for /app root
    if (currentPath === '/app' || currentPath === '/app/') {
      return true;
    }
    
    // Check if path starts with any allowed path
    const isAllowed = allowedPaths.some(path => {
      if (path === '/app') {
        return currentPath === '/app' || currentPath === '/app/';
      }
      return currentPath.startsWith(path + '/');
    });
    
    return isAllowed;
  };

  useEffect(() => {
    const currentPath = location.pathname;
    
    // If not an allowed path and copilot is not launched, redirect to copilot page
    if (!isAllowedPath() && !isLaunched) {
      toast({
        title: "Copilot Required",
        description: "Please launch a copilot first to access this page.",
        variant: "default",
      });
      navigate('/app/copilot');
    }
  }, [isLaunched, location.pathname, navigate, toast]);

  // If copilot is not launched and trying to access restricted pages, show loading
  if (!isAllowedPath() && !isLaunched) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}
