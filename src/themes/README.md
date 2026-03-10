# CMS Theme System Documentation

## Overview

The CMS theme system allows for creating and managing custom themes that can be applied to tenants. This documentation provides a comprehensive guide for creating, registering, and migrating themes within the CMS.

## Recommended workflow

You have two valid starting points depending on what you need:

1) **Minimal scaffold** (fastest): start from a template under `sparti-cms/template/`.

2) **Full working reference** (recommended for production themes): **duplicate the Master Theme** at `sparti-cms/theme/master/`.

Avoid duplicating business-specific themes (they contain client branding/content).

## Theme vs Template

### Template (`sparti-cms/template/`)
- **Purpose**: Basic starting templates for new themes
- **Structure**: Simple, minimal components
- **Usage**: Used as a foundation when creating a minimal theme quickly

### Theme (`sparti-cms/theme/`)
- **Purpose**: Full-featured, production-ready themes
- **Structure**: Complete component ecosystem with assets, styling, and configuration
- **Usage**: Applied to tenants for their websites

## Master Theme (reference)

`sparti-cms/theme/master/` is a deliberately generic theme meant to be duplicated 1:1.

It demonstrates:
- best-practice folder structure
- page routing via `pageSlug`
- CMS integration patterns
- assets conventions

See: `sparti-cms/theme/master/README.md`

## Theme Structure

Every theme must follow this standardized structure:

```
sparti-cms/theme/{theme-slug}/
├── index.tsx                 # Main theme component (REQUIRED)
├── theme.json               # Theme metadata (REQUIRED)
├── pages.json               # Page definitions (REQUIRED)
├── theme.css                # Theme-specific styles (RECOMMENDED)
├── README.md                # Theme documentation (RECOMMENDED)
├── components/              # Theme components directory
│   ├── layout/              # Header/Footer, layout primitives
│   ├── modals/              # Theme-level modals
│   └── ui/                  # Reusable UI components (optional)
├── pages/                   # Route-level pages (recommended)
├── assets/                  # Theme assets directory
└── verify-assets.js         # Asset verification script (OPTIONAL)
```

## Mandatory Setup Requirements

### Minimum Required Files

Every theme MUST have these files to function properly:

1. `index.tsx` - Main theme component (MANDATORY)
2. `theme.json` - Theme metadata and configuration (MANDATORY)
3. `pages.json` - Page definitions and SEO settings (MANDATORY)

---

## Note

This repository contains extensive operational notes below (setup, migrations, troubleshooting). Those remain valid.
The key change is the recommended approach:

- **Duplicate the Master Theme** for a production-ready base
- Use templates only if you want a minimal starting point