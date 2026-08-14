import { useState, useEffect, useRef } from 'react'
import { Shield, AlertTriangle, CheckCircle, Loader, Plus, Camera, X, Flame, Heart, Target, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { checkMealGuard, downscaleImage } from '@/lib/openai'
import type { NutritionData } from '@/lib/openai'
import { searchFood } from '@/data/foodDatabase'
import type { MealLog } from '@/types'
import { format, parseISO } from 'date-fns'
import toast from 'react-hot-toast'
import BackButton from '@/components/BackButton'
import styles from './Client.module.css'
import shared from '../../styles/shared.module.css'
import { usePlan } from '@/hooks/usePlan'
import { NutritionGoalsTab } from './NutritionGoalsTab'
import type { NutritionGoals } from './NutritionGoalsTab'

const MEAL_TYPES = [
  { value: 'morning_fast', label: 'Morning Fast Window' },
  { value: 'meal1', label: 'Meal 1' },
  { value: 'meal2', label: 'Meal 2' },
  { value: 'snack', label: 'Snack' },
]

interface SavedFood {
  id: string
  food_name: string
  meal_type: string
  calories: number | null
  protein: number | null
  fat: number | null
  carbs: number | null
  fiber: number | null
}

type Tab = 'log' | 'goals' | 'saved'

export default function MealGuardPage() {
  const { profile } = useAuthStore()
  const { mealGuardDailyLimit } = usePlan()
  const [activeTab, setActiveTab] = useState<Tab>('log')
  const [foodInput, setFoodInput] = useState('')
  const [mealType, setMealType] = useState('meal1')
  const [checking, setChecking] = useState(false)
  const [result, setResult] = useState<Awaited<ReturnType<typeof checkMealGuard>> | null>(null)
  const [logs, setLogs] = useState<MealLog[]>([])
  const [saving, setSaving] = useState(false)
  // Photo lives in component memory only, never uploaded or stored.
  const [photo, setPhoto] = useState<string | null>(null)
  const [nutrition, setNutrition] = useState<NutritionData | null>(null)
  const [lookingUp, setLookingUp] = useState(false)
  // Distinguishes "never searched" from "searched and found nothing," so a failed
  // lookup can say so instead of silently letting the meal log with null calories.
  const [nutritionLookupAttempted, setNutritionLookupAttempted] = useState(false)
  const [goals, setGoals] = useState<NutritionGoals | null>(null)
  const [savedFoods, setSavedFoods] = useState<SavedFood[]>([])
  const [hiddenIngredients, setHiddenIngredients] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user
      if (!user) return
      setUserId(user.id)
      fetchTodayLogs(user.id)
      fetchNutritionGoals(user.id)
      fetchSavedFoods(user.id)
    }
    init()
  }, [])

  const fetchTodayLogs = async (uid?: string) => {
    const id = uid ?? userId
    if (!id) return
    const today = new Date().toISOString().split('T')[0]
    const { data } = await supabase
      .from('meal_logs')
      .select('*')
      .eq('user_id', id)
      .gte('logged_at', today + 'T00:00:00')
      .order('logged_at', { ascending: false })
    setLogs((data as MealLog[]) ?? [])
  }

  const fetchNutritionGoals = async (uid: string) => {
    const { data } = await supabase
      .from('nutrition_goals')
      .select('calories_goal, protein_goal, fat_goal, carbs_goal, fiber_goal')
      .eq('user_id', uid)
      .single()
    if (data) setGoals(data as NutritionGoals)
  }

  const fetchSavedFoods = async (uid: string) => {
    const { data } = await supabase
      .from('saved_foods')
      .select('id, food_name, meal_type, calories, protein, fat, carbs, fiber')
      .eq('user_id', uid)
      .order('saved_at', { ascending: false })
      .limit(20)
    if (data) setSavedFoods(data as SavedFood[])
  }

  const todayTotals = logs.reduce((acc, log) => ({
    calories: acc.calories + (log.calories ?? 0),
    protein: acc.protein + (log.protein ?? 0),
    fat: acc.fat + (log.fat ?? 0),
    carbs: acc.carbs + (log.carbs ?? 0),
    fiber: acc.fiber + (log.fiber ?? 0),
  }), { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 })

  // Fiber passes through mostly undigested, so it is not really available
  // carbohydrate. Shown separately from the raw carbs total per Rule C: the
  // number on screen has to match what it is labeled as.
  const todayNetCarbs = Math.max(0, todayTotals.carbs - todayTotals.fiber)

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
    const local = searchFood(name)
    if (local) {
      return {
        calories: local.calories,
        protein: local.proteinGrams,
        fat: local.fatGrams,
        carbs: local.carbGrams,
        fiber: local.fiberGrams,
        notes: local.notes,
        source: 'local',
      }
    }
    try {
      // The endpoint verifies this token, same as the other paid lookups.
      const { data: { session } } = await supabase.auth.getSession()
      const r = await fetch(`/api/usda-lookup?q=${encodeURIComponent(name)}`, {
        headers: { 'Authorization': `Bearer ${session?.access_token ?? ''}` },
      })
      const d = await r.json()
      if (d.found) {
        return { calories: d.calories, protein: d.protein, fat: d.fat, carbs: d.carbs, fiber: d.fiber ?? 0, source: 'usda' }
      }
    } catch { /* skip if USDA unavailable */ }
    return null
  }

  const performCheck = async () => {
    const query = hiddenIngredients.trim()
      ? `${foodInput.trim()} (hidden ingredients: ${hiddenIngredients.trim()})`
      : foodInput.trim()
    if (!query && !photo) return
    if (logs.length >= mealGuardDailyLimit) {
      toast.error(`You have reached your ${mealGuardDailyLimit} daily Nourish Log entries. Upgrade to The Program for unlimited access.`)
      return
    }
    setChecking(true)
    setResult(null)
    setNutrition(null)
    setNutritionLookupAttempted(false)

    let nutritionData: NutritionData | null = null
    if (foodInput.trim()) {
      setLookingUp(true)
      nutritionData = await lookupNutrition(foodInput.trim())
      setNutrition(nutritionData)
      setNutritionLookupAttempted(true)
      setLookingUp(false)
    }

    const res = await checkMealGuard(
      query,
      profile?.wellness_goals?.primary_goal ?? '',
      profile?.wellness_goals?.dietary_preference ?? '',
      photo ?? undefined,
      nutritionData ?? undefined
    )
    setResult(res)
    if (res.identified_food && !foodInput.trim()) {
      setFoodInput(res.identified_food)
      if (!nutritionData) {
        const n = await lookupNutrition(res.identified_food)
        setNutrition(n)
        setNutritionLookupAttempted(true)
      }
    }
    setChecking(false)
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    performCheck()
  }

  const handleLog = async () => {
    if (!foodInput.trim()) return
    setSaving(true)
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user
    if (!user) { setSaving(false); return }
    const { error } = await supabase.from('meal_logs').insert({
      user_id: user.id,
      food_name: foodInput.trim(),
      meal_type: mealType as MealLog['meal_type'],
      ai_flag: result?.flagged ?? false,
      ai_warning: result?.warning ?? null,
      ai_alternatives: result?.alternatives?.length ? result.alternatives : null,
      logged_at: new Date().toISOString(),
      calories: nutrition?.calories ?? null,
      protein: nutrition?.protein ?? null,
      fat: nutrition?.fat ?? null,
      carbs: nutrition?.carbs ?? null,
      fiber: nutrition?.fiber ?? null,
    })
    if (error) {
      toast.error('Failed to save meal')
    } else {
      toast.success('Meal logged!')
      setFoodInput('')
      setResult(null)
      setPhoto(null)
      setNutrition(null)
      setHiddenIngredients('')
      fetchTodayLogs()
    }
    setSaving(false)
  }

  const handleSaveToFavorites = async (log: MealLog) => {
    if (!userId) return
    const { error } = await supabase.from('saved_foods').insert({
      user_id: userId,
      food_name: log.food_name,
      meal_type: log.meal_type,
      calories: log.calories,
      protein: log.protein,
      fat: log.fat,
      carbs: log.carbs,
      fiber: log.fiber,
    })
    if (error) {
      toast.error('Could not save to favorites')
    } else {
      toast.success('Saved to favorites!')
      fetchSavedFoods(userId)
    }
  }

  const handleQuickLog = async (food: SavedFood) => {
    if (!userId) return
    const { error } = await supabase.from('meal_logs').insert({
      user_id: userId,
      food_name: food.food_name,
      meal_type: food.meal_type,
      ai_flag: false,
      ai_warning: null,
      ai_alternatives: null,
      logged_at: new Date().toISOString(),
      calories: food.calories,
      protein: food.protein,
      fat: food.fat,
      carbs: food.carbs,
      fiber: food.fiber,
    })
    if (error) {
      toast.error('Could not log meal')
    } else {
      toast.success(`${food.food_name} logged!`)
      fetchTodayLogs()
      setActiveTab('log')
    }
  }

  const handleRemoveSaved = async (id: string) => {
    if (!userId) return
    await supabase.from('saved_foods').delete().eq('id', id).eq('user_id', userId)
    setSavedFoods(prev => prev.filter(f => f.id !== id))
  }

  // There was previously no way to remove a mistaken log entry at all.
  const handleDeleteLog = async (id: string) => {
    if (!userId) return
    const previous = logs
    setLogs(prev => prev.filter(l => l.id !== id))
    const { error } = await supabase.from('meal_logs').delete().eq('id', id).eq('user_id', userId)
    if (error) {
      console.error('[meal-guard] delete failed:', error)
      setLogs(previous)
      toast.error('Could not delete that entry. Try again.')
    }
  }

  const riskColor = { low: '#4be08a', medium: '#e0b84b', high: '#e05c5c' }
  const pct = (used: number, goal: number) => Math.min(100, goal > 0 ? Math.round((used / goal) * 100) : 0)

  return (
    <div className="animate-fade-in">
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTopTitle}>
          <Shield size={22} color="var(--gold)" /> Nourish Log
        </h1>
        <p className={styles.pageTopDate}>
          Type a food or snap a photo for educational insights before logging
        </p>
      </div>

      {/* Tab navigation */}
      <div className={styles.tabNav}>
        <button
          className={activeTab === 'log' ? styles.tabBtnActive : styles.tabBtn}
          onClick={() => setActiveTab('log')}
        >
          <Shield size={14} /> Log Meal
        </button>
        <button
          className={activeTab === 'goals' ? styles.tabBtnActive : styles.tabBtn}
          onClick={() => setActiveTab('goals')}
        >
          <Target size={14} /> Goals
        </button>
        <button
          className={activeTab === 'saved' ? styles.tabBtnActive : styles.tabBtn}
          onClick={() => setActiveTab('saved')}
        >
          <Heart size={14} /> Saved {savedFoods.length > 0 && `(${savedFoods.length})`}
        </button>
      </div>

      {/* Disclaimer banner */}
      <div className={styles.nutritionDisclaimerBanner}>
        Nutritional values are estimates for educational purposes only. Consult a registered dietitian for personalized guidance.
      </div>

      {/* ---- LOG MEAL TAB ---- */}
      {activeTab === 'log' && (
        <>
          {/* Daily macro progress */}
          {goals && (
            <div className={styles.card}>
              <h3 className={styles.cardTitleSolo}>Today's Progress</h3>
              <div className={styles.macroProgressList}>
                {([
                  { label: 'Calories', used: todayTotals.calories, goal: goals.calories_goal, unit: 'kcal' },
                  { label: 'Protein', used: todayTotals.protein, goal: goals.protein_goal, unit: 'g' },
                  { label: 'Fat', used: todayTotals.fat, goal: goals.fat_goal, unit: 'g' },
                  { label: 'Total Carbs', used: todayTotals.carbs, goal: goals.carbs_goal, unit: 'g' },
                  { label: 'Fiber', used: todayTotals.fiber, goal: goals.fiber_goal, unit: 'g' },
                  { label: 'Net Carbs', used: todayNetCarbs, goal: Math.max(0, goals.carbs_goal - goals.fiber_goal), unit: 'g' },
                ] as const).map(({ label, used, goal, unit }) => (
                  <div key={label} className={styles.macroProgressRow}>
                    <div className={styles.macroProgressLabels}>
                      <span className={styles.macroProgressName}>{label}</span>
                      <span className={styles.macroProgressValues}>
                        {Math.round(used)}{unit} / {goal}{unit}
                      </span>
                    </div>
                    <div className={styles.macroProgressBar}>
                      <div
                        className={styles.macroProgressFill}
                        style={{
                          width: `${pct(used, goal)}%`,
                          background: pct(used, goal) >= 100 ? '#e05c5c' : 'var(--teal)',
                        }}
                      />
                    </div>
                    <span className={styles.macroProgressRemaining}>
                      {Math.max(0, goal - Math.round(used))}{unit} remaining
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Input form */}
          <div className={styles.card}>
            <form onSubmit={handleFormSubmit}>
              <div className={styles.mealInputRow}>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="Type a food, or add a photo and let the AI identify it"
                  value={foodInput}
                  onChange={e => setFoodInput(e.target.value)}
                />
                <select
                  className={styles.mealTypeSelect}
                  value={mealType}
                  onChange={e => setMealType(e.target.value)}
                >
                  {MEAL_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              {/* No capture attribute on purpose. capture="environment" opens the
                  rear camera immediately and hides Photo Library, so a meal
                  photographed earlier could never be logged. Without it the phone
                  offers Take Photo and Photo Library both. */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                className={styles.hiddenFileInput}
              />
              {photo && (
                <div className={styles.photoPreviewWrap}>
                  <img
                    src={photo}
                    alt="Meal preview, analyzed then discarded"
                    className={styles.photoPreviewImg}
                  />
                  <button
                    type="button"
                    onClick={clearPhoto}
                    className={styles.photoRemoveBtn}
                    aria-label="Remove photo"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              <div className={styles.formActions}>
                <button
                  type="submit"
                  className={shared.btnPrimary}
                  disabled={checking || (!foodInput.trim() && !photo)}
                >
                  {checking
                    ? <><Loader size={16} className={styles.spinIcon} /> Analyzing...</>
                    : <><Shield size={16} /> Check with AI</>
                  }
                </button>
                <button
                  type="button"
                  className={shared.btnGhost}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera size={16} /> {photo ? 'Change Photo' : 'Add Photo'}
                </button>
                {result && (
                  <button
                    type="button"
                    className={shared.btnTeal}
                    onClick={handleLog}
                    disabled={saving || !foodInput.trim()}
                  >
                    <Plus size={16} /> {saving ? 'Saving...' : 'Log This Meal'}
                  </button>
                )}
              </div>

              <p className={styles.transientNote}>
                Privacy by design: your photo is analyzed and immediately discarded. It is never stored, never saved to your log, and never linked to your account.
              </p>
            </form>

            {/* Nutrition panel */}
            {lookingUp && (
              <div className={styles.nutritionLookupRow}>
                <Loader size={13} className={styles.spinIcon} /> Looking up nutritional data...
              </div>
            )}
            {!nutrition && !lookingUp && nutritionLookupAttempted && (
              <div className={styles.nutritionNotFoundRow}>
                <AlertTriangle size={13} color="var(--gold)" />
                Could not find nutrition data for "{foodInput || 'this meal'}". You can still log it, but calories
                and macros will not be counted toward your daily totals. Try a simpler name, like "grilled chicken"
                instead of a restaurant menu name.
              </div>
            )}
            {nutrition && !lookingUp && (
              <div className={styles.nutritionPanel}>
                <div className={styles.nutritionPanelLabel}>
                  <Flame size={13} color="var(--gold)" />
                  Nutritional data ({nutrition.source === 'local' ? 'curated database' : 'USDA FoodData Central'}), estimates only
                </div>
                <div className={styles.nutritionMacros}>
                  <div className={styles.nutritionMacro}>
                    <span className={styles.nutritionMacroVal}>~{nutrition.calories}</span>
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
                  <div className={styles.nutritionMacroDivider} />
                  <div className={styles.nutritionMacro}>
                    <span className={styles.nutritionMacroVal}>{nutrition.fiber}g</span>
                    <span className={styles.nutritionMacroLabel}>fiber</span>
                  </div>
                </div>
                {nutrition.notes && <p className={styles.nutritionNotes}>{nutrition.notes}</p>}
              </div>
            )}

            {/* AI result */}
            {result && (
              <div
                className={styles.aiResult}
                style={{
                  borderColor: `${riskColor[result.risk_level]}40`,
                  background: `${riskColor[result.risk_level]}08`,
                }}
              >
                <div className={styles.aiResultHeader}>
                  {result.flagged
                    ? <AlertTriangle size={20} color={riskColor[result.risk_level]} />
                    : <CheckCircle size={20} color="#4be08a" />
                  }
                  <span style={{ color: result.flagged ? riskColor[result.risk_level] : '#4be08a' }}>
                    {result.flagged
                      ? `Heads Up: ${result.risk_level.charAt(0).toUpperCase() + result.risk_level.slice(1)} Concern`
                      : 'Looks Good!'
                    }
                  </span>
                </div>

                {result.identified_food && (
                  <p className={styles.aiIdentified}>
                    Identified: <strong>{result.identified_food}</strong>
                  </p>
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

                {/* Hidden ingredient prompt */}
                <div className={styles.hiddenIngredientRow}>
                  <label className={styles.hiddenIngredientLabel}>
                    Know of hidden ingredients? (added sugars, seed oils, MSG, etc.)
                  </label>
                  <div className={styles.hiddenIngredientInputRow}>
                    <input
                      className={styles.input}
                      type="text"
                      placeholder="e.g., canola oil, high fructose corn syrup"
                      value={hiddenIngredients}
                      onChange={e => setHiddenIngredients(e.target.value)}
                    />
                    {hiddenIngredients.trim() && (
                      <button
                        type="button"
                        className={shared.btnGhost}
                        onClick={performCheck}
                        disabled={checking}
                      >
                        Re-Check
                      </button>
                    )}
                  </div>
                </div>

                <p className={styles.aiDisclaimer}>
                  AI insights are for educational purposes only. They do not constitute medical or dietary advice. Consult a registered dietitian or your healthcare provider for personalized guidance.
                </p>
              </div>
            )}
          </div>

          {/* Today's meals */}
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
                        {MEAL_TYPES.find(t => t.value === log.meal_type)?.label}
                        {' · '}{format(parseISO(log.logged_at), 'h:mm a')}
                        {log.calories != null && <span> · ~{log.calories} kcal</span>}
                      </div>
                    </div>
                    <div className={styles.mealItemActions}>
                      {log.ai_flag && <AlertTriangle size={16} color="#e0b84b" />}
                      <button
                        className={styles.heartBtn}
                        onClick={() => handleSaveToFavorites(log)}
                        aria-label="Save to favorites"
                        title="Save to favorites"
                      >
                        <Heart size={16} />
                      </button>
                      <button
                        className={styles.heartBtn}
                        onClick={() => handleDeleteLog(log.id)}
                        aria-label={`Delete ${log.food_name}`}
                        title="Delete this entry"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ---- GOALS TAB ---- */}
      {activeTab === 'goals' && userId && (
        <NutritionGoalsTab
          userId={userId}
          initialGoals={goals}
          onGoalsSaved={setGoals}
        />
      )}

      {/* ---- SAVED FOODS TAB ---- */}
      {activeTab === 'saved' && (
        <div className={styles.card}>
          <h3 className={styles.cardTitleSolo}>Saved Foods</h3>
          {savedFoods.length === 0 ? (
            <p className={styles.emptyText}>
              No saved foods yet. Tap the heart icon on any logged meal to save it here for 1-tap re-logging.
            </p>
          ) : (
            <div className={styles.mealList}>
              {savedFoods.map(food => (
                <div key={food.id} className={styles.mealItem}>
                  <div className={styles.mealItemBody}>
                    <div className={styles.mealItemName}>{food.food_name}</div>
                    <div className={styles.mealItemMeta}>
                      {MEAL_TYPES.find(t => t.value === food.meal_type)?.label}
                      {food.calories != null && <span> · ~{food.calories} kcal</span>}
                      {food.protein != null && <span> · {food.protein}g protein</span>}
                    </div>
                  </div>
                  <div className={styles.mealItemActions}>
                    <button
                      className={styles.quickLogBtn}
                      onClick={() => handleQuickLog(food)}
                      aria-label="Quick log this meal"
                    >
                      <Plus size={14} /> Log
                    </button>
                    <button
                      className={styles.heartBtn}
                      onClick={() => handleRemoveSaved(food.id)}
                      aria-label="Remove from saved"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
