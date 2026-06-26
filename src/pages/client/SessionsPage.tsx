import { useEffect, useState } from 'react'
import { CalendarDays, ExternalLink, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import styles from './Client.module.css'
import shared from '../../styles/shared.module.css'
// ponytail: toast/X/ExternalLink kept for cancel + join session room below

const DOXY_URL = 'https://doxy.me/drshallandahunter'
const TIDYCAL_URL = 'https://tidycal.com/drshallandahunter'

type SessionStatus = 'scheduled' | 'completed' | 'cancelled'

interface Session {
  id: string
  user_id: string
  session_date: string
  session_time: string
  session_type: string
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
  const today = format(new Date(), 'yyyy-MM-dd')

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
        <a
          href={TIDYCAL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={shared.btnSecondary}
        >
          + Book Session
        </a>
      </div>

      <p className={styles.sessionsNotice}>
        These sessions are educational consultations with your Functional Medicine Educator. They are not medical appointments. For clinical matters, your educator will direct you through the appropriate clinical intake process.
      </p>

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
                  <div className={styles.sessionCardBadges}>
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
