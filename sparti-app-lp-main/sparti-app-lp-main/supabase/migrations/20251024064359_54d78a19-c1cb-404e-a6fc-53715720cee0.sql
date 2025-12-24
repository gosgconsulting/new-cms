-- Add internal_links column to selected_topics table to store suggested internal links
ALTER TABLE selected_topics
ADD COLUMN IF NOT EXISTS internal_links JSONB DEFAULT '[]'::jsonb;

-- Add comment to explain the column
COMMENT ON COLUMN selected_topics.internal_links IS 'Array of suggested internal backlinks for this topic, each with url and anchor text';