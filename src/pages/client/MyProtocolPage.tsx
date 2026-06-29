import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { ProtocolData, ProtocolSection } from '@/data/protocols/types'
import styles from './ProtocolPage.module.css'

const PILLAR_ORDER = ['R', 'O1', 'O2', 'T', 'S']
const PILLAR_NAMES: Record<string, string> = {
  R: 'Review',
  O1: 'Nutrition',
  O2: 'Supplements',
  T: 'Lifestyle',
  S: 'Sustain',
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

const PHASES: Array<{ key: number | 'all'; label: string }> = [
  { key: 0, label: 'Phase 0: Prep' },
  { key: 1, label: 'Phase 1: Kill' },
  { key: 2, label: 'Phase 2: Heal' },
  { key: 3, label: 'Phase 3: Maintain' },
  { key: 'all', label: 'Overview' },
]

export default function MyProtocolPage() {
  const [data, setData] = useState<ProtocolData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activePhase, setActivePhase] = useState<number | 'all'>(0)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: row } = await supabase
        .from('client_protocols')
        .select('protocol_data')
        .eq('client_id', user.id)
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
    ? 'ROOTS Framework: Parasite Cleanse Protocol'
    : data.type.replace(/_/g, ' ')

  const sections = sectionsForPhase(data, activePhase)

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <h1 className={styles.title}>Your Protocol</h1>
        <p className={styles.subtitle}>{protocolLabel}</p>
      </div>

      <div className={styles.phaseTabs}>
        {PHASES.map(p => (
          <button
            key={String(p.key)}
            className={activePhase === p.key ? styles.phaseTabActive : styles.phaseTab}
            onClick={() => setActivePhase(p.key)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {sections.length === 0 && (
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem 0' }}>
          Nothing assigned for this phase yet. Check another tab or ask your educator.
        </p>
      )}

      {sections.map(({ pillarId, section }) => {
        const sharedItems = section.items.filter(i => i.checked && i.shared)
        return (
          <div key={section.id} className={styles.pillarSection}>
            <div className={styles.pillarLabel}>
              <span className={styles.pillarDot} />
              {PILLAR_NAMES[pillarId] ?? pillarId}
            </div>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>{section.title}</h3>
              <div className={styles.items}>
                {sharedItems.map(item => (
                  <div key={item.id} className={styles.item}>
                    <span className={styles.itemText}>{item.text}</span>
                    {item.subtext && <span className={styles.itemSubtext}>{item.subtext}</span>}
                    {(item.dose || item.timing || item.link) && (
                      <div className={styles.itemMeta}>
                        {item.dose && <span className={styles.itemDose}>{item.dose}</span>}
                        {item.timing && <span className={styles.itemTiming}>{item.timing}</span>}
                        {item.link && (
                          <a href={item.link} target="_blank" rel="noopener noreferrer" className={styles.itemLink}>
                            {item.linkLabel ?? 'Buy'}
                          </a>
                        )}
                      </div>
                    )}
                    {item.clientNote && <div className={styles.itemNote}>{item.clientNote}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      })}

      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', textAlign: 'center', paddingTop: '1rem', lineHeight: 1.5 }}>
        For educational purposes only. Not medical advice. Always consult your physician before starting any new supplement or protocol.
      </div>
    </div>
  )
}
