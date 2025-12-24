-- Phase 1: Database Schema Changes for Search History Tracking

-- Remove the unique constraint that's causing the duplicate issues
ALTER TABLE public.lobstr_runs DROP CONSTRAINT IF EXISTS lobstr_runs_user_squid_max_results_unique;

-- Add new columns to track search sessions and result counts
ALTER TABLE public.lobstr_runs 
ADD COLUMN IF NOT EXISTS search_session_id UUID DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS total_results_found INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS unique_results_saved INTEGER DEFAULT 0;

-- Create index for better performance on search session queries
CREATE INDEX IF NOT EXISTS idx_lobstr_runs_search_session ON public.lobstr_runs(search_session_id);
CREATE INDEX IF NOT EXISTS idx_lobstr_runs_user_created ON public.lobstr_runs(user_id, created_at DESC);