import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/LoadingStates';
import { useTokenContext } from '@/contexts/TokenContext';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const { tokenUsage, userProfile, isLoading: tokenLoading } = useTokenContext();
  const location = useLocation();
  const [isCheckingTrial, setIsCheckingTrial] = useState(true);

  useEffect(() => {
    if (!tokenLoading) {
      setIsCheckingTrial(false);
    }
  }, [tokenLoading]);

  if (loading || isCheckingTrial) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check if trial has ended and user is not on subscription page
  const isOnSubscriptionPage = location.pathname === '/app/account' && 
    new URLSearchParams(location.search).get('tab') === 'subscription';

  if (userProfile && userProfile.trial_end && tokenUsage?.is_trial) {
    const trialEndDate = new Date(userProfile.trial_end);
    const now = new Date();
    
    // If trial has ended and user is not already on the subscription page
    if (now > trialEndDate && !isOnSubscriptionPage) {
      return <Navigate to="/app/account?tab=subscription" replace />;
    }
  }

  return <>{children}</>;
}