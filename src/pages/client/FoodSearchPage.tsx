import { useState, useMemo } from 'react'
import { Search, X, ChevronDown, ChevronUp } from 'lucide-react'
import {
  FOOD_DATABASE, CATEGORY_LABELS, MEAL_SLOT_LABELS, CATEGORY_ORDER,
  type MealSlot, type FoodItem,
} from '@/data/foodDatabase'
import styles from './Client.module.css'

const SLOTS: Array<MealSlot | 'all'> = ['all', 'breakfast', 'lunch', 'dinner', 'snack']

export default function FoodSearchPage() {
  const [query, setQuery] = useState('')
  const [activeSlot, setActiveSlot] = useState<MealSlot | 'all'>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const results = useMemo(() => {
    const q = query.toLowerCase().trim()
    return FOOD_DATABASE.filter(item => {
      const slotMatch = activeSlot === 'all' || item.mealSlots.includes(activeSlot)
      const textMatch = !q || item.name.toLowerCase().includes(q) || item.notes.toLowerCase().includes(q)
      return slotMatch && textMatch
    })
  }, [query, activeSlot])

  const grouped = useMemo(() => {
    const map: Partial<Record<string, FoodItem[]>> = {}
    results.forEach(item => {
      if (!map[item.category]) map[item.category] = []
      map[item.category]!.push(item)
    })
    return map
  }, [results])

  const orderedCategories = CATEGORY_ORDER.filter(c => grouped[c]?.length)

  return (
    <div className="animate-fade-in">
      <div className={styles.pageTop}>
        <h1 className={styles.pageTopTitle}>
          <Search size={22} color="var(--gold)" /> Food Search
        </h1>
        <p className={styles.pageTopDate}>
          Search whole foods by meal slot. See macros, meal timing, and why each food matters functionally.
        </p>
      </div>

      {/* Search bar */}
      <div className={styles.fsSearchBox}>
        <div className={styles.fsSearchRow}>
          <Search size={18} color="var(--text-muted)" />
          <input
            className={styles.fsInput}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search foods: try 'salmon', 'iron', 'breakfast protein'..."
          />
          {query && (
            <button className={styles.fsClear} onClick={() => setQuery('')}>
              <X size={15} />
            </button>
          )}
        </div>

        <div className={styles.fsSlotTabs}>
          {SLOTS.map(slot => (
            <button
              key={slot}
              className={activeSlot === slot ? styles.fsSlotTabActive : styles.fsSlotTab}
              onClick={() => setActiveSlot(slot)}
            >
              {slot === 'all' ? 'All Meals' : MEAL_SLOT_LABELS[slot as MealSlot]}
            </button>
          ))}
        </div>
      </div>

      {(query || activeSlot !== 'all') && (
        <p className={styles.fsCount}>
          {results.length} food{results.length !== 1 ? 's' : ''} found
        </p>
      )}

      {results.length === 0 ? (
        <div className={styles.fsEmpty}>
          <Search size={32} color="rgba(255,255,255,0.15)" />
          <p>No foods match your search.</p>
          <p>Try a different keyword or meal slot.</p>
        </div>
      ) : (
        <div className={styles.fsCategoryList}>
          {orderedCategories.map(category => (
            <div key={category} className={styles.fsCategoryGroup}>
              <div className={styles.fsCategoryLabel}>{CATEGORY_LABELS[category]}</div>
              <div className={styles.fsGrid}>
                {grouped[category]!.map(item => {
                  const isExpanded = expandedId === item.id
                  return (
                    <div key={item.id} className={styles.fsCard}>
                      <div className={styles.fsCardHeader}>
                        <h5 className={styles.fsCardName}>{item.name}</h5>
                        <div className={styles.fsSlotPills}>
                          {item.mealSlots.map(s => (
                            <span
                              key={s}
                              className={activeSlot === s ? styles.fsSlotPillActive : styles.fsSlotPill}
                            >
                              {MEAL_SLOT_LABELS[s]}
                            </span>
                          ))}
                        </div>
                        <div className={styles.fsMacroRow}>
                          <div className={styles.fsMacro}>
                            <span className={styles.fsMacroVal}>{item.calories}</span>
                            <span className={styles.fsMacroLabel}>Cal</span>
                          </div>
                          <div className={styles.fsMacro}>
                            <span className={styles.fsMacroVal}>{item.proteinGrams}g</span>
                            <span className={styles.fsMacroLabel}>Protein</span>
                          </div>
                          <div className={styles.fsMacro}>
                            <span className={styles.fsMacroVal}>{item.fatGrams}g</span>
                            <span className={styles.fsMacroLabel}>Fat</span>
                          </div>
                          <div className={styles.fsMacro}>
                            <span className={styles.fsMacroVal}>{item.carbGrams}g</span>
                            <span className={styles.fsMacroLabel}>Carbs</span>
                          </div>
                        </div>
                      </div>

                      <button
                        className={styles.fsWhyBtn}
                        onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      >
                        <span>Why this food?</span>
                        {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      </button>
                      {isExpanded && (
                        <div className={styles.fsWhyBody}>
                          <p>{item.notes}</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className={styles.recipeDisclaimer}>
        Nutritional values are approximate and for educational reference only.
        For personalized dietary guidance, consult a registered dietitian.
      </p>
    </div>
  )
}
