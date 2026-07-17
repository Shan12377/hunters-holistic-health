create table morning_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  log_date date not null,
  steps_completed jsonb not null default '{}',
  score int not null default 0,
  created_at timestamptz default now(),
  unique(user_id, log_date)
);
alter table morning_logs enable row level security;
create policy "user owns own logs" on morning_logs for all using (auth.uid() = user_id);
