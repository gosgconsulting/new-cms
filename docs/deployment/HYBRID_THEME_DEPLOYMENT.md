# Hybrid Theme Deployment Guide

## Overview

When `DEPLOY_THEME_SLUG` is set, the build creates a **hybrid application** that:
- Shows the theme at `/` (root)
- Provides full CMS admin access at `/admin`
- Includes backend server for API access

## How It Works

1. **Build Process**: Creates a hybrid React app with both theme and admin routes
2. **Routing**: 
   - `/` → Theme landing page
   - `/admin` → CMS admin (redirects to `/auth` if not authenticated)
   - `/auth` → Authentication page
3. **Backend**: Full server runs to support admin API calls

## Setup

### Railway Environment Variables

Set these variables in Railway:

```bash
DEPLOY_THEME_SLUG="landingpage"
DATABASE_PUBLIC_URL="${{Postgres-33yU.DATABASE_PUBLIC_URL}}"
DATABASE_URL="${{Postgres-33yU.DATABASE_URL}}"
POSTGRES_DB="${{Postgres-33yU.POSTGRES_DB}}"
POSTGRES_PASSWORD="${{Postgres-33yU.POSTGRES_PASSWORD}}"
POSTGRES_USER="${{Postgres-33yU.POSTGRES_USER}}"
VITE_API_BASE_URL="https://cms.sparti.ai"
RESEND_API_KEY="your-resend-key"
SMTP_FROM_EMAIL="noreply@gosg.com"
VITE_RESEND_API_KEY="your-resend-key"
ANTHROPIC_API_KEY="your-anthropic-key"
GOOGLE_CLOUD_TRANSLATION_API_KEY="your-google-key"
VITE_PERPLEXITY_API_KEY="your-perplexity-key"
```

### Required Variables

- `DEPLOY_THEME_SLUG` - Theme to show at `/` (e.g., "landingpage")
- `DATABASE_URL` - Database connection (required for admin)
- `VITE_API_BASE_URL` - Your Railway app URL
- `RESEND_API_KEY` - For email functionality
- `ANTHROPIC_API_KEY` - For CMS AI assistant

## Available Routes

### Public Routes
- `/` - Theme landing page
- `/auth` - Login page

### Protected Routes (Require Authentication)
- `/admin` - CMS admin dashboard
- `/admin/*` - All admin sub-routes

## Access Flow

1. **Visitor visits `/`**: Sees the theme landing page
2. **Admin visits `/admin`**: 
   - If not authenticated → Redirected to `/auth`
   - If authenticated → Shows CMS admin dashboard
3. **After login**: Redirected back to `/admin`

## Benefits

✅ **Public-facing theme** at root URL  
✅ **Full CMS access** for content management  
✅ **Single deployment** - no need for separate services  
✅ **Backend API** available for admin features  

## Switching Back to Full CMS

To deploy the full CMS (without theme at root):

1. Remove or unset `DEPLOY_THEME_SLUG` in Railway
2. Redeploy
3. Root will redirect to `/admin` as normal

## Troubleshooting

### Admin Not Accessible
- Verify `DATABASE_URL` is set correctly
- Check that backend server is running
- Ensure migrations have run

### Theme Not Showing
- Verify `DEPLOY_THEME_SLUG` matches theme folder name
- Check build logs for theme loading errors
- Ensure theme exists in `sparti-cms/theme/{slug}/`

### Authentication Issues
- Verify `VITE_API_BASE_URL` points to your Railway app
- Check backend logs for API errors
- Ensure database is accessible

