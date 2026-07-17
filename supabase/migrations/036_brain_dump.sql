create table brain_dump_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  body text not null,
  routed_to text check (routed_to in ('content_idea','crm_followup','feature_request','challenge_idea')),
  routed_at timestamptz,
  created_at timestamptz default now()
);
alter table brain_dump_items enable row level security;
create policy "educator owns own items" on brain_dump_items for all using (auth.uid() = user_id);
