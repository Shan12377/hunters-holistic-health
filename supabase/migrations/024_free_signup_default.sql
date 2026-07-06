-- 024_free_signup_default.sql
-- New signups land on the free Lobby tier instead of Foundation.
-- Existing users are unaffected: only the column default changes.
-- Stripe webhook upgrades plan to 'foundation' | 'program' | 'vip' | 'overhaul'
-- after a successful checkout, exactly as before.

ALTER TABLE public.profiles
  ALTER COLUMN plan SET DEFAULT 'free';
