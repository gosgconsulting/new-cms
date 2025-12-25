# Railway Simple Setup - Theme Deployment

## ✅ Copy & Paste Ready Configuration

**You only need to set ONE variable in Railway:**

```
DEPLOY_THEME_SLUG=landingpage
```

That's it! Everything else is auto-detected:

- ✅ **PORT** - Automatically set by Railway
- ✅ **VITE_API_BASE_URL** - Auto-detected from Railway domain (`RAILWAY_PUBLIC_DOMAIN`)
- ✅ **NODE_ENV** - Defaults to production in Dockerfile

## 🚀 How to Set It Up

1. Go to **Railway Dashboard** → Your Service → **Variables** tab
2. Click **+ New Variable**
3. Add:
   ```
   DEPLOY_THEME_SLUG=landingpage
   ```
4. Save and deploy

## 🔧 What Happens Automatically

- Railway provides `RAILWAY_PUBLIC_DOMAIN` (e.g., `your-app.railway.app`)
- Dockerfile auto-constructs `VITE_API_BASE_URL` as `https://${RAILWAY_PUBLIC_DOMAIN}`
- Railway provides `PORT` automatically
- Server starts on the provided port
- Healthcheck at `/health` responds immediately

## 📝 Optional: Custom Domain

If you want to use a custom domain instead of the auto-detected Railway domain:

```
DEPLOY_THEME_SLUG=landingpage
VITE_API_BASE_URL=https://your-custom-domain.com
```

## 🐛 Troubleshooting

### Healthcheck Failing
- Check Railway logs for server startup errors
- Verify `dist/` directory exists after build
- Ensure PORT is accessible
- Check that the server is binding to `0.0.0.0` (not `localhost`)

### Build Fails
- Check that `DEPLOY_THEME_SLUG` matches a theme in `sparti-cms/theme/`
- Verify theme has an `index.tsx` file
- Check build logs for specific errors

### Domain Not Working
- If auto-detection fails, manually set `VITE_API_BASE_URL`
- Check Railway service settings → Domains for your public domain
- Verify `RAILWAY_PUBLIC_DOMAIN` is available in Railway environment

## 📋 Complete Variable List (For Reference)

**Minimum Required:**
```
DEPLOY_THEME_SLUG=landingpage
```

**Auto-Detected (No need to set):**
- `PORT` - Railway provides automatically
- `RAILWAY_PUBLIC_DOMAIN` - Railway provides automatically
- `VITE_API_BASE_URL` - Auto-constructed from `RAILWAY_PUBLIC_DOMAIN`

**Optional Overrides:**
```
VITE_API_BASE_URL=https://your-custom-domain.com
```

