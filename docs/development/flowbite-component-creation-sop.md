# Standard Operating Procedure: Flowbite Design System Component Creation

## Overview

This SOP defines the process for creating new visual components using the Flowbite design system, similar to the Diora template pattern. This ensures consistency, reusability, and proper integration with the CMS component registry.

**Version:** 1.0.0  
**Last Updated:** 2025-01-27  
**Status:** Active

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Component Creation Workflow](#component-creation-workflow)
3. [Step 1: Analyze JSON Element](#step-1-analyze-json-element)
4. [Step 2: Map to Existing Components](#step-2-map-to-existing-components)
5. [Step 3: Create New Flowbite Component](#step-3-create-new-flowbite-component)
6. [Step 4: Register Component in System](#step-4-register-component-in-system)
7. [Quality Checklist](#quality-checklist)
8. [Examples](#examples)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before creating a new Flowbite component, ensure you have:

- ✅ Access to Flowbite design system documentation
- ✅ Understanding of the component registry structure
- ✅ Knowledge of React/TypeScript
- ✅ Access to the CMS admin interface
- ✅ Understanding of JSON schema mapping
- ✅ Familiarity with the Diora component pattern

**Required Tools:**
- Code editor (VS Code recommended)
- Flowbite React components library
- Component registry access
- Database access (for component registration)

---

## Component Creation Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    START: New Component Request              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 1: Analyze JSON Element                               │
│  - Extract component structure from page JSON               │
│  - Identify all properties, types, and relationships        │
│  - Document component purpose and behavior                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 2: Map to Existing Components                         │
│  - Search component registry for similar components         │
│  - Check Flowbite library for matching components           │
│  - Evaluate if existing component can be reused/extended    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
┌───────────────┐          ┌──────────────────────┐
│ Component     │          │ Create New Component │
│ Exists?       │          │ (Step 3)             │
└───────┬───────┘          └──────────┬───────────┘
        │                             │
        │ YES                         │ NO
        │                             │
        └──────────────┬──────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 4: Register Component in System                      │
│  - Create component definition JSON                         │
│  - Register in component registry                          │
│  - Map JSON schema to component props                       │
│  - Test in CMS preview                                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  Quality Checklist & Documentation                         │
│  - Verify component works in visual editor                  │
│  - Test multi-tenant support                               │
│  - Document component usage                                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    COMPLETE: Component Ready                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Step 1: Analyze JSON Element

### 1.1 Extract Component Structure

When analyzing a page JSON element, examine the entire `layout_json.components` array:

```json
{
  "components": [
    {
      "key": "hero-section",
      "type": "hero",
      "props": {
        "title": "Welcome to Our Site",
        "description": "A compelling description",
        "buttonText": "Get Started",
        "buttonLink": "/contact",
        "backgroundImage": "/images/hero-bg.jpg",
        "items": [
          {
            "key": "badge",
            "type": "text",
            "content": "New"
          },
          {
            "key": "title",
            "type": "heading",
            "level": 1,
            "content": "Welcome to Our Site"
          }
        ]
      }
    }
  ]
}
```

### 1.2 Analysis Checklist

For each component, document:

- [ ] **Component Purpose**: What does this component do?
- [ ] **Key Identifier**: What is the unique `key` or `id`?
- [ ] **Component Type**: What is the `type` field?
- [ ] **Properties**: List all properties in `props`
- [ ] **Nested Items**: Are there `items` arrays? What structure?
- [ ] **Data Types**: String, number, boolean, object, array?
- [ ] **Required vs Optional**: Which properties are required?
- [ ] **Default Values**: What are the default values?
- [ ] **Relationships**: Does it reference other components?
- [ ] **Design Patterns**: Does it follow Diora patterns?

### 1.3 Create Analysis Document

Create a markdown file documenting your analysis:

```markdown
# Component Analysis: [Component Name]

## Purpose
[Describe what the component does]

## JSON Structure
```json
[Paste the component JSON]
```

## Properties Breakdown
| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| title | string | Yes | "" | Component title |
| ... | ... | ... | ... | ... |

## Nested Items
[List any nested items structure]

## Design Requirements
[Describe visual/UX requirements]

## Flowbite Mapping
[Initial thoughts on Flowbite components to use]
```

---

## Step 2: Map to Existing Components

### 2.1 Search Component Registry

Search the component registry for similar components:

**Location:** `sparti-cms/registry/components/`

**Search Methods:**
1. **By Type**: Look for components with similar `type` field
2. **By Category**: Search by `category` (content, media, navigation, form, layout, interactive)
3. **By Tags**: Search components with similar `tags`
4. **By Name**: Search by component `name` or `id`

**Example Search:**
```bash
# Search for hero-related components
grep -r "hero" sparti-cms/registry/components/
grep -r "banner" sparti-cms/registry/components/
```

### 2.2 Check Flowbite Library

Check if Flowbite has a matching component:

**Flowbite Components Reference:**
- [Flowbite React Components](https://flowbite-react.com/)
- Common components: Button, Card, Section, Hero, Navbar, Footer, etc.

**Search Pattern:**
1. Identify the component category (e.g., "hero", "card", "section")
2. Check Flowbite documentation for matching component
3. Review component props and API
4. Evaluate if it matches your requirements

### 2.3 Evaluate Reusability

For each existing component found, evaluate:

**Can it be reused as-is?**
- ✅ Properties match exactly
- ✅ Behavior matches requirements
- ✅ No modifications needed

**Can it be extended?**
- ⚠️ Properties mostly match
- ⚠️ Minor modifications needed
- ⚠️ Can add new properties

**Should we create new?**
- ❌ Properties don't match
- ❌ Behavior is significantly different
- ❌ Requires different Flowbite component

### 2.4 Decision Matrix

| Scenario | Action | Next Step |
|----------|--------|-----------|
| Exact match found | Use existing component | Skip to Step 4 (Register) |
| Similar component found | Extend existing component | Modify existing, then Step 4 |
| No match found | Create new component | Proceed to Step 3 |

---

## Step 3: Create New Flowbite Component

### 3.1 Component File Structure

Create the component following this structure:

```
src/libraries/flowbite/components/
├── Flowbite[ComponentName].tsx    # Main component file
└── [ComponentName]/
    ├── index.ts                    # Export file
    └── types.ts                    # TypeScript types (if complex)
```

**Example:**
```
src/libraries/flowbite/components/
├── FlowbiteHero.tsx
└── FlowbiteHero/
    ├── index.ts
    └── types.ts
```

### 3.2 Component Template

Use this template for new Flowbite components:

```typescript
"use client";

import React from "react";
import type { ComponentSchema } from "../../../../sparti-cms/types/schema";
import FlowbiteSection from "./FlowbiteSection";
// Import other Flowbite components as needed
// import { Button, Card, etc. } from "flowbite-react";

interface Flowbite[ComponentName]Props {
  component: ComponentSchema;
  className?: string;
}

/**
 * Flowbite [ComponentName] Component
 * 
 * Description: [What this component does]
 * 
 * @param component - Component schema from CMS
 * @param className - Additional CSS classes
 */
const Flowbite[ComponentName]: React.FC<Flowbite[ComponentName]Props> = ({
  component,
  className = "",
}) => {
  // Extract properties from component schema
  const props = component.props || {};
  const items = component.items || [];

  // Helper functions to extract data (following Diora pattern)
  const getText = (key: string) => {
    const item = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() && 
      typeof (i as any).content === "string"
    ) as any;
    return item?.content || "";
  };

  const getHeading = (key: string, level?: number) => {
    const item = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() &&
      i.type === "heading" &&
      (level === undefined || (i as any).level === level)
    ) as any;
    return item?.content || "";
  };

  const getButton = (key: string) => {
    const item = items.find(
      (i) => (i.key?.toLowerCase() === key.toLowerCase() || key === "") &&
      i.type === "button"
    ) as any;
    return {
      content: item?.content || "",
      link: item?.link || "#",
      icon: item?.icon
    };
  };

  const getArray = (key: string) => {
    const arr = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() && i.type === "array"
    ) as any;
    return Array.isArray(arr?.items) ? (arr.items as any[]) : [];
  };

  // Extract component-specific data
  const title = getHeading("title") || props.title || "";
  const description = getText("description") || props.description || "";
  // ... extract other properties

  return (
    <FlowbiteSection 
      title={title || undefined} 
      subtitle={description || undefined}
      className={className}
    >
      {/* Component implementation using Flowbite components */}
      {/* Example: */}
      {/* <div className="flowbite-hero-container">
        <h1>{title}</h1>
        <p>{description}</p>
      </div> */}
    </FlowbiteSection>
  );
};

export default Flowbite[ComponentName];
```

### 3.3 Follow Diora Pattern

**Key Diora Patterns to Follow:**

1. **Use FlowbiteSection Wrapper**
   ```typescript
   <FlowbiteSection title={title} subtitle={subtitle}>
     {/* Component content */}
   </FlowbiteSection>
   ```

2. **Extract Data from Items Array**
   - Use helper functions: `getText()`, `getHeading()`, `getButton()`, `getArray()`
   - Always check for lowercase key matching
   - Provide fallback values

3. **Support Both Props and Items**
   - Check `component.props` first
   - Fall back to `component.items` extraction
   - Support both patterns for flexibility

4. **Type Safety**
   - Use TypeScript interfaces
   - Type all extracted data
   - Handle undefined/null cases

5. **Responsive Design**
   - Use Flowbite responsive classes
   - Test on mobile, tablet, desktop
   - Follow Flowbite breakpoints

### 3.4 Integration with FlowbiteDioraRenderer

Add your component to `FlowbiteDioraRenderer.tsx`:

```typescript
// In FlowbiteDioraRenderer.tsx

import Flowbite[ComponentName] from "@/libraries/flowbite/components/Flowbite[ComponentName]";

// In the render function, add case:
function renderComponent(component: ComponentSchema) {
  const normalizedType = normalizeType(component.type);
  
  switch (normalizedType) {
    // ... existing cases
    case "[component-type]":
      return <Flowbite[ComponentName] component={component} />;
    // ... other cases
  }
}
```

### 3.5 Testing Checklist

Before proceeding to registration:

- [ ] Component renders without errors
- [ ] All props are properly extracted
- [ ] Fallback values work correctly
- [ ] Component is responsive
- [ ] Component matches design requirements
- [ ] TypeScript types are correct
- [ ] No console errors or warnings

---

## Step 4: Register Component in System

### 4.1 Create Component Definition JSON

Create a JSON file in `sparti-cms/registry/components/[component-id].json`:

**Template:**
```json
{
  "id": "[component-id]",
  "name": "[Component Display Name]",
  "type": "[component-type]",
  "category": "[category]",
  "description": "[Component description]",
  "properties": {
    "[property-name]": {
      "type": "[string|number|boolean|object|array]",
      "description": "[Property description]",
      "editable": true,
      "required": false,
      "default": "[default-value]"
    }
  },
  "editor": "[EditorType]",
  "version": "1.0.0",
  "tenant_scope": "global",
  "tags": ["tag1", "tag2"],
  "dependencies": ["flowbite-react"],
  "design_system": "flowbite",
  "last_updated": "2025-01-27T00:00:00Z"
}
```

**Example:**
```json
{
  "id": "flowbite-hero",
  "name": "Flowbite Hero Section",
  "type": "container",
  "category": "content",
  "description": "Hero section component using Flowbite design system",
  "properties": {
    "title": {
      "type": "string",
      "description": "Hero title text",
      "editable": true,
      "required": true,
      "default": "Welcome"
    },
    "description": {
      "type": "string",
      "description": "Hero description text",
      "editable": true,
      "required": false,
      "default": ""
    },
    "buttonText": {
      "type": "string",
      "description": "CTA button text",
      "editable": true,
      "required": false,
      "default": "Get Started"
    },
    "buttonLink": {
      "type": "string",
      "description": "CTA button link URL",
      "editable": true,
      "required": false,
      "default": "#"
    },
    "backgroundImage": {
      "type": "string",
      "description": "Background image URL",
      "editable": true,
      "required": false,
      "default": ""
    }
  },
  "editor": "ContainerEditor",
  "version": "1.0.0",
  "tenant_scope": "global",
  "tags": ["hero", "banner", "flowbite", "homepage"],
  "dependencies": ["flowbite-react"],
  "design_system": "flowbite",
  "last_updated": "2025-01-27T00:00:00Z"
}
```

### 4.2 Register in Component Registry

Add import and registration in `sparti-cms/registry/index.ts`:

```typescript
// Import component definition
import flowbiteHeroComponent from './components/flowbite-hero.json';

// In ComponentRegistry class, add to loadLocalComponents():
private loadLocalComponents() {
  // ... existing components
  this.register(flowbiteHeroComponent as ComponentDefinition);
  // ... other components
}
```

### 4.3 Map JSON Schema to Component Props

Ensure the JSON schema properties match the component implementation:

**Mapping Rules:**
1. **Property Names**: Must match exactly (case-sensitive)
2. **Data Types**: Must match TypeScript types
3. **Required Fields**: Must have defaults in component
4. **Nested Objects**: Must be properly structured
5. **Arrays**: Must define item structure

**Example Mapping:**
```typescript
// JSON Schema
{
  "properties": {
    "title": { "type": "string", "required": true },
    "items": { "type": "array", "items": { "type": "object" } }
  }
}

// Component Implementation
const title = props.title || getHeading("title") || "";
const items = props.items || getArray("items") || [];
```

### 4.4 Multi-Tenant Support

**Tenant Scope Options:**

- **`"global"`**: Component available to all tenants
  - Use for: Common UI components, design system components
  - Example: Flowbite buttons, cards, sections

- **`"tenant"`**: Component specific to one tenant
  - Use for: Tenant-specific branding, custom components
  - Example: Tenant-specific hero sections

**Best Practice:**
- Flowbite design system components should be `"global"`
- This allows reuse across all tenants
- Tenants can customize via props/theme

### 4.5 Database Registration (Optional)

If using database-backed component registry:

```sql
-- Insert component into database
INSERT INTO cms_components (
  id, name, type, category, description,
  properties, editor, version, tenant_scope,
  tags, dependencies, design_system, created_at
) VALUES (
  'flowbite-hero',
  'Flowbite Hero Section',
  'container',
  'content',
  'Hero section component using Flowbite design system',
  '{"title": {...}, "description": {...}}'::jsonb,
  'ContainerEditor',
  '1.0.0',
  'global',
  ARRAY['hero', 'banner', 'flowbite'],
  ARRAY['flowbite-react'],
  'flowbite',
  NOW()
);
```

### 4.6 Test in CMS Preview

**Testing Steps:**

1. **Open CMS Admin**
   - Navigate to Pages Manager
   - Open Visual Editor

2. **Add Component**
   - Search for your component
   - Add to page layout

3. **Edit Component**
   - Open component editor
   - Verify all properties are editable
   - Test property changes

4. **Preview Component**
   - Switch to Flowbite preview mode
   - Verify component renders correctly
   - Test responsive behavior

5. **Save and Reload**
   - Save page
   - Reload page
   - Verify component persists

---

## Quality Checklist

Before marking a component as complete:

### Functionality
- [ ] Component renders without errors
- [ ] All properties are editable
- [ ] Default values work correctly
- [ ] Component handles missing data gracefully
- [ ] Component works in visual editor preview

### Design System
- [ ] Uses Flowbite components correctly
- [ ] Follows Flowbite design patterns
- [ ] Matches Diora component pattern
- [ ] Responsive on all screen sizes
- [ ] Accessible (WCAG 2.1 AA)

### Code Quality
- [ ] TypeScript types are correct
- [ ] No console errors or warnings
- [ ] Code follows project conventions
- [ ] Comments explain complex logic
- [ ] Component is reusable

### Documentation
- [ ] Component definition JSON is complete
- [ ] Properties are well-documented
- [ ] Usage examples provided
- [ ] Dependencies listed
- [ ] Tags are appropriate

### Multi-Tenant
- [ ] Works for all tenants (if global)
- [ ] Tenant-specific customization works (if tenant-scoped)
- [ ] No hardcoded tenant data
- [ ] Theme support (if applicable)

---

## Examples

### Example 1: Simple Hero Component

**JSON Analysis:**
```json
{
  "key": "hero",
  "type": "hero",
  "props": {
    "title": "Welcome",
    "description": "Description text",
    "buttonText": "Get Started"
  }
}
```

**Component Implementation:**
```typescript
const FlowbiteHero: React.FC<FlowbiteHeroProps> = ({ component }) => {
  const props = component.props || {};
  const title = props.title || "";
  const description = props.description || "";
  const buttonText = props.buttonText || "Get Started";
  
  return (
    <FlowbiteSection>
      <div className="hero-container">
        <h1>{title}</h1>
        <p>{description}</p>
        <Button>{buttonText}</Button>
      </div>
    </FlowbiteSection>
  );
};
```

**Component Definition:**
```json
{
  "id": "flowbite-hero",
  "name": "Flowbite Hero",
  "type": "container",
  "category": "content",
  "properties": {
    "title": { "type": "string", "required": true },
    "description": { "type": "string" },
    "buttonText": { "type": "string", "default": "Get Started" }
  },
  "design_system": "flowbite",
  "tenant_scope": "global"
}
```

### Example 2: Complex Component with Items Array

**JSON Analysis:**
```json
{
  "key": "services",
  "type": "services",
  "items": [
    { "key": "title", "type": "heading", "content": "Our Services" },
    { "key": "services", "type": "array", "items": [
      { "title": "Service 1", "description": "Description 1" },
      { "title": "Service 2", "description": "Description 2" }
    ]}
  ]
}
```

**Component Implementation:**
```typescript
const FlowbiteServices: React.FC<FlowbiteServicesProps> = ({ component }) => {
  const items = component.items || [];
  const title = getHeading(items, "title");
  const services = getArray(items, "services");
  
  return (
    <FlowbiteSection title={title}>
      <div className="services-grid">
        {services.map((service, index) => (
          <Card key={index}>
            <h3>{service.title}</h3>
            <p>{service.description}</p>
          </Card>
        ))}
      </div>
    </FlowbiteSection>
  );
};
```

---

## Troubleshooting

### Common Issues

**Issue: Component not appearing in CMS**
- ✅ Check component is registered in `registry/index.ts`
- ✅ Verify JSON file is in `registry/components/`
- ✅ Check component ID is unique
- ✅ Verify `tenant_scope` is correct

**Issue: Properties not editable**
- ✅ Check property `editable: true` in JSON
- ✅ Verify property name matches component props
- ✅ Check editor type is correct

**Issue: Component not rendering**
- ✅ Check import path in FlowbiteDioraRenderer
- ✅ Verify component type matches switch case
- ✅ Check for console errors
- ✅ Verify Flowbite dependencies installed

**Issue: Data not displaying**
- ✅ Check data extraction functions
- ✅ Verify fallback values
- ✅ Check property names match JSON
- ✅ Verify items array structure

**Issue: Styling issues**
- ✅ Check Flowbite classes are correct
- ✅ Verify Tailwind config includes Flowbite
- ✅ Check responsive classes
- ✅ Verify theme is applied

---

## Additional Resources

- **Flowbite React Documentation**: https://flowbite-react.com/
- **Component Registry README**: `sparti-cms/registry/README.md`
- **Diora Component Examples**: `src/components/visual-builder/FlowbiteDioraRenderer.tsx`
- **Component Migration Guide**: `docs/development/component-migration-mapping.md`
- **Design System Guidelines**: `sparti-cms/docs/ux-ui-guidelines.md`

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2025-01-27 | Initial SOP creation | System |

---

## Questions or Issues?

If you encounter issues or have questions about this SOP:

1. Check the troubleshooting section
2. Review existing component examples
3. Consult the component registry documentation
4. Contact the development team

---

**Last Updated:** 2025-01-27  
**Status:** Active  
**Next Review:** 2025-04-27

