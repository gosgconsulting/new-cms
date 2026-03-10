# Database Migrations

This directory contains SQL migration files and scripts for the Sparti CMS database schema.

## Quick Fix: Check and Fix Schema

If you're getting "not valid JSON" errors when saving styles, the database schema might be missing required columns. Run this script to automatically check and fix the schema:

```bash
node sparti-cms/db/migrations/check-and-fix-schema.js
```

This script will:
- Check if the `site_settings` table exists
- Add missing columns (`tenant_id`, `theme_id`, `setting_category`, `is_public`)
- Create required indexes
- Set up the unique constraint
- Update existing records with default values

## Running Migrations

### Option 1: Using the Check and Fix Script (Recommended)

```bash
node sparti-cms/db/migrations/check-and-fix-schema.js
```

### Option 2: Using psql (PostgreSQL command line)

```bash
psql -U your_username -d your_database -f create-site-settings-schema.sql
```

### Option 3: Using Node.js Migration Script

```bash
node sparti-cms/db/migrations/run-migration.js
```

### Option 4: Manual SQL Execution

```javascript
import { query } from './db/index.js';
import fs from 'fs';
const sql = fs.readFileSync('create-site-settings-schema.sql', 'utf8');
await query(sql);
```

## Migration Files

### `create-site-settings-schema.sql`

Creates or updates the `site_settings` table with all required columns for theme styles:

- **Columns**: `id`, `setting_key`, `setting_value`, `setting_type`, `setting_category`, `is_public`, `tenant_id`, `theme_id`, `created_at`, `updated_at`
- **Unique Constraint**: `(setting_key, tenant_id, theme_id)` - Allows same key for different tenant+theme combinations
- **Indexes**: 
  - `idx_site_settings_tenant_theme` on `(tenant_id, theme_id)`
  - `idx_site_settings_theme_id` on `(theme_id)`
  - `idx_site_settings_category` on `(setting_category)`

This migration is idempotent - it can be run multiple times safely.

## Schema for Theme Styles

The `theme_styles` setting is stored as JSON in the `setting_value` column:

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

## Example Queries

### Get theme styles for a specific tenant and theme

```sql
SELECT setting_value 
FROM site_settings 
WHERE setting_key = 'theme_styles' 
  AND tenant_id = 'tenant-gosg' 
  AND theme_id = 'landingpage';
```

### Update theme styles

```sql
UPDATE site_settings 
SET setting_value = '{"primary": "#f97316", ...}',
    setting_type = 'json',
    setting_category = 'theme',
    updated_at = CURRENT_TIMESTAMP
WHERE setting_key = 'theme_styles' 
  AND tenant_id = 'tenant-gosg' 
  AND theme_id = 'landingpage';
```
