-- Fix contacts_view so educators can read it from the frontend.
--
-- Problem: migration 030 added security_invoker = on to close the
-- "any authenticated user can read all CRM data" hole. But security_invoker
-- makes the view execute as the calling user, and the calling user's JWT
-- cannot join auth.users (service-role only table). Result: the CLIENTS
-- union arm returns 0 rows for every frontend request, making the CRM
-- appear empty even when clients exist.
--
-- Fix: drop security_invoker and enforce educator-only access with an
-- explicit WHERE EXISTS check inside the view. The view runs as the view
-- owner (postgres), so auth.users is reachable. Non-educator users get
-- 0 rows because the WHERE EXISTS subquery evaluates false for them.

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
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'educator'
  )

UNION ALL

-- Clients (post-signup; email from auth.users)
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
WHERE p.role = 'client'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'educator'
  );

-- Grant SELECT to authenticated role so the frontend anon/user key can call it.
GRANT SELECT ON public.contacts_view TO authenticated;
