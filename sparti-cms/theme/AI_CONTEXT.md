# AI Theme Development Guidelines

**Purpose**: This document provides high-level process guidelines for AI assistants when creating or modifying themes in the CMS. Follow these guidelines to ensure themes are properly integrated with the database and use design systems correctly.

---

## 🚨 CRITICAL: Master Template Structure

### Master Template Location
- **Path**: `sparti-cms/templates/master`
- **Route**: `/theme/template/master/*`
- **Status**: Reference implementation for all themes
- **Database Connection**: ✅ Fully integrated

### Why Master Template is Critical

The master template (`sparti-cms/templates/master`) is the **authoritative reference** for:
1. **Database Integration Patterns** - How themes connect to the database
2. **API Endpoint Usage** - Standard API patterns for fetching data
3. **Tenant-Aware Data Fetching** - How to handle multi-tenant contexts
4. **Branding Settings Integration** - How to fetch and use tenant branding

### ⚠️ ALWAYS Respect Master Template Structure

**When creating or modifying themes, you MUST:**

1. ✅ **Reference the master template** before creating new themes
2. ✅ **Follow the same database connection patterns** used in master template
3. ✅ **Use the same API endpoint structure** (`/api/v1/theme/{theme-slug}/branding`)
4. ✅ **Implement tenant-aware data fetching** (tenantId from headers or query params)
5. ✅ **Include fallback values** for all database-fetched settings

### Master Template Database Integration Pattern

The master template demonstrates the correct pattern for database integration:

```typescript
// Pattern: Fetch branding from database with tenant context
const tenantId = request.headers.get('x-tenant-id') || 
                 url.searchParams.get('tenantId') || '';

const response = await fetch(
  `/api/v1/theme/{theme-slug}/branding?tenantId=${encodeURIComponent(tenantId)}`,
  { 
    headers: tenantId ? { 'X-Tenant-Id': tenantId } : undefined 
  }
);

const branding = await response.json();
const siteName = branding?.data?.site_name || 'Default Site Name';
const logoSrc = branding?.data?.site_logo || '/default-logo.png';
```

**Key Requirements:**
- Always include `tenantId` in query params or headers
- Always provide fallback values (use `||` operator)
- Always handle errors gracefully (try/catch with defaults)
- Always use the API endpoint pattern: `/api/v1/theme/{theme-slug}/branding`

---

## 🎨 Design System Integration

### Design Systems Location
- **Path**: `src/libraries/{design-system}/components/`
- **Reference Page**: `/design-systems` (route in app)
- **Documentation**: `src/libraries/README.md`

### Available Design Systems

Currently available design systems:
- **Flowbite** (`src/libraries/flowbite/components/`) - ✅ Active, 29 components
- **ACATR** (`src/libraries/acatr/components/`) - ✅ Active
- More design systems can be added following the migration process

### Using Design System Components

**ALWAYS use design system components when creating theme content:**

```typescript
// ✅ CORRECT: Import from design system
import FlowbiteHeroSection from '@/libraries/flowbite/components/FlowbiteHeroSection';
import FlowbiteFeaturesSection from '@/libraries/flowbite/components/FlowbiteFeaturesSection';
import FlowbiteSection from '@/libraries/flowbite/components/FlowbiteSection';

// ✅ CORRECT: Use with ComponentSchema from CMS
const MyTheme: React.FC = ({ component }) => {
  return (
    <div>
      <FlowbiteHeroSection component={heroSchema} />
      <FlowbiteFeaturesSection component={featuresSchema} />
    </div>
  );
};
```

**Design System Component Pattern:**
- All design system components accept `ComponentSchema` prop
- Components extract data using helper functions (`getText`, `getButton`, `getImage`, `getArray`)
- Components follow consistent structure (see `src/libraries/README.md`)

### Design System Benefits

Using design systems provides:
1. ✅ **Consistency** - Same components across all themes
2. ✅ **Reusability** - No code duplication
3. ✅ **Maintainability** - Update once, affects all themes
4. ✅ **CMS Integration** - Components work with CMS schema system
5. ✅ **Type Safety** - TypeScript interfaces for all props

### When to Use Design Systems

**ALWAYS use design systems for:**
- Hero sections
- Feature grids
- Service listings
- Testimonials
- FAQ sections
- CTA sections
- Content sections
- Any common UI patterns

**Only create custom components when:**
- Design system doesn't have the component you need
- Component is theme-specific and won't be reused
- Component requires unique functionality not in design systems

---

## 🤖 AI Workflow Process

### Step-by-Step Process for Creating Themes

When asked to create or modify a theme, follow this process:

#### Step 1: Review Master Template
1. ✅ Check `sparti-cms/templates/master` structure
2. ✅ Understand database integration patterns
3. ✅ Review API endpoint usage
4. ✅ Note tenant context handling

#### Step 2: Check Available Design Systems
1. ✅ Visit `/design-systems` route or check `src/libraries/README.md`
2. ✅ Identify which design system components are available
3. ✅ Map your requirements to available components
4. ✅ Note any missing components that need custom implementation

#### Step 3: Create Theme Structure
1. ✅ Create theme folder: `sparti-cms/theme/{theme-slug}/`
2. ✅ Create required files:
   - `index.tsx` - Main theme component
   - `theme.json` - Theme metadata
   - `pages.json` - Page definitions
   - `theme.css` - Theme-specific styles (optional)
3. ✅ Follow master template structure

#### Step 4: Implement Database Integration
1. ✅ Use `useThemeSettings` hook or fetch from API
2. ✅ Implement tenant-aware data fetching
3. ✅ Add fallback values for all settings
4. ✅ Handle errors gracefully

#### Step 5: Use Design System Components
1. ✅ Import components from `src/libraries/{design-system}/components/`
2. ✅ Use components with `ComponentSchema` props
3. ✅ Follow design system component patterns
4. ✅ Only create custom components when necessary

#### Step 6: Test Integration
1. ✅ Verify database connection works
2. ✅ Test tenant context switching
3. ✅ Verify design system components render correctly
4. ✅ Check fallback values work when database is unavailable

---

## 📋 Required Patterns Checklist

### Database Integration Checklist

- [ ] Theme fetches branding from database using API endpoint
- [ ] Tenant context is properly handled (tenantId in headers/query)
- [ ] All database-fetched values have fallback defaults
- [ ] Error handling is implemented (try/catch with defaults)
- [ ] API endpoint follows pattern: `/api/v1/theme/{theme-slug}/branding`
- [ ] Uses `useThemeSettings` hook or equivalent API pattern

### Design System Checklist

- [ ] Design system components are used for common UI patterns
- [ ] Components are imported from `src/libraries/{design-system}/components/`
- [ ] Components accept `ComponentSchema` props
- [ ] Custom components only created when design system doesn't have them
- [ ] Design system documentation is referenced (`src/libraries/README.md`)

### Theme Structure Checklist

- [ ] Theme folder follows structure: `sparti-cms/theme/{theme-slug}/`
- [ ] Required files exist: `index.tsx`, `theme.json`, `pages.json`
- [ ] Theme structure matches master template patterns
- [ ] Components are organized in `components/` folder (if needed)
- [ ] Assets are in `assets/` folder (if needed)

---

## 🔌 Database Connection Requirements

### API Endpoint Pattern

All themes must use this API endpoint pattern for database integration:

```
GET /api/v1/theme/{theme-slug}/branding?tenantId={tenantId}
```

**Example:**
```typescript
// Fetch branding settings
const tenantId = 'tenant-gosg'; // or from context
const response = await fetch(
  `/api/v1/theme/landingpage/branding?tenantId=${encodeURIComponent(tenantId)}`,
  { headers: { 'X-Tenant-Id': tenantId } }
);

const { data } = await response.json();
const siteName = data?.site_name || 'Default Site Name';
const logoSrc = data?.site_logo || '/default-logo.png';
```

### Using the useThemeSettings Hook

**Recommended approach** for React themes:

```typescript
import { useThemeSettings, useThemeBranding } from '../../hooks/useThemeSettings';

const MyTheme: React.FC = () => {
  const tenantSlug = 'tenant-gosg'; // Get from context
  const { settings, loading, error } = useThemeSettings('my-theme-slug', tenantSlug);
  
  // Or use specific hooks
  const branding = useThemeBranding('my-theme-slug', tenantSlug);
  
  if (loading) return <div>Loading...</div>;
  
  const siteName = branding?.site_name || settings?.branding?.site_name || 'Default Name';
  const logoSrc = branding?.site_logo || '/default-logo.png';
  
  return (
    <div>
      <h1>{siteName}</h1>
      <img src={logoSrc} alt={siteName} />
    </div>
  );
};
```

### Tenant Context Handling

**Always handle tenant context:**

1. **Get tenantId from:**
   - Request headers: `x-tenant-id`
   - URL query params: `?tenantId=tenant-gosg`
   - React context (if available)
   - Component props

2. **Pass tenantId to:**
   - API endpoints (query param or header)
   - `useThemeSettings` hook
   - Any database queries

3. **Provide fallbacks:**
   - Default tenant if none provided
   - Default values if tenant-specific data not found
   - Error handling if database unavailable

### Settings/Branding Integration

**Branding settings available from database:**
- `site_name` - Site/business name
- `site_tagline` - Site tagline/slogan
- `site_description` - Site description
- `site_logo` - Logo URL/path
- `site_favicon` - Favicon URL/path

**Always provide fallbacks:**
```typescript
const siteName = branding?.site_name || 'Default Site Name';
const logoSrc = branding?.site_logo || '/theme/{theme-slug}/assets/default-logo.png';
const tagline = branding?.site_tagline || 'Default Tagline';
```

---

## ✅ Do's and Don'ts

### ✅ DO

1. **DO** reference master template structure before creating themes
2. **DO** use design system components from `src/libraries/`
3. **DO** integrate with database for dynamic content
4. **DO** handle tenant context properly
5. **DO** provide fallback values for all database settings
6. **DO** follow the API endpoint pattern: `/api/v1/theme/{theme-slug}/branding`
7. **DO** use `useThemeSettings` hook for React themes
8. **DO** create custom components only when design system doesn't have them
9. **DO** follow the theme file structure (index.tsx, theme.json, pages.json)
10. **DO** test database integration and fallbacks

### ❌ DON'T

1. **DON'T** create themes without referencing master template
2. **DON'T** hardcode branding/settings values (use database)
3. **DON'T** ignore tenant context
4. **DON'T** create custom components when design system has them
5. **DON'T** skip error handling for database calls
6. **DON'T** forget fallback values
7. **DON'T** use different API patterns than master template
8. **DON'T** duplicate code that exists in design systems
9. **DON'T** create themes without required files (index.tsx, theme.json, pages.json)
10. **DON'T** ignore the design system documentation

---

## 📚 Reference Documentation

### Essential Reading

1. **Master Template**: `sparti-cms/templates/master` - Reference implementation
2. **Design Systems**: `src/libraries/README.md` - Design system documentation
3. **Theme System**: `sparti-cms/theme/README.md` - Complete theme documentation
4. **Theme Settings**: `sparti-cms/theme/THEME-SETTINGS-DB.md` - Database settings guide
5. **Design System Components**: `/design-systems` route - Component reference

### Key Files to Review

- `sparti-cms/templates/master/index.tsx` - Master template implementation
- `sparti-cms/hooks/useThemeSettings.ts` - Theme settings hook
- `src/libraries/flowbite/components/` - Flowbite component examples
- `sparti-cms/theme/landingpage/index.tsx` - Example theme implementation

---

## 🎯 Quick Reference

### Master Template Pattern
```typescript
// Always follow this pattern for database integration
const tenantId = getTenantId(); // from headers, query, or context
const branding = await fetchBranding(themeSlug, tenantId);
const siteName = branding?.site_name || 'Default Name';
```

### Design System Usage
```typescript
// Always use design system components
import FlowbiteHeroSection from '@/libraries/flowbite/components/FlowbiteHeroSection';
<FlowbiteHeroSection component={heroSchema} />
```

### Theme Structure
```
sparti-cms/theme/{theme-slug}/
├── index.tsx          # Main component (REQUIRED)
├── theme.json         # Metadata (REQUIRED)
├── pages.json         # Page definitions (REQUIRED)
├── theme.css          # Styles (OPTIONAL)
└── components/        # Custom components (OPTIONAL)
```

---

## 🔄 Workflow Summary

**When creating a new theme:**

1. ✅ Review `sparti-cms/templates/master` structure
2. ✅ Check available design systems in `src/libraries/`
3. ✅ Create theme folder with required files
4. ✅ Implement database integration (use master template pattern)
5. ✅ Use design system components for common UI patterns
6. ✅ Test database connection and fallbacks
7. ✅ Verify tenant context handling

**Remember**: The master template is your reference. Design systems are your building blocks. Database integration is mandatory.

---

**Last Updated**: 2025-01-27  
**For AI Assistants**: Always reference this document before creating or modifying themes.
