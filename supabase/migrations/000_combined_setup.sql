-- ============================================================
-- Hunter's Holistic Health: Complete Database Setup
-- Paste this entire script into Supabase SQL Editor.
-- Safe to run even if parts have already been applied.
-- All policies use DROP IF EXISTS before CREATE.
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLES (all use IF NOT EXISTS)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id              UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name      TEXT NOT NULL CHECK (char_length(first_name) BETWEEN 1 AND 50),
  last_name       TEXT NOT NULL CHECK (char_length(last_name) BETWEEN 1 AND 50),
  age             INTEGER CHECK (age BETWEEN 18 AND 120),
  role            TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'educator')),
  display_handle  TEXT CHECK (char_length(display_handle) <= 30),
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.blood_pressure_logs (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  systolic    INTEGER NOT NULL CHECK (systolic BETWEEN 60 AND 250),
  diastolic   INTEGER NOT NULL CHECK (diastolic BETWEEN 40 AND 150),
  pulse       INTEGER CHECK (pulse BETWEEN 30 AND 220),
  notes       TEXT CHECK (char_length(notes) <= 500),
  logged_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.daily_logs (
  id                  UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id             UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  log_date            DATE NOT NULL,
  steps               INTEGER DEFAULT 0 CHECK (steps >= 0),
  energy_level        INTEGER DEFAULT 5 CHECK (energy_level BETWEEN 1 AND 10),
  water_oz            INTEGER DEFAULT 0 CHECK (water_oz >= 0),
  morning_fast_done   BOOLEAN DEFAULT FALSE,
  meal1_logged        BOOLEAN DEFAULT FALSE,
  meal2_logged        BOOLEAN DEFAULT FALSE,
  snack_logged        BOOLEAN DEFAULT FALSE,
  supplement_am_done  BOOLEAN DEFAULT FALSE,
  supplement_pm_done  BOOLEAN DEFAULT FALSE,
  late_slip_reason    TEXT CHECK (char_length(late_slip_reason) <= 1000),
  created_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, log_date)
);

CREATE TABLE IF NOT EXISTS public.meal_logs (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id         UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  food_name       TEXT NOT NULL CHECK (char_length(food_name) BETWEEN 1 AND 200),
  meal_type       TEXT NOT NULL CHECK (meal_type IN ('morning_fast', 'meal1', 'meal2', 'snack')),
  calories        INTEGER CHECK (calories >= 0),
  ai_flag         BOOLEAN DEFAULT FALSE,
  ai_warning      TEXT,
  ai_alternatives TEXT[],
  logged_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.blood_sugar_logs (
  id               UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id          UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  glucose_mg_dl    INTEGER NOT NULL CHECK (glucose_mg_dl BETWEEN 20 AND 600),
  reading_context  TEXT NOT NULL CHECK (reading_context IN ('fasting', 'before_meal', 'post_meal_2hr', 'bedtime')),
  notes            TEXT CHECK (char_length(notes) <= 500),
  logged_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- supplements must exist before supplement_logs
CREATE TABLE IF NOT EXISTS public.supplements (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name        TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  dose        TEXT CHECK (char_length(dose) <= 100),
  timing      TEXT,
  notes       TEXT,
  active      BOOLEAN DEFAULT TRUE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.supplement_logs (
  id             UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id        UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  supplement_id  UUID REFERENCES public.supplements(id) ON DELETE CASCADE NOT NULL,
  log_date       DATE NOT NULL,
  taken_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, supplement_id, log_date)
);

-- feed_posts: room column included from the start (migration 010 adds it, so include here)
CREATE TABLE IF NOT EXISTS public.feed_posts (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content     TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 2000),
  post_type   TEXT NOT NULL DEFAULT 'check_in',
  room        TEXT NOT NULL DEFAULT 'general' CHECK (room IN ('general', 'wins', 'questions', 'challenges', 'resources')),
  likes       INTEGER DEFAULT 0,
  is_pinned   BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- If feed_posts already existed without the room column, add it safely
ALTER TABLE public.feed_posts ADD COLUMN IF NOT EXISTS room TEXT NOT NULL DEFAULT 'general';

-- Add or replace the room constraint safely
ALTER TABLE public.feed_posts DROP CONSTRAINT IF EXISTS feed_posts_room_check;
ALTER TABLE public.feed_posts ADD CONSTRAINT feed_posts_room_check
  CHECK (room IN ('general', 'wins', 'questions', 'challenges', 'resources'));

CREATE TABLE IF NOT EXISTS public.cohorts (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name        TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  starts_on   DATE NOT NULL,
  ends_on     DATE NOT NULL,
  created_by  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.cohort_members (
  cohort_id  UUID NOT NULL REFERENCES public.cohorts(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (cohort_id, user_id)
);

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

CREATE TABLE IF NOT EXISTS public.messages (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content       TEXT NOT NULL CHECK (char_length(content) <= 1000),
  read          BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.courses (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title          TEXT NOT NULL,
  description    TEXT,
  thumbnail_url  TEXT,
  sort_order     INTEGER DEFAULT 0,
  is_locked      BOOLEAN DEFAULT TRUE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.course_modules (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id    UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  title        TEXT NOT NULL,
  youtube_url  TEXT,
  notes        TEXT,
  sort_order   INTEGER DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.module_completions (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  module_id     UUID REFERENCES public.course_modules(id) ON DELETE CASCADE NOT NULL,
  completed_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, module_id)
);

CREATE TABLE IF NOT EXISTS public.feedback (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  first_name    TEXT,
  category      TEXT NOT NULL,
  message       TEXT NOT NULL,
  app_area      TEXT,
  submitted_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.pulse_cache (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  week_key      TEXT NOT NULL,
  headline      TEXT NOT NULL,
  insights      JSONB NOT NULL,
  generated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_key)
);

CREATE TABLE IF NOT EXISTS public.points_log (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  event_type  TEXT NOT NULL,
  points      INTEGER NOT NULL CHECK (points > 0),
  ref_id      TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, event_type, ref_id)
);

CREATE TABLE IF NOT EXISTS public.challenges (
  id                UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_by        UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title             TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 100),
  description       TEXT,
  goal_description  TEXT,
  start_date        DATE,
  end_date          DATE,
  is_active         BOOLEAN DEFAULT TRUE NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.challenge_logs (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  challenge_id  UUID REFERENCES public.challenges(id) ON DELETE CASCADE NOT NULL,
  user_id       UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  log_date      DATE NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(challenge_id, user_id, log_date)
);

CREATE TABLE IF NOT EXISTS public.events (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_by  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title       TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  description TEXT,
  event_type  TEXT,
  start_date  DATE,
  start_time  TIME,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.exercise_logs (
  id             UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id        UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  log_date       DATE NOT NULL,
  exercise_type  TEXT NOT NULL,
  duration_min   INTEGER NOT NULL CHECK (duration_min > 0),
  intensity      TEXT DEFAULT 'moderate' CHECK (intensity IN ('low', 'moderate', 'high')),
  notes          TEXT,
  logged_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.client_protocols (
  id                UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id           UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  lever_priority    TEXT DEFAULT 'all' CHECK (lever_priority IN ('1', '2', '3', 'all')),
  supplement_stack  TEXT,
  daily_anchors     TEXT,
  known_triggers    TEXT,
  current_session   INTEGER DEFAULT 1 CHECK (current_session > 0),
  total_sessions    INTEGER DEFAULT 24 CHECK (total_sessions > 0),
  program_end_date  DATE,
  educator_notes    TEXT,
  updated_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id)
);

-- ============================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_pressure_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_sugar_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplement_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cohort_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pulse_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_protocols ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_bp_logs_user_date ON public.blood_pressure_logs(user_id, logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_logs_user_date ON public.daily_logs(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_meal_logs_user_date ON public.meal_logs(user_id, logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_bs_logs_user_date ON public.blood_sugar_logs(user_id, logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_feed_posts_room ON public.feed_posts(room, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON public.messages(recipient_id, read);
CREATE INDEX IF NOT EXISTS idx_messages_pair ON public.messages(sender_id, recipient_id, created_at);
CREATE INDEX IF NOT EXISTS idx_points_log_user ON public.points_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_exercise_logs_user_date ON public.exercise_logs(user_id, log_date DESC);

-- ============================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'New'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', 'User'),
    'client'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_daily_logs_updated_at ON public.daily_logs;
CREATE TRIGGER update_daily_logs_updated_at
  BEFORE UPDATE ON public.daily_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- CONSTRAINTS (points_log event_type — drop and replace safely)
-- ============================================================

ALTER TABLE public.points_log DROP CONSTRAINT IF EXISTS points_log_event_type_check;
ALTER TABLE public.points_log ADD CONSTRAINT points_log_event_type_check
  CHECK (event_type IN ('daily_log', 'streak_bonus', 'challenge_checkin', 'feed_post', 'exercise_log'));

-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- DROP IF EXISTS before each CREATE so re-runs are safe.
-- ============================================================

-- PROFILES
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Educators can view all profiles" ON public.profiles;
CREATE POLICY "Educators can view all profiles" ON public.profiles FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'educator'));

DROP POLICY IF EXISTS "Authenticated users can view educator profiles" ON public.profiles;
CREATE POLICY "Authenticated users can view educator profiles" ON public.profiles FOR SELECT
  USING (role = 'educator' AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can view community profiles" ON public.profiles;
CREATE POLICY "Authenticated users can view community profiles" ON public.profiles FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Cohort members can view cohort profiles" ON public.profiles;
CREATE POLICY "Cohort members can view cohort profiles" ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.cohort_members cm1
      INNER JOIN public.cohort_members cm2 ON cm1.cohort_id = cm2.cohort_id
      WHERE cm1.user_id = auth.uid() AND cm2.user_id = profiles.id
    )
  );

-- BLOOD PRESSURE LOGS
DROP POLICY IF EXISTS "Users can manage own BP logs" ON public.blood_pressure_logs;
CREATE POLICY "Users can manage own BP logs" ON public.blood_pressure_logs FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Educators can view all BP logs" ON public.blood_pressure_logs;
CREATE POLICY "Educators can view all BP logs" ON public.blood_pressure_logs FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'educator'));

-- DAILY LOGS
DROP POLICY IF EXISTS "Users can manage own daily logs" ON public.daily_logs;
CREATE POLICY "Users can manage own daily logs" ON public.daily_logs FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Educators can view all daily logs" ON public.daily_logs;
CREATE POLICY "Educators can view all daily logs" ON public.daily_logs FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'educator'));

DROP POLICY IF EXISTS "Cohort members can view cohort daily logs" ON public.daily_logs;
CREATE POLICY "Cohort members can view cohort daily logs" ON public.daily_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.cohort_members cm1
      INNER JOIN public.cohort_members cm2 ON cm1.cohort_id = cm2.cohort_id
      WHERE cm1.user_id = auth.uid() AND cm2.user_id = daily_logs.user_id
    )
  );

-- MEAL LOGS
DROP POLICY IF EXISTS "Users can manage own meal logs" ON public.meal_logs;
CREATE POLICY "Users can manage own meal logs" ON public.meal_logs FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Educators can view all meal logs" ON public.meal_logs;
CREATE POLICY "Educators can view all meal logs" ON public.meal_logs FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'educator'));

-- BLOOD SUGAR LOGS
DROP POLICY IF EXISTS "Users can manage own blood sugar logs" ON public.blood_sugar_logs;
CREATE POLICY "Users can manage own blood sugar logs" ON public.blood_sugar_logs FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Educators can view all blood sugar logs" ON public.blood_sugar_logs;
CREATE POLICY "Educators can view all blood sugar logs" ON public.blood_sugar_logs FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'educator'));

-- SUPPLEMENTS
DROP POLICY IF EXISTS "Users can manage own supplements" ON public.supplements;
CREATE POLICY "Users can manage own supplements" ON public.supplements FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Educators can view all supplements" ON public.supplements;
CREATE POLICY "Educators can view all supplements" ON public.supplements FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'educator'));

-- SUPPLEMENT LOGS
DROP POLICY IF EXISTS "Users can manage own supplement logs" ON public.supplement_logs;
CREATE POLICY "Users can manage own supplement logs" ON public.supplement_logs FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Educators can view all supplement logs" ON public.supplement_logs;
CREATE POLICY "Educators can view all supplement logs" ON public.supplement_logs FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'educator'));

-- FEED POSTS
DROP POLICY IF EXISTS "Users can manage own feed posts" ON public.feed_posts;
CREATE POLICY "Users can manage own feed posts" ON public.feed_posts FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can view feed posts" ON public.feed_posts;
CREATE POLICY "Authenticated users can view feed posts" ON public.feed_posts FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Educators can manage all feed posts" ON public.feed_posts;
CREATE POLICY "Educators can manage all feed posts" ON public.feed_posts FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'educator'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'educator'));

-- COHORTS
DROP POLICY IF EXISTS "Members can view own cohorts" ON public.cohorts;
CREATE POLICY "Members can view own cohorts" ON public.cohorts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.cohort_members
      WHERE cohort_id = cohorts.id AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Educators can manage all cohorts" ON public.cohorts;
CREATE POLICY "Educators can manage all cohorts" ON public.cohorts FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'educator'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'educator'));

-- COHORT MEMBERS
DROP POLICY IF EXISTS "Members can view cohort members" ON public.cohort_members;
CREATE POLICY "Members can view cohort members" ON public.cohort_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.cohort_members cm
      WHERE cm.cohort_id = cohort_members.cohort_id AND cm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Educators can manage all cohort members" ON public.cohort_members;
CREATE POLICY "Educators can manage all cohort members" ON public.cohort_members FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'educator'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'educator'));

-- SESSIONS
DROP POLICY IF EXISTS "Users can manage own sessions" ON public.sessions;
CREATE POLICY "Users can manage own sessions" ON public.sessions FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Educators can manage all sessions" ON public.sessions;
CREATE POLICY "Educators can manage all sessions" ON public.sessions FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'educator'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'educator'));

-- MESSAGES
DROP POLICY IF EXISTS "Users can read own conversations" ON public.messages;
CREATE POLICY "Users can read own conversations" ON public.messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Users can send messages as themselves" ON public.messages;
CREATE POLICY "Users can send messages as themselves" ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Recipients can mark messages read" ON public.messages;
CREATE POLICY "Recipients can mark messages read" ON public.messages FOR UPDATE
  USING (auth.uid() = recipient_id) WITH CHECK (auth.uid() = recipient_id);

-- COURSES
DROP POLICY IF EXISTS "courses_select" ON public.courses;
CREATE POLICY "courses_select" ON public.courses FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "courses_insert" ON public.courses;
CREATE POLICY "courses_insert" ON public.courses FOR INSERT TO authenticated
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'educator');

DROP POLICY IF EXISTS "courses_update" ON public.courses;
CREATE POLICY "courses_update" ON public.courses FOR UPDATE TO authenticated
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'educator');

DROP POLICY IF EXISTS "courses_delete" ON public.courses;
CREATE POLICY "courses_delete" ON public.courses FOR DELETE TO authenticated
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'educator');

-- COURSE MODULES
DROP POLICY IF EXISTS "modules_select" ON public.course_modules;
CREATE POLICY "modules_select" ON public.course_modules FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "modules_insert" ON public.course_modules;
CREATE POLICY "modules_insert" ON public.course_modules FOR INSERT TO authenticated
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'educator');

DROP POLICY IF EXISTS "modules_update" ON public.course_modules;
CREATE POLICY "modules_update" ON public.course_modules FOR UPDATE TO authenticated
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'educator');

DROP POLICY IF EXISTS "modules_delete" ON public.course_modules;
CREATE POLICY "modules_delete" ON public.course_modules FOR DELETE TO authenticated
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'educator');

-- MODULE COMPLETIONS
DROP POLICY IF EXISTS "completions_select" ON public.module_completions;
CREATE POLICY "completions_select" ON public.module_completions FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'educator');

DROP POLICY IF EXISTS "completions_insert" ON public.module_completions;
CREATE POLICY "completions_insert" ON public.module_completions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "completions_delete" ON public.module_completions;
CREATE POLICY "completions_delete" ON public.module_completions FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- FEEDBACK
DROP POLICY IF EXISTS "feedback_insert" ON public.feedback;
CREATE POLICY "feedback_insert" ON public.feedback FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "feedback_select" ON public.feedback;
CREATE POLICY "feedback_select" ON public.feedback FOR SELECT TO authenticated
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'educator');

-- PULSE CACHE
DROP POLICY IF EXISTS "pulse_own" ON public.pulse_cache;
CREATE POLICY "pulse_own" ON public.pulse_cache FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- POINTS LOG
DROP POLICY IF EXISTS "Users can view own points" ON public.points_log;
CREATE POLICY "Users can view own points" ON public.points_log FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own points" ON public.points_log;
CREATE POLICY "Users can insert own points" ON public.points_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Educators can view all points" ON public.points_log;
CREATE POLICY "Educators can view all points" ON public.points_log FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'educator'));

DROP POLICY IF EXISTS "Authenticated users can view all points" ON public.points_log;
CREATE POLICY "Authenticated users can view all points" ON public.points_log FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- CHALLENGES
DROP POLICY IF EXISTS "Authenticated users can view challenges" ON public.challenges;
CREATE POLICY "Authenticated users can view challenges" ON public.challenges FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Educators can manage all challenges" ON public.challenges;
CREATE POLICY "Educators can manage all challenges" ON public.challenges FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'educator'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'educator'));

-- CHALLENGE LOGS
DROP POLICY IF EXISTS "Users can manage own challenge logs" ON public.challenge_logs;
CREATE POLICY "Users can manage own challenge logs" ON public.challenge_logs FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can view challenge logs" ON public.challenge_logs;
CREATE POLICY "Authenticated users can view challenge logs" ON public.challenge_logs FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- EVENTS
DROP POLICY IF EXISTS "Authenticated users can view events" ON public.events;
CREATE POLICY "Authenticated users can view events" ON public.events FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Educators can manage all events" ON public.events;
CREATE POLICY "Educators can manage all events" ON public.events FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'educator'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'educator'));

-- EXERCISE LOGS
DROP POLICY IF EXISTS "Users can manage own exercise logs" ON public.exercise_logs;
CREATE POLICY "Users can manage own exercise logs" ON public.exercise_logs FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Educators can view all exercise logs" ON public.exercise_logs;
CREATE POLICY "Educators can view all exercise logs" ON public.exercise_logs FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'educator'));

-- CLIENT PROTOCOLS
DROP POLICY IF EXISTS "Educators can manage all client protocols" ON public.client_protocols;
CREATE POLICY "Educators can manage all client protocols" ON public.client_protocols FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'educator'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'educator'));

DROP POLICY IF EXISTS "Users can view own protocol" ON public.client_protocols;
CREATE POLICY "Users can view own protocol" ON public.client_protocols FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================
-- MAKE YOURSELF AN EDUCATOR (run separately after setup)
-- Replace with your actual email address:
--
-- UPDATE public.profiles SET role = 'educator' WHERE id = (
--   SELECT id FROM auth.users WHERE email = 'your@email.com'
-- );
-- ============================================================
