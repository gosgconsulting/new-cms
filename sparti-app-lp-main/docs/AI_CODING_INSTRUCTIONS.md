# AI Coding Instructions for Sparti Brand Consistency

## CRITICAL MANDATORY RULES

### 1. COMPONENT USAGE - NEVER VIOLATE
```typescript
// ❌ FORBIDDEN - Direct logo usage
<img src="/logo.png" alt="Logo" />

// ✅ REQUIRED - Always use SpartiLogo
<SpartiLogo size="sm|md|lg" showText={boolean} onClick={function} />

// ❌ FORBIDDEN - Direct button creation  
<button className="bg-purple-500 text-white px-4 py-2 rounded">

// ✅ REQUIRED - Always use BaseTouchButton
<BaseTouchButton variant="default|outline|ghost|neon" size="default|sm|lg|xl|icon">

// ❌ FORBIDDEN - Custom loading spinners
<div className="animate-spin">Loading...</div>

// ✅ REQUIRED - Always use BaseLoadingSpinner
<BaseLoadingSpinner size="sm|md|lg" variant="primary|accent|muted" type="spinner|radar" />
```

### 2. COLOR USAGE - NEVER VIOLATE
```css
/* ❌ FORBIDDEN - Direct colors */
background: #8B5CF6;
color: white;
border-color: #e5e7eb;

/* ✅ REQUIRED - Sparti semantic tokens only */
@apply bg-primary text-primary-foreground border-border;
/* Results in: Sparti Purple (#8B5CF6) with proper contrast */

/* ❌ FORBIDDEN - Hardcoded Tailwind colors */
className="bg-purple-600 text-white border-gray-300"

/* ✅ REQUIRED - Sparti semantic Tailwind classes */
className="bg-primary text-primary-foreground border-border"
/* Primary = Sparti Purple, Accent = Sparti Green */

/* ✅ SPARTI BRAND GRADIENTS */
className="bg-gradient-hero"  /* Cyan → Green → Purple gradient */
className="bg-gradient-neon"  /* Purple → Green gradient */
```

### 3. RESPONSIVE DESIGN - ALWAYS MOBILE-FIRST
```typescript
// ✅ REQUIRED PATTERN - Mobile-first responsive
<div className="px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-12">
  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
    Mobile-first heading
  </h1>
  <p className="text-sm md:text-base lg:text-lg text-muted-foreground">
    Mobile-first body text
  </p>
</div>

// ✅ REQUIRED - Container pattern
<div className="container mx-auto px-4 md:px-6 lg:px-8">

// ✅ REQUIRED - Grid pattern  
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
```

### 4. TOUCH ACCESSIBILITY - MANDATORY
```typescript
// ✅ REQUIRED - All interactive elements must be touch-friendly
<BaseTouchButton 
  size="lg"           // Ensures 44px+ touch target
  className="w-full"  // Full width on mobile when appropriate
>
  Touch-friendly Action
</BaseTouchButton>

// ✅ REQUIRED - Touch target spacing
<div className="space-y-4">  {/* Minimum 16px between touch targets */}
```

## DECISION TREES

### Button Selection
1. **Need interactive action?** → Use `BaseTouchButton`
2. **Styling a router link?** → Use `Button` with `asChild` + `Link` 
3. **Icon only button?** → Use `BaseTouchButton size="icon"`
4. **Loading state needed?** → Use `BaseTouchButton isLoading={true}`

### Loading State Selection  
1. **Inline loading in text?** → `<BaseLoadingSpinner size="sm" />`
2. **Button loading?** → `<BaseTouchButton isLoading={true} />`
3. **Full section loading?** → `<BaseLoadingSpinner type="radar" size="lg" />`
4. **Page loading?** → `<BaseLoadingSpinner type="radar" size="xl" text="Loading..." />`

### Layout Selection
1. **Main page container?** → `<div className="container mx-auto px-4 md:px-6 lg:px-8">`
2. **Section spacing?** → `<section className="py-12 md:py-16 lg:py-20">`
3. **Card container?** → `<Card className="p-4 md:p-6">`
4. **Form spacing?** → `<div className="space-y-4 md:space-y-6">`

## SEMANTIC TOKEN REFERENCE

### Colors (Always use these classes - Sparti Brand)
```typescript
// Backgrounds
"bg-background"        // Main page background  
"bg-card"             // Card backgrounds
"bg-popover"          // Dropdown/popover backgrounds
"bg-primary"          // Sparti Purple (#8B5CF6) - Primary actions
"bg-accent"           // Sparti Green (#22C55E) - Success/accent actions
"bg-secondary"        // Secondary backgrounds  
"bg-muted"            // Subtle backgrounds

// Text Colors  
"text-foreground"     // Primary text
"text-muted-foreground" // Secondary text
"text-primary"        // Sparti Purple text
"text-accent"         // Sparti Green text  
"text-success"        // Success messages (Sparti Green)
"text-warning"        // Warning messages  
"text-destructive"    // Error messages

// Borders
"border-border"       // Default borders
"border-input"        // Form input borders  
"border-primary"      // Sparti Purple accent borders
"border-accent"       // Sparti Green accent borders

// Focus States
"focus:ring-primary"  // Sparti Purple focus ring
"focus:border-primary" // Sparti Purple focus border

// Gradients (Sparti Brand)
"bg-gradient-hero"    // Cyan → Green → Purple
"bg-gradient-neon"    // Purple → Green
```

### Typography Scale
```typescript
// Headings (always include responsive sizing)
"text-2xl md:text-3xl lg:text-4xl font-bold"      // H1  
"text-xl md:text-2xl lg:text-3xl font-semibold"   // H2
"text-lg md:text-xl lg:text-2xl font-semibold"    // H3
"text-base md:text-lg lg:text-xl font-medium"     // H4

// Body Text
"text-sm md:text-base lg:text-lg"                 // Large body
"text-sm md:text-base"                            // Regular body  
"text-xs md:text-sm"                              // Small body
```

### Spacing Classes
```typescript
// Container Padding
"px-4 md:px-6 lg:px-8"

// Section Spacing  
"py-12 md:py-16 lg:py-20"

// Component Spacing
"space-y-4 md:space-y-6"     // Vertical spacing
"gap-4 md:gap-6 lg:gap-8"    // Grid/flex gaps

// Card Padding
"p-4 md:p-6"                 // Standard card padding
```

## COMPONENT PATTERNS

### Standard Page Layout
```typescript
export default function PageComponent() {
  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8">
      <section className="py-12 md:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Page Title
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mb-8">
            Page description
          </p>
          
          {/* Content grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Cards */}
          </div>
        </div>
      </section>
    </div>
  );
}
```

### Standard Card Pattern  
```typescript
<Card className="p-4 md:p-6 hover:shadow-lg transition-all duration-200">
  <CardHeader className="space-y-2">
    <CardTitle className="text-lg md:text-xl font-semibold">
      Card Title
    </CardTitle>
    <CardDescription className="text-sm text-muted-foreground">
      Card description
    </CardDescription>
  </CardHeader>
  
  <CardContent className="space-y-4">
    {/* Card content */}
  </CardContent>
  
  <CardFooter>
    <BaseTouchButton variant="default" className="w-full">
      Action Button
    </BaseTouchButton>
  </CardFooter>
</Card>
```

### Standard Form Pattern
```typescript
<form className="space-y-4 md:space-y-6">
  <div className="space-y-2">
    <Label htmlFor="field" className="text-sm font-medium">
      Field Label
    </Label>
    <Input 
      id="field"
      className="w-full"
      placeholder="Enter value..."
    />
  </div>
  
  <BaseTouchButton 
    type="submit" 
    variant="default"
    className="w-full"
    isLoading={isSubmitting}
  >
    Submit Form
  </BaseTouchButton>
</form>
```

## PROHIBITED PATTERNS

### ❌ NEVER DO THESE
```typescript
// Direct styling
style={{ backgroundColor: '#8B5FBF' }}

// Hardcoded colors in Tailwind
className="bg-purple-600 text-white"

// Non-responsive design
className="text-2xl px-8"  // Missing responsive variants

// Custom buttons instead of BaseTouchButton
<button className="bg-primary text-white px-4 py-2 rounded">

// Custom logos instead of SpartiLogo  
<img src="/logo.png" />

// Desktop-first responsive
className="text-lg md:text-sm"  // Wrong - goes from large to small

// Non-touch-friendly interactions
<button className="w-6 h-6">  // Too small for touch
```

## QUALITY CHECKS BEFORE SUBMITTING

### Pre-Submit Checklist
- [ ] All colors use semantic tokens (`bg-primary` not `bg-purple-600`)
- [ ] All interactive elements use `BaseTouchButton`  
- [ ] All logos use `SpartiLogo` component
- [ ] All loading states use `BaseLoadingSpinner`
- [ ] Mobile-first responsive design (`text-sm md:text-base`)
- [ ] Touch-friendly sizing (44px+ interactive elements)
- [ ] Proper semantic HTML structure
- [ ] Consistent spacing using design system classes

### Component Validation
- [ ] Uses existing base components where possible
- [ ] Follows TypeScript interface patterns
- [ ] Includes proper accessibility attributes  
- [ ] Implements error and loading states
- [ ] Responsive across all breakpoints

---

**Remember: Brand consistency is non-negotiable. These rules ensure every component feels like part of the Sparti ecosystem while maintaining technical excellence and accessibility.**