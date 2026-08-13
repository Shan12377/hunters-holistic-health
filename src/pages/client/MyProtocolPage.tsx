import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { supabase } from '@/lib/supabase'
import type { ProtocolData, ProtocolItem, ProtocolSection } from '@/data/protocols/types'
import BackButton from '@/components/BackButton'
import styles from './ProtocolPage.module.css'

const PILLAR_ORDER = ['R', 'O1', 'O2', 'T', 'S']

const PILLAR_COLORS: Record<string, string> = {
  R:  '#7c6ef5',
  O1: '#0B9E8E',
  O2: '#c8a74b',
  T:  '#4be08a',
  S:  '#58a6ff',
}

const PILLAR_NAMES: Record<string, string> = {
  R:  'Review',
  O1: 'Nutrition',
  O2: 'Supplements',
  T:  'Lifestyle',
  S:  'Sustain',
}

const PHASE_STEPS = [
  { key: 0, label: 'Prep',     color: '#0B9E8E', desc: 'Open drainage pathways and prepare your body before the protocol begins.' },
  { key: 1, label: 'Kill',     color: '#c8a74b', desc: 'Active clearance. This phase targets the root cause directly.' },
  { key: 2, label: 'Heal',     color: '#4be08a', desc: 'Repair the gut lining and restore beneficial flora after clearance.' },
  { key: 3, label: 'Maintain', color: '#7c6ef5', desc: 'Sustain your results with long-term maintenance support.' },
]

type PhaseKey = number | 'all' | 'supplements' | 'day'

// My Day: bucket every shared item by its timing text so the client sees
// their day at a glance. ponytail: keyword matching on free-text timing,
// falls back to Anytime; refine buckets if educators start using new phrasing.
const DAY_BUCKETS = [
  { key: 'morning', label: 'Morning', test: /morning|(^|\s)am\b|wake|breakfast|empty stomach/i },
  { key: 'meals', label: 'With meals', test: /meal|lunch|food|midday|noon/i },
  { key: 'evening', label: 'Evening', test: /evening|(^|\s)pm\b|night|bed|dinner/i },
  { key: 'anytime', label: 'Anytime', test: /./ },
]

function dayBuckets(data: ProtocolData): Array<{ label: string; items: Array<ProtocolItem & { pillarId: string }> }> {
  const all: Array<ProtocolItem & { pillarId: string }> = []
  for (const pillar of data.pillars) {
    for (const section of pillar.sections) {
      if (!section.shared) continue
      for (const item of section.items) {
        if (item.checked && item.shared) all.push({ ...item, pillarId: pillar.id })
      }
    }
  }
  return DAY_BUCKETS.map(bucket => ({
    label: bucket.label,
    items: all.filter(item => {
      const firstMatch = DAY_BUCKETS.find(b => b.test.test(item.timing ?? ''))
      return (item.timing ? firstMatch?.key : 'anytime') === bucket.key
    }),
  })).filter(b => b.items.length > 0)
}

function dayChecksKey(): string {
  return `protocol_day_checks_${format(new Date(), 'yyyy-MM-dd')}`
}

function loadDayChecks(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(dayChecksKey()) ?? '{}')
  } catch {
    return {}
  }
}

function sectionsForPhase(data: ProtocolData, phase: number | 'all'): Array<{ pillarId: string; section: ProtocolSection }> {
  const result: Array<{ pillarId: string; section: ProtocolSection }> = []
  for (const pillar of data.pillars) {
    for (const section of pillar.sections) {
      if (!section.shared) continue
      const hasItems = section.items.some(i => i.checked && i.shared)
      if (!hasItems) continue
      if (phase === 'all') {
        if (section.phase === undefined) result.push({ pillarId: pillar.id, section })
      } else {
        if (section.phase === phase) result.push({ pillarId: pillar.id, section })
      }
    }
  }
  return result.sort((a, b) => PILLAR_ORDER.indexOf(a.pillarId) - PILLAR_ORDER.indexOf(b.pillarId))
}

function supplementSections(data: ProtocolData): Array<{ pillarId: string; section: ProtocolSection }> {
  const result: Array<{ pillarId: string; section: ProtocolSection }> = []
  for (const pillar of data.pillars) {
    if (pillar.id !== 'O2') continue
    for (const section of pillar.sections) {
      if (!section.shared) continue
      if (!section.items.some(i => i.checked && i.shared)) continue
      result.push({ pillarId: pillar.id, section })
    }
  }
  return result
}

export default function MyProtocolPage() {
  const [data, setData] = useState<ProtocolData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activePhase, setActivePhase] = useState<PhaseKey>('day')
  const [dayChecks, setDayChecks] = useState<Record<string, boolean>>(loadDayChecks)

  const toggleDayCheck = (id: string) => {
    const next = { ...loadDayChecks(), [id]: !dayChecks[id] }
    localStorage.setItem(dayChecksKey(), JSON.stringify(next))
    setDayChecks(next)
  }

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user
      if (!user) return
      const { data: row } = await supabase
        .from('client_protocols')
        .select('protocol_data')
        .eq('user_id', user.id)
        .maybeSingle()
      setData(row?.protocol_data ?? null)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className={styles.loading}>Loading your protocol...</div>

  if (!data) {
    return (
      <div className={styles.root}>
        <div className={styles.noProtocol}>
          Your educator has not assigned a protocol yet. Check back after your first session.
        </div>
      </div>
    )
  }

  const protocolLabel = data.type === 'parasite_cleanse'
    ? 'Parasite Cleanse Protocol'
    : data.type.replace(/_/g, ' ')

  const sections = activePhase === 'day' ? []
    : activePhase === 'supplements'
    ? supplementSections(data)
    : sectionsForPhase(data, activePhase as number | 'all')

  const buckets = activePhase === 'day' ? dayBuckets(data) : []
  const dayTotal = buckets.reduce((n, b) => n + b.items.length, 0)
  const dayDone = buckets.reduce((n, b) => n + b.items.filter(i => dayChecks[i.id]).length, 0)

  const activeStep = typeof activePhase === 'number'
    ? PHASE_STEPS.find(s => s.key === activePhase) ?? null
    : null

  return (
    <div className={styles.root}>

      <BackButton />
      {/* Header */}
      <div className={styles.header}>
        <p className={styles.protocolBadge}>ROOTS Framework</p>
        <h1 className={styles.title}>{protocolLabel}</h1>
        <div className={styles.summaryChips}>
          <span className={styles.summaryChip}>
            {supplementSections(data).reduce((n, s) => n + s.section.items.filter(i => i.checked && i.shared).length, 0)} supplements
          </span>
          <span className={styles.summaryChip}>{PHASE_STEPS.length} phases</span>
          <span className={styles.summaryChipGold}>Prepared for you by Dr. Hunter</span>
        </div>
      </div>

      {/* Phase journey stepper */}
      <div className={styles.stepperWrap}>
        <div className={styles.stepper}>
          {PHASE_STEPS.map((step, idx) => {
            const isActive = activePhase === step.key
            const isPast = typeof activePhase === 'number' && step.key < activePhase
            return (
              <div key={step.key} className={styles.stepItem}>
                {idx > 0 && (
                  <div
                    className={styles.stepLine}
                    style={{ background: isPast || isActive ? step.color : 'var(--border)' }}
                  />
                )}
                <button
                  className={styles.stepBtn}
                  onClick={() => setActivePhase(step.key)}
                  style={isActive ? { borderColor: step.color, background: step.color, color: '#fff' }
                    : isPast ? { borderColor: step.color, color: step.color }
                    : {}}
                >
                  {step.key}
                </button>
                <span
                  className={styles.stepLabel}
                  style={isActive ? { color: step.color, fontWeight: 700 } : {}}
                >
                  {step.label}
                </span>
              </div>
            )
          })}
        </div>

        {/* Secondary utility tabs */}
        <div className={styles.utilityTabs}>
          <button
            className={activePhase === 'day' ? styles.utilTabActive : styles.utilTab}
            onClick={() => setActivePhase('day')}
          >
            My Day
          </button>
          <button
            className={activePhase === 'all' ? styles.utilTabActive : styles.utilTab}
            onClick={() => setActivePhase('all')}
          >
            Overview
          </button>
          <button
            className={activePhase === 'supplements' ? styles.utilTabActive : styles.utilTab}
            onClick={() => setActivePhase('supplements')}
          >
            Supplements
          </button>
        </div>
      </div>

      {/* Active phase hero */}
      {activeStep && (
        <div className={styles.phaseHero} style={{ borderColor: activeStep.color }}>
          <div className={styles.phaseHeroNum} style={{ color: activeStep.color }}>
            Phase {activeStep.key}
          </div>
          <div className={styles.phaseHeroName} style={{ color: activeStep.color }}>
            {activeStep.label}
          </div>
          <p className={styles.phaseHeroDesc}>{activeStep.desc}</p>
        </div>
      )}

      {activePhase === 'all' && (
        <div className={styles.phaseHero} style={{ borderColor: '#91a0ac' }}>
          <div className={styles.phaseHeroName} style={{ color: '#91a0ac' }}>Full Protocol Overview</div>
          <p className={styles.phaseHeroDesc}>Every section assigned to your protocol across all phases.</p>
        </div>
      )}

      {activePhase === 'supplements' && (
        <div className={styles.phaseHero} style={{ borderColor: '#c8a74b' }}>
          <div className={styles.phaseHeroName} style={{ color: '#c8a74b' }}>Your Supplements</div>
          <p className={styles.phaseHeroDesc}>All supplements assigned to your protocol. Tap any link to order.</p>
        </div>
      )}

      {/* My Day: the client's protocol as a daily rhythm with tap-to-check */}
      {activePhase === 'day' && (
        <>
          <div className={styles.phaseHero} style={{ borderColor: 'var(--gold, #c8a74b)' }}>
            <div className={styles.phaseHeroName} style={{ color: 'var(--gold, #c8a74b)' }}>
              Today, {format(new Date(), 'EEEE, MMMM d')}
            </div>
            <p className={styles.phaseHeroDesc}>
              {dayTotal === 0
                ? 'Your daily items will appear here once your educator assigns them.'
                : dayDone === dayTotal
                ? 'Everything checked off. Beautifully done today.'
                : `Tap each item as you go. ${dayDone} of ${dayTotal} done today.`}
            </p>
          </div>

          {buckets.map(bucket => (
            <div key={bucket.label} className={styles.dayGroup}>
              <div className={styles.dayGroupTitle}>{bucket.label}</div>
              {bucket.items.map(item => {
                const done = !!dayChecks[item.id]
                const pillarColor = PILLAR_COLORS[item.pillarId] ?? '#0B9E8E'
                return (
                  <button
                    key={item.id}
                    className={done ? styles.dayItemDone : styles.dayItem}
                    onClick={() => toggleDayCheck(item.id)}
                  >
                    <span
                      className={done ? styles.dayCheckOn : styles.dayCheckOff}
                      style={done ? { background: pillarColor, borderColor: pillarColor } : { borderColor: pillarColor }}
                    >
                      {done ? '✓' : ''}
                    </span>
                    <span className={styles.dayItemBody}>
                      <span className={styles.dayItemName}>{item.text}</span>
                      {(item.dose || item.timing) && (
                        <span className={styles.dayItemMeta}>
                          {[item.dose, item.timing].filter(Boolean).join(' · ')}
                        </span>
                      )}
                    </span>
                  </button>
                )
              })}
            </div>
          ))}

          {dayTotal > 0 && (
            <p className={styles.dayFootnote}>
              Checks reset each morning. This is your rhythm, not a test.
            </p>
          )}
        </>
      )}

      {/* Empty state */}
      {activePhase !== 'day' && sections.length === 0 && (
        <p className={styles.emptyState}>
          {activePhase === 'supplements'
            ? 'No supplements assigned yet. Ask your educator to add them.'
            : 'Nothing assigned for this phase yet. Check another tab or ask your educator.'}
        </p>
      )}

      {/* Section cards */}
      {sections.map(({ pillarId, section }) => {
        const sharedItems = section.items.filter(i => i.checked && i.shared)
        const pillarColor = PILLAR_COLORS[pillarId] ?? '#0B9E8E'
        return (
          <div key={section.id} className={styles.sectionBlock}>

            <div className={styles.pillarTag} style={{ color: pillarColor }}>
              <span className={styles.pillarDot} style={{ background: pillarColor }} />
              {PILLAR_NAMES[pillarId] ?? pillarId}
            </div>

            <div className={styles.sectionCard} style={{ borderLeftColor: pillarColor }}>
              <h3 className={styles.sectionTitle}>{section.title}</h3>
              {section.clientNote && (
                <div className={styles.sectionNote} style={{ borderLeftColor: pillarColor }}>
                  {section.clientNote}
                </div>
              )}

              <div className={styles.itemList}>
                {sharedItems.map(item => (
                  <div key={item.id} className={styles.itemCard}>
                    <div className={styles.itemHeader}>
                      <span className={styles.itemName}>{item.text}</span>
                    </div>
                    {item.subtext && (
                      <p className={styles.itemDesc}>{item.subtext}</p>
                    )}
                    {item.clientNote && (
                      <div className={styles.itemClientNote} style={{ borderLeftColor: pillarColor }}>
                        {item.clientNote}
                      </div>
                    )}
                    {(item.dose || item.timing || item.link) && (
                      <div className={styles.itemFooter}>
                        <div className={styles.itemPills}>
                          {item.dose && (
                            <span className={styles.dosePill} style={{ color: pillarColor, borderColor: `${pillarColor}50`, background: `${pillarColor}12` }}>
                              {item.dose}
                            </span>
                          )}
                          {item.timing && (
                            <span className={styles.timingPill}>{item.timing}</span>
                          )}
                        </div>
                        {item.link && (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.buyBtn}
                            style={{ color: pillarColor, borderColor: `${pillarColor}60` }}
                          >
                            {item.linkLabel ?? 'Get the supplement'} →
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      })}

      <p className={styles.disclaimer}>
        For educational purposes only. Not medical advice. Always consult your physician before starting any new supplement or protocol.
      </p>
    </div>
  )
}
