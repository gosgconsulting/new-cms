-- Add config column to workflow_steps table to store prompt configuration
ALTER TABLE workflow_steps 
ADD COLUMN config JSONB DEFAULT '{}';

-- Add comment to describe the column
COMMENT ON COLUMN workflow_steps.config IS 'JSON configuration for step prompts, models, and other settings';
