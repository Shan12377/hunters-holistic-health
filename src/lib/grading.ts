import type { DailyLog } from '@/types'
import { STEPS_GOAL, WATER_GOAL_OZ } from '@/lib/goals'

export interface GradeResult {
  grade: string
  color: string
  message: string
}

export interface WeekBreakdown {
  label: string
  score: number
  max: number
  pct: number
}

// Simple percentage-based grade, used on educator dashboard for at-a-glance client scoring
export function calcGrade(score: number): GradeResult {
  if (score === 0) return { grade: 'A', color: '#4be08a', message: 'Just getting started. Log the first day to protect this grade.' }
  if (score >= 90) return { grade: 'A+', color: '#4be08a', message: 'You are absolutely showing up. This is what consistency looks like.' }
  if (score >= 80) return { grade: 'A', color: '#4be08a', message: 'Solid week. You kept moving and that is what matters most.' }
  if (score >= 70) return { grade: 'B', color: '#c8a74b', message: 'Solid week. You kept moving and that is what matters most.' }
  if (score >= 60) return { grade: 'C', color: '#e0b84b', message: 'You showed up even when it was hard. That accountability is everything.' }
  if (score >= 40) return { grade: 'D', color: '#e08a4b', message: 'You checked in and that counts. Let us build on it this week.' }
  return { grade: 'F', color: '#e05c5c', message: 'Life happens. Today is a new day. Log in and let us go.' }
}

// Names the single weakest category in a week's breakdown, in plain language,
// so a grade is never just a mystery letter. This is what the client card and
// the coach dashboard both show alongside the grade (Dr. Hunter, 2026-08-20:
// "I need people to have clarity with everything... let them know exactly
// what it is"). One category dragging a grade down should be visible, not
// buried in an average.
export function explainGrade(breakdown: WeekBreakdown[]): string {
  if (breakdown.length === 0) return ''
  const weakest = breakdown.reduce((a, b) => (b.pct < a.pct ? b : a))
  if (weakest.pct >= 90) return 'Every category is strong this week. Keep this up.'
  return `${weakest.label} is the biggest gap this week: ${weakest.score} of ${weakest.max} days.`
}

// Posting twice in a week earns full credit for this category. Same threshold
// the old A+ bonus used, now a normal weighted category instead of a special
// override, so it can't disagree with the rest of the grade the way the old
// rubric did (Dr. Hunter, 2026-08-20).
const COMMUNITY_POST_GOAL = 2

export function scoreWeek(logs: DailyLog[], feedPostCount = 0): { score: number; breakdown: WeekBreakdown[] } {
  if (logs.length === 0) return { score: 0, breakdown: [] }

  const days = 7
  // Full fasting days are pulled out of the meal and supplement denominators
  // (Dr. Hunter, 2026-08-17): a real fast is compliant behavior, not three
  // missed checkboxes. Movement and water still apply on a fast day.
  const fullFastDays = logs.filter(l => l.full_fast_day).length
  const mealEligibleDays = Math.max(1, days - fullFastDays)
  const fastDays = logs.filter(l => l.morning_fast_done).length
  const meal1Days = logs.filter(l => l.meal1_logged).length
  const suppAmDays = logs.filter(l => l.supplement_am_done).length
  const suppPmDays = logs.filter(l => l.supplement_pm_done).length
  const stepsDays = logs.filter(l => (l.steps ?? 0) >= STEPS_GOAL).length
  const waterDays = logs.filter(l => (l.water_oz ?? 0) >= WATER_GOAL_OZ).length
  const loggedDays = logs.length

  const breakdown: WeekBreakdown[] = [
    { label: 'Days Logged', score: loggedDays, max: days, pct: Math.round((loggedDays / days) * 100) },
    { label: 'Morning Fast', score: fastDays, max: days, pct: Math.round((fastDays / days) * 100) },
    { label: 'Meal 1 Logged', score: meal1Days, max: mealEligibleDays, pct: Math.min(100, Math.round((meal1Days / mealEligibleDays) * 100)) },
    { label: 'AM Supplements', score: suppAmDays, max: mealEligibleDays, pct: Math.min(100, Math.round((suppAmDays / mealEligibleDays) * 100)) },
    { label: 'PM Supplements', score: suppPmDays, max: mealEligibleDays, pct: Math.min(100, Math.round((suppPmDays / mealEligibleDays) * 100)) },
    { label: `${STEPS_GOAL.toLocaleString()}+ Steps`, score: stepsDays, max: days, pct: Math.round((stepsDays / days) * 100) },
    { label: `${WATER_GOAL_OZ}oz Water`, score: waterDays, max: days, pct: Math.round((waterDays / days) * 100) },
    { label: 'Community Engagement', score: Math.min(feedPostCount, COMMUNITY_POST_GOAL), max: COMMUNITY_POST_GOAL, pct: Math.min(100, Math.round((Math.min(feedPostCount, COMMUNITY_POST_GOAL) / COMMUNITY_POST_GOAL) * 100)) },
  ]

  const score = Math.round(breakdown.reduce((a, b) => a + b.pct, 0) / breakdown.length)
  return { score, breakdown }
}

export function scoreWeekProjected(logs: DailyLog[], daysElapsed: number, feedPostCount = 0): number {
  if (logs.length === 0 || daysElapsed <= 0) return 0
  const d = daysElapsed
  const fullFastDays = logs.filter(l => l.full_fast_day).length
  const mealEligibleDays = Math.max(1, d - fullFastDays)
  const fastDays = logs.filter(l => l.morning_fast_done).length
  const meal1Days = logs.filter(l => l.meal1_logged).length
  const suppAmDays = logs.filter(l => l.supplement_am_done).length
  const suppPmDays = logs.filter(l => l.supplement_pm_done).length
  const stepsDays = logs.filter(l => (l.steps ?? 0) >= STEPS_GOAL).length
  const waterDays = logs.filter(l => (l.water_oz ?? 0) >= WATER_GOAL_OZ).length
  const loggedDays = logs.length

  const pcts = [
    Math.round((loggedDays / d) * 100),
    Math.round((fastDays / d) * 100),
    Math.min(100, Math.round((meal1Days / mealEligibleDays) * 100)),
    Math.min(100, Math.round((suppAmDays / mealEligibleDays) * 100)),
    Math.min(100, Math.round((suppPmDays / mealEligibleDays) * 100)),
    Math.round((stepsDays / d) * 100),
    Math.round((waterDays / d) * 100),
    Math.min(100, Math.round((Math.min(feedPostCount, COMMUNITY_POST_GOAL) / COMMUNITY_POST_GOAL) * 100)),
  ]

  return Math.min(100, Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length))
}
