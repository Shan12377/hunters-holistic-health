import { useEffect, useState } from 'react'
import { Trophy, Flame, CheckCircle, Award, MessageCircle, Heart, Star } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { subDays, format } from 'date-fns'
import styles from './Client.module.css'

interface RankEntry {
  user_id: string
  name: string
  initials: string
  posts: number
  likes: number
  score: number
  topPostType: string | null
}

const POST_PTS: Record<string, number> = {
  check_in: 5,
  win: 4,
  milestone: 4,
  late_slip: 3,
  general: 2,
}

const MEDAL = ['🥇', '🥈', '🥉']

const SCORE_RULES = [
  { icon: CheckCircle, color: '#4be08a', label: 'Check-in post', pts: 5 },
  { icon: Flame, color: '#e08a4b', label: 'Win post', pts: 4 },
  { icon: Award, color: '#c8a74b', label: 'Milestone post', pts: 4 },
  { icon: MessageCircle, color: '#e0b84b', label: 'Late Slip (accountability)', pts: 3 },
  { icon: Star, color: '#91a0ac', label: 'General post', pts: 2 },
  { icon: Heart, color: '#e05c5c', label: 'Each like received', pts: 1 },
]

export default function LeaderboardPage() {
  const { user } = useAuthStore()
  const [rankings, setRankings] = useState<RankEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [myRank, setMyRank] = useState<number | null>(null)

  useEffect(() => { fetchRankings() }, [])

  const fetchRankings = async () => {
    const since = format(subDays(new Date(), 30), 'yyyy-MM-dd') + 'T00:00:00'
    const { data } = await supabase
      .from('feed_posts')
      .select('user_id, post_type, likes, profiles(first_name, last_name, display_handle)')
      .gte('created_at', since)

    if (!data) { setLoading(false); return }

    const map = new Map<string, RankEntry>()

    for (const post of data) {
      const uid = post.user_id
      const p = post.profiles as unknown as { first_name: string; last_name: string; display_handle: string | null }
      if (!p) continue

      if (!map.has(uid)) {
        map.set(uid, {
          user_id: uid,
          name: p.display_handle ? `@${p.display_handle}` : `${p.first_name} ${p.last_name?.[0] ?? ''}.`,
          initials: `${p.first_name?.[0] ?? ''}${p.last_name?.[0] ?? ''}`.toUpperCase(),
          posts: 0,
          likes: 0,
          score: 0,
          topPostType: null,
        })
      }

      const entry = map.get(uid)!
      entry.posts++
      entry.likes += post.likes ?? 0
      entry.score += (POST_PTS[post.post_type] ?? 2) + (post.likes ?? 0)
      if (!entry.topPostType || (POST_PTS[post.post_type] ?? 2) > (POST_PTS[entry.topPostType] ?? 2)) {
        entry.topPostType = post.post_type
      }
    }

    const sorted = [...map.values()].sort((a, b) => b.score - a.score)
    setRankings(sorted)

    const idx = sorted.findIndex(e => e.user_id === user?.id)
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
          <p className={styles.lbSub}>30-day community engagement ranking</p>
        </div>
        {myRank && myEntry && (
          <div className={styles.lbMyRankPill}>
            <span className={styles.lbMyRankNum}>#{myRank}</span>
            <span className={styles.lbMyRankLabel}>Your rank</span>
            <span className={styles.lbMyScore}>{myEntry.score} pts</span>
          </div>
        )}
      </div>

      {/* Top 3 podium */}
      {!loading && rankings.length >= 3 && (
        <div className={styles.lbPodium}>
          {/* 2nd */}
          <div className={styles.lbPodiumSpot}>
            <div className={styles.lbPodiumMedal}>🥈</div>
            <div className={`${styles.lbPodiumAvatar} ${styles.lbPodiumAvatarSilver}`}>
              {rankings[1].initials}
            </div>
            <div className={styles.lbPodiumName}>{rankings[1].name}</div>
            <div className={styles.lbPodiumScore}>{rankings[1].score} pts</div>
            <div className={styles.lbPodiumBar} style={{ height: 60, background: 'rgba(145,160,172,0.2)' }} />
          </div>
          {/* 1st */}
          <div className={`${styles.lbPodiumSpot} ${styles.lbPodiumFirst}`}>
            <div className={styles.lbPodiumMedal}>🥇</div>
            <div className={`${styles.lbPodiumAvatar} ${styles.lbPodiumAvatarGold}`}>
              {rankings[0].initials}
            </div>
            <div className={styles.lbPodiumName}>{rankings[0].name}</div>
            <div className={styles.lbPodiumScore}>{rankings[0].score} pts</div>
            <div className={styles.lbPodiumBar} style={{ height: 90, background: 'rgba(200,167,75,0.2)' }} />
          </div>
          {/* 3rd */}
          <div className={styles.lbPodiumSpot}>
            <div className={styles.lbPodiumMedal}>🥉</div>
            <div className={`${styles.lbPodiumAvatar} ${styles.lbPodiumAvatarBronze}`}>
              {rankings[2].initials}
            </div>
            <div className={styles.lbPodiumName}>{rankings[2].name}</div>
            <div className={styles.lbPodiumScore}>{rankings[2].score} pts</div>
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
            <p>No activity yet this month. Post to the community feed to get on the board!</p>
          </div>
        ) : (
          <div className={styles.lbList}>
            {rankings.map((entry, i) => {
              const isMe = entry.user_id === user?.id
              const isTop3 = i < 3
              return (
                <div key={entry.user_id} className={`${styles.lbRow} ${isMe ? styles.lbRowMe : ''}`}>
                  <div className={styles.lbRank}>
                    {isTop3 ? <span className={styles.lbMedal}>{MEDAL[i]}</span> : <span className={styles.lbRankNum}>#{i + 1}</span>}
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
                      {entry.posts} {entry.posts === 1 ? 'post' : 'posts'} · {entry.likes} {entry.likes === 1 ? 'like' : 'likes'} received
                    </div>
                  </div>
                  <div className={styles.lbRowScore} style={{ color: isTop3 ? 'var(--gold)' : 'var(--text-secondary)' }}>
                    +{entry.score}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* How points work */}
      <div className={styles.lbCard}>
        <h3 className={styles.lbCardTitle}>How Points Work</h3>
        <div className={styles.lbRules}>
          {SCORE_RULES.map(({ icon: Icon, color, label, pts }) => (
            <div key={label} className={styles.lbRuleRow}>
              <Icon size={16} color={color} />
              <span className={styles.lbRuleLabel}>{label}</span>
              <span className={styles.lbRulePts} style={{ color }}>+{pts} pts</span>
            </div>
          ))}
        </div>
        <p className={styles.lbRuleNote}>
          Rankings update in real time based on your community feed activity. Scores reset every 30 days.
        </p>
      </div>

    </div>
  )
}
