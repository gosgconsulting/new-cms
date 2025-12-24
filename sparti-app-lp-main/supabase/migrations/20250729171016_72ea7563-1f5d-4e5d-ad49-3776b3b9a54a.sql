-- Database migration to support natural geographic task creation system
-- Replace mathematical task calculations with geographic-based approach

-- Add geographic metadata and abort limit tracking to lobstr_runs table
ALTER TABLE lobstr_runs ADD COLUMN IF NOT EXISTS abort_limit INTEGER DEFAULT 50;
ALTER TABLE lobstr_runs ADD COLUMN IF NOT EXISTS geographic_segments JSONB DEFAULT '[]'::jsonb;
ALTER TABLE lobstr_runs ADD COLUMN IF NOT EXISTS task_creation_type TEXT DEFAULT 'single_location' CHECK (task_creation_type IN ('single_location', 'multi_location', 'geographic_expansion'));

-- Add campaign-level result tracking for better abort mechanism
ALTER TABLE lobstr_runs ADD COLUMN IF NOT EXISTS global_results_count INTEGER DEFAULT 0;
ALTER TABLE lobstr_runs ADD COLUMN IF NOT EXISTS abort_requested BOOLEAN DEFAULT FALSE;
ALTER TABLE lobstr_runs ADD COLUMN IF NOT EXISTS abort_reason TEXT;

-- Update indexes for better performance on the new fields
CREATE INDEX IF NOT EXISTS idx_lobstr_runs_abort_limit ON lobstr_runs(abort_limit);
CREATE INDEX IF NOT EXISTS idx_lobstr_runs_global_results ON lobstr_runs(global_results_count);
CREATE INDEX IF NOT EXISTS idx_lobstr_runs_abort_requested ON lobstr_runs(abort_requested);

-- Add trigger to update global_results_count when business_leads are inserted
CREATE OR REPLACE FUNCTION update_global_results_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the global results count for the run
  UPDATE lobstr_runs 
  SET global_results_count = (
    SELECT COUNT(*) 
    FROM business_leads 
    WHERE lobstr_run_id = NEW.lobstr_run_id
  )
  WHERE id = NEW.lobstr_run_id;
  
  -- Check if abort limit reached and mark for abort
  UPDATE lobstr_runs 
  SET abort_requested = TRUE,
      abort_reason = 'Abort limit reached'
  WHERE id = NEW.lobstr_run_id 
    AND global_results_count >= abort_limit 
    AND abort_requested = FALSE;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on business_leads table
DROP TRIGGER IF EXISTS trigger_update_global_results_count ON business_leads;
CREATE TRIGGER trigger_update_global_results_count
  AFTER INSERT ON business_leads
  FOR EACH ROW
  EXECUTE FUNCTION update_global_results_count();

-- Add comments to document the new system
COMMENT ON COLUMN lobstr_runs.abort_limit IS 'Maximum number of leads to collect before aborting the run';
COMMENT ON COLUMN lobstr_runs.geographic_segments IS 'Array of geographic locations/segments for this search run';
COMMENT ON COLUMN lobstr_runs.task_creation_type IS 'Type of task creation: single_location, multi_location, or geographic_expansion';
COMMENT ON COLUMN lobstr_runs.global_results_count IS 'Total number of results collected across all tasks in this run';
COMMENT ON COLUMN lobstr_runs.abort_requested IS 'Whether this run should be aborted due to reaching limits';
COMMENT ON COLUMN lobstr_runs.abort_reason IS 'Reason why the run was marked for abort';