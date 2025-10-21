# Environment Variables Setup

## Quick Start - Contact Form Only

For the ContactModal to work, you only need these **2 essential variables**:

```bash
# Database connection (REQUIRED)
DATABASE_URL=postgresql://username:password@hostname:port/database

# Email functionality (REQUIRED for notifications)
RESEND_API_KEY=your_resend_api_key_here
SMTP_FROM_EMAIL=noreply@gosg.com
```

## Complete Environment Variables

For full functionality, use all these variables:

Create a `.env` file in the project root with the following variables:

```bash
# Frontend API Configuration (optional - defaults to relative path)
VITE_API_BASE_URL=

# Backend Database Configuration (REQUIRED)
DATABASE_PUBLIC_URL=postgresql://username:password@hostname:port/database
# OR use individual connection variables:
DATABASE_URL=postgresql://username:password@hostname:port/database

# Backend Server Configuration
PORT=4173
NODE_ENV=development

# SMTP Configuration (REQUIRED for email functionality)
RESEND_API_KEY=your_resend_api_key_here
SMTP_FROM_EMAIL=noreply@gosg.com
```

**Note**: In development, the Vite server is configured with a proxy that automatically forwards `/api` requests to `http://localhost:4173`, so you can leave `VITE_API_BASE_URL` empty for local development.

## Usage Examples

### Local Development (with Vite proxy)
```bash
VITE_API_BASE_URL=
DATABASE_URL=postgresql://postgres:password@localhost:5432/gosgwebsite
RESEND_API_KEY=re_your_actual_key_here
SMTP_FROM_EMAIL=noreply@gosg.com
```

### Production (without proxy)
```bash
VITE_API_BASE_URL=https://your-production-domain.com
DATABASE_URL=postgresql://user:pass@prod-host:5432/prod_db
RESEND_API_KEY=re_your_actual_key_here
SMTP_FROM_EMAIL=noreply@gosg.com
```

## Important Notes

1. **Frontend variables** must be prefixed with `VITE_` to be accessible in the browser
2. **Backend variables** don't need the `VITE_` prefix
3. The `VITE_API_BASE_URL` is used by the ContactModal component to determine where to send form submissions
4. If `VITE_API_BASE_URL` is not set, it defaults to an empty string (relative path)
5. **Vite Proxy**: In development, Vite automatically proxies `/api/*` requests to `http://localhost:4173`
6. **Database Connection**: Either `DATABASE_URL` or `DATABASE_PUBLIC_URL` is required for the backend to work
7. **SMTP**: Required for email functionality (contact form notifications, etc.)

## Variables NOT Needed

The following environment variables are defined in the codebase but are **NOT currently used** in the main application:

- `VITE_OPENROUTER_API_KEY` - Only used in IntegrationTest component (not in main app)
- `VITE_GOOGLE_API_KEY` - Only used in IntegrationTest component (not in main app)  
- `VITE_RESEND_API_KEY` - Only used in IntegrationTest component (not in main app)
- `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_HOST`, `POSTGRES_PORT` - Individual PostgreSQL variables (use DATABASE_URL instead)

**Note**: The IntegrationTest component exists but is not included in the main application routes, so these variables are not needed unless you specifically want to test those integrations.
