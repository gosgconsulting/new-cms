# Theme CSS Guidelines

## Overview

This document provides best practices for creating theme CSS files that are compatible with the CMS and won't cause conflicts with other themes or the main application.

## Critical Rules

### ❌ DO NOT Import Tailwind CSS

**Wrong:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* OR */

@import "tailwindcss";
```

**Why:** Tailwind CSS is already imported globally in `src/index.css`. Re-importing it in themes causes:
- Build errors in Tailwind v4
- CSS conflicts
- Slower build times
- Potential styling bugs across the entire CMS

**Right:**
```css
/* Hotel Theme Custom Styles */
/* Note: Tailwind CSS is already loaded globally via src/index.css */

.h2 {
  font-size: 45px;
  margin-bottom: 1rem;
}
```

### ✅ DO Use CSS Variables for Theme Colors

**Good:**
```css
.btn-primary {
  background-color: var(--brand-accent, #a37d4c);
}

.btn-primary:hover {
  background-color: var(--brand-accent-dark, #967142);
}
```

**Why:** CSS variables can be dynamically overridden by the CMS branding system, allowing themes to adapt to tenant-specific colors without code changes.

### ✅ DO Import Custom Fonts

**Good:**
```css
@import url('https://fonts.googleapis.com/css2?family=Gilda+Display&display=swap');

.font-primary {
  font-family: 'Gilda Display', serif;
}
```

**Why:** Custom fonts are theme-specific and should be loaded by the theme, not the main app.

### ⚠️ CONSIDER Scoping Your Styles

**Best Practice (STR Theme Pattern):**
```css
@import url('https://fonts.googleapis.com/...');

.str-theme {
  --background: 0 0% 12%;
  --primary: 0 100% 44%;
  
  /* All theme styles nested inside */
}

.str-theme .h2 {
  font-size: 45px;
}

.str-theme .btn {
  padding: 1rem 2rem;
}
```

**Usage in theme component:**
```tsx
return (
  <div className="str-theme">
    <Header />
    <main>{content}</main>
    <Footer />
  </div>
);
```

**Why:** Scoping prevents your theme styles from affecting other themes or the CMS admin interface.

### ❌ DON'T Use Global Class Names

**Wrong (affects entire app):**
```css
.button {
  background: red;
}

.card {
  padding: 1rem;
}
```

**Right (scoped or specific):**
```css
.hotel-button {
  background: var(--brand-accent);
}

.hotel-card {
  padding: 1rem;
}

/* OR better, with scoping */
.hotel-theme .button {
  background: var(--brand-accent);
}
```

## Theme CSS Template

Here's a recommended template for new theme CSS files:

```css
/* Import custom fonts (if needed) */
@import url('https://fonts.googleapis.com/css2?family=Your+Font&display=swap');

/* Theme Name Custom Styles */
/* Note: Tailwind CSS is already loaded globally via src/index.css */

/* ============================================
   CSS Variables for Theme Branding
   ============================================ */

:root {
  /* These can be overridden by CMS branding system */
  --brand-primary: #000000;
  --brand-accent: #ff0000;
  --brand-accent-dark: #cc0000;
  --brand-accent-light: #ff3333;
}

/* ============================================
   Theme-Specific Typography
   ============================================ */

.theme-name .h1 {
  font-family: 'Your Font', serif;
  font-size: 3rem;
  font-weight: 700;
}

.theme-name .h2 {
  font-family: 'Your Font', serif;
  font-size: 2.5rem;
  font-weight: 600;
}

/* ============================================
   Theme-Specific Components
   ============================================ */

.theme-name .btn-primary {
  background-color: var(--brand-accent);
  color: white;
  padding: 1rem 2rem;
  border-radius: 0.5rem;
  transition: background-color 0.3s;
}

.theme-name .btn-primary:hover {
  background-color: var(--brand-accent-dark);
}

/* ============================================
   Third-Party Component Customizations
   ============================================ */

/* Example: react-datepicker customization */
.react-datepicker__header {
  background-color: var(--brand-accent);
}

/* Example: Custom scrollbar */
html::-webkit-scrollbar-thumb {
  background-color: var(--brand-accent);
}
```

## Common Patterns by Theme Type

### Landing Page Theme

**Focus:** Clean, marketing-focused styles with CTAs

```css
.landing-theme .hero-title {
  font-size: 4rem;
  font-weight: 800;
  line-height: 1.1;
}

.landing-theme .cta-button {
  background: linear-gradient(to right, var(--brand-primary), var(--brand-accent));
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}
```

### E-commerce Theme

**Focus:** Product cards, cart, checkout styles

```css
.shop-theme .product-card {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  transition: box-shadow 0.3s;
}

.shop-theme .product-card:hover {
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.shop-theme .price {
  color: var(--brand-accent);
  font-weight: 700;
  font-size: 1.5rem;
}
```

### Hotel/Booking Theme

**Focus:** Room cards, booking forms, date pickers

```css
.hotel-theme .room-card {
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.hotel-theme .booking-form input {
  border: 1px solid #d1d5db;
  padding: 0.75rem 1rem;
}

.hotel-theme .room-price {
  color: var(--brand-accent);
  font-size: 1.25rem;
  font-weight: 600;
}
```

## Tailwind Utility Classes in Themes

### ✅ You CAN Use Tailwind Utilities

Since Tailwind is loaded globally, you can use utility classes in your JSX/TSX:

```tsx
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
  <h2 className="text-2xl font-bold text-gray-900">Room Title</h2>
  <button className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700">
    Book Now
  </button>
</div>
```

### ❌ DON'T Try to Extend Tailwind via theme.css

**Wrong:**
```css
@layer utilities {
  .my-custom-utility {
    /* styles */
  }
}
```

**Right:**
```css
.my-custom-utility {
  /* styles */
}
```

If you need custom utilities, define them as regular CSS classes without `@layer`.

## Debugging Theme CSS Issues

### Issue: Blank Page

**Symptom:** Theme route shows blank page, no content renders

**Causes:**
1. Tailwind v3 syntax in theme CSS (`@tailwind` directives)
2. Multiple Tailwind imports causing conflicts
3. Build errors from invalid CSS

**Fix:**
- Remove all `@tailwind` directives
- Remove `@import "tailwindcss"` from theme CSS
- Check browser console for CSS parsing errors

### Issue: Styles Not Applied

**Symptom:** Theme loads but styles look wrong or missing

**Causes:**
1. CSS specificity conflicts with main app or other themes
2. Missing CSS variable definitions
3. Incorrect class names in JSX

**Fix:**
- Scope your styles with theme-specific class
- Ensure CSS variables are defined with fallbacks
- Check that class names match between CSS and JSX

### Issue: Styles Affect Other Themes

**Symptom:** Loading one theme breaks styling in another theme or CMS admin

**Causes:**
1. Global class names (e.g., `.btn`, `.card`) without scoping
2. Overly broad selectors (e.g., `body`, `a`, `button`)
3. No CSS isolation

**Fix:**
- Wrap theme in scoping class (`.theme-name`)
- Make selectors specific (`.hotel-theme .btn` not just `.btn`)
- Test loading multiple themes to verify isolation

## Examples from Existing Themes

### ✅ STR Theme (Best Practice)

**File:** `sparti-cms/theme/str/theme.css`

```css
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

.str-theme {
  /* All variables scoped to theme */
  --background: 0 0% 12%;
  --foreground: 0 0% 96%;
  --primary: 0 100% 44%;
}

.str-theme .hero-title {
  font-family: 'Bebas Neue', sans-serif;
}
```

**Why it works:**
- No Tailwind import (uses global)
- All styles scoped to `.str-theme`
- Custom fonts imported
- Won't affect other themes

### ❌ Hotel Theme (Before Fix)

```css
@import url('https://fonts.googleapis.com/...');

@tailwind base;      /* ❌ v3 syntax, breaks in v4 */
@tailwind components;
@tailwind utilities;

@layer base {
  .h2 { ... }        /* ❌ Global, affects entire app */
}
```

**Problems:**
- Uses v3 syntax
- Global class names
- Causes blank page

### ✅ Hotel Theme (After Fix)

```css
@import url('https://fonts.googleapis.com/...');

/* Hotel Theme Custom Styles */

html {
  scroll-behavior: smooth;
}

.h2 {
  font-family: 'Gilda Display', serif;
  font-size: 45px;
}

.btn-primary {
  background-color: var(--brand-accent, #a37d4c);
}
```

**Why it works:**
- No Tailwind directives
- Simple, clear CSS
- Uses CSS variables with fallbacks

## Migration Checklist

When migrating an external website to a CMS theme:

1. ✅ Create theme folder structure
2. ✅ Copy components and convert to TypeScript
3. ✅ Update asset paths to use `/theme/{slug}/assets/`
4. ❌ **DO NOT** copy `@tailwind` directives from source
5. ❌ **DO NOT** copy `@import "tailwindcss"`
6. ✅ Copy only custom CSS classes and styles
7. ✅ Import custom fonts
8. ✅ Use CSS variables for themeable colors
9. ✅ Test theme doesn't break other parts of CMS

## Testing Your Theme CSS

Before committing a new theme, verify:

1. **Theme loads without errors**
   - Navigate to `/theme/{your-theme}`
   - Check browser console for CSS errors
   - Verify no "Tailwind v4" errors

2. **Styles apply correctly**
   - Custom classes work (buttons, typography, etc.)
   - Colors match design
   - Responsive styles work

3. **No conflicts with other themes**
   - Load your theme, then navigate to another theme
   - Verify other theme looks correct
   - Check CMS admin interface still works

4. **No conflicts with CMS**
   - Visit CMS admin pages
   - Verify admin UI isn't affected by theme styles
   - Test modals, forms, etc. still work

## Quick Reference

| Action | Allowed | Not Allowed |
|--------|---------|-------------|
| Import custom fonts | ✅ | |
| Use Tailwind utilities in JSX | ✅ | |
| Define custom CSS classes | ✅ | |
| Use CSS variables | ✅ | |
| Scope styles with theme class | ✅ | |
| Import Tailwind CSS | | ❌ |
| Use `@tailwind` directives | | ❌ |
| Use `@layer` without caution | | ❌ |
| Create global class names | | ⚠️ |

## Getting Help

If your theme CSS isn't working:

1. Check browser console for errors
2. Verify no `@tailwind` or `@import "tailwindcss"` in theme.css
3. Review this guide's examples
4. Compare with working themes (STR, master)
5. Test with scoped CSS class wrapper

## Summary

**Golden Rule:** Let the main app handle Tailwind CSS. Your theme should only contain:
- Custom font imports
- Custom CSS classes
- CSS variables for branding
- Third-party component styles (date pickers, sliders, etc.)

Following these guidelines ensures your theme integrates smoothly with the CMS without breaking other themes or the admin interface.
