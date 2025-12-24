-- Create seo_campaigns table to track SEO campaign progress
CREATE TABLE IF NOT EXISTS public.seo_campaigns (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    brand_id UUID,
    workspace_id UUID,
    website_url TEXT,
    business_description TEXT NOT NULL,
    number_of_articles INTEGER NOT NULL DEFAULT 5,
    article_length TEXT NOT NULL DEFAULT 'medium',
    article_type TEXT NOT NULL DEFAULT 'blog',
    language TEXT NOT NULL DEFAULT 'English',
    target_country TEXT NOT NULL DEFAULT 'United States',
    extracted_keywords TEXT[] DEFAULT '{}',
    generated_search_keywords TEXT[] DEFAULT '{}',
    formatted_search_location TEXT,
    search_run_id UUID,
    lobstr_run_id UUID,
    current_step TEXT DEFAULT 'form_data_saved',
    progress INTEGER DEFAULT 10,
    status TEXT DEFAULT 'in_progress',
    live_analysis JSONB,
    style_analysis JSONB,
    organic_keywords TEXT[] DEFAULT '{}',
    scraped_articles JSONB DEFAULT '[]',
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.seo_campaigns ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own SEO campaigns" 
ON public.seo_campaigns 
FOR ALL 
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_seo_campaigns_updated_at
    BEFORE UPDATE ON public.seo_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Add foreign key constraints
ALTER TABLE public.seo_campaigns 
ADD CONSTRAINT seo_campaigns_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.seo_campaigns 
ADD CONSTRAINT seo_campaigns_brand_id_fkey 
FOREIGN KEY (brand_id) REFERENCES public.brands(id) ON DELETE SET NULL;

-- Add indexes for performance
CREATE INDEX idx_seo_campaigns_user_id ON public.seo_campaigns(user_id);
CREATE INDEX idx_seo_campaigns_brand_id ON public.seo_campaigns(brand_id);
CREATE INDEX idx_seo_campaigns_status ON public.seo_campaigns(status);
CREATE INDEX idx_seo_campaigns_created_at ON public.seo_campaigns(created_at DESC);