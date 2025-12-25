# Railway Secure Environment Variables Setup

This guide explains how to securely manage environment variables using Railway's variable system, ensuring no secrets are stored in code.

## Overview

Railway provides a secure way to manage environment variables using:
1. **Railway Dashboard** - Store all secrets securely
2. **Variable References** - Use `${{ServiceName.VARIABLE}}` syntax to reference variables
3. **Railway CLI** - Sync variables locally for development

## Benefits

✅ **No secrets in code** - All API keys stored securely on Railway  
✅ **Automatic variable substitution** - Railway replaces `${{}}` placeholders  
✅ **Service references** - Reference variables from other Railway services  
✅ **Local development** - Sync variables using Railway CLI  

## Setup Instructions

### 1. Railway Dashboard Setup

1. Go to your Railway project dashboard
2. Select your service
3. Navigate to **Variables** tab
4. Copy variables from `railway-env-config.txt` (one by one)
5. Replace `your-*-api-key-here` placeholders with actual keys
6. Railway will automatically resolve `${{}}` placeholders

#### Example Railway Variables:

```bash
# Database (auto-populated from Postgres-33yU service)
DATABASE_PUBLIC_URL="${{Postgres-33yU.DATABASE_PUBLIC_URL}}"
DATABASE_URL="${{Postgres-33yU.DATABASE_URL}}"
PGDATABASE="${{Postgres-33yU.POSTGRES_DB}}"
PGPASSWORD="${{Postgres-33yU.POSTGRES_PASSWORD}}"
PGUSER="${{Postgres-33yU.POSTGRES_USER}}"

# API Keys (store actual values)
ANTHROPIC_API_KEY="sk-ant-api03-..."
VITE_ANTHROPIC_API_KEY="sk-ant-api03-..."
GOOGLE_API_KEY="AIzaSy..."
# ... etc
```

### 2. Local Development Setup

You have two options for local development:

#### Option A: Railway CLI Sync (Recommended)

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway:**
   ```bash
   railway login
   ```

3. **Link your project:**
   ```bash
   railway link
   ```

4. **Sync environment variables:**
   ```bash
   npm run env:sync
   ```

This will create a `.env` file with all variables from Railway.

#### Option B: Manual Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in values manually from Railway dashboard
3. **Never commit `.env` to git** (it's in `.gitignore`)

### 3. Railway Variable Reference Syntax

Railway supports referencing variables from other services:

```bash
# Reference from PostgreSQL service
DATABASE_PUBLIC_URL="${{Postgres-33yU.DATABASE_PUBLIC_URL}}"
PGPASSWORD="${{Postgres-33yU.POSTGRES_PASSWORD}}"

# Reference from same service
VITE_API_BASE_URL="${{VITE_API_BASE_URL}}"

# Reference Railway built-in variables
PORT="${{PORT}}"
RAILWAY_ENVIRONMENT="${{RAILWAY_ENVIRONMENT}}"
```

### 4. Database Connection Variables

For PostgreSQL, Railway auto-generates these variables. Use references:

```bash
# Public URL (for external connections)
DATABASE_PUBLIC_URL="postgresql://${{Postgres-33yU.PGUSER}}:${{Postgres-33yU.POSTGRES_PASSWORD}}@${{Postgres-33yU.RAILWAY_TCP_PROXY_DOMAIN}}:${{Postgres-33yU.RAILWAY_TCP_PROXY_PORT}}/${{Postgres-33yU.PGDATABASE}}"

# Private URL (for internal Railway connections)
DATABASE_URL="postgresql://${{Postgres-33yU.PGUSER}}:${{Postgres-33yU.POSTGRES_PASSWORD}}@${{Postgres-33yU.RAILWAY_PRIVATE_DOMAIN}}:5432/${{Postgres-33yU.PGDATABASE}}"

# Individual components
PGDATABASE="${{Postgres-33yU.POSTGRES_DB}}"
PGHOST="${{Postgres-33yU.RAILWAY_PRIVATE_DOMAIN}}"
PGPASSWORD="${{Postgres-33yU.POSTGRES_PASSWORD}}"
PGUSER="${{Postgres-33yU.POSTGRES_USER}}"
```

## File Structure

```
project/
├── .env                    # Local development (gitignored)
├── .env.example           # Template (committed)
├── .env.local             # Local overrides (gitignored)
├── railway-env-config.txt # Railway config template (committed)
└── scripts/
    └── sync-railway-env.js # Sync script (committed)
```

## Security Best Practices

1. ✅ **Never commit `.env` files** - Already in `.gitignore`
2. ✅ **Use Railway for all secrets** - Store actual keys only on Railway
3. ✅ **Use `.env.example`** - Template without real values
4. ✅ **Rotate keys regularly** - Especially if exposed
5. ✅ **Use Railway CLI sync** - Avoid manual key copying

## Troubleshooting

### Railway CLI Not Working

```bash
# Check if installed
railway --version

# Reinstall if needed
npm install -g @railway/cli

# Re-authenticate
railway login
railway link
```

### Variables Not Syncing

1. Make sure you're linked to the correct project: `railway link`
2. Check if variables exist in Railway dashboard
3. Verify Railway CLI has access: `railway variables`

### Database Connection Issues

1. Verify `DATABASE_PUBLIC_URL` is set correctly in Railway
2. Check PostgreSQL service name matches (e.g., `Postgres-33yU`)
3. Ensure service is running in Railway dashboard

## Migration from Hardcoded Values

If you have existing hardcoded values:

1. **Add variables to Railway dashboard** with actual values
2. **Update `railway-env-config.txt`** to use `${{}}` references
3. **Run `npm run env:sync`** to update local `.env`
4. **Remove hardcoded values** from code

## Next Steps

1. ✅ Set up variables in Railway dashboard
2. ✅ Run `npm run env:sync` for local development
3. ✅ Deploy to Railway (variables auto-injected)
4. ✅ Verify application works with Railway variables

## Additional Resources

- [Railway Variables Documentation](https://docs.railway.app/develop/variables)
- [Railway CLI Documentation](https://docs.railway.app/develop/cli)
- [Environment Variables Best Practices](https://docs.railway.app/develop/variables#best-practices)


