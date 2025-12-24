-- First, check and drop the incorrect foreign key constraint if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'fk_blog_posts_campaign_id_campaigns'
    ) THEN
        ALTER TABLE blog_posts DROP CONSTRAINT fk_blog_posts_campaign_id_campaigns;
    END IF;
END $$;

-- Add the correct foreign key constraint pointing to seo_campaigns
ALTER TABLE blog_posts
ADD CONSTRAINT fk_blog_posts_campaign_id_seo_campaigns 
FOREIGN KEY (campaign_id) REFERENCES seo_campaigns(id) ON DELETE SET NULL;

-- Now migrate existing blog_posts to populate campaign_id from seo_campaign_id
UPDATE blog_posts
SET campaign_id = seo_campaign_id
WHERE campaign_id IS NULL 
  AND seo_campaign_id IS NOT NULL;