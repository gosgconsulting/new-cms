import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/AuthContext';

interface TestResult {
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
  duration?: number;
  requestData?: any;
  responseData?: any;
  errorDetails?: any;
}

export const GoogleSearchDebugger = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [step1Result, setStep1Result] = useState<TestResult>({ status: 'pending' });

  const testStep1 = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to run the test",
        variant: "destructive",
      });
      return;
    }

    setIsRunning(true);
    setStep1Result({ status: 'running', message: 'Testing Step 1: Prepare Squid...' });
    
    const startTime = Date.now();
    const requestBody = {
      type: 'prepare_squid',
      keywords: ['seo in singapore'],
      maxResults: 50,
      country: 'Spain',
      language: 'English',
      deviceType: 'Desktop',
      maxPages: 30,
      userId: user.id
    };

    try {
      console.log('🔍 [Google Search Step 1] Request sent:', requestBody);
      
      const { data, error } = await supabase.functions.invoke('google-search-scraper', {
        body: requestBody
      });

      const duration = Date.now() - startTime;
      
      console.log('✅ [Google Search Step 1] Response received:', data);
      console.log('🔍 [Google Search Step 1] Error if any:', error);

      if (error) {
        throw new Error(`Function error: ${error.message}`);
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Unknown error');
      }

      setStep1Result({
        status: 'success',
        message: 'Step 1 completed successfully!',
        duration,
        requestData: requestBody,
        responseData: data
      });

      toast({
        title: "Step 1 Success",
        description: "Google Search squid prepared successfully",
      });

    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.error('❌ [Google Search Step 1] Error:', error);
      
      setStep1Result({
        status: 'error',
        message: error.message || 'Step 1 failed',
        duration,
        requestData: requestBody,
        errorDetails: error
      });

      toast({
        title: "Step 1 Failed",
        description: error.message || 'Unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const resetTest = () => {
    setStep1Result({ status: 'pending' });
  };

  const getStatusBadge = (status: TestResult['status']) => {
    const variants = {
      pending: 'secondary',
      running: 'default',
      success: 'default',
      error: 'destructive'
    } as const;
    
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Google Search Scraper - Step 1 Debug</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={testStep1} 
              disabled={isRunning}
              className="flex-1"
            >
              {isRunning ? 'Testing Step 1...' : 'Test Step 1: Prepare Squid'}
            </Button>
            <Button variant="outline" onClick={resetTest}>
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Step 1: Prepare Google Search Squid</h3>
            <div className="flex items-center gap-2">
              {step1Result.duration && (
                <span className="text-xs text-muted-foreground">
                  {step1Result.duration}ms
                </span>
              )}
              {getStatusBadge(step1Result.status)}
            </div>
          </div>
          
          {step1Result.message && (
            <p className="text-sm text-muted-foreground mb-3">
              {step1Result.message}
            </p>
          )}

          {/* Request Data */}
          {step1Result.requestData && (
            <div className="mb-3">
              <details className="text-xs">
                <summary className="cursor-pointer text-primary font-medium mb-1">
                  📤 Request Sent
                </summary>
                <pre className="mt-2 p-2 bg-primary/5 border border-primary/20 rounded overflow-auto max-h-32 text-xs">
                  {JSON.stringify(step1Result.requestData, null, 2)}
                </pre>
              </details>
            </div>
          )}

          {/* Response Data */}
          {step1Result.responseData && step1Result.status === 'success' && (
            <div className="mb-3">
              <details className="text-xs">
                <summary className="cursor-pointer text-green-600 font-medium mb-1">
                  ✅ Response Received
                </summary>
                <pre className="mt-2 p-2 bg-green-50 border border-green-200 rounded overflow-auto max-h-32 text-xs">
                  {JSON.stringify(step1Result.responseData, null, 2)}
                </pre>
              </details>
            </div>
          )}

          {/* Error Details */}
          {step1Result.errorDetails && step1Result.status === 'error' && (
            <div className="mb-3">
              <details className="text-xs">
                <summary className="cursor-pointer text-red-600 font-medium mb-1">
                  ❌ Error Details
                </summary>
                <pre className="mt-2 p-2 bg-red-50 border border-red-200 rounded overflow-auto max-h-32 text-xs">
                  {JSON.stringify(step1Result.errorDetails, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};