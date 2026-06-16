import { useEffect, useState } from 'react'
import { X, Flame, Trophy, CalendarDays } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { format, subDays, differenceInDays, parseISO } from 'date-fns'
import { getTotalPoints, getLevelInfo } from '@/lib/points'
import styles from '@/pages/client/Client.module.css'

interface MemberProfile {
  first_name: string
  last_name: string
  display_handle: string | null
  created_at: string
}

interface Props {
  userId: string
  onClose: () => void
}

function calcStreak(logDates: string[]): number {
  if (!logDates.length) return 0
  const today = format(new Date(), 'yyyy-MM-dd')
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')
  if (logDates[0] !== today && logDates[0] !== yesterday) return 0
  let streak = 1
  for (let i = 1; i < logDates.length; i++) {
    const diff = differenceInDays(parseISO(logDates[i - 1]), parseISO(logDates[i]))
    if (diff === 1) streak++
    else break
  }
  return streak
}

export default function MemberCard({ userId, onClose }: Props) {
  const [profile, setProfile] = useState<MemberProfile | null>(null)
  const [totalPoints, setTotalPoints] = useState(0)
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMember = async () => {
      const [profileRes, pts, logsRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('first_name, last_name, display_handle, created_at')
          .eq('id', userId)
          .single(),
        getTotalPoints(userId),
        supabase
          .from('points_log')
          .select('ref_id')
          .eq('user_id', userId)
          .eq('event_type', 'daily_log')
          .order('ref_id', { ascending: false })
          .limit(60),
      ])
      if (profileRes.data) setProfile(profileRes.data as MemberProfile)
      setTotalPoints(pts)
      const logDates = (logsRes.data ?? []).map(r => r.ref_id as string)
      setStreak(calcStreak(logDates))
      setLoading(false)
    }
    fetchMember()
  }, [userId])

  const levelInfo = getLevelInfo(totalPoints)
  const displayName = profile?.display_handle
    ? `@${profile.display_handle}`
    : `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`
  const initials = `${profile?.first_name?.[0] ?? ''}${profile?.last_name?.[0] ?? ''}`.toUpperCase()
  const memberSince = profile?.created_at ? format(parseISO(profile.created_at), 'MMMM yyyy') : ''

  return (
    <div className={styles.memberCardOverlay} onClick={onClose}>
      <div className={styles.memberCard} onClick={e => e.stopPropagation()}>
        <button className={styles.memberCardClose} onClick={onClose} aria-label="Close">
          <X size={16} />
        </button>

        {loading ? (
          <div className={styles.memberCardLoading}>Loading...</div>
        ) : (
          <>
            <div className={styles.memberCardTop}>
              <div className={styles.memberCardAvatar}>{initials}</div>
              <div>
                <div className={styles.memberCardName}>{displayName}</div>
                {memberSince && (
                  <div className={styles.memberCardSince}>
                    <CalendarDays size={11} />
                    Member since {memberSince}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.memberCardLevel}>
              <div className={styles.levelBadge}>LVL {levelInfo.level}</div>
              <div className={styles.memberCardLevelMeta}>
                <div className={styles.levelLabel}>{levelInfo.label}</div>
                <div className={styles.levelPts}>{totalPoints.toLocaleString()} pts</div>
              </div>
            </div>

            <div className={styles.levelBarRow}>
              <div className={styles.levelBarTrack}>
                <div className={styles.levelBarFill} style={{ width: `${levelInfo.progress}%` }} />
              </div>
              {levelInfo.nextMin && (
                <div className={styles.levelBarHint}>
                  {(levelInfo.nextMin - totalPoints).toLocaleString()} to LVL {levelInfo.nextLevel}
                </div>
              )}
            </div>

            <div className={styles.memberCardStats}>
              <div className={styles.memberCardStat}>
                <Flame size={14} color="#e08a4b" />
                <span className={styles.memberCardStatVal}>{streak}</span>
                <span className={styles.memberCardStatLabel}>day streak</span>
              </div>
              <div className={styles.memberCardStatDivider} />
              <div className={styles.memberCardStat}>
                <Trophy size={14} color="var(--gold)" />
                <span className={styles.memberCardStatVal}>{totalPoints.toLocaleString()}</span>
                <span className={styles.memberCardStatLabel}>total points</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
