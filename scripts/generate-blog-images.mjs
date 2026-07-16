/**
 * Generate ultra-realistic blog and tool hero images using GPT Image 2 (gpt-image-1).
 * Outputs to: public/images/ai/
 *
 * Run: node scripts/generate-blog-images.mjs
 * Or single image: node scripts/generate-blog-images.mjs blog-glp1-muscle
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dir, '../public/images/ai')
mkdirSync(OUT_DIR, { recursive: true })

// ── Image definitions ─────────────────────────────────────────────────────────
// Subject must be in the TOP THIRD of a portrait frame (9:16).
// The hero display crops to 16:7 from the top (object-position: top).
// All prompts use photorealistic, editorial photography language.

const IMAGES = [
  // ── Blog posts ──────────────────────────────────────────────────────────────
  {
    file: 'blog-glp1-muscle.jpg',
    prompt: `Editorial health magazine photography. A 52-year-old Black man with short natural gray hair stands in a well-lit home gym, holding a pair of dumbbells at waist height. He wears a moisture-wicking gray compression shirt. His expression is focused and determined — this is someone who takes his health seriously. Face and upper chest fill the top third of the frame. Background: blurred weight rack and rubber floor mats. Canon EOS R5, 85mm f/1.4, natural light from large windows, f/2.0, ISO 400. Photojournalism quality. Real skin texture, visible pores, honest lighting. No AI glow, no studio backdrop, no stock-photo smile.`
  },
  {
    file: 'blog-glp1-regain.jpg',
    prompt: `Documentary health photography. A 44-year-old Latina woman with shoulder-length dark hair sits at a kitchen table, looking down at a small notebook where she's tracking her weight. She wears a loose linen blouse. Her expression is thoughtful, slightly concerned — she's piecing something together. Face and upper shoulders visible in the top third of frame. Background: out-of-focus kitchen with morning light streaming through a window. Sony A7R V, 50mm f/1.8, warm morning light, shallow DOF. Real skin, real lines, no retouching. Editorial healthcare journalism.`
  },
  {
    file: 'blog-glp1-supplements.jpg',
    prompt: `Photorealistic documentary photography. A 48-year-old South Asian man with salt-and-pepper hair stands at a kitchen counter, holding two supplement bottles up at eye level, comparing the labels. He wears reading glasses pushed slightly down his nose and a plain white button-down shirt. Expression: concentrated, analytical — he's doing his research. Face and both hands with bottles fill the top third of the portrait frame. Background: softly blurred kitchen shelves with more bottles. Fujifilm GFX 100S, 110mm, natural window light, f/2.8. Real skin texture, no studio lighting, editorial journalism.`
  },
  {
    file: 'blog-glp1-labs.jpg',
    prompt: `Editorial medical photography. A 51-year-old Black woman with natural locs pulled back sits across from a doctor, holding a printed lab results sheet and pointing at a specific line with her index finger. She wears a professional blazer over a simple top. Her expression is engaged and asking a question — she's advocating for herself. Face and upper body fill the top third of frame. Background: softly blurred medical office. Nikon Z9, 85mm f/1.8, overhead clinical light warmed by window. Photorealistic, no stock-photo polish, genuine moment.`
  },
  {
    file: 'blog-glp1-cost.jpg',
    prompt: `Documentary photography. A 47-year-old white man with short brown hair sits at a dining room table, looking at an insurance explanation-of-benefits letter. A laptop is open nearby showing a pharmacy website. He wears a plaid flannel shirt. His expression is frustrated but calm — he's problem-solving, not panicking. Face and hands visible in the top third of the portrait. Background: blurred dining room, papers scattered on table. Sony A7 IV, 50mm f/2.0, warm interior lamp light. Real skin, real wrinkles, photojournalism quality.`
  },
  {
    file: 'blog-glp1-side-effects.jpg',
    prompt: `Editorial health photography. A 39-year-old mixed-race woman with curly hair sits in a pharmacy consultation area, speaking earnestly with a male pharmacist across a low counter. She leans slightly forward, engaged. She wears a denim jacket. The pharmacist listens with a notepad. Faces and upper bodies fill the top half of the portrait frame. Background: softly blurred pharmacy shelving. Leica Q3, 28mm f/1.7, bright pharmacy fluorescent light mixed with daylight from entrance. Real scene, documentary feel, no stock photography compositing.`
  },
  {
    file: 'blog-metabolic-health.jpg',
    prompt: `Editorial fitness photography. A 41-year-old Asian man with short dark hair jogs on a suburban path at golden hour. He wears running gear — technical shirt, shorts, earbuds. His face is turned slightly toward camera, expression relaxed and confident — this is his daily habit. Face and upper torso sharp in the top third of the portrait frame, legs in motion blur. Background: golden bokeh of trees and path. Canon EOS R3, 135mm f/2.0L, late afternoon backlight, sharp face. Sports editorial, cinematic, real sweat, no perfect studio look.`
  },
  {
    file: 'blog-food-culture.jpg',
    prompt: `Warm editorial food-culture photography. A 50-year-old Nigerian-American woman with natural hair and bright eyes stands at a stove in a colorful family kitchen, stirring a pot of soup. She smiles naturally — genuinely enjoying the process. She wears a yellow apron over a patterned dress. Face and upper torso fill the top third of the portrait frame. Steam rises from the pot. Background: warm kitchen with family photos on the wall, slightly blurred. Fujifilm X-T5, 56mm f/1.2, warm evening kitchen light. Real kitchen, documentary style, cultural richness, not a stock photo kitchen.`
  },
  {
    file: 'blog-glp1-comparison.jpg',
    prompt: `Editorial healthcare photography. A 54-year-old white woman with shoulder-length gray-blonde hair sits across a desk from a female doctor. The doctor is showing her something on a tablet — perhaps a comparison chart. The patient leans forward, considering the information carefully. Face and upper body of the patient fill the top third of the portrait frame, doctor partially visible on the side. Background: softly blurred medical office with diplomas on wall. Sony A7R V, 85mm f/1.8, soft window daylight. Real medical consultation feel, not staged, no white-coat cliche.`
  },
  {
    file: 'blog-meal-apps.jpg',
    prompt: `Editorial technology-culture photography. A 36-year-old Black man with a short beard sits at a kitchen table, staring at his phone with a skeptical, slightly frustrated expression. The phone screen glows. He holds a pen over a meal planning notebook. He wears a dark hoodie. Face and upper chest in the top third of the portrait frame. Background: blurred kitchen counter with takeout containers and a half-eaten meal. Nikon Z8, 50mm f/1.4, mixed daylight and kitchen light. Documentary journalism, real emotion, no commercial food styling.`
  },
  {
    file: 'blog-creatine.jpg',
    prompt: `Editorial sports nutrition photography. A 28-year-old Hispanic male athlete stands at a gym locker room bench, scooping creatine powder into a shaker bottle. He wears a sleeveless shirt, post-workout. His expression is calm, matter-of-fact — this is routine for him. Face and hands with shaker fill the top third of the portrait frame. Background: slightly blurred gym locker room. Canon EOS R6 Mark II, 85mm f/2.0, gym interior light. Real sweat, real setting, no neon lighting, no protein powder commercial gloss.`
  },
  {
    file: 'blog-rebounding.jpg',
    prompt: `Lifestyle health photography. A 56-year-old white woman with silver hair and a bright smile is caught mid-bounce on a mini rebounder trampoline in a sun-lit living room. She wears workout leggings and a fitted top, arms slightly out for balance. Her face shows pure joy — this is clearly her thing. Face and upper body in the top third of the portrait frame. Background: blurred bright living room, plant on windowsill. Sony A7C, 50mm f/1.8, natural morning window light. Lifestyle editorial, candid energy, not a posed gym photo.`
  },

  // ── Tool pages ───────────────────────────────────────────────────────────────
  {
    file: 'tool-glp1-assessment.jpg',
    prompt: `Editorial healthcare photography. A 45-year-old Middle Eastern woman with dark wavy hair sits at a desk, filling out a health questionnaire on a tablet with a stylus. Her expression is focused and slightly curious — she's taking this seriously. She wears a business-casual top. Face and upper torso fill the top third of the portrait frame. Background: softly blurred home office with a window and bookshelf. Leica M11, 50mm f/2.0, natural window daylight. Medical journalism feel, honest expression, no stock photo polish.`
  },
  {
    file: 'tool-homa-ir.jpg',
    prompt: `Editorial laboratory health photography. A 49-year-old white man with glasses and light stubble looks at a printed blood test results page, holding it under a desk lamp to read better. He wears a casual button-down shirt. Expression: concerned concentration — trying to understand what the numbers mean. Face and paper in the top third of the portrait frame. Background: blurred home desk with papers. Sony A7 IV, 85mm f/1.8, warm desk lamp light mixed with cool window light. Documentary photography, real moment, not stylized.`
  },
  {
    file: 'tool-medication-nutrient.jpg',
    prompt: `Editorial pharmacy photography. A 52-year-old Black woman stands at a kitchen counter with six different prescription bottles lined up in front of her. She's consulting a yellow legal pad where she's written notes, pen in hand. Expression: organized determination. She wears reading glasses and a light cardigan. Face and upper torso fill the top third of the portrait frame, pill bottles visible at lower frame. Background: blurred kitchen with more bottles in cabinet. Canon EOS R5, 85mm f/1.4, natural window light. Photojournalism, intimate, no studio.`
  },
  {
    file: 'tool-metabolic-blueprint.jpg',
    prompt: `Editorial healthcare photography. A 43-year-old East Asian woman stands in front of a bathroom mirror, taking her own blood pressure with a home cuff. She looks at the digital readout with focused attention. She wears a tank top, natural hair. Expression: calm vigilance — this is her self-care routine. Face and cuff arm reflected in mirror and directly visible fill the top third of portrait frame. Background: clean modern bathroom, slightly blurred. Nikon Z9, 50mm f/2.0, soft bathroom light plus window. Real home health monitoring, not clinical, documentary.`
  },
  {
    file: 'tool-nutrient-sources.jpg',
    prompt: `Editorial food photography with person. A 38-year-old West African man with a full beard and natural hair stands in a farmer's market, holding two large bunches of dark leafy greens — one in each hand. He grins with genuine energy. He wears a plain white tee. Face and both arms holding greens fill the top third of the portrait frame. Background: softly blurred market stalls and colorful produce. Fujifilm GFX 100S, 110mm f/2.8, bright outdoor market light. Lifestyle documentary photography, vibrant, real market scene.`
  },
  {
    file: 'tool-supplement-timing.jpg',
    prompt: `Editorial morning routine photography. A 46-year-old white woman with short auburn hair stands at her kitchen counter early morning, holding a glass of water in one hand while looking at a phone in the other — checking a reminder or schedule. Six supplement capsules are lined up on the counter in front of her. She wears a light robe. Expression: mindful, organized. Face and upper torso fill the top third of the portrait frame, supplements visible at lower frame. Background: softly blurred morning kitchen, golden window light. Lifestyle documentary photography, not a supplement ad.`
  },
]

// ── API call (WaveSpeed Nano Banana Pro = Google Gemini 3 Pro Image) ─────────

async function generateImage(apiKey, prompt) {
  // Step 1: kick off generation
  const res = await fetch('https://api.wavespeed.ai/api/v3/google/nano-banana-pro/text-to-image', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      aspect_ratio: '2:3',          // portrait — 16:7 hero crop shows faces at top
      num_images: 1,
      output_format: 'jpeg',
      enable_sync_mode: false,
      enable_base64_output: true,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`WaveSpeed API error ${res.status}: ${err}`)
  }

  const startData = await res.json()
  const requestId = startData.data?.id ?? startData.id
  if (!requestId) throw new Error(`No request ID returned: ${JSON.stringify(startData)}`)

  // Step 2: poll until complete (up to 2 minutes)
  for (let i = 0; i < 60; i++) {
    await new Promise(r => setTimeout(r, 2000))
    const poll = await fetch(`https://api.wavespeed.ai/api/v3/predictions/${requestId}/result`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    })
    if (!poll.ok) continue

    const result = await poll.json()
    const status = result.data?.status ?? result.status

    if (status === 'completed' || status === 'success') {
      const outputs = result.data?.outputs ?? result.outputs
      const first = Array.isArray(outputs) ? outputs[0] : outputs

      if (first?.b64_json) return Buffer.from(first.b64_json, 'base64')
      if (first?.b64)      return Buffer.from(first.b64, 'base64')
      if (typeof first === 'string' && first.startsWith('data:')) {
        return Buffer.from(first.split(',')[1], 'base64')
      }
      if (typeof first === 'string' && first.startsWith('http')) {
        const imgRes = await fetch(first)
        return Buffer.from(await imgRes.arrayBuffer())
      }
      // Raw base64 string (no prefix)
      if (typeof first === 'string' && first.length > 100) {
        return Buffer.from(first, 'base64')
      }
      throw new Error(`Unknown output format: ${JSON.stringify(first).slice(0, 200)}`)
    }

    if (status === 'failed' || status === 'error') {
      throw new Error(`Generation failed: ${JSON.stringify(result)}`)
    }
    // still pending — keep polling
  }

  throw new Error('Timeout: image generation took longer than 2 minutes')
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const { readFileSync } = await import('fs')

  // Load API key
  let API_KEY = process.env.WaveSpeed_API_key || process.env.WAVESPEED_API_KEY || ''
  if (!API_KEY) {
    try {
      const raw = readFileSync(join(__dir, '../.env.local'), 'utf-8')
      for (const line of raw.split('\n')) {
        const eq = line.indexOf('=')
        if (eq < 0) continue
        const varName = line.slice(0, eq).trim()
        if (varName === 'WaveSpeed_API_key' || varName === 'WAVESPEED_API_KEY') {
          API_KEY = line.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
          break
        }
      }
    } catch {}
  }

  if (!API_KEY) {
    console.error('Error: WaveSpeed_API_key not found in .env.local or environment')
    console.error('Add it to .env.local as: WaveSpeed_API_key=your_key_here')
    process.exit(1)
  }

  // Filter to specific file if provided as argument
  const filter = process.argv[2]
  const targets = filter
    ? IMAGES.filter(img => img.file.includes(filter))
    : IMAGES

  if (targets.length === 0) {
    console.error(`No images matched filter: ${filter}`)
    console.log('Available:', IMAGES.map(i => i.file).join(', '))
    process.exit(1)
  }

  console.log(`Generating ${targets.length} image(s) with GPT Image 2 (gpt-image-1)...\n`)

  for (const img of targets) {
    const outPath = join(OUT_DIR, img.file)
    if (!filter && existsSync(outPath)) {
      console.log(`  ⏭  Skipping (already exists): ${img.file}`)
      continue
    }
    console.log(`→ ${img.file}`)
    try {
      const buffer = await generateImage(API_KEY, img.prompt)
      writeFileSync(outPath, buffer)
      console.log(`  ✓ Saved ${(buffer.length / 1024).toFixed(0)} KB\n`)
    } catch (err) {
      console.error(`  ✗ Failed: ${err.message}\n`)
    }

    // Small delay between requests to be kind to the API
    if (targets.indexOf(img) < targets.length - 1) {
      await new Promise(r => setTimeout(r, 500))
    }
  }

  console.log('Done. Review images in public/images/ai/')
  console.log('Regenerate one: node scripts/generate-blog-images.mjs blog-creatine')
  console.log('Uses WaveSpeed Nano Banana Pro (Google Gemini 3 Pro Image) — $0.07/image')
}

main()
