
create or replace function get_all_brand_campaign_stats(p_user_id uuid)
returns json as $$
declare
  brand_stats json;
begin
  select
    json_object_agg(
      brand_id,
      json_build_object(
        'active', active_campaigns,
        'completed', completed_campaigns,
        'total', total_campaigns
      )
    )
  into brand_stats
  from (
    select
      b.id as brand_id,
      count(c.id) as total_campaigns,
      count(c.id) filter (where c.status in ('to_write', 'in_progress')) as active_campaigns,
      count(c.id) filter (where c.status = 'completed') as completed_campaigns
    from
      brands b
      left join campaigns c on (c.search_criteria->>'brand_id')::uuid = b.id and c.search_criteria->>'type' = 'seo'
    where
      b.user_id = p_user_id
    group by
      b.id
  ) as stats;

  return brand_stats;
end;
$$ language plpgsql;
