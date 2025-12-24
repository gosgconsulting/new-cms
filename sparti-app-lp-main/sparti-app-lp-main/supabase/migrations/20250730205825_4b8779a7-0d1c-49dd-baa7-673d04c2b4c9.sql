-- Add campaign_creation_date column to blog_posts table
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS campaign_creation_date TIMESTAMP WITH TIME ZONE;

-- For existing blog_posts, set campaign_creation_date to today's date grouped by brand
-- This will effectively group all existing blog posts per brand into single campaigns
UPDATE blog_posts 
SET campaign_creation_date = CURRENT_DATE
WHERE campaign_creation_date IS NULL;

-- Create an index for better performance when querying by campaign_creation_date
CREATE INDEX IF NOT EXISTS idx_blog_posts_campaign_creation_date 
ON blog_posts(campaign_creation_date);

-- Create an index for compound queries (brand + campaign_creation_date)
CREATE INDEX IF NOT EXISTS idx_blog_posts_brand_campaign_date 
ON blog_posts(brand_id, campaign_creation_date);