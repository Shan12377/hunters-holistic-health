-- 023_free_tier_rls.sql
-- Enforce free-tier plan restrictions at the database level.
-- Client-side guards in FeedPage are UX gates; these policies are the real boundary.

-- Free users may only insert one intro post and nothing else.
CREATE POLICY "feed_posts_free_tier_limit" ON public.feed_posts
  AS RESTRICTIVE
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Non-free users: always pass
    (SELECT plan FROM public.profiles WHERE id = auth.uid()) != 'free'
    OR (
      -- Free users: must be posting an intro
      post_type = 'intro'
      -- And must not already have one
      AND NOT EXISTS (
        SELECT 1 FROM public.feed_posts fp
        WHERE fp.user_id = auth.uid() AND fp.post_type = 'intro'
      )
    )
  );

-- Free users cannot like posts. Likes are a Foundation-tier community feature.
CREATE POLICY "feed_likes_free_tier_block" ON public.feed_likes
  AS RESTRICTIVE
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT plan FROM public.profiles WHERE id = auth.uid()) != 'free'
  );
