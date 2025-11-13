-- Enhanced Media Management Database Migration Script
-- Creates comprehensive media tables with folders, metadata, and SEO features
-- Run this script on your PostgreSQL database after the main migrations

-- Drop existing media table if we need to restructure (optional - for clean setup)
-- DROP TABLE IF EXISTS media CASCADE;

-- Create media_folders table for organizing media files
CREATE TABLE IF NOT EXISTS media_folders (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  parent_folder_id INTEGER REFERENCES media_folders(id) ON DELETE CASCADE,
  folder_path VARCHAR(500) NOT NULL, -- Full path for nested folders (e.g., 'logos/clients/2024')
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create enhanced media table with comprehensive metadata
CREATE TABLE IF NOT EXISTS media (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL, -- Store original upload name
  slug VARCHAR(255) NOT NULL UNIQUE, -- SEO-friendly identifier
  alt_text VARCHAR(500), -- Alt text for accessibility and SEO
  title VARCHAR(255), -- Optional title for the media
  description TEXT, -- Detailed description
  url VARCHAR(500) NOT NULL, -- Full URL to access the file
  relative_path VARCHAR(500) NOT NULL, -- Relative path from assets root
  mime_type VARCHAR(100) NOT NULL,
  file_extension VARCHAR(10) NOT NULL,
  file_size INTEGER NOT NULL, -- Size in bytes
  width INTEGER, -- Image width (null for non-images)
  height INTEGER, -- Image height (null for non-images)
  duration INTEGER, -- Duration in seconds (for video/audio)
  folder_id INTEGER REFERENCES media_folders(id) ON DELETE SET NULL,
  media_type VARCHAR(20) NOT NULL CHECK (media_type IN ('image', 'video', 'audio', 'document', 'other')),
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false, -- Mark important media
  seo_optimized BOOLEAN DEFAULT false, -- Track if SEO optimized
  usage_count INTEGER DEFAULT 0, -- Track how many times used
  last_used_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB, -- Additional metadata (EXIF, custom fields, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create media_usage table to track where media is used
CREATE TABLE IF NOT EXISTS media_usage (
  id SERIAL PRIMARY KEY,
  media_id INTEGER NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  usage_type VARCHAR(50) NOT NULL, -- 'page', 'component', 'blog_post', etc.
  usage_id VARCHAR(100) NOT NULL, -- ID of the entity using the media
  usage_context VARCHAR(100), -- Additional context (e.g., 'hero_image', 'gallery')
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_media_folders_slug ON media_folders(slug);
CREATE INDEX IF NOT EXISTS idx_media_folders_parent ON media_folders(parent_folder_id);
CREATE INDEX IF NOT EXISTS idx_media_folders_path ON media_folders(folder_path);
CREATE INDEX IF NOT EXISTS idx_media_folders_active ON media_folders(is_active);

CREATE INDEX IF NOT EXISTS idx_media_slug ON media(slug);
CREATE INDEX IF NOT EXISTS idx_media_filename ON media(filename);
CREATE INDEX IF NOT EXISTS idx_media_folder ON media(folder_id);
CREATE INDEX IF NOT EXISTS idx_media_type ON media(media_type);
CREATE INDEX IF NOT EXISTS idx_media_mime_type ON media(mime_type);
CREATE INDEX IF NOT EXISTS idx_media_active ON media(is_active);
CREATE INDEX IF NOT EXISTS idx_media_featured ON media(is_featured);
CREATE INDEX IF NOT EXISTS idx_media_created ON media(created_at);
CREATE INDEX IF NOT EXISTS idx_media_usage_count ON media(usage_count);

CREATE INDEX IF NOT EXISTS idx_media_usage_media_id ON media_usage(media_id);
CREATE INDEX IF NOT EXISTS idx_media_usage_type ON media_usage(usage_type);
CREATE INDEX IF NOT EXISTS idx_media_usage_context ON media_usage(usage_type, usage_id);

-- Create triggers to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_media_folders_updated_at 
  BEFORE UPDATE ON media_folders 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_updated_at 
  BEFORE UPDATE ON media 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default media folders
INSERT INTO media_folders (name, slug, description, folder_path) VALUES
('Logos', 'logos', 'Company and client logos', 'logos'),
('Results', 'results', 'SEO results and case study images', 'results'),
('SEO', 'seo', 'SEO-related images and graphics', 'seo'),
('Team', 'team', 'Team member photos and bios', 'team'),
('Blog', 'blog', 'Blog post images and media', 'blog'),
('General', 'general', 'General purpose media files', 'general')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  folder_path = EXCLUDED.folder_path,
  updated_at = NOW();

-- Create a function to generate unique slugs for media
CREATE OR REPLACE FUNCTION generate_media_slug(original_filename TEXT)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 1;
BEGIN
    -- Remove file extension and create base slug
    base_slug := lower(regexp_replace(
        regexp_replace(original_filename, '\.[^.]*$', ''), -- Remove extension
        '[^a-zA-Z0-9]+', '-', 'g' -- Replace non-alphanumeric with hyphens
    ));
    
    -- Remove leading/trailing hyphens
    base_slug := trim(both '-' from base_slug);
    
    final_slug := base_slug;
    
    -- Check if slug exists and increment counter if needed
    WHILE EXISTS (SELECT 1 FROM media WHERE slug = final_slug) LOOP
        final_slug := base_slug || '-' || counter;
        counter := counter + 1;
    END LOOP;
    
    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Create a function to update usage count when media is used
CREATE OR REPLACE FUNCTION update_media_usage_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE media 
        SET usage_count = usage_count + 1, last_used_at = NOW()
        WHERE id = NEW.media_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE media 
        SET usage_count = GREATEST(usage_count - 1, 0)
        WHERE id = OLD.media_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_media_usage_count_trigger
  AFTER INSERT OR DELETE ON media_usage
  FOR EACH ROW EXECUTE FUNCTION update_media_usage_count();

-- Create view for media with folder information
CREATE OR REPLACE VIEW media_with_folders AS
SELECT 
  m.*,
  f.name as folder_name,
  f.slug as folder_slug,
  f.folder_path,
  CASE 
    WHEN m.folder_id IS NULL THEN 'uncategorized'
    ELSE f.folder_path
  END as full_folder_path
FROM media m
LEFT JOIN media_folders f ON m.folder_id = f.id
WHERE m.is_active = true;

-- Create view for folder statistics
CREATE OR REPLACE VIEW folder_statistics AS
SELECT 
  f.id,
  f.name,
  f.slug,
  f.folder_path,
  COUNT(m.id) as media_count,
  COALESCE(SUM(m.file_size), 0) as total_size,
  COUNT(CASE WHEN m.media_type = 'image' THEN 1 END) as image_count,
  COUNT(CASE WHEN m.media_type = 'video' THEN 1 END) as video_count,
  COUNT(CASE WHEN m.media_type = 'audio' THEN 1 END) as audio_count,
  COUNT(CASE WHEN m.media_type = 'document' THEN 1 END) as document_count,
  COUNT(CASE WHEN m.media_type = 'other' THEN 1 END) as other_count,
  f.created_at,
  f.updated_at
FROM media_folders f
LEFT JOIN media m ON f.id = m.folder_id AND m.is_active = true
WHERE f.is_active = true
GROUP BY f.id, f.name, f.slug, f.folder_path, f.created_at, f.updated_at
ORDER BY f.folder_path;
