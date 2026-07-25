-- Add afternoon supplements checkbox and sleep tracking to daily_logs

ALTER TABLE public.daily_logs
  ADD COLUMN IF NOT EXISTS supplement_noon_done boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sleep_hours        numeric(4,1) DEFAULT null,
  ADD COLUMN IF NOT EXISTS sleep_quality      integer DEFAULT null;

-- sleep_quality is 1-5 (1 = restless, 5 = refreshed)
ALTER TABLE public.daily_logs
  ADD CONSTRAINT daily_logs_sleep_quality_range
  CHECK (sleep_quality IS NULL OR (sleep_quality >= 1 AND sleep_quality <= 5));
