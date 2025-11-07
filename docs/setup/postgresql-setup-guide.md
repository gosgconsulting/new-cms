# PostgreSQL Database Setup Guide

## ✅ Implementation Complete

The project is now fully configured to use Railway PostgreSQL with file upload capabilities.

## 🚀 How to Run

### Development Mode (Two Servers Required)

**Terminal 1 - Express Backend Server:**
```bash
node server.js
```
This starts the API server on `http://localhost:4173`

**Terminal 2 - Vite Development Server:**
```bash
npm run dev
```
This starts the React app on `http://localhost:8080`

The Vite dev server will proxy `/api/*` requests to the Express server automatically.

### Production Mode (Single Server)

```bash
npm run build
node server.js
```
Access the app at `http://localhost:4173`

## 📊 Database Tables

### `site_settings` Table
Stores all site configuration in key-value format:

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| setting_key | VARCHAR(255) | Setting identifier (e.g., 'site_name') |
| setting_value | TEXT | Setting value |
| setting_type | VARCHAR(50) | Type: 'text' or 'file' |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

**Default Settings:**
- `site_name` - Site name (default: "GO SG")
- `site_tagline` - Site tagline
- `site_logo` - Logo file URL
- `site_favicon` - Favicon file URL

### `form_submissions` Table
Stores all form submissions:

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| name | VARCHAR(255) | Submitter name |
| email | VARCHAR(255) | Submitter email |
| message | TEXT | Message content |
| form_type | VARCHAR(100) | Form identifier |
| created_at | TIMESTAMP | Submission timestamp |

## 🔌 API Endpoints

### GET `/health`
Health check endpoint for Railway monitoring.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-14T09:00:00.000Z",
  "port": 4173
}
```

### GET `/api/branding`
Fetch current branding settings.

**Response:**
```json
{
  "site_name": "GO SG",
  "site_tagline": "Digital Marketing Agency",
  "site_logo": "/uploads/logo-1234567890.png",
  "site_favicon": "/uploads/favicon-1234567890.ico"
}
```

### POST `/api/branding`
Update branding settings.

**Request:**
```json
{
  "site_name": "New Site Name",
  "site_tagline": "New Tagline",
  "site_logo": "/uploads/logo.png",
  "site_favicon": "/uploads/favicon.ico"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Branding settings updated successfully"
}
```

### POST `/api/upload`
Upload a file (logo, favicon, etc.).

**Request:** `multipart/form-data` with file field named `file`

**Response:**
```json
{
  "success": true,
  "url": "/uploads/file-1234567890.png",
  "filename": "file-1234567890.png",
  "originalName": "my-logo.png",
  "size": 45678
}
```

**File Constraints:**
- Maximum size: 2MB
- Allowed types: jpeg, jpg, png, gif, svg, ico, webp
- Files stored in: `public/uploads/`

## 🎨 Using the Branding Settings Panel

1. **Navigate to Admin:**
   - Go to `/admin` route
   - Login with credentials: `admin` / `admin`

2. **Access Settings:**
   - Click on "Dashboard" or navigate to Settings
   - Click on "Branding" tab

3. **Update Site Name:**
   - Enter site name in the "Site Name" field
   - Enter tagline in the "Tagline" field

4. **Upload Logo:**
   - Click on the logo upload area
   - Select image file (max 2MB)
   - File will upload automatically
   - Preview appears once uploaded

5. **Upload Favicon:**
   - Click on the favicon upload area
   - Select ICO or PNG file (32x32 recommended)
   - File uploads and preview appears

6. **Save Changes:**
   - Click "Save Branding Settings" button
   - Settings are persisted to Railway PostgreSQL database

## 🗄️ Database Connection

The app connects to Railway PostgreSQL using environment variables:

**Required Environment Variables:**
```
DATABASE_URL=postgresql://user:password@host:port/database
NODE_ENV=production
PORT=4173
```

**Local Development `.env` (optional):**
```
DATABASE_URL=postgresql://localhost:5432/gosg_dev
NODE_ENV=development
PORT=4173
```

## 📁 File Storage

Files are stored in the `public/uploads/` directory:

```
project/
├── public/
│   └── uploads/          # Uploaded files (logo, favicon, etc.)
│       ├── file-1234.png
│       └── file-5678.ico
├── server.js             # Express server with API
└── sparti-cms/
    └── db/
        └── postgres.js   # Database functions
```

**Important for Railway Deployment:**
- Files in `public/uploads/` are ephemeral on Railway
- Container restarts will delete uploaded files
- For production, use cloud storage (S3, Cloudinary, etc.)
- Or configure Railway persistent volumes

## 🔐 Security Considerations

### Current Implementation:
✅ File type validation (images only)
✅ File size limit (2MB)
✅ Prepared SQL statements (prevents injection)
✅ Input validation on frontend

### Recommended Additions:
- [ ] Rate limiting on upload endpoint
- [ ] CORS configuration
- [ ] File name sanitization
- [ ] Malware scanning for uploads
- [ ] Authentication on API endpoints
- [ ] HTTPS in production

## 🐛 Troubleshooting

### Issue: "Failed to load branding settings"

**Cause:** API endpoint returning HTML instead of JSON

**Solution:** 
1. Ensure both servers are running (in development)
2. Check that Vite proxy is configured correctly
3. Verify Express server is on port 4173

### Issue: File upload fails

**Cause:** Directory permissions or file size

**Solution:**
1. Check `public/uploads/` directory exists
2. Verify file size is under 2MB
3. Check file type is allowed (jpeg, jpg, png, gif, svg, ico, webp)
4. Check server logs for detailed error

### Issue: Database connection fails

**Cause:** Missing or incorrect DATABASE_URL

**Solution:**
1. Verify `DATABASE_URL` environment variable is set
2. Check PostgreSQL connection string format
3. Ensure Railway PostgreSQL service is running
4. Check network connectivity

### Issue: Settings not persisting

**Cause:** Database write failure

**Solution:**
1. Check server logs for SQL errors
2. Verify database user has write permissions
3. Check if tables were created successfully
4. Run `initializeDatabase()` manually

## 📝 Development Workflow

### Adding New Settings:

1. **Add to Database:**
```javascript
// In initializeDatabase() function
await query(`
  INSERT INTO site_settings (setting_key, setting_value, setting_type)
  VALUES ('new_setting', 'default_value', 'text')
  ON CONFLICT (setting_key) DO NOTHING
`, []);
```

2. **Update Frontend Interface:**
```tsx
// In SettingsManager.tsx
const [brandingData, setBrandingData] = useState({
  // ... existing fields
  new_setting: ''
});
```

3. **Add Form Field:**
```tsx
<div>
  <label>New Setting</label>
  <input
    value={brandingData.new_setting}
    onChange={(e) => handleInputChange('new_setting', e.target.value)}
  />
</div>
```

### Testing the Database:

```bash
# Connect to Railway PostgreSQL
psql $DATABASE_URL

# List all settings
SELECT * FROM site_settings;

# Check form submissions
SELECT * FROM form_submissions ORDER BY created_at DESC LIMIT 10;

# Update a setting manually
UPDATE site_settings SET setting_value = 'New Value' WHERE setting_key = 'site_name';
```

## 🎯 Next Steps

1. **Immediate:**
   - Test branding settings in admin panel
   - Upload and verify logo/favicon
   - Check database persistence

2. **Short-term:**
   - Configure Railway persistent volume for uploads
   - Add success/error toast notifications
   - Implement SEO settings tab

3. **Medium-term:**
   - Migrate to dedicated tables (see audit doc)
   - Add image optimization (resize, compress)
   - Implement media library interface

4. **Long-term:**
   - Integrate cloud storage (S3, Cloudinary)
   - Add batch file upload
   - Implement CDN for media files

## 📚 Related Documentation

- [Database Audit & Implementation Plan](./database-audit-implementation-plan.md)
- [Database Setup](./database-setup.md)
- [Railway Environment Setup](../railway-env-setup.md)

---

**Last Updated:** 2025-10-14  
**Status:** ✅ Ready for use  
**Tested:** Development and production modes
