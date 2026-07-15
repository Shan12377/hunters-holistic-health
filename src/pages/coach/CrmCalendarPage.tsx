import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { format, isFuture, isPast } from 'date-fns'
import s from './Crm.module.css'

interface ApptRow {
  id: string
  appointment_type: string | null
  start_at: string
  end_at: string
  status: string
  attendee_name: string | null
  attendee_email: string | null
  lead_id: string | null
  profile_id: string | null
  leads: { first_name: string | null; last_name: string | null; email: string } | null
  profiles: { first_name: string | null; last_name: string | null } | null
}

function contactName(a: ApptRow): string {
  if (a.attendee_name) return a.attendee_name
  if (a.leads) return [a.leads.first_name, a.leads.last_name].filter(Boolean).join(' ') || a.leads.email
  if (a.profiles) return [a.profiles.first_name, a.profiles.last_name].filter(Boolean).join(' ')
  if (a.attendee_email) return a.attendee_email
  return 'Unknown'
}

const STATUS_CLASS: Record<string, string> = {
  booked: s.apptStatusBooked,
  completed: s.apptStatusCompleted,
  cancelled: s.apptStatusCancelled,
  no_show: s.apptStatusNoShow,
}

export default function CrmCalendarPage() {
  const [upcoming, setUpcoming] = useState<ApptRow[]>([])
  const [past, setPast] = useState<ApptRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchAppointments() }, [])

  async function fetchAppointments() {
    setLoading(true)
    const { data } = await supabase
      .from('appointments')
      .select('*, leads(first_name, last_name, email), profiles(first_name, last_name)')
      .order('start_at', { ascending: false })
      .limit(60)
    const all = (data as ApptRow[]) ?? []
    setUpcoming(all.filter(a => isFuture(new Date(a.start_at))).reverse())
    setPast(all.filter(a => isPast(new Date(a.start_at))).slice(0, 10))
    setLoading(false)
  }

  return (
    <div className={s.calPage}>
      <div className={s.header}>
        <div>
          <h1 className={s.title}>Calendar</h1>
          <p className={s.sub}>TidyCal bookings + upcoming appointments</p>
        </div>
      </div>

      <nav className={s.crmNav}>
        <NavLink to="/coach/crm" end className={({ isActive }) => `${s.crmNavLink} ${isActive ? s.crmNavLinkActive : ''}`}>Pipeline</NavLink>
        <NavLink to="/coach/crm/tasks" className={({ isActive }) => `${s.crmNavLink} ${isActive ? s.crmNavLinkActive : ''}`}>Tasks</NavLink>
        <NavLink to="/coach/crm/calendar" className={({ isActive }) => `${s.crmNavLink} ${isActive ? s.crmNavLinkActive : ''}`}>Calendar</NavLink>
      </nav>

      {loading ? (
        <div className={s.loading}>Loading appointments...</div>
      ) : (
        <div className={s.calContent}>
          {/* Upcoming agenda */}
          <div>
            <div className={s.boardSectionLabel} style={{ marginBottom: 12 }}>Upcoming</div>
            {upcoming.length === 0 && <div className={s.noAppts}>No upcoming appointments. New TidyCal bookings will appear here after the next n8n sync (every 10 minutes).</div>}
            {upcoming.map(a => (
              <div key={a.id} className={s.apptCard}>
                <div className={s.apptCardType}>{a.appointment_type ?? 'Consultation'}</div>
                <div className={s.apptCardContact}>{contactName(a)}</div>
                <div className={s.apptCardTime}>
                  {format(new Date(a.start_at), 'EEEE, MMM d · h:mm a')}
                  {' – '}
                  {format(new Date(a.end_at), 'h:mm a')}
                </div>
                <span className={`${s.apptStatus} ${STATUS_CLASS[a.status] ?? ''}`}>{a.status.replace('_', ' ')}</span>
              </div>
            ))}

            {past.length > 0 && (
              <>
                <div className={s.boardSectionLabel} style={{ marginTop: 28, marginBottom: 12 }}>Recent (past 10)</div>
                {past.map(a => (
                  <div key={a.id} className={s.apptCard} style={{ opacity: 0.65 }}>
                    <div className={s.apptCardType}>{a.appointment_type ?? 'Consultation'}</div>
                    <div className={s.apptCardContact}>{contactName(a)}</div>
                    <div className={s.apptCardTime}>{format(new Date(a.start_at), 'MMM d, yyyy · h:mm a')}</div>
                    <span className={`${s.apptStatus} ${STATUS_CLASS[a.status] ?? ''}`}>{a.status.replace('_', ' ')}</span>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* TidyCal booking box */}
          <div className={s.calSection}>
            <div className={s.calSectionTitle}>Book a Consultation</div>
            <div className={s.tidyCalBox}>
              <p className={s.tidyCalDesc}>
                Open TidyCal to share your booking link or schedule a consultation directly. New bookings sync into this calendar within 10 minutes via the TidyCal CRM Sync workflow in n8n.
              </p>
              <a
                href="https://tidycal.com"
                target="_blank"
                rel="noopener noreferrer"
                className={s.tidyCalLink}
              >
                Open TidyCal →
              </a>
              <p className={s.tidyCalDesc} style={{ marginTop: 8, fontSize: '0.75rem', opacity: 0.7 }}>
                Sync status: appointments appear here after the n8n "TidyCal CRM Sync" workflow runs. Set that workflow up in n8n on Railway to start pulling bookings automatically.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
