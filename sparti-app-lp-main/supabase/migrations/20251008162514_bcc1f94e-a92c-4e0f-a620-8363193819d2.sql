-- Add backlink column to selected_topics table
ALTER TABLE selected_topics 
ADD COLUMN IF NOT EXISTS backlink text;