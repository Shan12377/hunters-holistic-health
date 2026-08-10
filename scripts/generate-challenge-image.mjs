/**
 * Generate promo imagery for the 14-Day Flat Belly Challenge using GPT Image (gpt-image-1).
 * Outputs to: public/images/ai/
 *
 * Run all:    node scripts/generate-challenge-image.mjs
 * Run one:    node scripts/generate-challenge-image.mjs flat-belly-social
 *
 * Compliance note: these prompts deliberately avoid before/after framing, waistline
 * close-ups, weight-loss imagery, and anything implying a guaranteed outcome. The
 * challenge teaches cortisol, protein timing, and sleep, so the imagery shows a
 * calm, credible morning routine instead of a body transformation.
 */

import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dir, '../public/images/ai')
mkdirSync(OUT_DIR, { recursive: true })

const SHARED_STYLE = [
  'Real skin texture with visible pores and fine lines, no retouching, no AI glow,',
  'no stock-photo smile, no text or lettering anywhere in the image.',
  'Editorial health journalism quality, honest natural light, film-like grain.',
].join(' ')

const IMAGES = [
  {
    // AD HOOK OPTION A: shock contrast. Perfect food, visible stress.
    // Sells "cortisol, not calories" in one glance without a word of text.
    file: 'ad-hook-a.jpg',
    size: '1024x1536',
    prompt: `Editorial documentary photograph, Canon EOS R5, 85mm f/1.4 at f/2.0, ISO 500.
An African American woman in her late forties sits at a bright kitchen table in the morning
with a genuinely healthy breakfast in front of her: eggs, avocado, berries, a glass of water.
She is not eating. Her elbow is on the table and her fingertips press against her temple,
eyes closed for a second, jaw tight. Beside her plate a phone screen glows with notifications.
The tension is in her shoulders and her brow. Everything about the food is right and
everything about her body language says she is running on empty.
She wears a simple charcoal top, natural hair pulled back. Clean morning light from a window
on the left. Her face and hand fill the upper half of the frame. Uncluttered background so
headline text can be added over the top edge later. Muted, slightly cool palette.
${SHARED_STYLE}`,
  },
  {
    // AD HOOK OPTION B: the 3 PM cortisol spike. Same idea, different moment.
    file: 'ad-hook-b.jpg',
    size: '1024x1536',
    prompt: `Editorial documentary photograph, Sony A7R V, 50mm f/1.8 at f/2.0, ISO 640.
An African American woman in her late forties stands in her kitchen in the mid afternoon,
one hand flat on the counter, the other holding the bridge of her nose, eyes closed,
shoulders drawn up. Late day light comes in low and warm through the window behind her.
On the counter: a half finished glass of water and a closed laptop. The mood is the
2 to 3 PM wall, the moment the day catches up with her body.
She wears a soft olive blouse, natural hair loosely tied. Her face and upper body fill the
upper two thirds of the frame, with clean uncluttered wall above her head for headline text.
Warm but tired palette, shallow depth of field.
${SHARED_STYLE}`,
  },
  {
    // 4:6 portrait, for Instagram, flyers, and the QR handout.
    // Emotional beat: shared resolve. Two people who have decided to stop guessing.
    file: 'flat-belly-social.jpg',
    size: '1024x1536',
    prompt: `Editorial documentary photograph, Canon EOS R5, 85mm f/1.4 at f/2.0, ISO 400.
Two African American women friends in their mid-forties stand close together at a sunlit
kitchen counter in the early morning, sharing a real unguarded laugh. The woman on the left
has natural hair in a low bun and wears a soft oatmeal linen shirt with the sleeves pushed up,
head tipped back mid-laugh, one hand pressed to her chest. The woman on the right has shoulder
length locs and wears a warm rust knit top, laughing with her hand on her friend's arm.
Both look energized, hopeful, and genuinely happy, the look of two women who just decided to
do something together and stop guessing. Faces carry honest lines and real warmth.
On the counter: a glass pitcher of water, two tall glasses, a bowl of eggs, sliced avocado,
and an open notebook with a pen. Warm morning light rakes in from a window on the left,
catching the steam from two mugs. Lived-in kitchen with a few plants in soft focus behind.
Faces fill the upper half of the frame. Shallow depth of field, warm amber tones.
${SHARED_STYLE}`,
  },
  {
    // 3:2 landscape, for the page hero and link previews when shared.
    // Emotional beat: recognition. The quiet moment of finally understanding why.
    file: 'flat-belly-hero.jpg',
    size: '1536x1024',
    prompt: `Editorial documentary photograph, Canon EOS R5, 85mm f/1.4 at f/2.0, ISO 400.
Two African American women friends in their mid-forties stand together at a sunlit kitchen
counter in the early morning, sharing a real unguarded laugh. The woman on the right has
natural hair in a low bun and wears a soft oatmeal linen shirt with the sleeves pushed up,
head tipped back mid-laugh, one hand pressed to her chest. The woman beside her has shoulder
length locs and wears a warm rust knit top, laughing with her hand on her friend's arm.
Both look energized, hopeful, and genuinely happy, the look of two women who just decided to
do something together and stop guessing. Faces carry honest lines and real warmth.
On the counter in the foreground: a glass pitcher of water, two tall glasses, a bowl of eggs,
a small plate of sliced avocado, and an open notebook with a pen. Warm morning light rakes in
from a window on the right, catching the steam from two mugs. Lived-in kitchen with a few
plants in soft focus behind. Both women are positioned in the right two thirds of the frame.
The left third is uncluttered sunlit wall and soft bokeh, leaving clean negative space for
headline text. Warm amber tones, shallow depth of field.
${SHARED_STYLE}`,
  },
]

function loadKeyFromEnvFile(name) {
  try {
    const raw = readFileSync(join(__dir, '../.env.local'), 'utf8')
    for (const line of raw.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq === -1) continue
      if (trimmed.slice(0, eq).trim() !== name) continue
      return trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
    }
  } catch {
    return ''
  }
  return ''
}

async function generateImage(apiKey, prompt, size) {
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-image-1',
      prompt,
      size,
      quality: 'high',
      output_format: 'jpeg',
      n: 1,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`OpenAI ${res.status}: ${body.slice(0, 300)}`)
  }

  const data = await res.json()
  const b64 = data?.data?.[0]?.b64_json
  if (!b64) throw new Error('No image data returned')
  return Buffer.from(b64, 'base64')
}

async function main() {
  const apiKey = process.env.OPENAI_API_KEY || loadKeyFromEnvFile('OPENAI_API_KEY')
  if (!apiKey) {
    console.error('OPENAI_API_KEY not found in environment or .env.local')
    process.exit(1)
  }

  const filter = process.argv[2]
  const targets = filter ? IMAGES.filter(i => i.file.includes(filter)) : IMAGES

  if (targets.length === 0) {
    console.error(`No images matched: ${filter}`)
    console.log('Available:', IMAGES.map(i => i.file).join(', '))
    process.exit(1)
  }

  console.log(`Generating ${targets.length} image(s) with gpt-image-1...\n`)

  let failures = 0
  for (const img of targets) {
    const outPath = join(OUT_DIR, img.file)
    if (!filter && existsSync(outPath)) {
      console.log(`  skip (exists): ${img.file}`)
      continue
    }
    console.log(`-> ${img.file}  (${img.size})`)
    try {
      const buffer = await generateImage(apiKey, img.prompt, img.size)
      writeFileSync(outPath, buffer)
      console.log(`   saved ${(buffer.length / 1024).toFixed(0)} KB\n`)
    } catch (err) {
      failures += 1
      console.error(`   FAILED: ${err.message}\n`)
    }
  }

  console.log('Done. Review images in public/images/ai/')
  if (failures > 0) process.exit(1)
}

main()
