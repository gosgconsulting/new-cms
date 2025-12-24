-- Create SEO analysis history table to store website analysis data
CREATE TABLE IF NOT EXISTS public.seo_analysis_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  website_id UUID NOT NULL REFERENCES public.connected_websites(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  analysis_date DATE NOT NULL DEFAULT CURRENT_DATE,
  organic_traffic_data JSONB,
  ranking_keywords_data JSONB,
  keyword_changes_data JSONB,
  keyword_suggestions_data JSONB,
  backlinks_data JSONB,
  raw_api_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.seo_analysis_history ENABLE ROW LEVEL SECURITY;

-- Create policies for SEO analysis history
CREATE POLICY "Users can view their own SEO analysis" 
ON public.seo_analysis_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own SEO analysis" 
ON public.seo_analysis_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own SEO analysis" 
ON public.seo_analysis_history 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own SEO analysis" 
ON public.seo_analysis_history 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_seo_analysis_history_website_id ON public.seo_analysis_history(website_id);
CREATE INDEX IF NOT EXISTS idx_seo_analysis_history_user_id ON public.seo_analysis_history(user_id);
CREATE INDEX IF NOT EXISTS idx_seo_analysis_history_analysis_date ON public.seo_analysis_history(analysis_date);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_seo_analysis_history_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_seo_analysis_history_updated_at
BEFORE UPDATE ON public.seo_analysis_history
FOR EACH ROW
EXECUTE FUNCTION public.update_seo_analysis_history_updated_at();