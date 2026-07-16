import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import styles from './FlatBellyChallengePage.module.css'

const GATE_KEY = 'flat_belly_acknowledged'

interface DayContent {
  day: number
  title: string
  subtitle: string
  lesson: string
  movement: string
  supplement: string
}

const DAYS: DayContent[] = [
  {
    day: 1,
    title: 'The Cortisol-Belly Connection',
    subtitle: 'Why willpower is not the problem',
    lesson: 'Cortisol, the primary stress hormone, directly triggers fat storage in the abdominal region. Glucocorticoid receptors are more densely packed in visceral fat than anywhere else in the body. Every cortisol spike signals those receptors to store fat. This is not a calorie problem. It is a hormonal environment problem. If you have been dieting and exercising and still carrying stubborn belly fat, elevated cortisol is likely the driver.',
    movement: 'Dead Bug: Lie on your back. Extend your opposite arm and leg toward the floor without letting your lower back arch. Hold 3 seconds, switch sides. 3 sets of 8. This activates deep core stabilizers without spiking cortisol. It is the core exercise with the strongest evidence for rebuilding the deep abdominal wall.',
    supplement: 'Start KSM-66 Ashwagandha 300mg twice daily (morning and evening) with food. KSM-66 is the most-studied full-spectrum root extract for cortisol reduction, with randomized controlled trial evidence for reducing morning cortisol by 27-30%.',
  },
  {
    day: 2,
    title: 'Protein First. Always.',
    subtitle: 'The macro that controls your hunger hormones',
    lesson: 'Protein is the only macronutrient that directly suppresses ghrelin (the hunger hormone) and stimulates satiety hormones PYY and GLP-1. Eating protein first at every meal changes the hormonal conversation before you touch a carbohydrate. Target 30g of protein at breakfast: eggs, Greek yogurt, meat, or fish. This shift reduces afternoon cortisol spikes driven by blood sugar crashes by a measurable amount in metabolic research, because it prevents the reactive hypoglycemia that triggers the adrenal cortisol response.',
    movement: 'Dead Bug progression: complete your 3 sets, then add a 5-minute walk immediately after your largest meal. Post-meal movement is one of the highest-return behaviors for cortisol belly because it clears blood glucose and reduces the insulin and cortisol response to eating. Even 5 minutes matters.',
    supplement: 'Continue Ashwagandha 300mg twice daily. If you are not consistently hitting 30g of protein at breakfast from whole foods, add a quality whey or pea protein supplement to your morning routine.',
  },
  {
    day: 3,
    title: 'Sleep Is Not Optional',
    subtitle: 'The cortisol rhythm starts at night',
    lesson: 'Cortisol follows a circadian rhythm: highest at 8am (waking cortisol response) and lowest around midnight. Poor sleep keeps cortisol elevated in the evening when it should be dropping. That evening cortisol spike drives nighttime fat storage and worsens insulin resistance. Two nights of poor sleep is enough to cause measurable insulin resistance in otherwise healthy adults. You cannot exercise your way out of chronic sleep deprivation. This is a non-negotiable.',
    movement: 'Restorative movement today: 20 minutes of yoga, stretching, or a slow walk before bed. No high-intensity exercise within 4 hours of sleep. Exercise raises cortisol as part of the beneficial hormetic response, but that cortisol needs time to clear before sleep can be restorative.',
    supplement: "Add Doctor's Best Magnesium Glycinate 400mg at night, 30 minutes before bed. Magnesium is the most studied mineral for sleep quality, cortisol reduction, and blood sugar control. It is also the mineral most commonly depleted by chronic stress.",
  },
  {
    day: 4,
    title: 'Hidden Inflammation',
    subtitle: 'Foods that keep cortisol quietly elevated',
    lesson: 'Ultra-processed foods, industrial seed oils (canola, soybean, sunflower), refined sugar, and alcohol all activate the same inflammatory signaling pathways that cortisol does. This creates a feedback loop: stress raises cortisol, cortisol impairs gut barrier function, increased intestinal permeability raises systemic inflammation, which raises cortisol further. Eliminating seed oils and added sugars for even 5 days is enough for most people to notice a measurable reduction in bloating, brain fog, and afternoon energy crashes.',
    movement: 'Dead Bug superset, then add NEAT (non-exercise activity thermogenesis) throughout your day: stand while working, take a walk between tasks, pace during phone calls. NEAT burns more daily energy than structured exercise for most sedentary adults and does not spike cortisol the way high-intensity training does.',
    supplement: 'Add Gaia Herbs Lemon Balm 500mg in the afternoon or evening. Lemon balm modulates GABA activity and reduces cortisol reactivity without sedation. It is one of the few herbs with both anxiolytic and anti-inflammatory properties relevant to cortisol belly.',
  },
  {
    day: 5,
    title: 'Building Your System',
    subtitle: 'Stack the habits that will stick',
    lesson: "The behaviors that reverse cortisol belly are not complicated. They are: protein first at every meal, consistent sleep timing, daily movement that does not spike cortisol unnecessarily, and the right supplement support. The challenge is the system that makes those behaviors automatic. Today you build your stack: identify the two meals where you most often skip protein. Identify the one sleep habit you can remove tonight. Commit to your dead bug practice as a non-negotiable 5-minute morning anchor for the next 30 days. The supplement stack takes 4-8 weeks to show its full effect.",
    movement: 'Full dead bug circuit: 4 sets of 10 reps. Add a 10-15 minute post-lunch walk. Finish with 5 minutes of 4-7-8 breathing (inhale 4 counts, hold 7, exhale 8) to activate the parasympathetic nervous system and lower afternoon cortisol. This breathing pattern has the most consistent evidence for acute cortisol reduction of any single technique.',
    supplement: 'Your 5-Day Stack: KSM-66 Ashwagandha 300mg twice daily, Magnesium Glycinate 400mg at night, Lemon Balm 500mg in the afternoon. Continue for 30 days minimum before evaluating results. These supplements are not intended to diagnose, treat, cure, or prevent any disease.',
  },
]

const HABITS = [
  { id: 'movement', label: "Completed today's movement practice" },
  { id: 'protein', label: 'Hit 30g protein at breakfast' },
  { id: 'supplement', label: 'Took my daily supplements' },
  { id: 'sleep', label: 'Went to bed before midnight' },
]

interface DayRow {
  challenge_day: number
  habits_completed: string[]
}

export default function FlatBellyChallengePage() {
  const [acknowledged, setAcknowledged] = useState(
    () => typeof window !== 'undefined' && localStorage.getItem(GATE_KEY) === 'true'
  )
  const [currentDay, setCurrentDay] = useState(1)
  const [completed, setCompleted] = useState<Set<number>>(new Set())
  const [todayHabits, setTodayHabits] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)
  const [todayLogged, setTodayLogged] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      const { data } = await supabase
        .from('flat_belly_challenge')
        .select('challenge_day, habits_completed')
        .eq('user_id', user.id)
        .order('challenge_day')
      if (data && data.length > 0) {
        const rows = data as DayRow[]
        setCompleted(new Set(rows.map(r => r.challenge_day)))
        const nextDay = Math.min(rows.length + 1, 5)
        setCurrentDay(nextDay)
        const today = rows.find(r => r.challenge_day === nextDay - (rows.length < nextDay ? 0 : 1))
        if (today && rows.length >= nextDay) {
          setTodayLogged(true)
          setTodayHabits(new Set(today.habits_completed as string[]))
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
      const { error } = await supabase.from('flat_belly_challenge').upsert({
        user_id: user.id,
        challenge_day: currentDay,
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
          <p className={styles.gateBadge}>5-Day Challenge</p>
          <h1 className={styles.gateTitle}>Flat Belly Reset</h1>
          <p className={styles.gateBody}>
            This 5-day educational program teaches the cortisol-belly connection and introduces the movement, nutrition, and supplement habits that support abdominal fat reduction through hormonal balance.
          </p>
          <div className={styles.gateDisclaimer}>
            <strong>Educational use only.</strong> This is not medical advice and is not intended to diagnose, treat, cure, or prevent any disease or health condition. These statements have not been evaluated by the Food and Drug Administration. Supplement information is for educational purposes only. Always consult your healthcare provider before starting any new supplement or exercise program.
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
        <p className={styles.badge}>5-Day Flat Belly Reset</p>
        <h1 className={styles.title}>Day {currentDay} of 5</h1>
        <p className={styles.subtitle}>The cortisol-belly connection. Not willpower.</p>
      </div>

      <div className={styles.dayNav}>
        {DAYS.map(d => (
          <button
            key={d.day}
            className={styles.dayBtn}
            style={d.day === currentDay
              ? { borderColor: '#0B9E8E', background: '#0B9E8E', color: '#fff' }
              : completed.has(d.day)
              ? { borderColor: '#4be08a', color: '#4be08a' }
              : {}}
            onClick={() => { setCurrentDay(d.day); setTodayLogged(completed.has(d.day)) }}
          >
            {completed.has(d.day) ? '✓' : d.day}
          </button>
        ))}
      </div>

      <div className={styles.dayCard}>
        <div className={styles.dayMeta}>Day {dayContent.day} of 5</div>
        <h2 className={styles.dayTitle}>{dayContent.title}</h2>
        <p className={styles.daySubtitle}>{dayContent.subtitle}</p>
      </div>

      <div className={styles.contentCard}>
        <div className={styles.contentSection}>
          <div className={styles.contentLabel}>Today's Lesson</div>
          <p className={styles.contentText}>{dayContent.lesson}</p>
        </div>
      </div>

      <div className={styles.twoCol}>
        <div className={styles.contentCard}>
          <div className={styles.contentSection}>
            <div className={styles.contentLabel}>Movement</div>
            <p className={styles.contentText}>{dayContent.movement}</p>
          </div>
        </div>
        <div className={styles.contentCard}>
          <div className={styles.contentSection}>
            <div className={styles.contentLabel}>Supplement Focus</div>
            <p className={styles.contentText}>{dayContent.supplement}</p>
          </div>
        </div>
      </div>

      <div className={styles.logCard}>
        <h2 className={styles.logTitle}>Mark Today Complete</h2>
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
          <button type="submit" className={styles.saveBtn} disabled={saving}>
            {saving ? 'Saving...' : todayLogged ? 'Update Day' : `Complete Day ${currentDay}`}
          </button>
          {todayLogged && (
            <p className={styles.loggedNote}>
              Day {currentDay} complete.
              {currentDay < 5 ? ` Come back tomorrow for Day ${currentDay + 1}.` : ''}
            </p>
          )}
        </form>
      </div>

      {currentDay >= 5 && todayLogged && (
        <div className={styles.ctaCard}>
          <h2 className={styles.ctaTitle}>You finished the 5-Day Flat Belly Reset.</h2>
          <p className={styles.ctaText}>
            You now understand the cortisol-belly connection and have the three core supplements in your stack. The Foundation membership gives you the full 90-day metabolic protocol built around your specific pattern, including lab context, the complete ROOTS Framework, and direct access to Dr. Hunter's educator dashboard.
          </p>
          <a
            href="https://www.huntersholistichealth.com/join"
            className={styles.ctaBtn}
          >
            Join Foundation: $37/month
          </a>
        </div>
      )}

      <p className={styles.disclaimer}>
        For educational purposes only. Not medical advice. These statements have not been evaluated by the Food and Drug Administration. Supplement information is not intended to diagnose, treat, cure, or prevent any disease. Always consult your healthcare provider before starting any new supplement or exercise program.
      </p>
    </div>
  )
}
