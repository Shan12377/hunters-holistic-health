import { useEffect, useState, useMemo } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, Clock, Zap, Megaphone, BookOpen, Star } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, isAfter, parseISO,
  addMonths, subMonths, isPast,
} from 'date-fns'
import styles from './Client.module.css'

interface CalEvent {
  id: string
  title: string
  description: string | null
  event_type: 'session' | 'challenge' | 'class' | 'announcement' | 'general'
  start_date: string
  start_time: string | null
  end_time: string | null
}

const TYPE_CONFIG = {
  challenge: { icon: Zap, color: '#c8a74b', label: 'Challenge' },
  session: { icon: Star, color: '#0B9E8E', label: 'Group Session' },
  class: { icon: BookOpen, color: '#4b9ee0', label: 'Class' },
  announcement: { icon: Megaphone, color: '#e08a4b', label: 'Announcement' },
  general: { icon: CalendarDays, color: '#91a0ac', label: 'Event' },
}

function fmt12(time: string | null) {
  if (!time) return null
  const [h, m] = time.split(':').map(Number)
  const ampm = h >= 12 ? 'pm' : 'am'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`
}

export default function EventsPage() {
  const [events, setEvents] = useState<CalEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMonth, setViewMonth] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)

  useEffect(() => { fetchEvents() }, [])

  const fetchEvents = async () => {
    const today = format(new Date(), 'yyyy-MM-dd')
    const { data } = await supabase
      .from('events')
      .select('id, title, description, event_type, start_date, start_time, end_time')
      .gte('start_date', today)
      .order('start_date', { ascending: true })
      .limit(60)
    setEvents((data ?? []) as CalEvent[])
    setLoading(false)
  }

  // Calendar grid
  const monthStart = startOfMonth(viewMonth)
  const monthEnd = endOfMonth(viewMonth)
  const calStart = startOfWeek(monthStart)
  const calEnd = endOfWeek(monthEnd)
  const calDays = eachDayOfInterval({ start: calStart, end: calEnd })

  const eventDates = useMemo(
    () => new Set(events.map(e => e.start_date)),
    [events]
  )

  const visibleEvents = useMemo(() => {
    if (selectedDay) {
      return events.filter(e => e.start_date === format(selectedDay, 'yyyy-MM-dd'))
    }
    return events
  }, [events, selectedDay])

  return (
    <div className={styles.evPage}>
      <div className={styles.evPageHeader}>
        <h1 className={styles.evTitle}>
          <CalendarDays size={22} color="var(--gold)" /> Events and Challenges
        </h1>
        <p className={styles.evSub}>Upcoming sessions, group challenges, and announcements</p>
      </div>

      {/* Calendar widget */}
      <div className={styles.evCalCard}>
        <div className={styles.evCalHeader}>
          <button className={styles.evCalNav} onClick={() => { setViewMonth(m => subMonths(m, 1)); setSelectedDay(null) }}>
            <ChevronLeft size={18} />
          </button>
          <span className={styles.evCalMonth}>{format(viewMonth, 'MMMM yyyy')}</span>
          <button className={styles.evCalNav} onClick={() => { setViewMonth(m => addMonths(m, 1)); setSelectedDay(null) }}>
            <ChevronRight size={18} />
          </button>
        </div>

        <div className={styles.evCalGrid}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className={styles.evCalDayLabel}>{d}</div>
          ))}
          {calDays.map(day => {
            const key = format(day, 'yyyy-MM-dd')
            const hasEvent = eventDates.has(key)
            const isSelected = selectedDay && isSameDay(day, selectedDay)
            const isToday = isSameDay(day, new Date())
            const inMonth = isSameMonth(day, viewMonth)
            return (
              <button
                key={key}
                className={`${styles.evCalDay}
                  ${!inMonth ? styles.evCalDayOther : ''}
                  ${isToday ? styles.evCalDayToday : ''}
                  ${isSelected ? styles.evCalDaySelected : ''}
                  ${hasEvent && inMonth ? styles.evCalDayHasEvent : ''}
                `}
                onClick={() => setSelectedDay(isSelected ? null : day)}
              >
                {format(day, 'd')}
                {hasEvent && inMonth && <span className={styles.evCalDot} />}
              </button>
            )
          })}
        </div>

        {selectedDay && (
          <div className={styles.evCalFooter}>
            Showing events for {format(selectedDay, 'MMMM d')}
            <button className={styles.evCalClear} onClick={() => setSelectedDay(null)}>Clear</button>
          </div>
        )}
      </div>

      {/* Event list */}
      <div className={styles.evList}>
        {loading ? (
          <p className={styles.evEmpty}>Loading events...</p>
        ) : visibleEvents.length === 0 ? (
          <div className={styles.evEmptyState}>
            <CalendarDays size={40} color="var(--border)" />
            <p>{selectedDay ? `No events on ${format(selectedDay, 'MMMM d')}.` : 'No upcoming events. Check back soon.'}</p>
          </div>
        ) : (
          visibleEvents.map(ev => {
            const cfg = TYPE_CONFIG[ev.event_type] ?? TYPE_CONFIG.general
            const Icon = cfg.icon
            const dateLabel = format(parseISO(ev.start_date), 'EEE, MMM d')
            return (
              <div key={ev.id} className={styles.evCard} style={{ borderLeft: `3px solid ${cfg.color}` }}>
                <div className={styles.evCardLeft}>
                  <div className={styles.evDateChip}>
                    <span className={styles.evDateChipDay}>{format(parseISO(ev.start_date), 'd')}</span>
                    <span className={styles.evDateChipMon}>{format(parseISO(ev.start_date), 'MMM')}</span>
                  </div>
                </div>
                <div className={styles.evCardBody}>
                  <div className={styles.evCardTop}>
                    <span className={styles.evTypeBadge} style={{ color: cfg.color, background: `${cfg.color}15`, border: `1px solid ${cfg.color}30` }}>
                      <Icon size={10} /> {cfg.label}
                    </span>
                    <span className={styles.evDateLabel}>{dateLabel}</span>
                  </div>
                  <div className={styles.evCardTitle}>{ev.title}</div>
                  {(ev.start_time || ev.end_time) && (
                    <div className={styles.evCardTime}>
                      <Clock size={12} />
                      {fmt12(ev.start_time)}{ev.end_time ? ` to ${fmt12(ev.end_time)}` : ''}
                    </div>
                  )}
                  {ev.description && (
                    <p className={styles.evCardDesc}>{ev.description}</p>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
