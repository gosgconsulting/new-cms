CREATE OR REPLACE FUNCTION public.get_shared_campaign_posts(p_slug text)
RETURNS TABLE(
  id uuid,
  title text,
  content text,
  status text,
  meta_description text,
  keywords text[],
  author text,
  published_date timestamptz,
  scheduled_date timestamptz,
  cms_published boolean,
  cms_url text,
  user_id uuid,
  brand_id uuid,
  created_at timestamptz,
  updated_at timestamptz,
  slug text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  v_share record;
BEGIN
  SELECT * INTO v_share
  FROM public.campaign_shares
  WHERE public.campaign_shares.slug = p_slug AND is_active = true AND (expires_at IS NULL OR expires_at > now());

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Share not found or inactive';
  END IF;

  RETURN QUERY
  SELECT bp.id, bp.title, bp.content, bp.status, bp.meta_description, bp.keywords, bp.author,
         bp.published_date, bp.scheduled_date, bp.cms_published, bp.cms_url, bp.user_id, bp.brand_id,
         bp.created_at, bp.updated_at, bp.slug
  FROM public.blog_posts bp
  WHERE bp.campaign_id = v_share.campaign_id
  ORDER BY bp.created_at DESC;
END;
$$;
