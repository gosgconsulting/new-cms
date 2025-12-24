# CMS Database Integration

This document provides instructions for setting up the CMS database integration for the GOSG website.

## Overview

The CMS integration allows content to be managed through the database and served to the frontend via an API. The system uses:

- PostgreSQL database for storing page content
- Express API server for serving page content
- React frontend for rendering dynamic content

## Database Structure

The integration relies on the following database tables:

1. **pages** - Contains information about each page
   - `id`: Primary key
   - `tenant_id`: CMS tenant ID
   - `page_name`: Name of the page (e.g., "Homepage")
   - `slug`: URL slug for the page
   - `meta_title`: Page title for SEO
   - `meta_description`: Page description for SEO
   - `meta_keywords`: Page keywords for SEO

2. **page_layouts** - Contains the layout JSON for each page
   - `id`: Primary key
   - `page_id`: Foreign key referencing pages.id
   - `layout_json`: JSON array of components for the page
   - `version`: Version number
   - `updated_at`: Last update timestamp
   - `language`: Language code (e.g., "en")

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the project root with the following variables:

```
# Database connection
DATABASE_PUBLIC_URL=postgres://user:password@host:port/database

# CMS Tenant ID
CMS_TENANT=your_tenant_id_here

# Backend server configuration
VITE_USE_BACKEND_SERVER=true
VITE_BACKEND_SERVER_URL=http://localhost:3001
BACKEND_PORT=3001

# Environment
NODE_ENV=development
```

Replace the placeholders with your actual values:
- `DATABASE_PUBLIC_URL`: Your PostgreSQL connection string
- `CMS_TENANT`: Your CMS tenant ID

### 2. Install Dependencies

Make sure all dependencies are installed:

```bash
npm install
```

### 3. Start the Server

Start both the backend API server and frontend development server:

```bash
npm run dev:all
```

## Testing the Integration

### 1. Test Database Connection

Test the database connection and check if the pages and page_layouts tables are properly set up:

```bash
npm run test:cms-db
```

### 2. Test API Endpoints

Test the API endpoints using a tool like Postman or curl:

```bash
# Get all page schemas
curl http://localhost:3001/api/page-schemas

# Get home page content
curl http://localhost:3001/api/home

# Get a specific page by slug
curl http://localhost:3001/api/page-content/about

# Health check
curl http://localhost:3001/health
```

### 3. Test Frontend Rendering

1. Open your browser and navigate to `http://localhost:8080/`
2. Verify that the home page is loading content from the database
3. Check the browser console for any errors

## API Endpoints

### GET /api/page-schemas

Returns a list of all pages for the current tenant.

### GET /api/page-content/:slug

Returns the page content for the specified slug.

### GET /api/home

Convenience endpoint that returns the home page content.

### PUT /api/page-content/:slug

Updates the page content for the specified slug.

## Troubleshooting

### Database Connection Issues

- Verify that your PostgreSQL server is running
- Check that the `DATABASE_PUBLIC_URL` environment variable is correct
- Ensure that the database user has permission to access the tables

### API Endpoint Issues

- Check that the server is running on the correct port
- Verify that the `VITE_BACKEND_SERVER_URL` environment variable is set correctly
- Check the server logs for any errors

### Frontend Rendering Issues

- Check the browser console for any errors
- Verify that the components in the layout_json match the components in the componentRegistry
- Ensure that the components are properly handling the dynamic data
