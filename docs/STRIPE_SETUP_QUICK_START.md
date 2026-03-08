# Stripe Connect - Quick Start Guide

## What Was Done

The "Connect Stripe Account" button in your CMS shop is **fully implemented** and ready to use. This guide shows you how to configure it.

## Quick Setup (5 minutes)

### 1. Get Stripe API Key

1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy your **Secret key** (starts with `sk_test_...`)

### 2. Update Environment Variables

Your `.env` file has been updated with placeholders. Replace these values:

```bash
# Replace this placeholder with your actual key
STRIPE_SECRET_KEY="sk_test_your_actual_key_here"

# Optional: Add webhook secret later
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret_here"

# Verify this matches your deployment URL
FRONTEND_URL="https://cms.sparti.ai"
```

### 3. Restart Server

```bash
npm run dev
# or in production
npm start
```

### 4. Test It

1. Log in to CMS admin
2. Go to **Shop → Settings → General** tab
3. Click **Connect Stripe Account**
4. Complete Stripe onboarding
5. You'll be redirected back with "Connected" status

## What's Already Built

✅ **Frontend UI**: Button, status display, error handling  
✅ **Backend API**: Account creation, onboarding links, status checks  
✅ **Database**: Stripe columns added to tenants table  
✅ **Environment**: Configuration templates added  

## Files Modified

- `.env` - Added Stripe configuration
- `.env.example` - Added Stripe documentation
- `scripts/setup/add-stripe-env.js` - Helper script (new)
- `scripts/setup/verify-stripe-columns.js` - Verification script (new)
- `docs/setup/STRIPE_CONNECT_SETUP.md` - Full setup guide (new)

## Where to Find the Button

**Location**: CMS Admin → Shop (sidebar) → Settings → General tab

Or: Shop → Settings → Stripe Connect tab

## How It Works

1. User clicks "Connect Stripe Account"
2. System creates Stripe Express account (if needed)
3. User is redirected to Stripe onboarding
4. User completes business details and bank info
5. Stripe redirects back to CMS
6. Status updates to "Connected"

## Optional: Set Up Webhook

For real-time status updates:

1. Go to https://dashboard.stripe.com/test/webhooks
2. Add endpoint: `https://cms.sparti.ai/api/shop/stripe/webhook`
3. Listen for: `account.updated`
4. Copy webhook secret to `.env`

## Troubleshooting

**Error: "Stripe is not configured"**
- Add `STRIPE_SECRET_KEY` to `.env` and restart

**Wrong redirect URL**
- Update `FRONTEND_URL` in `.env`

**Status doesn't update**
- Set up webhook or click "Refresh Status" button

## Next Steps

1. Replace placeholder API key with real key
2. Test the flow in test mode
3. Set up webhook (optional)
4. Switch to live mode for production

## Full Documentation

See `docs/setup/STRIPE_CONNECT_SETUP.md` for detailed setup instructions.

## Code References

- Frontend: `sparti-cms/components/admin/ShopSettingsManager.tsx`
- Backend: `server/routes/shop.js` (lines 1673-1855)
- Migration: `sparti-cms/db/sequelize/migrations/20241226000001-create-ecommerce-tables.js`
