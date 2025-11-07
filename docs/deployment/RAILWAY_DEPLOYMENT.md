# Railway Deployment Guide

This guide covers deploying your GO SG website to Railway with proper database setup.

## 🚀 Quick Deploy (Recommended)

### 1. **Deploy to Railway**
```bash
# Connect your GitHub repo to Railway
# Railway will automatically detect your project and use railway.toml
```

### 2. **Set Environment Variables in Railway Dashboard**
Go to your Railway project → Variables tab and add:
```env
DATABASE_URL=your_postgres_connection_string
NODE_ENV=production
```

### 3. **Run Database Migration**
After deployment, run the migration script to fix database schema:
```bash
# In Railway dashboard → Deployments → Run Command:
npm run migrate:railway
```

### 4. **Verify Deployment**
- **Frontend**: `https://your-app.railway.app/`
- **API**: `https://your-app.railway.app/api/health`
- **Health Check**: `https://your-app.railway.app/health`

---

## 🔧 Manual Deployment Steps

### Step 1: Prepare Your Project
```bash
# Ensure all files are committed
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

### Step 2: Create Railway Project
1. Go to [Railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository

### Step 3: Configure Railway
Railway will automatically use your `railway.toml`:
```toml
[build]
builder = "NIXPACKS"
buildCommand = "npm run build"

[deploy]
startCommand = "npm start"
healthcheckPath = "/health"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

### Step 4: Add PostgreSQL Database
1. In Railway dashboard → Add Service → Database → PostgreSQL
2. Railway will automatically provide `DATABASE_URL` environment variable

### Step 5: Set Environment Variables
In Railway dashboard → Variables tab:
```env
DATABASE_URL=postgresql://username:password@host:port/database
NODE_ENV=production
```

### Step 6: Deploy and Migrate
1. Railway will automatically build and deploy
2. Once deployed, run migration:
   ```bash
   # In Railway dashboard → Deployments → Run Command:
   npm run migrate:railway
   ```

---

## 🗄️ Database Migration

### Why Migration is Needed
Railway's PostgreSQL might not have the correct table structure. The migration script will:
- ✅ Check existing table structure
- ✅ Drop and recreate tables with correct schema
- ✅ Preserve data (if any)
- ✅ Add missing columns
- ✅ Create all required tables

### Migration Script Features
```javascript
// migrate-railway-db.js
- Checks form_submissions table structure
- Checks contacts table structure  
- Recreates tables with correct schema
- Creates all required tables (site_settings, projects, etc.)
- Inserts default site settings
- Shows final database structure
```

### Running Migration
```bash
# Local development
npm run migrate

# Railway production
npm run migrate:railway
```

---

## 🏗️ Railway Configuration Files

### railway.toml
```toml
[build]
builder = "NIXPACKS"
buildCommand = "npm run build"

[deploy]
startCommand = "npm start"
healthcheckPath = "/health"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

### Procfile (Alternative)
```
web: npm start
```

---

## 🔍 Troubleshooting

### Common Issues

#### 1. **"column does not exist" Error**
```bash
# Solution: Run migration
npm run migrate:railway
```

#### 2. **Database Connection Failed**
```bash
# Check DATABASE_URL environment variable
# Ensure PostgreSQL service is running
```

#### 3. **Frontend Not Loading**
```bash
# Check if build completed successfully
# Verify static files are served from /dist
```

#### 4. **API Endpoints Not Working**
```bash
# Check server logs in Railway dashboard
# Verify CORS configuration
# Test health endpoint: /health
```

### Debug Commands
```bash
# Check Railway logs
railway logs

# Run health check
curl https://your-app.railway.app/health

# Test API endpoint
curl https://your-app.railway.app/api/health
```

---

## 📊 Deployment Architecture

### Single App Setup (Recommended)
```
Railway App (Port: Auto-assigned)
├── Frontend (React) → Served from /dist
├── Backend (Express) → API endpoints at /api/*
└── Database (PostgreSQL) → Connected via DATABASE_URL
```

### URL Structure
- **Frontend**: `https://your-app.railway.app/`
- **API**: `https://your-app.railway.app/api/*`
- **Health**: `https://your-app.railway.app/health`

---

## 🚀 Production Checklist

### Before Deployment
- [ ] All code committed to git
- [ ] `railway.toml` configured
- [ ] Environment variables documented
- [ ] Database migration script ready

### After Deployment
- [ ] Railway project created
- [ ] PostgreSQL database added
- [ ] Environment variables set
- [ ] Build completed successfully
- [ ] Database migration run
- [ ] Health check passing
- [ ] Frontend loading correctly
- [ ] API endpoints working
- [ ] Contact form functional

---

## 🔄 Continuous Deployment

Railway automatically deploys when you push to your main branch:
```bash
git add .
git commit -m "Update feature"
git push origin main
# Railway will automatically deploy
```

### Manual Deployment
```bash
railway up
```

---

## 📝 Environment Variables Reference

### Required for Production
```env
DATABASE_URL=postgresql://username:password@host:port/database
NODE_ENV=production
```

### Optional (for email functionality)
```env
RESEND_API_KEY=your_resend_api_key
SMTP_FROM_EMAIL=your_email@domain.com
```

---

## 🎯 Success Indicators

Your deployment is successful when:
- ✅ Railway build completes without errors
- ✅ Health endpoint returns 200: `/health`
- ✅ Frontend loads at root URL: `/`
- ✅ API endpoints respond: `/api/health`
- ✅ Database migration runs successfully
- ✅ Contact form submits without errors
- ✅ Admin panel loads contacts correctly

---

## 🆘 Support

If you encounter issues:
1. Check Railway logs in dashboard
2. Run database migration: `npm run migrate:railway`
3. Verify environment variables
4. Test health endpoint
5. Check this troubleshooting guide

---

**🎉 Happy Deploying!**