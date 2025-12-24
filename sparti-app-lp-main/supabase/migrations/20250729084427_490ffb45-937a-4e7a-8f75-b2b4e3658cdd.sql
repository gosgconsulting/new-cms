-- Create tables for Lobstr lead generation functionality

-- Create business_leads table for storing scraped business data
CREATE TABLE IF NOT EXISTS public.business_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  website TEXT,
  address TEXT,
  category TEXT,
  activity TEXT,
  place_id TEXT,
  rating NUMERIC,
  reviews_count INTEGER,
  latitude NUMERIC,
  longitude NUMERIC,
  social_media JSONB DEFAULT '{}',
  search_location TEXT,
  search_query TEXT,
  search_categories TEXT[],
  lobstr_run_id TEXT,
  scraped_sequence INTEGER,
  scraped_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'new',
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lobstr_runs table for tracking scraping runs
CREATE TABLE IF NOT EXISTS public.lobstr_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id TEXT NOT NULL UNIQUE,
  user_id UUID,
  status TEXT DEFAULT 'pending',
  total_results INTEGER DEFAULT 0,
  results_saved_count INTEGER DEFAULT 0,
  search_query TEXT,
  search_location TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lobstr_background_jobs table for background processing
CREATE TABLE IF NOT EXISTS public.lobstr_background_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lobstr_run_id TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 10,
  next_check_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_checked_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.business_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lobstr_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lobstr_background_jobs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for business_leads
CREATE POLICY "Users can view their own business leads" 
ON public.business_leads 
FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create business leads" 
ON public.business_leads 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own business leads" 
ON public.business_leads 
FOR UPDATE 
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete their own business leads" 
ON public.business_leads 
FOR DELETE 
USING (auth.uid() = user_id OR user_id IS NULL);

-- Create RLS policies for lobstr_runs
CREATE POLICY "Users can view their own lobstr runs" 
ON public.lobstr_runs 
FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create lobstr runs" 
ON public.lobstr_runs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own lobstr runs" 
ON public.lobstr_runs 
FOR UPDATE 
USING (auth.uid() = user_id OR user_id IS NULL);

-- Create RLS policies for lobstr_background_jobs
CREATE POLICY "Service can manage background jobs" 
ON public.lobstr_background_jobs 
FOR ALL 
USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_business_leads_user_id ON public.business_leads(user_id);
CREATE INDEX IF NOT EXISTS idx_business_leads_lobstr_run_id ON public.business_leads(lobstr_run_id);
CREATE INDEX IF NOT EXISTS idx_lobstr_runs_user_id ON public.lobstr_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_lobstr_runs_run_id ON public.lobstr_runs(run_id);
CREATE INDEX IF NOT EXISTS idx_lobstr_background_jobs_status ON public.lobstr_background_jobs(status);
CREATE INDEX IF NOT EXISTS idx_lobstr_background_jobs_next_check ON public.lobstr_background_jobs(next_check_at);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
DROP TRIGGER IF EXISTS update_business_leads_updated_at ON public.business_leads;
CREATE TRIGGER update_business_leads_updated_at
BEFORE UPDATE ON public.business_leads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_lobstr_runs_updated_at ON public.lobstr_runs;
CREATE TRIGGER update_lobstr_runs_updated_at
BEFORE UPDATE ON public.lobstr_runs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_lobstr_background_jobs_updated_at ON public.lobstr_background_jobs;
CREATE TRIGGER update_lobstr_background_jobs_updated_at
BEFORE UPDATE ON public.lobstr_background_jobs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();