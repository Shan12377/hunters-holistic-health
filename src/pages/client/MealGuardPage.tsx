import { useState, useEffect } from 'react'
import { Shield, AlertTriangle, CheckCircle, Loader, Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { checkMealGuard } from '@/lib/openai'
import type { MealLog } from '@/types'
import { format, parseISO } from 'date-fns'
import toast from 'react-hot-toast'
import styles from './Client.module.css'
import shared from '../../styles/shared.module.css'

const MEAL_TYPES = [
  { value: 'morning_fast', label: 'Morning Fast Window' },
  { value: 'meal1', label: 'Meal 1' },
  { value: 'meal2', label: 'Meal 2' },
  { value: 'snack', label: 'Snack' },
]

export default function MealGuardPage() {
  const [foodInput, setFoodInput] = useState('')
  const [mealType, setMealType] = useState('meal1')
  const [checking, setChecking] = useState(false)
  const [result, setResult] = useState<Awaited<ReturnType<typeof checkMealGuard>> | null>(null)
  const [logs, setLogs] = useState<MealLog[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchTodayLogs() }, [])

  const fetchTodayLogs = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const today = new Date().toISOString().split('T')[0]
    const { data } = await supabase
      .from('meal_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('logged_at', today + 'T00:00:00')
      .order('logged_at', { ascending: false })
    setLogs((data as MealLog[]) ?? [])
  }

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!foodInput.trim()) return
    setChecking(true)
    setResult(null)
    const res = await checkMealGuard(foodInput, [])
    setResult(res)
    setChecking(false)
  }

  const handleLog = async () => {
    if (!foodInput.trim()) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    const { error } = await supabase.from('meal_logs').insert({
      user_id: user.id,
      food_name: foodInput.trim(),
      meal_type: mealType as MealLog['meal_type'],
      ai_flag: result?.flagged ?? false,
      ai_warning: result?.warning ?? null,
      ai_alternatives: result?.alternatives?.length ? result.alternatives : null,
      logged_at: new Date().toISOString(),
    })
    if (error) {
      toast.error('Failed to save meal')
    } else {
      toast.success('Meal logged!')
      setFoodInput('')
      setResult(null)
      fetchTodayLogs()
    }
    setSaving(false)
  }

  const riskColor = { low: '#4be08a', medium: '#e0b84b', high: '#e05c5c' }

  return (
    <div className="animate-fade-in">
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTopTitle}>
          <Shield size={22} color="var(--gold)" /> AI Meal Guard
        </h1>
        <p className={styles.pageTopDate}>
          Get educational insights on your food choices before logging them
        </p>
      </div>

      {/* Input form */}
      <div className={styles.card}>
        <form onSubmit={handleCheck}>
          <div className={styles.mealInputRow}>
            <input
              className={styles.input}
              type="text"
              placeholder="Type a food or meal (e.g. 'oatmeal with honey', 'fast food burger')"
              value={foodInput}
              onChange={e => setFoodInput(e.target.value)}
            />
            <select className={styles.mealTypeSelect} value={mealType} onChange={e => setMealType(e.target.value)}>
              {MEAL_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className={styles.formActions}>
            <button type="submit" className={shared.btnPrimary} disabled={checking || !foodInput.trim()}>
              {checking ? <><Loader size={16} className={styles.spinIcon} /> Analyzing...</> : <><Shield size={16} /> Check with AI</>}
            </button>
            {result && (
              <button type="button" className={shared.btnTeal} onClick={handleLog} disabled={saving}>
                <Plus size={16} /> {saving ? 'Saving...' : 'Log This Meal'}
              </button>
            )}
          </div>
        </form>

        {/* AI Result */}
        {result && (
          /* Risk color comes from the AI result, so border and background stay inline */
          <div className={styles.aiResult} style={{ borderColor: `${riskColor[result.risk_level]}40`, background: `${riskColor[result.risk_level]}08` }}>
            <div className={styles.aiResultHeader}>
              {result.flagged
                ? <AlertTriangle size={20} color={riskColor[result.risk_level]} />
                : <CheckCircle size={20} color="#4be08a" />}
              <span style={{ color: result.flagged ? riskColor[result.risk_level] : '#4be08a' }}>
                {result.flagged ? `Heads Up: ${result.risk_level.charAt(0).toUpperCase() + result.risk_level.slice(1)} Concern` : 'Looks Good!'}
              </span>
            </div>

            {result.warning && (
              <p className={styles.aiWarningText}>{result.warning}</p>
            )}

            {result.educational_note && (
              <div className={styles.aiEduNote}>
                📚 <strong>Educational Note:</strong> {result.educational_note}
              </div>
            )}

            {result.alternatives.length > 0 && (
              <div>
                <p className={styles.aiAltLabel}>Consider These Alternatives:</p>
                <div className={styles.altPills}>
                  {result.alternatives.map((alt, i) => (
                    <button key={i} onClick={() => setFoodInput(alt)} className={styles.altPill}>
                      {alt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <p className={styles.aiDisclaimer}>
              AI insights are for educational purposes only. They do not constitute medical or dietary advice. Consult a registered dietitian or your healthcare provider for personalized guidance.
            </p>
          </div>
        )}
      </div>

      {/* Today's meal log */}
      <div className={styles.card}>
        <h3 className={styles.cardTitleSolo}>Today's Meals</h3>
        {logs.length === 0 ? (
          <p className={styles.emptyText}>No meals logged today yet</p>
        ) : (
          <div className={styles.mealList}>
            {logs.map(log => (
              <div key={log.id} className={log.ai_flag ? styles.mealItemFlagged : styles.mealItem}>
                <div className={styles.mealItemBody}>
                  <div className={styles.mealItemName}>{log.food_name}</div>
                  <div className={styles.mealItemMeta}>
                    {MEAL_TYPES.find(t => t.value === log.meal_type)?.label} · {format(parseISO(log.logged_at), 'h:mm a')}
                  </div>
                </div>
                {log.ai_flag && <AlertTriangle size={16} color="#e0b84b" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
