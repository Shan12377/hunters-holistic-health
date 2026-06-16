-- Points log table: one row per point-earning event, never mutated
CREATE TABLE IF NOT EXISTS public.points_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('daily_log', 'streak_bonus', 'challenge_checkin', 'feed_post')),
  points INTEGER NOT NULL CHECK (points > 0),
  ref_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, event_type, ref_id)
);

ALTER TABLE public.points_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own points"
  ON public.points_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own points"
  ON public.points_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Educators can view all points"
  ON public.points_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'educator'
    )
  );

CREATE INDEX IF NOT EXISTS idx_points_log_user ON public.points_log(user_id, created_at DESC);
