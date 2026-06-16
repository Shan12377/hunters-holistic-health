-- Exercise logs table
CREATE TABLE IF NOT EXISTS public.exercise_logs (
  id          UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id     UUID        REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  log_date    DATE        NOT NULL,
  exercise_type TEXT      NOT NULL,
  duration_min  INTEGER   NOT NULL CHECK (duration_min > 0),
  intensity   TEXT        DEFAULT 'moderate' CHECK (intensity IN ('low', 'moderate', 'high')),
  notes       TEXT,
  logged_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_exercise_logs_user_date
  ON public.exercise_logs(user_id, log_date DESC);

ALTER TABLE public.exercise_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own exercise logs"
  ON public.exercise_logs
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Educators can view all exercise logs"
  ON public.exercise_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'educator'
  ));

-- Add exercise_log to the points_log event_type constraint
ALTER TABLE public.points_log DROP CONSTRAINT IF EXISTS points_log_event_type_check;
ALTER TABLE public.points_log ADD CONSTRAINT points_log_event_type_check
  CHECK (event_type IN ('daily_log', 'streak_bonus', 'challenge_checkin', 'feed_post', 'exercise_log'));
