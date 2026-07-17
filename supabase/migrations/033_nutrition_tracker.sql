-- Add macro columns to meal_logs
ALTER TABLE public.meal_logs
  ADD COLUMN IF NOT EXISTS protein numeric(5,1),
  ADD COLUMN IF NOT EXISTS fat numeric(5,1),
  ADD COLUMN IF NOT EXISTS carbs numeric(5,1);

-- Daily nutrition goals per user
CREATE TABLE IF NOT EXISTS public.nutrition_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  calories_goal integer NOT NULL DEFAULT 2000,
  protein_goal integer NOT NULL DEFAULT 150,
  fat_goal integer NOT NULL DEFAULT 65,
  carbs_goal integer NOT NULL DEFAULT 200,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);
ALTER TABLE public.nutrition_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own nutrition goals" ON public.nutrition_goals
  FOR ALL USING (auth.uid() = user_id);

-- Saved foods for 1-tap re-logging
CREATE TABLE IF NOT EXISTS public.saved_foods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  food_name text NOT NULL,
  meal_type text NOT NULL DEFAULT 'meal1',
  calories integer,
  protein numeric(5,1),
  fat numeric(5,1),
  carbs numeric(5,1),
  saved_at timestamptz DEFAULT now()
);
ALTER TABLE public.saved_foods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own saved foods" ON public.saved_foods
  FOR ALL USING (auth.uid() = user_id);
