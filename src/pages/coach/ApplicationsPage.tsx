import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import styles from './ApplicationsPage.module.css'

type Status = 'new' | 'reviewing' | 'approved' | 'declined' | 'waitlisted'

interface Application {
  id: string
  created_at: string
  tier: string
  first_name: string
  last_name: string | null
  email: string
  phone: string | null
  health_challenge: string
  previous_attempts: string | null
  timeline: string | null
  investment_ready: string | null
  decision_maker: string | null
  goals: string | null
  hear_about: string | null
  status: Status
  notes: string | null
}

const STATUS_LABELS: Record<Status, string> = {
  new: 'New',
  reviewing: 'Reviewing',
  approved: 'Approved',
  declined: 'Declined',
  waitlisted: 'Waitlisted',
}

const STATUS_COLORS: Record<Status, string> = {
  new: styles.statusNew,
  reviewing: styles.statusReviewing,
  approved: styles.statusApproved,
  declined: styles.statusDeclined,
  waitlisted: styles.statusWaitlisted,
}

const TIER_LABELS: Record<string, string> = {
  intensive: 'VIP Intensive ($997/mo)',
  overhaul: '6-Month Overhaul ($4,997)',
}

const TIMELINE_LABELS: Record<string, string> = {
  immediately: 'Ready now',
  '1_month': 'Within 1 month',
  '3_months': 'Within 3 months',
  exploring: 'Just exploring',
}

const INVESTMENT_LABELS: Record<string, string> = {
  yes: 'Ready to invest',
  maybe: 'Needs discussion',
  not_yet: 'Not yet',
}

export default function ApplicationsPage() {
  const [apps, setApps]           = useState<Application[]>([])
  const [loading, setLoading]     = useState(true)
  const [selected, setSelected]   = useState<Application | null>(null)
  const [notes, setNotes]         = useState('')
  const [saving, setSaving]       = useState(false)
  const [filterStatus, setFilter] = useState<string>('all')

  useEffect(() => {
    fetchApps()
  }, [])

  async function fetchApps() {
    setLoading(true)
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) {
      toast.error('Failed to load applications.')
    } else {
      setApps(data ?? [])
    }
    setLoading(false)
  }

  function openApp(app: Application) {
    setSelected(app)
    setNotes(app.notes ?? '')
  }

  async function updateStatus(id: string, status: Status) {
    const { error } = await supabase.from('applications').update({ status }).eq('id', id)
    if (error) {
      toast.error('Could not update status.')
      return
    }
    setApps(prev => prev.map(a => a.id === id ? { ...a, status } : a))
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : prev)
    toast.success(`Status updated to ${STATUS_LABELS[status]}.`)
  }

  async function saveNotes() {
    if (!selected) return
    setSaving(true)
    const { error } = await supabase.from('applications').update({ notes }).eq('id', selected.id)
    setSaving(false)
    if (error) {
      toast.error('Could not save notes.')
      return
    }
    setApps(prev => prev.map(a => a.id === selected.id ? { ...a, notes } : a))
    setSelected(prev => prev ? { ...prev, notes } : prev)
    toast.success('Notes saved.')
  }

  const filtered = filterStatus === 'all' ? apps : apps.filter(a => a.status === filterStatus)

  const counts = apps.reduce<Record<string, number>>((acc, a) => {
    acc[a.status] = (acc[a.status] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Applications</h1>
        <p className={styles.pageSubtitle}>{apps.length} total applications</p>
      </div>

      {/* Status filter pills */}
      <div className={styles.filters}>
        <button
          className={`${styles.filterPill} ${filterStatus === 'all' ? styles.filterPillActive : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({apps.length})
        </button>
        {(Object.keys(STATUS_LABELS) as Status[]).map(s => (
          <button
            key={s}
            className={`${styles.filterPill} ${filterStatus === s ? styles.filterPillActive : ''}`}
            onClick={() => setFilter(s)}
          >
            {STATUS_LABELS[s]} ({counts[s] ?? 0})
          </button>
        ))}
      </div>

      <div className={styles.layout}>
        {/* Application list */}
        <div className={styles.list}>
          {loading && <div className={styles.empty}>Loading...</div>}
          {!loading && filtered.length === 0 && (
            <div className={styles.empty}>No applications found.</div>
          )}
          {filtered.map(app => (
            <button
              key={app.id}
              className={`${styles.appCard} ${selected?.id === app.id ? styles.appCardSelected : ''}`}
              onClick={() => openApp(app)}
            >
              <div className={styles.appCardTop}>
                <div className={styles.appName}>{app.first_name} {app.last_name}</div>
                <span className={`${styles.statusBadge} ${STATUS_COLORS[app.status]}`}>
                  {STATUS_LABELS[app.status]}
                </span>
              </div>
              <div className={styles.appEmail}>{app.email}</div>
              <div className={styles.appMeta}>
                <span className={styles.appTier}>{TIER_LABELS[app.tier] ?? app.tier}</span>
                <span className={styles.appDate}>{new Date(app.created_at).toLocaleDateString()}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Detail pane */}
        {selected ? (
          <div className={styles.detail}>
            <div className={styles.detailHeader}>
              <div>
                <h2 className={styles.detailName}>{selected.first_name} {selected.last_name}</h2>
                <a href={`mailto:${selected.email}`} className={styles.detailEmail}>{selected.email}</a>
                {selected.phone && <div className={styles.detailPhone}>{selected.phone}</div>}
              </div>
              <span className={`${styles.statusBadge} ${STATUS_COLORS[selected.status]}`}>
                {STATUS_LABELS[selected.status]}
              </span>
            </div>

            <div className={styles.detailSection}>
              <div className={styles.detailLabel}>Program</div>
              <div className={styles.detailValue}>{TIER_LABELS[selected.tier] ?? selected.tier}</div>
            </div>

            <div className={styles.detailSection}>
              <div className={styles.detailLabel}>Health challenge</div>
              <div className={styles.detailValue}>{selected.health_challenge}</div>
            </div>

            {selected.previous_attempts && (
              <div className={styles.detailSection}>
                <div className={styles.detailLabel}>Previously tried</div>
                <div className={styles.detailValue}>{selected.previous_attempts}</div>
              </div>
            )}

            {selected.goals && (
              <div className={styles.detailSection}>
                <div className={styles.detailLabel}>Goals</div>
                <div className={styles.detailValue}>{selected.goals}</div>
              </div>
            )}

            <div className={styles.detailRow3}>
              {selected.timeline && (
                <div className={styles.detailMeta}>
                  <div className={styles.detailLabel}>Timeline</div>
                  <div className={styles.detailMetaValue}>{TIMELINE_LABELS[selected.timeline] ?? selected.timeline}</div>
                </div>
              )}
              {selected.investment_ready && (
                <div className={styles.detailMeta}>
                  <div className={styles.detailLabel}>Investment</div>
                  <div className={styles.detailMetaValue}>{INVESTMENT_LABELS[selected.investment_ready] ?? selected.investment_ready}</div>
                </div>
              )}
              {selected.decision_maker && (
                <div className={styles.detailMeta}>
                  <div className={styles.detailLabel}>Decision maker</div>
                  <div className={styles.detailMetaValue}>
                    {selected.decision_maker === 'yes' ? 'Decides alone' : 'Needs to discuss'}
                  </div>
                </div>
              )}
            </div>

            {selected.hear_about && (
              <div className={styles.detailSection}>
                <div className={styles.detailLabel}>How they found us</div>
                <div className={styles.detailValue}>{selected.hear_about}</div>
              </div>
            )}

            {/* Status actions */}
            <div className={styles.statusActions}>
              <div className={styles.detailLabel}>Update status</div>
              <div className={styles.statusBtns}>
                {(Object.keys(STATUS_LABELS) as Status[]).map(s => (
                  <button
                    key={s}
                    className={`${styles.statusBtn} ${selected.status === s ? styles.statusBtnActive : ''}`}
                    onClick={() => updateStatus(selected.id, s)}
                  >
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className={styles.notesSection}>
              <div className={styles.detailLabel}>Private notes</div>
              <textarea
                className={styles.notesInput}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={4}
                placeholder="Add private notes about this applicant..."
              />
              <button className={styles.saveBtn} onClick={saveNotes} disabled={saving}>
                {saving ? 'Saving...' : 'Save Notes'}
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.detailEmpty}>
            <div className={styles.detailEmptyIcon}>◈</div>
            <div>Select an application to review it.</div>
          </div>
        )}
      </div>
    </div>
  )
}
