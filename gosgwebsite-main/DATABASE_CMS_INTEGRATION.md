# Dynamic CMS Database Integration

This document outlines the implementation of dynamic content management for the GO SG website, allowing page content to be fetched from a PostgreSQL database rather than hardcoded in the frontend.

## Overview

The system fetches page content from a PostgreSQL database using the following flow:

1. Frontend components request page content via API endpoints
2. Express server queries the database for page content
3. Database returns structured JSON content for the requested page
4. Express server processes and returns the content to the frontend
5. Frontend components render the dynamic content

## Database Schema

The database uses the following key tables:

### `pages` Table

Stores basic page information:

- `id`: Unique identifier for the page
- `page_name`: Human-readable name of the page (e.g., "Homepage")
- `slug`: URL-friendly identifier (e.g., "/gosghome")
- `meta_title`: SEO title for the page
- `meta_description`: SEO description for the page
- `seo_index`: Boolean indicating if the page should be indexed by search engines
- `status`: Page status (e.g., "published", "draft")
- `created_at`: Timestamp of page creation
- `updated_at`: Timestamp of last update
- `tenant_id`: Identifier for multi-tenant support

### `page_layouts` Table

Stores the actual content structure for each page:

- `id`: Unique identifier for the layout
- `page_id`: Foreign key referencing the `pages` table
- `layout_json`: JSONB field containing the page structure and content
- `version`: Version number for the layout
- `updated_at`: Timestamp of last update
- `language`: Language code for multi-language support

## API Endpoints

### `/api/home-content`

Fetches the homepage content:

```
GET /api/home-content
```

### `/api/page-content/:slug`

Fetches content for a specific page by slug:

```
GET /api/page-content/home
GET /api/page-content/about
GET /api/page-content/services
```

### `/api/page-content/global`

Fetches global content used across all pages:

```
GET /api/page-content/global
```

## Content Structure

The content is structured as a JSON object with the following format:

```json
{
  "slug": "home",
  "meta": {
    "title": "Page Title",
    "description": "Page description",
    "keywords": "keyword1, keyword2"
  },
  "components": [
    {
      "key": "UniqueKey",
      "name": "DisplayName",
      "type": "ComponentType",
      "items": [
        {
          "key": "item1",
          "type": "text|heading|image|button",
          "content": "Content value"
        }
      ]
    }
  ]
}
```

## Implementation Details

### Database Queries

For the homepage, we use the following query flow:

1. Find the page ID using tenant ID and page name:
   ```sql
   SELECT id, page_name, slug, meta_title, meta_description 
   FROM pages 
   WHERE tenant_id = $1 AND page_name = 'Homepage'
   ```

2. Get the layout JSON using the page ID:
   ```sql
   SELECT layout_json 
   FROM page_layouts 
   WHERE page_id = $1
   ```

### Content Processing

The server processes the `layout_json` field from the database:

1. Parse the JSON if it's stored as a string
2. Check if the content has a nested `components` property and extract it if needed
3. Ensure the components are always returned as an array
4. Construct the final response with metadata and components

## Frontend Integration

The frontend uses custom hooks to fetch and manage the dynamic content:

- `usePageContent(slug)`: Fetches content for a specific page
- `useGlobalSchema()`: Fetches global content used across all pages

The `DynamicPageRenderer` component takes the schema and renders the appropriate components based on the component type.

## Component Registry

Components are registered in a central registry (`componentRegistry.ts`) that maps component types to actual React components:

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

## Environment Variables

The system uses the following environment variables:

- `DATABASE_PUBLIC_URL`: Connection string for the PostgreSQL database
- `CMS_TENANT`: Tenant ID for multi-tenant support
- `BACKEND_PORT`: Port for the Express server
- `VITE_BACKEND_SERVER_URL`: URL for the frontend to connect to the backend

## Testing

Several test scripts are available to verify the integration:

- `test-db-queries.js`: Tests direct database queries
- `test-api-endpoint.js`: Tests API endpoints
- `test-server-js.js`: Tests the full server implementation

## Troubleshooting

Common issues:

1. **Database Connection Issues**: Check the `DATABASE_PUBLIC_URL` environment variable and ensure the database is accessible.

2. **Missing Tenant ID**: Ensure the `CMS_TENANT` environment variable is set correctly.

3. **Component Not Found**: Verify that all component types in the database match entries in the component registry.

4. **Empty Components Array**: Check that the `layout_json` field in the database is properly formatted and contains a valid components array.

## Future Improvements

1. Add authentication for API endpoints
2. Implement caching for frequently accessed pages
3. Add support for component-level permissions
4. Implement version history and rollback functionality
5. Add real-time content updates using WebSockets