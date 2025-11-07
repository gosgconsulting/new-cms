# Component Migration Mapping

## Overview
This document maps each homepage component to its CMS registry definition and migration strategy.

---

## Component Registry Structure

Each component in the CMS registry follows this schema:

```typescript
{
  id: string;                    // Unique identifier
  name: string;                  // Display name
  type: ComponentType;           // text | image | video | button | link | input | container | media | unknown
  category: ComponentCategory;   // content | media | navigation | form | layout | interactive
  description?: string;          // Component description
  properties: Record<string, ComponentProperty>;  // Editable properties
  editor: EditorType;            // Editor component name
  version: string;               // Semantic version
  tenant_scope?: 'global' | 'tenant';
  tags?: string[];              // Search tags
  preview_url?: string;         // Preview image URL
  documentation_url?: string;   // Documentation link
  dependencies?: string[];      // Required packages/components
  last_updated?: string;        // ISO date string
}
```

---

## Migration Mapping Table

| Component Name | Current File | CMS ID | Type | Category | Editor | Priority | Status |
|---------------|--------------|--------|------|----------|--------|----------|--------|
| Header | `src/components/Header.tsx` | `header-main` | container | layout | ContainerEditor | High | 🔴 Not Created |
| Footer | `src/components/Footer.tsx` | `footer-main` | container | layout | ContainerEditor | High | 🔴 Not Created |
| Hero Section | `src/components/HeroSection.tsx` | `hero-main` | container | content | ContainerEditor | High | 🔴 Not Created |
| Client Logos | `src/components/HeroSection.tsx` (embedded) | `client-logos-carousel` | media | content | MediaEditor | High | 🔴 Not Created |
| Pain Point Section | `src/components/PainPointSection.tsx` | `pain-point-section` | container | content | ContainerEditor | Medium | 🔴 Not Created |
| SEO Results Section | `src/components/SEOResultsSection.tsx` | `seo-results-section` | container | content | ContainerEditor | Medium | 🔴 Not Created |
| Services Showcase | `src/components/SEOServicesShowcase.tsx` | `services-showcase-section` | container | content | ContainerEditor | Medium | 🔴 Not Created |
| What is SEO Section | `src/components/WhatIsSEOServicesSection.tsx` | `what-is-seo-section` | container | content | ContainerEditor | Medium | 🔴 Not Created |
| Testimonials Section | `src/components/NewTestimonials.tsx` | `testimonials-section` | container | content | ContainerEditor | Medium | 🔴 Not Created |
| FAQ Section | `src/components/FAQAccordion.tsx` | `faq-section` | container | interactive | ContainerEditor | Medium | 🔴 Not Created |
| Blog Section | `src/components/BlogSection.tsx` | `blog-preview-section` | container | content | ContainerEditor | Medium | 🔴 Not Created |
| WhatsApp Button | `src/components/WhatsAppButton.tsx` | `whatsapp-button` | button | interactive | ButtonEditor | Low | 🔴 Not Created |
| Contact Modal | `src/components/ContactModal.tsx` | `contact-modal` | container | interactive | ContainerEditor | Low | 🔴 Not Created |

---

## Detailed Component Definitions

### 1. Header Component

**CMS Registry Definition:**
```typescript
{
  id: 'header-main',
  name: 'Main Header',
  type: 'container',
  category: 'layout',
  description: 'Main site header with logo and CTA button',
  properties: {
    logo: {
      type: 'object',
      description: 'Logo image and alt text',
      editable: true,
      required: true,
      default: {
        src: '/assets/go-sg-logo-official.png',
        alt: 'GO SG Digital Marketing Agency'
      }
    },
    ctaText: {
      type: 'string',
      description: 'Call-to-action button text',
      editable: true,
      required: true,
      default: 'Contact Us'
    },
    showCTA: {
      type: 'boolean',
      description: 'Show/hide CTA button',
      editable: true,
      default: true
    },
    isFixed: {
      type: 'boolean',
      description: 'Fixed positioning on scroll',
      editable: true,
      default: true
    },
    backgroundColor: {
      type: 'string',
      description: 'Background color when scrolled',
      editable: true,
      default: 'rgba(255, 255, 255, 0.95)'
    }
  },
  editor: 'ContainerEditor',
  version: '1.0.0',
  tenant_scope: 'tenant',
  tags: ['header', 'navigation', 'layout', 'global'],
  dependencies: ['react-router-dom'],
  last_updated: '2025-01-15'
}
```

**Schema Markup Required:**
```json
{
  "@context": "https://schema.org",
  "@type": "WPHeader",
  "potentialAction": {
    "@type": "Action",
    "name": "Contact Us"
  }
}
```

**Migration Steps:**
1. Create `src/components/cms-ready/Header.tsx`
2. Extract hardcoded values to props
3. Add schema markup
4. Register in component registry
5. Create database entry
6. Test in CMS preview

---

### 2. Footer Component

**CMS Registry Definition:**
```typescript
{
  id: 'footer-main',
  name: 'Main Footer',
  type: 'container',
  category: 'layout',
  description: 'Main site footer with CTA, links, and copyright',
  properties: {
    ctaHeading: {
      type: 'string',
      description: 'CTA section heading',
      editable: true,
      required: true,
      default: 'Get Your SEO Strategy'
    },
    ctaDescription: {
      type: 'string',
      description: 'CTA section description',
      editable: true,
      required: true,
      default: 'Ready to dominate search results?'
    },
    ctaButtonText: {
      type: 'string',
      description: 'CTA button text',
      editable: true,
      default: 'Start Your Journey'
    },
    contactLinks: {
      type: 'array',
      description: 'Contact link items',
      editable: true,
      default: [
        { text: 'WhatsApp', url: 'https://wa.me/1234567890' },
        { text: 'Book a Meeting', url: 'https://calendly.com' }
      ]
    },
    legalLinks: {
      type: 'array',
      description: 'Legal/informational links',
      editable: true,
      default: [
        { text: 'Privacy Policy', url: '#' },
        { text: 'Terms of Service', url: '#' },
        { text: 'Blog', url: '/blog' }
      ]
    },
    copyrightText: {
      type: 'string',
      description: 'Copyright text',
      editable: true,
      default: 'GO SG CONSULTING. All rights reserved.'
    },
    showYear: {
      type: 'boolean',
      description: 'Auto-insert current year',
      editable: true,
      default: true
    }
  },
  editor: 'ContainerEditor',
  version: '1.0.0',
  tenant_scope: 'tenant',
  tags: ['footer', 'layout', 'global', 'cta'],
  dependencies: ['react-router-dom', 'lucide-react'],
  last_updated: '2025-01-15'
}
```

**Schema Markup Required:**
```json
{
  "@context": "https://schema.org",
  "@type": "WPFooter",
  "copyrightYear": 2025,
  "copyrightHolder": {
    "@type": "Organization",
    "name": "GO SG CONSULTING"
  }
}
```

---

### 3. Hero Section Component

**CMS Registry Definition:**
```typescript
{
  id: 'hero-main',
  name: 'Hero Section',
  type: 'container',
  category: 'content',
  description: 'Main hero section with headline, description, and CTA',
  properties: {
    badgeText: {
      type: 'string',
      description: 'Top badge text',
      editable: true,
      default: 'Results in 3 months or less'
    },
    showBadge: {
      type: 'boolean',
      description: 'Show/hide badge',
      editable: true,
      default: true
    },
    headingLine1: {
      type: 'string',
      description: 'First line of heading',
      editable: true,
      required: true,
      default: 'We Boost Your SEO'
    },
    headingLine2: {
      type: 'string',
      description: 'Second line of heading (highlighted)',
      editable: true,
      required: true,
      default: 'In 3 Months'
    },
    description: {
      type: 'string',
      description: 'Hero description text',
      editable: true,
      required: true,
      default: 'We help businesses dominate search results...'
    },
    ctaButtonText: {
      type: 'string',
      description: 'CTA button text',
      editable: true,
      default: 'Get a Quote'
    },
    showClientLogos: {
      type: 'boolean',
      description: 'Show client logos carousel',
      editable: true,
      default: true
    },
    backgroundGradient: {
      type: 'object',
      description: 'Background gradient configuration',
      editable: true,
      default: {
        from: 'background',
        via: 'secondary/30',
        to: 'background'
      }
    }
  },
  editor: 'ContainerEditor',
  version: '1.0.0',
  tenant_scope: 'tenant',
  tags: ['hero', 'banner', 'cta', 'homepage'],
  dependencies: ['framer-motion', 'lucide-react'],
  last_updated: '2025-01-15'
}
```

**Schema Markup Required:**
```json
{
  "@context": "https://schema.org",
  "@type": "WebPageElement",
  "cssSelector": ".hero-section",
  "about": {
    "@type": "Service",
    "name": "SEO Services",
    "description": "We help businesses dominate search results"
  }
}
```

---

### 4. Client Logos Carousel

**CMS Registry Definition:**
```typescript
{
  id: 'client-logos-carousel',
  name: 'Client Logos Carousel',
  type: 'media',
  category: 'content',
  description: 'Animated carousel of client logos',
  properties: {
    logos: {
      type: 'array',
      description: 'Array of logo objects',
      editable: true,
      required: true,
      default: [
        { src: '/assets/logos/art-in-bloom.png', alt: 'Art in Bloom', link: '' },
        { src: '/assets/logos/selenightco.png', alt: 'Selenightco', link: '' }
      ]
    },
    animationSpeed: {
      type: 'number',
      description: 'Animation duration in seconds',
      editable: true,
      default: 30
    },
    pauseOnHover: {
      type: 'boolean',
      description: 'Pause animation on hover',
      editable: true,
      default: false
    },
    logoHeight: {
      type: 'number',
      description: 'Logo height in pixels',
      editable: true,
      default: 40
    },
    opacity: {
      type: 'number',
      description: 'Logo opacity (0-1)',
      editable: true,
      default: 0.6
    },
    hoverOpacity: {
      type: 'number',
      description: 'Logo opacity on hover (0-1)',
      editable: true,
      default: 1
    }
  },
  editor: 'MediaEditor',
  version: '1.0.0',
  tenant_scope: 'tenant',
  tags: ['logos', 'carousel', 'clients', 'animation'],
  dependencies: ['framer-motion'],
  last_updated: '2025-01-15'
}
```

**Schema Markup Required:**
```json
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "itemListElement": [
    {
      "@type": "ImageObject",
      "url": "/assets/logos/art-in-bloom.png",
      "name": "Art in Bloom"
    }
  ]
}
```

---

### 5. Pain Point Section

**CMS Registry Definition:**
```typescript
{
  id: 'pain-point-section',
  name: 'Pain Point Section',
  type: 'container',
  category: 'content',
  description: 'Section highlighting customer pain points',
  properties: {
    sectionTitle: {
      type: 'string',
      description: 'Section title',
      editable: true,
      required: true,
      default: 'Common SEO Challenges'
    },
    sectionSubtitle: {
      type: 'string',
      description: 'Section subtitle',
      editable: true,
      default: 'Problems we solve for businesses'
    },
    painPoints: {
      type: 'array',
      description: 'Array of pain point items',
      editable: true,
      required: true,
      default: [
        {
          icon: 'AlertCircle',
          title: 'Low Website Traffic',
          description: 'Your website is invisible in search results'
        }
      ]
    },
    showCTA: {
      type: 'boolean',
      description: 'Show CTA button',
      editable: true,
      default: true
    },
    ctaButtonText: {
      type: 'string',
      description: 'CTA button text',
      editable: true,
      default: 'Get Help Now'
    },
    backgroundColor: {
      type: 'string',
      description: 'Section background color',
      editable: true,
      default: 'white'
    }
  },
  editor: 'ContainerEditor',
  version: '1.0.0',
  tenant_scope: 'tenant',
  tags: ['pain-points', 'problems', 'content', 'features'],
  dependencies: ['lucide-react'],
  last_updated: '2025-01-15'
}
```

---

### 6. SEO Results Section

**CMS Registry Definition:**
```typescript
{
  id: 'seo-results-section',
  name: 'SEO Results Section',
  type: 'container',
  category: 'content',
  description: 'Showcase of SEO results and case studies',
  properties: {
    sectionTitle: {
      type: 'string',
      description: 'Section title',
      editable: true,
      required: true,
      default: 'Proven Results'
    },
    sectionSubtitle: {
      type: 'string',
      description: 'Section subtitle',
      editable: true,
      default: 'Real results from our clients'
    },
    results: {
      type: 'array',
      description: 'Array of result items',
      editable: true,
      required: true,
      default: [
        {
          image: '/assets/results/result-1.png',
          title: 'E-commerce Store',
          metric: '+250% Traffic',
          description: 'Increased organic traffic in 4 months'
        }
      ]
    },
    displayStyle: {
      type: 'string',
      description: 'Display style (grid | slider)',
      editable: true,
      default: 'slider'
    },
    showStats: {
      type: 'boolean',
      description: 'Show statistics counter',
      editable: true,
      default: true
    }
  },
  editor: 'ContainerEditor',
  version: '1.0.0',
  tenant_scope: 'tenant',
  tags: ['results', 'case-studies', 'testimonials', 'proof'],
  dependencies: ['embla-carousel-react'],
  last_updated: '2025-01-15'
}
```

**Schema Markup Required:**
```json
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "itemListElement": [
    {
      "@type": "CreativeWork",
      "name": "E-commerce Store Case Study",
      "image": "/assets/results/result-1.png",
      "description": "Increased organic traffic by 250%"
    }
  ]
}
```

---

### 7. Services Showcase Section

**CMS Registry Definition:**
```typescript
{
  id: 'services-showcase-section',
  name: 'Services Showcase',
  type: 'container',
  category: 'content',
  description: 'Showcase of SEO services offered',
  properties: {
    sectionTitle: {
      type: 'string',
      description: 'Section title',
      editable: true,
      required: true,
      default: 'Our SEO Services'
    },
    sectionSubtitle: {
      type: 'string',
      description: 'Section subtitle',
      editable: true,
      default: 'Comprehensive SEO solutions'
    },
    services: {
      type: 'array',
      description: 'Array of service items',
      editable: true,
      required: true,
      default: [
        {
          icon: 'Search',
          title: 'Keyword Research',
          description: 'Find the best keywords for your business',
          features: ['Competitive analysis', 'Search volume data', 'Keyword difficulty']
        }
      ]
    },
    showCTA: {
      type: 'boolean',
      description: 'Show CTA button',
      editable: true,
      default: true
    },
    ctaButtonText: {
      type: 'string',
      description: 'CTA button text',
      editable: true,
      default: 'Learn More'
    },
    displayColumns: {
      type: 'number',
      description: 'Number of columns (1-4)',
      editable: true,
      default: 3
    }
  },
  editor: 'ContainerEditor',
  version: '1.0.0',
  tenant_scope: 'tenant',
  tags: ['services', 'features', 'offerings', 'seo'],
  dependencies: ['lucide-react'],
  last_updated: '2025-01-15'
}
```

**Schema Markup Required:**
```json
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "itemListElement": [
    {
      "@type": "Service",
      "serviceType": "Keyword Research",
      "description": "Find the best keywords for your business",
      "provider": {
        "@type": "Organization",
        "name": "GO SG CONSULTING"
      }
    }
  ]
}
```

---

## Migration Process

### Step 1: Component Extraction
For each component:
1. Create new file in `src/components/cms-ready/[ComponentName].tsx`
2. Copy existing component code
3. Identify hardcoded values
4. Convert hardcoded values to props with defaults
5. Add TypeScript interfaces for props

### Step 2: Schema Integration
1. Create schema helper functions in `src/utils/schema.ts`
2. Add schema markup to each component
3. Validate schema with Google Rich Results Test

### Step 3: Registry Registration
1. Create component definition object
2. Add to `sparti-cms/registry/components/[component-id].json`
3. Register in `sparti-cms/registry/index.ts`

### Step 4: Database Migration
1. Create migration script for database table
2. Insert component definitions into `cms_components` table
3. Link components to pages in `cms_page_components` table

### Step 5: Testing
1. Test component rendering in isolation
2. Test component editing in CMS
3. Test schema validation
4. Test responsive design
5. Test accessibility

### Step 6: Documentation
1. Create component documentation
2. Add usage examples
3. Add screenshots
4. Update component README

---

## Status Tracking

Use this checklist to track migration progress:

### Phase 1: Core Layout (Target: Week 1)
- [ ] Header Component - 🔴 Not Started
- [ ] Footer Component - 🔴 Not Started

### Phase 2: Hero & Branding (Target: Week 1-2)
- [ ] Hero Section - 🔴 Not Started
- [ ] Client Logos Carousel - 🔴 Not Started

### Phase 3: Content Sections (Target: Week 2-3)
- [ ] Pain Point Section - 🔴 Not Started
- [ ] SEO Results Section - 🔴 Not Started
- [ ] Services Showcase - 🔴 Not Started
- [ ] What is SEO Section - 🔴 Not Started

### Phase 4: Social Proof (Target: Week 3-4)
- [ ] Testimonials Section - 🔴 Not Started

### Phase 5: Interactive (Target: Week 4-5)
- [ ] FAQ Section - 🔴 Not Started
- [ ] Blog Preview Section - 🔴 Not Started

### Phase 6: Utilities (Target: Week 5)
- [ ] WhatsApp Button - 🔴 Not Started
- [ ] Contact Modal - 🔴 Not Started

---

## Success Criteria

✅ **Component Created** when:
- Component file exists in `cms-ready` folder
- All props are defined with TypeScript interfaces
- Component has default values for all props
- Component is responsive and accessible

✅ **Schema Added** when:
- Schema markup is implemented
- Schema validates with Google Rich Results Test
- Schema is documented

✅ **Registry Added** when:
- Component definition JSON exists
- Component is registered in registry
- Component appears in CMS component list

✅ **Database Migrated** when:
- Database entry exists
- Component can be queried from database
- Component properties match registry definition

✅ **Fully Tested** when:
- All tests pass
- Component works in CMS preview
- Component is editable in CMS
- Documentation is complete
