/**
 * Phase 4 v2: Record demo clips — single browser context per scene to eliminate
 * white flashes. Each scene navigates cleanly and holds long enough for the narration.
 *
 * Run: npm run dev  (in another terminal first)
 * Then: node scripts/record-demo-video-v2.mjs
 *
 * Output: scripts/demo-clips-v2/
 */

import { chromium } from 'playwright'
import { readFileSync, mkdirSync, renameSync } from 'fs'
import { join, resolve } from 'path'

const BASE      = 'http://localhost:5173'
const CLIPS_DIR = 'scripts/demo-clips-v2'
mkdirSync(CLIPS_DIR, { recursive: true })

// ── env loader ────────────────────────────────────────────────────────────────
function loadEnv() {
  const env = {}
  try {
    const raw = readFileSync('.env.local', 'utf-8')
    for (const line of raw.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq < 0) continue
      env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
    }
  } catch {}
  return env
}

const env = loadEnv()
const DEMO_PASS     = 'DemoPass2026!'
const EDUCATOR_PASS = env['EDUCATOR_PASSWORD'] || ''

const hold   = (page, ms) => page.waitForTimeout(ms)

async function smoothScroll(page, targetY, steps = 10) {
  const startY = await page.evaluate(() => window.scrollY)
  const delta  = (targetY - startY) / steps
  for (let i = 0; i < steps; i++) {
    await page.evaluate(y => window.scrollBy(0, y), delta)
    await page.waitForTimeout(150)
  }
}

// ── fresh context: one per scene ─────────────────────────────────────────────
async function newCtx(browser, label) {
  const ctx = await browser.newContext({
    viewport:    { width: 1280, height: 720 },
    recordVideo: { dir: CLIPS_DIR, size: { width: 1280, height: 720 } },
  })
  // Intercept new pages and set a dark background instantly to prevent white flash
  ctx.on('page', async page => {
    await page.addInitScript(() => {
      document.documentElement.style.background = '#0e1f1f'
      document.body && (document.body.style.background = '#0e1f1f')
    })
  })
  return ctx
}

async function login(page, email, password) {
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('input[type="email"]', { timeout: 8000 })
  await page.fill('input[type="email"]', email)
  await page.fill('input[type="password"]', password)
  await page.click('button[type="submit"]')
  await page.waitForURL('**/app/**', { timeout: 12000 })
  await hold(page, 800)
}

// ── SCENE 01: Landing — problem statement + scroll ────────────────────────────
async function scene01(browser) {
  console.log('  Scene 01: Landing...')
  const ctx  = await newCtx(browser, 'scene-01')
  const page = await ctx.newPage()
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await hold(page, 2000)
  await smoothScroll(page, 300, 8)
  await hold(page, 1500)
  await smoothScroll(page, 700, 8)
  await hold(page, 2000)
  await smoothScroll(page, 0, 6)
  await hold(page, 1500)
  await ctx.close()
  console.log('  OK   Scene 01')
}

// ── SCENE 02: Free BP Tool (before login) ────────────────────────────────────
async function scene02(browser) {
  console.log('  Scene 02: BP Tool...')
  const ctx  = await newCtx(browser, 'scene-02')
  const page = await ctx.newPage()
  await page.goto(BASE, { waitUntil: 'networkidle' })
  // Scroll to BP simulator section on landing page
  const bpTool = page.locator('[class*="bp"], [class*="simulator"], [class*="calculator"], input[placeholder*="systolic" i], input[placeholder*="120" i]').first()
  if (await bpTool.count() > 0) {
    await bpTool.scrollIntoViewIfNeeded()
    await hold(page, 1000)
    // Fill in sample BP numbers
    const inputs = page.locator('input[type="number"], input[type="text"]')
    if (await inputs.count() >= 2) {
      await inputs.first().click()
      await inputs.first().fill('138')
      await hold(page, 600)
      await inputs.nth(1).click()
      await inputs.nth(1).fill('88')
      await hold(page, 600)
    }
    const submitBtn = page.locator('button[type="submit"], button:has-text("Check"), button:has-text("Calculate"), button:has-text("See")').first()
    if (await submitBtn.count() > 0) {
      await submitBtn.click()
      await hold(page, 2000)
    }
  } else {
    await smoothScroll(page, 800, 8)
    await hold(page, 3000)
  }
  await hold(page, 3000)
  await ctx.close()
  console.log('  OK   Scene 02')
}

// ── SCENE 03: Signup + Privacy settings ──────────────────────────────────────
async function scene03(browser) {
  console.log('  Scene 03: Signup + Privacy...')
  const ctx  = await newCtx(browser, 'scene-03')
  const page = await ctx.newPage()

  // Show signup form and pause on privacy fields
  await page.goto(`${BASE}/signup`, { waitUntil: 'networkidle' })
  await hold(page, 3500)

  // Log in as Keisha to show privacy settings
  await login(page, 'keisha.demo@hhh-demo.com', DEMO_PASS)
  await page.goto(`${BASE}/app/settings`, { waitUntil: 'networkidle' })
  await hold(page, 1000)

  const privacySection = page.locator('text=Feed Privacy Settings')
  if (await privacySection.count() > 0) {
    await privacySection.scrollIntoViewIfNeeded()
    await hold(page, 4000)
  } else {
    await smoothScroll(page, 600, 8)
    await hold(page, 3000)
  }
  await ctx.close()
  console.log('  OK   Scene 03')
}

// ── SCENE 04: AI Meal Guard ───────────────────────────────────────────────────
async function scene04(browser) {
  console.log('  Scene 04: Meal Guard...')
  const ctx  = await newCtx(browser, 'scene-04')
  const page = await ctx.newPage()

  await login(page, 'keisha.demo@hhh-demo.com', DEMO_PASS)

  // Navigate to Meal Guard
  const mealLink = page.locator('a[href*="meal"], [class*="meal"]').first()
  const mealText = page.getByText('Meal Guard', { exact: false }).first()
  if (await mealLink.count() > 0) {
    await mealLink.click()
    await page.waitForLoadState('networkidle')
  } else if (await mealText.count() > 0) {
    await mealText.click()
    await page.waitForLoadState('networkidle')
  } else {
    await page.goto(`${BASE}/app/meal-guard`, { waitUntil: 'networkidle' })
  }
  await hold(page, 1500)

  // Type a meal into the input
  const input = page.locator('textarea, input[type="text"]').first()
  if (await input.count() > 0) {
    await input.click()
    await hold(page, 500)
    // Type slowly so the viewer can read it
    await input.type('Grilled salmon with roasted sweet potatoes and steamed broccoli', { delay: 40 })
    await hold(page, 1500)
    // Submit
    const btn = page.locator('button[type="submit"], button:has-text("Check"), button:has-text("Analyze"), button:has-text("Guard")').first()
    if (await btn.count() > 0) {
      await btn.click()
      await hold(page, 5000)  // wait for AI response
    }
  } else {
    await hold(page, 4000)
  }
  await hold(page, 3000)
  await ctx.close()
  console.log('  OK   Scene 04')
}

// ── SCENE 05: Community feed ("this could be you") ───────────────────────────
async function scene05(browser) {
  console.log('  Scene 05: Community...')
  const ctx  = await newCtx(browser, 'scene-05')
  const page = await ctx.newPage()

  await login(page, 'keisha.demo@hhh-demo.com', DEMO_PASS)
  await page.goto(`${BASE}/app/feed`, { waitUntil: 'networkidle' })
  await hold(page, 2000)
  await smoothScroll(page, 400, 8)
  await hold(page, 2000)
  await smoothScroll(page, 900, 8)
  await hold(page, 2500)
  await smoothScroll(page, 0, 6)
  await hold(page, 1500)
  await ctx.close()
  console.log('  OK   Scene 05')
}

// ── SCENE 06: ROOTS Protocol ──────────────────────────────────────────────────
async function scene06(browser) {
  console.log('  Scene 06: Protocol...')
  const ctx  = await newCtx(browser, 'scene-06')
  const page = await ctx.newPage()

  await login(page, 'keisha.demo@hhh-demo.com', DEMO_PASS)
  await page.goto(`${BASE}/app/protocol`, { waitUntil: 'networkidle' })
  await hold(page, 2000)
  await smoothScroll(page, 500, 10)
  await hold(page, 2000)
  await smoothScroll(page, 1100, 10)
  await hold(page, 2500)
  await smoothScroll(page, 0, 8)
  await hold(page, 1500)
  await ctx.close()
  console.log('  OK   Scene 06')
}

// ── SCENE 07: BP Tracker ──────────────────────────────────────────────────────
async function scene07(browser) {
  console.log('  Scene 07: BP Tracker...')
  const ctx  = await newCtx(browser, 'scene-07')
  const page = await ctx.newPage()

  await login(page, 'keisha.demo@hhh-demo.com', DEMO_PASS)
  await page.goto(`${BASE}/app/bp-tracker`, { waitUntil: 'networkidle' })
  await hold(page, 2500)

  // Hover over the chart to show tooltips if Chart.js is rendered
  const chart = page.locator('canvas').first()
  if (await chart.count() > 0) {
    const box = await chart.boundingBox()
    if (box) {
      // Hover across the chart slowly
      for (let x = box.x + 40; x < box.x + box.width - 40; x += 60) {
        await page.mouse.move(x, box.y + box.height / 2)
        await hold(page, 400)
      }
    }
  }
  await hold(page, 2000)
  await smoothScroll(page, 400, 8)
  await hold(page, 2500)
  await ctx.close()
  console.log('  OK   Scene 07')
}

// ── SCENE 08: Educator dashboard ─────────────────────────────────────────────
async function scene08(browser) {
  console.log('  Scene 08: Educator...')
  if (!EDUCATOR_PASS) {
    console.log('  WARN  EDUCATOR_PASSWORD not set — skipping')
    return
  }
  const ctx  = await newCtx(browser, 'scene-08')
  const page = await ctx.newPage()

  await login(page, 'info@huntersholistichealth.com', EDUCATOR_PASS)

  // Navigate to educator dashboard
  await page.goto(`${BASE}/app/educator`, { waitUntil: 'networkidle' })
  await hold(page, 2500)

  // Show client roster — scroll through it
  await smoothScroll(page, 400, 8)
  await hold(page, 2500)
  await smoothScroll(page, 800, 8)
  await hold(page, 2000)

  // Scroll back up so dashboard header is visible
  await smoothScroll(page, 0, 6)
  await hold(page, 2000)
  await ctx.close()
  console.log('  OK   Scene 08')
}

// ── SCENE 09: Outro — pricing on landing ─────────────────────────────────────
async function scene09(browser) {
  console.log('  Scene 09: Outro / pricing...')
  const ctx  = await newCtx(browser, 'scene-09')
  const page = await ctx.newPage()

  await page.goto(BASE, { waitUntil: 'networkidle' })
  await hold(page, 800)

  // Scroll to pricing section
  const byClass = page.locator('[class*="pricing"], [class*="plans"], #pricing')
  const byText  = page.getByText('Foundation', { exact: true }).first()

  if (await byClass.count() > 0) {
    await byClass.first().scrollIntoViewIfNeeded()
  } else if (await byText.count() > 0) {
    await byText.scrollIntoViewIfNeeded()
  } else {
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight * 0.65, behavior: 'smooth' }))
  }
  await hold(page, 1000)

  // Slow scroll through the pricing cards
  const currentY = await page.evaluate(() => window.scrollY)
  await smoothScroll(page, currentY + 300, 8)
  await hold(page, 5000)
  await ctx.close()
  console.log('  OK   Scene 09')
}

// ── main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log("Hunter's Holistic Health — Demo Video v2")
  console.log('=========================================')
  console.log(`Target: ${BASE}`)
  console.log(`Output: ${CLIPS_DIR}/\n`)

  try {
    const res = await fetch(BASE)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
  } catch {
    console.error(`ERROR: Dev server not running at ${BASE}`)
    console.error('Run: npm run dev')
    process.exit(1)
  }

  const browser = await chromium.launch({ headless: false })

  try {
    await scene01(browser)
    await scene02(browser)
    await scene03(browser)
    await scene04(browser)
    await scene05(browser)
    await scene06(browser)
    await scene07(browser)
    await scene08(browser)
    await scene09(browser)
  } finally {
    await browser.close()
  }

  console.log('\nAll scenes recorded.')
  console.log('Next: node scripts/stitch-demo-v2.sh')
}

main().catch(err => {
  console.error('Fatal:', err.message)
  process.exit(1)
})
