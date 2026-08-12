import { supabase } from './supabase'

export type PointEvent = 'daily_log' | 'streak_bonus' | 'challenge_checkin' | 'feed_post' | 'exercise_log'

export const LEVELS = [
  { level: 1,  min: 0,     label: 'Just Starting'   },
  { level: 2,  min: 5,     label: 'Building Habits' },
  { level: 3,  min: 30,    label: 'Consistent'      },
  { level: 4,  min: 100,   label: 'Committed'       },
  { level: 5,  min: 250,   label: 'Dedicated'       },
  { level: 6,  min: 600,   label: 'Thriving'        },
  { level: 7,  min: 1200,  label: 'Advanced'        },
  { level: 8,  min: 2500,  label: 'Expert'          },
  { level: 9,  min: 5000,  label: 'Champion'        },
  { level: 10, min: 10000, label: 'Legend'          },
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

// Returns true if points were newly awarded, false if already awarded or on error.
// Points are awarded server-side via /api/award-points, the server verifies the
// event is real and derives the user id from the JWT, ignoring the passed userId.
export async function awardPoints(
  _userId: string,
  eventType: PointEvent,
  points: number,
  refId: string
): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) return false
  try {
    const res = await fetch('/api/award-points', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ eventType, points, refId }),
    })
    const json = await res.json()
    return json.awarded === true
  } catch {
    return false
  }
}

export async function getTotalPoints(userId: string): Promise<number> {
  const { data } = await supabase
    .from('points_log')
    .select('points')
    .eq('user_id', userId)
  return (data ?? []).reduce((sum: number, r: { points: number }) => sum + r.points, 0)
}
