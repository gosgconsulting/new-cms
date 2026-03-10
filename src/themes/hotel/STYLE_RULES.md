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

### CTA Button Variants

The master theme provides three standardized CTA button variants for different use cases.

#### Primary CTA Button (`.btn-cta`)

The main call-to-action button used throughout the theme.

```tsx
<button className="btn-cta">
  Button Text
</button>
```

**Specifications:**
- **Height**: `3rem` (48px)
- **Padding**: `1.5rem` horizontal
- **Border Radius**: `0.75rem`
- **Font Weight**: `700` (bold)
- **Background**: `var(--brand-primary)` (lime green by default)
- **Text Color**: `#0b1223` (dark navy)
- **Hover**: Lighter shade of primary color, slight lift, larger shadow
- **Transition**: Smooth transitions for all interactive states

#### Secondary CTA Button (`.btn-cta-secondary`)

Used for secondary actions or alongside primary buttons.

```tsx
<button className="btn-cta-secondary">
  Secondary Action
</button>
```

**Specifications:**
- **Height**: `3rem` (48px)
- **Padding**: `1.5rem` horizontal
- **Border Radius**: `0.75rem`
- **Font Weight**: `600` (semi-bold)
- **Background**: Transparent
- **Border**: `1px solid var(--border-color)`
- **Text Color**: `var(--brand-text)` (adapts to dark mode)
- **Hover**: Subtle background tint, brand primary text color

#### Light CTA Button (`.btn-cta-light`)

Specifically designed for use on gradient or dark backgrounds.

```tsx
<button className="btn-cta-light">
  Get Started
</button>
```

**Specifications:**
- **Height**: `3rem` (48px)
- **Padding**: `1.5rem` horizontal
- **Border Radius**: `0.75rem`
- **Font Weight**: `700` (bold)
- **Background**: `rgba(255, 255, 255, 0.95)` (near-solid white) with backdrop blur (12px)
- **Border**: None
- **Text Color**: Indigo (`#4f46e5` - brand-secondary)
- **Shadow**: Subtle shadow for depth
- **Hover**: Full opacity white, slight lift animation

#### Usage Examples

```tsx
// Primary CTA button
<button className="btn-cta" onClick={handleClick}>
  Get Started
</button>

// Secondary button next to primary
<div className="flex gap-3">
  <button className="btn-cta">Primary Action</button>
  <button className="btn-cta-secondary">Learn More</button>
</div>

// Light button on gradient background
<section className="bg-brand-gradient">
  <button className="btn-cta-light">Get Free Consultation</button>
</section>

// Full-width button
<button className="btn-cta w-full">
  Contact Us
</button>

// Rounded button variant
<button className="btn-cta rounded-full px-8">
  Subscribe
</button>
```

#### Button Selection Guide

- **Primary (`.btn-cta`)**: Main conversion actions (sign up, buy, contact)
- **Secondary (`.btn-cta-secondary`)**: Supporting actions (learn more, back, cancel)
- **Light (`.btn-cta-light`)**: Actions on dark/gradient backgrounds (CTA sections)

#### Prohibited Button Styles

❌ **DO NOT USE:**
- Custom gradient buttons
- Hard-coded color buttons
- Inconsistent sizing or padding
- Non-standard hover effects

✅ **ALWAYS USE:**
- One of the three documented button classes
- Brand color variables
- Consistent sizing

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

### Dark Mode Best Practices

The master theme uses a near-black background system for dark mode, ensuring smooth scrolling and professional aesthetics.

#### Background System

**Color Palette:**
- **Main Background**: `#0a0a0a` (near-black) - Used for section backgrounds
- **Alternative Background**: `#141414` (slightly lighter) - Used for header/footer
- **Card Background**: `#1a1a1a` (elevated surfaces) - Used for cards, modals, and elevated content

**Implementation:**
```tsx
// Section with consistent background
<section className="bg-(--brand-background) dark:bg-[#0a0a0a]">
  {/* Card with elevated background */}
  <div className="bg-white dark:bg-[#1a1a1a]">
    Content
  </div>
</section>
```

#### Typography Standards

**Text Colors:**
- **Headings**: `text-gray-900 dark:text-white` - Pure white for maximum contrast
- **Body Text**: `text-gray-700 dark:text-gray-300` - Light gray (#e5e5e5)
- **Secondary Text**: `text-gray-600 dark:text-gray-400` - Muted gray (#a3a3a3)

**Font Weights:**
- **H1-H3**: `font-semibold` (600)
- **Body**: Regular (400)

**Implementation:**
```tsx
// Heading
<h2 className="text-gray-900 dark:text-white font-semibold">
  Section Title
</h2>

// Body text
<p className="text-gray-700 dark:text-gray-300">
  Body content with proper contrast
</p>

// Supporting text
<span className="text-gray-600 dark:text-gray-400">
  Caption or label
</span>
```

#### Border & Shadow Standards

**Borders:**
- Light mode: `border-black/10`
- Dark mode: `border-white/15`

**Shadows:**
- Cards: `shadow-[0_20px_80px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_80px_rgba(0,0,0,0.7)]`
- Small elements: `shadow-[0_10px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.5)]`

### CSS Variables in Dark Mode

All CSS variables are automatically adjusted in dark mode:

```css
.dark {
  /* Near-black backgrounds */
  --brand-background: #0a0a0a;
  --brand-background-alt: #141414;
  --bg-muted: #1a1a1a;
  
  /* High-contrast text */
  --text-primary: #ffffff;
  --text-secondary: #e5e5e5;
  --text-muted: #a3a3a3;
  
  /* Visible borders */
  --border-color: rgba(255, 255, 255, 0.15);
  --border-color-dark: rgba(255, 255, 255, 0.25);
}
```

### Component Background Requirements

**All sections MUST have explicit backgrounds** for smooth scrolling:

✅ **Correct:**
```tsx
<section className="bg-(--brand-background) dark:bg-[#0a0a0a]">
  Content
</section>
```

❌ **Incorrect:**
```tsx
<section className="bg-transparent">
  Content
</section>
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

**Heading Sizes:**
- **Page Title (H1)**: `text-4xl sm:text-5xl lg:text-6xl font-semibold`
- **Section Title (H2)**: `text-3xl md:text-4xl lg:text-5xl font-semibold`
- **Subsection Title (H3)**: `text-2xl md:text-3xl font-semibold`

**Body Text Sizes:**
- **Large Body**: `text-base md:text-lg`
- **Standard Body**: `text-base`
- **Small Text**: `text-sm`

### Text Color System

**Quick Reference Table:**

| Element Type | Light Mode | Dark Mode | Usage |
|-------------|-----------|-----------|-------|
| Headings (H1-H3) | `text-gray-900` | `dark:text-white` | Main titles, section headers |
| Body Text | `text-gray-700` | `dark:text-gray-300` | Paragraphs, main content |
| Secondary Text | `text-gray-600` | `dark:text-gray-400` | Captions, labels, metadata |
| Muted/Placeholder | `text-gray-500` | `dark:text-gray-400` | Empty states, placeholders |

**Standardized Color Palette:**
- **Headings (H1-H3)**: `text-gray-900 dark:text-white` - Maximum contrast
- **Body Text**: `text-gray-700 dark:text-gray-300` - High readability
- **Secondary/Caption**: `text-gray-600 dark:text-gray-400` - Supporting text
- **Muted/Placeholder**: `text-gray-500 dark:text-gray-400` - Empty states

**Complete Examples:**

```tsx
// Page heading
<h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-gray-900 dark:text-white">
  Main Page Title
</h1>

// Section heading
<h2 className="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white">
  Section Title
</h2>

// Subsection heading
<h3 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white">
  Subsection Title
</h3>

// Body text
<p className="text-base md:text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
  Main paragraph content with proper contrast for readability in both modes.
</p>

// Supporting text
<span className="text-sm text-gray-600 dark:text-gray-400">
  Caption, label, or metadata
</span>

// Empty state
<p className="text-gray-600 dark:text-gray-400">
  No items to display
</p>
```

**NEVER use:**
- `text-gray-700` without `dark:text-gray-300`
- `text-gray-600` without `dark:text-gray-400`
- `text-gray-900` without `dark:text-white`
- `text-slate-*` classes (use `text-gray-*` instead)

## Component Patterns

### Badges

The theme provides three standardized badge components:

```tsx
// Primary Badge - Uses brand primary color
<span className="badge-primary">
  Featured
</span>

// Neutral Badge - Subtle, for metadata
<span className="badge-neutral">
  About us
</span>

// Accent Badge - Uses brand accent color
<span className="badge-accent">
  New
</span>
```

**Badge Specifications:**
- **Display**: Inline-flex with centered items
- **Border Radius**: Full (pill shape)
- **Padding**: `0.5rem 1rem`
- **Font Size**: `0.875rem` (14px)
- **Font Weight**: Primary/Accent: `600`, Neutral: `500`
- All badges adapt automatically to dark mode

### Icon Containers

Standardized containers for icons and decorative elements:

```tsx
// Primary Icon Container - Brand primary color
<div className="icon-container-primary h-10 w-10 rounded-xl">
  <Icon className="h-5 w-5" />
</div>

// Accent Icon Container - Brand accent color
<div className="icon-container-accent h-12 w-12 rounded-full">
  <Icon className="h-6 w-6" />
</div>

// Neutral Icon Container - Subtle background
<div className="icon-container-neutral h-8 w-8 rounded-lg">
  <Icon className="h-4 w-4" />
</div>
```

**Icon Container Specifications:**
- **Display**: Flex with centered items
- **Border Radius**: Customizable (`rounded-lg`, `rounded-xl`, `rounded-full`)
- **Size**: Set via utility classes (`h-8 w-8`, `h-10 w-10`, etc.)
- All containers adapt automatically to dark mode

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
    <button className="btn-cta-light rounded-full px-8">
      Get Free Consultation
    </button>
  </div>
</div>
```

## Component Design Checklist

When creating or modifying any component, verify ALL of the following:

- [ ] **Section Background**: `bg-(--brand-background)`
- [ ] **All Headings**: `text-gray-900`
- [ ] **All Body Text**: `text-gray-700`
- [ ] **All Secondary Text**: `text-gray-600`
- [ ] **Card Backgrounds**: `bg-white`
- [ ] **Borders**: `border-black/10`
- [ ] **NO `text-slate-*` classes** (use `text-gray-*` instead)
- [ ] **Consistent styling throughout**

### Example Component Template

```tsx
<section className="py-20 px-4 bg-(--brand-background)">
  <div className="container mx-auto">
    <div className="rounded-3xl border border-black/10 bg-white p-8">
      <h2 className="text-3xl font-semibold text-gray-900">
        Section Title
      </h2>
      <p className="mt-4 text-base text-gray-700">
        Body content with proper contrast
      </p>
      <span className="text-sm text-gray-600">
        Supporting text
      </span>
    </div>
  </div>
</section>
```

## Common Styling Mistakes

### ❌ Using Slate Instead of Gray

**BAD:** Inconsistent with design system
```tsx
<h3 className="text-slate-900">Title</h3>
<p className="text-slate-600">Text</p>
```

**GOOD:** Uses standardized gray scale
```tsx
<h3 className="text-gray-900">Title</h3>
<p className="text-gray-700">Text</p>
```

### ❌ Missing Section Backgrounds

**BAD:** Transparent sections break smooth scrolling
```tsx
<section className="py-20 px-4">
```

**GOOD:** Explicit background for consistency
```tsx
<section className="py-20 px-4 bg-(--brand-background)">
```

### ❌ Inconsistent Text Colors

**BAD:** Using different shades randomly
```tsx
<h3 className="text-gray-800">Title</h3>
<p className="text-gray-500">Body</p>
```

**GOOD:** Following standardized palette
```tsx
<h3 className="text-gray-900">Title</h3>
<p className="text-gray-700">Body</p>
```

## Best Practices

### DO

✅ Use the standardized button classes (`.btn-cta`, `.btn-cta-secondary`, `.btn-cta-light`)
✅ Use CSS variables for brand colors (`var(--brand-primary)`, etc.)
✅ **Always add dark mode classes to ALL text elements**
✅ Test in both light and dark modes
✅ Use semantic component classes (`.badge-primary`, `.icon-container-accent`)
✅ Follow spacing and typography scales
✅ Add hover states to interactive elements
✅ Use brand color utilities (`.bg-brand-primary`, `.text-brand-accent`)
✅ Add explicit backgrounds to all sections (`bg-(--brand-background) dark:bg-[#0a0a0a]`)
✅ Use standardized text colors (`text-gray-900 dark:text-white`, `text-gray-700 dark:text-gray-300`)
✅ Use consistent border opacity (`border-white/15` in dark mode)
✅ Use `bg-[#1a1a1a]` for card backgrounds in dark mode
✅ **Complete the Component Design Checklist for every new component**

### DON'T

❌ Don't create custom button styles outside the three variants
❌ Don't hardcode colors (rose, amber, indigo, lime, etc.)
❌ **Don't forget dark mode adaptations on ANY text element**
❌ Don't skip hover states
❌ Don't use arbitrary color values
❌ Don't mix different badge/icon styling patterns
❌ Don't use component-specific colors that don't respect branding
❌ Don't use `bg-transparent` on sections (breaks smooth scrolling)
❌ Don't use navy blues or other non-black backgrounds in dark mode
❌ Don't use inconsistent text colors (stick to gray-900/white, gray-700/gray-300, gray-600/gray-400)
❌ Don't use `bg-white/5` or other very low opacity backgrounds in dark mode
❌ **Don't use `text-slate-*` classes anywhere (use `text-gray-*` instead)**
❌ Don't use `text-gray-*` without the corresponding `dark:` class

## Reference

- Design System Guidelines: `sparti-cms/docs/ux-ui-guidelines.md`
- Branding Schema: `sparti-cms/db/schemas/brandingSchema.js`
- Theme CSS: `sparti-cms/theme/master/theme.css`
- Theme Component: `sparti-cms/theme/master/index.tsx`
