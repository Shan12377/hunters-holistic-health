CREATE TABLE public.pulse_cache (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  week_key     text NOT NULL,
  headline     text NOT NULL,
  insights     jsonb NOT NULL,
  generated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, week_key)
);

ALTER TABLE public.pulse_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pulse_own" ON public.pulse_cache FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
