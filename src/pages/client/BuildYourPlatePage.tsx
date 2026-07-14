import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, FlaskConical, ChefHat, AlertTriangle, Sparkles } from 'lucide-react'
import { SYNERGIES } from '@/data/recipes'
import { useAuthStore } from '@/store/authStore'
import styles from './Client.module.css'

interface PlateFood {
  id: string
  name: string
  emoji: string
  category: string
}

const PLATE_FOODS: PlateFood[] = [
  { id: 'turmeric',        name: 'Turmeric',         emoji: '🟡', category: 'Spice' },
  { id: 'black-pepper',    name: 'Black Pepper',      emoji: '⚫', category: 'Spice' },
  { id: 'ginger',          name: 'Ginger',            emoji: '🌿', category: 'Spice' },
  { id: 'cinnamon',        name: 'Cinnamon',          emoji: '🍂', category: 'Spice' },
  { id: 'spinach',         name: 'Spinach',           emoji: '🥬', category: 'Leafy Green' },
  { id: 'kale',            name: 'Kale',              emoji: '🥬', category: 'Leafy Green' },
  { id: 'broccoli',        name: 'Broccoli',          emoji: '🥦', category: 'Cruciferous' },
  { id: 'cauliflower',     name: 'Cauliflower',       emoji: '🥦', category: 'Cruciferous' },
  { id: 'asparagus',       name: 'Asparagus',         emoji: '🌱', category: 'Vegetable' },
  { id: 'tomato',          name: 'Tomato',            emoji: '🍅', category: 'Vegetable' },
  { id: 'bell-pepper',     name: 'Bell Pepper',       emoji: '🫑', category: 'Vegetable' },
  { id: 'beets',           name: 'Beets',             emoji: '🔴', category: 'Root Vegetable' },
  { id: 'sweet-potato',    name: 'Sweet Potato',      emoji: '🍠', category: 'Root Vegetable' },
  { id: 'garlic',          name: 'Garlic',            emoji: '🧄', category: 'Allium' },
  { id: 'lemon',           name: 'Lemon / Lime',      emoji: '🍋', category: 'Citrus' },
  { id: 'blueberries',     name: 'Wild Blueberries',  emoji: '🫐', category: 'Fruit' },
  { id: 'tart-cherries',   name: 'Tart Cherries',     emoji: '🍒', category: 'Fruit' },
  { id: 'pomegranate',     name: 'Pomegranate',       emoji: '❤️',  category: 'Fruit' },
  { id: 'avocado',         name: 'Avocado',           emoji: '🥑', category: 'Fat' },
  { id: 'evoo',            name: 'Olive Oil (EVOO)',  emoji: '🫒', category: 'Fat' },
  { id: 'walnuts',         name: 'Walnuts',           emoji: '🌰', category: 'Nut' },
  { id: 'almonds',         name: 'Almonds',           emoji: '🌰', category: 'Nut' },
  { id: 'brazil-nuts',     name: 'Brazil Nuts',       emoji: '🌰', category: 'Nut' },
  { id: 'chia-seeds',      name: 'Chia Seeds',        emoji: '⚪', category: 'Seed' },
  { id: 'flaxseeds',       name: 'Flaxseeds',         emoji: '🌾', category: 'Seed' },
  { id: 'pumpkin-seeds',   name: 'Pumpkin Seeds',     emoji: '🫘', category: 'Seed' },
  { id: 'hemp-seeds',      name: 'Hemp Seeds',        emoji: '🌿', category: 'Seed' },
  { id: 'wild-salmon',     name: 'Wild Salmon',       emoji: '🐟', category: 'Protein' },
  { id: 'sardines',        name: 'Sardines',          emoji: '🐟', category: 'Protein' },
  { id: 'eggs',            name: 'Eggs',              emoji: '🥚', category: 'Protein' },
  { id: 'lentils',         name: 'Lentils / Legumes', emoji: '🫘', category: 'Protein' },
  { id: 'tempeh',          name: 'Tempeh',            emoji: '🫙', category: 'Fermented' },
  { id: 'greek-yogurt',    name: 'Greek Yogurt',      emoji: '🥛', category: 'Dairy' },
  { id: 'kefir',           name: 'Kefir',             emoji: '🥛', category: 'Dairy' },
  { id: 'cottage-cheese',  name: 'Cottage Cheese',    emoji: '🥛', category: 'Dairy' },
  { id: 'bone-broth',      name: 'Bone Broth',        emoji: '🍲', category: 'Broth' },
  { id: 'mushrooms',       name: 'Mushrooms',         emoji: '🍄', category: 'Fungi' },
  { id: 'green-tea',       name: 'Green Tea',         emoji: '🍵', category: 'Beverage' },
]

interface SynergyRule {
  synergyId: string
  groupA: string[]
  groupB: string[]
}

const SYNERGY_RULES: SynergyRule[] = [
  { synergyId: 'syn-1',  groupA: ['turmeric'],                       groupB: ['black-pepper'] },
  { synergyId: 'syn-2',  groupA: ['spinach', 'kale', 'lentils'],     groupB: ['lemon', 'bell-pepper', 'tomato'] },
  { synergyId: 'syn-3',  groupA: ['blueberries'],                    groupB: ['walnuts'] },
  { synergyId: 'syn-4',  groupA: ['wild-salmon'],                    groupB: ['asparagus'] },
  { synergyId: 'syn-5',  groupA: ['broccoli', 'cauliflower'],        groupB: ['evoo'] },
  { synergyId: 'syn-6',  groupA: ['greek-yogurt', 'kefir'],          groupB: ['chia-seeds', 'flaxseeds'] },
  { synergyId: 'syn-7',  groupA: ['cottage-cheese', 'greek-yogurt'], groupB: ['avocado'] },
  { synergyId: 'syn-8',  groupA: ['tart-cherries'],                  groupB: ['walnuts'] },
  { synergyId: 'syn-9',  groupA: ['kale', 'spinach'],                groupB: ['evoo', 'avocado'] },
  { synergyId: 'syn-10', groupA: ['turmeric', 'ginger'],             groupB: ['bone-broth'] },
  { synergyId: 'syn-11', groupA: ['garlic'],                         groupB: ['lemon'] },
  { synergyId: 'syn-12', groupA: ['sweet-potato', 'beets'],          groupB: ['evoo', 'avocado'] },
  { synergyId: 'syn-13', groupA: ['eggs'],                           groupB: ['evoo', 'avocado'] },
  { synergyId: 'syn-14', groupA: ['brazil-nuts'],                    groupB: ['wild-salmon', 'sardines'] },
  { synergyId: 'syn-15', groupA: ['pumpkin-seeds'],                  groupB: ['spinach', 'kale'] },
  { synergyId: 'syn-16', groupA: ['mushrooms'],                      groupB: ['eggs', 'sardines'] },
  { synergyId: 'syn-17', groupA: ['green-tea'],                      groupB: ['lemon'] },
  { synergyId: 'syn-18', groupA: ['pomegranate'],                    groupB: ['walnuts'] },
]

interface AntiSynergy {
  id: string
  title: string
  description: string
  groupA: string[]
  groupB: string[]
}

const ANTI_SYNERGIES: AntiSynergy[] = [
  {
    id: 'anti-1',
    title: 'Calcium competes with iron absorption',
    description: 'Dairy calcium and non-heme iron share the same gut transporter. Separating dairy from iron-rich greens and legumes by 1 to 2 hours can optimize uptake of both minerals.',
    groupA: ['cottage-cheese', 'greek-yogurt', 'kefir'],
    groupB: ['spinach', 'kale', 'lentils'],
  },
  {
    id: 'anti-2',
    title: 'Tea tannins can reduce iron absorption',
    description: 'Polyphenol tannins in green tea chelate non-heme iron in the gut. For better iron uptake from leafy greens or legumes, drink green tea 1 to 2 hours before or after the meal.',
    groupA: ['green-tea'],
    groupB: ['spinach', 'kale', 'lentils'],
  },
]

const GOAL_FOODS: Record<string, string[]> = {
  'Blood Pressure Support':  ['beets', 'wild-salmon', 'walnuts', 'flaxseeds', 'garlic', 'pomegranate', 'green-tea', 'lentils'],
  'Blood Sugar Balance':     ['cinnamon', 'lentils', 'chia-seeds', 'flaxseeds', 'wild-salmon', 'walnuts', 'greek-yogurt', 'eggs'],
  'Weight Management':       ['wild-salmon', 'greek-yogurt', 'eggs', 'lentils', 'broccoli', 'cauliflower', 'chia-seeds', 'tempeh'],
  'Energy and Fatigue':      ['spinach', 'kale', 'lentils', 'sardines', 'eggs', 'mushrooms', 'pumpkin-seeds', 'hemp-seeds'],
  'Cardiovascular Health':   ['wild-salmon', 'sardines', 'walnuts', 'avocado', 'evoo', 'blueberries', 'beets', 'pomegranate'],
  'Digestive Health':        ['kefir', 'greek-yogurt', 'bone-broth', 'chia-seeds', 'flaxseeds', 'ginger', 'tempeh', 'asparagus'],
  'Hormonal Balance':        ['flaxseeds', 'wild-salmon', 'brazil-nuts', 'hemp-seeds', 'pumpkin-seeds', 'avocado', 'eggs'],
  'Inflammation Reduction':  ['turmeric', 'ginger', 'wild-salmon', 'blueberries', 'tart-cherries', 'evoo', 'bone-broth', 'sardines'],
  'Stress and Sleep':        ['tart-cherries', 'walnuts', 'mushrooms', 'green-tea', 'avocado', 'bone-broth', 'hemp-seeds', 'lentils'],
  'Metabolic Health':        ['cinnamon', 'lentils', 'eggs', 'wild-salmon', 'broccoli', 'cauliflower', 'greek-yogurt', 'mushrooms'],
}

function getDailyFeaturedSynergy() {
  const yearStart = new Date(new Date().getFullYear(), 0, 1)
  const dayOfYear = Math.floor((Date.now() - yearStart.getTime()) / 86400000)
  return SYNERGIES[dayOfYear % SYNERGIES.length]
}

function getMissingGroup(rule: SynergyRule, selected: Set<string>): string[] | null {
  const hasA = rule.groupA.some(f => selected.has(f))
  const hasB = rule.groupB.some(f => selected.has(f))
  if (hasA && !hasB) return rule.groupB
  if (hasB && !hasA) return rule.groupA
  return null
}

function getFoodName(id: string): string {
  return PLATE_FOODS.find(f => f.id === id)?.name ?? id
}

export default function BuildYourPlatePage() {
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const primaryGoal = profile?.wellness_goals?.primary_goal ?? ''
  const goalFoods = useMemo(() => new Set(GOAL_FOODS[primaryGoal] ?? []), [primaryGoal])

  function toggleFood(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function tryTurmericPairing() {
    setSelected(new Set(['turmeric', 'black-pepper']))
  }

  function buildRecipe() {
    const foodNames = Array.from(selected).map(id => getFoodName(id)).join(', ')
    const prompt = encodeURIComponent(`Build a functional medicine meal using these foods: ${foodNames}`)
    navigate(`/app/recipe-builder?prompt=${prompt}`)
  }

  const activeSynergies = useMemo(() => {
    return SYNERGY_RULES.filter(rule => {
      const hasA = rule.groupA.some(f => selected.has(f))
      const hasB = rule.groupB.some(f => selected.has(f))
      return hasA && hasB
    }).map(rule => SYNERGIES.find(s => s.id === rule.synergyId)!)
      .filter(Boolean)
  }, [selected])

  const almostThere = useMemo(() => {
    return SYNERGY_RULES.filter(rule => {
      const missing = getMissingGroup(rule, selected)
      return missing !== null
    }).map(rule => ({
      synergy: SYNERGIES.find(s => s.id === rule.synergyId)!,
      missing: getMissingGroup(rule, selected)!,
    })).filter(r => r.synergy)
  }, [selected])

  const activeAntiSynergies = useMemo(() => {
    return ANTI_SYNERGIES.filter(anti => {
      const hasA = anti.groupA.some(f => selected.has(f))
      const hasB = anti.groupB.some(f => selected.has(f))
      return hasA && hasB
    })
  }, [selected])

  const categories = Array.from(new Set(PLATE_FOODS.map(f => f.category)))
  const featuredSynergy = getDailyFeaturedSynergy()

  return (
    <div className="animate-fade-in">
      <div className={styles.pageTop}>
        <h1 className={styles.pageTopTitle}>
          <FlaskConical size={22} color="var(--gold)" /> Build Your Plate
        </h1>
        <p className={styles.pageTopDate}>
          Select what you are eating today. VitaPlate AI detects active food synergies in real time.
        </p>
      </div>

      {/* Tier 6: Featured synergy of the day */}
      <div className={styles.bypFeaturedCard} style={{ borderLeftColor: featuredSynergy.color }}>
        <div className={styles.bypFeaturedLabel}>
          <Sparkles size={11} /> Synergy of the Day
        </div>
        <div className={styles.bypFeaturedTitle} style={{ color: featuredSynergy.color }}>
          {featuredSynergy.title}
        </div>
        <div className={styles.bypFeaturedFoods}>{featuredSynergy.foods}</div>
        <div className={styles.bypFeaturedBoost}>{featuredSynergy.boost}</div>
        <div className={styles.bypFeaturedMechanism}>{featuredSynergy.mechanism}</div>
        <div className={styles.bypFeaturedTip}>Select these foods below to see it activate.</div>
      </div>

      {/* Tier 1: Hook text */}
      <div className={styles.bypHookBox}>
        <p className={styles.bypHookText}>
          Certain foods multiply each other's benefits when eaten together. This is not folklore. It is biochemistry.
          Turmeric plus black pepper boosts curcumin absorption by 2,000%. Spinach plus citrus triples iron uptake.
          Select what you are eating today and see which pairings are working for you.
          {primaryGoal && <span className={styles.bypGoalNote}> Foods marked with a gold dot are recommended for: <strong>{primaryGoal}</strong>.</span>}
        </p>
      </div>

      {/* Food picker */}
      <div className={styles.bypSection}>
        <div className={styles.bypSectionHead}>Tap foods to add them to your plate</div>
        {categories.map(cat => (
          <div key={cat} className={styles.bypCategoryGroup}>
            <div className={styles.bypCategoryLabel}>{cat}</div>
            <div className={styles.bypFoodGrid}>
              {PLATE_FOODS.filter(f => f.category === cat).map(food => {
                const isSelected = selected.has(food.id)
                const isGoal = goalFoods.has(food.id)
                return (
                  <button
                    key={food.id}
                    className={
                      isSelected
                        ? styles.bypFoodChipActive
                        : isGoal
                          ? styles.bypFoodChipGoal
                          : styles.bypFoodChip
                    }
                    onClick={() => toggleFood(food.id)}
                    title={isGoal && !isSelected ? `Recommended for: ${primaryGoal}` : undefined}
                  >
                    <span className={styles.bypFoodEmoji}>{food.emoji}</span>
                    {food.name}
                    {isGoal && !isSelected && <span className={styles.bypGoalDot} />}
                    {isSelected && <span className={styles.bypChipCheck}>✓</span>}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Your plate summary */}
      {selected.size > 0 && (
        <div className={styles.bypPlateRow}>
          <div className={styles.bypPlateLabel}>Your plate ({selected.size} foods):</div>
          <div className={styles.bypPlateChips}>
            {Array.from(selected).map(id => (
              <button
                key={id}
                className={styles.bypPlateChip}
                onClick={() => toggleFood(id)}
                title="Tap to remove"
              >
                {getFoodName(id)} ×
              </button>
            ))}
          </div>
          {selected.size >= 2 && (
            <button className={styles.bypBuildCta} onClick={buildRecipe}>
              <ChefHat size={15} /> Build a Recipe with These Foods
            </button>
          )}
        </div>
      )}

      {/* Empty state */}
      {selected.size === 0 && (
        <div className={styles.bypEmptyState}>
          <Zap size={28} color="rgba(200, 167, 75, 0.3)" />
          <p>Select foods above to discover active pairings.</p>
          <button className={styles.bypTryItBtn} onClick={tryTurmericPairing}>
            Try it: Turmeric + Black Pepper
          </button>
        </div>
      )}

      {/* Active synergies */}
      {activeSynergies.length > 0 && (
        <div className={styles.bypActiveSection}>
          <div className={styles.bypActiveSectionHead}>
            <Zap size={16} color="var(--gold)" />
            Active Pairings ({activeSynergies.length})
          </div>
          <div className={styles.bypActiveGrid}>
            {activeSynergies.map(syn => (
              <div
                key={syn.id}
                className={styles.bypActiveCard}
                style={{ borderLeftColor: syn.color }}
              >
                <div className={styles.bypActiveCardTop}>
                  <div>
                    <div className={styles.bypActiveTitle} style={{ color: syn.color }}>
                      {syn.title}
                    </div>
                    <div className={styles.bypActiveFoods}>{syn.foods}</div>
                  </div>
                  <div
                    className={styles.bypBoostBadge}
                    style={{ background: `${syn.color}1a`, color: syn.color, borderColor: `${syn.color}40` }}
                  >
                    {syn.boost}
                  </div>
                </div>
                <div className={styles.bypActiveMechanism}>{syn.mechanism}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tier 2: Anti-synergy timing notes */}
      {activeAntiSynergies.length > 0 && (
        <div className={styles.bypAntiSection}>
          <div className={styles.bypAntiSectionHead}>
            <AlertTriangle size={13} /> Timing Considerations
          </div>
          {activeAntiSynergies.map(anti => (
            <div key={anti.id} className={styles.bypAntiCard}>
              <div className={styles.bypAntiTitle}>{anti.title}</div>
              <div className={styles.bypAntiDesc}>{anti.description}</div>
            </div>
          ))}
        </div>
      )}

      {/* Almost there */}
      {selected.size > 0 && almostThere.length > 0 && (
        <div className={styles.bypAlmostSection}>
          <div className={styles.bypAlmostHead}>One ingredient away</div>
          <div className={styles.bypAlmostList}>
            {almostThere.map(({ synergy, missing }) => (
              <div key={synergy.id} className={styles.bypAlmostRow}>
                <div className={styles.bypAlmostName} style={{ color: synergy.color }}>
                  {synergy.title}
                </div>
                <div className={styles.bypAlmostTip}>
                  Add{' '}
                  {missing.slice(0, 2).map((id, i) => (
                    <span key={id}>
                      {i > 0 && ' or '}
                      <button className={styles.bypAlmostShortcut} onClick={() => toggleFood(id)}>
                        {getFoodName(id)}
                      </button>
                    </span>
                  ))}
                  {' '}to activate
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className={styles.recipeDisclaimer}>
        This tool is for educational purposes and does not constitute dietary advice.
        For personalized nutrition care, consult a registered dietitian.
      </p>
    </div>
  )
}
