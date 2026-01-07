# Local Theme Testing Guide (Without Docker)

This guide explains how to **test** a built theme locally without Docker.

> **Note**: For **development** with hot reload, see [Theme Development Guide](../development/THEME_DEVELOPMENT.md) instead.

## Prerequisites

- Node.js >= 20.19.0
- npm >= 10.0.0
- All dependencies installed (`npm install`)

## Quick Start

### Step 1: Build the Theme

Build the static theme export for your desired theme:

```bash
# Option 1: Using npm script with environment variable
DEPLOY_THEME_SLUG=landingpage npm run build:theme

# Option 2: Using npm script with argument (if supported)
npm run build:theme landingpage

# Option 3: Direct script execution
DEPLOY_THEME_SLUG=landingpage node scripts/build-theme-static.js
```

This will:
- Create a standalone entry point (`src/theme-standalone.tsx`)
- Build the theme to `dist/` directory
- Clean up temporary files after build

### Step 2: Start the Theme Server

After building, start the static theme server:

```bash
# Set required environment variables
export DEPLOY_THEME_SLUG=landingpage
export PORT=4173

# Optional: Set backend API URL (if theme needs to make API calls)
export CMS_BACKEND_URL=http://localhost:3000
# OR
export VITE_API_BASE_URL=http://localhost:3000

# Optional: Set tenant ID (if you want to test tenant-specific branding)
export CMS_TENANT=your-tenant-id

# Start the server
node scripts/serve-theme-static.js
```

### Step 3: Access Your Theme

Open your browser and navigate to:
- `http://localhost:4173/` - Theme homepage
- `http://localhost:4173/health` - Health check endpoint

## Complete Example

Here's a complete example for testing the `landingpage` theme:

```bash
# 1. Build the theme
DEPLOY_THEME_SLUG=landingpage npm run build:theme

# 2. Start the server with all environment variables
DEPLOY_THEME_SLUG=landingpage \
CMS_BACKEND_URL=http://localhost:3000 \
CMS_TENANT=your-tenant-id \
PORT=4173 \
node scripts/serve-theme-static.js
```

## Environment Variables

### Required Variables

- `DEPLOY_THEME_SLUG` - The theme slug to build/serve (e.g., `landingpage`, `sparti-seo-landing`, `gosgconsulting`)

### Optional Variables

- `PORT` - Server port (default: `4173`)
- `CMS_BACKEND_URL` - Backend API URL for proxying API requests (default: `https://cms.sparti.ai`)
- `VITE_API_BASE_URL` - Alternative way to set backend API URL (takes precedence over `CMS_BACKEND_URL`)
- `CMS_TENANT` - Tenant ID for tenant-specific branding injection

## Available Themes

- `landingpage` - ACATR Business Services theme
- `sparti-seo-landing` - Sparti SEO Landing theme
- `gosgconsulting` - GO SG Consulting theme

## Testing Different Scenarios

### Test 1: Basic Theme (No Backend)

```bash
# Build
DEPLOY_THEME_SLUG=landingpage npm run build:theme

# Serve (no backend connection)
DEPLOY_THEME_SLUG=landingpage PORT=4173 node scripts/serve-theme-static.js
```

### Test 2: Theme with Backend API

```bash
# Build
DEPLOY_THEME_SLUG=landingpage npm run build:theme

# Serve with backend API (assuming backend runs on port 3000)
DEPLOY_THEME_SLUG=landingpage \
CMS_BACKEND_URL=http://localhost:3000 \
PORT=4173 \
node scripts/serve-theme-static.js
```

### Test 3: Theme with Tenant Branding

```bash
# Build
DEPLOY_THEME_SLUG=landingpage npm run build:theme

# Serve with tenant branding injection
DEPLOY_THEME_SLUG=landingpage \
CMS_BACKEND_URL=http://localhost:3000 \
CMS_TENANT=your-tenant-id \
PORT=4173 \
node scripts/serve-theme-static.js
```

## What the Server Does

The `serve-theme-static.js` script:

1. **Serves Static Files**: Serves files from `dist/` directory
2. **Health Check**: Provides `/health` endpoint for monitoring
3. **API Proxy**: Proxies `/api/*` requests to backend CMS (if `CMS_BACKEND_URL` is set)
4. **HTML Injection**: Injects `window.__CMS_TENANT__` and `window.__BRANDING_SETTINGS__` into HTML
5. **SPA Routing**: Handles client-side routing for React Router

## Troubleshooting

### Build Fails

**Error**: `Theme "landingpage" not found`

**Solution**: Verify the theme exists at `sparti-cms/theme/landingpage/`

```bash
ls -la sparti-cms/theme/landingpage/
```

### Server Fails to Start

**Error**: `Port 4173 is already in use`

**Solution**: Use a different port:

```bash
PORT=4174 node scripts/serve-theme-static.js
```

### Theme Shows Blank Page

**Possible Causes**:
1. Build failed - check `dist/` directory exists and has files
2. JavaScript errors - check browser console
3. Missing assets - check network tab for 404 errors

**Solution**:
```bash
# Rebuild the theme
DEPLOY_THEME_SLUG=landingpage npm run build:theme

# Check dist directory
ls -la dist/

# Check for index.html
cat dist/index.html
```

### API Proxy Not Working

**Error**: API requests fail or return 500

**Solution**: 
1. Verify backend is running and accessible
2. Check `CMS_BACKEND_URL` is correct
3. Check server logs for proxy errors
4. Verify backend accepts requests from the proxy

### Branding Not Loading

**Error**: `window.__BRANDING_SETTINGS__` is undefined

**Solution**:
1. Verify `CMS_TENANT` is set correctly
2. Check database connection (server needs database access for branding)
3. Check server logs for branding fetch errors
4. Verify tenant exists in database

## Development Workflow

For active development, you can use this workflow:

```bash
# Terminal 1: Watch and rebuild theme
DEPLOY_THEME_SLUG=landingpage npm run build:theme
# (Re-run when you make changes)

# Terminal 2: Run the server
DEPLOY_THEME_SLUG=landingpage \
CMS_BACKEND_URL=http://localhost:3000 \
CMS_TENANT=your-tenant-id \
PORT=4173 \
node scripts/serve-theme-static.js
```

## Comparison with Docker

| Aspect | Local (No Docker) | Docker |
|--------|-------------------|--------|
| Build | `npm run build:theme` | Automatic in Dockerfile |
| Serve | `node scripts/serve-theme-static.js` | `docker run` or Railway |
| Environment | Manual export/set | Docker env vars |
| Database | Needs local DB connection | Containerized DB |
| Port | Manual `PORT` env var | Docker port mapping |

## Notes

- The build script creates temporary files that are cleaned up after build
- The server reads from `dist/` directory - make sure to build first
- For production-like testing, set `NODE_ENV=production`
- The server supports hot-reloading if you rebuild while it's running (just refresh browser)

## Next Steps

After local testing:
1. Verify theme renders correctly
2. Test API proxy functionality (if using backend)
3. Test tenant branding injection (if using `CMS_TENANT`)
4. Check browser console for errors
5. Test responsive design on different screen sizes
6. Deploy to Railway with same environment variables

