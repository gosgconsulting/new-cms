-- Create table for Google Search results
CREATE TABLE public.google_search_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  search_session_id TEXT,
  lobstr_run_id UUID,
  
  -- Search context
  search_query TEXT NOT NULL,
  search_keywords TEXT[],
  search_url TEXT,
  
  -- Result data from Google Search
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  domain TEXT,
  
  -- SERP position and metadata
  position INTEGER,
  page_number INTEGER DEFAULT 1,
  result_type TEXT DEFAULT 'organic', -- organic, featured_snippet, ad, etc.
  
  -- Additional metadata
  favicon_url TEXT,
  published_date TIMESTAMP WITH TIME ZONE,
  author TEXT,
  
  -- Snippet and featured content
  snippet TEXT,
  featured_snippet JSONB,
  related_questions TEXT[],
  
  -- SEO metadata
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT[],
  
  -- Analysis data
  lead_score NUMERIC DEFAULT 0,
  relevance_score NUMERIC DEFAULT 0,
  ai_analysis JSONB,
  
  -- Processing status
  processing_status TEXT DEFAULT 'completed',
  scraped_sequence INTEGER DEFAULT 0,
  
  -- Timestamps
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.google_search_results ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own search results" 
ON public.google_search_results 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own search results" 
ON public.google_search_results 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own search results" 
ON public.google_search_results 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own search results" 
ON public.google_search_results 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_google_search_results_user_id ON public.google_search_results(user_id);
CREATE INDEX idx_google_search_results_session_id ON public.google_search_results(search_session_id);
CREATE INDEX idx_google_search_results_lobstr_run_id ON public.google_search_results(lobstr_run_id);
CREATE INDEX idx_google_search_results_query ON public.google_search_results(search_query);
CREATE INDEX idx_google_search_results_created_at ON public.google_search_results(created_at);

-- Create trigger for updated_at
CREATE TRIGGER update_google_search_results_updated_at
BEFORE UPDATE ON public.google_search_results
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();