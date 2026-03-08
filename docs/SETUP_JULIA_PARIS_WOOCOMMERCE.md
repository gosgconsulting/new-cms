# WooCommerce Setup for Julia Paris B2B

**Tenant ID:** `tenant-8361048f`

## Quick Setup (3 Steps)

### Step 1: Run SQL Configuration

Run the SQL script to activate WooCommerce:

```bash
# Using psql
psql -d your_database -f scripts/sql/configure-julia-paris-8361048f.sql

# Or copy and paste the SQL from scripts/sql/configure-julia-paris-8361048f.sql
```

This will:
- Activate WooCommerce integration
- Set e-shop provider to WooCommerce
- Configure credentials

### Step 2: Sync Products

**Option A: Using Admin UI (Easiest)**
1. Go to **Developer** → **Integrations** → **WooCommerce**
2. Click **"Sync Products"** button
3. Wait for sync to complete

**Option B: Using API**
```bash
# Get your tenant API key first, then:
curl -X POST "http://localhost:4173/api/woocommerce/sync/products" \
  -H "X-API-Key: YOUR_TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"page": 1, "per_page": 50, "status": "publish"}'
```

**Option C: Using Script**
```bash
# Set AUTH_TOKEN if needed
export AUTH_TOKEN=your_token_here
node scripts/sync-julia-paris-products.js
```

### Step 3: Verify

1. Go to **Shop** → **Products** page
2. You should see all synced products from WooCommerce
3. Products are stored in both `products` and `pern_products` tables

## SQL Script (Quick Copy-Paste)

```sql
-- Activate WooCommerce integration
INSERT INTO tenant_integrations (tenant_id, integration_type, is_active, config)
VALUES (
  'tenant-8361048f',
  'woocommerce',
  true,
  '{
    "store_url": "https://cms.juliaparis.fr",
    "consumer_key": "ck_39475d128c1bd7262eb3f6635ee761cc207b57a8",
    "consumer_secret": "cs_257b9bd0af45c286958327ac9dc1d92b0ac00f3a",
    "api_version": "wc/v3"
  }'::jsonb
)
ON CONFLICT (tenant_id, integration_type)
DO UPDATE SET is_active = true, config = EXCLUDED.config, updated_at = NOW();

-- Set e-shop provider to WooCommerce
INSERT INTO site_settings (setting_key, setting_value, setting_type, setting_category, tenant_id, is_public)
VALUES ('shop_eshop_provider', 'woocommerce', 'text', 'shop', 'tenant-8361048f', false)
ON CONFLICT (setting_key, tenant_id, theme_id)
DO UPDATE SET setting_value = 'woocommerce', updated_at = NOW();
```

## Verification

After running the SQL, verify with:

```sql
SELECT 
  ti.is_active,
  ti.config->>'store_url' as store_url,
  ss.setting_value as eshop_provider
FROM tenant_integrations ti
LEFT JOIN site_settings ss ON ss.tenant_id = ti.tenant_id 
  AND ss.setting_key = 'shop_eshop_provider'
WHERE ti.tenant_id = 'tenant-8361048f'
  AND ti.integration_type = 'woocommerce';
```

Expected result:
- `is_active` = `true`
- `eshop_provider` = `woocommerce`
- `store_url` = `https://cms.juliaparis.fr`

## Troubleshooting

- **Integration shows inactive**: Run the SQL script again
- **Products not syncing**: Check WooCommerce credentials in the SQL
- **Products not showing**: Make sure e-shop provider is set to 'woocommerce'
