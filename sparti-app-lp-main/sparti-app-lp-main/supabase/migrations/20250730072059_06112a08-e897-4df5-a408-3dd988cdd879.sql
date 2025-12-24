-- Fix database constraint issues for lobstr_runs table
-- Add unique constraint on run_id to prevent duplicates when using ON CONFLICT
ALTER TABLE public.lobstr_runs 
ADD CONSTRAINT unique_run_id UNIQUE (run_id);

-- Create index for better performance on run_id lookups
CREATE INDEX IF NOT EXISTS idx_lobstr_runs_run_id ON public.lobstr_runs(run_id);

-- Create index for user_id + run_id combination for faster queries
CREATE INDEX IF NOT EXISTS idx_lobstr_runs_user_run ON public.lobstr_runs(user_id, run_id);

-- Also ensure each business lead has proper indexes for run lookups
CREATE INDEX IF NOT EXISTS idx_business_leads_lobstr_run_id ON public.business_leads(lobstr_run_id);
CREATE INDEX IF NOT EXISTS idx_business_leads_user_run ON public.business_leads(user_id, lobstr_run_id);