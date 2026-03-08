# Stripe Connect - "Connect Stripe Account" Button

## 🎉 Implementation Complete!

The "Connect Stripe Account" button in your CMS shop is fully implemented and ready to use.

## 📍 Where to Find It

**Location:** CMS Admin → Shop (sidebar) → Settings → General tab

Or: Shop → Settings → Stripe Connect tab

## 🚀 Quick Start (5 Minutes)

### 1. Get Your Stripe API Key

Visit: https://dashboard.stripe.com/test/apikeys

Copy your **Secret key** (starts with `sk_test_...`)

### 2. Update .env File

Open `.env` and replace the placeholder:

```bash
# Replace this:
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key_here"

# With your actual key:
STRIPE_SECRET_KEY="sk_test_51ABC..."
```

### 3. Restart Your Server

```bash
npm run dev
```

### 4. Test It!

1. Log in to CMS admin
2. Go to Shop → Settings → General
3. Click "Connect Stripe Account"
4. Complete the Stripe onboarding
5. You'll see "Connected" status ✅

## 📚 Documentation

- **Quick Start:** `STRIPE_SETUP_QUICK_START.md` (5-minute guide)
- **Full Setup Guide:** `docs/setup/STRIPE_CONNECT_SETUP.md` (comprehensive)
- **Implementation Summary:** `STRIPE_CONNECT_IMPLEMENTATION_SUMMARY.md` (technical details)

## 🧪 Test Your Setup

Run the automated test suite:

```bash
node scripts/tests/test-stripe-connect.js
```

This will verify:
- ✅ Environment variables are set
- ✅ Stripe API connection works
- ✅ Database schema is correct
- ✅ All required files exist

## ✅ What's Already Done

- ✅ Frontend UI (button, status, error handling)
- ✅ Backend API (account creation, onboarding, webhooks)
- ✅ Database schema (Stripe columns added)
- ✅ Environment configuration (templates added)
- ✅ Documentation (3 comprehensive guides)
- ✅ Test suite (automated verification)

## ⏳ What You Need to Do

1. Add your Stripe API key to `.env`
2. Restart the server
3. Test the button

That's it! 🎉

## 🔧 Helper Scripts

```bash
# Add Stripe config to .env
node scripts/setup/add-stripe-env.js

# Verify database schema
node scripts/setup/verify-stripe-columns.js

# Run integration tests
node scripts/tests/test-stripe-connect.js
```

## 🐛 Troubleshooting

### Error: "Stripe is not configured"
→ Add `STRIPE_SECRET_KEY` to `.env` and restart

### Wrong redirect URL
→ Update `FRONTEND_URL` in `.env`

### Status doesn't update
→ Set up webhook or click "Refresh Status"

See full troubleshooting guide in `docs/setup/STRIPE_CONNECT_SETUP.md`

## 🎯 How It Works

```
User clicks button → Backend creates Stripe account → 
User redirected to Stripe → Completes onboarding → 
Redirected back to CMS → Status shows "Connected" ✅
```

## 📁 Files Modified/Created

### Modified:
- `.env` - Added Stripe configuration
- `.env.example` - Added documentation

### Created:
- `README_STRIPE_CONNECT.md` (this file)
- `STRIPE_SETUP_QUICK_START.md`
- `STRIPE_CONNECT_IMPLEMENTATION_SUMMARY.md`
- `docs/setup/STRIPE_CONNECT_SETUP.md`
- `scripts/setup/add-stripe-env.js`
- `scripts/setup/update-env-example.js`
- `scripts/setup/verify-stripe-columns.js`
- `scripts/tests/test-stripe-connect.js`

### Existing (No Changes):
- `sparti-cms/components/admin/ShopSettingsManager.tsx`
- `server/routes/shop.js`
- `sparti-cms/db/sequelize/migrations/20241226000001-create-ecommerce-tables.js`

## 🔐 Security Notes

- Never commit `.env` to git (already in `.gitignore`)
- Use test mode keys for development
- Switch to live mode keys for production
- Enable webhook signature verification

## 📞 Support

**Documentation:**
- Quick: `STRIPE_SETUP_QUICK_START.md`
- Full: `docs/setup/STRIPE_CONNECT_SETUP.md`

**Test Command:**
```bash
node scripts/tests/test-stripe-connect.js
```

**Stripe Resources:**
- Dashboard: https://dashboard.stripe.com
- Docs: https://stripe.com/docs/connect
- Support: https://support.stripe.com

---

**Status:** ✅ Ready to use (add API key and test)  
**Implementation Date:** 2026-01-19  
**Next Step:** Add your Stripe API key to `.env`
