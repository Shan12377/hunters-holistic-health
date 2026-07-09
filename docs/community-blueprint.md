# The Community Blueprint
## Hunter's Holistic Health: the standalone community system
### Prepared July 2026. Built from a full code audit of the live community features plus current research on Skool and community retention.

This document is two things at once: the upgrade plan for YOUR community, and the reusable system you can later implement for other educators. Part 10 abstracts it into the blueprint.

---

## Part 0: The Positioning (why standalone is the moat)

Skool, Circle, and Mighty Networks rent you an audience container. You own the container. That means:

- You keep 100% of pricing power (Skool takes $99/mo plus transaction fees on top).
- Your community data, streaks, and health tracking live in ONE product. Skool cannot do a BP tracker, a Weekly Report Card, or an AI Meal Guard next to the feed. You already do. That integration IS the product nobody else has.
- The blueprint becomes sellable. Once your community retains at Skool-or-better rates on your own platform, "I will build you this" is a service line for other educators.

The bar to beat: communities using Skool-style gamification retain at roughly 70 to 80% versus 50 to 60% without it, and gamified communities retain about 24% more members per quarter. Your target: match that first, then beat it with the health-tracking integration they cannot copy.

---

## Part 1: Fix First (from the code audit, in severity order)

The audit found real problems. Nothing else in this document matters until these are fixed, because a community that crashes or can be gamed bleeds trust silently.

### P0: Ship-stoppers

| # | Problem | Where | Fix |
|---|---|---|---|
| 1 | Five database objects referenced in code do not exist in migrations: `poll_options`, `poll_votes`, `feed_comments`, `feed_reports`, and the `privacy_settings` column on profiles. Polls, comments, and reporting will crash in production. | FeedPage.tsx | Write migration 018 creating all five, with RLS. Test each feature end to end after. |
| 2 | Points are awarded from client code with no server validation. Anyone with the browser console can fabricate points and climb the leaderboard. A leaderboard that can be faked is worse than no leaderboard. | src/lib/points.ts, called client-side | Move `awardPoints` into a server-side API route or Postgres function (SECURITY DEFINER) that derives points from verified events, never from client-passed values. The `points_log` UNIQUE constraint helps; keep it. |
| 3 | Streaks and challenge dates use client `new Date()`. A member in one timezone and a member in another see different "today," and challenge logs can be backdated by changing system time. Streaks are the emotional core of retention; a wrongly broken streak is a cancellation event. | src/lib/adherence.ts, ChallengesPage.tsx | Compute day boundaries server-side using the member's stored timezone. Store a `tz` field on profiles, default from browser at signup. |
| 4 | Vote handling deletes then inserts; if the insert fails the vote is lost. | FeedPage.tsx poll logic | Single upsert with unique constraint on (user_id, poll_id). |

### P1: Trust and integrity

| # | Problem | Fix |
|---|---|---|
| 5 | Likes are an integer on the post with optimistic update and no rollback, and no per-user tracking, so one person can like repeatedly. | Add `feed_likes (post_id, user_id)` with unique constraint; likes count becomes a query or trigger-maintained counter. |
| 6 | Silent failures: fetch errors show empty states instead of error states. Members read an empty feed as "dead community." | Every async call gets loading, error, and empty states, all three, everywhere. Error state includes a retry button. |
| 7 | No realtime: the feed only updates on refresh. A community that only moves when you reload feels like a bulletin board. | Supabase Realtime subscription on feed_posts and feed_comments for the active room. This is one of Supabase's cheapest wins. |

### P2: Performance

| # | Problem | Fix |
|---|---|---|
| 8 | Feed loads 100 posts then filters by room in JavaScript. | Push room filter into the query; add cursor pagination (created_at + id keyset, not offset). |
| 9 | Challenge leaderboards run one query per challenge. | One batched query with `.in()`, group in JS. |
| 10 | Leaderboard refetches fully on every visit. | Cache 60 seconds client-side, or a materialized view refreshed every 5 minutes. |
| 11 | `supabase.auth.getUser()` called instead of the existing auth store. | Use the store. |

### The bug-proofing standard going forward (apply to every community feature, forever)

1. Server-authoritative everything that touches points, streaks, or money. The client requests; the server decides.
2. Idempotent writes: unique constraints so double-clicks and retries cannot double-award.
3. RLS on every table, no exceptions, tested with a second test account.
4. Timezone-aware day math, server-side only.
5. Loading, error, and empty states on every view. The empty state always says what to do next ("Be the first to post a win today").
6. Keyset pagination on anything that grows.
7. Every new table ships in a numbered migration, never created ad hoc. Rule: if the code references a table, the migration exists in the same PR.
8. One realtime channel per screen, unsubscribed on unmount.

---

## Part 2: What Sam Ovens Would Do To This Community

His public philosophy is consistent: one mind, conceptual integrity, brutal simplicity, fewer things done extremely well, and feature bloat treated as a bigger risk than missing capability. Skool is community + classroom + calendar + gamification and deliberately nothing else. Applied to yours:

### 2.1 He would change how points are earned (the single biggest strategic upgrade)

Your system: you get points for YOUR OWN actions (check-in = 5, win = 4, post = 2). This rewards volume. It can be farmed by posting junk, and it does not reward being valuable to others.

Skool's system: 1 like from someone else = 1 point for the author. Points are a measure of value delivered to the community, judged by the community. This is why their leaderboard means something.

The blueprint hybrid (better than both for a health community):
- Habit points (small, capped): daily check-in, challenge log. Cap at one per day per type so they cannot be farmed. These protect the accountability core; Skool has nothing like it and it is your edge.
- Community points (uncapped, peer-driven): likes received on posts and comments, exactly Skool's mechanic. This is what ranks the leaderboard.
- Two visible numbers if needed, but ONE leaderboard, ranked by community points. Habit consistency already has its own scoreboard: the Weekly Report Card.

### 2.2 He would make the level curve exponential

Yours: 10 levels, 0 to 5,500, roughly linear. Skool: Level 2 at 5 points, Level 3 at 20, Level 4 at 65, Level 5 at 155, Level 6 at 515, then steeper. The magic: Level 2 happens in the first day or two (instant early win), Level 7+ takes months (long-term status). Rebuild your curve the same way: first level-up within 48 hours of joining, top level a 12-month achievement.

### 2.3 He would gate content behind levels

Skool's sharpest retention trick: unlock courses and perks at levels. Members stay active to unlock. Yours maps naturally: ROOTS™ advanced modules, a bonus masterclass replay, the ability to create a challenge, a monthly "Level 5+ only" Q&A with you. Two or three gates, no more. Gating must never touch safety-relevant education, only bonus depth.

### 2.4 He would cut, not add

Your feed has 6 rooms plus polls plus post types. Skool launched with one feed and categories. Fewer surfaces, more density: a feed with 6 rooms and 20 members feels dead; the same posts in 2 rooms feel alive. Recommendation: collapse to 3 rooms until daily posts exceed 20 (General, Wins, Questions), then re-expand. Density before variety, always.

### 2.5 He would add the three leaderboard windows

7-day, 30-day, all-time. You only have 30-day. The 7-day board is the one that creates comeback behavior, because anyone can win a week. Small change, big return.

### 2.6 He would ship the digest email

Skool's retention workhorse is the notification digest: "You have 3 new likes, Sarah replied to you, this week's top post." Pull-back email, daily or weekly per member preference. You already have n8n and email infrastructure; this is a workflow, not a product build. Compliance footer per your email rules on every send.

### 2.7 He would put the calendar next to the feed

Events (your monthly live sessions, challenge start dates) shown in the member's local timezone with reminder emails. You have an `events` table already; it needs a calendar view and a reminder workflow.

---

## Part 3: The Retention System (the habit loop)

Retention is not a feature, it is a loop. Design the member's day, week, and month explicitly:

**Daily (2 to 5 minutes):** Check in on the Daily Command Center → earn habit points → streak advances → see one feed highlight ("today's top win") → maybe like or comment (generates community points for someone else).
The trigger: one push notification or email max per day, member-controlled. The late slip already de-shames a miss; surface it proactively when a streak is about to break: "Your 12-day streak ends at midnight. 30 seconds to keep it."

**Weekly:** Report Card lands → digest email with their rank movement ("You moved from #14 to #9") → weekly challenge check-in.

**Monthly:** Live group session (already in The Program tier) → new challenge launches → "member of the month" recognition post pinned by you.

**The first 10 minutes (onboarding, currently missing entirely):** New members who post in week one retain at multiples of those who lurk. Build a 3-step forced-choice onboarding: 1) pick your focus (BP, blood sugar, energy), 2) do your first check-in (first points, instantly), 3) introduce yourself in the feed from a template ("Name, what brought you here, one win you want in 90 days"). You reply to every intro post personally for the first 100 members. Nothing scales trust like the founder replying.

**The save loop (churn interception):** If a member logs nothing for 7 days, automated personal-tone email from you, not a marketing blast: "No lecture. One question: what got in the way this week?" 14 days silent: offer a streak repair or a fresh-start challenge invite. This alone is worth points of monthly churn.

---

## Part 4: Intuitive UX Standard (the "no manual needed" test)

1. One primary action per screen. Feed screen: post. Challenge screen: check in.
2. Every number explains itself on tap: tap your points → see the last 5 events that earned them. Tap your level → see what unlocks next. Mystery numbers feel like spam; explained numbers feel like a game.
3. Progress is always visible: level progress bar under the avatar, streak flame with count, "3 more points to Level 4."
4. Empty states coach: never a blank screen, always "here is what to do."
5. Names and faces everywhere: avatar, first name, level badge on every post and comment. Community is people recognizing people.
6. Speed is a feature: sub-second room switching (fix #8 delivers this). Skool's felt speed is a core reason it reads as premium.
7. Mobile first: your members check in from phones. Every community screen QA'd at 375px width before ship.

---

## Part 5: Value Adds Nobody Else Can Copy (your unfair advantages)

1. Tracking-fed social proof: "Maria just completed her 30th consecutive check-in" auto-posts (with per-member privacy opt-in via the privacy_settings column, once it exists). Skool communities have to fake this energy manually; yours generates it from real behavior.
2. The Report Card flex: one-tap "share my week" that posts the grade (not the health numbers) to the Wins room. Grades are motivation-safe and privacy-safe.
3. Educator presence as a product feature: your weekly "office hours thread" pinned every Monday. Members ask, you answer as educator. This is the retention anchor no platform feature can replace.
4. Challenge engine tied to the curriculum: each ROOTS phase gets a companion challenge. Education creates the challenge, the challenge creates the habit, the habit creates the result story, the story becomes the testimonial for the landing page. That flywheel is the business.

---

## Part 6: Safety and Compliance Layer (the part most communities skip and regret)

A health community has a risk no business community has: members giving each other medical advice.

1. Community guidelines page, agreed to on first post: share experiences, never prescriptions; no dosage advice member-to-member; no telling anyone to stop a medication (auto-flag phrases like "stop taking").
2. The report feature must actually work (fix #1) and route to you within 24 hours.
3. Standing disclaimer in the feed header, small but visible: "Member posts are personal experiences, not medical advice."
4. Educator moderation rule: dangerous advice gets a public, kind correction from you (teaches everyone), not a silent delete.
5. Keep it non-PHI: coach members away from posting lab values or medication lists in the feed. The tracking tools are the private place for numbers; the feed is for wins, questions, and habits.
6. Testimonial harvesting from the feed requires written permission per post, with the standard disclaimer, before any marketing use.

---

## Part 7: The Metrics That Matter (build this small dashboard for yourself)

Weekly, five numbers only:
1. Contribution ratio: % of active members who posted, commented, or liked in the last 7 days (healthy: 30%+, world-class: 50%).
2. DAU/MAU stickiness (healthy for paid: 25%+).
3. Week-1 activation: % of new members who both checked in and posted within 7 days of joining. This number predicts everything.
4. Streak distribution: how many members hold a 7+ day streak.
5. Monthly member churn (target under 5% once P0 fixes and the habit loop ship).

Instrument these from tables you already have (points_log, feed_posts, daily_logs). One SQL view each, one simple educator-dashboard panel.

---

## Part 8: Build Order

**Phase 1, Foundation (do first): fixes 1 to 7 from Part 1.** Missing tables, server-side points, timezone streaks, per-user likes, error states, realtime. Nothing visible changes for members except everything suddenly works and updates live.

**Phase 2, The Skool Layer:** hybrid points model, exponential level curve, 7-day and all-time leaderboards, 2 to 3 level gates, room consolidation, digest email via n8n, calendar view with reminders.

**Phase 3, The Habit Loop:** 3-step onboarding, streak-save notification, churn-save email sequence, weekly rank-movement digest.

**Phase 4, The Unfair Advantages:** tracking-fed auto-posts with privacy opt-ins, Report Card sharing, curriculum-tied challenge engine, metrics dashboard.

Each phase is shippable alone and compounds on the previous one. Per your operating rules: scope confirmation before code, one change at a time, build must pass before "done."

---

## Part 9: What You Did Not Ask About But Should Decide

1. Free community tier or not: Skool's 2026 meta is free community as top-of-funnel feeding the paid tier. Yours could be a free "lobby" room with the free tools and locked doors visible. Decide deliberately; it changes the funnel math from the landing page brief.
2. Member profiles: minimal profile (name, focus area, level, streak, join date) is Phase 2-worthy; it makes the leaderboard names human. Full profiles with followers are bloat; skip per the Ovens rule.
3. DMs: skip for now. They fragment community energy at small scale and create an unmoderated surface in a health context. Revisit at 500+ members.
4. Moderator succession: at some member count you will need a second moderator. Write the guidelines (Part 6) as if you will hand them to that person, because you will.

---

## Part 10: The Reusable Blueprint (for implementing for other educators later)

Strip the specifics and this is the product you can sell to other educators. The system in one page:

1. **Own the platform.** Feed + classroom + tracking + gamification in one codebase (Vite/React + Supabase + Stripe). The tracker-community integration is the differentiator against Skool clones.
2. **Two-currency gamification.** Capped habit points for personal consistency; uncapped peer-awarded points for community value; one leaderboard (peer points) with 7/30/all-time windows; exponential levels with first level-up inside 48 hours; 2 or 3 level-gated bonuses.
3. **The habit loop.** Daily micro-action with streak, weekly scoreboard artifact, monthly live event and challenge. One notification a day maximum.
4. **Activation ritual.** 3-step onboarding ending in a public intro post, founder replies to every intro for the first 100 members.
5. **Save loop.** 7-day and 14-day silence triggers with personal-tone emails and streak repair.
6. **The density rule.** Rooms = ceil(daily posts / 10). Never more. Consolidate before expanding.
7. **Engineering floor.** Server-authoritative points, idempotent writes, RLS everywhere, server-side day math, realtime feed, keyset pagination, loading/error/empty on every view.
8. **Safety layer.** Guidelines with hard lines, working report flow, standing disclaimer, moderator playbook (adapt hard lines per the niche's regulatory exposure).
9. **Five-number dashboard.** Contribution ratio, DAU/MAU, week-1 activation, streak distribution, churn.
10. **The flywheel.** Curriculum → challenge → habit → result story → (permissioned) testimonial → landing page → new member. Every feature must serve a spoke of this wheel or it does not get built.

That is the whole system. When you implement it for someone else, Parts 1, 4, 6, and 7 transfer as-is; Parts 2, 3, and 5 get re-skinned to their niche.

---

## Sources

[Skool gamification help docs](https://help.skool.com/article/31-how-do-points-and-levels-work), [Skool leaderboards](https://help.skool.com/category/26-gamification-levels-and-points), [Skool gamification launch post](https://www.skool.com/community/introducing-gamification-points-levels-leaderboards-and-gems), [StickyHive Skool gamification guide](https://stickyhive.ai/skool/gamification-guide/), [Group.app Skool review 2026](https://www.group.app/blog/skool-review/), [Skool review 2026 features and pricing](https://skoolcenter.com/), [Skool free vs paid 2026](https://communipass.com/blog/skool-free-vs-paid-community-2026/), [How Sam Ovens built Skool](https://jamesbickerton.substack.com/p/how-sam-ovens-built-17-million-users), [Sam Ovens founder story](https://skoolprep.com/sam-ovens-skool-founder), [Skool calendar docs](https://help.skool.com/category/25-calendars-and-events), [Skool updates 2026](https://tools4skool.com/skool/skool-updates), [Whop: what is Skool](https://whop.com/blog/what-is-skool/)
