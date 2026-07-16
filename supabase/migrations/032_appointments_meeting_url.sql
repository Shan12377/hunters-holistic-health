-- Add meeting_url to appointments so TidyCal Zoom links are stored per booking
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS meeting_url TEXT;
