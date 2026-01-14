# PERN-Store Environment Variables Compatibility Guide

This document provides a mapping between PERN-Store environment variables and the current project's variable naming conventions. This ensures compatibility when migrating from PERN-Store or using PERN-Store-based code.

## Variable Mappings

### Database Variables

| PERN-Store Variable | Current Project Variable | Status | Notes |
|---------------------|-------------------------|--------|-------|
| `POSTGRES_USER` | `POSTGRES_USER` | ✅ Direct match | Both supported |
| `POSTGRES_HOST` | `PGHOST` | ✅ Compatible | `POSTGRES_HOST` added as alias |
| `POSTGRES_PASSWORD` | `POSTGRES_PASSWORD` | ✅ Direct match | Both supported |
| `POSTGRES_DATABASE` | `POSTGRES_DB` | ✅ Compatible | `POSTGRES_DATABASE` added as alias |
| `POSTGRES_DATABASE_TEST` | `POSTGRES_DATABASE_TEST` | ✅ Added | New variable for test database |
| `POSTGRES_PORT` | `PGPORT` | ✅ Compatible | `POSTGRES_PORT` added as alias |

### Server Configuration

| PERN-Store Variable | Current Project Variable | Status | Notes |
|---------------------|-------------------------|--------|-------|
| `PORT` | `PORT` | ✅ Direct match | Both supported |
| `SECRET` | `JWT_SECRET` | ✅ Mapped | `SECRET` maps to `JWT_SECRET` in code |
| `REFRESH_SECRET` | `REFRESH_SECRET` | ✅ Added | New variable for refresh tokens |

### Email Configuration

| PERN-Store Variable | Current Project Variable | Status | Notes |
|---------------------|-------------------------|--------|-------|
| `SMTP_FROM` | `SMTP_FROM_EMAIL` | ✅ Mapped | `SMTP_FROM` maps to `SMTP_FROM_EMAIL` in code |

### Frontend Variables

| PERN-Store Variable | Current Project Variable | Status | Notes |
|---------------------|-------------------------|--------|-------|
| `VITE_API_URL` | `VITE_API_BASE_URL` | ✅ Compatible | `VITE_API_URL` added as alias |
| `VITE_GOOGLE_CLIENT_ID` | `VITE_GOOGLE_CLIENT_ID` | ✅ Added | New variable for Google OAuth |
| `VITE_GOOGLE_CLIENT_SECRET` | `VITE_GOOGLE_CLIENT_SECRET` | ✅ Added | New variable for Google OAuth |
| `VITE_STRIPE_PUB_KEY` | `VITE_STRIPE_PUB_KEY` | ✅ Added | New variable for Stripe public key |

### Payment Integration

| PERN-Store Variable | Current Project Variable | Status | Notes |
|---------------------|-------------------------|--------|-------|
| `STRIPE_SECRET_KEY` | `STRIPE_SECRET_KEY` | ✅ Added | Used in code, now in env files |

## Code-Level Mappings

The following mappings are handled in `server/config/constants.js`:

```javascript
// SECRET maps to JWT_SECRET
export const SECRET = process.env.SECRET || process.env.JWT_SECRET || 'default';

// SMTP_FROM maps to SMTP_FROM_EMAIL
export const SMTP_FROM = process.env.SMTP_FROM || process.env.SMTP_FROM_EMAIL || 'default';
```

## Usage Examples

### Using PERN-Store Variable Names

```javascript
// These will work due to mappings in constants.js
import { SECRET, SMTP_FROM } from '../config/constants.js';

const token = jwt.sign(payload, SECRET);
const fromEmail = SMTP_FROM;
```

### Using Current Project Variable Names

```javascript
// These are the primary variable names
import { JWT_SECRET, SMTP_FROM_EMAIL } from '../config/constants.js';

const token = jwt.sign(payload, JWT_SECRET);
const fromEmail = SMTP_FROM_EMAIL;
```

## Environment File Setup

### Local Development (.env)

All PERN-Store variables are included in the `.env` file template. Run:

```bash
node setup-env.js
```

This will create a `.env` file with all required variables, including PERN-Store compatibility variables.

### Railway Deployment

All PERN-Store variables are included in:
- `railway-env-config.txt`
- `RAILWAY_ENV_VARIABLES.txt`

Copy the variables from these files into your Railway service environment settings.

## Migration Guide

### From PERN-Store to This Project

1. **Database Variables**: No changes needed - all PERN-Store database variables are supported
2. **Authentication**: 
   - `SECRET` → Maps to `JWT_SECRET` automatically
   - Add `REFRESH_SECRET` if using refresh tokens
3. **Email**: 
   - `SMTP_FROM` → Maps to `SMTP_FROM_EMAIL` automatically
4. **Frontend**: 
   - `VITE_API_URL` → Use `VITE_API_BASE_URL` or keep `VITE_API_URL` (both work)
   - Add `VITE_GOOGLE_CLIENT_ID` and `VITE_GOOGLE_CLIENT_SECRET` for OAuth
   - Add `VITE_STRIPE_PUB_KEY` for Stripe integration
5. **Stripe**: Add `STRIPE_SECRET_KEY` to environment variables

### To PERN-Store from This Project

1. Use `SECRET` instead of `JWT_SECRET` (or set both to same value)
2. Use `SMTP_FROM` instead of `SMTP_FROM_EMAIL` (or set both to same value)
3. Use `VITE_API_URL` instead of `VITE_API_BASE_URL` (or set both to same value)
4. Use `POSTGRES_HOST`, `POSTGRES_DATABASE`, `POSTGRES_PORT` instead of `PGHOST`, `POSTGRES_DB`, `PGPORT`

## Railway Compatibility

All PERN-Store variables are compatible with Railway deployment:

- Database variables use Railway's `${{}}` placeholder syntax
- All variables can be set in Railway dashboard
- Variables are automatically populated from PostgreSQL service where applicable

## Notes

- Variables marked as "Mapped" are handled automatically in code
- Variables marked as "Compatible" can use either naming convention
- Variables marked as "Added" are new variables that should be set
- All PERN-Store variables are optional - the project will work without them if not using PERN-Store features
