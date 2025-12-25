-- Migration: Create or Update site_settings table for theme styles
-- This ensures the table has all required columns for theme-specific settings

-- Create site_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS site_settings (
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

-- Add tenant_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'site_settings' AND column_name = 'tenant_id'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN tenant_id VARCHAR(255);
    RAISE NOTICE 'Added tenant_id column to site_settings';
  END IF;
END $$;

-- Add theme_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'site_settings' AND column_name = 'theme_id'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN theme_id VARCHAR(255);
    RAISE NOTICE 'Added theme_id column to site_settings';
  END IF;
END $$;

-- Add setting_category column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'site_settings' AND column_name = 'setting_category'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN setting_category VARCHAR(100) DEFAULT 'general';
    RAISE NOTICE 'Added setting_category column to site_settings';
  END IF;
END $$;

-- Add is_public column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'site_settings' AND column_name = 'is_public'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN is_public BOOLEAN DEFAULT false;
    RAISE NOTICE 'Added is_public column to site_settings';
  END IF;
END $$;

-- Drop old unique constraint on setting_key if it exists (without tenant_id/theme_id)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'site_settings_setting_key_key'
  ) THEN
    ALTER TABLE site_settings DROP CONSTRAINT site_settings_setting_key_key;
    RAISE NOTICE 'Dropped old unique constraint on setting_key';
  END IF;
END $$;

-- Create unique constraint on (setting_key, tenant_id, theme_id) if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'site_settings_setting_key_tenant_id_theme_id_key'
  ) THEN
    ALTER TABLE site_settings 
    ADD CONSTRAINT site_settings_setting_key_tenant_id_theme_id_key 
    UNIQUE (setting_key, tenant_id, theme_id);
    RAISE NOTICE 'Created unique constraint on (setting_key, tenant_id, theme_id)';
  END IF;
END $$;

-- Create index on tenant_id and theme_id for better query performance
CREATE INDEX IF NOT EXISTS idx_site_settings_tenant_theme 
ON site_settings(tenant_id, theme_id);

-- Create index on theme_id for theme-specific queries
CREATE INDEX IF NOT EXISTS idx_site_settings_theme_id 
ON site_settings(theme_id);

-- Create index on setting_category for category-based queries
CREATE INDEX IF NOT EXISTS idx_site_settings_category 
ON site_settings(setting_category);

-- Update existing records to have default tenant_id if null
UPDATE site_settings 
SET tenant_id = 'tenant-gosg' 
WHERE tenant_id IS NULL;

-- Add comment to table
COMMENT ON TABLE site_settings IS 'Stores theme and tenant configuration settings, including theme styles (JSON)';
COMMENT ON COLUMN site_settings.setting_key IS 'Unique identifier for the setting (e.g., theme_styles, site_name)';
COMMENT ON COLUMN site_settings.setting_value IS 'The actual setting value (can be JSON string for theme_styles)';
COMMENT ON COLUMN site_settings.setting_type IS 'Type: text, json, media, textarea';
COMMENT ON COLUMN site_settings.setting_category IS 'Category: branding, localization, theme, seo, general';
COMMENT ON COLUMN site_settings.is_public IS 'Whether setting is accessible via public API';
COMMENT ON COLUMN site_settings.tenant_id IS 'Tenant identifier (allows multi-tenant support)';
COMMENT ON COLUMN site_settings.theme_id IS 'Theme identifier (allows theme-specific settings, NULL for tenant-level)';


