# API Integrations Setup Guide

This document provides comprehensive setup instructions for all API integrations in the GO SG website.

## Overview

The project includes the following integrations:
- **OpenRouter**: AI services for chat completion and text generation
- **Google API**: Maps, Places, Reviews, and Translator services
- **SMTP (Resend)**: Email sending capabilities
- **Supabase**: Database and authentication (existing)

## Environment Variables

### Railway Environment Variables

Add these variables to your Railway service settings:

```bash
# OpenRouter API for AI services
OPENROUTER_API_KEY=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

# Google API for Maps, Reviews, and Translator
GOOGLE_API_KEY=AIzaSyBN_I1rWGaUqN_wtWMnaFM-BGWoJ7xUh7A

# SMTP Configuration using Resend
RESEND_API_KEY=re_2ap5qM9k_96jEVym5P34qtcJctKycM1ai
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USER=resend
SMTP_FROM_EMAIL=noreply@gosg.com
```

### Local Development (.env)

For local development, create a `.env` file in the project root:

```bash
# Frontend environment variables (VITE_ prefix required)
VITE_OPENROUTER_API_KEY=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
VITE_GOOGLE_API_KEY=AIzaSyBN_I1rWGaUqN_wtWMnaFM-BGWoJ7xUh7A
VITE_RESEND_API_KEY=re_2ap5qM9k_96jEVym5P34qtcJctKycM1ai
VITE_SMTP_FROM_EMAIL=noreply@gosg.com

# Server environment variables
RESEND_API_KEY=re_2ap5qM9k_96jEVym5P34qtcJctKycM1ai
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USER=resend
SMTP_FROM_EMAIL=noreply@gosg.com
```

## Integration Details

### 1. OpenRouter AI Integration

**Purpose**: Provides AI chat completion and text generation services.

**Features**:
- Chat completion with various AI models
- Model selection and configuration
- Token usage tracking
- Error handling and retry logic

**Usage**:
```typescript
import { openRouterClient } from '@/integrations';

const response = await openRouterClient.chatCompletion([
  { role: 'user', content: 'Hello, how are you?' }
]);
```

**Configuration**:
- API Key: `OPENROUTER_API_KEY`
- Base URL: `https://openrouter.ai/api/v1`
- Default Model: `openai/gpt-3.5-turbo`

### 2. Google API Integration

**Purpose**: Provides Google Maps, Places, Reviews, and Translator services.

**Features**:
- **Google Maps**: Place search, geocoding, map display
- **Google Places**: Business information, reviews, photos
- **Google Translator**: Text translation, language detection

**Usage**:
```typescript
import { googleAPIClient } from '@/integrations';

// Search places
const places = await googleAPIClient.searchPlaces('restaurants near me');

// Get place details with reviews
const { place, reviews } = await googleAPIClient.getPlaceDetails(placeId);

// Translate text
const translation = await googleAPIClient.translateText('Hello', 'es');

// Load Google Maps script
await googleAPIClient.loadMapsScript();
```

**Configuration**:
- API Key: `GOOGLE_API_KEY`
- Required APIs: Places API, Maps JavaScript API, Translate API
- Billing: Pay-per-use pricing

**Google Services Enabled**:
- ✅ Google Maps JavaScript API
- ✅ Places API (for business reviews)
- ✅ Translate API

### 3. SMTP Integration (Resend)

**Purpose**: Provides email sending capabilities for contact forms and notifications.

**Features**:
- HTML and text email support
- Contact form email templates
- Notification email templates
- Attachment support
- Email validation

**Usage**:
```typescript
import { smtpClient } from '@/integrations';

// Send basic email
await smtpClient.sendEmail({
  to: 'user@example.com',
  subject: 'Welcome!',
  html: '<p>Welcome to our service!</p>',
  text: 'Welcome to our service!'
});

// Send contact form email
await smtpClient.sendContactForm({
  name: 'John Doe',
  email: 'john@example.com',
  subject: 'Inquiry',
  message: 'I have a question...'
});
```

**Server Endpoints**:
- `POST /api/send-email` - Send custom email
- `POST /api/send-contact-email` - Send contact form email

**Configuration**:
- API Key: `RESEND_API_KEY`
- SMTP Host: `smtp.resend.com`
- SMTP Port: `465` (SSL) or `587` (TLS)
- From Email: Configure your verified domain

## Testing

### Integration Test Suite

Access the integration test suite at `/integration-test` (development only).

The test suite includes:
- ✅ API key configuration check
- ✅ OpenRouter AI chat completion test
- ✅ Google Places search test
- ✅ Google Translate test
- ✅ SMTP client-side test
- ✅ SMTP server-side test

### Manual Testing

1. **OpenRouter AI**:
   ```bash
   curl -X POST https://openrouter.ai/api/v1/chat/completions \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"model":"openai/gpt-3.5-turbo","messages":[{"role":"user","content":"Hello"}]}'
   ```

2. **Google Places**:
   ```bash
   curl "https://maps.googleapis.com/maps/api/place/textsearch/json?query=restaurants&key=YOUR_API_KEY"
   ```

3. **Google Translate**:
   ```bash
   curl -X POST "https://translation.googleapis.com/language/translate/v2?key=YOUR_API_KEY" \
     -d "q=Hello&target=es"
   ```

4. **Resend SMTP**:
   ```bash
   curl -X POST https://api.resend.com/emails \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"from":"noreply@yourdomain.com","to":"test@example.com","subject":"Test","text":"Hello"}'
   ```

## Security Considerations

### API Key Management
- ✅ API keys are stored as environment variables
- ✅ Client-side keys use `VITE_` prefix for Vite
- ✅ Server-side keys are not exposed to client
- ✅ Keys are not committed to version control

### CORS and Domain Restrictions
- Configure Google API key with HTTP referrer restrictions
- Set up Resend domain verification for production
- Use environment-specific API keys

### Rate Limiting
- OpenRouter: Varies by model and plan
- Google APIs: Quotas and rate limits apply
- Resend: 100 emails/day on free tier

## Troubleshooting

### Common Issues

1. **API Key Not Working**:
   - Verify the key is correctly set in environment variables
   - Check if the key has proper permissions/scopes
   - Ensure billing is enabled for paid APIs

2. **CORS Errors**:
   - Google APIs may require server-side proxy for some endpoints
   - Configure proper HTTP referrer restrictions

3. **Email Delivery Issues**:
   - Verify domain ownership in Resend dashboard
   - Check spam folders
   - Monitor Resend dashboard for delivery status

4. **Google API Quota Exceeded**:
   - Monitor usage in Google Cloud Console
   - Implement caching for frequently requested data
   - Consider upgrading quota limits

### Debug Mode

Enable debug logging by setting:
```bash
NODE_ENV=development
```

Look for `[testing]` prefixed logs in the console.

## Production Deployment

### Railway Deployment

1. **Set Environment Variables**:
   - Copy variables from `railway-env-variables.txt`
   - Add them in Railway dashboard under Variables tab

2. **Domain Configuration**:
   - Update `SMTP_FROM_EMAIL` with your verified domain
   - Configure Google API key restrictions
   - Set up proper CORS policies

3. **Monitoring**:
   - Monitor API usage and costs
   - Set up alerts for quota limits
   - Track email delivery rates

### Health Checks

The server includes health check endpoints:
- `GET /health` - Basic server health
- Integration status available via `checkIntegrationStatus()` function

## Cost Optimization

### OpenRouter
- Choose appropriate models for your use case
- Implement response caching where possible
- Monitor token usage

### Google APIs
- Cache place details and search results
- Use appropriate search radius limits
- Implement request batching

### Resend
- Use transactional emails efficiently
- Monitor delivery rates
- Consider upgrading for higher limits

## Support

For integration-specific support:
- **OpenRouter**: [OpenRouter Documentation](https://openrouter.ai/docs)
- **Google APIs**: [Google Cloud Support](https://cloud.google.com/support)
- **Resend**: [Resend Documentation](https://resend.com/docs)

For project-specific issues, check the integration test suite and server logs.
