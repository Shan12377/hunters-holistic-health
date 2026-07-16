import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import styles from './NervousSystemResetPage.module.css'

const GATE_KEY = 'ns_reset_acknowledged'

interface DayContent {
  day: number
  title: string
  subtitle: string
  lesson: string
  practice: string
  breathing: string
  supplement: string
}

const DAYS: DayContent[] = [
  {
    day: 1,
    title: 'Understanding HPA Axis Dysregulation',
    subtitle: 'Your stress response system',
    lesson: 'The HPA (Hypothalamic-Pituitary-Adrenal) axis is your body\'s primary stress response system. It is designed for short-term threats: cortisol spikes, energy mobilizes, the threat passes, cortisol drops. Modern life keeps it activated chronically. The result is not "adrenal fatigue" (not a recognized medical diagnosis) but HPA axis dysregulation: a disrupted cortisol rhythm with elevated evening cortisol, blunted morning response, and downstream effects on thyroid, sex hormones, and immune function.',
    practice: 'Morning sunlight: 10 minutes outside within 30 minutes of waking, no sunglasses. This is the single most powerful input to the cortisol awakening response and circadian clock reset. It sets the biological timer for cortisol wind-down 14-16 hours later. Do this before checking your phone.',
    breathing: '4-7-8 breath: Inhale through the nose for 4 counts. Hold for 7 counts. Exhale slowly through the mouth for 8 counts. 4 cycles. Do this before getting out of bed.',
    supplement: 'Start Ashwagandha (KSM-66) 300mg with breakfast. KSM-66 is the most studied full-spectrum root extract for HPA axis support, with clinical evidence for reducing morning and evening cortisol levels over 60-90 days of consistent use.',
  },
  {
    day: 2,
    title: 'The Cortisol Rhythm',
    subtitle: 'When it should peak and when it should not',
    lesson: 'Healthy cortisol peaks around 8am (the cortisol awakening response) and reaches its lowest point around midnight. In HPA axis dysregulation, this pattern inverts or flattens: low in the morning (fatigue and difficulty waking) and elevated in the evening (wired but tired at 11pm). The single most powerful environmental intervention is light-dark contrast: bright outdoor light in the morning and true darkness or dim red light after 8pm.',
    practice: 'Grounding practice: 5 minutes standing or walking barefoot on grass, soil, or sand. Clinical studies show grounding reduces salivary cortisol and inflammatory markers, likely through direct reduction of oxidative stress. If outdoor access is limited, use cold water on your face and wrists for 30 seconds instead.',
    breathing: 'Box breathing: Inhale for 4 counts. Hold for 4 counts. Exhale for 4 counts. Hold for 4 counts. Repeat for 5 minutes. Best practiced mid-afternoon when cortisol should naturally be declining. This pattern is used in military and athletic performance contexts for its rapid parasympathetic activation.',
    supplement: 'Continue Ashwagandha 300mg with breakfast. If you experience wired-but-tired evenings, add a second 300mg dose with dinner. Evening dosing supports the cortisol wind-down that should naturally be occurring.',
  },
  {
    day: 3,
    title: 'Sleep Architecture and Recovery',
    subtitle: 'Cortisol cannot normalize without it',
    lesson: 'Deep sleep (NREM slow-wave sleep) is when growth hormone pulses, cellular repair occurs, and cortisol reaches its daily low. Slow-wave sleep is front-loaded in the night, meaning the hours before midnight carry roughly twice the recovery value. Alcohol eliminates slow-wave sleep even at low doses. Blue light from screens suppresses melatonin onset for 3 or more hours after exposure. These two behaviors alone prevent HPA recovery in most people who struggle with chronic stress.',
    practice: 'Evening protocol: No screens after 8pm. Use blue-light blocking glasses or app settings if immediate change is not possible. Dim all lights in your home after 8pm. Cool your bedroom to 65-68F. These inputs signal melatonin onset more powerfully than any supplement and directly reduce evening cortisol.',
    breathing: 'Progressive muscle relaxation before bed: Tense each muscle group for 5 seconds, then release completely. Start at your feet and move slowly up through your legs, abdomen, chest, arms, and face. The total practice takes about 5-7 minutes and activates the parasympathetic nervous system within minutes of completion.',
    supplement: "Add Doctor's Best Magnesium Glycinate 400mg at night, 30 minutes before sleep. Magnesium activates GABA receptors, lowers nighttime cortisol, and supports the deep sleep architecture that HPA recovery requires. Begin tonight.",
  },
  {
    day: 4,
    title: 'Movement and Vagal Tone',
    subtitle: 'Exercise that heals vs. exercise that stresses',
    lesson: 'Exercise is a hormetic stressor: the right dose builds resilience, the wrong dose deepens HPA dysregulation. High-intensity interval training spikes cortisol for 24-72 hours in people with dysregulated HPA function. The correct sequencing is to begin with low-intensity parasympathetic movement (walking, yoga, swimming, rebounding) and only add intensity once morning cortisol and sleep have normalized for 2-3 weeks. This is not about avoiding exercise. It is about the right exercise at the right time.',
    practice: 'Vagal nerve activation: humming or singing for 2 minutes (the vibration directly stimulates the vagus nerve), followed by cold water on the face and back of the neck for 30 seconds, then 5 minutes of slow diaphragmatic breathing. These three practices sequentially activate the parasympathetic branch without triggering a cortisol response.',
    breathing: 'Coherent breathing: 5 seconds inhale, 5 seconds exhale. Maintain this for 10 minutes. This is the breathing pattern most consistently shown to increase heart rate variability (HRV), the primary measurable marker of vagal tone and nervous system resilience. HRV improves with consistent practice over 4-8 weeks.',
    supplement: 'Continue Ashwagandha 300mg morning (and evening if needed), Magnesium Glycinate 400mg at night. Consider adding Phosphatidylserine 300mg before moderate-to-intense workouts: it is the most studied supplement for blunting exercise-induced cortisol spikes.',
  },
  {
    day: 5,
    title: 'Nutrition for a Calm Nervous System',
    subtitle: 'Blood sugar stability is a nervous system issue',
    lesson: 'Blood sugar instability is one of the most underappreciated drivers of chronic cortisol elevation. Every significant blood sugar drop triggers an emergency cortisol and adrenaline response to raise glucose back to safe levels. Eating refined carbohydrates, skipping breakfast, or going 5 or more hours without eating creates repeated cortisol spikes throughout the day that accumulate and compound. The fix is protein-first eating and avoiding extended gaps between meals, not a complex dietary overhaul.',
    practice: 'Caffeine cutoff: no caffeine after noon today and for the remainder of this reset. Coffee has a half-life of 5-7 hours. A cup at 2pm means half of its stimulating effect is still active at 9pm, which directly suppresses melatonin and keeps evening cortisol elevated. This is the single highest-leverage dietary change for sleep quality and HPA recovery speed.',
    breathing: 'Physiological sigh: Double inhale through the nose (two short sniffs in quick succession), then a long slow exhale through the mouth. Repeat 5 times. This is the fastest-acting technique to activate the parasympathetic nervous system and is used in high-performance sport and military contexts. The double inhale deflates alveoli that collapse during stress breathing patterns.',
    supplement: 'Add Gaia Herbs Lemon Balm 500mg in the afternoon. Lemon balm modulates GABA activity, reduces cortisol reactivity, and supports calm focus without sedation. It is one of the few herbs with evidence for both anxiolytic and anti-inflammatory mechanisms relevant to HPA axis dysregulation.',
  },
  {
    day: 6,
    title: 'Stress Inoculation vs. Overload',
    subtitle: 'Building resilience without burning out',
    lesson: 'HPA axis resilience is built through controlled stress exposure followed by adequate recovery, not by avoiding all stress. Moderate cold exposure (cold endings to showers, cold water face immersion), moderate exercise at the right intensity, and structured fasting (14-16 hours) all support HPA calibration when combined with adequate sleep and recovery. The goal is to teach your nervous system that stress is temporary and recovery is reliable. This predictability is what HPA dysregulation has disrupted.',
    practice: 'Weekly review: which of the six daily habits (morning light, grounding, evening protocol, vagal exercises, protein-first eating, caffeine cutoff, supplements) did you complete most consistently this week? Which felt most impactful for your stress level, sleep, or energy? Commit to your top three as permanent anchors going forward.',
    breathing: 'HRV coherence session: 10 minutes of coherent breathing (5 seconds in, 5 seconds out) while reflecting on what has measurably shifted in your stress response, sleep quality, or energy this week. Notice any change, however small. These are real physiological shifts, not placebo.',
    supplement: 'Your complete 6-day stack: Ashwagandha (KSM-66) 300mg twice daily, Magnesium Glycinate 400mg at night, Lemon Balm 500mg afternoon. This combination addresses HPA axis dysregulation from three complementary physiological pathways: the HPA axis directly, GABA receptor modulation, and adrenal cortisol synthesis support.',
  },
  {
    day: 7,
    title: 'Your Maintenance Plan',
    subtitle: 'What you keep, and what you build toward',
    lesson: "You have spent 7 days activating your parasympathetic nervous system, resetting your light-dark rhythm, and introducing the core supplement stack for HPA axis recovery. HPA axis dysregulation took months or years to develop. Full recovery typically takes 3-6 months of consistent intervention. But the most important thing you have done this week is interrupt the chronic activation loop. The nervous system is remarkably plastic. It responds to consistent input with consistent change.",
    practice: 'Write your three non-negotiable daily anchors from this reset. These are the practices that felt most natural, most impactful, or most urgent for your current stress pattern. Non-negotiable means: these happen regardless of how busy or tired you are. Everything else is optional. These three are not.',
    breathing: 'Closing practice: 4-7-8 breath for 8 full cycles, followed by 5 minutes of silence. No phone, no input, no agenda. Sit with what your nervous system feels like after 7 days of active parasympathetic support. This contrast is important data about your baseline and your capacity for recovery.',
    supplement: 'Continue the full stack for 30 days minimum. Ashwagandha and Magnesium Glycinate have cumulative effects that build over 4-8 weeks of consistent use. Your cortisol pattern will not normalize in 7 days, but the trajectory is measurably different. These statements have not been evaluated by the Food and Drug Administration and are not intended to diagnose, treat, cure, or prevent any disease.',
  },
]

const HABITS = [
  { id: 'sunlight', label: 'Got morning sunlight (10 min)' },
  { id: 'breathing', label: "Completed today's breathing practice" },
  { id: 'supplement', label: 'Took my supplements' },
  { id: 'caffeine', label: 'No caffeine after noon' },
  { id: 'screens', label: 'No screens after 8pm (or blue-light glasses)' },
]

interface ScoreData {
  stressScore: number
  sleepScore: number
}

interface DayRow {
  challenge_day: number
  stress_score: number | null
  sleep_score: number | null
  habits_completed: string[]
}

function RatingPicker({ label, value, onChange, max, color, lowLabel, highLabel }: {
  label: string; value: number; onChange: (v: number) => void;
  max: number; color: string; lowLabel: string; highLabel: string
}) {
  return (
    <div className={styles.ratingPicker}>
      <div className={styles.ratingLabel}>{label}</div>
      <div className={styles.ratingScale}>
        {Array.from({ length: max }, (_, i) => i + 1).map(n => (
          <button
            key={n}
            type="button"
            className={styles.ratingDot}
            style={value >= n ? { background: color, borderColor: color, color: '#fff' } : {}}
            onClick={() => onChange(n)}
            aria-label={`${label} ${n}`}
          >
            {n}
          </button>
        ))}
      </div>
      <div className={styles.ratingRange}>
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  )
}

export default function NervousSystemResetPage() {
  const [acknowledged, setAcknowledged] = useState(
    () => typeof window !== 'undefined' && localStorage.getItem(GATE_KEY) === 'true'
  )
  const [currentDay, setCurrentDay] = useState(1)
  const [completed, setCompleted] = useState<Set<number>>(new Set())
  const [todayHabits, setTodayHabits] = useState<Set<string>>(new Set())
  const [scores, setScores] = useState<ScoreData>({ stressScore: 0, sleepScore: 0 })
  const [saving, setSaving] = useState(false)
  const [todayLogged, setTodayLogged] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      const { data } = await supabase
        .from('nervous_system_challenge')
        .select('challenge_day, stress_score, sleep_score, habits_completed')
        .eq('user_id', user.id)
        .order('challenge_day')
      if (data && data.length > 0) {
        const rows = data as DayRow[]
        setCompleted(new Set(rows.map(r => r.challenge_day)))
        const nextDay = Math.min(rows.length + 1, 7)
        setCurrentDay(nextDay)
        const latestLogged = rows.find(r => r.challenge_day === nextDay)
        if (latestLogged) {
          setTodayLogged(true)
          setTodayHabits(new Set(latestLogged.habits_completed as string[]))
          setScores({ stressScore: latestLogged.stress_score ?? 0, sleepScore: latestLogged.sleep_score ?? 0 })
        }
      }
      setLoading(false)
    }
    load()
  }, [])

  function acknowledge() {
    localStorage.setItem(GATE_KEY, 'true')
    setAcknowledged(true)
  }

  function toggleHabit(id: string) {
    setTodayHabits(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function saveDay(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { toast.error('Sign in to save your progress'); setSaving(false); return }
      const { error } = await supabase.from('nervous_system_challenge').upsert({
        user_id: user.id,
        challenge_day: currentDay,
        stress_score: scores.stressScore || null,
        sleep_score: scores.sleepScore || null,
        habits_completed: Array.from(todayHabits),
        logged_at: new Date().toISOString(),
      }, { onConflict: 'user_id,challenge_day' })
      if (error) throw error
      toast.success(`Day ${currentDay} complete!`)
      setCompleted(prev => new Set([...prev, currentDay]))
      setTodayLogged(true)
    } catch {
      toast.error('Could not save. Please try again.')
    }
    setSaving(false)
  }

  const dayContent = DAYS[currentDay - 1]

  if (!acknowledged) {
    return (
      <div className={styles.gateOverlay}>
        <div className={styles.gateBox}>
          <p className={styles.gateBadge}>7-Day Challenge</p>
          <h1 className={styles.gateTitle}>Nervous System Reset</h1>
          <p className={styles.gateBody}>
            This 7-day educational program teaches HPA axis dysregulation and introduces the daily practices, breathing techniques, and supplement support that help restore a healthy cortisol rhythm and nervous system resilience.
          </p>
          <div className={styles.gateDisclaimer}>
            <strong>Educational use only.</strong> This is not medical advice and is not intended to diagnose, treat, cure, or prevent any disease or health condition. These statements have not been evaluated by the Food and Drug Administration. Supplement information is for educational purposes only. Always consult your healthcare provider before starting any new supplement or making changes to your health routine.
          </div>
          <button className={styles.gateBtn} onClick={acknowledge}>
            I understand. Start Day 1
          </button>
        </div>
      </div>
    )
  }

  if (loading) return <div className={styles.loading}>Loading your progress...</div>

  return (
    <div className={styles.page}>

      <div className={styles.header}>
        <p className={styles.badge}>7-Day Nervous System Reset</p>
        <h1 className={styles.title}>Day {currentDay} of 7</h1>
        <p className={styles.subtitle}>HPA axis dysregulation education. Not adrenal fatigue.</p>
      </div>

      <div className={styles.dayNav}>
        {DAYS.map(d => (
          <button
            key={d.day}
            className={styles.dayBtn}
            style={d.day === currentDay
              ? { borderColor: '#58a6ff', background: '#58a6ff', color: '#fff' }
              : completed.has(d.day)
              ? { borderColor: '#4be08a', color: '#4be08a' }
              : {}}
            onClick={() => {
              setCurrentDay(d.day)
              setTodayLogged(completed.has(d.day))
              setTodayHabits(new Set())
              setScores({ stressScore: 0, sleepScore: 0 })
            }}
          >
            {completed.has(d.day) ? '✓' : d.day}
          </button>
        ))}
      </div>

      <div className={styles.dayCard}>
        <div className={styles.dayMeta}>Day {dayContent.day} of 7</div>
        <h2 className={styles.dayTitle}>{dayContent.title}</h2>
        <p className={styles.daySubtitle}>{dayContent.subtitle}</p>
      </div>

      <div className={styles.contentCard}>
        <div className={styles.contentLabel}>Today's Lesson</div>
        <p className={styles.contentText}>{dayContent.lesson}</p>
      </div>

      <div className={styles.twoCol}>
        <div className={styles.contentCard}>
          <div className={styles.contentLabel}>Daily Practice</div>
          <p className={styles.contentText}>{dayContent.practice}</p>
        </div>
        <div className={styles.contentCard}>
          <div className={styles.contentLabel}>Breathing Exercise</div>
          <p className={styles.contentText}>{dayContent.breathing}</p>
        </div>
      </div>

      <div className={styles.contentCard}>
        <div className={styles.contentLabel}>Supplement Focus</div>
        <p className={styles.contentText}>{dayContent.supplement}</p>
        <p className={styles.dshea}>
          These statements have not been evaluated by the Food and Drug Administration. This information is not intended to diagnose, treat, cure, or prevent any disease.
        </p>
      </div>

      <div className={styles.logCard}>
        <h2 className={styles.logTitle}>Today's Check-In</h2>
        <form onSubmit={saveDay}>
          <div className={styles.habitList}>
            {HABITS.map(h => (
              <label key={h.id} className={styles.habitItem}>
                <input
                  type="checkbox" className={styles.habitCheck}
                  checked={todayHabits.has(h.id)} onChange={() => toggleHabit(h.id)}
                />
                <span className={styles.habitLabel}>{h.label}</span>
              </label>
            ))}
          </div>
          <div className={styles.scoresRow}>
            <RatingPicker
              label="Stress Level"
              value={scores.stressScore}
              onChange={v => setScores(s => ({ ...s, stressScore: v }))}
              max={10} color="#e05c5c"
              lowLabel="No stress" highLabel="Overwhelmed"
            />
            <RatingPicker
              label="Sleep Quality"
              value={scores.sleepScore}
              onChange={v => setScores(s => ({ ...s, sleepScore: v }))}
              max={5} color="#58a6ff"
              lowLabel="Terrible" highLabel="Excellent"
            />
          </div>
          <button type="submit" className={styles.saveBtn} disabled={saving}>
            {saving ? 'Saving...' : todayLogged ? 'Update Day' : `Complete Day ${currentDay}`}
          </button>
          {todayLogged && (
            <p className={styles.loggedNote}>
              Day {currentDay} complete.
              {currentDay < 7 ? ` Come back tomorrow for Day ${currentDay + 1}.` : ''}
            </p>
          )}
        </form>
      </div>

      {currentDay >= 7 && todayLogged && (
        <div className={styles.ctaCard}>
          <h2 className={styles.ctaTitle}>You completed the 7-Day Nervous System Reset.</h2>
          <p className={styles.ctaText}>
            You now have the three core practices and the full supplement stack for HPA axis recovery. The next step is to apply this foundation to your hormonal cycle. The 28-Day Hormone Intelligence Challenge teaches you how your cortisol rhythm interacts with estrogen and progesterone across every phase of your cycle.
          </p>
          <a href="/tools/hormone-challenge" className={styles.ctaBtn}>
            Continue: 28-Day Hormone Challenge
          </a>
        </div>
      )}

      <p className={styles.disclaimer}>
        For educational purposes only. Not medical advice. HPA axis dysregulation is an educational concept. These statements have not been evaluated by the Food and Drug Administration. Supplement information is not intended to diagnose, treat, cure, or prevent any disease. Always consult your healthcare provider before starting any new supplement or health protocol.
      </p>
    </div>
  )
}
