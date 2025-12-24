# Theme Settings Database Documentation

## Overview

This document provides complete documentation for the theme settings database system. The system enables themes to read configuration from the database at runtime, supporting per-tenant+theme combinations for flexible customization.

## Database Schema

### Table: `site_settings`

The `site_settings` table stores all theme and tenant configuration.

#### Schema Structure

```sql
CREATE TABLE site_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(255) NOT NULL,
  setting_value TEXT,
  setting_type VARCHAR(50) DEFAULT 'text',
  setting_category VARCHAR(100) DEFAULT 'general',
  is_public BOOLEAN DEFAULT false,
  tenant_id VARCHAR(255),
  theme_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Indexes

- **Primary Key**: `id`
- **Unique Constraint**: `(setting_key, tenant_id, theme_id)` - Allows same key for different tenant+theme combinations
- **Performance Index**: `idx_site_settings_tenant_theme` on `(tenant_id, theme_id)`
- **Performance Index**: `idx_site_settings_theme_id` on `(theme_id)`

#### Column Descriptions

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER | Primary key, auto-increment |
| `setting_key` | VARCHAR(255) | Unique identifier for the setting (e.g., 'site_name') |
| `setting_value` | TEXT | The actual setting value (can be JSON string) |
| `setting_type` | VARCHAR(50) | Type: 'text', 'json', 'media', 'textarea' |
| `setting_category` | VARCHAR(100) | Category: 'branding', 'localization', 'theme', 'seo', 'general' |
| `is_public` | BOOLEAN | Whether setting is accessible via public API |
| `tenant_id` | VARCHAR(255) | Tenant identifier (references tenants.id) |
| `theme_id` | VARCHAR(255) | Theme identifier (nullable, for tenant-level settings) |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

### Migration

The `theme_id` column was added via migration:
- **File**: `sparti-cms/db/sequelize/migrations/20241225000001-add-theme-id-to-site-settings.js`
- **Backward Compatible**: Existing records have `theme_id = NULL`

## Setting Keys Reference

### Branding Category

Settings related to site branding and identity.

| Key | Type | Description | Example |
|-----|------|-------------|---------|
| `site_name` | text | Site/business name | "ACATR Business Services" |
| `site_tagline` | text | Site tagline/slogan | "Singapore Business Setup In 24 Hours" |
| `site_description` | textarea | Site description for SEO | "ACRA-registered filing agents..." |
| `site_logo` | media | Logo URL/path | "/theme/landingpage/assets/logo.png" |
| `site_favicon` | media | Favicon URL/path | "/theme/landingpage/assets/favicon.ico" |

### Localization Category

Settings related to location and language.

| Key | Type | Description | Example |
|-----|------|-------------|---------|
| `country` | text | Country code (ISO 3166-1 alpha-2) | "SG" |
| `timezone` | text | Timezone identifier (IANA) | "Asia/Singapore" |
| `language` | text | Default language code (ISO 639-1) | "en" |

### Theme Category

Settings related to theme styling and appearance.

| Key | Type | Description | Structure |
|-----|------|-------------|-----------|
| `theme_styles` | json | Complete theme style configuration | See [Style Structure](#style-structure) |

#### Style Structure

The `theme_styles` setting contains a JSON object:

```json
{
  "primary": "#8b5cf6",
  "primaryForeground": "#ffffff",
  "secondary": "#f3f0ff",
  "secondaryForeground": "#4338ca",
  "background": "#ffffff",
  "foreground": "#1f2937",
  "card": "#ffffff",
  "cardForeground": "#1f2937",
  "accent": "#dbeafe",
  "accentForeground": "#1e40af",
  "muted": "#f9fafb",
  "mutedForeground": "#6b7280",
  "border": "#e5e7eb",
  "input": "#e5e7eb",
  "ring": "#8b5cf6",
  "destructive": "#ef4444",
  "destructiveForeground": "#ffffff",
  "typography": {
    "fontSans": "Inter, sans-serif",
    "fontSerif": "Playfair Display, serif",
    "fontMono": "Fira Code, monospace",
    "baseFontSize": "16px",
    "headingScale": "1.25",
    "lineHeight": "1.6"
  }
}
```

## API Endpoints

### Admin API (Authenticated)

All admin endpoints require authentication via `authenticateUser` middleware.

#### Get All Theme Settings

```
GET /api/settings/theme/:themeId?tenantId={tenantId}
```

**Response**:
```json
{
  "branding": {
    "site_name": "ACATR Business Services",
    "site_tagline": "...",
    "site_logo": "..."
  },
  "localization": {
    "country": "SG",
    "timezone": "Asia/Singapore"
  },
  "theme": {
    "theme_styles": {...}
  }
}
```

#### Get Branding Settings

```
GET /api/settings/theme/:themeId/branding?tenantId={tenantId}
```

**Response**:
```json
{
  "site_name": "ACATR Business Services",
  "site_tagline": "...",
  "site_description": "...",
  "site_logo": "...",
  "site_favicon": "..."
}
```

#### Get Localization Settings

```
GET /api/settings/theme/:themeId/localization?tenantId={tenantId}
```

**Response**:
```json
{
  "country": "SG",
  "timezone": "Asia/Singapore",
  "language": "en"
}
```

#### Get Style Settings

```
GET /api/settings/theme/:themeId/styles?tenantId={tenantId}
```

**Response**:
```json
{
  "primary": "#8b5cf6",
  "typography": {...}
}
```

#### Update Setting

```
PUT /api/settings/theme/:themeId/:key?tenantId={tenantId}
Content-Type: application/json

{
  "setting_value": "value",
  "setting_type": "text",
  "setting_category": "branding"
}
```

**Response**:
```json
{
  "id": 1,
  "setting_key": "site_name",
  "setting_value": "value",
  "tenant_id": "tenant-gosg",
  "theme_id": "landingpage"
}
```

#### Sync Settings (Placeholder)

```
POST /api/settings/theme/:themeId/sync?tenantId={tenantId}
```

**Response**:
```json
{
  "success": true,
  "message": "Settings sync initiated",
  "tenantId": "tenant-gosg",
  "themeId": "landingpage"
}
```

### Public API (For Themes)

Public endpoints are accessible without authentication. Tenant is determined from request context (subdomain, header, etc.).

#### Get All Settings

```
GET /api/v1/theme/:themeSlug/settings
```

**Response**:
```json
{
  "success": true,
  "data": {
    "branding": {...},
    "localization": {...},
    "theme": {...}
  },
  "meta": {
    "tenant_id": "tenant-gosg",
    "timestamp": "2024-12-25T00:00:00.000Z"
  }
}
```

#### Get Branding Only

```
GET /api/v1/theme/:themeSlug/branding
```

**Response**:
```json
{
  "success": true,
  "data": {
    "site_name": "ACATR Business Services",
    "site_logo": "..."
  },
  "meta": {
    "tenant_id": "tenant-gosg",
    "timestamp": "2024-12-25T00:00:00.000Z"
  }
}
```

#### Get Styles Only

```
GET /api/v1/theme/:themeSlug/styles
```

**Response**:
```json
{
  "success": true,
  "data": {
    "primary": "#8b5cf6",
    "typography": {...}
  },
  "meta": {
    "tenant_id": "tenant-gosg",
    "timestamp": "2024-12-25T00:00:00.000Z"
  }
}
```

## Theme Integration Guide

### Step 1: Install the Hook

The `useThemeSettings` hook is located at:
```
sparti-cms/hooks/useThemeSettings.ts
```

### Step 2: Import in Your Theme

```typescript
import { useThemeSettings } from '../../../hooks/useThemeSettings';
```

### Step 3: Fetch Settings

```typescript
const YourTheme: React.FC<{ tenantSlug?: string }> = ({ tenantSlug }) => {
  const { settings, loading, error } = useThemeSettings('your-theme-slug', tenantSlug);
  
  // Handle loading state
  if (loading) {
    return <div>Loading settings...</div>;
  }
  
  // Handle error (optional - can use defaults)
  if (error) {
    console.warn('Settings error:', error);
  }
  
  // Extract settings with fallbacks
  const siteName = settings?.branding?.site_name || 'Default Site Name';
  const logo = settings?.branding?.site_logo || '/theme/your-theme/assets/default-logo.png';
  const tagline = settings?.branding?.site_tagline || 'Default Tagline';
  
  return (
    <div>
      <Header siteName={siteName} logo={logo} />
      {/* Rest of theme */}
    </div>
  );
};
```

### Step 4: Apply Styles

If you want to apply styles from the database:

```typescript
const { settings } = useThemeSettings('your-theme-slug', tenantSlug);
const styles = settings?.styles || {};

// Apply styles via inline styles or CSS variables
<div style={{
  backgroundColor: styles.primary,
  color: styles.primaryForeground,
  fontFamily: styles.typography?.fontSans
}}>
  Content
</div>
```

### Step 5: Pass to Child Components

```typescript
<Header 
  tenantName={settings?.branding?.site_name}
  logoSrc={settings?.branding?.site_logo}
  tagline={settings?.branding?.site_tagline}
/>

<Footer 
  tenantName={settings?.branding?.site_name}
  description={settings?.branding?.site_description}
/>
```

## Database Functions

### Core Functions

Located in `sparti-cms/db/modules/branding.js`:

#### `getBrandingSettings(tenantId, themeId)`

Fetches branding, SEO, and localization settings for a tenant+theme.

**Parameters**:
- `tenantId` (string): Tenant identifier
- `themeId` (string, optional): Theme identifier

**Returns**: Object grouped by category
```javascript
{
  branding: { site_name: "...", ... },
  localization: { country: "SG", ... },
  seo: { ... }
}
```

#### `getSiteSettingByKey(key, tenantId, themeId)`

Gets a specific setting by key.

**Parameters**:
- `key` (string): Setting key
- `tenantId` (string): Tenant identifier
- `themeId` (string, optional): Theme identifier

**Returns**: Setting object or null

#### `updateSiteSettingByKey(key, value, type, category, tenantId, themeId)`

Updates or creates a setting.

**Parameters**:
- `key` (string): Setting key
- `value` (string): Setting value
- `type` (string): Setting type ('text', 'json', etc.)
- `category` (string): Setting category
- `tenantId` (string): Tenant identifier
- `themeId` (string, optional): Theme identifier

**Returns**: Updated setting object

#### `updateMultipleBrandingSettings(settings, tenantId, themeId)`

Updates multiple settings in a transaction.

**Parameters**:
- `settings` (object): Key-value pairs of settings
- `tenantId` (string): Tenant identifier
- `themeId` (string, optional): Theme identifier

**Returns**: Boolean (success)

#### `getThemeSettings(tenantId, themeId)`

Gets all settings for a tenant+theme combination.

**Parameters**:
- `tenantId` (string): Tenant identifier
- `themeId` (string, optional): Theme identifier

**Returns**: Object grouped by category

## Settings Priority and Fallback

### Priority Order

When fetching settings, the system uses this priority:

1. **Theme-specific settings** (`theme_id` = current theme)
   - Highest priority
   - Overrides tenant-level settings

2. **Tenant-level settings** (`theme_id` = NULL)
   - Fallback when theme-specific not found
   - Shared across all themes for the tenant

3. **Hardcoded defaults**
   - Final fallback in theme code
   - Ensures theme always renders

### Example Priority Flow

```typescript
// Database query returns:
// 1. theme_id='landingpage', site_name='ACATR' (theme-specific)
// 2. theme_id=NULL, site_name='Default Tenant Name' (tenant-level)

// Result: Uses 'ACATR' (theme-specific takes precedence)
```

## Migration Guide

### Adding Database Settings to Existing Theme

1. **Update theme component**:
   ```typescript
   import { useThemeSettings } from '../../../hooks/useThemeSettings';
   
   const { settings } = useThemeSettings('your-theme-slug');
   ```

2. **Replace hardcoded values**:
   ```typescript
   // Before
   const siteName = 'Hardcoded Name';
   
   // After
   const siteName = settings?.branding?.site_name || 'Default Name';
   ```

3. **Add loading states**:
   ```typescript
   if (loading) return <LoadingSpinner />;
   ```

4. **Test with database**:
   - Create settings in Admin → Settings
   - Verify theme reads them correctly
   - Test fallbacks when settings missing

## Example: Complete Integration

### Theme Component

```typescript
import React from 'react';
import { useThemeSettings } from '../../../hooks/useThemeSettings';
import Header from './components/Header';
import Footer from './components/Footer';
import './theme.css';

interface ThemeProps {
  tenantSlug?: string;
}

const YourTheme: React.FC<ThemeProps> = ({ tenantSlug }) => {
  const { settings, loading, error } = useThemeSettings('your-theme-slug', tenantSlug);
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  // Extract with fallbacks
  const branding = settings?.branding || {};
  const localization = settings?.localization || {};
  const styles = settings?.styles || {};
  
  const siteName = branding.site_name || 'Your Site';
  const logo = branding.site_logo || '/theme/your-theme/assets/logo.png';
  const tagline = branding.site_tagline || 'Your Tagline';
  const description = branding.site_description || 'Your Description';
  
  return (
    <div className="theme-container">
      <Header 
        siteName={siteName}
        logo={logo}
        tagline={tagline}
      />
      
      <main>
        {/* Your theme content */}
      </main>
      
      <Footer 
        siteName={siteName}
        description={description}
      />
    </div>
  );
};

export default YourTheme;
```

## Troubleshooting

### Settings Not Loading

**Problem**: Theme shows default values instead of database settings

**Solutions**:
1. Check API endpoint is accessible: `/api/v1/theme/{themeSlug}/settings`
2. Verify tenant context is correct (check subdomain/headers)
3. Check browser console for API errors
4. Verify settings exist in database for tenant+theme
5. Check `is_public` flag is true for public API access

### Settings Not Saving

**Problem**: Changes in admin don't persist

**Solutions**:
1. Verify `themeId` is included in API request
2. Check database migration ran successfully
3. Verify unique constraint allows the combination
4. Check API response for errors
5. Verify user has permission to update settings

### Theme Shows Wrong Settings

**Problem**: Theme shows settings from different tenant/theme

**Solutions**:
1. Verify `tenantSlug` parameter is correct
2. Check tenant context in API request
3. Verify `theme_id` in database matches theme slug
4. Check settings priority (theme-specific vs tenant-level)

### Performance Issues

**Problem**: Theme loads slowly due to settings fetch

**Solutions**:
1. Use React Query caching (already implemented in hook)
2. Consider server-side rendering for initial load
3. Cache settings in localStorage (optional)
4. Use `useThemeBranding` or `useThemeStyles` for specific needs

## Best Practices

### 1. Always Provide Fallbacks

```typescript
// ✅ Good
const siteName = settings?.branding?.site_name || 'Default Name';

// ❌ Bad
const siteName = settings.branding.site_name; // May be undefined
```

### 2. Handle Loading States

```typescript
if (loading) {
  return <LoadingSpinner />;
}
```

### 3. Use Specific Hooks When Possible

```typescript
// For branding only
const { branding } = useThemeBranding('theme-slug');

// For styles only
const { styles } = useThemeStyles('theme-slug');
```

### 4. Cache Settings Locally (Optional)

```typescript
// Cache in localStorage for offline support
useEffect(() => {
  if (settings) {
    localStorage.setItem('theme-settings', JSON.stringify(settings));
  }
}, [settings]);
```

### 5. Validate Settings

```typescript
// Validate critical settings
if (!settings?.branding?.site_name) {
  console.warn('Site name not found, using default');
}
```

## Database Migration

### Running the Migration

```bash
cd sparti-cms/db/sequelize
node run-migrations.js
```

Or using Sequelize CLI:
```bash
npx sequelize-cli db:migrate --config config.js
```

### Migration File

**Location**: `sparti-cms/db/sequelize/migrations/20241225000001-add-theme-id-to-site-settings.js`

**What it does**:
- Adds `theme_id` column to `site_settings`
- Adds `tenant_id` column if missing (backward compatibility)
- Creates unique constraint on `(setting_key, tenant_id, theme_id)`
- Adds performance indexes
- Sets existing records to `theme_id = NULL`

### Rollback

```bash
npx sequelize-cli db:migrate:undo --config config.js
```

## Related Documentation

- **[Theme README](./README.md)** - Main theme system documentation
- **[Theme Styles Guide](./THEME-STYLES.md)** - CSS and styling system
- **[Template README](../template/landingpage/README.md)** - Template structure

## Support

For issues or questions:
1. Check this documentation
2. Review `landingpage` theme implementation
3. Check database migration logs
4. Verify API endpoints are accessible
5. Test with browser dev tools network tab

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Status**: Production Ready
