# Moski Components Analysis & Mapping

## Overview

This document provides a comprehensive analysis of all Moski tenant components and their mapping to Flowbite design system components.

**Analysis Date:** 2025-01-27  
**Tenants Analyzed:**
- Moski B2B (tenant-a3532ae1)
- Moski (tenant-110ee38b)

---

## Component Mapping Summary

| Moski Component Type | Flowbite Component | Status | Notes |
|---------------------|-------------------|--------|-------|
| HeroSection | FlowbiteHeroSection | ✅ Mapped | Uses existing hero component |
| Showcase | FlowbiteShowcase | ✅ Fixed | Updated to handle Moski items format |
| ProductGrid | FlowbiteProductGrid | ✅ Fixed | Updated to display products |
| Reviews | FlowbiteReviews / FlowbiteTestimonialsSection | ✅ Mapped | Handles Moski props format |
| Newsletter | FlowbiteNewsletter | ✅ Created | New component created |
| PageTitle | FlowbitePageTitle | ✅ Created | New component created |
| Content | FlowbiteContent | ✅ Created | New component created |
| Accordion | FlowbiteFAQSection | ✅ Mapped | Uses existing FAQ component |
| SEO | FlowbiteContentSection | ✅ Mapped | Uses content section |

---

## Detailed Component Analysis

### 1. HeroSection

**Moski Format:**
```json
{
  "type": "HeroSection",
  "items": [
    { "key": "image", "type": "image", "src": "..." },
    { "key": "title", "type": "heading", "level": 1, "content": "" },
    { "key": "button", "type": "button", "link": "/collections", "content": "..." },
    { "key": "showScrollArrow", "type": "boolean", "value": true }
  ]
}
```

**Mapping:** ✅ Uses `FlowbiteHeroSection` (already exists in FlowbiteDioraRenderer)

**Component Type Match:** `herosection`, `hero-section`, `hero`

---

### 2. Showcase

**Moski Format:**
```json
{
  "type": "Showcase",
  "items": [
    {
      "key": "items",
      "type": "array",
      "items": [
        {
          "key": "item1",
          "src": "https://...",
          "link": "/optical",
          "type": "image",
          "content": "Optique"
        },
        {
          "key": "item2",
          "src": "https://...",
          "link": "/sunglasses",
          "type": "image",
          "title": "Solaires"
        }
      ]
    }
  ]
}
```

**Mapping:** ✅ Fixed `FlowbiteShowcase` to handle Moski format

**Changes Made:**
- Updated to extract items from `items` array key
- Handles image items with `src`, `link`, `content`/`title`
- Supports both nested array and direct image items

**Component Type Match:** `showcase`, `categoryshowcase`

---

### 3. ProductGrid

**Moski Format:**
```json
{
  "type": "ProductGrid",
  "items": [
    { "key": "title", "type": "heading", "level": 2, "content": "Collections" },
    { "key": "subtitle", "type": "heading", "level": 3, "content": "" }
  ]
}
```

**Mapping:** ✅ Fixed `FlowbiteProductGrid` to display products

**Changes Made:**
- Updated to extract products from `products` array
- Displays product grid with images, titles, descriptions, prices
- Supports product links

**Component Type Match:** `productgrid`, `product-grid`

---

### 4. Reviews

**Moski Format:**
```json
{
  "type": "Reviews",
  "items": [
    { "key": "title", "type": "heading", "level": 2, "content": "Ce que disent nos clients" },
    { "key": "subtitle", "type": "heading", "level": 3, "content": "..." },
    {
      "key": "reviews",
      "type": "array",
      "items": [
        {
          "id": "1761646428586",
          "key": "review_1761646428586",
          "type": "review",
          "props": {
            "name": "Sophie Martin",
            "title": "Paris, France",
            "rating": 5,
            "content": "Qualité exceptionnelle..."
          }
        }
      ]
    }
  ]
}
```

**Mapping:** ✅ Updated `FlowbiteReviews` and `FlowbiteTestimonialsSection`

**Changes Made:**
- Updated `FlowbiteReviews` to handle Moski props format
- Updated `FlowbiteTestimonialsSection` to handle review items with props
- Both components now support Moski review structure

**Component Type Match:** `reviews`, `testimonials`

---

### 5. Newsletter

**Moski Format:**
```json
{
  "type": "Newsletter",
  "items": [
    { "key": "title", "type": "heading", "level": 2, "content": "MOSKI PARIS" },
    { "key": "subtitle", "type": "heading", "level": 3, "content": "Soyez les premiers..." },
    { "key": "placeholder", "type": "text", "content": "Votre adresse email" },
    { "key": "button", "type": "button", "content": "S'inscrire" }
  ]
}
```

**Mapping:** ✅ Created `FlowbiteNewsletter`

**Component Features:**
- Email input with placeholder
- Subscribe button
- Title and subtitle support
- Form submission handling

**Component Type Match:** `newsletter`

---

### 6. PageTitle

**Moski Format:**
```json
{
  "type": "PageTitle",
  "items": [
    { "key": "title", "type": "heading", "content": "Page Title" }
  ]
}
```

**Mapping:** ✅ Created `FlowbitePageTitle`

**Component Features:**
- Simple page title display
- Optional subtitle
- Centered layout

**Component Type Match:** `pagetitle`, `page-title`

---

### 7. Content

**Moski Format:**
```json
{
  "type": "Content",
  "items": [
    { "key": "content", "type": "text", "content": "Rich text content..." }
  ]
}
```

**Mapping:** ✅ Created `FlowbiteContent`

**Component Features:**
- Rich text content display
- HTML support
- Optional title
- Prose styling

**Component Type Match:** `content`

---

### 8. Accordion

**Moski Format:**
```json
{
  "type": "Accordion",
  "items": [
    { "key": "faqItems", "type": "array", "items": [...] }
  ]
}
```

**Mapping:** ✅ Uses `FlowbiteFAQSection` (already exists)

**Component Type Match:** `accordion`, `faq`

---

## Component Registration

All components are registered in:
- ✅ `FlowbiteDioraRenderer.tsx` - Visual editor renderer
- ✅ `sparti-cms/registry/index.ts` - Component registry
- ✅ Component definition JSON files created

---

## Testing Checklist

For each Moski page, verify:

- [ ] HeroSection renders correctly
- [ ] Showcase displays items with images and links
- [ ] ProductGrid shows products (if available)
- [ ] Reviews display with ratings and content
- [ ] Newsletter form works
- [ ] PageTitle displays correctly
- [ ] Content renders rich text
- [ ] Accordion expands/collapses

---

## Component Type Recognition

The FlowbiteDioraRenderer recognizes these component types for Moski:

| Component Type | Recognized Patterns |
|--------------|-------------------|
| HeroSection | `herosection`, `hero-section`, `hero` |
| Showcase | `showcase`, `categoryshowcase` |
| ProductGrid | `productgrid`, `product-grid` |
| Reviews | `reviews`, `testimonials` |
| Newsletter | `newsletter` |
| PageTitle | `pagetitle`, `page-title` |
| Content | `content` (when not part of "section") |
| Accordion | `accordion`, `faq` |

---

## Next Steps

1. ✅ All Moski components analyzed
2. ✅ Missing components created
3. ✅ Existing components updated for Moski format
4. ✅ All components registered
5. ⏳ Test in visual editor with Moski tenant pages
6. ⏳ Verify all component types render correctly

---

**Last Updated:** 2025-01-27  
**Status:** Complete - All Moski components mapped and created

