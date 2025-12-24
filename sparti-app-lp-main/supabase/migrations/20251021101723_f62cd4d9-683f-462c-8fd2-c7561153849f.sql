-- Add link_type and language fields to seo_internal_links
ALTER TABLE seo_internal_links 
ADD COLUMN IF NOT EXISTS link_type TEXT CHECK (link_type IN ('page', 'post', 'shop', 'product')) DEFAULT 'page',
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en';