# ACATR Deployment Environment Variables Checklist

## ✅ Your Current Environment Variables

```bash
DEPLOY_THEME_SLUG="landingpage"
CMS_TENANT="tenant-acatr"
DATABASE_PUBLIC_URL="${{Postgres-33yU.DATABASE_PUBLIC_URL}}"
DATABASE_URL="${{Postgres-33yU.DATABASE_URL}}"
NODE_ENV="production"
VITE_BACKEND_SERVER_URL="https://${{RAILWAY_PUBLIC_DOMAIN}}"
VITE_USE_BACKEND_SERVER="true"
BACKEND_PORT="${{PORT}}"
PORT="${{PORT}}"
```

## ⚠️ Missing Variable (Recommended)

Add this variable for frontend API calls:

```bash
VITE_API_BASE_URL="https://${{RAILWAY_PUBLIC_DOMAIN}}"
```

**Why**: The frontend code uses `VITE_API_BASE_URL` for API calls. While `VITE_BACKEND_SERVER_URL` might work in some contexts, `VITE_API_BASE_URL` is the standard variable used throughout the codebase.

## ✅ Verification

### 1. Run Verification Script

```bash
npm run verify:tenant
```

This will verify:
- ✅ All environment variables are set
- ✅ Database connection works
- ✅ Tenant exists in database
- ✅ Tenant is properly initialized

### 2. Ensure Tenant Setup

```bash
npm run setup:acatr
```

This will:
- ✅ Create tenant-acatr if it doesn't exist
- ✅ Set theme_id to 'landingpage'
- ✅ Initialize tenant defaults
- ✅ Create media folders

## 📋 Complete Environment Variables List

### Required Variables

```bash
# Theme Configuration
DEPLOY_THEME_SLUG="landingpage"

# Tenant Configuration (informational)
CMS_TENANT="tenant-acatr"

# Database Configuration (Auto-populated by Railway)
DATABASE_PUBLIC_URL="${{Postgres-33yU.DATABASE_PUBLIC_URL}}"
DATABASE_URL="${{Postgres-33yU.DATABASE_URL}}"

# Server Configuration
NODE_ENV="production"
PORT="${{PORT}}"
BACKEND_PORT="${{PORT}}"

# Frontend API Configuration
VITE_API_BASE_URL="https://${{RAILWAY_PUBLIC_DOMAIN}}"
VITE_BACKEND_SERVER_URL="https://${{RAILWAY_PUBLIC_DOMAIN}}"
VITE_USE_BACKEND_SERVER="true"
```

### Optional Variables

```bash
# Storage Configuration (for media files)
RAILWAY_STORAGE_TENANT_ACATR="storage-acatr"
```

## 🔍 Variable Explanations

### `DEPLOY_THEME_SLUG`
- **Required**: Yes
- **Value**: `"landingpage"`
- **Purpose**: Specifies which theme to deploy
- **Used in**: Dockerfile build process

### `CMS_TENANT`
- **Required**: No (informational only)
- **Value**: `"tenant-acatr"`
- **Purpose**: Identifies the tenant for this deployment
- **Note**: Not used by application code, but useful for reference

### `DATABASE_PUBLIC_URL` & `DATABASE_URL`
- **Required**: Yes
- **Source**: Auto-populated by Railway
- **Purpose**: PostgreSQL connection strings
- **Priority**: Application uses `DATABASE_PUBLIC_URL` first, then `DATABASE_URL`

### `VITE_API_BASE_URL`
- **Required**: Yes (for frontend API calls)
- **Value**: `"https://${{RAILWAY_PUBLIC_DOMAIN}}"`
- **Purpose**: Base URL for frontend API calls
- **Used in**: `sparti-cms/utils/api.ts`

### `VITE_BACKEND_SERVER_URL`
- **Required**: Optional (if using custom backend URL)
- **Value**: `"https://${{RAILWAY_PUBLIC_DOMAIN}}"`
- **Purpose**: Alternative backend server URL
- **Note**: May not be used if `VITE_API_BASE_URL` is set

### `RAILWAY_STORAGE_TENANT_ACATR`
- **Required**: No
- **Purpose**: Connect tenant to individual storage for media files
- **Format**: `RAILWAY_STORAGE_{TENANT_ID}` (uppercase, hyphens replaced with underscores)

## ✅ Verification Steps

1. **Set all environment variables in Railway**
2. **Run verification**: `npm run verify:tenant`
3. **Run setup**: `npm run setup:acatr`
4. **Deploy to Railway**
5. **Verify tenant is accessible**

## 🎯 Quick Fix: Add Missing Variable

Add this to your Railway environment variables:

```bash
VITE_API_BASE_URL="https://${{RAILWAY_PUBLIC_DOMAIN}}"
```

This ensures frontend API calls work correctly.

