# Master Theme (`sparti-cms/theme/master`)

This theme is the **master reference** you can **duplicate 1:1** to create new themes.

It is structured so it:

- works cleanly with the **Sparti CMS** (pages, settings, uploads)
- stays **deployable** as a normal front-end theme
- is easy to duplicate without hunting for internal wiring

## What this theme demonstrates

- A **single entry** `index.tsx` that routes between pages using the `pageSlug` prop.
- A **standard folder structure**:
  - `components/` = reusable UI/layout pieces
  - `pages/` = route-level pages
  - `data/` = local seed / sample data
  - `assets/` = static theme assets (checked into git)
- **Branding from DB** via `useThemeBranding(themeSlug)` → applied as CSS variables.
- A **contact modal** that submits to `/api/form-submissions` and supports WhatsApp redirect.

## Folder structure

```txt
sparti-cms/theme/master/
  assets/                 # Static assets served at /theme/master/assets/*
  components/
    layout/               # Header/Footer, layout primitives
    modals/               # Theme-level modals
  data/                   # Sample local data (e.g. blog)
  pages/                  # Route-level pages
    blog/                 # Blog index + blog post pages
  index.tsx               # Theme entry (REQUIRED)
  pages.json              # Page definitions (REQUIRED)
  theme.json              # Theme metadata (REQUIRED)
  theme.css               # Theme styles (RECOMMENDED)
  STYLE_RULES.md          # Styling conventions for duplication
```

## Asset conventions

### Static (git) assets

- Put static assets in: `sparti-cms/theme/<themeSlug>/assets/`
- They are served at: `/theme/<themeSlug>/assets/<file>`

Example:

```tsx
<img src="/theme/master/assets/placeholder.svg" alt="Placeholder" />
```

### Uploaded (DB) assets

Uploaded media comes from the Media Library and typically returns URLs like:

- `/uploads/<tenant-storage>/<filename>`

Those URLs can be used anywhere an image URL is expected.

## Pages and routing

The theme routes based on `pageSlug`:

- `/theme/<themeSlug>/` → Homepage
- `/theme/<themeSlug>/blog` → Blog list
- `/theme/<themeSlug>/blog/:slug` → Blog post
- `/theme/<themeSlug>/privacy-policy` → Legal page
- `/theme/<themeSlug>/terms-and-conditions` → Legal page
- `/theme/<themeSlug>/thank-you` → Thank you page

> Source of truth for registered pages is `pages.json`.

## How to duplicate this theme (1:1)

When you duplicate this folder into a new theme slug, you should update these files:

1. `theme.json`
   - `name`, `description`, `tags`, `demo_url`, `documentation_url`
2. `pages.json`
   - SEO metadata (`meta_title`, `meta_description`, keywords)
3. `assets/`
   - replace placeholder assets with your brand assets

### Important note about slugs

This theme avoids hardcoding the string `master` in its runtime logic.
It uses the `tenantSlug` prop as the effective theme slug for:

- branding fetches
- asset URL building
- form submission names

So after duplication, most of the time you only need to adjust **metadata** + **copy/content**.

## Notes

- Keep page-level components in `pages/`.
- Keep reusable pieces in `components/`.
- Prefer CSS variables + Tailwind over hardcoded colors.

See also:
- `sparti-cms/theme/master/STYLE_RULES.md`
- `sparti-cms/theme/README.md` (global theme system docs)