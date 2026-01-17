# Master Theme (`sparti-cms/theme/master`)

This theme is the **reference implementation** for how a theme should be structured so it:

- works cleanly with the **Sparti CMS** (pages, settings, uploads)
- stays **deployable** as a normal front-end theme
- is easy to **duplicate** into child themes (copy folder, replace content)

## What this theme demonstrates

- A **single entry** `index.tsx` that routes between pages using the `pageSlug` prop.
- A **standard folder structure**:
  - `components/` = reusable UI/layout pieces
  - `pages/` = route-level pages
  - `data/` = local seed / sample data
  - `assets/` = static theme assets (checked into git)
- **Branding from DB** via `useThemeBranding()` → applied as CSS variables.
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
  pages.json              # Theme page definitions (REQUIRED)
  theme.json              # Theme metadata (REQUIRED)
  theme.css               # Theme styles (RECOMMENDED)
  STYLE_RULES.md          # Styling conventions for child themes
```

## Asset conventions

### Static (git) assets

- Put static assets in: `sparti-cms/theme/master/assets/`
- They are served at: `/theme/master/assets/<file>`

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

- `/theme/master/` → Homepage
- `/theme/master/blog` → Blog list
- `/theme/master/blog/:slug` → Blog post
- `/theme/master/privacy-policy` → Legal page
- `/theme/master/terms-and-conditions` → Legal page
- `/theme/master/thank-you` → Thank you page

> Source of truth for **registered pages** is `pages.json`.

## Duplicating into a child theme

1. Copy the folder `sparti-cms/theme/master` → `sparti-cms/theme/<your-theme-slug>`
2. Update:
   - `theme.json` (name, description, tags, demo_url)
   - `pages.json` (SEO metadata)
   - `assets/` (logos/images)
3. Update the entry component:
   - `index.tsx` (branding hook argument + hardcoded copy)

## Notes

- Keep page-level components in `pages/`.
- Keep reusable pieces in `components/`.
- Prefer **CSS variables + Tailwind** over hardcoded colors.

See also:
- `sparti-cms/theme/master/STYLE_RULES.md`
- `sparti-cms/theme/README.md` (global theme system docs)
