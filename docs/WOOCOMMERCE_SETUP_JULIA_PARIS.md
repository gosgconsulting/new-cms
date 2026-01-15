# WooCommerce Setup for Julia Paris B2B

## Quick Setup Guide

### Step 1: Configure WooCommerce Integration

Run this SQL script (replace `TENANT_ID` with Julia Paris B2B tenant ID):

```sql
-- Find tenant ID first
SELECT id, name FROM tenants WHERE LOWER(name) LIKE '%julia%paris%b2b%';

-- Activate WooCommerce integration
INSERT INTO tenant_integrations (tenant_id, integration_type, is_active, config)
VALUES (
  'YOUR_TENANT_ID',
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
VALUES ('shop_eshop_provider', 'woocommerce', 'text', 'shop', 'YOUR_TENANT_ID', false)
ON CONFLICT (setting_key, tenant_id, theme_id)
DO UPDATE SET setting_value = 'woocommerce', updated_at = NOW();
```

### Step 2: Sync Products

**Option A: Using Admin UI (Recommended)**
1. Go to **Developer** → **Integrations** → **WooCommerce**
2. Click **"Sync Products"** button
3. Products will be synced from WooCommerce to your database

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
node scripts/sync-woocommerce-products.js YOUR_TENANT_ID
```

### Step 3: Verify Products

1. Go to **Shop** → **Products** page
2. You should see all synced products from WooCommerce
3. Products are stored in both `products` and `pern_products` tables for compatibility

## How It Works

- **E-shop Provider Setting**: Controls which data source to use
  - `sparti` (default): Uses local database (`pern_products` table)
  - `woocommerce`: Uses WooCommerce API or synced products from `products` table

- **Product Sync**: 
  - Syncs products from WooCommerce to `products` table (with variants, categories)
  - Also syncs to `pern_products` table for compatibility with ProductsManager
  - Products are linked by `external_id` and `external_source = 'woocommerce'`

- **Product Display**:
  - When WooCommerce is selected, products are fetched from synced database
  - If no synced products exist, fetches directly from WooCommerce API (transformed format)
  - Products appear in the Products page with all details

## Troubleshooting

1. **Products not showing**: 
   - Check if WooCommerce integration is active
   - Verify e-shop provider is set to 'woocommerce'
   - Run product sync

2. **Sync fails**:
   - Verify WooCommerce credentials are correct
   - Check store URL is accessible
   - Ensure WooCommerce REST API is enabled

3. **Products show but wrong format**:
   - Products are automatically transformed to match expected format
   - Check browser console for any errors
