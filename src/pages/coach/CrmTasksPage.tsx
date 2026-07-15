import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { format, isPast, isToday, isTomorrow, startOfDay, endOfDay } from 'date-fns'
import s from './Crm.module.css'

interface TaskRow {
  id: string
  title: string
  due_at: string
  status: 'open' | 'done' | 'snoozed'
  snoozed_until: string | null
  lead_id: string | null
  profile_id: string | null
  leads: { first_name: string | null; last_name: string | null; email: string } | null
  profiles: { first_name: string | null; last_name: string | null } | null
}

function contactName(t: TaskRow): string {
  if (t.leads) return [t.leads.first_name, t.leads.last_name].filter(Boolean).join(' ') || t.leads.email
  if (t.profiles) return [t.profiles.first_name, t.profiles.last_name].filter(Boolean).join(' ')
  return 'Unknown'
}

function dueDateLabel(due: string): string {
  const d = new Date(due)
  if (isToday(d)) return 'Today'
  if (isTomorrow(d)) return 'Tomorrow'
  return format(d, 'MMM d, yyyy')
}

export default function CrmTasksPage() {
  const [tasks, setTasks] = useState<TaskRow[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => { fetchTasks() }, [])

  async function fetchTasks() {
    setLoading(true)
    const { data } = await supabase
      .from('tasks')
      .select('*, leads(first_name, last_name, email), profiles(first_name, last_name)')
      .in('status', ['open', 'snoozed'])
      .order('due_at')
    setTasks((data as TaskRow[]) ?? [])
    setLoading(false)
  }

  async function completeTask(id: string) {
    await supabase.from('tasks').update({ status: 'done', completed_at: new Date().toISOString() }).eq('id', id)
    setTasks(t => t.filter(task => task.id !== id))
  }

  async function snoozeTask(id: string) {
    const until = new Date()
    until.setDate(until.getDate() + 1)
    until.setHours(9, 0, 0, 0)
    await supabase.from('tasks').update({ status: 'snoozed', snoozed_until: until.toISOString() }).eq('id', id)
    setTasks(t => t.map(task => task.id === id ? { ...task, status: 'snoozed', snoozed_until: until.toISOString() } : task))
  }

  function openContact(t: TaskRow) {
    if (t.lead_id) navigate(`/coach/crm?lead=${t.lead_id}`)
    else if (t.profile_id) navigate(`/coach/crm?client=${t.profile_id}`)
  }

  const now = new Date()
  const todayStart = startOfDay(now)
  const todayEnd = endOfDay(now)

  const overdue = tasks.filter(t => t.status === 'open' && new Date(t.due_at) < todayStart)
  const todayTasks = tasks.filter(t => t.status === 'open' && new Date(t.due_at) >= todayStart && new Date(t.due_at) <= todayEnd)
  const upcoming = tasks.filter(t => t.status === 'open' && new Date(t.due_at) > todayEnd)
  const snoozed = tasks.filter(t => t.status === 'snoozed')

  function renderGroup(label: string, group: TaskRow[], overdueMark = false) {
    return (
      <div className={`${s.taskGroup} ${overdueMark ? s.taskGroupOverdue : ''}`}>
        <div className={s.taskGroupLabel}>{label} ({group.length})</div>
        {group.length === 0 && <div className={s.emptyGroup}>None</div>}
        {group.map(t => (
          <div key={t.id} className={s.taskCard}>
            <div className={s.taskCardInfo} onClick={() => openContact(t)}>
              <div className={s.taskCardTitle}>{t.title}</div>
              <div className={s.taskCardContact}>{contactName(t)}</div>
            </div>
            <div className={`${s.taskCardDue} ${overdueMark ? s.taskCardOverdueDue : ''}`}>
              {dueDateLabel(t.due_at)}
            </div>
            <button className={s.ghostBtn} onClick={() => snoozeTask(t.id)}>Snooze</button>
            <button className={s.taskCardComplete} onClick={() => completeTask(t.id)}>Done</button>
          </div>
        ))}
      </div>
    )
  }

  const total = tasks.length

  return (
    <div className={s.tasksPage}>
      <div className={s.header}>
        <div>
          <h1 className={s.title}>Tasks</h1>
          <p className={s.sub}>{total} open{overdue.length > 0 ? ` · ${overdue.length} overdue` : ''}</p>
        </div>
      </div>

      <nav className={s.crmNav}>
        <NavLink to="/coach/crm" end className={({ isActive }) => `${s.crmNavLink} ${isActive ? s.crmNavLinkActive : ''}`}>Pipeline</NavLink>
        <NavLink to="/coach/crm/tasks" className={({ isActive }) => `${s.crmNavLink} ${isActive ? s.crmNavLinkActive : ''}`}>Tasks</NavLink>
        <NavLink to="/coach/crm/calendar" className={({ isActive }) => `${s.crmNavLink} ${isActive ? s.crmNavLinkActive : ''}`}>Calendar</NavLink>
      </nav>

      <div className={s.tasksContent}>
        {loading ? (
          <div className={s.loading}>Loading tasks...</div>
        ) : (
          <>
            {renderGroup('Overdue', overdue, true)}
            {renderGroup('Today', todayTasks)}
            {renderGroup('Upcoming', upcoming)}
            {snoozed.length > 0 && renderGroup('Snoozed', snoozed)}
          </>
        )}
      </div>
    </div>
  )
}
