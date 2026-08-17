import { useState, useEffect, useMemo } from 'react'
import { Plus, X, Trash2, ChevronDown } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { format, subDays } from 'date-fns'
import { awardPoints } from '@/lib/points'
import {
  ACTIVITY_TYPES,
  INTENSITIES,
  INTENSITY_LABEL,
  ESTIMATE_DISCLAIMER,
  WALK_GOAL_MINUTES,
  WEEKLY_POINTS_TARGET,
  DEAD_BUG_MINUTES_PER_SET,
  DEAD_BUG_REPS_PER_SET,
  SQUAT_REPS_PER_MINUTE,
  REP_BASED_ACTIVITY_KEYS,
  estimateActivity,
  movementPoints,
  findActivity,
  type Intensity,
  type Location,
} from '@/lib/activity'
import styles from './Workout.module.css'

interface ActivityRow {
  id: string
  session_date: string
  activity_key: string
  location: Location | null
  minutes: number
  intensity: Intensity
  est_calories: number | null
  est_steps: number | null
  note: string | null
}

interface Props {
  userId: string | undefined
  /** Today, as yyyy-MM-dd. Passed in so the page and this share one clock. */
  today: string
}

// Starts at 2 on purpose: twenty squats after a meal is a real entry, and if it
// takes effort to log it, it does not get logged.
const QUICK_MINUTES = [2, 5, 10, 15, 20, 30, 45, 60]

// Dead bug is logged by sets, not minutes: 10 reps per side is one set.
// Ten sets is Dr. Hunter's own full session (200 reps total).
const QUICK_DEAD_BUG_SETS = [1, 2, 3, 5, 10]

// Squats logged by reps. Starts at 10 so there is a real place to start;
// selecting again after logging one round covers "did 40" as 4 taps of 10,
// since the log itself always allows more than one entry a day.
const QUICK_SQUAT_REPS = [10, 20, 30, 40, 50]

export default function ActivityLog({ userId, today }: Props) {
  const [rows, setRows] = useState<ActivityRow[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [showMath, setShowMath] = useState(false)

  // Body weight drives the calorie estimate. Pulled from the weight tracker if
  // there is anything there, otherwise the person types it once.
  const [weightLbs, setWeightLbs] = useState<number | null>(null)
  const [weightInput, setWeightInput] = useState('')

  const [activityKey, setActivityKey] = useState(ACTIVITY_TYPES[0].key)
  const [location, setLocation] = useState<Location>('outdoor')
  const [minutes, setMinutes] = useState(30)
  const [intensity, setIntensity] = useState<Intensity>('moderate')
  const [note, setNote] = useState('')
  // Lets a missed day get logged after the fact instead of only "right now."
  const [sessionDate, setSessionDate] = useState(today)

  const activity = findActivity(activityKey) ?? ACTIVITY_TYPES[0]

  useEffect(() => {
    if (!userId) { setLoading(false); return }
    let cancelled = false

    async function load() {
      try {
        const [activityRes, weightRes] = await Promise.all([
          supabase
            .from('activity_sessions')
            .select('id, session_date, activity_key, location, minutes, intensity, est_calories, est_steps, note')
            .eq('user_id', userId)
            .order('session_date', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(60),
          supabase
            .from('weight_logs')
            .select('weight_lbs')
            .eq('user_id', userId)
            .order('logged_at', { ascending: false })
            .limit(1)
            .maybeSingle(),
        ])

        if (cancelled) return
        if (activityRes.error) throw activityRes.error

        setRows((activityRes.data ?? []) as ActivityRow[])

        const stored = weightRes.data?.weight_lbs ?? null
        if (stored) {
          setWeightLbs(Number(stored))
        } else {
          const remembered = localStorage.getItem('wk_weight_lbs')
          if (remembered) setWeightLbs(Number(remembered))
        }
      } catch (err) {
        if (!cancelled) {
          console.error('[activity] load failed:', err)
          setLoadError('Could not load your activity. Pull down to refresh, or try again in a moment.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [userId])

  const estimate = useMemo(() => {
    if (!weightLbs) return null
    return estimateActivity({
      activityKey,
      minutes,
      intensity,
      location: activity.hasLocation ? location : undefined,
      weightLbs,
    })
  }, [activityKey, minutes, intensity, location, weightLbs, activity.hasLocation])

  function saveWeight() {
    const parsed = Number(weightInput)
    if (!Number.isFinite(parsed) || parsed < 50 || parsed > 700) return
    setWeightLbs(parsed)
    localStorage.setItem('wk_weight_lbs', String(parsed))
    setWeightInput('')
  }

  async function addActivity() {
    if (!userId || saving || !estimate) return
    setSaving(true)
    setSaveError(null)
    try {
      const { data, error } = await supabase
        .from('activity_sessions')
        .insert({
          user_id: userId,
          session_date: sessionDate,
          activity_key: activityKey,
          location: activity.hasLocation ? location : null,
          minutes,
          intensity,
          est_calories: estimate.calories,
          est_steps: estimate.steps,
          weight_lbs_at_log: weightLbs,
          note: note.trim() || null,
        })
        .select('id, session_date, activity_key, location, minutes, intensity, est_calories, est_steps, note')
        .single()

      if (error) throw error
      if (data) {
        // A backdated entry needs to land in date order, not always at the top,
        // which is only correct when logging for today.
        setRows(prev => [data as ActivityRow, ...prev].sort((a, b) => b.session_date.localeCompare(a.session_date)))
        setAdding(false)
        setNote('')
        setSessionDate(today)
        // Matches the same 5 points the old exercise_logs page gave per entry.
        // api/award-points.ts validates this refId against activity_sessions by
        // session_date, so it must be the date actually logged, not always today.
        await awardPoints(userId, 'exercise_log', 5, `${sessionDate}_${activityKey}`)
      }
    } catch (err) {
      console.error('[activity] save failed:', err)
      setSaveError('That did not save. Check your connection and try once more.')
    } finally {
      setSaving(false)
    }
  }

  async function removeActivity(id: string) {
    if (!userId) return
    const previous = rows
    setRows(prev => prev.filter(r => r.id !== id))
    const { error } = await supabase.from('activity_sessions').delete().eq('id', id).eq('user_id', userId)
    if (error) {
      console.error('[activity] delete failed:', error)
      setRows(previous)
      setSaveError('Could not remove that one. Try again.')
    }
  }

  const todayRows = rows.filter(r => r.session_date === today)
  const todayCalories = todayRows.reduce((sum, r) => sum + (r.est_calories ?? 0), 0)
  const todayMinutes = todayRows.reduce((sum, r) => sum + r.minutes, 0)

  // Points over the trailing 7 days, which is the window the weekly target is
  // written against.
  const weekAgo = format(subDays(new Date(), 6), 'yyyy-MM-dd')
  const weekPoints = rows
    .filter(r => r.session_date >= weekAgo)
    .reduce(
      (sum, r) =>
        sum + movementPoints({ activityKey: r.activity_key, minutes: r.minutes, intensity: r.intensity }),
      0
    )

  if (loading) return <p className={styles.loading}>Loading your activity...</p>

  return (
    <div className={styles.activityWrap}>
      <div className={styles.sectionHead}>
        <div>
          <h2 className={styles.sectionTitle}>Movement</h2>
          <p className={styles.sectionSub}>
            Walks, rebounding, HIIT, housework. Anything that is not sets and reps.
            Twenty squats after a meal counts. So does three minutes on the treadmill.
            Longer and harder is worth more, but everything counts for something.
          </p>
        </div>
        {!adding && (
          <button className={styles.primaryBtn} onClick={() => { setSessionDate(today); setAdding(true) }}>
            <Plus size={16} /> Log movement
          </button>
        )}
      </div>

      {loadError && <p className={styles.errorBox}>{loadError}</p>}

      {todayRows.length > 0 && (
        <div className={styles.todayTotals}>
          <div className={styles.totalItem}>
            <span className={styles.totalNum}>{todayMinutes}</span>
            <span className={styles.totalLbl}>minutes today</span>
          </div>
          <div className={styles.totalItem}>
            <span className={styles.totalNum}>~{todayCalories}</span>
            <span className={styles.totalLbl}>calories, estimated</span>
          </div>
          <div className={styles.totalItem}>
            <span className={styles.totalNum}>{weekPoints}</span>
            <span className={styles.totalLbl}>points this week of {WEEKLY_POINTS_TARGET}</span>
          </div>
        </div>
      )}

      {adding && (
        <div className={styles.addCard}>
          <div className={styles.addHead}>
            <span className={styles.addTitle}>What did you do?</span>
            <button className={styles.iconBtn} onClick={() => setAdding(false)} aria-label="Cancel">
              <X size={18} />
            </button>
          </div>

          <div className={styles.field}>
            <span className={styles.fieldLabel}>When</span>
            <input
              type="date"
              className={styles.textInput}
              value={sessionDate}
              max={today}
              onChange={e => setSessionDate(e.target.value)}
              aria-label="Date"
            />
          </div>

          <div className={styles.chipGrid}>
            {ACTIVITY_TYPES.map(a => (
              <button
                key={a.key}
                className={`${styles.chip} ${activityKey === a.key ? styles.chipActive : ''}`}
                onClick={() => {
                  setActivityKey(a.key)
                  // Land on a sensible default the moment a rep-based activity
                  // is picked, rather than carrying over whatever minute count
                  // the previous activity happened to be set to.
                  if (a.key === 'dead_bug') setMinutes(DEAD_BUG_MINUTES_PER_SET)
                  else if (a.key === 'squats') setMinutes(Math.max(1, Math.round((QUICK_SQUAT_REPS[0] / SQUAT_REPS_PER_MINUTE) * 10) / 10))
                  else if (activityKey === 'dead_bug' || activityKey === 'squats') setMinutes(30)
                }}
              >
                <span className={styles.chipEmoji}>{a.emoji}</span>
                <span className={styles.chipLabel}>{a.label}</span>
              </button>
            ))}
          </div>

          {activity.hasLocation && (
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Where</span>
              <div className={styles.segmented}>
                {(['indoor', 'outdoor'] as const).map(loc => (
                  <button
                    key={loc}
                    className={`${styles.segment} ${location === loc ? styles.segmentActive : ''}`}
                    onClick={() => setLocation(loc)}
                  >
                    {loc === 'indoor' ? 'Indoor' : 'Outdoor'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activityKey === 'dead_bug' ? (
            <div className={styles.field}>
              <span className={styles.fieldLabel}>How many sets (10 reps per side each)</span>
              <div className={styles.minuteRow}>
                {QUICK_DEAD_BUG_SETS.map(sets => (
                  <button
                    key={sets}
                    className={`${styles.minuteChip} ${minutes === sets * DEAD_BUG_MINUTES_PER_SET ? styles.minuteChipActive : ''}`}
                    onClick={() => setMinutes(sets * DEAD_BUG_MINUTES_PER_SET)}
                  >
                    {sets} {sets === 1 ? 'set' : 'sets'}
                  </button>
                ))}
              </div>
              <p className={styles.hint}>
                {Math.round(minutes / DEAD_BUG_MINUTES_PER_SET)} set{Math.round(minutes / DEAD_BUG_MINUTES_PER_SET) === 1 ? '' : 's'} ={' '}
                {Math.round(minutes / DEAD_BUG_MINUTES_PER_SET) * DEAD_BUG_REPS_PER_SET} reps total
              </p>
            </div>
          ) : activityKey === 'squats' ? (
            <div className={styles.field}>
              <span className={styles.fieldLabel}>How many reps</span>
              <div className={styles.minuteRow}>
                {QUICK_SQUAT_REPS.map(reps => (
                  <button
                    key={reps}
                    className={`${styles.minuteChip} ${minutes === Math.max(1, Math.round((reps / SQUAT_REPS_PER_MINUTE) * 10) / 10) ? styles.minuteChipActive : ''}`}
                    onClick={() => setMinutes(Math.max(1, Math.round((reps / SQUAT_REPS_PER_MINUTE) * 10) / 10))}
                  >
                    {reps}
                  </button>
                ))}
              </div>
              <p className={styles.hint}>
                Did more than one round? Tap again after logging, or tap a bigger number, both add up in your day's total.
              </p>
            </div>
          ) : (
            <div className={styles.field}>
              <span className={styles.fieldLabel}>How long</span>
              <div className={styles.minuteRow}>
                {QUICK_MINUTES.map(m => (
                  <button
                    key={m}
                    className={`${styles.minuteChip} ${minutes === m ? styles.minuteChipActive : ''}`}
                    onClick={() => setMinutes(m)}
                  >
                    {m}
                  </button>
                ))}
                <input
                  type="number"
                  className={styles.minuteInput}
                  value={minutes}
                  min={1}
                  max={600}
                  inputMode="numeric"
                  onChange={e => setMinutes(Math.max(1, Math.min(600, Number(e.target.value) || 1)))}
                  aria-label="Minutes"
                />
                <span className={styles.minuteUnit}>min</span>
              </div>
            </div>
          )}

          <div className={styles.field}>
            <span className={styles.fieldLabel}>How hard</span>
            <div className={styles.segmented}>
              {INTENSITIES.map(i => (
                <button
                  key={i}
                  className={`${styles.segment} ${intensity === i ? styles.segmentActive : ''}`}
                  onClick={() => setIntensity(i)}
                >
                  {INTENSITY_LABEL[i]}
                </button>
              ))}
            </div>
            <p className={styles.hint}>{activity.intensityHint[intensity]}</p>
            {activityKey === 'walk' && (
              <p className={styles.hint}>
                Walk goal: {WALK_GOAL_MINUTES} minutes. Shorter walks still count, they are just worth fewer points.
              </p>
            )}
          </div>

          {activity.note && <p className={styles.activityNote}>{activity.note}</p>}

          <div className={styles.field}>
            <span className={styles.fieldLabel}>Note, optional</span>
            <input
              type="text"
              className={styles.textInput}
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Walked with Marcia after work"
              maxLength={140}
            />
          </div>

          {!weightLbs ? (
            <div className={styles.weightPrompt}>
              <p className={styles.weightPromptText}>
                Calorie estimates need your weight. It stays on your device unless you log it in the weight tracker.
              </p>
              <div className={styles.weightRow}>
                <input
                  type="number"
                  className={styles.weightInput}
                  value={weightInput}
                  onChange={e => setWeightInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveWeight()}
                  placeholder="lbs"
                  inputMode="decimal"
                  aria-label="Body weight in pounds"
                />
                <button className={styles.secondaryBtn} onClick={saveWeight}>Save</button>
              </div>
            </div>
          ) : estimate && (
            <div className={styles.estimateBox}>
              <div className={styles.estimateRow}>
                <span className={styles.estimateNum}>
                  {movementPoints({ activityKey, minutes, intensity })}
                </span>
                <span className={styles.estimateLbl}>points</span>
                <span className={styles.estimateNum}>~{estimate.calories}</span>
                <span className={styles.estimateLbl}>calories</span>
                {estimate.steps !== null && (
                  <>
                    <span className={styles.estimateNum}>~{estimate.steps.toLocaleString()}</span>
                    <span className={styles.estimateLbl}>steps</span>
                  </>
                )}
              </div>

              <button
                className={styles.mathToggle}
                onClick={() => setShowMath(v => !v)}
                aria-expanded={showMath}
              >
                Show me the math
                <ChevronDown size={14} className={showMath ? styles.mathChevOpen : ''} />
              </button>

              {showMath && (
                <div className={styles.mathPanel}>
                  <p className={styles.mathLine}>
                    <strong>Step 1.</strong> {activity.label} at {INTENSITY_LABEL[intensity].toLowerCase()} effort
                    is rated <strong>{estimate.working.baseMet} METs</strong>. A MET is a multiple of what your body
                    burns sitting still, so this is {estimate.working.baseMet} times your resting burn.
                  </p>
                  {estimate.working.outdoorAdjusted && (
                    <p className={styles.mathLine}>
                      <strong>Step 2.</strong> Outdoors adds 5 percent for wind, slopes and uneven ground, which a flat
                      treadmill does not have. That brings it to <strong>{estimate.working.met} METs</strong>.
                    </p>
                  )}
                  <p className={styles.mathLine}>
                    <strong>Step {estimate.working.outdoorAdjusted ? '3' : '2'}.</strong> Your weight of{' '}
                    {estimate.working.weightLbs} lbs is {estimate.working.weightKg} kg. The standard equation is
                    METs times 3.5 times your weight in kg, divided by 200. That gives{' '}
                    <strong>{estimate.working.caloriesPerMinute} calories a minute</strong>.
                  </p>
                  <p className={styles.mathLine}>
                    <strong>Step {estimate.working.outdoorAdjusted ? '4' : '3'}.</strong>{' '}
                    {estimate.working.caloriesPerMinute} times {estimate.working.minutes} minutes ={' '}
                    <strong>about {estimate.calories} calories</strong>.
                  </p>
                  {estimate.working.cadence !== null && (
                    <p className={styles.mathLine}>
                      <strong>Steps.</strong> A {INTENSITY_LABEL[intensity].toLowerCase()} walk averages about{' '}
                      {estimate.working.cadence} steps a minute. Times {estimate.working.minutes} minutes ={' '}
                      <strong>about {estimate.steps?.toLocaleString()} steps</strong>. Your phone counts this better
                      than any estimate, so use it if you have it.
                    </p>
                  )}
                  {!activity.countsSteps && (
                    <p className={styles.mathLine}>
                      <strong>No step count.</strong> {activity.label} does not produce steps in any honest sense, so
                      none is shown rather than making a number up.
                    </p>
                  )}
                  <p className={styles.mathLine}>
                    <strong>Points.</strong> {estimate.working.baseMet} METs times {estimate.working.minutes}{' '}
                    minutes = <strong>{movementPoints({ activityKey, minutes, intensity })} points</strong>. This is
                    how sessions get weighed against each other, so a short hard effort and a long easy one both
                    count for what they are actually worth. {WEEKLY_POINTS_TARGET} points a week is the level the
                    physical activity guidelines describe as the minimum for real benefit.
                  </p>
                  <p className={styles.mathSource}>
                    MET values from the 2011 Compendium of Physical Activities (Ainsworth et al.). This is a gross
                    figure, meaning it includes the calories you would have burned resting during that time. That is
                    how fitness trackers report it too.
                  </p>
                </div>
              )}

              <p className={styles.disclaimer}>{ESTIMATE_DISCLAIMER}</p>
            </div>
          )}

          {saveError && <p className={styles.errorBox}>{saveError}</p>}

          <button
            className={styles.saveBtn}
            onClick={addActivity}
            disabled={saving || !estimate}
          >
            {saving ? 'Saving...' : 'Log it'}
          </button>
        </div>
      )}

      {rows.length === 0 && !adding ? (
        <p className={styles.emptyState}>
          Nothing logged yet. A twenty minute walk counts. So does mopping the floor.
        </p>
      ) : (
        <div className={styles.activityList}>
          {rows.slice(0, 20).map(r => {
            const a = findActivity(r.activity_key)
            return (
              <div key={r.id} className={styles.activityRow}>
                <span className={styles.activityEmoji}>{a?.emoji ?? '🏃'}</span>
                <div className={styles.activityBody}>
                  <span className={styles.activityName}>
                    {a?.label ?? r.activity_key}
                    {r.location ? ` · ${r.location}` : ''}
                  </span>
                  <span className={styles.activityMeta}>
                    {r.minutes} min · {INTENSITY_LABEL[r.intensity]}
                    {r.est_calories ? ` · ~${r.est_calories} cal` : ''}
                    {r.est_steps ? ` · ~${r.est_steps.toLocaleString()} steps` : ''}
                    {` · ${movementPoints({ activityKey: r.activity_key, minutes: r.minutes, intensity: r.intensity })} pts`}
                  </span>
                  {r.note && <span className={styles.activityUserNote}>{r.note}</span>}
                  <span className={styles.activityDate}>
                    {r.session_date === today
                      ? 'Today'
                      : format(new Date(r.session_date + 'T12:00:00'), 'EEE, MMM d')}
                  </span>
                </div>
                <button
                  className={styles.iconBtn}
                  onClick={() => removeActivity(r.id)}
                  aria-label={`Remove ${a?.label ?? 'activity'}`}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
