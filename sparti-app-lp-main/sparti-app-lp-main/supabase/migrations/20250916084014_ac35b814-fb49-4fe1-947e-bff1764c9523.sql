-- Create table for connected websites (only if not exists)
CREATE TABLE IF NOT EXISTS public.connected_websites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  workspace_id UUID,
  domain TEXT NOT NULL,
  website_url TEXT NOT NULL,
  name TEXT, -- Custom name for the website
  description TEXT,
  industry TEXT,
  location_code INTEGER DEFAULT 2840, -- USA by default
  language_code TEXT DEFAULT 'en',
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_analyzed_at TIMESTAMP WITH TIME ZONE,
  analysis_frequency TEXT DEFAULT 'weekly', -- daily, weekly, monthly
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add unique constraint if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'connected_websites_user_id_domain_key'
  ) THEN
    ALTER TABLE public.connected_websites 
    ADD CONSTRAINT connected_websites_user_id_domain_key UNIQUE(user_id, domain);
  END IF;
END $$;

-- Create table for storing SEO analysis history
CREATE TABLE IF NOT EXISTS public.seo_analysis_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  website_id UUID NOT NULL,
  user_id UUID NOT NULL,
  analysis_date DATE NOT NULL,
  organic_traffic_data JSONB, -- Store monthly traffic data
  ranking_keywords_data JSONB, -- Store top ranking keywords
  keyword_changes_data JSONB, -- Store position changes
  keyword_suggestions_data JSONB, -- Store suggested keywords
  backlinks_data JSONB, -- Store backlinks analysis
  raw_api_response JSONB, -- Store complete API response for debugging
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key and unique constraint if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'seo_analysis_history_website_id_fkey'
  ) THEN
    ALTER TABLE public.seo_analysis_history 
    ADD CONSTRAINT seo_analysis_history_website_id_fkey 
    FOREIGN KEY (website_id) REFERENCES public.connected_websites(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'seo_analysis_history_website_id_analysis_date_key'
  ) THEN
    ALTER TABLE public.seo_analysis_history 
    ADD CONSTRAINT seo_analysis_history_website_id_analysis_date_key UNIQUE(website_id, analysis_date);
  END IF;
END $$;

-- Create table for competitor analysis
CREATE TABLE IF NOT EXISTS public.website_competitors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  website_id UUID NOT NULL,
  user_id UUID NOT NULL,
  competitor_domain TEXT NOT NULL,
  competitor_name TEXT,
  overlap_keywords INTEGER DEFAULT 0,
  visibility_score NUMERIC(5,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key and unique constraint for competitors if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'website_competitors_website_id_fkey'
  ) THEN
    ALTER TABLE public.website_competitors 
    ADD CONSTRAINT website_competitors_website_id_fkey 
    FOREIGN KEY (website_id) REFERENCES public.connected_websites(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'website_competitors_website_id_competitor_domain_key'
  ) THEN
    ALTER TABLE public.website_competitors 
    ADD CONSTRAINT website_competitors_website_id_competitor_domain_key UNIQUE(website_id, competitor_domain);
  END IF;
END $$;

-- Enable RLS if not already enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c 
    JOIN pg_namespace n ON n.oid = c.relnamespace 
    WHERE n.nspname = 'public' AND c.relname = 'connected_websites' AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE public.connected_websites ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c 
    JOIN pg_namespace n ON n.oid = c.relnamespace 
    WHERE n.nspname = 'public' AND c.relname = 'seo_analysis_history' AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE public.seo_analysis_history ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c 
    JOIN pg_namespace n ON n.oid = c.relnamespace 
    WHERE n.nspname = 'public' AND c.relname = 'website_competitors' AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE public.website_competitors ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create RLS policies if not exists
DO $$
BEGIN
  -- connected_websites policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'connected_websites' AND policyname = 'Users can manage own websites') THEN
    CREATE POLICY "Users can manage own websites" 
    ON public.connected_websites 
    FOR ALL 
    USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'connected_websites' AND policyname = 'Workspace members can access websites') THEN
    CREATE POLICY "Workspace members can access websites" 
    ON public.connected_websites 
    FOR SELECT 
    USING (
      workspace_id IS NOT NULL AND 
      is_workspace_member(workspace_id, auth.uid())
    );
  END IF;

  -- seo_analysis_history policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'seo_analysis_history' AND policyname = 'Users can manage own analysis history') THEN
    CREATE POLICY "Users can manage own analysis history" 
    ON public.seo_analysis_history 
    FOR ALL 
    USING (auth.uid() = user_id);
  END IF;

  -- website_competitors policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'website_competitors' AND policyname = 'Users can manage own competitors') THEN
    CREATE POLICY "Users can manage own competitors" 
    ON public.website_competitors 
    FOR ALL 
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create function to update timestamps if not exists
CREATE OR REPLACE FUNCTION public.update_connected_websites_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_connected_websites_updated_at'
  ) THEN
    CREATE TRIGGER update_connected_websites_updated_at
    BEFORE UPDATE ON public.connected_websites
    FOR EACH ROW
    EXECUTE FUNCTION public.update_connected_websites_updated_at();
  END IF;
END $$;

-- Create indexes if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_connected_websites_user_id') THEN
    CREATE INDEX idx_connected_websites_user_id ON public.connected_websites(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_connected_websites_domain') THEN
    CREATE INDEX idx_connected_websites_domain ON public.connected_websites(domain);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_seo_analysis_history_website_id') THEN
    CREATE INDEX idx_seo_analysis_history_website_id ON public.seo_analysis_history(website_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_seo_analysis_history_date') THEN
    CREATE INDEX idx_seo_analysis_history_date ON public.seo_analysis_history(analysis_date);
  END IF;
END $$;