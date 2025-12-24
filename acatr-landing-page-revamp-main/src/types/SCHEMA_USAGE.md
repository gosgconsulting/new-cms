# Schema Usage Guide

This document explains how to use the dynamic content schema system for the landing page components.

## Overview

The schema system allows all page components to be driven by dynamic content from a CMS API. The schema matches the API response pattern where components are defined with their items (images, headings, buttons, etc.).

## Schema Structure

### API Response Format

```typescript
{
  "success": true,
  "data": {
    "id": 3,
    "page_name": "Home Page",
    "slug": "/home",
    "meta_title": "Page Title",
    "meta_description": "Page description",
    "layout": {
      "components": [
        {
          "key": "HeroSection",
          "name": "Hero",
          "type": "HeroSection",
          "items": [
            {
              "key": "image",
              "type": "image",
              "src": "https://example.com/image.jpg",
              "alt": "Hero image"
            },
            {
              "key": "title",
              "type": "heading",
              "level": 1,
              "content": "Welcome to Our Service"
            },
            {
              "key": "button",
              "type": "button",
              "content": "Get Started",
              "link": "/signup"
            }
          ]
        }
      ]
    }
  }
}
```

## Usage in Components

### 1. Using the Hook

```typescript
import { usePageData } from "@/hooks/usePageData";

function MyPage() {
  const { data: pageData, isLoading, error } = usePageData({ 
    slug: "/home" // or pageId: 3
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  // Use pageData.layout.components...
}
```

### 2. Extracting Component Data

```typescript
import { getComponentByType, transformComponentData } from "@/lib/schema-utils";

// Get a specific component
const heroComponent = getComponentByType(pageData.layout, "HeroSection");

// Transform to usable format
const heroData = transformComponentData(heroComponent);
// Returns: { title, subtitle, image, button, headings, images, buttons, items }
```

### 3. Extracting Specific Items

```typescript
import { 
  getHeading, 
  getImageSrc, 
  getButton, 
  getText,
  getReviews 
} from "@/lib/schema-utils";

const component = getComponentByType(pageData.layout, "HeroSection");

// Get heading by level
const title = getHeading(component.items, 1); // h1
const subtitle = getHeading(component.items, 2); // h2

// Get image
const imageSrc = getImageSrc(component.items, "image");

// Get button
const button = getButton(component.items, "button");
// Returns: { text: "Click me", link: "/path" }

// Get reviews/testimonials
const reviews = getReviews(component.items, "reviews");
```

## Updating Components to Use Schema

### Example: HeroSection with Schema Support

```typescript
import { Component } from "@/types/schema";
import { getHeading, getImageSrc, getButton, getItemsByType } from "@/lib/schema-utils";

interface HeroSectionProps {
  data?: Component; // Optional - supports both static and dynamic
}

const HeroSection = ({ data }: HeroSectionProps) => {
  // If data provided, use it; otherwise use static defaults
  const title = data 
    ? getHeading(data.items, 1) || "Default Title"
    : "Singapore Business Setup In 24 Hours";
  
  const imageSrc = data
    ? getImageSrc(data.items, "image")
    : heroImage; // fallback to static import
  
  const button = data
    ? getButton(data.items, "button")
    : { text: "Start Your Business Journey Today", link: "#" };

  return (
    <section>
      <h1>{title}</h1>
      <img src={imageSrc} alt="Hero" />
      <button>{button.text}</button>
    </section>
  );
};
```

### Example: TestimonialsSection with Reviews

```typescript
import { Component } from "@/types/schema";
import { getReviews, getHeading } from "@/lib/schema-utils";

interface TestimonialsSectionProps {
  data?: Component;
}

const TestimonialsSection = ({ data }: TestimonialsSectionProps) => {
  const title = data
    ? getHeading(data.items, 2) || "Trusted by Businesses"
    : "Trusted by Businesses Worldwide";
  
  const reviews = data
    ? getReviews(data.items, "reviews")
    : defaultTestimonials; // fallback to static

  return (
    <section>
      <h2>{title}</h2>
      {reviews.map((review) => (
        <div key={review.id}>
          <h3>{review.props.name}</h3>
          <p>{review.props.content}</p>
          <div>Rating: {review.props.rating}/5</div>
        </div>
      ))}
    </section>
  );
};
```

## Item Types Reference

### Image Item
```typescript
{
  "key": "image",
  "type": "image",
  "src": "https://example.com/image.jpg",
  "alt": "Description",
  "settings": {
    "layout": "full" // or "contain", "cover"
  }
}
```

### Heading Item
```typescript
{
  "key": "title",
  "type": "heading",
  "level": 1, // 1-6 for h1-h6
  "content": "Your Heading Text"
}
```

### Button Item
```typescript
{
  "key": "button",
  "type": "button",
  "content": "Button Text",
  "link": "/path"
}
```

### Text Item
```typescript
{
  "key": "description",
  "type": "text",
  "content": "Your text content here"
}
```

### Boolean Item
```typescript
{
  "key": "showScrollArrow",
  "type": "boolean",
  "value": true
}
```

### Review Item
```typescript
{
  "id": "unique-id",
  "key": "review_123",
  "type": "review",
  "props": {
    "name": "John Doe",
    "title": "CEO, Company",
    "rating": 5,
    "content": "Great service!",
    "location": "Singapore"
  }
}
```

### Array Item
```typescript
{
  "key": "items",
  "type": "array",
  "items": [
    {
      "key": "item1",
      "type": "image",
      "src": "https://example.com/item1.jpg",
      "link": "/path"
    },
    {
      "key": "item2",
      "type": "image",
      "src": "https://example.com/item2.jpg",
      "link": "/path2"
    }
  ]
}
```

## Environment Setup

Add your API URL to `.env`:

```env
VITE_API_URL=https://your-api.com/api
```

Or pass it directly to the hook:

```typescript
const { data } = usePageData({ 
  slug: "/home",
  apiUrl: "https://custom-api.com/api"
});
```

## Component Type Mapping

The schema supports these component types:
- `Header`
- `HeroSection` / `MinimalHeroSection`
- `ProblemSolutionSection`
- `ServicesSection`
- `TestimonialsSection` / `Reviews`
- `FAQSection`
- `CTASection` / `MinimalNewsletterSection`
- `Footer`
- `Showcase`
- `ProductGrid`
- `Newsletter`

## Best Practices

1. **Always provide fallbacks**: Components should work with or without schema data
2. **Use utility functions**: Use `schema-utils.ts` functions instead of manually parsing
3. **Type safety**: Use TypeScript types from `@/types/schema`
4. **Error handling**: Handle loading and error states gracefully
5. **Performance**: Use React Query caching (already configured in `usePageData`)

## Migration Path

1. ✅ Schema types and utilities created
2. ✅ Index.tsx updated to use schema
3. ⏳ Update components one by one to accept optional `data` prop
4. ⏳ Test with real API responses
5. ⏳ Remove static fallbacks once all components support schema

