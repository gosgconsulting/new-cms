# CMS Theme System Documentation

## 🚨 **IMPORTANT: Theme Creation Guidelines**

### ✅ **DO: Use Templates for New Themes**
```bash
# CORRECT: Copy from template (mandatory setup only)
cp -r sparti-cms/template/landingpage sparti-cms/theme/your-new-theme
```

### ❌ **DON'T: Copy Existing Themes**
```bash
# WRONG: Don't copy existing themes (contains specific business content)
# cp -r sparti-cms/theme/landingpage sparti-cms/theme/your-new-theme
```

**Why This Matters:**
- ✅ Templates contain only mandatory structure and generic content
- ❌ Existing themes contain specific business branding (ACATR, etc.)
- ✅ Templates are designed to be customized
- ❌ Existing themes create duplicate, business-specific content

---

## Overview

The CMS theme system allows for creating and managing custom themes that can be applied to tenants. This documentation provides a comprehensive guide for creating, registering, and migrating themes within the CMS.

## Theme vs Template

### Template (`sparti-cms/template/`)
- **Purpose**: Basic starting templates for new themes
- **Structure**: Simple, minimal components
- **Usage**: Used as a foundation when creating new themes
- **Example**: `template/landingpage/index.tsx` - Basic landing page template

### Theme (`sparti-cms/theme/`)
- **Purpose**: Full-featured, production-ready themes
- **Structure**: Complete component ecosystem with assets, styling, and configuration
- **Usage**: Applied to tenants for their websites
- **Example**: `theme/landingpage/` - Complete ACATR business services theme

## Theme Structure

Every theme must follow this standardized structure:

```
sparti-cms/theme/{theme-slug}/
├── index.tsx                 # Main theme component (REQUIRED)
├── theme.json               # Theme metadata (REQUIRED)
├── pages.json               # Page definitions (REQUIRED)
├── theme.css                # Theme-specific styles (RECOMMENDED)
├── README.md                # Theme documentation (RECOMMENDED)
├── components/              # Theme components directory
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── HeroSection.tsx
│   └── ui/                  # Reusable UI components
│       ├── button.tsx
│       ├── card.tsx
│       └── accordion.tsx
├── assets/                  # Theme assets directory
│   ├── images/
│   ├── icons/
│   └── logos/
└── verify-assets.js         # Asset verification script (OPTIONAL)
```

## Mandatory Setup Requirements

### 🚨 **Minimum Required Files for Theme Creation**

Every theme MUST have these files to function properly:

1. **`index.tsx`** - Main theme component (MANDATORY)
2. **`theme.json`** - Theme metadata and configuration (MANDATORY)
3. **`pages.json`** - Page definitions and SEO settings (MANDATORY)

### 📋 **Recommended Files for Production Themes**

4. **`theme.css`** - Theme-specific styles (HIGHLY RECOMMENDED)
5. **`README.md`** - Theme documentation (RECOMMENDED)
6. **`components/`** - Directory for theme components (RECOMMENDED)
7. **`assets/`** - Directory for theme assets (RECOMMENDED)

### ⚡ **Quick Start: Mandatory Files Only**

If you want to create a minimal theme quickly:

```bash
# 1. Copy template (contains mandatory files)
cp -r sparti-cms/template/landingpage sparti-cms/theme/your-theme-name

# 2. Update these 3 mandatory files:
# - theme.json (change name, description, author)
# - pages.json (update SEO metadata)
# - index.tsx (customize content)

# 3. Your theme is ready!
```

## Required Files

### 1. `index.tsx` - Main Theme Component

The main theme component that exports the default theme interface:

```typescript
import React from 'react';
import './theme.css';
// Import your components

interface TenantLandingProps {
  tenantName?: string;
  tenantSlug?: string;
}

const TenantLanding: React.FC<TenantLandingProps> = ({ 
  tenantName = 'Your Theme Name', 
  tenantSlug = 'your-theme-slug' 
}) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Your theme components */}
    </div>
  );
};

export default TenantLanding;
```

### 2. `theme.json` - Theme Metadata

Configuration file that defines theme metadata and registration information:

```json
{
  "name": "Your Theme Name",
  "description": "Description of your theme and its purpose",
  "version": "1.0.0",
  "author": "Your Name/Organization",
  "is_active": true,
  "category": "business|portfolio|blog|ecommerce",
  "tags": ["tag1", "tag2", "tag3"],
  "features": [
    "Feature 1",
    "Feature 2",
    "Feature 3"
  ],
  "preview_image": "assets/preview.jpg",
  "demo_url": "/theme/your-theme-slug",
  "documentation_url": "/docs/themes/your-theme"
}
```

**Required Fields:**
- `name`: Display name of the theme
- `description`: Brief description of the theme
- `version`: Semantic version number
- `author`: Theme creator
- `is_active`: Whether the theme is available for use

**Optional Fields:**
- `category`: Theme category for organization
- `tags`: Array of tags for filtering
- `features`: Array of key features
- `preview_image`: Path to preview image
- `demo_url`: URL for theme demo
- `documentation_url`: URL for theme documentation

### 3. `pages.json` - Page Definitions

Defines the pages and their metadata for the theme:

```json
{
  "pages": [
    {
      "page_name": "Homepage",
      "slug": "/",
      "meta_title": "Your Theme - Homepage",
      "meta_description": "Description for SEO",
      "seo_index": true,
      "status": "published",
      "page_type": "page",
      "keywords": ["keyword1", "keyword2"],
      "sections": [
        {
          "id": "hero",
          "name": "Hero Section",
          "description": "Main landing section"
        }
      ]
    }
  ]
}
```

**Page Fields:**
- `page_name`: Display name of the page
- `slug`: URL slug (must start with `/`)
- `meta_title`: SEO title
- `meta_description`: SEO description
- `seo_index`: Whether to index in search engines
- `status`: `published` or `draft`
- `page_type`: `page`, `blog_index`, `blog_post`, `legal`
- `keywords`: Array of SEO keywords
- `sections`: Array of page sections (optional)

## Theme Registration Process

### Automatic Registration

Themes are automatically discovered and registered by the CMS through:

1. **File System Scanning**: The system scans `sparti-cms/theme/` directory
2. **Metadata Reading**: Reads `theme.json` for each theme folder
3. **Database Sync**: Syncs theme information to the database
4. **API Exposure**: Makes themes available through `/api/themes` endpoint

### Manual Registration

You can manually sync themes using the admin interface:

1. Navigate to **Admin Dashboard** → **Themes Manager**
2. Click **Sync Themes from File System**
3. Verify themes appear in the list

## Creating a New Theme - Step by Step

### ⚠️ **IMPORTANT: Use Template, Not Existing Themes**

**✅ CORRECT: Start from Template (Mandatory Setup Only)**
```bash
# Copy minimal template to new theme
cp -r sparti-cms/template/landingpage sparti-cms/theme/your-new-theme
```

**❌ AVOID: Copying Existing Themes**
```bash
# DON'T DO THIS - Contains specific business content
# cp -r sparti-cms/theme/landingpage sparti-cms/theme/your-new-theme
```

**Why Use Templates?**
- ✅ Contains only mandatory structure and setup
- ✅ Generic, customizable content
- ✅ No business-specific branding or content
- ✅ Clean starting point for your theme

**Why Avoid Copying Existing Themes?**
- ❌ Contains specific business content (ACATR, etc.)
- ❌ Hardcoded branding and messaging
- ❌ Complex component structure you may not need
- ❌ Specific assets and styling

### Step 2: Complete Template Structure

The template now includes all mandatory files:

```
sparti-cms/template/landingpage/
├── index.tsx         # ✅ Main component with generic content
├── theme.json        # ✅ Template metadata (update this)
├── pages.json        # ✅ Page definitions (update SEO)
├── theme.css         # ✅ Basic styles with CSS variables
└── README.md         # ✅ Template documentation
```

**What makes this template perfect:**
- 🎯 **Generic Content** - No business-specific branding
- 🎨 **Customizable** - Easy to modify colors, text, and layout
- 📱 **Responsive** - Mobile-first design
- ♿ **Accessible** - Semantic HTML and focus styles
- 🚀 **Production Ready** - All mandatory files included

### Step 3: Update Configuration Files

1. **Update `theme.json`**:
   - Change `name` to your theme name
   - Update `description`, `author`, `version`
   - Set appropriate `category` and `tags`
   - Update `demo_url` to match your theme slug

2. **Update `pages.json`**:
   - Modify page metadata
   - Update SEO titles and descriptions
   - Adjust page slugs if needed

### Step 4: Customize Content

1. **Main Component (`index.tsx`)**:
   - Update default props (`tenantName`, `tenantSlug`)
   - Replace placeholder text with your content
   - Modify sections to match your business

2. **Add More Components (Optional)**:
   - Create `components/` directory if needed
   - Add custom components
   - Update component imports in `index.tsx`

### Step 5: Add Assets (Optional)

1. **Create Assets Directory**:
   ```bash
   mkdir sparti-cms/theme/your-new-theme/assets
   ```

2. **Add Your Assets**:
   - Images: `.jpg`, `.png`, `.webp`
   - Icons: `.svg`, `.png`
   - Logos: Brand assets
   - Other: Fonts, videos, etc.

3. **Update Asset References**:
   - Use path: `/theme/your-theme-slug/assets/filename.ext`
   - Update all hardcoded asset paths in components

### Step 6: Customize Styling (Optional)

1. **Update `theme.css`**:
   - Define CSS custom properties (variables)
   - Add theme-specific styles
   - Ensure responsive design

2. **CSS Variables Example**:
   ```css
   :root {
     --primary: 220 70% 50%;           /* HSL format recommended */
     --primary-foreground: 0 0% 100%;
     --secondary: 220 14% 96%;
     --background: 0 0% 100%;
     --foreground: 220 9% 9%;
     /* ... more variables ... */
   }
   ```

3. **Theme Styles System**:
   - Your theme CSS is linked to the CMS Styles settings page
   - Manage colors and typography through Admin → Settings → Styles
   - See [THEME-STYLES.md](./THEME-STYLES.md) for complete documentation
   - Styles are linked to `/theme/{theme-slug}/theme.css`

### Step 7: Testing

1. **Template Verification** (Before you start):
   ```bash
   # Verify template has all mandatory files
   node sparti-cms/template/verify-template.js sparti-cms/template/landingpage
   ```

2. **Theme Verification** (After creating your theme):
   ```bash
   # Verify your new theme structure
   node sparti-cms/template/verify-template.js sparti-cms/theme/your-theme-name
   ```

3. **Local Testing**:
   - Navigate to `/theme/your-theme-slug`
   - Test all components and interactions
   - Verify responsive design

4. **Asset Verification**:
   - Check all images load correctly
   - Verify asset paths are correct
   - Test on different screen sizes

### Step 8: Documentation (Optional)

1. **Create `README.md`**:
   - Document theme features
   - List all components
   - Provide customization guide
   - Include asset inventory

2. **Update Theme Metadata**:
   - Ensure `theme.json` is complete
   - Add comprehensive feature list
   - Set correct preview image

## 📋 Complete Theme Setup SOP (Standard Operating Procedure)

This section provides a comprehensive step-by-step guide for setting up a new theme, including database configuration, asset migration, and content linking.

### Prerequisites

Before starting, ensure you have:
- ✅ Node.js (v18 or higher) installed
- ✅ PostgreSQL database running (local or Railway)
- ✅ Environment variables configured (`.env` file)
- ✅ Backend server access
- ✅ Source assets ready for migration

### Step 1: Environment Setup

#### 1.1 Configure Environment Variables

Create or update `.env` file in project root:

```bash
# Database Configuration
DATABASE_PUBLIC_URL="postgresql://user:password@host:port/database"
DATABASE_URL="postgresql://user:password@host:port/database"

# PostgreSQL Individual Settings
PGDATABASE="your_database"
PGHOST="your_host"
PGPASSWORD="your_password"
PGPORT="5432"
PGUSER="your_user"

# Server Configuration
PORT=4173
NODE_ENV=development

# API Configuration
VITE_API_BASE_URL="http://localhost:4173"
```

#### 1.2 Verify Database Connection

```bash
# Test database connection
npm run db:test

# Or manually test
node -e "require('dotenv').config(); const { Pool } = require('pg'); const pool = new Pool({connectionString: process.env.DATABASE_PUBLIC_URL}); pool.query('SELECT NOW()', (err, res) => { console.log(err ? 'Error:' + err : 'Success:' + res.rows[0].now); pool.end(); });"
```

### Step 2: Database Setup & Migration

#### 2.1 Run Database Migrations

```bash
# Run all migrations to create required tables
npm run sequelize:migrate

# Or run specific migrations
npm run sequelize:migrate -- --name create-theme-tables
npm run sequelize:migrate -- --name create-content-tables
npm run sequelize:migrate -- --name create-page-tables
```

#### 2.2 Verify Required Tables Exist

The following tables must exist for themes to work:

**Core Theme Tables:**
```sql
-- Themes table (stores theme metadata)
CREATE TABLE IF NOT EXISTS themes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  version VARCHAR(50),
  author VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  category VARCHAR(100),
  tags TEXT[],
  features TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pages table (stores page definitions)
CREATE TABLE IF NOT EXISTS pages (
  id SERIAL PRIMARY KEY,
  theme_id INTEGER REFERENCES themes(id),
  tenant_id INTEGER,
  page_name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  meta_title VARCHAR(255),
  meta_description TEXT,
  seo_index BOOLEAN DEFAULT true,
  status VARCHAR(20) DEFAULT 'published',
  page_type VARCHAR(50) DEFAULT 'page',
  keywords TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Content Management Tables:**
```sql
-- Posts table (for blog content)
CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  content TEXT,
  excerpt TEXT,
  status VARCHAR(20) DEFAULT 'draft',
  post_type VARCHAR(50) DEFAULT 'post',
  author_id INTEGER,
  tenant_id INTEGER,
  meta_title VARCHAR(255),
  meta_description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Site settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER,
  setting_key VARCHAR(255) NOT NULL,
  setting_value TEXT,
  setting_type VARCHAR(50) DEFAULT 'text',
  setting_category VARCHAR(100),
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2.3 Verify Database Tables

```bash
# Check if tables exist
psql $DATABASE_PUBLIC_URL -c "\dt"

# Or via API (if server is running)
curl http://localhost:4173/api/system/database/tables
```

### Step 3: Theme Creation & File Structure

#### 3.1 Create Theme Directory

```bash
# Create theme from template (RECOMMENDED)
cp -r sparti-cms/template/landingpage sparti-cms/theme/your-theme-slug

# Or create manually
mkdir -p sparti-cms/theme/your-theme-slug
mkdir -p sparti-cms/theme/your-theme-slug/components
mkdir -p sparti-cms/theme/your-theme-slug/components/ui
mkdir -p sparti-cms/theme/your-theme-slug/assets
mkdir -p sparti-cms/theme/your-theme-slug/assets/images
mkdir -p sparti-cms/theme/your-theme-slug/assets/logos
mkdir -p sparti-cms/theme/your-theme-slug/assets/icons
```

#### 3.2 Create Required Files

**Create `index.tsx`:**
```typescript
import React from 'react';
import './theme.css';

interface TenantLandingProps {
  tenantName?: string;
  tenantSlug?: string;
}

const TenantLanding: React.FC<TenantLandingProps> = ({
  tenantName = 'Your Theme Name',
  tenantSlug = 'your-theme-slug'
}) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Your theme content */}
    </div>
  );
};

export default TenantLanding;
```

**Create `theme.json`:**
```json
{
  "name": "Your Theme Name",
  "description": "Theme description",
  "version": "1.0.0",
  "author": "Your Name",
  "is_active": true,
  "category": "business",
  "tags": ["tag1", "tag2"],
  "features": ["Feature 1", "Feature 2"]
}
```

**Create `pages.json`:**
```json
{
  "pages": [
    {
      "page_name": "Homepage",
      "slug": "/",
      "meta_title": "Your Theme - Homepage",
      "meta_description": "SEO description",
      "seo_index": true,
      "status": "published",
      "page_type": "page",
      "keywords": ["keyword1", "keyword2"]
    }
  ]
}
```

### Step 4: Assets Migration

#### 4.1 Identify Source Assets

Before migration, identify all assets from your source:

```bash
# List all assets in source directory
find source-folder -type f \( -name "*.jpg" -o -name "*.png" -o -name "*.svg" -o -name "*.webp" -o -name "*.gif" \) -exec ls -lh {} \;

# Create asset inventory
find source-folder -type f \( -name "*.jpg" -o -name "*.png" -o -name "*.svg" \) > asset-inventory.txt
```

#### 4.2 Organize Assets by Category

```bash
# Create organized asset structure
cd sparti-cms/theme/your-theme-slug/assets

# Logos
mkdir -p logos
# Copy logo files here

# Images
mkdir -p images/hero
mkdir -p images/features
mkdir -p images/testimonials
mkdir -p images/backgrounds

# Icons
mkdir -p icons
```

#### 4.3 Copy Assets from Source

```bash
# Method 1: Copy all images
cp -r source-folder/src/assets/* sparti-cms/theme/your-theme-slug/assets/images/

# Method 2: Copy specific files
cp source-folder/src/assets/hero-background.jpg sparti-cms/theme/your-theme-slug/assets/images/hero/
cp source-folder/src/assets/logo.png sparti-cms/theme/your-theme-slug/assets/logos/

# Method 3: Copy with organization
find source-folder/src/assets -name "*.jpg" -exec cp {} sparti-cms/theme/your-theme-slug/assets/images/ \;
find source-folder/src/assets -name "*.png" -exec cp {} sparti-cms/theme/your-theme-slug/assets/images/ \;
find source-folder/src/assets -name "*.svg" -exec cp {} sparti-cms/theme/your-theme-slug/assets/icons/ \;
```

#### 4.4 Optimize Assets

```bash
# Install image optimization tools (optional)
npm install -g sharp-cli

# Optimize images
sharp-cli --input assets/images/*.jpg --output assets/images/optimized/ --resize 1920

# Or use online tools like TinyPNG, Squoosh
```

#### 4.5 Update Asset References in Code

**Find all asset references:**
```bash
# Search for asset paths in components
grep -r "src/assets" sparti-cms/theme/your-theme-slug/
grep -r "\./assets" sparti-cms/theme/your-theme-slug/
grep -r "assets/" sparti-cms/theme/your-theme-slug/
```

**Update paths to use theme-relative paths:**
```typescript
// OLD (source project)
import heroImage from '../assets/hero-background.jpg';
<img src={heroImage} />

// NEW (theme)
const heroImage = '/theme/your-theme-slug/assets/images/hero/hero-background.jpg';
<img src={heroImage} alt="Hero" />

// Or use dynamic tenant slug
const heroImage = `/theme/${tenantSlug}/assets/images/hero/hero-background.jpg`;
```

**Batch replace asset paths:**
```bash
# Replace all occurrences
find sparti-cms/theme/your-theme-slug -type f -name "*.tsx" -exec sed -i 's|src/assets|/theme/your-theme-slug/assets|g' {} \;
find sparti-cms/theme/your-theme-slug -type f -name "*.tsx" -exec sed -i 's|\./assets|/theme/your-theme-slug/assets|g' {} \;
```

#### 4.6 Verify Asset Paths

```bash
# Create verification script
cat > verify-assets.js << 'EOF'
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const themeSlug = process.argv[2] || 'your-theme-slug';
const themePath = path.join(__dirname, '..', 'theme', themeSlug);
const assetsPath = path.join(themePath, 'assets');

// Check if assets directory exists
if (!fs.existsSync(assetsPath)) {
  console.error(`❌ Assets directory not found: ${assetsPath}`);
  process.exit(1);
}

// List all assets
const assets = [];
function walkDir(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath);
    } else {
      assets.push(filePath.replace(themePath, ''));
    }
  });
}

walkDir(assetsPath);
console.log(`✅ Found ${assets.length} assets:`);
assets.forEach(asset => console.log(`   ${asset}`));
EOF

# Run verification
node verify-assets.js your-theme-slug
```

### Step 5: Database Registration

#### 5.1 Sync Theme to Database

**Method 1: Via API (Recommended)**
```bash
# Start backend server
npm run dev:backend

# In another terminal, sync themes
curl -X POST http://localhost:4173/api/themes/sync

# Verify theme is registered
curl http://localhost:4173/api/themes/your-theme-slug
```

**Method 2: Via Admin Dashboard**
1. Navigate to `http://localhost:8082/admin`
2. Go to **Themes Manager**
3. Click **Sync Themes from File System**
4. Verify your theme appears in the list

**Method 3: Manual Database Insert**
```sql
INSERT INTO themes (name, slug, description, version, author, is_active, category, tags, features)
VALUES (
  'Your Theme Name',
  'your-theme-slug',
  'Theme description',
  '1.0.0',
  'Your Name',
  true,
  'business',
  ARRAY['tag1', 'tag2'],
  ARRAY['Feature 1', 'Feature 2']
);
```

#### 5.2 Register Pages

Pages from `pages.json` are automatically registered when you sync themes. To verify:

```sql
-- Check registered pages
SELECT p.*, t.name as theme_name 
FROM pages p 
JOIN themes t ON p.theme_id = t.id 
WHERE t.slug = 'your-theme-slug';
```

Or via API:
```bash
curl http://localhost:4173/api/pages?theme=your-theme-slug
```

### Step 6: Content Linking

#### 6.1 Link Blog Posts to Theme

```javascript
// Create post linked to tenant/theme
const post = await query(`
  INSERT INTO posts (title, slug, content, status, tenant_id, meta_title, meta_description)
  VALUES ($1, $2, $3, 'published', $4, $5, $6)
  RETURNING id
`, [title, slug, content, tenantId, metaTitle, metaDescription]);

// Link to categories
await query(`
  INSERT INTO post_categories (post_id, category_id)
  VALUES ($1, $2)
`, [post.rows[0].id, categoryId]);
```

#### 6.2 Configure Tenant Settings

```javascript
// Create tenant-specific theme settings
await query(`
  INSERT INTO site_settings (tenant_id, setting_key, setting_value, setting_category)
  VALUES 
    ($1, 'theme_primary_color', '#0066cc', 'theme'),
    ($1, 'theme_company_name', 'Your Company', 'theme'),
    ($1, 'theme_contact_email', 'contact@company.com', 'theme'),
    ($1, 'theme_logo_url', '/theme/your-theme-slug/assets/logos/logo.png', 'theme')
`, [tenantId]);
```

#### 6.3 Dynamic Content Integration

Update your theme component to fetch dynamic content:

```typescript
import { useEffect, useState } from 'react';

const TenantLanding: React.FC<TenantLandingProps> = ({ tenantSlug }) => {
  const [posts, setPosts] = useState([]);
  const [settings, setSettings] = useState({});

  useEffect(() => {
    // Fetch tenant-specific content
    fetch(`/api/posts?tenant=${tenantSlug}&status=published&limit=5`)
      .then(res => res.json())
      .then(data => setPosts(data.posts || []));

    // Fetch theme settings
    fetch(`/api/settings?tenant=${tenantSlug}&category=theme`)
      .then(res => res.json())
      .then(data => {
        const settingsObj = {};
        (data.settings || []).forEach(setting => {
          settingsObj[setting.setting_key] = setting.setting_value;
        });
        setSettings(settingsObj);
      });
  }, [tenantSlug]);

  return (
    <div>
      {/* Use dynamic content */}
      <HeroSection companyName={settings.theme_company_name} />
      <BlogSection posts={posts} />
    </div>
  );
};
```

### Step 7: Testing & Verification

#### 7.1 Test Theme Loading

```bash
# Start development server
npm run dev

# Access theme directly
open http://localhost:8082/theme/your-theme-slug

# Or via tenant route
open http://localhost:8082/tenant/your-tenant-slug
```

#### 7.2 Verify Asset Loading

1. Open browser DevTools (F12)
2. Go to Network tab
3. Filter by "Img"
4. Check all assets load with status 200
5. Verify no 404 errors for assets

#### 7.3 Test Database Integration

```bash
# Test theme API
curl http://localhost:4173/api/themes/your-theme-slug

# Test pages API
curl http://localhost:4173/api/pages?theme=your-theme-slug

# Test content API
curl http://localhost:4173/api/posts?tenant=your-tenant-slug
```

#### 7.4 Cross-Browser Testing

Test on:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (if on Mac)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

### Step 8: Final Checklist

Before marking theme as complete:

- [ ] **Environment**: All environment variables configured
- [ ] **Database**: All required tables exist and migrations run
- [ ] **Files**: All required files created (`index.tsx`, `theme.json`, `pages.json`)
- [ ] **Assets**: All assets migrated and organized
- [ ] **Asset Paths**: All asset references updated in code
- [ ] **Registration**: Theme synced to database
- [ ] **Pages**: Pages registered from `pages.json`
- [ ] **Content**: Content linking configured (if needed)
- [ ] **Testing**: Theme loads correctly at `/theme/{slug}`
- [ ] **Assets**: All assets load without 404 errors
- [ ] **Responsive**: Theme works on mobile and desktop
- [ ] **Performance**: Assets optimized and loading fast
- [ ] **SEO**: Meta tags configured in `pages.json`

## Asset Management

### Asset Organization
```
assets/
├── logos/           # Brand logos and marks
├── images/          # Content images
├── icons/           # UI icons and graphics
├── backgrounds/     # Background images
└── placeholders/    # Fallback images
```

### Asset Naming Conventions
- Use descriptive names: `hero-business.jpg` not `img1.jpg`
- Use kebab-case: `company-logo.png`
- Include dimensions for specific sizes: `logo-200x100.png`
- Use appropriate extensions: `.jpg`, `.png`, `.svg`, `.webp`

### Asset Path References
Always use absolute paths from the theme root:
```typescript
const logoSrc = '/theme/your-theme-slug/assets/logos/company-logo.png';
```

## Component Development Guidelines

### Component Structure
```typescript
import React from 'react';

interface ComponentProps {
  // Define your props with TypeScript
  title?: string;
  description?: string;
  onAction?: () => void;
}

const YourComponent: React.FC<ComponentProps> = ({
  title = 'Default Title',
  description,
  onAction
}) => {
  return (
    <section className="your-component">
      {/* Component JSX */}
    </section>
  );
};

export default YourComponent;
```

### Best Practices
1. **TypeScript**: Always use TypeScript interfaces for props
2. **Default Props**: Provide sensible defaults
3. **Responsive Design**: Use mobile-first approach
4. **Accessibility**: Include proper ARIA labels and semantic HTML
5. **Performance**: Optimize images and minimize re-renders
6. **Modularity**: Keep components focused and reusable

## 🐛 Troubleshooting

### Common Issues & Solutions

#### Theme Not Appearing in Admin

**Symptoms:**
- Theme doesn't show in themes list
- Theme sync returns empty results

**Solutions:**
```bash
# 1. Check theme.json syntax
cat sparti-cms/theme/your-theme-slug/theme.json | jq .

# 2. Verify required fields exist
grep -E '"name"|"slug"|"version"' sparti-cms/theme/your-theme-slug/theme.json

# 3. Check folder structure
ls -la sparti-cms/theme/your-theme-slug/

# 4. Run theme sync manually
curl -X POST http://localhost:4173/api/themes/sync

# 5. Check server logs
tail -f logs/server.log | grep theme
```

#### Assets Not Loading

**Symptoms:**
- Images show broken/placeholder
- 404 errors in browser console
- Assets not found errors

**Solutions:**
```bash
# 1. Verify asset paths in code
grep -r "assets/" sparti-cms/theme/your-theme-slug/

# 2. Check if assets exist
ls -la sparti-cms/theme/your-theme-slug/assets/

# 3. Verify path format (should be /theme/{slug}/assets/)
grep -r "src/assets\|\./assets" sparti-cms/theme/your-theme-slug/

# 4. Test asset URL directly
curl http://localhost:8082/theme/your-theme-slug/assets/images/hero.jpg

# 5. Check file permissions
chmod -R 644 sparti-cms/theme/your-theme-slug/assets/
```

#### Database Connection Issues

**Symptoms:**
- Theme sync fails
- "Database is initializing" errors
- Connection timeout

**Solutions:**
```bash
# 1. Test database connection
npm run db:test

# 2. Check environment variables
node -e "require('dotenv').config(); console.log('DB URL:', process.env.DATABASE_PUBLIC_URL ? 'Set ✅' : 'Missing ❌')"

# 3. Verify database tables exist
psql $DATABASE_PUBLIC_URL -c "\dt" | grep themes

# 4. Check database migrations
npm run sequelize:migrate:status

# 5. Run migrations if needed
npm run sequelize:migrate
```

#### Components Not Rendering

**Symptoms:**
- Blank page
- Component errors in console
- Import errors

**Solutions:**
```bash
# 1. Check component imports
grep -r "import.*from" sparti-cms/theme/your-theme-slug/index.tsx

# 2. Verify TypeScript compilation
npx tsc --noEmit sparti-cms/theme/your-theme-slug/index.tsx

# 3. Check for missing dependencies
npm list react react-dom

# 4. Verify component files exist
find sparti-cms/theme/your-theme-slug/components -name "*.tsx"

# 5. Check browser console for errors
# Open DevTools (F12) → Console tab
```

#### Styling Issues

**Symptoms:**
- Styles not applying
- CSS variables not working
- Layout broken

**Solutions:**
```bash
# 1. Verify theme.css is imported
grep "theme.css" sparti-cms/theme/your-theme-slug/index.tsx

# 2. Check CSS syntax
npx stylelint sparti-cms/theme/your-theme-slug/theme.css

# 3. Verify CSS custom properties
grep -E "--[a-z-]+:" sparti-cms/theme/your-theme-slug/theme.css

# 4. Check for conflicting styles
# In browser DevTools → Elements → Styles tab

# 5. Verify responsive breakpoints
# Test at different screen sizes
```

#### Theme Registration Fails

**Symptoms:**
- Theme sync returns error
- Database insert fails
- Duplicate key errors

**Solutions:**
```bash
# 1. Check if theme already exists
curl http://localhost:4173/api/themes/your-theme-slug

# 2. Check database for existing theme
psql $DATABASE_PUBLIC_URL -c "SELECT * FROM themes WHERE slug = 'your-theme-slug';"

# 3. Remove existing theme if needed
psql $DATABASE_PUBLIC_URL -c "DELETE FROM themes WHERE slug = 'your-theme-slug';"

# 4. Verify theme.json is valid JSON
cat sparti-cms/theme/your-theme-slug/theme.json | jq .

# 5. Check server logs for detailed error
tail -f logs/server.log
```

### Debug Mode

Enable detailed logging:

```bash
# Set debug environment variable
DEBUG=theme:* npm run dev

# Or for specific components
DEBUG=theme:sync,theme:load npm run dev

# Check theme loading in console
# Look for [testing] prefixed logs
```

### Verification Scripts

**Complete Theme Verification:**
```bash
# Create verify-theme.sh
cat > verify-theme.sh << 'EOF'
#!/bin/bash
THEME_SLUG=$1

echo "🔍 Verifying theme: $THEME_SLUG"
echo ""

# Check required files
echo "📄 Checking required files..."
[ -f "sparti-cms/theme/$THEME_SLUG/index.tsx" ] && echo "✅ index.tsx" || echo "❌ index.tsx missing"
[ -f "sparti-cms/theme/$THEME_SLUG/theme.json" ] && echo "✅ theme.json" || echo "❌ theme.json missing"
[ -f "sparti-cms/theme/$THEME_SLUG/pages.json" ] && echo "✅ pages.json" || echo "❌ pages.json missing"

# Check assets
echo ""
echo "🖼️  Checking assets..."
ASSET_COUNT=$(find sparti-cms/theme/$THEME_SLUG/assets -type f 2>/dev/null | wc -l)
echo "Found $ASSET_COUNT assets"

# Check database registration
echo ""
echo "🗄️  Checking database registration..."
curl -s http://localhost:4173/api/themes/$THEME_SLUG | jq -r '.success' && echo "✅ Theme registered" || echo "❌ Theme not registered"

echo ""
echo "✅ Verification complete"
EOF

chmod +x verify-theme.sh
./verify-theme.sh your-theme-slug
```

## 🔧 API Integration

### Theme API Endpoints

**Get All Themes**
```bash
GET /api/themes
# Response: { success: true, themes: [...], total: number }
```

**Get Theme by Slug**
```bash
GET /api/themes/{slug}
# Response: { success: true, theme: {...} }
```

**Sync Themes from File System**
```bash
POST /api/themes/sync
# Response: { success: true, synced: number, themes: [...] }
```

**Create New Theme**
```bash
POST /api/themes
Body: { slug: "theme-slug", name: "Theme Name", description: "Description" }
```

### Content API Endpoints

**Get Posts for Tenant**
```bash
GET /api/posts?tenant={tenantSlug}&status=published&limit=5
```

**Get Categories**
```bash
GET /api/categories?tenant={tenantSlug}
```

**Get Site Settings**
```bash
GET /api/settings?tenant={tenantSlug}&category=theme
```

**Get Pages for Theme**
```bash
GET /api/pages?theme={themeSlug}
```

### Using Themes in Applications

```typescript
// Fetch available themes
const response = await fetch('/api/themes');
const { themes } = await response.json();

// Get specific theme
const theme = themes.find(t => t.slug === 'your-theme-slug');

// Fetch tenant-specific content
const postsResponse = await fetch(`/api/posts?tenant=${tenantSlug}&status=published`);
const { posts } = await postsResponse.json();

// Fetch theme settings
const settingsResponse = await fetch(`/api/settings?tenant=${tenantSlug}&category=theme`);
const { settings } = await settingsResponse.json();
```

## Advanced Features

### Dynamic Content Support
Themes can integrate with the CMS content management system for dynamic content:

```typescript
// Example: Dynamic content integration
const YourComponent: React.FC<Props> = ({ content }) => {
  return (
    <section>
      {content?.title && <h2>{content.title}</h2>}
      {content?.description && <p>{content.description}</p>}
    </section>
  );
};
```

### Multi-language Support
Themes can support multiple languages through the CMS language system:

```typescript
// Example: Language-aware component
const YourComponent: React.FC<Props> = ({ language = 'en' }) => {
  const content = getContentByLanguage(language);
  return <div>{content.title}</div>;
};
```

### SEO Integration
Themes automatically integrate with the CMS SEO system through `pages.json` configuration.

## Version Management

### Semantic Versioning
Use semantic versioning for theme versions:
- **Major** (1.0.0): Breaking changes
- **Minor** (1.1.0): New features, backward compatible
- **Patch** (1.1.1): Bug fixes, backward compatible

### Version History
Document changes in your theme's `README.md`:

```markdown
## Version History

- **v2.0.0**: Complete redesign with new component architecture
- **v1.2.0**: Added testimonials and FAQ sections
- **v1.1.1**: Fixed responsive design issues
- **v1.1.0**: Added contact form integration
- **v1.0.0**: Initial release
```

## Support and Maintenance

### Regular Maintenance Tasks
1. **Update Dependencies**: Keep React and other dependencies current
2. **Asset Optimization**: Regularly optimize images and assets
3. **Performance Testing**: Monitor and improve loading times
4. **Browser Testing**: Test on latest browser versions
5. **Accessibility Audits**: Regular accessibility compliance checks

### Getting Help
- Check this documentation first
- Review existing theme implementations
- Check server logs for error messages
- Test in isolation to identify issues
- Document and report bugs with reproduction steps

## JSON Schema Creation Guide

The CMS uses a sophisticated JSON schema system for defining components and page layouts. This section explains how to create and work with these schemas.

### Schema Architecture Overview

The CMS uses a multi-layered schema system:

1. **Component Registry Schemas** (`sparti-cms/registry/components/*.json`) - Define reusable components
2. **Page Layout Schemas** (Database: `page_layouts.layout_json`) - Define page structure using components
3. **Site Schemas** (Database: `site_schemas.schema_value`) - Define site-wide settings

### Component Registry Schema Format

Component schemas define reusable UI components with their properties and behavior:

```json
{
  "id": "hero-main",
  "name": "Hero Section",
  "type": "container",
  "category": "content",
  "description": "Main hero section with headline, description, and CTA",
  "properties": {
    "headingLine1": {
      "type": "string",
      "description": "First line of heading",
      "editable": true,
      "required": true,
      "default": "We Boost Your SEO"
    },
    "showBadge": {
      "type": "boolean",
      "description": "Show/hide badge",
      "editable": true,
      "default": true
    },
    "clientLogos": {
      "type": "array",
      "description": "Client logos for the carousel",
      "editable": true,
      "default": [
        {
          "src": "/assets/logos/logo1.png",
          "alt": "Client Name"
        }
      ]
    }
  },
  "editor": "ContainerEditor",
  "version": "1.0.0",
  "tenant_scope": "tenant",
  "tags": ["hero", "banner", "cta"],
  "dependencies": ["framer-motion", "lucide-react"],
  "last_updated": "2025-01-26T12:00:00Z"
}
```

#### Component Schema Fields

**Required Fields:**
- `id`: Unique identifier (kebab-case, e.g., "hero-main")
- `name`: Display name for the component
- `type`: Component type from enum: `text`, `image`, `video`, `button`, `link`, `input`, `container`, `media`, `unknown`
- `category`: Component category from enum: `content`, `media`, `navigation`, `form`, `layout`, `interactive`
- `editor`: Editor component to use (e.g., "ContainerEditor", "TextEditor")
- `version`: Semantic version number

**Optional Fields:**
- `description`: Component description
- `properties`: Object defining component properties (see Property Types below)
- `tenant_scope`: `"tenant"` (tenant-specific) or `"global"` (shared across tenants)
- `tags`: Array of tags for filtering and organization
- `dependencies`: Array of required npm packages
- `components`: Array of child component IDs
- `last_updated`: ISO timestamp of last update

#### Property Types

Each property in the `properties` object can have these fields:

```json
{
  "propertyName": {
    "type": "string|number|boolean|object|array",
    "description": "Property description",
    "editable": true,
    "required": false,
    "default": "default value",
    "enum": ["option1", "option2"],
    "format": "url|email|color|html",
    "items": { /* for array types */ },
    "properties": { /* for object types */ }
  }
}
```

**Property Field Definitions:**
- `type`: Data type (`string`, `number`, `boolean`, `object`, `array`)
- `description`: Human-readable description
- `editable`: Whether the property can be edited in CMS (default: `true`)
- `required`: Whether the property is required (default: `false`)
- `default`: Default value for the property
- `enum`: Array of allowed values (for dropdowns)
- `format`: Special format validation (`url`, `email`, `color`, `html`)
- `items`: Schema for array items (when `type: "array"`)
- `properties`: Nested properties (when `type: "object"`)

### Page Layout Schema Format

Page layouts use components from the registry to build complete pages:

```json
{
  "components": [
    {
      "id": "hero-section-1",
      "type": "hero-main",
      "props": {
        "headingLine1": "Custom Heading",
        "headingLine2": "Custom Subheading",
        "description": "Custom description text",
        "ctaButtonText": "Get Started",
        "showBadge": true,
        "badgeText": "Limited Time Offer"
      }
    },
    {
      "id": "services-section-1",
      "type": "services-grid",
      "props": {
        "title": "Our Services",
        "services": [
          {
            "title": "Web Development",
            "description": "Custom web solutions",
            "icon": "code"
          }
        ]
      }
    }
  ]
}
```

#### Page Layout Schema Fields

- `components`: Array of component instances
  - `id`: Unique instance ID (e.g., "hero-section-1")
  - `type`: Component type ID from registry (e.g., "hero-main")
  - `props`: Object containing property values matching the component's schema

### Creating New Component Schemas

#### Step 1: Design the Component

First, create the React component in your theme:

```typescript
// components/CustomSection.tsx
interface CustomSectionProps {
  title?: string;
  description?: string;
  items?: Array<{
    title: string;
    content: string;
    image?: string;
  }>;
  backgroundColor?: string;
}

const CustomSection: React.FC<CustomSectionProps> = ({
  title = "Default Title",
  description,
  items = [],
  backgroundColor = "#ffffff"
}) => {
  return (
    <section style={{ backgroundColor }}>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      {items.map((item, index) => (
        <div key={index}>
          <h3>{item.title}</h3>
          <p>{item.content}</p>
          {item.image && <img src={item.image} alt={item.title} />}
        </div>
      ))}
    </section>
  );
};
```

#### Step 2: Create Component Schema

Create a JSON file in `sparti-cms/registry/components/`:

```json
{
  "id": "custom-section",
  "name": "Custom Section",
  "type": "container",
  "category": "content",
  "description": "A customizable section with title, description, and items",
  "properties": {
    "title": {
      "type": "string",
      "description": "Section title",
      "editable": true,
      "required": true,
      "default": "Our Features"
    },
    "description": {
      "type": "string",
      "description": "Section description",
      "editable": true,
      "default": "Discover what makes us different"
    },
    "backgroundColor": {
      "type": "string",
      "description": "Background color",
      "editable": true,
      "format": "color",
      "default": "#ffffff"
    },
    "items": {
      "type": "array",
      "description": "List of items to display",
      "editable": true,
      "items": {
        "type": "object",
        "properties": {
          "title": {
            "type": "string",
            "description": "Item title",
            "required": true
          },
          "content": {
            "type": "string",
            "description": "Item content",
            "format": "html"
          },
          "image": {
            "type": "string",
            "description": "Item image URL",
            "format": "url"
          }
        }
      },
      "default": [
        {
          "title": "Feature 1",
          "content": "Description of feature 1",
          "image": "/assets/feature1.jpg"
        }
      ]
    }
  },
  "editor": "ContainerEditor",
  "version": "1.0.0",
  "tenant_scope": "tenant",
  "tags": ["section", "features", "content"],
  "last_updated": "2025-01-26T12:00:00Z"
}
```

#### Step 3: Register the Component

Add the component to the registry index:

```typescript
// sparti-cms/registry/index.ts
import customSectionComponent from './components/custom-section.json';

// In the loadLocalComponents method:
const components = [
  // ... existing components
  customSectionComponent as ComponentDefinition,
];
```

#### Step 4: Create Editor (Optional)

For complex components, create a custom editor:

```typescript
// components/editors/CustomSectionEditor.tsx
interface CustomSectionEditorProps {
  value: any;
  onChange: (value: any) => void;
  schema: ComponentDefinition;
}

const CustomSectionEditor: React.FC<CustomSectionEditorProps> = ({
  value,
  onChange,
  schema
}) => {
  // Custom editing interface
  return (
    <div>
      {/* Custom editor UI */}
    </div>
  );
};
```

### Schema Validation

The system includes comprehensive schema validation:

#### Built-in Validation

```typescript
import { validateComponentSchema, validatePageSchema } from '../utils/schema-validator';

// Validate component schema
const componentValidation = validateComponentSchema(componentSchema);
if (!componentValidation.isValid) {
  console.error('Component validation errors:', componentValidation.errors);
}

// Validate page schema
const pageValidation = validatePageSchema(pageSchema);
if (!pageValidation.isValid) {
  console.error('Page validation errors:', pageValidation.errors);
}
```

#### Custom Validation Rules

```typescript
import { validateSchemaRequirements } from '../utils/schema-validator';

const validation = validateSchemaRequirements(pageSchema, {
  minComponents: 1,
  maxComponents: 10,
  requiredComponents: ['hero-main'],
  allowedItemTypes: ['string', 'boolean', 'array']
});
```

### AI-Powered Schema Generation

The CMS includes AI-powered schema generation:

#### Automatic Schema Generation

```typescript
// Generate schema from page analysis
const response = await api.post('/api/ai-assistant/generate-schema', {
  pageSlug: '/homepage',
  pageName: 'Homepage',
  tenantId: 'your-tenant-id',
  model: 'claude-3-5-sonnet-20241022',
  analyzePageCode: true,
  currentSchema: existingSchema
});

const generatedSchema = response.data.schema;
```

#### Schema Generation Rules

The AI follows these rules when generating schemas:

1. **Deep Page Analysis**: Examines page structure and content
2. **Component Matching**: Maps content to available components
3. **Schema Validation**: Ensures generated JSON is valid
4. **Property Completeness**: Includes all required properties
5. **Unique Identifiers**: Creates descriptive, unique component IDs
6. **Registry Compliance**: Only uses registered components

### Schema Best Practices

#### Naming Conventions

- **Component IDs**: Use kebab-case (e.g., "hero-main", "services-grid")
- **Property Names**: Use camelCase (e.g., "backgroundColor", "showBadge")
- **Instance IDs**: Use descriptive names with numbers (e.g., "hero-section-1")

#### Property Design

- **Required vs Optional**: Mark essential properties as required
- **Default Values**: Provide sensible defaults for all properties
- **Validation**: Use `enum` for limited options, `format` for validation
- **Documentation**: Write clear descriptions for all properties

#### Schema Organization

- **Categories**: Use consistent categories (`content`, `media`, `navigation`, etc.)
- **Tags**: Add relevant tags for filtering and search
- **Versioning**: Use semantic versioning for schema updates
- **Dependencies**: List all required npm packages

#### Performance Considerations

- **Default Values**: Keep default arrays and objects small
- **Nested Objects**: Limit nesting depth for better performance
- **Property Count**: Balance flexibility with complexity

### Troubleshooting Schemas

#### Common Schema Errors

**Invalid Component Type**
```json
// ❌ Wrong - type not in enum
"type": "custom-type"

// ✅ Correct - use valid type
"type": "container"
```

**Missing Required Fields**
```json
// ❌ Wrong - missing required fields
{
  "name": "My Component"
}

// ✅ Correct - all required fields
{
  "id": "my-component",
  "name": "My Component",
  "type": "container",
  "category": "content",
  "editor": "ContainerEditor",
  "version": "1.0.0"
}
```

**Invalid Property Types**
```json
// ❌ Wrong - invalid property type
"properties": {
  "title": {
    "type": "invalid-type"
  }
}

// ✅ Correct - valid property type
"properties": {
  "title": {
    "type": "string",
    "description": "Component title"
  }
}
```

#### Debugging Tools

**Schema Validation**
```bash
# Validate component schema
curl -X POST http://localhost:3001/api/components/validate \
  -H "Content-Type: application/json" \
  -d @component-schema.json
```

**Registry Sync**
```bash
# Sync registry to database
curl -X POST http://localhost:3001/api/components/sync
```

### Advanced Schema Features

#### Conditional Properties

```json
{
  "showButton": {
    "type": "boolean",
    "default": false
  },
  "buttonText": {
    "type": "string",
    "description": "Button text (only when showButton is true)",
    "condition": {
      "field": "showButton",
      "value": true
    }
  }
}
```

#### Property Groups

```json
{
  "properties": {
    "content": {
      "type": "object",
      "description": "Content settings",
      "properties": {
        "title": { "type": "string" },
        "description": { "type": "string" }
      }
    },
    "styling": {
      "type": "object",
      "description": "Styling settings",
      "properties": {
        "backgroundColor": { "type": "string", "format": "color" },
        "textColor": { "type": "string", "format": "color" }
      }
    }
  }
}
```

#### Multi-language Support

```json
{
  "title": {
    "type": "object",
    "description": "Multi-language title",
    "properties": {
      "en": { "type": "string", "description": "English title" },
      "fr": { "type": "string", "description": "French title" },
      "default": { "type": "string", "description": "Default title" }
    }
  }
}
```

---

## Quick Reference

### Essential Commands
```bash
# Create new theme from template
cp -r sparti-cms/template/landingpage sparti-cms/theme/new-theme

# Sync themes in development
curl -X POST http://localhost:3001/api/themes/sync

# Test theme directly
open http://localhost:3000/theme/your-theme-slug
```

### File Checklist
- [ ] `index.tsx` (main component)
- [ ] `theme.json` (metadata)
- [ ] `pages.json` (page definitions)
- [ ] `theme.css` (styles)
- [ ] `README.md` (documentation)
- [ ] `components/` (component directory)
- [ ] `assets/` (assets directory)

### Key Paths
- Themes: `sparti-cms/theme/{slug}/`
- Templates: `sparti-cms/template/{slug}/`
- Assets: `/theme/{slug}/assets/`
- Theme CSS: `/theme/{slug}/theme.css` ← Linked to CMS Styles settings
- API: `/api/themes`
- Demo: `/theme/{slug}`

## Theme Settings Database System

### Overview

The theme settings database system allows themes to read configuration from the database at runtime. Settings are stored per tenant+theme combination, enabling each tenant to have customized settings for each theme they use.

### Database Structure

**Table**: `site_settings`

**Key Columns**:
- `setting_key` - Unique identifier for the setting
- `setting_value` - The setting value (text, JSON, etc.)
- `setting_type` - Type of setting (text, json, media, etc.)
- `setting_category` - Category (branding, localization, theme, seo, etc.)
- `tenant_id` - Tenant identifier
- `theme_id` - Theme identifier (nullable for tenant-level settings)
- `is_public` - Whether setting is publicly accessible

**Unique Constraint**: `(setting_key, tenant_id, theme_id)`

This allows the same setting key to exist for different tenant+theme combinations.

### Setting Categories and Keys

#### Branding Category
- `site_name` - Site/business name
- `site_tagline` - Site tagline/slogan
- `site_description` - Site description
- `site_logo` - Logo URL/path
- `site_favicon` - Favicon URL/path

#### Localization Category
- `country` - Country code (e.g., 'SG')
- `timezone` - Timezone code (e.g., 'Asia/Singapore')
- `language` - Default language code

#### Theme Category
- `theme_styles` - JSON object containing:
  - Colors: primary, secondary, background, foreground, etc.
  - Typography: fontSans, fontSerif, fontMono, baseFontSize, etc.

### How Settings Sync Works

1. **Admin Updates Settings**: User updates settings in Admin → Settings → Branding/Styles
2. **Database Storage**: Settings saved to `site_settings` table with `tenant_id` + `theme_id`
3. **Theme Reads Settings**: Theme component uses `useThemeSettings` hook to fetch settings
4. **Runtime Rendering**: Theme renders with database settings, with fallbacks to defaults

### API Endpoints

#### Admin API (Authenticated)

**Get Theme Settings**:
```
GET /api/settings/theme/:themeId?tenantId={tenantId}
```

**Get Branding Settings**:
```
GET /api/settings/theme/:themeId/branding?tenantId={tenantId}
```

**Get Localization Settings**:
```
GET /api/settings/theme/:themeId/localization?tenantId={tenantId}
```

**Get Style Settings**:
```
GET /api/settings/theme/:themeId/styles?tenantId={tenantId}
```

**Update Setting**:
```
PUT /api/settings/theme/:themeId/:key?tenantId={tenantId}
Body: { setting_value, setting_type, setting_category }
```

#### Public API (For Themes)

**Get All Settings**:
```
GET /api/v1/theme/:themeSlug/settings
```

**Get Branding Only**:
```
GET /api/v1/theme/:themeSlug/branding
```

**Get Styles Only**:
```
GET /api/v1/theme/:themeSlug/styles
```

### Theme Integration

#### Using the Hook

```typescript
import { useThemeSettings } from '../../../hooks/useThemeSettings';

const YourTheme: React.FC = () => {
  const { settings, loading, error } = useThemeSettings('your-theme-slug', 'tenant-slug');
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  const siteName = settings?.branding?.site_name || 'Default Name';
  const logo = settings?.branding?.site_logo || '/default-logo.png';
  
  return <div>{siteName}</div>;
};
```

#### Setting Fallbacks

Always provide fallback values when using settings:

```typescript
const siteName = settings?.branding?.site_name || 'Default Site Name';
const tagline = settings?.branding?.site_tagline || 'Default Tagline';
const logo = settings?.branding?.site_logo || '/theme/your-theme/assets/default-logo.png';
```

### Settings Priority

When fetching settings, the system uses this priority:

1. **Theme-specific settings** (`theme_id` = current theme) - Highest priority
2. **Tenant-level settings** (`theme_id` = NULL) - Fallback
3. **Hardcoded defaults** - Final fallback

This allows themes to override tenant defaults when needed.

### Example: ACATR Landingpage Theme

The `landingpage` theme demonstrates full integration:

```typescript
// sparti-cms/theme/landingpage/index.tsx
const { settings } = useThemeSettings('landingpage', tenantSlug);

const siteName = settings?.branding?.site_name || 'ACATR Business Services';
const logoSrc = settings?.branding?.site_logo || '/theme/landingpage/assets/logo.png';

<Header tenantName={siteName} logoSrc={logoSrc} />
```

### Migration Guide

To add database settings support to an existing theme:

1. **Import the hook**:
   ```typescript
   import { useThemeSettings } from '../../../hooks/useThemeSettings';
   ```

2. **Fetch settings in component**:
   ```typescript
   const { settings, loading } = useThemeSettings('your-theme-slug');
   ```

3. **Replace hardcoded values**:
   ```typescript
   // Before
   const siteName = 'Hardcoded Name';
   
   // After
   const siteName = settings?.branding?.site_name || 'Default Name';
   ```

4. **Pass to child components**:
   ```typescript
   <Header 
     tenantName={settings?.branding?.site_name}
     logoSrc={settings?.branding?.site_logo}
   />
   ```

### Related Documentation
- **[THEME-STYLES.md](./THEME-STYLES.md)** - Complete guide to theme styles system
- **[THEME-SETTINGS-DB.md](./THEME-SETTINGS-DB.md)** - Complete database schema and API documentation
- **[Template README](../template/landingpage/README.md)** - Template structure and usage

This documentation should be updated as the theme system evolves. Always refer to the latest version for accurate information.
