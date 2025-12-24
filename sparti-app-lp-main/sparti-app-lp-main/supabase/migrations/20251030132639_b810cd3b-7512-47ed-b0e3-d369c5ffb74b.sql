-- Create scraping_runs table to track lead generation campaigns
CREATE TABLE IF NOT EXISTS public.scraping_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  query TEXT NOT NULL,
  location TEXT,
  max_results INTEGER DEFAULT 50,
  results_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'aborted')),
  lobstr_run_id TEXT,
  lobstr_squid_id TEXT,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_scraping_runs_user_id ON public.scraping_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_scraping_runs_status ON public.scraping_runs(status);

-- Enable Row Level Security
ALTER TABLE public.scraping_runs ENABLE ROW LEVEL SECURITY;

-- Create policies for scraping_runs
CREATE POLICY "Users can view their own scraping runs"
  ON public.scraping_runs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own scraping runs"
  ON public.scraping_runs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scraping runs"
  ON public.scraping_runs
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scraping runs"
  ON public.scraping_runs
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create google_maps_leads table to store individual business leads from Google Maps
CREATE TABLE IF NOT EXISTS public.google_maps_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id UUID NOT NULL REFERENCES public.scraping_runs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  business_name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  rating NUMERIC(3,2),
  reviews_count INTEGER,
  category TEXT,
  place_id TEXT,
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  opening_hours JSONB,
  business_status TEXT,
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for google_maps_leads
CREATE INDEX IF NOT EXISTS idx_google_maps_leads_run_id ON public.google_maps_leads(run_id);
CREATE INDEX IF NOT EXISTS idx_google_maps_leads_user_id ON public.google_maps_leads(user_id);
CREATE INDEX IF NOT EXISTS idx_google_maps_leads_place_id ON public.google_maps_leads(place_id);

-- Enable Row Level Security
ALTER TABLE public.google_maps_leads ENABLE ROW LEVEL SECURITY;

-- Create policies for google_maps_leads
CREATE POLICY "Users can view their own leads"
  ON public.google_maps_leads
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own leads"
  ON public.google_maps_leads
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own leads"
  ON public.google_maps_leads
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own leads"
  ON public.google_maps_leads
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_scraping_runs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_scraping_runs_updated_at
  BEFORE UPDATE ON public.scraping_runs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_scraping_runs_updated_at();