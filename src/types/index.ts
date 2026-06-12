export interface BPReading {
  id: string
  user_id: string
  systolic: number
  diastolic: number
  pulse: number | null
  notes: string | null
  logged_at: string
}

export interface DailyLog {
  id: string
  user_id: string
  log_date: string
  steps: number | null
  energy_level: number | null
  water_oz: number | null
  morning_fast_done: boolean
  meal1_logged: boolean
  meal2_logged: boolean
  snack_logged: boolean
  supplement_am_done: boolean
  supplement_pm_done: boolean
  late_slip_reason: string | null
}

export interface MealLog {
  id: string
  user_id: string
  food_name: string
  meal_type: 'morning_fast' | 'meal1' | 'meal2' | 'snack'
  calories: number | null
  ai_flag: boolean
  ai_warning: string | null
  ai_alternatives: string[] | null
  logged_at: string
}

export interface Profile {
  id: string
  first_name: string
  last_name: string
  age: number | null
  role: 'client' | 'educator'
  display_handle: string | null
}

export type BPZone = 'normal' | 'elevated' | 'high1' | 'high2' | 'crisis'

export function getBPZone(systolic: number, diastolic: number): BPZone {
  if (systolic >= 180 || diastolic >= 120) return 'crisis'
  if (systolic >= 140 || diastolic >= 90) return 'high2'
  if (systolic >= 130 || diastolic >= 80) return 'high1'
  if (systolic >= 120 && diastolic < 80) return 'elevated'
  return 'normal'
}

export const BP_ZONE_LABELS: Record<BPZone, string> = {
  normal: 'Normal',
  elevated: 'Elevated',
  high1: 'High (Stage 1)',
  high2: 'High (Stage 2)',
  crisis: 'Hypertensive Crisis: Contact Provider',
}

export const BP_ZONE_COLORS: Record<BPZone, string> = {
  normal: '#4be08a',
  elevated: '#e0b84b',
  high1: '#e08a4b',
  high2: '#e05c5c',
  crisis: '#c0392b',
}

export interface BSReading {
  id: string
  user_id: string
  glucose_mg_dl: number
  reading_context: 'fasting' | 'before_meal' | 'post_meal_2hr' | 'bedtime'
  notes: string | null
  logged_at: string
}

export type BSZone = 'low' | 'normal' | 'above_typical' | 'elevated'

export function getBSZone(
  glucose: number,
  context: 'fasting' | 'before_meal' | 'post_meal_2hr' | 'bedtime'
): BSZone {
  if (context === 'post_meal_2hr') {
    if (glucose >= 200) return 'elevated'
    if (glucose >= 140) return 'above_typical'
    return 'normal'
  }
  // fasting, before_meal, bedtime
  if (glucose < 70) return 'low'
  if (glucose <= 99) return 'normal'
  if (glucose <= 125) return 'above_typical'
  return 'elevated'
}

export const BS_ZONE_LABELS: Record<BSZone, string> = {
  low: 'Low (Below Typical Range)',
  normal: 'In Typical Range',
  above_typical: 'Above Typical Range',
  elevated: 'Elevated: Discuss With Provider',
}

export const BS_ZONE_COLORS: Record<BSZone, string> = {
  low: '#e08a4b',
  normal: '#4be08a',
  above_typical: '#e0b84b',
  elevated: '#e05c5c',
}
