import { useEffect, useState } from 'react'
import { Zap, Plus, Trash2, Users, ToggleLeft, ToggleRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { format, parseISO, differenceInDays } from 'date-fns'
import toast from 'react-hot-toast'
import styles from './Coach.module.css'

interface Challenge {
  id: string
  title: string
  description: string | null
  goal_description: string | null
  start_date: string
  end_date: string
  is_active: boolean
  created_at: string
}

const EMPTY = {
  title: '',
  description: '',
  goal_description: '',
  start_date: '',
  end_date: '',
}

export default function ManageChallengesPage() {
  const { user } = useAuthStore()
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading]       = useState(true)
  const [showForm, setShowForm]     = useState(false)
  const [form, setForm]             = useState(EMPTY)
  const [saving, setSaving]         = useState(false)
  const [counts, setCounts]         = useState<Record<string, number>>({})

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    const { data } = await supabase
      .from('challenges')
      .select('*')
      .order('start_date', { ascending: false })
    const list = (data ?? []) as Challenge[]
    setChallenges(list)
    setLoading(false)

    for (const ch of list) {
      supabase
        .from('challenge_logs')
        .select('user_id', { count: 'exact', head: true })
        .eq('challenge_id', ch.id)
        .then(({ count }) => {
          setCounts(prev => ({ ...prev, [ch.id]: count ?? 0 }))
        })
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.start_date || !form.end_date || !user?.id) return
    if (form.end_date < form.start_date) { toast.error('End date must be after start date'); return }
    setSaving(true)
    const { error } = await supabase.from('challenges').insert({
      created_by: user.id,
      title: form.title.trim(),
      description: form.description.trim() || null,
      goal_description: form.goal_description.trim() || null,
      start_date: form.start_date,
      end_date: form.end_date,
      is_active: true,
    })
    if (error) { toast.error('Failed to create challenge') }
    else { toast.success('Challenge created.'); setForm(EMPTY); setShowForm(false); fetchAll() }
    setSaving(false)
  }

  const handleToggle = async (ch: Challenge) => {
    const { error } = await supabase.from('challenges').update({ is_active: !ch.is_active }).eq('id', ch.id)
    if (error) { toast.error('Failed to update'); return }
    setChallenges(prev => prev.map(c => c.id === ch.id ? { ...c, is_active: !c.is_active } : c))
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('challenges').delete().eq('id', id)
    if (error) { toast.error('Could not delete'); return }
    toast.success('Challenge removed.')
    setChallenges(prev => prev.filter(c => c.id !== id))
  }

  const field = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }))

  const duration = (start: string, end: string) => {
    const d = differenceInDays(parseISO(end), parseISO(start)) + 1
    return `${d} day${d === 1 ? '' : 's'}`
  }

  return (
    <div className={styles.evMgmtPage}>
      <div className={styles.evMgmtHeader}>
        <div>
          <h2 className={styles.evMgmtTitle}><Zap size={20} color="var(--gold)" /> Challenges</h2>
          <p className={styles.evMgmtSub}>Create group challenges participants can check in on daily</p>
        </div>
        <button className={styles.evMgmtAddBtn} onClick={() => setShowForm(v => !v)}>
          <Plus size={16} /> {showForm ? 'Cancel' : 'New Challenge'}
        </button>
      </div>

      {showForm && (
        <form className={styles.evForm} onSubmit={handleCreate}>
          <div className={styles.evFormField}>
            <label className={styles.evFormLabel}>Challenge Title</label>
            <input className={styles.evFormInput} value={form.title} onChange={field('title')} placeholder="e.g. 7-Day Step Challenge" maxLength={120} required />
          </div>

          <div className={styles.evFormField}>
            <label className={styles.evFormLabel}>Goal (what participants should do each day)</label>
            <input className={styles.evFormInput} value={form.goal_description} onChange={field('goal_description')} placeholder="e.g. Hit 8,000 steps every day for 7 days" maxLength={200} />
          </div>

          <div className={styles.evFormRow}>
            <div className={styles.evFormField}>
              <label className={styles.evFormLabel}>Start Date</label>
              <input type="date" className={styles.evFormInput} value={form.start_date} onChange={field('start_date')} required />
            </div>
            <div className={styles.evFormField}>
              <label className={styles.evFormLabel}>End Date</label>
              <input type="date" className={styles.evFormInput} value={form.end_date} onChange={field('end_date')} required />
            </div>
          </div>

          <div className={styles.evFormField}>
            <label className={styles.evFormLabel}>Additional details (optional)</label>
            <textarea className={styles.evFormTextarea} value={form.description} onChange={field('description')} placeholder="Rules, prizes, encouragement..." rows={3} maxLength={500} />
          </div>

          <div className={styles.evFormActions}>
            {form.start_date && form.end_date && form.end_date >= form.start_date && (
              <span className={styles.chDurationPreview}>
                <Zap size={13} color="var(--gold)" /> {duration(form.start_date, form.end_date)} challenge
              </span>
            )}
            <button type="submit" className={styles.evFormSubmit} disabled={saving}>
              {saving ? 'Saving...' : 'Create Challenge'}
            </button>
          </div>
        </form>
      )}

      <div className={styles.evMgmtList}>
        {loading ? (
          <p className={styles.evMgmtEmpty}>Loading challenges...</p>
        ) : challenges.length === 0 ? (
          <div className={styles.evMgmtEmptyState}>
            <Zap size={36} color="var(--border)" />
            <p>No challenges yet. Create one above.</p>
          </div>
        ) : (
          challenges.map(ch => (
            <div key={ch.id} className={`${styles.chMgmtRow} ${!ch.is_active ? styles.chMgmtRowInactive : ''}`}>
              <div className={styles.evMgmtRowLeft}>
                <span className={styles.evMgmtType} style={{ color: 'var(--gold)' }}>
                  <Zap size={13} /> {duration(ch.start_date, ch.end_date)} Challenge
                </span>
                <span className={styles.evMgmtRowTitle}>{ch.title}</span>
                {ch.goal_description && (
                  <span className={styles.evMgmtRowDesc}>{ch.goal_description}</span>
                )}
              </div>
              <div className={styles.evMgmtRowRight}>
                <span className={styles.evMgmtDate}>
                  {format(parseISO(ch.start_date), 'MMM d')} to {format(parseISO(ch.end_date), 'MMM d, yyyy')}
                </span>
                {(counts[ch.id] ?? 0) > 0 && (
                  <span className={styles.chParticipantCount}>
                    <Users size={12} /> {counts[ch.id]}
                  </span>
                )}
                <button
                  className={styles.chToggleBtn}
                  onClick={() => handleToggle(ch)}
                  title={ch.is_active ? 'Deactivate' : 'Activate'}
                >
                  {ch.is_active
                    ? <ToggleRight size={20} color="var(--teal)" />
                    : <ToggleLeft size={20} color="var(--text-muted)" />
                  }
                </button>
                <button className={styles.evMgmtDelete} onClick={() => handleDelete(ch.id)} title="Delete">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
