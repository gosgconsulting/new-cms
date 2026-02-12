# Minimal Environment Variables Deployment

## Overview

This guide shows how to deploy with a minimal set of environment variables (Vercel or local).

1. `DATABASE_URL` - Database connection (required)
2. `DATABASE_PUBLIC_URL` - Optional; used for serverless (e.g. Vercel)
3. `VITE_API_BASE_URL` - Optional; auto-detected from `VERCEL_URL` on Vercel if not set
4. For theme-only builds: `DEPLOY_THEME_SLUG`, `CMS_TENANT`

## Required for full CMS (Vercel)

```bash
DATABASE_URL=postgresql://...
DATABASE_PUBLIC_URL=postgresql://...   # optional, preferred for serverless
DATABASE_POOL_MAX=5
BLOB_READ_WRITE_TOKEN=...             # Vercel Blob for uploads
RESEND_API_KEY=...
SMTP_FROM_EMAIL=noreply@example.com
NODE_ENV=production
```

## Auto-Detected on Vercel

- `VITE_API_BASE_URL` - Built from `VERCEL_URL` (or `VERCEL_PROJECT_PRODUCTION_URL`) if not set
- `PORT` - Set by Vercel

## Theme-only build

When `DEPLOY_THEME_SLUG` is set, the theme build script runs instead of the full CMS build. Set:

- `DEPLOY_THEME_SLUG` - Theme slug to build
- `CMS_TENANT` - Tenant ID
- `VITE_API_BASE_URL` - Or leave unset on Vercel to use `VERCEL_URL`

## Deployment (Vercel)

1. Set environment variables in the Vercel project dashboard.
2. Deploy; Vercel runs `npm run build && npm run build:api` and serves `dist/` + serverless API.
3. For per-tenant storage, set `STORAGE_{TENANT_ID}` (e.g. `STORAGE_TENANT_ACATR=storage-name`).

## Troubleshooting

- **Database**: Ensure `DATABASE_URL` is set and the database is reachable (e.g. connection pooling for serverless).
- **API base URL**: On Vercel, `VERCEL_URL` is used when `VITE_API_BASE_URL` is not set.
- **Uploads**: On Vercel, set `BLOB_READ_WRITE_TOKEN` for file uploads. Never commit this token; use only in Vercel env or .env.
- **Theme assets on Vercel**: Theme dirs are not bundled into the serverless function (to stay under size limits). To serve theme images and assets, run `npm run upload:theme-assets` (requires `BLOB_READ_WRITE_TOKEN`), then set the printed URL as `BLOB_THEME_MANIFEST_URL` in Vercel and optionally in .env.
