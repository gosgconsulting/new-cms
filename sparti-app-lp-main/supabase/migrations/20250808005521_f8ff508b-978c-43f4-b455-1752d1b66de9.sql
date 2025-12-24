-- Create tables for publicly shareable, editable SEO campaign groups (date-grouped blog posts)
-- 1) campaign_shares to hold share metadata
-- 2) campaign_share_articles to map shares to blog_post IDs

-- Create campaign_shares table
CREATE TABLE IF NOT EXISTS public.campaign_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  brand_id uuid NOT NULL,
  group_date date NOT NULL,
  permissions jsonb NOT NULL DEFAULT jsonb_build_object('view', true, 'edit', true),
  is_active boolean NOT NULL DEFAULT true,
  expires_at timestamptz,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create mapping table
CREATE TABLE IF NOT EXISTS public.campaign_share_articles (
  share_id uuid NOT NULL REFERENCES public.campaign_shares(id) ON DELETE CASCADE,
  post_id uuid NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (share_id, post_id)
);

-- Enable RLS
ALTER TABLE public.campaign_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_share_articles ENABLE ROW LEVEL SECURITY;

-- Basic policies
-- Owners can manage their shares
CREATE POLICY IF NOT EXISTS "Users can manage own campaign shares"
ON public.campaign_shares
FOR ALL
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

-- Public can view active shares by slug (optional direct selects)
CREATE POLICY IF NOT EXISTS "Public can read active campaign shares"
ON public.campaign_shares
FOR SELECT
USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- Owners can manage mapping rows
CREATE POLICY IF NOT EXISTS "Users can manage own campaign share articles"
ON public.campaign_share_articles
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.campaign_shares cs
  WHERE cs.id = campaign_share_articles.share_id AND cs.created_by = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.campaign_shares cs
  WHERE cs.id = campaign_share_articles.share_id AND cs.created_by = auth.uid()
));

-- Public can view mapping rows for active shares
CREATE POLICY IF NOT EXISTS "Public can read campaign share articles for active shares"
ON public.campaign_share_articles
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.campaign_shares cs
  WHERE cs.id = campaign_share_articles.share_id
    AND cs.is_active = true
    AND (cs.expires_at IS NULL OR cs.expires_at > now())
));

-- Trigger to keep updated_at fresh
CREATE OR REPLACE FUNCTION public.update_campaign_shares_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_campaign_shares_updated_at ON public.campaign_shares;
CREATE TRIGGER trg_update_campaign_shares_updated_at
BEFORE UPDATE ON public.campaign_shares
FOR EACH ROW
EXECUTE FUNCTION public.update_campaign_shares_updated_at();

-- Helper: generate unique slug
CREATE OR REPLACE FUNCTION public.generate_campaign_share_slug(p_group_date date)
RETURNS text AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
BEGIN
  base_slug := 'seo-' || to_char(p_group_date, 'YYYYMMDD');
  final_slug := base_slug;
  WHILE EXISTS (SELECT 1 FROM public.campaign_shares WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Create share RPC: validates user access then returns slug
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
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Must be authenticated';
  END IF;

  -- Verify user can access this brand (owner or workspace member)
  SELECT (
    EXISTS (SELECT 1 FROM public.brands b WHERE b.id = p_brand_id AND b.user_id = v_user)
    OR public.is_brand_in_user_workspace(p_brand_id, v_user)
  ) INTO v_can_read;

  IF NOT v_can_read THEN
    RAISE EXCEPTION 'You do not have permission to share this brand';
  END IF;

  v_slug := public.generate_campaign_share_slug(p_group_date);

  INSERT INTO public.campaign_shares (slug, brand_id, group_date, created_by)
  VALUES (v_slug, p_brand_id, p_group_date, v_user)
  RETURNING id INTO v_share_id;

  -- Map posts (distinct)
  INSERT INTO public.campaign_share_articles (share_id, post_id)
  SELECT v_share_id, DISTINCT pid
  FROM unnest(p_post_ids) AS pid
  ON CONFLICT DO NOTHING;

  RETURN v_slug;
END;
$$;

-- Get current posts for a share (live, synced)
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

-- Update a post via share slug (limited fields)
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

  -- Ensure the post is included in the share
  IF NOT EXISTS (
    SELECT 1 FROM public.campaign_share_articles csa
    WHERE csa.share_id = v_share.id AND csa.post_id = p_post_id
  ) THEN
    RAISE EXCEPTION 'Post is not part of this share';
  END IF;

  -- Update only provided fields
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