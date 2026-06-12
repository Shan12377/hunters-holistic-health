-- ============================================================
-- Hunter's Holistic Health: Initial Database Schema
-- ============================================================
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES TABLE
-- Note: We collect first_name, last_name, age (NOT date of birth)
-- This is an intentional privacy-first design decision.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT NOT NULL CHECK (char_length(first_name) BETWEEN 1 AND 50),
  last_name TEXT NOT NULL CHECK (char_length(last_name) BETWEEN 1 AND 50),
  age INTEGER CHECK (age BETWEEN 18 AND 120),
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'educator')),
  display_handle TEXT CHECK (char_length(display_handle) <= 30),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- BLOOD PRESSURE LOGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.blood_pressure_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  systolic INTEGER NOT NULL CHECK (systolic BETWEEN 60 AND 250),
  diastolic INTEGER NOT NULL CHECK (diastolic BETWEEN 40 AND 150),
  pulse INTEGER CHECK (pulse BETWEEN 30 AND 220),
  notes TEXT CHECK (char_length(notes) <= 500),
  logged_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- DAILY LOGS TABLE (one row per user per day)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.daily_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  log_date DATE NOT NULL,
  steps INTEGER DEFAULT 0 CHECK (steps >= 0),
  energy_level INTEGER DEFAULT 5 CHECK (energy_level BETWEEN 1 AND 10),
  water_oz INTEGER DEFAULT 0 CHECK (water_oz >= 0),
  morning_fast_done BOOLEAN DEFAULT FALSE,
  meal1_logged BOOLEAN DEFAULT FALSE,
  meal2_logged BOOLEAN DEFAULT FALSE,
  snack_logged BOOLEAN DEFAULT FALSE,
  supplement_am_done BOOLEAN DEFAULT FALSE,
  supplement_pm_done BOOLEAN DEFAULT FALSE,
  late_slip_reason TEXT CHECK (char_length(late_slip_reason) <= 1000),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, log_date)
);

-- ============================================================
-- MEAL LOGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.meal_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  food_name TEXT NOT NULL CHECK (char_length(food_name) BETWEEN 1 AND 200),
  meal_type TEXT NOT NULL CHECK (meal_type IN ('morning_fast', 'meal1', 'meal2', 'snack')),
  calories INTEGER CHECK (calories >= 0),
  ai_flag BOOLEAN DEFAULT FALSE,
  ai_warning TEXT,
  ai_alternatives TEXT[],
  logged_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS): Critical for data privacy
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_pressure_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_logs ENABLE ROW LEVEL SECURITY;

-- PROFILES: Users can read/update their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- EDUCATOR can view all client profiles
CREATE POLICY "Educators can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'educator'
    )
  );

-- BLOOD PRESSURE: Users can manage their own readings
CREATE POLICY "Users can manage own BP logs"
  ON public.blood_pressure_logs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- EDUCATOR can view all BP logs
CREATE POLICY "Educators can view all BP logs"
  ON public.blood_pressure_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'educator'
    )
  );

-- DAILY LOGS: Users can manage their own logs
CREATE POLICY "Users can manage own daily logs"
  ON public.daily_logs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- EDUCATOR can view all daily logs
CREATE POLICY "Educators can view all daily logs"
  ON public.daily_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'educator'
    )
  );

-- MEAL LOGS: Users can manage their own meal logs
CREATE POLICY "Users can manage own meal logs"
  ON public.meal_logs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- EDUCATOR can view all meal logs
CREATE POLICY "Educators can view all meal logs"
  ON public.meal_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'educator'
    )
  );

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_bp_logs_user_date ON public.blood_pressure_logs(user_id, logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_logs_user_date ON public.daily_logs(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_meal_logs_user_date ON public.meal_logs(user_id, logged_at DESC);

-- ============================================================
-- TRIGGER: Auto-update updated_at timestamps
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_logs_updated_at
  BEFORE UPDATE ON public.daily_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- MAKE YOURSELF AN EDUCATOR
-- After running this migration, run this with YOUR email:
-- UPDATE public.profiles SET role = 'educator' WHERE id = (
--   SELECT id FROM auth.users WHERE email = 'your@email.com'
-- );
-- ============================================================
