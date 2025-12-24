-- Add campaign_id column to selected_topics table
ALTER TABLE selected_topics
ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES seo_campaigns(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_selected_topics_campaign_id ON selected_topics(campaign_id);

-- Add comment to explain the column
COMMENT ON COLUMN selected_topics.campaign_id IS 'Links topics to the SEO campaign that generated them';