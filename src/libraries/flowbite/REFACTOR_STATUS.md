# Flowbite Design System Refactor Status

**Last Updated**: 2025-01-27  
**Overall Completion**: ~89% (24/27 content components)

---

## ✅ Components Following Standard Pattern

**24 components** correctly implement the standard `ComponentSchema` pattern:

### Core Components
- ✅ `FlowbiteHeroSection.tsx` - Hero section with title, description, CTA, image
- ✅ `FlowbiteFeaturesSection.tsx` - Feature cards grid
- ✅ `FlowbiteCTASection.tsx` - Call-to-action section
- ✅ `FlowbiteFAQSection.tsx` - FAQ accordion section
- ✅ `FlowbiteContentSection.tsx` - Content section wrapper
- ✅ `FlowbiteContent.tsx` - Content display component

### Blog Components
- ✅ `FlowbiteBlogGrid.tsx` - Blog posts grid
- ✅ `FlowbiteBlogHero.tsx` - Blog hero section
- ✅ `FlowbiteBlogSidebar.tsx` - Blog sidebar

### Product/Service Components
- ✅ `FlowbiteProductGrid.tsx` - Product grid
- ✅ `FlowbiteProductSection.tsx` - Product section
- ✅ `FlowbiteServicesGrid.tsx` - Services grid
- ✅ `FlowbiteShowcase.tsx` - Showcase section

### SEO/Marketing Components
- ✅ `FlowbiteSEOResultsSection.tsx` - SEO results carousel
- ✅ `FlowbiteWhatIsSEOSection.tsx` - SEO explanation section
- ✅ `FlowbiteWhatsIncludedSection.tsx` - What's included section
- ✅ `FlowbiteWhyChooseUsSection.tsx` - Why choose us section
- ✅ `FlowbitePainPointSection.tsx` - Pain point section

### Social/Review Components
- ✅ `FlowbiteReviews.tsx` - Reviews section
- ✅ `FlowbiteTestimonialsSection.tsx` - Testimonials section
- ✅ `FlowbiteSocialMedia.tsx` - Social media section

### Other Components
- ✅ `FlowbiteNewsletter.tsx` - Newsletter signup
- ✅ `FlowbitePageTitle.tsx` - Page title component
- ✅ `FlowbiteVideoSection.tsx` - Video section

### Base Component
- ✅ `FlowbiteSection.tsx` - Base section wrapper (used by all components)

**Pattern Compliance:**
- ✅ Accept `ComponentSchema` prop
- ✅ Use helper functions (`getText`, `getButton`, `getImage`, `getArray`)
- ✅ Extract data from `component.items` and `component.props`
- ✅ Follow consistent component structure
- ✅ Use `FlowbiteSection` wrapper where appropriate

---

## ❌ Components NOT Following Standard Pattern

**3 components** need refactoring to follow the standard pattern:

### 1. FlowbiteHeader.tsx

**Current Implementation:**
- ❌ Does NOT accept `ComponentSchema`
- ❌ Fetches data from `/api/v1/header` API endpoint
- ❌ Uses custom props: `tenantId`, `language`, `onContactClick`, `className`
- ❌ Has internal state management for API data

**Required Refactor:**
```typescript
// Current
interface MasterHeaderProps {
  tenantId?: string | null;
  language?: string;
  onContactClick?: () => void;
  className?: string;
}

// Should be
interface FlowbiteHeaderProps {
  component: ComponentSchema;
  className?: string;
}
```

**Action Items:**
- [ ] Remove API fetch logic (`useEffect` with fetch)
- [ ] Change props to accept `ComponentSchema`
- [ ] Add helper functions (`getText`, `getButton`, `getImage`, `getArray`)
- [ ] Extract logo, menu items, topBar, buttons from schema
- [ ] Update component to use schema data instead of API data

**Schema Structure Expected:**
```typescript
{
  type: "header",
  props: {},
  items: [
    { key: "logo", type: "image", src: "...", alt: "..." },
    { key: "menu", type: "array", items: [...] },
    { key: "topBar", type: "object", value: { enabled: true, message: "..." } },
    { key: "button", type: "button", content: "Contact", link: "/contact" }
  ]
}
```

---

### 2. FlowbiteFooter.tsx

**Current Implementation:**
- ❌ Does NOT accept `ComponentSchema`
- ❌ Fetches data from API (similar pattern to Header)
- ❌ Uses custom props: `tenantId`, `language`, `className`, `onContactClick`
- ❌ Has complex schema extraction logic for footer sections

**Required Refactor:**
```typescript
// Current
interface MasterFooterProps {
  tenantId?: string | null;
  language?: string;
  className?: string;
  onContactClick?: () => void;
}

// Should be
interface FlowbiteFooterProps {
  component: ComponentSchema;
  className?: string;
}
```

**Action Items:**
- [ ] Remove API fetch logic
- [ ] Change props to accept `ComponentSchema`
- [ ] Add helper functions for schema extraction
- [ ] Extract footer sections, links, copyright, social media from schema
- [ ] Simplify section extraction logic

**Schema Structure Expected:**
```typescript
{
  type: "footer",
  props: {},
  items: [
    { key: "logo", type: "image", src: "...", alt: "..." },
    { key: "sections", type: "array", items: [...] },
    { key: "copyright", type: "text", content: "© 2025" },
    { key: "socialMedia", type: "array", items: [...] }
  ]
}
```

---

### 3. FlowbiteSlider.tsx

**Current Implementation:**
- ❌ Does NOT accept `ComponentSchema`
- ❌ Uses custom `FlowbiteSliderProps` interface
- ❌ Accepts `slides: FlowbiteSlide[]` directly
- ❌ Accepts `options` object directly

**Required Refactor:**
```typescript
// Current
export type FlowbiteSliderProps = {
  slides: FlowbiteSlide[];
  options?: { ... };
  ariaLabel?: string;
  className?: string;
};

// Should be
interface FlowbiteSliderProps {
  component: ComponentSchema;
  className?: string;
}
```

**Action Items:**
- [ ] Change props to accept `ComponentSchema`
- [ ] Extract slides array from schema items
- [ ] Extract options from schema props
- [ ] Use helper functions to extract slide data (images, captions, buttons)

**Schema Structure Expected:**
```typescript
{
  type: "slider",
  props: {
    autoplay: true,
    intervalMs: 5000,
    arrows: true,
    dots: true
  },
  items: [
    {
      key: "slides",
      type: "array",
      items: [
        {
          items: [
            { key: "image", type: "image", src: "...", alt: "..." },
            { key: "caption", type: "text", content: "..." },
            { key: "button", type: "button", content: "Learn More", link: "..." }
          ]
        }
      ]
    }
  ]
}
```

---

## ⚠️ Special Cases

### FlowbiteAdminDashboardShell.tsx

**Status**: Different purpose - Admin dashboard shell component

**Current Implementation:**
- Uses custom props: `minHeightScreen`, `backgroundClass`, `sidebar`, `header`, `sidebarSlot`, `children`
- Not a CMS content component - it's a layout shell for admin dashboards
- Intentionally different from content components

**Recommendation:**
- ✅ **Keep as-is** - This component serves a different purpose (admin layout shell)
- Does not need to follow the `ComponentSchema` pattern
- It's a structural component, not a content component

---

## ✅ Integration Status

All integration points are complete:

### Base Infrastructure
- ✅ **Base Section Component**: `FlowbiteSection.tsx` - Follows pattern correctly
- ✅ **Theme Manager**: `src/utils/flowbiteThemeManager.ts` - 5 themes implemented
- ✅ **Library Registry**: Registered in `src/config/libraryRegistry.ts`
- ✅ **Library Reference Page**: `src/components/visual-builder/FlowbiteLibrary.tsx`
- ✅ **Styles**: Theme CSS files in `src/styles/flowbite/` (5 themes)

### Component Registry
- ✅ Components are properly exported
- ✅ Components follow naming convention: `Flowbite{Name}Section.tsx`
- ✅ All components use TypeScript interfaces

---

## 📊 Refactor Priority

### High Priority (Most Used Components)
1. **FlowbiteHeader** - Used on every page, critical for navigation
2. **FlowbiteFooter** - Used on every page, important for site structure

### Medium Priority
3. **FlowbiteSlider** - Used for carousels/sliders, less frequently used

### Low Priority / Review
4. **FlowbiteAdminDashboardShell** - Admin-only, may not need refactoring

---

## 🔄 Migration Checklist

For each component that needs refactoring:

### FlowbiteHeader
- [ ] Update interface to accept `ComponentSchema`
- [ ] Remove `tenantId` and `language` props
- [ ] Remove API fetch logic (`useEffect` with fetch)
- [ ] Add helper functions (`getText`, `getButton`, `getImage`, `getArray`)
- [ ] Extract logo from schema
- [ ] Extract menu items from schema array
- [ ] Extract topBar configuration from schema
- [ ] Extract button/CTA from schema
- [ ] Update all usages of the component
- [ ] Test with sample schema data
- [ ] Verify in theme integration

### FlowbiteFooter
- [ ] Update interface to accept `ComponentSchema`
- [ ] Remove `tenantId` and `language` props
- [ ] Remove API fetch logic
- [ ] Add helper functions for schema extraction
- [ ] Extract logo from schema
- [ ] Extract footer sections from schema array
- [ ] Extract copyright text from schema
- [ ] Extract social media links from schema
- [ ] Simplify section extraction logic
- [ ] Update all usages of the component
- [ ] Test with sample schema data
- [ ] Verify in theme integration

### FlowbiteSlider
- [ ] Update interface to accept `ComponentSchema`
- [ ] Remove `slides` and `options` props
- [ ] Add helper functions to extract slides from schema
- [ ] Extract slides array from schema items
- [ ] Extract options from schema props
- [ ] Update all usages of the component
- [ ] Test with sample schema data
- [ ] Verify slider functionality still works

---

## 📝 Notes

1. **Header and Footer** currently use API endpoints (`/api/v1/header`, `/api/v1/footer`). After refactoring, these components should receive data via `ComponentSchema` instead.

2. **Backward Compatibility**: Consider if Header/Footer need to support both patterns during transition, or if a clean break is acceptable.

3. **Schema Design**: Ensure the CMS schema structure supports all the data currently fetched from APIs (logo, menu items, footer sections, etc.).

4. **Testing**: After refactoring, test each component with:
   - Sample schema data
   - Empty/missing data (graceful fallbacks)
   - Theme integration
   - Real-world usage scenarios

---

## 🎯 Next Steps

1. **Review Schema Structure**: Ensure CMS schema supports Header/Footer/Slider data structures
2. **Refactor FlowbiteHeader**: Highest priority, most commonly used
3. **Refactor FlowbiteFooter**: High priority, used on every page
4. **Refactor FlowbiteSlider**: Medium priority, less frequently used
5. **Update Documentation**: Update component documentation after refactoring
6. **Update Tests**: Add/update tests for refactored components

---

**Status**: Refactor is **89% complete**. Header, Footer, and Slider components need to be migrated to the standard `ComponentSchema` pattern.
