# Health Audit Log

Run `./scripts/health-audit.sh` **every 3 days** and add a line below.

The script checks the specific failure classes that have actually broken this app.
Nothing generic. Every check exists because something shipped broken once.

---

## Schedule

| Last run | Next due |
|---|---|
| **2026-08-13** | **2026-08-16** |

Update both dates every time it runs.

---

## What it checks, and why each one is there

| # | Check | Why |
|---|---|---|
| 1 | No `getUser()` on load paths | It calls the auth server and can hang. On 2026-08-13 it left the app on the loading screen for over ten minutes on a phone. `getSession()` reads locally and cannot hang |
| 2 | App bootstrap has `catch`, `finally`, and a failsafe timeout | Same incident. `setLoading(false)` sat after an unguarded `await`, so a failed request stranded the whole app |
| 3 | No em or en dashes in `src` | Banned in this codebase. 197 had accumulated across 48 files by 2026-08-13 |
| 4 | Every API route verifies its caller | The July 2026 audit found four endpoints deployed with no auth at all. Anyone with the URL could drain the OpenAI budget |
| 5 | No secrets staged for commit | |
| 6 | No JS chunk over 500 KB | Rule D in CLAUDE.md |
| 7 | The build passes | |

---

## Runs

### 2026-08-13, second run, before the workout tracker push

Ran on her instruction to check the system had not broken during the workout
tracker rework. All seven checks PASS. Bundle still over 500 KB, which is the
known pre-existing flag, now 845 KB after this feature.

**A real regression the audit script does not catch, found by reading callers**

Migration 044 removed the one-workout-session-per-day database constraint.
`SnapshotPage` counted rows in `workout_sessions` for the month and displayed the
total on a card titled **Movement**, captioned "Workouts this month". Two
consequences:

- a day with both a workout and a walk would count twice once anything creates a
  second session
- a person who walks daily and logs it under the new Movement tab saw that card
  sitting at zero, because the Snapshot did not know `activity_sessions` existed

Fixed by counting **distinct dates across both tables**, and relabelling the card
to "Days you moved this month" with "days" and "Last moved", so the words match
the number underneath them (Rule C). Verified in the browser: a workout and a
walk on the same date now show as 1 day, not 2.

**Lesson for future migrations:** dropping a constraint is never local to the
table. Grep every caller of a table before removing a uniqueness rule, because
some other page is probably relying on that rule to mean something.

**Left alone deliberately**

- The Movement card's goal is still 12 a month. Now that walks count toward it,
  that target is probably too low, but a displayed goal is Dr. Hunter's call, not
  a number to change quietly.
- The Late Slip modal fires as "Evening Check-In" at 3:13 PM and blocks the page
  until dismissed. Rule B violation, pre-existing, reported to her, not yet fixed.

### 2026-08-13, first run

Found on the day of the app-wide hang.

**Fixed the same day**

- App bootstrap had no `catch` and no `finally`, so a failed session or profile
  fetch stranded the loading screen permanently. Added both plus an 8 second
  failsafe. Verified by building against an unreachable Supabase host: the app
  renders the login page instead of hanging
- `fetchProfile` could throw into that chain. Now resolves either way
- 26 `getUser()` calls across 19 files swapped to `getSession()`, including
  ClientDashboard, the first page every client sees
- 197 em and en dashes removed across 48 files

**Open, not yet fixed**

- **`api/usda-lookup.ts` has no auth and no rate limiting.** It spends
  `USDA_API_KEY`. Known since the July audit. Needs a decision from Dr. Hunter
  first, because gating it would break food lookup for signed-out visitors if it
  is used on a public tool
- **33 pages lack `try/finally` around their load functions.** An early return
  such as `if (!user) return` can strand a loading flag. Lower severity than the
  bootstrap, because the sidebar still works and the user can navigate away.
  Full list obtainable by rerunning the scan in this file's history
- **Main JS chunk is over 500 KB.** Pre-existing, flagged at every audit
- **2.9 MB of JS is still precached** by the service worker. Deferred
  deliberately until no cohort is running, because moving route chunks to
  runtime caching risks a stale client requesting a chunk hash that no longer
  resolves

---

## The rule this came from

Dr. Hunter, 2026-08-13:

> always do these checks every three days, make note of the date done and then do
> again in 3 days, ask if not sure, so we try to catch all the broken and bugs as
> they come as much as we always verify before any push

**Ask rather than guess.** If a check flags something and the right fix is not
obvious, or fixing it would change behaviour someone depends on, raise it rather
than deciding alone. `usda-lookup` is the current example.

**Verify before every push.** The audit is not a substitute for checking the
specific thing being shipped actually works in a browser.
