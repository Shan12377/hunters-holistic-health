-- Cohort challenges: membership and schedule data only.
-- No health information is stored in these tables.
-- Run 003_supplement_educator_policies.sql before this.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.cohorts (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name        TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  starts_on   DATE NOT NULL,
  ends_on     DATE NOT NULL,
  created_by  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.cohort_members (
  cohort_id   UUID NOT NULL REFERENCES public.cohorts(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (cohort_id, user_id)
);

ALTER TABLE public.cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cohort_members ENABLE ROW LEVEL SECURITY;

-- Members can view cohorts they belong to
CREATE POLICY "Members can view own cohorts"
  ON public.cohorts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.cohort_members
      WHERE cohort_id = cohorts.id AND user_id = auth.uid()
    )
  );

-- Educators can read and write all cohorts
CREATE POLICY "Educators can manage all cohorts"
  ON public.cohorts FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'educator')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'educator')
  );

-- Members can view the member list for any cohort they belong to
CREATE POLICY "Members can view cohort members"
  ON public.cohort_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.cohort_members cm
      WHERE cm.cohort_id = cohort_members.cohort_id AND cm.user_id = auth.uid()
    )
  );

-- Educators can read and write all cohort memberships
CREATE POLICY "Educators can manage all cohort members"
  ON public.cohort_members FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'educator')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'educator')
  );

-- Allow cohort members to see each other's daily logs for the leaderboard.
-- Adds a SELECT-only policy alongside the existing "Users can manage own daily logs" policy.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'daily_logs'
      AND policyname = 'Cohort members can view cohort daily logs'
  ) THEN
    CREATE POLICY "Cohort members can view cohort daily logs"
      ON public.daily_logs FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.cohort_members cm1
          INNER JOIN public.cohort_members cm2 ON cm1.cohort_id = cm2.cohort_id
          WHERE cm1.user_id = auth.uid() AND cm2.user_id = daily_logs.user_id
        )
      );
  END IF;
END $$;

-- Allow cohort members to see each other's first/last name for the leaderboard.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles'
      AND policyname = 'Cohort members can view cohort profiles'
  ) THEN
    CREATE POLICY "Cohort members can view cohort profiles"
      ON public.profiles FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.cohort_members cm1
          INNER JOIN public.cohort_members cm2 ON cm1.cohort_id = cm2.cohort_id
          WHERE cm1.user_id = auth.uid() AND cm2.user_id = profiles.id
        )
      );
  END IF;
END $$;
