-- Migration: Clean up blog_posts topic_id references
-- Since blog_posts.topic_id references seo_topic_ideas but our articles come from selected_topics,
-- we need to move the topic_id data to wordpress_settings and clear the foreign key column

-- Update existing articles to preserve topic_id in wordpress_settings, then clear topic_id
UPDATE blog_posts
SET 
  wordpress_settings = 
    CASE 
      WHEN wordpress_settings IS NULL THEN 
        jsonb_build_object('selected_topic_id', topic_id::text)
      ELSE 
        wordpress_settings || jsonb_build_object('selected_topic_id', topic_id::text)
    END,
  topic_id = NULL
WHERE topic_id IS NOT NULL;

-- Add comment explaining the structure
COMMENT ON COLUMN blog_posts.topic_id IS 'References seo_topic_ideas only. For selected_topics references, use wordpress_settings.selected_topic_id instead.';