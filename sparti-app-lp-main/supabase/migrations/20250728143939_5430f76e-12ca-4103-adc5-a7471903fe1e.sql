-- Create table for tracking Lobstr.io runs
CREATE TABLE public.lobstr_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  squid_id TEXT NOT NULL DEFAULT '5d0f3a3cc2364495880007ebcfcec374',
  run_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  search_query TEXT NOT NULL,
  location TEXT NOT NULL,
  max_results INTEGER NOT NULL DEFAULT 50,
  progress INTEGER NOT NULL DEFAULT 0,
  results_count INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  leads_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.lobstr_runs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view lobstr runs" 
ON public.lobstr_runs 
FOR SELECT 
USING (true);

CREATE POLICY "Service role can manage lobstr runs" 
ON public.lobstr_runs 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_lobstr_runs_updated_at
BEFORE UPDATE ON public.lobstr_runs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();