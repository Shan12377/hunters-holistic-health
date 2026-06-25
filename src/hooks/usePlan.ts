import { useAuthStore } from '@/store/authStore'
import type { Plan } from '@/types'

const PLAN_RANK: Record<Plan, number> = {
  foundation: 0,
  program: 1,
  vip: 2,
  overhaul: 3,
}

export function usePlan() {
  const profile = useAuthStore(s => s.profile)
  const plan: Plan = profile?.plan ?? 'foundation'
  const rank = PLAN_RANK[plan]

  return {
    plan,
    isAtLeast: (required: Plan) => rank >= PLAN_RANK[required],
    // Convenience flags
    canUnlimitedMealGuard: rank >= PLAN_RANK['program'],
    canWeeklyPulse:        rank >= PLAN_RANK['program'],
    canUnlimitedVitaPlate: rank >= PLAN_RANK['program'],
    canMessage:            rank >= PLAN_RANK['vip'],
    mealGuardDailyLimit:   rank >= PLAN_RANK['program'] ? Infinity : 5,
    vitaPlateDailyLimit:   rank >= PLAN_RANK['program'] ? Infinity : 3,
  }
}
