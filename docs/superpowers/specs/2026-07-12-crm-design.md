# Hunter's Holistic Health CRM — Design Spec

Date: 2026-07-12
Status: Approved for planning

## Context

Hunter's Holistic Health already has a production app (Vite + React, Supabase, Stripe, Vercel) with a rough client roster (`CoachDashboard.tsx`) but no real CRM: no queryable lead/prospect pipeline before signup, no deal/stage visibility beyond the Stripe `plan` field, no communication timeline, and no follow-up task system. This spec covers building that CRM as new, additive features inside the existing app — not a separate application.

Longer term, the goal (stated by the business owner, out of scope for this build) is a multi-business platform with per-business workspaces sharing one CRM engine. This spec does not implement multi-tenancy; it avoids decisions that would make that harder later, but does not build for it now.

The MVP scope, in priority order: **Contacts, Pipeline, Calendar, Tasks, AI search.** This mirrors core CRM concepts (Accounts/Contacts/Leads/Opportunities/Activities) rather than attempting to replicate Salesforce's full feature surface.

## Non-goals for this build

- No multi-business / multi-tenant architecture.
- No in-app AI search bar (deferred to a later phase — the MVP AI capability is a Claude Skill instead, see below).
- No AI-drafted outbound follow-ups (deferred).
- No self-built scheduling/availability engine (using TidyCal instead).
- No auto-generated tasks (e.g. "no activity in 14 days" nudges) — task creation is manual for v1.
- No changes to the `auth.users` / signup trigger path.

## Data model

All new tables are additive. Nothing about `profiles`, `auth.users`, or existing Stripe columns changes.

### `leads`
Pre-signup contacts (inquiries, bookings, manual entries).

| column | type | notes |
|---|---|---|
| id | uuid, PK | |
| first_name, last_name | text | |
| email | text | |
| phone | text, nullable | |
| source | text | `intake_join`, `intake_clinical_inquiry`, `intake_support`, `intake_feature_request`, `manual`, `tidycal_booking` |
| status | text | `new` → `contacted` → `consult_booked` → `trial` → `converted` → `lost`, check constraint |
| lost_reason | text, nullable | |
| converted_to_profile_id | uuid, nullable, FK → profiles(id) | set at conversion |
| created_at, updated_at | timestamptz | |

Lead creation is an upsert keyed on `email` where no existing `leads` row for that email is already `converted`: a second intake submission or booking from the same email updates the existing lead's `source`/`updated_at` and logs a new `activities` row, rather than creating a duplicate pipeline card. If the email already belongs to a converted lead or an existing `profiles` row, no new lead is created — the touch is logged as an `activities` row against the existing client instead.

### `contacts_view` (SQL view, not a table)
`UNION` of unconverted `leads` rows and `profiles` rows (joined to their Stripe `plan`). Presents one consistent shape to the UI:

`id, kind ('lead'|'client'), first_name, last_name, email, pipeline_stage, source, created_at, last_activity_at`

`pipeline_stage` for `kind = 'lead'` is `leads.status`. For `kind = 'client'` it's derived from `profiles.plan` (`client_foundation` / `client_program` / `client_vip`) with a `churned` state if the Stripe subscription is cancelled.

### `activities`
Interaction timeline, one row per touch.

| column | type | notes |
|---|---|---|
| id | uuid, PK | |
| lead_id | uuid, nullable, FK → leads(id) | |
| profile_id | uuid, nullable, FK → profiles(id) | |
| type | text | `note`, `call`, `email`, `sms`, `form_submission`, `booking`, `stage_change` |
| body | text | |
| created_by | uuid, FK → profiles(id) | the educator who logged it |
| created_at | timestamptz | |

Check constraint: exactly one of `lead_id` / `profile_id` is non-null.

### `tasks`
Educator follow-up queue.

| column | type | notes |
|---|---|---|
| id | uuid, PK | |
| lead_id | uuid, nullable, FK → leads(id) | |
| profile_id | uuid, nullable, FK → profiles(id) | |
| title | text | |
| due_at | timestamptz | |
| status | text | `open`, `done`, `snoozed`, check constraint |
| created_at, completed_at | timestamptz | |

Same one-of-two-FKs constraint as `activities`.

### `appointments`
Synced from TidyCal (or any future booking provider) via webhook.

| column | type | notes |
|---|---|---|
| id | uuid, PK | |
| lead_id | uuid, nullable, FK → leads(id) | |
| profile_id | uuid, nullable, FK → profiles(id) | |
| source | text | `tidycal` today; kept generic for future providers |
| external_booking_id | text | provider's booking id, unique per source |
| appointment_type | text | |
| start_at, end_at | timestamptz | |
| status | text | `booked`, `completed`, `cancelled`, `no_show` |
| created_at | timestamptz | |

Same one-of-two-FKs constraint as `activities`.

## Lifecycle

1. A prospect submits an intake form (`/join`, `/clinical-inquiry`, etc.) → existing n8n webhook call is unchanged, **plus** a new `leads` row is written with the matching `source`.
2. A prospect books via the embedded TidyCal widget → TidyCal webhook fires → `/api/webhooks/tidycal.ts` creates a `leads` row if the email isn't already a lead or client, creates an `appointments` row, and logs an `activities` row (`type: 'booking'`).
3. The educator works the pipeline: drags cards between stages (writes `leads.status` + an `activities` stage_change row), logs notes/calls, creates tasks.
4. When a lead signs up and pays, the existing Stripe webhook handler gets one additive step: look up a `leads` row by email, set `status = 'converted'` and `converted_to_profile_id`. From then on `contacts_view` picks them up as `kind: 'client'` automatically.

## UI

- **Pipeline view** (replaces `CoachDashboard.tsx`'s current roster-only view): kanban board, one column per `contacts_view.pipeline_stage`. Clicking a card opens a **Contact Detail** panel: contact info, full `activities` timeline, open `tasks`, `appointments` history, an "add note" box.
- **Tasks view**: queue grouped into Overdue / Today / Upcoming / Snoozed, each task deep-links to its contact.
- **Calendar view**: embedded TidyCal booking widget plus a read-only agenda of upcoming `appointments`.

## AI search (Claude Skill, not in-app)

A new Claude Skill (installed the same way as the existing `automation-kit/skills/*`) that lets the educator ask natural-language questions ("show me every VIP client who hasn't logged in for 2 weeks") directly in Claude. It queries `contacts_view` / `activities` / `tasks` through a **read-only** Supabase credential — scoped at the credential level, not just by prompt instruction, so it cannot mutate CRM data regardless of what it's asked. This follows the existing automation-kit philosophy: judgment-requiring work runs in Claude with a human in the loop; only reliable, unattended plumbing runs as unsupervised automation.

An in-app search bar (OpenAI-powered, available to anyone with educator access without opening Claude) is explicitly deferred to a later phase.

## Compliance & security

- All new tables hold business/CRM data (names, emails, pipeline stage, notes) — not clinical/PHI — and stay in the app's existing non-PHI layer.
- RLS on `leads`, `activities`, `tasks`, `appointments` restricted to `role = 'educator'`, matching the existing pattern.
- Free-text `notes`/`activities.body` fields get placeholder copy reminding "non-clinical only — clinical details go through the secure clinical lane." No blocking content filter for v1 (avoids false positives / overengineered NLP for an MVP).
- New webhook endpoints (`tidycal.ts`, and the addition to existing intake handlers) follow the existing Architecture Rules: signature/secret validation, Supabase client initialized inside the handler (never module-level), top-level try/catch on every handler.
- The Claude Skill uses a read-only credential — structurally incapable of writing, independent of prompt-level guardrails.

## Testing plan

1. Migrations applied and verified in Supabase SQL editor before any app code lands.
2. `npm run build` clean (zero TypeScript errors) per the existing pre-deploy checklist.
3. Manual browser pass: submit an intake form → lead appears in Pipeline → drag a stage change → activity logged → create/complete a task → send a TidyCal test booking → appointment appears in Calendar view → complete a test signup → lead converts and reappears via `contacts_view` as a client.
4. RLS check: confirm a client-role session cannot read `leads` / `tasks` / `activities` / `appointments`.
5. Skill check: run a handful of natural-language queries against seeded test data, confirm accurate results, confirm no write path exists.

## Open questions for implementation planning

- Exact TidyCal webhook payload shape and signature verification method (needs a look at TidyCal's webhook docs during planning, not assumed here).
- Whether `assigned_to` on `leads`/`tasks` is needed now (single-educator business today) or can wait — leaning toward omitting it for v1 since there's only one educator, adding later is a trivial column.
