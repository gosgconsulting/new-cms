# Railway PostgreSQL Environment Setup

This file contains the environment variables needed to connect to a PostgreSQL database on Railway.

## Environment Variables for Railway

Copy and paste these variables into your Railway project's environment variables section:

```
# PostgreSQL Database Configuration for Railway
DATABASE_PUBLIC_URL=${Postgres.DATABASE_PUBLIC_URL}
POSTGRES_DB=${Postgres.POSTGRES_DB}
POSTGRES_USER=${Postgres.POSTGRES_USER}
POSTGRES_PASSWORD=${Postgres.POSTGRES_PASSWORD}

# Vite Environment Variables (for frontend)
VITE_DATABASE_PUBLIC_URL=${Postgres.DATABASE_PUBLIC_URL}
VITE_POSTGRES_DB=${Postgres.POSTGRES_DB}
VITE_POSTGRES_USER=${Postgres.POSTGRES_USER}
VITE_POSTGRES_PASSWORD=${Postgres.POSTGRES_PASSWORD}
```

## For Local Development

For local development, create a `.env` file in the root directory with the same variables but replace the placeholders with actual values provided by Railway.

## Connecting to the Database

To connect to the PostgreSQL database in your application, use the `DATABASE_URL` environment variable.
