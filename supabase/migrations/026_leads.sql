-- CRM: leads table (pre-signup contacts)
-- Dedupe by email is enforced in n8n and the API, not by DB constraint.
-- A DB unique would block legitimate re-entry after a lost lead; n8n handles it instead.

CREATE TABLE IF NOT EXISTS public.leads (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id             uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'
                             REFERENCES public.workspaces(id),
  first_name               text,
  last_name                text,
  email                    text NOT NULL,
  phone                    text,
  source                   text NOT NULL CHECK (source IN (
                             'intake_join',
                             'intake_clinical_inquiry',
                             'intake_support',
                             'intake_feature_request',
                             'manual',
                             'tidycal_booking'
                           )),
  status                   text NOT NULL DEFAULT 'new' CHECK (status IN (
                             'new',
                             'contacted',
                             'consult_booked',
                             'trial',
                             'converted',
                             'lost'
                           )),
  lost_reason              text,
  converted_to_profile_id  uuid REFERENCES public.profiles(id),
  notes                    text,
  created_by               uuid REFERENCES public.profiles(id),
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS leads_email_idx ON public.leads (email);
CREATE INDEX IF NOT EXISTS leads_status_idx ON public.leads (status);
CREATE INDEX IF NOT EXISTS leads_workspace_idx ON public.leads (workspace_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.touch_leads_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.touch_leads_updated_at();

-- RLS: educator-only. Clients cannot read leads.
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "educator_all_leads" ON public.leads
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
