-- Classroom: courses, modules, and completion tracking

CREATE TABLE public.courses (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by  uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  title       text NOT NULL,
  description text,
  thumbnail_url text,
  sort_order  integer DEFAULT 0,
  is_locked   boolean DEFAULT true,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE public.course_modules (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id   uuid REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  title       text NOT NULL,
  youtube_url text,
  notes       text,
  sort_order  integer DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE public.module_completions (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  module_id    uuid REFERENCES public.course_modules(id) ON DELETE CASCADE NOT NULL,
  completed_at timestamptz DEFAULT now(),
  UNIQUE(user_id, module_id)
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_completions ENABLE ROW LEVEL SECURITY;

-- Courses: all authenticated users can read; only educators can write
CREATE POLICY "courses_select" ON public.courses FOR SELECT TO authenticated USING (true);
CREATE POLICY "courses_insert" ON public.courses FOR INSERT TO authenticated
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'educator');
CREATE POLICY "courses_update" ON public.courses FOR UPDATE TO authenticated
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'educator');
CREATE POLICY "courses_delete" ON public.courses FOR DELETE TO authenticated
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'educator');

-- Modules: all authenticated users can read; only educators can write
CREATE POLICY "modules_select" ON public.course_modules FOR SELECT TO authenticated USING (true);
CREATE POLICY "modules_insert" ON public.course_modules FOR INSERT TO authenticated
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'educator');
CREATE POLICY "modules_update" ON public.course_modules FOR UPDATE TO authenticated
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'educator');
CREATE POLICY "modules_delete" ON public.course_modules FOR DELETE TO authenticated
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'educator');

-- Completions: users see and manage their own; educators see all
CREATE POLICY "completions_select" ON public.module_completions FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'educator');
CREATE POLICY "completions_insert" ON public.module_completions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "completions_delete" ON public.module_completions FOR DELETE TO authenticated
  USING (user_id = auth.uid());
