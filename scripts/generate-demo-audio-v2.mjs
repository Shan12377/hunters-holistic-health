/**
 * Phase 3 v2: Regenerate narration with revised scripts.
 * New scenes: Meal Guard (scene 04), hormone tracker folded into BP scene.
 * Community reframed as "this could be you."
 * Educator dashboard gets its own dedicated timing.
 *
 * Run: node scripts/generate-demo-audio-v2.mjs
 * Output: scripts/demo-audio-v2/scene-01.mp3 … scene-09.mp3
 */

import { mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'

const AUDIO_DIR = 'scripts/demo-audio-v2'
mkdirSync(AUDIO_DIR, { recursive: true })

// ── load ElevenLabs key from .env.local ────────────────────────────────────
import { readFileSync } from 'fs'
function loadEnvKey(key) {
  try {
    const raw = readFileSync('.env.local', 'utf-8')
    for (const line of raw.split('\n')) {
      const eq = line.indexOf('=')
      if (eq < 0) continue
      if (line.slice(0, eq).trim() === key)
        return line.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
    }
  } catch {}
  return process.env[key] || ''
}

const ELEVEN_API_KEY = loadEnvKey('ELEVENLABS_API_KEY') || loadEnvKey('VITE_ELEVENLABS_API_KEY')
if (!ELEVEN_API_KEY) {
  console.error('ELEVENLABS_API_KEY not found in .env.local')
  process.exit(1)
}

const VOICE_ID = loadEnvKey('ELEVENLABS_VOICE_ID') || loadEnvKey('VITE_ELEVENLABS_VOICE_ID') || '21m00Tcm4TlvDq8ikWAM'

// ── Voice Naturalizer applied: ellipsis pauses, ALL CAPS emphasis ──────────
const SCENES = [
  {
    id: 'scene-01-problem',
    text: `EVERY year, millions of people leave the doctor's office with a new prescription... and zero explanation. They don't know why their blood pressure is high. They don't know what's making it worse. And they don't know what they can ACTUALLY do about it. Hunter's Holistic Health was built for those people.`,
  },
  {
    id: 'scene-02-free-tools',
    text: `Before you even create an account, you can check your blood pressure zone right here. Enter your numbers... get an education. Not a scare. Just CONTEXT. This is the first thing we want you to know: your data belongs to you.`,
  },
  {
    id: 'scene-03-signup-privacy',
    text: `Creating an account takes about 30 seconds. Notice what we DON'T ask for: your date of birth. Your full legal name. Just your age. Just your first name. And once you're inside, you control what the community sees. Weight, steps, meals... you can share all of it, or NONE of it. Accountability without oversharing.`,
  },
  {
    id: 'scene-04-meal-guard',
    text: `This is the AI Meal Guard. Type in what you're about to eat... and instead of a calorie count, you get CONTEXT. Is this inflammatory? How does it affect blood pressure? What's worth knowing before the next bite? This is not a diet tracker. It's a food education tool.`,
  },
  {
    id: 'scene-05-community',
    text: `Imagine checking in every single day... and actually being SEEN. This could be you. Logging your wins. Posting a late slip when life gets in the way. The community shows who's showing up, not who's perfect. Real people. Real consistency. REAL accountability.`,
  },
  {
    id: 'scene-06-protocol',
    text: `Every member gets access to the ROOTS Framework. Five phases of functional medicine education built around YOUR picture. Review, Optimize Nutrition, Optimize Biochemical Balance, Transform Lifestyle, Sustain and Adapt. This is the education... your appointment never gave you.`,
  },
  {
    id: 'scene-07-tracking',
    text: `You're not just logging numbers. You're building a PICTURE over time. Every reading. Every trend. Color-coded by the AHA and ACC zone guidelines. When you can SEE the pattern... you start to understand what's actually moving it.`,
  },
  {
    id: 'scene-08-educator',
    text: `And on THIS side of the platform: the educator dashboard. Every client. Every streak. Every pattern... in one place. Assign protocols, track progress, and generate a full client report with one click. This is what it looks like to ACTUALLY know your clients.`,
  },
  {
    id: 'scene-09-outro',
    text: `The Foundation membership starts at $37 a month. Cancel anytime. This is the education your appointment didn't give you... the accountability your routine never had... and the community that shows up WITH you. This is Hunter's Holistic Health.`,
  },
]

async function generateAudio(scene) {
  const outputPath = join(AUDIO_DIR, `${scene.id}.mp3`)

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: 'POST',
    headers: {
      'xi-api-key': ELEVEN_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: scene.text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.32,
        similarity_boost: 0.75,
        style: 0.05,
        use_speaker_boost: true,
      },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`ElevenLabs error ${res.status}: ${err}`)
  }

  const buffer = Buffer.from(await res.arrayBuffer())
  writeFileSync(outputPath, buffer)
  console.log(`  OK   ${scene.id}.mp3 (${(buffer.length / 1024).toFixed(0)} KB)`)
}

async function main() {
  console.log('Generating v2 narration audio...\n')

  for (const scene of SCENES) {
    process.stdout.write(`  Generating ${scene.id}... `)
    try {
      await generateAudio(scene)
    } catch (err) {
      console.error(`FAILED: ${err.message}`)
      process.exit(1)
    }
    // Brief pause between API calls
    await new Promise(r => setTimeout(r, 800))
  }

  console.log(`\nAll ${SCENES.length} scenes generated in ${AUDIO_DIR}/`)
}

main()
