import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, Send, RefreshCw } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { looksClinical } from '@/lib/clinicalNudge'
import PlanGate from '@/components/ui/PlanGate'
import { parseISO, format } from 'date-fns'
import toast from 'react-hot-toast'
import styles from './Client.module.css'
import shared from '../../styles/shared.module.css'

interface Message {
  id: string
  sender_id: string
  recipient_id: string
  content: string
  read: boolean
  created_at: string
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [educatorId, setEducatorId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const threadEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => { init() }, [])

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function init() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUserId(user.id)
    const { data: educator } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'educator')
      .limit(1)
      .single()
    if (!educator) { setLoading(false); return }
    setEducatorId(educator.id)
    await fetchThread(user.id, educator.id)
    setLoading(false)
  }

  async function fetchThread(uid: string, eid: string) {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${uid},recipient_id.eq.${eid}),and(sender_id.eq.${eid},recipient_id.eq.${uid})`)
      .order('created_at', { ascending: true })
      .limit(200)
    const msgs = (data as Message[]) ?? []
    setMessages(msgs)
    // Mark received messages as read
    const unreadIds = msgs.filter(m => m.recipient_id === uid && !m.read).map(m => m.id)
    if (unreadIds.length > 0) {
      await supabase.from('messages').update({ read: true }).in('id', unreadIds)
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!draft.trim() || !userId || !educatorId) return
    setSending(true)
    const { error } = await supabase.from('messages').insert({
      sender_id: userId,
      recipient_id: educatorId,
      content: draft.trim(),
    })
    if (error) {
      toast.error('Message failed to send')
    } else {
      setDraft('')
      await fetchThread(userId, educatorId)
    }
    setSending(false)
  }

  const clinicalNudge = looksClinical(draft)

  return (
    <PlanGate requiredPlan="vip" label="Direct messaging is available on VIP: The Intensive and above.">
    <div className="animate-fade-in">
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTopTitle}>
          <MessageCircle size={22} color="var(--teal)" /> Messages
        </h1>
        <p className={styles.pageTopDate}>
          Logistics, encouragement, and program questions with your educator
        </p>
      </div>

      {/* Standing scope notice */}
      <div className={shared.alertGold}>
        This channel is for scheduling, program logistics, and encouragement. Please do not share symptoms, medications, lab results, or other health details here. For clinical topics, use the{' '}
        <Link to="/clinical-inquiry" className={styles.consentLinkInline}>Clinical Inquiry form</Link>{' '}
        so your information is handled through the secure clinical process.
      </div>

      <div className={styles.msgCard}>
        {loading ? (
          <div className={styles.loadingText}>Loading conversation...</div>
        ) : !educatorId ? (
          <p className={styles.emptyText}>Messaging will be available once your educator account is set up.</p>
        ) : (
          <>
            <div className={styles.msgThread}>
              {messages.length === 0 ? (
                <p className={styles.emptyText}>No messages yet. Say hello!</p>
              ) : (
                messages.map(m => (
                  <div key={m.id} className={m.sender_id === userId ? styles.msgRowMine : styles.msgRowTheirs}>
                    <div className={m.sender_id === userId ? styles.msgBubbleMine : styles.msgBubbleTheirs}>
                      {m.content}
                      <div className={styles.msgTime}>{format(parseISO(m.created_at), 'MMM d, h:mm a')}</div>
                    </div>
                  </div>
                ))
              )}
              <div ref={threadEndRef} />
            </div>

            {clinicalNudge && (
              <div className={styles.nudgeBanner}>
                This looks like it might be a health question. Your educator cannot respond to clinical details in this channel. Consider the{' '}
                <Link to="/clinical-inquiry" className={styles.consentLinkInline}>Clinical Inquiry form</Link> instead.
              </div>
            )}

            <form onSubmit={handleSend} className={styles.msgComposer}>
              <input
                className={styles.input}
                type="text"
                value={draft}
                onChange={e => setDraft(e.target.value)}
                placeholder="Write a message..."
                maxLength={1000}
              />
              <button type="submit" className={shared.btnTeal} disabled={sending || !draft.trim()}>
                <Send size={14} /> {sending ? 'Sending...' : 'Send'}
              </button>
              <button type="button" className={shared.btnGhost} onClick={() => userId && educatorId && fetchThread(userId, educatorId)} aria-label="Refresh">
                <RefreshCw size={14} />
              </button>
            </form>
          </>
        )}
      </div>

      <p className={styles.footerNote}>
        Messages are part of the educational program record, not a medical record. For urgent concerns, use the support form. For emergencies, call 911.
      </p>
    </div>
    </PlanGate>
  )
}
