CREATE TABLE public.feedback (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  first_name    text,
  category      text NOT NULL,
  message       text NOT NULL,
  app_area      text,
  submitted_at  timestamptz DEFAULT now()
);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Users can insert their own feedback
CREATE POLICY "feedback_insert" ON public.feedback FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Only educators can read all feedback
CREATE POLICY "feedback_select" ON public.feedback FOR SELECT TO authenticated
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'educator');
