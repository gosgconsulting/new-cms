# Master Theme (Reference)

This document describes the **Master Theme** and why it exists.

## Purpose

The Master Theme is a **best-practice reference** for:

- theme folder structure
- theme routing (`pageSlug` → pages)
- CMS integration patterns (branding/settings, media URLs)
- deployable, production-ready theme code

If you are building a new theme and you want a full, working example (not just a minimal scaffold), start from the Master Theme.

## Where it lives

- Code: `sparti-cms/theme/master/`
- Demo: `/theme/master`

## Key conventions

### Required files

- `index.tsx`
- `theme.json`
- `pages.json`

### Assets

- Static assets live in `sparti-cms/theme/master/assets/`
- Served at `/theme/master/assets/<file>`

Uploaded assets (Media Library) are served from `/uploads/...` and should be treated as runtime content.

### Pages

`pages.json` is the source of truth for which pages exist (and their SEO metadata).

Page-level components live in `sparti-cms/theme/master/pages/`.

## Recommended structure for child themes

When duplicating the Master Theme into a child theme, keep this structure and only change:

- content/copy
- assets
- component styling
- theme metadata (`theme.json`)
- SEO/page metadata (`pages.json`)

Avoid:

- mixing page components into `components/`
- hardcoding color values (use CSS vars driven from DB where possible)
