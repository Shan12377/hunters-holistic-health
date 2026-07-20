-- Page views: lightweight product analytics so navigation decisions use real data.
-- Run this in Supabase SQL Editor. Clients insert their own rows; only educators read.

create table if not exists public.page_views (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  page text not null,
  viewed_at timestamptz not null default now()
);

create index if not exists page_views_page_idx on public.page_views (page, viewed_at);

alter table public.page_views enable row level security;

create policy "users insert own page views"
  on public.page_views for insert
  with check (auth.uid() = user_id);

create policy "educators read page views"
  on public.page_views for select
  using (exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'educator'
  ));
