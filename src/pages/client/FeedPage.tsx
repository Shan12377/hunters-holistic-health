import { useEffect, useState, useMemo } from 'react'
import { Users, Heart, Send, Flame, Award, CheckCircle, Megaphone, HelpCircle, SlidersHorizontal, CalendarDays, Pin } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { parseISO, formatDistanceToNow, format } from 'date-fns'
import toast from 'react-hot-toast'
import type { PrivacySettings } from '@/types'
import { awardPoints } from '@/lib/points'
import MemberCard from '@/components/ui/MemberCard'
import styles from './Client.module.css'
import shared from '../../styles/shared.module.css'

type PostType = 'check_in' | 'late_slip' | 'milestone' | 'win' | 'general' | 'intro' | 'announcement' | 'question'
type Room = 'all' | 'general' | 'wins' | 'questions' | 'challenges' | 'resources'

interface FeedPost {
  id: string
  user_id: string
  content: string
  post_type: PostType
  room: Room
  likes: number
  is_pinned: boolean
  created_at: string
  profiles: { first_name: string; last_name: string; display_handle: string | null; privacy_settings?: PrivacySettings }
  user_liked?: boolean
}

interface NextEvent {
  id: string
  title: string
  start_date: string
  start_time: string | null
}

const TYPE_CONFIG: Record<PostType, { icon: React.ElementType; color: string; label: string }> = {
  check_in:     { icon: CheckCircle, color: '#4be08a', label: 'Check-in' },
  late_slip:    { icon: CheckCircle, color: '#e0b84b', label: 'Late Slip' },
  milestone:    { icon: Award,       color: '#c8a74b', label: 'Milestone' },
  win:          { icon: Flame,       color: '#e08a4b', label: 'Win' },
  general:      { icon: Users,       color: '#91a0ac', label: '' },
  intro:        { icon: Users,       color: '#4b9ee0', label: 'Intro' },
  announcement: { icon: Megaphone,   color: '#e08a4b', label: 'Announcement' },
  question:     { icon: HelpCircle,  color: '#b44be0', label: 'Question' },
}

const COMPOSER_TYPES: { value: PostType; label: string; emoji: string }[] = [
  { value: 'general',      label: 'General',      emoji: '💬' },
  { value: 'win',          label: 'Win',          emoji: '🔥' },
  { value: 'check_in',     label: 'Check-in',     emoji: '✅' },
  { value: 'intro',        label: 'Intro',        emoji: '👋' },
  { value: 'milestone',    label: 'Milestone',    emoji: '🏆' },
  { value: 'question',     label: 'Question',     emoji: '❓' },
  { value: 'announcement', label: 'Announcement', emoji: '📢' },
]

const FILTER_PILLS: { label: string; value: PostType | null; emoji: string }[] = [
  { label: 'All',           value: null,           emoji: '' },
  { label: 'General',       value: 'general',      emoji: '📌' },
  { label: 'Wins',          value: 'win',          emoji: '🏆' },
  { label: 'Intros',        value: 'intro',        emoji: '👋' },
  { label: 'Announcements', value: 'announcement', emoji: '📢' },
  { label: 'Questions',     value: 'question',     emoji: '❓' },
  { label: 'Check-ins',     value: 'check_in',     emoji: '✅' },
]

const ROOMS: { id: Room; label: string; emoji: string; defaultPostType: PostType; placeholder: string }[] = [
  { id: 'all',        label: 'All',        emoji: '🏠', defaultPostType: 'general',  placeholder: 'Share something with the community...' },
  { id: 'general',    label: 'General',    emoji: '💬', defaultPostType: 'general',  placeholder: 'Share something with the community...' },
  { id: 'wins',       label: 'Wins',       emoji: '🔥', defaultPostType: 'win',      placeholder: 'Share a win or milestone...' },
  { id: 'questions',  label: 'Questions',  emoji: '❓', defaultPostType: 'question', placeholder: 'Ask the community a question...' },
  { id: 'challenges', label: 'Challenges', emoji: '⚡', defaultPostType: 'check_in', placeholder: 'Share your challenge progress...' },
  { id: 'resources',  label: 'Resources',  emoji: '📚', defaultPostType: 'general',  placeholder: 'Share a tip, recipe, or tool...' },
]

function applyPrivacy(post: FeedPost): string {
  const priv = post.profiles.privacy_settings
  let content = post.content
  if (priv) {
    if (!priv.share_weight && /\d+\s*(lb|lbs|kg|pound|kilo)/i.test(content)) content = 'reached a milestone'
    if (!priv.share_steps && /\d+\s*(step|steps)/i.test(content)) content = 'Hit a goal'
    if (!priv.share_meals && post.post_type === 'general' && /ate|meal|food|lunch|dinner|breakfast|snack/i.test(content)) content = 'Logged a meal'
  }
  return content
}

function countdown(startDate: string, startTime: string | null): string | null {
  const iso = startTime ? `${startDate}T${startTime}` : `${startDate}T09:00:00`
  const diff = new Date(iso).getTime() - Date.now()
  if (diff <= 0) return null
  const h = Math.floor(diff / 3_600_000)
  if (h < 24) return `${h} hour${h === 1 ? '' : 's'}`
  const d = Math.floor(h / 24)
  return `${d} day${d === 1 ? '' : 's'}`
}

export default function FeedPage() {
  const { user, profile } = useAuthStore()
  const [posts, setPosts]               = useState<FeedPost[]>([])
  const [loading, setLoading]           = useState(true)
  const [content, setContent]           = useState('')
  const [postType, setPostType]         = useState<PostType>('general')
  const [posting, setPosting]           = useState(false)
  const [composerOpen, setComposerOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState<PostType | null>(null)
  const [activeRoom, setActiveRoom]     = useState<Room>('all')
  const [nextEvent, setNextEvent]       = useState<NextEvent | null>(null)
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)

  const userId = user?.id ?? null
  const initials = profile
    ? `${profile.first_name?.[0] ?? ''}${profile.last_name?.[0] ?? ''}`.toUpperCase()
    : '?'

  useEffect(() => {
    fetchPosts()
    fetchNextEvent()
  }, [])

  const fetchPosts = async () => {
    const { data } = await supabase
      .from('feed_posts')
      .select('*, profiles(first_name, last_name, display_handle, privacy_settings)')
      .order('created_at', { ascending: false })
      .limit(100)
    setPosts((data as FeedPost[]) ?? [])
    setLoading(false)
  }

  const fetchNextEvent = async () => {
    const today = format(new Date(), 'yyyy-MM-dd')
    const { data } = await supabase
      .from('events')
      .select('id, title, start_date, start_time')
      .gte('start_date', today)
      .order('start_date', { ascending: true })
      .limit(1)
      .maybeSingle()
    if (data) setNextEvent(data as NextEvent)
  }

  const handleRoomChange = (room: Room) => {
    setActiveRoom(room)
    setActiveFilter(null)
    const def = ROOMS.find(r => r.id === room)
    if (def) setPostType(def.defaultPostType)
  }

  const POST_PTS: Record<PostType, number> = {
    check_in: 5, win: 4, milestone: 4, late_slip: 3,
    intro: 3, announcement: 3, question: 3, general: 2,
  }

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || !userId) return
    setPosting(true)
    const { data: newPost, error } = await supabase.from('feed_posts').insert({
      user_id: userId,
      content: content.trim(),
      post_type: postType,
      room: activeRoom === 'all' ? 'general' : activeRoom,
      likes: 0,
    }).select('id').single()
    if (error) {
      toast.error('Failed to post')
    } else {
      toast.success('Posted!')
      if (newPost?.id) {
        await awardPoints(userId, 'feed_post', POST_PTS[postType] ?? 2, newPost.id)
      }
      setContent('')
      const def = ROOMS.find(r => r.id === activeRoom)
      setPostType(def?.defaultPostType ?? 'general')
      setComposerOpen(false)
      fetchPosts()
    }
    setPosting(false)
  }

  const handleLike = async (post: FeedPost) => {
    const newLikes = post.likes + (post.user_liked ? -1 : 1)
    await supabase.from('feed_posts').update({ likes: newLikes }).eq('id', post.id)
    setPosts(p => p.map(x => x.id === post.id ? { ...x, likes: newLikes, user_liked: !x.user_liked } : x))
  }

  const handlePin = async (post: FeedPost) => {
    const newVal = !post.is_pinned
    await supabase.from('feed_posts').update({ is_pinned: newVal }).eq('id', post.id)
    setPosts(p => p.map(x => x.id === post.id ? { ...x, is_pinned: newVal } : x))
    toast.success(newVal ? 'Post pinned.' : 'Post unpinned.')
  }

  const isEducator = profile?.role === 'educator'
  const activeRoomConfig = ROOMS.find(r => r.id === activeRoom)!

  const roomPosts = useMemo(() =>
    activeRoom === 'all' ? posts : posts.filter(p => (p.room ?? 'general') === activeRoom),
    [posts, activeRoom]
  )

  const pinned = useMemo(() => roomPosts.filter(p => p.is_pinned), [roomPosts])

  const filtered = useMemo(() => {
    const base = activeFilter ? roomPosts.filter(p => p.post_type === activeFilter) : roomPosts
    return base.filter(p => !p.is_pinned)
  }, [roomPosts, activeFilter])

  const eventCountdown = nextEvent ? countdown(nextEvent.start_date, nextEvent.start_time) : null

  const renderPost = (post: FeedPost, isPinnedSection: boolean) => {
    const typeConfig = TYPE_CONFIG[post.post_type] ?? TYPE_CONFIG.general
    const Icon = typeConfig.icon
    const authorName = post.profiles.display_handle
      ? `@${post.profiles.display_handle}`
      : `${post.profiles.first_name} ${post.profiles.last_name?.[0] ?? ''}.`
    return (
      <div
        key={post.id}
        className={isPinnedSection ? styles.feedPostPinned : styles.feedPost}
        style={post.post_type !== 'general' ? { borderLeft: `3px solid ${typeConfig.color}` } : undefined}
      >
        <div className={styles.postRow}>
          <button className={styles.memberTrigger} onClick={() => setSelectedMemberId(post.user_id)}>
            <div className={styles.feedAvatar}>
              {post.profiles.first_name?.[0]}{post.profiles.last_name?.[0]}
            </div>
          </button>
          <div className={styles.postBody}>
            <div className={styles.postHeader}>
              <button className={styles.memberNameBtn} onClick={() => setSelectedMemberId(post.user_id)}>{authorName}</button>
              {post.post_type !== 'general' && (
                <span
                  className={styles.typeBadge}
                  style={{ background: `${typeConfig.color}15`, border: `1px solid ${typeConfig.color}30`, color: typeConfig.color }}
                >
                  <Icon size={10} /> {typeConfig.label}
                </span>
              )}
              <span className={styles.postTime}>
                {formatDistanceToNow(parseISO(post.created_at), { addSuffix: true })}
              </span>
              {isEducator && (
                <button
                  className={`${styles.feedPinBtn} ${post.is_pinned ? styles.feedPinBtnActive : ''}`}
                  onClick={() => handlePin(post)}
                  title={post.is_pinned ? 'Unpin' : 'Pin to top'}
                >
                  <Pin size={12} /> {post.is_pinned ? 'Unpin' : 'Pin'}
                </button>
              )}
            </div>
            <p className={styles.postContent}>{applyPrivacy(post)}</p>
            <div>
              <button
                onClick={() => handleLike(post)}
                className={post.user_liked ? styles.likeBtnLiked : styles.likeBtn}
              >
                <Heart size={16} fill={post.user_liked ? '#e05c5c' : 'none'} />
                {post.likes > 0 && post.likes}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTopTitle}>
          <Users size={22} color="var(--teal)" /> Community
        </h1>
      </div>

      {/* Room tabs */}
      <div className={styles.feedRoomTabs}>
        {ROOMS.map(room => (
          <button
            key={room.id}
            className={activeRoom === room.id ? styles.feedRoomTabActive : styles.feedRoomTab}
            onClick={() => handleRoomChange(room.id)}
          >
            <span>{room.emoji}</span> {room.label}
          </button>
        ))}
      </div>

      {/* Composer */}
      <div className={styles.feedComposerWrap}>
        {!composerOpen ? (
          <button className={styles.feedComposerPill} onClick={() => setComposerOpen(true)}>
            <div className={styles.feedComposerAvatar}>{initials}</div>
            <span className={styles.feedComposerPlaceholder}>{activeRoomConfig.placeholder}</span>
          </button>
        ) : (
          <div className={styles.feedComposerExpanded}>
            <div className={styles.feedComposerTop}>
              <div className={styles.feedComposerAvatar}>{initials}</div>
              <textarea
                className={styles.feedComposerTextarea}
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder={activeRoomConfig.placeholder}
                rows={3}
                maxLength={500}
                autoFocus
              />
            </div>
            <div className={styles.feedComposerBar}>
              <div className={styles.feedComposerPills}>
                {COMPOSER_TYPES.map(({ value, label, emoji }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPostType(value)}
                    className={postType === value ? styles.typePillActive : styles.typePill}
                  >
                    {emoji} {label}
                  </button>
                ))}
              </div>
              <div className={styles.feedComposerActions}>
                <span className={styles.charCount}>{content.length}/500</span>
                <button type="button" className={styles.feedComposerCancel} onClick={() => { setComposerOpen(false); setContent('') }}>
                  Cancel
                </button>
                <button
                  type="button"
                  className={`${shared.btnTeal} ${shared.btnSm}`}
                  onClick={handlePost}
                  disabled={posting || !content.trim()}
                >
                  <Send size={14} /> {posting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Next event countdown */}
      {nextEvent && eventCountdown && (
        <div className={styles.feedEventBanner}>
          <CalendarDays size={15} />
          <span>
            <strong>{nextEvent.title}</strong> is happening in {eventCountdown}
          </span>
        </div>
      )}

      {/* Filter pills: all rooms */}
      <div className={styles.feedFilterRow}>
        {FILTER_PILLS.map(({ label, value, emoji }) => (
          <button
            key={label}
            className={activeFilter === value ? styles.feedFilterPillActive : styles.feedFilterPill}
            onClick={() => setActiveFilter(value)}
          >
            {emoji && <span>{emoji}</span>} {label}
          </button>
        ))}
        <button className={styles.feedFilterIcon} title="More filters">
          <SlidersHorizontal size={16} />
        </button>
      </div>

      {/* Pinned posts */}
      {pinned.length > 0 && (
        <>
          <div className={styles.feedPinnedBanner}>
            <Pin size={12} /> Pinned
          </div>
          {pinned.map(post => renderPost(post, true))}
        </>
      )}

      {/* Feed */}
      {loading ? (
        <div className={styles.loadingText}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div className={styles.card}>
          <div className={styles.chartEmpty}>
            <Users size={40} color="var(--border)" />
            <p>
              {activeRoom === 'general' && activeFilter
                ? 'No posts in this category yet.'
                : `No posts in ${activeRoomConfig.label} yet. Be the first!`}
            </p>
          </div>
        </div>
      ) : (
        <div className={styles.feedList}>
          {filtered.map(post => renderPost(post, false))}
        </div>
      )}

      <p className={styles.footerNote}>
        Private community visible only to program participants. Be kind, be real, be supportive.
      </p>

      {selectedMemberId && (
        <MemberCard userId={selectedMemberId} onClose={() => setSelectedMemberId(null)} />
      )}
    </div>
  )
}
