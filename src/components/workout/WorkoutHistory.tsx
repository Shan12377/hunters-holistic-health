import { format, subDays } from 'date-fns'
import styles from '../../pages/client/Client.module.css'

/**
 * The History tab: a 30 day dot calendar, the session list, and per-exercise
 * strength progress. Split out of WorkoutTrackerPage so that file stays under
 * the 800 line limit once the movement log and routine builder were added.
 */

export interface HistorySession {
  id: string
  session_date: string
  energy_level: number | null
  completed_at: string | null
}

export interface HistoryProgressEntry {
  date: string
  maxWeight: number | null
  maxReps: number | null
}

interface ChartableExercise {
  id: string
  name: string
  emoji: string | null
  tempo_default: string
}

interface Props {
  history: HistorySession[]
  progressData: Record<string, HistoryProgressEntry[]>
  /** Every exercise that could have a chart: routine exercises plus custom ones. */
  chartable: ChartableExercise[]
  energyLabels: readonly string[]
}

function ProgressChart({ exercise, entries }: { exercise: ChartableExercise; entries: HistoryProgressEntry[] }) {
  const withWeight = entries.filter(d => d.maxWeight !== null)
  if (!withWeight.length) return null

  const maxEver = Math.max(...withWeight.map(d => d.maxWeight!))
  const latest = withWeight[withWeight.length - 1]
  const isNewPR = withWeight.length > 1 && latest.maxWeight === maxEver
  const chartEntries = withWeight.slice(-15)

  return (
    <div className={styles.wkProgressCard}>
      <div className={styles.wkProgressHeader}>
        <span className={styles.wkProgressName}>
          {exercise.emoji ? `${exercise.emoji} ` : ''}{exercise.name}
        </span>
        {isNewPR && <span className={styles.wkPRBadge}>PR</span>}
        <span className={styles.wkProgressCurrent}>{latest.maxWeight} lbs</span>
      </div>
      <div className={styles.wkSparkline}>
        {chartEntries.map(entry => (
          <div
            key={entry.date}
            className={styles.wkSparkBar}
            style={{ height: `${Math.round((entry.maxWeight! / maxEver) * 100)}%` }}
            title={`${format(new Date(entry.date + 'T12:00:00'), 'MMM d')}: ${entry.maxWeight} lbs`}
          />
        ))}
      </div>
      <p className={styles.wkProgressMeta}>
        Best: {maxEver} lbs · {withWeight.length} session{withWeight.length !== 1 ? 's' : ''} logged
      </p>
    </div>
  )
}

export default function WorkoutHistory({ history, progressData, chartable, energyLabels }: Props) {
  const calendarDays = Array.from({ length: 30 }, (_, i) =>
    format(subDays(new Date(), 29 - i), 'yyyy-MM-dd')
  )
  const sessionDates = new Set(history.map(s => s.session_date))

  const charted = chartable.filter(
    ex =>
      !ex.tempo_default.includes('isometric') &&
      (progressData[ex.id] ?? []).some(d => d.maxWeight !== null)
  )

  return (
    <div>
      <div className={styles.wkHistoryCard}>
        <h2 className={styles.wkHistoryTitle}>Last 30 Days</h2>
        <div className={styles.wkCalendar}>
          {calendarDays.map(day => (
            <div
              key={day}
              className={`${styles.wkCalDot} ${sessionDates.has(day) ? styles.wkCalDotFilled : ''}`}
              title={day}
            />
          ))}
        </div>
        <p className={styles.wkCalCount}>
          {history.length} session{history.length !== 1 ? 's' : ''} logged in the last 30 days
        </p>
      </div>

      {history.length === 0 ? (
        <p className={styles.wkEmptyState}>
          No sessions yet. Start your first workout on the Today tab, or log a walk under Movement.
        </p>
      ) : (
        <div className={styles.wkHistoryList}>
          {history.map(s => (
            <div key={s.id} className={styles.wkHistoryRow}>
              <span className={styles.wkHistoryDate}>
                {format(new Date(s.session_date + 'T12:00:00'), 'EEE, MMM d')}
              </span>
              {s.energy_level && (
                <span className={styles.wkHistoryEnergy}>
                  Energy {s.energy_level}/5 · {energyLabels[s.energy_level]}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {charted.length > 0 && (
        <div className={styles.wkProgressSection}>
          <h2 className={styles.wkProgressSectionTitle}>Exercise Progress</h2>
          {charted.map(ex => (
            <ProgressChart key={ex.id} exercise={ex} entries={progressData[ex.id] ?? []} />
          ))}
        </div>
      )}
    </div>
  )
}
