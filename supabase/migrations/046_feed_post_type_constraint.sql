-- 046_feed_post_type_constraint.sql
-- The feed_posts_post_type_check constraint from 000_combined_setup.sql only
-- allowed ('check_in','late_slip','milestone','win','general'). The app's
-- composer (FeedPage.tsx) has offered 'intro', 'announcement', and 'question'
-- as selectable post types for a while, and the Questions room defaults new
-- posts to 'question'. Any post using one of those three types was rejected
-- outright by this stale constraint, failing silently behind the generic
-- "Failed to post" toast. Widen the constraint to match what the app actually
-- sends.

ALTER TABLE public.feed_posts DROP CONSTRAINT feed_posts_post_type_check;
ALTER TABLE public.feed_posts ADD CONSTRAINT feed_posts_post_type_check
  CHECK (post_type = ANY (ARRAY['check_in','late_slip','milestone','win','general','intro','announcement','question']::text[]));
