# Stripe Connect Setup Guide

This guide walks you through setting up Stripe Connect for your CMS shop to enable the "Connect Stripe Account" button functionality.

## Prerequisites

- A Stripe account (sign up at https://stripe.com if you don't have one)
- Access to your Stripe Dashboard
- Your application deployed and accessible (or running locally for testing)

## Step 1: Get Your Stripe API Keys

1. Log in to your Stripe Dashboard: https://dashboard.stripe.com
2. Navigate to **Developers → API keys**
3. You'll see two types of keys:
   - **Test mode keys** (for development/testing)
   - **Live mode keys** (for production)

### For Development/Testing:

1. Toggle to **Test mode** (switch in the top right)
2. Copy your **Secret key** (starts with `sk_test_...`)
3. Add it to your `.env` file:
   ```bash
   STRIPE_SECRET_KEY="sk_test_51..."
   ```

### For Production:

1. Toggle to **Live mode**
2. Copy your **Secret key** (starts with `sk_live_...`)
3. Add it to your production environment variables

## Step 2: Enable Stripe Connect

1. In your Stripe Dashboard, navigate to **Connect → Settings**
2. If Connect is not enabled, click **Get started with Connect**
3. Choose **Express** as your account type:
   - Express accounts provide a simplified onboarding experience
   - Your platform handles most of the complexity
   - Connected accounts get their own Stripe Dashboard access

### Configure Connect Settings:

1. **Branding**:
   - Upload your platform logo
   - Set your brand color
   - Add your platform name

2. **Business Details**:
   - Add your business information
   - Set your support email
   - Configure your terms of service URL

3. **Express Dashboard Settings**:
   - Enable/disable features your connected accounts can access
   - Configure payout settings
   - Set notification preferences

## Step 3: Set Up Webhook Endpoint (Optional but Recommended)

Webhooks allow Stripe to notify your application when events occur (like when onboarding is completed).

### Create Webhook Endpoint:

1. Navigate to **Developers → Webhooks**
2. Click **Add endpoint**
3. Enter your webhook URL:
   - **Development**: `https://your-ngrok-url.ngrok.io/api/shop/stripe/webhook`
   - **Production**: `https://yourdomain.com/api/shop/stripe/webhook`

4. Select events to listen to:
   - `account.updated` (required for onboarding status updates)
   - `account.application.authorized` (optional)
   - `account.application.deauthorized` (optional)

5. Click **Add endpoint**

6. Click **Reveal** next to "Signing secret" and copy the value (starts with `whsec_...`)

7. Add it to your `.env` file:
   ```bash
   STRIPE_WEBHOOK_SECRET="whsec_..."
   ```

### Test Webhook (Development):

If testing locally, you can use Stripe CLI:

```bash
# Install Stripe CLI
# Windows: scoop install stripe
# Mac: brew install stripe/stripe-cli/stripe
# Linux: Download from https://stripe.com/docs/stripe-cli

# Forward webhooks to your local server
stripe listen --forward-to localhost:4173/api/shop/stripe/webhook

# This will give you a webhook signing secret (whsec_...)
# Add it to your .env file
```

## Step 4: Configure Frontend URL

Set your frontend URL in `.env` to ensure proper redirects after Stripe onboarding:

```bash
# Development
FRONTEND_URL="http://localhost:5173"

# Production
FRONTEND_URL="https://yourdomain.com"
```

This URL is used for:
- Return URL after successful onboarding
- Refresh URL if onboarding link expires

## Step 5: Restart Your Server

After updating environment variables, restart your server:

```bash
# Development
npm run dev

# Production
npm start
```

## Step 6: Test the Integration

### In the CMS:

1. Log in to your CMS admin panel
2. Navigate to **Shop → Settings** (or click the Shop icon in the sidebar)
3. Go to the **General** tab or **Stripe Connect** tab
4. You should see the Stripe Connect card with status "Not Connected"
5. Click **Connect Stripe Account**

### Expected Flow:

1. Button shows "Connecting..." briefly
2. You're redirected to Stripe's onboarding page
3. Complete the onboarding form:
   - Business details
   - Bank account information
   - Identity verification
4. After completion, you're redirected back to your CMS
5. Status should update to "Connected" with a green badge
6. Account details should display (charges enabled, payouts enabled, etc.)

### Troubleshooting:

#### Error: "Stripe is not configured"
- **Cause**: `STRIPE_SECRET_KEY` is missing or invalid
- **Fix**: Check your `.env` file and ensure the key is correct
- **Verify**: Restart your server after adding the key

#### Redirect URL is wrong
- **Cause**: `FRONTEND_URL` is not set or incorrect
- **Fix**: Update `FRONTEND_URL` in `.env` to match your actual URL
- **Note**: Must include protocol (http:// or https://)

#### Status doesn't update after onboarding
- **Cause**: Webhook not configured or secret is incorrect
- **Fix**: Set up webhook endpoint and add `STRIPE_WEBHOOK_SECRET`
- **Alternative**: Click "Refresh Status" button manually

#### Authentication errors
- **Cause**: Not logged in or missing tenant API key
- **Fix**: Log out and log back in to refresh session

## Production Checklist

Before going live with Stripe Connect:

- [ ] Switch to Live mode API keys in production environment
- [ ] Update webhook endpoint to production URL
- [ ] Test the full flow in Live mode with a real account
- [ ] Configure payout schedules in Stripe Dashboard
- [ ] Set up email notifications for connected accounts
- [ ] Review Stripe Connect terms and compliance requirements
- [ ] Enable two-factor authentication on your Stripe account
- [ ] Set up monitoring for webhook failures

## Additional Resources

- [Stripe Connect Documentation](https://stripe.com/docs/connect)
- [Express Accounts Guide](https://stripe.com/docs/connect/express-accounts)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)
- [Testing Stripe Connect](https://stripe.com/docs/connect/testing)

## Support

If you encounter issues:

1. Check the server logs for error messages
2. Verify all environment variables are set correctly
3. Test with Stripe's test mode first
4. Use Stripe Dashboard's event logs to debug webhook issues
5. Contact Stripe support for account-specific issues

## Security Notes

- Never commit API keys to version control
- Use environment variables for all secrets
- Rotate keys if they're ever exposed
- Enable webhook signature verification (automatic with `STRIPE_WEBHOOK_SECRET`)
- Use HTTPS in production
- Regularly review connected accounts in Stripe Dashboard
