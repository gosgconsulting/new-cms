-- Create lobstr_runs table for tracking Lobstr scraping sessions
CREATE TABLE public.lobstr_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  squid_id TEXT NOT NULL,
  run_id TEXT,
  query TEXT NOT NULL,
  location TEXT NOT NULL,
  max_results INTEGER NOT NULL DEFAULT 50,
  status TEXT NOT NULL DEFAULT 'pending',
  user_id UUID NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  results_count INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lobstr_runs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lobstr_runs
CREATE POLICY "Users can view their own lobstr runs" ON public.lobstr_runs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own lobstr runs" ON public.lobstr_runs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lobstr runs" ON public.lobstr_runs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lobstr runs" ON public.lobstr_runs
  FOR DELETE USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_lobstr_runs_updated_at
  BEFORE UPDATE ON public.lobstr_runs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();