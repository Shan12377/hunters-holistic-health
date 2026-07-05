-- 020_community_tables.sql
-- Creates poll_options, poll_votes, feed_comments, feed_reports
-- Adds privacy_settings to profiles
-- All with RLS.

-- Poll answer choices
CREATE TABLE IF NOT EXISTS public.poll_options (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id      UUID NOT NULL REFERENCES public.feed_posts(id) ON DELETE CASCADE,
  option_text  TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "poll_options_read"  ON public.poll_options FOR SELECT TO authenticated USING (true);
CREATE POLICY "poll_options_insert" ON public.poll_options FOR INSERT TO authenticated
  WITH CHECK (post_id IN (SELECT id FROM public.feed_posts WHERE user_id = auth.uid()));

-- Poll votes (unique per user per option)
CREATE TABLE IF NOT EXISTS public.poll_votes (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_option_id UUID NOT NULL REFERENCES public.poll_options(id) ON DELETE CASCADE,
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (poll_option_id, user_id)
);
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "poll_votes_read"   ON public.poll_votes FOR SELECT TO authenticated USING (true);
CREATE POLICY "poll_votes_manage" ON public.poll_votes FOR ALL    TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Feed comments
CREATE TABLE IF NOT EXISTS public.feed_comments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    UUID NOT NULL REFERENCES public.feed_posts(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.feed_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "feed_comments_read"   ON public.feed_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "feed_comments_insert" ON public.feed_comments FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "feed_comments_delete" ON public.feed_comments FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Feed reports (unique per user per post — prevents spam reports)
CREATE TABLE IF NOT EXISTS public.feed_reports (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    UUID NOT NULL REFERENCES public.feed_posts(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason     TEXT NOT NULL DEFAULT 'flagged',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id)
);
ALTER TABLE public.feed_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "feed_reports_insert" ON public.feed_reports FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "feed_reports_read" ON public.feed_reports FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'educator')
  );

-- Add privacy_settings to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS privacy_settings JSONB NOT NULL DEFAULT '{}';
