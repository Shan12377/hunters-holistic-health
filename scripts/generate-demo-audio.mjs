/**
 * Phase 2: Generate ElevenLabs narration audio for each demo video scene.
 * Run: node scripts/generate-demo-audio.mjs
 * Output: scripts/demo-audio/scene-{n}-{label}.mp3
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

// ── env loader ────────────────────────────────────────────────────────────────
function loadEnv() {
  const raw = readFileSync('.env.local', 'utf-8')
  const env = {}
  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq < 0) continue
    const key = trimmed.slice(0, eq).trim()
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
    env[key] = val
  }
  return env
}

const env = loadEnv()
const API_KEY = env['ELEVENLABS_API_KEY']
const VOICE_ID = env['ELEVENLABS_VOICE_ID']

if (!API_KEY || !VOICE_ID) {
  console.error('Missing ELEVENLABS_API_KEY or ELEVENLABS_VOICE_ID in .env.local')
  process.exit(1)
}

const OUT_DIR = 'scripts/demo-audio'
mkdirSync(OUT_DIR, { recursive: true })

// ── scenes ────────────────────────────────────────────────────────────────────
// 9 scenes, 1:1 with 9 Playwright clips.
// All text has been formatted using the Voice Naturalizer skill (Zinny Studio method):
//   - "..." inserted at genuine breathing pauses (budget: 1 per 8 words, capped at 3)
//   - KEY WORDS capitalized for emphasis (1-3 per sentence from the emphasis list)
//   - Question marks fixed for question-word sentences
//   - Long sentences broken at conjunctions (22+ words, 14+ since last pause)
//   - No leading/trailing ellipses; no double "... ..."
const SCENES = [
  {
    index: 1,
    label: 'problem',
    // S1 (9w, 1 pause max): EVERY caps. No pause (no transition word, no long clause after comma).
    // S2 (12w, 1 pause max): DON'T caps.
    // S3 (10w, 1 pause max): no emphasis word; no pause needed.
    // S4 (14w, 1 pause max): ACTUALLY caps.
    // S5 (8w, 1 pause max): no emphasis word.
    text: "EVERY year, millions of people leave their doctor's office with a new prescription and zero explanation. They DON'T know why their blood pressure is high. They don't know what's making it worse. And they don't know what they can ACTUALLY do about it. Hunter's Holistic Health was built for those people.",
  },
  {
    index: 2,
    label: 'free-tools',
    // S1 (17w, 1 pause): EVEN caps; comma + 11-word clause → ", ..."
    // S2 (3w): no pause, no caps.
    // S3 (30w, 2 pauses): NOT caps on "not a diagnosis"; REAL caps; "and" conjunction after 14w → "... and"
    // S4 (12w, 1 pause): no emphasis word; no pause.
    text: "Before you EVEN create an account, ... you can check your blood pressure zone right here. Enter your numbers. Get an educational read - NOT a diagnosis - a REAL explanation of what that range means, ... and what lifestyle factors are involved. This is information your appointment didn't give you.",
  },
  {
    index: 3,
    label: 'signup-privacy',
    // S1 (8w, 1 pause): no emphasis word; no pause.
    // S2 (13w, 1 pause): NOT caps; colon + 10-word clause → ": ..."
    // S3 (8w, 1 pause): FIRST caps (in emphasis list).
    // S4 (10w, 1 pause): ONLY caps.
    // S5 (10w, 1 pause): comma + 8-word clause → ", ..."
    // S6 (12w, 1 pause): no emphasis word; no pause.
    // S7 (8w, 1 pause): EVERY caps.
    // S8 (11w, 1 pause): NOT caps.
    // S9 (7w, 0 pauses): no caps.
    text: "Creating an account takes about 30 seconds. And notice what we ask for: ... your age, NOT your date of birth. Your FIRST name, not your full legal name. We collect ONLY what helps you track your own health. Once you are inside, ... you decide what the community sees. Turn off weight sharing, step counts, or meal details at any time. You can be accountable without sharing EVERY number. Privacy is NOT a disclaimer at the bottom of the page. It is built into how this works.",
  },
  {
    index: 4,
    label: 'community',
    // S1 (5w): no pause, no caps.
    // S2 (7w, 0-1 pause): EVERY caps.
    // S3 (12w, 1 pause): NOBODY caps; pause before "and" (major transition).
    // S4 (10w, 1 pause): no emphasis word; no pause.
    // S5 (27w, 2 pauses): ONLY caps; pause before "and" (major transition); pause already from dash.
    // S6 (9w, 1 pause): no emphasis word; "they show up" only 3w after comma — skip comma pause.
    text: "This is the community. Real people checking in EVERY single day. Keisha found out her numbers were high, ... and NOBODY explained why. Marcus is on day 14 of tracking his water intake. Michelle dropped from 156 over 94 to 124 over 79 in three weeks, ... and she says the community is the ONLY reason she didn't quit. When people know someone is watching, they show up.",
  },
  {
    index: 5,
    label: 'protocol',
    // S1 (24w, 2 pauses): EVERY caps; comma + 19-word clause → ", ..." at comma; ROOTS already ALL CAPS → skip.
    // S2-S6: single-word/2-word sentences → 0 pauses, 0 caps.
    // S7 (4w): NOT caps.
    // S8 (3w): no caps.
    text: "Inside the platform, ... EVERY member gets access to the ROOTS Framework - five phases of functional medicine education built around their specific picture. Review. Optimize Nutrition. Optimize Biochemical Balance. Transform Lifestyle Factors. Sustain and Adapt. NOT a generic handout. A structured path.",
  },
  {
    index: 6,
    label: 'tracking',
    // S1 (5w): NOT caps.
    // S2 (6w): no caps.
    // S3 (2w): EVERY caps.
    // S4 (2w): EVERY caps.
    // S5 (8w): AHA/ACC already capped → skip; no pause.
    // S6 (12w, 1 pause): comma + 8-word clause → ", ..."
    text: "You're NOT just logging numbers. You're building a picture over time. EVERY reading. EVERY trend. Color-coded by the AHA and ACC zone guidelines. When you can see the pattern, ... you can understand what's moving it.",
  },
  {
    index: 7,
    label: 'leaderboard',
    // S1 (3w): no caps.
    // S2 (3w): no caps.
    // S3 (9w, 1 pause): NOT caps; dash provides natural breathing pause — keep.
    // S4 (8w, 1 pause): no emphasis word; no pause.
    text: "Consistency earns points. Points unlock levels. The leaderboard shows who's showing up - NOT who's perfect. This is accountability built into the platform itself.",
  },
  {
    index: 8,
    label: 'educator',
    // S1 (8w, 1 pause): dash provides natural pause; no emphasis word in this sentence.
    // S2 (2w): EVERY caps.
    // S3 (2w): EVERY caps.
    // S4 (2w): EVERY caps.
    // S5 (16w, 1 pause): no emphasis word; "and" conjunction but only 4w before end → skip.
    // S6 (10w, 1 pause): no emphasis word; no pause.
    text: "And on this side - the educator dashboard. EVERY client. EVERY streak. EVERY pattern. One place to see the full picture of who needs attention and who is thriving. This is what a modern functional medicine practice looks like.",
  },
  {
    index: 9,
    label: 'outro',
    // S1 (8w, 1 pause): no emphasis word; no pause.
    // S2 (2w): no caps.
    // S3 (13w, 1 pause): dash provides natural pause; no emphasis word.
    text: "Foundation membership starts at 37 dollars a month. Cancel anytime. The education your appointment didn't give you - structured, supported, and yours to keep.",
  },
]

// ── generate audio for one scene ──────────────────────────────────────────────
async function generateScene(scene) {
  const filename = `scene-${String(scene.index).padStart(2, '0')}-${scene.label}.mp3`
  const outPath = join(OUT_DIR, filename)

  console.log(`  Generating: ${filename}`)

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': API_KEY,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text: scene.text,
        // eleven_multilingual_v2: stable and clean for educational/tutorial narration.
        // eleven_v3 is better for emotional storytelling — not needed here.
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.32,          // 30-35% per skill: varied but not chaotic
          similarity_boost: 0.75,   // 70-80% per skill: keeps voice consistent (brand identity)
          style: 0.05,              // 5% per skill: tutorials need subtle, not theatrical delivery
          use_speaker_boost: true,
        },
      }),
    }
  )

  if (!response.ok) {
    const errBody = await response.text()
    throw new Error(`ElevenLabs ${response.status}: ${errBody}`)
  }

  const buffer = await response.arrayBuffer()
  writeFileSync(outPath, Buffer.from(buffer))

  const sizeKb = Math.round(buffer.byteLength / 1024)
  console.log(`  OK   ${filename} (${sizeKb} KB)`)
  return outPath
}

// ── main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log("Hunter's Holistic Health - ElevenLabs Audio Generation")
  console.log('=======================================================')
  console.log(`Voice ID: ${VOICE_ID.slice(0, 8)}...`)
  console.log(`Output: ${OUT_DIR}/\n`)

  const results = []

  for (const scene of SCENES) {
    try {
      const path = await generateScene(scene)
      results.push({ scene: scene.index, label: scene.label, path, ok: true })
    } catch (err) {
      console.error(`  ERROR scene ${scene.index} (${scene.label}):`, err.message)
      results.push({ scene: scene.index, label: scene.label, ok: false })
    }
  }

  console.log('\n=======================================================')
  console.log('Summary:')
  for (const r of results) {
    const icon = r.ok ? 'OK  ' : 'FAIL'
    console.log(`  ${icon} Scene ${r.scene}: ${r.label}`)
  }

  const failed = results.filter(r => !r.ok)
  if (failed.length > 0) {
    console.log(`\n${failed.length} scene(s) failed. Re-run to retry.`)
    process.exit(1)
  } else {
    console.log('\nAll scenes generated. Next: node scripts/record-demo-video.mjs')
  }
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
