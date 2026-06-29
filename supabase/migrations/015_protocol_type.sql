ALTER TABLE public.client_protocols
  ADD COLUMN IF NOT EXISTS protocol_type TEXT NOT NULL DEFAULT 'blood_pressure';
