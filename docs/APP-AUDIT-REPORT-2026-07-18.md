# Hunter's Holistic Health: Full App Audit, User Experience Review, and Optimization Plan

**Date:** July 18, 2026
**Scope:** Every feature in code and live on production, both views. Guards, compliance, usability, anticipated user complaints, and expert blind spots.
**How to use this report:** Read the scorecard (1 minute). Then read Section 2, the fix list, in order. Everything after that is supporting detail you can skim when you want the "why."

---

## 1. The Scorecard (Where You Stand Today)

Predicted app-store-style rating per area if 100 clients reviewed it today, plus what gets each area to 5 stars.

| Area | Today | Why it loses stars | What gets it to 5 |
|---|---|---|---|
| Design and polish | 4.5 | Beautiful, consistent, on-brand | Skeleton loaders instead of blank cards |
| Trackers (BP, sugar, weight, logs) | 4.5 | Solid, color-coded, correct AHA zones | Fix the two goal/scale mismatches |
| Educator tools | 4.5 | Roster, CRM, KPIs, outcomes report all work | Fix the /coach URL bounce |
| Compliance and trust | 5 | Disclaimers, gates, warnings all present | Keep doing what you're doing |
| Speed | 3 | One 2.3 MB file, visible slow first paint | Code splitting (one-file change) |
| First-time experience | 2.5 | 38 menu items, no guided start, modal ambush | 7-day onboarding path, tame the Late Slip |
| Navigation and findability | 2.5 | 8 nutrition pages, 3 protocol pages, look-alike icons | Consolidate and rename (Section 5) |
| Community | 3 | Well built, but empty rooms feel broken | Seed activity or hide until cohort is live |
| Reliability guards | 3.5 | Great API try/catch, but no error boundary, no crash visibility | Error boundary + error reporting |
| Security | 3.5 | No secret leaks, RLS-first design | Lock the 4 open AI endpoints (Section 7, urgent) |

**The one-sentence summary:** the platform's ceiling is 5 stars; the gap is not missing features, it is first-week experience, speed, and four unlocked API doors.

---

## 2. The Fix List (In Order, Nothing Else Mixed In)

Do these in order. 1 to 5 are small diffs. Nothing gets built without your go-ahead.

1. **URGENT: Add auth to 4 open AI endpoints** (meal-guard, plate-analysis, recipe-builder, weekly-pulse). Anyone who discovers the URLs can spend your OpenAI budget with a script. supplement-research and award-points already do this correctly; copy their Bearer-token pattern. Also add the beehiiv-subscribe rate-limit pattern to them.
2. **Fix the /coach URL bounce.** Race condition: the role check runs before your profile loads, so a page refresh anywhere in /coach dumps you to the client dashboard. Keep `loading` true until the profile fetch finishes. One file.
3. **Tame the Late Slip modal.** It ambushed you at login, reappears every visit after 9 PM, and fires for educators. Persist the skip for the day, exempt the educator role. One file.
4. **Add an error boundary.** Today any single render error white-screens the whole app with no way back. One small component turns that into "Something went wrong, tap to reload."
5. **Code-split the routes.** All 102 routes ship in one 2.3 MB file; a blog visitor downloads your CRM. `React.lazy` per section cuts first load by more than half. One file.
6. **Ship the 7-day onboarding path** (Section 4). This is the star-rating move.
7. **Consolidate navigation** (Section 5). This is the other star-rating move.
8. Small consistency fixes: energy shown as "/10" but recorded 1 to 5; steps card says goal 8,000 but scoring uses 5,000; silent profile-fetch failures.

---

## 3. Anticipated User Complaints (And the Pre-Written Answer to Each)

These are the reviews you would get, predicted from what the audit found. Each one is preventable.

**"There's too much stuff, I don't know where to start."** (most likely 1-star driver)
A brand-new client sees 38 menu items across 7 groups on day one. Fix: onboarding path (Section 4) plus progressive disclosure: show Track, Learn, and My Protocol on day one, unlock Community and the rest as they log their first days. The nav code already supports collapsible groups; this is configuration, not architecture.

**"It's slow to load."**
2.3 MB bundle on first visit, sections pop in one by one. Fix: items 4 and 5 above, plus skeleton loaders. After code splitting, returning-visit loads will feel instant because the PWA caches chunks.

**"It guilted me the second I opened it."**
The Late Slip modal covers the dashboard before the user sees anything, with "Late Slip Required" as the headline. The supportive body copy is genuinely good; the timing and the word "Required" are not. Fix: fire it only after the user has been on the dashboard once that evening, rename to "Quick reflection," keep Skip persistent.

**"I marked stuff done and my score still says 0%."**
The progress ring counts 7 specific items (fasting, 2 meals, 2 supplement slots, 5,000 steps, 64 oz water). A client who logs 3 things sees a discouraging number with no explanation of what counts. Fix: make the ring clickable to show the 7 items with checkmarks, so 43% reads as "3 of 7 done" instead of failure.

**"The community is dead."**
Feed, cohort, leaderboard, and events all render empty states right now (no cohorts created, no sessions scheduled). Empty social spaces read as "abandoned app." Fix: hide Community group behind a "joins when your cohort starts" state, or seed it: one weekly educator post plus the challenge you are building gives the feed a heartbeat.

**"Which meal page am I supposed to use?"**
Nourish Log, Meal Plan, Daily Plate, Build Your Plate, Recipes, Smart Recipe Builder, Trending Meals, Food Search: eight nutrition destinations. See Section 5.

**"I never got a reminder."**
Habit apps live and die on reminders. The VAPID key and cron-reminders function already exist; wire the morning push and this complaint never appears.

**"I couldn't find how to cancel / change my plan."**
Settings covers Doxy.me, Fullscript, and account deletion. Make sure a "Manage my subscription" link to the Stripe customer portal is visible in Settings; a hidden cancel path is the #1 driver of chargebacks and angry reviews.

**"Does the doctor even see what I log?"**
Clients who log daily want proof a human notices. The educator roster already surfaces everything; close the loop with the one-click nudge (Section 6) so clients hear back within their first week.

---

## 4. First-Week Experience: The Single Biggest Rating Lever

Your own dashboards make the case: 15 participants, 0 active streaks, 4% average consistency, 0 of 15 on track, while the KPI page shows 13 paying members and $3,541 MRR. People bought; they did not build the habit.

Proposed "Your First 7 Days" (needs your sign-off before any build):

- Day 1: welcome screen after first login, pick primary goal, log one thing (water counts). Nav shows only Track + My Protocol.
- Day 2: first BP or blood sugar reading, unlock Weekly Grade.
- Day 3: meet the ROOTS Framework (one pillar, not all five), unlock Learn.
- Day 4: first Nourish Log entry with the AI response as the payoff moment.
- Day 5: set one habit in Daily Habits, unlock Goals and Habits.
- Day 6: intro to your cohort or feed, unlock Community.
- Day 7: first Weekly Pulse arrives, celebrate with points; book/confirm first session.

Each day is one push notification plus one checklist item on the dashboard. Storage is one small table or a JSONB column on profiles. This directly converts the 0-streak roster into an active one, and active clients renew.

---

## 5. Navigation: Consolidation Map

Current client nav: 38 items. Proposed: 24, with zero features deleted, only merged as tabs.

| Keep as top item | Absorb as tabs inside it |
|---|---|
| Nourish Log | Food Search, Trending Meals |
| Meal Plan | Daily Plate, Build Your Plate |
| Recipes | Smart Recipe Builder |
| My Protocol | ROOTS Framework, Protocol Matrix |
| Movement | Movement Log, Workout Tracker |
| Daily Habits | Morning Protocol |

Also worth doing:
- **Icons:** three different nav items currently use the same ◈ symbol, and most icons are abstract shapes that carry no meaning. Swap to the lucide icon set already installed (Heart, Utensils, BookOpen, Users, Target, Calendar) so items are recognizable at a glance.
- **Naming:** the app calls it "Nourish Log," the code and quick action call it Meal Guard/AI. Pick one name everywhere. Same for "My Protocol" vs "Protocol" vs "Meal Plan" (which is actually the protocol plan page).
- **A "Today" home:** the dashboard already is this; consider renaming "Dashboard" to "Today" to anchor the daily loop.

---

## 6. Educator View: Findings and Wins

Verified live: roster with per-client completion, streaks, projected grades, and BP flags; search; cohort management; de-identified Program Outcomes report download; FTC Compliance Guard; CRM pipeline, tasks, calendar; Comms Studio; Applications; Brain Dump; KPI dashboard pulling live Supabase data.

Wins available:
1. **One-click nudge:** the roster already computes "needs attention" (15 right now). A button that opens Participant Messages pre-filled with a warm check-in turns that flag into a 5-second action.
2. **Fix the /coach bounce** (Fix List item 2) so a refresh never dumps you to the client view.
3. **At-risk digest:** you already have cron-reminders and the n8n briefing; a Monday summary of who slipped last week closes the loop without opening the app.
4. KPI page: applications this month is 0 and conversion is 0%; once applications flow, consider a funnel line (visits to applications to members) so you see where drop-off happens.

---

## 7. What You Did Not Ask About (Expert Blind-Spot Check)

Things not in your request that the audit surfaced. Ranked by risk.

**Security and cost**
1. **Open AI endpoints (urgent, Fix List item 1).** meal-guard, plate-analysis, recipe-builder, and weekly-pulse accept requests with no login check. Risk: a scraper or prankster runs your OpenAI bill up overnight. Your other endpoints already do this right, so it is a copy-paste fix.
2. **No rate limiting on the AI endpoints.** beehiiv-subscribe already has a clean 5-per-minute IP limiter; reuse it.
3. **meal-guard initializes the OpenAI client at module level**, which your own operating manual forbids (errors crash silently at import instead of surfacing in logs). Two-line move into the handler.

**Operational visibility (you are currently flying blind in three places)**
4. **No frontend crash reporting.** When a client's app breaks, you find out from an angry email, not a log. A tiny error-report endpoint (or a free Sentry tier) plus the new error boundary fixes this.
5. **No uptime monitoring.** If Vercel, Supabase, or the n8n webhook goes down at 6 AM, nothing tells you. A free ping monitor (UptimeRobot or similar) on the homepage, one API route, and the n8n webhook takes 10 minutes.
6. **No product analytics.** You cannot see which of the 38 pages clients actually open, which makes every navigation decision a guess. Even a single Supabase `page_views` table (page, user_id, timestamp) would answer "what do people use" within a week. This also feeds the consolidation decisions in Section 5 with real data.

**Data safety and trust**
7. **Client data export.** Clients can delete their account (good) but cannot download their own logs. A "Download my data" CSV button in Settings is cheap, builds trust, and is the direction privacy law is moving.
8. **Supabase backups.** Confirm point-in-time recovery is enabled on your Supabase plan. One accidental bad migration without it is unrecoverable. Worth 5 minutes today.
9. **RLS spot-check.** Design is RLS-first (good). Worth one 30-minute session using the test client account to confirm a client can never read another client's rows on the newer tables (challenge progress, habits, weight). New tables are where RLS gaps sneak in.

**Revenue protection**
10. **Failed-payment (dunning) flow.** stripe-webhook handles checkout and cancellation, but when a card fails mid-subscription, nothing emails the member. Stripe Smart Retries plus its built-in dunning emails can be turned on in the dashboard with no code. This is silent-churn insurance.
11. **Cancellation exit survey.** One question ("what made you cancel?") on the way out is the cheapest product research you will ever get.

**Accessibility (rating and legal both)**
12. Only 36 aria attributes across the whole app, abstract-symbol nav icons with no labels, and some low-contrast gold-on-dark-green secondary text. A pass adding aria-labels to icon-only buttons and checking contrast on the muted text gets you most of the way. Health apps skew toward older users; accessibility is a ratings issue before it is a legal one.

**Mobile**
13. PWA install banner and auto-update are done (nice). Two follow-ups: verify the full client flow at 375 px width (the dense educator roster especially), and add a friendly offline screen so the app opened in airplane mode does not look broken. I did not live-test mobile widths in this audit; that is the one open box.

**Content and SEO**
14. Blog, JSON-LD schema, and tools pages are already strong. One gap: the 404 route silently redirects to the homepage, which confuses users who mistyped a link and quietly hurts SEO. A tiny "page not found, here is the way home" page is better than a redirect.

---

## 8. Compliance Guards Audit (Verified Strong)

- DSHEA disclaimers present on all 15 supplement-touching pages checked.
- Hormone Challenge has the required acknowledgment gate before the tool loads.
- Drug interaction warnings present: Berberine/metformin, levothyroxine spacing, Ashwagandha.
- Educational framing and "Educator" language consistent on client dashboard, educator dashboard, BP tracker, Meal Guard.
- All 12 serverless functions wrap logic in try/catch.
- No service-role key or secrets in frontend code; zero console.log in src; the only raw-HTML injections are static JSON-LD blocks (safe).
- check-env script compares key names only and never prints values.
- Roster shows Age, not DOB. Outcomes report is de-identified and labeled as such.

---

## 9. What I Did and Did Not Do

- Reviewed all 102 routes, both dashboards, layout, auth store, all 12 API functions, and guard coverage in code.
- Walked production live as the educator (your browser's saved login): login, client dashboard, educator dashboard, KPI dashboard.
- Did not change any code (operating manual Rules 2 and 3: scope first, then build).
- Did not read .env files or secrets. Did not log in as the test client (I do not type passwords); client view was verified through your account plus code review.

**Recommended next step:** say "start the fix list" and I will begin with item 1 (lock the AI endpoints) and work down through item 5, one small confirmed change at a time.

---

## 10. UI Intuitiveness Verdict (Live Walkthrough, July 18)

Question asked: is the interface super intuitive for users right now? Answer: **not yet. About 3 of 5 stars today, with a clear path to 4.5+.**

**What is already 5-star:** every screen taken alone. Nourish Log is the model page: clear title, one-line instruction, one input, one obvious gold button, privacy note exactly where the anxiety is, today's meals below. Dashboard, trackers, and the educator roster follow the same clean pattern. Nobody gets lost inside a page.

**What breaks the intuitive feel is what happens between pages (all verified live):**

1. **Blank dark screen for 3 to 6 seconds on every fresh page load.** Daily Log and Nourish Log both showed pure black before anything painted. First impression for a new user is "is it broken?" Cause: the 2.3 MB bundle. This is Fix List item 5.
2. **The app interrupts users at the worst moments.** At 9:50 PM the Late Slip modal blocked the Nourish Log page while on the way to log a meal: it stops the user from doing the exact thing it is scolding them about. It also fired within one second of login and re-fires on every page load after 9 PM. Fix List item 3.
3. **Too many doors, no signposts.** Meal Plan, Daily Plate, Nourish Log, and Recipes sit side by side with near-identical abstract icons (three nav items share the same ◈ symbol). No guided first step tells a new user which door to open. Fix: Sections 4 and 5.
4. **Numbers without explanations.** Progress ring says 0% with no way to see what counts; steps card says 8,000 while scoring uses 5,000; energy displays "/10" while the check-in collects 1 to 5. Users learn not to trust the numbers. Fix List item 8.

None of this is a redesign. Screens stay as they are; the app stops getting in its own way.

---

## 11. Handoff: How Any New Chat Picks This Up

**Status as of July 18, 2026: audit complete, zero code changes made. Nothing on the Fix List has been started.**

To resume in any new session, say:

> Read docs/APP-AUDIT-REPORT-2026-07-18.md and CLAUDE.md, then start the Fix List in Section 2, item 1, one confirmed change at a time.

Execution order and state:

| # | Item | Status | Files involved |
|---|---|---|---|
| 1 | Auth + rate limit on meal-guard, plate-analysis, recipe-builder, weekly-pulse | CODE DONE July 18. New shared guard in api/_guard.ts, token sent via new src/lib/authHeaders.ts in all 5 call sites. tsc passes. Before deploy: run npm run build locally, then test one AI feature logged in (should work) and one curl without a token (should get 401). | api/_guard.ts, 4 api files, 5 frontend files |
| 2 | ProtectedRoute profile race (/coach bounce) | CODE DONE July 18. App.tsx now awaits the profile fetch before loading flips false, in both the initial session load and auth state changes. fetchProfile logs failures instead of swallowing them. Verify after deploy: type huntersholistichealth.com/coach directly while logged in as educator; it should land on the Educator Dashboard, and a refresh on any /coach page should stay put. | src/App.tsx, src/store/authStore.ts |
| 3 | Late Slip: per-day dismissal, educator exempt, never on load | CODE DONE July 18. Modal exports lateSlipDismissKey and writes it on Skip and Submit. Both triggers (AppLayout yesterday-check and ClientDashboard 9 PM check) now skip educators, skip if dismissed today, skip daily-log and meal-guard pages, and wait 5 seconds so the page is usable first. Title softened to Evening Check-In. tsc passes. | LateSlipModal.tsx, AppLayout.tsx, ClientDashboard.tsx |
| 4 | ErrorBoundary at root and route outlet | CODE DONE July 18. New src/components/ui/ErrorBoundary.tsx wraps the route tree in App.tsx and the page outlet in AppLayout, so a page crash shows "Something went wrong, Reload" (with the sidebar still alive inside the app) instead of a white screen. Errors log to the console for diagnosis. | ErrorBoundary.tsx, App.tsx, AppLayout.tsx |
| 5 | Route code splitting with React.lazy | CODE DONE July 18. 94 routes now lazy via React.lazy, LandingPage and LoginPage kept eager, Routes wrapped in Suspense with the branded LoadingScreen so chunk loads never show a blank screen. tsc passes. Verify after deploy: dist/assets should contain many small chunks instead of one 2.3 MB file. | src/App.tsx |
| 6 | Consistency: energy scale, steps goal, progress ring breakdown | CODE DONE July 18. New src/lib/goals.ts holds STEPS_GOAL (8,000) and WATER_GOAL_OZ (64); dashboard scoring, dashboard display, Daily Log display, and weekly grading all import them (the old 5,000 scoring outlier is gone). Midday energy check-in now records on the same 1 to 10 scale as the Daily Log slider (2/4/6/8/10). The progress ring lists its 7 items with check marks so the percent is never a mystery. | goals.ts, ClientDashboard.tsx, DailyLogPage.tsx, grading.ts, Client.module.css |
| 7 | Nav consolidation, real lucide icons | CODE DONE July 18, approved by Dr. Hunter. Sidebar down from 32 to 27 items. Absorbed as tabs (all routes still work): Daily Plate into Meal Plan, AI Recipe Builder into Recipes, ROOTS Framework and Protocol Matrix into My Protocol, Workout Tracker into Movement, Morning Protocol into Daily Habits. A pill tab bar renders above each merged page (PAGE_TABS in AppLayout). Every abstract glyph replaced with a recognizable lucide icon, client and educator sections both. | AppLayout.tsx, AppLayout.module.css |
| 8 | First-week onboarding checklist | CODE DONE July 18, approved by Dr. Hunter. New OnboardingChecklist card at the top of the client dashboard: 7 small steps, each linking to its page. Daily Log and BP/blood sugar steps complete themselves from real data; the rest complete when tapped. Shows "N of 7", has a Hide this link, never renders for educators, disappears when all 7 are done. Progress is stored per device (localStorage); upgrade to a Supabase column if cross-device sync matters. Note: existing clients will also see it, which is intentional given 0 active streaks, and they can hide it. | OnboardingChecklist.tsx, ClientDashboard.tsx, Client.module.css |

Rules for whoever executes: follow CLAUDE.md (scope confirmation before code, one change at a time, npm run build must pass, no em dashes in copy). Items 1 to 6 are pre-approved small diffs once Dr. Hunter says start. Items 7 and 8 need her explicit design sign-off first.
