-- Create brand_analysis table to store website analysis results
CREATE TABLE IF NOT EXISTS public.brand_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  -- Website analysis data
  brand_name TEXT,
  brand_description TEXT,
  target_audience TEXT,
  key_selling_points TEXT[],
  sitemap_url TEXT,
  total_sitemap_links INTEGER,
  
  -- Backlinks/Sitemap data
  backlinks JSONB DEFAULT '[]'::jsonb,
  
  -- Keywords
  keywords TEXT[],
  
  -- Competitors
  competitors JSONB DEFAULT '[]'::jsonb,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT brand_analysis_brand_id_key UNIQUE (brand_id)
);

-- Enable RLS
ALTER TABLE public.brand_analysis ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own brand analysis"
ON public.brand_analysis
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own brand analysis"
ON public.brand_analysis
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own brand analysis"
ON public.brand_analysis
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own brand analysis"
ON public.brand_analysis
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_brand_analysis_brand_id ON public.brand_analysis(brand_id);
CREATE INDEX idx_brand_analysis_user_id ON public.brand_analysis(user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_brand_analysis_updated_at
BEFORE UPDATE ON public.brand_analysis
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();