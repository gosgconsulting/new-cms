-- Add website analysis fields to content_settings table
ALTER TABLE public.content_settings
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS brand_name TEXT,
ADD COLUMN IF NOT EXISTS brand_description TEXT,
ADD COLUMN IF NOT EXISTS target_country TEXT,
ADD COLUMN IF NOT EXISTS content_language TEXT,
ADD COLUMN IF NOT EXISTS target_audience TEXT,
ADD COLUMN IF NOT EXISTS key_selling_points TEXT[];

-- Add comment to document the new columns
COMMENT ON COLUMN public.content_settings.website_url IS 'Website URL analyzed during quick setup';
COMMENT ON COLUMN public.content_settings.brand_name IS 'Brand name extracted from website analysis';
COMMENT ON COLUMN public.content_settings.brand_description IS 'Product/service description from website analysis';
COMMENT ON COLUMN public.content_settings.target_country IS 'Primary target country for content';
COMMENT ON COLUMN public.content_settings.content_language IS 'Primary language for content generation';
COMMENT ON COLUMN public.content_settings.target_audience IS 'Description of target audience';
COMMENT ON COLUMN public.content_settings.key_selling_points IS 'Array of key selling points';