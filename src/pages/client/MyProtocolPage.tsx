import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { ProtocolData, ProtocolSection } from '@/data/protocols/types'
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

type PhaseKey = number | 'all' | 'supplements'

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
  const [activePhase, setActivePhase] = useState<PhaseKey>(0)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
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

  const sections = activePhase === 'supplements'
    ? supplementSections(data)
    : sectionsForPhase(data, activePhase as number | 'all')

  const activeStep = typeof activePhase === 'number'
    ? PHASE_STEPS.find(s => s.key === activePhase) ?? null
    : null

  return (
    <div className={styles.root}>

      {/* Header */}
      <div className={styles.header}>
        <p className={styles.protocolBadge}>ROOTS Framework</p>
        <h1 className={styles.title}>{protocolLabel}</h1>
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

      {/* Empty state */}
      {sections.length === 0 && (
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
