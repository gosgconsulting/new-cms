-- Fix the get_shared_campaign_posts function to correctly return all required fields
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
  WHERE slug = p_slug AND is_active = true AND (expires_at IS NULL OR expires_at > now());

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Share not found or inactive';
  END IF;

  RETURN QUERY
  SELECT bp.id, bp.title, bp.content, bp.status, bp.meta_description, bp.keywords, bp.author,
         bp.published_date, bp.scheduled_date, bp.cms_published, bp.cms_url, bp.user_id, bp.brand_id,
         bp.created_at, bp.updated_at, bp.slug
  FROM public.campaign_share_articles csa
  JOIN public.blog_posts bp ON bp.id = csa.post_id
  WHERE csa.share_id = v_share.id
  ORDER BY bp.created_at DESC;
END;
$$;

-- Fix the update_shared_campaign_post function to correctly update and return the post
CREATE OR REPLACE FUNCTION public.update_shared_campaign_post(
  p_slug text,
  p_post_id uuid,
  p_title text DEFAULT NULL,
  p_meta_description text DEFAULT NULL,
  p_content text DEFAULT NULL,
  p_status text DEFAULT NULL,
  p_cms_url text DEFAULT NULL
)
RETURNS SETOF public.blog_posts
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  v_share record;
  v_can_edit boolean;
BEGIN
  SELECT *, COALESCE((permissions->>'edit')::boolean, false) AS can_edit
  INTO v_share
  FROM public.campaign_shares
  WHERE slug = p_slug AND is_active = true AND (expires_at IS NULL OR expires_at > now());

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Share not found or inactive';
  END IF;

  v_can_edit := COALESCE((v_share.permissions->>'edit')::boolean, false);
  IF NOT v_can_edit THEN
    RAISE EXCEPTION 'Editing is not allowed for this share';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.campaign_share_articles csa
    WHERE csa.share_id = v_share.id AND csa.post_id = p_post_id
  ) THEN
    RAISE EXCEPTION 'Post is not part of this share';
  END IF;

  RETURN QUERY
  UPDATE public.blog_posts bp SET
    title = COALESCE(p_title, bp.title),
    meta_description = COALESCE(p_meta_description, bp.meta_description),
    content = COALESCE(p_content, bp.content),
    status = COALESCE(p_status, bp.status),
    cms_url = COALESCE(p_cms_url, bp.cms_url),
    updated_at = now()
  WHERE bp.id = p_post_id
  RETURNING *;
END;
$$;
