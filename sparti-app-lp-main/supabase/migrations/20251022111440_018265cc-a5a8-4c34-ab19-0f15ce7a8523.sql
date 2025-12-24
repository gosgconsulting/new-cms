-- Add campaign_id column to seo_keywords table
ALTER TABLE public.seo_keywords 
ADD COLUMN campaign_id uuid REFERENCES public.seo_campaigns(id) ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_seo_keywords_campaign_id 
ON public.seo_keywords(campaign_id);