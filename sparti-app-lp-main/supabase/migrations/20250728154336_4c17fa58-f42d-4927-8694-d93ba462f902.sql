-- Check and fix lobstr_runs table structure to match API requirements
-- Based on the error "Failed to save run record", we need to ensure all required columns exist

-- First, let's check what columns are missing and add them if needed
DO $$
DECLARE
    column_count integer;
BEGIN
    -- Check if columns exist, if not add them
    SELECT count(*) INTO column_count 
    FROM information_schema.columns 
    WHERE table_name = 'lobstr_runs' AND column_name = 'query';
    
    IF column_count = 0 THEN
        ALTER TABLE lobstr_runs ADD COLUMN query TEXT;
    END IF;
    
    SELECT count(*) INTO column_count 
    FROM information_schema.columns 
    WHERE table_name = 'lobstr_runs' AND column_name = 'started_at';
    
    IF column_count = 0 THEN
        ALTER TABLE lobstr_runs ADD COLUMN started_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    SELECT count(*) INTO column_count 
    FROM information_schema.columns 
    WHERE table_name = 'lobstr_runs' AND column_name = 'max_results';
    
    IF column_count = 0 THEN
        ALTER TABLE lobstr_runs ADD COLUMN max_results INTEGER DEFAULT 50;
    END IF;
END $$;

-- Update the table to ensure all columns have proper defaults and constraints
ALTER TABLE lobstr_runs 
ALTER COLUMN status SET DEFAULT 'pending',
ALTER COLUMN search_query SET DEFAULT '',
ALTER COLUMN location SET DEFAULT '';

-- Add proper indexes for performance
CREATE INDEX IF NOT EXISTS idx_lobstr_runs_status_created ON lobstr_runs(status, created_at);
CREATE INDEX IF NOT EXISTS idx_lobstr_runs_squid_id ON lobstr_runs(squid_id);

-- Ensure RLS policies are correct
DROP POLICY IF EXISTS "Service role can manage lobstr runs" ON lobstr_runs;
CREATE POLICY "Service role can manage lobstr runs" 
ON lobstr_runs 
FOR ALL 
USING (true) 
WITH CHECK (true);