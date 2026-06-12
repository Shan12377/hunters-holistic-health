-- Session scheduling: date, time, and type only.
-- No health information, no visit-reason field.

CREATE TABLE IF NOT EXISTS public.sessions (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_date  DATE NOT NULL,
  session_time  TIME NOT NULL,
  session_type  TEXT NOT NULL CHECK (
    session_type IN ('Functional Medicine Education', 'Follow-up', 'Protocol Review')
  ),
  status        TEXT NOT NULL DEFAULT 'scheduled' CHECK (
    status IN ('scheduled', 'completed', 'cancelled')
  ),
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Users can read and manage their own sessions
CREATE POLICY "Users can manage own sessions"
  ON public.sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Educators can read and write all sessions
CREATE POLICY "Educators can manage all sessions"
  ON public.sessions FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'educator')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'educator')
  );
