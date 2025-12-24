import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/AuthContext';

interface StepResult {
  step: number;
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
  data?: any;
  duration?: number;
  requestData?: any;  // What we sent
  responseData?: any; // What we received
  errorDetails?: any; // Detailed error information
}

export const LobstrDebugger = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [query, setQuery] = useState('restaurants');
  const [location, setLocation] = useState('Bangkok, Thailand');
  const [maxResults, setMaxResults] = useState(50);
  const [isRunning, setIsRunning] = useState(false);
  const [steps, setSteps] = useState<StepResult[]>([
    { step: 1, name: 'Prepare Squid', status: 'pending' },
    { step: 2, name: 'Add Tasks', status: 'pending' },
    { step: 3, name: 'Launch Run', status: 'pending' },
    { step: 4, name: 'Monitor Status', status: 'pending' },
    { step: 5, name: 'Get Results', status: 'pending' },
  ]);
  const [currentRunId, setCurrentRunId] = useState<string | null>(null);

  const updateStep = (stepNumber: number, updates: Partial<StepResult>) => {
    setSteps(prev => prev.map(step => 
      step.step === stepNumber ? { ...step, ...updates } : step
    ));
  };

  const callLobstrFunction = async (type: string, params: any = {}) => {
    const startTime = Date.now();
    const requestBody = {
      type,
      query,
      location,
      maxResults,
      userId: user?.id, // Include userId for database operations
      ...params
    };
    
    console.log(`🔍 [${type}] Request sent:`, requestBody);
    
    try {
      const { data, error } = await supabase.functions.invoke('lobstr-scraper', {
        body: requestBody
      });

      const duration = Date.now() - startTime;
      
      console.log(`✅ [${type}] Response received (${duration}ms):`, data);
      console.log(`🔍 [${type}] Error if any:`, error);

      if (error) {
        throw new Error(`Function error: ${error.message}`);
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Unknown error');
      }

      return { 
        ...data, 
        duration,
        _requestData: requestBody,
        _responseData: data
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ [${type}] Error (${duration}ms):`, error);
      throw { 
        error, 
        duration,
        _requestData: requestBody,
        _errorDetails: error
      };
    }
  };

  const runStep1 = async () => {
    updateStep(1, { status: 'running', message: 'Preparing squid...' });
    
    try {
      const result = await callLobstrFunction('prepare_squid');
      updateStep(1, { 
        status: 'success', 
        message: 'Squid prepared successfully - ready for tasks',
        data: result,
        duration: result.duration,
        requestData: result._requestData,
        responseData: result._responseData
      });
      return result;
    } catch (error: any) {
      updateStep(1, { 
        status: 'error', 
        message: error.error?.message || 'Failed to prepare squid',
        duration: error.duration,
        requestData: error._requestData,
        errorDetails: error._errorDetails
      });
      throw error;
    }
  };

  const runStep2 = async () => {
    updateStep(2, { status: 'running', message: 'Adding tasks and creating database record...' });
    
    try {
      const result = await callLobstrFunction('add_tasks', { 
        query, 
        location, 
        maxResults, 
        userId: user?.id 
      });
      
      // Extract runId from the response
      const newRunId = result.debugData?.runRecord?.id;
      if (newRunId) {
        setCurrentRunId(newRunId);
        updateStep(2, { 
          status: 'success', 
          message: `Tasks added and database record created (Run ID: ${newRunId})`,
          data: result,
          duration: result.duration,
          requestData: result._requestData,
          responseData: result._responseData
        });
        return newRunId;
      } else {
        throw new Error('Tasks added but no run ID returned');
      }
    } catch (error: any) {
      updateStep(2, { 
        status: 'error', 
        message: error.error?.message || 'Failed to add tasks',
        duration: error.duration,
        requestData: error._requestData,
        errorDetails: error._errorDetails
      });
      throw error;
    }
  };

  const runStep3 = async (runId: string) => {
    updateStep(3, { status: 'running', message: 'Launching run...' });
    
    try {
      const result = await callLobstrFunction('launch_run', { runId });
      updateStep(3, { 
        status: 'success', 
        message: `Run launched. Lobstr Run ID: ${result.lobstrRunId}`,
        data: result,
        duration: result.duration,
        requestData: result._requestData,
        responseData: result._responseData
      });
      return result.lobstrRunId;
    } catch (error: any) {
      updateStep(3, { 
        status: 'error', 
        message: error.error?.message || 'Failed to launch run',
        duration: error.duration,
        requestData: error._requestData,
        errorDetails: error._errorDetails
      });
      throw error;
    }
  };

  const runStep4 = async (lobstrRunId: string, attempts = 0, maxAttempts = 10) => {
    updateStep(4, { status: 'running', message: `Checking status (attempt ${attempts + 1})...` });
    
    try {
      const result = await callLobstrFunction('get_status', { runId: lobstrRunId });
      
      if (result.status === 'done' || attempts >= maxAttempts) {
        updateStep(4, { 
          status: 'success', 
          message: `Status: ${result.status}. Progress: ${result.progress}%`,
          data: result,
          duration: result.duration,
          requestData: result._requestData,
          responseData: result._responseData
        });
        return result;
      } else {
        // Continue monitoring
        setTimeout(() => runStep4(lobstrRunId, attempts + 1, maxAttempts), 2000);
        updateStep(4, { 
          status: 'running', 
          message: `Status: ${result.status}. Progress: ${result.progress}%. Checking again in 2s...`,
          requestData: result._requestData,
          responseData: result._responseData
        });
        return null; // Still running
      }
    } catch (error: any) {
      updateStep(4, { 
        status: 'error', 
        message: error.error?.message || 'Failed to get status',
        duration: error.duration,
        requestData: error._requestData,
        errorDetails: error._errorDetails
      });
      throw error;
    }
  };

  const runStep5 = async (lobstrRunId: string) => {
    updateStep(5, { status: 'running', message: 'Getting results...' });
    
    try {
      const result = await callLobstrFunction('get_results', { runId: lobstrRunId });
      updateStep(5, { 
        status: 'success', 
        message: `Results collected: ${result.newLeads || 0} leads`,
        data: result,
        duration: result.duration,
        requestData: result._requestData,
        responseData: result._responseData
      });
      return result;
    } catch (error: any) {
      updateStep(5, { 
        status: 'error', 
        message: error.error?.message || 'Failed to get results',
        duration: error.duration,
        requestData: error._requestData,
        errorDetails: error._errorDetails
      });
      throw error;
    }
  };

  const runFullTest = async () => {
    if (isRunning) return;
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to run the test",
        variant: "destructive",
      });
      return;
    }
    
    setIsRunning(true);
    setSteps(prev => prev.map(step => ({ ...step, status: 'pending' as const, message: undefined, data: undefined })));
    
    try {
      // Step 1: Prepare Squid (no database record created)
      await runStep1();
      
      // Step 2: Add Tasks (creates database record and returns runId)
      const runId = await runStep2();
      
      // Step 3: Launch Run
      const lobstrRunId = await runStep3(runId);
      
      // Step 4: Monitor Status
      const statusResult = await runStep4(lobstrRunId);
      
      // Step 5: Get Results (only if status is done)
      if (statusResult && statusResult.status === 'done') {
        await runStep5(lobstrRunId);
      }
      
      toast({
        title: "Test Complete",
        description: "All steps executed successfully!",
      });
      
    } catch (error) {
      console.error('Test failed:', error);
      toast({
        title: "Test Failed",
        description: "Check the steps above for details.",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const resetTest = () => {
    setSteps(prev => prev.map(step => ({ 
      ...step, 
      status: 'pending' as const, 
      message: undefined, 
      data: undefined,
      duration: undefined,
      requestData: undefined,
      responseData: undefined,
      errorDetails: undefined
    })));
    setCurrentRunId(null);
  };

  const getStatusBadge = (status: StepResult['status']) => {
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
          <CardTitle>Lobstr Integration Debugger</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Query</label>
              <Input 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., restaurants"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Location</label>
              <Input 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Bangkok, Thailand"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Max Results</label>
              <Input 
                type="number"
                value={maxResults}
                onChange={(e) => setMaxResults(Number(e.target.value))}
                min="1"
                max="200"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={runFullTest} 
              disabled={isRunning}
              className="flex-1"
            >
              {isRunning ? 'Running Test...' : 'Run Full Test'}
            </Button>
            <Button variant="outline" onClick={resetTest}>
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {steps.map((step) => (
          <Card key={step.step}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Step {step.step}: {step.name}</h3>
                <div className="flex items-center gap-2">
                  {step.duration && (
                    <span className="text-xs text-muted-foreground">
                      {step.duration}ms
                    </span>
                  )}
                  {getStatusBadge(step.status)}
                </div>
              </div>
              
              {step.message && (
                <p className="text-sm text-muted-foreground mb-3">
                  {step.message}
                </p>
              )}

              {/* Request Data */}
              {step.requestData && (
                <div className="mb-3">
                  <details className="text-xs">
                    <summary className="cursor-pointer text-primary font-medium mb-1">
                      📤 Request Sent
                    </summary>
                    <pre className="mt-2 p-2 bg-primary/5 border border-primary/20 rounded overflow-auto max-h-32 text-xs">
                      {JSON.stringify(step.requestData, null, 2)}
                    </pre>
                  </details>
                </div>
              )}

              {/* Response Data */}
              {step.responseData && step.status === 'success' && (
                <div className="mb-3">
                  <details className="text-xs">
                    <summary className="cursor-pointer text-green-600 font-medium mb-1">
                      ✅ Response Received
                    </summary>
                    <pre className="mt-2 p-2 bg-green-50 border border-green-200 rounded overflow-auto max-h-32 text-xs">
                      {JSON.stringify(step.responseData, null, 2)}
                    </pre>
                  </details>
                </div>
              )}

              {/* Error Details */}
              {step.errorDetails && step.status === 'error' && (
                <div className="mb-3">
                  <details className="text-xs">
                    <summary className="cursor-pointer text-red-600 font-medium mb-1">
                      ❌ Error Details
                    </summary>
                    <pre className="mt-2 p-2 bg-red-50 border border-red-200 rounded overflow-auto max-h-32 text-xs">
                      {JSON.stringify(step.errorDetails, null, 2)}
                    </pre>
                  </details>
                </div>
              )}

              {/* Legacy Response Data (keeping for backward compatibility) */}
              {step.data && step.status === 'success' && !step.responseData && (
                <details className="text-xs">
                  <summary className="cursor-pointer text-muted-foreground">
                    View Legacy Response Data
                  </summary>
                  <pre className="mt-2 p-2 bg-muted rounded overflow-auto max-h-32">
                    {JSON.stringify(step.data, null, 2)}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      
      {currentRunId && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm">
              <strong>Current Run ID:</strong> {currentRunId}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};