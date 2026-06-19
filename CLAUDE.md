# Hunter's Holistic Health PWA Deployment Guide (Phase 1 + 2 Complete)

This repository contains the complete scaffolding for the Hunter's Holistic Health Progressive Web App (PWA). It is built with Vite, React, TypeScript, TailwindCSS v4, Supabase (Auth + Database), and Vercel (Hosting + Serverless API).

## What Has Been Built
1. **Public Marketing Site:** Landing page, features, pricing tiers, and compliance disclaimers.
2. **Auth System:** Login/Signup with privacy-first data collection (Age instead of DOB).
3. **Client Dashboard:** Daily progress ring, quick actions, and Late Slip trigger.
4. **BP Tracker:** Chart.js trend visualization with AHA/ACC zone color-coding.
5. **AI Meal Guard:** Frontend UI + Vercel Serverless proxy to keep OpenAI keys secure.
6. **Daily Log:** 10-point checklist (Nutrition, Fasting, Supps, Steps, Water, Energy).
7. **Protocol Viewer:** The ROOTS Framework educational curriculum.
8. **Supplement Log:** Manage and track daily supplement intake.
9. **Weekly Grade Report Card:** 4-week history of consistency scores and grades (A+ to F).
10. **Accountability Feed:** Private group feed to share wins, check-ins, and late slips.
11. **Settings Page:** Doxy.me integration, Fullscript integration, and account deletion.
12. **Educator Dashboard:** Client roster, streak tracking, and 1-click HTML Report generation.
13. **Legal Pages:** Fully drafted Terms of Service and Privacy Policy.
14. **Intake Gateway:** Four specialized non-PHI intake forms (/join, /support, /feature-request, /clinical-inquiry) wired to a self-hosted n8n webhook.

---

## Step-by-Step Launch Instructions

### 1. Supabase Setup (Database & Auth)
1. Go to [Supabase](https://supabase.com) and create a new project.
2. Go to **SQL Editor** → **New Query**.
3. Copy the entire contents of `supabase/migrations/001_initial_schema.sql` and run it. This creates your tables and Row Level Security (RLS) policies.
4. Go to **Project Settings** → **API**.
5. Copy your `Project URL` and `anon public key`.

### 2. OpenAI Setup (AI Meal Guard)
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys).
2. Create a new secret key.

### 3. Local Environment Setup
1. Rename `.env.example` to `.env.local`.
2. Paste your Supabase URL, Supabase Anon Key, and OpenAI API Key into the file.
3. Run the development server:
   ```bash
   npm install
   npm run dev
   ```

### 4. Making Yourself an Educator
By default, all new signups are `client` role. To see the Coach Dashboard:
1. Sign up for an account in your app.
2. Go to your Supabase Dashboard → **SQL Editor**.
3. Run this query (replace with your email):
   ```sql
   UPDATE public.profiles 
   SET role = 'educator' 
   WHERE id = (SELECT id FROM auth.users WHERE email = 'your@email.com');
   ```
4. Refresh the app. You will now see the "Educator View" in the sidebar.

### 5. Deployment to Vercel
1. Push this repository to GitHub.
2. Go to [Vercel](https://vercel.com) and click **Add New Project**.
3. Import your GitHub repository.
4. In the Vercel setup screen, open **Environment Variables**.
5. Add the following variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `OPENAI_API_KEY`
   - `VITE_N8N_WEBHOOK_URL`
6. Click **Deploy**.

*Note: Vercel automatically detects the `vercel.json` file and configures the serverless function (`/api/meal-guard.ts`) securely.*

---

## Compliance Notes for Claude / Cursor
If you ask an AI to modify this code, remind it of these rules:

### 1. HIPAA Hard Stop Rule
> Before writing any code involving a form field, data storage, or data transmission that relates to health, clinical, labs, or medical information, STOP immediately and consult Dr. Hunter. Do not proceed on your own judgment. This applies even if the field seems minor or low-risk.

### 2. Two-Layer Architecture Rule
> The app and n8n operate in the non-PHI layer only. The clinical lane is separate from the app and n8n workflow. Sensitive records, labs, and medically detailed materials must only be handled through the covered Google Workspace clinical lane after review and secure handoff. If a feature request would require crossing that line, flag it to Dr. Hunter before writing any code.

### 3. General Compliance
1. **"Educator" not "Coach":** The platform uses the term Functional Medicine Educator.
2. **No Medical Diagnoses:** The AI Meal Guard prompt and BP tracker UI are specifically engineered to provide *educational context*, not medical advice. Do not let AI code generators change this framing.
3. **Data Minimization:** Do not add fields for Date of Birth, SSN, or full addresses to the database schema.

---

## Google Workspace Clinical Lane Setup Guide

The app's `/clinical-inquiry` form acts as a gateway. It does not collect medical records. Once a user submits that form, all sensitive follow-up happens in a secure Google Workspace environment. Before using this flow with real clients, you must configure:

1. Sign the Google Workspace HIPAA BAA in the Admin Console before using PHI in covered services.
2. Enable MFA for all relevant accounts.
3. Set Drive sharing to private by default.
4. Disable or heavily restrict external sharing.
5. Use the standard client folder structure:
   - `Clients/`
   - `Clients/Client-LastName-FirstName-ID/`
   - `01 Intake`
   - `02 Labs`
   - `03 Notes`
   - `04 Care Plan`
   - `05 Exports`
6. Follow the five-step clinical handoff flow: Review app inquiry -> Create folder -> Email secure next steps via Gmail -> Receive documents securely -> Review in Drive.

---

## n8n Intake Workflow Blueprint

The app includes four non-PHI intake forms that POST to the `VITE_N8N_WEBHOOK_URL`. This workflow is designed to be portable and can be configured for other health educators, wellness practices, or small businesses with minimal changes.

**App Submission Types:**
- `early_access` (from `/join`)
- `support` (from `/support`)
- `feature_request` (from `/feature-request`)
- `clinical_inquiry` (from `/clinical-inquiry`)

**Google Sheet Tabs to Create:**
- `Early Access` (Columns: Timestamp, Submission Type, Name, Email, Phone, Access Type, App Goal, Feature Wishlist, Top Feature, Consent)
- `Support Requests` (Columns: Timestamp, Submission Type, Name, Email, Category, Short Description, Preferred Contact Method, Consent)
- `Feature Requests` (Columns: Timestamp, Submission Type, Name or Anonymous, Email, Feature Description, Category, Importance Rating)
- `Clinical Interest` (Columns: Timestamp, Submission Type, Name, Email, Phone, Service Interest, Preferred Contact Method, Brief Description, Consent, Review Status)

**Email Alert Rules:**
- Alerts sent from n8n should include ONLY: Name, Email, Category, and Timestamp.
- Do NOT include detailed free-text descriptions or health details in notification emails.
- Secure the webhook with a shared secret token.

## Writing Style Rules (Strictly Enforced)
These rules apply to ALL text in the UI, copy, comments, legal pages, and documentation:

1. **No em dashes.** The em dash character (—) is banned from this codebase entirely. It reads as AI-generated and is not the voice of this brand. Replace with:
   - A comma for a natural pause: "Life happens, and that is okay."
   - A colon for a label or lead-in: "Goal: 8,000 steps"
   - A semicolon for two related clauses: "Progress is not always linear; reflect and reset."
   - A period to split into two sentences when appropriate.
   - Parentheses for an aside: "High blood pressure (Stage 1)"
2. **No AI filler phrases.** Do not use phrases like "delve into", "it is worth noting", "in the realm of", "leverage", "unlock your potential", or similar AI-pattern language.
3. **Plain, direct language.** Write like a knowledgeable friend, not a marketing brochure. Short sentences. Active voice.
4. **Hyphens are fine** where grammatically correct (e.g., "evidence-informed", "privacy-first", "one-tap"). Only em dashes are prohibited.

*This project is ready for immediate deployment.*

---

## n8n Workflow Roadmap

See `N8N_WORKFLOW_ROADMAP.md` in the project root for the full build plan. Summary below.

### Near-Term Workflows (Build Now, No BAA Required)

These four workflows operate in Lane 1 (non-PHI). They can be built and tested immediately with fabricated data and can go live with real users as long as no PHI enters the email body or Google Sheet.

| Priority | Workflow | n8n Trigger | New Sheet Tab |
|---|---|---|---|
| 1 | Workflow 10: Appointment Follow-Up Automation | Schedule, daily 4pm | `Session Follow-Ups` |
| 2 | Workflow 12: Urgent Triage and Escalation | Existing webhook (`submissionType: support`) | Add `Triage Level` + `Resolved` columns to `Support Requests` |
| 3 | Workflow 5: Supplement Protocol Builder | On Form Submission (internal educator form) | `Protocol Requests` |
| 4 | Workflow 8: Virtual Telehealth Intake (Pre-Session Brief) | Schedule, hourly check | `Session Intakes` |

### Phase 3 Workflows (After Google Workspace BAA Is Active)

| Workflow | PHI Risk | Lane |
|---|---|---|
| Workflow 4: Lab Interpretation Agent | HIGH | Google Workspace clinical lane only |
| Workflow 6: Root Cause Analysis Agent | HIGH | Google Workspace clinical lane only |

### Development Rule

> Use fabricated test data only until the Google Workspace BAA is signed and active in the Admin Console. The BAA requirement activates the moment real client PHI enters any workflow. See `N8N_WORKFLOW_ROADMAP.md` for test data sets for each workflow.

---

## Claude Behavior Rules

These rules govern how Claude Code should behave when working on this project. They apply to every task, every session.

### Before Every Task
1. Read `CLAUDE.md` before taking any action.
2. Look at existing files before creating new ones. Understand what exists first.
3. If anything is unclear, ask before starting. Do not guess.

### While Building
4. Do exactly what is asked. Nothing more, nothing less.
5. Make one change at a time. Do not touch code that is not related to the current task.
6. If a structural or architectural change is needed, explain why before making it.
7. Keep Vercel API routes thin: call a service or lib function, do not put business logic in the route handler.

### Before Responding "Done"
8. Run `npm run build` locally. Fix any TypeScript or build errors before responding.
9. Test the feature end to end in the browser. Do not say "done" if it is untested.
10. Confirm existing features were not broken by the change.

### How to Format Responses
For every task response, include:
- **What I just did:** plain English, no jargon
- **What you need to do:** step-by-step, assume no coding background
- **Why:** one sentence explaining what it does or why it matters
- **Next step:** one clear action
- **Errors:** if something went wrong, explain it simply and say exactly how to fix it

When a task involves Supabase, Vercel, n8n, or any external tool: walk through exactly where to find what is needed. Describe what each setting does in one plain sentence. If there is SQL to run, explain what it does before showing it.
