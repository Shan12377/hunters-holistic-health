-- Weight logs table for the weight tracker
create table if not exists weight_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  weight_lbs  numeric(5,1) not null,
  waist_in    numeric(4,1),
  hip_in      numeric(4,1),
  hunger_level int check (hunger_level between 1 and 5),
  protein_hit boolean,
  water_cups  int check (water_cups between 0 and 30),
  notes       text,
  logged_at   timestamptz not null default now()
);

alter table weight_logs enable row level security;

create policy "Users can manage own weight logs"
  on weight_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index weight_logs_user_date on weight_logs (user_id, logged_at desc);
