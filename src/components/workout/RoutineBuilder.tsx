import { useState } from 'react'
import { Plus, X, Trash2, ChevronUp, ChevronDown, Copy } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import ExerciseVideoLink from './ExerciseVideoLink'
import styles from './Workout.module.css'

export interface BuilderExercise {
  id: string
  name: string
  emoji: string | null
  muscle_groups: string[]
  tempo_default: string
  created_by_user_id: string | null
  video_url: string | null
  video_channel: string | null
}

export interface BuilderRoutineExercise {
  id: string
  order_position: number
  sets_default: number
  reps_default: number | null
  exercise: BuilderExercise
}

export interface BuilderRoutine {
  id: string
  name: string
  description: string | null
  video_url: string | null
  user_id: string | null
  exercises: BuilderRoutineExercise[]
}

interface Props {
  userId: string | undefined
  routines: BuilderRoutine[]
  library: BuilderExercise[]
  onChanged: () => void
}

/**
 * Routines a person builds for themselves.
 *
 * A routine with a null user_id is a shared template. Templates are read only
 * from here: you copy one into your own routines and change it from there.
 * Nothing forces anybody to log a movement that does not work for their body.
 */
export default function RoutineBuilder({ userId, routines, library, onChanged }: Props) {
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [addingTo, setAddingTo] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const mine = routines.filter(r => r.user_id === userId)
  const templates = routines.filter(r => r.user_id === null)

  function fail(message: string, err: unknown) {
    console.error('[routine-builder]', message, err)
    setError(message)
    setBusy(false)
  }

  async function createRoutine() {
    const name = newName.trim()
    if (!name || !userId || busy) return
    setBusy(true)
    setError(null)
    const { error: err } = await supabase
      .from('workout_routines')
      .insert({ name, user_id: userId, description: null, is_default: false })
    if (err) {
      fail(
        err.code === '23505'
          ? 'You already have a routine with that name. Pick another.'
          : 'Could not create that routine. Try again.',
        err
      )
      return
    }
    setNewName('')
    setCreating(false)
    setBusy(false)
    onChanged()
  }

  async function copyTemplate(template: BuilderRoutine) {
    if (!userId || busy) return
    setBusy(true)
    setError(null)

    // Name it uniquely for this person so a second copy does not collide.
    const existing = new Set(mine.map(r => r.name))
    let name = `My ${template.name}`
    let n = 2
    while (existing.has(name)) { name = `My ${template.name} ${n}`; n += 1 }

    const { data: created, error: createErr } = await supabase
      .from('workout_routines')
      .insert({
        name,
        user_id: userId,
        description: template.description,
        is_default: false,
      })
      .select('id')
      .single()

    if (createErr || !created) { fail('Could not copy that routine. Try again.', createErr); return }

    const payload = template.exercises.map((re, i) => ({
      routine_id: created.id,
      exercise_id: re.exercise.id,
      order_position: i + 1,
      sets_default: re.sets_default,
      reps_default: re.reps_default,
    }))

    if (payload.length) {
      const { error: exErr } = await supabase.from('routine_exercises').insert(payload)
      if (exErr) {
        // Leave no half-built routine behind.
        await supabase.from('workout_routines').delete().eq('id', created.id)
        fail('Could not copy the exercises across. Nothing was saved.', exErr)
        return
      }
    }

    setBusy(false)
    onChanged()
  }

  async function deleteRoutine(routine: BuilderRoutine) {
    if (!userId || busy) return
    setBusy(true)
    setError(null)
    const { error: err } = await supabase
      .from('workout_routines')
      .delete()
      .eq('id', routine.id)
      .eq('user_id', userId)
    if (err) { fail('Could not delete that routine.', err); return }
    setBusy(false)
    onChanged()
  }

  async function addExercise(routine: BuilderRoutine, exercise: BuilderExercise) {
    if (busy) return
    setBusy(true)
    setError(null)
    const nextPos = routine.exercises.length
      ? Math.max(...routine.exercises.map(e => e.order_position)) + 1
      : 1
    const { error: err } = await supabase.from('routine_exercises').insert({
      routine_id: routine.id,
      exercise_id: exercise.id,
      order_position: nextPos,
      sets_default: 3,
      reps_default: exercise.tempo_default === 'isometric-2min' ? null : 12,
    })
    if (err) { fail('Could not add that exercise.', err); return }
    setBusy(false)
    onChanged()
  }

  async function removeExercise(id: string) {
    if (busy) return
    setBusy(true)
    setError(null)
    const { error: err } = await supabase.from('routine_exercises').delete().eq('id', id)
    if (err) { fail('Could not remove that exercise.', err); return }
    setBusy(false)
    onChanged()
  }

  async function move(routine: BuilderRoutine, index: number, direction: -1 | 1) {
    const target = index + direction
    if (busy || target < 0 || target >= routine.exercises.length) return
    setBusy(true)
    setError(null)

    const reordered = [...routine.exercises]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(target, 0, moved)

    // Renumbered in a single upsert. The unique constraint on
    // (routine_id, order_position) is deferrable, so it is checked once at the
    // end of the statement rather than rejecting the intermediate state where
    // two rows briefly share a position.
    const payload = reordered.map((re, i) => ({
      id: re.id,
      routine_id: routine.id,
      exercise_id: re.exercise.id,
      order_position: i + 1,
      sets_default: re.sets_default,
      reps_default: re.reps_default,
    }))

    const { error: err } = await supabase.from('routine_exercises').upsert(payload)
    if (err) { fail('Could not reorder that. Try again.', err); return }
    setBusy(false)
    onChanged()
  }

  async function updateSetsReps(id: string, field: 'sets_default' | 'reps_default', value: string) {
    const num = value === '' ? null : Number(value)
    if (field === 'sets_default' && (num === null || num < 1 || num > 10)) return
    const { error: err } = await supabase.from('routine_exercises').update({ [field]: num }).eq('id', id)
    if (err) { fail('Could not save that change.', err); return }
    onChanged()
  }

  const filteredLibrary = (routine: BuilderRoutine) => {
    const already = new Set(routine.exercises.map(e => e.exercise.id))
    const q = search.trim().toLowerCase()
    return library
      .filter(e => !already.has(e.id))
      .filter(e => !q || e.name.toLowerCase().includes(q) || e.muscle_groups.some(m => m.includes(q)))
  }

  return (
    <div>
      {error && <p className={styles.errorBox}>{error}</p>}

      <div className={styles.sectionHead}>
        <div>
          <h2 className={styles.sectionTitle}>Your routines</h2>
          <p className={styles.sectionSub}>
            Built by you, for your body. Copy a template below if you want a starting point, then change anything
            that does not work for you.
          </p>
        </div>
        {!creating && (
          <button className={styles.primaryBtn} onClick={() => setCreating(true)}>
            <Plus size={16} /> New routine
          </button>
        )}
      </div>

      {creating && (
        <div className={styles.addCard}>
          <div className={styles.addHead}>
            <span className={styles.addTitle}>Name your routine</span>
            <button className={styles.iconBtn} onClick={() => { setCreating(false); setNewName('') }} aria-label="Cancel">
              <X size={18} />
            </button>
          </div>
          <input
            type="text"
            className={styles.textInput}
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && createRoutine()}
            placeholder="Monday strength, Home workout, whatever you call it"
            maxLength={60}
            autoFocus
          />
          <button className={styles.saveBtn} onClick={createRoutine} disabled={busy || !newName.trim()}>
            {busy ? 'Creating...' : 'Create'}
          </button>
        </div>
      )}

      {mine.length === 0 && !creating && (
        <p className={styles.emptyState}>
          You have not built a routine yet. Make one from scratch, or copy a template below and edit it.
        </p>
      )}

      {mine.map(routine => (
        <div key={routine.id} className={styles.routineCard}>
          <div className={styles.routineHead}>
            <h3 className={styles.routineName}>{routine.name}</h3>
            <button
              className={styles.iconBtn}
              onClick={() => deleteRoutine(routine)}
              aria-label={`Delete ${routine.name}`}
            >
              <Trash2 size={15} />
            </button>
          </div>

          {routine.exercises.length === 0 ? (
            <p className={styles.emptyState}>Nothing in here yet. Add your first movement below.</p>
          ) : (
            <div className={styles.builderList}>
              {routine.exercises.map((re, i) => (
                <div key={re.id} className={styles.builderRow}>
                  <span className={styles.builderEmoji}>{re.exercise.emoji ?? '💪'}</span>
                  <div className={styles.builderBody}>
                    <span className={styles.builderName}>
                      {re.exercise.name}
                      <ExerciseVideoLink url={re.exercise.video_url} channel={re.exercise.video_channel} />
                    </span>
                    <span className={styles.builderMuscles}>{re.exercise.muscle_groups.join(', ')}</span>
                    <div className={styles.builderInputs}>
                      <label className={styles.builderField}>
                        <span>Sets</span>
                        <input
                          type="number"
                          className={styles.smallInput}
                          defaultValue={re.sets_default}
                          min={1}
                          max={10}
                          inputMode="numeric"
                          onBlur={e => updateSetsReps(re.id, 'sets_default', e.target.value)}
                        />
                      </label>
                      {re.exercise.tempo_default !== 'isometric-2min' && (
                        <label className={styles.builderField}>
                          <span>Reps</span>
                          <input
                            type="number"
                            className={styles.smallInput}
                            defaultValue={re.reps_default ?? ''}
                            min={1}
                            max={100}
                            inputMode="numeric"
                            onBlur={e => updateSetsReps(re.id, 'reps_default', e.target.value)}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                  <div className={styles.builderActions}>
                    <button
                      className={styles.iconBtn}
                      onClick={() => move(routine, i, -1)}
                      disabled={i === 0 || busy}
                      aria-label="Move up"
                    >
                      <ChevronUp size={15} />
                    </button>
                    <button
                      className={styles.iconBtn}
                      onClick={() => move(routine, i, 1)}
                      disabled={i === routine.exercises.length - 1 || busy}
                      aria-label="Move down"
                    >
                      <ChevronDown size={15} />
                    </button>
                    <button
                      className={styles.iconBtn}
                      onClick={() => removeExercise(re.id)}
                      aria-label={`Remove ${re.exercise.name}`}
                    >
                      <X size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {addingTo === routine.id ? (
            <div className={styles.pickerBox}>
              <div className={styles.addHead}>
                <span className={styles.addTitle}>Add a movement</span>
                <button className={styles.iconBtn} onClick={() => { setAddingTo(null); setSearch('') }} aria-label="Close">
                  <X size={18} />
                </button>
              </div>
              <input
                type="text"
                className={styles.textInput}
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or muscle group"
                autoFocus
              />
              <div className={styles.pickerList}>
                {filteredLibrary(routine).length === 0 ? (
                  <p className={styles.emptyState}>Nothing matches. Try a different word.</p>
                ) : filteredLibrary(routine).map(ex => (
                  <button
                    key={ex.id}
                    className={styles.pickerItem}
                    onClick={() => { addExercise(routine, ex); setAddingTo(null); setSearch('') }}
                    disabled={busy}
                  >
                    <span className={styles.builderEmoji}>{ex.emoji ?? '💪'}</span>
                    <span className={styles.pickerName}>{ex.name}</span>
                    <span className={styles.pickerMuscles}>{ex.muscle_groups.join(', ')}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <button className={styles.secondaryBtn} onClick={() => setAddingTo(routine.id)}>
              <Plus size={15} /> Add a movement
            </button>
          )}
        </div>
      ))}

      {templates.length > 0 && (
        <>
          <div className={styles.sectionHead}>
            <div>
              <h2 className={styles.sectionTitle}>Templates from Dr. Hunter</h2>
              <p className={styles.sectionSub}>
                Starting points, not prescriptions. Copy one to make it yours.
              </p>
            </div>
          </div>

          {templates.map(t => (
            <div key={t.id} className={styles.templateCard}>
              <div className={styles.routineHead}>
                <h3 className={styles.routineName}>{t.name}</h3>
                <span className={styles.templateTag}>Template</span>
              </div>
              {t.description && <p className={styles.routineDesc}>{t.description}</p>}

              <div className={styles.templateList}>
                {t.exercises.map((re, i) => (
                  <div key={re.id} className={styles.templateRow}>
                    <span className={styles.templateNum}>{i + 1}</span>
                    <span className={styles.builderEmoji}>{re.exercise.emoji ?? '💪'}</span>
                    <div className={styles.builderBody}>
                      <span className={styles.builderName}>
                        {re.exercise.name}
                        <ExerciseVideoLink url={re.exercise.video_url} channel={re.exercise.video_channel} />
                      </span>
                      <span className={styles.builderMuscles}>
                        {re.sets_default} sets
                        {re.exercise.tempo_default === 'isometric-2min'
                          ? ' · 2 min hold'
                          : re.reps_default ? ` · ${re.reps_default} reps` : ''}
                        {re.exercise.muscle_groups.length ? ` · ${re.exercise.muscle_groups.join(', ')}` : ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                className={styles.secondaryBtn}
                onClick={() => copyTemplate(t)}
                disabled={busy || !userId}
              >
                <Copy size={15} /> Copy to my routines
              </button>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
