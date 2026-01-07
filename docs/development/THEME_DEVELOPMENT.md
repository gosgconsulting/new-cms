# Theme Development Guide

This guide explains how to develop themes locally with hot reload, without Docker.

## Quick Start

```bash
# Start development server for landingpage theme
npm run dev:theme landingpage

# Or use environment variable
DEPLOY_THEME_SLUG=landingpage npm run dev:theme
```

The theme will be available at `http://localhost:8080/` with hot module replacement (HMR) enabled.

## How It Works

1. **Development Entry Point**: Creates `src/theme-dev.tsx` that loads your theme at root path (`/`)
2. **HTML Modification**: Temporarily modifies `index.html` to use the theme-dev entry point
3. **Vite Dev Server**: Starts Vite with HMR for instant feedback
4. **Auto Cleanup**: Restores original `index.html` when you stop the server

## Available Themes

- `landingpage` - ACATR Business Services theme
- `sparti-seo-landing` - Sparti SEO Landing theme
- `gosgconsulting` - GO SG Consulting theme

## Development Workflow

### Basic Development

```bash
# 1. Start theme development server
npm run dev:theme landingpage

# 2. Open browser to http://localhost:8080/
# 3. Edit theme files in sparti-cms/theme/landingpage/
# 4. Changes appear instantly (HMR)
# 5. Press Ctrl+C to stop
```

### With Backend API

If your theme needs to make API calls:

```bash
# Terminal 1: Start backend (if needed)
npm run dev:backend

# Terminal 2: Start theme development
npm run dev:theme landingpage
```

The Vite dev server proxies `/api/*` requests to `http://localhost:4173` (configured in `vite.config.ts`).

### Switching Themes

You can switch themes in two ways:

1. **Restart with different theme**:
   ```bash
   npm run dev:theme sparti-seo-landing
   ```

2. **Via URL parameter** (if supported):
   ```
   http://localhost:8080/?theme=sparti-seo-landing
   ```

## File Structure

When developing a theme, you'll work with:

```
sparti-cms/theme/landingpage/
├── index.tsx              # Main theme component
├── components/            # Theme-specific components
│   ├── Header.tsx
│   ├── HeroSection.tsx
│   └── ...
├── assets/                # Theme assets (images, etc.)
├── theme.css              # Theme styles
├── theme.json             # Theme metadata
└── pages.json             # Page definitions
```

## Development Features

### Hot Module Replacement (HMR)

- ✅ Edit React components → See changes instantly
- ✅ Edit CSS files → Styles update without page reload
- ✅ Edit TypeScript → Automatic recompilation
- ✅ Edit theme files → Theme reloads automatically

### Development Tools

- **React DevTools**: Available in browser
- **Vite DevTools**: Built into Vite
- **Console Logging**: Use `console.log` for debugging
- **Source Maps**: Full source map support for debugging

### Environment Variables

The development server sets:

- `VITE_DEV_THEME_SLUG` - Current theme slug
- `DEPLOY_THEME_SLUG` - Same as above (for compatibility)

You can access these in your code:

```typescript
const themeSlug = import.meta.env.VITE_DEV_THEME_SLUG;
```

## Common Development Tasks

### Adding a New Component

1. Create component in `sparti-cms/theme/landingpage/components/`
2. Import and use in `index.tsx`
3. Changes appear instantly with HMR

### Modifying Styles

1. Edit `theme.css` or component CSS
2. Styles update without page reload
3. Use browser DevTools to inspect

### Testing API Calls

1. Ensure backend is running (`npm run dev:backend`)
2. Make API calls from theme components
3. Check Network tab in DevTools
4. API requests are proxied to `http://localhost:4173/api`

### Debugging

1. Use `console.log` for debugging
2. Use React DevTools for component inspection
3. Use browser DevTools for network/performance
4. Check Vite console for build errors

## Troubleshooting

### Theme Not Loading

**Error**: Theme component not found

**Solution**:
1. Verify theme exists: `ls sparti-cms/theme/landingpage/`
2. Check `index.tsx` exists in theme directory
3. Verify theme is exported correctly

### Hot Reload Not Working

**Symptoms**: Changes don't appear automatically

**Solution**:
1. Check Vite console for errors
2. Hard refresh browser (Ctrl+Shift+R)
3. Restart dev server
4. Check file is being watched (not in `.gitignore`)

### Port Already in Use

**Error**: Port 8080 is already in use

**Solution**:
1. Stop other dev servers
2. Or modify `vite.config.ts` to use different port
3. Or use `--port` flag: `npx vite --port 3000`

### API Proxy Not Working

**Error**: API requests fail

**Solution**:
1. Verify backend is running on port 4173
2. Check `vite.config.ts` proxy configuration
3. Check backend CORS settings
4. Verify API endpoint exists

### index.html Not Restored

**Error**: Original index.html not restored after stopping

**Solution**:
1. Check for `index.html.backup-dev` file
2. Manually restore if needed:
   ```bash
   cp index.html.backup-dev index.html
   rm index.html.backup-dev
   ```

## Comparison: Development vs Production

| Feature | Development (`dev:theme`) | Production (`build:theme`) |
|---------|-------------------------|---------------------------|
| Hot Reload | ✅ Yes | ❌ No |
| Build Time | Instant | ~30-60 seconds |
| File Size | Larger (dev mode) | Optimized |
| Source Maps | Full | Production |
| Error Messages | Detailed | Minified |
| Use Case | Development | Deployment |

## Best Practices

1. **Use HMR**: Make small changes and see them instantly
2. **Test in Browser**: Always test in actual browser, not just terminal
3. **Check Console**: Monitor browser console for errors
4. **Version Control**: Commit theme changes regularly
5. **Backup**: The script auto-backups `index.html`, but commit before major changes

## Next Steps

After developing your theme:

1. **Test Locally**: Use `npm run dev:theme` to develop
2. **Build for Production**: Use `npm run build:theme` to create production build
3. **Test Production Build**: Use `npm run test:theme:local` to test built theme
4. **Deploy**: Deploy to Railway or other platform

## Related Documentation

- [Local Theme Testing](./LOCAL_THEME_TESTING.md) - Testing built themes
- [Theme Static Deployment](../deployment/THEME_STATIC_DEPLOYMENT.md) - Production deployment
- [Theme README](../../sparti-cms/theme/landingpage/README.md) - Theme-specific docs

