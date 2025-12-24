-- Add unique constraint on (user_id, squid_id, max_results) to ensure max_results uniqueness per user per squid
ALTER TABLE public.lobstr_runs 
ADD CONSTRAINT lobstr_runs_user_squid_max_results_unique 
UNIQUE (user_id, squid_id, max_results);