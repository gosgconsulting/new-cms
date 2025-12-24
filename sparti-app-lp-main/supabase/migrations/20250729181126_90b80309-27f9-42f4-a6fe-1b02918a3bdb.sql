-- Remove the default value for abort_limit since it should always be dynamic
ALTER TABLE public.lobstr_runs 
ALTER COLUMN abort_limit DROP DEFAULT;