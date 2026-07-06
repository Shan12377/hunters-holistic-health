import { useAuthStore } from '@/store/authStore'
import type { Plan } from '@/types'

const PLAN_RANK: Record<Plan, number> = {
  free:       -1,
  foundation: 0,
  program:    1,
  vip:        2,
  overhaul:   3,
}

export function usePlan() {
  const profile = useAuthStore(s => s.profile)
  const loading = useAuthStore(s => s.loading)
  // During auth loading, optimistically show foundation to avoid flash.
  // After loading completes, if profile is still null (auth failure), fail closed to free.
  const plan: Plan = profile?.plan ?? (loading ? 'foundation' : 'free')
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
