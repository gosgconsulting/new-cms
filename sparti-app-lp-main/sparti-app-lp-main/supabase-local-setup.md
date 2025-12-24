# Supabase Local Development Setup

## Prerequisites
1. ✅ Supabase CLI installed (v2.34.3)
2. ✅ Docker Desktop installed (v28.3.2)
3. ⏳ Docker Desktop needs to be running

## Setup Steps

### 1. Start Docker Desktop
Make sure Docker Desktop is running before proceeding.

### 2. Start Supabase Local Development
```bash
npx supabase start
```

### 3. Get Local Configuration
After starting, you'll get output like:
```
Started supabase local development setup.

         API URL: http://localhost:54321
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
        Inbucket: http://localhost:54324
          JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
           anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Update Environment Configuration
Create/update your environment variables to use local development:

For development, update `src/config/database.ts` or create environment-specific config.

### 5. Apply Migrations
```bash
npx supabase migration up
```

### 6. Access Local Studio
Open http://localhost:54323 to access the local Supabase Studio dashboard.

## Current Project Configuration
- Project ID: fkemumodynkaeojrrkbj
- Production URL: https://fkemumodynkaeojrrkbj.supabase.co
- Local development will use localhost URLs

## Next Steps
1. Wait for Docker to start
2. Run `npx supabase start`
3. Apply any pending migrations
4. Verify local setup works
