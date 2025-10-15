# Production Deployment Guide

## Overview

This guide covers how to deploy the GO SG website to production using Vite for the frontend build and Node.js/Express for the backend server.

## Development vs Production

### Development Mode
```bash
# Run both frontend (Vite dev server) and backend simultaneously
npm run dev
```
- Frontend: Vite dev server (http://localhost:8080)
- Backend: Node.js server (http://localhost:4173)
- Hot reloading enabled
- Source maps available

### Production Mode
```bash
# Build frontend and start production server
npm run build
npm start
```
- Frontend: Built static files served by Node.js server
- Backend: Node.js server (http://localhost:4173)
- Optimized and minified assets
- No hot reloading

## Production Build Process

### 1. Build the Frontend

```bash
# Build the React app for production
npm run build
```

This command:
- Optimizes and minifies all assets
- Creates a `dist/` folder with production-ready files
- Generates source maps for debugging
- Optimizes images and assets

### 2. Start the Production Server

```bash
# Start the production server (serves both API and static files)
npm start
```

**Important**: `npm start` runs in production mode and serves the built static files from `dist/` folder.

The server will:
- Serve the built React app from `dist/` (not Vite dev server)
- Provide API endpoints at `/api/*`
- Handle database connections
- Serve static assets with proper caching headers

## Production Environment Setup

### Required Environment Variables

Create a `.env` file with these production variables:

```bash
# Database Configuration (REQUIRED)
DATABASE_URL=postgresql://username:password@hostname:port/database

# Server Configuration
PORT=4173
NODE_ENV=production

# Email Configuration (REQUIRED for contact forms)
RESEND_API_KEY=your_resend_api_key_here
SMTP_FROM_EMAIL=noreply@gosg.com

# Frontend API Configuration
VITE_API_BASE_URL=https://your-domain.com
```

### Database Setup

1. **Create PostgreSQL Database**:
   ```sql
   CREATE DATABASE gosg_website;
   CREATE USER gosg_user WITH PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE gosg_website TO gosg_user;
   ```

2. **Initialize Tables**: The server automatically creates all required tables on startup.

## Deployment Options

### Option 1: Traditional VPS/Dedicated Server

1. **Setup Server**:
   ```bash
   # Install Node.js (v18+)
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PostgreSQL
   sudo apt-get install postgresql postgresql-contrib
   
   # Install PM2 for process management
   sudo npm install -g pm2
   ```

2. **Deploy Application**:
   ```bash
   # Clone repository
   git clone <your-repo-url>
   cd gosgwebsite
   
   # Install dependencies
   npm install
   
   # Build for production
   npm run build
   
   # Start with PM2
   pm2 start server.js --name "gosg-website"
   pm2 save
   pm2 startup
   ```

3. **Setup Nginx Reverse Proxy**:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:4173;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### Option 2: Railway Deployment

1. **Connect Repository**:
   - Connect your GitHub repository to Railway
   - Set environment variables in Railway dashboard

2. **Deploy**:
   - Railway automatically detects the `package.json`
   - Runs `npm install` and `npm run build`
   - Starts the server with `npm start`

3. **Environment Variables** (Railway Dashboard):
   ```
   DATABASE_URL=postgresql://...
   RESEND_API_KEY=your_key
   SMTP_FROM_EMAIL=noreply@gosg.com
   NODE_ENV=production
   ```

### Option 3: Vercel Deployment

1. **Setup Vercel**:
   ```bash
   npm install -g vercel
   vercel login
   vercel
   ```

2. **Configure Build Settings**:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Environment Variables** (Vercel Dashboard):
   ```
   DATABASE_URL=postgresql://...
   RESEND_API_KEY=your_key
   SMTP_FROM_EMAIL=noreply@gosg.com
   ```

## Performance Optimization

### 1. Enable Gzip Compression

The server already includes compression middleware for static files.

### 2. Set Cache Headers

Static assets are served with appropriate cache headers:
- HTML: No cache (always fresh)
- CSS/JS: Long-term cache with versioning
- Images: Medium-term cache

### 3. Database Optimization

- Ensure PostgreSQL is configured with appropriate memory settings
- Create indexes on frequently queried columns
- Regular database maintenance and cleanup

## Monitoring and Maintenance

### 1. Health Checks

Monitor the health endpoint:
```bash
curl https://your-domain.com/health
```

### 2. Log Monitoring

```bash
# PM2 logs
pm2 logs gosg-website

# System logs
journalctl -u nginx -f
```

### 3. Database Backups

```bash
# Daily backup script
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

## Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **Database Security**: Use strong passwords and limit access
3. **HTTPS**: Always use SSL certificates in production
4. **CORS**: Configure appropriate CORS policies
5. **Rate Limiting**: Consider implementing rate limiting for API endpoints

## Troubleshooting

### Common Issues

1. **Build Fails**:
   ```bash
   # Clear cache and rebuild
   rm -rf node_modules dist
   npm install
   npm run build
   ```

2. **Database Connection Issues**:
   - Verify `DATABASE_URL` format
   - Check database server accessibility
   - Ensure user permissions

3. **Static Files Not Loading**:
   - Verify `dist/` folder exists
   - Check file permissions
   - Ensure server is serving from correct directory

### Performance Issues

1. **Large Bundle Size**: Consider code splitting
2. **Slow Database Queries**: Add indexes and optimize queries
3. **High Memory Usage**: Monitor and restart services if needed

## Quick Production Commands

```bash
# Complete production setup
npm install
npm run build
npm start

# With PM2
pm2 start server.js --name "gosg-website"
pm2 restart gosg-website

# Health check
curl http://localhost:4173/health
```

## File Structure After Build

```
gosgwebsite/
├── dist/                    # Production build output
│   ├── index.html          # Main HTML file
│   ├── assets/             # Optimized CSS, JS, images
│   └── uploads/            # User uploaded files
├── server.js               # Production server
├── sparti-cms/             # Database and CMS logic
├── .env                    # Production environment variables
└── package.json            # Dependencies and scripts
```

The production setup is now complete and ready for deployment! 🚀
