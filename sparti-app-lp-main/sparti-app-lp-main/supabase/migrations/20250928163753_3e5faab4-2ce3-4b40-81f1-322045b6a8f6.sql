-- Add missing columns to seo_tracked_keywords table
ALTER TABLE public.seo_tracked_keywords 
ADD COLUMN IF NOT EXISTS search_volume integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS difficulty integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS cpc numeric(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS competition_level text DEFAULT 'Low',
ADD COLUMN IF NOT EXISTS target_country text DEFAULT 'United States',
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Add intent column (singular) and keep intents (plural) for backwards compatibility
ALTER TABLE public.seo_tracked_keywords 
ADD COLUMN IF NOT EXISTS intent text DEFAULT 'Informational';

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_seo_tracked_keywords_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS update_seo_tracked_keywords_updated_at ON public.seo_tracked_keywords;
CREATE TRIGGER update_seo_tracked_keywords_updated_at
  BEFORE UPDATE ON public.seo_tracked_keywords
  FOR EACH ROW
  EXECUTE FUNCTION public.update_seo_tracked_keywords_updated_at();

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'seo_tracked_keywords';