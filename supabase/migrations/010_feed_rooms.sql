-- Add room column to feed_posts for community channel support
ALTER TABLE public.feed_posts
ADD COLUMN IF NOT EXISTS room TEXT NOT NULL DEFAULT 'general';

ALTER TABLE public.feed_posts
ADD CONSTRAINT feed_posts_room_check
CHECK (room IN ('general', 'wins', 'questions', 'challenges', 'resources'));

CREATE INDEX IF NOT EXISTS idx_feed_posts_room ON public.feed_posts(room, created_at DESC);
