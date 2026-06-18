-- Per-client educational protocol store for the Educator Protocol Builder
CREATE TABLE IF NOT EXISTS public.client_protocols (
  id                UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id           UUID        REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  lever_priority    TEXT        DEFAULT 'all' CHECK (lever_priority IN ('1', '2', '3', 'all')),
  supplement_stack  TEXT,
  daily_anchors     TEXT,
  known_triggers    TEXT,
  current_session   INTEGER     DEFAULT 1 CHECK (current_session > 0),
  total_sessions    INTEGER     DEFAULT 24 CHECK (total_sessions > 0),
  program_end_date  DATE,
  educator_notes    TEXT,
  updated_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id)
);

ALTER TABLE public.client_protocols ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Educators can manage all client protocols"
  ON public.client_protocols
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'educator'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'educator'));

CREATE POLICY "Users can view own protocol"
  ON public.client_protocols FOR SELECT
  USING (auth.uid() = user_id);
