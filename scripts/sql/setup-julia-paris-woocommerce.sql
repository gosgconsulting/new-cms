-- Complete WooCommerce Setup for Julia Paris B2B Tenant
-- This script:
-- 1. Activates WooCommerce integration
-- 2. Sets e-shop provider to WooCommerce
-- 3. Ready for product sync

-- Step 1: Find the Julia Paris B2B tenant ID
-- Run this first to get the tenant ID:
SELECT id, name, slug 
FROM tenants 
WHERE LOWER(name) LIKE '%julia%paris%b2b%' 
   OR LOWER(name) LIKE '%julia paris b2b%'
   OR id LIKE '%julia%paris%b2b%'
   OR slug LIKE '%julia%paris%b2b%'
ORDER BY created_at DESC
LIMIT 5;

-- Step 2: Replace 'TENANT_ID_HERE' below with the actual tenant ID from Step 1
-- Then run the following statements:

-- Activate WooCommerce integration
INSERT INTO tenant_integrations (tenant_id, integration_type, is_active, config)
VALUES (
  'TENANT_ID_HERE',  -- ⚠️ REPLACE THIS with the actual tenant ID
  'woocommerce',
  true,
  '{
    "store_url": "https://cms.juliaparis.fr",
    "consumer_key": "ck_39475d128c1bd7262eb3f6635ee761cc207b57a8",
    "consumer_secret": "cs_257b9bd0af45c286958327ac9dc1d92b0ac00f3a",
    "api_version": "wc/v3",
    "last_sync_at": null,
    "sync_settings": {
      "auto_sync": false,
      "sync_interval": "daily"
    }
  }'::jsonb
)
ON CONFLICT (tenant_id, integration_type)
DO UPDATE SET
  is_active = true,
  config = EXCLUDED.config,
  updated_at = NOW();

-- Set e-shop provider to WooCommerce
INSERT INTO site_settings (setting_key, setting_value, setting_type, setting_category, tenant_id, is_public)
VALUES (
  'shop_eshop_provider',
  'woocommerce',
  'text',
  'shop',
  'TENANT_ID_HERE',  -- ⚠️ REPLACE THIS with the actual tenant ID
  false
)
ON CONFLICT (setting_key, tenant_id, theme_id)
DO UPDATE SET
  setting_value = 'woocommerce',
  updated_at = NOW();

-- Step 3: Verify the configuration
SELECT 
  ti.tenant_id,
  t.name as tenant_name,
  ti.integration_type,
  ti.is_active,
  ti.config->>'store_url' as store_url,
  ss.setting_value as eshop_provider
FROM tenant_integrations ti
JOIN tenants t ON ti.tenant_id = t.id
LEFT JOIN site_settings ss ON ss.tenant_id = ti.tenant_id AND ss.setting_key = 'shop_eshop_provider'
WHERE ti.tenant_id = 'TENANT_ID_HERE'  -- ⚠️ REPLACE THIS with the actual tenant ID
  AND ti.integration_type = 'woocommerce';

-- Expected result:
-- is_active should be true
-- eshop_provider should be 'woocommerce'
