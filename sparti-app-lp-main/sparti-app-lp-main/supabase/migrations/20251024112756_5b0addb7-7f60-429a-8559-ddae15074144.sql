-- Add missing fields for topic brief modal to selected_topics table

-- Add difficulty column (0-10 scale)
ALTER TABLE public.selected_topics 
ADD COLUMN IF NOT EXISTS difficulty INTEGER DEFAULT 5 CHECK (difficulty >= 0 AND difficulty <= 10);

-- Add opportunity_score column (0-10 scale)
ALTER TABLE public.selected_topics 
ADD COLUMN IF NOT EXISTS opportunity_score INTEGER DEFAULT 0 CHECK (opportunity_score >= 0 AND opportunity_score <= 10);

-- Add target_word_count column (can be different from estimated_word_count)
ALTER TABLE public.selected_topics 
ADD COLUMN IF NOT EXISTS target_word_count INTEGER;

-- Add primary_keyword column (explicit primary keyword)
ALTER TABLE public.selected_topics 
ADD COLUMN IF NOT EXISTS primary_keyword TEXT;

-- Add secondary_keywords column (array of secondary keywords)
ALTER TABLE public.selected_topics 
ADD COLUMN IF NOT EXISTS secondary_keywords TEXT[];

-- Add matched_backlinks column (JSONB array of matched backlink objects)
ALTER TABLE public.selected_topics 
ADD COLUMN IF NOT EXISTS matched_backlinks JSONB DEFAULT '[]'::jsonb;

-- Add matched_sources column (JSONB array of matched source objects)
ALTER TABLE public.selected_topics 
ADD COLUMN IF NOT EXISTS matched_sources JSONB DEFAULT '[]'::jsonb;

-- Add comments to document the new columns
COMMENT ON COLUMN public.selected_topics.difficulty IS 'SEO difficulty score from 0-10';
COMMENT ON COLUMN public.selected_topics.opportunity_score IS 'Content opportunity score from 0-10';
COMMENT ON COLUMN public.selected_topics.target_word_count IS 'Target word count for the article (recommended by AI)';
COMMENT ON COLUMN public.selected_topics.primary_keyword IS 'Primary keyword for this topic';
COMMENT ON COLUMN public.selected_topics.secondary_keywords IS 'Secondary keywords for this topic';
COMMENT ON COLUMN public.selected_topics.matched_backlinks IS 'Array of matched backlinks with url, title, keyword, and type';
COMMENT ON COLUMN public.selected_topics.matched_sources IS 'Array of matched sources with url, title, insights, and citations';