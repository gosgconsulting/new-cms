-- Add brand_id to legacy campaigns if missing
alter table if exists public.campaigns
  add column if not exists brand_id uuid references public.brands(id) on delete set null;

create index if not exists idx_campaigns_brand_id on public.campaigns(brand_id);

-- Optional best-effort backfill using search_criteria.brand_id
update public.campaigns c
set brand_id = coalesce(c.brand_id, (c.search_criteria->>'brand_id')::uuid)
where c.brand_id is null and (c.search_criteria ? 'brand_id');

-- Unified view for brand campaigns
create or replace view public.v_brand_all_campaigns as
select
  s.id,
  'seo'::text as source,
  s.user_id,
  s.brand_id,
  ('SEO Campaign - ' || to_char(s.created_at, 'YYYY-MM-DD')) as name,
  s.business_description as description,
  (case s.status when 'in_progress' then 'in_progress' when 'completed' then 'completed' when 'failed' then 'failed' else 'to_write' end) as status,
  s.created_at,
  s.updated_at,
  coalesce(s.organic_keywords, array[]::text[]) as keywords,
  s.number_of_articles,
  s.article_length,
  coalesce((
    select jsonb_agg(jsonb_build_object('id', bp.id, 'title', bp.title, 'status', bp.status, 'cms_url', bp.cms_url, 'created_at', bp.created_at) order by bp.created_at desc)
    from public.blog_posts bp where bp.seo_campaign_id = s.id
  ), '[]'::jsonb) as posts,
  jsonb_build_object('style_analysis', s.style_analysis, 'live_analysis', s.live_analysis) as meta
from public.seo_campaigns s
union all
select
  c.id,
  'legacy'::text as source,
  c.user_id,
  c.brand_id,
  c.name,
  c.description,
  (case c.status when 'active' then 'in_progress' when 'completed' then 'completed' else 'to_write' end) as status,
  c.created_at,
  c.updated_at,
  coalesce(array(select jsonb_array_elements_text(c.search_criteria->'keywords')), array[]::text[]) as keywords,
  null::int as number_of_articles,
  null::text as article_length,
  '[]'::jsonb as posts,
  c.search_criteria as meta
from public.campaigns c;

-- RPC to fetch unified campaigns
create or replace function public.get_brand_campaigns(
  p_user_id uuid,
  p_brand_id uuid,
  p_status text default null,
  p_since timestamptz default null
)
returns setof public.v_brand_all_campaigns
language sql
security definer
set search_path = public
as $$
  select * from public.v_brand_all_campaigns v
  where v.user_id = p_user_id
    and (p_brand_id is null or v.brand_id = p_brand_id)
    and (p_status is null or v.status = p_status)
    and (p_since is null or v.created_at >= p_since)
  order by v.created_at desc;
$$;

