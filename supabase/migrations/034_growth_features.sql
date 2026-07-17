-- ─────────────────────────────────────────────────────────────────────────────
-- Growth Features Migration
-- Applications, Health Goals, Habit Identities, Habit Logs
-- Run in Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. APPLICATIONS ──────────────────────────────────────────────────────────
-- Stores applications for VIP Intensive ($997/mo) and 6-Month Overhaul ($4,997)

CREATE TABLE IF NOT EXISTS applications (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  tier            TEXT        NOT NULL CHECK (tier IN ('intensive', 'overhaul')),
  first_name      TEXT        NOT NULL,
  last_name       TEXT,
  email           TEXT        NOT NULL,
  phone           TEXT,
  -- BANT: Need
  health_challenge TEXT       NOT NULL,
  previous_attempts TEXT,
  -- BANT: Timing
  timeline        TEXT        CHECK (timeline IN ('immediately', '1_month', '3_months', 'exploring')),
  -- BANT: Budget
  investment_ready TEXT       CHECK (investment_ready IN ('yes', 'maybe', 'not_yet')),
  -- BANT: Authority
  decision_maker  TEXT        CHECK (decision_maker IN ('yes', 'need_to_discuss')),
  goals           TEXT,
  hear_about      TEXT,
  -- Educator review
  status          TEXT        NOT NULL DEFAULT 'new'
                              CHECK (status IN ('new', 'reviewing', 'approved', 'declined', 'waitlisted')),
  notes           TEXT,
  lead_id         UUID        REFERENCES leads(id)
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Anyone can submit an application
CREATE POLICY "applications_public_insert"
  ON applications FOR INSERT WITH CHECK (true);

-- Only educators can read and update
CREATE POLICY "applications_educator_select"
  ON applications FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'educator'
  ));

CREATE POLICY "applications_educator_update"
  ON applications FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'educator'
  ));

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_applications_updated_at();


-- ── 2. HEALTH GOALS ──────────────────────────────────────────────────────────
-- Members set ROOTS-aligned health goals and track progress

CREATE TABLE IF NOT EXISTS health_goals (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  goal_text       TEXT        NOT NULL,
  category        TEXT        NOT NULL
                              CHECK (category IN (
                                'metabolic', 'hormone', 'movement', 'nutrition',
                                'sleep', 'stress', 'supplements', 'weight', 'energy', 'other'
                              )),
  target_date     DATE,
  status          TEXT        NOT NULL DEFAULT 'active'
                              CHECK (status IN ('active', 'achieved', 'paused')),
  milestone_pct   INTEGER     DEFAULT 0
                              CHECK (milestone_pct >= 0 AND milestone_pct <= 100)
);

ALTER TABLE health_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "health_goals_own"
  ON health_goals FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION update_health_goals_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_health_goals_updated_at
  BEFORE UPDATE ON health_goals
  FOR EACH ROW EXECUTE FUNCTION update_health_goals_updated_at();


-- ── 3. HABIT IDENTITIES ──────────────────────────────────────────────────────
-- Identity-based habits tied to ROOTS categories

CREATE TABLE IF NOT EXISTS habit_identities (
  id                  UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  name                TEXT    NOT NULL,
  identity_statement  TEXT    NOT NULL,
  category            TEXT    CHECK (category IN (
                                'sleep', 'nutrition', 'movement', 'supplements',
                                'stress', 'hydration', 'fasting', 'other'
                              )),
  sort_order          INTEGER DEFAULT 0,
  active              BOOLEAN DEFAULT TRUE
);

ALTER TABLE habit_identities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "habit_identities_own"
  ON habit_identities FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ── 4. HABIT LOGS ────────────────────────────────────────────────────────────
-- Daily completion records for each habit identity

CREATE TABLE IF NOT EXISTS habit_logs (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_id    UUID    NOT NULL REFERENCES habit_identities(id) ON DELETE CASCADE,
  log_date    DATE    NOT NULL,
  completed   BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (habit_id, log_date)
);

ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "habit_logs_own"
  ON habit_logs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
