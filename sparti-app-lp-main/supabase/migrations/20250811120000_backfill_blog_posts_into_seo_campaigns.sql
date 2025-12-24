-- Backfill historical blog_posts into seo_campaigns so past content appears in unified SEO campaigns
-- Strategy:
-- 1) Find blog_posts with no seo_campaign_id
-- 2) Group by user_id, brand_id, group_date (campaign_creation_date::date if present else created_at::date)
-- 3) Insert a minimal seo_campaigns row for each group
-- 4) Link the group's blog_posts to the new campaign via seo_campaign_id

do $$
declare
  r record;
  v_campaign_id uuid;
  v_group_date date;
  v_status text;
  v_keywords text[];
  v_num_articles int;
begin
  -- Iterate over distinct groups of orphaned posts
  for r in
    select
      bp.user_id,
      bp.brand_id,
      coalesce(date(bp.campaign_creation_date), date(bp.created_at)) as group_date
    from public.blog_posts bp
    where bp.seo_campaign_id is null
      and bp.brand_id is not null
      and bp.user_id is not null
    group by bp.user_id, bp.brand_id, coalesce(date(bp.campaign_creation_date), date(bp.created_at))
  loop
    v_group_date := r.group_date;

    -- Aggregate group stats
    select
      count(*)::int,
      (case when bool_and(status = 'published') then 'completed' else 'in_progress' end),
      coalesce(array_agg(distinct unnest(coalesce(bp.keywords, array[]::text[]))), array[]::text[])
    into v_num_articles, v_status, v_keywords
    from public.blog_posts bp
    where bp.seo_campaign_id is null
      and bp.user_id = r.user_id
      and bp.brand_id = r.brand_id
      and coalesce(date(bp.campaign_creation_date), date(bp.created_at)) = r.group_date;

    -- Insert a new seo_campaigns row representing this group
    insert into public.seo_campaigns (
      user_id,
      brand_id,
      name,
      website_url,
      business_description,
      number_of_articles,
      article_length,
      article_type,
      language,
      target_country,
      status,
      current_step,
      progress,
      organic_keywords,
      created_at,
      updated_at
    ) values (
      r.user_id,
      r.brand_id,
      'SEO Campaign - ' || to_char(v_group_date, 'YYYY-MM-DD'),
      null,
      'Backfilled campaign from historical blog posts',
      v_num_articles,
      'medium',
      'blog',
      'English',
      'United States',
      v_status,
      case when v_status = 'completed' then 'completed' else 'keyword_research' end,
      case when v_status = 'completed' then 100 else 60 end,
      v_keywords,
      (v_group_date)::timestamptz,
      now()
    )
    returning id into v_campaign_id;

    -- Link posts to the newly created campaign
    update public.blog_posts bp
    set seo_campaign_id = v_campaign_id
    where bp.seo_campaign_id is null
      and bp.user_id = r.user_id
      and bp.brand_id = r.brand_id
      and coalesce(date(bp.campaign_creation_date), date(bp.created_at)) = r.group_date;
  end loop;
end $$;


