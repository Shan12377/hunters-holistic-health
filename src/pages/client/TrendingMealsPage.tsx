import { useState, useMemo } from 'react'
import { TrendingUp, ChevronDown, ChevronUp, Zap, ArrowRight } from 'lucide-react'
import { TRENDING_MEALS, PLATFORM_LABELS, PLATFORM_COLORS, getTrendScore, type TrendingMeal } from '@/data/trendingMeals'
import styles from './Client.module.css'

function HeatBar({ score }: { score: number }) {
  const color = score >= 93 ? '#ef4444' : score >= 87 ? '#f97316' : '#f59e0b'
  return (
    <div className={styles.tmHeatBar}>
      <div className={styles.tmHeatTrack}>
        <div
          className={styles.tmHeatFill}
          style={{ width: `${score}%`, background: color }}
        />
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
          <span className={styles.tmProtocolBadge}>
            <Zap size={11} /> Protocol Fit
          </span>
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

      <button
        className={styles.tmWhyBtn}
        onClick={() => setExpanded(e => !e)}
      >
        <span className={styles.tmWhyLabel}>
          <Zap size={12} color="var(--gold)" /> Why It Works
        </span>
        {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>

      {expanded && (
        <div className={styles.tmWhyBody}>
          <p className={styles.tmWhyText}>{meal.whyItWorks}</p>
          {meal.quickSwap && (
            <div className={styles.tmSwap}>
              <ArrowRight size={12} />
              <span>{meal.quickSwap}</span>
            </div>
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

export default function TrendingMealsPage() {
  const [showAll, setShowAll] = useState(false)

  const sorted = useMemo(
    () => [...TRENDING_MEALS].sort((a, b) => getTrendScore(b) - getTrendScore(a)),
    []
  )
  const visible = showAll ? sorted : sorted.slice(0, 6)

  function handleFork(mealName: string) {
    const url = `/app/recipe-builder?prompt=${encodeURIComponent('Fork and optimize: ' + mealName)}`
    window.location.href = url
  }

  return (
    <div className="animate-fade-in">
      <div className={styles.pageTop}>
        <h1 className={styles.pageTopTitle}>
          <TrendingUp size={22} color="#f97316" /> Trending Meals
        </h1>
        <p className={styles.pageTopDate}>
          What is viral on TikTok, Reddit, and Instagram right now, filtered for functional nutrition protocols.
        </p>
      </div>

      <div className={styles.tmLegend}>
        <span className={styles.tmLegendLabel}>Trend Score:</span>
        <span className={styles.tmLegendItem}><span className={styles.tmDot} style={{ background: '#ef4444' }} /> 93+ Viral</span>
        <span className={styles.tmLegendItem}><span className={styles.tmDot} style={{ background: '#f97316' }} /> 87+ Hot</span>
        <span className={styles.tmLegendItem}><span className={styles.tmDot} style={{ background: '#f59e0b' }} /> Rising</span>
      </div>

      <div className={styles.tmGrid}>
        {visible.map(meal => (
          <MealCard key={meal.id} meal={meal} onFork={handleFork} />
        ))}
      </div>

      {sorted.length > 6 && (
        <button
          className={styles.tmShowAllBtn}
          onClick={() => setShowAll(s => !s)}
        >
          {showAll ? 'Show Less' : `Show All ${sorted.length} Trending Meals`}
        </button>
      )}

      <p className={styles.recipeDisclaimer}>
        Trending meal information is for educational purposes only and does not constitute dietary advice.
        For personalized nutrition care, consult a registered dietitian.
      </p>
    </div>
  )
}
