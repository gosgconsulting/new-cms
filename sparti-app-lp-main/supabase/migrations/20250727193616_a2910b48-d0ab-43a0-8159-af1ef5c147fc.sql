-- Create campaigns table for lead generation campaign management
CREATE TABLE public.campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  search_criteria JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'archived')),
  lead_count INTEGER DEFAULT 0,
  target_market TEXT,
  search_location TEXT,
  activity_types TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID,
  tags TEXT[]
);

-- Create leads table for storing individual business leads
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  external_id TEXT, -- Google Places ID or other external reference
  name TEXT NOT NULL,
  category TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  rating DECIMAL(2,1),
  reviews_count INTEGER,
  price_level INTEGER,
  social_media JSONB,
  contact_info JSONB,
  business_status TEXT,
  lead_score INTEGER,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  photos TEXT[],
  opening_hours JSONB,
  digital_presence JSONB,
  business_size TEXT,
  website_technology TEXT[],
  ai_qualification JSONB,
  ai_scoring JSONB,
  notes TEXT,
  interaction_status TEXT DEFAULT 'new' CHECK (interaction_status IN ('new', 'contacted', 'qualified', 'converted', 'rejected')),
  last_contact_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create campaign_analytics table for tracking performance
CREATE TABLE public.campaign_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  leads_generated INTEGER DEFAULT 0,
  leads_contacted INTEGER DEFAULT 0,
  leads_qualified INTEGER DEFAULT 0,
  leads_converted INTEGER DEFAULT 0,
  avg_lead_score DECIMAL(5,2),
  top_opportunities TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create search_history table for tracking user searches
CREATE TABLE public.search_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  search_query JSONB NOT NULL,
  results_count INTEGER,
  location TEXT,
  activity_types TEXT[],
  target_market TEXT,
  filters_applied JSONB,
  search_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for campaigns (open access for now, can be restricted later)
CREATE POLICY "Anyone can view campaigns" 
ON public.campaigns 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create campaigns" 
ON public.campaigns 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update campaigns" 
ON public.campaigns 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete campaigns" 
ON public.campaigns 
FOR DELETE 
USING (true);

-- Create RLS policies for leads
CREATE POLICY "Anyone can view leads" 
ON public.leads 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create leads" 
ON public.leads 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update leads" 
ON public.leads 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete leads" 
ON public.leads 
FOR DELETE 
USING (true);

-- Create RLS policies for analytics
CREATE POLICY "Anyone can view analytics" 
ON public.campaign_analytics 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create analytics" 
ON public.campaign_analytics 
FOR INSERT 
WITH CHECK (true);

-- Create RLS policies for search history
CREATE POLICY "Anyone can view search history" 
ON public.search_history 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create search history" 
ON public.search_history 
FOR INSERT 
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_campaigns_status ON public.campaigns(status);
CREATE INDEX idx_campaigns_created_at ON public.campaigns(created_at);
CREATE INDEX idx_campaigns_user_id ON public.campaigns(user_id);

CREATE INDEX idx_leads_campaign_id ON public.leads(campaign_id);
CREATE INDEX idx_leads_interaction_status ON public.leads(interaction_status);
CREATE INDEX idx_leads_lead_score ON public.leads(lead_score);
CREATE INDEX idx_leads_rating ON public.leads(rating);

CREATE INDEX idx_analytics_campaign_id ON public.campaign_analytics(campaign_id);
CREATE INDEX idx_analytics_date ON public.campaign_analytics(date);

CREATE INDEX idx_search_history_user_id ON public.search_history(user_id);
CREATE INDEX idx_search_history_timestamp ON public.search_history(search_timestamp);