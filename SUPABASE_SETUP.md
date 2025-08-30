# Supabase Secrets Setup

This document provides instructions for setting up the required secrets for the Supabase Edge Functions used in this project.

## WordPress Migration Function Secrets

The WordPress migration edge function requires the following secrets to be set in your Supabase project:

1. `WORDPRESS_USERNAME`: Your WordPress admin username
2. `WORDPRESS_PASSWORD`: Your WordPress admin password

### Setting Up Secrets in Supabase

1. Install the Supabase CLI if you haven't already:
   ```bash
   npm install -g supabase
   ```

2. Login to your Supabase account:
   ```bash
   supabase login
   ```

3. Set the secrets for your project:
   ```bash
   supabase secrets set WORDPRESS_USERNAME=your_wordpress_username --project-ref your-project-ref
   supabase secrets set WORDPRESS_PASSWORD=your_wordpress_password --project-ref your-project-ref
   ```

   Replace `your_wordpress_username`, `your_wordpress_password`, and `your-project-ref` with your actual values.

4. Verify the secrets are set:
   ```bash
   supabase secrets list --project-ref your-project-ref
   ```

### Setting Secrets via Supabase Dashboard

Alternatively, you can set secrets through the Supabase dashboard:

1. Go to your Supabase project dashboard
2. Navigate to Settings > API > Edge Functions
3. Under "Secrets", add the following keys and their corresponding values:
   - `WORDPRESS_USERNAME`
   - `WORDPRESS_PASSWORD`

## Deployment Notes

When deploying to Railway, ensure that your Supabase URL and anon key are set as environment variables:

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase project anonymous key

These can be set in the Railway dashboard under the "Variables" section of your project.
