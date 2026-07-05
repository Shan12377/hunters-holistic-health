import { useEffect, useState } from 'react'
import { Trophy, Heart, CheckCircle, Zap, Activity, Flame, Star } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { subDays, format } from 'date-fns'
import styles from './Client.module.css'

interface RankEntry {
  user_id: string
  name: string
  initials: string
  score: number
}

type TimeWindow = '7d' | '30d' | 'all'

const MEDAL = ['🥇', '🥈', '🥉']

const WINDOWS: { id: TimeWindow; label: string }[] = [
  { id: '7d',  label: '7 Days'   },
  { id: '30d', label: '30 Days'  },
  { id: 'all', label: 'All Time' },
]

const WINDOW_LABELS: Record<TimeWindow, string> = {
  '7d':  '7-day',
  '30d': '30-day',
  'all': 'All-time',
}

const COMMUNITY_RULES = [
  { icon: Heart,        color: '#e05c5c', label: 'Each like your post receives', pts: 1  },
]

const HABIT_RULES = [
  { icon: Zap,          color: '#c8a74b', label: 'Streak bonus (7+ days)',    pts: 20 },
  { icon: CheckCircle,  color: '#4be08a', label: 'Daily log completed',       pts: 10 },
  { icon: CheckCircle,  color: '#4be08a', label: 'Challenge check-in',        pts: 5  },
  { icon: Activity,     color: '#4b9ee0', label: 'Exercise logged',           pts: 5  },
  { icon: Flame,        color: '#e08a4b', label: 'Win or milestone post',     pts: 4  },
  { icon: Star,         color: '#91a0ac', label: 'General post',              pts: 2  },
]

export default function LeaderboardPage() {
  const { user } = useAuthStore()
  const [rankings, setRankings]       = useState<RankEntry[]>([])
  const [loading, setLoading]         = useState(true)
  const [myRank, setMyRank]           = useState<number | null>(null)
  const [activeWindow, setActiveWindow] = useState<TimeWindow>('30d')

  useEffect(() => { fetchRankings(activeWindow) }, [activeWindow])

  const fetchRankings = async (window: TimeWindow) => {
    setLoading(true)
    setRankings([])

    // Community points = likes received on your posts, windowed by time
    let likesQuery = supabase
      .from('feed_likes')
      .select('post_id, created_at')

    if (window !== 'all') {
      const days = window === '7d' ? 7 : 30
      const since = format(subDays(new Date(), days), "yyyy-MM-dd'T'HH:mm:ss")
      likesQuery = likesQuery.gte('created_at', since)
    }

    const { data: likes } = await likesQuery
    if (!likes || likes.length === 0) { setLoading(false); return }

    // Resolve post authors (need to know who received the like)
    const postIds = [...new Set(likes.map(l => l.post_id))]
    const { data: postRows } = await supabase
      .from('feed_posts')
      .select('id, user_id')
      .in('id', postIds)

    if (!postRows || postRows.length === 0) { setLoading(false); return }

    const postAuthorMap = new Map(postRows.map((p: { id: string; user_id: string }) => [p.id, p.user_id]))

    // Count likes received per author
    const likeMap = new Map<string, number>()
    for (const like of likes) {
      const authorId = postAuthorMap.get(like.post_id)
      if (authorId) likeMap.set(authorId, (likeMap.get(authorId) ?? 0) + 1)
    }

    if (likeMap.size === 0) { setLoading(false); return }

    const userIds = [...likeMap.keys()]
    const { data: profs } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, display_handle')
      .in('id', userIds)

    const profMap = new Map((profs ?? []).map((p: { id: string; first_name: string; last_name: string; display_handle: string | null }) => [p.id, p]))

    const entries: RankEntry[] = userIds
      .map(uid => {
        const p = profMap.get(uid)
        return {
          user_id: uid,
          name: p?.display_handle
            ? `@${p.display_handle}`
            : `${p?.first_name ?? '?'} ${p?.last_name?.[0] ?? ''}.`,
          initials: `${p?.first_name?.[0] ?? ''}${p?.last_name?.[0] ?? ''}`.toUpperCase(),
          score: likeMap.get(uid)!,
        }
      })
      .filter(e => e.initials.trim() !== '')
      .sort((a, b) => b.score - a.score)

    setRankings(entries)
    const idx = entries.findIndex(e => e.user_id === user?.id)
    setMyRank(idx >= 0 ? idx + 1 : null)
    setLoading(false)
  }

  const myEntry = rankings.find(e => e.user_id === user?.id)

  return (
    <div className={styles.lbPage}>

      <div className={styles.lbHeader}>
        <div className={styles.lbHeaderLeft}>
          <h1 className={styles.lbTitle}>
            <Trophy size={24} color="var(--gold)" /> Leaderboard
          </h1>
          <p className={styles.lbSub}>
            {WINDOW_LABELS[activeWindow]} community ranking by likes received
          </p>
        </div>
        {myRank && myEntry && (
          <div className={styles.lbMyRankPill}>
            <span className={styles.lbMyRankNum}>#{myRank}</span>
            <span className={styles.lbMyRankLabel}>Your rank</span>
            <span className={styles.lbMyScore}>{myEntry.score} ❤️</span>
          </div>
        )}
      </div>

      {/* Time window tabs */}
      <div className={styles.lbWindowTabs}>
        {WINDOWS.map(w => (
          <button
            key={w.id}
            className={activeWindow === w.id ? styles.lbWindowTabActive : styles.lbWindowTab}
            onClick={() => setActiveWindow(w.id)}
          >
            {w.label}
          </button>
        ))}
      </div>

      {/* Top 3 podium */}
      {!loading && rankings.length >= 3 && (
        <div className={styles.lbPodium}>
          <div className={styles.lbPodiumSpot}>
            <div className={styles.lbPodiumMedal}>🥈</div>
            <div className={`${styles.lbPodiumAvatar} ${styles.lbPodiumAvatarSilver}`}>
              {rankings[1].initials}
            </div>
            <div className={styles.lbPodiumName}>{rankings[1].name}</div>
            <div className={styles.lbPodiumScore}>{rankings[1].score} ❤️</div>
            <div className={styles.lbPodiumBar} style={{ height: 60, background: 'rgba(145,160,172,0.2)' }} />
          </div>
          <div className={`${styles.lbPodiumSpot} ${styles.lbPodiumFirst}`}>
            <div className={styles.lbPodiumMedal}>🥇</div>
            <div className={`${styles.lbPodiumAvatar} ${styles.lbPodiumAvatarGold}`}>
              {rankings[0].initials}
            </div>
            <div className={styles.lbPodiumName}>{rankings[0].name}</div>
            <div className={styles.lbPodiumScore}>{rankings[0].score} ❤️</div>
            <div className={styles.lbPodiumBar} style={{ height: 90, background: 'rgba(200,167,75,0.2)' }} />
          </div>
          <div className={styles.lbPodiumSpot}>
            <div className={styles.lbPodiumMedal}>🥉</div>
            <div className={`${styles.lbPodiumAvatar} ${styles.lbPodiumAvatarBronze}`}>
              {rankings[2].initials}
            </div>
            <div className={styles.lbPodiumName}>{rankings[2].name}</div>
            <div className={styles.lbPodiumScore}>{rankings[2].score} ❤️</div>
            <div className={styles.lbPodiumBar} style={{ height: 44, background: 'rgba(180,120,60,0.2)' }} />
          </div>
        </div>
      )}

      {/* Full rankings list */}
      <div className={styles.lbCard}>
        <h3 className={styles.lbCardTitle}>Full Rankings</h3>
        {loading ? (
          <p className={styles.lbEmpty}>Calculating rankings...</p>
        ) : rankings.length === 0 ? (
          <div className={styles.lbEmptyState}>
            <Trophy size={40} color="var(--border)" />
            <p>No likes received yet in this window. Post in the community and get some love to climb the board!</p>
          </div>
        ) : (
          <div className={styles.lbList}>
            {rankings.map((entry, i) => {
              const isMe = entry.user_id === user?.id
              const isTop3 = i < 3
              return (
                <div key={entry.user_id} className={`${styles.lbRow} ${isMe ? styles.lbRowMe : ''}`}>
                  <div className={styles.lbRank}>
                    {isTop3
                      ? <span className={styles.lbMedal}>{MEDAL[i]}</span>
                      : <span className={styles.lbRankNum}>#{i + 1}</span>
                    }
                  </div>
                  <div className={`${styles.lbAvatar} ${isMe ? styles.lbAvatarMe : ''}`}>
                    {entry.initials}
                  </div>
                  <div className={styles.lbRowBody}>
                    <div className={styles.lbRowName}>
                      {entry.name}
                      {isMe && <span className={styles.lbYouBadge}>You</span>}
                    </div>
                    <div className={styles.lbRowMeta}>
                      {entry.score} {entry.score === 1 ? 'like' : 'likes'} received
                    </div>
                  </div>
                  <div className={styles.lbRowScore} style={{ color: isTop3 ? 'var(--gold)' : 'var(--text-secondary)' }}>
                    {entry.score} ❤️
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* How points work */}
      <div className={styles.lbCard}>
        <h3 className={styles.lbCardTitle}>Community Ranking</h3>
        <p className={styles.lbRuleNote} style={{ marginBottom: '0.75rem' }}>
          The leaderboard ranks by likes received on your posts. Every heart someone gives you is a community point.
        </p>
        {COMMUNITY_RULES.map(({ icon: Icon, color, label, pts }) => (
          <div key={label} className={styles.lbRuleRow}>
            <Icon size={16} color={color} />
            <span className={styles.lbRuleLabel}>{label}</span>
            <span className={styles.lbRulePts} style={{ color }}>+{pts} pt</span>
          </div>
        ))}
      </div>

      <div className={styles.lbCard}>
        <h3 className={styles.lbCardTitle}>Personal Habit Points</h3>
        <p className={styles.lbRuleNote} style={{ marginBottom: '0.75rem' }}>
          Habit points are tracked separately for your Weekly Report Card and level badge.
        </p>
        <div className={styles.lbRules}>
          {HABIT_RULES.map(({ icon: Icon, color, label, pts }) => (
            <div key={label} className={styles.lbRuleRow}>
              <Icon size={16} color={color} />
              <span className={styles.lbRuleLabel}>{label}</span>
              <span className={styles.lbRulePts} style={{ color }}>+{pts} pts</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
