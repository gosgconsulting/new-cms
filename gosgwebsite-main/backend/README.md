# GOSG Website Backend

This folder contains the backend server for the GOSG Website. It provides API endpoints for fetching page content from a PostgreSQL database.

## Structure

- `server.js` - Main Express server file
- `db.js` - Database utility functions
- `start.js` - Script to start the server

## API Endpoints

- `GET /health` - Health check endpoint
- `GET /api/page-schemas` - Get all available page schemas
- `GET /api/page-content/:slug` - Get page content by slug
- `GET /api/home-content` - Get home page content
- `GET /api/page-content/global` - Get global content

## Database Tables

The backend connects to a PostgreSQL database with the following tables:

- `pages` - Contains page metadata (id, page_name, slug, meta_title, meta_description, tenant_id)
- `page_layouts` - Contains page layouts (id, page_id, layout_json)

## Environment Variables

The following environment variables are required:

- `DATABASE_PUBLIC_URL` - PostgreSQL connection string
- `CMS_TENANT` - Tenant ID for the CMS
- `BACKEND_PORT` - Port for the backend server (default: 3001)

## Running the Server

```bash
# Start the server
npm run dev:backend

# Start the server with nodemon (auto-reload on changes)
npm run backend:dev

# Start the server in production mode
npm run start
```
