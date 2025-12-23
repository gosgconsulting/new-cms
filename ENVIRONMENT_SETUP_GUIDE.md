# Environment Setup Guide for Railway Integration

This guide explains how to set up environment variables for your Sparti CMS to work with Railway PostgreSQL both locally and in production.

> **🔒 Security Note**: All API keys and secrets should be stored securely on Railway. See [RAILWAY_SECURE_ENV_SETUP.md](./docs/RAILWAY_SECURE_ENV_SETUP.md) for the recommended secure setup using Railway variables.

## Quick Setup

### 1. Secure Setup with Railway Variables (Recommended) ⭐

**Best Practice**: Store all secrets securely on Railway and sync locally:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and link project
railway login
railway link

# Sync variables from Railway
npm run env:sync
```

This approach:
- ✅ Stores all secrets securely on Railway
- ✅ No secrets in code or git
- ✅ Uses Railway's `${{}}` variable references
- ✅ Automatically syncs for local development

See [RAILWAY_SECURE_ENV_SETUP.md](./docs/RAILWAY_SECURE_ENV_SETUP.md) for detailed instructions.

### 2. Automatic Setup (Legacy)

Run the setup script to automatically create your `.env` file:

```bash
node setup-env.js
```

This will create a `.env` file with all the necessary Railway PostgreSQL configuration.

**Note**: This method includes placeholder API keys. Replace them with actual keys or use the Railway sync method above.

### 2. Manual Setup

If you prefer to set up manually, create a `.env` file in the project root with the following content:

```bash
# Railway PostgreSQL Database Configuration
DATABASE_PUBLIC_URL="postgresql://postgres:bFiBuCeLqCnTWwMEAQxnVJWGPZZkHXkG@mainline.proxy.rlwy.net:37013/railway"
DATABASE_URL="postgresql://postgres:bFiBuCeLqCnTWwMEAQxnVJWGPZZkHXkG@postgres-33yu.railway.internal:5432/railway"

# PostgreSQL Individual Settings
PGDATABASE="railway"
PGHOST="postgres-33yu.railway.internal"
PGPASSWORD="bFiBuCeLqCnTWwMEAQxnVJWGPZZkHXkG"
PGPORT="5432"
PGUSER="postgres"
POSTGRES_DB="railway"
POSTGRES_PASSWORD="bFiBuCeLqCnTWwMEAQxnVJWGPZZkHXkG"
POSTGRES_USER="postgres"

# Server Configuration
PORT=4173
NODE_ENV=development

# API Configuration
VITE_API_BASE_URL="https://cms.sparti.ai"

# Email Configuration (Resend)
RESEND_API_KEY="your-resend-api-key-here"
SMTP_HOST="smtp.resend.com"
SMTP_PORT="465"
SMTP_USER="resend"
SMTP_FROM_EMAIL="noreply@gosg.com"

# Google APIs
GOOGLE_CLOUD_TRANSLATION_API_KEY="your-google-cloud-translation-api-key-here"
GOOGLE_API_KEY="your-google-api-key-here"

# OpenRouter AI
OPENROUTER_API_KEY="your-openrouter-api-key-here"

# Anthropic Claude API (AI Assistant)
ANTHROPIC_API_KEY="your-anthropic-api-key-here"

# Frontend Variables (VITE_ prefix required)
VITE_RESEND_API_KEY="your-resend-api-key-here"
VITE_GOOGLE_API_KEY="your-google-api-key-here"
VITE_OPENROUTER_API_KEY="your-openrouter-api-key-here"
VITE_ANTHROPIC_API_KEY="your-anthropic-api-key-here"
VITE_SMTP_FROM_EMAIL="noreply@gosg.com"
```

## Railway Deployment Setup

For Railway deployment, use the configuration in `railway-env-config.txt`. Copy each variable to your Railway service environment settings:

1. Go to your Railway dashboard
2. Select your service
3. Navigate to the "Variables" tab
4. Add each variable from `railway-env-config.txt`

Railway will automatically replace `${{}}` placeholders with actual values.

## How It Works

### Database Connection Strategy

The application uses a smart connection strategy:

1. **Local Development**: Uses `DATABASE_PUBLIC_URL` (external proxy connection)
2. **Railway Production**: Uses `DATABASE_URL` (internal network connection)

This is handled automatically in `sparti-cms/db/sequelize/config.js`:

```javascript
const connectionString = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;
```

### Environment Variable Types

1. **Database Variables**: PostgreSQL connection details
2. **Server Variables**: Port, environment mode
3. **API Keys**: External service integrations
4. **Frontend Variables**: Variables with `VITE_` prefix for browser access

## Testing Your Setup

### 1. Test Environment Variables

```bash
node -e "require('dotenv').config(); console.log('DATABASE_PUBLIC_URL:', process.env.DATABASE_PUBLIC_URL ? 'Set ✅' : 'Not set ❌');"
```

### 2. Test Database Connection

```bash
npm run dev:backend
```

Look for these success messages:
- `[testing] Connected to PostgreSQL database`
- `[testing] Database connection test successful`

### 3. Test Full Application

```bash
npm run dev
```

This starts both frontend (port 8082) and backend (port 4173).

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Verify `DATABASE_PUBLIC_URL` is correct
   - Check if Railway PostgreSQL service is running
   - Ensure your IP is whitelisted (Railway usually allows all)

2. **Environment Variables Not Loading**
   - Ensure `.env` file is in project root
   - Check file permissions
   - Verify no syntax errors in `.env`

3. **Frontend API Calls Failing**
   - Check `VITE_API_BASE_URL` setting
   - Verify backend is running on correct port
   - Check browser network tab for CORS issues

### Debug Commands

```bash
# Check if .env file exists
ls -la .env

# Test environment loading
node -e "require('dotenv').config(); console.log(Object.keys(process.env).filter(k => k.includes('DATABASE')));"

# Test database connection directly
node -e "require('dotenv').config(); const { Pool } = require('pg'); const pool = new Pool({connectionString: process.env.DATABASE_PUBLIC_URL}); pool.query('SELECT NOW()', (err, res) => { console.log(err ? 'Error:' + err : 'Success:' + res.rows[0].now); pool.end(); });"
```

## Security Notes

1. **Never commit `.env` files** - They're in `.gitignore` for security
2. **Use different API keys** for development and production
3. **Rotate keys regularly** especially for production
4. **Limit API key permissions** to minimum required scope

## Files Created

- `.env` - Local environment variables (auto-generated)
- `setup-env.js` - Environment setup script
- `railway-env-config.txt` - Railway deployment configuration
- `ENVIRONMENT_SETUP_GUIDE.md` - This guide

## Next Steps

1. ✅ Environment variables configured
2. ✅ Database connection tested
3. 🚀 Start development: `npm run dev`
4. 🌐 Deploy to Railway with provided configuration
