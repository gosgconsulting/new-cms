# Production Deployment Guide

## Server-Rendered Pages (Hybrid SSR) and Caching

This project supports hybrid SSR with full-page caching for fast, static-like delivery while keeping the SPA intact.

### Endpoints

- Rendered pages (SSR):
  - `GET /r/:slug` → returns fully rendered HTML for the page with slug (e.g., `/r/`, `/r/blog`).

- Layout API (JSON schema per page):
  - `GET /api/pages/:slug/layout` → fetch layout JSON for slug
  - `PUT /api/pages/:slug/layout` → update layout JSON for slug
  - Alternative (supports encoded slashes in query):
    - `GET /api/layout?slug=%2F`
    - `PUT /api/layout?slug=%2F`

- Cache controls:
  - `POST /api/cache/invalidate` → body options:
    - `{ "slug": "/" }` → clear specific page cache
    - `{ "all": true }` → clear all cached pages

### Layout JSON schema

```json
{
  "components": [
    { "key": "Header", "props": {} },
    { "key": "HeroSection", "props": { "headline": "Rank #1 on Google" } },
    { "key": "SEOResultsSection", "props": {} },
    { "key": "SEOServicesShowcase", "props": { "cta": "Get a Quote" } },
    { "key": "NewTestimonials", "props": {} },
    { "key": "FAQAccordion", "props": { "title": "Frequently Asked Questions" } },
    { "key": "BlogSection", "props": {} },
    { "key": "ContactForm", "props": {} },
    { "key": "Footer", "props": {} }
  ]
}
```

### Environment variables

- `CACHE_TTL_SECONDS` (default: `600`) → in-memory page cache TTL

### Invalidation rules

- Updating branding/SEO via `POST /api/branding` triggers a global cache clear
- Updating a page layout via `PUT /api/pages/:slug/layout` clears cache for that slug only

### Typical production wiring

- Keep SPA routes served as-is from `dist/` for interactive users
- Point crawlers and performance-critical paths to `/r/:slug` via CDN/edge or sitemap
- Use cache invalidation endpoint in admin tooling on content/settings changes

## Overview

This guide covers how to deploy the GO SG website to production using Vite for the frontend build and Node.js/Express for the backend server.

**Recommended deployment: Vercel.** This project is configured for Vercel by default (no Nixpacks or Railway config in the repo). Vercel runs the full CMS (SPA + serverless API). Theme-only static deploys are a separate flow (e.g. `npm run build:theme` and deploy the `dist/` output elsewhere).

## Development vs Production

### Development Mode
```bash
# Run both frontend (Vite dev server) and backend simultaneously
npm run dev
```
- Frontend: Vite dev server (http://localhost:8080)
- Backend: Node.js server (http://localhost:4173)
- Hot reloading enabled
- Source maps available

### Production Mode
```bash
# Build frontend and start production server
npm run build
npm start
```
- Frontend: Built static files served by Node.js server
- Backend: Node.js server (http://localhost:4173)
- Optimized and minified assets
- No hot reloading

## Production Build Process

### 1. Build the Frontend

```bash
# Build the React app for production
npm run build
```

This command:
- Optimizes and minifies all assets
- Creates a `dist/` folder with production-ready files
- Generates source maps for debugging
- Optimizes images and assets

### 2. Start the Production Server

```bash
# Start the production server (serves both API and static files)
npm start
```

**Important**: `npm start` runs in production mode and serves the built static files from `dist/` folder.

The server will:
- Serve the built React app from `dist/` (not Vite dev server)
- Provide API endpoints at `/api/*`
- Handle database connections
- Serve static assets with proper caching headers

## Production Environment Setup

### Required Environment Variables

Create a `.env` file with these production variables:

```bash
# Database Configuration (REQUIRED)
DATABASE_URL=postgresql://username:password@hostname:port/database

# Server Configuration
PORT=4173
NODE_ENV=production

# Email Configuration (REQUIRED for contact forms)
RESEND_API_KEY=your_resend_api_key_here
SMTP_FROM_EMAIL=noreply@gosg.com

# Frontend API Configuration
VITE_API_BASE_URL=https://your-domain.com
```

### Database Setup

1. **Create PostgreSQL Database**:
   ```sql
   CREATE DATABASE gosg_website;
   CREATE USER gosg_user WITH PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE gosg_website TO gosg_user;
   ```

2. **Initialize Tables**: The server automatically creates all required tables on startup.

## Deployment Options

### Option 1: Vercel (recommended)

The backend runs as Vercel Serverless Functions. There is no always-on Node server; the Express app is invoked per request via the Build Output API handler at `server/vercel-handler.js`, bundled into `.vercel/output/functions/api/index.func/`. Static files are copied to `.vercel/output/static/` and served by the CDN; only API, health, theme, SSR, and SPA fallback routes hit the function.

#### Why Vercel (best practice)

We deploy without Docker using Vercel’s build system: the frontend builds to static assets; API and server logic run as Vercel Functions (serverless). This is preferred because it gives the fastest deploys and caching, preview URLs, automatic scaling, no container management, and tight integration with Vercel routing, environment variables, logs, and analytics. This project matches that pattern: the build script (`scripts/build-vercel-output.js`) runs Vite (or theme build), copies output to `.vercel/output/static/`, and bundles the Express app into `.vercel/output/functions/api/index.func/` (Build Output API); the default flow uses no Docker.

#### Quick Vercel deploy

1. **Connect repo**: In Vercel, import your Git repository. No `railway.toml` or `nixpacks.toml` is used; build and rewrites are defined in `vercel.json`.
2. **Environment variables**: In the Vercel project, set: `DATABASE_URL`, `BLOB_READ_WRITE_TOKEN` (Vercel Blob), `RESEND_API_KEY`, `SMTP_FROM_EMAIL`, `NODE_ENV=production`. Prefer `DATABASE_PUBLIC_URL` and `DATABASE_POOL_MAX=5` for serverless.
3. **Deploy**: Vercel runs `npm install` then the build command (`node scripts/build-vercel-output.js`), which produces `.vercel/output/` (static + serverless function). All set.

#### Full Vercel setup (details)

1. **Setup Vercel**:
   ```bash
   npm install -g vercel
   vercel login
   vercel
   ```

2. **Build settings** (in `vercel.json`):
   - Build Command: `node scripts/build-vercel-output.js`
   - Output Directory: `.vercel/output`
   - The build script runs Vite (or theme build), copies `dist/` to `.vercel/output/static/`, bundles the serverless entry (`server/vercel-handler.js`) into `.vercel/output/functions/api/index.func/`, and writes `config.json` and `.vc-config.json` (Build Output API).

3. **Environment Variables** (Vercel Dashboard):
   ```
   DATABASE_URL=postgresql://...
   DATABASE_PUBLIC_URL=postgresql://...   # optional, preferred for serverless
   DATABASE_POOL_MAX=5                    # recommended for serverless (default 20)
   BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...  # required for file uploads (Vercel Blob)
   RESEND_API_KEY=your_key
   SMTP_FROM_EMAIL=noreply@gosg.com
   NODE_ENV=production
   ```
   - **Uploads**: When `BLOB_READ_WRITE_TOKEN` (or `VERCEL`) is set, file uploads go to Vercel Blob; otherwise they use disk (`public/uploads/`). On Vercel the filesystem is read-only, so Blob is required for uploads.
   - **Database pool**: Set `DATABASE_POOL_MAX=5` (or lower) so many concurrent invocations do not exhaust Postgres connections. For larger scale, consider a serverless Postgres provider (e.g. Neon, Supabase) with connection pooling.

#### Vercel serverless behaviour

- **Entry point**: Only `server/app.js` is loaded; `server/index.js` (and its `app.listen()`, DB init, theme sync on startup) is not run. The handler is `server/vercel-handler.js` (bundled into `api/index.func`) → `app(req, res)`.
- **Database**: The pool is created lazily on first query (`sparti-cms/db/connection.js`). No startup DB init is required.
- **Theme sync**: Theme sync does not run at "startup" on Vercel. It runs on-demand when the themes API is used (e.g. listing or syncing themes). Rely on that for serverless.
- **Page cache**: SSR page cache (`/r/:slug`) is in-memory and per serverless instance. For shared cache across instances, you can add Vercel KV later and wire it in `sparti-cms/cache`.
- **Static files**: Vercel serves files from `.vercel/output/static/` (a copy of `dist/`) before applying rewrites, so `/assets/*` and other built assets are served from the CDN, not the function.

4. **Testing and rollout**:
   - Run `vercel dev` locally (or deploy to a preview) and smoke-test: `GET /health`, login, key API routes, theme routes, and SPA load. Confirm static assets are served from the CDN (no function logs for `/assets/*`).
   - Test file uploads end-to-end with `BLOB_READ_WRITE_TOKEN` set; responses should return Blob URLs.
   - Optionally run backend tests with `VERCEL=1` and `DATABASE_POOL_MAX=2` to catch serverless-specific issues.
   - Deploy to Vercel and validate, then switch traffic (domain or feature flag) as needed.

### Option 2: Traditional VPS/Dedicated Server

1. **Setup Server**:
   ```bash
   # Install Node.js (v18+)
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PostgreSQL
   sudo apt-get install postgresql postgresql-contrib
   
   # Install PM2 for process management
   sudo npm install -g pm2
   ```

2. **Deploy Application**:
   ```bash
   # Clone repository
   git clone <your-repo-url>
   cd gosgwebsite
   
   # Install dependencies
   npm install
   
   # Build for production
   npm run build
   
   # Start with PM2
   pm2 start server.js --name "gosg-website"
   pm2 save
   pm2 startup
   ```

3. **Setup Nginx Reverse Proxy**:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:4173;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

For non-Vercel hosts, use the same environment variables (e.g. `DATABASE_URL`, `VITE_API_BASE_URL`) and run a Node server; see Option 2 (VPS) for a traditional setup.

## Performance Optimization

### 1. Enable Gzip Compression

The server already includes compression middleware for static files.

### 2. Set Cache Headers

Static assets are served with appropriate cache headers:
- HTML: No cache (always fresh)
- CSS/JS: Long-term cache with versioning
- Images: Medium-term cache

### 3. Database Optimization

- Ensure PostgreSQL is configured with appropriate memory settings
- Create indexes on frequently queried columns
- Regular database maintenance and cleanup

## Monitoring and Maintenance

### 1. Health Checks

Monitor the health endpoint:
```bash
curl https://your-domain.com/health
```

### 2. Log Monitoring

```bash
# PM2 logs
pm2 logs gosg-website

# System logs
journalctl -u nginx -f
```

### 3. Database Backups

```bash
# Daily backup script
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

## Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **Database Security**: Use strong passwords and limit access
3. **HTTPS**: Always use SSL certificates in production
4. **CORS**: Configure appropriate CORS policies
5. **Rate Limiting**: Consider implementing rate limiting for API endpoints

## Troubleshooting

### Common Issues

1. **Build Fails**:
   ```bash
   # Clear cache and rebuild
   rm -rf node_modules dist
   npm install
   npm run build
   ```

2. **Database Connection Issues**:
   - Verify `DATABASE_URL` format
   - Check database server accessibility
   - Ensure user permissions

3. **Static Files Not Loading**:
   - Verify `dist/` folder exists
   - Check file permissions
   - Ensure server is serving from correct directory

### Performance Issues

1. **Large Bundle Size**: Consider code splitting
2. **Slow Database Queries**: Add indexes and optimize queries
3. **High Memory Usage**: Monitor and restart services if needed

## Quick Production Commands

```bash
# Complete production setup
npm install
npm run build
npm start

# With PM2
pm2 start server.js --name "gosg-website"
pm2 restart gosg-website

# Health check
curl http://localhost:4173/health
```

## File Structure After Build

```
gosgwebsite/
├── dist/                    # Production build output
│   ├── index.html          # Main HTML file
│   ├── assets/             # Optimized CSS, JS, images
│   └── uploads/            # User uploaded files
├── server.js               # Production server
├── sparti-cms/             # Database and CMS logic
├── .env                    # Production environment variables
└── package.json            # Dependencies and scripts
```

The production setup is now complete and ready for deployment! 🚀
