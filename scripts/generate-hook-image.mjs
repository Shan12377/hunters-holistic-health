/**
 * Generate the demo video opening hook image via WaveSpeed (FLUX).
 * Outputs: scripts/hook/hook-still.png
 * Then creates: scripts/hook/hook-clip.mp4 (4s Ken Burns zoom via FFmpeg)
 *
 * Run: node scripts/generate-hook-image.mjs
 */

import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const HOOK_DIR = join(__dir, 'hook')
mkdirSync(HOOK_DIR, { recursive: true })

// Load from .env.local
const { readFileSync: _readEnv } = await import('fs')
function loadEnvKey(key) {
  try {
    const raw = _readEnv('.env.local', 'utf-8')
    for (const line of raw.split('\n')) {
      const eq = line.indexOf('=')
      if (eq < 0) continue
      if (line.slice(0, eq).trim() === key) return line.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
    }
  } catch {}
  return process.env[key] || ''
}
const API_KEY = loadEnvKey('WAVESPEED_API_KEY')
if (!API_KEY) throw new Error('WAVESPEED_API_KEY not found in .env.local or environment')
// Two best photorealistic models on WaveSpeed
const MODELS = [
  'wavespeed-ai/flux-2-max/text-to-image',
  'google/imagen4-ultra',
]
const BASE_URL = 'https://api.wavespeed.ai/api/v3'
const FFMPEG   = '/Users/higgi/.local/bin/ffmpeg'

const PROMPTS = [
  // Variation A: Kitchen table, intimate morning light
  `Photograph taken on a Canon EOS R5, 85mm f/1.2L lens at f/1.8, ISO 640. A Black woman in her early forties sits alone at a worn oak kitchen table at 6am. She wears an oversized white crew-neck t-shirt. A white Omron blood pressure cuff is wrapped around her left upper arm, the small digital display glowing faintly with numbers. She rests her right hand flat on the table and stares quietly at the monitor with a calm, tired, searching expression — not afraid, just waiting for something to make sense. Morning light streams in soft and warm through a window just off frame left, catching the side of her face, the curve of her shoulder, and the edge of the cuff. Out-of-focus in the background: a glass of water, a coffee mug with steam rising, three loose papers with printed text. Visible skin texture, fine facial lines, natural hair in a loose bun. Extremely shallow depth of field. No retouching. Warm amber tones, film grain, editorial photography.`,
  // Variation B: Doctor's office waiting room, cooler clinical light
  `Documentary photograph, Sony A7R V, 50mm f/1.4, f/2.0, ISO 800. A Black woman in her mid-forties sits in a beige waiting room chair, wearing a light blue medical gown over her street clothes. She holds a folded piece of paper — a prescription — and stares down at it with a quiet, neutral expression: not upset, just absorbing information she does not fully understand. Fluorescent overhead lighting warms slightly from a window to her right. The chair next to her is empty. A blurred health poster on the wall behind her is completely illegible. Natural skin, real pores, visible fine lines, no makeup, reading glasses pushed up on her forehead. Photojournalism quality, honest light, no studio feel, film-like grain, muted clinical tones with warm skin undertone.`,
]

async function submitJob(prompt, label, model) {
  console.log(`Submitting ${label} via ${model}`)

  const res = await fetch(`${BASE_URL}/${model}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      aspect_ratio: '16:9',
      output_format: 'png',
      raw: true,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`WaveSpeed submit failed ${res.status}: ${text}`)
  }

  const data = await res.json()
  console.log('Job submitted:', JSON.stringify(data, null, 2))
  return data
}

async function pollResult(jobId, resultUrl) {
  const pollUrl = resultUrl || `${BASE_URL}/predictions/${jobId}`
  console.log(`Polling: ${pollUrl}`)

  for (let i = 0; i < 60; i++) {
    await new Promise(r => setTimeout(r, 3000))
    const res = await fetch(pollUrl, {
      headers: { 'Authorization': `Bearer ${API_KEY}` },
    })

    if (!res.ok) continue

    const data = await res.json()
    const status = data.status || data.data?.status

    console.log(`  Status: ${status}`)

    if (status === 'completed' || status === 'succeeded') {
      const outputs = data.data?.outputs || data.outputs || data.output
      const url = Array.isArray(outputs) ? outputs[0] : outputs
      if (url) return url
    }

    if (status === 'failed' || status === 'error') {
      throw new Error(`Job failed: ${JSON.stringify(data)}`)
    }
  }

  throw new Error('Timed out waiting for image')
}

async function downloadImage(url, destPath) {
  console.log(`Downloading image from: ${url}`)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Download failed ${res.status}`)
  const buffer = Buffer.from(await res.arrayBuffer())
  writeFileSync(destPath, buffer)
  console.log(`Saved: ${destPath} (${(buffer.length / 1024).toFixed(0)} KB)`)
}

async function makeKenBurnsClip(imagePath, outputPath) {
  console.log('Creating Ken Burns hook clip with FFmpeg...')

  // 4-second slow zoom-in from 1.0x to 1.08x, centered on face (upper-center of frame)
  const filter =
    "zoompan=z='min(zoom+0.002,1.08)':x='iw/2-(iw/zoom/2)':y='ih*0.3-(ih/zoom/2)':d=120:s=1280x720:fps=30"

  const { execFileSync } = await import('child_process')
  execFileSync(FFMPEG, [
    '-y',
    '-loop', '1',
    '-i', imagePath,
    '-vf', filter,
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-crf', '18',
    '-pix_fmt', 'yuv420p',
    '-t', '4',
    outputPath,
  ], { stdio: 'inherit' })

  console.log(`Hook clip ready: ${outputPath}`)
}

async function main() {
  const labels = ['A-kitchen', 'B-waiting-room']

  try {
    // Submit both jobs in parallel — one per model
    const jobs = await Promise.all(
      PROMPTS.map((prompt, i) => submitJob(prompt, labels[i], MODELS[i]))
    )

    // Poll and download sequentially (avoid hammering the API)
    for (let i = 0; i < jobs.length; i++) {
      const job       = jobs[i]
      const jobId     = job.id || job.data?.id
      const resultUrl = job.data?.urls?.get || job.url || job.data?.url

      const imageUrl  = await pollResult(jobId, resultUrl)
      const stillPath = join(HOOK_DIR, `hook-still-${labels[i]}.png`)
      await downloadImage(imageUrl, stillPath)

      const clipPath = join(HOOK_DIR, `hook-clip-${labels[i]}.mp4`)
      await makeKenBurnsClip(stillPath, clipPath)
    }

    console.log('\nDone. Both variations are in scripts/hook/')
    console.log('Open both stills and tell me which one to use.')

  } catch (err) {
    console.error('Error:', err.message)
    process.exit(1)
  }
}

main()
