# Master Theme (Reference)

This document describes the **Master Theme** and why it exists.

## Purpose

The Master Theme is the project's **best-practice reference** for:

- theme folder structure
- theme routing (`pageSlug` → pages)
- CMS integration patterns (branding/settings, media URLs)
- deployable, production-ready theme code

If you are building a new theme, the intended workflow is to **duplicate** the Master Theme folder and then replace content/assets.

## Where it lives

- Code: `sparti-cms/theme/master/`
- Demo: `/theme/master`

## Key conventions

### Required files

- `index.tsx`
- `theme.json`
- `pages.json`

### Assets

- Static assets live in `sparti-cms/theme/<themeSlug>/assets/`
- Served at `/theme/<themeSlug>/assets/<file>`

Uploaded assets (Media Library) are served from `/uploads/...` and should be treated as runtime content.

### Pages

`pages.json` is the source of truth for which pages exist (and their SEO metadata).

Page-level components live in `sparti-cms/theme/master/pages/`.

## Duplication checklist

When duplicating `sparti-cms/theme/master/` into a new theme folder:

- Update `theme.json` (name/description/tags/demo_url)
- Update `pages.json` SEO metadata
- Replace assets in `assets/`
- Update copy/content in `index.tsx` and page components

The theme runtime avoids hardcoding the string `master` and uses the passed `tenantSlug` for theme-specific behavior.