-- Fix campaign naming to always reflect the brand of the campaign
-- by updating the get_brand_campaigns RPC to compute the name from brands.name

DROP FUNCTION IF EXISTS public.get_brand_campaigns(uuid, uuid, text, timestamptz);
CREATE OR REPLACE FUNCTION public.get_brand_campaigns(
  p_user_id uuid,
  p_brand_id uuid,
  p_status text DEFAULT NULL,
  p_since timestamptz DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  source text,
  user_id uuid,
  brand_id uuid,
  name text,
  description text,
  status text,
  created_at timestamptz,
  updated_at timestamptz,
  keywords text[],
  number_of_articles integer,
  article_length text,
  posts jsonb,
  meta jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    'seo'::text AS source,
    c.user_id,
    c.brand_id,
    CONCAT(b.name, ' SEO Campaign - ', TO_CHAR(c.created_at, 'YYYY-MM-DD')) AS name,
    c.description,
    c.status,
    c.created_at,
    c.updated_at,
    COALESCE(
      ARRAY(SELECT DISTINCT jsonb_array_elements_text(c.keywords)),
      '{}'::text[]
    ) AS keywords,
    COALESCE(bp_post.count_posts, 0) AS number_of_articles,
    NULL::text AS article_length,
    COALESCE(bp_post.posts, '[]'::jsonb) AS posts,
    jsonb_build_object('brand_id', c.brand_id) AS meta
  FROM public.campaigns c
  JOIN public.brands b ON b.id = c.brand_id
  LEFT JOIN LATERAL (
    SELECT 
      COUNT(*)::int AS count_posts,
      jsonb_agg(jsonb_build_object(
        'id', bp.id,
        'title', bp.title,
        'status', bp.status,
        'cms_url', bp.cms_url,
        'created_at', bp.created_at
      ) ORDER BY bp.created_at ASC) AS posts
    FROM public.blog_posts bp
    WHERE bp.campaign_id = c.id
  ) bp_post ON TRUE
  WHERE c.user_id = p_user_id
    AND (p_brand_id IS NULL OR c.brand_id = p_brand_id)
    AND (COALESCE(c.search_criteria->>'type', 'seo') = 'seo')
    AND (p_since IS NULL OR c.created_at >= p_since)
    AND (p_status IS NULL OR c.status = p_status)
  ORDER BY c.created_at DESC;
END
$$;

-- Create share RPC (fix DISTINCT placement, add validation)
CREATE OR REPLACE FUNCTION public.create_campaign_share(p_brand_id uuid, p_group_date date, p_post_ids uuid[])
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  v_slug text;
  v_user uuid := auth.uid();
  v_can_read boolean;
  v_share_id uuid;
  v_valid_post_ids uuid[];
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Must be authenticated';
  END IF;

  -- Verify user has access to the brand
  SELECT (
    EXISTS (SELECT 1 FROM public.brands b WHERE b.id = p_brand_id AND b.user_id = v_user)
    OR public.is_brand_in_user_workspace(p_brand_id, v_user)
  ) INTO v_can_read;

  IF NOT v_can_read THEN
    RAISE EXCEPTION 'You do not have permission to share this brand';
  END IF;

  -- Validate that provided post IDs exist and belong to the user/brand
  SELECT array_agg(bp.id)
  INTO v_valid_post_ids
  FROM public.blog_posts bp
  WHERE bp.id = ANY(p_post_ids)
    AND bp.brand_id = p_brand_id
    AND bp.user_id = v_user;

  IF v_valid_post_ids IS NULL OR array_length(v_valid_post_ids, 1) = 0 THEN
    RAISE EXCEPTION 'No valid posts found to share. Please ensure articles are generated.';
  END IF;

  v_slug := public.generate_campaign_share_slug(p_group_date);

  INSERT INTO public.campaign_shares (slug, brand_id, group_date, created_by)
  VALUES (v_slug, p_brand_id, p_group_date, v_user)
  RETURNING id INTO v_share_id;

  -- Insert only valid, unique post IDs
  INSERT INTO public.campaign_share_articles (share_id, post_id)
  SELECT DISTINCT v_share_id, pid
  FROM unnest(v_valid_post_ids) AS pid
  ON CONFLICT DO NOTHING;

  RETURN v_slug;
END;
$$;

-- Get posts RPC
CREATE OR REPLACE FUNCTION public.get_shared_campaign_posts(p_slug text)
RETURNS TABLE(
  id uuid,
  title text,
  status text,
  cms_url text,
  created_at timestamptz,
  updated_at timestamptz,
  meta jsonb
)
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