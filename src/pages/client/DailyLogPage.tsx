import { useEffect, useState } from 'react'
import { ClipboardList, Save } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'
import type { DailyLog } from '@/types'
import toast from 'react-hot-toast'
import styles from './Client.module.css'
import shared from '../../styles/shared.module.css'

const ENERGY_LABELS = ['', '😴 Exhausted', '😓 Very Low', '😔 Low', '😐 Below Average', '😶 Average', '🙂 Decent', '😊 Good', '💪 Great', '🔥 Excellent', '⚡ Peak Energy']

export default function DailyLogPage() {
  const today = format(new Date(), 'yyyy-MM-dd')
  const [log, setLog] = useState<Partial<DailyLog>>({
    log_date: today,
    steps: 0,
    energy_level: 5,
    water_oz: 0,
    morning_fast_done: false,
    meal1_logged: false,
    meal2_logged: false,
    snack_logged: false,
    supplement_am_done: false,
    supplement_pm_done: false,
    late_slip_reason: null,
  })
  const [saving, setSaving] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => { fetchLog() }, [])

  const fetchLog = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('log_date', today)
      .single()
    if (data) setLog(data as DailyLog)
    setLoaded(true)
  }

  const handleSave = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    const { error } = await supabase.from('daily_logs').upsert(
      { ...log, user_id: user.id, log_date: today },
      { onConflict: 'user_id,log_date' }
    )
    if (error) {
      toast.error('Failed to save log')
    } else {
      toast.success('Daily log saved!')
    }
    setSaving(false)
  }

  const toggle = (field: keyof DailyLog) => setLog(l => ({ ...l, [field]: !l[field as keyof typeof l] }))
  const setNum = (field: keyof DailyLog) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setLog(l => ({ ...l, [field]: parseInt(e.target.value) || 0 }))

  const CheckItem = ({ field, label, sublabel }: { field: keyof DailyLog; label: string; sublabel?: string }) => {
    const checked = Boolean(log[field])
    return (
      <button
        type="button"
        onClick={() => toggle(field)}
        className={`${styles.checkItem} ${checked ? styles.checkItemChecked : ''}`}
      >
        <div className={`${styles.checkBox} ${checked ? styles.checkBoxChecked : ''}`}>
          ✓
        </div>
        <div>
          <div className={`${styles.checkLabel} ${checked ? styles.checkLabelChecked : ''}`}>{label}</div>
          {sublabel && <div className={styles.checkSublabel}>{sublabel}</div>}
        </div>
      </button>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className={styles.pageTop}>
        <div>
          <h1 className={styles.pageTopTitle}>
            <ClipboardList size={22} color="var(--teal)" /> Daily Log
          </h1>
          <p className={styles.pageTopDate}>{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>
        <button className={shared.btnTeal} onClick={handleSave} disabled={saving || !loaded}>
          <Save size={16} /> {saving ? 'Saving...' : 'Save Log'}
        </button>
      </div>

      {/* Nutrition & Fasting */}
      <div className={styles.card}>
        <h3 className={styles.cardLabel}>Nutrition & Fasting</h3>
        <div className={styles.checklist}>
          <CheckItem field="morning_fast_done" label="Morning Fast Completed" sublabel="Completed fasting window before first meal" />
          <CheckItem field="meal1_logged" label="Meal 1 Logged" sublabel="First meal of the day recorded" />
          <CheckItem field="meal2_logged" label="Meal 2 Logged" sublabel="Second meal of the day recorded" />
          <CheckItem field="snack_logged" label="Snack (if applicable)" sublabel="Any snack between meals" />
        </div>
      </div>

      {/* Supplements */}
      <div className={styles.card}>
        <h3 className={styles.cardLabel}>Supplements</h3>
        <div className={styles.checklist}>
          <CheckItem field="supplement_am_done" label="AM Supplements Taken" sublabel="Morning supplement protocol" />
          <CheckItem field="supplement_pm_done" label="PM Supplements Taken" sublabel="Evening supplement protocol" />
        </div>
      </div>

      {/* Metrics */}
      <div className={styles.card}>
        <h3 className={styles.cardLabel}>Metrics</h3>
        <div className={styles.inputRow}>
          <div className={styles.field}>
            <label className={styles.label}>Steps Today</label>
            <input className={styles.input} type="number" value={log.steps ?? 0} onChange={setNum('steps')} min={0} max={100000} placeholder="0" />
            <div className={(log.steps ?? 0) >= 8000 ? styles.goalHintMet : styles.goalHint}>
              Goal: 8,000 {(log.steps ?? 0) >= 8000 ? '✓ Reached!' : `(${Math.max(0, 8000 - (log.steps ?? 0)).toLocaleString()} to go)`}
            </div>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Water (oz)</label>
            <input className={styles.input} type="number" value={log.water_oz ?? 0} onChange={setNum('water_oz')} min={0} max={300} placeholder="0" />
            <div className={(log.water_oz ?? 0) >= 64 ? styles.goalHintMet : styles.goalHint}>
              Goal: 64 oz {(log.water_oz ?? 0) >= 64 ? '✓ Reached!' : `(${Math.max(0, 64 - (log.water_oz ?? 0))} to go)`}
            </div>
          </div>
        </div>
      </div>

      {/* Energy Level */}
      <div className={styles.card}>
        <h3 className={styles.cardLabel}>Energy Level</h3>
        <div className={styles.sliderRow}>
          <input
            type="range" min={1} max={10} value={log.energy_level ?? 5}
            onChange={e => setLog(l => ({ ...l, energy_level: parseInt(e.target.value) }))}
            className={styles.slider}
          />
          <div className={styles.sliderValueWrap}>
            <span className={styles.sliderValue}>{log.energy_level}</span>
            <span className={styles.sliderMax}>/10</span>
            <div className={styles.sliderLabel}>{ENERGY_LABELS[log.energy_level ?? 5]}</div>
          </div>
        </div>
      </div>

      {/* Save button (bottom) */}
      <button className={`${shared.btnPrimary} ${shared.btnFull} ${shared.btnLg}`} onClick={handleSave} disabled={saving || !loaded}>
        <Save size={18} /> {saving ? 'Saving...' : 'Save Daily Log'}
      </button>
    </div>
  )
}
