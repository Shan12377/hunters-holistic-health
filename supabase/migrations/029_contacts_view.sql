-- CRM: contacts_view unifies unconverted leads and active clients into one shape
-- Pipeline stage for leads = leads.status
-- Pipeline stage for clients = derived from profiles.plan
-- last_activity_at = correlated max over activities (materialize later if slow)

CREATE OR REPLACE VIEW public.contacts_view AS

-- Leads (pre-signup)
SELECT
  l.id,
  'lead'::text                          AS kind,
  l.workspace_id,
  l.first_name,
  l.last_name,
  l.email,
  l.phone,
  l.source,
  l.status                              AS pipeline_stage,
  l.notes,
  l.created_at,
  (
    SELECT MAX(a.created_at)
    FROM public.activities a
    WHERE a.lead_id = l.id
  )                                     AS last_activity_at
FROM public.leads l
WHERE l.status != 'converted'

UNION ALL

-- Clients (post-signup, derived from profiles; email from auth.users)
SELECT
  p.id,
  'client'::text                        AS kind,
  '00000000-0000-0000-0000-000000000001'::uuid AS workspace_id,
  p.first_name,
  p.last_name,
  u.email,
  NULL::text                            AS phone,
  'stripe'::text                        AS source,
  CASE p.plan
    WHEN 'free'       THEN 'client_free'
    WHEN 'foundation' THEN 'client_foundation'
    WHEN 'program'    THEN 'client_program'
    WHEN 'vip'        THEN 'client_vip'
    WHEN 'overhaul'   THEN 'client_overhaul'
    ELSE 'churned'
  END                                   AS pipeline_stage,
  NULL::text                            AS notes,
  p.created_at,
  (
    SELECT MAX(a.created_at)
    FROM public.activities a
    WHERE a.profile_id = p.id
  )                                     AS last_activity_at
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE p.role = 'client';
