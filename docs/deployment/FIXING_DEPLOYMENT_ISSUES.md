# Fixing Deployment Issues

## Issue 1: Login Not Working (ERR_CONNECTION_REFUSED)

### Problem
Frontend tries to connect to `localhost:4173` instead of the production API URL.

### Solution
`VITE_API_BASE_URL` must be set in Railway **before** the Docker build runs. Railway passes it as a build argument.

### Required Railway Variable
```bash
VITE_API_BASE_URL="https://cms.sparti.ai"
```

**Important**: This variable MUST be set in Railway before deployment. It's used at BUILD time, not runtime.

## Issue 2: Healthcheck Failing

### Problem
Healthcheck fails when `DEPLOY_THEME_SLUG` is set, showing "service unavailable".

### Solution
The server now starts immediately (before database migrations) so healthchecks pass right away. Database initialization happens in the background.

### Healthcheck Configuration
- Path: `/health`
- Timeout: 60 seconds (increased from 30)
- Interval: 10 seconds (increased from 5)

The `/health` endpoint returns 200 immediately, even if database is still initializing.

## Complete Railway Variables Checklist

Make sure ALL these are set in Railway:

```bash
# Theme deployment (optional)
DEPLOY_THEME_SLUG="landingpage"

# Database (auto-filled by Railway)
DATABASE_PUBLIC_URL="${{Postgres-33yU.DATABASE_PUBLIC_URL}}"
DATABASE_URL="${{Postgres-33yU.DATABASE_URL}}"
POSTGRES_DB="${{Postgres-33yU.POSTGRES_DB}}"
POSTGRES_PASSWORD="${{Postgres-33yU.POSTGRES_PASSWORD}}"
POSTGRES_USER="${{Postgres-33yU.POSTGRES_USER}}"

# API Configuration (CRITICAL for login)
VITE_API_BASE_URL="https://cms.sparti.ai"

# Email
RESEND_API_KEY="your-key"
SMTP_FROM_EMAIL="noreply@gosg.com"
VITE_RESEND_API_KEY="your-key"

# AI
ANTHROPIC_API_KEY="your-key"
GOOGLE_CLOUD_TRANSLATION_API_KEY="your-key"
VITE_PERPLEXITY_API_KEY="your-key"
```

## Verification Steps

1. **Check VITE_API_BASE_URL is set**: 
   - Railway Dashboard → Variables → Verify `VITE_API_BASE_URL` exists
   - Value should be your Railway app URL (e.g., `https://cms.sparti.ai`)

2. **Check build logs**:
   - Look for: `VITE_API_BASE_URL=https://cms.sparti.ai` in build output
   - If missing, the variable wasn't available during build

3. **Check healthcheck**:
   - Visit `https://your-app.railway.app/health`
   - Should return: `{"status":"healthy","timestamp":"...","port":4173}`

4. **Test login**:
   - Open browser console
   - Check network tab for `/api/auth/login` request
   - Should go to `https://cms.sparti.ai/api/auth/login` (NOT localhost)

## Common Mistakes

❌ **Setting VITE_API_BASE_URL after first deployment**
   - Must be set BEFORE first build
   - Rebuild required if added later

❌ **Using localhost in production**
   - Frontend code has `|| 'http://localhost:4173'` fallback
   - If `VITE_API_BASE_URL` not set, it uses localhost

❌ **Healthcheck timeout too short**
   - Increased to 60 seconds to allow server startup
   - Database init happens in background

## After Fixing

1. **Redeploy** after setting `VITE_API_BASE_URL`
2. **Clear browser cache** if login still fails
3. **Check browser console** for actual API URL being used
4. **Verify healthcheck** passes in Railway dashboard

