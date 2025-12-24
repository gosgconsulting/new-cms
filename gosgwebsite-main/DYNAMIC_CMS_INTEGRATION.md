# Dynamic CMS Integration

This document provides instructions for setting up and testing the dynamic CMS integration for the GOSG website.

## Overview

The dynamic CMS integration allows content to be managed through the CMS and served to the frontend via an API. The system uses:

- PostgreSQL database for storing page schemas
- Express API server for serving page content
- React frontend for rendering dynamic content

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the project root with the following variables:

```
# Database connection
DATABASE_PUBLIC_URL=postgres://user:password@host:port/database

# Backend server configuration
VITE_USE_BACKEND_SERVER=true
VITE_BACKEND_SERVER_URL=http://localhost:3001
BACKEND_PORT=3001

# Environment
NODE_ENV=development
```

Replace the `DATABASE_PUBLIC_URL` with your actual PostgreSQL connection string.

### 2. Install Dependencies

Make sure all dependencies are installed:

```bash
npm install
```

### 3. Set Up Database

Run the database setup script to create the necessary tables and insert initial data:

```bash
npm run db:setup
```

### 4. Start the Server

Start both the backend API server and frontend development server:

```bash
npm run dev:all
```

## Testing the Integration

### 1. Check API Endpoints

Test the API endpoints using a tool like Postman or curl:

```bash
# Get all page schemas
curl http://localhost:3001/api/page-schemas

# Get home page content
curl http://localhost:3001/api/page-content/home

# Health check
curl http://localhost:3001/health
```

### 2. Test Frontend Rendering

1. Open your browser and navigate to `http://localhost:5173/`
2. Verify that the home page is loading content from the database
3. Check the browser console for any errors

### 3. Update Page Content

You can update the page content using the API:

```bash
curl -X PUT http://localhost:3001/api/page-content/home \
  -H "Content-Type: application/json" \
  -d '{"meta": {"title": "Updated Title"}}'
```

Refresh the page to see the changes.

## Component Structure

Each component in the schema has the following structure:

```json
{
  "key": "ComponentKey",
  "name": "Component Name",
  "type": "ComponentType",
  "items": [
    {
      "key": "item_key",
      "type": "item_type",
      "content": "Item content"
    }
  ]
}
```

The `type` field in the component must match a key in the component registry.

## Deployment

To deploy the application to Railway:

1. Set up the environment variables in the Railway dashboard
2. Deploy the application using the Railway CLI or GitHub integration
3. Run the database migration script if needed:

```bash
npm run migrate:railway
```

## Troubleshooting

If you encounter any issues:

1. Check the server logs for errors
2. Verify that the database connection is working
3. Ensure that the environment variables are set correctly
4. Check the browser console for any frontend errors
