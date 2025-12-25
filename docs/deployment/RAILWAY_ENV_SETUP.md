# Railway Environment Variables Setup Guide

## Quick Copy & Paste

Use the file `RAILWAY_ENV_VARIABLES.txt` in the project root for a ready-to-use list.

## Required Variables for CMS

### Database (Auto-filled by Railway)
- `DATABASE_PUBLIC_URL` - External database connection
- `DATABASE_URL` - Internal database connection  
- `POSTGRES_DB`, `POSTGRES_PASSWORD`, `POSTGRES_USER` - Database credentials

### Server Configuration
- `PORT` - Server port (auto-set by Railway)
- `NODE_ENV` - Set to "production"

### Frontend Configuration
- `VITE_API_BASE_URL` - Your Railway app URL (e.g., "https://cms.sparti.ai")

### Email (Required for Contact Forms)
- `RESEND_API_KEY` - Backend email API key
- `SMTP_FROM_EMAIL` - Email sender address
- `VITE_RESEND_API_KEY` - Frontend email API key (same as RESEND_API_KEY)

### AI Assistant (Backend Only)
- `ANTHROPIC_API_KEY` - For CMS AI assistant features (backend only, NOT exposed to frontend)

## Optional Variables

### Additional Integrations
- `GOOGLE_CLOUD_TRANSLATION_API_KEY` - For translation features
- `VITE_PERPLEXITY_API_KEY` - For Perplexity AI integration

### Static Theme Deployment
- `DEPLOY_THEME_SLUG` - Set to theme slug (e.g., "landingpage") to deploy static theme only

## Important Notes

1. **No Duplicate Keys**: Only use `ANTHROPIC_API_KEY` (backend), NOT `VITE_ANTHROPIC_API_KEY`
2. **Security**: API keys are stored securely in Railway, never in code
3. **Database Variables**: Railway auto-generates these from your PostgreSQL service
4. **VITE_ Prefix**: Frontend variables MUST have `VITE_` prefix to be accessible in browser

## Setup Steps

1. Go to Railway Dashboard → Your Service → **Variables** tab
2. Copy variables from `RAILWAY_ENV_VARIABLES.txt`
3. Paste into Railway (one per line, format: `KEY="value"`)
4. Replace API key placeholders with your actual keys
5. Railway will auto-replace `${{}}` placeholders

## Variable Categories

### Backend Only (Server-side)
- `ANTHROPIC_API_KEY` - AI assistant
- `RESEND_API_KEY` - Email sending
- `DATABASE_URL` - Database connection

### Frontend Accessible (Browser)
- `VITE_API_BASE_URL` - API endpoint
- `VITE_RESEND_API_KEY` - Client-side email
- `VITE_PERPLEXITY_API_KEY` - Perplexity integration

### Both (Backend + Frontend)
- `SMTP_FROM_EMAIL` - Email sender (used by both)

