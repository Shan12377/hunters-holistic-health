# Hunter's Holistic Health CRM: Design Spec v2

Date: 2026-07-12 (revised 2026-07-13)
Status: Approved for planning. All previously open questions are resolved in this revision (see "Resolved decisions").

## Context

Hunter's Holistic Health has a production app (Vite + React, Supabase, Stripe, Vercel) with a client roster (`src/pages/coach/CoachDashboard.tsx`) but no real CRM: no queryable lead pipeline before signup, no stage visibility beyond the Stripe `plan` field, no communication timeline, and no follow-up task system. This spec builds that CRM as additive features inside the existing app, not a separate application.

### Strategic direction (decided 2026-07-13)

The long-term goal is a sellable, multi-business CRM platform: one CRM engine, per-business workspaces, healthcare educators as the first vertical. This build does NOT implement multi-tenancy, but every table, policy, and API decision includes the seams so that flipping to multi-tenant SaaS later is a migration, not a rewrite. The specific seams and the exact later migration are defined in "Sellability path" below.

MVP scope, in priority order: **Contacts, Pipeline, Calendar, Tasks, AI assistant (Claude Skill).** This copies CRM concepts (Contacts, Leads, Opportunities, Activities), not Salesforce's feature surface. Phase 2 (in-app AI) is fully specified in this document but explicitly not built in v1.

## Non-goals for v1

- No multi-workspace UI, no workspace switching, no team invites. (Seams only.)
- No in-app AI search bar or AI drafting. (Fully specified for Phase 2 below.)
- No self-built scheduling engine. TidyCal remains the booking provider.
- No auto-generated tasks (for example "no activity in 14 days" nudges). Task creation is manual in v1.
- No changes to the `auth.users` / signup trigger path.
- No invoicing, marketing, or client-portal modules. Those are platform phases 3+, out of scope here.

## Architecture principles

1. **Workspace seam on every new table.** Every new CRM table carries `workspace_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'` referencing a new `workspaces` table seeded with exactly one row (Hunter's Holistic Health). V1 code never filters by it; RLS and queries ignore it. It exists so multi-tenancy later is "drop the default, add the policy," not "rewrite the schema."
2. **n8n owns unattended plumbing, the app owns interactive UI, Claude owns judgment.** This matches the existing automation-kit philosophy. Lead capture and TidyCal sync run in n8n. Pipeline UI runs in the app. Natural-language questions run in a Claude Skill with a human in the loop.
3. **Additive only.** Nothing about `profiles`, `auth.users`, or existing Stripe columns changes. New migrations continue the existing sequence starting at `025_`.

## Data model

Five migrations, applied in order:

- `025_workspaces.sql`: `workspaces` table + seed row
- `026_leads.sql`
- `027_activities_tasks.sql`
- `028_appointments.sql`
- `029_contacts_view.sql`

### `workspaces`

| column | type | notes |
|---|---|---|
| id | uuid, PK | seed row id `00000000-0000-0000-0000-000000000001` |
| name | text | seed: `Hunter's Holistic Health` |
| created_at | timestamptz | |

One row in v1. No UI. No FK from `profiles` yet (that is part of the later multi-tenant migration).

### `leads`

Pre-signup contacts (inquiries, bookings, manual entries).

| column | type | notes |
|---|---|---|
| id | uuid, PK | |
| workspace_id | uuid, NOT NULL, FK → workspaces, default seed id | |
| first_name, last_name | text | |
| email | text | unique partial index: `UNIQUE (email) WHERE status != 'lost'` is NOT used; see dedupe rule below instead |
| phone | text, nullable | |
| source | text | `intake_join`, `intake_clinical_inquiry`, `intake_support`, `intake_feature_request`, `manual`, `tidycal_booking` |
| status | text, check constraint | `new` → `contacted` → `consult_booked` → `trial` → `converted` → `lost` |
| lost_reason | text, nullable | |
| converted_to_profile_id | uuid, nullable, FK → profiles(id) | set at conversion |
| created_by | uuid, nullable, FK → profiles(id) | null when created by automation (n8n) |
| created_at, updated_at | timestamptz | |

**Dedupe rule (enforced in the n8n workflow and the manual-add API, not by DB constraint):** lead creation is an upsert keyed on `email` against non-`converted` leads. A second intake or booking from the same email updates the existing lead's `source` and `updated_at` and logs a new `activities` row instead of creating a duplicate card. If the email already belongs to a converted lead or an existing `profiles` row, no lead is created; the touch is logged as an `activities` row against the existing client. A DB-level unique constraint is deliberately avoided because a lost lead may legitimately re-enter the pipeline as a new row.

### `contacts_view` (SQL view, not a table)

`UNION ALL` of unconverted `leads` and `profiles` (clients). One consistent shape for the UI:

`id, kind ('lead'|'client'), workspace_id, first_name, last_name, email, pipeline_stage, source, created_at, last_activity_at`

- `pipeline_stage` for leads is `leads.status`.
- `pipeline_stage` for clients derives from `profiles.plan`. The real plan values are `free`, `foundation`, `program`, `vip`, `overhaul` (per `022_free_plan.sql`), mapped to stages `client_free`, `client_foundation`, `client_program`, `client_vip`, `client_overhaul`, plus `churned` when the Stripe subscription is cancelled.
- `last_activity_at` is a correlated max over `activities`; if the view is slow at real data volumes, materialize the column later. Do not pre-optimize.

### `activities`

Interaction timeline, one row per touch.

| column | type | notes |
|---|---|---|
| id | uuid, PK | |
| workspace_id | uuid, NOT NULL, FK, default seed id | |
| lead_id | uuid, nullable, FK → leads(id) | |
| profile_id | uuid, nullable, FK → profiles(id) | |
| type | text | `note`, `call`, `email`, `sms`, `form_submission`, `booking`, `stage_change` |
| body | text | |
| created_by | uuid, nullable, FK → profiles(id) | null when logged by automation |
| created_at | timestamptz | |

Check constraint: exactly one of `lead_id` / `profile_id` is non-null.

### `tasks`

Educator follow-up queue.

| column | type | notes |
|---|---|---|
| id | uuid, PK | |
| workspace_id | uuid, NOT NULL, FK, default seed id | |
| lead_id | uuid, nullable, FK → leads(id) | |
| profile_id | uuid, nullable, FK → profiles(id) | |
| title | text | |
| due_at | timestamptz | |
| status | text, check constraint | `open`, `done`, `snoozed` |
| created_by | uuid, nullable, FK → profiles(id) | |
| created_at, completed_at | timestamptz | |

Same one-of-two-FKs constraint.

### `appointments`

Synced from TidyCal via API polling (see integration section).

| column | type | notes |
|---|---|---|
| id | uuid, PK | |
| workspace_id | uuid, NOT NULL, FK, default seed id | |
| lead_id | uuid, nullable, FK → leads(id) | |
| profile_id | uuid, nullable, FK → profiles(id) | |
| source | text | `tidycal` today; generic for future providers |
| external_booking_id | text | provider's booking id, `UNIQUE (source, external_booking_id)` |
| appointment_type | text | |
| start_at, end_at | timestamptz | |
| status | text | `booked`, `completed`, `cancelled`, `no_show` |
| created_at | timestamptz | |

Same one-of-two-FKs constraint. The unique key on `(source, external_booking_id)` makes the polling sync idempotent: re-polling the same booking is an upsert, never a duplicate.

## TidyCal integration (resolved)

**Fact, verified 2026-07-13: TidyCal does not offer native webhooks.** It offers a REST API (docs at `tidycal.com/developer/docs`) authenticated with OAuth 2.0 or, simpler for a single account, a **personal access token** created at `tidycal.com/integrations/oauth` and passed in the `Authorization` header. The API includes a bookings list endpoint.

So the integration is **polling, not webhooks**, and it lives in n8n (unattended plumbing), matching how the Daily Business Briefing already talks to Supabase:

1. New n8n scheduled workflow, "TidyCal CRM Sync," runs every 10 minutes.
2. Calls the TidyCal bookings endpoint with the personal access token, requesting bookings updated since the last run (fall back to "last 48 hours" if the API lacks an updated-since filter; the upsert makes over-fetching harmless).
3. For each booking: upsert `appointments` on `(source, external_booking_id)`; apply the lead dedupe rule (create or touch a `leads` row with `source = 'tidycal_booking'`); log an `activities` row (`type: 'booking'`) only when the booking is new or its status changed.
4. Cancellations and reschedules arrive on the next poll as status/time changes on the same `external_booking_id`.

Credentials: the TidyCal personal access token and the Supabase service-role connection are stored in n8n's credential store on Railway, never in the app or repo. Worst-case staleness is one poll interval (10 minutes), which is acceptable for a consult pipeline.

## Intake form wiring (resolved)

The intake pages (`src/pages/intake/JoinPage.tsx` and siblings) POST directly from the browser to the n8n webhook. There are no intake handlers under `/api`, so lead creation cannot be "an additive step in the existing API handler" as the v1 draft assumed. Instead:

- The existing n8n intake workflow gains one Supabase node that applies the dedupe rule and writes the `leads` row (and its `form_submission` activity) with the matching `source`.
- Zero frontend changes. Zero new API routes for intake. The `leads` table needs no anon-role insert policy, keeping RLS educator-only.

Manual lead entry from the Pipeline UI goes through the normal authenticated Supabase client under educator RLS. No API route needed.

## Stripe conversion (additive step)

The existing `api/stripe-webhook.ts` `checkout.session.completed` branch gets one additive step: look up a non-converted `leads` row by the checkout email; if found, set `status = 'converted'` and `converted_to_profile_id`. From then on `contacts_view` presents them as `kind: 'client'`. If no lead exists (client signed up cold), nothing happens, which is correct.

## Lifecycle

1. Prospect submits an intake form → n8n receives it (unchanged) → n8n writes/touches the `leads` row and logs the activity.
2. Prospect books via the embedded TidyCal widget → next poll of "TidyCal CRM Sync" creates the appointment, lead, and booking activity.
3. Educator works the pipeline: drags cards between stages (writes `leads.status` plus a `stage_change` activity), logs notes and calls, creates tasks.
4. Lead pays → Stripe webhook converts the lead → `contacts_view` picks them up as a client automatically.
5. Client churns (subscription cancelled) → existing `customer.subscription.deleted` handling already downgrades the plan; `contacts_view` shows `churned`.

## UI

All new UI lives under the existing coach area and follows CSS Modules (no Tailwind, no inline styles).

- **Pipeline view** (extends `src/pages/coach/CoachDashboard.tsx` area): kanban board, one column per `contacts_view.pipeline_stage`. Clicking a card opens a **Contact Detail** panel: contact info, full `activities` timeline, open `tasks`, `appointments` history, an "add note" box, and a "add lead" button for manual entries.
- **Tasks view**: queue grouped Overdue / Today / Upcoming / Snoozed; each task deep-links to its contact.
- **Calendar view**: embedded TidyCal booking widget plus a read-only agenda of upcoming `appointments`.

Drag-and-drop: use native HTML drag events. No new dependency unless native events prove genuinely insufficient during build.

## AI assistant

### V1: Claude Skill (build now)

A new Claude Skill, installed like the existing `automation-kit/skills/*`, that answers natural-language questions ("show me every VIP client with no activity in 2 weeks") by querying `contacts_view`, `activities`, `tasks`, and `appointments` through a **read-only Supabase credential**. Read-only is enforced at the credential level (a Postgres role with SELECT-only grants on exactly these four relations), not by prompt instruction, so the Skill is structurally incapable of writing regardless of what it is asked.

### Phase 2 roadmap (specified now, built later)

These are fully scoped so nothing is left undefined, and deliberately deferred so v1 ships:

1. **In-app natural-language search bar** on the Pipeline view. Educator types a question; a Vercel API route (`/api/crm-search.ts`) sends the question plus the four relation schemas to the Anthropic API, gets back a parameterized SQL SELECT, validates it against an allowlist (SELECT-only, only the four CRM relations, LIMIT enforced), executes it with the same read-only role as the Skill, renders results as contact cards. New env var: `ANTHROPIC_API_KEY`.
2. **AI follow-up drafts.** From a Contact Detail panel, "draft follow-up" sends the activity timeline to the API and returns an email/SMS draft the educator copies out manually. No sending integration in phase 2; drafts only. Requires the standard AI-content compliance pass before any template ships.
3. **Voice note to task.** Educator records a voice note in the Tasks view; transcription plus one Claude call yields title and due date; educator confirms before the task is created. Human confirms every AI-created record.

Phase 2 items each require the Compliance Check Rule pass from CLAUDE.md before build, since they generate AI content in a health-adjacent product.

## Sellability path (the exact later migration)

When this becomes a product sold to other educators, the migration is:

1. Add `workspace_id` to `profiles` (nullable, backfill to the seed workspace, then NOT NULL).
2. Drop the `DEFAULT` on `workspace_id` across CRM tables.
3. Replace educator-role RLS with workspace-membership RLS: `workspace_id = (SELECT workspace_id FROM profiles WHERE id = auth.uid())` plus the role check.
4. Add `workspace_members` (workspace_id, profile_id, role) when a workspace gains a second seat, and add `assigned_to uuid FK → profiles(id)` to `leads` and `tasks` at that same moment (see Resolved decisions).
5. Workspace onboarding UI, per-workspace TidyCal/n8n credentials, and per-workspace Stripe billing are new product work at that point, not schema surgery.

Because every v1 table already carries `workspace_id`, steps 1 to 3 are mechanical.

## Compliance & security

- All new tables hold business/CRM data (names, emails, pipeline stage, notes), not clinical/PHI, and stay in the app's existing non-PHI layer. Any feature request that would put labs, conditions, or clinical detail into these tables triggers the HIPAA Hard Stop Rule.
- RLS on `leads`, `activities`, `tasks`, `appointments`, `workspaces`: educator-role only, matching the existing pattern in `001_initial_schema.sql`. Confirmed: client-role sessions must not read any CRM table.
- Free-text note fields get placeholder copy: "Non-clinical only. Clinical details go through the secure clinical lane." No blocking content filter in v1 (avoids false positives for an MVP); revisit if notes drift clinical in practice.
- n8n holds the TidyCal token and service-role Supabase credential; the app never sees them.
- The Claude Skill and the phase 2 search route share one read-only Postgres role. One place to audit.
- Any future API route in this feature follows the existing Architecture Rules: thin handlers, clients initialized inside the handler, top-level try/catch returning JSON errors.

## Testing plan

1. Migrations `025` to `029` applied and verified in the Supabase SQL editor before any app code lands.
2. `npm run build` clean, zero TypeScript errors, per the pre-deploy checklist.
3. Manual browser pass: submit an intake form → lead appears in Pipeline → drag a stage change → activity logged → create, snooze, and complete a task → trigger the TidyCal sync against a real test booking → appointment appears in Calendar → complete a test signup with the lead's email → lead converts and reappears via `contacts_view` as a client.
4. Dedupe pass: submit two intake forms with the same email → one lead, two activities. Book with a converted client's email → no new lead, one activity on the client.
5. Idempotency pass: run the TidyCal sync twice over the same window → row counts unchanged.
6. RLS check: a client-role session cannot select from any CRM table; verify with the test client account (`testclient@test.com`).
7. Skill check: run natural-language queries against seeded data; confirm accurate results; confirm the read-only role rejects an INSERT attempt.

## Resolved decisions (formerly open questions)

1. **TidyCal transport: API polling via n8n.** TidyCal has no native webhooks (verified against TidyCal's own docs and integration listings, 2026-07-13). Personal access token auth, bookings endpoint, 10-minute schedule, idempotent upsert on `(source, external_booking_id)`. During implementation, the only remaining task is reading the response JSON once to map field names; the design does not depend on the exact shape.
2. **`assigned_to`: omitted from v1.** Single-educator business today; `created_by` covers attribution. The trigger to add it is defined: the moment a workspace gains a second member (Sellability path step 4), run `ALTER TABLE leads ADD COLUMN assigned_to uuid REFERENCES profiles(id); ALTER TABLE tasks ADD COLUMN assigned_to uuid REFERENCES profiles(id);` and default new rows to the creating member. Nothing in v1 blocks this.
3. **Multi-tenancy: seams only.** `workspace_id` everywhere with a defaulted seed workspace; the full flip is enumerated in "Sellability path."
4. **AI scope: Claude Skill in v1; in-app AI is phase 2, fully specified above.**
5. **Client pipeline stages** map from the real five plan values (`free`, `foundation`, `program`, `vip`, `overhaul`) plus `churned`, correcting the v1 draft which assumed three.
6. **Intake lead capture lives in n8n**, not the frontend and not a new API route, because intake forms already POST straight to n8n from the browser.
