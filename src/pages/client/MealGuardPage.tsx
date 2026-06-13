import { useState, useEffect, useRef } from 'react'
import { Shield, AlertTriangle, CheckCircle, Loader, Plus, Camera, X, Flame } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { checkMealGuard, downscaleImage } from '@/lib/openai'
import type { NutritionData } from '@/lib/openai'
import { searchFood } from '@/data/foodDatabase'
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
  const { profile } = useAuthStore()
  const [foodInput, setFoodInput] = useState('')
  const [mealType, setMealType] = useState('meal1')
  const [checking, setChecking] = useState(false)
  const [result, setResult] = useState<Awaited<ReturnType<typeof checkMealGuard>> | null>(null)
  const [logs, setLogs] = useState<MealLog[]>([])
  const [saving, setSaving] = useState(false)
  // Photo lives in component memory only. It is never uploaded to storage or
  // saved to the database; it is sent once for analysis and then discarded.
  const [photo, setPhoto]         = useState<string | null>(null)
  const [nutrition, setNutrition] = useState<NutritionData | null>(null)
  const [lookingUp, setLookingUp] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const dataUrl = await downscaleImage(file)
      setPhoto(dataUrl)
      setResult(null)
    } catch {
      toast.error('Could not read that photo. Please try another.')
    }
    e.target.value = ''
  }

  const clearPhoto = () => setPhoto(null)

  const lookupNutrition = async (name: string): Promise<NutritionData | null> => {
    // 1. Try local curated database first (instant, no API call)
    const local = searchFood(name)
    if (local) {
      return {
        calories: local.calories,
        protein: local.proteinGrams,
        fat: local.fatGrams,
        carbs: local.carbGrams,
        notes: local.notes,
        source: 'local',
      }
    }
    // 2. Fall back to USDA FoodData Central
    try {
      const r = await fetch(`/api/usda-lookup?q=${encodeURIComponent(name)}`)
      const data = await r.json()
      if (data.found) {
        return { calories: data.calories, protein: data.protein, fat: data.fat, carbs: data.carbs, source: 'usda' }
      }
    } catch { /* silently skip if USDA is unavailable */ }
    return null
  }

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!foodInput.trim() && !photo) return
    setChecking(true)
    setResult(null)
    setNutrition(null)

    // Look up nutrition in parallel with the name we have (skip if only photo)
    let nutritionData: NutritionData | null = null
    if (foodInput.trim()) {
      setLookingUp(true)
      nutritionData = await lookupNutrition(foodInput.trim())
      setNutrition(nutritionData)
      setLookingUp(false)
    }

    const res = await checkMealGuard(
      foodInput.trim(),
      profile?.wellness_goals?.primary_goal ?? '',
      profile?.wellness_goals?.dietary_preference ?? '',
      photo ?? undefined,
      nutritionData ?? undefined
    )
    setResult(res)
    if (res.identified_food && !foodInput.trim()) {
      setFoodInput(res.identified_food)
      // If photo identified a food and we have no nutrition data yet, look it up now
      if (!nutritionData) {
        const n = await lookupNutrition(res.identified_food)
        setNutrition(n)
      }
    }
    setChecking(false)
  }

  const handleLog = async () => {
    if (!foodInput.trim()) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    // Only the food name text and AI result are saved. The photo is not.
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
      setPhoto(null)
      setNutrition(null)
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
          Type a food or snap a photo for educational insights before logging
        </p>
      </div>

      {/* Input form */}
      <div className={styles.card}>
        <form onSubmit={handleCheck}>
          <div className={styles.mealInputRow}>
            <input
              className={styles.input}
              type="text"
              placeholder="Type a food, or add a photo and let the AI identify it"
              value={foodInput}
              onChange={e => setFoodInput(e.target.value)}
            />
            <select className={styles.mealTypeSelect} value={mealType} onChange={e => setMealType(e.target.value)}>
              {MEAL_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          {/* Photo input (transient analysis only) */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoSelect}
            className={styles.hiddenFileInput}
          />
          {photo && (
            <div className={styles.photoPreviewWrap}>
              <img src={photo} alt="Meal preview, analyzed then discarded" className={styles.photoPreviewImg} />
              <button type="button" onClick={clearPhoto} className={styles.photoRemoveBtn} aria-label="Remove photo">
                <X size={14} />
              </button>
            </div>
          )}

          <div className={styles.formActions}>
            <button type="submit" className={shared.btnPrimary} disabled={checking || (!foodInput.trim() && !photo)}>
              {checking ? <><Loader size={16} className={styles.spinIcon} /> Analyzing...</> : <><Shield size={16} /> Check with AI</>}
            </button>
            <button type="button" className={shared.btnGhost} onClick={() => fileInputRef.current?.click()}>
              <Camera size={16} /> {photo ? 'Retake Photo' : 'Add Photo'}
            </button>
            {result && (
              <button type="button" className={shared.btnTeal} onClick={handleLog} disabled={saving || !foodInput.trim()}>
                <Plus size={16} /> {saving ? 'Saving...' : 'Log This Meal'}
              </button>
            )}
          </div>

          <p className={styles.transientNote}>
            Privacy by design: your photo is analyzed and immediately discarded. It is never stored, never saved to your log, and never linked to your account.
          </p>
        </form>

        {/* Nutrition context panel */}
        {lookingUp && (
          <div className={styles.nutritionLookupRow}>
            <Loader size={13} className={styles.spinIcon} /> Looking up nutritional data...
          </div>
        )}
        {nutrition && !lookingUp && (
          <div className={styles.nutritionPanel}>
            <div className={styles.nutritionPanelLabel}>
              <Flame size={13} color="var(--gold)" />
              Nutritional data found ({nutrition.source === 'local' ? 'curated database' : 'USDA FoodData Central'})
            </div>
            <div className={styles.nutritionMacros}>
              <div className={styles.nutritionMacro}>
                <span className={styles.nutritionMacroVal}>{nutrition.calories}</span>
                <span className={styles.nutritionMacroLabel}>kcal</span>
              </div>
              <div className={styles.nutritionMacroDivider} />
              <div className={styles.nutritionMacro}>
                <span className={styles.nutritionMacroVal}>{nutrition.protein}g</span>
                <span className={styles.nutritionMacroLabel}>protein</span>
              </div>
              <div className={styles.nutritionMacroDivider} />
              <div className={styles.nutritionMacro}>
                <span className={styles.nutritionMacroVal}>{nutrition.fat}g</span>
                <span className={styles.nutritionMacroLabel}>fat</span>
              </div>
              <div className={styles.nutritionMacroDivider} />
              <div className={styles.nutritionMacro}>
                <span className={styles.nutritionMacroVal}>{nutrition.carbs}g</span>
                <span className={styles.nutritionMacroLabel}>carbs</span>
              </div>
            </div>
            {nutrition.notes && (
              <p className={styles.nutritionNotes}>{nutrition.notes}</p>
            )}
          </div>
        )}

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

            {result.identified_food && (
              <p className={styles.aiIdentified}>Identified: <strong>{result.identified_food}</strong></p>
            )}

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
