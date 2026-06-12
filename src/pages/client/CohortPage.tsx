import { useEffect, useState } from 'react'
import { Users, Trophy, Heart, MessageCircle, Send, CheckCircle, Award, Flame } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { format, subDays, startOfWeek, parseISO, formatDistanceToNow } from 'date-fns'
import type { DailyLog } from '@/types'
import { scoreWeek } from '@/lib/grading'
import toast from 'react-hot-toast'
import styles from './Client.module.css'
import shared from '../../styles/shared.module.css'

interface Cohort {
  id: string
  name: string
  starts_on: string
  ends_on: string
  created_by: string | null
}

interface MemberRow {
  user_id: string
  profiles: { first_name: string; last_name: string } | null
}

interface LeaderboardEntry {
  user_id: string
  firstName: string
  lastInitial: string
  streak: number
  weekScore: number
  isCurrentUser: boolean
}

interface FeedPost {
  id: string
  user_id: string
  content: string
  post_type: 'check_in' | 'late_slip' | 'milestone' | 'win' | 'general'
  likes: number
  created_at: string
  profiles: { first_name: string; last_name: string; display_handle: string | null }
}

const POST_TYPE_CONFIG = {
  check_in: { icon: CheckCircle, color: '#4be08a', label: 'Check-in' },
  late_slip: { icon: MessageCircle, color: '#e0b84b', label: 'Late Slip' },
  milestone: { icon: Award, color: '#c8a74b', label: 'Milestone' },
  win: { icon: Flame, color: '#e08a4b', label: 'Win' },
  general: { icon: MessageCircle, color: '#91a0ac', label: '' },
}

function daysUntil(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number)
  const end = new Date(y, m - 1, d)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return Math.ceil((end.getTime() - now.getTime()) / 86400000)
}

export default function CohortPage() {
  const [loading, setLoading] = useState(true)
  const [cohort, setCohort] = useState<Cohort | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [posts, setPosts] = useState<FeedPost[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [memberIds, setMemberIds] = useState<string[]>([])
  const [content, setContent] = useState('')
  const [postType, setPostType] = useState<FeedPost['post_type']>('general')
  const [posting, setPosting] = useState(false)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }
    setCurrentUserId(user.id)

    const { data: memberships } = await supabase
      .from('cohort_members')
      .select('cohort_id')
      .eq('user_id', user.id)
      .limit(1)

    if (!memberships || memberships.length === 0) {
      setLoading(false)
      return
    }

    const cohortId = (memberships[0] as { cohort_id: string }).cohort_id

    const [cohortRes, membersRes] = await Promise.all([
      supabase.from('cohorts').select('*').eq('id', cohortId).single(),
      supabase
        .from('cohort_members')
        .select('user_id, profiles(first_name, last_name)')
        .eq('cohort_id', cohortId),
    ])

    if (!cohortRes.data) { setLoading(false); return }
    setCohort(cohortRes.data as Cohort)

    const members = (membersRes.data ?? []) as unknown as MemberRow[]
    const ids = members.map(m => m.user_id)
    setMemberIds(ids)

    if (ids.length === 0) { setLoading(false); return }

    const thirtyDaysAgo = format(subDays(new Date(), 29), 'yyyy-MM-dd')
    const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
    const today = format(new Date(), 'yyyy-MM-dd')

    const [logsRes, feedRes] = await Promise.all([
      supabase
        .from('daily_logs')
        .select('*')
        .in('user_id', ids)
        .gte('log_date', thirtyDaysAgo),
      supabase
        .from('feed_posts')
        .select('*, profiles(first_name, last_name, display_handle)')
        .in('user_id', ids)
        .order('created_at', { ascending: false })
        .limit(30),
    ])

    const allLogs = (logsRes.data ?? []) as DailyLog[]
    setPosts((feedRes.data ?? []) as FeedPost[])

    const entries: LeaderboardEntry[] = members.map(m => {
      const memberLogs = allLogs.filter(l => l.user_id === m.user_id)
      const weekLogs = memberLogs.filter(l => l.log_date >= weekStart && l.log_date <= today)
      const { score } = scoreWeek(weekLogs)

      let streak = 0
      const logDates = new Set(memberLogs.map(l => l.log_date))
      for (let i = 0; i < 30; i++) {
        const d = format(subDays(new Date(), i), 'yyyy-MM-dd')
        if (logDates.has(d)) streak++
        else break
      }

      return {
        user_id: m.user_id,
        firstName: m.profiles?.first_name ?? '?',
        lastInitial: (m.profiles?.last_name?.[0] ?? '?').toUpperCase(),
        streak,
        weekScore: score,
        isCurrentUser: m.user_id === user.id,
      }
    }).sort((a, b) => b.weekScore - a.weekScore)

    setLeaderboard(entries)
    setLoading(false)
  }

  const fetchPosts = async (ids: string[]) => {
    if (ids.length === 0) return
    const { data } = await supabase
      .from('feed_posts')
      .select('*, profiles(first_name, last_name, display_handle)')
      .in('user_id', ids)
      .order('created_at', { ascending: false })
      .limit(30)
    setPosts((data ?? []) as FeedPost[])
  }

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || !currentUserId) return
    setPosting(true)
    const { error } = await supabase.from('feed_posts').insert({
      user_id: currentUserId,
      content: content.trim(),
      post_type: postType,
      likes: 0,
    })
    if (error) {
      toast.error('Failed to post.')
    } else {
      setContent('')
      setPostType('general')
      fetchPosts(memberIds)
    }
    setPosting(false)
  }

  const handleLike = async (post: FeedPost) => {
    await supabase.from('feed_posts').update({ likes: post.likes + 1 }).eq('id', post.id)
    setPosts(p => p.map(x => x.id === post.id ? { ...x, likes: x.likes + 1 } : x))
  }

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className={styles.loadingText}>Loading your cohort...</div>
      </div>
    )
  }

  if (!cohort) {
    return (
      <div className="animate-fade-in">
        <div className={styles.pageTop}>
          <div>
            <h1 className={styles.pageTopTitle}>
              <Users size={22} color="var(--teal)" /> My Cohort
            </h1>
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.cohortEmptyState}>
            <Trophy size={48} color="var(--border-subtle)" />
            <p className={styles.cohortEmptyTitle}>No cohort yet</p>
            <p className={styles.cohortEmptyMsg}>
              Your educator will add you to a cohort when your program begins.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const daysLeft = daysUntil(cohort.ends_on)
  const startStr = format(new Date(cohort.starts_on + 'T12:00:00'), 'MMM d')
  const endStr = format(new Date(cohort.ends_on + 'T12:00:00'), 'MMM d, yyyy')

  return (
    <div className="animate-fade-in">
      <div className={styles.pageTop}>
        <div>
          <h1 className={styles.pageTopTitle}>
            <Users size={22} color="var(--teal)" /> My Cohort
          </h1>
          <p className={styles.pageTopDate}>{cohort.name}</p>
        </div>
      </div>

      {/* Cohort meta */}
      <div className={styles.card}>
        <h2 className={styles.cohortTitle}>{cohort.name}</h2>
        <p className={styles.cohortDates}>{startStr} to {endStr}</p>
        {daysLeft > 0 ? (
          <span className={styles.cohortDaysLeft}>
            {daysLeft} day{daysLeft !== 1 ? 's' : ''} remaining
          </span>
        ) : (
          <span className={styles.cohortDaysLeft} style={{ color: 'var(--text-muted)', background: 'transparent', border: '1px solid var(--border-subtle)' }}>
            Program ended
          </span>
        )}
      </div>

      {/* Consistency Leaderboard */}
      <div className={styles.card}>
        <h3 className={styles.adhrTitle}>Consistency Leaderboard</h3>
        <p className={styles.lbFraming}>Ranked by consistency, not results. Showing up is the win.</p>

        {leaderboard.length === 0 ? (
          <p className={styles.cohortEmptyMsg}>No activity logged this week yet. Be the first to check in!</p>
        ) : (
          <div className={styles.lbList}>
            {leaderboard.map((entry, index) => {
              const rank = index + 1
              const isTop = rank === 1
              const initials = `${entry.firstName[0] ?? '?'}${entry.lastInitial}`
              const scoreColor = entry.weekScore >= 70 ? '#4be08a' : entry.weekScore >= 50 ? '#e0b84b' : '#e05c5c'
              return (
                <div key={entry.user_id} className={entry.isCurrentUser ? styles.lbRowYou : styles.lbRow}>
                  <div className={isTop ? styles.lbRankTop : styles.lbRank}>
                    {rank === 1 ? '★' : `#${rank}`}
                  </div>
                  <div className={entry.isCurrentUser ? styles.lbAvatarYou : styles.lbAvatar}>
                    {initials}
                  </div>
                  <div className={styles.lbName}>
                    {entry.firstName} {entry.lastInitial}.
                    {entry.isCurrentUser && <span className={styles.lbYouTag}>You</span>}
                  </div>
                  <div className={styles.lbStreak}>🔥 {entry.streak}</div>
                  {/* Score color is computed from live consistency score, so it stays inline */}
                  <div className={styles.lbScore} style={{ color: scoreColor }}>
                    {entry.weekScore}%
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Group Feed */}
      <div className={styles.card}>
        <h3 className={styles.cohortFeedTitle}>
          <MessageCircle size={16} color="var(--teal)" /> Group Feed
        </h3>

        <form onSubmit={handlePost}>
          <textarea
            className={styles.composerTextarea}
            placeholder="Share a win, check in, or encourage your group..."
            value={content}
            onChange={e => setContent(e.target.value)}
            maxLength={500}
          />
          <div className={styles.composerBar}>
            <div className={styles.typePills}>
              {(['check_in', 'win', 'milestone', 'general'] as const).map(t => {
                const cfg = POST_TYPE_CONFIG[t]
                return (
                  <button
                    key={t}
                    type="button"
                    className={postType === t ? styles.typePillActive : styles.typePill}
                    onClick={() => setPostType(t)}
                  >
                    {cfg.label || 'General'}
                  </button>
                )
              })}
            </div>
            <div className={styles.composerMeta}>
              <span className={styles.charCount}>{content.length}/500</span>
              <button
                type="submit"
                className={shared.btnPrimary}
                disabled={posting || !content.trim()}
              >
                <Send size={14} /> Post
              </button>
            </div>
          </div>
        </form>

        <div className={styles.feedList}>
          {posts.length === 0 ? (
            <p className={styles.cohortEmptyMsg} style={{ padding: 'var(--space-6) 0', textAlign: 'center' }}>
              No posts yet. Be the first to check in!
            </p>
          ) : (
            posts.map(post => {
              const cfg = POST_TYPE_CONFIG[post.post_type]
              const Icon = cfg.icon
              return (
                <div key={post.id} className={styles.feedPost}>
                  <div className={styles.feedAvatar}>
                    {post.profiles?.first_name?.[0] ?? '?'}
                    {post.profiles?.last_name?.[0] ?? '?'}
                  </div>
                  <div className={styles.postRow}>
                    <div className={styles.postHeader}>
                      <span className={styles.feedName}>
                        {post.profiles?.first_name ?? 'Member'} {post.profiles?.last_name?.[0] ?? ''}.
                      </span>
                      {post.profiles?.display_handle && (
                        <span className={styles.postHandle}>@{post.profiles.display_handle}</span>
                      )}
                      {cfg.label && (
                        <span className={styles.typeBadge} style={{ color: cfg.color }}>
                          <Icon size={11} /> {cfg.label}
                        </span>
                      )}
                      <span className={styles.postTime}>
                        {formatDistanceToNow(parseISO(post.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className={styles.postContent}>{post.content}</p>
                    <button className={styles.likeBtn} onClick={() => handleLike(post)}>
                      <Heart size={14} /> {post.likes}
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      <p className={styles.footerNote}>
        Your cohort feed is visible to members of this group only. Posts are not shared with the general community feed.
      </p>
    </div>
  )
}
