# Railway Deployment Guide

## Overview

This guide covers deploying the GO SG website to Railway with both frontend and backend properly configured.

## Railway Configuration Files

### 1. railway.toml
```toml
[build]
builder = "NIXPACKS"
buildCommand = "npm run build"

[deploy]
startCommand = "npm start"
healthcheckPath = "/health"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

### 2. Procfile (alternative)
```
web: npm start
```

## Deployment Steps

### 1. Connect Repository to Railway

1. Go to [Railway](https://railway.app)
2. Create a new project
3. Connect your GitHub repository
4. Railway will automatically detect the `railway.toml` configuration

### 2. Environment Variables

Set these environment variables in Railway dashboard:

```
DATABASE_URL=postgresql://username:password@host:port/database
RESEND_API_KEY=your_resend_api_key
SMTP_FROM_EMAIL=noreply@gosg.com
NODE_ENV=production
PORT=4173
```

### 3. Build Process

Railway will automatically:
1. Install dependencies (`npm install`)
2. Run build command (`npm run build`) - creates `dist/` folder
3. Start the server (`npm start`) - serves built files + API

### 4. Verify Deployment

After deployment, check:
- **Frontend**: `https://your-app.railway.app/` - should show React app
- **API**: `https://your-app.railway.app/health` - should return health status
- **API**: `https://your-app.railway.app/api/contacts` - should return contacts

## Troubleshooting

### Issue: Frontend not loading (shows "Server is running but app not built")

**Solution**: Ensure Railway runs the build command before start:
1. Check that `railway.toml` has `buildCommand = "npm run build"`
2. Verify the build completes successfully in Railway logs
3. Check that `dist/` folder exists after build

### Issue: API endpoints not working

**Solution**: Check environment variables:
1. Verify `DATABASE_URL` is correctly set
2. Check Railway logs for database connection errors
3. Ensure PostgreSQL service is running

### Issue: CORS errors

**Solution**: The server already includes CORS headers for all origins in production.

## File Structure After Build

```
├── dist/                    # Built React app (created by npm run build)
│   ├── index.html
│   ├── assets/
│   │   ├── index-*.js
│   │   └── index-*.css
│   └── ...
├── server.js               # Express server (serves dist/ + API)
├── railway.toml           # Railway configuration
├── Procfile              # Alternative Railway config
└── package.json          # Scripts: build, start
```

## Production Workflow

1. **Build**: `npm run build` creates optimized static files in `dist/`
2. **Start**: `npm start` runs Express server that serves:
   - Static files from `dist/` (React app)
   - API endpoints at `/api/*`
   - Health check at `/health`

## Single Railway App

Use **one Railway app** because:
- ✅ Simpler deployment and management
- ✅ Lower cost
- ✅ Single domain/subdomain
- ✅ Server already configured to serve both frontend and API
- ✅ No CORS issues between services

## Monitoring

### Health Check
```bash
curl https://your-app.railway.app/health
```

### Logs
Check Railway dashboard logs for:
- Build process completion
- Server startup messages
- Database connection status
- API request/response logs

## Performance

The production setup includes:
- ✅ Gzipped static assets
- ✅ Proper cache headers
- ✅ Optimized React bundle
- ✅ PostgreSQL connection pooling
- ✅ Express compression middleware
