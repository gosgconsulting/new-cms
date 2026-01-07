# Quick Start: Theme Development

## Fastest Way

```bash
# Start developing the landingpage theme
npm run dev:theme landingpage
```

Then open: `http://localhost:8080/`

## What Happens

1. ✅ Theme loads at root path (`/`)
2. ✅ Hot reload enabled - edit files, see changes instantly
3. ✅ Vite dev server runs on port 8080
4. ✅ API requests proxied to backend (if running)

## Available Themes

```bash
npm run dev:theme landingpage        # ACATR Business Services
npm run dev:theme sparti-seo-landing # Sparti SEO Landing
npm run dev:theme gosgconsulting     # GO SG Consulting
```

## Development Workflow

```bash
# Terminal 1: Start theme dev server
npm run dev:theme landingpage

# Terminal 2: (Optional) Start backend for API calls
npm run dev:backend

# Browser: Open http://localhost:8080/
# Edit files in sparti-cms/theme/landingpage/
# See changes instantly!
```

## Tips

- **Hot Reload**: Changes appear automatically
- **API Proxy**: `/api/*` requests go to `http://localhost:4173`
- **Stop Server**: Press `Ctrl+C` to stop (auto-restores files)
- **Switch Theme**: Restart with different theme slug

## Troubleshooting

**Port in use?**
```bash
# Kill process on port 8080
lsof -ti:8080 | xargs kill -9
```

**Theme not found?**
```bash
# Check available themes
ls sparti-cms/theme/
```

**Changes not appearing?**
- Hard refresh browser (Ctrl+Shift+R)
- Check Vite console for errors
- Restart dev server

## Full Documentation

See [THEME_DEVELOPMENT.md](./THEME_DEVELOPMENT.md) for detailed information.

