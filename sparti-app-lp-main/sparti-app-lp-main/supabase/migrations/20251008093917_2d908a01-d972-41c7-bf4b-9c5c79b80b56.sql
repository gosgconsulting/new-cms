-- Create table for shared internal links
CREATE TABLE IF NOT EXISTS public.seo_internal_links_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL,
  share_slug TEXT NOT NULL UNIQUE,
  filter_country TEXT,
  filter_tag TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_seo_internal_links_shares_slug ON public.seo_internal_links_shares(share_slug);
CREATE INDEX idx_seo_internal_links_shares_brand ON public.seo_internal_links_shares(brand_id);
CREATE INDEX idx_seo_internal_links_shares_user ON public.seo_internal_links_shares(user_id);

-- Enable RLS
ALTER TABLE public.seo_internal_links_shares ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own shares
CREATE POLICY "Users can view their own link shares"
  ON public.seo_internal_links_shares
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own shares
CREATE POLICY "Users can create their own link shares"
  ON public.seo_internal_links_shares
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own shares
CREATE POLICY "Users can update their own link shares"
  ON public.seo_internal_links_shares
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own shares
CREATE POLICY "Users can delete their own link shares"
  ON public.seo_internal_links_shares
  FOR DELETE
  USING (auth.uid() = user_id);

-- Public can view active shares
CREATE POLICY "Public can view active link shares"
  ON public.seo_internal_links_shares
  FOR SELECT
  USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- Function to generate unique share slug
CREATE OR REPLACE FUNCTION generate_links_share_slug()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  base_slug := 'links-' || to_char(now(), 'YYYYMMDD-HH24MISS');
  final_slug := base_slug;
  
  WHILE EXISTS (SELECT 1 FROM public.seo_internal_links_shares WHERE share_slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$;