import { supabase } from './supabase'

export type PointEvent = 'daily_log' | 'streak_bonus' | 'challenge_checkin' | 'feed_post' | 'exercise_log'

export const LEVELS = [
  { level: 1,  min: 0,    label: 'Just Starting'   },
  { level: 2,  min: 100,  label: 'Building Habits'  },
  { level: 3,  min: 300,  label: 'Consistent'       },
  { level: 4,  min: 600,  label: 'Committed'        },
  { level: 5,  min: 1000, label: 'Dedicated'        },
  { level: 6,  min: 1500, label: 'Thriving'         },
  { level: 7,  min: 2200, label: 'Advanced'         },
  { level: 8,  min: 3000, label: 'Expert'           },
  { level: 9,  min: 4000, label: 'Champion'         },
  { level: 10, min: 5500, label: 'Legend'           },
]

export interface LevelInfo {
  level: number
  label: string
  totalPoints: number
  progress: number
  nextMin: number | null
  nextLevel: number | null
}

export function getLevelInfo(totalPoints: number): LevelInfo {
  let current = LEVELS[0]
  for (const l of LEVELS) {
    if (totalPoints >= l.min) current = l
    else break
  }
  const next = LEVELS.find(l => l.min > totalPoints)
  const progress = next
    ? Math.round(((totalPoints - current.min) / (next.min - current.min)) * 100)
    : 100
  return {
    level: current.level,
    label: current.label,
    totalPoints,
    progress,
    nextMin: next?.min ?? null,
    nextLevel: next?.level ?? null,
  }
}

// Returns true if points were newly awarded, false if already awarded or on error
export async function awardPoints(
  userId: string,
  eventType: PointEvent,
  points: number,
  refId: string
): Promise<boolean> {
  const { error } = await supabase
    .from('points_log')
    .insert({ user_id: userId, event_type: eventType, points, ref_id: refId })
  if (!error) return true
  // 23505 = unique violation: already awarded for this ref, expected and safe to ignore
  if (error.code !== '23505') console.warn('Points award failed:', error.message)
  return false
}

export async function getTotalPoints(userId: string): Promise<number> {
  const { data } = await supabase
    .from('points_log')
    .select('points')
    .eq('user_id', userId)
  return (data ?? []).reduce((sum: number, r: { points: number }) => sum + r.points, 0)
}
