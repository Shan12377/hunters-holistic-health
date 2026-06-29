-- Push notification subscriptions
create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null unique,
  subscription jsonb not null,
  created_at timestamptz default now()
);
alter table push_subscriptions enable row level security;
create policy "users manage own subscription" on push_subscriptions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- Educators can read all (for cron function using service role key — not needed via RLS)

-- Reminder settings column on profiles
alter table profiles
  add column if not exists reminder_settings jsonb default '{
    "fasting_open":  {"enabled": false, "time": "19:00"},
    "fasting_close": {"enabled": false, "time": "07:00"},
    "supplements":   {"enabled": false, "time": "08:00"},
    "afternoon":     {"enabled": false, "time": "13:00"},
    "daily_log":     {"enabled": false, "time": "18:00"}
  }'::jsonb;
