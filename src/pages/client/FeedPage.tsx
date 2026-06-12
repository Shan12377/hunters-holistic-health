import { useEffect, useState } from 'react'
import { Users, Heart, MessageCircle, Send, Flame, Award, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { parseISO, formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import styles from './Client.module.css'
import shared from '../../styles/shared.module.css'

interface FeedPost {
  id: string
  user_id: string
  content: string
  post_type: 'check_in' | 'late_slip' | 'milestone' | 'win' | 'general'
  likes: number
  created_at: string
  profiles: { first_name: string; last_name: string; display_handle: string | null }
  user_liked?: boolean
}

const POST_TYPE_CONFIG = {
  check_in: { icon: CheckCircle, color: '#4be08a', label: 'Check-in' },
  late_slip: { icon: MessageCircle, color: '#e0b84b', label: 'Late Slip' },
  milestone: { icon: Award, color: '#c8a74b', label: 'Milestone' },
  win: { icon: Flame, color: '#e08a4b', label: 'Win' },
  general: { icon: MessageCircle, color: '#91a0ac', label: '' },
}

export default function FeedPage() {
  const [posts, setPosts] = useState<FeedPost[]>([])
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState('')
  const [postType, setPostType] = useState<FeedPost['post_type']>('general')
  const [posting, setPosting] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id)
    })
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    const { data } = await supabase
      .from('feed_posts')
      .select('*, profiles(first_name, last_name, display_handle)')
      .order('created_at', { ascending: false })
      .limit(50)
    setPosts((data as FeedPost[]) ?? [])
    setLoading(false)
  }

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || !userId) return
    setPosting(true)
    const { error } = await supabase.from('feed_posts').insert({
      user_id: userId,
      content: content.trim(),
      post_type: postType,
      likes: 0,
    })
    if (error) {
      toast.error('Failed to post')
    } else {
      toast.success('Posted to the group!')
      setContent('')
      setPostType('general')
      fetchPosts()
    }
    setPosting(false)
  }

  const handleLike = async (post: FeedPost) => {
    const newLikes = post.likes + (post.user_liked ? -1 : 1)
    await supabase.from('feed_posts').update({ likes: newLikes }).eq('id', post.id)
    setPosts(p => p.map(x => x.id === post.id ? { ...x, likes: newLikes, user_liked: !x.user_liked } : x))
  }

  const POST_TYPES: { value: FeedPost['post_type']; label: string; emoji: string }[] = [
    { value: 'general', label: 'Share', emoji: '💬' },
    { value: 'win', label: 'Win', emoji: '🔥' },
    { value: 'check_in', label: 'Check-in', emoji: '✅' },
    { value: 'milestone', label: 'Milestone', emoji: '🏆' },
  ]

  return (
    <div className="animate-fade-in">
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTopTitle}>
          <Users size={22} color="var(--teal)" /> Accountability Feed
        </h1>
        <p className={styles.pageTopDate}>
          Share wins, check-ins, and encouragement with your group
        </p>
      </div>

      {/* Post composer */}
      <div className={styles.card}>
        <form onSubmit={handlePost}>
          <textarea
            className={styles.composerTextarea}
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Share a win, check-in, or encouragement with the group..."
            rows={3}
            maxLength={500}
          />
          <div className={styles.composerBar}>
            <div className={styles.typePills}>
              {POST_TYPES.map(({ value, label, emoji }) => (
                <button key={value} type="button" onClick={() => setPostType(value)}
                  className={postType === value ? styles.typePillActive : styles.typePill}>
                  {emoji} {label}
                </button>
              ))}
            </div>
            <div className={styles.composerMeta}>
              <span className={styles.charCount}>{content.length}/500</span>
              <button type="submit" className={`${shared.btnTeal} ${shared.btnSm}`} disabled={posting || !content.trim()}>
                <Send size={14} /> {posting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Feed */}
      {loading ? (
        <div className={styles.loadingText}>Loading feed...</div>
      ) : posts.length === 0 ? (
        <div className={styles.card}>
          <div className={styles.chartEmpty}>
            <Users size={40} color="var(--border)" />
            <p>No posts yet. Be the first to share!</p>
          </div>
        </div>
      ) : (
        <div className={styles.feedList}>
          {posts.map(post => {
            const typeConfig = POST_TYPE_CONFIG[post.post_type]
            const Icon = typeConfig.icon
            return (
              /* Post type accent color is data-driven, so it stays inline */
              <div key={post.id} className={styles.feedPost} style={post.post_type !== 'general' ? { borderLeft: `3px solid ${typeConfig.color}` } : undefined}>
                <div className={styles.postRow}>
                  {/* Avatar */}
                  <div className={styles.feedAvatar}>
                    {post.profiles.first_name[0]}{post.profiles.last_name[0]}
                  </div>
                  <div className={styles.postBody}>
                    {/* Header */}
                    <div className={styles.postHeader}>
                      <span className={styles.feedName}>
                        {post.profiles.first_name} {post.profiles.last_name[0]}.
                      </span>
                      {post.profiles.display_handle && (
                        <span className={styles.postHandle}>@{post.profiles.display_handle}</span>
                      )}
                      {post.post_type !== 'general' && (
                        <span className={styles.typeBadge} style={{ background: `${typeConfig.color}15`, border: `1px solid ${typeConfig.color}30`, color: typeConfig.color }}>
                          <Icon size={10} /> {typeConfig.label}
                        </span>
                      )}
                      <span className={styles.postTime}>
                        {formatDistanceToNow(parseISO(post.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    {/* Content */}
                    <p className={styles.postContent}>{post.content}</p>
                    {/* Actions */}
                    <div>
                      <button onClick={() => handleLike(post)} className={post.user_liked ? styles.likeBtnLiked : styles.likeBtn}>
                        <Heart size={16} fill={post.user_liked ? '#e05c5c' : 'none'} /> {post.likes > 0 && post.likes}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <p className={styles.footerNote}>
        This is a private group feed visible only to program participants. Be kind, be real, be supportive. 🌱
      </p>
    </div>
  )
}
