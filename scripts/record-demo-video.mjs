/**
 * Phase 4: Record Playwright clips for each demo video scene.
 * Run: node scripts/record-demo-video.mjs
 *
 * REQUIRES: npm run dev running at localhost:5173 in another terminal.
 * Output: scripts/demo-clips/clip-{n}-{label}.webm
 *
 * Credentials seeded in Phase 1:
 *   keisha.demo@hhh-demo.com / DemoPass2026!  (foundation)
 *   michelle.demo@hhh-demo.com / DemoPass2026! (foundation)
 *   educator: info@huntersholistichealth.com   (educator account)
 */

import { chromium } from 'playwright'
import { readFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const BASE = 'http://localhost:5173'
const CLIPS_DIR = 'scripts/demo-clips'
mkdirSync(CLIPS_DIR, { recursive: true })

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
const EDUCATOR_EMAIL = 'info@huntersholistichealth.com'
const EDUCATOR_PASS = env['EDUCATOR_PASSWORD'] || ''  // set this in .env.local if needed

// ── browser factory: one context per clip ────────────────────────────────────
async function newContext(browser, clipName) {
  return browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: CLIPS_DIR,
      size: { width: 1280, height: 720 },
    },
    // Smooth mouse movements
    slowMo: 0,
  })
}

// ── login helper ──────────────────────────────────────────────────────────────
async function login(page, email, password) {
  await page.goto(`${BASE}/login`)
  await page.waitForSelector('input[type="email"]')
  await page.fill('input[type="email"]', email)
  await page.fill('input[type="password"]', password)
  await page.click('button[type="submit"]')
  await page.waitForURL('**/app/**', { timeout: 10000 })
}

// ── smooth scroll helper ──────────────────────────────────────────────────────
async function smoothScroll(page, targetY, steps = 8) {
  const startY = await page.evaluate(() => window.scrollY)
  const delta = (targetY - startY) / steps
  for (let i = 0; i < steps; i++) {
    await page.evaluate((y) => window.scrollBy(0, y), delta)
    await page.waitForTimeout(120)
  }
}

// ── pause helper: hold on frame for N seconds ─────────────────────────────────
const hold = (page, ms) => page.waitForTimeout(ms)

// ── SCENE 1: Landing page hero + scroll to BP tool ────────────────────────────
async function scene01(browser) {
  console.log('  Recording Scene 1: Landing page...')
  const ctx = await newContext(browser, 'clip-01-landing')
  const page = await ctx.newPage()

  await page.goto(BASE)
  await page.waitForLoadState('networkidle')
  await hold(page, 1500)

  // Slow scroll down to show the hero
  await smoothScroll(page, 400, 6)
  await hold(page, 800)
  await smoothScroll(page, 900, 8)
  await hold(page, 1200)

  // Scroll to the tools section (BP checker tabs)
  await smoothScroll(page, 1800, 10)
  await hold(page, 2000)

  await ctx.close()
  console.log('  OK   Scene 1 written')
}

// ── SCENE 2: BP zone checker interaction ──────────────────────────────────────
async function scene02(browser) {
  console.log('  Recording Scene 2: BP tool...')
  const ctx = await newContext(browser, 'clip-02-bp-tool')
  const page = await ctx.newPage()

  await page.goto(BASE)
  await page.waitForLoadState('networkidle')

  // Scroll to the tools section
  await smoothScroll(page, 1800, 12)
  await hold(page, 1000)

  // Click the Blood Pressure tab
  const bpTab = page.locator('button', { hasText: /blood pressure/i })
  if (await bpTab.count() > 0) {
    await bpTab.click()
    await hold(page, 600)
  }

  // Fill in the BP fields
  const sysInput = page.locator('input[placeholder*="120"], input[type="number"]').first()
  await sysInput.click()
  await sysInput.fill('142')
  await hold(page, 400)

  const diaInput = page.locator('input[placeholder*="80"], input[type="number"]').nth(1)
  await diaInput.click()
  await diaInput.fill('88')
  await hold(page, 400)

  // Click the check button
  const checkBtn = page.locator('button', { hasText: /check/i }).first()
  if (await checkBtn.count() > 0) {
    await checkBtn.click()
  }

  await hold(page, 3500)

  await ctx.close()
  console.log('  OK   Scene 2 written')
}

// ── SCENE 3: Signup + privacy controls ────────────────────────────────────────
// Shows two things: (1) the privacy-first signup form, (2) the settings toggles
// that let users control what the community sees about them.
async function scene03(browser) {
  console.log('  Recording Scene 3: Signup + Privacy...')
  const ctx = await newContext(browser, 'clip-03-signup-privacy')
  const page = await ctx.newPage()

  // Part A: signup page — pause on the privacy notice banner
  await page.goto(`${BASE}/signup`)
  await page.waitForLoadState('networkidle')
  await hold(page, 1000)

  // Scroll to make the privacy notice banner visible (it's near the top)
  await smoothScroll(page, 80, 3)
  await hold(page, 2500)  // hold so viewer can read "age not DOB"

  // Scroll down to show the age field (visually confirms what the narration says)
  await smoothScroll(page, 200, 4)
  await hold(page, 1500)

  // Part B: log in as Keisha to show the privacy settings page
  await page.goto(`${BASE}/login`)
  await page.waitForLoadState('networkidle')
  await page.fill('input[type="email"]', 'keisha.demo@hhh-demo.com')
  await page.fill('input[type="password"]', 'DemoPass2026!')
  await page.click('button[type="submit"]')
  await page.waitForURL('**/app/**', { timeout: 10000 })
  await hold(page, 800)

  // Navigate to settings
  await page.goto(`${BASE}/app/settings`)
  await page.waitForLoadState('networkidle')
  await hold(page, 1000)

  // Scroll to the Feed Privacy Settings section
  const privacySection = page.locator('text=Feed Privacy Settings')
  if (await privacySection.count() > 0) {
    await privacySection.scrollIntoViewIfNeeded()
    await hold(page, 400)
  } else {
    await smoothScroll(page, 1200, 10)
  }
  await hold(page, 3000)  // hold so viewer reads the three toggles

  await ctx.close()
  console.log('  OK   Scene 3 written')
}

// ── SCENE 4: Community feed ────────────────────────────────────────────────────
async function scene04(browser) {
  console.log('  Recording Scene 4: Community feed...')
  const ctx = await newContext(browser, 'clip-04-feed')
  const page = await ctx.newPage()

  await login(page, 'keisha.demo@hhh-demo.com', 'DemoPass2026!')
  await page.goto(`${BASE}/app/feed`)
  await page.waitForLoadState('networkidle')
  await hold(page, 1500)

  // Scroll through posts slowly
  await smoothScroll(page, 500, 8)
  await hold(page, 1000)
  await smoothScroll(page, 1000, 8)
  await hold(page, 1000)
  await smoothScroll(page, 1600, 8)
  await hold(page, 1500)

  // Scroll back up to Michelle's post (first wins post)
  await smoothScroll(page, 400, 6)
  await hold(page, 2000)

  await ctx.close()
  console.log('  OK   Scene 4 written')
}

// ── SCENE 5: ROOTS Protocol ────────────────────────────────────────────────────
async function scene05(browser) {
  console.log('  Recording Scene 5: ROOTS Protocol...')
  const ctx = await newContext(browser, 'clip-05-protocol')
  const page = await ctx.newPage()

  await login(page, 'keisha.demo@hhh-demo.com', 'DemoPass2026!')
  await page.goto(`${BASE}/app/protocol`)
  await page.waitForLoadState('networkidle')
  await hold(page, 1500)

  // Scroll through the pillars
  await smoothScroll(page, 600, 8)
  await hold(page, 1000)
  await smoothScroll(page, 1200, 8)
  await hold(page, 1000)

  // Try to expand/click one pillar section
  const pillarBtn = page.locator('[class*="pillar"], [class*="accordion"], details summary').first()
  if (await pillarBtn.count() > 0) {
    await pillarBtn.click()
    await hold(page, 1000)
  }

  await smoothScroll(page, 1800, 6)
  await hold(page, 1500)

  await ctx.close()
  console.log('  OK   Scene 5 written')
}

// ── SCENE 6: BP Tracker with seeded trend ────────────────────────────────────
async function scene06(browser) {
  console.log('  Recording Scene 6: BP Tracker...')
  const ctx = await newContext(browser, 'clip-06-tracker')
  const page = await ctx.newPage()

  await login(page, 'keisha.demo@hhh-demo.com', 'DemoPass2026!')
  await page.goto(`${BASE}/app/blood-pressure`)
  await page.waitForLoadState('networkidle')
  await hold(page, 2000)

  // Scroll to show the chart
  await smoothScroll(page, 300, 6)
  await hold(page, 2000)
  await smoothScroll(page, 600, 6)
  await hold(page, 2000)

  await ctx.close()
  console.log('  OK   Scene 6 written')
}

// ── SCENE 7: Leaderboard ──────────────────────────────────────────────────────
async function scene07(browser) {
  console.log('  Recording Scene 7: Leaderboard...')
  const ctx = await newContext(browser, 'clip-07-leaderboard')
  const page = await ctx.newPage()

  await login(page, 'keisha.demo@hhh-demo.com', 'DemoPass2026!')
  await page.goto(`${BASE}/app/leaderboard`)
  await page.waitForLoadState('networkidle')
  await hold(page, 1500)

  // Scroll through the leaderboard
  await smoothScroll(page, 400, 8)
  await hold(page, 1000)
  await smoothScroll(page, 800, 6)
  await hold(page, 1500)

  await ctx.close()
  console.log('  OK   Scene 7 written')
}

// ── SCENE 8: Educator dashboard ───────────────────────────────────────────────
async function scene08(browser) {
  console.log('  Recording Scene 8: Educator dashboard...')

  if (!EDUCATOR_PASS) {
    console.log('  SKIP Scene 8: EDUCATOR_PASSWORD not set in .env.local')
    console.log('         Add EDUCATOR_PASSWORD=<your-password> to .env.local and re-run')
    return
  }

  const ctx = await newContext(browser, 'clip-08-educator')
  const page = await ctx.newPage()

  await login(page, EDUCATOR_EMAIL, EDUCATOR_PASS)
  await page.goto(`${BASE}/app/educator`)
  await page.waitForLoadState('networkidle')
  await hold(page, 1500)

  // Scroll through client roster
  await smoothScroll(page, 400, 8)
  await hold(page, 1000)
  await smoothScroll(page, 800, 6)
  await hold(page, 2000)

  await ctx.close()
  console.log('  OK   Scene 8 written')
}

// ── SCENE 9: Outro — landing page pricing section ─────────────────────────────
async function scene09(browser) {
  console.log('  Recording Scene 9: Outro / pricing...')
  const ctx = await newContext(browser, 'clip-09-outro')
  const page = await ctx.newPage()

  await page.goto(BASE)
  await page.waitForLoadState('networkidle')
  await hold(page, 600)

  // Scroll to pricing section — try CSS classes first, then text content
  const byClass = page.locator('[class*="pricing"], [class*="plans"], #pricing')
  const byText  = page.getByText('Foundation', { exact: true }).first()

  if (await byClass.count() > 0) {
    await byClass.first().scrollIntoViewIfNeeded()
    await hold(page, 500)
  } else if (await byText.count() > 0) {
    await byText.scrollIntoViewIfNeeded()
    await hold(page, 500)
  } else {
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight * 0.65, behavior: 'smooth' }))
    await hold(page, 1000)
  }

  await hold(page, 4000)  // hold on pricing cards

  await ctx.close()
  console.log('  OK   Scene 9 written')
}

// ── main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log("Hunter's Holistic Health - Playwright Video Recording")
  console.log('=======================================================')
  console.log(`Target: ${BASE}`)
  console.log(`Output: ${CLIPS_DIR}/\n`)

  // Quick connectivity check
  try {
    const res = await fetch(BASE)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
  } catch (err) {
    console.error(`ERROR: Cannot reach ${BASE}`)
    console.error('Make sure the dev server is running: npm run dev')
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

  console.log('\n=======================================================')
  console.log('All clips recorded.')
  console.log(`Check ${CLIPS_DIR}/ for .webm files.`)
  console.log('Next: bash scripts/stitch-demo.sh')
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
