import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import styles from './FlatBellyChallengePage.module.css'

const GATE_KEY = 'flat_belly_acknowledged'

// Cohort 1 starts Monday 10 August 2026. Days unlock on the calendar, one per
// day, so the tracker stays in step with the 7 AM email. Completing a day does
// NOT unlock the next one, otherwise someone could read all 14 in one sitting
// and the daily rhythm the whole challenge depends on disappears.
const CHALLENGE_START = new Date(2026, 7, 10) // month is 0-indexed: 7 = August

/** How many days are open today. Day 1 on the start date, Day 2 the next day. */
function unlockedThroughToday(totalDays: number): number {
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const msPerDay = 24 * 60 * 60 * 1000
  const elapsed = Math.floor(
    (startOfDay(new Date()).getTime() - startOfDay(CHALLENGE_START).getTime()) / msPerDay
  )
  return Math.min(Math.max(elapsed + 1, 1), totalDays)
}

interface DayContent {
  day: number
  title: string
  subtitle: string
  /** The single thing to do today. Rendered as the first checkbox so the
   *  day's actual lesson is what gets checked off, not a generic habit. */
  action: string
  lesson: string
  movement: string
  supplement: string
}

const DAYS: DayContent[] = [
  {
    day: 1,
    title: "The Cortisol Belly Connection",
    subtitle: "Why willpower is not the problem",
    action: "Take 3 slow breaths before every meal. In for 4, hold 4, out for 6.",
    lesson: "Cortisol, the primary stress hormone, directly triggers fat storage in the abdominal region. Glucocorticoid receptors are more densely packed in visceral fat than anywhere else in the body, so every cortisol spike signals those receptors to store. Cortisol also raises blood glucose, which raises insulin, and insulin is the switch that decides whether fat is stored or released. This is not a calorie problem. It is a hormonal environment problem.",
    movement: "Walk for 10 minutes after any meal today, ideally your biggest one. That is the whole movement ask this week. Post-meal walking clears blood glucose and lowers the insulin and cortisol response to eating, and it is achievable at every fitness level.",
    supplement: "Nothing to buy today. The breathing is free and it is doing real work. Supplement education is introduced later in the challenge, once the daily habits are in place. Start with what costs nothing.",
  },
  {
    day: 2,
    title: "Protein First. Always.",
    subtitle: "The macro that controls your hunger hormones",
    action: "Eat 30 grams of protein at your first meal, before anything else.",
    lesson: "Protein directly suppresses ghrelin, the hunger hormone, and stimulates the satiety hormones PYY and GLP-1. Eating protein first changes the hormonal conversation before you touch a carbohydrate. It also blunts the blood sugar rise of the rest of the meal, which means a smaller insulin response and less of the reactive crash that triggers an afternoon cortisol spike.",
    movement: "Same 10-minute walk after your largest meal. Consistency is the only variable this week. Even 5 minutes matters more than nothing.",
    supplement: "Still nothing to buy. Get your 30 grams from food first: eggs, Greek yogurt, cottage cheese, fish, or leftover chicken. If mornings are genuinely impossible, a quality protein powder is a reasonable bridge, but food first.",
  },
  {
    day: 3,
    title: "Sleep Is Not Optional",
    subtitle: "The cortisol rhythm starts at night",
    action: "Set a 9:30 PM alarm. Phone face down, in bed by 10:15.",
    lesson: "Cortisol follows a daily rhythm: highest about 30 to 45 minutes after waking, lowest around midnight. Poor sleep keeps it elevated in the evening when it should be falling, and that evening elevation drives overnight storage and worsens insulin resistance. Two nights of short sleep is enough to produce measurable insulin resistance in otherwise healthy adults. You cannot out-exercise chronic sleep loss.",
    movement: "Restorative only today: a 20-minute slow walk, or stretching. Nothing high intensity within 4 hours of sleep, because training raises core body temperature and falling asleep requires it to drop.",
    supplement: "If you want the optional supplement support, order it today so it arrives in time. We start taking it on Day 7, not before, because these take a few days to ship and the habits matter more than the bottles. Morning with breakfast: Jarrow Formulas KSM-66 Ashwagandha 300mg. Afternoon 2 to 3 PM: Swanson Full Spectrum Lemon Balm 500mg. With dinner: a second Ashwagandha 300mg plus Thorne D3/K2 Liquid, 2 drops. Bedtime: Doctor's Best High Absorption Magnesium 400mg, two 200mg capsules. IMPORTANT: vitamin K2 works against warfarin and other blood thinners, so do not start the D3/K2 until your prescriber clears it. Ashwagandha is not for use in pregnancy, and clear it first if you take thyroid medication, sedatives, or immunosuppressants. None of this is required to do the challenge. These statements have not been evaluated by the Food and Drug Administration. These supplements are not intended to diagnose, treat, cure, or prevent any disease.",
  },
  {
    day: 4,
    title: "Hidden Inflammation",
    subtitle: "Foods that keep cortisol quietly elevated",
    action: "Swap one ingredient today. One, not your whole kitchen.",
    lesson: "Ultra-processed foods, industrial seed oils, refined sugar, and alcohol activate the same inflammatory pathways cortisol does. That creates a loop: stress raises cortisol, cortisol weakens the gut barrier, a leakier barrier raises systemic inflammation, and inflammation raises cortisol again. Removing seed oils and added sugars for even five days is enough for most people to notice less bloating and steadier afternoon energy.",
    movement: "Your 10-minute post-meal walk, plus NEAT through the day: stand while working, walk between tasks, pace on calls. NEAT burns more daily energy than structured exercise for most people and it does not spike cortisol.",
    supplement: "No supplement today. Your focus is the one ingredient swap. If you ordered the stack yesterday, it is on its way and we start it on Day 7.",
  },
  {
    day: 5,
    title: "One Exercise, Not One Hundred Crunches",
    subtitle: "Why sit-ups make the shape worse",
    action: "Do one set of dead bugs. Just one, to feel the movement.",
    lesson: "Crunches and sit-ups recruit the psoas, your hip flexors. Do enough of them and you tighten the muscles that tilt your pelvis forward, which pushes your lower belly out and strains your lower back. You feel like you worked and the shape gets worse. The dead bug does the opposite: it trains the deep transverse abdominis, the layer that wraps your middle like a built-in corset. Long cardio sessions raise cortisol, so more is not better. This one does not.",
    movement: "Dead bug, full form. On your back, arms straight up, knees bent to 90 degrees with shins parallel to the floor. Lower your right arm behind your head while lowering your left leg. Stop an inch above the floor. Return, switch sides. 10 per side, 2 sets. Keep your lower back flat against the floor the entire time. If it arches, make the movement smaller.",
    supplement: "Still no stack today, that starts Day 7. Today is about the movement. If you ordered your supplements on Day 3, check that they are arriving in time.",
  },
  {
    day: 6,
    title: "Minerals, Water, and Gut Transit",
    subtitle: "Bloating is often a movement problem",
    action: "Morning minerals before coffee: 16oz water, a pinch of sea salt, half a lemon.",
    lesson: "Water alone does not hydrate cells. Moving water into a cell requires sodium, potassium, and magnesium, and without them water passes through without being absorbed. Your gut stays dry and transit slows. Magnesium matters twice over: it is what your gut muscles need to contract, and an estimated 68 percent of American women take in less than their body needs. Chronic stress depletes it further. That is why stress and bloating travel together.",
    movement: "Add a 10-minute walk after dinner on top of your post-lunch walk. Walking stimulates the migrating motor complex, the wave that sweeps your small intestine between meals.",
    supplement: "Food sources today, nothing to buy: pumpkin seeds, dark leafy greens, black beans, lentils, avocado, almonds, or an ounce of 70 percent dark chocolate. The stack starts tomorrow if yours has arrived.",
  },
  {
    day: 7,
    title: "Week One Review",
    subtitle: "Read the signals before adding anything new",
    action: "Write down the one thing that shifted this week, even if it is small.",
    lesson: "Cortisol takes 5 to 7 days to respond to a protocol change, so today is your first honest read. Three signals: morning bloating, less means transit is improving. Energy after meals, steadier means your blood sugar response is flattening. Sleep quality, deeper means the magnesium and the evening routine are working. You do not need all three. One real shift is a data point worth trusting.",
    movement: "Full dead bug circuit: 4 sets of 10. No new movement today. Consistency is the variable this week, not intensity.",
    supplement: "If you ordered the stack and it has arrived, today is when you start. Morning with breakfast: Ashwagandha 300mg. Afternoon 2 to 3 PM: Lemon Balm 500mg. With dinner: the second Ashwagandha 300mg plus 2 drops of D3/K2, which needs the fat in your meal to absorb. Bedtime around 9:30 PM: Magnesium 400mg, 30 to 45 minutes before sleep. If the magnesium loosens your stools in the first few days, split it: 200mg with dinner and 200mg at bedtime. If your order has not come yet, start the day it does. Nothing is lost. These statements have not been evaluated by the Food and Drug Administration. These supplements are not intended to diagnose, treat, cure, or prevent any disease.",
  },
  {
    day: 8,
    title: "The Plate and the Insulin Switch",
    subtitle: "The hormone that decides store or burn",
    action: "Build one meal today using the plate formula.",
    lesson: "Insulin is the switch. While it is elevated, fat release is essentially switched off, and carbohydrate raises it far more than protein or fat. This is why two meals with identical calories do not behave the same way in your body. Combine that with Day 1: cortisol raises blood glucose, glucose raises insulin, so chronic stress keeps that switch in the storage position without you eating a single extra thing. The plate below is built to keep the insulin response low without counting anything.",
    movement: "Same movement pattern. Keep both walks and your dead bug schedule.",
    supplement: "Half your plate non-starchy vegetables for fiber and gut bacteria. One quarter quality protein, the anchor. One quarter complex carbohydrate such as sweet potato, quinoa, or lentils. One tablespoon of healthy fat so the fat-soluble nutrients in those vegetables absorb. Keep the core stack unchanged.",
  },
  {
    day: 9,
    title: "Probiotics, Prebiotics, and Your Liver",
    subtitle: "Feeding the bacteria and clearing the hormones",
    action: "Add one fermented food and one cruciferous vegetable today.",
    lesson: "Probiotics are living organisms and they need prebiotic fiber to survive. Take a capsule every morning, eat processed food all day, and the bacteria have nothing to live on. Food-based sources often outperform capsules because they arrive with their own feeding environment. Your liver matters here too. It clears excess estrogen in two phases, and when that pathway is sluggish estrogen recirculates through the gut, which drives storage at the lower belly and hips specifically.",
    movement: "Same movement pattern. Keep both walks and your dead bug schedule.",
    supplement: "Same stack. Add one probiotic food: plain kefir, plain Greek yogurt with live cultures, refrigerated kimchi, or refrigerated sauerkraut. Pair it with a prebiotic: garlic, onion, asparagus, oats, or an apple with the skin. Add one serving of cruciferous vegetables for liver support: broccoli, cauliflower, Brussels sprouts, cabbage, or kale.",
  },
  {
    day: 10,
    title: "Why It Changed After 40",
    subtitle: "Estrogen, insulin, and a new address for fat",
    action: "Note when your middle first changed, and what else changed that year.",
    lesson: "If this worked in your thirties and stopped working, nothing is wrong with your discipline. Two things changed. Estradiol protects insulin sensitivity, so as it declines through perimenopause the same meal produces a larger insulin response than it did at 35. Estrogen also decides where fat is stored: higher levels favor hips and thighs, and as it falls, storage shifts to the middle. Same woman, same food, new address. Now add cortisol from a life that got busier, and you have two forces pushing the same direction at once. That is the whole picture, and almost nobody explains it.",
    movement: "Same movement pattern. Strength work matters more each year, because muscle is where glucose goes when insulin is working properly.",
    supplement: "Same stack. If perimenopause symptoms are part of your picture, that is a conversation for your provider, and it is worth having with the labs in hand rather than from memory.",
  },
  {
    day: 11,
    title: "Why You Wake Up Hungry",
    subtitle: "Two hormones set your appetite while you sleep",
    action: "Blue light off by 9:30. Phone face down. In bed by 10:15.",
    lesson: "Leptin signals fullness. Ghrelin signals hunger. Under 7 hours of sleep, leptin drops and ghrelin rises, so you wake hungrier with stronger carbohydrate cravings before you have made a single choice. Chronic short sleep also shifts gut bacteria toward strains associated with fat storage. Your gut, your hunger, and your sleep are running on one system.",
    movement: "Restorative only: 20 minutes of yoga or a slow walk. Nothing high intensity within 4 hours of bed, because training raises core temperature and sleep onset requires it to fall.",
    supplement: "Same stack. Magnesium 30 to 45 minutes before bed matters more tonight than any other night this week.",
  },
  {
    day: 12,
    title: "The Post-Meal Walk and Your Trigger",
    subtitle: "Ten minutes, and the thing that spikes you",
    action: "Walk 10 minutes after your biggest meal. Then name your cortisol trigger.",
    lesson: "A 10-minute walk after your largest meal lowers post-meal blood sugar by 30 to 40 percent, which means a smaller insulin spike and a weaker storage signal. It also speeds gastric emptying, moves your lymphatic system which has no pump of its own, and lowers post-meal cortisol. Separately: the supplement stack lowers your baseline cortisol but it cannot touch what spikes it. That trigger is personal. A person, a notification, a time of day, a recurring conversation. Naming it is the only way to stop feeding the loop.",
    movement: "After your biggest meal, walk 10 minutes. Set a timer. Intensity does not matter, timing does. Then in the mid-afternoon, do 5 minutes of 4-7-8 breathing. Inhale 4, hold 7, exhale 8.",
    supplement: "Same stack. No additions.",
  },
  {
    day: 13,
    title: "The Hormone Everyone Is Injecting",
    subtitle: "You already make GLP-1. Here is how to make more",
    action: "Fiber or protein before the starch at every meal. Add one high-fiber food.",
    lesson: "GLP-1 is the hormone the injectable medications work on. Your gut already makes it. It slows how fast food leaves your stomach, signals your brain that you are satisfied, and steadies your blood sugar. Three things raise your own, and you have been doing two of them for almost two weeks. First, fiber and the order you eat in. Fiber forms a mesh in your gut that slows everything behind it, so eating it before the starch means the whole meal enters your bloodstream more gently. That is why Day 2 was protein first: fiber and protein do the same job from different angles, and the rule underneath both is that starch goes last. Second, the 10 minute walk after your largest meal from Day 12. Third, apple cider vinegar before a meal. Most American women eat 12 to 15 grams of fiber a day. The target is 25 to 30.",
    movement: "Same movement pattern. The post-meal walk from Day 12 is one of the three levers here, so keep it.",
    supplement: "Not a supplement today, a habit. Vegetables or protein before the starch at every meal, then add one high-fiber food you are not already eating: lentils, black beans, raspberries, avocado, chia, artichoke, broccoli, or oats. Add it slowly, because going from 12 grams to 30 overnight will bloat you, which is the opposite of the point. Optional: one tablespoon of apple cider vinegar in a glass of water 10 to 15 minutes before your largest meal blunts the glucose rise that follows. Skip it if you have reflux or take a medication for it, and always dilute it.",
  },
  {
    day: 14,
    title: "What You Built",
    subtitle: "Five habits that changed your hormonal environment",
    action: "Re-measure your waist and compare it to Day 1.",
    lesson: "Fourteen days ago your cortisol and insulin environment looked different than it does today. Five habits did that: cortisol support, protein timing, a protected sleep window, anti-inflammatory eating, and movement that does not spike the signal. None of them require perfection to keep working. The supplement stack takes about 30 days for full effect, so you are halfway through its curve.",
    movement: "Full circuit: 4 sets of 10 dead bugs, both walks, and 5 minutes of 4-7-8 breathing. This is your maintenance pattern.",
    supplement: "Continue all four for at least 30 days before evaluating results: Ashwagandha morning and evening, Lemon Balm mid-afternoon, D3/K2 with dinner, Magnesium at bedtime. These statements have not been evaluated by the Food and Drug Administration. These supplements are not intended to diagnose, treat, cure, or prevent any disease. Always consult your licensed healthcare provider before starting any new supplement.",
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

  // Unlocked by the calendar, not by how fast someone clicks. Missed days stay
  // open so anyone who falls behind can catch up.
  const maxUnlocked = unlockedThroughToday(DAYS.length)
  const isLocked = (day: number) => day > maxUnlocked

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
        {DAYS.map(d => {
          const locked = isLocked(d.day)
          return (
            <button
              key={d.day}
              className={styles.dayBtn}
              disabled={locked}
              title={locked ? `Day ${d.day} opens in ${d.day - maxUnlocked} day${d.day - maxUnlocked === 1 ? '' : 's'}` : `Day ${d.day}`}
              aria-label={locked ? `Day ${d.day}, locked` : `Day ${d.day}`}
              style={locked
                ? { opacity: 0.35, cursor: 'not-allowed' }
                : d.day === currentDay
                ? { borderColor: '#0B9E8E', background: '#0B9E8E', color: '#fff' }
                : completed.has(d.day)
                ? { borderColor: '#4be08a', color: '#4be08a' }
                : {}}
              onClick={() => {
                if (locked) return
                setCurrentDay(d.day)
                setTodayLogged(completed.has(d.day))
              }}
            >
              {locked ? '🔒' : completed.has(d.day) ? '✓' : d.day}
            </button>
          )
        })}
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
            {/* Today's specific action comes first. It changes each day and is
                the thing the lesson actually asked for. */}
            <label className={styles.habitItem}>
              <input
                type="checkbox" className={styles.habitCheck}
                checked={todayHabits.has('action')} onChange={() => toggleHabit('action')}
              />
              <span className={styles.habitLabel}>
                <strong>Day {currentDay}:</strong> {dayContent.action}
              </span>
            </label>

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
              {currentDay < DAYS.length ? ` Come back tomorrow for Day ${currentDay + 1}.` : ''}
            </p>
          )}
        </form>
      </div>

      <div className={styles.contentCard}>
        <div className={styles.contentSection}>
          <div className={styles.contentLabel}>How To Videos</div>
          <p className={styles.contentText}>
            <strong>Measuring your waist</strong> (NHS, 1 minute):{' '}
            <a href="https://www.youtube.com/watch?v=dwk8sVCKuio" target="_blank" rel="noopener noreferrer">
              youtube.com/watch?v=dwk8sVCKuio
            </a>
            <br />
            <strong>The dead bug, proper form</strong> (NASM):{' '}
            <a href="https://www.youtube.com/watch?v=bxn9FBrt4-A" target="_blank" rel="noopener noreferrer">
              youtube.com/watch?v=bxn9FBrt4-A
            </a>
            <br />
            <strong>Dead bug for beginners</strong>, if the full version is too much:{' '}
            <a href="https://www.youtube.com/watch?v=psOZS-sVDww" target="_blank" rel="noopener noreferrer">
              youtube.com/watch?v=psOZS-sVDww
            </a>
          </p>
        </div>
      </div>

      <div className={styles.contentCard}>
        <div className={styles.contentSection}>
          <div className={styles.contentLabel}>The Next 14 Days</div>
          <ol className={styles.roadmap}>
            {DAYS.map(d => (
              <li key={d.day} className={styles.roadmapItem}>
                <span className={styles.roadmapDay}>
                  {completed.has(d.day) ? '✓' : isLocked(d.day) ? '🔒' : '▸'} Day {d.day}
                </span>
                {/* Titles only. Showing each day's action here let people read
                    all 14 instructions at once and skip the daily rhythm. */}
                <span className={styles.roadmapTitle}>
                  {d.title}
                  {/* Days already open show their action. Locked days show the
                      title only, so nobody can read ahead. */}
                  {!isLocked(d.day) && (
                    <span className={styles.roadmapAction}>{d.action}</span>
                  )}
                </span>
              </li>
            ))}
          </ol>
          <p className={styles.contentText}>
            One day opens each morning, in step with your email. You cannot skip ahead, and you do
            not need to. If you miss a day it stays open, so you can always go back and catch up.
          </p>
        </div>
      </div>

      {currentDay >= DAYS.length && todayLogged && (
        <div className={styles.ctaCard}>
          <h2 className={styles.ctaTitle}>You finished the 14-Day Flat Belly Challenge.</h2>
          <p className={styles.ctaText}>
            You now understand the cortisol-belly connection and have your full supplement stack. The Foundation membership gives you the full 90-day metabolic protocol built around your specific pattern, including lab context, the complete ROOTS Framework, and direct access to Dr. Hunter's educator dashboard.
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
