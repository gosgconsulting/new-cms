# Database Setup - Railway PostgreSQL

This project uses **Railway PostgreSQL** as its database.

## Database Connection

The database connection is configured in `server.js` and uses the PostgreSQL connection pool from `sparti-cms/db/index.js`.

### Environment Variables

The following environment variables are required in Railway:

- `DATABASE_URL` - Primary PostgreSQL connection string
- `DATABASE_URL` - PostgreSQL connection string
- `NODE_ENV` - Set to 'production' for SSL connection

### Database Schema

The database is automatically initialized when the server starts. It creates the following tables:

#### `site_settings`
Stores site configuration and branding settings:
- `id` - Serial primary key
- `setting_key` - Unique setting identifier (e.g., 'site_name', 'site_logo')
- `setting_value` - Setting value (text or file URL)
- `setting_type` - Type of setting ('text' or 'file')
- `created_at` - Timestamp of creation
- `updated_at` - Timestamp of last update

#### `form_submissions`
Stores all form submissions from the website:
- `id` - Serial primary key
- `name` - Submitter's name
- `email` - Submitter's email
- `message` - Form message content
- `form_type` - Type of form (e.g., 'Contact Modal', 'CTA Contact Form')
- `created_at` - Timestamp of submission

## API Endpoints

The Express server provides the following API endpoints:

### GET `/api/branding`
Fetches current branding settings (site name, tagline, logo, favicon)

**Response:**
```json
{
  "site_name": "GO SG",
  "site_tagline": "Digital Marketing Agency",
  "site_logo": "",
  "site_favicon": ""
}
```

### POST `/api/branding`
Updates branding settings

**Request Body:**
```json
{
  "site_name": "New Site Name",
  "site_logo": "https://example.com/logo.png"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Branding settings updated successfully"
}
```

### GET `/health`
Health check endpoint for Railway deployment monitoring

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-14T09:00:00.000Z",
  "port": 4173
}
```

## Frontend Database Integration

The frontend does NOT directly connect to the database. Instead, it uses the API endpoints provided by the Express server:

### Using the Database Hook

```typescript
import useDatabase from '../../sparti-cms/hooks/useDatabase';

const { getBranding, updateBranding, loading, error } = useDatabase();

// Fetch branding settings
const settings = await getBranding();

// Update a branding setting
await updateBranding('site_name', 'New Name');
```

## Important Notes

1. **Database Only**: This project uses Railway PostgreSQL directly through Express.js API routes.

2. **Server-Side Only**: All database operations happen server-side through the Express API. The PostgreSQL library (`pg`) is never imported in frontend code.

3. **Railway Deployment**: The database is hosted on Railway and automatically connected via environment variables.

4. **Auto-Initialization**: Database tables are created automatically on server startup if they don't exist.

5. **Connection Pooling**: The application uses connection pooling for efficient database access.

## Local Development

For local development:

1. Set up a local PostgreSQL instance or use Railway's development database
2. Create a `.env` file with `DATABASE_URL`
3. Start the server: `node server.js`
4. The database will be initialized automatically

## Troubleshooting

- **Connection Errors**: Check that `DATABASE_URL` is correctly set in Railway environment variables
- **SSL Errors**: Ensure `NODE_ENV=production` is set in Railway for SSL connections
- **Table Creation Errors**: Check server logs for initialization errors on startup
