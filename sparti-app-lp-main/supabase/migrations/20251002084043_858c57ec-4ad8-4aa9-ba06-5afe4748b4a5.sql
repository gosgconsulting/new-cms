-- Add slug column to blog_posts if it doesn't exist
ALTER TABLE public.blog_posts 
ADD COLUMN IF NOT EXISTS preview_slug TEXT UNIQUE;

-- Create function to generate unique preview slug
CREATE OR REPLACE FUNCTION public.generate_preview_slug(
  p_brand_id UUID,
  p_title TEXT,
  p_post_id UUID
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  brand_name TEXT;
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Get brand name
  SELECT name INTO brand_name
  FROM brands
  WHERE id = p_brand_id;
  
  IF brand_name IS NULL THEN
    brand_name := 'blog';
  END IF;
  
  -- Generate base slug from brand name and title
  base_slug := lower(regexp_replace(brand_name || '-' || p_title, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  
  -- Limit length
  IF length(base_slug) > 100 THEN
    base_slug := substring(base_slug from 1 for 100);
  END IF;
  
  final_slug := base_slug;
  
  -- Check for uniqueness and append post_id if needed
  WHILE EXISTS (
    SELECT 1 FROM blog_posts 
    WHERE preview_slug = final_slug 
    AND id != p_post_id
  ) LOOP
    counter := counter + 1;
    -- If duplicate, append short ID
    final_slug := base_slug || '-' || substring(p_post_id::text from 1 for 8);
    EXIT; -- Exit after first attempt with ID
  END LOOP;
  
  RETURN final_slug;
END;
$$;

-- Create trigger to auto-generate slug on insert/update
CREATE OR REPLACE FUNCTION public.auto_generate_preview_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.preview_slug IS NULL OR NEW.title != OLD.title THEN
    NEW.preview_slug := generate_preview_slug(NEW.brand_id, NEW.title, NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for new posts
DROP TRIGGER IF EXISTS trigger_auto_generate_preview_slug ON public.blog_posts;
CREATE TRIGGER trigger_auto_generate_preview_slug
  BEFORE INSERT OR UPDATE OF title
  ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_preview_slug();

-- Backfill existing posts with slugs
UPDATE public.blog_posts
SET preview_slug = generate_preview_slug(brand_id, title, id)
WHERE preview_slug IS NULL;

-- Create public access policy for blog preview
CREATE POLICY "Public can view blog posts by slug"
ON public.blog_posts
FOR SELECT
TO public
USING (preview_slug IS NOT NULL);