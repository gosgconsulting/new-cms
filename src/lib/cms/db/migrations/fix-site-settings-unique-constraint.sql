-- Migration: Fix site_settings unique constraint to include theme_id
-- This fixes the issue where brand settings cannot be saved due to constraint mismatch

-- Step 1: Clean up duplicate records (keep the most recent one for each unique combination)
-- This handles the case where duplicates exist due to the old constraint
DELETE FROM site_settings
WHERE id NOT IN (
    SELECT DISTINCT ON (setting_key, COALESCE(tenant_id, ''), COALESCE(theme_id, '')) id
    FROM site_settings
    ORDER BY setting_key, COALESCE(tenant_id, ''), COALESCE(theme_id, ''), updated_at DESC, id DESC
);

-- Step 2: Drop the old unique constraint that doesn't include theme_id
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'site_settings_setting_key_tenant_id_key'
    ) THEN
        ALTER TABLE site_settings DROP CONSTRAINT site_settings_setting_key_tenant_id_key;
        RAISE NOTICE 'Dropped old unique constraint site_settings_setting_key_tenant_id_key';
    END IF;
END $$;

-- Step 3: Drop any existing COALESCE-based unique index if it exists (in case of partial migration)
DROP INDEX IF EXISTS site_settings_setting_key_tenant_theme_unique;

-- Step 4: Drop the standard UNIQUE constraint if it exists (from create-site-settings-schema.sql)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'site_settings_setting_key_tenant_id_theme_id_key'
    ) THEN
        ALTER TABLE site_settings DROP CONSTRAINT site_settings_setting_key_tenant_id_theme_id_key;
        RAISE NOTICE 'Dropped standard UNIQUE constraint site_settings_setting_key_tenant_id_theme_id_key';
    END IF;
END $$;

-- Step 5: Create the new unique index with COALESCE to handle NULL values properly
-- This allows:
--   - Master settings: tenant_id = NULL, theme_id = NULL (shared across all tenants)
--   - Tenant settings: tenant_id = 'tenant-xxx', theme_id = NULL (tenant-specific)
--   - Theme settings: tenant_id = 'tenant-xxx', theme_id = 'theme-xxx' (theme-specific)
CREATE UNIQUE INDEX IF NOT EXISTS site_settings_setting_key_tenant_theme_unique 
ON site_settings (setting_key, COALESCE(tenant_id, ''), COALESCE(theme_id, ''));

-- Step 6: Verify the index was created
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'site_settings_setting_key_tenant_theme_unique'
    ) THEN
        RAISE NOTICE 'Successfully created unique index site_settings_setting_key_tenant_theme_unique';
    ELSE
        RAISE EXCEPTION 'Failed to create unique index';
    END IF;
END $$;

