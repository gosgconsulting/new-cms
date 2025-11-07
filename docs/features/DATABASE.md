# Database Configuration

## Database Setup

### Current Setup

- **Database**: Railway PostgreSQL
- **Backend**: Express.js server (`server.js`)
- **API**: RESTful endpoints for database operations
- **Connection**: Server-side only (no client-side database access)

### How Database Operations Work

All database operations go through the Express API:

```typescript
// ✅ CORRECT - Use the API
const response = await fetch('/api/branding');
const settings = await response.json();
```

### Environment Setup

Railway environment variables required:
- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Server port (default: 4173)
- `NODE_ENV` - Environment (production/development)

### API Endpoints

- `GET /health` - Health check
- `GET /api/branding` - Get branding settings
- `POST /api/branding` - Update branding settings

See `docs/database-setup.md` for complete API documentation.
