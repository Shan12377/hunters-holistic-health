import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { ProtocolData, ProtocolPillar, ProtocolSection, ProtocolItem } from '@/data/protocols/types'
import { PARASITE_CLEANSE_TEMPLATE } from '@/data/protocols/parasiteCleanse'
import styles from './ProtocolBuilder.module.css'

const TEMPLATES: Record<string, ProtocolData> = {
  parasite_cleanse: PARASITE_CLEANSE_TEMPLATE,
}

const PROTOCOL_TYPE_OPTIONS = [
  { value: 'parasite_cleanse', label: 'Parasite Cleanse' },
  { value: 'blood_pressure',   label: 'Blood Pressure' },
  { value: 'gut_healing',      label: 'Gut Healing' },
  { value: 'metabolic_reset',  label: 'Metabolic Reset' },
  { value: 'hormone_balance',  label: 'Hormone Balance' },
  { value: 'custom',           label: 'Custom' },
]

interface Props {
  clientId: string
  protocolType: string
  savedData?: ProtocolData | null
  onSaved?: () => void
}

export default function ProtocolBuilder({ clientId, protocolType: initialType, savedData, onSaved }: Props) {
  const [selectedType, setSelectedType] = useState(savedData?.type ?? initialType ?? 'parasite_cleanse')
  const template = TEMPLATES[selectedType]
  const [data, setData] = useState<ProtocolData>(savedData ?? template ?? PARASITE_CLEANSE_TEMPLATE)
  const [activePillar, setActivePillar] = useState(data.pillars[0]?.id ?? 'R')
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState('')

  const updateItem = useCallback((pillarId: string, sectionId: string, itemId: string, patch: Partial<ProtocolItem>) => {
    setData(prev => ({
      ...prev,
      pillars: prev.pillars.map(p =>
        p.id !== pillarId ? p : {
          ...p,
          sections: p.sections.map(s =>
            s.id !== sectionId ? s : {
              ...s,
              items: s.items.map(i => i.id !== itemId ? i : { ...i, ...patch }),
            }
          ),
        }
      ),
    }))
  }, [])

  const updateSection = useCallback((pillarId: string, sectionId: string, patch: Partial<ProtocolSection>) => {
    setData(prev => ({
      ...prev,
      pillars: prev.pillars.map(p =>
        p.id !== pillarId ? p : {
          ...p,
          sections: p.sections.map(s => s.id !== sectionId ? s : { ...s, ...patch }),
        }
      ),
    }))
  }, [])

  const save = async () => {
    setSaving(true)
    setSaveStatus('')
    const { error } = await supabase
      .from('client_protocols')
      .upsert({ client_id: clientId, protocol_data: data, protocol_type: selectedType }, { onConflict: 'client_id' })
    setSaving(false)
    if (error) {
      setSaveStatus('Error saving. Try again.')
    } else {
      setSaveStatus('Saved.')
      onSaved?.()
      setTimeout(() => setSaveStatus(''), 3000)
    }
  }

  const switchType = (type: string) => {
    setSelectedType(type)
    const t = TEMPLATES[type]
    if (t) {
      setData(t)
      setActivePillar(t.pillars[0]?.id ?? 'R')
    }
  }

  const pillar = data.pillars.find(p => p.id === activePillar)

  return (
    <div className={styles.root}>
      {/* Protocol type selector */}
      <div>
        <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Protocol Type</p>
        <div className={styles.pillars}>
          {PROTOCOL_TYPE_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              className={selectedType === value ? styles.pillarBtnActive : styles.pillarBtn}
              onClick={() => switchType(value)}
            >
              {label}
            </button>
          ))}
        </div>
        {!TEMPLATES[selectedType] && (
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.75rem' }}>
            Template for this protocol type is coming soon. Select Parasite Cleanse to get started.
          </p>
        )}
      </div>

      {TEMPLATES[selectedType] && (
        <>
          <div className={styles.pillars}>
            {data.pillars.map(p => (
              <button
                key={p.id}
                className={activePillar === p.id ? styles.pillarBtnActive : styles.pillarBtn}
                onClick={() => setActivePillar(p.id)}
              >
                <span className={styles.pillarLetter}>{p.letter}</span>
                {p.title.split(' ')[0]}
              </button>
            ))}
          </div>

          {pillar && (
            <div className={styles.content}>
              <div className={styles.pillarHeader}>
                <h3 className={styles.pillarTitle}>{pillar.letter} — {pillar.title}</h3>
                <p className={styles.pillarSubtitle}>{pillar.subtitle}</p>
              </div>

              {pillar.sections.map(section => (
                <SectionCard
                  key={section.id}
                  section={section}
                  onUpdateItem={(itemId, patch) => updateItem(pillar.id, section.id, itemId, patch)}
                  onUpdateSection={patch => updateSection(pillar.id, section.id, patch)}
                />
              ))}
            </div>
          )}

          <div className={styles.saveBar}>
            {saveStatus && <span className={styles.saveStatus}>{saveStatus}</span>}
            <button className={styles.saveBtn} onClick={save} disabled={saving}>
              {saving ? 'Saving...' : 'Save Protocol'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function SectionCard({
  section,
  onUpdateItem,
  onUpdateSection,
}: {
  section: ProtocolSection
  onUpdateItem: (itemId: string, patch: Partial<ProtocolItem>) => void
  onUpdateSection: (patch: Partial<ProtocolSection>) => void
}) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <div>
          <h4 className={styles.sectionTitle}>{section.title}</h4>
          {section.description && <p className={styles.sectionDescription}>{section.description}</p>}
        </div>
        <button
          className={section.shared ? styles.shareToggleOn : styles.shareToggle}
          onClick={() => onUpdateSection({ shared: !section.shared })}
          title="Toggle client visibility for this whole section"
        >
          {section.shared ? '👁 Client sees' : '🔒 Private'}
        </button>
      </div>

      {section.items.length > 0 && (
        <div className={styles.items}>
          {section.items.map(item => (
            <ItemRow key={item.id} item={item} onUpdate={patch => onUpdateItem(item.id, patch)} />
          ))}
        </div>
      )}

      {section.items.length === 0 && (
        <p className={styles.emptySection}>No items in this section.</p>
      )}

      <textarea
        className={styles.sectionNote}
        placeholder="Note to client (they will see this)..."
        value={section.clientNote ?? ''}
        onChange={e => onUpdateSection({ clientNote: e.target.value })}
        rows={2}
        style={{ borderColor: 'rgba(34,197,94,0.4)' }}
      />
      <textarea
        className={styles.sectionNote}
        placeholder="Educator note (private, client cannot see)..."
        value={section.educatorNote ?? ''}
        onChange={e => onUpdateSection({ educatorNote: e.target.value })}
        rows={2}
      />
    </div>
  )
}

function ItemRow({ item, onUpdate }: { item: ProtocolItem; onUpdate: (patch: Partial<ProtocolItem>) => void }) {
  return (
    <div className={item.checked ? styles.itemChecked : styles.item}>
      <input
        type="checkbox"
        className={styles.itemCheckbox}
        checked={item.checked}
        onChange={e => onUpdate({ checked: e.target.checked })}
      />
      <div className={styles.itemBody}>
        <span className={styles.itemText}>{item.text}</span>
        {item.subtext && <span className={styles.itemSubtext}>{item.subtext}</span>}
        {(item.dose || item.timing || item.link) && (
          <div className={styles.itemMeta}>
            {item.dose && <span className={styles.itemDose}>{item.dose}</span>}
            {item.timing && <span className={styles.itemTiming}>{item.timing}</span>}
            {item.link && (
              <a href={item.link} target="_blank" rel="noopener noreferrer" className={styles.itemLink}>
                {item.linkLabel ?? 'Link'}
              </a>
            )}
          </div>
        )}
        <textarea
          className={styles.noteField}
          placeholder="Client note (shared with client when section is visible)..."
          value={item.clientNote ?? ''}
          onChange={e => onUpdate({ clientNote: e.target.value })}
          rows={1}
        />
      </div>
      <button
        className={item.shared ? styles.itemShareBtnOn : styles.itemShareBtn}
        onClick={() => onUpdate({ shared: !item.shared })}
        title="Toggle client visibility for this item"
      >
        {item.shared ? '👁' : '🔒'}
      </button>
    </div>
  )
}
