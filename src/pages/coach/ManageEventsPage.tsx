import { useEffect, useState } from 'react'
import { CalendarDays, Plus, Trash2, Zap, Star, BookOpen, Megaphone } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { format, parseISO } from 'date-fns'
import toast from 'react-hot-toast'
import styles from './Coach.module.css'

interface CalEvent {
  id: string
  title: string
  description: string | null
  event_type: string
  start_date: string
  start_time: string | null
  end_time: string | null
  created_at: string
}

const TYPE_OPTIONS = [
  { value: 'challenge', label: 'Challenge', icon: Zap, color: '#c8a74b' },
  { value: 'session', label: 'Group Session', icon: Star, color: '#0B9E8E' },
  { value: 'class', label: 'Class / Webinar', icon: BookOpen, color: '#4b9ee0' },
  { value: 'announcement', label: 'Announcement', icon: Megaphone, color: '#e08a4b' },
  { value: 'general', label: 'General Event', icon: CalendarDays, color: '#91a0ac' },
]

const EMPTY_FORM = {
  title: '',
  description: '',
  event_type: 'general',
  start_date: '',
  start_time: '',
  end_time: '',
}

function fmt12(time: string | null) {
  if (!time) return ''
  const [h, m] = time.split(':').map(Number)
  const ampm = h >= 12 ? 'pm' : 'am'
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`
}

export default function ManageEventsPage() {
  const { user } = useAuthStore()
  const [events, setEvents] = useState<CalEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchEvents() }, [])

  const fetchEvents = async () => {
    const { data } = await supabase
      .from('events')
      .select('*')
      .order('start_date', { ascending: true })
    setEvents((data ?? []) as CalEvent[])
    setLoading(false)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.start_date || !user?.id) return
    setSaving(true)
    const { error } = await supabase.from('events').insert({
      created_by: user.id,
      title: form.title.trim(),
      description: form.description.trim() || null,
      event_type: form.event_type,
      start_date: form.start_date,
      start_time: form.start_time || null,
      end_time: form.end_time || null,
    })
    if (error) {
      toast.error('Failed to create event')
    } else {
      toast.success('Event created.')
      setForm(EMPTY_FORM)
      setShowForm(false)
      fetchEvents()
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('events').delete().eq('id', id)
    if (error) { toast.error('Could not delete event'); return }
    toast.success('Event removed.')
    setEvents(ev => ev.filter(e => e.id !== id))
  }

  const field = (key: keyof typeof form) => (
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }))
  )

  const typeColor = TYPE_OPTIONS.find(t => t.value === form.event_type)?.color ?? '#91a0ac'

  return (
    <div className={styles.evMgmtPage}>
      <div className={styles.evMgmtHeader}>
        <div>
          <h2 className={styles.evMgmtTitle}><CalendarDays size={20} color="var(--gold)" /> Events and Challenges</h2>
          <p className={styles.evMgmtSub}>Create events your participants will see on their calendar</p>
        </div>
        <button className={styles.evMgmtAddBtn} onClick={() => setShowForm(v => !v)}>
          <Plus size={16} /> {showForm ? 'Cancel' : 'New Event'}
        </button>
      </div>

      {showForm && (
        <form className={styles.evForm} onSubmit={handleCreate}>
          <div className={styles.evFormRow}>
            <div className={styles.evFormField}>
              <label className={styles.evFormLabel}>Title</label>
              <input
                className={styles.evFormInput}
                value={form.title}
                onChange={field('title')}
                placeholder="e.g. 7-Day Step Challenge"
                maxLength={120}
                required
              />
            </div>
            <div className={styles.evFormField}>
              <label className={styles.evFormLabel}>Type</label>
              <select className={styles.evFormSelect} value={form.event_type} onChange={field('event_type')}>
                {TYPE_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.evFormRow}>
            <div className={styles.evFormField}>
              <label className={styles.evFormLabel}>Date</label>
              <input type="date" className={styles.evFormInput} value={form.start_date} onChange={field('start_date')} required />
            </div>
            <div className={styles.evFormField}>
              <label className={styles.evFormLabel}>Start time (optional)</label>
              <input type="time" className={styles.evFormInput} value={form.start_time} onChange={field('start_time')} />
            </div>
            <div className={styles.evFormField}>
              <label className={styles.evFormLabel}>End time (optional)</label>
              <input type="time" className={styles.evFormInput} value={form.end_time} onChange={field('end_time')} />
            </div>
          </div>

          <div className={styles.evFormField}>
            <label className={styles.evFormLabel}>Description (optional)</label>
            <textarea
              className={styles.evFormTextarea}
              value={form.description}
              onChange={field('description')}
              placeholder="Details, link to Zoom, challenge rules, etc."
              rows={3}
              maxLength={600}
            />
          </div>

          <div className={styles.evFormActions}>
            <div className={styles.evTypePreview} style={{ color: typeColor, borderColor: `${typeColor}40`, background: `${typeColor}10` }}>
              {TYPE_OPTIONS.find(t => t.value === form.event_type)?.label}
            </div>
            <button type="submit" className={styles.evFormSubmit} disabled={saving}>
              {saving ? 'Saving...' : 'Create Event'}
            </button>
          </div>
        </form>
      )}

      {/* Event list */}
      <div className={styles.evMgmtList}>
        {loading ? (
          <p className={styles.evMgmtEmpty}>Loading events...</p>
        ) : events.length === 0 ? (
          <div className={styles.evMgmtEmptyState}>
            <CalendarDays size={36} color="var(--border)" />
            <p>No events yet. Create one above to get started.</p>
          </div>
        ) : (
          events.map(ev => {
            const cfg = TYPE_OPTIONS.find(t => t.value === ev.event_type) ?? TYPE_OPTIONS[4]
            const Icon = cfg.icon
            return (
              <div key={ev.id} className={styles.evMgmtRow} style={{ borderLeft: `3px solid ${cfg.color}` }}>
                <div className={styles.evMgmtRowLeft}>
                  <span className={styles.evMgmtType} style={{ color: cfg.color }}>
                    <Icon size={13} /> {cfg.label}
                  </span>
                  <span className={styles.evMgmtRowTitle}>{ev.title}</span>
                  {ev.description && <span className={styles.evMgmtRowDesc}>{ev.description}</span>}
                </div>
                <div className={styles.evMgmtRowRight}>
                  <span className={styles.evMgmtDate}>
                    {format(parseISO(ev.start_date), 'MMM d, yyyy')}
                    {ev.start_time && ` at ${fmt12(ev.start_time)}`}
                  </span>
                  <button
                    className={styles.evMgmtDelete}
                    onClick={() => handleDelete(ev.id)}
                    title="Delete event"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
