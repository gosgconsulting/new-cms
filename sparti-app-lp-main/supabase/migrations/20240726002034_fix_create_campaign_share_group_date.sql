CREATE OR REPLACE FUNCTION public.create_campaign_share(
  p_brand_id uuid,
  p_campaign_id uuid
)
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
  v_group_date date;
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

  -- Get the campaign's creation date for the group_date
  SELECT created_at::date INTO v_group_date
  FROM public.campaigns
  WHERE id = p_campaign_id;

  IF v_group_date IS NULL THEN
    RAISE EXCEPTION 'Campaign not found';
  END IF;

  v_slug := public.generate_campaign_share_slug(v_group_date);

  INSERT INTO public.campaign_shares (slug, brand_id, campaign_id, group_date, created_by)
  VALUES (v_slug, p_brand_id, p_campaign_id, v_group_date, v_user)
  RETURNING id INTO v_share_id;

  RETURN v_slug;
END;
$$;
