# Sparti CMS - UX/UI Design Guidelines

## Overview
This document defines the coding rules and design system for consistent UX/UI across all pages in Sparti CMS projects.

## Spacing System

### Section Spacing Rules

All sections MUST follow these spacing conventions for visual consistency:

#### Standard Section Spacing
```tsx
// Default for all content sections
className="py-20 px-4"
```

#### Hero Section Spacing
```tsx
// First section of any page (with header navigation)
className="pt-32 md:pt-24 pb-12 px-4"

// OR for full-height hero sections
className="pt-32 md:pt-24 min-h-screen px-4"
```

#### Section After Hero
```tsx
// First content section after hero
className="py-20 px-4"
```

### Container Spacing
```tsx
// Standard container
<div className="container mx-auto">
  {/* Content */}
</div>

// Container with max-width constraints
<div className="container mx-auto max-w-5xl">
  {/* Content */}
</div>

// Container for text-heavy content
<div className="container mx-auto max-w-4xl">
  {/* Content */}
</div>
```

### Internal Spacing

#### Card/Component Spacing
```tsx
// Cards
<Card className="p-6">
  {/* Content */}
</Card>

// Content padding
<div className="p-6">
  {/* Content */}
</div>
```

#### Grid Spacing
```tsx
// Standard grid gap
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"

// Tighter grid
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"

// Wider grid
className="grid grid-cols-1 md:grid-cols-2 gap-12"
```

#### Stack Spacing
```tsx
// Vertical spacing between elements
className="space-y-8"  // Large spacing
className="space-y-6"  // Medium spacing
className="space-y-4"  // Small spacing
className="space-y-2"  // Tight spacing

// Horizontal spacing
className="space-x-4"  // Standard horizontal spacing
```

## Layout Patterns

### Full Page Layout
```tsx
<div className="min-h-screen flex flex-col bg-background">
  <Header />
  
  <main className="flex-1">
    {/* Hero Section */}
    <section className="pt-32 md:pt-24 pb-12 px-4">
      {/* Hero content */}
    </section>

    {/* Content Sections */}
    <section className="py-20 px-4">
      {/* Section content */}
    </section>

    <section className="py-20 px-4">
      {/* Section content */}
    </section>
  </main>
  
  <Footer />
</div>
```

### Sidebar Layout
```tsx
<section className="py-20 px-4">
  <div className="container mx-auto">
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar */}
      <aside className="lg:w-64 flex-shrink-0">
        <div className="sticky top-8">
          {/* Sidebar content */}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        {/* Content */}
      </div>
    </div>
  </div>
</section>
```

## Color System

### Using Design Tokens
ALWAYS use semantic color tokens from `index.css` and `tailwind.config.ts`:

```tsx
// ❌ WRONG - Direct colors
className="bg-white text-black border-gray-300"

// ✅ CORRECT - Semantic tokens
className="bg-background text-foreground border-border"
```

### Common Semantic Tokens
- `bg-background` - Main background
- `bg-card` - Card/surface background
- `bg-muted` - Muted/secondary background
- `text-foreground` - Primary text
- `text-muted-foreground` - Secondary text
- `border-border` - Standard borders
- `bg-primary` - Primary brand color
- `bg-secondary` - Secondary brand color
- `text-primary` - Primary text color (on light backgrounds)
- `text-primary-foreground` - Text on primary backgrounds

### Brand Colors (Custom Tokens)
- `bg-brandPurple` - Brand purple
- `bg-brandTeal` - Brand teal
- `bg-coral` - Accent coral
- Gradients: `from-brandPurple to-brandTeal`

## Typography

### Heading Hierarchy
```tsx
// Page Title (H1)
<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">

// Section Title (H2)
<h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">

// Subsection Title (H3)
<h3 className="text-2xl md:text-3xl font-bold">

// Card Title (H4)
<h4 className="text-xl font-bold">

// Small Heading (H5)
<h5 className="text-lg font-semibold">
```

### Body Text
```tsx
// Standard body
<p className="text-base md:text-lg">

// Large body
<p className="text-lg md:text-xl">

// Small text
<p className="text-sm">

// Muted text
<p className="text-muted-foreground">
```

## Responsive Design

### Breakpoint Usage
- `sm:` - 640px (mobile landscape)
- `md:` - 768px (tablet)
- `lg:` - 1024px (desktop)
- `xl:` - 1280px (large desktop)
- `2xl:` - 1536px (extra large)

### Mobile-First Approach
Always design mobile-first, then add responsive modifiers:

```tsx
// ✅ CORRECT - Mobile first
className="text-2xl md:text-4xl lg:text-5xl"

// ❌ WRONG - Desktop first
className="text-5xl md:text-4xl text-2xl"
```

## Component Patterns

### Button Variants
```tsx
// Primary CTA - dark backgrounds
<Button variant="cta-gradient">

// Primary CTA - light backgrounds
<Button variant="cta-outline">

// Standard button
<Button variant="default">

// Secondary button
<Button variant="secondary">

// Ghost button
<Button variant="ghost">
```

### Card Components
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

### Animations (Framer Motion)
```tsx
// Standard fade-in
<motion.div
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
  viewport={{ once: true }}
>
  {/* Content */}
</motion.div>

// Staggered animations
transition={{ duration: 0.6, delay: index * 0.1 }}
```

## Checklist for New Pages

When creating a new page, ensure:

- [ ] Hero section uses `pt-32 md:pt-24 pb-12 px-4`
- [ ] All content sections use `py-20 px-4`
- [ ] Container uses `container mx-auto`
- [ ] All colors use semantic tokens (no direct colors)
- [ ] Typography follows the hierarchy
- [ ] Mobile-first responsive design
- [ ] Proper spacing between elements (`space-y-*`, `gap-*`)
- [ ] Animations are consistent with other pages
- [ ] Cards have hover effects
- [ ] Buttons use correct variants

## Common Mistakes to Avoid

### ❌ Inconsistent Section Spacing
```tsx
// Wrong - random padding values
<section className="py-16 md:py-24">
<section className="py-12 md:py-20">
```

### ✅ Consistent Section Spacing
```tsx
// Correct - standard py-20
<section className="py-20 px-4">
```

### ❌ Direct Color Usage
```tsx
// Wrong
className="bg-white text-black"
```

### ✅ Semantic Token Usage
```tsx
// Correct
className="bg-background text-foreground"
```

### ❌ Missing Responsive Design
```tsx
// Wrong - no mobile responsiveness
className="text-5xl"
```

### ✅ Proper Responsive Design
```tsx
// Correct - mobile first
className="text-2xl md:text-4xl lg:text-5xl"
```

## References

- Design System: `src/index.css` and `tailwind.config.ts`
- Button Variants: `src/components/ui/button.tsx`
- Example Pages:
  - Homepage: `src/pages/Index.tsx`
  - Hero Section: `src/components/HeroSection.tsx`
  - Standard Section: `src/components/SEOServicesShowcase.tsx`
  - Blog Page: `src/pages/Blog.tsx`

---

**Last Updated:** 2025-10-15  
**Version:** 1.0.0
