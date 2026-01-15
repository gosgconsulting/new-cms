-- Configure WooCommerce Integration for Julia Paris B2B Tenant
-- Run this script after finding the tenant ID

-- Step 1: Find the Julia Paris B2B tenant ID
SELECT id, name, slug 
FROM tenants 
WHERE LOWER(name) LIKE '%julia%paris%b2b%' 
   OR LOWER(name) LIKE '%julia paris b2b%'
   OR id LIKE '%julia%paris%b2b%';

-- Step 2: Replace 'TENANT_ID_HERE' with the actual tenant ID from Step 1
-- Then run the INSERT/UPDATE statement below:

-- Configure WooCommerce integration
INSERT INTO tenant_integrations (tenant_id, integration_type, is_active, config)
VALUES (
  'TENANT_ID_HERE',  -- Replace with actual tenant ID
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

-- Step 3: Verify the configuration
SELECT 
  ti.tenant_id,
  t.name as tenant_name,
  ti.integration_type,
  ti.is_active,
  ti.config->>'store_url' as store_url,
  ti.config->>'api_version' as api_version,
  ti.created_at,
  ti.updated_at
FROM tenant_integrations ti
JOIN tenants t ON ti.tenant_id = t.id
WHERE ti.tenant_id = 'TENANT_ID_HERE'  -- Replace with actual tenant ID
  AND ti.integration_type = 'woocommerce';
