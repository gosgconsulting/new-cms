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
- Process page translations for the new language:
  - Get all pages for the tenant
  - For each page, find the default layout in page_layouts where is_default = true
  - Extract content, questions, and answers from the layout JSON
  - Translate these fields using Google Translate API
  - Store the translated layout with the new language code in page_layouts table with is_default = false

#### removeLanguage
- Get current site_content_languages from database
- Parse into array and remove the specified language
- Join back to comma-separated string and update database
- Delete translated page layouts for this language:
  - Get all pages for the tenant
  - For each page, delete the layout for the removed language from page_layouts table

#### setDefaultLanguage
This function has two paths depending on how the user sets the default language:

**Path 1: Setting default from "Additional Languages" (translated version exists)**
- Update site_language in site_settings table with the new default language
- For all pages under the tenant:
  - Find current default layout in page_layouts where is_default = true
  - Set is_default = false for these layouts
  - Find layouts with the new language
  - Set is_default = true for these layouts

**Path 2: Setting default from "Change Default" (need to check if translation exists)**
- For each page under the tenant:
  - Check if a translation exists for the new default language
  - If translation exists:
    - Follow Path 1 logic
  - If translation doesn't exist:
    - Update site_language in site_settings table
    - Add the language to site_content_languages if not already present
    - For each page:
      - Find the current default layout (is_default = true)
      - Extract content, questions, and answers
      - Translate using Google Translate API
      - Set current default to is_default = false
      - Store new translated layout with is_default = true

#### processPageTranslations
- Get all pages for the tenant
- For each page:
  - Find the default layout (is_default = true)
  - Extract content fields for translation
  - Translate content using Google Translate API
  - Store the translated layout with the new language code

#### translateLayoutContent
- Create a deep copy of the layout JSON
- Process components recursively:
  - Translate content fields
  - Handle FAQ items specifically (question and answer fields)
  - Handle nested arrays (for sliders, testimonials, etc.)

### 3. Update Database Schema

Add is_default column to page_layouts table:

```sql
-- Add is_default column to page_layouts table
ALTER TABLE page_layouts ADD COLUMN IF NOT EXISTS is_default BOOLEAN NOT NULL DEFAULT false;

-- Set is_default to true for existing default layouts (assuming current default is language='en')
UPDATE page_layouts SET is_default = true WHERE language = 'en';
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
- `setDefaultLanguage` - Call the API to set the default language (with parameter to indicate if coming from additional languages or change default)

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
- `handleSetDefaultLanguage` - Use the new setDefaultLanguage function with source parameter

Each function will:
- Call the appropriate language service function
- Handle loading state and errors
- Show appropriate toast notifications
- Refresh the language settings after successful operations

## Testing Plan

1. Test adding a new language
   - Verify the language is added to site_content_languages
   - Verify translations are generated for all pages
   - Verify is_default is set to false for new translations

2. Test removing a language
   - Verify the language is removed from site_content_languages
   - Verify translated page layouts are deleted

3. Test setting a default language from additional languages
   - Verify the site_language setting is updated
   - Verify is_default is updated for all page layouts (old default to false, new default to true)

4. Test setting a default language that doesn't have translations
   - Verify the site_language setting is updated
   - Verify site_content_languages is updated if needed
   - Verify translations are generated
   - Verify is_default flags are properly updated

5. Test Google Translation integration
   - Verify content is correctly translated
   - Verify translated content is stored in page_layouts with correct language and is_default flags

## Implementation Notes

- The implementation uses a tenant-based approach, with tenant ID from the current user context
- All database operations are performed using the query function from postgres.js
- Error handling and logging are implemented throughout the codebase
- The implementation follows the existing patterns in the codebase
- The page_layouts table now includes an is_default column to easily identify the default language version for each page