-- Create a background job processing system for lobstr results
CREATE TABLE IF NOT EXISTS lobstr_background_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lobstr_run_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  last_checked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  next_check_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 10,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE lobstr_background_jobs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Service role can manage background jobs" 
ON lobstr_background_jobs 
FOR ALL 
USING (current_setting('role') = 'service_role');

-- Create function to update updated_at
CREATE TRIGGER update_lobstr_background_jobs_updated_at
BEFORE UPDATE ON lobstr_background_jobs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_lobstr_background_jobs_status_next_check 
ON lobstr_background_jobs(status, next_check_at) 
WHERE status IN ('pending', 'processing');