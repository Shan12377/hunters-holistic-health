import { useEffect, useState, useMemo, useRef } from 'react'
import { Users, Heart, Send, Flame, Award, CheckCircle, Megaphone, HelpCircle, SlidersHorizontal, CalendarDays, Pin, MessageCircle, Flag, BarChart2, Plus, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { parseISO, formatDistanceToNow, format } from 'date-fns'
import toast from 'react-hot-toast'
import type { PrivacySettings } from '@/types'
import { awardPoints, getLevelInfo } from '@/lib/points'
import MemberCard from '@/components/ui/MemberCard'
import BackButton from '@/components/BackButton'
import styles from './Client.module.css'
import shared from '../../styles/shared.module.css'
import { withTimeout } from '@/lib/withTimeout'

const FEED_TIMEOUT_MS = 15000

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

interface PollOption {
  id: string
  post_id: string
  option_text: string
  display_order: number
  vote_count: number
  user_voted: boolean
}

interface FeedComment {
  id: string
  user_id: string
  content: string
  created_at: string
  profiles: { first_name: string; last_name: string; display_handle: string | null }
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
  { id: 'all',       label: 'All',       emoji: '🏠', defaultPostType: 'general',  placeholder: 'Share something with the community...' },
  { id: 'general',   label: 'General',   emoji: '💬', defaultPostType: 'general',  placeholder: 'Share something with the community...' },
  { id: 'wins',      label: 'Wins',      emoji: '🔥', defaultPostType: 'win',      placeholder: 'Share a win or milestone...' },
  { id: 'questions', label: 'Questions', emoji: '❓', defaultPostType: 'question', placeholder: 'Ask the community a question...' },
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
  const [userPoints, setUserPoints]             = useState<Record<string, number>>({})
  const [postPolls, setPostPolls]               = useState<Record<string, PollOption[]>>({})
  const [isPoll, setIsPoll]                     = useState(false)
  const [pollOptions, setPollOptions]           = useState(['', ''])
  const [expandedPostId, setExpandedPostId]     = useState<string | null>(null)
  const [comments, setComments]                 = useState<FeedComment[]>([])
  const [commentText, setCommentText]           = useState('')
  const [commentSending, setCommentSending]     = useState(false)
  const [fetchError, setFetchError]             = useState(false)
  const expandedPostIdRef = useRef<string | null>(null)

  const userId = user?.id ?? null
  const initials = profile
    ? `${profile.first_name?.[0] ?? ''}${profile.last_name?.[0] ?? ''}`.toUpperCase()
    : '?'

  useEffect(() => {
    fetchPosts()
    fetchNextEvent()

    // Realtime: new posts and new comments
    const channel = supabase
      .channel('community-feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'feed_posts' }, async payload => {
        const { data: newPost } = await supabase
          .from('feed_posts')
          .select('*, profiles(first_name, last_name, display_handle, privacy_settings)')
          .eq('id', payload.new.id)
          .single()
        if (newPost) {
          setPosts(prev => prev.find(p => p.id === newPost.id) ? prev : [newPost as FeedPost, ...prev])
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'feed_comments' }, async payload => {
        if (payload.new.post_id !== expandedPostIdRef.current) return
        const { data: newComment } = await supabase
          .from('feed_comments')
          .select('*, profiles(first_name, last_name, display_handle)')
          .eq('id', payload.new.id)
          .single()
        if (newComment) {
          setComments(prev => prev.find(c => c.id === newComment.id) ? prev : [...prev, newComment as FeedComment])
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  useEffect(() => { expandedPostIdRef.current = expandedPostId }, [expandedPostId])

  const fetchPosts = async () => {
    setFetchError(false)
    let data, fetchErr
    try {
      ({ data, error: fetchErr } = await withTimeout(
        supabase
          .from('feed_posts')
          .select('*, profiles(first_name, last_name, display_handle, privacy_settings)')
          .order('created_at', { ascending: false })
          .limit(100),
        FEED_TIMEOUT_MS,
        'Feed posts'
      ))
    } catch (err) {
      console.error('[feed] fetch failed:', err)
      setFetchError(true)
      setLoading(false)
      return
    }
    if (fetchErr) { setFetchError(true); setLoading(false); return }
    const posts = (data as FeedPost[]) ?? []
    setPosts(posts)
    setLoading(false)
    // fetch points for all authors in one query
    const ids = [...new Set(posts.map(p => p.user_id))]
    if (ids.length > 0) {
      const { data: pts } = await supabase
        .from('points_log')
        .select('user_id, points')
        .in('user_id', ids)
      const map: Record<string, number> = {}
      for (const r of pts ?? []) map[r.user_id] = (map[r.user_id] ?? 0) + r.points
      setUserPoints(map)
    }
    // fetch polls
    const postIds = posts.map(p => p.id)
    const { data: opts } = await supabase
      .from('poll_options')
      .select('*')
      .in('post_id', postIds)
      .order('display_order')
    // populate user_liked from feed_likes table
    if (userId && posts.length > 0) {
      const { data: likedRows } = await supabase
        .from('feed_likes')
        .select('post_id')
        .eq('user_id', userId)
        .in('post_id', posts.map(p => p.id))
      const likedSet = new Set((likedRows ?? []).map((r: { post_id: string }) => r.post_id))
      setPosts(posts.map(p => ({ ...p, user_liked: likedSet.has(p.id) })))
    }
    if (opts && opts.length > 0) {
      const optIds = opts.map((o: { id: string }) => o.id)
      const { data: votes } = await supabase
        .from('poll_votes')
        .select('poll_option_id, user_id')
        .in('poll_option_id', optIds)
      const voteCount: Record<string, number> = {}
      const userVoted = new Set<string>()
      const currentUser = (await supabase.auth.getSession()).data.session?.user?.id
      for (const v of votes ?? []) {
        voteCount[v.poll_option_id] = (voteCount[v.poll_option_id] ?? 0) + 1
        if (v.user_id === currentUser) userVoted.add(v.poll_option_id)
      }
      const grouped: Record<string, PollOption[]> = {}
      for (const o of opts as { id: string; post_id: string; option_text: string; display_order: number }[]) {
        if (!grouped[o.post_id]) grouped[o.post_id] = []
        grouped[o.post_id].push({ ...o, vote_count: voteCount[o.id] ?? 0, user_voted: userVoted.has(o.id) })
      }
      setPostPolls(grouped)
    }
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
    const def = ROOMS.find(r => r.id === room)
    setActiveRoom(room)
    setActiveFilter(null)
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
      // Free-tier accounts are limited by a database rule to one lifetime post
      // (their intro), enforced by an RLS policy that fails the insert
      // outright. Postgres reports that as code 42501. Without checking for
      // it specifically, a free user who has already used their one post gets
      // the same "Failed to post" as an actual network error, with nothing to
      // tell them the real reason.
      console.error('[feed] post failed:', error)
      toast.error('Failed to post. Check your connection and try again.')
    } else {
      toast.success('Posted!')
      if (newPost?.id) {
        await awardPoints(userId, 'feed_post', POST_PTS[postType] ?? 2, newPost.id)
        if (isPoll) {
          const valid = pollOptions.filter(o => o.trim())
          if (valid.length >= 2) {
            await supabase.from('poll_options').insert(
              valid.map((text, i) => ({ post_id: newPost.id, option_text: text.trim(), display_order: i }))
            )
          }
        }
      }
      setContent('')
      setIsPoll(false)
      setPollOptions(['', ''])
      const def = ROOMS.find(r => r.id === activeRoom)
      setPostType(def?.defaultPostType ?? 'general')
      setComposerOpen(false)
      fetchPosts()
    }
    setPosting(false)
  }

  const handleLike = async (post: FeedPost) => {
    if (!userId || post.user_id === userId) return
    const isLiked = !!post.user_liked
    // Optimistic update
    setPosts(p => p.map(x => x.id === post.id
      ? { ...x, likes: x.likes + (isLiked ? -1 : 1), user_liked: !isLiked }
      : x
    ))
    if (isLiked) {
      await supabase.from('feed_likes').delete().eq('post_id', post.id).eq('user_id', userId)
      await supabase.from('feed_posts').update({ likes: Math.max(0, post.likes - 1) }).eq('id', post.id)
    } else {
      const { error } = await supabase.from('feed_likes').insert({ post_id: post.id, user_id: userId })
      if (error) {
        // Unique violation, already liked; revert optimistic update
        setPosts(p => p.map(x => x.id === post.id ? { ...x, likes: post.likes, user_liked: true } : x))
      } else {
        await supabase.from('feed_posts').update({ likes: post.likes + 1 }).eq('id', post.id)
      }
    }
  }

  const handlePin = async (post: FeedPost) => {
    const newVal = !post.is_pinned
    await supabase.from('feed_posts').update({ is_pinned: newVal }).eq('id', post.id)
    setPosts(p => p.map(x => x.id === post.id ? { ...x, is_pinned: newVal } : x))
    toast.success(newVal ? 'Post pinned.' : 'Post unpinned.')
  }

  const handleVote = async (post: FeedPost, optionId: string) => {
    if (!userId || post.user_id === userId) return
    const options = postPolls[post.id] ?? []
    const prev = options.find(o => o.user_voted)
    if (prev) {
      await supabase.from('poll_votes').delete().eq('poll_option_id', prev.id).eq('user_id', userId)
    }
    if (prev?.id !== optionId) {
      await supabase.from('poll_votes').upsert(
        { poll_option_id: optionId, user_id: userId },
        { onConflict: 'poll_option_id,user_id' }
      )
    }
    setPostPolls(p => ({
      ...p,
      [post.id]: (p[post.id] ?? []).map(o => ({
        ...o,
        vote_count: o.id === optionId
          ? o.vote_count + (prev?.id !== optionId ? 1 : 0)
          : o.id === prev?.id ? o.vote_count - 1 : o.vote_count,
        user_voted: o.id === optionId && prev?.id !== optionId,
      })),
    }))
  }

  const toggleComments = async (postId: string) => {
    if (expandedPostId === postId) { setExpandedPostId(null); return }
    setExpandedPostId(postId)
    setCommentText('')
    const { data } = await supabase
      .from('feed_comments')
      .select('*, profiles(first_name, last_name, display_handle)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
    setComments((data as FeedComment[]) ?? [])
  }

  const handleComment = async (postId: string) => {
    if (!commentText.trim()) return
    if (!userId) {
      toast.error('Your session may have timed out. Refresh the page and try again.')
      return
    }
    setCommentSending(true)
    const { data, error } = await supabase
      .from('feed_comments')
      .insert({ post_id: postId, user_id: userId, content: commentText.trim() })
      .select('*, profiles(first_name, last_name, display_handle)')
      .single()
    if (error) {
      console.error('[feed] comment failed:', error)
      toast.error('Comment failed to send. Check your connection and try again.')
    } else if (data) {
      setComments(c => [...c, data as FeedComment])
      setCommentText('')
    }
    setCommentSending(false)
  }

  const handleReport = async (postId: string) => {
    if (!userId) return
    const { error } = await supabase
      .from('feed_reports')
      .insert({ post_id: postId, user_id: userId, reason: 'flagged' })
    if (error?.code === '23505') {
      toast('You already reported this post.', { icon: '🚩' })
    } else if (error) {
      toast.error('Could not send report.')
    } else {
      toast('Post reported. Our educator will review it.', { icon: '🚩' })
    }
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
              {(() => { const lvl = getLevelInfo(userPoints[post.user_id] ?? 0).level; return lvl > 1 ? <span className={styles.postLevelBadge}>LVL {lvl}</span> : null })()}
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
            {postPolls[post.id]?.length > 0 && (() => {
              const opts = postPolls[post.id]
              const total = opts.reduce((s, o) => s + o.vote_count, 0)
              const voted = opts.some(o => o.user_voted)
              const isOwn = post.user_id === userId
              const revealed = voted || isOwn
              return (
                <div className={styles.pollWrap}>
                  {opts.map(opt => {
                    const pct = total > 0 ? Math.round((opt.vote_count / total) * 100) : 0
                    return (
                      <button
                        key={opt.id}
                        className={`${styles.pollOption} ${opt.user_voted ? styles.pollOptionVoted : ''} ${revealed ? styles.pollOptionRevealed : ''}`}
                        onClick={() => !revealed && !isOwn && handleVote(post, opt.id)}
                        disabled={isOwn}
                      >
                        {revealed && <div className={styles.pollBar} style={{ width: `${pct}%` }} />}
                        <span className={styles.pollOptionText}>{opt.option_text}</span>
                        {revealed && <span className={styles.pollPct}>{pct}%</span>}
                      </button>
                    )
                  })}
                  <div className={styles.pollMeta}>
                    {total} {total === 1 ? 'vote' : 'votes'}
                    {!voted && !isOwn && <span> · tap to vote</span>}
                  </div>
                </div>
              )
            })()}
            <div className={styles.postActions}>
              <button
                onClick={() => handleLike(post)}
                className={post.user_liked ? styles.likeBtnLiked : styles.likeBtn}
              >
                <Heart size={16} fill={post.user_liked ? '#e05c5c' : 'none'} />
                {post.likes > 0 && post.likes}
              </button>
              <button
                className={styles.commentToggleBtn}
                onClick={() => toggleComments(post.id)}
              >
                <MessageCircle size={14} />
                Comment
              </button>
              <button
                className={styles.reportBtn}
                onClick={() => handleReport(post.id)}
                title="Report post"
              >
                <Flag size={13} />
              </button>
            </div>
            {expandedPostId === post.id && (
              <div className={styles.commentThread}>
                {comments.map(c => {
                  const name = c.profiles.display_handle
                    ? `@${c.profiles.display_handle}`
                    : `${c.profiles.first_name} ${c.profiles.last_name?.[0] ?? ''}.`
                  return (
                    <div key={c.id} className={styles.commentItem}>
                      <div className={styles.commentAvatar}>
                        {c.profiles.first_name?.[0]}{c.profiles.last_name?.[0]}
                      </div>
                      <div className={styles.commentBody}>
                        <div className={styles.commentAuthor}>{name}</div>
                        <div className={styles.commentText}>{c.content}</div>
                        <div className={styles.commentTime}>
                          {formatDistanceToNow(parseISO(c.created_at), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div className={styles.commentInputRow}>
                  <input
                    className={styles.commentInput}
                    placeholder="Write a comment..."
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleComment(post.id) } }}
                    maxLength={500}
                  />
                  <button
                    className={styles.commentSubmitBtn}
                    onClick={() => handleComment(post.id)}
                    disabled={commentSending || !commentText.trim()}
                  >
                    <Send size={13} />
                  </button>
                </div>
              </div>
            )}
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

      {/* Lobby read-only banner */}
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
            <span className={styles.feedComposerPlaceholder}>
              {activeRoomConfig.placeholder}
            </span>
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
            {isPoll && (
              <div className={styles.pollComposerWrap}>
                {pollOptions.map((opt, i) => (
                  <div key={i} className={styles.pollComposerRow}>
                    <input
                      className={styles.pollComposerInput}
                      placeholder={`Option ${i + 1}`}
                      value={opt}
                      onChange={e => setPollOptions(prev => prev.map((o, j) => j === i ? e.target.value : o))}
                      maxLength={80}
                    />
                    {pollOptions.length > 2 && (
                      <button
                        type="button"
                        className={styles.pollComposerRemove}
                        onClick={() => setPollOptions(prev => prev.filter((_, j) => j !== i))}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                ))}
                {pollOptions.length < 4 && (
                  <button
                    type="button"
                    className={styles.pollComposerAdd}
                    onClick={() => setPollOptions(prev => [...prev, ''])}
                  >
                    <Plus size={13} /> Add option
                  </button>
                )}
              </div>
            )}
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
                <button
                  type="button"
                  className={isPoll ? styles.pollToggleActive : styles.pollToggle}
                  onClick={() => { setIsPoll(p => !p); if (isPoll) setPollOptions(['', '']) }}
                  title="Add a poll"
                >
                  <BarChart2 size={14} /> Poll
                </button>
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

      {/* New member welcome banner */}
      {!loading && userId && posts.filter(p => p.user_id === userId).length === 0 && (
        <div className={styles.feedWelcomeBanner}>
          <div className={styles.feedWelcomeTitle}>Welcome to the community! Here is how to get started:</div>
          <ol className={styles.feedWelcomeSteps}>
            <li>Post an intro in the feed: who you are and what brought you here</li>
            <li>Share your first win, no matter how small</li>
            <li>Check in to an active challenge to earn your first points</li>
          </ol>
          <button className={styles.feedWelcomeDismiss} onClick={() => setComposerOpen(true)}>
            Write your intro now
          </button>
        </div>
      )}

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
        <div className={styles.feedList}>
          {[1, 2, 3].map(i => <div key={i} className={styles.feedPostSkeleton} />)}
        </div>
      ) : fetchError ? (
        <div className={styles.feedErrorState}>
          <p>Could not load posts. Check your connection.</p>
          <button className={styles.feedRetryBtn} onClick={fetchPosts}>Try again</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.feedEmptyState}>
          <Users size={36} color="var(--border)" />
          <p>
            {activeFilter
              ? 'No posts in this category yet.'
              : `No posts in ${activeRoomConfig.label} yet.`}
          </p>
          <button className={styles.feedEmptyCta} onClick={() => setComposerOpen(true)}>
            Be the first to post
          </button>
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
