-- A) Create tracked keywords table for SEO (idempotent)
CREATE TABLE IF NOT EXISTS public.seo_tracked_keywords (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  brand_id uuid NOT NULL,
  keyword text NOT NULL,
  intents text[] NOT NULL DEFAULT '{}',
  source text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.seo_tracked_keywords ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uniq_tracked_keyword_per_brand_user'
  ) THEN
    ALTER TABLE public.seo_tracked_keywords
      ADD CONSTRAINT uniq_tracked_keyword_per_brand_user UNIQUE (brand_id, user_id, keyword);
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_tracked_keywords_brand ON public.seo_tracked_keywords(brand_id);
CREATE INDEX IF NOT EXISTS idx_tracked_keywords_user ON public.seo_tracked_keywords(user_id);
CREATE INDEX IF NOT EXISTS idx_tracked_keywords_keyword ON public.seo_tracked_keywords(keyword);

DROP POLICY IF EXISTS "Tracked keywords: users and workspace members can read" ON public.seo_tracked_keywords;
CREATE POLICY "Tracked keywords: users and workspace members can read"
ON public.seo_tracked_keywords
FOR SELECT
USING (
  user_id = auth.uid() OR (
    EXISTS (
      SELECT 1 FROM public.brands b
      JOIN public.workspace_members wm ON wm.workspace_id = b.workspace_id
      WHERE b.id = seo_tracked_keywords.brand_id
      AND wm.user_id = auth.uid()
      AND wm.status = 'active'
    )
  )
);

DROP POLICY IF EXISTS "Tracked keywords: users can insert for their brands" ON public.seo_tracked_keywords;
CREATE POLICY "Tracked keywords: users can insert for their brands"
ON public.seo_tracked_keywords
FOR INSERT
WITH CHECK (
  user_id = auth.uid() OR (
    EXISTS (
      SELECT 1 FROM public.brands b
      JOIN public.workspace_members wm ON wm.workspace_id = b.workspace_id
      WHERE b.id = seo_tracked_keywords.brand_id
      AND wm.user_id = auth.uid()
      AND wm.status = 'active'
    )
  )
);

DROP POLICY IF EXISTS "Tracked keywords: users can update own rows" ON public.seo_tracked_keywords;
CREATE POLICY "Tracked keywords: users can update own rows"
ON public.seo_tracked_keywords
FOR UPDATE
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Tracked keywords: users can delete own rows" ON public.seo_tracked_keywords;
CREATE POLICY "Tracked keywords: users can delete own rows"
ON public.seo_tracked_keywords
FOR DELETE
USING (user_id = auth.uid());

-- B) Clean invalid legacy references before adding FKs
UPDATE public.blog_posts bp
SET campaign_id = NULL
WHERE campaign_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = bp.campaign_id);

UPDATE public.blog_posts bp
SET seo_campaign_id = NULL
WHERE seo_campaign_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = bp.seo_campaign_id);

-- C) Backfill function to migrate historical posts into campaigns and link them
CREATE OR REPLACE FUNCTION public.backfill_legacy_seo_campaigns()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  rec RECORD;
  v_campaign_id uuid;
BEGIN
  FOR rec IN
    SELECT
      bp.user_id,
      bp.brand_id,
      COALESCE((bp.campaign_creation_date)::date, (bp.published_date)::date, (bp.scheduled_date)::date, (bp.created_at)::date) AS group_date
    FROM public.blog_posts bp
    WHERE (bp.campaign_id IS NULL AND bp.seo_campaign_id IS NULL)
      AND bp.user_id IS NOT NULL
      AND bp.brand_id IS NOT NULL
    GROUP BY bp.user_id, bp.brand_id, COALESCE((bp.campaign_creation_date)::date, (bp.published_date)::date, (bp.scheduled_date)::date, (bp.created_at)::date)
  LOOP
    SELECT c.id INTO v_campaign_id
    FROM public.campaigns c
    WHERE c.user_id = rec.user_id
      AND c.brand_id = rec.brand_id
      AND (c.search_criteria->>'type') = 'seo'
      AND date_trunc('day', c.created_at) = (rec.group_date)::timestamptz
    LIMIT 1;

    IF v_campaign_id IS NULL THEN
      INSERT INTO public.campaigns (
        user_id, brand_id, name, description, status, keywords, suggested_titles, search_criteria, created_at, updated_at
      ) VALUES (
        rec.user_id, rec.brand_id,
        'SEO ' || to_char(rec.group_date, 'YYYY-MM-DD'),
        'Auto-imported from blog posts',
        'to_write',
        '[]'::jsonb,
        '[]'::jsonb,
        jsonb_build_object('type','seo'),
        (rec.group_date)::timestamptz,
        now()
      ) RETURNING id INTO v_campaign_id;
    END IF;

    UPDATE public.blog_posts bp
    SET campaign_id = v_campaign_id,
        seo_campaign_id = v_campaign_id,
        campaign_creation_date = (rec.group_date)::timestamptz
    WHERE bp.user_id = rec.user_id
      AND bp.brand_id = rec.brand_id
      AND COALESCE((bp.campaign_creation_date)::date, (bp.published_date)::date, (bp.scheduled_date)::date, (bp.created_at)::date) = rec.group_date
      AND (bp.campaign_id IS NULL AND bp.seo_campaign_id IS NULL);
  END LOOP;
END$$;

-- Execute backfill now
SELECT public.backfill_legacy_seo_campaigns();

-- D) Now add foreign keys after backfill
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_blog_posts_campaign_id_campaigns'
  ) THEN
    ALTER TABLE public.blog_posts
      ADD CONSTRAINT fk_blog_posts_campaign_id_campaigns
      FOREIGN KEY (campaign_id)
      REFERENCES public.campaigns(id)
      ON DELETE SET NULL;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_blog_posts_seo_campaign_id_campaigns'
  ) THEN
    ALTER TABLE public.blog_posts
      ADD CONSTRAINT fk_blog_posts_seo_campaign_id_campaigns
      FOREIGN KEY (seo_campaign_id)
      REFERENCES public.campaigns(id)
      ON DELETE SET NULL;
  END IF;
END$$;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_campaign_id ON public.blog_posts(campaign_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_brand_id ON public.blog_posts(brand_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_user_brand_created ON public.campaigns(user_id, brand_id, created_at);

-- E) RPC: get_brand_campaigns used by UI
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
    c.name,
    c.description,
    c.status,
    c.created_at,
    c.updated_at,
    COALESCE(
      (SELECT ARRAY(
        SELECT DISTINCT k FROM (
          SELECT unnest(ARRAY(SELECT jsonb_array_elements_text(c.keywords))) AS k
        ) s
      )), '{}'::text[]
    ) AS keywords,
    COALESCE(bp_post.count_posts, 0) AS number_of_articles,
    NULL::text AS article_length,
    COALESCE(bp_post.posts, '[]'::jsonb) AS posts,
    jsonb_build_object('brand_id', c.brand_id) AS meta
  FROM public.campaigns c
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
    AND ((c.search_criteria->>'type') = 'seo')
    AND (p_since IS NULL OR c.created_at >= p_since)
    AND (p_status IS NULL OR c.status = p_status)
  ORDER BY c.created_at DESC;
END
$$;

-- F) RPC: create_campaign_share used by UI
DROP FUNCTION IF EXISTS public.create_campaign_share(uuid, date, uuid[]);
CREATE OR REPLACE FUNCTION public.create_campaign_share(
  p_brand_id uuid,
  p_group_date date,
  p_post_ids uuid[]
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_slug text;
  v_share_id uuid;
BEGIN
  IF NOT (
    EXISTS (SELECT 1 FROM public.brands b WHERE b.id = p_brand_id AND b.user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.workspace_members wm
      JOIN public.brands b ON b.workspace_id = wm.workspace_id
      WHERE b.id = p_brand_id AND wm.user_id = auth.uid() AND wm.status = 'active'
    )
  ) THEN
    RAISE EXCEPTION 'Permission denied to share this brand';
  END IF;

  v_slug := public.generate_campaign_share_slug(p_group_date);

  INSERT INTO public.campaign_shares (brand_id, created_by, group_date, slug)
  VALUES (p_brand_id, auth.uid(), p_group_date, v_slug)
  RETURNING id INTO v_share_id;

  INSERT INTO public.campaign_share_articles (share_id, post_id)
  SELECT v_share_id, unnest(p_post_ids);

  RETURN v_slug;
END;
$$;