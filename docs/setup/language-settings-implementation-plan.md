# Language Settings Implementation Plan

## Overview

This document outlines the implementation plan for language settings features in the CMS, including:

1. Adding new languages to site_content_languages
2. Removing languages from site_content_languages
3. Setting a default language (site_language)
4. Supporting multilingual page layouts

## Implementation Steps

### 1. Create Unified Language Service

We'll create a single unified language service that handles all language-related operations:

```typescript
// sparti-cms/services/languageService.ts
```

This service will:
- Use the postgres.ts query function for all database operations
- Provide TypeScript interfaces for better type safety
- Handle all language management operations in one place

### 2. Core Functions in Language Service

The service will include the following functions:

#### fetchLanguageSettings
- Fetches current language settings from the database
- Gets default language (site_language) and additional languages (site_content_languages)
- Returns an object with defaultLanguage and additionalLanguages

#### updateLanguageSettings
- Updates both site_language and site_content_languages in the database
- Ensures the default language is included in site_content_languages
- Uses ON CONFLICT to handle upsert operations

#### addLanguage
- Gets current site_content_languages from database
- Parses into array and checks if language already exists
- Adds new language to array and joins back to comma-separated string
- Updates site_content_languages in database
- Processes page translations for the new language:
  - Gets all pages for the tenant
  - For each page, finds the default layout in page_layouts where is_default = true
  - Duplicates the layout with the new language code (no translation for now)
  - Stores the duplicated layout with is_default = false

#### removeLanguage
- Gets current site_content_languages from database
- Parses into array and removes the specified language
- Joins back to comma-separated string and updates database
- Deletes translated page layouts for this language:
  - Gets all pages for the tenant
  - For each page, deletes the layout for the removed language from page_layouts table

#### setDefaultLanguage
This function has two paths depending on how the user sets the default language:

**Path 1: Setting default from "Additional Languages" (translated version exists)**
- Updates site_language in site_settings table with the new default language
- For all pages under the tenant:
  - Finds current default layout in page_layouts where is_default = true
  - Sets is_default = false for these layouts
  - Finds layouts with the new language
  - Sets is_default = true for these layouts

**Path 2: Setting default from "Change Default" (need to check if translation exists)**
- For each page under the tenant:
  - Checks if a translation exists for the new default language
  - If translation exists:
    - Follows Path 1 logic
  - If translation doesn't exist:
    - Updates site_language in site_settings table
    - Adds the language to site_content_languages if not already present
    - For each page:
      - Finds the current default layout (is_default = true)
      - Duplicates the layout (no translation for now)
      - Sets current default to is_default = false
      - Stores new duplicated layout with is_default = true

#### processPageTranslations
- Gets all pages for the tenant
- For each page:
  - Finds the default layout (is_default = true)
  - Duplicates the layout (no translation for now)
  - Stores the duplicated layout with the new language code

### 3. Database Schema Requirements

The implementation requires the following database schema:

```sql
-- page_layouts table should have these columns
-- id SERIAL PRIMARY KEY
-- page_id INTEGER REFERENCES pages(id) ON DELETE CASCADE
-- language VARCHAR(10) NOT NULL
-- layout_json JSONB NOT NULL
-- version INTEGER NOT NULL DEFAULT 1
-- is_default BOOLEAN NOT NULL DEFAULT false
-- updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()

-- If is_default column doesn't exist, add it:
ALTER TABLE page_layouts ADD COLUMN IF NOT EXISTS is_default BOOLEAN NOT NULL DEFAULT false;

-- Set is_default to true for existing default layouts (assuming current default is language='en')
UPDATE page_layouts SET is_default = true WHERE language = 'en';
```

### 4. API Integration

The languageService.ts file provides both:
1. Direct database functions for server-side use
2. API client functions for frontend use

For frontend use, the service exposes these functions:
- `fetchLanguageSettings` - Get current language settings
- `updateLanguageSettings` - Update language settings
- `addLanguage` - Add a new language
- `removeLanguage` - Remove a language
- `setDefaultLanguage` - Set the default language

### 5. Testing Plan

1. Test adding a new language
   - Verify the language is added to site_content_languages
   - Verify layouts are duplicated for all pages
   - Verify is_default is set to false for new layouts

2. Test removing a language
   - Verify the language is removed from site_content_languages
   - Verify page layouts for the removed language are deleted

3. Test setting a default language from additional languages
   - Verify the site_language setting is updated
   - Verify is_default is updated for all page layouts (old default to false, new default to true)

4. Test setting a default language that doesn't have translations
   - Verify the site_language setting is updated
   - Verify site_content_languages is updated if needed
   - Verify layouts are duplicated
   - Verify is_default flags are properly updated

### 6. Future Enhancements

1. **Google Translation Integration**
   - Integrate with Google Cloud Translation API
   - Update the processPageTranslations function to translate content instead of duplicating
   - Add translateLayoutContent function to recursively translate all text in the layout JSON

2. **Translation Memory**
   - Store previously translated strings to avoid re-translating the same content
   - Implement a translation cache system

3. **Manual Translation Editing**
   - Add UI for manually editing translated content
   - Implement version control for translations

## Implementation Notes

- The implementation uses a tenant-based approach, with tenant ID from the current user context
- All database operations are performed using the query function from postgres.ts
- Error handling and logging are implemented throughout the codebase
- The implementation follows the existing patterns in the codebase
- For now, page layouts are duplicated without translation; Google Translate integration will be added later