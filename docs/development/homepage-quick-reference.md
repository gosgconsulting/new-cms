# Homepage Component Quick Reference

## Current Homepage Structure

```
Index Page (src/pages/Index.tsx)
│
├── Header (fixed, global)
│   ├── Logo
│   └── Contact CTA Button
│
├── Main Content
│   │
│   ├── 1. Hero Section
│   │   ├── Badge (Results in 3 months)
│   │   ├── Headline (2 lines)
│   │   ├── Description
│   │   ├── CTA Button
│   │   └── Client Logos Carousel (8 logos, infinite scroll)
│   │
│   ├── 2. Pain Point Section
│   │   ├── Title
│   │   ├── Pain Point Cards (grid)
│   │   └── CTA Button
│   │
│   ├── 3. SEO Results Section
│   │   ├── Title
│   │   ├── Results Slider
│   │   └── Stats Counter
│   │
│   ├── 4. Services Showcase
│   │   ├── Title
│   │   ├── Service Cards (3 columns)
│   │   └── CTA Button
│   │
│   ├── 5. What is SEO Section
│   │   ├── Title
│   │   ├── Content Blocks
│   │   ├── Images
│   │   └── CTA Button
│   │
│   ├── 6. Testimonials Section
│   │   ├── Title
│   │   └── Testimonial Cards (3 columns)
│   │
│   ├── 7. FAQ Section
│   │   ├── Title
│   │   └── Accordion Items (3 questions)
│   │
│   └── 8. Blog Section
│       ├── Title
│       ├── Blog Cards (latest posts)
│       └── View All Link
│
├── Footer (global)
│   ├── CTA Section
│   ├── Contact Links
│   ├── Legal Links
│   └── Copyright
│
└── Floating Elements
    ├── WhatsApp Button (bottom right)
    └── Contact Modal (overlay)
```

---

## Component Files Reference

| Section | Current File | Lines | Dependencies |
|---------|-------------|-------|--------------|
| Header | `src/components/Header.tsx` | 74 | react-router-dom |
| Hero | `src/components/HeroSection.tsx` | 184 | framer-motion, lucide-react |
| Pain Points | `src/components/PainPointSection.tsx` | ? | lucide-react |
| SEO Results | `src/components/SEOResultsSection.tsx` | ? | embla-carousel-react |
| Services | `src/components/SEOServicesShowcase.tsx` | ? | lucide-react |
| What is SEO | `src/components/WhatIsSEOServicesSection.tsx` | ? | - |
| Testimonials | `src/components/NewTestimonials.tsx` | ? | - |
| FAQ | `src/components/FAQAccordion.tsx` | ? | @radix-ui/react-accordion |
| Blog | `src/components/BlogSection.tsx` | ? | react-router-dom |
| Footer | `src/components/Footer.tsx` | 152 | react-router-dom, lucide-react |
| WhatsApp | `src/components/WhatsAppButton.tsx` | ? | lucide-react |
| Contact Modal | `src/components/ContactModal.tsx` | ? | @radix-ui/react-dialog |

---

## CMS Component IDs

| Component | CMS ID | Status | Schema Required |
|-----------|--------|--------|-----------------|
| Header | `header-main` | 🔴 Not Created | Organization |
| Footer | `footer-main` | 🔴 Not Created | Organization, ContactPoint |
| Hero | `hero-main` | 🔴 Not Created | WebPageElement |
| Client Logos | `client-logos-carousel` | 🔴 Not Created | ItemList, ImageObject |
| Pain Points | `pain-point-section` | 🔴 Not Created | ItemList |
| SEO Results | `seo-results-section` | 🔴 Not Created | ItemList, CreativeWork |
| Services | `services-showcase-section` | 🔴 Not Created | ItemList, Service |
| What is SEO | `what-is-seo-section` | 🔴 Not Created | Article, ImageObject |
| Testimonials | `testimonials-section` | 🔴 Not Created | Review, AggregateRating |
| FAQ | `faq-section` | 🔴 Not Created | FAQPage, Question, Answer |
| Blog Preview | `blog-preview-section` | 🔴 Not Created | ItemList, BlogPosting |
| WhatsApp | `whatsapp-button` | 🔴 Not Created | None |
| Contact Modal | `contact-modal` | 🔴 Not Created | ContactPoint |

---

## Schema Markup Priority

### Priority 1: Business Identity
- ✅ Organization Schema (Header/Footer)
- ✅ LocalBusiness Schema (Footer)
- ✅ ContactPoint Schema (Footer/Contact Modal)

### Priority 2: Content Structure
- ✅ FAQPage Schema (FAQ Section)
- ✅ Service Schema (Services Section)
- ✅ Review Schema (Testimonials Section)

### Priority 3: SEO Enhancement
- ✅ WebPageElement Schema (Hero)
- ✅ ItemList Schema (Client Logos, Results)
- ✅ BlogPosting Schema (Blog Section)

### Priority 4: Rich Media
- ✅ ImageObject Schema (All images)
- ✅ VideoObject Schema (If videos added)

---

## SEO Elements Checklist

### Meta Tags
- [ ] `<title>` - Singapore SEO Services | Boost Rankings in 3 Months | GO SG
- [ ] `<meta name="description">` - 160 chars
- [ ] `<meta name="keywords">` - Relevant keywords
- [ ] `<meta name="robots">` - index, follow
- [ ] `<link rel="canonical">` - Current page URL
- [ ] Open Graph tags (6 tags)
- [ ] Twitter Card tags (4 tags)

### Heading Structure
- [ ] H1: Main headline (only one per page)
- [ ] H2: Section titles
- [ ] H3: Subsection titles
- [ ] H4-H6: Nested content

### Accessibility
- [ ] ARIA labels on all interactive elements
- [ ] Skip navigation link
- [ ] Landmark roles (banner, main, contentinfo)
- [ ] Alt text on all images
- [ ] Keyboard navigation support
- [ ] Focus indicators

### Performance
- [ ] Images with lazy loading
- [ ] Images with width/height attributes
- [ ] Preload critical resources
- [ ] Defer non-critical scripts
- [ ] Optimize images (WebP format)
- [ ] Minify CSS/JS

---

## Schema.org Snippets

### Organization Schema
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://www.example.com/#organization",
  "name": "GO SG Consulting",
  "url": "https://www.example.com",
  "logo": "https://www.example.com/logo.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+65-XXXX-XXXX",
    "contactType": "customer service",
    "areaServed": "SG",
    "availableLanguage": ["en", "zh"]
  },
  "sameAs": [
    "https://www.instagram.com/...",
    "https://www.linkedin.com/..."
  ],
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Business Street",
    "addressLocality": "Singapore",
    "postalCode": "123456",
    "addressCountry": "SG"
  }
}
```

### Service Schema
```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "Search Engine Optimization",
  "name": "SEO Services Singapore",
  "description": "Professional SEO services that boost rankings in 3 months",
  "provider": {
    "@type": "Organization",
    "name": "GO SG Consulting",
    "@id": "https://www.example.com/#organization"
  },
  "areaServed": {
    "@type": "Country",
    "name": "Singapore"
  },
  "offers": {
    "@type": "Offer",
    "price": "600",
    "priceCurrency": "SGD",
    "priceSpecification": {
      "@type": "UnitPriceSpecification",
      "price": "600.00",
      "priceCurrency": "SGD",
      "referenceQuantity": {
        "@type": "QuantitativeValue",
        "value": "1",
        "unitCode": "MON"
      }
    },
    "availability": "https://schema.org/InStock"
  }
}
```

### FAQPage Schema
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How do backlinks help my website's SEO?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Backlinks are crucial for building your website's authority and trust..."
      }
    },
    {
      "@type": "Question",
      "name": "Why are blog posts important for SEO?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Blog posts are essential for SEO because they provide fresh, relevant content..."
      }
    }
  ]
}
```

### Review/Testimonial Schema
```json
{
  "@context": "https://schema.org",
  "@type": "Review",
  "itemReviewed": {
    "@type": "Service",
    "name": "SEO Services",
    "@id": "https://www.example.com/#seo-service"
  },
  "reviewRating": {
    "@type": "Rating",
    "ratingValue": "5",
    "bestRating": "5"
  },
  "author": {
    "@type": "Person",
    "name": "John Doe"
  },
  "reviewBody": "Excellent SEO service! Our traffic increased by 250% in just 3 months.",
  "datePublished": "2024-12-15"
}
```

---

## Component Property Patterns

### Editable Text Properties
```typescript
{
  type: 'string',
  description: 'Property description',
  editable: true,
  required: true|false,
  default: 'Default value'
}
```

### Editable Image Properties
```typescript
{
  type: 'object',
  description: 'Image with alt text',
  editable: true,
  required: true,
  default: {
    src: '/path/to/image.jpg',
    alt: 'Image description'
  }
}
```

### Editable Array Properties
```typescript
{
  type: 'array',
  description: 'List of items',
  editable: true,
  required: true,
  default: [
    {
      title: 'Item 1',
      description: 'Description'
    }
  ]
}
```

### Boolean Toggle Properties
```typescript
{
  type: 'boolean',
  description: 'Show/hide element',
  editable: true,
  default: true
}
```

---

## Testing Checklist

### Schema Validation
- [ ] Google Rich Results Test - https://search.google.com/test/rich-results
- [ ] Schema Markup Validator - https://validator.schema.org/
- [ ] Facebook Sharing Debugger - https://developers.facebook.com/tools/debug/
- [ ] Twitter Card Validator - https://cards-dev.twitter.com/validator

### SEO Audit
- [ ] Google Lighthouse (SEO score 95+)
- [ ] Google PageSpeed Insights
- [ ] Mobile-Friendly Test
- [ ] Structured Data Testing Tool

### Accessibility
- [ ] WAVE Web Accessibility Tool
- [ ] axe DevTools
- [ ] Keyboard Navigation Test
- [ ] Screen Reader Test (NVDA/JAWS)

### Performance
- [ ] Core Web Vitals
  - [ ] LCP (Largest Contentful Paint) < 2.5s
  - [ ] FID (First Input Delay) < 100ms
  - [ ] CLS (Cumulative Layout Shift) < 0.1
- [ ] GTmetrix Score
- [ ] WebPageTest.org

---

## Migration Commands

### Create Component File
```bash
# Create new CMS-ready component
touch src/components/cms-ready/[ComponentName].tsx
```

### Register Component
```typescript
// In sparti-cms/registry/index.ts
import componentDefinition from './components/[component-id].json';
componentRegistry.register(componentDefinition);
```

### Database Migration
```sql
-- Insert component into database
INSERT INTO cms_components (id, name, type, category, properties, version)
VALUES (...);
```

### Test Component
```bash
# Run component tests
npm run test src/components/cms-ready/[ComponentName].test.tsx
```

---

## Resources

### Documentation
- [Homepage Audit & Restructure Plan](./homepage-audit-restructure-plan.md)
- [Component Migration Mapping](./component-migration-mapping.md)
- [Development Workflow](../sparti-cms/docs/development-workflow.md)
- [Database Rules](../sparti-cms/docs/database-rules.md)

### Tools
- Schema.org Documentation: https://schema.org/
- Google Search Console: https://search.google.com/search-console
- Google Rich Results Test: https://search.google.com/test/rich-results
- Lighthouse CI: https://github.com/GoogleChrome/lighthouse-ci

### Best Practices
- MDN Web Docs: https://developer.mozilla.org/
- Web.dev: https://web.dev/
- A11y Project: https://www.a11yproject.com/
- React Accessibility: https://react.dev/learn/accessibility

---

## Quick Start Commands

```bash
# View current homepage structure
cat src/pages/Index.tsx

# Start development server
npm run dev

# Run SEO audit
npx lighthouse https://localhost:5173 --view

# Validate schema markup
# (Copy schema JSON and paste into https://validator.schema.org/)

# Check accessibility
npx @axe-core/cli https://localhost:5173
```
