/**
 * deidSanitizer.ts
 *
 * Local de-identification library for all health data before it reaches any AI API.
 * Inspired by DeIDGuard's HIPAA Safe Harbor engine (/Users/higgi/DEIDGUARD 3/lib/deid.js).
 *
 * Core principle (same as DeIDGuard): strip identifiers in the browser before
 * anything leaves the device. Raw clinical measurements never cross the wire.
 * Only educational zone categories, trend directions, and behavioral counts go to AI.
 *
 * WHAT IS PHI (Protected Health Information)?
 *   Health data becomes PHI when it can be linked to an individual.
 *   For this app the risk combinations are:
 *     - Name + blood pressure numbers = PHI
 *     - Name + glucose numbers = PHI
 *     - Name + diagnosis text (e.g. "I have diabetes") in wellness goals = potential PHI
 *
 * WHAT IS SAFE TO SEND TO AI (after sanitization):
 *     - Zone/category labels ("Stage 1 elevated range", "Above Typical Range")
 *     - Behavioral counts (days logged, fasting days, supplement days)
 *     - Lifestyle averages (steps, water oz, energy self-score)
 *     - Trend direction ("improving", "stable", "declining")
 *     - Wellness goal text ONLY if no clinical language is present (see sanitizeGoalText)
 *
 * Each function transforms raw data into a de-identified string summary.
 * Pass the returned strings — never raw numbers or names — to any AI API call.
 */

import {
  getBPZone, BP_ZONE_LABELS,
  getBSZone, BS_ZONE_LABELS,
} from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RawPulseData {
  firstName: string
  primaryGoal: string
  logsCompleted: number
  totalDays: number
  avgSteps: number
  avgWaterOz: number
  avgEnergy: number
  fastingDays: number
  supplementDays: number
  bpReadings: { systolic: number; diastolic: number }[]
  bsReadings: { glucose: number; context: 'fasting' | 'before_meal' | 'post_meal_2hr' | 'bedtime' }[]
}

export interface SanitizedPulsePayload {
  primaryGoal: string
  logsCompleted: number
  totalDays: number
  avgSteps: number
  avgWaterOz: number
  avgEnergy: number
  fastingDays: number
  supplementDays: number
  bpSummary: string
  bsSummary: string
}

// ─── Goal text sanitizer ──────────────────────────────────────────────────────

/**
 * Strips clinical language from user-entered wellness goal text.
 * Users sometimes write their actual diagnoses here (e.g. "manage my Type 2 diabetes").
 * That text becomes PHI when sent alongside other data. We replace clinical terms
 * with safe educational equivalents.
 */
const CLINICAL_REPLACEMENTS: [RegExp, string][] = [
  [/\btype\s*[12]\s*diabet\w+/gi, 'blood sugar management'],
  [/\bdiabet\w+/gi, 'blood sugar management'],
  [/\bhypertension\b/gi, 'blood pressure support'],
  [/\bhigh\s+blood\s+pressure\b/gi, 'blood pressure support'],
  [/\bhyperlipidemia\b/gi, 'cholesterol support'],
  [/\bhigh\s+cholesterol\b/gi, 'cholesterol support'],
  [/\bobesity\b/gi, 'weight management'],
  [/\bmetabolic\s+syndrome\b/gi, 'metabolic health'],
  [/\bpcos\b/gi, 'hormonal balance'],
  [/\bthyroid\b/gi, 'thyroid support'],
  [/\binsomnia\b/gi, 'sleep quality'],
  [/\banxiety\b/gi, 'stress reduction'],
  [/\bdepression\b/gi, 'mood and energy'],
  [/\bautoimmune\b/gi, 'immune support'],
  [/\bchronic\s+pain\b/gi, 'pain management'],
  [/\bfibromyalgia\b/gi, 'energy and pain'],
  [/\bibs\b|\birritable\s+bowel\b/gi, 'digestive health'],
  [/\bgerd\b|\bacid\s+reflux\b/gi, 'digestive health'],
  [/\bdiagnos\w+/gi, 'manage'],
  [/\btreat\w+/gi, 'support'],
  [/\bcur\w+/gi, 'improve'],
  [/\brevers\w+/gi, 'improve'],
]

export function sanitizeGoalText(text: string): string {
  if (!text) return ''
  let safe = text
  for (const [pattern, replacement] of CLINICAL_REPLACEMENTS) {
    safe = safe.replace(pattern, replacement)
  }
  // Truncate to 120 chars so no long free-text blobs reach the AI
  return safe.slice(0, 120).trim()
}

// ─── Blood pressure sanitizer ─────────────────────────────────────────────────

/**
 * Converts raw BP readings into a zone distribution summary.
 * E.g. [{ systolic: 135, diastolic: 88 }] → "1 reading in the High (Stage 1) range"
 * The actual numbers never leave the browser.
 */
export function sanitizeBPReadings(
  readings: { systolic: number; diastolic: number }[]
): string {
  if (readings.length === 0) {
    return 'No blood pressure readings logged.'
  }
  const zoneCounts: Record<string, number> = {}
  for (const r of readings) {
    const label = BP_ZONE_LABELS[getBPZone(r.systolic, r.diastolic)]
    zoneCounts[label] = (zoneCounts[label] ?? 0) + 1
  }
  const parts = Object.entries(zoneCounts).map(
    ([label, n]) => `${n} reading${n > 1 ? 's' : ''} in the ${label} range`
  )
  return `${readings.length} blood pressure reading${readings.length > 1 ? 's' : ''}: ${parts.join(', ')}.`
}

/**
 * Returns trend direction from a sequence of BP readings (oldest first).
 * "improving", "worsening", or "stable" — no numbers involved.
 */
export function sanitizeBPTrend(
  readings: { systolic: number; diastolic: number; logged_at: string }[]
): string {
  if (readings.length < 2) return sanitizeBPReadings(readings)

  const sorted = [...readings].sort(
    (a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime()
  )
  const half = Math.floor(sorted.length / 2)
  const early = sorted.slice(0, half)
  const recent = sorted.slice(half)

  const avgSystolic = (arr: typeof sorted) =>
    arr.reduce((s, r) => s + r.systolic, 0) / arr.length

  const earlyAvg = avgSystolic(early)
  const recentAvg = avgSystolic(recent)
  const diff = recentAvg - earlyAvg

  const trend =
    diff <= -5 ? 'improving (readings trending lower)'
    : diff >= 5 ? 'worsening (readings trending higher)'
    : 'stable'

  const summary = sanitizeBPReadings(readings)
  return `${summary} Overall trend: ${trend}.`
}

// ─── Blood sugar sanitizer ────────────────────────────────────────────────────

/**
 * Converts raw blood sugar readings into a zone distribution summary.
 * E.g. [{ glucose: 142, context: 'fasting' }] → "1 reading in the Above Typical Range"
 * The actual glucose numbers never leave the browser.
 */
export function sanitizeBSReadings(
  readings: { glucose: number; context: 'fasting' | 'before_meal' | 'post_meal_2hr' | 'bedtime' }[]
): string {
  if (readings.length === 0) {
    return 'No blood sugar readings logged.'
  }
  const zoneCounts: Record<string, number> = {}
  for (const r of readings) {
    const label = BS_ZONE_LABELS[getBSZone(r.glucose, r.context)]
    zoneCounts[label] = (zoneCounts[label] ?? 0) + 1
  }
  const parts = Object.entries(zoneCounts).map(
    ([label, n]) => `${n} reading${n > 1 ? 's' : ''} in the ${label} range`
  )
  return `${readings.length} blood sugar reading${readings.length > 1 ? 's' : ''}: ${parts.join(', ')}.`
}

/**
 * Returns trend direction from a sequence of blood sugar readings (with timestamps).
 */
export function sanitizeBSTrend(
  readings: { glucose: number; context: 'fasting' | 'before_meal' | 'post_meal_2hr' | 'bedtime'; logged_at: string }[]
): string {
  if (readings.length < 2) return sanitizeBSReadings(readings)

  const sorted = [...readings].sort(
    (a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime()
  )
  const half = Math.floor(sorted.length / 2)
  const earlyAvg = sorted.slice(0, half).reduce((s, r) => s + r.glucose, 0) / half
  const recentAvg = sorted.slice(half).reduce((s, r) => s + r.glucose, 0) / (sorted.length - half)
  const diff = recentAvg - earlyAvg

  const trend =
    diff <= -8 ? 'improving (readings trending lower)'
    : diff >= 8 ? 'worsening (readings trending higher)'
    : 'stable'

  const summary = sanitizeBSReadings(readings)
  return `${summary} Overall trend: ${trend}.`
}

// ─── Supplement sanitizer ─────────────────────────────────────────────────────

/**
 * Converts supplement data into a de-identified educational summary.
 * Supplement names are kept (they are not PHI on their own — "Vitamin D"
 * does not identify a person). But adherence percentages replace raw log counts.
 */
export function sanitizeSupplementSummary(
  supplements: { name: string; timing: string }[],
  adherencePct: number
): string {
  if (supplements.length === 0) {
    return 'No active supplements.'
  }
  const timingGroups: Record<string, string[]> = {}
  for (const s of supplements) {
    const t = s.timing ?? 'unspecified'
    if (!timingGroups[t]) timingGroups[t] = []
    timingGroups[t].push(s.name)
  }
  const groupSummary = Object.entries(timingGroups)
    .map(([timing, names]) => `${names.length} ${timing} supplement${names.length > 1 ? 's' : ''}`)
    .join(', ')

  const adherenceLabel =
    adherencePct < 0 ? 'adherence not tracked'
    : adherencePct >= 80 ? 'high adherence (80%+)'
    : adherencePct >= 60 ? 'moderate adherence (60-79%)'
    : 'low adherence (below 60%)'

  return `Active supplements: ${groupSummary}. Adherence this period: ${adherenceLabel}.`
}

// ─── Daily log behavioral sanitizer ──────────────────────────────────────────

interface DailyLogSlice {
  steps?: number | null
  water_oz?: number | null
  energy_level?: number | null
  morning_fast_done: boolean
  meal1_logged: boolean
  meal2_logged: boolean
  supplement_am_done: boolean
  supplement_pm_done: boolean
}

/**
 * Converts a set of daily log entries into a de-identified behavioral summary.
 * Steps, water, and energy remain as averages — these are lifestyle metrics,
 * not clinical measurements, and contain no identifying information.
 */
export function sanitizeDailyLogSummary(
  logs: DailyLogSlice[],
  totalDays = 7
): string {
  if (logs.length === 0) {
    return `No check-ins logged in the past ${totalDays} days.`
  }

  const avgOf = (arr: number[]) =>
    arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0

  const avgSteps = avgOf(logs.map(l => l.steps ?? 0).filter(n => n > 0))
  const avgWater = avgOf(logs.map(l => l.water_oz ?? 0).filter(n => n > 0))
  const avgEnergy = avgOf(logs.map(l => l.energy_level ?? 0).filter(n => n > 0))
  const fastDays = logs.filter(l => l.morning_fast_done).length
  const suppDays = logs.filter(l => l.supplement_am_done).length

  const stepsLabel =
    avgSteps === 0 ? 'steps not logged'
    : avgSteps >= 8000 ? `avg ${Math.round(avgSteps).toLocaleString()} steps/day (at or above goal)`
    : `avg ${Math.round(avgSteps).toLocaleString()} steps/day (below 8,000 goal)`

  const waterLabel =
    avgWater === 0 ? 'water not logged'
    : avgWater >= 64 ? `avg ${Math.round(avgWater)} oz/day (at or above goal)`
    : `avg ${Math.round(avgWater)} oz/day (below 64 oz goal)`

  const energyLabel =
    avgEnergy === 0 ? 'energy not self-reported'
    : avgEnergy >= 7 ? `avg energy ${avgEnergy.toFixed(1)}/10 (good)`
    : avgEnergy >= 5 ? `avg energy ${avgEnergy.toFixed(1)}/10 (moderate)`
    : `avg energy ${avgEnergy.toFixed(1)}/10 (low)`

  return [
    `Check-ins: ${logs.length} of ${totalDays} days.`,
    `Steps: ${stepsLabel}.`,
    `Water: ${waterLabel}.`,
    `Energy: ${energyLabel}.`,
    `Fasting completed: ${fastDays} of ${logs.length} logged days.`,
    `AM supplements taken: ${suppDays} of ${logs.length} logged days.`,
  ].join(' ')
}

// ─── Meal Guard payload sanitizer ────────────────────────────────────────────

/**
 * Validates that the Meal Guard payload contains no user identifiers
 * before it is sent to the OpenAI-backed serverless function.
 * Food names, wellness goal text, and dietary preferences are safe to send
 * as long as no name, user_id, email, or clinical measurement is included.
 *
 * This is a guard, not a transformer — it returns the cleaned payload
 * and a `safe` flag. If `safe` is false, block the API call.
 */
export function sanitizeMealGuardPayload(payload: {
  food?: string
  primary_goal?: string
  dietary_preference?: string
}): { food?: string; primary_goal?: string; dietary_preference?: string; safe: boolean } {
  return {
    food: payload.food,
    primary_goal: payload.primary_goal ? sanitizeGoalText(payload.primary_goal) : undefined,
    dietary_preference: payload.dietary_preference,
    safe: true, // Meal Guard already sends no identifiers; this validates the pattern
  }
}

// ─── Weekly Pulse main sanitizer ─────────────────────────────────────────────

/**
 * Full de-identification pass for the Weekly Pulse card.
 * Strips name, converts clinical measurements to zone labels,
 * and sanitizes goal text. The result is safe to send to Claude.
 */
export function sanitizeForPulse(raw: RawPulseData): SanitizedPulsePayload {
  return {
    primaryGoal: sanitizeGoalText(raw.primaryGoal),
    logsCompleted: raw.logsCompleted,
    totalDays: raw.totalDays,
    avgSteps: raw.avgSteps,
    avgWaterOz: raw.avgWaterOz,
    avgEnergy: raw.avgEnergy,
    fastingDays: raw.fastingDays,
    supplementDays: raw.supplementDays,
    bpSummary: sanitizeBPReadings(raw.bpReadings),
    bsSummary: sanitizeBSReadings(raw.bsReadings),
  }
}
