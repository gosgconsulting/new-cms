# Master Theme Assets

Put **static theme assets** (images, icons, logos, etc.) for the **master** theme here.

They are served at:

- `/theme/master/assets/<file>`

## What goes here

- ✅ assets that ship with the theme (checked into git)
- ✅ placeholders (e.g. `placeholder.svg`)
- ✅ theme preview images (e.g. `preview.svg`)

## What does NOT go here

- ❌ user uploads / media library files (those are stored per tenant and served under `/uploads/...`)
- ❌ any code (React components, JSON, etc.)

## Note about dev vs production

During development, some environments serve assets from `public/theme/master/assets`.
The backend also mirrors uploads to that folder for convenience.

When adding or changing assets, keep paths consistent and prefer referencing them via:

- `/theme/master/assets/<file>`