import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import styles from './BrainDumpPage.module.css'

type RouteKey = 'content_idea' | 'crm_followup' | 'feature_request' | 'challenge_idea'

interface BrainDumpItem {
  id: string
  body: string
  routed_to: RouteKey | null
  routed_at: string | null
  created_at: string
}

const ROUTE_OPTIONS: { key: RouteKey; label: string; icon: string }[] = [
  { key: 'content_idea',    label: 'Content Idea',    icon: '✍' },
  { key: 'crm_followup',   label: 'CRM Follow-up',   icon: '⟳' },
  { key: 'feature_request', label: 'Feature Request', icon: '⚡' },
  { key: 'challenge_idea',  label: 'Challenge Idea',  icon: '★' },
]

export default function BrainDumpPage() {
  const { user } = useAuthStore()
  const [items, setItems] = useState<BrainDumpItem[]>([])
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [routing, setRouting] = useState<string | null>(null)

  useEffect(() => {
    if (user?.id) void fetchItems()
  }, [user?.id])

  async function fetchItems() {
    setLoading(true)
    const { data, error } = await supabase
      .from('brain_dump_items')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
    if (!error) setItems((data ?? []) as BrainDumpItem[])
    setLoading(false)
  }

  async function handleCapture(e: FormEvent) {
    e.preventDefault()
    if (!body.trim() || !user?.id) return
    setSaving(true)
    const { data, error } = await supabase
      .from('brain_dump_items')
      .insert({ user_id: user.id, body: body.trim() })
      .select()
      .single()
    if (error) {
      toast.error('Could not save item.')
    } else {
      setItems(prev => [data as BrainDumpItem, ...prev])
      setBody('')
      toast.success('Captured.')
    }
    setSaving(false)
  }

  async function handleRoute(id: string, key: RouteKey) {
    setRouting(id)
    const now = new Date().toISOString()
    const { error } = await supabase
      .from('brain_dump_items')
      .update({ routed_to: key, routed_at: now })
      .eq('id', id)
    if (error) {
      toast.error('Could not route item.')
    } else {
      setItems(prev => prev.map(item =>
        item.id === id ? { ...item, routed_to: key, routed_at: now } : item
      ))
      toast.success(`Routed to ${ROUTE_OPTIONS.find(r => r.key === key)?.label}.`)
    }
    setRouting(null)
  }

  async function handleUnroute(id: string) {
    setRouting(id)
    const { error } = await supabase
      .from('brain_dump_items')
      .update({ routed_to: null, routed_at: null })
      .eq('id', id)
    if (error) {
      toast.error('Could not unroute item.')
    } else {
      setItems(prev => prev.map(item =>
        item.id === id ? { ...item, routed_to: null, routed_at: null } : item
      ))
    }
    setRouting(null)
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from('brain_dump_items').delete().eq('id', id)
    if (error) {
      toast.error('Could not delete item.')
    } else {
      setItems(prev => prev.filter(item => item.id !== id))
    }
  }

  const unrouted = items.filter(i => !i.routed_to)
  const routed = items.filter(i => i.routed_to)

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Brain Dump</h1>
        <p className={styles.sub}>Capture anything. Route it later. Nothing gets lost.</p>
      </div>

      <div className={styles.body}>
        <form className={styles.captureForm} onSubmit={handleCapture}>
          <textarea
            className={styles.captureTextarea}
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="What is on your mind? Content idea, follow-up you need to send, feature you want built, challenge you are designing..."
            rows={5}
          />
          <div className={styles.captureActions}>
            <span className={styles.charCount}>{body.length > 0 ? `${body.length} characters` : ''}</span>
            <button className={styles.captureBtn} type="submit" disabled={saving || !body.trim()}>
              {saving ? 'Saving...' : 'Capture'}
            </button>
          </div>
        </form>

        {loading ? (
          <div className={styles.emptyMsg}>Loading...</div>
        ) : (
          <>
            {unrouted.length > 0 && (
              <section>
                <div className={styles.sectionLabel}>To Route ({unrouted.length})</div>
                <div className={styles.itemList}>
                  {unrouted.map(item => (
                    <div key={item.id} className={styles.itemCard}>
                      <div className={styles.itemBody}>{item.body}</div>
                      <div className={styles.itemMeta}>
                        {format(new Date(item.created_at), 'MMM d, h:mm a')}
                      </div>
                      <div className={styles.routeButtons}>
                        {ROUTE_OPTIONS.map(opt => (
                          <button
                            key={opt.key}
                            className={styles.routeBtn}
                            onClick={() => void handleRoute(item.id, opt.key)}
                            disabled={routing === item.id}
                          >
                            <span>{opt.icon}</span>
                            {opt.label}
                          </button>
                        ))}
                        <button
                          className={styles.deleteBtn}
                          onClick={() => void handleDelete(item.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {unrouted.length === 0 && routed.length === 0 && (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>✍</div>
                <div className={styles.emptyTitle}>Nothing captured yet</div>
                <div className={styles.emptyHint}>Type anything above and hit Capture. You can route it to the right place after.</div>
              </div>
            )}

            {routed.length > 0 && (
              <section>
                <div className={styles.sectionLabel}>Done ({routed.length})</div>
                <div className={styles.itemList}>
                  {routed.map(item => {
                    const route = ROUTE_OPTIONS.find(r => r.key === item.routed_to)
                    return (
                      <div key={item.id} className={`${styles.itemCard} ${styles.itemCardDone}`}>
                        <div className={styles.routedBadge}>
                          <span>{route?.icon}</span>
                          {route?.label ?? item.routed_to}
                        </div>
                        <div className={styles.itemBodyDone}>{item.body}</div>
                        <div className={styles.itemActions}>
                          <button
                            className={styles.unrouteBtn}
                            onClick={() => void handleUnroute(item.id)}
                            disabled={routing === item.id}
                          >
                            Move back
                          </button>
                          <button
                            className={styles.deleteBtn}
                            onClick={() => void handleDelete(item.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  )
}
