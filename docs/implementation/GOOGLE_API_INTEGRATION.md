# Google API Integration

This document provides comprehensive information about the Google API integration in the project, including Google Maps and Google Translator functionality.

## Overview

The Google API integration provides two main components:
- **GoogleMaps**: Interactive maps with place search, details, and reviews
- **GoogleTranslator**: Text translation with language detection and history

## Setup

### 1. Google API Key

You need a Google API key with the following services enabled:
- Google Places API
- Google Maps JavaScript API  
- Google Translate API

### 2. Environment Configuration

Add your Google API key to your `.env` file:

```bash
VITE_GOOGLE_API_KEY=your_google_api_key_here
```

### 3. API Services Setup

Visit the [Google Cloud Console](https://console.cloud.google.com/) and enable:

1. **Google Places API**
   - Used for place search and details
   - Required for GoogleMaps component

2. **Google Maps JavaScript API**
   - Used for interactive map display
   - Required for GoogleMaps component

3. **Google Translate API**
   - Used for text translation
   - Required for GoogleTranslator component

## Components

### GoogleMaps Component

Interactive Google Maps with search functionality and place details.

#### Props

```typescript
interface GoogleMapsProps {
  defaultQuery?: string;           // Initial search query
  defaultCenter?: {                // Map center coordinates
    lat: number; 
    lng: number;
  };
  height?: number;                 // Map height in pixels (default: 400)
  enableDetails?: boolean;         // Enable place details (default: true)
  className?: string;              // Custom CSS classes
}
```

#### Basic Usage

```tsx
import { GoogleMaps } from '@/components/GoogleMaps';

function App() {
  return (
    <GoogleMaps 
      defaultQuery="restaurants near me"
      defaultCenter={{ lat: 37.7749, lng: -122.4194 }}
      height={400}
      enableDetails={true}
    />
  );
}
```

#### Features

- ✅ Interactive Google Maps display
- ✅ Place search with location filtering
- ✅ Detailed place information with reviews
- ✅ Interactive markers with click events
- ✅ Automatic map bounds adjustment
- ✅ Photo URL generation
- ✅ Error handling and loading states
- ✅ Responsive design

#### Use Cases

- Business directory and location finder
- Restaurant and hotel booking platforms
- Real estate property search
- Event venue discovery
- Local service provider lookup
- Travel planning applications
- Store locator for retail chains
- Emergency services finder

### GoogleTranslator Component

Text translation with language detection and history.

#### Props

```typescript
interface GoogleTranslatorProps {
  defaultText?: string;            // Initial text to translate
  defaultSourceLang?: string;      // Source language code (default: 'auto')
  defaultTargetLang?: string;      // Target language code (default: 'en')
  enableAutoDetect?: boolean;      // Enable auto-detection (default: true)
  enableSpeech?: boolean;          // Enable text-to-speech (default: false)
  className?: string;              // Custom CSS classes
}
```

#### Basic Usage

```tsx
import { GoogleTranslator } from '@/components/GoogleTranslator';

function App() {
  return (
    <GoogleTranslator 
      defaultText="Hello, world!"
      defaultSourceLang="en"
      defaultTargetLang="es"
      enableAutoDetect={true}
    />
  );
}
```

#### Features

- ✅ Text translation between 100+ languages
- ✅ Automatic language detection
- ✅ Translation history with clickable entries
- ✅ Language swapping functionality
- ✅ Copy to clipboard feature
- ✅ Quick translation examples
- ✅ Character count and performance metrics
- ✅ Keyboard shortcuts (Ctrl+Enter to translate)

#### Use Cases

- Multi-language website content
- Customer support chat translation
- Document translation services
- Educational language learning tools
- International e-commerce platforms
- Travel and tourism applications
- Social media content translation
- Business communication tools

## API Integration

### Google API Client

The integration uses a centralized `GoogleAPIClient` class:

```typescript
import { googleAPIClient } from '@/integrations';

// Search for places
const places = await googleAPIClient.searchPlaces('restaurants', location, radius);

// Get place details
const details = await googleAPIClient.getPlaceDetails(placeId);

// Translate text
const result = await googleAPIClient.translateText('Hello', 'es', 'en');

// Get supported languages
const languages = await googleAPIClient.getSupportedLanguages();
```

### Error Handling

All components include comprehensive error handling:

```typescript
try {
  const result = await googleAPIClient.translateText(text, targetLang);
  // Handle success
} catch (error) {
  console.error('Translation failed:', error.message);
  // Handle error
}
```

## Testing

### Simple API Test

Run the basic API connectivity test:

```bash
node test-google-api-simple.js
```

### Comprehensive Tests

For detailed testing, use the TypeScript test files:

```bash
# Google Maps tests
node test-google-maps.js

# Google Translator tests  
node test-google-translator.js
```

### Integration Test Component

Use the built-in integration test component:

```tsx
import { IntegrationTest } from '@/components/IntegrationTest';

function TestPage() {
  return <IntegrationTest />;
}
```

## Demo Page

A comprehensive demo page is available at `/google-integrations` (or wherever you route the `GoogleIntegrationsPage` component):

```tsx
import { GoogleIntegrationsPage } from '@/pages/GoogleIntegrations';

// Add to your router
<Route path="/google-integrations" component={GoogleIntegrationsPage} />
```

## Language Codes

### Common Language Codes

| Code | Language |
|------|----------|
| `en` | English |
| `es` | Spanish |
| `fr` | French |
| `de` | German |
| `it` | Italian |
| `pt` | Portuguese |
| `ru` | Russian |
| `ja` | Japanese |
| `ko` | Korean |
| `zh` | Chinese (Simplified) |
| `ar` | Arabic |
| `hi` | Hindi |

### Auto-Detection

Use `'auto'` as the source language for automatic detection:

```tsx
<GoogleTranslator 
  defaultSourceLang="auto"
  defaultTargetLang="en"
/>
```

## Performance Considerations

### API Quotas

- **Places API**: 1,000 requests per day (free tier)
- **Maps JavaScript API**: 28,000 map loads per month (free tier)
- **Translate API**: 500,000 characters per month (free tier)

### Optimization Tips

1. **Caching**: Implement caching for frequently requested translations
2. **Debouncing**: Use debouncing for real-time translation features
3. **Lazy Loading**: Load Google Maps script only when needed
4. **Error Boundaries**: Implement React error boundaries for graceful failures

## Troubleshooting

### Common Issues

1. **API Key Not Working**
   - Verify the key is correctly set in `.env`
   - Check that required APIs are enabled in Google Cloud Console
   - Ensure billing is enabled for your Google Cloud project

2. **CORS Errors**
   - Add your domain to the API key restrictions
   - Use server-side proxy for sensitive operations

3. **Quota Exceeded**
   - Monitor usage in Google Cloud Console
   - Implement caching and rate limiting
   - Consider upgrading to paid tier

4. **Maps Not Loading**
   - Check browser console for JavaScript errors
   - Verify Google Maps JavaScript API is enabled
   - Ensure proper API key permissions

### Debug Mode

Enable debug logging by checking the browser console for `[testing]` prefixed messages.

## Security

### API Key Protection

- Never expose API keys in client-side code for production
- Use environment variables for API keys
- Implement server-side proxy for sensitive operations
- Set up API key restrictions in Google Cloud Console

### Best Practices

1. **Restrict API Keys**: Limit keys to specific domains/IPs
2. **Monitor Usage**: Set up alerts for unusual activity
3. **Rotate Keys**: Regularly rotate API keys
4. **Validate Input**: Always validate user input before API calls

## Contributing

When contributing to the Google API integration:

1. Follow the existing code patterns
2. Add comprehensive error handling
3. Include TypeScript types
4. Write tests for new functionality
5. Update documentation

## Support

For issues related to:
- **Google APIs**: Check [Google Cloud Support](https://cloud.google.com/support)
- **Component Issues**: Create an issue in the project repository
- **Integration Help**: Refer to this documentation or the demo page

## Changelog

### v1.0.0
- Initial Google Maps integration
- Initial Google Translator integration
- Comprehensive test suite
- Demo page and documentation
- Error handling and loading states
- TypeScript support
