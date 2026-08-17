import { useEffect, useState } from 'react'
import { Pill, Plus, Check, ExternalLink, Trash2, Microscope, Minus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { format, subDays } from 'date-fns'
import { calcSupplementAdherence } from '@/lib/adherence'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'
import BackButton from '@/components/BackButton'
import styles from './Client.module.css'
import shared from '../../styles/shared.module.css'

type Timing = 'am' | 'pm' | 'with_meal' | 'as_needed'

interface Supplement {
  id: string
  user_id: string
  name: string
  dose: string
  // A supplement taken more than once a day (magnesium AM and PM) can carry
  // more than one timing tag, it is no longer forced into a single bucket.
  timings: Timing[]
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

const TIMING_LABELS: Record<Timing, string> = { am: 'Morning', pm: 'Evening', with_meal: 'With Meal', as_needed: 'As Needed' }
const TIMING_COLORS: Record<Timing, string> = { am: '#c8a74b', pm: '#9b59b6', with_meal: '#0b9e8e', as_needed: '#91a0ac' }

interface ResearchData {
  strength: 'strong' | 'moderate' | 'emerging' | 'limited'
  strengthLabel: string
  findings: string[]
  cautions: string[]
  populations: string
  disclaimer: string
}

const STRENGTH_LABELS: Record<string, string> = {
  strong: 'Strong Evidence',
  moderate: 'Moderate Evidence',
  emerging: 'Emerging Evidence',
  limited: 'Limited Evidence',
}

export default function SupplementLogPage() {
  const { profile } = useAuthStore()
  const [supplements, setSupplements] = useState<Supplement[]>([])
  const [logs, setLogs] = useState<SupplementLog[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<{ name: string; dose: string; timings: Timing[]; notes: string }>({
    name: '', dose: '', timings: ['am'], notes: '',
  })
  const [researchSupp, setResearchSupp] = useState<Supplement | null>(null)
  const [researchData, setResearchData] = useState<ResearchData | null>(null)
  const [researchLoading, setResearchLoading] = useState(false)
  const [researchError, setResearchError] = useState<string | null>(null)
  const today = format(new Date(), 'yyyy-MM-dd')
  // Which day's checklist is being viewed and toggled. Defaults to today, but
  // a missed day can be pulled up and marked after the fact.
  const [selectedDate, setSelectedDate] = useState(today)
  // Fetch 14 days so adherence can be computed without an extra query.
  const windowStart = format(subDays(new Date(), 13), 'yyyy-MM-dd')

  const isProgram = profile?.plan === 'program' || profile?.plan === 'vip'

  const openResearch = async (supp: Supplement) => {
    setResearchSupp(supp)
    setResearchData(null)
    setResearchError(null)
    if (!isProgram) return
    setResearchLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/supplement-research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token ?? ''}`,
        },
        body: JSON.stringify({ supplementName: supp.name, dose: supp.dose }),
      })
      const data = await res.json() as ResearchData | { error: string }
      if ('error' in data) setResearchError(data.error)
      else setResearchData(data)
    } catch {
      setResearchError('Could not load research. Check your connection and try again.')
    } finally {
      setResearchLoading(false)
    }
  }

  const closeResearch = () => {
    setResearchSupp(null)
    setResearchData(null)
    setResearchError(null)
  }

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user
    if (!user) return
    const [suppRes, logRes] = await Promise.all([
      supabase.from('supplements').select('*').eq('user_id', user.id).eq('active', true).order('name'),
      supabase.from('supplement_logs').select('*').eq('user_id', user.id).gte('log_date', windowStart),
    ])
    setSupplements((suppRes.data as Supplement[]) ?? [])
    setLogs((logRes.data as SupplementLog[]) ?? [])
    setLoading(false)
  }

  // Logs one more dose, does not toggle. Some supplements (magnesium AM and
  // PM, a twice-daily probiotic) are taken more than once a day, and there
  // was previously no way to record a second dose, tapping again just
  // un-checked the first one.
  const logDose = async (supp: Supplement) => {
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user
    if (!user) return
    const { data } = await supabase.from('supplement_logs').insert({
      user_id: user.id, supplement_id: supp.id, log_date: selectedDate,
      taken_at: new Date().toISOString(),
    }).select().single()
    if (data) setLogs(l => [...l, data as SupplementLog])
    const doseCount = (takenCounts.get(supp.id) ?? 0) + 1
    const doseLabel = doseCount > 1 ? ` (dose ${doseCount})` : ''
    toast.success(
      selectedDate === today
        ? `${supp.name} logged${doseLabel}!`
        : `${supp.name} logged${doseLabel} for ${format(new Date(`${selectedDate}T12:00:00`), 'MMM d')}!`
    )
  }

  // Removes the most recent dose for that day, so a mis-tap can be undone
  // without guessing which of several logged doses to delete.
  const removeLastDose = async (supp: Supplement) => {
    const suppLogsToday = selectedLogs
      .filter(l => l.supplement_id === supp.id)
      .sort((a, b) => b.taken_at.localeCompare(a.taken_at))
    const mostRecent = suppLogsToday[0]
    if (!mostRecent) return
    await supabase.from('supplement_logs').delete().eq('id', mostRecent.id)
    setLogs(l => l.filter(x => x.id !== mostRecent.id))
    toast('Removed one dose', { icon: '↩️' })
  }

  const addSupplement = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.timings.length === 0) { toast.error('Pick at least one timing'); return }
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user
    if (!user) return
    const { data, error } = await supabase.from('supplements').insert({
      user_id: user.id, name: form.name.trim(), dose: form.dose.trim(),
      timings: form.timings, notes: form.notes || null, active: true,
    }).select().single()
    if (error) { toast.error('Failed to add supplement'); return }
    setSupplements(s => [...s, data as Supplement])
    setForm({ name: '', dose: '', timings: ['am'], notes: '' })
    setShowForm(false)
    toast.success('Supplement added!')
  }

  const toggleFormTiming = (t: Timing) => {
    setForm(f => ({
      ...f,
      timings: f.timings.includes(t) ? f.timings.filter(x => x !== t) : [...f.timings, t],
    }))
  }

  const removeSupplement = async (id: string) => {
    await supabase.from('supplements').update({ active: false }).eq('id', id)
    setSupplements(s => s.filter(x => x.id !== id))
    toast('Supplement removed', { icon: '🗑️' })
  }

  // Slice for the day currently being viewed, today unless backdating.
  const selectedLogs = logs.filter(l => l.log_date === selectedDate)
  // How many times each supplement was logged today, not just whether it was.
  const takenCounts = new Map<string, number>()
  for (const l of selectedLogs) {
    takenCounts.set(l.supplement_id, (takenCounts.get(l.supplement_id) ?? 0) + 1)
  }
  // A supplement tagged both AM and PM appears in both sections on purpose,
  // each has its own check-off, since it is genuinely taken at both times.
  const amSupps = supplements.filter(s => s.timings.includes('am'))
  const pmSupps = supplements.filter(s => s.timings.includes('pm'))
  const otherSupps = supplements.filter(s => !s.timings.includes('am') && !s.timings.includes('pm'))
  // "Taken today" for the progress bar means at least once, a supplement due
  // twice a day should not need two checks to count toward today's percent.
  const totalTaken = supplements.filter(s => takenCounts.has(s.id)).length
  const pct = supplements.length ? Math.round((totalTaken / supplements.length) * 100) : 0

  // 14-day adherence (pure computation, no extra fetch).
  const adherence = supplements.length > 0
    ? calcSupplementAdherence(supplements, logs)
    : null

  const adhrColor = (n: number) => n >= 70 ? '#4be08a' : n >= 50 ? '#e0b84b' : '#e05c5c'

  return (
    <div className="animate-fade-in">
      <BackButton />
      <div className={styles.pageTop}>
        <div>
          <h1 className={styles.pageTopTitle}>
            <Pill size={22} color="#9b59b6" /> Supplement Log
          </h1>
          <p className={styles.pageTopDate}>
            {selectedDate === today
              ? format(new Date(), 'EEEE, MMMM d')
              : format(new Date(`${selectedDate}T12:00:00`), 'EEEE, MMMM d')}
          </p>
        </div>
        <button className={shared.btnPrimary} onClick={() => setShowForm(!showForm)}>
          <Plus size={16} /> Add Supplement
        </button>
      </div>

      {/* Add form. Rendered right below the button that opens it, not after
          three other cards, previously it could be several screens of scroll
          away with no indication it had even appeared. */}
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
              <label className={styles.label}>Timing (pick as many as apply, e.g. magnesium AM and PM)</label>
              <div className={styles.timingRow}>
                {(Object.entries(TIMING_LABELS) as [Timing, string][]).map(([val, label]) => {
                  const active = form.timings.includes(val)
                  const color = TIMING_COLORS[val]
                  return (
                    <button key={val} type="button" onClick={() => toggleFormTiming(val)}
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

      {/* Missed a day? Pull it up and check off what you took. */}
      <div className={styles.card}>
        <label className={styles.label}>Checking off for</label>
        <input
          className={styles.input}
          type="date"
          value={selectedDate}
          max={today}
          onChange={e => setSelectedDate(e.target.value)}
        />
        {selectedDate !== today && (
          <p className={styles.goalHint} style={{ marginTop: 6 }}>
            You are checking off a past day, not today. Switch back to {format(new Date(), 'MMM d')} for today.
          </p>
        )}
      </div>

      {/* Progress for the day being viewed */}
      {supplements.length > 0 && (
        <div className={styles.suppProgressCard}>
          <div className={styles.suppProgressBody}>
            <div className={styles.suppProgressHeader}>
              <span>{selectedDate === today ? "Today's Progress" : `Progress for ${format(new Date(`${selectedDate}T12:00:00`), 'MMM d')}`}</span>
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
                  const count = takenCounts.get(supp.id) ?? 0
                  const taken = count > 0
                  return (
                    <div key={supp.id} className={taken ? styles.suppRowTaken : styles.suppRow}>
                      <button
                        onClick={() => logDose(supp)}
                        className={taken ? styles.suppCheckTaken : styles.suppCheck}
                        title={taken ? 'Log another dose today' : 'Mark as taken'}
                      >
                        {taken && (count > 1
                          ? <span style={{ fontSize: 11, fontWeight: 700, color: '#0e1c1b' }}>{count}x</span>
                          : <Check size={16} color="#0e1c1b" strokeWidth={3} />)}
                      </button>
                      <div className={styles.suppRowBody}>
                        <div className={taken ? styles.suppRowNameTaken : styles.suppRowName}>{supp.name}</div>
                        <div className={styles.suppRowMeta}>{supp.dose} · {supp.timings.map(t => TIMING_LABELS[t]).join(' & ')}{supp.notes ? ` · ${supp.notes}` : ''}</div>
                      </div>
                      {taken && (
                        <button
                          onClick={() => removeLastDose(supp)}
                          className={styles.heartBtn}
                          title="Remove last dose"
                          aria-label={`Remove one dose of ${supp.name}`}
                        >
                          <Minus size={14} />
                        </button>
                      )}
                      <button onClick={() => openResearch(supp)} className={styles.researchBtn} title="Research Check">
                        <Microscope size={14} />
                      </button>
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
        <a href="https://us.fullscript.com/welcome/shunter1782126408" target="_blank" rel="noopener noreferrer" className={shared.btnTeal}>
          <ExternalLink size={14} /> Shop Now
        </a>
      </div>
      <p className={styles.reorderNote}>
        Running low? Reorder through the dispensary so your protocol stays unbroken.
      </p>

      <p className={styles.footerNote}>
        Supplement recommendations are for educational purposes only. Always consult your healthcare provider before starting any new supplement regimen.
      </p>

      {researchSupp && (
        <div className={styles.researchOverlay} onClick={closeResearch}>
          <div className={styles.researchModal} onClick={e => e.stopPropagation()}>
            <button className={styles.researchModalClose} onClick={closeResearch}>✕</button>
            <div>
              <div className={styles.researchModalTitle}>{researchSupp.name}</div>
              <div className={styles.researchModalDose}>{researchSupp.dose} · Research Check</div>
            </div>

            {!isProgram ? (
              <div className={styles.researchUpgradeBox}>
                <div className={styles.researchUpgradeIcon}>🔬</div>
                <div className={styles.researchUpgradeTitle}>Program Feature</div>
                <p className={styles.researchUpgradeText}>
                  Research Check summarizes what published studies say about each supplement, including evidence strength, key findings, and known cautions. Available on the Program plan.
                </p>
                <a href="/pricing" className={shared.btnPrimary}>Upgrade to Program</a>
              </div>
            ) : researchLoading ? (
              <div className={styles.researchLoadingText}>Searching the research...</div>
            ) : researchError ? (
              <p className={styles.researchLoadingText} style={{ color: 'var(--error)' }}>{researchError}</p>
            ) : researchData ? (
              <>
                <div className={styles.researchSection}>
                  <span className={`${styles.researchStrengthBadge} ${styles[researchData.strength]}`}>
                    {STRENGTH_LABELS[researchData.strength] ?? researchData.strength}
                  </span>
                  <p className={styles.researchStrengthLabel}>{researchData.strengthLabel}</p>
                </div>

                {researchData.findings.length > 0 && (
                  <div className={styles.researchSection}>
                    <div className={styles.researchSectionTitle}>What studies show</div>
                    <ul className={styles.researchList}>
                      {researchData.findings.map((f, i) => (
                        <li key={i} className={styles.researchListItem}>{f}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {researchData.cautions.length > 0 && (
                  <div className={styles.researchSection}>
                    <div className={styles.researchSectionTitle}>Cautions to know</div>
                    <ul className={styles.researchList}>
                      {researchData.cautions.map((c, i) => (
                        <li key={i} className={styles.researchCautionItem}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {researchData.populations && (
                  <div className={styles.researchSection}>
                    <div className={styles.researchSectionTitle}>Who has been studied</div>
                    <p className={styles.researchPopulations}>{researchData.populations}</p>
                  </div>
                )}

                <p className={styles.researchDisclaimer}>{researchData.disclaimer}</p>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}
