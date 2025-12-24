-- Add missing columns to selected_topics table
ALTER TABLE public.selected_topics 
ADD COLUMN IF NOT EXISTS search_term TEXT,
ADD COLUMN IF NOT EXISTS estimated_word_count INTEGER,
ADD COLUMN IF NOT EXISTS content_angle TEXT,
ADD COLUMN IF NOT EXISTS outline TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS search_intent TEXT;

-- Update keyword_focus column to be JSONB if it exists as TEXT
-- First, handle existing data by converting TEXT to JSONB array
DO $$
BEGIN
  -- Check if keyword_focus exists and is TEXT type
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'selected_topics' 
    AND column_name = 'keyword_focus' 
    AND data_type = 'text'
  ) THEN
    -- Convert existing TEXT data to JSONB arrays
    UPDATE public.selected_topics 
    SET keyword_focus = 
      CASE 
        WHEN keyword_focus IS NULL THEN '[]'::jsonb
        WHEN keyword_focus LIKE '[%]' THEN keyword_focus::jsonb
        ELSE jsonb_build_array(keyword_focus::text)
      END::text
    WHERE keyword_focus IS NOT NULL;
    
    -- Change column type to JSONB
    ALTER TABLE public.selected_topics 
    ALTER COLUMN keyword_focus TYPE JSONB USING 
      CASE 
        WHEN keyword_focus IS NULL THEN '[]'::jsonb
        WHEN keyword_focus LIKE '[%]' THEN keyword_focus::jsonb
        ELSE jsonb_build_array(keyword_focus::text)
      END;
    
    -- Set default value
    ALTER TABLE public.selected_topics 
    ALTER COLUMN keyword_focus SET DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Add column comments for documentation
COMMENT ON COLUMN public.selected_topics.search_term IS 'The original search term that generated this topic';
COMMENT ON COLUMN public.selected_topics.estimated_word_count IS 'Target word count for the article';
COMMENT ON COLUMN public.selected_topics.content_angle IS 'The content angle or approach for this topic';
COMMENT ON COLUMN public.selected_topics.outline IS 'Article outline as array of section titles';
COMMENT ON COLUMN public.selected_topics.search_intent IS 'The search intent type (informational, navigational, commercial, transactional)';
COMMENT ON COLUMN public.selected_topics.keyword_focus IS 'Array of 1-3 focused keywords in JSONB format';