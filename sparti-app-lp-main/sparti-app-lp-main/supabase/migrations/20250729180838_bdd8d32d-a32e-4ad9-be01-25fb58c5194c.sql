-- Update the default abort_limit to be 200 instead of 50
ALTER TABLE public.lobstr_runs 
ALTER COLUMN abort_limit SET DEFAULT 200;

-- Also update the max_results default to be 200 instead of 50
ALTER TABLE public.lobstr_runs 
ALTER COLUMN max_results SET DEFAULT 200;