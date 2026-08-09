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
    supplement: 'Start Jarrow Formulas KSM-66 Ashwagandha 300mg twice daily, morning with breakfast and evening with dinner, always with food. KSM-66 is the most-studied full-spectrum root extract for cortisol reduction, with randomized controlled trial evidence for reducing morning cortisol by 27-30%. Do not use during pregnancy. If you take thyroid medication, sedatives, or immunosuppressants, clear it with your prescriber first.',
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
    supplement: "Add Doctor's Best High Absorption Magnesium 400mg, which is two 200mg capsules, around 9:30 PM and 30 to 45 minutes before sleep. Magnesium is the most studied mineral for sleep quality, cortisol reduction, and blood sugar control, and it is the mineral most commonly depleted by chronic stress. If it loosens your stools in the first few days, split it: 200mg with dinner and 200mg at bedtime.",
  },
  {
    day: 4,
    title: 'Hidden Inflammation',
    subtitle: 'Foods that keep cortisol quietly elevated',
    lesson: 'Ultra-processed foods, industrial seed oils (canola, soybean, sunflower), refined sugar, and alcohol all activate the same inflammatory signaling pathways that cortisol does. This creates a feedback loop: stress raises cortisol, cortisol impairs gut barrier function, increased intestinal permeability raises systemic inflammation, which raises cortisol further. Eliminating seed oils and added sugars for even 5 days is enough for most people to notice a measurable reduction in bloating, brain fog, and afternoon energy crashes.',
    movement: 'Dead Bug superset, then add NEAT (non-exercise activity thermogenesis) throughout your day: stand while working, take a walk between tasks, pace during phone calls. NEAT burns more daily energy than structured exercise for most sedentary adults and does not spike cortisol the way high-intensity training does.',
    supplement: 'Add Swanson Full Spectrum Lemon Balm 500mg between 2 and 3 PM with a glass of water. That window targets the secondary cortisol rise most women feel as the afternoon crash. Lemon balm modulates GABA activity and reduces cortisol reactivity without sedation. Taken much later it can cause mild evening drowsiness.',
  },
  {
    day: 5,
    title: "Movement That Does Not Spike Cortisol",
    subtitle: "Why harder workouts can work against you",
    lesson: "Long high-intensity cardio raises cortisol. If yours is already elevated, a hard session adds to the load and your belly holds tighter. That is not a reason to stop exercising, it is a reason to add movement that builds the deep core without raising the signal. The dead bug is the highest-evidence choice for rebuilding the deep abdominal wall, and it does not spike cortisol the way training to exhaustion does.",
    movement: "Dead bug, full form. Lie on your back, arms straight up, knees bent to 90 degrees with shins parallel to the floor. Lower your right arm behind your head while lowering your left leg. Stop an inch above the floor. Return, switch sides. 10 per side, 2 sets. Keep your lower back flat against the floor the whole time. If it arches, make the movement smaller.",
    supplement: "Your full stack, four products across five doses. Morning with breakfast: Jarrow KSM-66 Ashwagandha 300mg. Afternoon 2 to 3 PM: Swanson Full Spectrum Lemon Balm 500mg. With dinner: the second Ashwagandha 300mg plus Thorne D3/K2 Liquid, 2 drops, which needs the fat in your meal to absorb. Bedtime 9:30 PM: Doctor's Best High Absorption Magnesium 400mg. IMPORTANT: vitamin K2 works against warfarin and other blood thinners. If you take one, do not start the D3/K2 until your prescriber clears it. These statements have not been evaluated by the Food and Drug Administration. These supplements are not intended to diagnose, treat, cure, or prevent any disease.",
  },
  {
    day: 6,
    title: "Magnesium and Gut Motility",
    subtitle: "The mineral most women are short on",
    lesson: "Magnesium runs over 300 processes: muscle relaxation, cortisol regulation, blood sugar balance, sleep quality, and bowel motility. Motility is the one that shows up at your waistline. Your gut moves waste through muscular contractions, and those muscles need magnesium to contract properly. When transit slows, waste backs up, and that is the distension most women blame on the last thing they ate. An estimated 68 percent of American women take in less magnesium than their body needs, and chronic stress depletes it further.",
    movement: "Add a 10-minute walk after dinner on top of your post-lunch walk. Walking stimulates the migrating motor complex, the wave that sweeps your small intestine between meals. Two short walks beat one long one for motility.",
    supplement: "Same stack. Add magnesium-rich foods today: pumpkin seeds, dark leafy greens, black beans, lentils, avocado, almonds, or 70 percent dark chocolate. Add one probiotic-rich food as well: plain kefir, plain Greek yogurt with live cultures, refrigerated kimchi, or refrigerated sauerkraut.",
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
    title: "Probiotics, Prebiotics, and Your Liver",
    subtitle: "Feeding the bacteria and clearing the hormones",
    lesson: "Probiotics are living organisms and they need food to survive. That food is prebiotic fiber. Take a capsule every morning and then eat processed food all day and the bacteria have nothing to live on. Food-based sources often outperform capsules because they arrive with their own feeding environment. Your liver matters here too. It clears excess estrogen through two phases, and when that pathway is sluggish estrogen recirculates through the gut, which drives storage specifically at the lower belly and hips.",
    movement: "Same movement pattern. Keep both walks and your dead bug schedule.",
    supplement: "Same stack. Add one probiotic food: plain kefir, plain Greek yogurt with live cultures, refrigerated kimchi, or refrigerated sauerkraut. Pair it with a prebiotic: garlic, onion, asparagus, oats, or an apple with the skin. Add one serving of cruciferous vegetables for liver support: broccoli, cauliflower, Brussels sprouts, cabbage, or kale.",
  },
  {
    day: 10,
    title: "Hydration and Electrolytes",
    subtitle: "Water without minerals passes straight through",
    lesson: "Water alone does not hydrate cells. Moving water into a cell requires sodium, potassium, and magnesium. Without them water passes through without being absorbed, the gut stays dry, and motility slows. This is why bloating can persist at eight glasses a day. The fix is a mineral, not more volume.",
    movement: "Same movement pattern. Notice whether your afternoon energy holds better on the days you start with minerals.",
    supplement: "Morning protocol, within 10 minutes of waking and before coffee: 16 oz water, a small pinch of Himalayan or Celtic sea salt, and the juice of half a lemon. Keep the core stack unchanged.",
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
    title: "The Post-Meal Walk and Your Trigger",
    subtitle: "Ten minutes that changes the meal, and the thing that spikes you",
    lesson: "A 10-minute walk after your largest meal lowers post-meal blood sugar by 30 to 40 percent, which means a smaller insulin spike and a weaker fat-storage signal. It speeds gastric emptying so food clears your stomach faster, it moves your lymphatic system which has no pump of its own, and it lowers post-meal cortisol. Separately: the supplement stack lowers your baseline cortisol but it cannot touch what spikes it. That trigger is personal. A person, a notification, a time of day, a recurring conversation. Naming it is the only way to stop feeding the loop.",
    movement: "After your biggest meal, walk 10 minutes. Set a timer. Intensity does not matter, timing does. Then in the mid-afternoon, when the secondary cortisol rise happens, do 5 minutes of 4-7-8 breathing. Inhale 4, hold 7, exhale 8.",
    supplement: "Same stack. No additions.",
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
    supplement: 'Continue all four for at least 30 days before evaluating results: Ashwagandha morning and evening, Lemon Balm mid-afternoon, D3/K2 with dinner, Magnesium at bedtime. These statements have not been evaluated by the Food and Drug Administration. These supplements are not intended to diagnose, treat, cure, or prevent any disease. Always consult your licensed healthcare provider before starting any new supplement.',
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
      try {
        // getSession reads the local session without a network round trip.
        // getUser calls the auth server, which is what used to hang this page
        // for signed-out visitors and leave it stuck on "Loading your progress".
        const { data: { session } } = await supabase.auth.getSession()
        const user = session?.user
        if (!user) return

        const { data, error } = await supabase
          .from('flat_belly_challenge')
          .select('challenge_day, habits_completed')
          .eq('user_id', user.id)
          .order('challenge_day')

        if (error) {
          toast.error('Could not load your saved progress. You can still follow along.')
          return
        }

        const rows = (data ?? []) as DayRow[]
        if (rows.length === 0) return

        const logged = new Set(rows.map(r => r.challenge_day))
        setCompleted(logged)

        const nextDay = Math.min(rows.length + 1, DAYS.length)
        setCurrentDay(nextDay)

        const todayRow = rows.find(r => r.challenge_day === nextDay)
        if (todayRow) {
          setTodayLogged(true)
          setTodayHabits(new Set(todayRow.habits_completed ?? []))
        }
      } catch {
        toast.error('Could not load your saved progress. You can still follow along.')
      } finally {
        // Always runs, so the page can never hang on the loading state.
        setLoading(false)
      }
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
