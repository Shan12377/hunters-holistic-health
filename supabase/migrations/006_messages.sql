-- General in-app messaging: client to educator, logistics and encouragement only.
-- Lane 1 by design. The composer carries a standing notice that clinical topics
-- belong in the clinical inquiry channel, and message content is plain text.

CREATE TABLE IF NOT EXISTS public.messages (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content       TEXT NOT NULL CHECK (char_length(content) <= 1000),
  read          BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_messages_recipient ON public.messages (recipient_id, read);
CREATE INDEX IF NOT EXISTS idx_messages_pair ON public.messages (sender_id, recipient_id, created_at);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Participants in a conversation can read their own messages
CREATE POLICY "Users can read own conversations"
  ON public.messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Senders can create messages as themselves only
CREATE POLICY "Users can send messages as themselves"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Recipients can mark their received messages as read
CREATE POLICY "Recipients can mark messages read"
  ON public.messages FOR UPDATE
  USING (auth.uid() = recipient_id)
  WITH CHECK (auth.uid() = recipient_id);

-- Clients need to find the educator to start a conversation.
-- This exposes only profile rows where role = 'educator' (the practice itself).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles'
      AND policyname = 'Authenticated users can view educator profiles'
  ) THEN
    CREATE POLICY "Authenticated users can view educator profiles"
      ON public.profiles FOR SELECT
      USING (role = 'educator' AND auth.uid() IS NOT NULL);
  END IF;
END $$;
