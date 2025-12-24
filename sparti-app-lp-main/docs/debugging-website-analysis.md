# Debugging Website Analysis "Edge Function returned a non-2xx status code" Error

## Problem
When clicking "Analyze Website" in the Quick Setup modal, the system returns an error: "Edge Function returned a non-2xx status code".

## Root Causes

The error can be caused by several issues:

1. **Firecrawl API Key Not Configured**
   - The `FIRECRAWL_API_KEY` environment variable is missing in Supabase
   - Solution: Add the API key in Supabase Dashboard → Project Settings → Edge Functions → Secrets

2. **Firecrawl API Quota Exceeded**
   - You've reached your Firecrawl API usage limit
   - Solution: Check your Firecrawl dashboard and upgrade if needed

3. **Website Blocking Scraping**
   - The target website blocks automated scraping attempts
   - Solution: The system will automatically fall back to a CORS proxy

4. **AI Service Credits Exhausted**
   - OpenRouter AI credits are depleted
   - Solution: Add more credits to your OpenRouter account

## Debugging Steps

### Step 1: Check Browser Console
Open the browser console (F12) and look for `[testing]` prefixed logs:

```
[testing] Starting website analysis for: https://smooy.sg
[testing] Analysis response: { data: ..., error: ... }
```

### Step 2: Test Firecrawl Directly
Navigate to `/app/tests/firecrawl` and test the URL directly:

1. Enter the website URL (e.g., `smooy.sg`)
2. Click "Test"
3. Check the response for errors

Common Firecrawl errors:
- `FIRECRAWL_API_KEY environment variable is not set` → API key missing
- `Failed to scrape URL` → Website blocking or API quota exceeded
- `401 Unauthorized` → Invalid API key

### Step 3: Test Full Website Analysis
Navigate to `/app/tests/website-analysis` and test the complete workflow:

1. Enter the website URL
2. Click "Test"
3. Review the detailed error messages

### Step 4: Check Supabase Logs
1. Go to Supabase Dashboard → Logs → Edge Functions
2. Filter by `quick-setup-website-analysis`
3. Look for error messages with `[testing]` prefix

## Solutions

### Solution 1: Configure Firecrawl API Key

1. Get your Firecrawl API key from https://firecrawl.dev
2. Go to Supabase Dashboard → Project Settings → Edge Functions → Secrets
3. Add a new secret:
   - Name: `FIRECRAWL_API_KEY`
   - Value: Your Firecrawl API key
4. Restart the edge functions or wait a few minutes

### Solution 2: Use Manual Entry

If automatic analysis continues to fail:

1. Click "Analyze Website" and wait for the error
2. The system will show a "Enter website information manually" option
3. Fill in the brand information manually
4. Click "Continue Manually" to proceed

### Solution 3: Check Fallback Mechanism

The system has a fallback chain:
1. **Primary**: Firecrawl API (best quality)
2. **Fallback**: CORS Proxy (moderate quality)
3. **Last Resort**: Manual entry

If Firecrawl fails, the system should automatically try the CORS proxy.

## Testing URLs

Use these URLs to test different scenarios:

- **Simple website**: `example.com`
- **Complex website**: `smooy.sg`
- **Blocked website**: Try any site that blocks scraping

## Expected Behavior

### Successful Analysis
```json
{
  "success": true,
  "data": {
    "brand_name": "Smooy",
    "brand_description": "Frozen yogurt shop...",
    "target_audience": "Health-conscious consumers...",
    "key_selling_points": ["Natural ingredients", "Low calories", ...]
  }
}
```

### Error Response
```json
{
  "error": "Firecrawl API key not configured",
  "details": "FIRECRAWL_API_KEY environment variable is missing..."
}
```

## Improvements Made

1. **Enhanced Logging**: Added `[testing]` prefixed logs throughout the workflow
2. **Better Error Messages**: More specific error messages for different failure scenarios
3. **Removed Strict Checks**: Removed overly strict accessibility pre-checks
4. **Test Tools**: Created dedicated test pages for debugging
5. **Fallback Mechanisms**: Improved fallback from Firecrawl to CORS proxy

## Next Steps

If the issue persists after following these steps:

1. Check the Supabase logs for detailed error messages
2. Verify the Firecrawl API key is correctly configured
3. Test with the `/app/tests/firecrawl` page
4. Use manual entry as a temporary workaround
5. Contact support with the browser console logs and Supabase logs
