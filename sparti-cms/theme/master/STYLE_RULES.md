# Master Theme Style Rules

This document defines the design system rules and style guidelines for the Master Theme. All components and styles should follow these rules to ensure consistency and maintainability.

## Table of Contents

1. [Button Standardization](#button-standardization)
2. [Branding Colors](#branding-colors)
3. [Dark/Light Mode](#darklight-mode)
4. [Hover Rules](#hover-rules)
5. [Spacing and Typography](#spacing-and-typography)
6. [Component Patterns](#component-patterns)

## Button Standardization

### Single CTA Style

**All buttons in the master theme must use the single CTA style.** There are no button variants - only one standardized CTA button style.

#### Standard CTA Button

```tsx
<button className="btn-cta">
  Button Text
</button>
```

#### Button Specifications

- **Height**: `h-12` (48px)
- **Padding**: `px-6` (horizontal padding)
- **Border Radius**: `rounded-lg`
- **Font Weight**: `font-semibold`
- **Background**: Uses `--brand-primary` CSS variable
- **Text Color**: White (`text-white`)
- **Hover**: Darker shade of primary color (`--brand-primary-dark`)
- **Transition**: `transition-colors duration-200`
- **Shadow**: Medium shadow on default, large on hover

#### Button Classes

The `.btn-cta` class is defined in `theme.css` and includes:
- Base styling (height, padding, border radius)
- Brand primary color background
- White text color
- Hover effects (darker shade, slight lift, larger shadow)
- Active state (pressed effect)

#### Usage Examples

```tsx
// Standard CTA button
<button className="btn-cta" onClick={handleClick}>
  Get Started
</button>

// Full-width button
<button className="btn-cta w-full" onClick={handleClick}>
  Contact Us
</button>

// Button with custom padding
<button className="btn-cta px-8 py-6 text-lg" onClick={handleClick}>
  Get Free Consultation
</button>
```

#### Prohibited Button Styles

❌ **DO NOT USE:**
- Gradient buttons
- Outline buttons
- Ghost buttons
- Secondary button variants
- Different button colors (except white on gradient backgrounds)

✅ **ALWAYS USE:**
- Single `.btn-cta` class
- Brand primary color
- White text

## Branding Colors

### Color Source

Branding colors are fetched from the database using the `useThemeBranding` hook. Colors are applied as CSS custom properties (CSS variables) that can be used throughout the theme.

### Available Brand Colors

The following colors are available from the database:

- `color_primary` → `--brand-primary`
- `color_secondary` → `--brand-secondary`
- `color_accent` → `--brand-accent`
- `color_text` → `--brand-text`
- `color_background` → `--brand-background`
- `color_gradient_start` → `--brand-gradient-start`
- `color_gradient_end` → `--brand-gradient-end`

### Using Brand Colors

```tsx
// Using CSS variables in className
<div className="bg-brand-primary text-white">
  Content
</div>

// Using CSS variables in style prop
<div style={{ backgroundColor: 'var(--brand-primary)' }}>
  Content
</div>
```

### Color Utilities

The theme provides utility classes for brand colors:

- `.bg-brand-primary` - Primary background
- `.bg-brand-secondary` - Secondary background
- `.bg-brand-accent` - Accent background
- `.text-brand-primary` - Primary text color
- `.text-brand-secondary` - Secondary text color
- `.text-brand-accent` - Accent text color
- `.border-brand-primary` - Primary border color
- `.bg-brand-gradient` - Gradient background

### Fallback Colors

If branding colors are not available from the database, default colors are used:

- Primary: `#3B82F6` (Blue)
- Secondary: `#8B5CF6` (Purple)
- Accent: `#F59E0B` (Amber)
- Text: `#1F2937` (Gray-800)
- Background: `#FFFFFF` (White)

## Dark/Light Mode

### Theme Toggle

The master theme includes a dark/light mode toggle component (`ThemeToggle`) that is positioned sticky at the bottom-left of the page.

### Color Adaptations

In dark mode, brand colors are automatically adapted for better contrast:

- **Primary Color**: Lighter shade in dark mode (20% brighter)
- **Background**: Dark color (`#111827` - Gray-900)
- **Text**: Light color (`#F9FAFB` - Gray-50)
- **Borders**: Lighter borders for visibility

### Dark Mode Classes

Use Tailwind's `dark:` prefix for dark mode styles:

```tsx
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  Content adapts to theme
</div>
```

### CSS Variables in Dark Mode

All CSS variables are automatically adjusted in dark mode via the `.dark` class on the document root:

```css
.dark {
  --brand-primary: /* Lighter shade */;
  --brand-background: /* Dark background */;
  --text-primary: /* Light text */;
}
```

## Hover Rules

### Button Hover States

**Light Mode:**
- Background: Darker shade of primary color (10% darker)
- Transform: Slight lift (`translateY(-1px)`)
- Shadow: Larger shadow for depth

**Dark Mode:**
- Background: Lighter shade of primary color (20% lighter)
- Transform: Slight lift (`translateY(-1px)`)
- Shadow: Larger shadow for depth

### Text Hover States

**On Light Backgrounds:**
- Default: Brand text color or dark gray
- Hover: Brand primary color

**On Dark Backgrounds:**
- Default: White or light gray
- Hover: Brand primary light color

### Link Hover States

```tsx
// Links automatically use brand primary on hover
<a href="#" className="text-on-light hover:text-brand-primary">
  Link Text
</a>
```

### Interactive Elements

Elements with the `.interactive` class get hover effects:

```tsx
<button className="interactive text-on-light">
  Interactive Element
</button>
```

## Spacing and Typography

### Spacing System

Follow the standard spacing scale:

- `space-xs`: 0.25rem (4px)
- `space-sm`: 0.5rem (8px)
- `space-md`: 1rem (16px)
- `space-lg`: 1.5rem (24px)
- `space-xl`: 2rem (32px)
- `space-2xl`: 3rem (48px)

### Section Spacing

- **Standard Sections**: `py-20 px-4`
- **Hero Section**: `pt-32 md:pt-24 pb-12 px-4`
- **Container**: `container mx-auto px-4`

### Typography

- **Page Title (H1)**: `text-4xl md:text-5xl lg:text-6xl font-bold`
- **Section Title (H2)**: `text-3xl md:text-4xl lg:text-5xl font-bold`
- **Subsection Title (H3)**: `text-2xl md:text-3xl font-bold`
- **Body Text**: `text-base md:text-lg`
- **Small Text**: `text-sm`

### Text Colors

- **Primary Text**: `text-on-light` (adapts to theme)
- **Secondary Text**: `text-on-light` with opacity
- **Muted Text**: Use muted color utilities

## Component Patterns

### Cards

```tsx
<Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

### Navigation Links

```tsx
<button
  onClick={handleClick}
  className="text-sm text-on-light hover:text-brand-primary transition-colors interactive"
>
  Navigation Item
</button>
```

### CTA Sections

```tsx
<div className="bg-brand-gradient py-20">
  <div className="container mx-auto px-4 text-center">
    <h2 className="text-3xl font-bold text-white mb-4">
      Ready to Get Started?
    </h2>
    <button className="btn-cta px-8 py-6 text-lg">
      Get Free Consultation
    </button>
  </div>
</div>
```

## Best Practices

### DO

✅ Always use `.btn-cta` for all buttons
✅ Use CSS variables for brand colors
✅ Test in both light and dark modes
✅ Use semantic color classes (`text-on-light`, `bg-brand-primary`)
✅ Follow spacing and typography scales
✅ Add hover states to interactive elements

### DON'T

❌ Don't create custom button styles
❌ Don't hardcode colors (use CSS variables)
❌ Don't forget dark mode adaptations
❌ Don't use multiple button variants
❌ Don't skip hover states
❌ Don't use arbitrary color values

## Reference

- Design System Guidelines: `sparti-cms/docs/ux-ui-guidelines.md`
- Branding Schema: `sparti-cms/db/schemas/brandingSchema.js`
- Theme CSS: `sparti-cms/theme/master/theme.css`
- Theme Component: `sparti-cms/theme/master/index.tsx`
