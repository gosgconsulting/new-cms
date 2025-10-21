/**
 * Integration Test Component
 * Tests all API integrations to ensure they're working correctly
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  openRouterClient, 
  googleAPIClient, 
  smtpClient, 
  checkIntegrationStatus,
  type OpenRouterMessage,
  type GooglePlace,
  type TranslationResult 
} from '@/integrations';

export const IntegrationTest: React.FC = () => {
  const [results, setResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [testInputs, setTestInputs] = useState({
    aiPrompt: 'Hello, how are you?',
    searchQuery: 'restaurants near me',
    translateText: 'Hello world',
    translateTo: 'es',
    emailTo: 'test@example.com',
    emailSubject: 'Test Email',
    emailMessage: 'This is a test email'
  });

  const integrationStatus = checkIntegrationStatus();

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    setLoading(prev => ({ ...prev, [testName]: true }));
    try {
      const result = await testFn();
      setResults(prev => ({ ...prev, [testName]: { success: true, data: result } }));
      console.log(`[testing] ${testName} test passed:`, result);
    } catch (error) {
      setResults(prev => ({ ...prev, [testName]: { success: false, error: error.message } }));
      console.error(`[testing] ${testName} test failed:`, error);
    } finally {
      setLoading(prev => ({ ...prev, [testName]: false }));
    }
  };

  const testOpenRouter = async () => {
    const messages: OpenRouterMessage[] = [
      { role: 'user', content: testInputs.aiPrompt }
    ];
    return await openRouterClient.chatCompletion(messages);
  };

  const testGooglePlaces = async () => {
    return await googleAPIClient.searchPlaces(testInputs.searchQuery);
  };

  const testGoogleTranslate = async () => {
    return await googleAPIClient.translateText(
      testInputs.translateText, 
      testInputs.translateTo
    );
  };

  const testSMTP = async () => {
    return await smtpClient.sendEmail({
      to: testInputs.emailTo,
      subject: testInputs.emailSubject,
      text: testInputs.emailMessage,
      html: `<p>${testInputs.emailMessage}</p>`
    });
  };

  const testServerSMTP = async () => {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: testInputs.emailTo,
        subject: `Server Test: ${testInputs.emailSubject}`,
        text: testInputs.emailMessage,
        html: `<p><strong>Server Test:</strong> ${testInputs.emailMessage}</p>`
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Server SMTP test failed');
    }

    return await response.json();
  };

  const renderTestResult = (testName: string) => {
    const result = results[testName];
    const isLoading = loading[testName];

    if (isLoading) {
      return <Badge variant="secondary">Testing...</Badge>;
    }

    if (!result) {
      return <Badge variant="outline">Not tested</Badge>;
    }

    if (result.success) {
      return <Badge variant="default" className="bg-green-500">✓ Passed</Badge>;
    } else {
      return <Badge variant="destructive">✗ Failed: {result.error}</Badge>;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Integration Test Suite</h2>
        <p className="text-muted-foreground">
          Test all API integrations to ensure they're working correctly
        </p>
      </div>

      {/* Integration Status */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Status</CardTitle>
          <CardDescription>
            Shows which integrations have API keys configured
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="font-medium">OpenRouter</div>
              <Badge variant={integrationStatus.openrouter ? "default" : "destructive"}>
                {integrationStatus.openrouter ? "✓ Configured" : "✗ Missing Key"}
              </Badge>
            </div>
            <div className="text-center">
              <div className="font-medium">Google API</div>
              <Badge variant={integrationStatus.google ? "default" : "destructive"}>
                {integrationStatus.google ? "✓ Configured" : "✗ Missing Key"}
              </Badge>
            </div>
            <div className="text-center">
              <div className="font-medium">SMTP/Resend</div>
              <Badge variant={integrationStatus.smtp ? "default" : "destructive"}>
                {integrationStatus.smtp ? "✓ Configured" : "✗ Missing Key"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Inputs */}
      <Card>
        <CardHeader>
          <CardTitle>Test Configuration</CardTitle>
          <CardDescription>
            Configure test parameters for each integration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">AI Prompt</label>
              <Input
                value={testInputs.aiPrompt}
                onChange={(e) => setTestInputs(prev => ({ ...prev, aiPrompt: e.target.value }))}
                placeholder="Enter prompt for AI test"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Search Query</label>
              <Input
                value={testInputs.searchQuery}
                onChange={(e) => setTestInputs(prev => ({ ...prev, searchQuery: e.target.value }))}
                placeholder="Enter search query for Google Places"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Text to Translate</label>
              <Input
                value={testInputs.translateText}
                onChange={(e) => setTestInputs(prev => ({ ...prev, translateText: e.target.value }))}
                placeholder="Enter text to translate"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Translate To</label>
              <Input
                value={testInputs.translateTo}
                onChange={(e) => setTestInputs(prev => ({ ...prev, translateTo: e.target.value }))}
                placeholder="Language code (e.g., es, fr, de)"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Test Email</label>
              <Input
                value={testInputs.emailTo}
                onChange={(e) => setTestInputs(prev => ({ ...prev, emailTo: e.target.value }))}
                placeholder="Enter email for SMTP test"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email Subject</label>
              <Input
                value={testInputs.emailSubject}
                onChange={(e) => setTestInputs(prev => ({ ...prev, emailSubject: e.target.value }))}
                placeholder="Enter email subject"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Email Message</label>
            <Textarea
              value={testInputs.emailMessage}
              onChange={(e) => setTestInputs(prev => ({ ...prev, emailMessage: e.target.value }))}
              placeholder="Enter email message"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* OpenRouter AI Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              OpenRouter AI Test
              {renderTestResult('openrouter')}
            </CardTitle>
            <CardDescription>
              Test AI chat completion using OpenRouter API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => runTest('openrouter', testOpenRouter)}
              disabled={!integrationStatus.openrouter || loading.openrouter}
              className="w-full"
            >
              {loading.openrouter ? 'Testing...' : 'Test OpenRouter AI'}
            </Button>
            {results.openrouter?.data && (
              <div className="mt-4 p-3 bg-muted rounded-md">
                <p className="text-sm">
                  <strong>Response:</strong> {results.openrouter.data.choices?.[0]?.message?.content}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Google Places Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Google Places Test
              {renderTestResult('googlePlaces')}
            </CardTitle>
            <CardDescription>
              Test Google Places search functionality
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => runTest('googlePlaces', testGooglePlaces)}
              disabled={!integrationStatus.google || loading.googlePlaces}
              className="w-full"
            >
              {loading.googlePlaces ? 'Testing...' : 'Test Google Places'}
            </Button>
            {results.googlePlaces?.data && (
              <div className="mt-4 p-3 bg-muted rounded-md">
                <p className="text-sm">
                  <strong>Found:</strong> {results.googlePlaces.data.length} places
                </p>
                {results.googlePlaces.data.slice(0, 2).map((place: GooglePlace, index: number) => (
                  <p key={index} className="text-xs mt-1">
                    • {place.name} - {place.formatted_address}
                  </p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Google Translate Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Google Translate Test
              {renderTestResult('googleTranslate')}
            </CardTitle>
            <CardDescription>
              Test Google Translate functionality
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => runTest('googleTranslate', testGoogleTranslate)}
              disabled={!integrationStatus.google || loading.googleTranslate}
              className="w-full"
            >
              {loading.googleTranslate ? 'Testing...' : 'Test Google Translate'}
            </Button>
            {results.googleTranslate?.data && (
              <div className="mt-4 p-3 bg-muted rounded-md">
                <p className="text-sm">
                  <strong>Translation:</strong> {(results.googleTranslate.data as TranslationResult).translatedText}
                </p>
                {(results.googleTranslate.data as TranslationResult).detectedSourceLanguage && (
                  <p className="text-xs mt-1">
                    <strong>Detected:</strong> {(results.googleTranslate.data as TranslationResult).detectedSourceLanguage}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* SMTP Client Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              SMTP Client Test
              {renderTestResult('smtpClient')}
            </CardTitle>
            <CardDescription>
              Test client-side SMTP using Resend API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => runTest('smtpClient', testSMTP)}
              disabled={!integrationStatus.smtp || loading.smtpClient}
              className="w-full"
            >
              {loading.smtpClient ? 'Testing...' : 'Test SMTP Client'}
            </Button>
            {results.smtpClient?.data && (
              <div className="mt-4 p-3 bg-muted rounded-md">
                <p className="text-sm">
                  <strong>Email ID:</strong> {results.smtpClient.data.id}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Server SMTP Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Server SMTP Test
              {renderTestResult('serverSMTP')}
            </CardTitle>
            <CardDescription>
              Test server-side SMTP endpoint
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => runTest('serverSMTP', testServerSMTP)}
              disabled={loading.serverSMTP}
              className="w-full"
            >
              {loading.serverSMTP ? 'Testing...' : 'Test Server SMTP'}
            </Button>
            {results.serverSMTP?.data && (
              <div className="mt-4 p-3 bg-muted rounded-md">
                <p className="text-sm">
                  <strong>Status:</strong> {results.serverSMTP.data.message}
                </p>
                <p className="text-xs mt-1">
                  <strong>ID:</strong> {results.serverSMTP.data.id}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Test All Button */}
      <div className="text-center">
        <Button 
          onClick={() => {
            if (integrationStatus.openrouter) runTest('openrouter', testOpenRouter);
            if (integrationStatus.google) {
              runTest('googlePlaces', testGooglePlaces);
              runTest('googleTranslate', testGoogleTranslate);
            }
            if (integrationStatus.smtp) runTest('smtpClient', testSMTP);
            runTest('serverSMTP', testServerSMTP);
          }}
          size="lg"
          className="px-8"
        >
          Run All Available Tests
        </Button>
      </div>
    </div>
  );
};
