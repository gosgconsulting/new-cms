-- Ensure provider column and unique constraint for google_search_results
DO $$ BEGIN
  ALTER TABLE public.google_search_results
  ADD COLUMN IF NOT EXISTS provider text CHECK (provider IN ('lobstr','apify')) DEFAULT 'lobstr';
EXCEPTION WHEN others THEN NULL; END $$;

-- Add composite uniqueness to prevent duplicates per provider
DO $$ BEGIN
  ALTER TABLE public.google_search_results
  ADD CONSTRAINT google_search_results_unique UNIQUE (user_id, url, search_keyword, provider);
EXCEPTION WHEN others THEN NULL; END $$;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_gsr_provider_scraped_at ON public.google_search_results(provider, scraped_at DESC);
CREATE INDEX IF NOT EXISTS idx_gsr_user_session ON public.google_search_results(user_id, search_session_id);




