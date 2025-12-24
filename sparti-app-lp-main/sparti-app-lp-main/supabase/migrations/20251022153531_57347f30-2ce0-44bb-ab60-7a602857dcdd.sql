-- Extend suggested_topics table with missing columns for rich topic data
ALTER TABLE public.suggested_topics
  ADD COLUMN IF NOT EXISTS outline TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS word_count INTEGER DEFAULT 2000,
  ADD COLUMN IF NOT EXISTS internal_links JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS sources JSONB DEFAULT '[]';

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_suggested_topics_research_id 
  ON public.suggested_topics(research_id);

-- Add comments for documentation
COMMENT ON COLUMN public.suggested_topics.outline IS 'Array of H2 section titles for the article outline';
COMMENT ON COLUMN public.suggested_topics.word_count IS 'Recommended word count for the article (1500-3000)';
COMMENT ON COLUMN public.suggested_topics.internal_links IS 'Array of relevant internal links {url, title, relevance}';
COMMENT ON COLUMN public.suggested_topics.sources IS 'Array of web sources used for research {url, title, content}';