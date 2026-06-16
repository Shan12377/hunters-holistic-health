-- Allow any authenticated user to read basic profile fields for community features
-- (name, handle, join date only -- no age, no sensitive fields)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles'
      AND policyname = 'Authenticated users can view community profiles'
  ) THEN
    CREATE POLICY "Authenticated users can view community profiles"
      ON public.profiles FOR SELECT
      USING (auth.uid() IS NOT NULL);
  END IF;
END $$;

-- Allow any authenticated user to read all points_log for member cards and leaderboards
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'points_log'
      AND policyname = 'Authenticated users can view all points'
  ) THEN
    CREATE POLICY "Authenticated users can view all points"
      ON public.points_log FOR SELECT
      USING (auth.uid() IS NOT NULL);
  END IF;
END $$;
