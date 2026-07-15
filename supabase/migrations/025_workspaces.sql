-- CRM: workspaces table with seed row for Hunter's Holistic Health
-- Every CRM table references this; multi-tenancy adds rows here later.

CREATE TABLE IF NOT EXISTS public.workspaces (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Seed the one workspace with a fixed, known UUID so migrations can reference it as a literal
INSERT INTO public.workspaces (id, name)
VALUES ('00000000-0000-0000-0000-000000000001', 'Hunter''s Holistic Health')
ON CONFLICT (id) DO NOTHING;

-- Educators can read their workspace; clients cannot see workspaces at all
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "educator_read_workspace" ON public.workspaces
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'educator'
    )
  );
