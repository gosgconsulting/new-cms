# Enhanced Media Database System

## Overview

The enhanced media database system provides comprehensive media management with folders, SEO optimization, usage tracking, and metadata support. This system replaces the basic media table with a robust, production-ready solution.

## Database Tables

### 1. media_folders
Organizes media files into hierarchical folders with SEO-friendly slugs.

```sql
CREATE TABLE media_folders (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  parent_folder_id INTEGER REFERENCES media_folders(id) ON DELETE CASCADE,
  folder_path VARCHAR(500) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Key Features:**
- Hierarchical folder structure with parent-child relationships
- SEO-friendly slugs for folder URLs
- Soft delete with `is_active` flag
- Automatic timestamp management

### 2. media (Enhanced)
Comprehensive media storage with SEO metadata and usage tracking.

```sql
CREATE TABLE media (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  alt_text VARCHAR(500),
  title VARCHAR(255),
  description TEXT,
  url VARCHAR(500) NOT NULL,
  relative_path VARCHAR(500) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_extension VARCHAR(10) NOT NULL,
  file_size INTEGER NOT NULL,
  width INTEGER,
  height INTEGER,
  duration INTEGER,
  folder_id INTEGER REFERENCES media_folders(id) ON DELETE SET NULL,
  media_type VARCHAR(20) NOT NULL CHECK (media_type IN ('image', 'video', 'audio', 'document', 'other')),
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  seo_optimized BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Key Features:**
- **SEO Optimization**: Alt text, title, description, and SEO-friendly slugs
- **Metadata Storage**: JSONB field for flexible metadata (EXIF, custom fields)
- **Usage Tracking**: Automatic usage count and last used timestamp
- **Media Classification**: Type constraints and featured flag
- **File Information**: Dimensions, duration, file size, and paths
- **Soft Delete**: `is_active` flag for safe deletion

### 3. media_usage
Tracks where and how media files are used across the system.

```sql
CREATE TABLE media_usage (
  id SERIAL PRIMARY KEY,
  media_id INTEGER NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  usage_type VARCHAR(50) NOT NULL,
  usage_id VARCHAR(100) NOT NULL,
  usage_context VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Key Features:**
- Track usage across pages, components, blog posts, etc.
- Context-aware usage tracking (hero image, gallery, etc.)
- Automatic cleanup when media is deleted

## Database Functions

### 1. generate_media_slug(original_filename)
Automatically generates unique, SEO-friendly slugs for media files.

```sql
SELECT generate_media_slug('My Amazing Photo.jpg');
-- Returns: 'my-amazing-photo'
```

### 2. update_updated_at_column()
Trigger function that automatically updates the `updated_at` timestamp.

### 3. update_media_usage_count()
Trigger function that maintains usage count and last used timestamp.

## Database Views

### 1. media_with_folders
Combines media items with their folder information.

```sql
SELECT * FROM media_with_folders WHERE folder_slug = 'logos';
```

### 2. folder_statistics
Provides comprehensive statistics for each folder.

```sql
SELECT 
  name,
  media_count,
  total_size,
  image_count,
  document_count
FROM folder_statistics;
```

## API Functions

### Media Folders

#### createMediaFolder(folderData)
```javascript
const folder = await createMediaFolder({
  name: 'Client Logos',
  slug: 'client-logos',
  description: 'Logos from our clients',
  folder_path: 'logos/clients'
});
```

#### getMediaFolders()
```javascript
const folders = await getMediaFolders();
// Returns folders with statistics
```

#### updateMediaFolder(folderId, folderData)
```javascript
await updateMediaFolder(1, {
  name: 'Updated Folder Name',
  description: 'New description'
});
```

#### deleteMediaFolder(folderId)
```javascript
await deleteMediaFolder(1);
// Moves all media to uncategorized before deletion
```

### Media Items

#### createMediaItem(mediaData)
```javascript
const media = await createMediaItem({
  filename: 'hero-image.jpg',
  original_filename: 'Amazing Hero Image.jpg',
  alt_text: 'Beautiful hero image for homepage',
  title: 'Homepage Hero Image',
  description: 'Professional hero image showcasing our services',
  url: '/src/assets/images/hero-image.jpg',
  relative_path: 'images/hero-image.jpg',
  mime_type: 'image/jpeg',
  file_extension: 'jpg',
  file_size: 245760,
  width: 1920,
  height: 1080,
  folder_id: 1,
  media_type: 'image',
  is_featured: true,
  seo_optimized: true,
  metadata: {
    camera: 'Canon EOS R5',
    iso: 100,
    aperture: 'f/2.8'
  }
});
```

#### getMediaItems(limit, offset, filters)
```javascript
// Get all media
const allMedia = await getMediaItems(50, 0);

// Get images only
const images = await getMediaItems(50, 0, { media_type: 'image' });

// Get featured media
const featured = await getMediaItems(50, 0, { is_featured: true });

// Get media from specific folder
const folderMedia = await getMediaItems(50, 0, { folder_id: 1 });

// Search media
const searchResults = await getMediaItems(50, 0, { search: 'logo' });
```

#### getMediaItemBySlug(slug)
```javascript
const media = await getMediaItemBySlug('my-amazing-photo');
```

#### updateMediaItem(mediaId, mediaData)
```javascript
await updateMediaItem(1, {
  alt_text: 'Updated alt text for better SEO',
  seo_optimized: true,
  is_featured: true
});
```

#### deleteMediaItem(mediaId)
```javascript
await deleteMediaItem(1); // Soft delete
await hardDeleteMediaItem(1); // Permanent delete
```

### Usage Tracking

#### trackMediaUsage(mediaId, usageType, usageId, usageContext)
```javascript
// Track usage in a page
await trackMediaUsage(1, 'page', 'homepage', 'hero_image');

// Track usage in a component
await trackMediaUsage(1, 'component', 'hero-section', 'background');

// Track usage in a blog post
await trackMediaUsage(1, 'blog_post', 'seo-tips-2024', 'featured_image');
```

#### removeMediaUsage(mediaId, usageType, usageId)
```javascript
await removeMediaUsage(1, 'page', 'homepage');
```

#### getMediaUsage(mediaId)
```javascript
const usage = await getMediaUsage(1);
// Returns array of usage records
```

## Default Folders

The system creates these default folders:

1. **Logos** (`logos`) - Company and client logos
2. **Results** (`results`) - SEO results and case study images
3. **SEO** (`seo`) - SEO-related images and graphics
4. **Team** (`team`) - Team member photos and bios
5. **Blog** (`blog`) - Blog post images and media
6. **General** (`general`) - General purpose media files

## Best Practices

### SEO Optimization
1. **Always provide alt text** for images
2. **Use descriptive filenames** and titles
3. **Optimize file sizes** before upload
4. **Use appropriate media types** for better organization
5. **Set seo_optimized flag** when media is properly optimized

### File Organization
1. **Use folders** to organize media logically
2. **Follow consistent naming conventions**
3. **Keep folder structures shallow** for better performance
4. **Use descriptive folder names and descriptions**

### Metadata Usage
1. **Store EXIF data** for images in metadata field
2. **Track custom properties** like copyright, source, etc.
3. **Use metadata for search** and filtering capabilities

### Usage Tracking
1. **Track all media usage** for better management
2. **Use specific contexts** for detailed tracking
3. **Clean up unused media** regularly based on usage data

## Migration from Basic Media Table

If you have an existing basic media table, you can migrate data:

```sql
-- Backup existing data
CREATE TABLE media_backup AS SELECT * FROM media;

-- Drop old table (after backup)
DROP TABLE media;

-- Run the enhanced media migrations
-- Then migrate data with appropriate transformations
```

## Performance Considerations

1. **Indexes** are created on frequently queried fields
2. **Views** provide optimized queries for common operations
3. **JSONB metadata** allows flexible storage with good performance
4. **Soft deletes** prevent data loss while maintaining referential integrity
5. **Usage tracking** helps identify unused media for cleanup

## Security Considerations

1. **File path validation** prevents directory traversal
2. **MIME type validation** ensures file type safety
3. **Size limits** prevent storage abuse
4. **Access control** should be implemented at application level
5. **Media URLs** should be properly secured

## Testing

Run the test script to verify functionality:

```bash
node test-media-database.js
```

The test covers:
- Database initialization
- Folder creation and management
- Media item CRUD operations
- Usage tracking
- Constraint validation
- View functionality

## Troubleshooting

### Common Issues

1. **Slug conflicts**: The system automatically generates unique slugs
2. **Foreign key constraints**: Ensure folders exist before assigning media
3. **Media type validation**: Use only allowed media types
4. **File size limits**: Check PostgreSQL and application limits
5. **JSONB formatting**: Ensure metadata is valid JSON

### Debug Queries

```sql
-- Check folder statistics
SELECT * FROM folder_statistics;

-- Find unused media
SELECT * FROM media WHERE usage_count = 0;

-- Check media without folders
SELECT * FROM media WHERE folder_id IS NULL;

-- View recent usage
SELECT * FROM media_usage ORDER BY created_at DESC LIMIT 10;
```
