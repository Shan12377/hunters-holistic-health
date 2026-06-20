import { LayoutGrid, CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react'
import styles from './Client.module.css'

type Compat = 'ok' | 'caution' | 'no'

const BASE_DIETS = [
  { id: 'omnivore',    label: 'Omnivore' },
  { id: 'vegan',       label: 'Vegan' },
  { id: 'vegetarian',  label: 'Vegetarian' },
  { id: 'pescatarian', label: 'Pescatarian' },
  { id: 'wfpb',        label: 'WFPB' },
]

const CLINICAL_PROTOCOLS = [
  { id: 'mediterranean',     label: 'Mediterranean' },
  { id: 'healthy_keto',      label: 'Healthy Keto' },
  { id: 'paleo',             label: 'Paleo' },
  { id: 'low_fodmap',        label: 'Low-FODMAP' },
  { id: 'anti_inflammatory', label: 'Anti-Inflammatory' },
  { id: 'scd',               label: 'SCD' },
  { id: 'anti_candida',      label: 'Anti-Candida' },
  { id: 'dash',              label: 'DASH' },
]

const COMPAT_MATRIX: Record<string, Record<string, Compat>> = {
  omnivore:    { mediterranean: 'ok', healthy_keto: 'ok',      paleo: 'ok',      low_fodmap: 'ok', anti_inflammatory: 'ok', scd: 'ok',      anti_candida: 'ok', dash: 'ok' },
  vegan:       { mediterranean: 'ok', healthy_keto: 'caution', paleo: 'no',      low_fodmap: 'ok', anti_inflammatory: 'ok', scd: 'caution', anti_candida: 'ok', dash: 'ok' },
  vegetarian:  { mediterranean: 'ok', healthy_keto: 'caution', paleo: 'no',      low_fodmap: 'ok', anti_inflammatory: 'ok', scd: 'ok',      anti_candida: 'ok', dash: 'ok' },
  pescatarian: { mediterranean: 'ok', healthy_keto: 'ok',      paleo: 'caution', low_fodmap: 'ok', anti_inflammatory: 'ok', scd: 'ok',      anti_candida: 'ok', dash: 'ok' },
  wfpb:        { mediterranean: 'ok', healthy_keto: 'no',      paleo: 'no',      low_fodmap: 'ok', anti_inflammatory: 'ok', scd: 'caution', anti_candida: 'ok', dash: 'ok' },
}

const COMPAT_META: Record<Compat, { label: string; icon: React.ReactNode; bgColor: string }> = {
  ok:      { label: 'Compatible',   icon: <CheckCircle2 size={18} color="var(--teal)" />, bgColor: 'rgba(11, 158, 142, 0.1)' },
  caution: { label: 'Use Caution',  icon: <AlertTriangle size={18} color="#c8a74b" />,    bgColor: 'rgba(200, 167, 75, 0.12)' },
  no:      { label: 'Incompatible', icon: <XCircle size={18} color="#e05c5c" />,           bgColor: 'rgba(224, 92, 92, 0.1)' },
}

export default function ProtocolMatrixPage() {
  return (
    <div className="animate-fade-in">
      <div className={styles.pageTop}>
        <h1 className={styles.pageTopTitle}>
          <LayoutGrid size={22} color="var(--gold)" /> Protocol Compatibility Matrix
        </h1>
        <p className={styles.pageTopDate}>
          See which clinical protocols can be safely layered onto your base dietary pattern.
        </p>
      </div>

      {/* Legend */}
      <div className={styles.pmLegend}>
        <span className={styles.pmLegendLabel}>Legend:</span>
        {(Object.entries(COMPAT_META) as [Compat, typeof COMPAT_META[Compat]][]).map(([, meta]) => (
          <span key={meta.label} className={styles.pmLegendItem}>
            {meta.icon}
            {meta.label}
          </span>
        ))}
      </div>

      {/* Matrix */}
      <div className={styles.pmCard}>
        <div className={styles.pmTableWrap}>
          <table className={styles.pmTable}>
            <thead>
              <tr>
                <th className={styles.pmThBase}>Base Diet</th>
                {CLINICAL_PROTOCOLS.map(p => (
                  <th key={p.id} className={styles.pmTh}>{p.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BASE_DIETS.map((diet, i) => (
                <tr key={diet.id} className={i % 2 === 0 ? styles.pmRowEven : styles.pmRowOdd}>
                  <td className={styles.pmTdBase}>{diet.label}</td>
                  {CLINICAL_PROTOCOLS.map(protocol => {
                    const compat = COMPAT_MATRIX[diet.id][protocol.id]
                    const meta = COMPAT_META[compat]
                    return (
                      <td key={protocol.id} className={styles.pmTd}>
                        <span className={styles.pmBadge} style={{ background: meta.bgColor }}>
                          {meta.icon}
                        </span>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Phase 1 note */}
      <div className={styles.pmNote}>
        <Info size={16} color="#c8a74b" style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <div className={styles.pmNoteTitle}>Phase 1 Elemental: Standalone Only</div>
          <p className={styles.pmNoteBody}>
            Phase 1 Elemental is a liquid-only protocol for severe GI distress. It cannot be combined with any other dietary or clinical protocol. Always use it as a temporary, standalone intervention under clinical guidance.
          </p>
        </div>
      </div>

      <p className={styles.recipeDisclaimer}>
        This matrix is for educational reference only. Protocol compatibility varies by individual health status.
        Consult your functional medicine educator before combining protocols.
      </p>
    </div>
  )
}
