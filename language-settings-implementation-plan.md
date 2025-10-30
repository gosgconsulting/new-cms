# Language Settings Implementation Plan

## Overview

This document outlines the implementation plan for language settings features in the CMS, including:

1. Adding new languages to site_content_languages
2. Removing languages from site_content_languages
3. Setting a default language (site_language)
4. Integrating with Google Translate API to generate translated content for pages

## Implementation Steps

### 1. Create Google Translation Service

First, we'll create a service to handle Google Translation API calls:

```javascript
// sparti-cms/services/googleTranslationService.js
```

This service will:
- Use environment variables for API key (GOOGLE_CLOUD_TRANSLATION_API_KEY or VITE_GOOGLE_CLOUD_TRANSLATION_API_KEY)
- Provide a translateText function that handles API calls to Google Translate
- Handle error cases and provide appropriate logging

### 2. Create Language Management Service

Next, we'll create a service to handle language management operations:

```javascript
// sparti-cms/services/languageManagementService.js
```

This service will include the following functions:

#### addLanguage
- Get current site_content_languages from database
- Parse into array and check if language already exists
- Add new language to array and join back to comma-separated string
- Update site_content_languages in database
- Process page translations for the new language

#### removeLanguage
- Get current site_content_languages from database
- Parse into array and remove the specified language
- Join back to comma-separated string and update database
- Delete translated page layouts for this language:
  - Get all pages for the tenant
  - For each page, delete the layout for the removed language

#### setDefaultLanguage
- Update site_language in database (use UPDATE for existing record)
- Check if translations exist for this language:
  - Get all pages for the tenant
  - For each page, check if a translation exists for the new default language
  - If no translation exists, generate one using the original layout and Google Translate

#### processPageTranslations
- Get all pages for the tenant
- For each page, get its layout from page_layouts
- Process the layout JSON to translate text content
- Store the translated layout with the language code

#### translateLayoutContent
- Create a deep copy of the layout JSON
- Process components recursively:
  - Translate content fields
  - Handle FAQ items specifically (question and answer fields)
  - Handle nested arrays (for sliders, testimonials, etc.)

### 3. Update Database Schema

Modify the page_layouts table to include a language column:

```sql
-- Add language column to page_layouts table if it doesn't exist
ALTER TABLE page_layouts ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'en';

-- Update primary key to include language
ALTER TABLE page_layouts DROP CONSTRAINT IF EXISTS page_layouts_pkey;
ALTER TABLE page_layouts ADD PRIMARY KEY (page_id, language);
```

### 4. Add API Routes for Language Management

Add API routes to server.js for language management:

```javascript
// Add to server.js
```

Create three new API endpoints:
- `/api/language/add` - Add a new language
- `/api/language/remove` - Remove a language
- `/api/language/set-default` - Set default language

Each endpoint will:
- Validate input parameters
- Call the appropriate language management service function
- Handle errors and return appropriate responses

### 5. Update Language Service

Update the existing languageService.ts to integrate with the new backend functionality:

```typescript
// Update sparti-cms/services/languageService.ts
```

Add three new functions:
- `addLanguage` - Call the API to add a language
- `removeLanguage` - Call the API to remove a language
- `setDefaultLanguage` - Call the API to set the default language

Each function will:
- Make the appropriate API call
- Handle errors and logging
- Return updated language settings

### 6. Update LanguageSection Component

Update the LanguageSection.tsx component to use the new language management functions:

```typescript
// Update sparti-cms/components/admin/LanguageSection.tsx
```

Modify the following functions:
- `handleAddLanguage` - Use the new addLanguage function
- `handleRemoveLanguage` - Use the new removeLanguage function
- `handleSetDefaultLanguage` - Use the new setDefaultLanguage function

Each function will:
- Call the appropriate language service function
- Handle loading state and errors
- Show appropriate toast notifications
- Refresh the language settings after successful operations

## Testing Plan

1. Test adding a new language
   - Verify the language is added to site_content_languages
   - Verify translations are generated for all pages

2. Test removing a language
   - Verify the language is removed from site_content_languages
   - Verify translated page layouts are deleted

3. Test setting a default language
   - Verify the site_language setting is updated
   - Verify translations are generated if they don't exist

4. Test Google Translation integration
   - Verify content is correctly translated
   - Verify translated content is stored in page_layouts with correct language

## Implementation Notes

- The implementation uses a tenant-based approach, with 'tenant-gosg' as the default tenant
- All database operations are performed using the query function from postgres.js
- Error handling and logging are implemented throughout the codebase
- The implementation follows the existing patterns in the codebase
