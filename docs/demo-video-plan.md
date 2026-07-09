# Hunter's Holistic Health - Demo Video Production Plan

## What This Produces

A 3-5 minute platform walkthrough video showing 10 real user personas interacting with the app.
Narrated in Dr. Hunter's voice via ElevenLabs. Recorded with Playwright. Stitched with FFmpeg.

Hand this file to Claude Code and say: "Build the demo video from the plan in docs/demo-video-plan.md"

---

## Prerequisites (check before running)

- [ ] Dev server starts: `npm run dev` at localhost:5173
- [ ] FFmpeg installed: `which ffmpeg` (already confirmed: /Users/higgi/.local/bin/ffmpeg v7.0)
- [ ] `.env.local` has `ELEVENLABS_API_KEY` and `ELEVENLABS_VOICE_ID` (confirmed present)
- [ ] Node.js available for the seed script
- [ ] Playwright browsers installed: `npx playwright install chromium`

---

## The 10 Personas

These are drawn from real r/bloodpressure and r/hypertension community archetypes (research July 7, 2026).

| # | Name | Email (demo) | Plan | Age | Story |
|---|------|-------------|------|-----|-------|
| 1 | Keisha Washington | keisha.demo@hhh-demo.com | foundation | 44 | "Healthy" woman - confused why BP is elevated, doctor just said take pills |
| 2 | Marcus James | marcus.demo@hhh-demo.com | foundation | 38 | Tracking BP patterns, wants to understand lifestyle triggers |
| 3 | Sandra Mitchell | sandra.demo@hhh-demo.com | program | 52 | Metabolic syndrome + prediabetes, overwhelmed, needs the full picture |
| 4 | Tanya Brooks | tanya.demo@hhh-demo.com | foundation | 36 | Eats clean, exercises, still gets high readings, wants root cause |
| 5 | David Thompson | david.demo@hhh-demo.com | program | 48 | On meds, researching whether lifestyle can change that |
| 6 | Michelle Carter | michelle.demo@hhh-demo.com | foundation | 41 | Community anchor, posts wins daily, motivates others |
| 7 | James Robinson | james.demo@hhh-demo.com | vip | 55 | Stage 2, multiple meds, exploring functional alternatives |
| 8 | Alicia Rivera | alicia.demo@hhh-demo.com | free | 29 | Newly diagnosed, scared and confused, just found the platform |
| 9 | Patricia Williams | patricia.demo@hhh-demo.com | vip | 63 | Managing for years, now mentors newer members |
| 10 | Dr. S. Hunter | info@huntersholistichealth.com | educator | — | Educator account (already exists - do NOT recreate) |

All demo accounts use password: `DemoPass2026!`

---

## Phase 1: Seed Script

**File to create:** `scripts/seed-demo-users.ts`

**What it does:**
1. Creates 9 Supabase auth accounts (skips educator - already exists)
2. Updates each profile with first_name, last_name, age, plan
3. Posts 2-3 feed posts per persona (different rooms, post types)
4. Adds comments between users (cross-persona interactions)
5. Adds likes on each other's posts
6. Seeds BP readings for personas 1, 4, 7 (to show tracker trend)

**Run with:** `npx ts-node scripts/seed-demo-users.ts`

**Feed content to seed (copy these verbatim into the script):**

Keisha - intro post (wins room):
> "Hi everyone, I'm Keisha. My doctor told me my BP was 142/88 and handed me a prescription. I asked why it was high - she said she didn't know. I'm here to actually figure that out."

Marcus - check-in post (wins room):
> "Day 14 water goal complete. Not sure if it's making a difference yet but I'm paying attention. Logged 128/82 this morning vs 138/90 two weeks ago."

Sandra - general post:
> "Does anyone else feel like their numbers are all connected? BP, blood sugar, energy crashes - I feel like I need someone to explain how they fit together."

Tanya - question post:
> "I run 4 days a week, eat mostly whole foods, don't smoke. My cardiologist says my BP is 'borderline.' What am I missing?"

David - win post (wins room):
> "First week of cutting processed sodium. Went from averaging 148/92 to 139/88. Small but I'll take it. The supplement timing tip in the protocol actually helped."

Michelle - check-in (wins room):
> "Day 21 check-in. Morning reading: 124/79. Down from 156/94 when I started. This community is the only reason I didn't quit after week 2."

James - general post:
> "On three BP meds. My goal is to understand my body well enough to have a real conversation with my cardiologist about what's driving this. Not just manage it. Understand it."

Alicia - intro post (wins room):
> "Found out my BP is 158/96 at my last checkup. I'm 29. I thought this was an older person thing. Reading everything I can find. Just signed up."

Patricia - win post:
> "5 years managing this. What I know now that I wish I knew then: the numbers are just data. What moves them is the real education. Happy to answer questions for anyone new."

**Comments to seed:**
- Patricia replies to Alicia: "You're in the right place. Ask anything."
- Michelle replies to Keisha: "Same story for me. The WHY is everything."
- Marcus replies to Sandra: "The ROOTS framework is literally about this - how it all connects."
- David replies to James: "That's exactly my goal too. Understand it, not just suppress it."

---

## Phase 2: Narration Script

**7 scenes. Written in Dr. Hunter's voice.**

---

**SCENE 1 - The Problem (plays over landing page)**
Duration: ~25 seconds

"Every year, millions of people leave their doctor's office with a new prescription and zero explanation. They don't know why their blood pressure is high. They don't know what's making it worse. And they don't know what they can actually do about it. Hunter's Holistic Health was built for those people."

---

**SCENE 2 - The Free Tools (plays over BP zone checker on landing page)**
Duration: ~20 seconds

"Before you even create an account, you can check your blood pressure zone right here. Enter your numbers. Get an educational read - not a diagnosis - a real explanation of what that range means and what lifestyle factors are involved. This is information your appointment didn't give you."

---

**SCENE 3 - Signup + Privacy (plays over signup form, then settings privacy toggles)**
Duration: ~22 seconds

"Creating an account takes about 30 seconds. And notice what we ask for: your age, not your date of birth. Your first name, not your full legal name. We collect only what helps you track your own health. Once you are inside, you decide what the community sees. Turn off weight sharing, step counts, or meal details at any time. You can be accountable without sharing every number. Privacy is not a disclaimer at the bottom of the page. It is built into how this works."

Note: Playwright records signup page (pause on privacy notice), then logs in as Keisha and navigates to Settings > Feed Privacy Settings to show the three toggles.

---

**SCENE 4 - The Community (plays over feed page with Keisha, Marcus, Michelle posts visible)**
Duration: ~30 seconds

"This is the community. Real people checking in every single day. Keisha found out her numbers were high and nobody explained why. Marcus is on day 14 of tracking his water intake. Michelle dropped from 156 over 94 to 124 over 79 in three weeks - and she says the community is the only reason she didn't quit. When people know someone is watching, they show up."

---

**SCENE 5 - The Protocol (plays over ROOTS Framework protocol page)**
Duration: ~25 seconds

"Inside the platform, every member gets access to the ROOTS Framework - five phases of functional medicine education built around their specific picture. Review. Optimize Nutrition. Optimize Biochemical Balance. Transform Lifestyle Factors. Sustain and Adapt. Not a generic handout. A structured path."

---

**SCENE 6 - The Tracking (plays over BP Tracker page showing trend)**
Duration: ~20 seconds

"You're not just logging numbers. You're building a picture over time. Every reading. Every trend. Color-coded by the AHA and ACC zone guidelines. When you can see the pattern, you can understand what's moving it."

---

**SCENE 7 - The Points and Consistency (plays over leaderboard)**
Duration: ~15 seconds

"Consistency earns points. Points unlock levels. The leaderboard shows who's showing up - not who's perfect. This is accountability built into the platform itself."

---

**SCENE 8 - The Educator View (plays over educator dashboard)**
Duration: ~20 seconds

"And on this side - the educator dashboard. Every client. Every streak. Every pattern. One place to see the full picture of who needs attention and who is thriving. This is what a modern functional medicine practice looks like."

---

**SCENE 9 - Outro (plays over landing page pricing section)**
Duration: ~15 seconds

"Foundation membership starts at 37 dollars a month. Cancel anytime. The education your appointment didn't give you - structured, supported, and yours to keep."

---

Total narration: approximately 3 minutes 10 seconds of audio (9 scenes).

---

## Phase 3: Audio Generation Script

**File to create:** `scripts/generate-demo-audio.js`

Adapted from pharmacydecoder's `generate-split-audio.js` pattern.

**Logic:**
1. Read scenes array (label + script text)
2. Call ElevenLabs API for each scene: `POST https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`
3. Model: `eleven_turbo_v2_5` (fast, high quality)
4. Settings: stability 0.5, similarity_boost 0.8, style 0.2
5. Save each as `scripts/demo-audio/scene-{n}-{label}.mp3`

**Run with:** `node scripts/generate-demo-audio.js`

**Output directory:** `scripts/demo-audio/` (7 mp3 files)

---

## Phase 4: Playwright Recording Script

**File to create:** `scripts/record-demo-video.ts`

**Uses Playwright's built-in `recordVideo` option.**

Each scene is a separate recording context. Output: WebM clips in `scripts/demo-clips/`

**Scene sequence:**

```
Scene 1: Landing page (scroll from hero to BP tool section)
  - Navigate to localhost:5173
  - Scroll slowly to free tools section
  - Output: clip-01-landing.webm

Scene 2: BP Tool
  - Click Blood Pressure Check tab
  - Type 142 in systolic field
  - Type 88 in diastolic field
  - Click Check Zone
  - Wait for result to appear
  - Hold 4 seconds on result
  - Output: clip-02-bp-tool.webm

Scene 3: Signup (fast, 15 seconds)
  - Navigate to /signup
  - Fill form as "Keisha Washington"
  - Submit
  - Dashboard loads
  - Output: clip-03-signup.webm

Scene 4: Community Feed
  - Login as keisha.demo@hhh-demo.com
  - Navigate to /app/feed
  - Scroll through posts (all 10 personas visible)
  - Hover over Michelle's post showing the drop to 124/79
  - Click into comments on Keisha's intro post
  - Output: clip-04-feed.webm

Scene 5: Protocol Page
  - Navigate to /app/protocol
  - Scroll through ROOTS Framework sections
  - Expand one pillar
  - Output: clip-05-protocol.webm

Scene 6: BP Tracker
  - Navigate to /app/bp-tracker
  - Chart visible with seeded readings showing downward trend
  - Output: clip-06-tracker.webm

Scene 7: Leaderboard
  - Navigate to /app/leaderboard
  - Full leaderboard visible with demo personas
  - Output: clip-07-leaderboard.webm

Scene 8: Educator Dashboard
  - Login as info@huntersholistichealth.com
  - Navigate to /app/educator
  - Full client roster visible
  - Output: clip-08-educator.webm
```

**Browser settings:**
- Viewport: 1280x720 (standard video resolution)
- `recordVideo: { dir: 'scripts/demo-clips/', size: { width: 1280, height: 720 } }`
- Slow motion: 800ms between actions (makes actions readable on video)

**Run with:** `npx ts-node scripts/record-demo-video.ts`

---

## Phase 5: FFmpeg Stitch Script

**File to create:** `scripts/stitch-demo.sh`

**What it does:**
1. Converts all WebM clips to MP4 (consistent format)
2. Concatenates in scene order
3. Overlays each scene's narration audio at the right timestamp
4. Exports final `demo-video-final.mp4`

**Scene timing map (narration starts at these video timestamps):**

```
00:00 - Scene 1 Landing (clip ~25s + audio ~25s)
00:25 - Scene 2 BP Tool (clip ~25s + audio ~20s)
00:50 - Scene 3 Community Feed (clip ~35s + audio ~30s)
01:25 - Scene 4 Protocol (clip ~30s + audio ~25s)
01:55 - Scene 5 BP Tracker (clip ~25s + audio ~20s)
02:20 - Scene 6 Leaderboard (clip ~20s + audio ~15s)
02:40 - Scene 7 Educator Dashboard (clip ~30s + audio ~20s)
03:10 - Outro (landing/pricing, ~20s + audio ~15s)
```

**Run with:** `bash scripts/stitch-demo.sh`

**Output:** `scripts/demo-video-final.mp4`

---

## Full Run Order (when ready to execute)

```bash
# 1. Start dev server (leave running in a separate terminal)
npm run dev

# 2. Seed the 10 personas
npx ts-node scripts/seed-demo-users.ts

# 3. Generate narration audio (ElevenLabs)
node scripts/generate-demo-audio.js

# 4. Record Playwright clips (dev server must be running)
npx ts-node scripts/record-demo-video.ts

# 5. Stitch everything
bash scripts/stitch-demo.sh

# Final output: scripts/demo-video-final.mp4
```

---

## Cleanup (after video is done)

To remove the 9 demo accounts from Supabase:

```sql
-- Run in Supabase SQL Editor
DELETE FROM auth.users 
WHERE email LIKE '%@hhh-demo.com';
```

This cascades to profiles and feed posts via RLS/foreign keys.

---

## Notes for Future Session

- The narration script is written, do not regenerate it
- The 10 personas are based on real r/bloodpressure and r/hypertension community research (July 7, 2026)
- The key insight from research: "the unanswered WHY is the conversion hook" - make sure the video leads with Keisha's confusion, not the features
- ElevenLabs env vars: ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID (already in .env.local)
- pharmacydecoder remotion is at: /Users/higgi/Clinical Research 2026/Clippings - Youtube - UMPJE - Pharmacy Decoder/pharmacy-decoder-remotion/
- FFmpeg confirmed at /Users/higgi/.local/bin/ffmpeg v7.0
