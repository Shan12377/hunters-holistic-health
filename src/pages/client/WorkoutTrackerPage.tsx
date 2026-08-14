import { useState, useEffect, useRef } from 'react'
import { CheckCircle2, Circle, Info, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { format, subDays } from 'date-fns'
import BackButton from '@/components/BackButton'
import ActivityLog from '@/components/workout/ActivityLog'
import SampleWeek from '@/components/workout/SampleWeek'
import RoutineBuilder, {
  type BuilderRoutine,
  type BuilderExercise,
} from '@/components/workout/RoutineBuilder'
import WorkoutHistory from '@/components/workout/WorkoutHistory'
import ExerciseVideoLink from '@/components/workout/ExerciseVideoLink'
import wk from '@/components/workout/Workout.module.css'
import styles from './Client.module.css'
import shared from '../../styles/shared.module.css'

interface Exercise {
  id: string
  name: string
  emoji: string | null
  coach_cue: string | null
  condition_notes: string | null
  muscle_groups: string[]
  tempo_default: string
  video_url: string | null
  video_channel: string | null
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
  routine_id?: string | null
  session_date: string
  energy_level: number | null
  completed_at: string | null
}

interface Routine {
  id: string
  name: string
  description: string
  video_url: string | null
  user_id: string | null
  exercises: RoutineExercise[]
}

interface ProgressEntry {
  date: string
  maxWeight: number | null
  maxReps: number | null
}

interface CustomExercise {
  id: string
  name: string
  sets_default: number
}

const ENERGY_LABELS = ['', 'Exhausted', 'Low', 'Okay', 'Good', 'Great']
const LIGHT_EXERCISES = ['Wall Sit', 'Calf Raises']

export default function WorkoutTrackerPage() {
  const { profile } = useAuthStore()
  const userId = profile?.id
  const today = format(new Date(), 'yyyy-MM-dd')

  // Starts on Routines. Somebody with nothing set up needs to build a routine
  // before Today means anything. Once they have one, the effect below moves them
  // to Today, because that is what a returning person came to do.
  const [tab, setTab] = useState<'today' | 'movement' | 'routines' | 'week' | 'history'>('routines')
  const tabTouched = useRef(false)

  function selectTab(next: typeof tab) {
    tabTouched.current = true
    setTab(next)
  }
  const [allRoutines, setAllRoutines] = useState<Routine[]>([])
  const [library, setLibrary] = useState<BuilderExercise[]>([])
  const [selectedRoutineIdx, setSelectedRoutineIdx] = useState<number>(
    () => Number(localStorage.getItem('wk_routine_idx') ?? '0')
  )
  const [routineId, setRoutineId] = useState<string | null>(null)
  const [routineExercises, setRoutineExercises] = useState<RoutineExercise[]>([])
  const [session, setSession] = useState<WorkoutSession | null>(null)
  const [todaySets, setTodaySets] = useState<ExerciseSet[]>([])
  const [lastSets, setLastSets] = useState<Record<string, ExerciseSet[]>>({})
  const [history, setHistory] = useState<WorkoutSession[]>([])
  const [progressData, setProgressData] = useState<Record<string, ProgressEntry[]>>({})
  const [infoExercise, setInfoExercise] = useState<Exercise | null>(null)
  const [customExercises, setCustomExercises] = useState<CustomExercise[]>([])
  const [addingCustom, setAddingCustom] = useState(false)
  const [newExName, setNewExName] = useState('')
  const [newExSets, setNewExSets] = useState(3)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    loadRoutines()
      .then(routines => {
        if (userId && routines) {
          loadTodaySessionWithRoutines(routines)
          loadHistory()
          loadCustomExercises()
          loadLibrary()
        }
      })
      .catch(err => {
        console.error('[workout] initial load failed:', err)
        setLoadError('Could not load your workouts. Check your connection and try again.')
      })
      .finally(() => setLoading(false))
  }, [userId])

  useEffect(() => {
    if (userId && tab === 'history') loadProgress()
  }, [userId, tab])

  useEffect(() => {
    if (loading || tabTouched.current) return
    if (allRoutines.some(r => r.user_id === userId)) setTab('today')
  }, [loading, allRoutines, userId])

  const EXERCISE_FIELDS =
    'id, name, emoji, coach_cue, condition_notes, muscle_groups, tempo_default, created_by_user_id, video_url, video_channel'

  async function loadRoutines(): Promise<Routine[] | null> {
    const { data, error } = await supabase
      .from('workout_routines')
      .select(`id, name, description, video_url, user_id, routine_exercises(id, order_position, sets_default, reps_default, exercise:exercises(${EXERCISE_FIELDS}))`)
      .order('name', { ascending: true })

    if (error) throw error
    if (!data?.length) { setAllRoutines([]); return null }

    const routines: Routine[] = data.map(r => ({
      id: r.id,
      name: r.name,
      description: r.description,
      video_url: r.video_url,
      user_id: r.user_id,
      exercises: [...(r.routine_exercises as unknown as RoutineExercise[])].sort(
        (a, b) => a.order_position - b.order_position
      )
    }))

    setAllRoutines(routines)

    // The Today tab logs against one routine. Prefer the person's own, since a
    // routine they built is the one they actually meant to do.
    const own = routines.filter(r => r.user_id === userId)
    const loggable = own.length ? own : routines
    const savedIdx = Number(localStorage.getItem('wk_routine_idx') ?? '0')
    const idx = savedIdx < loggable.length ? savedIdx : 0
    if (loggable[idx]) applyRoutine(loggable[idx])
    return routines
  }

  /** The shared exercise library plus this person's own, for the routine builder. */
  async function loadLibrary() {
    const { data, error } = await supabase
      .from('exercises')
      .select('id, name, emoji, muscle_groups, tempo_default, created_by_user_id, video_url, video_channel')
      .order('name', { ascending: true })
    if (error) {
      console.error('[workout] library load failed:', error)
      return
    }
    setLibrary((data ?? []) as BuilderExercise[])
  }

  /** Re-read everything the builder can change. */
  async function refreshRoutines() {
    try {
      await loadRoutines()
      await loadLibrary()
    } catch (err) {
      console.error('[workout] refresh failed:', err)
      setLoadError('Could not refresh your routines. Try again.')
    }
  }

  function applyRoutine(routine: Routine) {
    setRoutineId(routine.id)
    setRoutineExercises(routine.exercises)
  }

  // The Today tab logs against the person's own routines when they have any.
  // Templates are only the fallback for somebody who has not built one yet, so
  // nobody is made to log a routine that is not theirs.
  const ownRoutines = allRoutines.filter(r => r.user_id === userId)
  const loggableRoutines = ownRoutines.length ? ownRoutines : allRoutines

  function switchRoutine(idx: number) {
    if (session) return // locked once a session exists today
    const routine = loggableRoutines[idx]
    if (!routine) return
    setSelectedRoutineIdx(idx)
    localStorage.setItem('wk_routine_idx', String(idx))
    applyRoutine(routine)
  }

  async function loadTodaySessionWithRoutines(routines: Routine[]) {
    if (!userId) return
    // More than one session a day is now allowed, so this can no longer assume a
    // single row. The strength session for today is the most recent one.
    const { data } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('session_date', today)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (data) {
      setSession(data)
      const { data: sets } = await supabase
        .from('exercise_sets')
        .select('*')
        .eq('session_id', data.id)
      setTodaySets(sets ?? [])
      // sync the displayed routine to match the session's logged routine
      if (data.routine_id) {
        const own = routines.filter(r => r.user_id === userId)
        const loggable = own.length ? own : routines
        const idx = loggable.findIndex(r => r.id === data.routine_id)
        if (idx >= 0) {
          setSelectedRoutineIdx(idx)
          applyRoutine(loggable[idx])
        }
      }
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
      .order('created_at', { ascending: false })
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

  async function loadProgress() {
    if (!userId) return
    const since = format(subDays(new Date(), 89), 'yyyy-MM-dd')

    const { data: sessions } = await supabase
      .from('workout_sessions')
      .select('id, session_date')
      .eq('user_id', userId)
      .gte('session_date', since)
      .order('session_date', { ascending: true })

    if (!sessions?.length) return

    const sessionDateMap: Record<string, string> = {}
    sessions.forEach(s => { sessionDateMap[s.id] = s.session_date })

    const { data: sets } = await supabase
      .from('exercise_sets')
      .select('exercise_id, session_id, reps, weight_lbs')
      .in('session_id', sessions.map(s => s.id))

    const byExAndDate: Record<string, Record<string, { maxWeight: number | null; maxReps: number | null }>> = {}
    sets?.forEach(set => {
      const date = sessionDateMap[set.session_id]
      if (!date) return
      if (!byExAndDate[set.exercise_id]) byExAndDate[set.exercise_id] = {}
      if (!byExAndDate[set.exercise_id][date]) byExAndDate[set.exercise_id][date] = { maxWeight: null, maxReps: null }
      const entry = byExAndDate[set.exercise_id][date]
      if (set.weight_lbs !== null && (entry.maxWeight === null || set.weight_lbs > entry.maxWeight)) entry.maxWeight = set.weight_lbs
      if (set.reps !== null && (entry.maxReps === null || set.reps > entry.maxReps)) entry.maxReps = set.reps
    })

    const result: Record<string, ProgressEntry[]> = {}
    Object.entries(byExAndDate).forEach(([exerciseId, dateMap]) => {
      result[exerciseId] = Object.entries(dateMap)
        .map(([date, vals]) => ({ date, ...vals }))
        .sort((a, b) => a.date.localeCompare(b.date))
    })
    setProgressData(result)
  }

  async function loadCustomExercises() {
    if (!userId) return
    const { data } = await supabase
      .from('exercises')
      .select('id, name, sets_default')
      .eq('created_by_user_id', userId)
      .order('created_at', { ascending: true })
    setCustomExercises(data ?? [])
  }

  async function addCustomExercise() {
    if (!newExName.trim() || !userId) return
    const { data } = await supabase
      .from('exercises')
      .insert({ name: newExName.trim(), sets_default: newExSets, created_by_user_id: userId, muscle_groups: [] })
      .select('id, name, sets_default')
      .single()
    if (data) {
      setCustomExercises(prev => [...prev, data])
      setNewExName('')
      setNewExSets(3)
      setAddingCustom(false)
    }
  }

  async function removeCustomExercise(id: string) {
    await supabase.from('exercises').delete().eq('id', id).eq('created_by_user_id', userId!)
    setCustomExercises(prev => prev.filter(e => e.id !== id))
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
    if (!s) return ', '
    if (s.reps && s.weight_lbs) return `${s.reps} @ ${s.weight_lbs}`
    if (s.reps) return `${s.reps} reps`
    if (s.completed) return 'done'
    return ', '
  }

  const isComplete = (exerciseId: string) =>
    todaySets.some(s => s.exercise_id === exerciseId && (s.completed || s.reps !== null))

  const displayedExercises = session?.energy_level && session.energy_level <= 2
    ? routineExercises.filter(re => LIGHT_EXERCISES.includes(re.exercise.name))
    : routineExercises

  const completedCount = displayedExercises.filter(re => isComplete(re.exercise.id)).length

  // Everything that could show a strength progress chart: exercises from any
  // routine the person can see, plus the ones they added themselves. Deduped,
  // since the same exercise appears in more than one routine.
  const chartableExercises = [
    ...allRoutines.flatMap(r => r.exercises.map(re => ({
      id: re.exercise.id,
      name: re.exercise.name,
      emoji: re.exercise.emoji,
      tempo_default: re.exercise.tempo_default,
    }))),
    ...customExercises.map(ex => ({
      id: ex.id,
      name: ex.name,
      emoji: null,
      tempo_default: '',
    })),
  ].filter((ex, i, arr) => arr.findIndex(x => x.id === ex.id) === i)

  if (loading) return <div className={shared.pageContainer}><p className={shared.loadingText}>Loading...</p></div>

  return (
    <div className={shared.pageContainer}>
      <BackButton />
      <div className={shared.pageHeader}>
        <h1 className={shared.pageTitle}>Workout Tracker</h1>
        <p className={shared.pageSubtitle}>Built for the people every other fitness app left out.</p>
      </div>

      <div className={styles.wkTabs}>
        {([
          // Routines comes first on purpose. Somebody who has not built one yet
          // lands on Today with an empty checklist and no idea why, so the tab
          // that explains what to set up has to come before the one that logs it.
          ['routines', 'Routines'],
          ['today', 'Today'],
          ['movement', 'Movement'],
          ['week', 'Week'],
          ['history', 'History'],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            className={`${styles.wkTab} ${tab === key ? styles.wkTabActive : ''}`}
            onClick={() => selectTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {loadError && <p className={wk.errorBox}>{loadError}</p>}

      {/* TODAY TAB */}
      {tab === 'today' && (
        <div>
          {loggableRoutines.length > 1 && (
            <div className={styles.wkRoutinePicker}>
              <span className={styles.wkRoutinePickerLabel}>Today's routine:</span>
              <div className={styles.wkRoutinePickerBtns}>
                {loggableRoutines.map((r, i) => (
                  <button
                    key={r.id}
                    className={`${styles.wkRoutinePickerBtn} ${selectedRoutineIdx === i ? styles.wkRoutinePickerBtnActive : ''}`}
                    onClick={() => switchRoutine(i)}
                    disabled={!!session}
                    title={session ? 'Locked after session starts' : r.description}
                  >
                    {r.name}
                  </button>
                ))}
              </div>
              {session && (
                <p className={styles.wkRoutinePickerLocked}>Locked to {loggableRoutines[selectedRoutineIdx]?.name ?? 'current routine'} for today.</p>
              )}
            </div>
          )}

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
                          <span className={styles.wkExName}>
                            <span className={wk.builderEmoji}>{ex.emoji ?? '💪'}</span> {ex.name}
                            <ExerciseVideoLink url={ex.video_url} channel={ex.video_channel} />
                          </span>
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
                                    placeholder=", "
                                    min={1}
                                    inputMode="numeric"
                                  />
                                  <input
                                    type="number"
                                    className={styles.wkSetInput}
                                    defaultValue={currentSet?.weight_lbs ?? ''}
                                    onBlur={e => updateSetValue(ex.id, setNum, 'weight_lbs', e.target.value)}
                                    placeholder=", "
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

              {/* Custom exercises */}
              <div className={styles.wkCustomSection}>
                <div className={styles.wkCustomHeader}>
                  <span className={styles.wkCustomLabel}>Your exercises</span>
                  {!addingCustom && (
                    <button className={styles.wkAddExBtn} onClick={() => setAddingCustom(true)}>+ Add</button>
                  )}
                </div>

                {addingCustom && (
                  <div className={styles.wkAddExForm}>
                    <input
                      type="text"
                      className={styles.wkAddExInput}
                      placeholder="Exercise name (e.g. Push-ups)"
                      value={newExName}
                      onChange={e => setNewExName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addCustomExercise()}
                      autoFocus
                    />
                    <div className={styles.wkAddExControls}>
                      <label className={styles.wkAddExSetsLabel}>Sets:</label>
                      <input
                        type="number"
                        className={styles.wkAddExSets}
                        min={1}
                        max={10}
                        value={newExSets}
                        onChange={e => setNewExSets(Number(e.target.value))}
                        inputMode="numeric"
                      />
                      <button className={styles.wkAddExSave} onClick={addCustomExercise}>Save</button>
                      <button className={styles.wkAddExCancel} onClick={() => { setAddingCustom(false); setNewExName('') }}>Cancel</button>
                    </div>
                  </div>
                )}

                {customExercises.length === 0 && !addingCustom && (
                  <p className={styles.wkCustomEmpty}>Add any exercise you like. Push-ups, pull-ups, whatever you are working on.</p>
                )}

                {customExercises.map(ex => {
                  const done = isComplete(ex.id)
                  const sets = ex.sets_default ?? 3
                  return (
                    <div key={ex.id} className={`${styles.wkExCard} ${done ? styles.wkExCardDone : ''}`}>
                      <div className={styles.wkExRow}>
                        <div className={styles.wkCheckBtn}>
                          {done
                            ? <CheckCircle2 size={26} className={styles.wkCheckDone} />
                            : <Circle size={26} className={styles.wkCheckEmpty} />
                          }
                        </div>
                        <div className={styles.wkExBody}>
                          <span className={styles.wkExName}>{ex.name}</span>
                          <span className={styles.wkExMeta}>{sets} sets</span>
                        </div>
                        <button
                          className={styles.wkExDeleteBtn}
                          onClick={() => removeCustomExercise(ex.id)}
                          aria-label="Remove exercise"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      <div className={styles.wkSetTable}>
                        <div className={styles.wkSetHeaderRow}>
                          <span>Set</span>
                          <span>Last session</span>
                          <span>Reps</span>
                          <span>Wt (lbs)</span>
                        </div>
                        {Array.from({ length: sets }, (_, i) => i + 1).map(setNum => {
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
                                placeholder=", "
                                min={1}
                                inputMode="numeric"
                              />
                              <input
                                type="number"
                                className={styles.wkSetInput}
                                defaultValue={currentSet?.weight_lbs ?? ''}
                                onBlur={e => updateSetValue(ex.id, setNum, 'weight_lbs', e.target.value)}
                                placeholder=", "
                                min={0}
                                step={2.5}
                                inputMode="decimal"
                              />
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* MOVEMENT TAB */}
      {tab === 'movement' && <ActivityLog userId={userId} today={today} />}

      {/* WEEK TAB */}
      {tab === 'week' && <SampleWeek />}

      {/* ROUTINES TAB */}
      {tab === 'routines' && (
        <RoutineBuilder
          userId={userId}
          routines={allRoutines as unknown as BuilderRoutine[]}
          library={library}
          onChanged={refreshRoutines}
        />
      )}

      {/* HISTORY TAB */}
      {tab === 'history' && (
        <WorkoutHistory
          history={history}
          progressData={progressData}
          chartable={chartableExercises}
          energyLabels={ENERGY_LABELS}
        />
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
            <ExerciseVideoLink
              url={infoExercise.video_url}
              channel={infoExercise.video_channel}
              variant="block"
            />
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
