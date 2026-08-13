-- A demonstration video for every exercise.
--
-- Replaces the routine level video added in 044. One video per routine was the
-- wrong shape: a 30 minute follow along does not necessarily contain the
-- movement you are standing there trying to do. What people need is "show me
-- this one, now", so the link lives on the exercise.
--
-- Every ID below was verified public through the YouTube oEmbed endpoint on
-- 2026-08-13, which returns the real title and channel only if the video exists
-- and is viewable. Search results alone are not proof.
--
--   curl "https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=ID&format=json"
--
-- Source: 14 of the 20 are HASfit (Coach Kozak), preferred because the channel
-- is free, has no upsell, and demonstrates plainly rather than selling a look.
-- HASfit does not publish the other six, so those come from other channels,
-- each chosen for a neutral instructional tone. The UI names the channel on
-- every link so nobody thinks these are Dr. Hunter's own videos.

ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS video_url     text;
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS video_channel text;

UPDATE public.exercises SET
  video_url     = 'https://www.youtube.com/watch?v=' || v.vid,
  video_channel = v.channel
FROM (VALUES
  ('Wall Sit',                  'JjWs0cwqxEk', 'HASfit'),
  ('Goblet Squat',              'logZhoMdYGg', 'HASfit'),
  ('Romanian Deadlift',         '8WFa3wW_10Q', 'HASfit'),
  ('Bulgarian Split Squat',     'gyue5CLdma0', 'HASfit'),
  ('Lat Pulldown',              '7UjOe_K56Do', 'HASfit'),
  ('Chest Press',               'XnyZaomDuuA', 'HASfit'),
  ('Incline Dumbbell Press',    'E2Gm3P5jtZ4', 'HASfit'),
  ('Overhead Press',            'xXgS4gIw3IQ', 'HASfit'),
  ('Arnold Press',              'VerSYdh0Sro', 'HASfit'),
  ('Dumbbell Row',              'ZdWa7os8VvY', 'HASfit'),
  ('Hammer Curls',              '7Roxg4YH-Gk', 'HASfit'),
  ('Lateral Raises',            'bPlhGsV8f9c', 'HASfit'),
  ('Calf Raises',               'tVJC_JwBJik', 'HASfit'),
  -- The Tricep Extensions coaching cue says "spread rope at the bottom", so the
  -- rope pushdown is the movement being described, not a lying extension.
  ('Tricep Extensions',         'NIodhHkli2Y', 'HASfit'),
  -- Not in the HASfit library. These six are other channels.
  ('Bicep Curls',               'w7hl4IbHMtY', 'Live Lean TV'),
  ('Tricep Overhead Extension', 'IJ6J7EKprsc', 'Dr. Allan Bacon'),
  ('Cable Row',                 'xQNrFHEMhI4', 'Bodybuilding.com'),
  ('Face Pull',                 '03irpA4veHM', 'J2FIT Strength'),
  ('Hip Thrust',                'LZWQgMxryDc', 'Catalyst Athletics'),
  ('Glute Kickback',            'bVrmtCI00Ys', 'Physique Development')
) AS v(name, vid, channel)
WHERE public.exercises.name = v.name
  AND public.exercises.created_by_user_id IS NULL;

-- Drop the routine level videos from 044. They are the wrong unit.
UPDATE public.workout_routines SET video_url = NULL WHERE user_id IS NULL;
