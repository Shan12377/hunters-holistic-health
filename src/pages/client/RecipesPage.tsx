import { useState, useMemo, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  BookOpen, Zap, TrendingUp, ChevronDown, ChevronUp, ArrowRight,
  Flame, Send, Loader2, Info, CheckCircle2, AlertTriangle, BadgeCheck,
} from 'lucide-react'
import { RECIPES, SYNERGIES, type Recipe, type RootsPhase } from '@/data/recipes'
import { TRENDING_MEALS, PLATFORM_LABELS, PLATFORM_COLORS, getTrendScore, type TrendingMeal } from '@/data/trendingMeals'
import PlanGate from '@/components/ui/PlanGate'
import { useAuthStore } from '@/store/authStore'
import { authHeaders } from '@/lib/authHeaders'
import BackButton from '@/components/BackButton'
import styles from './Client.module.css'

// ─── Types ────────────────────────────────────────────────────────────────────

type RecipeTab = 'browse' | 'trending' | 'build'

type Restriction =
  | 'dairy_free' | 'gluten_free' | 'soy_free' | 'nut_free'
  | 'shellfish_free' | 'nightshade_free' | 'vegan' | 'vegetarian' | 'pescatarian'

interface Ingredient {
  name: string
  amountGrams: number
  displayAmount: string
  gmoFlag?: boolean
  nutrients?: { protein: number; carbs: number; fat: number } | null
  matchedName?: string
}

interface RecipeResult {
  recipe: {
    recipeName: string
    description: string
    instructions: string[]
    nutritionScore: number
    ingredients: Ingredient[]
  }
  totals: {
    protein: number
    carbs: number
    fat: number
    zinc: number
    iron: number
    vitaminD: number
    vitaminB12: number
    usdaVerified: boolean
  }
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const PHASE_ORDER: RootsPhase[] = ['Review', 'Optimize', 'Transform', 'Sustain']

const PHASE_COLORS: Record<RootsPhase, string> = {
  Review: '#0b9e8e',
  Optimize: '#c8a74b',
  Transform: '#9b59b6',
  Sustain: '#4be08a',
}

const RESTRICTION_OPTIONS: Array<{ id: Restriction; label: string }> = [
  { id: 'gluten_free',     label: 'Gluten-Free' },
  { id: 'dairy_free',      label: 'Dairy-Free' },
  { id: 'soy_free',        label: 'Soy-Free' },
  { id: 'nut_free',        label: 'Nut-Free' },
  { id: 'shellfish_free',  label: 'Shellfish-Free' },
  { id: 'nightshade_free', label: 'Nightshade-Free' },
  { id: 'vegan',           label: 'Vegan' },
  { id: 'vegetarian',      label: 'Vegetarian' },
  { id: 'pescatarian',     label: 'Pescatarian' },
]

function getAllTags(): string[] {
  const seen = new Set<string>()
  RECIPES.forEach(r => r.tags.forEach(t => seen.add(t)))
  return Array.from(seen).sort()
}

const ALL_TAGS = getAllTags()

// ─── Trending sub-components ──────────────────────────────────────────────────

function HeatBar({ score }: { score: number }) {
  const color = score >= 93 ? '#ef4444' : score >= 87 ? '#f97316' : '#f59e0b'
  return (
    <div className={styles.tmHeatBar}>
      <div className={styles.tmHeatTrack}>
        <div className={styles.tmHeatFill} style={{ width: `${score}%`, background: color }} />
      </div>
      <span className={styles.tmHeatScore} style={{ color }}>{score}</span>
    </div>
  )
}

function MealCard({ meal, onFork }: { meal: TrendingMeal; onFork: (name: string) => void }) {
  const [expanded, setExpanded] = useState(false)
  const trendScore = getTrendScore(meal)
  return (
    <div className={styles.tmCard}>
      <div className={styles.tmCardTop}>
        <div className={styles.tmCardTitleRow}>
          <h4 className={styles.tmCardName}>{meal.name}</h4>
          <span className={styles.tmProtocolBadge}><Zap size={11} /> Protocol Fit</span>
        </div>
        <div className={styles.tmSources}>
          {meal.sources.map(src => (
            <span
              key={src.platform}
              className={styles.tmSource}
              style={{ background: PLATFORM_COLORS[src.platform] + '18', color: PLATFORM_COLORS[src.platform] }}
            >
              {PLATFORM_LABELS[src.platform]} · {src.community}
            </span>
          ))}
        </div>
        <HeatBar score={trendScore} />
      </div>
      <div className={styles.tmCardMeta}>
        <div className={styles.tmSlots}>
          {meal.mealSlots.map(s => (
            <span key={s} className={styles.tmSlot}>{s.charAt(0).toUpperCase() + s.slice(1)}</span>
          ))}
        </div>
        <div className={styles.tmMacros}>
          <span className={styles.tmProtein}>{meal.proteinGrams}g P</span>
          <span className={styles.tmCal}>{meal.calories} cal</span>
        </div>
      </div>
      <p className={styles.tmDesc}>{meal.description}</p>
      <div className={styles.tmIngredients}>
        {meal.keyIngredients.map(ing => (
          <span key={ing} className={styles.tmIngChip}>{ing}</span>
        ))}
      </div>
      <button className={styles.tmWhyBtn} onClick={() => setExpanded(e => !e)}>
        <span className={styles.tmWhyLabel}><Zap size={12} color="var(--gold)" /> Why It Works</span>
        {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>
      {expanded && (
        <div className={styles.tmWhyBody}>
          <p className={styles.tmWhyText}>{meal.whyItWorks}</p>
          {meal.quickSwap && (
            <div className={styles.tmSwap}><ArrowRight size={12} /><span>{meal.quickSwap}</span></div>
          )}
        </div>
      )}
      <div className={styles.tmForkRow}>
        <button className={styles.tmForkBtn} onClick={() => onFork(meal.name)}>
          Build This in Recipe Builder
        </button>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function RecipesPage() {
  const [searchParams] = useSearchParams()
  const { profile } = useAuthStore()

  // Tab
  const [activeTab, setActiveTab] = useState<RecipeTab>('browse')

  // Browse state
  const [selectedPhase, setSelectedPhase] = useState<string | null>(searchParams.get('phase'))
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const expandedRef = useRef<HTMLDivElement>(null)

  // Trending state
  const [showAllTrending, setShowAllTrending] = useState(false)

  // Build state
  const userGoal = profile?.wellness_goals?.primary_goal ?? ''
  const dietaryStyle = profile?.wellness_goals?.dietary_preference ?? ''
  const [buildPrompt, setBuildPrompt] = useState('')
  const [restrictions, setRestrictions] = useState<Restriction[]>([])
  const [buildLoading, setBuildLoading] = useState(false)
  const [buildResult, setBuildResult] = useState<RecipeResult | null>(null)
  const [buildError, setBuildError] = useState<string | null>(null)

  useEffect(() => {
    const phase = searchParams.get('phase')
    if (phase) setSelectedPhase(phase)
    const pre = searchParams.get('prompt')
    if (pre) { setBuildPrompt(decodeURIComponent(pre)); setActiveTab('build') }
  }, [searchParams])

  useEffect(() => {
    if (selectedRecipe && expandedRef.current) {
      expandedRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [selectedRecipe])

  // Browse helpers
  const filtered = useMemo(() => RECIPES.filter(r => {
    if (selectedPhase && r.rootsPhase !== selectedPhase) return false
    if (selectedTag && !r.tags.includes(selectedTag)) return false
    return true
  }), [selectedPhase, selectedTag])

  function togglePhase(phase: string) { setSelectedPhase(p => p === phase ? null : phase); setSelectedRecipe(null) }
  function toggleTag(tag: string) { setSelectedTag(t => t === tag ? null : tag); setSelectedRecipe(null) }
  function selectRecipe(recipe: Recipe) { setSelectedRecipe(r => r?.id === recipe.id ? null : recipe) }

  // Trending helpers
  const sortedTrending = useMemo(() => [...TRENDING_MEALS].sort((a, b) => getTrendScore(b) - getTrendScore(a)), [])
  const visibleTrending = showAllTrending ? sortedTrending : sortedTrending.slice(0, 6)

  function handleFork(mealName: string) {
    setBuildPrompt('Fork and optimize: ' + mealName)
    setActiveTab('build')
    setBuildResult(null)
    setBuildError(null)
  }

  // Build helpers
  function toggleRestriction(id: Restriction) {
    setRestrictions(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id])
  }

  async function handleBuildSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!buildPrompt.trim()) return
    setBuildLoading(true)
    setBuildError(null)
    setBuildResult(null)
    try {
      const res = await fetch('/api/recipe-builder', {
        method: 'POST',
        headers: await authHeaders(),
        body: JSON.stringify({ prompt: buildPrompt.trim(), restrictions, userGoal, dietaryStyle }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error((err as { error?: string }).error || 'Failed to build recipe')
      }
      setBuildResult(await res.json())
    } catch (err) {
      setBuildError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setBuildLoading(false)
    }
  }

  const buildCalories = buildResult
    ? buildResult.totals.protein * 4 + buildResult.totals.carbs * 4 + buildResult.totals.fat * 9
    : 0

  return (
    <div className="animate-fade-in">
      <BackButton />
      <div className={styles.pageTop}>
        <h1 className={styles.pageTopTitle}>
          <BookOpen size={22} color="var(--gold)" /> Recipes
        </h1>
        <p className={styles.pageTopDate}>
          Browse whole-food recipes, discover what is trending, or build a custom recipe with AI.
        </p>
      </div>

      {/* Tab bar */}
      <div className={styles.ppTabs}>
        {(['browse', 'trending', 'build'] as RecipeTab[]).map(tab => (
          <button
            key={tab}
            className={activeTab === tab ? styles.ppTabActive : styles.ppTab}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'browse' ? 'Browse Recipes' : tab === 'trending' ? 'Trending' : 'Build a Recipe'}
          </button>
        ))}
      </div>

      {/* ─── BROWSE TAB ─── */}
      {activeTab === 'browse' && (
        <>
          <div className={styles.recipeFilters}>
            <div className={styles.recipeFilterGroup}>
              <span className={styles.recipeFilterLabel}>Filter by ROOTS phase</span>
              <div className={styles.recipeFilterPills}>
                {PHASE_ORDER.map(phase => {
                  const active = selectedPhase === phase
                  const color = PHASE_COLORS[phase]
                  return (
                    <button
                      key={phase}
                      className={active ? styles.recipePillPhaseActive : styles.recipePill}
                      style={active ? { background: `${color}22`, borderColor: color, color } : undefined}
                      onClick={() => togglePhase(phase)}
                    >
                      {phase}
                    </button>
                  )
                })}
              </div>
            </div>
            <div className={styles.recipeFilterGroup}>
              <span className={styles.recipeFilterLabel}>Filter by tag</span>
              <div className={styles.recipeFilterPills}>
                {ALL_TAGS.map(tag => (
                  <button
                    key={tag}
                    className={selectedTag === tag ? styles.recipePillTagActive : styles.recipePill}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            {(selectedPhase || selectedTag) && (
              <button
                className={styles.recipeClearBtn}
                onClick={() => { setSelectedPhase(null); setSelectedTag(null); setSelectedRecipe(null) }}
              >
                Clear all filters
              </button>
            )}
          </div>

          {selectedRecipe && (
            <div className={styles.recipeExpanded} ref={expandedRef}>
              <div className={styles.recipeExpandedHeader}>
                <div className={styles.recipeExpandedMeta}>
                  <span
                    className={styles.recipeExpandedPhase}
                    style={{ color: PHASE_COLORS[selectedRecipe.rootsPhase], background: `${PHASE_COLORS[selectedRecipe.rootsPhase]}1a` }}
                  >
                    {selectedRecipe.rootsPhase}
                  </span>
                  <h2 className={styles.recipeExpandedTitle}>{selectedRecipe.name}</h2>
                  <div className={styles.recipeTags}>
                    {selectedRecipe.tags.map(tag => <span key={tag} className={styles.recipeTag}>{tag}</span>)}
                  </div>
                </div>
                <button className={styles.recipeCloseBtn} onClick={() => setSelectedRecipe(null)}>Close</button>
              </div>
              <div className={styles.recipeNote} style={{ borderLeftColor: PHASE_COLORS[selectedRecipe.rootsPhase] }}>
                <strong>ROOTS {selectedRecipe.rootsPhase} phase:</strong>{' '}{selectedRecipe.educationalNote}
              </div>
              <div className={styles.recipeMacroRow}>
                <div className={styles.recipeMacro}><span className={styles.recipeMacroVal}>{selectedRecipe.calories}</span><span className={styles.recipeMacroLabel}>cal</span></div>
                <div className={styles.recipeMacro}><span className={styles.recipeMacroVal}>{selectedRecipe.proteinGrams}g</span><span className={styles.recipeMacroLabel}>protein</span></div>
                <div className={styles.recipeMacro}><span className={styles.recipeMacroVal}>{selectedRecipe.fatGrams}g</span><span className={styles.recipeMacroLabel}>fat</span></div>
                <div className={styles.recipeMacro}><span className={styles.recipeMacroVal}>{selectedRecipe.carbGrams}g</span><span className={styles.recipeMacroLabel}>carbs</span></div>
              </div>
              <div className={styles.recipeExpandedBody}>
                <div>
                  <h3 className={styles.recipeExpandedSection}>Ingredients</h3>
                  <ul className={styles.recipeIngredients}>
                    {selectedRecipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
                  </ul>
                </div>
                <div>
                  <h3 className={styles.recipeExpandedSection}>Steps</h3>
                  <ol className={styles.recipeSteps}>
                    {selectedRecipe.steps.map((step, i) => <li key={i}>{step}</li>)}
                  </ol>
                </div>
              </div>
              {selectedRecipe.quickSwap && (
                <div className={styles.recipeQuickSwap}>
                  <span className={styles.recipeQuickSwapLabel}>Quick Swap</span>
                  {selectedRecipe.quickSwap}
                </div>
              )}
              {selectedRecipe.synergyIds && selectedRecipe.synergyIds.length > 0 && (
                <div className={styles.vitaplatePairings}>
                  <div className={styles.vitaplatePairingsHead}><Zap size={15} color="var(--gold)" /><span>VitaPlate AI: Active Pairings</span></div>
                  <div className={styles.vitaplatePairingsList}>
                    {SYNERGIES.filter(s => selectedRecipe.synergyIds!.includes(s.id)).map(s => (
                      <div key={s.id} className={styles.vitaplatePairingCard} style={{ borderLeftColor: s.color }}>
                        <div className={styles.vitaplatePairingTitle} style={{ color: s.color }}>{s.title}</div>
                        <div className={styles.vitaplatePairingFoods}>{s.foods}</div>
                        <div className={styles.vitaplatePairingBoost}>{s.boost}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {filtered.length > 0 ? (
            <div className={styles.recipeGrid}>
              {filtered.map(recipe => {
                const color = PHASE_COLORS[recipe.rootsPhase]
                const isSelected = selectedRecipe?.id === recipe.id
                return (
                  <button
                    key={recipe.id}
                    className={`${styles.recipeCard}${isSelected ? ` ${styles.recipeCardSelected}` : ''}`}
                    onClick={() => selectRecipe(recipe)}
                  >
                    <span className={styles.recipeCardPhase} style={{ color, background: `${color}1a` }}>{recipe.rootsPhase}</span>
                    <div className={styles.recipeCardTitle}>{recipe.name}</div>
                    {recipe.synergyIds && recipe.synergyIds.length > 0 && (
                      <div className={styles.recipeSynergyBadge}>
                        <Zap size={11} />{recipe.synergyIds.length} active {recipe.synergyIds.length === 1 ? 'pairing' : 'pairings'}
                      </div>
                    )}
                    <div className={styles.recipeTags}>
                      {recipe.tags.slice(0, 3).map(tag => <span key={tag} className={styles.recipeTag}>{tag}</span>)}
                    </div>
                    <span className={styles.recipeCardCta}>{isSelected ? 'Close' : 'View recipe'}</span>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className={styles.recipeEmpty}>
              <p className={styles.recipeEmptyText}>No recipes match your current filters.</p>
              <button className={styles.recipeClearBtn} onClick={() => { setSelectedPhase(null); setSelectedTag(null) }}>Clear filters</button>
            </div>
          )}

          <div className={styles.synergiesSection}>
            <div className={styles.synergiesHeader}>
              <Zap size={18} color="var(--gold)" />
              <h2 className={styles.synergiesTitle}>VitaPlate AI: Food Synergies</h2>
            </div>
            <p className={styles.synergiesSub}>Pairs where eating both together measurably improves absorption or potency.</p>
            <div className={styles.synergiesGrid}>
              {SYNERGIES.map(syn => (
                <div key={syn.id} className={styles.synergyCard} style={{ borderLeftColor: syn.color }}>
                  <div className={styles.synergyTitle}>{syn.title}</div>
                  <div className={styles.synergyFoods} style={{ color: syn.color }}>{syn.foods}</div>
                  <div className={styles.synergyBoost}>{syn.boost}</div>
                  <div className={styles.synergyMechanism}>{syn.mechanism}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ─── TRENDING TAB ─── */}
      {activeTab === 'trending' && (
        <>
          <div className={styles.tmLegend}>
            <span className={styles.tmLegendLabel}>Trend Score:</span>
            <span className={styles.tmLegendItem}><span className={styles.tmDot} style={{ background: '#ef4444' }} /> 93+ Viral</span>
            <span className={styles.tmLegendItem}><span className={styles.tmDot} style={{ background: '#f97316' }} /> 87+ Hot</span>
            <span className={styles.tmLegendItem}><span className={styles.tmDot} style={{ background: '#f59e0b' }} /> Rising</span>
          </div>
          <div className={styles.tmGrid}>
            {visibleTrending.map(meal => (
              <MealCard key={meal.id} meal={meal} onFork={handleFork} />
            ))}
          </div>
          {sortedTrending.length > 6 && (
            <button className={styles.tmShowAllBtn} onClick={() => setShowAllTrending(s => !s)}>
              {showAllTrending ? 'Show Less' : `Show All ${sortedTrending.length} Trending Meals`}
            </button>
          )}
        </>
      )}

      {/* ─── BUILD TAB ─── */}
      {activeTab === 'build' && (
        <PlanGate requiredPlan="program" label="The Smart Recipe Builder is available on The Program and above.">
          <div className={styles.srbCard}>
            <div className={styles.srbHeader}>
              <div>
                <div className={styles.srbTitle}>Build a Recipe</div>
                <div className={styles.srbSub}>Describe a meal, a cultural dish, or something you want to healthify. AI does the rest.</div>
              </div>
              <div className={styles.srbBadge}>
                <BadgeCheck size={15} color="var(--teal)" />
                <div>
                  <div className={styles.srbBadgeTitle}>USDA Verified</div>
                  <div className={styles.srbBadgeSub}>FoodData Central</div>
                </div>
              </div>
            </div>
            <div className={styles.srbDisclaimer}>
              <Info size={14} />
              <span>AI-generated recipes are educational suggestions. Always verify ingredients against your dietary needs and consult your healthcare provider before making changes to your nutrition plan.</span>
            </div>
            <div className={styles.srbRestrictionsLabel}>Dietary restrictions (optional):</div>
            <div className={styles.srbRestrictions}>
              {RESTRICTION_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  className={restrictions.includes(opt.id) ? styles.srbRestrictionActive : styles.srbRestriction}
                  onClick={() => toggleRestriction(opt.id)}
                  type="button"
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <form onSubmit={handleBuildSubmit} className={styles.srbForm}>
              <div className={styles.srbTextareaWrap}>
                <textarea
                  className={styles.srbTextarea}
                  value={buildPrompt}
                  onChange={e => setBuildPrompt(e.target.value)}
                  placeholder='e.g., "A hearty Caribbean jerk chicken bowl with plantains" or "Fork and optimize: Dense Bean Salad for blood pressure support"'
                  rows={4}
                />
                <button type="submit" className={styles.srbSubmitBtn} disabled={buildLoading || !buildPrompt.trim()}>
                  {buildLoading ? <Loader2 size={18} className={styles.srbSpinner} /> : <Send size={18} />}
                </button>
              </div>
            </form>
          </div>

          {buildError && (
            <div className={styles.srbError}><Info size={16} /><span>{buildError}</span></div>
          )}
          {buildLoading && (
            <div className={styles.srbLoadingState}>
              <Loader2 size={32} className={styles.srbSpinner} />
              <p>Building your recipe and fetching nutrition data...</p>
            </div>
          )}

          {buildResult && (
            <div className={styles.srbResult}>
              <div className={styles.srbResultHero}>
                <div className={styles.srbResultHeroInfo}>
                  <h2 className={styles.srbResultName}>{buildResult.recipe.recipeName}</h2>
                  <p className={styles.srbResultDesc}>{buildResult.recipe.description}</p>
                </div>
                <div className={styles.srbScoreBox}>
                  <div className={styles.srbScoreNum}>{buildResult.recipe.nutritionScore}</div>
                  <div className={styles.srbScoreLabel}>Nutrition Score</div>
                </div>
              </div>
              <div className={styles.srbResultCols}>
                <div className={styles.srbResultLeft}>
                  <div className={styles.srbResultSection}>
                    <h3 className={styles.srbResultSectionHead}><CheckCircle2 size={16} color="var(--teal)" /> Ingredients</h3>
                    <ul className={styles.srbIngList}>
                      {buildResult.recipe.ingredients.map((ing, i) => (
                        <li key={i} className={styles.srbIngItem}>
                          <div className={styles.srbIngRow}>
                            <span className={styles.srbIngName}>{ing.name}</span>
                            <span className={styles.srbIngAmount}>{ing.displayAmount}</span>
                          </div>
                          {ing.gmoFlag && (
                            <div className={styles.srbGmoFlag}>
                              <AlertTriangle size={11} />
                              Commonly GMO. Consider certified non-GMO or organic.
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className={styles.srbResultSection}>
                    <h3 className={styles.srbResultSectionHead}><Flame size={16} color="var(--gold)" /> Instructions</h3>
                    <ol className={styles.srbStepList}>
                      {buildResult.recipe.instructions.map((step, i) => (
                        <li key={i} className={styles.srbStep}>
                          <span className={styles.srbStepNum}>{i + 1}</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
                <div className={styles.srbNutritionLabel}>
                  <div className={styles.srbNLTitle}>Nutrition Facts</div>
                  <div className={styles.srbNLServing}>1 serving per recipe</div>
                  <div className={styles.srbNLCalRow}>
                    <div><div className={styles.srbNLCalLabel}>Amount per serving</div><div className={styles.srbNLCalWord}>Calories</div></div>
                    <div className={styles.srbNLCalNum}>{buildCalories}</div>
                  </div>
                  <div className={styles.srbNLDvLabel}>% Daily Value*</div>
                  <div className={styles.srbNLMacros}>
                    <div className={styles.srbNLRow}><span>Total Fat</span><span>{buildResult.totals.fat}g</span></div>
                    <div className={styles.srbNLRow}><span>Total Carbohydrate</span><span>{buildResult.totals.carbs}g</span></div>
                    <div className={styles.srbNLRow}><span>Protein</span><span>{buildResult.totals.protein}g</span></div>
                  </div>
                  <div className={styles.srbNLMicros}>
                    <div className={styles.srbNLRow}><span>Vitamin D</span><span>{buildResult.totals.vitaminD}mcg</span></div>
                    <div className={styles.srbNLRow}><span>Iron</span><span>{buildResult.totals.iron}mg</span></div>
                    <div className={styles.srbNLRow}><span>Zinc</span><span>{buildResult.totals.zinc}mg</span></div>
                    <div className={styles.srbNLRow}><span>Vitamin B12</span><span>{buildResult.totals.vitaminB12}mcg</span></div>
                  </div>
                  <p className={styles.srbNLFooter}>
                    {buildResult.totals.usdaVerified
                      ? 'Nutritional data powered by USDA FoodData Central.'
                      : 'Nutritional data is estimated. Add USDA_API_KEY for verified values.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </PlanGate>
      )}

      <p className={styles.recipeDisclaimer}>
        Recipe content is for educational purposes only and does not constitute dietary advice.
        For personalized nutrition care, consult a registered dietitian.
      </p>
    </div>
  )
}
