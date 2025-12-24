## Sparti Brand Style Guide

This guide defines the design tokens, components, and usage rules for all UI in this project. All new features must adhere to this guide to maintain consistency.

### 1) Core Design Tokens (defined in CSS/Tailwind)
- Colors are defined as CSS variables in `src/index.css` and mapped in Tailwind via `tailwind.config.ts`.
- Use Tailwind semantic colors, not hard-coded HEX/RGB:
  - Background/Foreground: `bg-background`, `text-foreground`
  - Surface: `bg-card`, `text-card-foreground`, `bg-popover`
  - Primary: `text-primary`, `bg-primary`, `border-primary`, `ring-primary`
  - Secondary/Muted/Accent: `text-secondary`, `text-muted-foreground`, `text-accent`
  - Status: `text-success`, `text-warning`, `text-destructive`
- Brand-specific utility colors (use sparingly and only via Tailwind classes):
  - `text-lead-orange`, `text-contact-blue`, `text-opportunity-green`
- Radius: use CSS var `--radius` via Tailwind extensions: `rounded-lg`, `rounded-md`, `rounded-sm`
- Shadows/Glows: prefer provided utilities: `shadow`, `shadow-glow-primary`, `shadow-glow-accent`, `neon-glow`
- Gradients: `bg-gradient-hero`, `bg-gradient-neon`, `bg-gradient-glass` (as `backgroundImage` entries in Tailwind)
- Animations: use defined keyframes via classes: `float`, `pulse-neon`, `bounce-in`, `radar-pulse`

Authoritative sources:
- Tokens: `src/index.css`
- Tailwind mapping: `tailwind.config.ts`

### 2) Typography
- Base font: system sans; optional display font: `Orbitron` for accents only
- Use semantic sizes via Tailwind (`text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, `text-3xl`)
- Headings: maintain vertical rhythm
  - h1: `text-3xl font-bold`
  - h2: `text-2xl font-semibold`
  - h3: `text-xl font-medium`

### 3) Spacing & Layout
- Container: use Tailwind `container` and default padding from `tailwind.config.ts`
- Vertical spacing between blocks: `space-y-4` (mobile) / `space-y-6` (desktop)
- Touch targets: min height/width `min-h-touch min-w-touch` and `touch-friendly`

### 4) Components (shadcn/ui baseline)
- Always use shared UI components in `src/components/ui` where possible
- Cards: 
  - Base: `bg-card text-card-foreground border border-border rounded-lg`
  - Hoverable: add `card-hover-unified card-hover-glow card-hover-gradient`
- Buttons: 
  - Variants from shadcn: `variant={"default"|"secondary"|"destructive"|"outline"}`
  - No inline colors; rely on theme
- Inputs: `bg-background border-border focus:ring-primary`
- Badges: status-aligned (`default` for success/active, `secondary` for inactive, `destructive` for errors)

### 5) Do/Don’t
- Do use semantic Tailwind tokens (`text-foreground`, `bg-card`)
- Do not use raw HEX/RGB/HSL inline
- Do not override brand colors inline; extend tokens if needed
- Do not introduce new radii/shadows; reuse `--radius` and utilities

### 6) Theming & Dark Mode
- Dark mode is class-based and already configured (`dark` class). Inherit from tokens; avoid custom overrides.

### 7) Patterns
- Empty states: subtle surface (`bg-card/50`) + guidance copy + primary action
- Loading: use `BaseLoadingSpinner` or loaders with `text-muted-foreground`
- Error: `Alert` with `variant="destructive"`

### 8) Implementation checklist (for PR review)
- Uses semantic Tailwind colors only
- Uses shadcn/ui components
- Spacing/radius consistent with tokens
- Mobile-friendly touch sizes
- No inline brand overrides

### 9) Extending the system
- If a new color/state is needed, add a CSS variable in `src/index.css` and map it in `tailwind.config.ts`. Avoid per-component ad-hoc styles.




