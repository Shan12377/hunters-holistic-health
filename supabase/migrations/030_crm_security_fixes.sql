-- CRM Security Fixes
--
-- Fix 1: contacts_view was created without security_invoker, so it ran as the
-- postgres superuser and bypassed RLS on leads, profiles, and activities.
-- Any authenticated user could read all lead and client data.
-- Recreate with security_invoker = on so RLS on underlying tables is enforced.

CREATE OR REPLACE VIEW public.contacts_view WITH (security_invoker = on) AS

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
WHERE p.role = 'client';


-- Fix 2: The profiles UPDATE policy had no WITH CHECK clause, so any client
-- could set their own role = 'educator' and gain CRM access.
-- Add a trigger that blocks role column changes from client-side sessions.
-- auth.uid() returns null for service-role requests (server-side), so
-- legitimate server-side role changes (e.g., the SQL Editor command in CLAUDE.md)
-- still work.

CREATE OR REPLACE FUNCTION public.prevent_client_role_escalation()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role AND auth.uid() IS NOT NULL THEN
    RAISE EXCEPTION 'Role changes must be made through the server-side admin API, not the client.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_no_role_escalation ON public.profiles;

CREATE TRIGGER enforce_no_role_escalation
  BEFORE UPDATE OF role ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_client_role_escalation();
