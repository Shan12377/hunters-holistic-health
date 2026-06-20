import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Flame, Send, Loader2, Info, CheckCircle2, AlertTriangle, BadgeCheck } from 'lucide-react'
import styles from './Client.module.css'

type Restriction =
  | 'dairy_free' | 'gluten_free' | 'soy_free' | 'nut_free'
  | 'shellfish_free' | 'nightshade_free' | 'vegan' | 'vegetarian' | 'pescatarian'

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

export default function SmartRecipeBuilderPage() {
  const [searchParams] = useSearchParams()
  const [prompt, setPrompt] = useState('')
  const [restrictions, setRestrictions] = useState<Restriction[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<RecipeResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const pre = searchParams.get('prompt')
    if (pre) setPrompt(decodeURIComponent(pre))
  }, [searchParams])

  function toggleRestriction(id: Restriction) {
    setRestrictions(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!prompt.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/recipe-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim(), restrictions }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to build recipe')
      }
      setResult(await res.json())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const calories = result
    ? result.totals.protein * 4 + result.totals.carbs * 4 + result.totals.fat * 9
    : 0

  return (
    <div className="animate-fade-in">
      <div className={styles.pageTop}>
        <h1 className={styles.pageTopTitle}>
          <Flame size={22} color="var(--gold)" /> Smart Recipe Builder
        </h1>
        <p className={styles.pageTopDate}>
          Describe any recipe or meal idea. VitaPlate AI optimizes it for whole-food nutrition and fetches verified macro data.
        </p>
      </div>

      {/* Builder form */}
      <div className={styles.srbCard}>
        <div className={styles.srbHeader}>
          <div>
            <div className={styles.srbTitle}>Build a Recipe</div>
            <div className={styles.srbSub}>
              Describe a meal, a cultural dish, or something you want to healthify. AI does the rest.
            </div>
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
          <span>
            AI-generated recipes are educational suggestions. Always verify ingredients against your dietary needs and consult your healthcare provider before making changes to your nutrition plan.
          </span>
        </div>

        {/* Restrictions */}
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

        <form onSubmit={handleSubmit} className={styles.srbForm}>
          <div className={styles.srbTextareaWrap}>
            <textarea
              className={styles.srbTextarea}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder='e.g., "A hearty Caribbean jerk chicken bowl with plantains" or "Fork and optimize: Dense Bean Salad for blood pressure support"'
              rows={4}
            />
            <button
              type="submit"
              className={styles.srbSubmitBtn}
              disabled={loading || !prompt.trim()}
            >
              {loading ? <Loader2 size={18} className={styles.srbSpinner} /> : <Send size={18} />}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className={styles.srbError}>
          <Info size={16} />
          <span>{error}</span>
        </div>
      )}

      {loading && (
        <div className={styles.srbLoadingState}>
          <Loader2 size={32} className={styles.srbSpinner} />
          <p>Building your recipe and fetching nutrition data...</p>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className={styles.srbResult}>
          {/* Hero */}
          <div className={styles.srbResultHero}>
            <div className={styles.srbResultHeroInfo}>
              <h2 className={styles.srbResultName}>{result.recipe.recipeName}</h2>
              <p className={styles.srbResultDesc}>{result.recipe.description}</p>
            </div>
            <div className={styles.srbScoreBox}>
              <div className={styles.srbScoreNum}>{result.recipe.nutritionScore}</div>
              <div className={styles.srbScoreLabel}>Nutrition Score</div>
            </div>
          </div>

          <div className={styles.srbResultCols}>
            {/* Left: ingredients + instructions */}
            <div className={styles.srbResultLeft}>
              <div className={styles.srbResultSection}>
                <h3 className={styles.srbResultSectionHead}>
                  <CheckCircle2 size={16} color="var(--teal)" /> Ingredients
                </h3>
                <ul className={styles.srbIngList}>
                  {result.recipe.ingredients.map((ing, i) => (
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
                <h3 className={styles.srbResultSectionHead}>
                  <Flame size={16} color="var(--gold)" /> Instructions
                </h3>
                <ol className={styles.srbStepList}>
                  {result.recipe.instructions.map((step, i) => (
                    <li key={i} className={styles.srbStep}>
                      <span className={styles.srbStepNum}>{i + 1}</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Right: nutrition label */}
            <div className={styles.srbNutritionLabel}>
              <div className={styles.srbNLTitle}>Nutrition Facts</div>
              <div className={styles.srbNLServing}>1 serving per recipe</div>
              <div className={styles.srbNLCalRow}>
                <div>
                  <div className={styles.srbNLCalLabel}>Amount per serving</div>
                  <div className={styles.srbNLCalWord}>Calories</div>
                </div>
                <div className={styles.srbNLCalNum}>{calories}</div>
              </div>
              <div className={styles.srbNLDvLabel}>% Daily Value*</div>
              <div className={styles.srbNLMacros}>
                <div className={styles.srbNLRow}>
                  <span>Total Fat</span>
                  <span>{result.totals.fat}g</span>
                </div>
                <div className={styles.srbNLRow}>
                  <span>Total Carbohydrate</span>
                  <span>{result.totals.carbs}g</span>
                </div>
                <div className={styles.srbNLRow}>
                  <span>Protein</span>
                  <span>{result.totals.protein}g</span>
                </div>
              </div>
              <div className={styles.srbNLMicros}>
                <div className={styles.srbNLRow}>
                  <span>Vitamin D</span>
                  <span>{result.totals.vitaminD}mcg</span>
                </div>
                <div className={styles.srbNLRow}>
                  <span>Iron</span>
                  <span>{result.totals.iron}mg</span>
                </div>
                <div className={styles.srbNLRow}>
                  <span>Zinc</span>
                  <span>{result.totals.zinc}mg</span>
                </div>
                <div className={styles.srbNLRow}>
                  <span>Vitamin B12</span>
                  <span>{result.totals.vitaminB12}mcg</span>
                </div>
              </div>
              <p className={styles.srbNLFooter}>
                {result.totals.usdaVerified
                  ? 'Nutritional data powered by USDA FoodData Central.'
                  : 'Nutritional data is estimated. Add USDA_API_KEY for verified values.'}
              </p>
            </div>
          </div>
        </div>
      )}

      <p className={styles.recipeDisclaimer}>
        Smart Recipe Builder outputs are educational suggestions and not a prescribed meal plan.
        Consult a registered dietitian for personalized dietary guidance.
      </p>
    </div>
  )
}
