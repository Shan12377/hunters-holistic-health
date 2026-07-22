-- Custom exercises: let clients add their own exercises to the tracker

-- Add ownership + sets preference to the exercises table
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS created_by_user_id uuid REFERENCES auth.users ON DELETE CASCADE;
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS sets_default integer DEFAULT 3;

-- Drop the global UNIQUE constraint on name; replace with partial index
-- so global exercises are still unique by name, but users can freely name their own
ALTER TABLE public.exercises DROP CONSTRAINT IF EXISTS exercises_name_key;
CREATE UNIQUE INDEX IF NOT EXISTS exercises_global_name_unique ON public.exercises(name) WHERE created_by_user_id IS NULL;

-- Update RLS on exercises
DROP POLICY IF EXISTS "Authenticated read exercises" ON public.exercises;
CREATE POLICY "Read exercises" ON public.exercises FOR SELECT
  USING (created_by_user_id IS NULL OR created_by_user_id = auth.uid());

CREATE POLICY "Users insert custom exercises" ON public.exercises FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = created_by_user_id);

CREATE POLICY "Users delete own custom exercises" ON public.exercises FOR DELETE
  USING (auth.uid() = created_by_user_id);
