-- Workout B: second-day routine with posterior chain, unilateral, and pull focus
-- Uses WHERE NOT EXISTS instead of ON CONFLICT because migration 040 replaced the
-- global name unique constraint with a partial index (global exercises only).

-- New exercises for Routine B
INSERT INTO public.exercises (name, coach_cue, condition_notes, muscle_groups, tempo_default)
SELECT name, coach_cue, condition_notes, muscle_groups::text[], tempo_default
FROM (VALUES
  ('Hip Thrust',
   'Drive through your heels. Squeeze glutes hard at the top. Hold one second.',
   'Use a bench edge under your shoulder blades. A pad on the barbell protects your hips.',
   ARRAY['glutes','hamstrings'], '2-1-2'),

  ('Bulgarian Split Squat',
   'Front foot stays flat. Sink straight down, do not lunge forward.',
   'If balance is difficult, hold a wall or reduce range of motion. Avoid if acute knee pain.',
   ARRAY['quads','glutes'], '3-1-2'),

  ('Dumbbell Row',
   'Pull elbow to hip, not to shoulder. Row the weight, not the arm.',
   'Brace on a bench with your opposite hand. Safe for all conditions.',
   ARRAY['back','biceps'], '3-1-2'),

  ('Face Pull',
   'Pull to forehead level. Turn your hands out at the end to open the shoulder.',
   'Use light weight. Excellent for shoulder impingement prevention and posture correction.',
   ARRAY['shoulders','upper back'], '2-1-2'),

  ('Incline Dumbbell Press',
   'Lower slowly until elbows are below bench level. Press without locking out.',
   'Set bench to 30-45 degrees. Gentler on shoulders than flat press for some people.',
   ARRAY['chest','shoulders'], '3-1-2'),

  ('Arnold Press',
   'Start with palms facing you. Rotate out as you press. Reverse on the way down.',
   'Reduce load if blood pressure is elevated. Do not arch lower back.',
   ARRAY['shoulders','triceps'], '3-1-2'),

  ('Hammer Curls',
   'Thumbs point up the whole time. Squeeze at the top. Slow on the way down.',
   'Safer on wrists than standard curls. Good for forearm strength.',
   ARRAY['biceps','forearms'], '3-1-2'),

  ('Tricep Overhead Extension',
   'Keep elbows pointing straight ahead. Only your forearms move.',
   'Targets the long head of the tricep. Reduce load if elbow discomfort.',
   ARRAY['triceps'], '3-1-2'),

  ('Glute Kickback',
   'Keep your core tight. Extend fully at the top. Control the return.',
   'Use a cable machine or resistance band. Great metabolic finisher for glute activation.',
   ARRAY['glutes'], '2-1-2')

) AS v(name, coach_cue, condition_notes, muscle_groups, tempo_default)
WHERE NOT EXISTS (
  SELECT 1 FROM public.exercises WHERE name = v.name AND created_by_user_id IS NULL
);

-- Seed Routine B
INSERT INTO public.workout_routines (name, description, is_default)
SELECT 'Routine B',
  'Posterior chain and pull focus. Alternates with Routine A for variety and full-body coverage across the week. Hip Thrust and Bulgarian Split Squat replace the lower-body push pattern from A.',
  false
WHERE NOT EXISTS (
  SELECT 1 FROM public.workout_routines WHERE name = 'Routine B'
);

-- Routine B exercise order
-- Delete any existing rows for this routine first (safe re-run)
DELETE FROM public.routine_exercises
WHERE routine_id = (SELECT id FROM public.workout_routines WHERE name = 'Routine B');

INSERT INTO public.routine_exercises (routine_id, exercise_id, order_position, sets_default, reps_default)
SELECT
  (SELECT id FROM public.workout_routines WHERE name = 'Routine B'),
  e.id,
  r.pos,
  CASE r.ex_name WHEN 'Wall Sit' THEN 4 ELSE 3 END,
  CASE r.ex_name
    WHEN 'Wall Sit' THEN NULL
    WHEN 'Bulgarian Split Squat' THEN 10
    WHEN 'Face Pull' THEN 15
    WHEN 'Glute Kickback' THEN 15
    ELSE 12
  END
FROM (VALUES
  ('Wall Sit',                   1),
  ('Hip Thrust',                 2),
  ('Bulgarian Split Squat',      3),
  ('Dumbbell Row',               4),
  ('Face Pull',                  5),
  ('Incline Dumbbell Press',     6),
  ('Arnold Press',               7),
  ('Hammer Curls',               8),
  ('Tricep Overhead Extension',  9),
  ('Glute Kickback',             10),
  ('Calf Raises',                11)
) AS r(ex_name, pos)
JOIN public.exercises e ON e.name = r.ex_name AND e.created_by_user_id IS NULL;
