-- Telegram connection and fasting reminder preferences
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS telegram_chat_id TEXT,
  ADD COLUMN IF NOT EXISTS fasting_start_hour SMALLINT CHECK (fasting_start_hour >= 0 AND fasting_start_hour < 24),
  ADD COLUMN IF NOT EXISTS fasting_duration_hours SMALLINT DEFAULT 16 CHECK (fasting_duration_hours >= 10 AND fasting_duration_hours <= 23),
  ADD COLUMN IF NOT EXISTS fasting_tz TEXT DEFAULT 'America/New_York',
  ADD COLUMN IF NOT EXISTS fasting_reminders BOOLEAN DEFAULT FALSE;
