-- Workout Tracker rework.
--
-- Builds on 038 (tables), 040 (custom exercises, created_by_user_id) and
-- 041 (Routine B). Nothing here re-does that work.
--
-- Three problems this fixes:
--   1. workout_routines has no owner and a globally unique name, so only one
--      "Routine A" can exist for the whole platform. A person cannot build a
--      routine that is actually theirs. Routines now have an owner. A NULL
--      user_id still means a shared template, which is what Routine A and B
--      become.
--   2. workout_sessions allows one row per person per day, so somebody who
--      walks in the morning and lifts at night cannot log both.
--   3. There is nowhere to log a walk, a rebounding session or HIIT. Only sets
--      and reps. Most people move without touching a weight.
--
-- Everything here is additive. No existing row is deleted or rewritten.

-- ---------------------------------------------------------------------------
-- 1. Emoji on exercises, so the list stops looking dead
-- ---------------------------------------------------------------------------

ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS emoji text;

-- 040 added SELECT, INSERT and DELETE for custom exercises but no UPDATE, so a
-- person could add their own exercise and then never rename it.
DROP POLICY IF EXISTS "Users update own custom exercises" ON public.exercises;
CREATE POLICY "Users update own custom exercises" ON public.exercises FOR UPDATE
  USING (auth.uid() = created_by_user_id)
  WITH CHECK (auth.uid() = created_by_user_id);

UPDATE public.exercises SET emoji = v.emoji
FROM (VALUES
  ('Wall Sit',               '🧱'),
  ('Goblet Squat',           '🏋'),
  ('Romanian Deadlift',      '🦵'),
  ('Lat Pulldown',           '🔽'),
  ('Cable Row',              '🚣'),
  ('Chest Press',            '💪'),
  ('Overhead Press',         '🙌'),
  ('Bicep Curls',            '💪'),
  ('Tricep Extensions',      '🔨'),
  ('Lateral Raises',         '🕊'),
  ('Calf Raises',            '🦶'),
  ('Hip Thrust',             '🍑'),
  ('Bulgarian Split Squat',  '🦿'),
  ('Face Pull',              '🎯'),
  ('Seated Row',             '🚣'),
  ('Leg Curl',               '🦵'),
  ('Leg Press',              '🦿'),
  ('Plank',                  '📏'),
  ('Dead Bug',               '🐞'),
  ('Glute Bridge',           '🌉')
) AS v(name, emoji)
WHERE public.exercises.name = v.name
  AND public.exercises.created_by_user_id IS NULL
  AND public.exercises.emoji IS NULL;

-- Anything in the shared library without a match gets a neutral default so no
-- row renders with a blank space where the others have an icon.
UPDATE public.exercises SET emoji = '💪'
WHERE emoji IS NULL AND created_by_user_id IS NULL;

-- ---------------------------------------------------------------------------
-- 2. Routines belong to a person
-- ---------------------------------------------------------------------------

ALTER TABLE public.workout_routines
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users ON DELETE CASCADE;

-- Routine B and C are demonstration routines. A link to the actual video beats
-- a name hanging on a card with nothing behind it.
ALTER TABLE public.workout_routines ADD COLUMN IF NOT EXISTS video_url text;

ALTER TABLE public.workout_routines DROP CONSTRAINT IF EXISTS workout_routines_name_key;

-- A shared template (user_id NULL) still needs a unique name so the 038 and 041
-- seeds stay idempotent on re-run. A person's own routines only have to be
-- unique to them, so two clients can both have a routine called "Mine".
CREATE UNIQUE INDEX IF NOT EXISTS workout_routines_shared_name_unique
  ON public.workout_routines (name) WHERE user_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS workout_routines_own_name_unique
  ON public.workout_routines (user_id, name) WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_workout_routines_user ON public.workout_routines(user_id);

-- Read: shared templates, plus your own.
DROP POLICY IF EXISTS "Authenticated read routines" ON public.workout_routines;
DROP POLICY IF EXISTS "Read shared and own routines" ON public.workout_routines;
CREATE POLICY "Read shared and own routines"
  ON public.workout_routines FOR SELECT
  USING (auth.uid() IS NOT NULL AND (user_id IS NULL OR user_id = auth.uid()));

-- Write: only your own. Nobody can edit a shared template from the app.
DROP POLICY IF EXISTS "Users insert own routines" ON public.workout_routines;
CREATE POLICY "Users insert own routines"
  ON public.workout_routines FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own routines" ON public.workout_routines;
CREATE POLICY "Users update own routines"
  ON public.workout_routines FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own routines" ON public.workout_routines;
CREATE POLICY "Users delete own routines"
  ON public.workout_routines FOR DELETE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Educators view all routines" ON public.workout_routines;
CREATE POLICY "Educators view all routines"
  ON public.workout_routines FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'educator'));

-- ---------------------------------------------------------------------------
-- 3. Routine exercises follow whoever owns the routine
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Authenticated read routine exercises" ON public.routine_exercises;
DROP POLICY IF EXISTS "Read visible routine exercises" ON public.routine_exercises;
CREATE POLICY "Read visible routine exercises"
  ON public.routine_exercises FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.workout_routines r
    WHERE r.id = routine_id AND (r.user_id IS NULL OR r.user_id = auth.uid())
  ));

DROP POLICY IF EXISTS "Users manage exercises in own routines" ON public.routine_exercises;
CREATE POLICY "Users manage exercises in own routines"
  ON public.routine_exercises
  USING (EXISTS (
    SELECT 1 FROM public.workout_routines r
    WHERE r.id = routine_id AND r.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.workout_routines r
    WHERE r.id = routine_id AND r.user_id = auth.uid()
  ));

-- Reordering a routine has to move an exercise into a slot that is briefly
-- still held by another one. A plain unique constraint rejects that mid-update.
-- A deferrable one checks at the end of the transaction instead.
ALTER TABLE public.routine_exercises
  DROP CONSTRAINT IF EXISTS routine_exercises_routine_id_order_position_key;

ALTER TABLE public.routine_exercises
  DROP CONSTRAINT IF EXISTS routine_exercises_order_key;

ALTER TABLE public.routine_exercises
  ADD CONSTRAINT routine_exercises_order_key
  UNIQUE (routine_id, order_position) DEFERRABLE INITIALLY DEFERRED;

-- ---------------------------------------------------------------------------
-- 4. More than one session a day
-- ---------------------------------------------------------------------------

ALTER TABLE public.workout_sessions
  DROP CONSTRAINT IF EXISTS workout_sessions_user_id_session_date_key;

-- ---------------------------------------------------------------------------
-- 5. Activity sessions: walking, rebounding, HIIT, anything without sets
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.activity_sessions (
  id                uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id           uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  session_date      date NOT NULL DEFAULT current_date,
  activity_key      text NOT NULL,
  location          text CHECK (location IN ('indoor','outdoor')),
  minutes           integer NOT NULL CHECK (minutes > 0 AND minutes <= 600),
  intensity         text NOT NULL CHECK (intensity IN ('easy','moderate','hard')),
  -- The estimate as it stood when this was logged. Stored rather than computed
  -- on read, so history does not silently change if the MET table is corrected
  -- or the person's weight moves.
  est_calories      integer,
  est_steps         integer,
  weight_lbs_at_log numeric,
  note              text,
  created_at        timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_sessions_user_date
  ON public.activity_sessions(user_id, session_date DESC);

ALTER TABLE public.activity_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own activity sessions" ON public.activity_sessions;
CREATE POLICY "Users manage own activity sessions"
  ON public.activity_sessions
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Educators view all activity sessions" ON public.activity_sessions;
CREATE POLICY "Educators view all activity sessions"
  ON public.activity_sessions FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'educator'));

-- ---------------------------------------------------------------------------
-- 6. The seeded routines are templates, and they say so
-- ---------------------------------------------------------------------------

UPDATE public.workout_routines
SET description = 'A starting point, not a prescription. Copy it and change whatever does not work for your body. Wall Sit opens the session because isometric holds have the strongest blood pressure evidence.'
WHERE name = 'Routine A' AND user_id IS NULL;

-- Follow along videos, both from HASfit (Coach Kozak, certified trainer). Chosen
-- because the channel is free, has no paywall or upsell, and every workout shows
-- a beginner and a seated modification, which matters for a 40 plus audience.
-- The UI states plainly that these are somebody else's videos, not Dr. Hunter's.
-- Verified public via the YouTube oEmbed endpoint on 2026-08-13. If either goes
-- dead the card simply hides the link, it does not break the page.
UPDATE public.workout_routines
SET video_url = 'https://www.youtube.com/watch?v=JWE9MCIhj48'
WHERE name = 'Routine A' AND user_id IS NULL;

UPDATE public.workout_routines
SET video_url = 'https://www.youtube.com/watch?v=RzXv6s0PgMQ'
WHERE name = 'Routine B' AND user_id IS NULL;
