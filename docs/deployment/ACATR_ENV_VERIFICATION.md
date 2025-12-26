# ACATR Deployment Environment Variables Verification

## Environment Variables Setup

For ACATR deployment, the following environment variables should be configured:

### ✅ Required Variables

```bash
# Theme Configuration
DEPLOY_THEME_SLUG="landingpage"

# Tenant Configuration
CMS_TENANT="tenant-acatr"

# Database Configuration (Auto-populated by Railway)
DATABASE_PUBLIC_URL="${{Postgres-33yU.DATABASE_PUBLIC_URL}}"
DATABASE_URL="${{Postgres-33yU.DATABASE_URL}}"

# Server Configuration
NODE_ENV="production"
PORT="${{PORT}}"
BACKEND_PORT="${{PORT}}"

# Frontend API Configuration
VITE_BACKEND_SERVER_URL="https://${{RAILWAY_PUBLIC_DOMAIN}}"
VITE_USE_BACKEND_SERVER="true"
VITE_API_BASE_URL="https://${{RAILWAY_PUBLIC_DOMAIN}}"
```

### ✅ Optional Variables

```bash
# Storage Configuration (for media files)
RAILWAY_STORAGE_TENANT_ACATR="storage-acatr"
```

## Verification Steps

### 1. Verify Environment Variables

Run the verification script:

```bash
npm run verify:tenant
```

This will check:
- ✅ All required environment variables are set
- ✅ Database connection works
- ✅ Tenant exists in database
- ✅ Tenant is properly initialized
- ✅ Storage configuration

### 2. Ensure Tenant Setup

Run the ACATR setup script:

```bash
npm run setup:acatr
```

This will:
- ✅ Create tenant-acatr if it doesn't exist
- ✅ Set theme_id to 'landingpage'
- ✅ Initialize tenant defaults (branding, media folders)
- ✅ Configure storage if environment variable is set

### 3. Manual Verification

You can also verify manually:

```sql
-- Check tenant exists
SELECT id, name, slug, theme_id, storage_name 
FROM tenants 
WHERE id = 'tenant-acatr';

-- Check tenant has settings
SELECT COUNT(*) 
FROM site_settings 
WHERE tenant_id = 'tenant-acatr';

-- Check tenant has media folders
SELECT COUNT(*) 
FROM media_folders 
WHERE tenant_id = 'tenant-acatr' AND is_active = true;
```

## Environment Variables Explanation

### `DEPLOY_THEME_SLUG`
- **Purpose**: Specifies which theme to deploy
- **Value**: `"landingpage"` (must match a theme in `sparti-cms/theme/`)
- **Used in**: Dockerfile build process, theme routing

### `CMS_TENANT`
- **Purpose**: Identifies the tenant for this deployment
- **Value**: `"tenant-acatr"`
- **Note**: This is informational. The application uses tenant_id from database/user context.

### `DATABASE_PUBLIC_URL` & `DATABASE_URL`
- **Purpose**: PostgreSQL connection strings
- **Source**: Auto-populated by Railway from Postgres-33yU service
- **Usage**: 
  - `DATABASE_PUBLIC_URL`: External connections (if needed)
  - `DATABASE_URL`: Internal Railway network connection (preferred in production)

### `VITE_BACKEND_SERVER_URL`
- **Purpose**: Frontend API base URL
- **Value**: `"https://${{RAILWAY_PUBLIC_DOMAIN}}"`
- **Used in**: Frontend API calls

### `VITE_USE_BACKEND_SERVER`
- **Purpose**: Enable backend server for API calls
- **Value**: `"true"`

### `RAILWAY_STORAGE_TENANT_ACATR` (Optional)
- **Purpose**: Connect tenant to individual storage for media files
- **Value**: Storage name (e.g., `"storage-acatr"`)
- **Used in**: Media file uploads and storage paths

## Common Issues

### Issue: Tenant not found
**Solution**: Run `npm run setup:acatr` to create the tenant

### Issue: Database connection fails
**Solution**: 
1. Verify `DATABASE_URL` is set correctly
2. Check Railway PostgreSQL service is running
3. Verify network connectivity

### Issue: Theme not loading
**Solution**:
1. Verify `DEPLOY_THEME_SLUG="landingpage"` matches theme directory
2. Check theme exists in `sparti-cms/theme/landingpage/`
3. Verify build completed successfully

### Issue: Media uploads fail
**Solution**:
1. Set `RAILWAY_STORAGE_TENANT_ACATR` environment variable
2. Or update `storage_name` in tenants table
3. Verify storage path is accessible

## Next Steps After Setup

1. ✅ Run `npm run setup:acatr` to ensure tenant exists
2. ✅ Run `npm run verify:tenant` to verify connection
3. ✅ Run `npm run sync:tenants` to sync to new structure (if needed)
4. ✅ Deploy to Railway
5. ✅ Verify tenant is accessible at deployment URL

## Database Connection Priority

The application uses the following priority for database connection:
1. `DATABASE_PUBLIC_URL` (if set)
2. `DATABASE_URL` (fallback)

In Railway production, `DATABASE_URL` is preferred for internal network connections.

