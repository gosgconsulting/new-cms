# PostgreSQL Database Connection Audit & Implementation Plan

## 🔍 Current Status Analysis

### ✅ What's Working
1. **Express Server** (`server.js`)
   - Properly configured with API routes before static file serving
   - Database initialization on startup
   - PostgreSQL connection pool configured
   - API endpoints defined: `GET /api/branding` and `POST /api/branding`

2. **Database Layer** (`sparti-cms/db/index.js`)
   - PostgreSQL connection pool using `pg` library
   - Database initialization creates tables if they don't exist
   - Branding CRUD operations implemented
   - Form submissions table ready

3. **Frontend Components**
   - `SettingsManager.tsx` has branding tab with API integration
   - `useDatabase` hook exists for API calls
   - Loading states and error handling implemented

### ❌ Current Issues

1. **Development vs Production Mode**
   - **Problem**: In development, Vite dev server intercepts `/api/*` requests
   - **Result**: API returns HTML (index.html) instead of JSON
   - **Solution**: Need Vite proxy configuration

2. **Logo/Favicon Upload**
   - **Problem**: No file upload functionality implemented
   - **Result**: Cannot upload images to server
   - **Solution**: Need file upload endpoint and storage strategy

3. **Database Table Schema**
   - **Current**: Uses generic `site_settings` table with key-value pairs
   - **Limitation**: Not optimized for complex queries
   - **Recommendation**: Create dedicated tables for different settings types

## 🎯 Implementation Plan

### Phase 1: Fix Development API Routing (IMMEDIATE)

**Priority: HIGH** - This fixes the "failed to load branding settings" error

#### Step 1.1: Configure Vite Proxy
Add proxy configuration to `vite.config.ts` to forward `/api/*` requests to the Express server:

```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4173',
        changeOrigin: true,
      }
    }
  }
})
```

**Problem**: This requires running two servers (Vite on 8080, Express on 4173)

**Better Solution**: Use Vite middleware in development

#### Step 1.2: Alternative - Conditional API Base URL
Update frontend to use different API base URL in dev vs prod:

```typescript
const API_BASE = import.meta.env.DEV 
  ? 'http://localhost:4173' 
  : '';
  
const response = await fetch(`${API_BASE}/api/branding`);
```

### Phase 2: Implement File Upload (HIGH PRIORITY)

#### Step 2.1: Add File Storage Strategy

**Option A: Store Files Locally** (Recommended for Railway)
- Upload files to `public/uploads/` directory
- Store file paths in database
- Pros: Simple, no external dependencies
- Cons: Files lost on Railway container restart (need volume mount)

**Option B: Use Cloud Storage** (Recommended for Production)
- Use S3, Cloudinary, or similar
- Store URLs in database
- Pros: Persistent, scalable
- Cons: Requires external service

**Recommended**: Start with Option A, migrate to Option B later

#### Step 2.2: Create Upload Endpoint

Add to `server.js`:

```javascript
import multer from 'multer';
import path from 'path';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|svg|ico/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.json({ 
    success: true, 
    url: `/uploads/${req.file.filename}`,
    filename: req.file.filename
  });
});
```

#### Step 2.3: Update Frontend Upload Component

```typescript
const handleFileUpload = async (file: File, field: 'site_logo' | 'site_favicon') => {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (response.ok) {
      const data = await response.json();
      handleInputChange(field, data.url);
    }
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

### Phase 3: Optimize Database Schema (MEDIUM PRIORITY)

#### Current Schema (Key-Value):
```sql
CREATE TABLE site_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(255) UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type VARCHAR(50) DEFAULT 'text',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

**Pros**: Flexible, easy to add new settings
**Cons**: No type safety, difficult to query, no relationships

#### Recommended Schema (Dedicated Tables):

```sql
-- Branding Settings
CREATE TABLE branding (
  id SERIAL PRIMARY KEY,
  site_name VARCHAR(255) NOT NULL,
  site_tagline TEXT,
  logo_url TEXT,
  favicon_url TEXT,
  primary_color VARCHAR(7),
  secondary_color VARCHAR(7),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SEO Settings
CREATE TABLE seo_settings (
  id SERIAL PRIMARY KEY,
  meta_title VARCHAR(255),
  meta_description TEXT,
  keywords TEXT,
  google_analytics_id VARCHAR(50),
  google_site_verification VARCHAR(100),
  robots_txt TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Media Library
CREATE TABLE media_files (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_type VARCHAR(50),
  file_size INTEGER,
  alt_text TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Migration Strategy**:
1. Create new tables
2. Migrate existing data
3. Update API endpoints
4. Update frontend components
5. Remove old table

### Phase 4: API Endpoints Expansion (MEDIUM PRIORITY)

#### Additional Endpoints Needed:

```javascript
// Media Management
GET    /api/media              // List all media files
POST   /api/media/upload       // Upload media file
DELETE /api/media/:id          // Delete media file

// SEO Settings
GET    /api/seo                // Get SEO settings
POST   /api/seo                // Update SEO settings

// Form Submissions
GET    /api/submissions        // List form submissions
GET    /api/submissions/:id    // Get single submission
DELETE /api/submissions/:id    // Delete submission

// Site Settings
GET    /api/settings           // Get all settings
POST   /api/settings           // Update settings
```

## 📋 Implementation Checklist

### Immediate (Phase 1):
- [ ] Fix Vite proxy or update API base URL
- [ ] Test branding API in development
- [ ] Verify data persistence in Railway PostgreSQL

### High Priority (Phase 2):
- [ ] Add `multer` dependency for file uploads
- [ ] Create upload endpoint in `server.js`
- [ ] Add file input to branding settings form
- [ ] Implement image preview
- [ ] Test logo/favicon upload
- [ ] Configure Railway volume mount for persistent storage

### Medium Priority (Phase 3):
- [ ] Design new database schema
- [ ] Create migration script
- [ ] Update PostgreSQL connection file
- [ ] Update API endpoints
- [ ] Update frontend components
- [ ] Test data migration

### Future Enhancements:
- [ ] Add image optimization (resize, compress)
- [ ] Implement CDN integration
- [ ] Add batch file upload
- [ ] Create media library interface
- [ ] Add file management (rename, move, delete)

## 🔧 Quick Fix for Current Issue

To immediately fix the "failed to load branding settings" error in development:

### Option 1: Run Both Servers
```bash
# Terminal 1: Express server
node server.js

# Terminal 2: Vite dev server
npm run dev
```

Update `SettingsManager.tsx`:
```typescript
const API_BASE = import.meta.env.DEV ? 'http://localhost:4173' : '';
const response = await fetch(`${API_BASE}/api/branding`);
```

### Option 2: Use Production Build for Testing
```bash
npm run build
node server.js
```
Access at `http://localhost:4173`

## 📊 Database Connection Flow

```
┌─────────────────┐
│   Frontend      │
│  (React App)    │
└────────┬────────┘
         │ HTTP Requests
         │ /api/branding
         ▼
┌─────────────────┐
│  Express Server │
│   (server.js)   │
└────────┬────────┘
         │ SQL Queries
         ▼
┌─────────────────┐
│  PostgreSQL     │
│    (Railway)    │
└─────────────────┘
```

## 🎓 Best Practices Recommendations

1. **Environment Variables**
   - Store sensitive config in `.env`
   - Use different values for dev/prod
   - Never commit `.env` to git

2. **Error Handling**
   - Always return JSON from API
   - Provide meaningful error messages
   - Log errors server-side

3. **Validation**
   - Validate file types and sizes
   - Sanitize user inputs
   - Use prepared statements (already doing this with `pg`)

4. **Security**
   - Implement rate limiting
   - Add CORS configuration
   - Sanitize file names
   - Scan uploaded files for malware

5. **Performance**
   - Use connection pooling (already implemented)
   - Implement caching for static data
   - Optimize images before upload
   - Use CDN for media files

## 📝 Next Steps

1. **Immediate**: Fix API routing issue
2. **This Week**: Implement file upload
3. **This Month**: Migrate to dedicated tables
4. **Long-term**: Add cloud storage integration

---

**Last Updated**: 2025-10-14  
**Status**: Ready for implementation  
**Priority**: Phases 1-2 are critical for production readiness
