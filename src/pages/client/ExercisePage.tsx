import { useState } from 'react'
import { Dumbbell, Bike, Waves, Zap, Activity, PersonStanding, Footprints, Square, MoreHorizontal, BookOpen, FlameKindling } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { awardPoints } from '@/lib/points'
import styles from './Client.module.css'
import shared from '../../styles/shared.module.css'

const EXERCISE_TYPES = [
  { id: 'walking',    label: 'Walking',     Icon: Footprints },
  { id: 'strength',   label: 'Strength',    Icon: Dumbbell },
  { id: 'isometric',  label: 'Isometric',   Icon: Square },
  { id: 'hiit',       label: 'HIIT',        Icon: Zap },
  { id: 'yoga',       label: 'Yoga',        Icon: PersonStanding },
  { id: 'cycling',    label: 'Cycling',     Icon: Bike },
  { id: 'swimming',   label: 'Swimming',    Icon: Waves },
  { id: 'stretching', label: 'Stretching',  Icon: Activity },
  { id: 'other',      label: 'Other',       Icon: MoreHorizontal },
]

const INTENSITIES = [
  { id: 'low',      label: 'Low',      desc: 'Light effort, can hold a conversation easily' },
  { id: 'moderate', label: 'Moderate', desc: 'Steady effort, slightly breathless' },
  { id: 'high',     label: 'High',     desc: 'Intense, difficult to speak in full sentences' },
]

const QUICK_DURATIONS = [10, 15, 20, 30, 45, 60]

interface Insight {
  headline: string
  points: string[]
  supplement?: string
  study?: string
}

const INSIGHTS: Record<string, Insight> = {
  walking: {
    headline: 'Post-meal walking is one of the most evidence-supported tools for blood sugar management.',
    points: [
      'A 10-20 minute walk after your largest meal supports glucose clearance from your bloodstream.',
      'A 2023 study found that 3 minutes of walking every 45 minutes during prolonged sitting improved blood sugar regulation more than a single 30-minute walk.',
      'Walking activates the quadriceps and glutes, which are primary glucose disposal muscles.',
    ],
    study: 'Research: doi.org/10.1111/sms.14628',
  },
  strength: {
    headline: 'Resistance training is the most effective long-term investment in metabolic health.',
    points: [
      'Muscle is your primary glucose disposal tissue. More muscle means more glucose cleared from your bloodstream after every meal.',
      'Minimum effective dose: 2-3 sessions per week. Weights, bands, or bodyweight are equivalent if you progressively increase the challenge.',
      'Research shows that 25-40% of weight lost during significant caloric restriction is lean tissue if resistance training is not included.',
    ],
    supplement: 'Aim for 25-30g of protein within 2 hours of your session to support muscle recovery and protein synthesis.',
  },
  isometric: {
    headline: 'Isometric training has the strongest blood pressure evidence of any single exercise type.',
    points: [
      'Protocol: 4 sets of 2-minute wall sits with 2 minutes of rest between sets, 3 times per week.',
      'Static holds create temporary vascular compression. The release triggers a powerful rebound dilation and a burst of nitric oxide, which relaxes blood vessels.',
      'A 2023 BJSM meta-analysis showed isometric exercise lowered blood pressure by an average of 8.2/4.0 mmHg, outperforming aerobic training (4.5/2.5 mmHg) and dynamic resistance training.',
    ],
    study: 'Research: bjsm.bmj.com/content/57/20/1317',
  },
  hiit: {
    headline: 'High-intensity intervals activate the muscle fibers that are most effective for glucose disposal.',
    points: [
      'Fast-twitch muscle fibers, which HIIT specifically recruits, act as high-capacity glucose sinks during and after exercise.',
      'Post-HIIT, your muscles continue pulling glucose from circulation for 24-48 hours during recovery.',
      'Short sessions (10-20 min) produce comparable or greater metabolic benefit to longer moderate sessions.',
    ],
    supplement: 'Electrolytes (sodium, potassium, magnesium) are essential on high-sweat training days. Plain water alone is often insufficient for replacement.',
  },
  yoga: {
    headline: 'Yoga addresses the stress-cortisol-blood sugar link that other workouts miss.',
    points: [
      'Chronic stress elevates cortisol, which directly raises blood sugar and blood pressure.',
      'Yoga and breath-focused movement support the parasympathetic nervous system, helping the body shift out of its stress-response state.',
      'Even 10-15 minutes of intentional breath work and movement can shift cortisol patterns measurably over time.',
    ],
  },
  cycling: {
    headline: 'Cycling is a joint-supportive cardiovascular option with strong metabolic benefit.',
    points: [
      'Sustained cycling activates the large lower-body muscle groups that pull glucose from circulation.',
      'Even low-to-moderate intensity cycling for 30 minutes supports insulin sensitivity.',
      'Steady-state aerobic work supports long-term cardiovascular function when practiced consistently.',
    ],
  },
  swimming: {
    headline: 'Swimming provides full-body resistance with minimal joint load.',
    points: [
      'Water resistance engages muscles throughout the entire body simultaneously, making each session metabolically efficient.',
      'A valuable option for individuals where joint or mobility concerns limit land-based movement.',
      'Consistent swimming supports both blood pressure and blood sugar regulation in published research.',
    ],
    supplement: 'Post-swim protein matters. Aim for a protein-forward meal or snack within one hour of finishing.',
  },
  stretching: {
    headline: 'Flexibility and mobility work protect your ability to stay consistent.',
    points: [
      'Stretching reduces injury risk, which is the primary barrier to long-term exercise consistency.',
      'Low-intensity movement after periods of sitting supports circulation and blood sugar regulation.',
      'Pairing regular stretching with your main training sessions helps the body recover and adapt faster.',
    ],
  },
  other: {
    headline: 'Any intentional movement is a metabolic investment.',
    points: [
      'Consistency over intensity: showing up matters more than any single session.',
      'Daily movement, even in 10-minute blocks, produces measurable metabolic benefit over time.',
      'Log what you did and how you felt. Patterns in your own data are the most informative teacher.',
    ],
  },
}

const LEARN_CARDS = [
  {
    id: 'muscle',
    icon: Dumbbell,
    color: '#c8a74b',
    title: 'The Muscle Preservation Protocol',
    intro: 'Muscle is not just about appearance. It is your primary metabolic organ for glucose disposal. When lean tissue is lost during significant weight change, metabolic rate drops and glucose regulation worsens.',
    points: [
      'Resistance training 2-3 times per week (minimum effective dose). Weights, resistance bands, or bodyweight all qualify if you progressively increase the challenge.',
      'Post-workout protein: 25-30g within 2 hours of your session supports muscle protein synthesis.',
      '10-20 minute post-meal walk daily supports glucose clearance between sessions.',
      'Protein at or above your daily target every day, not just on training days.',
    ],
    note: 'The drug does the metabolic signaling work. But it cannot lift for you.',
  },
  {
    id: 'snacks',
    icon: FlameKindling,
    color: '#4be08a',
    title: 'Movement Snacks for Blood Sugar',
    intro: 'Prolonged sitting disrupts glucose regulation in ways that a single gym session does not fully reverse. Frequent, short bursts of movement throughout the day show compelling evidence.',
    points: [
      '3 minutes of walking OR 10 bodyweight squats every 45 minutes of sitting.',
      'These targeted bursts activate the quadriceps and glutes, which are your largest glucose disposal muscles.',
      'A 2023 study found this approach improved blood sugar regulation better than a single 30-minute walk.',
      'Set a phone reminder every 45 minutes if you have a desk-heavy day.',
    ],
    study: 'Research: doi.org/10.1111/sms.14628',
  },
  {
    id: 'bp',
    icon: Activity,
    color: '#e05c5c',
    title: 'Isometric Training for Blood Pressure',
    intro: 'Among all exercise types, isometric (static hold) training has the most consistent evidence for blood pressure support, according to a 2023 BJSM meta-analysis of 270 clinical trials.',
    points: [
      'Wall Sit Protocol: 4 sets of 2-minute wall sits, 2 minutes of rest between sets, 3 times per week.',
      'You can spread the 4 sets across your day if doing them back-to-back is not practical.',
      'How it works: static holds compress blood vessels briefly. The rebound on release triggers nitric oxide production and vessel dilation.',
      'Average blood pressure reduction: 8.2/4.0 mmHg, compared to 4.5/2.5 for aerobic training.',
    ],
    study: 'Research: bjsm.bmj.com/content/57/20/1317',
  },
  {
    id: 'hit',
    icon: Dumbbell,
    color: '#0b9e8e',
    title: 'The Strength Protocol for Health Conditions',
    intro: 'For individuals managing metabolic conditions, kidney concerns, or high blood pressure, standard heavy lifting carries unnecessary risk. This protocol uses Time Under Tension (slow, controlled movement) to build muscle safely without the creatinine spike from explosive effort.',
    points: [
      'Tempo: 3 seconds down (lowering phase), 1 second pause, 2 seconds up. Never rush through a rep.',
      'One working set per exercise taken close to failure (roughly 12 reps). Less volume, more quality.',
      'Routine A (Monday and Thursday): Goblet Squat, Lat Pulldown, Chest Press, Romanian Deadlift, Cable Row, Overhead Press.',
      'Routine B (Wednesday and Saturday): Bicep Curls, Tricep Extensions, Lateral Raises, Calf Raises.',
      'Calf raises are especially relevant for circulation support and managing lower-body fluid retention.',
      'Slow controlled lifting builds the same muscle as heavy explosive lifting without spiking creatinine or blood pressure mid-set.',
    ],
    note: 'Rest 2 minutes between exercises. Do not rush. The adaptation happens in the slow, deliberate tension phase, not the momentum phase.',
  },
  {
    id: 'nutrition',
    icon: BookOpen,
    color: '#9b59b6',
    title: 'Exercise and Nutrition Timing',
    intro: 'What you eat around your workouts influences how well your body adapts. The timing window after exercise is when muscle is most receptive to protein.',
    points: [
      'Protein within 2 hours post-workout: 25-30g is the research-supported range for muscle protein synthesis.',
      'On high-sweat training days, electrolytes (sodium, potassium, magnesium) replace what water alone cannot.',
      'Pre-workout: a light protein-forward snack 30-60 minutes before strength training supports performance.',
      'Post-meal movement (10-20 min walk) after your largest meal uses the glucose from that meal as fuel for recovery.',
    ],
    note: 'The Supplement Log inside this app is where you track your daily protocol. Nutrition timing and supplementation work together.',
  },
]

export default function ExercisePage() {
  const { user } = useAuthStore()
  const today = format(new Date(), 'yyyy-MM-dd')

  const [tab, setTab]                   = useState<'log' | 'learn'>('log')
  const [exerciseType, setExerciseType] = useState<string | null>(null)
  const [duration, setDuration]         = useState('')
  const [intensity, setIntensity]       = useState<'low' | 'moderate' | 'high'>('moderate')
  const [notes, setNotes]               = useState('')
  const [saving, setSaving]             = useState(false)
  const [lastSaved, setLastSaved]       = useState<string | null>(null)

  const addDuration = (mins: number) => {
    setDuration(d => String((parseInt(d) || 0) + mins))
  }

  const handleSave = async () => {
    if (!user?.id || !exerciseType || !duration || parseInt(duration) <= 0) return
    setSaving(true)
    const { error } = await supabase.from('exercise_logs').insert({
      user_id: user.id,
      log_date: today,
      exercise_type: exerciseType,
      duration_min: parseInt(duration),
      intensity,
      notes: notes.trim() || null,
    })
    if (error) {
      toast.error('Could not save. Please try again.')
    } else {
      toast.success('Movement logged! +5 pts')
      await awardPoints(user.id, 'exercise_log', 5, `${today}_${exerciseType}`)
      setLastSaved(exerciseType)
      setExerciseType(null)
      setDuration('')
      setNotes('')
      setIntensity('moderate')
    }
    setSaving(false)
  }

  const insight = lastSaved ? INSIGHTS[lastSaved] : null

  return (
    <div className="animate-fade-in">
      <div className={styles.pageTop}>
        <div>
          <h1 className={styles.pageTopTitle}>
            <Dumbbell size={22} color="var(--gold)" /> Movement Log
          </h1>
          <p className={styles.pageTopDate}>{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.exTabs}>
        <button className={tab === 'log' ? styles.exTabActive : styles.exTab} onClick={() => setTab('log')}>Log Exercise</button>
        <button className={tab === 'learn' ? styles.exTabActive : styles.exTab} onClick={() => setTab('learn')}>Learn</button>
      </div>

      {/* LOG TAB */}
      {tab === 'log' && (
        <>
          {/* Post-save insight card */}
          {insight && (
            <div className={styles.exInsightCard}>
              <div className={styles.exInsightHead}>{insight.headline}</div>
              <ul className={styles.exInsightList}>
                {insight.points.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
              {insight.supplement && (
                <div className={styles.exInsightSupp}>
                  <strong>Nutrition note:</strong> {insight.supplement}
                </div>
              )}
              {insight.study && (
                <div className={styles.exInsightStudy}>{insight.study}</div>
              )}
              <p className={styles.exInsightDisclaimer}>Educational context only. Not medical advice.</p>
            </div>
          )}

          {/* Exercise type grid */}
          <div className={styles.card}>
            <h3 className={styles.cardLabel}>What did you do?</h3>
            <div className={styles.exTypeGrid}>
              {EXERCISE_TYPES.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  className={exerciseType === id ? styles.exTypeBtnActive : styles.exTypeBtn}
                  onClick={() => { setExerciseType(id); setLastSaved(null) }}
                >
                  <Icon size={20} />
                  <span className={styles.exTypeLabel}>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div className={styles.card}>
            <h3 className={styles.cardLabel}>Duration (minutes)</h3>
            <div className={styles.exDurationRow}>
              <input
                className={styles.input}
                type="number"
                value={duration}
                onChange={e => setDuration(e.target.value)}
                placeholder="0"
                min={1}
                max={300}
                style={{ maxWidth: 100 }}
              />
              <div className={styles.exQuickChips}>
                {QUICK_DURATIONS.map(m => (
                  <button key={m} className={styles.exQuickChip} onClick={() => addDuration(m)}>
                    +{m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Intensity */}
          <div className={styles.card}>
            <h3 className={styles.cardLabel}>Intensity</h3>
            <div className={styles.exIntensityRow}>
              {INTENSITIES.map(({ id, label, desc }) => (
                <button
                  key={id}
                  className={intensity === id ? styles.exIntensityBtnActive : styles.exIntensityBtn}
                  onClick={() => setIntensity(id as 'low' | 'moderate' | 'high')}
                >
                  <span className={styles.exIntensityLabel}>{label}</span>
                  <span className={styles.exIntensityDesc}>{desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className={styles.card}>
            <h3 className={styles.cardLabel}>Notes (optional)</h3>
            <textarea
              className={styles.input}
              rows={2}
              placeholder="How did it feel? Any observations..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              maxLength={300}
              style={{ resize: 'vertical', width: '100%', boxSizing: 'border-box' }}
            />
          </div>

          <button
            className={`${shared.btnPrimary} ${shared.btnFull} ${shared.btnLg}`}
            onClick={handleSave}
            disabled={saving || !exerciseType || !duration || parseInt(duration) <= 0}
          >
            {saving ? 'Saving...' : 'Log Movement +5 pts'}
          </button>

          <p className={styles.footerNote}>
            Each exercise type earns 5 points per day. Logging builds your streak toward the 7-day streak bonus.
          </p>
        </>
      )}

      {/* LEARN TAB */}
      {tab === 'learn' && (
        <div className={styles.exLearnList}>
          {LEARN_CARDS.map(({ id, icon: Icon, color, title, intro, points, note, study }) => (
            <div key={id} className={styles.exLearnCard}>
              <div className={styles.exLearnCardTop}>
                <div className={styles.exLearnIcon} style={{ background: `${color}15`, borderColor: `${color}30` }}>
                  <Icon size={20} color={color} />
                </div>
                <h3 className={styles.exLearnTitle}>{title}</h3>
              </div>
              <p className={styles.exLearnIntro}>{intro}</p>
              <ul className={styles.exLearnPoints}>
                {points.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
              {note && <div className={styles.exLearnNote}>{note}</div>}
              {study && <div className={styles.exLearnStudy}>{study}</div>}
            </div>
          ))}
          <p className={styles.footerNote}>
            Educational content only. This platform provides functional medicine education, not medical advice. Consult your healthcare provider before starting a new exercise program.
          </p>
        </div>
      )}
    </div>
  )
}
