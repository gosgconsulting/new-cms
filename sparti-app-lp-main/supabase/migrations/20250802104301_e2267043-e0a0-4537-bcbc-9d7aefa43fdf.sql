-- Fix Google Search Results table - add unique constraint and improve structure

-- Add unique constraint for proper deduplication
ALTER TABLE public.google_search_results 
ADD CONSTRAINT google_search_results_unique_result 
UNIQUE (user_id, url, search_keyword);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_google_search_results_lobstr_run_id 
ON public.google_search_results(lobstr_run_id);

CREATE INDEX IF NOT EXISTS idx_google_search_results_user_session 
ON public.google_search_results(user_id, search_session_id);

CREATE INDEX IF NOT EXISTS idx_google_search_results_scraped_at 
ON public.google_search_results(scraped_at DESC);