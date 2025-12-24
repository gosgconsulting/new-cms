-- Add keywords_cluster column to seo_campaigns table
ALTER TABLE public.seo_campaigns 
ADD COLUMN IF NOT EXISTS keywords_cluster text;

COMMENT ON COLUMN public.seo_campaigns.keywords_cluster IS 'The selected keyword cluster name for this campaign';