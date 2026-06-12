-- ============================================================
-- Hunter's Holistic Health: Blood Sugar Logs
-- ============================================================
-- Run this in: Supabase Dashboard -> SQL Editor -> New Query
-- ============================================================

CREATE TABLE IF NOT EXISTS public.blood_sugar_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  glucose_mg_dl INTEGER NOT NULL CHECK (glucose_mg_dl BETWEEN 20 AND 600),
  reading_context TEXT NOT NULL CHECK (reading_context IN ('fasting', 'before_meal', 'post_meal_2hr', 'bedtime')),
  notes TEXT CHECK (char_length(notes) <= 500),
  logged_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.blood_sugar_logs ENABLE ROW LEVEL SECURITY;

-- Users can manage their own readings
CREATE POLICY "Users can manage own blood sugar logs"
  ON public.blood_sugar_logs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Educators can view all blood sugar logs
CREATE POLICY "Educators can view all blood sugar logs"
  ON public.blood_sugar_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'educator'
    )
  );

CREATE INDEX IF NOT EXISTS idx_bs_logs_user_date ON public.blood_sugar_logs(user_id, logged_at DESC);
