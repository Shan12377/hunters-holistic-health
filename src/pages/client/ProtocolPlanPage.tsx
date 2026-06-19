import { useState, useMemo } from 'react'
import { Zap, BookOpen, ExternalLink, X, ChevronDown, ChevronUp, Utensils, ShoppingCart, Copy, Check, Plus, Trash2 } from 'lucide-react'
import {
  PROTOCOL_RECIPES,
  PROTOCOL_SYNERGIES,
  PLAN_DATA,
  detectProtocolSynergies,
  getDayScore,
  type ProtocolRecipe,
  type MealSlotType,
  type ProtocolSynergy,
  type SynergyTag,
} from '@/data/protocolPlan'
import styles from './Client.module.css'

type Tab = 'guide' | 'planner' | 'science' | 'grocery'

const GROCERY_PRODUCE = ['sweet potato', 'callaloo', 'tomato', 'avocado', 'lettuce', 'celery', 'onion', 'garlic', 'bell pepper', 'spinach', 'berr', 'banana', 'broccoli', 'cabbage', 'kale', 'lemon', 'lime', 'mango', 'beet', 'cucumber', 'scallion', 'green onion', 'edamame', 'mushroom', 'arugula', 'carrot', 'apple', 'pear', 'papaya', 'pineapple', 'asparagus', 'zucchini', 'plantain', 'cilantro', 'parsley', 'mint', 'basil', 'dill', 'ginger root', 'mixed berries', 'fresh ginger']
const GROCERY_PROTEINS = ['egg', 'tuna', 'salmon', 'chicken', 'turkey', 'shrimp', 'lentil', 'chickpea', 'black bean', 'white bean', 'kidney bean', 'tempeh', 'tofu', 'sardine', 'fish', 'beef', 'cod', 'tilapia', 'whitefish']
const GROCERY_DAIRY = ['coconut milk', 'almond milk', 'oat milk', 'coconut cream', 'greek yogurt', 'yogurt', 'kefir']
const GROCERY_OILS = ['coconut oil', 'olive oil', 'avocado oil', 'tahini', 'mustard', 'vinegar', 'soy sauce', 'tamari', 'sesame oil', 'fish sauce', 'hot sauce']
const GROCERY_SPICES = ['matcha', 'tea', 'turmeric', 'cinnamon', 'black pepper', 'vanilla', 'stevia', 'monk fruit', 'ginger powder', 'sea salt', 'salt', 'paprika', 'cumin', 'oregano', 'bay leaf', 'cayenne', 'cardamom', 'nutmeg', 'clove', 'thyme', 'curry', 'chili', 'peppercorn']

const CATEGORY_ORDER = ['Produce', 'Proteins', 'Dairy Alternatives', 'Pantry and Dry Goods', 'Spices and Beverages', 'Oils and Condiments']

function categorizeIngredient(ing: string): string {
  const lower = ing.toLowerCase()
  if (GROCERY_PRODUCE.some(k => lower.includes(k))) return 'Produce'
  if (GROCERY_PROTEINS.some(k => lower.includes(k))) return 'Proteins'
  if (GROCERY_DAIRY.some(k => lower.includes(k))) return 'Dairy Alternatives'
  if (GROCERY_OILS.some(k => lower.includes(k))) return 'Oils and Condiments'
  if (GROCERY_SPICES.some(k => lower.includes(k))) return 'Spices and Beverages'
  return 'Pantry and Dry Goods'
}

const SLOT_LABELS: Record<MealSlotType, string> = {
  beverage: 'Morning Beverage',
  meal1: 'Meal 1 (12-2 PM)',
  meal2: 'Meal 2 (5-7 PM)',
  snack: 'Snack',
}

const SLOT_ORDER: MealSlotType[] = ['beverage', 'meal1', 'meal2', 'snack']

const WEEK_LABELS = ['Week 1', 'Week 2', 'Week 3', 'Week 4']
const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const DAY_NAMES_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function recipeById(id: string): ProtocolRecipe | undefined {
  return PROTOCOL_RECIPES.find(r => r.id === id)
}

function ScoreRing({ score }: { score: number }) {
  const r = 32
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 80 ? '#4be08a' : score >= 60 ? '#c8a74b' : score >= 40 ? '#e0b84b' : '#e05c5c'
  const label = score >= 80 ? 'Optimal' : score >= 60 ? 'Strong' : score >= 40 ? 'Building' : 'Getting Started'
  return (
    <div className={styles.ppScoreRingWrap}>
      <svg viewBox="0 0 80 80" className={styles.ppScoreRingSvg}>
        <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
        <circle
          cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="7"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transform: 'rotate(-90deg)', transformOrigin: '40px 40px', transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div className={styles.ppScoreRingInner}>
        <span className={styles.ppScoreNum}>{score}</span>
        <span className={styles.ppScoreLabel} style={{ color }}>{label}</span>
      </div>
    </div>
  )
}

function SynergyCard({ syn, expanded, onToggle }: { syn: ProtocolSynergy; expanded: boolean; onToggle: () => void }) {
  return (
    <button className={styles.ppSynergyCard} style={{ borderLeftColor: syn.color }} onClick={onToggle}>
      <div className={styles.ppSynergyTop}>
        <div>
          <div className={styles.ppSynergyTitle} style={{ color: syn.color }}>{syn.title}</div>
          <div className={styles.ppSynergyBoost}>{syn.boost}</div>
        </div>
        <span className={styles.ppSynergyChevron} style={{ color: syn.color }}>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </div>
      {expanded && <p className={styles.ppSynergyMech}>{syn.mechanism}</p>}
    </button>
  )
}

export default function ProtocolPlanPage() {
  const [activeTab, setActiveTab] = useState<Tab>('guide')
  const [selectedWeek, setSelectedWeek] = useState(0)
  const [selectedDay, setSelectedDay] = useState<number>(1)
  const [overrides, setOverrides] = useState<Record<string, string>>({})
  const [modalSlot, setModalSlot] = useState<{ day: number; slot: MealSlotType } | null>(null)
  const [expandedGuideDay, setExpandedGuideDay] = useState<number | null>(null)
  const [expandedSynergy, setExpandedSynergy] = useState<string | null>(null)
  const [expandedRecipe, setExpandedRecipe] = useState<ProtocolRecipe | null>(null)
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())
  const [copied, setCopied] = useState(false)
  const [groceryPlan, setGroceryPlan] = useState<Record<string, string | null>>({})
  const [groceryPickerSlot, setGroceryPickerSlot] = useState<{ dayIndex: number; slotKey: string; recipeType: MealSlotType } | null>(null)
  const [customGroceries, setCustomGroceries] = useState<string[]>([])
  const [customInput, setCustomInput] = useState('')

  const weekDays = useMemo(() => {
    const start = selectedWeek * 7 + 1
    return Array.from({ length: 7 }, (_, i) => start + i).filter(d => d <= 30)
  }, [selectedWeek])

  function getPlanRecipe(day: number, slot: MealSlotType): ProtocolRecipe | undefined {
    const key = `${day}-${slot}`
    const planDay = PLAN_DATA.find(d => d.day === day)
    const id = overrides[key] || planDay?.[slot as keyof typeof planDay] as string | undefined
    return id ? recipeById(id) : undefined
  }

  function setOverride(day: number, slot: MealSlotType, id: string) {
    setOverrides(prev => ({ ...prev, [`${day}-${slot}`]: id }))
  }

  function getDaySynergies(day: number): ProtocolSynergy[] {
    const recipes = SLOT_ORDER.map(slot => getPlanRecipe(day, slot)).filter(Boolean) as ProtocolRecipe[]
    return detectProtocolSynergies(recipes)
  }

  function getDayAllTags(day: number): Set<SynergyTag> {
    const recipes = SLOT_ORDER.map(slot => getPlanRecipe(day, slot)).filter(Boolean) as ProtocolRecipe[]
    const tags = new Set<SynergyTag>()
    recipes.forEach(r => r.synergyTags.forEach(t => tags.add(t)))
    return tags
  }

  const selectedDaySynergies = useMemo(() => getDaySynergies(selectedDay), [selectedDay, overrides])
  const selectedDayTags = useMemo(() => getDayAllTags(selectedDay), [selectedDay, overrides])
  const selectedDayScore = useMemo(() => {
    const filled = SLOT_ORDER.filter(slot => getPlanRecipe(selectedDay, slot)).length
    return getDayScore(selectedDaySynergies, selectedDayTags, filled)
  }, [selectedDaySynergies, selectedDayTags, selectedDay, overrides])

  const modalCandidates = useMemo(() => {
    if (!modalSlot) return []
    return PROTOCOL_RECIPES.filter(r => r.type === modalSlot.slot)
  }, [modalSlot])

  const groceryCandidates = useMemo(() => {
    if (!groceryPickerSlot) return []
    return PROTOCOL_RECIPES.filter(r => r.type === groceryPickerSlot.recipeType)
  }, [groceryPickerSlot])

  const groceryListByCategory = useMemo(() => {
    const allIngredients = new Set<string>()
    Object.entries(groceryPlan).forEach(([, id]) => {
      if (!id) return
      const recipe = PROTOCOL_RECIPES.find(r => r.id === id)
      recipe?.ingredients.forEach(ing => allIngredients.add(ing))
    })
    const categorized: Record<string, string[]> = {}
    allIngredients.forEach(ing => {
      const cat = categorizeIngredient(ing)
      if (!categorized[cat]) categorized[cat] = []
      categorized[cat].push(ing)
    })
    Object.values(categorized).forEach(arr => arr.sort())
    return categorized
  }, [groceryPlan])

  const groceryTotalCount = useMemo(() =>
    Object.values(groceryListByCategory).reduce((sum, arr) => sum + arr.length, 0) + customGroceries.length,
    [groceryListByCategory, customGroceries]
  )

  function toggleCheck(ing: string) {
    setCheckedItems(prev => {
      const next = new Set(prev)
      next.has(ing) ? next.delete(ing) : next.add(ing)
      return next
    })
  }

  function setGroceryMeal(dayIndex: number, slotKey: string, id: string) {
    setGroceryPlan(prev => ({ ...prev, [`${dayIndex}-${slotKey}`]: id }))
    setGroceryPickerSlot(null)
  }

  function removeGroceryMeal(dayIndex: number, slotKey: string) {
    setGroceryPlan(prev => ({ ...prev, [`${dayIndex}-${slotKey}`]: null }))
  }

  function addCustomGrocery(e: React.FormEvent) {
    e.preventDefault()
    if (!customInput.trim()) return
    setCustomGroceries(prev => [...prev, customInput.trim()])
    setCustomInput('')
  }

  function copyGroceryList() {
    const parts: string[] = []
    CATEGORY_ORDER.filter(cat => groceryListByCategory[cat]?.length > 0).forEach(cat => {
      parts.push(`${cat}:\n${groceryListByCategory[cat].map(i => `- ${i}`).join('\n')}`)
    })
    if (customGroceries.length > 0) parts.push(`Extra Items:\n${customGroceries.map(i => `- ${i}`).join('\n')}`)
    navigator.clipboard.writeText(parts.join('\n\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="animate-fade-in">
      <div className={styles.pageTop}>
        <h1 className={styles.pageTopTitle}>
          <Utensils size={20} color="var(--gold)" /> 30-Day Metabolic Protocol
        </h1>
        <p className={styles.pageTopDate}>Structured meal timing, food pairing intelligence, and the science behind every choice.</p>
      </div>

      {/* Tabs */}
      <div className={styles.ppTabs}>
        {(['guide', 'planner', 'science', 'grocery'] as Tab[]).map(tab => (
          <button
            key={tab}
            className={activeTab === tab ? styles.ppTabActive : styles.ppTab}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'guide' ? '30-Day Guide' : tab === 'planner' ? 'Day Planner' : tab === 'science' ? 'The Science' : 'Grocery List'}
          </button>
        ))}
      </div>

      {/* ─── GUIDE TAB ─── */}
      {activeTab === 'guide' && (
        <div className={styles.ppSection}>
          <div className={styles.ppGuideBanner}>
            <div className={styles.ppGuideBannerIcon}>◉</div>
            <div>
              <div className={styles.ppGuideBannerTitle}>Metabolic Reset: Eating Window Protocol</div>
              <div className={styles.ppGuideBannerSub}>High-nutrient morning beverage to support the fasting window. First meal opens between 12 and 2 PM. Second meal closes by 7 PM.</div>
            </div>
          </div>

          <div className={styles.ppGuideTable}>
            <div className={styles.ppGuideTableHead}>
              <span>Day</span>
              <span>Morning Beverage</span>
              <span>Meal 1 (12-2 PM)</span>
              <span>Meal 2 (5-7 PM)</span>
              <span>Snack</span>
            </div>
            {PLAN_DATA.map(day => {
              const bev = recipeById(day.beverage)
              const m1 = recipeById(day.meal1)
              const m2 = recipeById(day.meal2)
              const sn = recipeById(day.snack)
              const daySyns = getDaySynergies(day.day)
              const isOpen = expandedGuideDay === day.day
              return (
                <div key={day.day}>
                  <div
                    className={styles.ppGuideRow}
                    onClick={() => setExpandedGuideDay(isOpen ? null : day.day)}
                    role="button"
                  >
                    <span className={styles.ppGuideDayNum}>D{day.day}</span>
                    <span className={styles.ppGuideBevCell}>{bev?.name}</span>
                    <button className={styles.ppGuideMealBtn} onClick={e => { e.stopPropagation(); setExpandedRecipe(m1 ?? null) }}>{m1?.name}</button>
                    <button className={styles.ppGuideMealBtn} onClick={e => { e.stopPropagation(); setExpandedRecipe(m2 ?? null) }}>{m2?.name}</button>
                    <span className={styles.ppGuideSnackCell}>{sn?.name}</span>
                    {daySyns.length > 0 && (
                      <span className={styles.ppGuideZapBadge}>
                        <Zap size={11} /> {daySyns.length}
                      </span>
                    )}
                  </div>
                  {isOpen && (
                    <div className={styles.ppGuideSynExpand}>
                      {daySyns.length > 0 ? (
                        <>
                          <div className={styles.ppGuideSynLabel}><Zap size={12} color="var(--gold)" /> Active pairings today</div>
                          <div className={styles.ppGuideSynRow}>
                            {daySyns.map(syn => (
                              <span key={syn.id} className={styles.ppGuideSynChip} style={{ color: syn.color, borderColor: syn.color }}>
                                {syn.title}: {syn.boost}
                              </span>
                            ))}
                          </div>
                        </>
                      ) : (
                        <p className={styles.ppGuideSynNone}>No pairings detected for this day. Tap a meal name to see its ingredients and swap if needed.</p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ─── PLANNER TAB ─── */}
      {activeTab === 'planner' && (
        <div className={styles.ppSection}>
          {/* Week selector */}
          <div className={styles.ppWeekRow}>
            {WEEK_LABELS.map((label, i) => (
              <button
                key={i}
                className={selectedWeek === i ? styles.ppWeekBtnActive : styles.ppWeekBtn}
                onClick={() => { setSelectedWeek(i); setSelectedDay(i * 7 + 1) }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Day selector */}
          <div className={styles.ppDayRow}>
            {weekDays.map((d, i) => {
              const syns = getDaySynergies(d)
              return (
                <button
                  key={d}
                  className={selectedDay === d ? styles.ppDayBtnActive : styles.ppDayBtn}
                  onClick={() => setSelectedDay(d)}
                >
                  <span className={styles.ppDayName}>{DAY_NAMES[i]}</span>
                  <span className={styles.ppDayNum}>D{d}</span>
                  {syns.length > 0 && <span className={styles.ppDayZap}><Zap size={9} /></span>}
                </button>
              )
            })}
          </div>

          {/* Day detail: score + meal slots */}
          <div className={styles.ppDayDetail}>
            <div className={styles.ppDayHeader}>
              <div>
                <div className={styles.ppDayTitle}>Day {selectedDay}</div>
                <div className={styles.ppDaySubtitle}>
                  {selectedDaySynergies.length > 0
                    ? `${selectedDaySynergies.length} food pairing${selectedDaySynergies.length > 1 ? 's' : ''} active today`
                    : 'No pairings detected. Swap a meal to activate one.'}
                </div>
              </div>
              <ScoreRing score={selectedDayScore} />
            </div>

            <div className={styles.ppMealSlots}>
              {SLOT_ORDER.map(slot => {
                const recipe = getPlanRecipe(selectedDay, slot)
                return (
                  <div key={slot} className={styles.ppMealSlot}>
                    <div className={styles.ppSlotLabel}>{SLOT_LABELS[slot]}</div>
                    {recipe ? (
                      <div className={styles.ppSlotFilled}>
                        <div className={styles.ppSlotName}>{recipe.name}</div>
                        <div className={styles.ppSlotMeta}>{recipe.calories} cal · {recipe.servings} serving{recipe.servings > 1 ? 's' : ''}</div>
                        <div className={styles.ppSlotActions}>
                          <button className={styles.ppSlotView} onClick={() => setExpandedRecipe(recipe)}>View</button>
                          <button className={styles.ppSlotSwap} onClick={() => setModalSlot({ day: selectedDay, slot })}>Swap</button>
                        </div>
                      </div>
                    ) : (
                      <button className={styles.ppSlotEmpty} onClick={() => setModalSlot({ day: selectedDay, slot })}>
                        + Add meal
                      </button>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Active synergies for selected day */}
            {selectedDaySynergies.length > 0 && (
              <div className={styles.ppSynergiesPanel}>
                <div className={styles.ppSynergiesPanelHead}>
                  <Zap size={15} color="var(--gold)" />
                  <span>Active Food Pairings</span>
                  <span className={styles.ppSynCount}>{selectedDaySynergies.length} detected</span>
                </div>
                <div className={styles.ppSynergiesGrid}>
                  {selectedDaySynergies.map(syn => (
                    <SynergyCard
                      key={syn.id}
                      syn={syn}
                      expanded={expandedSynergy === syn.id}
                      onToggle={() => setExpandedSynergy(expandedSynergy === syn.id ? null : syn.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* All synergy reference */}
          <div className={styles.ppAllSynRef}>
            <div className={styles.ppAllSynRefTitle}>All Possible Pairings in This Protocol</div>
            <div className={styles.ppAllSynRefGrid}>
              {PROTOCOL_SYNERGIES.map(syn => (
                <div key={syn.id} className={styles.ppAllSynRefCard} style={{ borderLeftColor: syn.color }}>
                  <div className={styles.ppAllSynRefName} style={{ color: syn.color }}>{syn.title}</div>
                  <div className={styles.ppAllSynRefBoost}>{syn.boost}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── SCIENCE TAB ─── */}
      {activeTab === 'science' && (
        <div className={styles.ppSection}>

          {/* Fasting window */}
          <div className={styles.ppSciCard}>
            <div className={styles.ppSciCardHead}>
              <div className={styles.ppSciCardIcon}>◷</div>
              <div>
                <div className={styles.ppSciCardTitle}>Why the Eating Window Works</div>
                <div className={styles.ppSciCardSub}>The science behind 12-2 PM and 5-7 PM</div>
              </div>
            </div>
            <div className={styles.ppSciCardBody}>
              <p>Insulin sensitivity naturally drops in the evening. Eating late means consuming starches or sugars after 7 PM leads to prolonged blood sugar elevation that prevents the body from entering the metabolic recovery phase during sleep.</p>
              <p>The morning beverage window (before noon) is not deprivation. It is strategic. High-nutrient, zero-calorie or near-zero-calorie beverages like matcha, black tea, and turmeric spice tea support the fasting state while delivering antioxidants and metabolic support compounds without triggering insulin release.</p>
              <p>Opening the eating window at noon concentrates nutrients into the hours when insulin sensitivity peaks. Closing it by 7 PM gives your body 17 or more hours to clear glucose, reduce systemic inflammation, and support cellular repair processes.</p>
            </div>
          </div>

          {/* Staple foods */}
          <div className={styles.ppSciCard}>
            <div className={styles.ppSciCardHead}>
              <div className={styles.ppSciCardIcon}>◆</div>
              <div>
                <div className={styles.ppSciCardTitle}>Why These Staples</div>
                <div className={styles.ppSciCardSub}>The functional rationale behind the recurring ingredients</div>
              </div>
            </div>
            <div className={styles.ppSciStapleGrid}>
              {[
                { name: 'Callaloo', note: 'High in iron and indole-3-carbinol (I3C) for liver detoxification support. One of the most nutrient-dense leafy greens in Caribbean and African functional food traditions.' },
                { name: 'Green Banana', note: 'Among the highest-resistance-starch foods available. Unripe bananas contain RS2 resistant starch that acts as a true prebiotic, fermenting into butyrate in the colon.' },
                { name: 'Quinoa', note: 'One of the few plant foods with all 9 essential amino acids. High in magnesium, a cofactor in the enzyme that activates insulin receptors at the cellular level.' },
                { name: 'Wild Salmon', note: 'Omega-3 EPA and DHA directly improve cellular insulin receptor function. Also the primary activator of the Gut-Brain Axis and Anti-Inflammatory Trifecta synergies.' },
                { name: 'Turmeric + Black Pepper', note: 'Together they activate the Curcumin Activation synergy. Piperine inhibits the liver enzyme that clears curcumin, increasing its bioavailability by up to 2,000%.' },
                { name: 'Broccoli and Cabbage', note: 'Cruciferous vegetables convert glucosinolates to isothiocyanates in the gut, activating Nrf2, the master antioxidant regulatory switch. Pair with healthy fat for the Sulforaphane Unlock.' },
              ].map(({ name, note }) => (
                <div key={name} className={styles.ppStapleCard}>
                  <div className={styles.ppStapleName}>{name}</div>
                  <div className={styles.ppStapleNote}>{note}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Movement */}
          <div className={styles.ppSciCard}>
            <div className={styles.ppSciCardHead}>
              <div className={styles.ppSciCardIcon}>◎</div>
              <div>
                <div className={styles.ppSciCardTitle}>Movement Protocol</div>
                <div className={styles.ppSciCardSub}>Movement as a metabolic tool, not just exercise</div>
              </div>
            </div>
            <div className={styles.ppMovementGrid}>
              {[
                { label: 'Morning Cardio', desc: 'At least 30 minutes of walking or light cardio, 5 times per week. Morning movement in the fasted state prioritizes fat as fuel and clears residual glucose from the prior day.' },
                { label: 'Evening Walk', desc: 'A short walk after your second meal is one of the most effective tools for clearing post-meal glucose from the bloodstream. Even 10 to 15 minutes reduces glucose spikes by a clinically meaningful amount.' },
                { label: '15-Minute Post-Meal Rule', desc: 'Moving for at least 15 minutes after a heavy meal activates GLUT4 transporters in muscle tissue, pulling glucose out of the bloodstream independently of insulin.' },
                { label: 'Rebounding', desc: 'Gentle rebounding on a mini trampoline activates lymphatic flow, which does not have its own pump. 10 to 15 minutes daily. Low impact, high return for cellular detoxification support.' },
              ].map(({ label, desc }) => (
                <div key={label} className={styles.ppMovementCard}>
                  <div className={styles.ppMovementLabel}>{label}</div>
                  <div className={styles.ppMovementDesc}>{desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Educator supplement recommendations */}
          <div className={styles.ppSciCard}>
            <div className={styles.ppSciCardHead}>
              <div className={styles.ppSciCardIcon}>◈</div>
              <div>
                <div className={styles.ppSciCardTitle}>Educator Supplement Recommendations</div>
                <div className={styles.ppSciCardSub}>Educational context only. Consult your healthcare provider before starting any supplement.</div>
              </div>
            </div>
            <div className={styles.ppSuppGrid}>
              {[
                {
                  name: 'Blackseed Oil',
                  note: 'Thymoquinone, the primary active compound in blackseed oil, has demonstrated insulin-sensitizing effects in human trials, including reductions in fasting blood glucose and HbA1c.',
                  timing: 'Morning, 1 tsp',
                  url: 'https://amzn.to/4sFhOBs',
                },
                {
                  name: 'Serrapeptase',
                  note: 'A proteolytic enzyme derived from silkworm bacteria. Studied for its role in breaking down fibrin and supporting a healthy inflammatory response. Must be taken on an empty stomach to reach the bloodstream intact.',
                  timing: 'Morning on empty stomach',
                  url: 'https://amzn.to/4lmmREg',
                },
                {
                  name: 'Personal Rebounder',
                  note: 'Lymphatic activation tool. Used personally by Dr. Hunter as part of the daily movement protocol. This is the specific model recommended for home use.',
                  timing: '10-15 minutes daily',
                  url: 'https://amzn.to/3OQzZpb',
                },
              ].map(({ name, note, timing, url }) => (
                <div key={name} className={styles.ppSuppCard}>
                  <div className={styles.ppSuppCardTop}>
                    <div>
                      <div className={styles.ppSuppName}>{name}</div>
                      <div className={styles.ppSuppTiming}>{timing}</div>
                    </div>
                    <a href={url} target="_blank" rel="noopener noreferrer" className={styles.ppSuppLink}>
                      View <ExternalLink size={13} />
                    </a>
                  </div>
                  <div className={styles.ppSuppNote}>{note}</div>
                </div>
              ))}
            </div>
            <div className={styles.ppSuppDisclaimer}>
              These statements have not been evaluated by the FDA. Supplement information is educational only and is not intended to diagnose, treat, cure, or prevent any disease. Consult your physician before starting any new supplement.
            </div>
          </div>

        </div>
      )}

      {/* ─── GROCERY TAB ─── */}
      {activeTab === 'grocery' && (() => {
        const GROCERY_SLOTS = [
          { key: 'bev', label: 'Morning Beverage', recipeType: 'beverage' as MealSlotType },
          { key: 'm1',  label: 'Meal 1 (12-2 PM)', recipeType: 'meal1' as MealSlotType },
          { key: 'm2',  label: 'Meal 2 (2-5 PM)',  recipeType: 'meal2' as MealSlotType },
          { key: 'm3',  label: 'Meal 3 (5-7 PM)',  recipeType: 'meal2' as MealSlotType },
        ]
        return (
          <div className={styles.ppSection}>
            <div className={styles.ppGroceryTop}>
              <div>
                <div className={styles.ppGroceryTitle}>
                  <ShoppingCart size={16} color="var(--gold)" />
                  Weekly Meal Planner
                </div>
                <div className={styles.ppGroceryMeta}>
                  Pick meals for each day. Your shopping list builds below.
                </div>
              </div>
              <button className={styles.ppGroceryCopyBtn} onClick={copyGroceryList}>
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy list'}
              </button>
            </div>

            {DAY_NAMES_FULL.map((dayName, dayIndex) => (
              <div key={dayIndex} className={styles.ppGroceryDayCard}>
                <div className={styles.ppGroceryDayHead}>{dayName}</div>
                <div className={styles.ppGroceryDaySlots}>
                  {GROCERY_SLOTS.map(({ key, label, recipeType }) => {
                    const planKey = `${dayIndex}-${key}`
                    const id = groceryPlan[planKey]
                    const recipe = id ? recipeById(id) : undefined
                    return (
                      <div key={key} className={styles.ppGroceryDaySlot}>
                        <div className={styles.ppGrocerySlotLabel}>{label}</div>
                        {recipe ? (
                          <div className={styles.ppGrocerySlotFilled}>
                            <span className={styles.ppGrocerySlotName}>{recipe.name}</span>
                            <span className={styles.ppGrocerySlotCal}>{recipe.calories} cal</span>
                            <button className={styles.ppGrocerySlotRemove} onClick={() => removeGroceryMeal(dayIndex, key)}>
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <button
                            className={styles.ppGrocerySlotEmpty}
                            onClick={() => setGroceryPickerSlot({ dayIndex, slotKey: key, recipeType })}
                          >
                            <Plus size={13} /> Add
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}

            <div className={styles.ppGroceryExtras}>
              <div className={styles.ppGroceryExtrasTitle}>Extra Items</div>
              <form className={styles.ppGroceryExtraForm} onSubmit={addCustomGrocery}>
                <input
                  type="text"
                  className={styles.ppGroceryExtraInput}
                  value={customInput}
                  onChange={e => setCustomInput(e.target.value)}
                  placeholder="Saratoga Water, Blackseed Oil..."
                />
                <button type="submit" className={styles.ppGroceryExtraBtn}>Add</button>
              </form>
            </div>

            <div className={styles.ppGroceryListSection}>
              <div className={styles.ppGroceryListHead}>
                <ShoppingCart size={15} color="var(--gold)" />
                <span>Complete Shopping List</span>
                <span className={styles.ppGroceryListCount}>{groceryTotalCount} items</span>
                {groceryTotalCount > 0 && (
                  <span className={styles.ppGroceryCheckedCount}>{checkedItems.size} checked</span>
                )}
              </div>

              {groceryTotalCount === 0 ? (
                <div className={styles.ppGroceryEmpty}>
                  <ShoppingCart size={28} color="var(--text-secondary)" />
                  <p>Assign meals above to generate your shopping list.</p>
                </div>
              ) : (
                <>
                  {CATEGORY_ORDER.filter(cat => groceryListByCategory[cat]?.length > 0).map(cat => (
                    <div key={cat} className={styles.ppGroceryCat}>
                      <div className={styles.ppGroceryCatHead}>
                        {cat}
                        <span className={styles.ppGroceryCatCount}>
                          {groceryListByCategory[cat].filter(i => checkedItems.has(i)).length}/{groceryListByCategory[cat].length}
                        </span>
                      </div>
                      <div className={styles.ppGroceryItems}>
                        {groceryListByCategory[cat].map(ing => (
                          <label key={ing} className={checkedItems.has(ing) ? styles.ppGroceryItemDone : styles.ppGroceryItem}>
                            <input type="checkbox" className={styles.ppGroceryCheck} checked={checkedItems.has(ing)} onChange={() => toggleCheck(ing)} />
                            <span className={styles.ppGroceryIngText}>{ing}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}

                  {customGroceries.length > 0 && (
                    <div className={styles.ppGroceryCat}>
                      <div className={styles.ppGroceryCatHead}>
                        Extra Items
                        <span className={styles.ppGroceryCatCount}>{customGroceries.filter(i => checkedItems.has(i)).length}/{customGroceries.length}</span>
                      </div>
                      <div className={styles.ppGroceryItems}>
                        {customGroceries.map((item, idx) => (
                          <div key={idx} className={styles.ppGroceryCustomRow}>
                            <label className={checkedItems.has(item) ? styles.ppGroceryItemDone : styles.ppGroceryItem}>
                              <input type="checkbox" className={styles.ppGroceryCheck} checked={checkedItems.has(item)} onChange={() => toggleCheck(item)} />
                              <span className={styles.ppGroceryIngText}>{item}</span>
                            </label>
                            <button className={styles.ppGroceryRemoveCustom} onClick={() => setCustomGroceries(prev => prev.filter((_, i) => i !== idx))}>
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )
      })()}

      {/* ─── GROCERY PICKER MODAL ─── */}
      {groceryPickerSlot && (
        <div className={styles.ppModalOverlay} onClick={() => setGroceryPickerSlot(null)}>
          <div className={styles.ppModal} onClick={e => e.stopPropagation()}>
            <div className={styles.ppModalHeader}>
              <div>
                <div className={styles.ppModalLabel}>{DAY_NAMES_FULL[groceryPickerSlot.dayIndex]}</div>
                <div className={styles.ppModalTitle}>Select {groceryPickerSlot.slotKey === 'bev' ? 'Morning Beverage' : groceryPickerSlot.slotKey === 'm1' ? 'Meal 1' : groceryPickerSlot.slotKey === 'm2' ? 'Meal 2' : 'Meal 3'}</div>
              </div>
              <button className={styles.ppModalClose} onClick={() => setGroceryPickerSlot(null)}><X size={22} /></button>
            </div>
            <div className={styles.ppModalList}>
              {groceryCandidates.map(r => {
                const current = groceryPlan[`${groceryPickerSlot.dayIndex}-${groceryPickerSlot.slotKey}`] === r.id
                return (
                  <button
                    key={r.id}
                    className={current ? styles.ppModalItemActive : styles.ppModalItem}
                    onClick={() => setGroceryMeal(groceryPickerSlot.dayIndex, groceryPickerSlot.slotKey, r.id)}
                  >
                    <div className={styles.ppModalItemName}>{r.name}</div>
                    <div className={styles.ppModalItemMeta}>{r.calories} cal</div>
                    <div className={styles.ppModalItemNote}>{r.educationalNote.slice(0, 80)}...</div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─── MEAL PICKER MODAL ─── */}
      {modalSlot && (
        <div className={styles.ppModalOverlay} onClick={() => setModalSlot(null)}>
          <div className={styles.ppModal} onClick={e => e.stopPropagation()}>
            <div className={styles.ppModalHeader}>
              <div>
                <div className={styles.ppModalLabel}>Day {modalSlot.day}</div>
                <div className={styles.ppModalTitle}>Select {SLOT_LABELS[modalSlot.slot]}</div>
              </div>
              <button className={styles.ppModalClose} onClick={() => setModalSlot(null)}><X size={22} /></button>
            </div>
            <div className={styles.ppModalList}>
              {modalCandidates.map(r => {
                const current = getPlanRecipe(modalSlot.day, modalSlot.slot)?.id === r.id
                return (
                  <button
                    key={r.id}
                    className={current ? styles.ppModalItemActive : styles.ppModalItem}
                    onClick={() => { setOverride(modalSlot.day, modalSlot.slot, r.id); setModalSlot(null) }}
                  >
                    <div className={styles.ppModalItemName}>{r.name}</div>
                    <div className={styles.ppModalItemMeta}>{r.calories} cal · {r.synergyTags.length} compound{r.synergyTags.length !== 1 ? 's' : ''}</div>
                    <div className={styles.ppModalItemNote}>{r.educationalNote.slice(0, 80)}...</div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─── RECIPE DETAIL MODAL ─── */}
      {expandedRecipe && (
        <div className={styles.ppModalOverlay} onClick={() => setExpandedRecipe(null)}>
          <div className={styles.ppRecipeModal} onClick={e => e.stopPropagation()}>
            <div className={styles.ppRecipeModalHeader}>
              <div>
                <div className={styles.ppRecipeModalLabel}>{SLOT_LABELS[expandedRecipe.type]} · {expandedRecipe.calories} cal · {expandedRecipe.servings} serving{expandedRecipe.servings > 1 ? 's' : ''}</div>
                <h2 className={styles.ppRecipeModalTitle}>{expandedRecipe.name}</h2>
              </div>
              <button className={styles.ppModalClose} onClick={() => setExpandedRecipe(null)}><X size={22} /></button>
            </div>
            <div className={styles.ppRecipeBody}>
              <div>
                <div className={styles.ppRecipeSection}>Ingredients</div>
                <ul className={styles.ppIngredientList}>
                  {expandedRecipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
                </ul>
              </div>
              <div>
                <div className={styles.ppRecipeSection}>Steps</div>
                <ol className={styles.ppStepList}>
                  {expandedRecipe.steps.map((step, i) => <li key={i}>{step}</li>)}
                </ol>
              </div>
              <div className={styles.ppRecipeNote}>
                <BookOpen size={14} color="var(--gold)" />
                <p>{expandedRecipe.educationalNote}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <p className={styles.recipeDisclaimer}>
        This protocol is for educational purposes only. Not medical advice. Always consult your physician before changing your diet, exercise routine, or supplement regimen. Dr. Shallanda Hunter, CFNMP, PharmD, MBA is a Certified Functional Nutritional Medicine Practitioner providing health education.
      </p>
    </div>
  )
}
