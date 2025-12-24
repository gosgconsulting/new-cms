-- Create table for connected websites
CREATE TABLE public.connected_websites (
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
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, domain)
);

-- Create table for storing SEO analysis history
CREATE TABLE public.seo_analysis_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  website_id UUID NOT NULL REFERENCES public.connected_websites(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  analysis_date DATE NOT NULL,
  organic_traffic_data JSONB, -- Store monthly traffic data
  ranking_keywords_data JSONB, -- Store top ranking keywords
  keyword_changes_data JSONB, -- Store position changes
  keyword_suggestions_data JSONB, -- Store suggested keywords
  backlinks_data JSONB, -- Store backlinks analysis
  raw_api_response JSONB, -- Store complete API response for debugging
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(website_id, analysis_date)
);

-- Create table for tracking specific keywords
CREATE TABLE public.tracked_keywords (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  website_id UUID NOT NULL REFERENCES public.connected_websites(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  keyword TEXT NOT NULL,
  current_position INTEGER,
  previous_position INTEGER,
  best_position INTEGER,
  search_volume INTEGER,
  difficulty_score INTEGER,
  is_target_keyword BOOLEAN DEFAULT false, -- User-defined target keywords
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(website_id, keyword)
);

-- Create table for competitor analysis
CREATE TABLE public.website_competitors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  website_id UUID NOT NULL REFERENCES public.connected_websites(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  competitor_domain TEXT NOT NULL,
  competitor_name TEXT,
  overlap_keywords INTEGER DEFAULT 0,
  visibility_score NUMERIC(5,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(website_id, competitor_domain)
);

-- Enable RLS
ALTER TABLE public.connected_websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_analysis_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracked_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_competitors ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for connected_websites
CREATE POLICY "Users can manage own websites" 
ON public.connected_websites 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Workspace members can access websites" 
ON public.connected_websites 
FOR SELECT 
USING (
  workspace_id IS NOT NULL AND 
  is_workspace_member(workspace_id, auth.uid())
);

-- Create RLS policies for seo_analysis_history
CREATE POLICY "Users can manage own analysis history" 
ON public.seo_analysis_history 
FOR ALL 
USING (auth.uid() = user_id);

-- Create RLS policies for tracked_keywords
CREATE POLICY "Users can manage own tracked keywords" 
ON public.tracked_keywords 
FOR ALL 
USING (auth.uid() = user_id);

-- Create RLS policies for website_competitors
CREATE POLICY "Users can manage own competitors" 
ON public.website_competitors 
FOR ALL 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_connected_websites_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION public.update_tracked_keywords_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers
CREATE TRIGGER update_connected_websites_updated_at
BEFORE UPDATE ON public.connected_websites
FOR EACH ROW
EXECUTE FUNCTION public.update_connected_websites_updated_at();

CREATE TRIGGER update_tracked_keywords_updated_at
BEFORE UPDATE ON public.tracked_keywords
FOR EACH ROW
EXECUTE FUNCTION public.update_tracked_keywords_updated_at();

-- Create indexes for performance
CREATE INDEX idx_connected_websites_user_id ON public.connected_websites(user_id);
CREATE INDEX idx_connected_websites_domain ON public.connected_websites(domain);
CREATE INDEX idx_seo_analysis_history_website_id ON public.seo_analysis_history(website_id);
CREATE INDEX idx_seo_analysis_history_date ON public.seo_analysis_history(analysis_date);
CREATE INDEX idx_tracked_keywords_website_id ON public.tracked_keywords(website_id);
CREATE INDEX idx_tracked_keywords_keyword ON public.tracked_keywords(keyword);