# Quick Start: Test Built Theme Locally (No Docker)

> **For Development**: Use `npm run dev:theme` instead (see [Development Guide](../development/QUICK_START_DEVELOPMENT.md))

## Fastest Way

```bash
# Build and serve the landingpage theme
npm run test:theme:local landingpage
```

## With Custom Options

```bash
# Using the convenience script directly
./scripts/test-theme-local.sh landingpage 4173 http://localhost:3000 your-tenant-id
```

## Manual Steps

### 1. Build the Theme

```bash
DEPLOY_THEME_SLUG=landingpage npm run build:theme
```

### 2. Start the Server

```bash
DEPLOY_THEME_SLUG=landingpage \
CMS_BACKEND_URL=http://localhost:3000 \
CMS_TENANT=your-tenant-id \
PORT=4173 \
node scripts/serve-theme-static.js
```

### 3. Open Browser

Visit: `http://localhost:4173/`

## Available Themes

- `landingpage` - ACATR Business Services
- `sparti-seo-landing` - Sparti SEO Landing  
- `gosgconsulting` - GO SG Consulting

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DEPLOY_THEME_SLUG` | ✅ Yes | - | Theme slug to build/serve |
| `PORT` | ❌ No | `4173` | Server port |
| `CMS_BACKEND_URL` | ❌ No | `https://cms.sparti.ai` | Backend API URL |
| `CMS_TENANT` | ❌ No | - | Tenant ID for branding |

## Examples

### Basic (No Backend)
```bash
DEPLOY_THEME_SLUG=landingpage npm run build:theme
DEPLOY_THEME_SLUG=landingpage PORT=4173 node scripts/serve-theme-static.js
```

### With Backend API
```bash
DEPLOY_THEME_SLUG=landingpage npm run build:theme
DEPLOY_THEME_SLUG=landingpage \
  CMS_BACKEND_URL=http://localhost:3000 \
  node scripts/serve-theme-static.js
```

### With Tenant Branding
```bash
DEPLOY_THEME_SLUG=landingpage npm run build:theme
DEPLOY_THEME_SLUG=landingpage \
  CMS_BACKEND_URL=http://localhost:3000 \
  CMS_TENANT=your-tenant-id \
  node scripts/serve-theme-static.js
```

## Troubleshooting

**Port already in use?**
```bash
PORT=4174 node scripts/serve-theme-static.js
```

**Build fails?**
```bash
# Check theme exists
ls sparti-cms/theme/landingpage/

# Rebuild
rm -rf dist
DEPLOY_THEME_SLUG=landingpage npm run build:theme
```

**Blank page?**
- Check browser console for errors
- Verify `dist/index.html` exists
- Check network tab for 404s

## Full Documentation

See [LOCAL_THEME_TESTING.md](./LOCAL_THEME_TESTING.md) for detailed information.

