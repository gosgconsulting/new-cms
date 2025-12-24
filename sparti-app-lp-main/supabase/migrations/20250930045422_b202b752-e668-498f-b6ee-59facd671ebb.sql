-- Update keyword_focus to support multiple keywords (2-3) as an array
-- First, convert existing text values to jsonb arrays
UPDATE suggested_topics 
SET keyword_focus = jsonb_build_array(keyword_focus)
WHERE keyword_focus IS NOT NULL 
  AND keyword_focus != '';

-- Change column type to jsonb to store array of keywords
ALTER TABLE suggested_topics 
ALTER COLUMN keyword_focus TYPE jsonb USING 
  CASE 
    WHEN keyword_focus IS NULL THEN NULL
    WHEN jsonb_typeof(keyword_focus::jsonb) = 'array' THEN keyword_focus::jsonb
    ELSE jsonb_build_array(keyword_focus)
  END;

-- Add a check constraint to ensure it's an array with 1-3 keywords
ALTER TABLE suggested_topics 
ADD CONSTRAINT keyword_focus_length_check 
CHECK (
  keyword_focus IS NULL OR 
  (jsonb_typeof(keyword_focus) = 'array' AND 
   jsonb_array_length(keyword_focus) BETWEEN 1 AND 3)
);

-- Also update selected_topics table to match
UPDATE selected_topics 
SET keyword_focus = jsonb_build_array(keyword_focus)
WHERE keyword_focus IS NOT NULL 
  AND keyword_focus != '';

ALTER TABLE selected_topics 
ALTER COLUMN keyword_focus TYPE jsonb USING 
  CASE 
    WHEN keyword_focus IS NULL THEN NULL
    WHEN jsonb_typeof(keyword_focus::jsonb) = 'array' THEN keyword_focus::jsonb
    ELSE jsonb_build_array(keyword_focus)
  END;

ALTER TABLE selected_topics 
ADD CONSTRAINT keyword_focus_length_check 
CHECK (
  keyword_focus IS NULL OR 
  (jsonb_typeof(keyword_focus) = 'array' AND 
   jsonb_array_length(keyword_focus) BETWEEN 1 AND 3)
);