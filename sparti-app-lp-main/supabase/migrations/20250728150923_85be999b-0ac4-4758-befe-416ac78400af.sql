-- Add cluster_id column to lobstr_runs table
ALTER TABLE public.lobstr_runs 
ADD COLUMN cluster_id TEXT;