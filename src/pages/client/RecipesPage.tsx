import { useState, useMemo, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BookOpen, Zap } from 'lucide-react'
import { RECIPES, SYNERGIES, type Recipe, type RootsPhase } from '@/data/recipes'
import styles from './Client.module.css'

const PHASE_ORDER: RootsPhase[] = ['Review', 'Optimize', 'Transform', 'Sustain']

const PHASE_COLORS: Record<RootsPhase, string> = {
  Review: '#0b9e8e',
  Optimize: '#c8a74b',
  Transform: '#9b59b6',
  Sustain: '#4be08a',
}

function getAllTags(): string[] {
  const seen = new Set<string>()
  RECIPES.forEach(r => r.tags.forEach(t => seen.add(t)))
  return Array.from(seen).sort()
}

const ALL_TAGS = getAllTags()

export default function RecipesPage() {
  const [searchParams] = useSearchParams()
  const [selectedPhase, setSelectedPhase] = useState<string | null>(
    searchParams.get('phase')
  )
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const expandedRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const phase = searchParams.get('phase')
    if (phase) setSelectedPhase(phase)
  }, [searchParams])

  useEffect(() => {
    if (selectedRecipe && expandedRef.current) {
      expandedRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [selectedRecipe])

  const filtered = useMemo(() => {
    return RECIPES.filter(r => {
      if (selectedPhase && r.rootsPhase !== selectedPhase) return false
      if (selectedTag && !r.tags.includes(selectedTag)) return false
      return true
    })
  }, [selectedPhase, selectedTag])

  function togglePhase(phase: string) {
    setSelectedPhase(p => (p === phase ? null : phase))
    setSelectedRecipe(null)
  }

  function toggleTag(tag: string) {
    setSelectedTag(t => (t === tag ? null : tag))
    setSelectedRecipe(null)
  }

  function selectRecipe(recipe: Recipe) {
    setSelectedRecipe(r => (r?.id === recipe.id ? null : recipe))
  }

  return (
    <div className="animate-fade-in">
      <div className={styles.pageTop}>
        <h1 className={styles.pageTopTitle}>
          <BookOpen size={22} color="var(--gold)" /> Recipe Ideas
        </h1>
        <p className={styles.pageTopDate}>
          Simple whole-food recipes organized by ROOTS phase
        </p>
      </div>

      {/* Filters */}
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
                  style={
                    active
                      ? { background: `${color}22`, borderColor: color, color }
                      : undefined
                  }
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
            onClick={() => {
              setSelectedPhase(null)
              setSelectedTag(null)
              setSelectedRecipe(null)
            }}
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Expanded recipe detail */}
      {selectedRecipe && (
        <div className={styles.recipeExpanded} ref={expandedRef}>
          <div className={styles.recipeExpandedHeader}>
            <div className={styles.recipeExpandedMeta}>
              <span
                className={styles.recipeExpandedPhase}
                style={{
                  color: PHASE_COLORS[selectedRecipe.rootsPhase],
                  background: `${PHASE_COLORS[selectedRecipe.rootsPhase]}1a`,
                }}
              >
                {selectedRecipe.rootsPhase}
              </span>
              <h2 className={styles.recipeExpandedTitle}>{selectedRecipe.name}</h2>
              <div className={styles.recipeTags}>
                {selectedRecipe.tags.map(tag => (
                  <span key={tag} className={styles.recipeTag}>{tag}</span>
                ))}
              </div>
            </div>
            <button
              className={styles.recipeCloseBtn}
              onClick={() => setSelectedRecipe(null)}
            >
              Close
            </button>
          </div>

          <div
            className={styles.recipeNote}
            style={{ borderLeftColor: PHASE_COLORS[selectedRecipe.rootsPhase] }}
          >
            <strong>ROOTS {selectedRecipe.rootsPhase} phase:</strong>{' '}
            {selectedRecipe.educationalNote}
          </div>

          {/* Macros */}
          <div className={styles.recipeMacroRow}>
            <div className={styles.recipeMacro}>
              <span className={styles.recipeMacroVal}>{selectedRecipe.calories}</span>
              <span className={styles.recipeMacroLabel}>cal</span>
            </div>
            <div className={styles.recipeMacro}>
              <span className={styles.recipeMacroVal}>{selectedRecipe.proteinGrams}g</span>
              <span className={styles.recipeMacroLabel}>protein</span>
            </div>
            <div className={styles.recipeMacro}>
              <span className={styles.recipeMacroVal}>{selectedRecipe.fatGrams}g</span>
              <span className={styles.recipeMacroLabel}>fat</span>
            </div>
            <div className={styles.recipeMacro}>
              <span className={styles.recipeMacroVal}>{selectedRecipe.carbGrams}g</span>
              <span className={styles.recipeMacroLabel}>carbs</span>
            </div>
          </div>

          <div className={styles.recipeExpandedBody}>
            <div>
              <h3 className={styles.recipeExpandedSection}>Ingredients</h3>
              <ul className={styles.recipeIngredients}>
                {selectedRecipe.ingredients.map((ing, i) => (
                  <li key={i}>{ing}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className={styles.recipeExpandedSection}>Steps</h3>
              <ol className={styles.recipeSteps}>
                {selectedRecipe.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>
          </div>

          {selectedRecipe.quickSwap && (
            <div className={styles.recipeQuickSwap}>
              <span className={styles.recipeQuickSwapLabel}>Quick Swap</span>
              {selectedRecipe.quickSwap}
            </div>
          )}
        </div>
      )}

      {/* Recipe grid */}
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
                <span
                  className={styles.recipeCardPhase}
                  style={{ color, background: `${color}1a` }}
                >
                  {recipe.rootsPhase}
                </span>
                <div className={styles.recipeCardTitle}>{recipe.name}</div>
                <div className={styles.recipeTags}>
                  {recipe.tags.slice(0, 3).map(tag => (
                    <span key={tag} className={styles.recipeTag}>{tag}</span>
                  ))}
                </div>
                <span className={styles.recipeCardCta}>
                  {isSelected ? 'Close' : 'View recipe'}
                </span>
              </button>
            )
          })}
        </div>
      ) : (
        <div className={styles.recipeEmpty}>
          <p className={styles.recipeEmptyText}>No recipes match your current filters.</p>
          <button
            className={styles.recipeClearBtn}
            onClick={() => {
              setSelectedPhase(null)
              setSelectedTag(null)
            }}
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Food Synergies */}
      <div className={styles.synergiesSection}>
        <div className={styles.synergiesHeader}>
          <Zap size={18} color="var(--gold)" />
          <h2 className={styles.synergiesTitle}>Food Synergies</h2>
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

      <p className={styles.recipeDisclaimer}>
        These are educational recipe ideas, not a prescribed meal plan and not dietetic advice.
        For personalized nutrition care, consult a registered dietitian.
      </p>
    </div>
  )
}
