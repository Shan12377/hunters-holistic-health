import { useEffect, useState } from 'react'
import { CalendarDays, ExternalLink, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import styles from './Client.module.css'
import shared from '../../styles/shared.module.css'

const DOXY_URL = 'https://doxy.me/drshallandahunter'

const SESSION_TYPES = [
  'Functional Medicine Education',
  'Follow-up',
  'Protocol Review',
] as const

type SessionType = typeof SESSION_TYPES[number]
type SessionStatus = 'scheduled' | 'completed' | 'cancelled'

interface Session {
  id: string
  user_id: string
  session_date: string
  session_time: string
  session_type: SessionType
  status: SessionStatus
  created_at: string
}

function formatSessionDate(dateStr: string): string {
  return format(new Date(dateStr + 'T12:00:00'), 'EEEE, MMMM d, yyyy')
}

function formatSessionTime(timeStr: string): string {
  return format(new Date(`1970-01-01T${timeStr}`), 'h:mm a')
}

const STATUS_CLASS: Record<SessionStatus, string> = {
  scheduled: 'sessionStatusScheduled',
  completed: 'sessionStatusCompleted',
  cancelled: 'sessionStatusCancelled',
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const today = format(new Date(), 'yyyy-MM-dd')
  const [form, setForm] = useState({
    session_date: '',
    session_time: '09:00',
    session_type: 'Functional Medicine Education' as SessionType,
  })

  useEffect(() => { fetchSessions() }, [])

  const fetchSessions = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('session_date', { ascending: true })
      .order('session_time', { ascending: true })
    setSessions((data ?? []) as Session[])
    setLoading(false)
  }

  const bookSession = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.session_date || !form.session_time) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    const { error } = await supabase.from('sessions').insert({
      user_id: user.id,
      session_date: form.session_date,
      session_time: form.session_time,
      session_type: form.session_type,
      status: 'scheduled',
    })
    if (error) {
      toast.error('Failed to book session. Please try again.')
    } else {
      toast.success('Session booked!')
      setForm({ session_date: '', session_time: '09:00', session_type: 'Functional Medicine Education' })
      setShowForm(false)
      fetchSessions()
    }
    setSaving(false)
  }

  const cancelSession = async (id: string) => {
    await supabase.from('sessions').update({ status: 'cancelled' }).eq('id', id)
    setSessions(s => s.map(x => x.id === id ? { ...x, status: 'cancelled' as SessionStatus } : x))
    toast('Session cancelled.', { icon: '📅' })
  }

  const upcoming = sessions.filter(s => s.status === 'scheduled' && s.session_date >= today)
  const past = sessions.filter(s => s.status !== 'scheduled' || s.session_date < today)

  return (
    <div className="animate-fade-in">
      <div className={styles.pageTop}>
        <div>
          <h1 className={styles.pageTopTitle}>
            <CalendarDays size={22} color="var(--teal)" /> My Sessions
          </h1>
          <p className={styles.pageTopDate}>{format(new Date(), 'EEEE, MMMM d')}</p>
        </div>
        <button className={shared.btnSecondary} onClick={() => setShowForm(v => !v)}>
          {showForm ? 'Cancel' : '+ Book Session'}
        </button>
      </div>

      <p className={styles.sessionsNotice}>
        These sessions are educational consultations with your Functional Medicine Educator. They are not medical appointments. For clinical matters, your educator will direct you through the appropriate clinical intake process.
      </p>

      {/* Booking form */}
      {showForm && (
        <div className={styles.card}>
          <h3 className={styles.cardTitleSolo}>Book a Session</h3>
          <form onSubmit={bookSession}>
            <div className={styles.sessionsFormGrid}>
              <div className={styles.field}>
                <label className={styles.label}>Date</label>
                <input
                  className={styles.input}
                  type="date"
                  required
                  min={today}
                  value={form.session_date}
                  onChange={e => setForm(f => ({ ...f, session_date: e.target.value }))}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Time</label>
                <input
                  className={styles.input}
                  type="time"
                  required
                  value={form.session_time}
                  onChange={e => setForm(f => ({ ...f, session_time: e.target.value }))}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Session Type</label>
                <select
                  className={styles.input}
                  value={form.session_type}
                  onChange={e => setForm(f => ({ ...f, session_type: e.target.value as SessionType }))}
                >
                  {SESSION_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className={styles.formActions}>
              <button type="submit" className={shared.btnPrimary} disabled={saving}>
                {saving ? 'Booking...' : 'Confirm Booking'}
              </button>
              <button type="button" className={shared.btnSecondary} onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Upcoming sessions */}
      <div className={styles.card}>
        <h3 className={styles.cardTitleSolo}>Upcoming Sessions</h3>
        {loading ? (
          <p className={styles.loadingText}>Loading...</p>
        ) : upcoming.length === 0 ? (
          <div className={styles.chartEmpty}>
            <CalendarDays size={36} color="var(--border-subtle)" />
            <p>No upcoming sessions.</p>
            <p>Use the booking form above to schedule your next consultation.</p>
          </div>
        ) : (
          <div className={styles.sessionsList}>
            {upcoming.map(s => (
              <div key={s.id} className={styles.sessionCard}>
                <div className={styles.sessionCardHeader}>
                  <div>
                    <div className={styles.sessionCardDate}>{formatSessionDate(s.session_date)}</div>
                    <div className={styles.sessionCardTime}>{formatSessionTime(s.session_time)}</div>
                  </div>
                  <span className={styles.sessionCardType}>{s.session_type}</span>
                </div>
                <div className={styles.sessionCardActions}>
                  <a
                    href={DOXY_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.sessionDoxyLink}
                  >
                    <ExternalLink size={14} /> Join Session Room
                  </a>
                  <button
                    className={styles.sessionCancelBtn}
                    onClick={() => cancelSession(s.id)}
                  >
                    <X size={12} /> Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past sessions */}
      {past.length > 0 && (
        <div className={styles.card}>
          <h3 className={styles.cardTitleSolo}>Past Sessions</h3>
          <div className={styles.sessionsList}>
            {past.map(s => (
              <div key={s.id} className={styles.sessionCard}>
                <div className={styles.sessionCardHeader}>
                  <div>
                    <div className={styles.sessionCardDate}>{formatSessionDate(s.session_date)}</div>
                    <div className={styles.sessionCardTime}>{formatSessionTime(s.session_time)}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                    <span className={styles.sessionCardType}>{s.session_type}</span>
                    <span className={`${styles.sessionStatusBadge} ${styles[STATUS_CLASS[s.status]]}`}>
                      {s.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className={styles.footerNote}>
        Sessions are educational consultations only. Scheduling through this app does not create a patient-provider relationship.
      </p>
    </div>
  )
}
