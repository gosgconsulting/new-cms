# Tenant-Specific Stripe Configuration

This document describes the multi-tenant Stripe configuration system that allows each tenant to use their own Stripe account.

## Overview

Previously, all tenants shared a single Stripe account configured via environment variables (`STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`). Now, each tenant can have their own Stripe configuration stored in the database.

## Database Schema

### New Columns in `tenants` Table

- `stripe_secret_key` (TEXT, nullable) - Tenant-specific Stripe secret key
- `stripe_webhook_secret` (TEXT, nullable) - Tenant-specific Stripe webhook secret

**Migration:** `20250122000001-add-tenant-stripe-keys.js`

## Architecture

### Helper Functions

1. **`getTenantStripe(tenantId)`** - Gets or creates a Stripe instance for a specific tenant
   - Checks cache first for performance
   - Falls back to global `STRIPE_SECRET_KEY` for backward compatibility
   - Returns `null` if no Stripe key is configured

2. **`getTenantWebhookSecret(tenantId)`** - Gets tenant's webhook secret
   - Falls back to global `STRIPE_WEBHOOK_SECRET` for backward compatibility

### Caching

Stripe instances are cached in memory (`stripeInstances` Map) to avoid creating new instances on every request. The cache is cleared when a tenant's Stripe key is updated.

## API Endpoints

### Update Tenant Stripe Configuration

```http
PUT /api/shop/stripe/config
Authorization: Bearer <token>
X-Tenant-API-Key: <tenant-api-key>

{
  "stripe_secret_key": "sk_test_...",
  "stripe_webhook_secret": "whsec_..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Stripe configuration updated successfully"
}
```

### Get Tenant Stripe Configuration

```http
GET /api/shop/stripe/config
Authorization: Bearer <token>
X-Tenant-API-Key: <tenant-api-key>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "has_stripe_secret_key": true,
    "has_stripe_webhook_secret": true,
    "stripe_connect_account_id": "acct_...",
    "stripe_connect_onboarding_completed": true
  }
}
```

**Note:** The actual secret keys are never returned for security reasons.

## Backward Compatibility

The system maintains backward compatibility:

1. **Global Stripe Key:** If a tenant doesn't have `stripe_secret_key` set, the system falls back to `STRIPE_SECRET_KEY` environment variable
2. **Global Webhook Secret:** If a tenant doesn't have `stripe_webhook_secret` set, the system falls back to `STRIPE_WEBHOOK_SECRET` environment variable
3. **Legacy Global Instance:** The global `stripe` instance is still available but deprecated

## Usage in Code

### Before (Global Stripe)
```javascript
if (stripe) {
  const account = await stripe.accounts.retrieve(accountId);
}
```

### After (Tenant-Specific)
```javascript
const stripe = await getTenantStripe(tenantId);
if (stripe) {
  const account = await stripe.accounts.retrieve(accountId);
}
```

## Webhook Handling

The webhook handler now supports tenant-specific webhooks:

1. First tries to verify with global webhook secret (backward compatibility)
2. If that fails, identifies the tenant from the account ID
3. Verifies with the tenant's specific webhook secret
4. Updates the correct tenant's onboarding status

## Security Considerations

1. **Encryption:** Stripe keys should be encrypted at rest (consider using encryption before storing in database)
2. **Access Control:** Only authenticated users with tenant API keys can update Stripe configuration
3. **No Exposure:** Secret keys are never returned in API responses
4. **Validation:** Stripe keys should be validated before storing (format: `sk_test_...` or `sk_live_...`)

## Migration Guide

### For Existing Tenants

1. **Option 1:** Keep using global Stripe keys (no changes needed)
2. **Option 2:** Migrate to tenant-specific keys:
   ```sql
   UPDATE tenants 
   SET stripe_secret_key = 'sk_test_...'
   WHERE id = 'tenant-id';
   ```

### For New Tenants

Set tenant-specific Stripe keys when creating the tenant or via the API:

```javascript
PUT /api/shop/stripe/config
{
  "stripe_secret_key": "sk_test_...",
  "stripe_webhook_secret": "whsec_..."
}
```

## Testing

The test database migration should be run:

```bash
npm run sequelize:migrate
```

Verify the columns exist:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tenants' 
  AND column_name IN ('stripe_secret_key', 'stripe_webhook_secret');
```

## Future Enhancements

1. **Encryption:** Add encryption/decryption for stored Stripe keys
2. **Key Rotation:** Add support for key rotation without downtime
3. **Validation:** Add Stripe key format validation
4. **UI:** Add admin UI for managing tenant Stripe keys
5. **Audit Logging:** Log when Stripe keys are updated
