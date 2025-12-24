-- Add campaign_id column to seo_topic_ideas table
ALTER TABLE public.seo_topic_ideas 
ADD COLUMN campaign_id uuid REFERENCES public.seo_campaigns(id) ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_seo_topic_ideas_campaign_id 
ON public.seo_topic_ideas(campaign_id);

-- Update RLS policies to include campaign_id checks
DROP POLICY IF EXISTS "Users can view their own topic ideas" ON public.seo_topic_ideas;
DROP POLICY IF EXISTS "Users can create their own topic ideas" ON public.seo_topic_ideas;
DROP POLICY IF EXISTS "Users can update their own topic ideas" ON public.seo_topic_ideas;
DROP POLICY IF EXISTS "Users can delete their own topic ideas" ON public.seo_topic_ideas;

CREATE POLICY "Users can view their own topic ideas" 
ON public.seo_topic_ideas 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own topic ideas" 
ON public.seo_topic_ideas 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own topic ideas" 
ON public.seo_topic_ideas 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own topic ideas" 
ON public.seo_topic_ideas 
FOR DELETE 
USING (auth.uid() = user_id);