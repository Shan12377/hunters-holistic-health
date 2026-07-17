import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { format, subDays, parseISO } from 'date-fns'
import toast from 'react-hot-toast'
import styles from './HabitTrackerPage.module.css'

type Category =
  | 'sleep' | 'nutrition' | 'movement' | 'supplements'
  | 'stress' | 'hydration' | 'fasting' | 'other'

interface Habit {
  id: string
  name: string
  identity_statement: string
  category: Category
  sort_order: number
  active: boolean
}

interface Log {
  habit_id: string
  log_date: string
  completed: boolean
}

const CATEGORIES: { value: Category; label: string; icon: string }[] = [
  { value: 'sleep',        label: 'Sleep',        icon: '◑' },
  { value: 'nutrition',    label: 'Nutrition',    icon: '⚡' },
  { value: 'movement',     label: 'Movement',     icon: '◎' },
  { value: 'supplements',  label: 'Supplements',  icon: '⬡' },
  { value: 'stress',       label: 'Stress',       icon: '◷' },
  { value: 'hydration',    label: 'Hydration',    icon: '◉' },
  { value: 'fasting',      label: 'Fasting',      icon: '◈' },
  { value: 'other',        label: 'Other',        icon: '★' },
]

const DAYS_SHOWN = 7

const BLANK_HABIT = {
  name: '',
  identity_statement: '',
  category: 'sleep' as Category,
}

export default function HabitTrackerPage() {
  const { user } = useAuthStore()
  const [habits, setHabits]     = useState<Habit[]>([])
  const [logs, setLogs]         = useState<Log[]>([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState(BLANK_HABIT)
  const [saving, setSaving]     = useState(false)
  const [editId, setEditId]     = useState<string | null>(null)

  const today = format(new Date(), 'yyyy-MM-dd')
  const dates = Array.from({ length: DAYS_SHOWN }, (_, i) =>
    format(subDays(new Date(), DAYS_SHOWN - 1 - i), 'yyyy-MM-dd')
  )

  useEffect(() => {
    if (user?.id) fetchAll()
  }, [user?.id])

  async function fetchAll() {
    setLoading(true)
    const [habitsRes, logsRes] = await Promise.all([
      supabase
        .from('habit_identities')
        .select('*')
        .eq('user_id', user!.id)
        .eq('active', true)
        .order('sort_order', { ascending: true }),
      supabase
        .from('habit_logs')
        .select('habit_id, log_date, completed')
        .eq('user_id', user!.id)
        .gte('log_date', dates[0]),
    ])
    if (!habitsRes.error) setHabits(habitsRes.data ?? [])
    if (!logsRes.error) setLogs(logsRes.data ?? [])
    setLoading(false)
  }

  function isCompleted(habitId: string, date: string) {
    return logs.some(l => l.habit_id === habitId && l.log_date === date && l.completed)
  }

  async function toggleDay(habitId: string, date: string) {
    const current = isCompleted(habitId, date)
    const newVal  = !current

    setLogs(prev => {
      const existing = prev.find(l => l.habit_id === habitId && l.log_date === date)
      if (existing) return prev.map(l => l.habit_id === habitId && l.log_date === date ? { ...l, completed: newVal } : l)
      return [...prev, { habit_id: habitId, log_date: date, completed: newVal }]
    })

    const { error } = await supabase
      .from('habit_logs')
      .upsert(
        { user_id: user!.id, habit_id: habitId, log_date: date, completed: newVal },
        { onConflict: 'habit_id,log_date' }
      )
    if (error) {
      setLogs(prev => prev.map(l =>
        l.habit_id === habitId && l.log_date === date ? { ...l, completed: current } : l
      ))
      toast.error('Could not save check-in.')
    }
  }

  function streakFor(habitId: string): number {
    let streak = 0
    const sorted = [...dates].reverse()
    for (const d of sorted) {
      if (isCompleted(habitId, d)) streak++
      else break
    }
    return streak
  }

  function openNew() {
    setForm(BLANK_HABIT)
    setEditId(null)
    setShowForm(true)
  }

  function openEdit(h: Habit) {
    setForm({ name: h.name, identity_statement: h.identity_statement, category: h.category })
    setEditId(h.id)
    setShowForm(true)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.identity_statement.trim()) {
      toast.error('Name and identity statement are required.')
      return
    }
    setSaving(true)

    if (editId) {
      const { error } = await supabase
        .from('habit_identities')
        .update({ name: form.name.trim(), identity_statement: form.identity_statement.trim(), category: form.category })
        .eq('id', editId)
      if (error) {
        toast.error('Could not update habit.')
      } else {
        setHabits(prev => prev.map(h => h.id === editId ? { ...h, ...form } : h))
        toast.success('Habit updated.')
        setShowForm(false)
        setEditId(null)
      }
    } else {
      const { data, error } = await supabase
        .from('habit_identities')
        .insert({
          user_id: user!.id,
          name: form.name.trim(),
          identity_statement: form.identity_statement.trim(),
          category: form.category,
          sort_order: habits.length,
          active: true,
        })
        .select()
        .single()
      if (error) {
        toast.error('Could not add habit.')
      } else {
        setHabits(prev => [...prev, data])
        toast.success('Habit added.')
        setShowForm(false)
      }
    }
    setSaving(false)
  }

  async function archiveHabit(id: string) {
    const { error } = await supabase.from('habit_identities').update({ active: false }).eq('id', id)
    if (error) { toast.error('Could not remove habit.'); return }
    setHabits(prev => prev.filter(h => h.id !== id))
    if (editId === id) { setShowForm(false); setEditId(null) }
    toast.success('Habit removed.')
  }

  const todayTotal  = habits.filter(h => isCompleted(h.id, today)).length
  const completion  = habits.length > 0 ? Math.round((todayTotal / habits.length) * 100) : 0

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Identity-Based Habits</h1>
          <p className={styles.subtitle}>
            You are what you do consistently. Check in daily to reinforce who you are becoming.
          </p>
        </div>
        <button className={styles.addBtn} onClick={openNew}>+ Add Habit</button>
      </div>

      {/* Today's summary */}
      {habits.length > 0 && (
        <div className={styles.summaryCard}>
          <div className={styles.summaryRing}>
            <svg width="64" height="64" viewBox="0 0 64 64" className={styles.ringSvg}>
              <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
              <circle
                cx="32" cy="32" r="26"
                fill="none"
                stroke="#0B9E8E"
                strokeWidth="5"
                strokeDasharray={`${2 * Math.PI * 26}`}
                strokeDashoffset={`${2 * Math.PI * 26 * (1 - completion / 100)}`}
                strokeLinecap="round"
              />
            </svg>
            <span className={styles.ringValue}>{completion}%</span>
          </div>
          <div>
            <div className={styles.summaryTitle}>Today's Check-In</div>
            <div className={styles.summaryCount}>{todayTotal} of {habits.length} habits completed</div>
            {completion === 100 && (
              <div className={styles.summaryWin}>Perfect day. Identity solidified.</div>
            )}
          </div>
        </div>
      )}

      {/* Add / edit form */}
      {showForm && (
        <form className={styles.form} onSubmit={handleSubmit}>
          <h2 className={styles.formTitle}>{editId ? 'Edit Habit' : 'New Habit'}</h2>

          <div className={styles.field}>
            <label className={styles.label}>Habit name</label>
            <input
              className={styles.input}
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Morning protein shake"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Identity statement</label>
            <input
              className={styles.input}
              value={form.identity_statement}
              onChange={e => setForm(p => ({ ...p, identity_statement: e.target.value }))}
              placeholder="e.g. I am someone who protects my muscle mass"
              required
            />
            <div className={styles.fieldHint}>Frame it as who you ARE, not what you do.</div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Category</label>
            <div className={styles.catGrid}>
              {CATEGORIES.map(c => (
                <button
                  key={c.value}
                  type="button"
                  className={`${styles.catBtn} ${form.category === c.value ? styles.catBtnActive : ''}`}
                  onClick={() => setForm(p => ({ ...p, category: c.value }))}
                >
                  <span>{c.icon}</span>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.formActions}>
            <button type="submit" className={styles.saveBtn} disabled={saving}>
              {saving ? 'Saving...' : editId ? 'Update' : 'Add Habit'}
            </button>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={() => { setShowForm(false); setEditId(null) }}
            >
              Cancel
            </button>
            {editId && (
              <button
                type="button"
                className={styles.deleteBtn}
                onClick={() => archiveHabit(editId)}
              >
                Remove
              </button>
            )}
          </div>
        </form>
      )}

      {loading && <div className={styles.emptyMsg}>Loading your habits...</div>}

      {!loading && habits.length === 0 && !showForm && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>◈</div>
          <h3 className={styles.emptyTitle}>No habits yet</h3>
          <p className={styles.emptyBody}>Add your first identity-based habit to start building your daily check-in.</p>
          <button className={styles.addBtn} onClick={openNew}>+ Add Your First Habit</button>
        </div>
      )}

      {/* Habit tracker grid */}
      {habits.length > 0 && (
        <div className={styles.tracker}>
          {/* Date headers */}
          <div className={styles.trackerHeader}>
            <div className={styles.habitNameHeader} />
            {dates.map(d => {
              const dt = parseISO(d)
              return (
                <div key={d} className={`${styles.dateCol} ${d === today ? styles.dateColToday : ''}`}>
                  <div className={styles.dateDay}>{format(dt, 'EEE')}</div>
                  <div className={styles.dateNum}>{format(dt, 'd')}</div>
                </div>
              )
            })}
            <div className={styles.streakHeader}>Streak</div>
          </div>

          {/* Habit rows */}
          {habits.map(habit => {
            const cat   = CATEGORIES.find(c => c.value === habit.category)
            const streak = streakFor(habit.id)
            return (
              <div key={habit.id} className={styles.habitRow}>
                <div className={styles.habitInfo}>
                  <button className={styles.habitEditBtn} onClick={() => openEdit(habit)} title="Edit">✎</button>
                  <div>
                    <div className={styles.habitName}>{habit.name}</div>
                    <div className={styles.habitIdentity}>{habit.identity_statement}</div>
                    <div className={styles.habitCat}>
                      {cat?.icon} {cat?.label}
                    </div>
                  </div>
                </div>

                {dates.map(d => {
                  const done = isCompleted(habit.id, d)
                  const isToday = d === today
                  return (
                    <button
                      key={d}
                      className={`${styles.checkBox} ${done ? styles.checkBoxDone : ''} ${isToday ? styles.checkBoxToday : ''}`}
                      onClick={() => toggleDay(habit.id, d)}
                      title={d}
                      aria-label={done ? `Uncheck ${habit.name} for ${d}` : `Check ${habit.name} for ${d}`}
                    >
                      {done ? '✓' : ''}
                    </button>
                  )
                })}

                <div className={styles.streakCell}>
                  {streak > 0 ? (
                    <span className={styles.streakBadge}>
                      {streak}d
                    </span>
                  ) : (
                    <span className={styles.streakZero}>-</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
