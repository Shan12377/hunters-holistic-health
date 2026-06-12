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

export function calcGrade(score: number): GradeResult {
  if (score >= 90) return { grade: 'A+', color: '#4be08a', message: 'Outstanding! You are crushing your wellness goals.' }
  if (score >= 80) return { grade: 'A', color: '#4be08a', message: 'Excellent work! Consistency is your superpower.' }
  if (score >= 70) return { grade: 'B', color: '#c8a74b', message: 'Great effort! A few more consistent days will get you to an A.' }
  if (score >= 60) return { grade: 'C', color: '#e0b84b', message: 'Good start. Focus on one habit at a time to build momentum.' }
  if (score >= 50) return { grade: 'D', color: '#e08a4b', message: 'Keep going. Progress is not always linear; reflect and reset.' }
  return { grade: 'F', color: '#e05c5c', message: "This week was tough. Tomorrow is a fresh start. You've got this." }
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

// Projects the full-week score based on pace so far.
// daysElapsed: how many days of the current week have passed (1-7).
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
