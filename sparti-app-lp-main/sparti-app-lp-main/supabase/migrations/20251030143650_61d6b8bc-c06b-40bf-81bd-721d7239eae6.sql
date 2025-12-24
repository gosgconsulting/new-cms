-- Create design library table for storing global design examples
CREATE TABLE public.design_library (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  image_data TEXT, -- Base64 data if needed
  hook_text TEXT,
  format TEXT,
  aspect_ratio TEXT,
  style_name TEXT,
  brand_name TEXT,
  campaign_goal TEXT,
  design_notes TEXT, -- Additional context about what makes this design work
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0 -- Track how many times this is used as reference
);

-- Enable RLS
ALTER TABLE public.design_library ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage design library"
ON public.design_library
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Everyone can view active designs (for AI context)
CREATE POLICY "Anyone can view active designs"
ON public.design_library
FOR SELECT
USING (is_active = true);

-- Create index for performance
CREATE INDEX idx_design_library_active ON public.design_library(is_active, created_at DESC);
CREATE INDEX idx_design_library_style ON public.design_library(style_name);
CREATE INDEX idx_design_library_format ON public.design_library(format);

-- Create trigger for updated_at
CREATE TRIGGER update_design_library_updated_at
BEFORE UPDATE ON public.design_library
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();