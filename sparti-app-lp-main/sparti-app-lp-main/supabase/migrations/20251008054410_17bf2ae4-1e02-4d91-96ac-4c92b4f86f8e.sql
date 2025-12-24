-- Add keywords and country columns to seo_internal_links table
ALTER TABLE seo_internal_links 
ADD COLUMN IF NOT EXISTS keywords text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS country text;