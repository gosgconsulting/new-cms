create or replace function get_all_brand_campaign_stats(p_user_id uuid, p_copilot_type text)
returns json as $$
declare
  brand_stats json;
  query text;
  active_statuses text[];
  completed_statuses text[];
begin
  if p_copilot_type = 'seo' then
    active_statuses := array['to_write', 'in_progress', 'created'];
    completed_statuses := array['completed'];
  elsif p_copilot_type = 'sem' then
    active_statuses := array['draft', 'active'];
    completed_statuses := array['completed', 'ended', 'paused'];
  else
    active_statuses := array[]::text[];
    completed_statuses := array[]::text[];
  end if;

  query := format('
    select
      json_object_agg(
        brand_id,
        json_build_object(
          ''active'', active_campaigns,
          ''completed'', completed_campaigns,
          ''total'', total_campaigns
        )
      )
    from (
      select
        b.id as brand_id,
        count(c.id) as total_campaigns,
        count(c.id) filter (where c.status = any(%L)) as active_campaigns,
        count(c.id) filter (where c.status = any(%L)) as completed_campaigns
      from
        brands b
        left join %I c on c.brand_id = b.id
      where
        b.user_id = %L
      group by
        b.id
    ) as stats;',
    active_statuses,
    completed_statuses,
    p_copilot_type || '_campaigns',
    p_user_id
  );

  execute query into brand_stats;

  return brand_stats;
end;
$$ language plpgsql;
