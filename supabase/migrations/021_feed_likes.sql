-- 021_feed_likes.sql
-- Per-user like tracking so one person cannot like the same post twice.
-- Primary key on (post_id, user_id) is the unique constraint.

CREATE TABLE IF NOT EXISTS public.feed_likes (
  post_id    UUID NOT NULL REFERENCES public.feed_posts(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, user_id)
);

ALTER TABLE public.feed_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feed_likes_read" ON public.feed_likes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "feed_likes_manage" ON public.feed_likes
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
