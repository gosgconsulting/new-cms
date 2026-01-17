-- Migration: Add tags column to themes table
-- This migration adds a tags column (TEXT[]) to store theme tags (custom/template)
-- Run this via MCP or directly on the database

-- Step 1: Add tags column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'themes' 
        AND column_name = 'tags'
    ) THEN
        ALTER TABLE themes ADD COLUMN tags TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Tags column added to themes table';
    ELSE
        RAISE NOTICE 'Tags column already exists';
    END IF;
END $$;

-- Step 2: Verify the column was added
SELECT 
    column_name, 
    data_type, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'themes' AND column_name = 'tags';
