-- Add new fields to venues table for enhanced Outscraper data
ALTER TABLE public.venues 
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS social_links jsonb,
ADD COLUMN IF NOT EXISTS working_hours_detailed jsonb,
ADD COLUMN IF NOT EXISTS phone_number text,
ADD COLUMN IF NOT EXISTS website text;