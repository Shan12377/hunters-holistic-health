import { useEffect, useState } from 'react'
import { ClipboardList, Save, Moon } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { enqueueLog } from '@/lib/offlineQueue'
import { STEPS_GOAL, WATER_GOAL_OZ } from '@/lib/goals'
import { getPushPermissionState, requestPushPermission, subscribeToPush } from '@/lib/pushNotifications'
import { format, subDays } from 'date-fns'
import type { DailyLog } from '@/types'
import { awardPoints } from '@/lib/points'
import toast from 'react-hot-toast'
import BackButton from '@/components/BackButton'
import styles from './Client.module.css'
import shared from '../../styles/shared.module.css'

const ENERGY_LABELS = ['', '😴 Exhausted', '😓 Very Low', '😔 Low', '😐 Below Average', '😶 Average', '🙂 Decent', '😊 Good', '💪 Great', '🔥 Excellent', '⚡ Peak Energy']
const SLEEP_QUALITY_LABELS = ['', '😣 Restless', '😴 Poor', '😐 Fair', '😊 Good', '🌟 Refreshed']

export default function DailyLogPage() {
  const { user } = useAuthStore()
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
    supplement_noon_done: false,
    supplement_pm_done: false,
    sleep_hours: null,
    sleep_quality: null,
    late_slip_reason: null,
  })
  const [saving, setSaving] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (user) fetchLog()
  }, [user?.id])

  const fetchLog = async () => {
    if (!user) return
    try {
      const { data, error } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('log_date', today)
        .single()
      if (!error && data) setLog(data as DailyLog)
    } catch {
      // Offline: keep default empty state
    } finally {
      setLoaded(true)
    }
  }

  const handleSave = async () => {
    if (!user) return
    setSaving(true)

    if (!navigator.onLine) {
      await enqueueLog({
        user_id: user.id,
        log_date: today,
        payload: { ...log },
        queued_at: Date.now(),
      })
      toast.success('Saved offline. Will sync when you reconnect.')
      setSaving(false)
      return
    }

    const { error } = await supabase.from('daily_logs').upsert(
      { ...log, user_id: user.id, log_date: today },
      { onConflict: 'user_id,log_date' }
    )
    if (error) {
      toast.error('Failed to save log')
    } else {
      toast.success('Daily log saved!')
      await awardPoints(user.id, 'daily_log', 10, today)
      await checkStreak(user.id)
      maybePromptPush(user.id)
    }
    setSaving(false)
  }

  const maybePromptPush = async (userId: string) => {
    if (getPushPermissionState() !== 'default') return
    if (localStorage.getItem('push_prompted')) return
    localStorage.setItem('push_prompted', '1')
    // Small delay so the success toast shows first
    setTimeout(async () => {
      const granted = await requestPushPermission()
      if (granted === 'granted') await subscribeToPush(userId)
    }, 800)
  }

  const checkStreak = async (userId: string) => {
    const sevenDaysAgo = format(subDays(new Date(), 6), 'yyyy-MM-dd')
    const { data } = await supabase
      .from('daily_logs')
      .select('log_date')
      .eq('user_id', userId)
      .gte('log_date', sevenDaysAgo)
      .lte('log_date', today)
    if (data && data.length === 7) {
      const isNew = await awardPoints(userId, 'streak_bonus', 20, `streak_${today}`)
      if (isNew) toast.success('🔥 7-day streak! +20 bonus points!')
    }
  }

  const toggle = (field: keyof DailyLog) => setLog(l => ({ ...l, [field]: !l[field as keyof typeof l] }))
  const setNum = (field: keyof DailyLog) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setLog(l => ({ ...l, [field]: parseInt(e.target.value) || 0 }))
  const setFloat = (field: keyof DailyLog) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setLog(l => ({ ...l, [field]: parseFloat(e.target.value) || null }))

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
      <BackButton />
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
          <CheckItem field="supplement_am_done"   label="AM Supplements Taken"        sublabel="Morning protocol — with breakfast or first meal" />
          <CheckItem field="supplement_noon_done" label="Afternoon Supplements Taken" sublabel="Midday protocol — with lunch or a light snack" />
          <CheckItem field="supplement_pm_done"   label="PM Supplements Taken"        sublabel="Evening protocol — with dinner or before bed" />
        </div>
      </div>

      {/* Sleep */}
      <div className={styles.card}>
        <h3 className={styles.cardLabel}><Moon size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />Sleep (Last Night)</h3>
        <div className={styles.inputRow}>
          <div className={styles.field}>
            <label className={styles.label}>Hours Slept</label>
            <input
              className={styles.input}
              type="number"
              value={log.sleep_hours ?? ''}
              onChange={setFloat('sleep_hours')}
              min={0} max={14} step={0.5}
              placeholder="e.g. 7.5"
            />
            {log.sleep_hours != null && (
              <div className={log.sleep_hours >= 7 ? styles.goalHintMet : styles.goalHint}>
                {log.sleep_hours >= 9 ? 'Well rested' : log.sleep_hours >= 7 ? '✓ Goal met (7-9 hrs)' : `${(7 - log.sleep_hours).toFixed(1)} hrs short of goal`}
              </div>
            )}
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Sleep Quality</label>
            <input
              type="range" min={1} max={5}
              value={log.sleep_quality ?? 3}
              onChange={e => setLog(l => ({ ...l, sleep_quality: parseInt(e.target.value) }))}
              className={styles.slider}
            />
            <div className={styles.sliderValueWrap}>
              <span className={styles.sliderValue}>{log.sleep_quality ?? '—'}</span>
              <span className={styles.sliderMax}>/5</span>
              <div className={styles.sliderLabel}>{log.sleep_quality ? SLEEP_QUALITY_LABELS[log.sleep_quality] : 'Tap to rate'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className={styles.card}>
        <h3 className={styles.cardLabel}>Metrics</h3>
        <div className={styles.inputRow}>
          <div className={styles.field}>
            <label className={styles.label}>Steps Today</label>
            <input className={styles.input} type="number" value={log.steps ?? 0} onChange={setNum('steps')} min={0} max={100000} placeholder="0" />
            <div className={(log.steps ?? 0) >= STEPS_GOAL ? styles.goalHintMet : styles.goalHint}>
              Goal: {STEPS_GOAL.toLocaleString()} {(log.steps ?? 0) >= STEPS_GOAL ? '✓ Reached!' : `(${Math.max(0, STEPS_GOAL - (log.steps ?? 0)).toLocaleString()} to go)`}
            </div>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Water (oz)</label>
            <input className={styles.input} type="number" value={log.water_oz ?? 0} onChange={setNum('water_oz')} min={0} max={300} placeholder="0" />
            <div className={(log.water_oz ?? 0) >= WATER_GOAL_OZ ? styles.goalHintMet : styles.goalHint}>
              Goal: {WATER_GOAL_OZ} oz {(log.water_oz ?? 0) >= WATER_GOAL_OZ ? '✓ Reached!' : `(${Math.max(0, WATER_GOAL_OZ - (log.water_oz ?? 0))} to go)`}
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
