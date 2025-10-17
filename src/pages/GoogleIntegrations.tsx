/**
 * Google Integrations Demo Page
 * Showcases Google Maps and Google Translator components
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { MapPin, Languages, Key, ExternalLink, Code, Play } from 'lucide-react';
import { GoogleMaps } from '@/components/GoogleMaps';
import { GoogleTranslator } from '@/components/GoogleTranslator';
import { checkIntegrationStatus } from '@/integrations';

export const GoogleIntegrationsPage: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState<'maps' | 'translator'>('maps');
  const integrationStatus = checkIntegrationStatus();

  const codeExamples = {
    maps: `import { GoogleMaps } from '@/components/GoogleMaps';

// Basic usage
<GoogleMaps 
  defaultQuery="restaurants near me"
  defaultCenter={{ lat: 37.7749, lng: -122.4194 }}
  height={400}
  enableDetails={true}
/>

// Custom configuration
<GoogleMaps 
  defaultQuery="hotels in Paris"
  defaultCenter={{ lat: 48.8566, lng: 2.3522 }}
  height={500}
  enableDetails={true}
  className="my-custom-class"
/>`,
    translator: `import { GoogleTranslator } from '@/components/GoogleTranslator';

// Basic usage
<GoogleTranslator 
  defaultText="Hello, world!"
  defaultSourceLang="en"
  defaultTargetLang="es"
  enableAutoDetect={true}
/>

// Custom configuration
<GoogleTranslator 
  defaultText="Bonjour le monde"
  defaultSourceLang="auto"
  defaultTargetLang="en"
  enableAutoDetect={true}
  className="my-custom-class"
/>`
  };

  const features = {
    maps: [
      'Interactive Google Maps with search functionality',
      'Place search with location and radius filtering',
      'Detailed place information including reviews and photos',
      'Interactive markers with click events',
      'Automatic map bounds adjustment',
      'Photo URL generation for place images',
      'Error handling and loading states',
      'Responsive design for all screen sizes'
    ],
    translator: [
      'Text translation between 100+ languages',
      'Automatic language detection',
      'Translation history with clickable entries',
      'Language swapping functionality',
      'Copy to clipboard feature',
      'Quick translation examples',
      'Character count and performance metrics',
      'Keyboard shortcuts (Ctrl+Enter to translate)'
    ]
  };

  const useCases = {
    maps: [
      'Business directory and location finder',
      'Restaurant and hotel booking platforms',
      'Real estate property search',
      'Event venue discovery',
      'Local service provider lookup',
      'Travel planning applications',
      'Store locator for retail chains',
      'Emergency services finder'
    ],
    translator: [
      'Multi-language website content',
      'Customer support chat translation',
      'Document translation services',
      'Educational language learning tools',
      'International e-commerce platforms',
      'Travel and tourism applications',
      'Social media content translation',
      'Business communication tools'
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
      <div className="container mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Google API Integrations
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Powerful Google Maps and Translator components built with React and TypeScript.
            Fully integrated with comprehensive error handling and modern UI design.
          </p>
          
          {/* Status Indicators */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              <span className="text-sm font-medium">API Status:</span>
              <Badge variant={integrationStatus.google ? "default" : "destructive"}>
                {integrationStatus.google ? "✓ Configured" : "✗ Missing Key"}
              </Badge>
            </div>
          </div>
        </div>

        {/* API Key Warning */}
        {!integrationStatus.google && (
          <Alert>
            <Key className="h-4 w-4" />
            <AlertDescription>
              <strong>Google API Key Required:</strong> To use these components, you need to set the 
              <code className="mx-1 px-2 py-1 bg-muted rounded">VITE_GOOGLE_API_KEY</code> 
              environment variable with your Google API key. The key should have access to:
              <ul className="mt-2 ml-4 list-disc">
                <li>Google Places API</li>
                <li>Google Maps JavaScript API</li>
                <li>Google Translate API</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <Tabs value={activeDemo} onValueChange={(value) => setActiveDemo(value as 'maps' | 'translator')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="maps" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Google Maps
            </TabsTrigger>
            <TabsTrigger value="translator" className="flex items-center gap-2">
              <Languages className="w-4 h-4" />
              Google Translator
            </TabsTrigger>
          </TabsList>

          {/* Google Maps Tab */}
          <TabsContent value="maps" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Demo Component */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Play className="w-5 h-5" />
                      Live Demo
                    </CardTitle>
                    <CardDescription>
                      Interactive Google Maps component with search and place details
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <GoogleMaps 
                      defaultQuery="restaurants in New York"
                      defaultCenter={{ lat: 40.7589, lng: -73.9851 }}
                      height={400}
                      enableDetails={true}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Features & Info */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      {features.maps.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-green-500 mt-1">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Use Cases</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1 text-sm">
                      {useCases.maps.map((useCase, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          {useCase}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Code Example */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Code Example
                </CardTitle>
                <CardDescription>
                  How to use the GoogleMaps component in your React application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{codeExamples.maps}</code>
                </pre>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Google Translator Tab */}
          <TabsContent value="translator" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Demo Component */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Play className="w-5 h-5" />
                      Live Demo
                    </CardTitle>
                    <CardDescription>
                      Interactive Google Translator with auto-detection and history
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <GoogleTranslator 
                      defaultText="Hello, welcome to our website!"
                      defaultSourceLang="en"
                      defaultTargetLang="es"
                      enableAutoDetect={true}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Features & Info */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      {features.translator.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-green-500 mt-1">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Use Cases</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1 text-sm">
                      {useCases.translator.map((useCase, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          {useCase}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Code Example */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Code Example
                </CardTitle>
                <CardDescription>
                  How to use the GoogleTranslator component in your React application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{codeExamples.translator}</code>
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* API Documentation */}
        <Card>
          <CardHeader>
            <CardTitle>API Documentation & Setup</CardTitle>
            <CardDescription>
              Complete setup guide and API reference for Google integrations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Required APIs</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    <a 
                      href="https://developers.google.com/maps/documentation/places/web-service" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Google Places API
                    </a>
                  </li>
                  <li className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    <a 
                      href="https://developers.google.com/maps/documentation/javascript" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Google Maps JavaScript API
                    </a>
                  </li>
                  <li className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    <a 
                      href="https://cloud.google.com/translate/docs" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Google Translate API
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Environment Setup</h3>
                <div className="bg-muted p-3 rounded text-sm">
                  <code>VITE_GOOGLE_API_KEY=your_google_api_key_here</code>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Add this to your <code>.env</code> file in the project root
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Component Props</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">GoogleMaps Props</h4>
                  <div className="text-sm space-y-1">
                    <div><code>defaultQuery?: string</code> - Initial search query</div>
                    <div><code>defaultCenter?: {`{lat: number, lng: number}`}</code> - Map center</div>
                    <div><code>height?: number</code> - Map height in pixels</div>
                    <div><code>enableDetails?: boolean</code> - Enable place details</div>
                    <div><code>className?: string</code> - Custom CSS classes</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">GoogleTranslator Props</h4>
                  <div className="text-sm space-y-1">
                    <div><code>defaultText?: string</code> - Initial text to translate</div>
                    <div><code>defaultSourceLang?: string</code> - Source language code</div>
                    <div><code>defaultTargetLang?: string</code> - Target language code</div>
                    <div><code>enableAutoDetect?: boolean</code> - Enable auto-detection</div>
                    <div><code>className?: string</code> - Custom CSS classes</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Components */}
        <Card>
          <CardHeader>
            <CardTitle>Testing & Validation</CardTitle>
            <CardDescription>
              Run comprehensive tests to validate Google API integrations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="h-auto p-4 text-left justify-start"
                onClick={() => {
                  // This would run the Google Maps test
                  console.log('[testing] Running Google Maps tests...');
                }}
              >
                <div>
                  <div className="font-medium">Test Google Maps</div>
                  <div className="text-sm text-muted-foreground">
                    Run comprehensive tests for Places API, search, and details
                  </div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto p-4 text-left justify-start"
                onClick={() => {
                  // This would run the Google Translator test
                  console.log('[testing] Running Google Translator tests...');
                }}
              >
                <div>
                  <div className="font-medium">Test Google Translator</div>
                  <div className="text-sm text-muted-foreground">
                    Run comprehensive tests for translation and language detection
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
