# Theme Static Deployment Guide

This guide explains how to deploy a standalone static frontend for a specific theme using Vercel (or host) environment variables.

## Overview

You can deploy a specific theme page as a standalone static frontend by setting the `DEPLOY_THEME_SLUG` environment variable in Vercel. This creates a lightweight, static-only deployment without the full CMS backend.

## How It Works

1. **Set Environment Variable**: Set `DEPLOY_THEME_SLUG` to the theme slug you want to deploy (e.g., `landingpage`)
2. **Build Process**: The Dockerfile detects this variable and builds only the theme as a static export
3. **Deployment**: The static files are served using a simple HTTP server

## Available Themes

- `landingpage` - ACATR Business Services theme
- `sparti-seo-landing` - Sparti SEO Landing theme
- `gosgconsulting` - GO SG Consulting theme

## Vercel Setup

### Step 1: Set Environment Variable

In your Vercel project:

1. Go to Project → **Settings** → **Environment Variables**
2. Add:
   - **Name**: `DEPLOY_THEME_SLUG`
   - **Value**: `landingpage` (or your desired theme slug)

### Step 2: Deploy

Vercel will use your build command; ensure theme build runs when `DEPLOY_THEME_SLUG` is set. The static theme export is served from the build output.

### Step 3: Access Your Theme

Once deployed, your theme will be available at your Vercel URL, e.g.:
- `https://your-app.vercel.app/`

The theme will be served as a static site with the slug as the index route.

## Local Testing

You can test the static build locally:

```bash
# Build static theme export
npm run build:theme landingpage

# Or use environment variable
DEPLOY_THEME_SLUG=landingpage npm run build:theme

# Preview the build
npx serve -s dist-theme -l 4173
```

## Build Output

The static build creates:
- `dist-theme/` - Static files ready for deployment
- Optimized and minified assets
- No backend dependencies
- Ready for CDN/static hosting

## Use Cases

This feature is useful for:
- **Landing Pages**: Deploy standalone landing pages without CMS overhead
- **Marketing Sites**: Lightweight marketing sites with fast load times
- **CDN Deployment**: Deploy to CDN services like Cloudflare Pages, Vercel, or Netlify
- **Cost Optimization**: Reduce server costs by using static hosting

## Switching Between Full CMS and Theme-Only

### Deploy Full CMS
- Remove or unset `DEPLOY_THEME_SLUG` environment variable
- Vercel will build and deploy the full CMS with database support

### Deploy Theme-Only
- Set `DEPLOY_THEME_SLUG` to your desired theme slug
- Build will produce only the static theme

## Troubleshooting

### Theme Not Found
If you get a "Theme not found" error:
1. Verify the theme exists in `sparti-cms/theme/{theme-slug}/`
2. Check that the theme has an `index.tsx` file
3. Ensure the `DEPLOY_THEME_SLUG` value matches the theme folder name exactly

### Build Fails
If the build fails:
1. Check Vercel (or host) logs for specific error messages
2. Verify all theme dependencies are in `package.json`
3. Ensure the theme component exports correctly

### Blank Page
If you see a blank page:
1. Check browser console for JavaScript errors
2. Verify assets are being served correctly
3. Check that the theme component renders properly

## Advanced: Custom Domain

You can configure a custom domain in Vercel:
1. Go to Project → **Settings** → **Domains**
2. Add your custom domain
3. Vercel will automatically configure SSL

## Notes

- Static theme deployments don't require a database
- No API endpoints are available in theme-only mode
- All theme content is hardcoded (no CMS editing)
- Perfect for production landing pages that don't need dynamic content

