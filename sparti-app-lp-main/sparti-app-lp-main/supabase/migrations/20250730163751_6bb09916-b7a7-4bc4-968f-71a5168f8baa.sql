-- Drop the existing google_search_results table and recreate with proper structure
DROP TABLE IF EXISTS public.google_search_results CASCADE;

-- Create the google_search_results table with correct columns for Google Search API data
CREATE TABLE public.google_search_results (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  search_session_id text,
  lobstr_run_id uuid,
  search_keyword text NOT NULL,
  
  -- Core search result fields
  title text NOT NULL,
  description text,
  url text NOT NULL,
  displayed_url text,
  domain text,
  position integer,
  page_number integer DEFAULT 1,
  result_type text DEFAULT 'organic',
  
  -- Google Search specific fields
  snippet text,
  snippet_segments jsonb,
  emphasized_keywords text,
  answer text,
  question text,
  date_published timestamp with time zone,
  
  -- Result classification
  is_organic boolean DEFAULT true,
  is_paid boolean DEFAULT false,
  is_question_answer boolean DEFAULT false,
  is_related_query boolean DEFAULT false,
  
  -- Search metadata
  total_results text DEFAULT '0',
  
  -- Processing and timestamps
  processing_status text DEFAULT 'completed',
  scraped_sequence integer DEFAULT 0,
  scraped_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.google_search_results ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can create their own Google search results"
  ON public.google_search_results
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own Google search results"
  ON public.google_search_results
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own Google search results"
  ON public.google_search_results
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Google search results"
  ON public.google_search_results
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_google_search_results_user_id ON public.google_search_results(user_id);
CREATE INDEX idx_google_search_results_lobstr_run_id ON public.google_search_results(lobstr_run_id);
CREATE INDEX idx_google_search_results_domain ON public.google_search_results(domain);
CREATE INDEX idx_google_search_results_position ON public.google_search_results(position);

-- Create trigger for updated_at
CREATE TRIGGER update_google_search_results_updated_at
  BEFORE UPDATE ON public.google_search_results
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();