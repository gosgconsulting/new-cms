# Deployment Guide for ROI Flow Marketing

This document provides instructions for deploying the ROI Flow Marketing application to Railway.

## Prerequisites

- A Railway account
- A Supabase project with Edge Functions enabled
- Node.js 18+ installed locally for development

## Configuration Files

This project includes several configuration files for deployment:

1. **railway.json** - Configures Railway deployment settings
2. **nixpacks.toml** - Specifies build environment and dependencies
3. **vite.config.ts** - Configures Vite development and preview servers
4. **package.json** - Contains scripts for building and running the application

## Environment Variables

The following environment variables need to be set in Railway:

- `PORT` - Automatically set by Railway, used by the application server
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase project anonymous key
- `HOST` - Set to `0.0.0.0` to allow external connections (optional, defaults to this in our config)

## Deployment Steps

### 1. Initial Setup

1. Fork or clone this repository
2. Create a new project in Railway
3. Connect your GitHub repository to Railway
4. Set up the required environment variables in Railway

### 2. Deploy to Railway

Railway will automatically deploy your application when you push changes to your repository. The deployment process:

1. Uses the `nixpacks.toml` configuration to set up the Node.js environment
2. Runs `npm ci` to install dependencies
3. Executes `npm run build` to build the application
4. Starts the application with `npm run start`

### 3. Custom Domain Setup (Optional)

1. In the Railway dashboard, go to your project settings
2. Navigate to the "Domains" section
3. Add your custom domain (e.g., www.gosgconsulting.com)
4. Follow Railway's instructions to configure DNS settings

## Troubleshooting

### 502 Bad Gateway Errors

If you encounter 502 errors after deployment:

1. Check Railway logs to see if the application is starting correctly
2. Verify that the `PORT` environment variable is being used correctly
3. Ensure the application is listening on `0.0.0.0` (all interfaces) and not just localhost

### Build Failures

If the build fails:

1. Check that `nixpacks.toml` is correctly configured
2. Verify that all dependencies are properly listed in `package.json`
3. Look for any TypeScript errors that might be causing the build to fail

## Supabase Edge Functions

For the WordPress migration function to work properly:

1. Follow the instructions in `SUPABASE_SETUP.md` to set up required secrets
2. Deploy the Edge Function to your Supabase project:
   ```bash
   cd supabase/functions/wordpress-migration
   supabase functions deploy wordpress-migration --project-ref your-project-ref
   ```

## Local Development

To run the application locally:

```bash
npm install
npm run dev
```

The application will be available at http://localhost:8080 (or the port specified in your environment).
