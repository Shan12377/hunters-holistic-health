-- 022_free_plan.sql
-- Add 'free' as a valid plan value so Lobby-tier accounts can exist.
-- Existing members keep their current plan; default stays 'foundation'
-- until the free signup flow (Item 2) is wired up.

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_plan_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_plan_check
  CHECK (plan IN ('free', 'foundation', 'program', 'vip', 'overhaul'));
