-- Add campaign_id column to blog_posts table to link articles to campaigns
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS campaign_id uuid REFERENCES seo_campaigns(id) ON DELETE SET NULL;

-- Create index for faster campaign-based queries
CREATE INDEX IF NOT EXISTS idx_blog_posts_campaign_id ON blog_posts(campaign_id);

-- Create index for filtering drafts by campaign
CREATE INDEX IF NOT EXISTS idx_blog_posts_campaign_status ON blog_posts(campaign_id, status);

-- Backfill existing articles - link to campaign via topic_id where available
UPDATE blog_posts bp
SET campaign_id = st.campaign_id
FROM selected_topics st
WHERE bp.topic_id = st.id
AND bp.campaign_id IS NULL
AND st.campaign_id IS NOT NULL;