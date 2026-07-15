-- CRM: appointments synced from TidyCal via n8n polling
-- Upsert key: (source, external_booking_id) makes polling idempotent

CREATE TABLE IF NOT EXISTS public.appointments (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id        uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'
                        REFERENCES public.workspaces(id),
  lead_id             uuid REFERENCES public.leads(id) ON DELETE SET NULL,
  profile_id          uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  source              text NOT NULL DEFAULT 'tidycal',
  external_booking_id text NOT NULL,
  appointment_type    text,
  start_at            timestamptz NOT NULL,
  end_at              timestamptz NOT NULL,
  attendee_name       text,
  attendee_email      text,
  status              text NOT NULL DEFAULT 'booked' CHECK (status IN (
                        'booked',
                        'completed',
                        'cancelled',
                        'no_show'
                      )),
  created_at          timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT appointments_booking_unique UNIQUE (source, external_booking_id)
);

CREATE INDEX IF NOT EXISTS appointments_lead_idx    ON public.appointments (lead_id);
CREATE INDEX IF NOT EXISTS appointments_profile_idx ON public.appointments (profile_id);
CREATE INDEX IF NOT EXISTS appointments_start_idx   ON public.appointments (start_at DESC);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "educator_all_appointments" ON public.appointments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'educator'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'educator'
    )
  );
