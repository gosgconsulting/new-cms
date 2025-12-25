# Sparti CMS URL Setup Guide

This guide explains how to access and deploy Sparti CMS using the `/sparti` URL path.

## Configuration Overview

The Sparti CMS has been configured to work with the `/sparti` URL path through the following changes:

1. Vite configuration has been updated to use `/sparti/` as the base URL
2. Static asset paths in `index.html` have been updated to use relative paths
3. A deployment script has been created to facilitate deployment to the `/sparti` path

## Accessing Sparti CMS

After deployment, you can access Sparti CMS at:

```
http://your-domain/sparti/
```

## Deployment Instructions

### Option 1: Using the Deployment Script

1. Run the deployment script:
   ```
   node deploy-sparti.js
   ```

2. This will:
   - Build the project
   - Create a `deploy/sparti` directory
   - Copy the build files to this directory

3. Configure your web server to serve the content from the `deploy/sparti` directory at the `/sparti` URL path

### Option 2: Manual Deployment

1. Build the project:
   ```
   npm run build
   ```

2. Copy the contents of the `dist` directory to your web server's `/sparti` directory

## Web Server Configuration Examples

### Apache

Add to your `.htaccess` file:

```apache
# Serve Sparti CMS from /sparti path
Alias "/sparti" "/path/to/deploy/sparti"
<Directory "/path/to/deploy/sparti">
    Options Indexes FollowSymLinks
    AllowOverride All
    Require all granted
</Directory>
```

### Nginx

Add to your server configuration:

```nginx
location /sparti/ {
    alias /path/to/deploy/sparti/;
    try_files $uri $uri/ /sparti/index.html;
}
```

## Development Testing

To test the `/sparti` URL path during development:

1. Run the development server:
   ```
   npm run dev
   ```

2. Access the application at:
   ```
   http://localhost:5173/sparti/
   ```

## Troubleshooting

If you encounter issues with assets not loading:

1. Check that all asset paths in your code use relative paths or the `import` syntax
2. Verify that the `base` property in `vite.config.ts` is set to `/sparti/`
3. Ensure your web server is properly configured to serve the content from the correct path
