import { useState, useMemo } from 'react'
import { Zap, FlaskConical } from 'lucide-react'
import { SYNERGIES } from '@/data/recipes'
import styles from './Client.module.css'

interface PlateFood {
  id: string
  name: string
  category: string
}

const PLATE_FOODS: PlateFood[] = [
  { id: 'turmeric', name: 'Turmeric', category: 'Spice' },
  { id: 'black-pepper', name: 'Black Pepper', category: 'Spice' },
  { id: 'ginger', name: 'Ginger', category: 'Spice' },
  { id: 'spinach', name: 'Spinach', category: 'Leafy Green' },
  { id: 'kale', name: 'Kale', category: 'Leafy Green' },
  { id: 'broccoli', name: 'Broccoli', category: 'Cruciferous' },
  { id: 'cauliflower', name: 'Cauliflower', category: 'Cruciferous' },
  { id: 'asparagus', name: 'Asparagus', category: 'Vegetable' },
  { id: 'tomato', name: 'Tomato', category: 'Vegetable' },
  { id: 'bell-pepper', name: 'Bell Pepper', category: 'Vegetable' },
  { id: 'lemon', name: 'Lemon / Lime', category: 'Citrus' },
  { id: 'blueberries', name: 'Wild Blueberries', category: 'Fruit' },
  { id: 'tart-cherries', name: 'Tart Cherries', category: 'Fruit' },
  { id: 'avocado', name: 'Avocado', category: 'Fat' },
  { id: 'evoo', name: 'Olive Oil (EVOO)', category: 'Fat' },
  { id: 'walnuts', name: 'Walnuts', category: 'Nut' },
  { id: 'chia-seeds', name: 'Chia Seeds', category: 'Seed' },
  { id: 'flaxseeds', name: 'Flaxseeds', category: 'Seed' },
  { id: 'wild-salmon', name: 'Wild Salmon', category: 'Protein' },
  { id: 'lentils', name: 'Lentils / Legumes', category: 'Protein' },
  { id: 'greek-yogurt', name: 'Greek Yogurt', category: 'Dairy' },
  { id: 'kefir', name: 'Kefir', category: 'Dairy' },
  { id: 'cottage-cheese', name: 'Cottage Cheese', category: 'Dairy' },
  { id: 'bone-broth', name: 'Bone Broth', category: 'Broth' },
]

interface SynergyRule {
  synergyId: string
  groupA: string[]
  groupB: string[]
}

const SYNERGY_RULES: SynergyRule[] = [
  { synergyId: 'syn-1', groupA: ['turmeric'], groupB: ['black-pepper'] },
  { synergyId: 'syn-2', groupA: ['spinach', 'kale', 'lentils'], groupB: ['lemon', 'bell-pepper', 'tomato'] },
  { synergyId: 'syn-3', groupA: ['blueberries'], groupB: ['walnuts'] },
  { synergyId: 'syn-4', groupA: ['wild-salmon'], groupB: ['asparagus'] },
  { synergyId: 'syn-5', groupA: ['broccoli', 'cauliflower'], groupB: ['evoo'] },
  { synergyId: 'syn-6', groupA: ['greek-yogurt', 'kefir'], groupB: ['chia-seeds', 'flaxseeds'] },
  { synergyId: 'syn-7', groupA: ['cottage-cheese', 'greek-yogurt'], groupB: ['avocado'] },
  { synergyId: 'syn-8', groupA: ['tart-cherries'], groupB: ['walnuts'] },
  { synergyId: 'syn-9', groupA: ['kale', 'spinach'], groupB: ['evoo', 'avocado'] },
  { synergyId: 'syn-10', groupA: ['turmeric', 'ginger'], groupB: ['bone-broth'] },
]

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
  const [selected, setSelected] = useState<Set<string>>(new Set())

  function toggleFood(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
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

  const categories = Array.from(new Set(PLATE_FOODS.map(f => f.category)))

  return (
    <div className="animate-fade-in">
      <div className={styles.pageTop}>
        <h1 className={styles.pageTopTitle}>
          <FlaskConical size={22} color="var(--gold)" /> Build Your Plate
        </h1>
        <p className={styles.pageTopDate}>
          Select the foods you are eating today. VitaPlate AI detects active food synergies in real time.
        </p>
      </div>

      {/* Food picker */}
      <div className={styles.bypSection}>
        <div className={styles.bypSectionHead}>Tap to add foods to your plate</div>
        {categories.map(cat => (
          <div key={cat} className={styles.bypCategoryGroup}>
            <div className={styles.bypCategoryLabel}>{cat}</div>
            <div className={styles.bypFoodGrid}>
              {PLATE_FOODS.filter(f => f.category === cat).map(food => (
                <button
                  key={food.id}
                  className={selected.has(food.id) ? styles.bypFoodChipActive : styles.bypFoodChip}
                  onClick={() => toggleFood(food.id)}
                >
                  {food.name}
                  {selected.has(food.id) && <span className={styles.bypChipCheck}>+</span>}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Selected foods summary */}
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
                {getFoodName(id)} x
              </button>
            ))}
          </div>
        </div>
      )}

      {selected.size === 0 && (
        <div className={styles.bypEmptyState}>
          <Zap size={28} color="rgba(200, 167, 75, 0.3)" />
          <p>Add foods above to see your active pairings.</p>
        </div>
      )}

      {/* Active synergies */}
      {activeSynergies.length > 0 && (
        <div className={styles.bypActiveSection}>
          <div className={styles.bypActiveSectionHead}>
            <Zap size={16} color="var(--gold)" />
            VitaPlate AI: Active Pairings ({activeSynergies.length})
          </div>
          <div className={styles.bypActiveGrid}>
            {activeSynergies.map(syn => (
              <div
                key={syn.id}
                className={styles.bypActiveCard}
                style={{ borderLeftColor: syn.color }}
              >
                <div className={styles.bypActiveTitle} style={{ color: syn.color }}>
                  {syn.title}
                </div>
                <div className={styles.bypActiveFoods}>{syn.foods}</div>
                <div className={styles.bypActiveBoost}>{syn.boost}</div>
                <div className={styles.bypActiveMechanism}>{syn.mechanism}</div>
              </div>
            ))}
          </div>
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
