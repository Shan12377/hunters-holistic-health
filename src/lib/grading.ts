import type { DailyLog } from '@/types'

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

// Simple percentage-based grade — used on educator dashboard for at-a-glance client scoring
export function calcGrade(score: number): GradeResult {
  if (score === 0) return { grade: 'A', color: '#4be08a', message: 'Just getting started. Log the first day to protect this grade.' }
  if (score >= 90) return { grade: 'A+', color: '#4be08a', message: 'You are absolutely showing up. This is what consistency looks like.' }
  if (score >= 80) return { grade: 'A', color: '#4be08a', message: 'Solid week. You kept moving and that is what matters most.' }
  if (score >= 70) return { grade: 'B', color: '#c8a74b', message: 'Solid week. You kept moving and that is what matters most.' }
  if (score >= 60) return { grade: 'C', color: '#e0b84b', message: 'You showed up even when it was hard. That accountability is everything.' }
  if (score >= 40) return { grade: 'D', color: '#e08a4b', message: 'You checked in and that counts. Let us build on it this week.' }
  return { grade: 'F', color: '#e05c5c', message: 'Life happens. Today is a new day. Log in and let us go.' }
}

// Rubric-based grade — used on client weekly report card
export function calcGradeFromData(logs: DailyLog[], feedPostCount: number): GradeResult {
  const totalDays = 7
  const loggedDays = logs.length
  const movementMet = logs.filter(l => (l.steps ?? 0) >= 8000).length
  const movementMissed = totalDays - movementMet
  const mealsMissed = logs.filter(l => !l.meal1_logged).length
  const lateSlipsSubmitted = logs.filter(l => l.late_slip_reason != null && l.late_slip_reason !== '').length

  if (loggedDays === 0) {
    return { grade: 'A', color: '#4be08a', message: 'You made the decision. That is step one. Log your first day to protect this grade.' }
  }

  if (loggedDays === totalDays && feedPostCount >= 2) {
    return { grade: 'A+', color: '#4be08a', message: 'You are absolutely showing up. This is what consistency looks like.' }
  }

  if (movementMissed === 0 && mealsMissed <= 2) {
    return { grade: 'B', color: '#c8a74b', message: 'Solid week. You kept moving and that is what matters most.' }
  }

  if (movementMissed > 0 && lateSlipsSubmitted >= movementMissed) {
    return { grade: 'C', color: '#e0b84b', message: 'You showed up even when it was hard. That accountability is everything.' }
  }

  if (loggedDays < 3 && lateSlipsSubmitted > 0) {
    return { grade: 'D', color: '#e08a4b', message: 'You checked in and that counts. Let us build on it this week.' }
  }

  return { grade: 'F', color: '#e05c5c', message: 'Life happens. Today is a new day. Log in and let us go.' }
}

export function scoreWeek(logs: DailyLog[]): { score: number; breakdown: WeekBreakdown[] } {
  if (logs.length === 0) return { score: 0, breakdown: [] }

  const days = 7
  const fastDays = logs.filter(l => l.morning_fast_done).length
  const meal1Days = logs.filter(l => l.meal1_logged).length
  const suppAmDays = logs.filter(l => l.supplement_am_done).length
  const suppPmDays = logs.filter(l => l.supplement_pm_done).length
  const stepsDays = logs.filter(l => (l.steps ?? 0) >= 8000).length
  const waterDays = logs.filter(l => (l.water_oz ?? 0) >= 64).length
  const loggedDays = logs.length

  const breakdown: WeekBreakdown[] = [
    { label: 'Days Logged', score: loggedDays, max: days, pct: Math.round((loggedDays / days) * 100) },
    { label: 'Morning Fast', score: fastDays, max: days, pct: Math.round((fastDays / days) * 100) },
    { label: 'Meal 1 Logged', score: meal1Days, max: days, pct: Math.round((meal1Days / days) * 100) },
    { label: 'AM Supplements', score: suppAmDays, max: days, pct: Math.round((suppAmDays / days) * 100) },
    { label: 'PM Supplements', score: suppPmDays, max: days, pct: Math.round((suppPmDays / days) * 100) },
    { label: '8,000+ Steps', score: stepsDays, max: days, pct: Math.round((stepsDays / days) * 100) },
    { label: '64oz Water', score: waterDays, max: days, pct: Math.round((waterDays / days) * 100) },
  ]

  const score = Math.round(breakdown.reduce((a, b) => a + b.pct, 0) / breakdown.length)
  return { score, breakdown }
}

export function scoreWeekProjected(logs: DailyLog[], daysElapsed: number): number {
  if (logs.length === 0 || daysElapsed <= 0) return 0
  const d = daysElapsed
  const fastDays = logs.filter(l => l.morning_fast_done).length
  const meal1Days = logs.filter(l => l.meal1_logged).length
  const suppAmDays = logs.filter(l => l.supplement_am_done).length
  const suppPmDays = logs.filter(l => l.supplement_pm_done).length
  const stepsDays = logs.filter(l => (l.steps ?? 0) >= 8000).length
  const waterDays = logs.filter(l => (l.water_oz ?? 0) >= 64).length
  const loggedDays = logs.length

  const pcts = [
    Math.round((loggedDays / d) * 100),
    Math.round((fastDays / d) * 100),
    Math.round((meal1Days / d) * 100),
    Math.round((suppAmDays / d) * 100),
    Math.round((suppPmDays / d) * 100),
    Math.round((stepsDays / d) * 100),
    Math.round((waterDays / d) * 100),
  ]

  return Math.min(100, Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length))
}
