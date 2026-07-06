import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { getLevelInfo, LEVELS } from '@/lib/points'

export interface UserLevelInfo {
  points: number
  level: number
  label: string
  nextLevelMin: number | null
  progressPct: number
}

export function useUserLevel(): UserLevelInfo & { loading: boolean } {
  const { user } = useAuthStore()
  const [points, setPoints] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return
    supabase
      .from('points_log')
      .select('points')
      .eq('user_id', user.id)
      .then(({ data }) => {
        const total = (data ?? []).reduce((s: number, r: { points: number }) => s + r.points, 0)
        setPoints(total)
        setLoading(false)
      })
  }, [user?.id])

  const info = getLevelInfo(points)
  const currentDef = LEVELS.find(l => l.level === info.level)!
  const nextDef = LEVELS.find(l => l.level === info.level + 1) ?? null
  const progressPct = nextDef
    ? Math.min(100, Math.round(((points - currentDef.min) / (nextDef.min - currentDef.min)) * 100))
    : 100

  return {
    points,
    level: info.level,
    label: currentDef.label,
    nextLevelMin: nextDef?.min ?? null,
    progressPct,
    loading,
  }
}
