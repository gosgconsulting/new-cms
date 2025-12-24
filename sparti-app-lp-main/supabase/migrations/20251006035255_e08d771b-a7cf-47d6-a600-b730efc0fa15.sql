-- Create featured_image_gallery table
CREATE TABLE public.featured_image_gallery (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.featured_image_gallery ENABLE ROW LEVEL SECURITY;

-- Create policies for brand-based access
CREATE POLICY "Users can view images for their brands"
  ON public.featured_image_gallery
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    is_brand_in_user_workspace(brand_id, auth.uid())
  );

CREATE POLICY "Users can insert images for their brands"
  ON public.featured_image_gallery
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND (
      EXISTS (SELECT 1 FROM public.brands WHERE id = brand_id AND user_id = auth.uid()) OR
      is_brand_in_user_workspace(brand_id, auth.uid())
    )
  );

CREATE POLICY "Users can delete images for their brands"
  ON public.featured_image_gallery
  FOR DELETE
  USING (
    auth.uid() = user_id OR
    is_brand_in_user_workspace(brand_id, auth.uid())
  );

-- Create index for better performance
CREATE INDEX idx_featured_image_gallery_brand_id ON public.featured_image_gallery(brand_id);
CREATE INDEX idx_featured_image_gallery_user_id ON public.featured_image_gallery(user_id);