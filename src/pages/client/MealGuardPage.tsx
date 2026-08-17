import { useState, useEffect, useRef } from 'react'
import { Shield, AlertTriangle, CheckCircle, Loader, Plus, Camera, X, Flame, Heart, Target, Trash2, Pencil, Check, Clock, Barcode, ChevronRight, TrendingUp } from 'lucide-react'
import NutritionTrendsChart from '@/components/nourish/NutritionTrendsChart'
import BarcodeScannerModal from '@/components/nourish/BarcodeScanner'
import { lookupBarcode } from '@/lib/openFoodFacts'
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
import { withTimeout } from '@/lib/withTimeout'

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

// Distinct from Favorites (explicitly starred). This is just "what have you
// actually eaten lately," which is what most people reach for day to day.
interface RecentFood {
  food_name: string
  meal_type: string
  calories: number | null
  protein: number | null
  fat: number | null
  carbs: number | null
  fiber: number | null
}

type Tab = 'log' | 'trends' | 'goals' | 'saved'

export default function MealGuardPage() {
  const { profile } = useAuthStore()
  const { mealGuardDailyLimit } = usePlan()
  const [activeTab, setActiveTab] = useState<Tab>('log')
  const [foodInput, setFoodInput] = useState('')
  const [mealType, setMealType] = useState('meal1')
  const [checking, setChecking] = useState(false)
  const [result, setResult] = useState<Awaited<ReturnType<typeof checkMealGuard>> | null>(null)
  // Set only when the AI call itself failed (network, timeout, API error), as
  // opposed to a normal completed check. Kept separate from `result` so a
  // failed check never renders as if it succeeded, and so "Log This Meal"
  // never appears tied to a result that isn't real.
  const [checkError, setCheckError] = useState(false)
  const [logs, setLogs] = useState<MealLog[]>([])
  const [saving, setSaving] = useState(false)
  // Photo lives in component memory only, never uploaded or stored.
  const [photo, setPhoto] = useState<string | null>(null)
  const [nutrition, setNutrition] = useState<NutritionData | null>(null)
  const [lookingUp, setLookingUp] = useState(false)
  // Distinguishes "never searched" from "searched and found nothing," so a failed
  // lookup can say so instead of silently letting the meal log with null calories.
  const [nutritionLookupAttempted, setNutritionLookupAttempted] = useState(false)
  // Manual entry: for a nutrition label, a restaurant menu, or anything the AI
  // and the two lookups do not recognize. Kept as strings so the field can be
  // blank while typing rather than snapping to 0.
  const [manualEntry, setManualEntry] = useState(false)
  const [manualCalories, setManualCalories] = useState('')
  const [manualProtein, setManualProtein] = useState('')
  const [manualFat, setManualFat] = useState('')
  const [manualCarbs, setManualCarbs] = useState('')
  const [manualFiber, setManualFiber] = useState('')
  const [showScanner, setShowScanner] = useState(false)
  const [scanningLookup, setScanningLookup] = useState(false)
  const [goals, setGoals] = useState<NutritionGoals | null>(null)
  const [savedFoods, setSavedFoods] = useState<SavedFood[]>([])
  const [recentFoods, setRecentFoods] = useState<RecentFood[]>([])
  const [hiddenIngredients, setHiddenIngredients] = useState('')
  // Multiplies the per-serving nutrition below before logging. "1 serving" is
  // rarely the truth ("I had half this" or "I had 1.5 plates"), and there was
  // previously no way to say so short of hand-computing new numbers yourself.
  const [servings, setServings] = useState('1')
  const servingsNum = () => {
    const n = parseFloat(servings)
    return Number.isFinite(n) && n > 0 ? n : 1
  }
  const round1 = (n: number) => Math.round(n * 10) / 10
  // Lets a meal from a missed day get logged after the fact. Noon on the chosen
  // day avoids the entry landing on the wrong day near midnight in any timezone.
  const todayStr = () => new Date().toISOString().split('T')[0]
  const [entryDate, setEntryDate] = useState(todayStr())
  // Editing an already-saved log entry. Previously the only fix for a typo or
  // a wrong number was delete and start over.
  const [editingLogId, setEditingLogId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    food_name: '', meal_type: 'meal1', calories: '', protein: '', fat: '', carbs: '', fiber: '',
  })
  const [userId, setUserId] = useState<string | null>(null)
  // If getSession() hangs on a bad connection, userId stays null and the Goals
  // tab and Saved tab silently look empty with no explanation. This tracks that
  // failure so the UI can say so and offer a retry instead of staying blank.
  const [initError, setInitError] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  // Bumped on every new check and on clearPhoto, so a slow response that finally
  // arrives after the user already moved on (cleared the photo, started over)
  // gets ignored instead of overwriting whatever is on screen by then.
  const checkGenRef = useRef(0)

  // Manual numbers feed the same nutrition state the AI and USDA lookups use,
  // so handleLog and the progress display do not need to know which source it
  // came from.
  useEffect(() => {
    if (!manualEntry) return
    const cal = parseFloat(manualCalories)
    if (!manualCalories.trim() || Number.isNaN(cal)) { setNutrition(null); return }
    setNutrition({
      calories: cal,
      protein: parseFloat(manualProtein) || 0,
      fat: parseFloat(manualFat) || 0,
      carbs: parseFloat(manualCarbs) || 0,
      fiber: parseFloat(manualFiber) || 0,
      source: 'manual',
      notes: undefined,
    })
  }, [manualEntry, manualCalories, manualProtein, manualFat, manualCarbs, manualFiber])

  const init = async () => {
    setInitError(false)
    try {
      const { data: { session } } = await withTimeout(supabase.auth.getSession(), 15000, 'Session check')
      const user = session?.user
      if (!user) return
      setUserId(user.id)
      fetchTodayLogs(user.id)
      fetchNutritionGoals(user.id)
      fetchSavedFoods(user.id)
      fetchRecentFoods(user.id)
    } catch (err) {
      console.error('[meal-guard] init failed:', err)
      setInitError(true)
    }
  }

  useEffect(() => {
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
    // maybeSingle, not single: single() throws (HTTP 406) when nobody has saved
    // goals yet, which is the normal state for a new account, not an error. That
    // 406 was silent, so the progress section just never appeared and nothing
    // told the person why.
    const { data, error } = await supabase
      .from('nutrition_goals')
      .select('calories_goal, protein_goal, fat_goal, carbs_goal, fiber_goal')
      .eq('user_id', uid)
      .maybeSingle()
    if (error) console.error('[meal-guard] goals fetch failed:', error)
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

  const fetchRecentFoods = async (uid: string) => {
    const { data } = await supabase
      .from('meal_logs')
      .select('food_name, meal_type, calories, protein, fat, carbs, fiber, logged_at')
      .eq('user_id', uid)
      .order('logged_at', { ascending: false })
      .limit(40)
    if (!data) return
    // Dedupe by food name, keeping the most recent occurrence of each, since
    // the same meal often gets logged repeatedly.
    const seen = new Set<string>()
    const unique: RecentFood[] = []
    for (const row of data) {
      const key = row.food_name.toLowerCase().trim()
      if (seen.has(key)) continue
      seen.add(key)
      unique.push(row)
      if (unique.length >= 12) break
    }
    setRecentFoods(unique)
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

  // `nutrition` always holds the per-serving numbers, editable directly above.
  // This is what actually gets logged, per-serving times the servings count.
  const loggedNutrition = nutrition ? {
    ...nutrition,
    calories: Math.round(nutrition.calories * servingsNum()),
    protein: round1(nutrition.protein * servingsNum()),
    fat: round1(nutrition.fat * servingsNum()),
    carbs: round1(nutrition.carbs * servingsNum()),
    fiber: round1(nutrition.fiber * servingsNum()),
  } : null

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const dataUrl = await downscaleImage(file)
      setPhoto(dataUrl)
      setResult(null)
      setCheckError(false)
    } catch {
      toast.error('Could not read that photo. Please try another.')
    }
    e.target.value = ''
  }

  const clearPhoto = () => {
    setPhoto(null)
    setResult(null)
    setCheckError(false)
    // Invalidate any check still in flight so a late response cannot land after
    // the fact, and stop showing "Analyzing..." immediately rather than making
    // someone wait out the network timeout for a photo they already removed.
    checkGenRef.current++
    if (checking) {
      setChecking(false)
      setLookingUp(false)
    }
  }

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

  const handleBarcodeDetected = async (barcode: string) => {
    setShowScanner(false)
    setScanningLookup(true)
    setResult(null)
    setCheckError(false)
    const found = await lookupBarcode(barcode)
    setScanningLookup(false)
    if (!found) {
      toast.error(`Could not find a product for barcode ${barcode}. Try Manual Entry instead.`)
      return
    }
    setFoodInput(found.productName)
    setNutrition(found.nutrition)
    setNutritionLookupAttempted(true)
    setServings('1')
    toast.success(`Found: ${found.productName}`)
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
    const gen = ++checkGenRef.current
    setChecking(true)
    setResult(null)
    setCheckError(false)
    setNutrition(null)
    setNutritionLookupAttempted(false)
    setServings('1')

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
    // The photo was cleared (or another check started) while this was in
    // flight. Do not resurrect a result for a check the user already left.
    if (checkGenRef.current !== gen) return

    // The AI call itself failed (network, timeout, API error). This is not a
    // real result, so it must not render as one, and "Log This Meal" must not
    // appear tied to it. Previously this silently rendered as a normal
    // completed check, and a meal could get logged with zero nutrition and no
    // indication anything went wrong. Manual entry is still available below.
    if (res.ai_unavailable) {
      setCheckError(true)
      setChecking(false)
      return
    }

    setResult(res)
    if (res.identified_food && !foodInput.trim()) {
      setFoodInput(res.identified_food)
      if (!nutritionData) {
        nutritionData = await lookupNutrition(res.identified_food)
        setNutrition(nutritionData)
        setNutritionLookupAttempted(true)
      }
    }

    // Neither the curated database nor USDA had a match, which is the normal
    // case for a photo of a mixed plate, or a name too specific for a text
    // search ("grandma's oxtail" is not going to be in either). The same AI
    // call that just analyzed the food was asked to estimate its nutrition
    // too, so fall back to that instead of leaving the meal with no numbers.
    if (!nutritionData && res.estimated_calories != null) {
      nutritionData = {
        calories: res.estimated_calories,
        protein: res.estimated_protein_g ?? 0,
        fat: res.estimated_fat_g ?? 0,
        carbs: res.estimated_carbs_g ?? 0,
        fiber: res.estimated_fiber_g ?? 0,
        source: 'ai',
        notes: 'AI estimate. Less precise than a database match, use as a rough guide.',
      }
      setNutrition(nutritionData)
      setNutritionLookupAttempted(true)
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
      logged_at: new Date(`${entryDate}T12:00:00`).toISOString(),
      calories: loggedNutrition?.calories ?? null,
      protein: loggedNutrition?.protein ?? null,
      fat: loggedNutrition?.fat ?? null,
      carbs: loggedNutrition?.carbs ?? null,
      fiber: loggedNutrition?.fiber ?? null,
    })
    if (error) {
      toast.error('Failed to save meal')
    } else {
      const dayLabel = entryDate === todayStr() ? '' : ` for ${format(parseISO(entryDate), 'MMM d')}`
      toast.success(
        nutrition
          ? `Meal logged${dayLabel}!`
          : `Meal logged${dayLabel}, but with no nutrition data, it will not count toward your goals.`
      )
      setFoodInput('')
      setResult(null)
      setCheckError(false)
      setPhoto(null)
      setNutrition(null)
      setServings('1')
      setHiddenIngredients('')
      setManualEntry(false)
      setManualCalories('')
      setManualProtein('')
      setManualFat('')
      setManualCarbs('')
      setManualFiber('')
      setEntryDate(todayStr())
      // A backdated entry does not show in "Today's Meals" or count toward
      // today's progress, both of which are scoped to today on purpose.
      fetchTodayLogs()
      fetchRecentFoods(user.id)
    }
    setSaving(false)
  }

  const handleSaveToFavorites = async (log: MealLog | RecentFood) => {
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

  const handleQuickLog = async (food: SavedFood | RecentFood) => {
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
      fetchRecentFoods(userId)
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

  const startEditLog = (log: MealLog) => {
    setEditingLogId(log.id)
    setEditForm({
      food_name: log.food_name,
      meal_type: log.meal_type,
      calories: log.calories != null ? String(log.calories) : '',
      protein: log.protein != null ? String(log.protein) : '',
      fat: log.fat != null ? String(log.fat) : '',
      carbs: log.carbs != null ? String(log.carbs) : '',
      fiber: log.fiber != null ? String(log.fiber) : '',
    })
  }

  const cancelEditLog = () => setEditingLogId(null)

  // Previously the only way to fix a typo'd name or a wrong number after
  // saving was to delete the entry and log it again from scratch.
  const handleUpdateLog = async () => {
    if (!editingLogId || !userId || !editForm.food_name.trim()) return
    const previous = logs
    const updated = {
      food_name: editForm.food_name.trim(),
      meal_type: editForm.meal_type as MealLog['meal_type'],
      calories: editForm.calories.trim() ? parseFloat(editForm.calories) : null,
      protein: editForm.protein.trim() ? parseFloat(editForm.protein) : null,
      fat: editForm.fat.trim() ? parseFloat(editForm.fat) : null,
      carbs: editForm.carbs.trim() ? parseFloat(editForm.carbs) : null,
      fiber: editForm.fiber.trim() ? parseFloat(editForm.fiber) : null,
    }
    setLogs(prev => prev.map(l => l.id === editingLogId ? { ...l, ...updated } : l))
    setEditingLogId(null)
    const { error } = await supabase.from('meal_logs').update(updated).eq('id', editingLogId).eq('user_id', userId)
    if (error) {
      console.error('[meal-guard] update failed:', error)
      setLogs(previous)
      toast.error('Could not save that change. Try again.')
    } else {
      toast.success('Entry updated!')
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
          className={activeTab === 'trends' ? styles.tabBtnActive : styles.tabBtn}
          onClick={() => setActiveTab('trends')}
        >
          <TrendingUp size={14} /> Trends
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

      {initError && (
        <div className={styles.nutritionNotFoundRow}>
          <AlertTriangle size={13} color="var(--gold)" />
          Could not load your account data. Your goals and saved foods will not show up until this loads. Check your connection and
          <button type="button" className={shared.btnGhost} onClick={init} style={{ marginLeft: 8 }}>
            Retry
          </button>
        </div>
      )}

      {/* Disclaimer banner */}
      <div className={styles.nutritionDisclaimerBanner}>
        Nutritional values are estimates for educational purposes only. Consult a registered dietitian for personalized guidance.
      </div>

      {/* ---- LOG MEAL TAB ---- */}
      {activeTab === 'log' && (
        <>
          {/* Daily macro progress */}
          {goals ? (
            <div className={styles.card}>
              <h3 className={styles.cardTitleSolo}>Today's Progress</h3>
              <div className={styles.macroProgressList}>
                {([
                  { label: 'Calories', used: todayTotals.calories, goal: goals.calories_goal, unit: 'kcal', kind: 'ceiling' },
                  { label: 'Protein', used: todayTotals.protein, goal: goals.protein_goal, unit: 'g', kind: 'floor' },
                  { label: 'Fat', used: todayTotals.fat, goal: goals.fat_goal, unit: 'g', kind: 'ceiling' },
                  { label: 'Total Carbs', used: todayTotals.carbs, goal: goals.carbs_goal, unit: 'g', kind: 'ceiling' },
                  { label: 'Fiber', used: todayTotals.fiber, goal: goals.fiber_goal, unit: 'g', kind: 'floor' },
                  { label: 'Net Carbs', used: todayNetCarbs, goal: Math.max(0, goals.carbs_goal - goals.fiber_goal), unit: 'g', kind: 'ceiling' },
                ] as const).map(({ label, used, goal, unit, kind }) => {
                  // "Hit" only has one honest meaning for a floor goal (protein,
                  // fiber): reached the minimum. A ceiling goal (calories, fat,
                  // carbs) is not something you "complete," so no checkmark is
                  // shown for those, only the over-limit warning color.
                  const hit = kind === 'floor' && used >= goal
                  const over = kind === 'ceiling' && used > goal
                  return (
                    <div key={label} className={styles.macroProgressRow}>
                      <div className={styles.macroProgressLabels}>
                        <span className={styles.macroProgressName}>
                          {hit && <CheckCircle size={13} color="#4be08a" style={{ marginRight: 4, verticalAlign: -2 }} />}
                          {label}
                        </span>
                        <span className={styles.macroProgressValues}>
                          {Math.round(used)}{unit} / {goal}{unit}
                        </span>
                      </div>
                      <div className={styles.macroProgressBar}>
                        <div
                          className={styles.macroProgressFill}
                          style={{
                            width: `${pct(used, goal)}%`,
                            background: over ? '#e05c5c' : hit ? '#4be08a' : 'var(--teal)',
                          }}
                        />
                      </div>
                      <span className={styles.macroProgressRemaining}>
                        {kind === 'floor' && hit
                          ? 'goal met'
                          : `${Math.max(0, goal - Math.round(used))}${unit} ${kind === 'floor' ? 'to go' : 'remaining'}`}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className={styles.card}>
              <h3 className={styles.cardTitleSolo}>Today's Progress</h3>
              <p className={styles.cardText}>
                You have not set up nutrition goals yet, so there is nothing here to compare your food to. Every
                meal you log is still saved either way.
              </p>
              <button className={shared.btnSecondary} onClick={() => setActiveTab('goals')}>
                Set up my goals
              </button>
            </div>
          )}

          {/* Input form */}
          <div className={styles.card}>
            <form onSubmit={handleFormSubmit}>
              {/* Date, defaults to today, back-dating a missed meal is fine */}
              <div className={styles.field}>
                <label className={styles.label}>Date</label>
                <input className={styles.input} type="date"
                  value={entryDate} max={todayStr()}
                  onChange={e => setEntryDate(e.target.value)} required />
              </div>

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
                <button
                  type="button"
                  className={shared.btnGhost}
                  onClick={() => setShowScanner(true)}
                >
                  <Barcode size={16} /> Scan Barcode
                </button>
                <button
                  type="button"
                  className={manualEntry ? shared.btnTeal : shared.btnGhost}
                  onClick={() => setManualEntry(v => !v)}
                >
                  <Target size={16} /> {manualEntry ? 'Manual entry on' : 'Enter manually'}
                </button>
                {(result || (manualEntry && nutrition) || nutrition?.source === 'barcode') && (
                  <button
                    type="button"
                    className={shared.btnTeal}
                    onClick={handleLog}
                    disabled={saving || !foodInput.trim()}
                  >
                    <Plus size={16} />{' '}
                    {saving
                      ? 'Saving...'
                      : !nutrition
                        ? 'Log Without Nutrition Data'
                        : 'Log This Meal'}
                  </button>
                )}
              </div>

              {checkError && (
                <div className={styles.nutritionNotFoundRow}>
                  <AlertTriangle size={13} color="var(--gold)" />
                  The AI check could not run. Check your connection and try again, or use{' '}
                  <button type="button" className={shared.btnGhost} onClick={() => setManualEntry(true)} style={{ marginLeft: 4 }}>
                    Enter manually
                  </button>
                  .
                </div>
              )}

              {manualEntry && (
                <div className={styles.manualEntryGrid}>
                  <label className={styles.manualEntryField}>
                    <span>Calories</span>
                    <input className={styles.manualEntryInput} type="number" inputMode="decimal" min={0} value={manualCalories} onChange={e => setManualCalories(e.target.value)} placeholder="0" />
                  </label>
                  <label className={styles.manualEntryField}>
                    <span>Protein (g)</span>
                    <input className={styles.manualEntryInput} type="number" inputMode="decimal" min={0} value={manualProtein} onChange={e => setManualProtein(e.target.value)} placeholder="0" />
                  </label>
                  <label className={styles.manualEntryField}>
                    <span>Fat (g)</span>
                    <input className={styles.manualEntryInput} type="number" inputMode="decimal" min={0} value={manualFat} onChange={e => setManualFat(e.target.value)} placeholder="0" />
                  </label>
                  <label className={styles.manualEntryField}>
                    <span>Carbs (g)</span>
                    <input className={styles.manualEntryInput} type="number" inputMode="decimal" min={0} value={manualCarbs} onChange={e => setManualCarbs(e.target.value)} placeholder="0" />
                  </label>
                  <label className={styles.manualEntryField}>
                    <span>Fiber (g)</span>
                    <input className={styles.manualEntryInput} type="number" inputMode="decimal" min={0} value={manualFiber} onChange={e => setManualFiber(e.target.value)} placeholder="0" />
                  </label>
                  <p className={styles.manualEntryHint}>
                    From a nutrition label, a restaurant menu, or anywhere you already know the numbers. Type a food
                    name above so it shows in your log, then the numbers here. AI Check is not required.
                  </p>
                </div>
              )}

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
            {scanningLookup && (
              <div className={styles.nutritionLookupRow}>
                <Loader size={13} className={styles.spinIcon} /> Looking up this product...
              </div>
            )}
            {!nutrition && !lookingUp && nutritionLookupAttempted && !manualEntry && (
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
                  Nutritional data ({
                    nutrition.source === 'local' ? 'curated database'
                    : nutrition.source === 'usda' ? 'USDA FoodData Central'
                    : nutrition.source === 'ai' ? 'AI estimate, not a database match'
                    : nutrition.source === 'barcode' ? 'scanned barcode, Open Food Facts'
                    : 'entered by you'
                  }), per serving, estimates only
                </div>

                {!manualEntry ? (
                  // Editable so a close-but-not-quite AI or database match can be
                  // nudged right here, instead of abandoning it and retyping
                  // everything in Manual Entry from scratch.
                  <div className={styles.manualEntryGrid}>
                    <label className={styles.manualEntryField}>
                      <span>Calories</span>
                      <input className={styles.manualEntryInput} type="number" inputMode="decimal" min={0}
                        value={nutrition.calories}
                        onChange={e => setNutrition(n => n ? { ...n, calories: parseFloat(e.target.value) || 0 } : n)} />
                    </label>
                    <label className={styles.manualEntryField}>
                      <span>Protein (g)</span>
                      <input className={styles.manualEntryInput} type="number" inputMode="decimal" min={0}
                        value={nutrition.protein}
                        onChange={e => setNutrition(n => n ? { ...n, protein: parseFloat(e.target.value) || 0 } : n)} />
                    </label>
                    <label className={styles.manualEntryField}>
                      <span>Fat (g)</span>
                      <input className={styles.manualEntryInput} type="number" inputMode="decimal" min={0}
                        value={nutrition.fat}
                        onChange={e => setNutrition(n => n ? { ...n, fat: parseFloat(e.target.value) || 0 } : n)} />
                    </label>
                    <label className={styles.manualEntryField}>
                      <span>Carbs (g)</span>
                      <input className={styles.manualEntryInput} type="number" inputMode="decimal" min={0}
                        value={nutrition.carbs}
                        onChange={e => setNutrition(n => n ? { ...n, carbs: parseFloat(e.target.value) || 0 } : n)} />
                    </label>
                    <label className={styles.manualEntryField}>
                      <span>Fiber (g)</span>
                      <input className={styles.manualEntryInput} type="number" inputMode="decimal" min={0}
                        value={nutrition.fiber}
                        onChange={e => setNutrition(n => n ? { ...n, fiber: parseFloat(e.target.value) || 0 } : n)} />
                    </label>
                  </div>
                ) : (
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
                )}

                {nutrition.notes && <p className={styles.nutritionNotes}>{nutrition.notes}</p>}

                <label className={styles.manualEntryField} style={{ maxWidth: 160, marginTop: 10 }}>
                  <span>Servings</span>
                  <input className={styles.manualEntryInput} type="number" inputMode="decimal" min={0.25} step={0.25}
                    value={servings} onChange={e => setServings(e.target.value)} />
                </label>

                {servingsNum() !== 1 && loggedNutrition && (
                  <p className={styles.nutritionNotes}>
                    Logging {servings} servings = <strong>{loggedNutrition.calories} kcal</strong>,{' '}
                    {loggedNutrition.protein}g protein, {loggedNutrition.fat}g fat, {loggedNutrition.carbs}g carbs,{' '}
                    {loggedNutrition.fiber}g fiber.
                  </p>
                )}
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
                  editingLogId === log.id ? (
                    <div key={log.id} className={styles.manualEntryGrid}>
                      <label className={styles.manualEntryField} style={{ gridColumn: '1 / -1' }}>
                        <span>Food name</span>
                        <input className={styles.manualEntryInput} type="text"
                          value={editForm.food_name}
                          onChange={e => setEditForm(f => ({ ...f, food_name: e.target.value }))} />
                      </label>
                      <label className={styles.manualEntryField}>
                        <span>Meal</span>
                        <select className={styles.mealTypeSelect} value={editForm.meal_type}
                          onChange={e => setEditForm(f => ({ ...f, meal_type: e.target.value }))}>
                          {MEAL_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                      </label>
                      <label className={styles.manualEntryField}>
                        <span>Calories</span>
                        <input className={styles.manualEntryInput} type="number" inputMode="decimal" min={0}
                          value={editForm.calories} onChange={e => setEditForm(f => ({ ...f, calories: e.target.value }))} />
                      </label>
                      <label className={styles.manualEntryField}>
                        <span>Protein (g)</span>
                        <input className={styles.manualEntryInput} type="number" inputMode="decimal" min={0}
                          value={editForm.protein} onChange={e => setEditForm(f => ({ ...f, protein: e.target.value }))} />
                      </label>
                      <label className={styles.manualEntryField}>
                        <span>Fat (g)</span>
                        <input className={styles.manualEntryInput} type="number" inputMode="decimal" min={0}
                          value={editForm.fat} onChange={e => setEditForm(f => ({ ...f, fat: e.target.value }))} />
                      </label>
                      <label className={styles.manualEntryField}>
                        <span>Carbs (g)</span>
                        <input className={styles.manualEntryInput} type="number" inputMode="decimal" min={0}
                          value={editForm.carbs} onChange={e => setEditForm(f => ({ ...f, carbs: e.target.value }))} />
                      </label>
                      <label className={styles.manualEntryField}>
                        <span>Fiber (g)</span>
                        <input className={styles.manualEntryInput} type="number" inputMode="decimal" min={0}
                          value={editForm.fiber} onChange={e => setEditForm(f => ({ ...f, fiber: e.target.value }))} />
                      </label>
                      <div className={styles.formActions} style={{ gridColumn: '1 / -1' }}>
                        <button type="button" className={shared.btnTeal} onClick={handleUpdateLog}>
                          <Check size={16} /> Save
                        </button>
                        <button type="button" className={shared.btnGhost} onClick={cancelEditLog}>Cancel</button>
                      </div>
                    </div>
                  ) : (
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
                          onClick={() => startEditLog(log)}
                          aria-label={`Edit ${log.food_name}`}
                          title="Edit this entry"
                        >
                          <Pencil size={16} />
                        </button>
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
                  )
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ---- TRENDS TAB ---- */}
      {activeTab === 'trends' && (
        <div className={styles.card}>
          <h3 className={styles.cardTitleSolo}>Nutrition Trend (Last 30 Days)</h3>
          {userId
            ? <NutritionTrendsChart userId={userId} goals={goals} />
            : <p className={styles.cardText}>Loading...</p>}
        </div>
      )}

      {/* ---- GOALS TAB ---- */}
      {activeTab === 'goals' && (
        userId ? (
          <NutritionGoalsTab
            userId={userId}
            initialGoals={goals}
            onGoalsSaved={setGoals}
          />
        ) : (
          <div className={styles.card}>
            <p className={styles.cardText}>
              {initError
                ? 'Could not load your account, so the calculator and your goals cannot show yet.'
                : 'Loading your goals...'}
            </p>
            <button className={shared.btnSecondary} onClick={init}>Retry</button>
          </div>
        )
      )}

      {/* ---- SAVED FOODS TAB ---- */}
      {activeTab === 'saved' && (
        <>
        {recentFoods.length > 0 && (
          <div className={styles.card}>
            <h3 className={styles.cardTitleSolo}><Clock size={15} style={{ verticalAlign: -2, marginRight: 4 }} />Recent</h3>
            <p className={styles.cardText}>Foods you've actually logged lately, whether or not you starred them.</p>
            <div className={styles.mealList}>
              {recentFoods.map(food => (
                <div key={food.food_name} className={styles.mealItem}>
                  <div className={styles.mealItemBody}>
                    <div className={styles.mealItemName}>{food.food_name}</div>
                    <div className={styles.mealItemMeta}>
                      {MEAL_TYPES.find(t => t.value === food.meal_type)?.label}
                      {food.calories != null && <span> · ~{food.calories} kcal</span>}
                    </div>
                  </div>
                  <div className={styles.mealItemActions}>
                    <button
                      className={styles.quickLogBtn}
                      onClick={() => handleQuickLog(food)}
                      aria-label={`Quick log ${food.food_name}`}
                    >
                      <Plus size={14} /> Log
                    </button>
                    <button
                      className={styles.heartBtn}
                      onClick={() => handleSaveToFavorites(food)}
                      aria-label="Save to favorites"
                      title="Save to favorites"
                    >
                      <Heart size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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
        </>
      )}

      {showScanner && (
        <BarcodeScannerModal
          onDetected={handleBarcodeDetected}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  )
}
