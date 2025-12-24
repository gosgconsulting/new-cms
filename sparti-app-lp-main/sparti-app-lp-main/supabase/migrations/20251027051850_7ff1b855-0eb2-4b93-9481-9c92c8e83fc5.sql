-- Create competitor_audits table
CREATE TABLE IF NOT EXISTS public.competitor_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  website_url TEXT NOT NULL,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'failed')),
  
  -- Step 1: Website Analysis
  website_analysis JSONB,
  custom_instructions TEXT,
  
  -- Step 2: Keywords
  keywords TEXT[],
  keyword_clusters JSONB,
  selected_cluster JSONB,
  
  -- Step 3: Search Terms (2-5 max)
  search_terms TEXT[],
  search_terms_count INTEGER DEFAULT 3 CHECK (search_terms_count >= 2 AND search_terms_count <= 5),
  
  -- Configuration
  country TEXT DEFAULT 'US',
  language TEXT DEFAULT 'en',
  device_type TEXT DEFAULT 'desktop',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create competitor_serp_results table
CREATE TABLE IF NOT EXISTS public.competitor_serp_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES public.competitor_audits(id) ON DELETE CASCADE,
  search_term TEXT NOT NULL,
  
  -- SERP Data (Position 1-10)
  position INTEGER NOT NULL CHECK (position >= 1 AND position <= 10),
  domain TEXT NOT NULL,
  url TEXT NOT NULL,
  meta_title TEXT,
  meta_description TEXT,
  
  -- Analysis metadata
  scraped_at TIMESTAMPTZ DEFAULT NOW(),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_competitor_audits_user_brand ON public.competitor_audits(user_id, brand_id);
CREATE INDEX IF NOT EXISTS idx_competitor_audits_created ON public.competitor_audits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_serp_results_audit ON public.competitor_serp_results(audit_id);
CREATE INDEX IF NOT EXISTS idx_serp_results_search_term ON public.competitor_serp_results(audit_id, search_term);

-- Enable RLS
ALTER TABLE public.competitor_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitor_serp_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for competitor_audits
CREATE POLICY "Users can manage own competitor audits" 
  ON public.competitor_audits 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for competitor_serp_results
CREATE POLICY "Users can view own audit SERP results" 
  ON public.competitor_serp_results 
  FOR ALL 
  USING (
    audit_id IN (
      SELECT id FROM competitor_audits WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    audit_id IN (
      SELECT id FROM competitor_audits WHERE user_id = auth.uid()
    )
  );