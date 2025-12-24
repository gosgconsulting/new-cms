-- Add typography field to brands table to store font selections
ALTER TABLE public.brands 
ADD COLUMN IF NOT EXISTS typography JSONB DEFAULT '{"primary": "Inter", "secondary": "Roboto"}'::jsonb;

-- Update existing brands to have default typography if null
UPDATE public.brands 
SET typography = '{"primary": "Inter", "secondary": "Roboto"}'::jsonb
WHERE typography IS NULL;