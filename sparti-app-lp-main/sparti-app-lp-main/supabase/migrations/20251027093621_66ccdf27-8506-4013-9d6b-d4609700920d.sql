-- Add brand information columns to brands table
ALTER TABLE public.brands 
ADD COLUMN IF NOT EXISTS target_audience TEXT,
ADD COLUMN IF NOT EXISTS brand_voice TEXT,
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'United States',
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'English',
ADD COLUMN IF NOT EXISTS key_selling_points TEXT[];

-- Add comment
COMMENT ON COLUMN public.brands.target_audience IS 'Target audience description for the brand';
COMMENT ON COLUMN public.brands.brand_voice IS 'Brand voice and tone';
COMMENT ON COLUMN public.brands.country IS 'Target country for the brand';
COMMENT ON COLUMN public.brands.language IS 'Content language for the brand';
COMMENT ON COLUMN public.brands.key_selling_points IS 'Array of key selling points for the brand';