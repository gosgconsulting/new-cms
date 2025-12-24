-- Fix blog_posts.campaign_id foreign key and add article_id to selected_topics
-- Step 1: Clean up orphaned campaign_id references

-- First, set campaign_id to NULL where it doesn't exist in seo_campaigns
UPDATE blog_posts
SET campaign_id = NULL
WHERE campaign_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM seo_campaigns WHERE id = blog_posts.campaign_id
  );

-- Step 2: Drop existing constraint if it exists and add correct one
DO $$ 
BEGIN
  -- Drop existing constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'blog_posts_campaign_id_fkey' 
    AND table_name = 'blog_posts'
  ) THEN
    ALTER TABLE blog_posts DROP CONSTRAINT blog_posts_campaign_id_fkey;
  END IF;
  
  -- Add the correct foreign key constraint
  ALTER TABLE blog_posts
  ADD CONSTRAINT blog_posts_campaign_id_fkey 
  FOREIGN KEY (campaign_id) 
  REFERENCES seo_campaigns(id) 
  ON DELETE SET NULL;
END $$;

-- Step 3: Add article_id column to selected_topics
ALTER TABLE selected_topics 
ADD COLUMN IF NOT EXISTS article_id UUID REFERENCES blog_posts(id) ON DELETE SET NULL;

-- Step 4: Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_selected_topics_article_id ON selected_topics(article_id);

-- Step 5: Add comment for documentation
COMMENT ON COLUMN selected_topics.article_id IS 'References the blog post created from this topic';