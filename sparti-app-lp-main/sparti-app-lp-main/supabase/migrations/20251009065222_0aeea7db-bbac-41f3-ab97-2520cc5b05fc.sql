-- Update workflow_steps table to support multi-select providers
ALTER TABLE workflow_steps 
ALTER COLUMN provider TYPE text[] USING 
  CASE 
    WHEN provider IS NULL OR provider = '' THEN ARRAY[]::text[]
    ELSE ARRAY[provider]
  END;

-- Update existing empty arrays to NULL for cleaner data
UPDATE workflow_steps 
SET provider = NULL 
WHERE provider = ARRAY[]::text[] OR provider IS NULL;

-- Add default value for provider column
ALTER TABLE workflow_steps 
ALTER COLUMN provider SET DEFAULT NULL;