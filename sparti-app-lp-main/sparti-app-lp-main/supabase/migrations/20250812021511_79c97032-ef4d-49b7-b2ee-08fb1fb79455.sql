-- Adjust backfill to avoid touching seo_campaign_id (it may reference seo_campaigns)
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
    WHERE bp.campaign_id IS NULL
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
        campaign_creation_date = (rec.group_date)::timestamptz
    WHERE bp.user_id = rec.user_id
      AND bp.brand_id = rec.brand_id
      AND COALESCE((bp.campaign_creation_date)::date, (bp.published_date)::date, (bp.scheduled_date)::date, (bp.created_at)::date) = rec.group_date
      AND bp.campaign_id IS NULL;
  END LOOP;
END$$;

-- Execute backfill
SELECT public.backfill_legacy_seo_campaigns();

-- Ensure campaign_id FK only (do NOT alter seo_campaign_id which may reference seo_campaigns)
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