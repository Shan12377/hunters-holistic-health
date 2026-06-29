ALTER TABLE public.client_protocols
  ADD COLUMN IF NOT EXISTS protocol_data JSONB;
