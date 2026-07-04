-- Add optional tag columns to blood_sugar_logs
-- meal_tag: what the user ate around this reading
-- stress_tag: how they were feeling
-- walk_tag: whether they walked post-meal

ALTER TABLE blood_sugar_logs
  ADD COLUMN IF NOT EXISTS meal_tag   text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS stress_tag text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS walk_tag   text DEFAULT NULL;
