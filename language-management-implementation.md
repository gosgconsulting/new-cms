# Language Management Implementation

This document outlines the implementation of language management features in the CMS, including adding new languages, removing languages, and setting the default language.

## Overview

The implementation follows the plan outlined in `language-settings-implementation-plan.md` with the following components:

1. **Google Translation Service** - A mock implementation that duplicates content instead of translating it
2. **Language Management Service** - Core functions for managing languages in the database
3. **API Routes** - Endpoints for language management operations
4. **Language Service** - Frontend service for interacting with the API

## Components

### 1. Google Translation Service (`googleTranslationService.js`)

This service provides functions for translating text. Currently, it uses a mock implementation that returns the original text.

```javascript
export const translateText = async (text, targetLanguage, sourceLanguage = null) => {
  // Mock implementation that returns the original text
  return text;
};
```

### 2. Language Management Service (`languageManagementService.js`)

This service provides the core functions for managing languages in the database:

#### `addLanguage(languageCode, tenantId)`

- Gets current site_content_languages from the database
- Ensures the default language is included in site_content_languages
- Adds the new language to the comma-separated list
- Duplicates page layouts for the new language (instead of translating)

#### `removeLanguage(languageCode, tenantId)`

- Gets current site_content_languages from the database
- Removes the language from the comma-separated list
- Deletes page layouts for the removed language

#### `setDefaultLanguage(languageCode, tenantId, fromAdditionalLanguages)`

Has two paths depending on how the language is set:

1. **From Additional Languages** (translation exists)
   - Updates site_language in site_settings
   - Updates is_default flags in page_layouts

2. **From Change Default** (need to check if translation exists)
   - Checks if translations exist for all pages
   - If translations exist, follows path 1
   - If translations don't exist, creates them by duplicating the default layout

### 3. API Routes (added to `server.js`)

Three new API endpoints:

- **POST `/api/language/add`** - Adds a new language
- **POST `/api/language/remove`** - Removes a language
- **POST `/api/language/set-default`** - Sets the default language

Each endpoint:
- Validates input parameters
- Gets the tenant ID from the request
- Calls the appropriate language management service function
- Returns the result

### 4. Language Service (`languageService.ts`)

Frontend service for interacting with the API:

- **`fetchLanguageSettings(tenantId)`** - Fetches current language settings
- **`updateLanguageSettings(defaultLanguage, additionalLanguages, tenantId)`** - Updates language settings
- **`addLanguage(languageCode, tenantId)`** - Adds a new language
- **`removeLanguage(languageCode, tenantId)`** - Removes a language
- **`setDefaultLanguage(languageCode, fromAdditionalLanguages, tenantId)`** - Sets the default language

## Database Changes

The implementation uses the existing database schema with the addition of the `is_default` column to the `page_layouts` table:

```sql
ALTER TABLE page_layouts ADD COLUMN IF NOT EXISTS is_default BOOLEAN NOT NULL DEFAULT false;
```

## Usage

### Adding a Language

```typescript
import { addLanguage } from '../../services/languageService';

// Add French as a language
const result = await addLanguage('fr', currentTenantId);
if (result.success) {
  // Language added successfully
} else {
  // Handle error
}
```

### Removing a Language

```typescript
import { removeLanguage } from '../../services/languageService';

// Remove French as a language
const result = await removeLanguage('fr', currentTenantId);
if (result.success) {
  // Language removed successfully
} else {
  // Handle error
}
```

### Setting the Default Language

```typescript
import { setDefaultLanguage } from '../../services/languageService';

// Set French as the default language (from additional languages)
const result = await setDefaultLanguage('fr', true, currentTenantId);
if (result.success) {
  // Default language set successfully
} else {
  // Handle error
}
```

## Notes

1. The current implementation duplicates content instead of translating it. To enable real translation:
   - Update `googleTranslationService.js` to use the Google Cloud Translation API
   - Uncomment the real implementation in `translateText` function

2. The `is_default` column in the `page_layouts` table is used to identify the default language version of each page. This simplifies the process of finding the default layout for translation.

3. When setting a language as the default, the implementation handles two scenarios:
   - Setting from additional languages (translation already exists)
   - Setting from "Change Default" (need to check if translation exists)

4. All operations are tenant-aware, using the tenant ID from the request or the user context.

5. The implementation ensures that the default language is always included in the site_content_languages list, even when adding a new language.

6. Robust parsing is implemented for site_content_languages to handle different formats (empty string, single value, comma-separated list).

7. Error handling is implemented throughout the codebase, with detailed logging for debugging.
