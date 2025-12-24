-- Add campaign_id to blog_posts table to link posts to campaigns
ALTER TABLE public.blog_posts 
ADD COLUMN campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL;

-- Add campaign_id to blog_articles table to link articles to campaigns  
ALTER TABLE public.blog_articles
ADD COLUMN campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL;

-- Add campaign_id to ai_generated_content table to link generated content to campaigns
ALTER TABLE public.ai_generated_content
ADD COLUMN campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX idx_blog_posts_campaign_id ON public.blog_posts(campaign_id);
CREATE INDEX idx_blog_articles_campaign_id ON public.blog_articles(campaign_id); 
CREATE INDEX idx_ai_generated_content_campaign_id ON public.ai_generated_content(campaign_id);

-- Add keywords field to campaigns table to store focus keywords
ALTER TABLE public.campaigns
ADD COLUMN keywords JSONB DEFAULT '[]'::jsonb;

-- Add suggested_titles field to campaigns table to store suggested blog titles
ALTER TABLE public.campaigns 
ADD COLUMN suggested_titles JSONB DEFAULT '[]'::jsonb;