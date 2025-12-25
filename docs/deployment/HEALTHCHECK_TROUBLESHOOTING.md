# Healthcheck Troubleshooting Guide

## Issue: Healthcheck Failing for Theme Deployment

### Symptoms
- Healthcheck fails with "service unavailable"
- Multiple retry attempts fail
- Deployment marked as unhealthy

### Root Causes

1. **Server Not Starting**
   - Build may have failed silently
   - Server import may be failing
   - Missing dependencies or files

2. **Port Binding Issues**
   - Server can't bind to port 4173
   - Port already in use (unlikely in container)
   - Permission issues

3. **Route Registration**
   - Health route not registered
   - Routes registered after server starts
   - Express app not properly initialized

4. **File Permissions**
   - Non-root user can't read files
   - dist directory not accessible
   - Scripts not executable

### Debugging Steps

1. **Check Build Logs**
   ```bash
   # Look for build errors
   # Verify dist directory was created
   # Check for missing files
   ```

2. **Check Server Logs**
   ```bash
   # Look for "Server running on port"
   # Check for import errors
   # Verify health route is registered
   ```

3. **Verify Files Exist**
   - `dist/` directory exists
   - `dist/index.html` exists
   - `server/` directory copied
   - Scripts are executable

### Fixes Applied

1. ✅ Added build verification step
2. ✅ Added error handling to build commands
3. ✅ Enhanced entrypoint with server readiness check
4. ✅ Added better error logging

### Testing

```bash
# Test locally
docker build -f Dockerfile --build-arg DEPLOY_THEME_SLUG=landingpage --build-arg VITE_API_BASE_URL=https://cms.sparti.ai -t cms-test .
docker run -p 4173:4173 --env-file .env cms-test

# Check health
curl http://localhost:4173/health

# Check logs
docker logs <container-id>
```

### Common Issues

#### Issue: Build Succeeds But dist is Empty
**Cause**: Build script failed but didn't exit  
**Fix**: Added `|| exit 1` to build commands

#### Issue: Server Crashes on Import
**Cause**: Missing files or dependencies  
**Fix**: Enhanced error logging in entrypoint

#### Issue: Health Route Not Found
**Cause**: Routes not registered before server starts  
**Fix**: Health route is registered first in routes/index.js

### Railway-Specific

Railway healthcheck:
- Path: `/health`
- Timeout: 60 seconds
- Interval: 10 seconds
- Retries: Multiple attempts

If healthcheck fails:
1. Check Railway logs for errors
2. Verify server is starting
3. Check if port 4173 is accessible
4. Verify environment variables are set

