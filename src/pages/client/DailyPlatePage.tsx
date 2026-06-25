import { useState, useMemo, useEffect } from 'react'
import { Coffee, Sun, Moon, Apple, Plus, X, Zap, ChevronDown, ChevronUp, Search, Sparkles, Loader2, Target, TrendingUp, ShieldCheck } from 'lucide-react'
import { FOOD_DATABASE, MEAL_SLOT_LABELS, type MealSlot, type FoodItem } from '@/data/foodDatabase'
import { detectSynergies, type FoodSynergy } from '@/data/synergies'
import styles from './Client.module.css'
import { usePlan } from '@/hooks/usePlan'
import { useAuthStore } from '@/store/authStore'

type Plate = Record<MealSlot, FoodItem[]>

const SLOTS: MealSlot[] = ['breakfast', 'lunch', 'dinner', 'snack']
const EMPTY_PLATE: Plate = { breakfast: [], lunch: [], dinner: [], snack: [] }
const PROTEIN_GOAL = 80
const CALORIE_GOAL = 1800

const SLOT_ICONS: Record<MealSlot, React.ReactNode> = {
  breakfast: <Coffee size={15} />,
  lunch:     <Sun size={15} />,
  dinner:    <Moon size={15} />,
  snack:     <Apple size={15} />,
}

function calcVitaScore(plate: Plate, synergies: FoodSynergy[]): number {
  const allFoods = Object.values(plate).flat()
  if (allFoods.length === 0) return 0
  let score = 40
  allFoods.forEach(() => { score += 3 })
  score += synergies.length * 8
  const totalProtein = allFoods.reduce((s, f) => s + f.proteinGrams, 0)
  if (totalProtein >= PROTEIN_GOAL) score += 10
  else if (totalProtein >= PROTEIN_GOAL * 0.7) score += 5
  const filledSlots = SLOTS.filter(s => plate[s].length > 0).length
  if (filledSlots >= 3) score += 8
  return Math.max(0, Math.min(100, Math.round(score)))
}

function ScoreRing({ score }: { score: number }) {
  const radius = 38
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#c8a74b' : score >= 40 ? '#f97316' : '#e05c5c'
  const label = score >= 80 ? 'Optimal' : score >= 60 ? 'Excellent' : score >= 40 ? 'Building' : 'Needs Work'
  return (
    <div className={styles.dpRingWrap}>
      <svg viewBox="0 0 96 96" className={styles.dpRingSvg}>
        <circle cx="48" cy="48" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
        <circle
          cx="48" cy="48" r={radius} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease', transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
        />
      </svg>
      <div className={styles.dpRingInner}>
        <span className={styles.dpRingScore}>{score}</span>
        <span className={styles.dpRingOf}>/100</span>
      </div>
      <span className={styles.dpRingLabel} style={{ color }}>{label}</span>
    </div>
  )
}

function MacroBar({ label, value, goal, color }: { label: string; value: number; goal: number; color: string }) {
  const pct = Math.min(100, Math.round((value / goal) * 100))
  return (
    <div className={styles.dpMacroBar}>
      <div className={styles.dpMacroBarTop}>
        <span>{label}</span>
        <span className={styles.dpMacroBarVal}>{Math.round(value)}<span className={styles.dpMacroBarGoal}>/{goal}</span></span>
      </div>
      <div className={styles.dpMacroTrack}>
        <div className={styles.dpMacroFill} style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

const PLATE_ANALYSIS_LIMIT = 3
const PA_KEY = () => `pa_count_${new Date().toISOString().split('T')[0]}`

export default function DailyPlatePage() {
  const { vitaPlateDailyLimit } = usePlan()
  const { profile } = useAuthStore()
  const userGoal = profile?.wellness_goals?.primary_goal ?? ''
  const dietaryStyle = profile?.wellness_goals?.dietary_preference ?? ''
  const [plate, setPlate] = useState<Plate>(EMPTY_PLATE)
  const [addingTo, setAddingTo] = useState<MealSlot | null>(null)
  const [searchQ, setSearchQ] = useState('')
  const [expandedSynergy, setExpandedSynergy] = useState<string | null>(null)
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisCount, setAnalysisCount] = useState(0)

  useEffect(() => {
    setAnalysisCount(parseInt(localStorage.getItem(PA_KEY()) ?? '0', 10))
  }, [])

  const allFoods = useMemo(() => Object.values(plate).flat(), [plate])
  const allFoodIds = useMemo(() => allFoods.map(f => f.id), [allFoods])
  const synergies = useMemo(() => detectSynergies(allFoodIds), [allFoodIds])
  const vitaScore = useMemo(() => calcVitaScore(plate, synergies), [plate, synergies])

  const dayTotals = useMemo(() => ({
    calories: allFoods.reduce((s, f) => s + f.calories, 0),
    protein:  allFoods.reduce((s, f) => s + f.proteinGrams, 0),
    fat:      allFoods.reduce((s, f) => s + f.fatGrams, 0),
    carbs:    allFoods.reduce((s, f) => s + f.carbGrams, 0),
  }), [allFoods])

  const slotCandidates = useMemo(() => {
    if (!addingTo) return []
    const q = searchQ.toLowerCase()
    const inSlot = new Set(plate[addingTo].map(f => f.id))
    return FOOD_DATABASE.filter(f =>
      !inSlot.has(f.id) &&
      f.mealSlots.includes(addingTo) &&
      (!q || f.name.toLowerCase().includes(q) || f.notes.toLowerCase().includes(q))
    )
  }, [addingTo, searchQ, plate])

  function addFood(slot: MealSlot, food: FoodItem) {
    setPlate(p => ({ ...p, [slot]: [...p[slot], food] }))
    setSearchQ('')
  }

  function removeFood(slot: MealSlot, foodId: string) {
    setPlate(p => ({ ...p, [slot]: p[slot].filter(f => f.id !== foodId) }))
  }

  async function runAiAnalysis() {
    if (allFoods.length === 0) return
    if (analysisCount >= vitaPlateDailyLimit) {
      setAiAnalysis(`You have used your ${PLATE_ANALYSIS_LIMIT} daily AI analyses. Upgrade to The Program for unlimited access.`)
      return
    }
    const next = analysisCount + 1
    localStorage.setItem(PA_KEY(), String(next))
    setAnalysisCount(next)
    setIsAnalyzing(true)
    setAiAnalysis(null)
    const plateDescription = SLOTS.map(slot => {
      const foods = plate[slot]
      if (foods.length === 0) return null
      return `${MEAL_SLOT_LABELS[slot]}: ${foods.map(f => f.name).join(', ')}`
    }).filter(Boolean).join(' | ')
    try {
      const res = await fetch('/api/plate-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plateDescription, vitaScore, synergiesDetected: synergies.map(s => s.title), dayTotals, userGoal, dietaryStyle }),
      })
      if (!res.ok) throw new Error('Analysis failed')
      const data = await res.json()
      setAiAnalysis(data.analysis)
    } catch {
      setAiAnalysis('Unable to reach the analysis service. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <div className={styles.pageTop}>
        <h1 className={styles.pageTopTitle}>
          <Target size={22} color="var(--gold)" /> Daily Plate Builder
        </h1>
        <p className={styles.pageTopDate}>
          Build your plate for the day. VitaScore adapts in real time as you add foods and synergies activate.
        </p>
      </div>

      {/* Intelligence header */}
      <div className={styles.dpHeader}>
        <div className={styles.dpHeaderLeft}>
          <div className={styles.dpMacroBars}>
            <MacroBar label="Protein"  value={dayTotals.protein}  goal={80}   color="#22c55e" />
            <MacroBar label="Calories" value={dayTotals.calories} goal={1800} color="#818cf8" />
            <MacroBar label="Fat"      value={dayTotals.fat}      goal={65}   color="#c8a74b" />
            <MacroBar label="Carbs"    value={dayTotals.carbs}    goal={200}  color="#3b82f6" />
          </div>
        </div>
        <div className={styles.dpHeaderRight}>
          <div className={styles.dpVitaLabel}>VitaScore</div>
          <ScoreRing score={vitaScore} />
          {synergies.length > 0 && (
            <div className={styles.dpSynergyPill}>
              <Zap size={12} color="#c8a74b" />
              <span>{synergies.length} Synerg{synergies.length > 1 ? 'ies' : 'y'} Active</span>
            </div>
          )}
        </div>
      </div>

      {/* Meal slot grid */}
      <div className={styles.dpSlotGrid}>
        {SLOTS.map(slot => {
          const foods = plate[slot]
          const slotProtein = foods.reduce((s, f) => s + f.proteinGrams, 0)
          const slotCals = foods.reduce((s, f) => s + f.calories, 0)
          return (
            <div key={slot} className={styles.dpSlot}>
              <div className={styles.dpSlotHead}>
                <div className={styles.dpSlotTitle}>
                  <span className={styles.dpSlotIcon}>{SLOT_ICONS[slot]}</span>
                  {MEAL_SLOT_LABELS[slot]}
                </div>
                {foods.length > 0 && (
                  <div className={styles.dpSlotMacros}>
                    <span className={styles.dpSlotProtein}>{slotProtein}g P</span>
                    <span className={styles.dpSlotCal}>{slotCals} cal</span>
                  </div>
                )}
              </div>

              <div className={styles.dpSlotFoods}>
                {foods.length === 0 ? (
                  <p className={styles.dpSlotEmpty}>No foods added yet</p>
                ) : (
                  foods.map(food => (
                    <div key={food.id} className={styles.dpFoodRow}>
                      <span className={styles.dpFoodDot} />
                      <span className={styles.dpFoodName}>{food.name}</span>
                      <span className={styles.dpFoodP}>{food.proteinGrams}g P</span>
                      <button className={styles.dpFoodRemove} onClick={() => removeFood(slot, food.id)}>
                        <X size={13} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <button
                className={styles.dpAddBtn}
                onClick={() => { setAddingTo(slot); setSearchQ('') }}
              >
                <Plus size={14} /> Add Food
              </button>
            </div>
          )
        })}
      </div>

      {/* Food picker modal */}
      {addingTo && (
        <div className={styles.dpModalOverlay} onClick={() => setAddingTo(null)}>
          <div className={styles.dpModal} onClick={e => e.stopPropagation()}>
            <div className={styles.dpModalHead}>
              <div className={styles.dpModalTitle}>
                {SLOT_ICONS[addingTo]} Add to {MEAL_SLOT_LABELS[addingTo]}
              </div>
              <button className={styles.dpModalClose} onClick={() => setAddingTo(null)}>
                <X size={18} />
              </button>
            </div>
            <div className={styles.dpModalSearch}>
              <Search size={15} color="var(--text-muted)" />
              <input
                autoFocus
                type="text"
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                placeholder={`Search ${MEAL_SLOT_LABELS[addingTo!].toLowerCase()} foods...`}
                className={styles.dpModalInput}
              />
            </div>
            <div className={styles.dpModalList}>
              {slotCandidates.length === 0 ? (
                <p className={styles.dpModalEmpty}>No foods match your search.</p>
              ) : (
                slotCandidates.map(food => (
                  <button
                    key={food.id}
                    className={styles.dpModalItem}
                    onClick={() => addFood(addingTo!, food)}
                  >
                    <div className={styles.dpModalItemInfo}>
                      <span className={styles.dpModalItemName}>{food.name}</span>
                      <span className={styles.dpModalItemNotes}>{food.notes.slice(0, 60)}...</span>
                    </div>
                    <div className={styles.dpModalItemMacros}>
                      <span className={styles.dpModalItemP}>{food.proteinGrams}g P</span>
                      <span className={styles.dpModalItemCal}>{food.calories} cal</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Active synergies */}
      {synergies.length > 0 && (
        <div className={styles.dpSynergies}>
          <div className={styles.dpSynergiesHead}>
            <Zap size={15} color="var(--gold)" />
            Active Food Synergies
            <span className={styles.dpSynergyCount}>{synergies.length} detected</span>
          </div>
          <div className={styles.dpSynergyGrid}>
            {synergies.map(syn => (
              <div key={syn.id} className={styles.dpSynergyCard} style={{ borderLeftColor: syn.color }}>
                <button
                  className={styles.dpSynergyCardBtn}
                  onClick={() => setExpandedSynergy(expandedSynergy === syn.id ? null : syn.id)}
                >
                  <div>
                    <div className={styles.dpSynergyTitle} style={{ color: syn.color }}>{syn.title}</div>
                    <div className={styles.dpSynergyBoost}>{syn.boost}</div>
                  </div>
                  {expandedSynergy === syn.id
                    ? <ChevronUp size={14} color={syn.color} />
                    : <ChevronDown size={14} color={syn.color} />
                  }
                </button>
                {expandedSynergy === syn.id && (
                  <p className={styles.dpSynergyMechanism}>{syn.mechanism}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Plate Analysis */}
      {allFoods.length > 0 && (
        <div className={styles.dpAiSection}>
          <button
            className={styles.dpAiBtn}
            onClick={runAiAnalysis}
            disabled={isAnalyzing}
          >
            {isAnalyzing
              ? <><Loader2 size={18} className={styles.dpSpinner} /> Analyzing your plate...</>
              : <><Sparkles size={18} /> AI Plate Analysis: Get Your Upgrade Intel</>
            }
          </button>
          {aiAnalysis && (
            <div className={styles.dpAiResult}>
              <div className={styles.dpAiResultHead}>
                <ShieldCheck size={16} color="var(--teal)" />
                <span>VitaPlate AI Educator Note</span>
              </div>
              <p className={styles.dpAiResultBody}>{aiAnalysis}</p>
            </div>
          )}
        </div>
      )}

      {allFoods.length === 0 && (
        <div className={styles.dpEmptyState}>
          <TrendingUp size={36} color="rgba(255,255,255,0.1)" />
          <p>Add foods to your plate to activate VitaScore and synergy detection.</p>
        </div>
      )}

      <p className={styles.recipeDisclaimer}>
        This tool is for educational purposes only and does not constitute dietary advice.
        For personalized nutrition care, consult a registered dietitian.
      </p>
    </div>
  )
}
