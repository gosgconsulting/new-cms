# Component & Route Duplication Prevention Rules

## Copy this rule to avoid duplicate pages and components:

### 1. Before Adding New Components:
```typescript
// Check if similar functionality already exists
const existingComponents = await supabase
  .from('components')
  .select('name, type')
  .ilike('name', '%[FUNCTIONALITY_KEYWORD]%');

// If similar component exists, enhance it instead of creating new one
```

### 2. Before Adding New Routes:
```typescript
// Check App.tsx for existing routes
// Rule: Each route should serve ONE specific purpose
const routeExists = routes.find(route => 
  route.path.includes('[ROUTE_SEGMENT]') || 
  route.element.type.name === '[COMPONENT_NAME]'
);

// If route exists, consolidate functionality instead of duplicating
```

### 3. Dynamic Component Categories:
```typescript
// Categories are now dynamically generated from database
// Icon and display name mapping in ComponentLibrary.tsx:

const getIconForType = (type: string) => {
  const iconMap: Record<string, any> = {
    navigation: Navigation,
    hero: Layout,
    content: Type,
    testimonials: MousePointer,
    buttons: MousePointer,
    media: Image,
    image: Image,
    layout: Layers,
    forms: FileText,
  };
  return iconMap[type] || Grid; // Default to Grid icon
};

const getDisplayNameForType = (type: string) => {
  const nameMap: Record<string, string> = {
    navigation: 'Navigation',
    hero: 'Hero Sections',
    content: 'Content',
    testimonials: 'Testimonials',
    buttons: 'Buttons',
    media: 'Media',
    image: 'Images',
    layout: 'Layout',
    forms: 'Forms',
  };
  return nameMap[type] || type.charAt(0).toUpperCase() + type.slice(1);
};

// To add new category support:
// 1. Add mapping to both functions above
// 2. No need to update categories array - it's dynamic!
```

### 4. Route Protection Template:
```typescript
// ALL /sparti/* routes MUST follow this pattern:
<Route path="/sparti/[PAGE]" element={
  <ProtectedRoute>
    <[COMPONENT_NAME] />
  </ProtectedRoute>
} />

// NO EXCEPTIONS - all admin routes require authentication
```

### 5. Pre-Creation Checklist:
- [ ] Is there an existing component with similar functionality?
- [ ] Does this route already exist or overlap with existing routes?  
- [ ] Is the component type mapped in getIconForType and getDisplayNameForType functions?
- [ ] Is the route properly protected with ProtectedRoute?
- [ ] Is the component properly imported and referenced in preview modal?

### 6. Consolidation Over Duplication:
- If components serve similar purposes, enhance the existing one with props/variants
- If routes serve similar purposes, combine them into one comprehensive route
- Use categories and filtering instead of separate components for organization