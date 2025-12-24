# Dynamic Home Page Implementation

This document outlines the implementation of the dynamic home page for the GO SG website, which fetches content from a PostgreSQL database rather than using hardcoded content.

## Overview

The home page now uses a dynamic content system that:

1. Fetches content from a PostgreSQL database via an Express API
2. Structures the content as a schema of components and items
3. Renders the components dynamically based on the schema
4. Supports easy content updates through the database without code changes

## Implementation Steps

### 1. Database Setup

The home page content is stored in two main tables:

- `pages`: Contains basic page information (ID, name, slug, meta data)
- `page_layouts`: Contains the actual content structure as JSON

For the home page, we query:
- The `pages` table using `tenant_id` and `page_name = 'Homepage'`
- The `page_layouts` table using the `page_id` from the previous query

### 2. API Endpoints

Created two main endpoints for the home page:

- `/api/home-content`: Dedicated endpoint for the home page content
- `/api/page-content/home`: General endpoint that handles the home page as a special case

Both endpoints perform the same database queries and return the same structure.

### 3. Content Structure

The home page content follows this structure:

```json
{
  "slug": "/gosghome",
  "meta": {
    "title": "GO SG - Professional SEO Services Singapore",
    "description": "Leading SEO agency in Singapore providing comprehensive digital marketing solutions to boost your online presence and drive organic traffic."
  },
  "components": [
    {
      "key": "MainHeroSection",
      "name": "Hero",
      "type": "HeroSection",
      "items": [...]
    },
    {
      "key": "PainPointSection",
      "name": "PainPoint",
      "type": "PainPointSection",
      "items": [...]
    },
    // Other sections...
  ]
}
```

### 4. Frontend Components

Updated the home page component (`src/pages/Index.tsx`) to:

1. Use the `usePageContent` hook to fetch content from the API
2. Pass the content to the `DynamicPageRenderer` component
3. Include error handling and loading states
4. Provide a fallback for when the API request fails

```typescript
const Index = () => {
  const { data: pageSchema, isLoading, error } = usePageContent('home');
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  // Use fallback data if there's an error
  const content = error ? fallbackData : pageSchema;
  
  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead meta={content.meta} />
      <Header />
      <main className="flex-grow">
        <DynamicPageRenderer schema={content} />
      </main>
      <Footer />
    </div>
  );
};
```

### 5. Component Registry

Created a component registry that maps component types from the schema to actual React components:

```typescript
export const componentRegistry = {
  HeroSection,
  PainPointSection,
  ResultsSection: SEOResultsSection,
  ServicesShowcase: SEOServicesShowcase,
  SEOExplanation: WhatIsSEOServicesSection,
  Testimonials: NewTestimonials,
  FAQAccordion,
  BlogSection,
  ContactForm,
};
```

### 6. Dynamic Rendering

The `DynamicPageRenderer` component:

1. Takes a schema as input
2. Maps over the components array
3. Looks up each component type in the registry
4. Renders the appropriate component with its items

```typescript
export const DynamicPageRenderer = ({ schema }) => {
  if (!schema?.components) {
    return null;
  }
  
  return (
    <>
      {schema.components.map((component, index) => {
        const Component = componentRegistry[component.type];
        
        if (!Component) {
          return <div key={`unknown-${index}`}>Unknown component: {component.type}</div>;
        }
        
        return <Component key={`${component.key}-${index}`} items={component.items} />;
      })}
    </>
  );
};
```

## Home Page Sections

The home page includes the following dynamically rendered sections:

1. **Hero Section**: Main banner with heading and call-to-action
2. **Pain Point Section**: Highlights customer pain points
3. **SEO Results Section**: Showcases client success stories with data
4. **SEO Services Showcase**: Displays available SEO services
5. **What is SEO Section**: Explains SEO concepts and services
6. **Testimonials Section**: Client testimonials with images
7. **FAQ Accordion**: Frequently asked questions
8. **Blog Section**: Recent blog posts
9. **Contact Form**: Contact form for lead generation

## Testing

Created several test scripts to verify the implementation:

- `test-db-queries.js`: Tests direct database queries
- `test-api-endpoint.js`: Tests the API endpoints
- `test-server-js.js`: Tests the full server implementation

## Environment Variables

The system requires the following environment variables:

- `DATABASE_PUBLIC_URL`: PostgreSQL connection string
- `CMS_TENANT`: Tenant ID for multi-tenant support
- `BACKEND_PORT`: Port for the Express server
- `VITE_BACKEND_SERVER_URL`: URL for the frontend to connect to the backend

## Troubleshooting

Common issues:

1. **Empty or Missing Components**: Check that the `layout_json` in the database contains a valid components array.

2. **Component Type Errors**: Ensure all component types in the database match entries in the component registry.

3. **Database Connection Issues**: Verify the `DATABASE_PUBLIC_URL` and `CMS_TENANT` environment variables.

## Future Improvements

1. Add a visual editor for updating the home page content
2. Implement component-level permissions for content editors
3. Add A/B testing capabilities for different home page layouts
4. Implement caching for better performance
5. Add analytics integration to track section performance