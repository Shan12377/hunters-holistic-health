-- Extend the Flat Belly Challenge from 5 days to 14 days.
--
-- The in-app tracker ran 5 days while the email sequence ran 14, so day 6
-- onward failed the CHECK constraint and could not be saved.
-- Applied to production 2026-08-09.

ALTER TABLE public.flat_belly_challenge
  DROP CONSTRAINT IF EXISTS flat_belly_challenge_challenge_day_check;

ALTER TABLE public.flat_belly_challenge
  ADD CONSTRAINT flat_belly_challenge_challenge_day_check
  CHECK (challenge_day >= 1 AND challenge_day <= 14);
