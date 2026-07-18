-- Workout Tracker: exercises library, routines, sessions, and set logging

CREATE TABLE IF NOT EXISTS public.exercises (
  id              uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name            text NOT NULL UNIQUE,
  coach_cue       text,
  condition_notes text,
  muscle_groups   text[] DEFAULT '{}',
  tempo_default   text DEFAULT '3-1-2',
  created_at      timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.workout_routines (
  id          uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name        text NOT NULL UNIQUE,
  description text,
  is_default  boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.routine_exercises (
  id             uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  routine_id     uuid REFERENCES public.workout_routines(id) ON DELETE CASCADE NOT NULL,
  exercise_id    uuid REFERENCES public.exercises(id) ON DELETE CASCADE NOT NULL,
  order_position integer NOT NULL,
  sets_default   integer DEFAULT 3,
  reps_default   integer,
  weight_default numeric,
  UNIQUE (routine_id, order_position)
);

CREATE TABLE IF NOT EXISTS public.workout_sessions (
  id           uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id      uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  routine_id   uuid REFERENCES public.workout_routines(id),
  session_date date NOT NULL DEFAULT current_date,
  energy_level integer CHECK (energy_level BETWEEN 1 AND 5),
  completed_at timestamptz,
  created_at   timestamptz DEFAULT now(),
  UNIQUE (user_id, session_date)
);

CREATE TABLE IF NOT EXISTS public.exercise_sets (
  id          uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id  uuid REFERENCES public.workout_sessions(id) ON DELETE CASCADE NOT NULL,
  exercise_id uuid REFERENCES public.exercises(id) NOT NULL,
  set_number  integer NOT NULL DEFAULT 1,
  reps        integer,
  weight_lbs  numeric,
  completed   boolean DEFAULT false,
  logged_at   timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_date ON public.workout_sessions(user_id, session_date DESC);
CREATE INDEX IF NOT EXISTS idx_exercise_sets_session ON public.exercise_sets(session_id);

-- RLS
ALTER TABLE public.exercises        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_sets     ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read exercises"
  ON public.exercises FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated read routines"
  ON public.workout_routines FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated read routine exercises"
  ON public.routine_exercises FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users manage own workout sessions"
  ON public.workout_sessions
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Educators view all workout sessions"
  ON public.workout_sessions FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'educator'));

CREATE POLICY "Users manage own exercise sets"
  ON public.exercise_sets
  USING (EXISTS (SELECT 1 FROM public.workout_sessions WHERE id = session_id AND user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.workout_sessions WHERE id = session_id AND user_id = auth.uid()));

CREATE POLICY "Educators view all exercise sets"
  ON public.exercise_sets FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'educator'));

-- Seed exercises
INSERT INTO public.exercises (name, coach_cue, condition_notes, muscle_groups, tempo_default) VALUES
('Goblet Squat',
 'Do not lock knees at the top. Keep constant tension.',
 'If painful on knees, substitute Leg Press or seated band squat.',
 ARRAY['quads','glutes'], '3-1-2'),
('Lat Pulldown',
 'Drive elbows down to hips. Do not pull with your hands.',
 'Safe for all conditions. Use lighter load if shoulder impingement.',
 ARRAY['back','biceps'], '3-1-2'),
('Chest Press',
 'Take 3 full seconds to lower. Feel the stretch across the chest.',
 'Safe for all conditions. Dumbbell version reduces shoulder strain.',
 ARRAY['chest','triceps'], '3-1-2'),
('Romanian Deadlift',
 'Push hips back. Load the glutes and hamstrings, not the lower back.',
 'Avoid if active lower back pain. Reduce range of motion as needed.',
 ARRAY['hamstrings','glutes'], '3-1-2'),
('Cable Row',
 'Squeeze shoulder blades together like cracking a nut.',
 'Safe for all conditions.',
 ARRAY['back','biceps'], '3-1-2'),
('Overhead Press',
 'Tight core. Do not arch your lower back.',
 'Reduce load if blood pressure is elevated today. Seated version preferred.',
 ARRAY['shoulders','triceps'], '3-1-2'),
('Bicep Curls',
 'Squeeze hard at the top. Lower slowly.',
 'Safe for all conditions.',
 ARRAY['biceps'], '3-1-2'),
('Tricep Extensions',
 'Lock elbows to sides. Spread rope at the bottom.',
 'Safe for all conditions.',
 ARRAY['triceps'], '3-1-2'),
('Lateral Raises',
 'Lead with elbows, not hands. Pour the pitcher.',
 'Reduce load if shoulder impingement.',
 ARRAY['shoulders'], '3-1-2'),
('Calf Raises',
 'Full stretch at the bottom. Full extension at the top. Pause at peak.',
 'Especially important for anyone with lower-body swelling or fluid retention. This is the vascular pump.',
 ARRAY['calves'], '3-1-2'),
('Wall Sit',
 'Back flat against the wall. Thighs parallel to floor. Breathe continuously.',
 'BJSM 2023 meta-analysis: reduces systolic BP by up to 10.5 mmHg. Do before your main routine if BP management is a primary goal.',
 ARRAY['quads','glutes'], 'isometric-2min')
ON CONFLICT (name) DO NOTHING;

-- Seed Routine A
INSERT INTO public.workout_routines (name, description, is_default)
VALUES (
  'Routine A',
  'Full-body resistance training. Compound movements first, isolation last. Wall Sit opens the session for blood pressure support.',
  true
)
ON CONFLICT (name) DO NOTHING;

-- Routine A exercise order
INSERT INTO public.routine_exercises (routine_id, exercise_id, order_position, sets_default, reps_default)
SELECT
  (SELECT id FROM public.workout_routines WHERE name = 'Routine A'),
  e.id,
  r.pos,
  CASE r.ex_name WHEN 'Wall Sit' THEN 4 ELSE 3 END,
  CASE r.ex_name WHEN 'Wall Sit' THEN NULL ELSE 12 END
FROM (VALUES
  ('Wall Sit',          1),
  ('Goblet Squat',      2),
  ('Romanian Deadlift', 3),
  ('Lat Pulldown',      4),
  ('Cable Row',         5),
  ('Chest Press',       6),
  ('Overhead Press',    7),
  ('Bicep Curls',       8),
  ('Tricep Extensions', 9),
  ('Lateral Raises',    10),
  ('Calf Raises',       11)
) AS r(ex_name, pos)
JOIN public.exercises e ON e.name = r.ex_name
ON CONFLICT (routine_id, order_position) DO NOTHING;
