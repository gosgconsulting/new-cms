# ACATR Deployment Environment Variables Verification

## Vercel setup

Configure in Vercel project → Settings → Environment Variables:

### Required

- `DATABASE_URL`, `DATABASE_PUBLIC_URL` (or one of them)
- `CMS_TENANT=tenant-acatr`
- `DEPLOY_THEME_SLUG=landingpage` (if theme-only)
- `NODE_ENV=production`
- `RESEND_API_KEY`, `SMTP_FROM_EMAIL`
- `VITE_API_BASE_URL` optional; on Vercel it is derived from `VERCEL_URL` if unset

### Optional: storage

- `STORAGE_TENANT_ACATR=storage-acatr` (per-tenant storage name)

## Verification

1. **Verify**: `npm run verify:tenant`
2. **Setup tenant**: `npm run setup:acatr`
3. Deploy and confirm tenant is accessible.

## Common issues

- **Tenant not found**: Run `npm run setup:acatr`
- **Database connection fails**: Check `DATABASE_URL` in Vercel (or .env)
- **Media uploads fail**: Set `STORAGE_TENANT_ACATR` or update `storage_name` in the tenants table
