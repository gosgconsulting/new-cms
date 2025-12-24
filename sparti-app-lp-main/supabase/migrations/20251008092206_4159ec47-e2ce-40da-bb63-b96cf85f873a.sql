-- Add country and tag columns to seo_internal_links table
ALTER TABLE public.seo_internal_links 
ADD COLUMN IF NOT EXISTS country text,
ADD COLUMN IF NOT EXISTS tag text;

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_seo_internal_links_country ON public.seo_internal_links(country);
CREATE INDEX IF NOT EXISTS idx_seo_internal_links_tag ON public.seo_internal_links(tag);