-- 022_free_plan.sql
-- Adds 'free' as a valid plan value for the Lobby tier.

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_plan_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_plan_check
  CHECK (plan IN ('free', 'foundation', 'program', 'vip', 'overhaul'));
