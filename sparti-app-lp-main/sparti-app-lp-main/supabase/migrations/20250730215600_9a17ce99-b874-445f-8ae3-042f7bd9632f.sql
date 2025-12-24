-- Create SEO Campaigns table to store bulk article generation campaigns
CREATE TABLE IF NOT EXISTS public.seo_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  
  -- Campaign configuration
  name TEXT NOT NULL,
  website_url TEXT NOT NULL,
  business_description TEXT NOT NULL,
  
  -- Article configuration
  number_of_articles INTEGER NOT NULL DEFAULT 5,
  article_length TEXT NOT NULL DEFAULT 'medium', -- short, medium, long, extended
  article_type TEXT NOT NULL DEFAULT 'blog', -- blog, howto, listicle, review, news, tutorial
  language TEXT NOT NULL DEFAULT 'English',
  target_country TEXT NOT NULL DEFAULT 'United States',
  
  -- Campaign status
  status TEXT NOT NULL DEFAULT 'created', -- created, analyzing, scraping, generating, completed, failed
  current_step TEXT DEFAULT 'created', -- created, seo_analysis, keyword_research, content_scraping, style_analysis, article_generation, completed
  progress INTEGER DEFAULT 0, -- 0-100
  
  -- Analysis results
  extracted_keywords JSONB DEFAULT '[]'::jsonb,
  organic_keywords JSONB DEFAULT '[]'::jsonb,
  scraped_articles JSONB DEFAULT '[]'::jsonb,
  style_analysis JSONB DEFAULT '{}'::jsonb,
  
  -- Search configuration for scraping
  search_run_id UUID,
  lobstr_run_id UUID,
  
  -- Error handling
  error_message TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.seo_campaigns ENABLE ROW LEVEL SECURITY;

-- Create policies for SEO campaigns
CREATE POLICY "Users can create their own SEO campaigns" 
ON public.seo_campaigns 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own SEO campaigns" 
ON public.seo_campaigns 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own SEO campaigns" 
ON public.seo_campaigns 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own SEO campaigns" 
ON public.seo_campaigns 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_seo_campaigns_user_id ON public.seo_campaigns(user_id);
CREATE INDEX idx_seo_campaigns_brand_id ON public.seo_campaigns(brand_id);
CREATE INDEX idx_seo_campaigns_status ON public.seo_campaigns(status);
CREATE INDEX idx_seo_campaigns_created_at ON public.seo_campaigns(created_at);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_seo_campaigns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_seo_campaigns_updated_at
BEFORE UPDATE ON public.seo_campaigns
FOR EACH ROW
EXECUTE FUNCTION public.update_seo_campaigns_updated_at();

-- Add campaign_id to blog_posts for linking articles to campaigns
ALTER TABLE public.blog_posts 
ADD COLUMN IF NOT EXISTS seo_campaign_id UUID REFERENCES public.seo_campaigns(id) ON DELETE SET NULL;

-- Create index for the new column
CREATE INDEX IF NOT EXISTS idx_blog_posts_seo_campaign_id ON public.blog_posts(seo_campaign_id);