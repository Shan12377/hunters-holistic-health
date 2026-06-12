-- Educator read access for supplement tables.
-- Run this in Supabase SQL Editor if the educator adherence view returns empty data.
-- Safe to run multiple times.

DO $$
BEGIN
  -- Make sure RLS is on (no-op if already enabled)
  ALTER TABLE IF EXISTS public.supplements ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS public.supplement_logs ENABLE ROW LEVEL SECURITY;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'supplements'
      AND policyname = 'Educators can view all supplements'
  ) THEN
    CREATE POLICY "Educators can view all supplements" ON public.supplements
      FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'educator')
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'supplement_logs'
      AND policyname = 'Educators can view all supplement logs'
  ) THEN
    CREATE POLICY "Educators can view all supplement logs" ON public.supplement_logs
      FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'educator')
      );
  END IF;
END $$;
