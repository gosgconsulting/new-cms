# Minimal Environment Variables Deployment

## Overview

This guide shows how to deploy the frontend theme with only 4 environment variables:

1. `DEPLOY_THEME_SLUG` - Theme to deploy
2. `CMS_TENANT` - Tenant ID to use
3. `DATABASE_PUBLIC_URL` - Database connection (public)
4. `DATABASE_URL` - Database connection (internal)

## Required Environment Variables

```bash
DEPLOY_THEME_SLUG="landingpage"
CMS_TENANT="tenant-2960b682"
DATABASE_PUBLIC_URL="${{Postgres-33yU.DATABASE_PUBLIC_URL}}"
DATABASE_URL="${{Postgres-33yU.DATABASE_URL}}"
```

## How It Works

### 1. Theme Build (`DEPLOY_THEME_SLUG`)

- When `DEPLOY_THEME_SLUG` is set, the Dockerfile builds only the theme (not the full CMS)
- The build script injects `CMS_TENANT` into the HTML as `window.__CMS_TENANT__`
- `VITE_API_BASE_URL` is auto-detected from `RAILWAY_PUBLIC_DOMAIN` if not set

### 2. Tenant Connection (`CMS_TENANT`)

- `CMS_TENANT` is injected into the build as `window.__CMS_TENANT__`
- The theme component reads this value and uses it for API calls
- All API requests automatically include the tenant ID in headers

### 3. Database Connection

- `DATABASE_URL` is used for internal Railway connections (preferred)
- `DATABASE_PUBLIC_URL` is used as fallback
- The backend automatically connects to the database using these variables

### 4. Auto-Detected Variables

The following variables are automatically detected/constructed:

- `VITE_API_BASE_URL` - Auto-constructed from `RAILWAY_PUBLIC_DOMAIN` if not set
- `PORT` - Auto-provided by Railway
- `NODE_ENV` - Defaults to "production" in Railway

## Deployment Steps

1. **Set Environment Variables in Railway**
   - Go to Railway Dashboard → Your Service → Variables
   - Add the 4 required variables

2. **Deploy**
   - Railway will automatically:
     - Build the theme using `DEPLOY_THEME_SLUG`
     - Inject `CMS_TENANT` into the build
     - Connect to database using `DATABASE_URL`
     - Auto-detect `VITE_API_BASE_URL` from Railway domain

3. **Verify**
   - Check that the theme loads
   - Verify API calls include the tenant ID
   - Check database connection in logs

## Code Changes

### Build Script (`scripts/build-theme-static.js`)

- Reads `CMS_TENANT` from environment
- Injects `window.__CMS_TENANT__` into HTML
- Passes `tenantId` prop to theme component

### Theme Component (`sparti-cms/theme/landingpage/index.tsx`)

- Accepts `tenantId` prop
- Falls back to `window.__CMS_TENANT__` if prop not provided
- Uses tenant ID for all API calls

### API Utility (`sparti-cms/utils/api.ts`)

- Automatically adds `X-Tenant-Id` header when `tenantId` is provided
- Ensures all API calls are tenant-scoped

## Testing

After deployment, verify:

1. **Theme loads correctly**
   ```bash
   curl https://your-app.railway.app/
   ```

2. **Tenant ID is set**
   - Open browser console
   - Check for: `[testing] Theme using tenant ID: tenant-2960b682`

3. **API calls include tenant**
   - Open Network tab
   - Check API requests include `X-Tenant-Id: tenant-2960b682` header

4. **Database connection**
   - Check Railway logs for database connection success

## Troubleshooting

### Theme Not Loading

- Check `DEPLOY_THEME_SLUG` matches theme directory name
- Verify build completed successfully
- Check `dist/` directory exists

### Tenant ID Not Set

- Verify `CMS_TENANT` is set in Railway variables
- Check browser console for `window.__CMS_TENANT__`
- Verify build logs show tenant ID injection

### Database Connection Fails

- Verify `DATABASE_URL` is set correctly
- Check Railway PostgreSQL service is running
- Verify network connectivity

### API Calls Fail

- Check `VITE_API_BASE_URL` is set or auto-detected
- Verify tenant ID is in request headers
- Check API endpoint is accessible

