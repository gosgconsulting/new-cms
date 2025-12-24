-- Tracked keywords for SEO
create table if not exists public.seo_tracked_keywords (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  brand_id uuid not null,
  keyword text not null,
  intents text[] not null default '{}',
  source text,
  created_at timestamptz not null default now(),
  unique (user_id, brand_id, keyword)
);

alter table public.seo_tracked_keywords enable row level security;

drop policy if exists "Users read own keywords" on public.seo_tracked_keywords;
drop policy if exists "Users write own keywords" on public.seo_tracked_keywords;

create policy "Users read own keywords" on public.seo_tracked_keywords for select
using (auth.uid() = user_id);

create policy "Users write own keywords" on public.seo_tracked_keywords for all
using (auth.uid() = user_id) with check (auth.uid() = user_id);

