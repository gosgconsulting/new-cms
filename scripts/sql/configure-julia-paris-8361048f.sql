-- Configure WooCommerce for Julia Paris B2B Tenant
-- Tenant ID: tenant-8361048f
-- Run this script to activate WooCommerce integration and set e-shop provider

-- Step 1: Verify tenant exists
SELECT id, name, slug, created_at
FROM tenants
WHERE id = 'tenant-8361048f';

-- Step 2: Activate WooCommerce integration
INSERT INTO tenant_integrations (tenant_id, integration_type, is_active, config)
VALUES (
  'tenant-8361048f',
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

-- Step 3: Set e-shop provider to WooCommerce
INSERT INTO site_settings (setting_key, setting_value, setting_type, setting_category, tenant_id, is_public)
VALUES (
  'shop_eshop_provider',
  'woocommerce',
  'text',
  'shop',
  'tenant-8361048f',
  false
)
ON CONFLICT (setting_key, tenant_id, theme_id)
DO UPDATE SET
  setting_value = 'woocommerce',
  updated_at = NOW();

-- Step 4: Verify configuration
SELECT 
  ti.tenant_id,
  t.name as tenant_name,
  ti.integration_type,
  ti.is_active,
  ti.config->>'store_url' as store_url,
  ti.config->>'api_version' as api_version,
  ss.setting_value as eshop_provider,
  ti.created_at,
  ti.updated_at
FROM tenant_integrations ti
JOIN tenants t ON ti.tenant_id = t.id
LEFT JOIN site_settings ss ON ss.tenant_id = ti.tenant_id 
  AND ss.setting_key = 'shop_eshop_provider'
WHERE ti.tenant_id = 'tenant-8361048f'
  AND ti.integration_type = 'woocommerce';

-- Expected result:
-- is_active should be true
-- eshop_provider should be 'woocommerce'
-- store_url should be 'https://cms.juliaparis.fr'
