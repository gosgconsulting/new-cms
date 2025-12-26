# Sync Tenants to New Structure

This script migrates all existing tenants to use the new shared master/tenant structure.

## What It Does

1. **Runs Database Migrations**
   - Adds `tenant_id` to `media` and `media_folders` tables
   - Adds `storage_name` column to `tenants` table
   - Updates unique constraints to be tenant-scoped

2. **Migrates Existing Data**
   - Updates existing media files and folders to have `tenant_id`
   - Assigns existing media to the first tenant (or 'tenant-gosg' as default)

3. **Creates Empty Media Folders**
   - Creates default folders (Images, Videos, Documents, Other) for all tenants
   - Skips tenants that already have folders

4. **Initializes Tenant Structure**
   - Ensures all tenants have proper branding settings
   - Creates tenant-specific overrides where needed

## How to Run

### Option 1: Using npm script (Recommended)
```bash
npm run sync:tenants
```

### Option 2: Direct execution
```bash
node scripts/migrations/sync-tenants-to-new-structure.js
```

## Prerequisites

- Database connection configured (DATABASE_URL environment variable)
- All tenants must exist in the `tenants` table
- Database must be accessible

## What Happens

The script will:
1. Run migrations (if not already applied)
2. Find all tenants in the database
3. Migrate existing media/folders to have tenant_id
4. Create empty media folders for each tenant
5. Initialize tenant defaults (branding settings, etc.)

## Output

The script provides detailed output showing:
- Number of tenants found
- Migration status
- Media/folders updated
- Folders created per tenant
- Initialization status per tenant
- Any errors encountered

## After Running

1. **Configure Storage Names** (if using Railway):
   - Set `RAILWAY_STORAGE_{TENANT_ID}` environment variables
   - Example: `RAILWAY_STORAGE_TENANT_GOSG=storage-gosg`

2. **Or Update Database**:
   ```sql
   UPDATE tenants SET storage_name = 'your-storage-name' WHERE id = 'tenant-id';
   ```

3. **Verify**:
   - Check that media folders exist for each tenant
   - Verify media files are accessible
   - Test file uploads

## Troubleshooting

### Error: "Migration already applied"
- This is normal if migrations were run separately
- The script will continue with data migration

### Error: "No tenants found"
- Ensure tenants exist in the database
- Check database connection

### Error: "Foreign key constraint violation"
- Ensure all tenants exist before running
- Check that tenant_id values are valid

## Notes

- The script is idempotent - safe to run multiple times
- Existing media files are assigned to the first tenant found
- Folders are only created if they don't exist
- Initialization is skipped if tenant already has settings

