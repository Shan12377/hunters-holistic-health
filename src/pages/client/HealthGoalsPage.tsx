import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'
import styles from './HealthGoalsPage.module.css'

type Status = 'active' | 'achieved' | 'paused'
type Category =
  | 'metabolic' | 'hormone' | 'movement' | 'nutrition'
  | 'sleep' | 'stress' | 'supplements' | 'weight' | 'energy' | 'other'

interface Goal {
  id: string
  goal_text: string
  category: Category
  target_date: string | null
  status: Status
  milestone_pct: number
}

const CATEGORIES: { value: Category; label: string; icon: string }[] = [
  { value: 'metabolic',    label: 'Metabolic',    icon: '◉' },
  { value: 'hormone',      label: 'Hormone',      icon: '⬡' },
  { value: 'movement',     label: 'Movement',     icon: '◎' },
  { value: 'nutrition',    label: 'Nutrition',    icon: '⚡' },
  { value: 'sleep',        label: 'Sleep',        icon: '◑' },
  { value: 'stress',       label: 'Stress',       icon: '◷' },
  { value: 'supplements',  label: 'Supplements',  icon: '⬡' },
  { value: 'weight',       label: 'Weight',       icon: '⚖' },
  { value: 'energy',       label: 'Energy',       icon: '★' },
  { value: 'other',        label: 'Other',        icon: '◈' },
]

const STATUS_LABELS: Record<Status, string> = {
  active: 'Active',
  achieved: 'Achieved',
  paused: 'Paused',
}

const BLANK: Omit<Goal, 'id'> = {
  goal_text: '',
  category: 'metabolic',
  target_date: null,
  status: 'active',
  milestone_pct: 0,
}

export default function HealthGoalsPage() {
  const { user } = useAuthStore()
  const [goals, setGoals]       = useState<Goal[]>([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState(BLANK)
  const [saving, setSaving]     = useState(false)
  const [editId, setEditId]     = useState<string | null>(null)

  useEffect(() => {
    if (user?.id) fetchGoals()
  }, [user?.id])

  async function fetchGoals() {
    setLoading(true)
    const { data, error } = await supabase
      .from('health_goals')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
    if (!error) setGoals(data ?? [])
    setLoading(false)
  }

  function openNew() {
    setForm(BLANK)
    setEditId(null)
    setShowForm(true)
  }

  function openEdit(goal: Goal) {
    setForm({
      goal_text: goal.goal_text,
      category: goal.category,
      target_date: goal.target_date,
      status: goal.status,
      milestone_pct: goal.milestone_pct,
    })
    setEditId(goal.id)
    setShowForm(true)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.goal_text.trim()) {
      toast.error('Please describe your goal.')
      return
    }
    setSaving(true)
    const payload = {
      user_id: user!.id,
      goal_text: form.goal_text.trim(),
      category: form.category,
      target_date: form.target_date || null,
      status: form.status,
      milestone_pct: form.milestone_pct,
    }

    if (editId) {
      const { error } = await supabase.from('health_goals').update(payload).eq('id', editId)
      if (error) {
        toast.error('Could not save goal.')
      } else {
        setGoals(prev => prev.map(g => g.id === editId ? { ...g, ...payload } : g))
        toast.success('Goal updated.')
        setShowForm(false)
        setEditId(null)
      }
    } else {
      const { data, error } = await supabase.from('health_goals').insert(payload).select().single()
      if (error) {
        toast.error('Could not save goal.')
      } else {
        setGoals(prev => [data, ...prev])
        toast.success('Goal added.')
        setShowForm(false)
      }
    }
    setSaving(false)
  }

  async function deleteGoal(id: string) {
    const { error } = await supabase.from('health_goals').delete().eq('id', id)
    if (error) {
      toast.error('Could not delete goal.')
      return
    }
    setGoals(prev => prev.filter(g => g.id !== id))
    if (editId === id) { setShowForm(false); setEditId(null) }
    toast.success('Goal removed.')
  }

  async function updateMilestone(id: string, pct: number) {
    const clamped = Math.max(0, Math.min(100, pct))
    const newStatus: Status = clamped === 100 ? 'achieved' : 'active'
    const { error } = await supabase
      .from('health_goals')
      .update({ milestone_pct: clamped, status: newStatus })
      .eq('id', id)
    if (!error) {
      setGoals(prev => prev.map(g => g.id === id ? { ...g, milestone_pct: clamped, status: newStatus } : g))
    }
  }

  const active   = goals.filter(g => g.status === 'active')
  const achieved = goals.filter(g => g.status === 'achieved')
  const paused   = goals.filter(g => g.status === 'paused')

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Health Goals</h1>
          <p className={styles.subtitle}>Set intentions across the ROOTS pillars and track your progress.</p>
        </div>
        <button className={styles.addBtn} onClick={openNew}>+ Add Goal</button>
      </div>

      {/* Add / Edit form */}
      {showForm && (
        <form className={styles.form} onSubmit={handleSubmit}>
          <h2 className={styles.formTitle}>{editId ? 'Edit Goal' : 'New Goal'}</h2>

          <div className={styles.field}>
            <label className={styles.label}>What is your goal?</label>
            <textarea
              className={styles.textarea}
              value={form.goal_text}
              onChange={e => setForm(p => ({ ...p, goal_text: e.target.value }))}
              placeholder="e.g. Bring fasting blood sugar under 90 by October"
              rows={3}
              required
            />
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
                  <span className={styles.catIcon}>{c.icon}</span>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.field}>
              <label className={styles.label}>Target date (optional)</label>
              <input
                type="date"
                className={styles.input}
                value={form.target_date ?? ''}
                onChange={e => setForm(p => ({ ...p, target_date: e.target.value || null }))}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Progress ({form.milestone_pct}%)</label>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={form.milestone_pct}
                onChange={e => setForm(p => ({ ...p, milestone_pct: Number(e.target.value) }))}
                className={styles.range}
              />
            </div>
          </div>

          <div className={styles.formActions}>
            <button type="submit" className={styles.saveBtn} disabled={saving}>
              {saving ? 'Saving...' : editId ? 'Update Goal' : 'Add Goal'}
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
                onClick={() => deleteGoal(editId)}
              >
                Delete
              </button>
            )}
          </div>
        </form>
      )}

      {loading && <div className={styles.empty}>Loading your goals...</div>}

      {!loading && goals.length === 0 && !showForm && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>◎</div>
          <h3 className={styles.emptyTitle}>No goals yet</h3>
          <p className={styles.emptyBody}>Set your first health goal to track your ROOTS progress.</p>
          <button className={styles.addBtn} onClick={openNew}>+ Add Your First Goal</button>
        </div>
      )}

      {/* Active goals */}
      {active.length > 0 && (
        <GoalSection title="Active" goals={active} onEdit={openEdit} onMilestone={updateMilestone} />
      )}
      {paused.length > 0 && (
        <GoalSection title="Paused" goals={paused} onEdit={openEdit} onMilestone={updateMilestone} />
      )}
      {achieved.length > 0 && (
        <GoalSection title="Achieved" goals={achieved} onEdit={openEdit} onMilestone={updateMilestone} />
      )}
    </div>
  )
}

function GoalSection({
  title,
  goals,
  onEdit,
  onMilestone,
}: {
  title: string
  goals: Goal[]
  onEdit: (g: Goal) => void
  onMilestone: (id: string, pct: number) => void
}) {
  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      <div className={styles.goalList}>
        {goals.map(goal => {
          const cat = CATEGORIES.find(c => c.value === goal.category)
          return (
            <div key={goal.id} className={`${styles.goalCard} ${goal.status === 'achieved' ? styles.goalCardAchieved : ''}`}>
              <div className={styles.goalTop}>
                <div className={styles.goalCat}>
                  <span className={styles.goalCatIcon}>{cat?.icon ?? '◈'}</span>
                  {cat?.label ?? goal.category}
                </div>
                <button className={styles.editBtn} onClick={() => onEdit(goal)}>Edit</button>
              </div>
              <div className={styles.goalText}>{goal.goal_text}</div>
              {goal.target_date && (
                <div className={styles.goalDate}>Target: {new Date(goal.target_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
              )}
              <div className={styles.progressRow}>
                <div className={styles.progressBar}>
                  <div
                    className={`${styles.progressFill} ${goal.status === 'achieved' ? styles.progressFillAchieved : ''}`}
                    style={{ width: `${goal.milestone_pct}%` }}
                  />
                </div>
                <span className={styles.progressPct}>{goal.milestone_pct}%</span>
              </div>
              {goal.status !== 'achieved' && (
                <div className={styles.milestoneActions}>
                  {[25, 50, 75, 100].map(pct => (
                    <button
                      key={pct}
                      className={`${styles.milestoneBtn} ${goal.milestone_pct >= pct ? styles.milestoneBtnActive : ''}`}
                      onClick={() => onMilestone(goal.id, pct)}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
