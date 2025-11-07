# Homepage Audit & Restructure Plan

## Current Structure Analysis

### Page Overview: `src/pages/Index.tsx`
The homepage is a single-page application with the following sections:
1. Header (fixed navigation)
2. Hero Section
3. Pain Point Section
4. SEO Results Section
5. SEO Services Showcase
6. What is SEO Services Section
7. Testimonials Section
8. FAQ Section
9. Blog Section
10. Footer
11. WhatsApp Button (floating)
12. Contact Modal (overlay)

---

## SEO Audit

### ❌ Current SEO Issues

1. **Missing Semantic HTML Structure**
   - No proper HTML5 semantic tags hierarchy
   - Missing `<article>`, `<aside>` tags where appropriate
   - No proper heading hierarchy validation

2. **Missing Schema Markup**
   - No Organization schema
   - No LocalBusiness schema
   - No Service schema for SEO services
   - No Review/Rating schema for testimonials
   - No FAQPage schema
   - No BreadcrumbList schema

3. **Missing Meta Tags**
   - No Open Graph tags
   - No Twitter Card tags
   - No canonical URLs
   - No structured data for social sharing

4. **Missing SEO Meta Information**
   - No `<title>` tag management
   - No meta description
   - No meta keywords
   - No robots meta tag
   - No language tags

5. **Performance Issues**
   - No lazy loading for images
   - No preload/prefetch for critical resources
   - Missing image optimization attributes (loading, decoding)

6. **Accessibility Issues**
   - Missing ARIA labels on interactive elements
   - No skip navigation link
   - Missing landmark roles

---

## ✅ Proposed SEO-Friendly Structure

### HTML Document Structure
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- SEO Meta Tags -->
  <title>Singapore SEO Services | Boost Rankings in 3 Months | GO SG</title>
  <meta name="description" content="Expert SEO services in Singapore. Increase organic traffic, improve rankings, and dominate search results in just 3 months. Starting from 600 SGD/month.">
  <meta name="keywords" content="SEO Singapore, SEO services, search engine optimization, digital marketing Singapore">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://www.example.com/">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://www.example.com/">
  <meta property="og:title" content="Singapore SEO Services | Boost Rankings in 3 Months">
  <meta property="og:description" content="Expert SEO services that deliver results.">
  <meta property="og:image" content="https://www.example.com/og-image.jpg">
  
  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="https://www.example.com/">
  <meta property="twitter:title" content="Singapore SEO Services">
  <meta property="twitter:description" content="Expert SEO services that deliver results.">
  <meta property="twitter:image" content="https://www.example.com/twitter-image.jpg">
</head>
<body>
  <!-- Skip Navigation -->
  <a href="#main-content" class="skip-navigation">Skip to main content</a>
  
  <!-- Header with Schema -->
  <header role="banner">...</header>
  
  <!-- Main Content -->
  <main id="main-content" role="main">
    <article>...</article>
  </main>
  
  <!-- Footer with Schema -->
  <footer role="contentinfo">...</footer>
</body>
</html>
```

### Required Schema Markup

#### 1. Organization Schema
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
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
  ]
}
```

#### 2. LocalBusiness Schema
```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "GO SG Consulting",
  "image": "https://www.example.com/business-image.jpg",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Business Street",
    "addressLocality": "Singapore",
    "postalCode": "123456",
    "addressCountry": "SG"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 1.3521,
    "longitude": 103.8198
  },
  "telephone": "+65-XXXX-XXXX",
  "priceRange": "$$",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "50"
  }
}
```

#### 3. Service Schema (for each SEO service)
```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "SEO Services",
  "provider": {
    "@type": "Organization",
    "name": "GO SG Consulting"
  },
  "areaServed": "Singapore",
  "offers": {
    "@type": "Offer",
    "price": "600",
    "priceCurrency": "SGD",
    "priceSpecification": {
      "@type": "UnitPriceSpecification",
      "referenceQuantity": {
        "@type": "QuantitativeValue",
        "value": "1",
        "unitCode": "MON"
      }
    }
  }
}
```

#### 4. FAQPage Schema
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
        "text": "Backlinks are crucial for building your website's authority..."
      }
    }
  ]
}
```

#### 5. Review Schema (for testimonials)
```json
{
  "@context": "https://schema.org",
  "@type": "Review",
  "itemReviewed": {
    "@type": "Service",
    "name": "SEO Services"
  },
  "reviewRating": {
    "@type": "Rating",
    "ratingValue": "5",
    "bestRating": "5"
  },
  "author": {
    "@type": "Person",
    "name": "Client Name"
  },
  "reviewBody": "Testimonial text..."
}
```

---

## Component-Based Architecture Plan

### Component Hierarchy

```
App
├── SEOHead (new)
│   ├── Meta tags
│   ├── Schema markup
│   └── Structured data
│
├── Header
│   ├── Logo
│   ├── Navigation (future)
│   └── CTAButton
│
├── Main
│   ├── HeroSection
│   │   ├── Headline
│   │   ├── Subheadline
│   │   ├── CTAButton
│   │   └── ClientLogos
│   │
│   ├── PainPointSection
│   │   ├── SectionTitle
│   │   ├── PainPointCard (repeatable)
│   │   └── CTAButton
│   │
│   ├── SEOResultsSection
│   │   ├── SectionTitle
│   │   ├── ResultCard (repeatable)
│   │   └── StatsCounter
│   │
│   ├── ServicesSection
│   │   ├── SectionTitle
│   │   ├── ServiceCard (repeatable)
│   │   └── CTAButton
│   │
│   ├── WhatIsSEOSection
│   │   ├── ContentBlock
│   │   ├── ImageWithCaption
│   │   └── CTAButton
│   │
│   ├── TestimonialsSection
│   │   ├── SectionTitle
│   │   ├── TestimonialCard (repeatable)
│   │   └── Rating (schema-enabled)
│   │
│   ├── FAQSection
│   │   ├── SectionTitle
│   │   ├── FAQItem (repeatable, schema-enabled)
│   │   └── CTAButton
│   │
│   └── BlogSection
│       ├── SectionTitle
│       ├── BlogCard (repeatable)
│       └── ViewAllLink
│
├── Footer
│   ├── CTASection
│   ├── ContactLinks
│   ├── LegalLinks
│   └── Copyright
│
└── FloatingElements
    ├── WhatsAppButton
    └── ContactModal
```

---

## CMS Component Registry Migration Plan

### Phase 1: Core Layout Components (Priority: High)

#### 1. Header Component
**Component ID:** `header-main`
**Type:** `container`
**Category:** `layout`
**Properties:**
```json
{
  "logo": { "type": "image", "editable": true, "required": true },
  "ctaText": { "type": "string", "editable": true, "default": "Contact Us" },
  "isScrolled": { "type": "boolean", "editable": false, "default": false },
  "backgroundColor": { "type": "string", "editable": true, "default": "transparent" }
}
```
**Schema Required:** Organization schema
**File Location:** `src/components/cms-ready/Header.tsx`

#### 2. Footer Component
**Component ID:** `footer-main`
**Type:** `container`
**Category:** `layout`
**Properties:**
```json
{
  "ctaHeading": { "type": "string", "editable": true },
  "ctaDescription": { "type": "string", "editable": true },
  "ctaButtonText": { "type": "string", "editable": true },
  "contactLinks": { "type": "array", "editable": true },
  "legalLinks": { "type": "array", "editable": true },
  "copyrightText": { "type": "string", "editable": true }
}
```
**Schema Required:** Organization schema, ContactPoint schema
**File Location:** `src/components/cms-ready/Footer.tsx`

---

### Phase 2: Hero Section Components (Priority: High)

#### 3. Hero Section
**Component ID:** `hero-main`
**Type:** `container`
**Category:** `content`
**Properties:**
```json
{
  "badgeText": { "type": "string", "editable": true, "default": "Results in 3 months or less" },
  "headingLine1": { "type": "string", "editable": true, "required": true },
  "headingLine2": { "type": "string", "editable": true, "required": true },
  "description": { "type": "string", "editable": true, "required": true },
  "ctaButtonText": { "type": "string", "editable": true, "default": "Get a Quote" },
  "backgroundGradient": { "type": "object", "editable": true }
}
```
**Schema Required:** WebPageElement schema
**File Location:** `src/components/cms-ready/HeroSection.tsx`

#### 4. Client Logos Carousel
**Component ID:** `client-logos-carousel`
**Type:** `media`
**Category:** `content`
**Properties:**
```json
{
  "logos": {
    "type": "array",
    "editable": true,
    "items": {
      "image": { "type": "image", "required": true },
      "alt": { "type": "string", "required": true },
      "link": { "type": "string", "required": false }
    }
  },
  "animationSpeed": { "type": "number", "editable": true, "default": 30 }
}
```
**Schema Required:** ImageObject schema for each logo
**File Location:** `src/components/cms-ready/ClientLogosCarousel.tsx`

---

### Phase 3: Content Section Components (Priority: Medium)

#### 5. Pain Point Section
**Component ID:** `pain-point-section`
**Type:** `container`
**Category:** `content`
**Properties:**
```json
{
  "sectionTitle": { "type": "string", "editable": true, "required": true },
  "sectionSubtitle": { "type": "string", "editable": true },
  "painPoints": {
    "type": "array",
    "editable": true,
    "items": {
      "icon": { "type": "string", "required": true },
      "title": { "type": "string", "required": true },
      "description": { "type": "string", "required": true }
    }
  },
  "ctaButtonText": { "type": "string", "editable": true }
}
```
**Schema Required:** ItemList schema
**File Location:** `src/components/cms-ready/PainPointSection.tsx`

#### 6. SEO Results Section
**Component ID:** `seo-results-section`
**Type:** `container`
**Category:** `content`
**Properties:**
```json
{
  "sectionTitle": { "type": "string", "editable": true, "required": true },
  "sectionSubtitle": { "type": "string", "editable": true },
  "results": {
    "type": "array",
    "editable": true,
    "items": {
      "image": { "type": "image", "required": true },
      "title": { "type": "string", "required": true },
      "metric": { "type": "string", "required": true },
      "description": { "type": "string", "required": true }
    }
  }
}
```
**Schema Required:** ImageObject schema, Dataset schema
**File Location:** `src/components/cms-ready/SEOResultsSection.tsx`

#### 7. Services Showcase Section
**Component ID:** `services-showcase-section`
**Type:** `container`
**Category:** `content`
**Properties:**
```json
{
  "sectionTitle": { "type": "string", "editable": true, "required": true },
  "sectionSubtitle": { "type": "string", "editable": true },
  "services": {
    "type": "array",
    "editable": true,
    "items": {
      "icon": { "type": "string", "required": true },
      "title": { "type": "string", "required": true },
      "description": { "type": "string", "required": true },
      "features": { "type": "array", "required": true }
    }
  },
  "ctaButtonText": { "type": "string", "editable": true }
}
```
**Schema Required:** Service schema, Offer schema
**File Location:** `src/components/cms-ready/ServicesShowcaseSection.tsx`

#### 8. What is SEO Section
**Component ID:** `what-is-seo-section`
**Type:** `container`
**Category:** `content`
**Properties:**
```json
{
  "sectionTitle": { "type": "string", "editable": true, "required": true },
  "content": { "type": "string", "editable": true, "required": true },
  "images": {
    "type": "array",
    "editable": true,
    "items": {
      "image": { "type": "image", "required": true },
      "caption": { "type": "string", "required": false }
    }
  },
  "ctaButtonText": { "type": "string", "editable": true }
}
```
**Schema Required:** Article schema, ImageObject schema
**File Location:** `src/components/cms-ready/WhatIsSEOSection.tsx`

---

### Phase 4: Social Proof Components (Priority: Medium)

#### 9. Testimonials Section
**Component ID:** `testimonials-section`
**Type:** `container`
**Category:** `content`
**Properties:**
```json
{
  "sectionTitle": { "type": "string", "editable": true, "required": true },
  "sectionSubtitle": { "type": "string", "editable": true },
  "testimonials": {
    "type": "array",
    "editable": true,
    "items": {
      "author": { "type": "string", "required": true },
      "company": { "type": "string", "required": true },
      "avatar": { "type": "image", "required": false },
      "rating": { "type": "number", "required": true, "min": 1, "max": 5 },
      "text": { "type": "string", "required": true },
      "date": { "type": "string", "required": true }
    }
  }
}
```
**Schema Required:** Review schema, AggregateRating schema
**File Location:** `src/components/cms-ready/TestimonialsSection.tsx`

---

### Phase 5: Interactive Components (Priority: Medium)

#### 10. FAQ Section
**Component ID:** `faq-section`
**Type:** `container`
**Category:** `interactive`
**Properties:**
```json
{
  "sectionTitle": { "type": "string", "editable": true, "required": true },
  "sectionSubtitle": { "type": "string", "editable": true },
  "faqs": {
    "type": "array",
    "editable": true,
    "items": {
      "question": { "type": "string", "required": true },
      "answer": { "type": "string", "required": true }
    }
  }
}
```
**Schema Required:** FAQPage schema, Question schema, Answer schema
**File Location:** `src/components/cms-ready/FAQSection.tsx`

#### 11. Blog Preview Section
**Component ID:** `blog-preview-section`
**Type:** `container`
**Category:** `content`
**Properties:**
```json
{
  "sectionTitle": { "type": "string", "editable": true, "required": true },
  "sectionSubtitle": { "type": "string", "editable": true },
  "postsCount": { "type": "number", "editable": true, "default": 3 },
  "showAllLink": { "type": "string", "editable": true }
}
```
**Schema Required:** BlogPosting schema, ItemList schema
**File Location:** `src/components/cms-ready/BlogPreviewSection.tsx`

---

### Phase 6: Utility Components (Priority: Low)

#### 12. WhatsApp Button
**Component ID:** `whatsapp-button`
**Type:** `button`
**Category:** `interactive`
**Properties:**
```json
{
  "phoneNumber": { "type": "string", "editable": true, "required": true },
  "message": { "type": "string", "editable": true },
  "position": { "type": "string", "editable": true, "default": "bottom-right" },
  "backgroundColor": { "type": "string", "editable": true }
}
```
**Schema Required:** None
**File Location:** `src/components/cms-ready/WhatsAppButton.tsx`

#### 13. Contact Modal
**Component ID:** `contact-modal`
**Type:** `form`
**Category:** `interactive`
**Properties:**
```json
{
  "modalTitle": { "type": "string", "editable": true },
  "formFields": { "type": "array", "editable": true },
  "submitButtonText": { "type": "string", "editable": true },
  "successMessage": { "type": "string", "editable": true }
}
```
**Schema Required:** ContactPoint schema
**File Location:** `src/components/cms-ready/ContactModal.tsx`

---

## Implementation Checklist

### SEO Implementation
- [ ] Create SEOHead component with all meta tags
- [ ] Implement Organization schema
- [ ] Implement LocalBusiness schema
- [ ] Implement Service schema
- [ ] Implement FAQPage schema
- [ ] Implement Review/Rating schema
- [ ] Add Open Graph tags
- [ ] Add Twitter Card tags
- [ ] Add canonical URLs
- [ ] Implement breadcrumbs with schema
- [ ] Add structured data for images
- [ ] Implement proper heading hierarchy (H1 → H2 → H3)
- [ ] Add ARIA labels and roles
- [ ] Implement skip navigation
- [ ] Add language tags
- [ ] Optimize images with lazy loading
- [ ] Add preload/prefetch for critical resources

### Component Development
- [ ] Phase 1: Create Header and Footer components
- [ ] Phase 2: Create Hero and ClientLogos components
- [ ] Phase 3: Create content section components
- [ ] Phase 4: Create social proof components
- [ ] Phase 5: Create interactive components
- [ ] Phase 6: Create utility components

### CMS Integration
- [ ] Register all components in component registry
- [ ] Create component schemas in database
- [ ] Test component rendering
- [ ] Test component editing
- [ ] Implement component preview in CMS
- [ ] Create component documentation
- [ ] Test schema validation

### Testing
- [ ] Validate schema markup with Google Rich Results Test
- [ ] Test Open Graph tags with Facebook Debugger
- [ ] Test Twitter Cards with Twitter Card Validator
- [ ] Run Lighthouse SEO audit
- [ ] Check accessibility with WAVE
- [ ] Validate HTML structure
- [ ] Test responsive design
- [ ] Test component interactivity

---

## Timeline Estimate

- **Phase 1 (SEO Foundation):** 3-5 days
- **Phase 2 (Layout Components):** 5-7 days
- **Phase 3 (Content Components):** 7-10 days
- **Phase 4 (Social Proof Components):** 3-5 days
- **Phase 5 (Interactive Components):** 5-7 days
- **Phase 6 (Utility Components):** 2-3 days
- **Testing & Refinement:** 3-5 days

**Total Estimated Time:** 28-42 days (4-6 weeks)

---

## Next Steps

1. Review and approve this plan
2. Set up component development environment
3. Create base SEO utilities and helpers
4. Start Phase 1: Core Layout Components
5. Test and iterate
6. Move to Phase 2 and continue sequentially

---

## Success Metrics

- [ ] Google Lighthouse SEO score: 95+
- [ ] All schema markup validated
- [ ] Page load time < 3 seconds
- [ ] All components registered in CMS
- [ ] 100% component test coverage
- [ ] Accessibility score: 95+
- [ ] Mobile responsiveness: 100%
