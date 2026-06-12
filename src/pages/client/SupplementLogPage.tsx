import { useEffect, useState } from 'react'
import { Pill, Plus, Check, ExternalLink, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { format, subDays } from 'date-fns'
import { calcSupplementAdherence } from '@/lib/adherence'
import toast from 'react-hot-toast'
import styles from './Client.module.css'
import shared from '../../styles/shared.module.css'

interface Supplement {
  id: string
  user_id: string
  name: string
  dose: string
  timing: 'am' | 'pm' | 'with_meal' | 'as_needed'
  notes: string | null
  active: boolean
}

interface SupplementLog {
  id: string
  user_id: string
  supplement_id: string
  taken_at: string
  log_date: string
}

const TIMING_LABELS = { am: 'Morning', pm: 'Evening', with_meal: 'With Meal', as_needed: 'As Needed' }
const TIMING_COLORS = { am: '#c8a74b', pm: '#9b59b6', with_meal: '#0b9e8e', as_needed: '#91a0ac' }

export default function SupplementLogPage() {
  const [supplements, setSupplements] = useState<Supplement[]>([])
  const [logs, setLogs] = useState<SupplementLog[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', dose: '', timing: 'am' as Supplement['timing'], notes: '' })
  const today = format(new Date(), 'yyyy-MM-dd')
  // Fetch 14 days so adherence can be computed without an extra query.
  const windowStart = format(subDays(new Date(), 13), 'yyyy-MM-dd')

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const [suppRes, logRes] = await Promise.all([
      supabase.from('supplements').select('*').eq('user_id', user.id).eq('active', true).order('timing').order('name'),
      supabase.from('supplement_logs').select('*').eq('user_id', user.id).gte('log_date', windowStart),
    ])
    setSupplements((suppRes.data as Supplement[]) ?? [])
    setLogs((logRes.data as SupplementLog[]) ?? [])
    setLoading(false)
  }

  const toggleTaken = async (supp: Supplement) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    // Look for today's log only, not a historical one.
    const existing = logs.find(l => l.supplement_id === supp.id && l.log_date === today)
    if (existing) {
      await supabase.from('supplement_logs').delete().eq('id', existing.id)
      setLogs(l => l.filter(x => x.id !== existing.id))
      toast('Marked as not taken', { icon: '↩️' })
    } else {
      const { data } = await supabase.from('supplement_logs').insert({
        user_id: user.id, supplement_id: supp.id, log_date: today, taken_at: new Date().toISOString(),
      }).select().single()
      if (data) setLogs(l => [...l, data as SupplementLog])
      toast.success(`${supp.name} marked as taken!`)
    }
  }

  const addSupplement = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data, error } = await supabase.from('supplements').insert({
      user_id: user.id, name: form.name.trim(), dose: form.dose.trim(),
      timing: form.timing, notes: form.notes || null, active: true,
    }).select().single()
    if (error) { toast.error('Failed to add supplement'); return }
    setSupplements(s => [...s, data as Supplement])
    setForm({ name: '', dose: '', timing: 'am', notes: '' })
    setShowForm(false)
    toast.success('Supplement added!')
  }

  const removeSupplement = async (id: string) => {
    await supabase.from('supplements').update({ active: false }).eq('id', id)
    setSupplements(s => s.filter(x => x.id !== id))
    toast('Supplement removed', { icon: '🗑️' })
  }

  // Today-only slice for the daily tracker.
  const todayLogs = logs.filter(l => l.log_date === today)
  const takenIds = new Set(todayLogs.map(l => l.supplement_id))
  const amSupps = supplements.filter(s => s.timing === 'am')
  const pmSupps = supplements.filter(s => s.timing === 'pm')
  const otherSupps = supplements.filter(s => s.timing !== 'am' && s.timing !== 'pm')
  const totalTaken = supplements.filter(s => takenIds.has(s.id)).length
  const pct = supplements.length ? Math.round((totalTaken / supplements.length) * 100) : 0

  // 14-day adherence (pure computation, no extra fetch).
  const adherence = supplements.length > 0
    ? calcSupplementAdherence(supplements, logs)
    : null

  const adhrColor = (n: number) => n >= 70 ? '#4be08a' : n >= 50 ? '#e0b84b' : '#e05c5c'

  return (
    <div className="animate-fade-in">
      <div className={styles.pageTop}>
        <div>
          <h1 className={styles.pageTopTitle}>
            <Pill size={22} color="#9b59b6" /> Supplement Log
          </h1>
          <p className={styles.pageTopDate}>{format(new Date(), 'EEEE, MMMM d')}</p>
        </div>
        <button className={shared.btnPrimary} onClick={() => setShowForm(!showForm)}>
          <Plus size={16} /> Add Supplement
        </button>
      </div>

      {/* Today's progress */}
      {supplements.length > 0 && (
        <div className={styles.suppProgressCard}>
          <div className={styles.suppProgressBody}>
            <div className={styles.suppProgressHeader}>
              <span>Today's Progress</span>
              <span className={styles.suppProgressCount}>{totalTaken}/{supplements.length} taken</span>
            </div>
            <div className={styles.suppProgressTrack}>
              {/* Width and fill color are computed from live progress, so they stay inline */}
              <div className={styles.suppProgressFill} style={{ width: `${pct}%`, background: pct === 100 ? '#4be08a' : 'var(--gold)' }} />
            </div>
          </div>
          <div className={styles.suppProgressPct} style={{ color: pct === 100 ? '#4be08a' : 'var(--gold)' }}>{pct}%</div>
        </div>
      )}

      {/* 14-Day Adherence */}
      {!loading && adherence && (
        <div className={styles.card}>
          <div className={styles.adhrHeader}>
            <h3 className={styles.adhrTitle}>14-Day Adherence</h3>
            <div className={styles.adhrStreakPill}>
              🔥 {adherence.streak} day{adherence.streak !== 1 ? 's' : ''} streak
            </div>
          </div>

          <div className={styles.adhrPctRow}>
            {/* Color is computed from live adherence score, so it stays inline */}
            <div className={styles.adhrPctNum} style={{ color: adhrColor(adherence.overall) }}>
              {adherence.overall}%
            </div>
            <div className={styles.adhrBarWrap}>
              <div className={styles.adhrBarTrack}>
                <div className={styles.adhrBarFill} style={{ width: `${adherence.overall}%`, background: adhrColor(adherence.overall) }} />
              </div>
              <div className={styles.adhrBarLabel}>Overall (last 14 days)</div>
            </div>
          </div>

          {adherence.breakdown.length > 0 && (
            <div className={styles.adhrBreakdown}>
              {adherence.breakdown.map(s => (
                <div key={s.id} className={styles.adhrBreakdownItem}>
                  <div className={styles.adhrBreakdownName}>{s.name}</div>
                  <div className={styles.adhrMiniTrack}>
                    {/* Bar width and color are computed from live adherence, so they stay inline */}
                    <div className={styles.adhrMiniFill} style={{ width: `${s.pct}%`, background: adhrColor(s.pct) }} />
                  </div>
                  <span className={styles.adhrBreakdownPct} style={{ color: adhrColor(s.pct) }}>
                    {s.pct}%
                  </span>
                </div>
              ))}
            </div>
          )}

          {adherence.overall < 60 && (
            <p className={styles.adhrNote}>
              Consistency matters more than perfection. Pick your easiest supplement and anchor it to an existing habit.
            </p>
          )}
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <div className={styles.card}>
          <h3 className={styles.cardTitleSolo}>Add New Supplement</h3>
          <form onSubmit={addSupplement} className={styles.logForm}>
            <div className={styles.inputRow}>
              <div className={styles.field}>
                <label className={styles.label}>Supplement Name *</label>
                <input className={styles.input} type="text" placeholder="Magnesium Glycinate" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} required maxLength={100} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Dose *</label>
                <input className={styles.input} type="text" placeholder="400mg, 2 capsules..." value={form.dose} onChange={e => setForm(f => ({...f, dose: e.target.value}))} required maxLength={50} />
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Timing</label>
              <div className={styles.timingRow}>
                {Object.entries(TIMING_LABELS).map(([val, label]) => {
                  const active = form.timing === val
                  const color = TIMING_COLORS[val as Supplement['timing']]
                  return (
                    <button key={val} type="button" onClick={() => setForm(f => ({...f, timing: val as Supplement['timing']}))}
                      className={styles.timingBtn}
                      /* Selected timing color is data-driven, so it stays inline */
                      style={active ? { borderColor: color, background: `${color}15`, color } : undefined}>
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Notes (optional)</label>
              <input className={styles.input} type="text" placeholder="Take with food, avoid with coffee..." value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} maxLength={200} />
            </div>
            <div className={styles.formActions}>
              <button type="submit" className={shared.btnPrimary}>Add Supplement</button>
              <button type="button" className={shared.btnSecondary} onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Supplement groups */}
      {loading ? (
        <div className={styles.loadingText}>Loading...</div>
      ) : supplements.length === 0 ? (
        <div className={styles.card}>
          <div className={styles.chartEmpty}>
            <Pill size={40} color="var(--border)" />
            <p>No supplements added yet</p>
            <p>Add your protocol supplements above to start tracking</p>
          </div>
        </div>
      ) : (
        <>
          {[
            { label: 'Morning Supplements', supps: amSupps, color: '#c8a74b' },
            { label: 'Evening Supplements', supps: pmSupps, color: '#9b59b6' },
            { label: 'Other', supps: otherSupps, color: '#91a0ac' },
          ].filter(g => g.supps.length > 0).map(({ label, supps, color }) => (
            <div key={label} className={styles.card}>
              <h3 className={styles.cardLabel} style={{ color }}>{label}</h3>
              <div className={styles.checklist}>
                {supps.map(supp => {
                  const taken = takenIds.has(supp.id)
                  return (
                    <div key={supp.id} className={taken ? styles.suppRowTaken : styles.suppRow}>
                      <button onClick={() => toggleTaken(supp)} className={taken ? styles.suppCheckTaken : styles.suppCheck}>
                        {taken && <Check size={16} color="#0e1c1b" strokeWidth={3} />}
                      </button>
                      <div className={styles.suppRowBody}>
                        <div className={taken ? styles.suppRowNameTaken : styles.suppRowName}>{supp.name}</div>
                        <div className={styles.suppRowMeta}>{supp.dose} · {TIMING_LABELS[supp.timing]}{supp.notes ? ` · ${supp.notes}` : ''}</div>
                      </div>
                      <button onClick={() => removeSupplement(supp.id)} className={styles.deleteBtn}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </>
      )}

      {/* Fullscript link */}
      <div className={styles.fullscriptRow}>
        <div className={styles.suppProgressBody}>
          <div className={styles.suppRowName}>Order Practitioner-Grade Supplements</div>
          <div className={styles.suppRowMeta}>Access Dr. Hunter's curated dispensary on Fullscript, up to 25% off retail pricing</div>
        </div>
        <a href="https://fullscript.com/go/huntersholistichealth" target="_blank" rel="noopener noreferrer" className={shared.btnTeal}>
          <ExternalLink size={14} /> Shop Now
        </a>
      </div>
      <p className={styles.reorderNote}>
        Running low? Reorder through the dispensary so your protocol stays unbroken.
      </p>

      <p className={styles.footerNote}>
        Supplement recommendations are for educational purposes only. Always consult your healthcare provider before starting any new supplement regimen.
      </p>
    </div>
  )
}
