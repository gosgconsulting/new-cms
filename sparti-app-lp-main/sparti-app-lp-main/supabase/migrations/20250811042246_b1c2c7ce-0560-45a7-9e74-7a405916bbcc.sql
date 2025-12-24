-- Grant execute permissions for shared campaign RPCs and create share helper, idempotent

-- Grant for get_shared_campaign_posts(p_slug text)
DO $$
BEGIN
  IF to_regprocedure('public.get_shared_campaign_posts(text)') IS NOT NULL THEN
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.get_shared_campaign_posts(text) TO anon, authenticated';
  END IF;
END $$;

-- Grant for update_shared_campaign_post()
DO $$
BEGIN
  -- Variant with uuid post id
  IF to_regprocedure('public.update_shared_campaign_post(text,uuid,text,text,text,text,text)') IS NOT NULL THEN
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.update_shared_campaign_post(text,uuid,text,text,text,text,text) TO anon, authenticated';
  END IF;
  -- Fallback variant with text post id
  IF to_regprocedure('public.update_shared_campaign_post(text,text,text,text,text,text,text)') IS NOT NULL THEN
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.update_shared_campaign_post(text,text,text,text,text,text,text) TO anon, authenticated';
  END IF;
END $$;

-- Grant for create_campaign_share on all overloads to authenticated users only
DO $$
DECLARE
  fn regprocedure;
BEGIN
  FOR fn IN (
    SELECT p.oid::regprocedure
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'create_campaign_share'
  ) LOOP
    EXECUTE 'GRANT EXECUTE ON FUNCTION ' || fn || ' TO authenticated';
  END LOOP;
END $$;