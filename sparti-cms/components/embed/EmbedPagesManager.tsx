import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '../../../src/components/ui/alert';
import { Button } from '../../../src/components/ui/button';
import PagesManager from '../cms/PagesManager';
import { useAuth } from '../auth/AuthProvider';

export const EmbedPagesManager: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { signInWithAccessKey, user, loading: authLoading } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const accessKey = searchParams.get('access_key');

  useEffect(() => {
    const verifyAccessKey = async () => {
      if (!accessKey) {
        setError('Access key is required');
        setIsVerifying(false);
        return;
      }

      try {
        setIsVerifying(true);
        setError(null);

        // Call the verify access key endpoint
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

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Invalid access key');
        }

        const data = await response.json();
        
        if (data.success && data.user) {
          // Set up the user in the auth context
          await signInWithAccessKey(accessKey);
          setIsAuthenticated(true);
        } else {
          throw new Error('Invalid response from server');
        }
      } catch (error) {
        console.error('Error verifying access key:', error);
        setError(error instanceof Error ? error.message : 'Failed to verify access key');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyAccessKey();
  }, [accessKey, signInWithAccessKey]);

  // Show loading state while verifying
  if (isVerifying || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Verifying access key...</p>
        </div>
      </div>
    );
  }

  // Show error if verification failed
  if (error || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="mt-2">
              {error || 'Authentication failed'}
            </AlertDescription>
          </Alert>
          <div className="mt-4 text-center">
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show the PagesManager if authenticated
  if (user) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Minimal header for iframe context */}
        <div className="bg-white border-b border-gray-200 px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">
                Pages Manager - {user.first_name} {user.last_name}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              Embedded via Access Key
            </div>
          </div>
        </div>
        
        {/* PagesManager content */}
        <div className="p-4">
          <PagesManager />
        </div>
      </div>
    );
  }

  // Fallback (should not reach here)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
};

export default EmbedPagesManager;
