-- CRM: activities (interaction timeline) and tasks (follow-up queue)

-- Activities: one row per touch on a lead or client
CREATE TABLE IF NOT EXISTS public.activities (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'
                 REFERENCES public.workspaces(id),
  lead_id      uuid REFERENCES public.leads(id) ON DELETE CASCADE,
  profile_id   uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  type         text NOT NULL CHECK (type IN (
                 'note',
                 'call',
                 'email',
                 'sms',
                 'form_submission',
                 'booking',
                 'stage_change'
               )),
  body         text NOT NULL,
  created_by   uuid REFERENCES public.profiles(id),
  created_at   timestamptz NOT NULL DEFAULT now(),

  -- Exactly one of lead_id / profile_id must be set
  CONSTRAINT activity_one_contact CHECK (
    (lead_id IS NOT NULL AND profile_id IS NULL) OR
    (lead_id IS NULL AND profile_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS activities_lead_idx    ON public.activities (lead_id);
CREATE INDEX IF NOT EXISTS activities_profile_idx ON public.activities (profile_id);
CREATE INDEX IF NOT EXISTS activities_created_idx ON public.activities (created_at DESC);

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "educator_all_activities" ON public.activities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'educator'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'educator'
    )
  );


-- Tasks: educator follow-up queue
CREATE TABLE IF NOT EXISTS public.tasks (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'
                 REFERENCES public.workspaces(id),
  lead_id      uuid REFERENCES public.leads(id) ON DELETE CASCADE,
  profile_id   uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  title        text NOT NULL,
  due_at       timestamptz NOT NULL,
  status       text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'done', 'snoozed')),
  snoozed_until timestamptz,
  created_by   uuid REFERENCES public.profiles(id),
  created_at   timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,

  CONSTRAINT task_one_contact CHECK (
    (lead_id IS NOT NULL AND profile_id IS NULL) OR
    (lead_id IS NULL AND profile_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS tasks_lead_idx    ON public.tasks (lead_id);
CREATE INDEX IF NOT EXISTS tasks_profile_idx ON public.tasks (profile_id);
CREATE INDEX IF NOT EXISTS tasks_due_idx     ON public.tasks (due_at);
CREATE INDEX IF NOT EXISTS tasks_status_idx  ON public.tasks (status);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "educator_all_tasks" ON public.tasks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'educator'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'educator'
    )
  );
