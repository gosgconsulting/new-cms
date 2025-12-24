-- Create campaigns table
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  lead_count INTEGER NOT NULL DEFAULT 0,
  search_criteria JSONB NOT NULL DEFAULT '{}',
  target_market TEXT,
  search_location TEXT,
  activity_types TEXT[],
  tags TEXT[],
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create leads table
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  external_id TEXT,
  name TEXT NOT NULL,
  category TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  rating NUMERIC,
  reviews_count INTEGER,
  price_level INTEGER,
  social_media JSONB,
  contact_info JSONB,
  business_status TEXT,
  lead_score NUMERIC,
  latitude NUMERIC,
  longitude NUMERIC,
  digital_presence JSONB,
  business_size TEXT,
  website_technology TEXT[],
  ai_qualification JSONB,
  ai_scoring JSONB,
  notes TEXT,
  interaction_status TEXT NOT NULL DEFAULT 'new' CHECK (interaction_status IN ('new', 'contacted', 'qualified', 'converted', 'rejected')),
  last_contact_date TIMESTAMP WITH TIME ZONE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create search_history table
CREATE TABLE IF NOT EXISTS public.search_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  search_query JSONB NOT NULL,
  results_count INTEGER,
  location TEXT,
  activity_types TEXT[],
  target_market TEXT,
  filters_applied JSONB,
  search_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create campaign_analytics table
CREATE TABLE IF NOT EXISTS public.campaign_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  leads_generated INTEGER NOT NULL DEFAULT 0,
  leads_contacted INTEGER NOT NULL DEFAULT 0,
  leads_qualified INTEGER NOT NULL DEFAULT 0,
  leads_converted INTEGER NOT NULL DEFAULT 0,
  avg_lead_score NUMERIC,
  top_opportunities TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for campaigns
CREATE POLICY "Users can view their own campaigns" ON public.campaigns
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own campaigns" ON public.campaigns
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaigns" ON public.campaigns
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own campaigns" ON public.campaigns
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for leads
CREATE POLICY "Users can view their own leads" ON public.leads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own leads" ON public.leads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own leads" ON public.leads
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own leads" ON public.leads
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for search_history
CREATE POLICY "Users can view their own search history" ON public.search_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own search history" ON public.search_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own search history" ON public.search_history
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own search history" ON public.search_history
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for campaign_analytics
CREATE POLICY "Users can view analytics for their campaigns" ON public.campaign_analytics
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.campaigns c 
    WHERE c.id = campaign_analytics.campaign_id AND c.user_id = auth.uid()
  ));

CREATE POLICY "Users can create analytics for their campaigns" ON public.campaign_analytics
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.campaigns c 
    WHERE c.id = campaign_analytics.campaign_id AND c.user_id = auth.uid()
  ));

CREATE POLICY "Users can update analytics for their campaigns" ON public.campaign_analytics
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM public.campaigns c 
    WHERE c.id = campaign_analytics.campaign_id AND c.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete analytics for their campaigns" ON public.campaign_analytics
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM public.campaigns c 
    WHERE c.id = campaign_analytics.campaign_id AND c.user_id = auth.uid()
  ));

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_campaigns_updated_at ON public.campaigns;
CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_leads_updated_at ON public.leads;
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();