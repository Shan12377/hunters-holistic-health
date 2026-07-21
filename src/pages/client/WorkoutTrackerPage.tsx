import { useState, useEffect } from 'react'
import { CheckCircle2, Circle, Info, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { format, subDays } from 'date-fns'
import styles from './Client.module.css'
import shared from '../../styles/shared.module.css'

interface Exercise {
  id: string
  name: string
  coach_cue: string | null
  condition_notes: string | null
  muscle_groups: string[]
  tempo_default: string
}

interface RoutineExercise {
  id: string
  order_position: number
  sets_default: number
  reps_default: number | null
  exercise: Exercise
}

interface ExerciseSet {
  id: string
  session_id: string
  exercise_id: string
  set_number: number
  reps: number | null
  weight_lbs: number | null
  completed: boolean
}

interface WorkoutSession {
  id: string
  session_date: string
  energy_level: number | null
  completed_at: string | null
}

const ENERGY_LABELS = ['', 'Exhausted', 'Low', 'Okay', 'Good', 'Great']
const LIGHT_EXERCISES = ['Wall Sit', 'Calf Raises']

export default function WorkoutTrackerPage() {
  const { profile } = useAuthStore()
  const userId = profile?.id
  const today = format(new Date(), 'yyyy-MM-dd')

  const [tab, setTab] = useState<'today' | 'routines' | 'history'>('today')
  const [routineId, setRoutineId] = useState<string | null>(null)
  const [routineExercises, setRoutineExercises] = useState<RoutineExercise[]>([])
  const [session, setSession] = useState<WorkoutSession | null>(null)
  const [todaySets, setTodaySets] = useState<ExerciseSet[]>([])
  const [lastSets, setLastSets] = useState<Record<string, ExerciseSet[]>>({})
  const [history, setHistory] = useState<WorkoutSession[]>([])
  const [infoExercise, setInfoExercise] = useState<Exercise | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadRoutine() }, [])

  useEffect(() => {
    if (userId) {
      loadTodaySession()
      loadHistory()
    }
  }, [userId])

  async function loadRoutine() {
    const { data } = await supabase
      .from('workout_routines')
      .select('id, routine_exercises(id, order_position, sets_default, reps_default, exercise:exercises(id, name, coach_cue, condition_notes, muscle_groups, tempo_default))')
      .eq('is_default', true)
      .single()

    if (data) {
      setRoutineId(data.id)
      const sorted = [...(data.routine_exercises as unknown as RoutineExercise[])].sort(
        (a, b) => a.order_position - b.order_position
      )
      setRoutineExercises(sorted)
    }
    setLoading(false)
  }

  async function loadTodaySession() {
    if (!userId) return
    const { data } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('session_date', today)
      .maybeSingle()

    if (data) {
      setSession(data)
      const { data: sets } = await supabase
        .from('exercise_sets')
        .select('*')
        .eq('session_id', data.id)
      setTodaySets(sets ?? [])
    }
    loadLastSession()
  }

  async function loadLastSession() {
    if (!userId) return
    const { data: prev } = await supabase
      .from('workout_sessions')
      .select('id')
      .eq('user_id', userId)
      .lt('session_date', today)
      .order('session_date', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!prev) return
    const { data: sets } = await supabase
      .from('exercise_sets')
      .select('*')
      .eq('session_id', prev.id)

    const grouped: Record<string, ExerciseSet[]> = {}
    sets?.forEach(s => {
      if (!grouped[s.exercise_id]) grouped[s.exercise_id] = []
      grouped[s.exercise_id].push(s)
    })
    setLastSets(grouped)
  }

  async function loadHistory() {
    if (!userId) return
    const since = format(subDays(new Date(), 29), 'yyyy-MM-dd')
    const { data } = await supabase
      .from('workout_sessions')
      .select('id, session_date, energy_level, completed_at')
      .eq('user_id', userId)
      .gte('session_date', since)
      .order('session_date', { ascending: false })
    setHistory(data ?? [])
  }

  async function selectEnergy(level: number) {
    if (!userId || saving) return
    setSaving(true)

    if (session) {
      await supabase.from('workout_sessions').update({ energy_level: level }).eq('id', session.id)
      setSession(prev => prev ? { ...prev, energy_level: level } : null)
    } else {
      const { data } = await supabase
        .from('workout_sessions')
        .insert({ user_id: userId, routine_id: routineId, session_date: today, energy_level: level })
        .select()
        .single()
      if (data) setSession(data)
    }
    setSaving(false)
  }

  async function toggleIsometricSet(exerciseId: string, setNum: number) {
    if (!session || saving) return
    const existing = todaySets.find(s => s.exercise_id === exerciseId && s.set_number === setNum)

    if (existing?.completed) {
      await supabase.from('exercise_sets').delete().eq('id', existing.id)
      setTodaySets(prev => prev.filter(s => s.id !== existing.id))
    } else if (existing) {
      await supabase.from('exercise_sets').update({ completed: true }).eq('id', existing.id)
      setTodaySets(prev => prev.map(s => s.id === existing.id ? { ...s, completed: true } : s))
    } else {
      const { data } = await supabase
        .from('exercise_sets')
        .insert({ session_id: session.id, exercise_id: exerciseId, set_number: setNum, completed: true })
        .select()
        .single()
      if (data) setTodaySets(prev => [...prev, data])
    }
  }

  async function updateSetValue(exerciseId: string, setNum: number, field: 'reps' | 'weight_lbs', value: string) {
    if (!session) return
    const num = value === '' ? null : Number(value)
    const existing = todaySets.find(s => s.exercise_id === exerciseId && s.set_number === setNum)

    if (existing) {
      await supabase.from('exercise_sets').update({ [field]: num }).eq('id', existing.id)
      setTodaySets(prev => prev.map(s => s.id === existing.id ? { ...s, [field]: num } : s))
    } else if (num !== null) {
      const { data } = await supabase
        .from('exercise_sets')
        .insert({ session_id: session.id, exercise_id: exerciseId, set_number: setNum, [field]: num, completed: true })
        .select()
        .single()
      if (data) setTodaySets(prev => [...prev, data])
    }
  }

  function lastSetLabel(exerciseId: string, setNum: number): string {
    const s = lastSets[exerciseId]?.find(s => s.set_number === setNum)
    if (!s) return '—'
    if (s.reps && s.weight_lbs) return `${s.reps} @ ${s.weight_lbs}`
    if (s.reps) return `${s.reps} reps`
    if (s.completed) return 'done'
    return '—'
  }

  const isComplete = (exerciseId: string) =>
    todaySets.some(s => s.exercise_id === exerciseId && (s.completed || s.reps !== null))

  const displayedExercises = session?.energy_level && session.energy_level <= 2
    ? routineExercises.filter(re => LIGHT_EXERCISES.includes(re.exercise.name))
    : routineExercises

  const completedCount = displayedExercises.filter(re => isComplete(re.exercise.id)).length

  const calendarDays = Array.from({ length: 30 }, (_, i) => format(subDays(new Date(), 29 - i), 'yyyy-MM-dd'))
  const sessionDates = new Set(history.map(s => s.session_date))

  if (loading) return <div className={shared.pageContainer}><p className={shared.loadingText}>Loading...</p></div>

  return (
    <div className={shared.pageContainer}>
      <div className={shared.pageHeader}>
        <h1 className={shared.pageTitle}>Workout Tracker</h1>
        <p className={shared.pageSubtitle}>Built for the people every other fitness app left out.</p>
      </div>

      <div className={styles.wkTabs}>
        {(['today', 'routines', 'history'] as const).map(t => (
          <button
            key={t}
            className={`${styles.wkTab} ${tab === t ? styles.wkTabActive : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'today' ? 'Today' : t === 'routines' ? 'My Routines' : 'History'}
          </button>
        ))}
      </div>

      {/* TODAY TAB */}
      {tab === 'today' && (
        <div>
          <div className={styles.wkEnergyCard}>
            <p className={styles.wkEnergyPrompt}>How do you feel today?</p>
            <div className={styles.wkEnergyRow}>
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  className={`${styles.wkEnergyBtn} ${session?.energy_level === n ? styles.wkEnergyBtnActive : ''}`}
                  onClick={() => selectEnergy(n)}
                  disabled={saving}
                >
                  <span className={styles.wkEnergyNum}>{n}</span>
                  <span className={styles.wkEnergyLbl}>{ENERGY_LABELS[n]}</span>
                </button>
              ))}
            </div>
            {session?.energy_level && session.energy_level <= 2 && (
              <p className={styles.wkLightNote}>
                Showing a lighter session today: Wall Sit and Calf Raises only. Rest is part of the protocol.
              </p>
            )}
          </div>

          {session?.energy_level && (
            <>
              <p className={styles.wkProgressLine}>
                {completedCount} of {displayedExercises.length} exercises done today
              </p>

              <div className={styles.wkExList}>
                {displayedExercises.map(re => {
                  const ex = re.exercise
                  const done = isComplete(ex.id)
                  const isIsometric = ex.tempo_default === 'isometric-2min'

                  return (
                    <div key={ex.id} className={`${styles.wkExCard} ${done ? styles.wkExCardDone : ''}`}>
                      <div className={styles.wkExRow}>
                        <div className={styles.wkCheckBtn} aria-label={done ? 'Exercise logged' : 'Not started'}>
                          {done
                            ? <CheckCircle2 size={26} className={styles.wkCheckDone} />
                            : <Circle size={26} className={styles.wkCheckEmpty} />
                          }
                        </div>

                        <div className={styles.wkExBody}>
                          <span className={styles.wkExName}>{ex.name}</span>
                          <span className={styles.wkExMeta}>
                            {re.sets_default} sets
                            {isIsometric ? ' · 2 min hold' : re.reps_default ? ` · ${re.reps_default} reps` : ''}
                            {' · '}{ex.muscle_groups.join(', ')}
                          </span>
                          {ex.coach_cue && <span className={styles.wkCue}>"{ex.coach_cue}"</span>}
                        </div>

                        <button
                          className={styles.wkInfoBtn}
                          onClick={() => setInfoExercise(ex)}
                          aria-label="View modification notes"
                        >
                          <Info size={15} />
                        </button>
                      </div>

                      {/* Per-set logging table */}
                      <div className={styles.wkSetTable}>
                        {isIsometric ? (
                          <div className={styles.wkIsoSets}>
                            {Array.from({ length: re.sets_default }, (_, i) => i + 1).map(setNum => {
                              const setDone = todaySets.some(s => s.exercise_id === ex.id && s.set_number === setNum && s.completed)
                              const lastDone = lastSets[ex.id]?.find(s => s.set_number === setNum)?.completed
                              return (
                                <div key={setNum} className={styles.wkIsoRow}>
                                  <span className={styles.wkIsoLabel}>Set {setNum}</span>
                                  {lastDone && <span className={styles.wkIsoLast}>done last time</span>}
                                  <button
                                    className={`${styles.wkIsoDoneBtn} ${setDone ? styles.wkIsoDoneBtnActive : ''}`}
                                    onClick={() => toggleIsometricSet(ex.id, setNum)}
                                  >
                                    {setDone ? 'Done' : 'Mark done'}
                                  </button>
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          <>
                            <div className={styles.wkSetHeaderRow}>
                              <span>Set</span>
                              <span>Last session</span>
                              <span>Reps</span>
                              <span>Wt (lbs)</span>
                            </div>
                            {Array.from({ length: re.sets_default }, (_, i) => i + 1).map(setNum => {
                              const currentSet = todaySets.find(s => s.exercise_id === ex.id && s.set_number === setNum)
                              return (
                                <div key={`${ex.id}-${setNum}-${currentSet?.id ?? 'new'}`} className={styles.wkSetRow}>
                                  <span className={styles.wkSetNum}>{setNum}</span>
                                  <span className={styles.wkSetLast}>{lastSetLabel(ex.id, setNum)}</span>
                                  <input
                                    type="number"
                                    className={styles.wkSetInput}
                                    defaultValue={currentSet?.reps ?? ''}
                                    onBlur={e => updateSetValue(ex.id, setNum, 'reps', e.target.value)}
                                    placeholder="—"
                                    min={1}
                                    inputMode="numeric"
                                  />
                                  <input
                                    type="number"
                                    className={styles.wkSetInput}
                                    defaultValue={currentSet?.weight_lbs ?? ''}
                                    onBlur={e => updateSetValue(ex.id, setNum, 'weight_lbs', e.target.value)}
                                    placeholder="—"
                                    min={0}
                                    step={2.5}
                                    inputMode="decimal"
                                  />
                                </div>
                              )
                            })}
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {completedCount > 0 && completedCount === displayedExercises.length && (
                <div className={styles.wkAllDone}>
                  Session complete. {completedCount} exercises logged. Good work.
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* MY ROUTINES TAB */}
      {tab === 'routines' && (
        <div className={styles.wkRoutineCard}>
          <h2 className={styles.wkRoutineTitle}>Routine A</h2>
          <p className={styles.wkRoutineDesc}>
            Full-body resistance training. Compound movements first, isolation last.
            If blood pressure management is a goal, the Wall Sit comes first.
            When energy is low (1 or 2), the app shows Wall Sit and Calf Raises only.
          </p>
          <div className={styles.wkRoutineList}>
            {routineExercises.map((re, i) => {
              const ex = re.exercise
              const isIsometric = ex.tempo_default === 'isometric-2min'
              return (
                <div key={re.id} className={styles.wkRoutineRow}>
                  <span className={styles.wkRoutineNum}>{i + 1}</span>
                  <div className={styles.wkRoutineDetail}>
                    <span className={styles.wkRoutineName}>{ex.name}</span>
                    <span className={styles.wkRoutineMeta}>
                      {re.sets_default} sets
                      {isIsometric ? ' · 2 min hold' : re.reps_default ? ` · ${re.reps_default} reps` : ''}
                      {' · '}{ex.muscle_groups.join(', ')}
                    </span>
                    <span className={styles.wkRoutineTempo}>
                      Tempo: {isIsometric ? '2-minute isometric hold' : `${ex.tempo_default} (lower - pause - lift)`}
                    </span>
                  </div>
                  <button
                    className={styles.wkInfoBtn}
                    onClick={() => setInfoExercise(ex)}
                    aria-label="View modification notes"
                  >
                    <Info size={15} />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* HISTORY TAB */}
      {tab === 'history' && (
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
              No sessions yet. Start your first workout on the Today tab.
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
                      Energy {s.energy_level}/5 · {ENERGY_LABELS[s.energy_level]}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Info modal */}
      {infoExercise && (
        <div className={styles.wkInfoOverlay} onClick={() => setInfoExercise(null)}>
          <div className={styles.wkInfoModal} onClick={e => e.stopPropagation()}>
            <div className={styles.wkInfoHeader}>
              <h3 className={styles.wkInfoTitle}>{infoExercise.name}</h3>
              <button className={styles.wkInfoClose} onClick={() => setInfoExercise(null)} aria-label="Close">
                <X size={18} />
              </button>
            </div>
            {infoExercise.coach_cue && (
              <div className={styles.wkInfoSection}>
                <span className={styles.wkInfoLabel}>Coaching cue</span>
                <p className={styles.wkInfoText}>{infoExercise.coach_cue}</p>
              </div>
            )}
            {infoExercise.condition_notes && (
              <div className={styles.wkInfoSection}>
                <span className={styles.wkInfoLabel}>Modification note</span>
                <p className={styles.wkInfoText}>{infoExercise.condition_notes}</p>
              </div>
            )}
            <div className={styles.wkInfoSection}>
              <span className={styles.wkInfoLabel}>Muscle groups</span>
              <p className={styles.wkInfoText}>{infoExercise.muscle_groups.join(', ')}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
