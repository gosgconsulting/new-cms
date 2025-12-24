-- Create google_search_results table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.google_search_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lobstr_run_id UUID REFERENCES public.lobstr_runs(run_id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  displayed_url TEXT,
  domain TEXT,
  position INTEGER,
  result_type TEXT DEFAULT 'organic',
  snippet TEXT,
  snippet_segments JSONB,
  emphasized_keywords TEXT,
  answer TEXT,
  question TEXT,
  date_published TEXT,
  is_organic BOOLEAN DEFAULT true,
  is_paid BOOLEAN DEFAULT false,
  is_question_answer BOOLEAN,
  is_related_query BOOLEAN,
  total_results TEXT,
  search_keyword TEXT,
  lead_score NUMERIC DEFAULT 50,
  relevance_score NUMERIC DEFAULT 50,
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_google_search_results_user_id ON public.google_search_results(user_id);
CREATE INDEX IF NOT EXISTS idx_google_search_results_lobstr_run_id ON public.google_search_results(lobstr_run_id);
CREATE INDEX IF NOT EXISTS idx_google_search_results_position ON public.google_search_results(position);
CREATE INDEX IF NOT EXISTS idx_google_search_results_search_keyword ON public.google_search_results(search_keyword);

-- Add trigger for updated_at
CREATE TRIGGER update_google_search_results_updated_at
  BEFORE UPDATE ON public.google_search_results
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();