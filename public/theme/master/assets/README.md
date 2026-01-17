# Master Theme Assets

This folder is the **public mirror** of `sparti-cms/theme/master/assets`.

Assets are served at:

- `/theme/master/assets/<file>`

## Why this exists

In local development (Vite), static assets are often served from `public/`.
The backend mirrors theme asset uploads here to keep asset URLs working consistently.

## Source of truth

Prefer editing assets in:

- `sparti-cms/theme/master/assets/`

…and keep the URLs stable.