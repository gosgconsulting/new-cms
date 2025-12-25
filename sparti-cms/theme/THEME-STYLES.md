# Theme Styles System Documentation

## Overview

The Theme Styles system allows you to manage and customize the visual appearance of your themes through the CMS admin interface. Instead of modifying the CMS admin interface styles, this system links directly to your theme's CSS files, allowing you to customize colors, typography, and other design elements for your theme pages.

## 🎯 How It Works

### Current Implementation (Hardcoded)

**Phase 1: Hardcoded Theme Linking**
- Styles are linked to theme CSS files via hardcoded paths
- Each tenant's theme is determined by their `theme_id` field
- CSS file path format: `/theme/{theme-slug}/theme.css`
- Styles are saved to the database for future integration

**Phase 2: Database Integration (Coming Soon)**
- Styles will be automatically synced to theme CSS files
- Real-time updates to theme stylesheets
- Version control and rollback capabilities

## 📁 Theme CSS File Structure

### Required CSS File Location

Every theme must have a `theme.css` file in its root directory:

```
sparti-cms/theme/{theme-slug}/
├── index.tsx
├── theme.json
├── pages.json
├── theme.css          ← Required for styles system
└── ...
```

### CSS Variables Structure

Your `theme.css` file should use CSS custom properties (variables) for easy customization:

```css
:root {
  /* Primary Colors */
  --primary: 220 70% 50%;           /* HSL format */
  --primary-foreground: 0 0% 100%;  /* White text on primary */
  
  /* Secondary Colors */
  --secondary: 220 14% 96%;
  --secondary-foreground: 220 9% 9%;
  
  /* Base Colors */
  --background: 0 0% 100%;          /* White background */
  --foreground: 220 9% 9%;          /* Dark text */
  --card: 0 0% 100%;
  --card-foreground: 220 9% 9%;
  
  /* Accent Colors */
  --accent: 220 70% 50%;
  --accent-foreground: 0 0% 100%;
  --muted: 220 14% 96%;
  --muted-foreground: 220 9% 46%;
  
  /* Border and Input Colors */
  --border: 220 13% 91%;
  --input: 220 13% 91%;
  --ring: 220 70% 50%;              /* Focus ring color */
  
  /* Destructive Colors */
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 100%;
  
  /* Typography */
  --font-sans: 'Inter', sans-serif;
  --font-serif: 'Playfair Display', serif;
  --font-mono: 'Fira Code', monospace;
  --font-base-size: 16px;
  --font-heading-scale: 1.25;
  --font-line-height: 1.6;
}
```

### Using CSS Variables in Your Theme

Reference these variables in your theme components:

```css
/* Example: Button component */
.button-primary {
  background-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  font-family: var(--font-sans);
  font-size: var(--font-base-size);
}

/* Example: Card component */
.card {
  background-color: hsl(var(--card));
  color: hsl(var(--card-foreground));
  border: 1px solid hsl(var(--border));
}
```

## 🎨 CMS Styles Settings Page

### Accessing Theme Styles

1. Navigate to **Admin Dashboard** → **Settings** → **Styles**
2. The page will automatically detect your tenant's theme
3. View the linked theme CSS file information
4. Customize colors and typography

### Features

**Theme CSS File Information**
- Shows current theme ID
- Displays CSS file path
- Provides link to view CSS file directly

**Color Customization**
- Primary colors (brand colors)
- Secondary colors
- Base colors (background, foreground, cards)
- Accent colors (muted, borders, inputs)

**Typography Settings**
- Sans-serif font selection
- Serif font selection
- Monospace font selection
- Base font size
- Heading scale factor
- Line height

**Style Presets**
- Quick apply pre-configured style themes
- Modern & Clean
- Warm & Friendly
- Professional Blue

**Live Preview**
- See changes in real-time
- Preview buttons and cards
- Typography preview

## 🔧 Implementation Guide

### Step 1: Create Theme CSS File

Create `theme.css` in your theme directory:

```bash
sparti-cms/theme/your-theme-slug/theme.css
```

### Step 2: Define CSS Variables

Add CSS custom properties following the structure above:

```css
:root {
  --primary: 220 70% 50%;
  --primary-foreground: 0 0% 100%;
  /* ... more variables ... */
}
```

### Step 3: Import CSS in Theme Component

Import the CSS file in your theme's main component:

```typescript
// sparti-cms/theme/your-theme-slug/index.tsx
import React from 'react';
import './theme.css';  // ← Import theme styles

const YourTheme: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Your theme content */}
    </div>
  );
};

export default YourTheme;
```

### Step 4: Use Variables in Components

Reference CSS variables in your component styles:

```typescript
// Example component
const Button: React.FC = () => {
  return (
    <button 
      className="px-4 py-2 rounded-lg"
      style={{
        backgroundColor: 'hsl(var(--primary))',
        color: 'hsl(var(--primary-foreground))',
        fontFamily: 'var(--font-sans)'
      }}
    >
      Click Me
    </button>
  );
};
```

Or use Tailwind CSS with CSS variables:

```typescript
// Using Tailwind classes that reference CSS variables
<button className="bg-primary text-primary-foreground font-sans">
  Click Me
</button>
```

## 📋 Theme Styles Checklist

When creating a new theme, ensure:

- [ ] `theme.css` file exists in theme root directory
- [ ] CSS variables are defined using the standard structure
- [ ] CSS file is imported in `index.tsx`
- [ ] Components use CSS variables (not hardcoded colors)
- [ ] Theme is assigned to tenant (`theme_id` in tenant record)
- [ ] CSS file is accessible at `/theme/{theme-slug}/theme.css`

## 🔗 Linking Styles to Themes

### Current System (Hardcoded)

The system currently links styles to themes using:

1. **Tenant Theme ID**: Retrieved from tenant's `theme_id` field
2. **CSS File Path**: Constructed as `/theme/{theme_id}/theme.css`
3. **Default Fallback**: If no theme_id, defaults to `landingpage`

### Future System (Database Integration)

Planned enhancements:

1. **Automatic CSS Sync**: Changes save directly to theme CSS file
2. **Version Control**: Track style changes over time
3. **Rollback Capability**: Revert to previous style versions
4. **Multi-Theme Support**: Manage styles for multiple themes
5. **Style Presets per Theme**: Theme-specific style presets

## 🎯 Best Practices

### 1. Use HSL Color Format

Always use HSL format for color variables:

```css
/* ✅ Good */
--primary: 220 70% 50%;

/* ❌ Bad */
--primary: #8b5cf6;
```

**Why?** HSL format allows easy manipulation of lightness and saturation while maintaining hue.

### 2. Consistent Variable Naming

Follow the standard naming convention:

```css
--{category}-{property}
--primary-foreground
--card-background
--muted-text
```

### 3. Responsive Design

Consider responsive breakpoints in your CSS:

```css
:root {
  --font-base-size: 16px;
}

@media (max-width: 768px) {
  :root {
    --font-base-size: 14px;
  }
}
```

### 4. Dark Mode Support

Add dark mode variables:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 220 9% 9%;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: 220 9% 9%;
    --foreground: 0 0% 100%;
  }
}
```

## 🚀 Example: Complete Theme CSS

Here's a complete example of a well-structured `theme.css`:

```css
/* Theme Styles - Your Theme Name */

/* CSS Custom Properties */
:root {
  /* Primary Colors */
  --primary: 220 70% 50%;
  --primary-foreground: 0 0% 100%;
  
  /* Secondary Colors */
  --secondary: 220 14% 96%;
  --secondary-foreground: 220 9% 9%;
  
  /* Base Colors */
  --background: 0 0% 100%;
  --foreground: 220 9% 9%;
  --card: 0 0% 100%;
  --card-foreground: 220 9% 9%;
  
  /* Accent Colors */
  --accent: 220 70% 50%;
  --accent-foreground: 0 0% 100%;
  --muted: 220 14% 96%;
  --muted-foreground: 220 9% 46%;
  
  /* Border and Input */
  --border: 220 13% 91%;
  --input: 220 13% 91%;
  --ring: 220 70% 50%;
  
  /* Destructive */
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 100%;
  
  /* Typography */
  --font-sans: 'Inter', sans-serif;
  --font-serif: 'Playfair Display', serif;
  --font-mono: 'Fira Code', monospace;
  --font-base-size: 16px;
  --font-heading-scale: 1.25;
  --font-line-height: 1.6;
  
  /* Gradients */
  --gradient-primary: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.8) 100%);
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  :root {
    --background: 220 9% 9%;
    --foreground: 0 0% 100%;
    --card: 220 9% 15%;
    --card-foreground: 0 0% 100%;
    --muted: 220 9% 15%;
    --muted-foreground: 220 9% 60%;
    --border: 220 9% 20%;
    --input: 220 9% 20%;
  }
}

/* Base Styles */
* {
  box-sizing: border-box;
}

body {
  font-family: var(--font-sans);
  font-size: var(--font-base-size);
  line-height: var(--font-line-height);
  color: hsl(var(--foreground));
  background-color: hsl(var(--background));
}

/* Utility Classes */
.bg-primary {
  background-color: hsl(var(--primary));
}

.text-primary {
  color: hsl(var(--primary));
}

.bg-gradient-primary {
  background: var(--gradient-primary);
}
```

## 🔍 Troubleshooting

### Styles Not Applying

**Problem**: Changes in CMS don't reflect on theme pages

**Solutions**:
1. Verify `theme.css` exists in theme directory
2. Check CSS file is imported in `index.tsx`
3. Ensure CSS variables are defined correctly
4. Verify theme is assigned to tenant
5. Clear browser cache

### CSS File Not Found

**Problem**: 404 error when accessing theme CSS

**Solutions**:
1. Check file path: `/theme/{theme-slug}/theme.css`
2. Verify file exists in `sparti-cms/theme/{theme-slug}/`
3. Check server static file serving configuration
4. Ensure theme slug matches directory name

### Variables Not Working

**Problem**: CSS variables not applying

**Solutions**:
1. Use `hsl(var(--variable-name))` format
2. Ensure variables are defined in `:root`
3. Check for typos in variable names
4. Verify CSS file is loaded before component styles

## 📚 Related Documentation

- [Theme System Documentation](./README.md) - Complete theme creation guide
- [Template Documentation](../template/landingpage/README.md) - Template structure
- [Component Development](./README.md#component-development-guidelines) - Component guidelines

## 🆘 Support

For issues or questions about theme styles:

1. Check this documentation first
2. Review existing theme implementations
3. Test with template theme as reference
4. Check server logs for errors
5. Verify database tenant theme_id is set correctly

---

**Last Updated**: December 2024
**Version**: 1.0.0 (Hardcoded Theme Linking)
**Next Version**: 2.0.0 (Database Integration - Coming Soon)

