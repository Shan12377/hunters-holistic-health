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
    supplement: 'Your Core Stack: KSM-66 Ashwagandha 300mg twice daily, Magnesium Glycinate 400mg at night, Lemon Balm 500mg in the afternoon. Continue for 30 days minimum before evaluating results. These supplements are not intended to diagnose, treat, cure, or prevent any disease.',
  },
  {
    day: 6,
    title: 'Gut Motility',
    subtitle: 'Bloating is often a movement problem, not a food problem',
    lesson: 'Your gut moves waste through a wave of muscular contractions. Those muscles need fiber for bulk and magnesium to contract properly. When either is short, transit slows and waste backs up. That is the distension most women blame on the last thing they ate. Chronic cortisol makes this worse by diverting blood flow away from digestion, which is why stress and bloating travel together.',
    movement: 'Add a 10-minute walk after dinner on top of your post-lunch walk. Walking stimulates the migrating motor complex, the wave that sweeps your small intestine between meals. Two short walks beat one long one for motility.',
    supplement: 'Same stack. Add one probiotic-rich food today: plain kefir, plain Greek yogurt with live cultures, refrigerated kimchi, or refrigerated sauerkraut. Food-based sources arrive with their own feeding environment, which is why they often outperform capsules.',
  },
  {
    day: 7,
    title: 'Week One Review',
    subtitle: 'Read the signals before adding anything new',
    lesson: 'Cortisol takes 5 to 7 days to respond to a protocol change, so today is the first honest read. Three signals to assess. Morning bloating: less means motility is improving. Energy after meals: steadier means your blood sugar response is flattening. Sleep quality: deeper means the magnesium and the evening routine are working. You do not need all three. One real shift is a data point worth trusting.',
    movement: 'Full dead bug circuit: 4 sets of 10. No new movement today. Consistency is the variable that matters this week, not intensity.',
    supplement: 'No new supplement. Stay on the core stack and let it build. Most of the cortisol research shows meaningful change between weeks 4 and 8, so you are early by design.',
  },
  {
    day: 8,
    title: 'The Flat Belly Plate',
    subtitle: 'Structure beats tracking',
    lesson: 'How you build a plate determines the insulin and cortisol response of that meal. Half the plate non-starchy vegetables for fiber and gut bacteria. One quarter quality protein, the anchor. One quarter complex carbohydrate such as sweet potato, quinoa, or lentils. One tablespoon of healthy fat to make the fat-soluble nutrients in those vegetables absorbable. Build it this way and you will not need to count anything.',
    movement: 'Same movement pattern. Keep both walks and your dead bug schedule.',
    supplement: 'Same stack. Focus today is the plate, not the bottle.',
  },
  {
    day: 9,
    title: 'Hydration and Electrolytes',
    subtitle: 'Water without minerals passes straight through',
    lesson: 'Water alone does not hydrate cells. Moving water into a cell requires sodium, potassium, and magnesium. Without them, water passes through without being absorbed, the gut stays dry, and motility slows. This is why bloating can persist at eight glasses a day. The fix is a mineral, not more volume.',
    movement: 'Same movement pattern. Notice whether your afternoon energy holds better on days you start with minerals.',
    supplement: 'Morning protocol, within 10 minutes of waking and before coffee: 16 oz water, a small pinch of Himalayan or Celtic sea salt, and the juice of half a lemon. Keep the core stack unchanged.',
  },
  {
    day: 10,
    title: 'Liver and Estrogen Clearance',
    subtitle: 'Where lower belly and hip storage comes from',
    lesson: 'Your liver clears excess estrogen through two phases of detoxification. When that pathway is sluggish, estrogen recirculates, and estrogen dominance drives fat storage specifically at the lower belly and hips. Cruciferous vegetables supply the compounds that support phase II clearance, which is why they show up in nearly every hormone protocol.',
    movement: 'Same movement pattern. Keep your walks consistent.',
    supplement: 'Same stack. Add one serving of cruciferous vegetables daily: broccoli, cauliflower, Brussels sprouts, cabbage, or kale.',
  },
  {
    day: 11,
    title: 'Sleep Architecture',
    subtitle: 'Two hormones decide how hungry you wake up',
    lesson: 'Leptin signals fullness. Ghrelin signals hunger. Under 7 hours of sleep, leptin drops and ghrelin rises, so you wake up hungrier with stronger carbohydrate cravings before you have made a single choice. Chronic short sleep also shifts gut bacteria toward strains associated with fat storage. This is a metabolic instruction, not a sleep hygiene tip.',
    movement: 'Restorative only: 20 minutes of yoga or a slow walk. Nothing high intensity within 4 hours of bed, because the cortisol from training needs time to clear before sleep can be restorative.',
    supplement: 'Same stack. Magnesium 30 to 45 minutes before bed matters more tonight than any other night this week.',
  },
  {
    day: 12,
    title: 'Find Your Cortisol Trigger',
    subtitle: 'The stack lowers the baseline, you handle the spike',
    lesson: 'The supplement stack lowers your baseline cortisol. It cannot touch the thing that spikes it. That trigger is personal: a person, a notification, a time of day, a recurring conversation, a specific situation. Naming it is the only way to stop feeding the loop, because you cannot interrupt a pattern you have not identified.',
    movement: '4-7-8 breathing for 5 minutes in the mid-afternoon, when the secondary cortisol rise happens. Inhale for 4, hold for 7, exhale for 8. Keep your walks and dead bug schedule.',
    supplement: 'Same stack. No additions.',
  },
  {
    day: 13,
    title: 'Reading Your Own Signals',
    subtitle: 'Four markers that tell you what to work on next',
    lesson: 'Bowel movement frequency: one to two comfortable movements daily is the target, and less than once a day means transit is still slow. Bloating timing: first thing in the morning points to bacteria and overnight motility, while bloating after specific meals points to a sensitivity or portion size. Energy after meals: a crash is a blood sugar signal. Belly softness compared to Day 1: softer, not flat, is inflammation coming down and it is real progress.',
    movement: 'Same movement pattern. You are building the baseline you will carry past Day 14.',
    supplement: 'Same stack.',
  },
  {
    day: 14,
    title: 'What You Built',
    subtitle: 'Five habits that changed your hormonal environment',
    lesson: 'Fourteen days ago your cortisol environment looked different than it does today. Five habits did that: cortisol support, protein timing, a protected sleep window, anti-inflammatory eating, and movement that does not spike cortisol. None of them require perfection to keep working. The supplement stack takes about 30 days for full effect, so you are halfway through its curve. Keep going.',
    movement: 'Full circuit: 4 sets of 10 dead bugs, both walks, and 5 minutes of 4-7-8 breathing. This is your maintenance pattern.',
    supplement: 'Continue all three for at least 30 days before evaluating results. These statements have not been evaluated by the Food and Drug Administration. These supplements are not intended to diagnose, treat, cure, or prevent any disease. Always consult your licensed healthcare provider before starting any new supplement.',
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
          <p className={styles.gateBadge}>14-Day Challenge</p>
          <h1 className={styles.gateTitle}>Flat Belly Reset</h1>
          <p className={styles.gateBody}>
            This 14-day educational program teaches the cortisol-belly connection and introduces the movement, nutrition, and supplement habits that support abdominal fat reduction through hormonal balance.
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
        <p className={styles.badge}>14-Day Flat Belly Challenge</p>
        <h1 className={styles.title}>Day {currentDay} of 14</h1>
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
        <div className={styles.dayMeta}>Day {dayContent.day} of 14</div>
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
          <h2 className={styles.ctaTitle}>You finished the 14-Day Flat Belly Challenge.</h2>
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
