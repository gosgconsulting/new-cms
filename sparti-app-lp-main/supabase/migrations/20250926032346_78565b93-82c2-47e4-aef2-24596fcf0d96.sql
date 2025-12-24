-- Create content_settings table to store brand-specific content generation preferences
CREATE TABLE public.content_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID NOT NULL,
  user_id UUID NOT NULL,
  
  -- Content settings from the UI
  use_brand_info BOOLEAN NOT NULL DEFAULT true,
  brand_mentions TEXT NOT NULL DEFAULT 'regular' CHECK (brand_mentions IN ('none', 'minimal', 'regular', 'maximal')),
  competitor_mentions TEXT NOT NULL DEFAULT 'minimal' CHECK (competitor_mentions IN ('none', 'minimal', 'regular', 'maximal')),
  internal_links TEXT NOT NULL DEFAULT 'few' CHECK (internal_links IN ('none', 'few', 'regular', 'many')),
  external_search BOOLEAN NOT NULL DEFAULT true,
  external_links TEXT NOT NULL DEFAULT 'few' CHECK (external_links IN ('none', 'few', 'regular', 'many')),
  custom_instructions TEXT DEFAULT '',
  exclusions TEXT DEFAULT '',
  image_style TEXT NOT NULL DEFAULT 'professional' CHECK (image_style IN ('professional', 'creative', 'minimal', 'vibrant', 'dark')),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure unique settings per brand
  UNIQUE(brand_id)
);

-- Enable RLS
ALTER TABLE public.content_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view content settings for their brands" 
ON public.content_settings 
FOR SELECT 
USING (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.brands 
    WHERE brands.id = content_settings.brand_id 
    AND brands.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create content settings for their brands" 
ON public.content_settings 
FOR INSERT 
WITH CHECK (
  user_id = auth.uid() AND 
  EXISTS (
    SELECT 1 FROM public.brands 
    WHERE brands.id = content_settings.brand_id 
    AND brands.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update content settings for their brands" 
ON public.content_settings 
FOR UPDATE 
USING (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.brands 
    WHERE brands.id = content_settings.brand_id 
    AND brands.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete content settings for their brands" 
ON public.content_settings 
FOR DELETE 
USING (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.brands 
    WHERE brands.id = content_settings.brand_id 
    AND brands.user_id = auth.uid()
  )
);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_content_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_content_settings_updated_at
  BEFORE UPDATE ON public.content_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_content_settings_updated_at();