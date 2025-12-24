-- Add backlinks tracking columns to blog_posts table
ALTER TABLE public.blog_posts 
ADD COLUMN IF NOT EXISTS is_backlink_article BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS internal_link_id UUID,
ADD COLUMN IF NOT EXISTS backlink_anchor_text TEXT;

-- Create index for backlink queries
CREATE INDEX IF NOT EXISTS idx_blog_posts_backlinks 
ON public.blog_posts(is_backlink_article, brand_id) 
WHERE is_backlink_article = true;

-- Add comment for documentation
COMMENT ON COLUMN public.blog_posts.is_backlink_article IS 'Indicates if this article is part of a backlink strategy';
COMMENT ON COLUMN public.blog_posts.internal_link_id IS 'Reference to the internal link used in this backlink article';
COMMENT ON COLUMN public.blog_posts.backlink_anchor_text IS 'The anchor text used for the backlink';