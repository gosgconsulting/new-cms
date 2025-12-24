create table if not exists ai_generation_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  agent_type text not null check (agent_type in ('seo', 'content', 'leads', 'analytics')),
  agent_name text not null,
  parameters jsonb not null default '{}',
  title text not null,
  content text not null default '',
  status text not null default 'generating' check (status in ('generating', 'completed', 'error')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table ai_generation_sessions enable row level security;

-- Create policies
create policy "Users can view their own generation sessions"
  on ai_generation_sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own generation sessions"
  on ai_generation_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own generation sessions"
  on ai_generation_sessions for update
  using (auth.uid() = user_id);

create policy "Users can delete their own generation sessions"
  on ai_generation_sessions for delete
  using (auth.uid() = user_id);

-- Create updated_at trigger
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger update_ai_generation_sessions_updated_at
  before update on ai_generation_sessions
  for each row execute function update_updated_at_column();
