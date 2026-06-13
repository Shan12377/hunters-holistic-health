import { useEffect, useRef, useState } from 'react'
import { MessageCircle, Send, RefreshCw } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { looksClinical } from '@/lib/clinicalNudge'
import { parseISO, format, formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import styles from './Coach.module.css'
import shared from '../../styles/shared.module.css'

interface Message {
  id: string
  sender_id: string
  recipient_id: string
  content: string
  read: boolean
  created_at: string
}

interface Conversation {
  clientId: string
  name: string
  lastMessage: string
  lastAt: string
  unread: number
}

export default function EducatorMessagesPage() {
  const [educatorId, setEducatorId] = useState<string | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [thread, setThread] = useState<Message[]>([])
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const threadEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => { init() }, [])

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [thread])

  async function init() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setEducatorId(user.id)
    await fetchConversations(user.id)
    setLoading(false)
  }

  async function fetchConversations(eid: string) {
    const [{ data: msgs }, { data: clients }] = await Promise.all([
      supabase.from('messages').select('*')
        .or(`sender_id.eq.${eid},recipient_id.eq.${eid}`)
        .order('created_at', { ascending: false })
        .limit(500),
      supabase.from('profiles').select('id, first_name, last_name').eq('role', 'client'),
    ])
    const nameById = new Map((clients ?? []).map(c => [c.id, `${c.first_name} ${c.last_name}`]))
    const byClient = new Map<string, Conversation>()
    for (const m of (msgs as Message[]) ?? []) {
      const clientId = m.sender_id === eid ? m.recipient_id : m.sender_id
      if (!nameById.has(clientId)) continue
      const existing = byClient.get(clientId)
      if (!existing) {
        byClient.set(clientId, {
          clientId,
          name: nameById.get(clientId) ?? 'Participant',
          lastMessage: m.content,
          lastAt: m.created_at,
          unread: m.recipient_id === eid && !m.read ? 1 : 0,
        })
      } else if (m.recipient_id === eid && !m.read) {
        existing.unread += 1
      }
    }
    setConversations([...byClient.values()].sort((a, b) => b.lastAt.localeCompare(a.lastAt)))
  }

  async function openThread(clientId: string) {
    if (!educatorId) return
    setSelected(clientId)
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${educatorId},recipient_id.eq.${clientId}),and(sender_id.eq.${clientId},recipient_id.eq.${educatorId})`)
      .order('created_at', { ascending: true })
      .limit(200)
    const msgs = (data as Message[]) ?? []
    setThread(msgs)
    const unreadIds = msgs.filter(m => m.recipient_id === educatorId && !m.read).map(m => m.id)
    if (unreadIds.length > 0) {
      await supabase.from('messages').update({ read: true }).in('id', unreadIds)
      fetchConversations(educatorId)
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!draft.trim() || !educatorId || !selected) return
    setSending(true)
    const { error } = await supabase.from('messages').insert({
      sender_id: educatorId,
      recipient_id: selected,
      content: draft.trim(),
    })
    if (error) {
      toast.error('Message failed to send')
    } else {
      setDraft('')
      await openThread(selected)
      await fetchConversations(educatorId)
    }
    setSending(false)
  }

  const clinicalNudge = looksClinical(draft)
  const selectedName = conversations.find(c => c.clientId === selected)?.name

  return (
    <div className="animate-fade-in">
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTopTitle}>
          <MessageCircle size={22} color="var(--teal)" /> Participant Messages
        </h1>
        <p className={styles.pageTopDate}>
          Logistics and encouragement only. Clinical follow-up belongs in the secure clinical lane.
        </p>
      </div>

      {loading ? (
        <div className={styles.loadingText}>Loading conversations...</div>
      ) : (
        <div className={styles.msgLayout}>
          {/* Conversation list */}
          <div className={styles.msgListPane}>
            {conversations.length === 0 ? (
              <p className={styles.emptyText}>No conversations yet.</p>
            ) : (
              conversations.map(c => (
                <button
                  key={c.clientId}
                  onClick={() => openThread(c.clientId)}
                  className={c.clientId === selected ? styles.msgListItemActive : styles.msgListItem}
                >
                  <div className={styles.msgListName}>
                    {c.name}
                    {c.unread > 0 && <span className={styles.unreadBadge}>{c.unread}</span>}
                  </div>
                  <div className={styles.msgListPreview}>{c.lastMessage.slice(0, 60)}</div>
                  <div className={styles.msgListTime}>{formatDistanceToNow(parseISO(c.lastAt), { addSuffix: true })}</div>
                </button>
              ))
            )}
          </div>

          {/* Thread */}
          <div className={styles.msgThreadPane}>
            {!selected ? (
              <p className={styles.emptyText}>Select a conversation.</p>
            ) : (
              <>
                <div className={styles.msgThreadHeader}>{selectedName}</div>
                <div className={styles.msgThread}>
                  {thread.map(m => (
                    <div key={m.id} className={m.sender_id === educatorId ? styles.msgRowMine : styles.msgRowTheirs}>
                      <div className={m.sender_id === educatorId ? styles.msgBubbleMine : styles.msgBubbleTheirs}>
                        {m.content}
                        <div className={styles.msgTime}>{format(parseISO(m.created_at), 'MMM d, h:mm a')}</div>
                      </div>
                    </div>
                  ))}
                  <div ref={threadEndRef} />
                </div>

                {clinicalNudge && (
                  <div className={styles.nudgeBanner}>
                    This reads as clinical content. Keep this channel to logistics; move clinical follow-up to the secure Google Workspace lane.
                  </div>
                )}

                <form onSubmit={handleSend} className={styles.msgComposer}>
                  <input
                    className={styles.searchInput}
                    type="text"
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    placeholder="Write a message..."
                    maxLength={1000}
                  />
                  <button type="submit" className={shared.btnTeal} disabled={sending || !draft.trim()}>
                    <Send size={14} /> {sending ? 'Sending...' : 'Send'}
                  </button>
                  <button type="button" className={shared.btnGhost} onClick={() => educatorId && fetchConversations(educatorId)} aria-label="Refresh">
                    <RefreshCw size={14} />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
