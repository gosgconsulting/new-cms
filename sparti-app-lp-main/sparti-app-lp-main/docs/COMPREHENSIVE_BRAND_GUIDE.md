# Sparti Comprehensive Brand Design & Development Guide

## Table of Contents
1. [Brand Identity](#brand-identity)
2. [Visual Design System](#visual-design-system)
3. [Component Library](#component-library)
4. [Technical Implementation](#technical-implementation)
5. [AI Coding Instructions](#ai-coding-instructions)
6. [Quality Checklist](#quality-checklist)

---

## 1. Brand Identity

### Brand Personality
- **Innovative**: Cutting-edge AI automation solutions
- **Trustworthy**: Reliable, secure, and professional
- **Empowering**: Gives users control and flexibility
- **Forward-thinking**: Built for future growth
- **Approachable**: Complex technology made simple

### Brand Promise
"Unify your automation, amplify your growth"

### Voice & Tone Guidelines
- **Professional yet approachable**
- **Confident but not arrogant**
- **Clear and concise**
- **Future-focused**
- **Solution-oriented**

#### Writing Style Rules
- Use active voice
- Keep sentences concise
- Lead with benefits, support with features
- Use "you" to address users directly
- Avoid jargon, explain technical terms
- Use imperatives for CTAs: "Start automating", "Discover workflows"

---

## 2. Visual Design System

### Color Palette

#### Primary Brand Colors
```css
/* Sparti Purple (Primary) - Vibrant Purple from brand reference */
--primary: 267 84% 65%;           /* #8B5CF6 - Vibrant Purple */
--primary-dark: 267 84% 55%;      /* #7C3AED - Darker Purple */
--primary-light: 267 84% 75%;     /* #A78BFA - Lighter Purple */

/* Sparti Green (Accent) - Bright Green accent color */
--accent: 142 71% 45%;            /* #22C55E - Success Green */
--accent-light: 142 71% 55%;      /* #34D675 - Lighter Green */
--accent-dark: 142 71% 35%;       /* #16A34A - Darker Green */

/* Sparti Brand Gradients */
--gradient-hero: linear-gradient(135deg, hsl(195, 100%, 70%) 0%, hsl(142, 71%, 45%) 50%, hsl(267, 84%, 65%) 100%);
--gradient-neon: linear-gradient(135deg, hsl(267, 84%, 65%) 0%, hsl(142, 71%, 45%) 100%);
--gradient-subtle: linear-gradient(135deg, hsl(267, 84%, 65%) 0%, hsl(267, 84%, 75%) 100%);
```

#### Secondary Colors
```css
/* Success (matches accent green) */
--success: 142 71% 45%;           /* #22C55E - Sparti Green */
--success-light: 142 71% 90%;     /* Light Green Background */

/* Warning */
--warning: 43 96% 56%;            /* #F59E0B - Amber */
--warning-light: 48 100% 88%;     /* Light Amber Background */

/* Error */
--destructive: 0 84% 60%;         /* #EF4444 - Red */
--destructive-light: 0 93% 94%;   /* Light Red Background */

/* Secondary Purple (for subtle elements) */
--secondary-purple: 267 84% 85%;  /* #C4B5FD - Very light purple */
--muted-purple: 267 84% 95%;      /* #F3F4F6 - Almost white purple tint */
```

#### Neutral Colors
```css
/* Text Hierarchy */
--foreground: 222 84% 5%;         /* Primary Text #1F2937 */
--muted-foreground: 220 9% 46%;   /* Secondary Text #6B7280 */
--muted: 220 13% 69%;             /* Light Gray #9CA3AF */

/* Backgrounds */
--background: 0 0% 100%;          /* White #FFFFFF */
--card: 0 0% 100%;                /* Card Background */
--popover: 0 0% 100%;             /* Popover Background */
--secondary: 220 14% 96%;         /* Off-White #F9FAFB */

/* Borders */
--border: 220 13% 91%;            /* Light Gray #E5E7EB */
--input: 220 13% 91%;             /* Input Border */
--ring: 267 91% 56%;              /* Focus Ring - Primary */
```

### Typography System

#### Font Hierarchy
```css
/* Primary Font */
font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

/* Display Font (Accents Only) */
font-family: 'Orbitron', monospace;
```

#### Type Scale
- **H1 (Hero)**: `text-4xl md:text-6xl font-bold` - 64px/48px mobile
- **H2 (Section)**: `text-3xl md:text-4xl font-semibold` - 48px/36px mobile  
- **H3 (Subsection)**: `text-2xl md:text-3xl font-semibold` - 36px/28px mobile
- **H4 (Card Title)**: `text-xl md:text-2xl font-semibold` - 24px/20px mobile
- **Body Large**: `text-lg md:text-xl` - 20px/18px mobile
- **Body Regular**: `text-base` - 16px
- **Body Small**: `text-sm` - 14px
- **Caption**: `text-xs` - 12px

### Spacing System

#### Base Unit: 4px (Tailwind's default)

```css
/* Spacing Scale */
--spacing-xs: 0.25rem;    /* 4px - gap-1 */
--spacing-sm: 0.5rem;     /* 8px - gap-2 */
--spacing-md: 1rem;       /* 16px - gap-4 */
--spacing-lg: 1.5rem;     /* 24px - gap-6 */
--spacing-xl: 2rem;       /* 32px - gap-8 */
--spacing-2xl: 3rem;      /* 48px - gap-12 */
--spacing-3xl: 4rem;      /* 64px - gap-16 */

/* Touch Targets */
--min-touch: 2.75rem;     /* 44px minimum */
--touch-friendly: 3rem;   /* 48px comfortable */
```

#### Layout Guidelines
- **Container Max Width**: `1200px` (`max-w-7xl`)
- **Container Padding**: `px-4 md:px-6 lg:px-8`
- **Section Spacing**: `py-12 md:py-16 lg:py-20`
- **Card Padding**: `p-4 md:p-6`
- **Component Spacing**: `space-y-4 md:space-y-6`

### Border Radius System
```css
--radius: 0.5rem;         /* 8px - Base radius */
--radius-sm: 0.25rem;     /* 4px - Small elements */
--radius-md: 0.75rem;     /* 12px - Cards, buttons */
--radius-lg: 1rem;        /* 16px - Large cards */
--radius-full: 9999px;    /* Full rounded */
```

### Shadow System
```css
/* Elevation Shadows */
--shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);

/* Brand Shadows */
--shadow-glow-primary: 0 0 20px hsl(var(--primary) / 0.3);
--shadow-glow-accent: 0 0 30px hsl(var(--accent) / 0.4);
--neon-glow: 0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor;
```

---

## 3. Component Library

### Required Components

#### 1. SpartiLogo Component
```typescript
// MANDATORY: Always use SpartiLogo, never hardcode logo
<SpartiLogo size="sm|md|lg" showText={boolean} onClick={function} />
```

#### 2. BaseTouchButton Component  
```typescript
// MANDATORY: Use for all buttons to ensure touch accessibility
<BaseTouchButton 
  variant="default|outline|ghost|neon" 
  size="default|sm|lg|xl|icon"
  isLoading={boolean}
  icon={ReactNode}
>
  Button Text
</BaseTouchButton>
```

#### 3. BaseLoadingSpinner Component
```typescript
// MANDATORY: Use for all loading states
<BaseLoadingSpinner 
  size="sm|md|lg"
  text="Loading message"
  variant="primary|accent|muted"
  type="spinner|radar"
/>
```

### Button System

#### Primary CTA Buttons
```css
/* Implementation via variant="default" */
background: var(--gradient-hero);
color: hsl(var(--primary-foreground));
border-radius: var(--radius-md);
padding: 1rem 2rem;
font-weight: 600;
box-shadow: var(--shadow-glow-primary);
transition: all 0.2s ease;

/* Hover State */
transform: scale(1.02);
box-shadow: var(--shadow-xl);
```

#### Secondary Buttons
```css
/* Implementation via variant="outline" */
background: hsl(var(--primary) / 0.1);
color: hsl(var(--primary));
border: 2px solid hsl(var(--primary));
border-radius: var(--radius-md);

/* Hover State */
background: hsl(var(--primary) / 0.15);
```

### Card System
```css
/* Base Card Classes */
.sparti-card {
  @apply bg-card text-card-foreground border border-border rounded-lg p-6;
  @apply shadow-md hover:shadow-lg transition-all duration-200;
}

/* Interactive Cards */
.sparti-card-interactive {
  @apply sparti-card cursor-pointer;
  @apply hover:border-primary/20 hover:shadow-glow-primary/20;
  @apply transform hover:scale-[1.02];
}
```

### Form Elements
```css
/* Input Base */
.sparti-input {
  @apply bg-background border-input rounded-md px-3 py-2;
  @apply focus:border-primary focus:ring-2 focus:ring-primary/20;
  @apply transition-colors duration-200;
}

/* Label Base */
.sparti-label {
  @apply text-sm font-medium text-foreground;
}
```

---

## 4. Technical Implementation

### Design Token Structure

#### CSS Variables (src/index.css)
```css
:root {
  /* Base Colors - Always HSL */
  --primary: 267 91% 56%;
  --primary-foreground: 0 0% 100%;
  
  /* Semantic Colors */
  --success: 158 64% 52%;
  --warning: 43 96% 56%;
  --destructive: 0 84% 60%;
  
  /* Layout */
  --radius: 0.5rem;
  --spacing-unit: 0.25rem;
  
  /* Typography */
  --font-sans: Inter, system-ui, sans-serif;
  --font-display: 'Orbitron', monospace;
}
```

#### Tailwind Config Mapping (tailwind.config.ts)
```typescript
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: "hsl(var(--primary))",
        foreground: "hsl(var(--primary-foreground))",
      },
      success: "hsl(var(--success))",
      warning: "hsl(var(--warning))",
      destructive: "hsl(var(--destructive))",
    },
    fontFamily: {
      sans: ["var(--font-sans)"],
      display: ["var(--font-display)"],
    },
  }
}
```

### Component Standards

#### File Naming Convention
- **Base Components**: `Base[ComponentName].tsx` (e.g., `BaseTouchButton.tsx`)
- **Brand Components**: `Sparti[ComponentName].tsx` or `[Brand][ComponentName].tsx`
- **UI Components**: `[component-name].tsx` (kebab-case in ui folder)
- **Page Components**: `PascalCase.tsx`

#### Component Structure Template
```typescript
import { FC, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

// 1. Define variants using cva
const componentVariants = cva(
  "base-classes-using-semantic-tokens",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// 2. Define props interface
interface ComponentProps 
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof componentVariants> {
  children: ReactNode;
  // Add specific props
}

// 3. Component implementation
const Component: FC<ComponentProps> = ({ 
  children, 
  variant, 
  size, 
  className, 
  ...props 
}) => {
  return (
    <element
      className={cn(componentVariants({ variant, size }), className)}
      {...props}
    >
      {children}
    </element>
  );
};

export default Component;
```

---

## 5. AI Coding Instructions

### CRITICAL RULES - ALWAYS FOLLOW

#### 1. MANDATORY Component Usage
```typescript
// ❌ NEVER DO THIS
<img src="/logo.png" alt="Logo" />
<button className="bg-purple-500 text-white px-4 py-2 rounded">
  Click me
</button>

// ✅ ALWAYS DO THIS  
<SpartiLogo size="md" />
<BaseTouchButton variant="default">
  Click me
</BaseTouchButton>
```

#### 2. MANDATORY Color Usage
```css
/* ❌ NEVER USE DIRECT COLORS */
.my-component {
  background: #8B5FBF;
  color: #ffffff;
  border: 1px solid #e5e7eb;
}

/* ✅ ALWAYS USE SEMANTIC TOKENS */
.my-component {
  @apply bg-primary text-primary-foreground border-border;
}
```

#### 3. MANDATORY Responsive Design
```typescript
// ✅ ALWAYS MOBILE-FIRST
<div className="px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-12">
  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
    Mobile-first heading
  </h1>
</div>
```

#### 4. MANDATORY Touch Accessibility
```typescript
// ✅ ALWAYS USE BaseTouchButton for interactive elements
<BaseTouchButton 
  size="lg"           // Ensures 44px minimum touch target
  variant="default"
  className="w-full"  // Full width on mobile when needed
>
  Touch-friendly Action
</BaseTouchButton>
```

### Decision Trees

#### When to Use Which Component

**For Buttons:**
1. Interactive action needed? → Use `BaseTouchButton`
2. Just styling a link? → Use `Button` with `asChild` + `Link`
3. Icon only? → Use `BaseTouchButton` with `size="icon"`

**For Loading States:**
1. Inline spinner needed? → Use `BaseLoadingSpinner` with `size="sm"`
2. Full page loading? → Use `BaseLoadingSpinner` with `type="radar"` 
3. Button loading? → Use `BaseTouchButton` with `isLoading={true}`

**For Layout:**
1. Main content container? → Use `<div className="container mx-auto px-4">`
2. Section spacing? → Use `<section className="py-12 md:py-16 lg:py-20">`
3. Card layout? → Use `Card` components with `sparti-card` classes

### Code Quality Standards

#### TypeScript Requirements
- All props must be properly typed
- Use interfaces for component props
- Export types when reused
- Use proper generic constraints

#### Accessibility Requirements
- All interactive elements must have proper ARIA labels
- Focus management for modals and dropdowns
- Semantic HTML structure
- Color contrast compliance (automatically handled by design tokens)

#### Performance Requirements
- Lazy load images: `loading="lazy"`
- Use `React.memo()` for expensive components  
- Proper key props in lists
- Avoid inline functions in render methods

### Mobile-First Development Rules

#### Layout Principles
1. **Start with mobile layout** - Design for 320px+ first
2. **Progressive enhancement** - Add complexity for larger screens
3. **Touch-first interactions** - 44px minimum touch targets
4. **Readable typography** - No horizontal scrolling required

#### Required Mobile Classes
```typescript
// Container
"px-4 md:px-6 lg:px-8"

// Typography
"text-sm md:text-base lg:text-lg"

// Spacing  
"space-y-4 md:space-y-6 lg:space-y-8"

// Grid
"grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
```

---

## 6. Quality Checklist

### Pre-Development Checklist
- [ ] Design tokens defined in CSS variables (HSL format)
- [ ] Tailwind config maps all brand colors
- [ ] Component variants use semantic tokens only
- [ ] Mobile-first responsive breakpoints planned

### Component Development Checklist  
- [ ] Uses existing base components (SpartiLogo, BaseTouchButton, etc.)
- [ ] Implements proper TypeScript interfaces
- [ ] Follows semantic token color usage
- [ ] Includes proper accessibility attributes
- [ ] Responsive design with mobile-first approach
- [ ] Touch-friendly interactive elements (44px minimum)
- [ ] Proper loading and error states

### Code Review Checklist
- [ ] No hardcoded colors, fonts, or spacing values
- [ ] Semantic HTML structure maintained  
- [ ] Proper component composition and reuse
- [ ] Consistent naming conventions followed
- [ ] Performance optimization applied
- [ ] Cross-browser compatibility considered
- [ ] Dark mode compatibility (automatic with tokens)

### Brand Compliance Checklist
- [ ] Logo usage follows brand guidelines
- [ ] Color combinations meet contrast requirements  
- [ ] Typography hierarchy maintained
- [ ] Voice and tone consistent in copy
- [ ] Interactive states follow brand patterns
- [ ] Animation timing follows brand standards

### Final Deployment Checklist
- [ ] All semantic tokens working in light/dark modes
- [ ] Mobile touch interactions tested
- [ ] Loading states and error handling complete
- [ ] Accessibility audit passed
- [ ] Performance metrics acceptable
- [ ] Cross-device testing completed

---

## Implementation Priority

### Phase 1: Core Brand Elements
1. Ensure all base components exist and are used
2. Audit existing color usage for semantic token compliance
3. Implement consistent typography scale
4. Establish proper spacing system

### Phase 2: Component Library Enhancement  
1. Create missing variant components
2. Standardize form components
3. Implement consistent loading states
4. Add proper error boundaries

### Phase 3: Advanced Brand Features
1. Animation system refinement
2. Advanced responsive patterns
3. Performance optimization
4. Advanced accessibility features

---

*This guide serves as the authoritative source for all Sparti brand implementation. All AI development must strictly adhere to these guidelines to maintain brand consistency and technical excellence.*