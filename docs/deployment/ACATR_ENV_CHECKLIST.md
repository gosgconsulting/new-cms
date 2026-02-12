# ACATR Deployment Environment Variables Checklist

## Vercel (recommended)

Set these in the Vercel project dashboard:

### Required

```bash
DATABASE_URL=postgresql://...
DATABASE_PUBLIC_URL=postgresql://...   # optional, preferred for serverless
CMS_TENANT=tenant-acatr
DEPLOY_THEME_SLUG=landingpage          # if deploying theme only
NODE_ENV=production
RESEND_API_KEY=...
SMTP_FROM_EMAIL=noreply@example.com
```

### Frontend API URL

- `VITE_API_BASE_URL` - Set explicitly or leave unset; on Vercel it is auto-detected from `VERCEL_URL`.

### Optional: per-tenant storage

```bash
STORAGE_TENANT_ACATR=storage-acatr
```

Format: `STORAGE_{TENANT_ID}` (uppercase, hyphens replaced with underscores). Set in Vercel for production.

## Verification

1. **Set variables** in Vercel (or .env for local).
2. **Run**: `npm run verify:tenant`
3. **Run**: `npm run setup:acatr`
4. Deploy and verify tenant is accessible.
