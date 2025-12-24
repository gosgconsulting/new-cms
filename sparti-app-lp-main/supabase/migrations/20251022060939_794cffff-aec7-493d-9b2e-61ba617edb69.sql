-- Add quick_setup_data column to seo_campaigns table to store quick setup session progress
ALTER TABLE public.seo_campaigns 
ADD COLUMN IF NOT EXISTS quick_setup_data jsonb DEFAULT NULL;

-- Add index for faster queries on quick_setup_data
CREATE INDEX IF NOT EXISTS idx_seo_campaigns_quick_setup_data 
ON public.seo_campaigns USING gin(quick_setup_data);

-- Add comment
COMMENT ON COLUMN public.seo_campaigns.quick_setup_data IS 'Stores quick setup session data including keywords, topics, sources, and progress at each step';