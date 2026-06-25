-- Add plan field to profiles for tier-based access gating
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'foundation'
  CHECK (plan IN ('foundation', 'program', 'vip', 'overhaul'));
