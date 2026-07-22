import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import Chart from 'chart.js/auto'
import toast from 'react-hot-toast'
import styles from './HormoneChallengePage.module.css'

const GATE_KEY = 'hormone_challenge_acknowledged'
const SETUP_KEY = 'hormone_challenge_setup'

type PhaseKey = 'menstrual' | 'follicular' | 'ovulatory' | 'luteal'
type ConditionKey = '' | 'pcos' | 'hashimotos' | 'perimenopause' | 'endometriosis' | 'adrenal'

interface Setup {
  startCycleDay: number
  condition: ConditionKey
  setupDate: string
}

interface ProgressRow {
  challenge_day: number
  mood_score: number | null
  energy_score: number | null
  habits_completed: string[]
}

const CONDITIONS: { value: ConditionKey; label: string }[] = [
  { value: '', label: 'None / Not sure' },
  { value: 'pcos', label: 'PCOS / PMOS (Polyendocrine Metabolic Ovarian Syndrome)' },
  { value: 'hashimotos', label: "Hashimoto's / Hypothyroidism" },
  { value: 'perimenopause', label: 'Perimenopause / Menopause' },
  { value: 'endometriosis', label: 'Endometriosis' },
  { value: 'adrenal', label: 'HPA Axis Dysregulation' },
]

const PHASE_DATA: Record<PhaseKey, {
  name: string; subtitle: string; days: string; color: string; desc: string;
  movement: string; nutrition: string; supplement: string; selfCare: string
}> = {
  menstrual: {
    name: 'Menstrual Phase', subtitle: 'Rest, restore, and release', days: 'Days 1-5', color: '#7c3aed',
    desc: 'Estrogen and progesterone are at their lowest. Your body is shedding. Rest is productive, not optional.',
    movement: 'Gentle movement only: walking, restorative yoga, or swimming. Skip high-intensity work. Your iron and energy reserves are at their lowest right now.',
    nutrition: 'Iron-rich foods: grass-fed beef, dark leafy greens, lentils. Add vitamin C to boost iron absorption. Warm, easy-to-digest meals. Bone broth is ideal during this phase.',
    supplement: 'Magnesium glycinate 400mg at night for cramp support. Omega-3 EPA/DHA 2-3g for inflammation reduction. Iron bisglycinate if you experience heavy bleeding.',
    selfCare: 'Reduce obligations where possible. Use heat therapy for cramps. Slow down and observe how your cycle affects your energy and mood patterns.',
  },
  follicular: {
    name: 'Follicular Phase', subtitle: 'Build, learn, and create', days: 'Days 6-13', color: '#0891b2',
    desc: 'Estrogen is rising steadily. Energy, mood, and cognitive clarity are all increasing. This is your natural building phase.',
    movement: 'Best phase for strength training and high-intensity work. Your pain tolerance is highest and your recovery is fastest. Schedule your most demanding workouts here.',
    nutrition: 'Lean protein, lightly steamed cruciferous vegetables (broccoli, kale), fermented foods for gut diversity. Seed cycling: 1 tbsp ground flax plus 1 tbsp pumpkin seeds daily.',
    supplement: 'Vitamin D3 (target 60-80 ng/mL). B complex with methylated B vitamins. CoQ10 200mg for mitochondrial energy support.',
    selfCare: 'Plan your most ambitious projects and challenging social commitments here. Your brain is at its collaborative and creative best during this window.',
  },
  ovulatory: {
    name: 'Ovulatory Phase', subtitle: 'Peak energy and connection', days: 'Days 14-16', color: '#16a34a',
    desc: 'The LH surge triggers ovulation. Estrogen peaks. Testosterone briefly rises. This is your highest-energy window of the entire cycle.',
    movement: 'Maximum output: personal records, competitions, challenging hikes. Your body is primed for performance. Use this window intentionally.',
    nutrition: 'Raw and lightly cooked vegetables for DIM (cruciferous estrogen metabolism support). Zinc-rich foods: oysters, pumpkin seeds, beef. Seed cycling shift: sunflower and sesame seeds daily.',
    supplement: 'CoQ10 600mg if trying to conceive (egg quality support). Zinc 25-30mg. Continue B complex. Shift seed cycling to 1 tbsp sunflower plus 1 tbsp sesame seeds.',
    selfCare: 'Schedule high-stakes presentations, difficult conversations, and creative launches. Your communication skills and natural confidence are amplified now.',
  },
  luteal: {
    name: 'Luteal Phase', subtitle: 'Complete, wind down, and prepare', days: 'Days 17-28', color: '#d97706',
    desc: 'The corpus luteum produces progesterone. Energy peaks around Day 19-21, then declines as progesterone drops if conception did not occur.',
    movement: 'Moderate intensity: Pilates, hiking, strength training at 70%. Shift away from extreme output in the final 5-7 days as your body prepares for the next cycle.',
    nutrition: 'Magnesium-rich foods: dark chocolate (85%+), avocado, pumpkin seeds. Complex carbohydrates matter more now: sweet potato, oats, quinoa. Reduce caffeine in the final week.',
    supplement: 'Magnesium glycinate 400mg at night (top luteal priority). B6/P5P 50mg for PMS and progesterone support. Evening primrose oil 1g through mid-luteal phase only.',
    selfCare: 'Wind down commitments in the final 5-7 days. Journal about what is not working and what needs to change. Protect your sleep. Progesterone supports deep sleep when cortisol is low.',
  },
}

const CONDITION_NOTES: Record<string, { title: string; text: string; warning?: string }> = {
  pcos: {
    title: 'Your PCOS / PMOS Add-On',
    text: 'Myo-inositol 4g daily (40:1 ratio with D-chiro inositol, such as Ovasitol) is the single most studied daily intervention for PMOS. Take every day of the cycle, not just certain phases. It improves insulin signaling, supports follicular development, and reduces androgen excess. Berberine 500mg three times daily with meals has strong evidence for insulin sensitization, comparable to metformin in several published trials.',
    warning: 'Drug interaction: do not combine Berberine with Metformin without provider monitoring (additive blood glucose lowering). Avoid Berberine during pregnancy or if taking cyclosporine.',
  },
  hashimotos: {
    title: "Your Hashimoto's Add-On",
    text: "Selenium 200mcg (selenomethionine form) taken consistently for 3-6 months is the most studied micronutrient for Hashimoto's, with twelve meta-analyses supporting TPO antibody reduction. Brazil nuts (2-3 per day) provide a food-based source. If you take levothyroxine: take it on an empty stomach with water and wait at least 60 minutes before food, coffee, calcium, or iron supplements. Low ferritin (below 70 ng/mL) from heavy periods impairs T4-to-T3 conversion and worsens hypothyroid symptoms.",
    warning: 'Drug interaction: iron and calcium supplements must be separated from levothyroxine by at least 4 hours.',
  },
  perimenopause: {
    title: 'Your Perimenopause Add-On',
    text: 'HPA axis support is central to perimenopause management as cortisol fills the gap left by declining estrogen and progesterone. Ashwagandha (KSM-66) 300mg twice daily has clinical trial evidence for cortisol reduction and thyroid T3/T4 support. Magnesium glycinate 400mg nightly supports sleep architecture as progesterone declines. Pycnogenol 100mg and Vitamin E 400 IU have trial evidence for hot flash reduction.',
    warning: 'Drug interaction: Ashwagandha may interact with thyroid medications, sedatives, and immunosuppressants. Discuss with your provider before starting.',
  },
  endometriosis: {
    title: 'Your Endometriosis Add-On',
    text: 'Omega-3 EPA/DHA 2-3g daily is the most evidence-supported supplement for endometriosis-related inflammation. DIM (diindolylmethane) 200-400mg supports healthy estrogen metabolism through the protective 2-hydroxy pathway. Iron bisglycinate if you experience heavy periods (ferritin target: above 70 ng/mL). Reducing red meat and increasing anti-inflammatory foods (fatty fish, colorful vegetables) has measurable effects on pain scores in research trials.',
  },
  adrenal: {
    title: 'Your HPA Axis Dysregulation Add-On',
    text: 'HPA axis dysregulation responds to adaptogenic support and lifestyle sequencing. Ashwagandha (KSM-66) 300mg twice daily reduces morning cortisol and supports evening cortisol wind-down. Phosphatidylserine 300-400mg blunts cortisol spikes from exercise and psychological stress. B5 (pantothenic acid) 500mg supports adrenal hormone synthesis. Sleep timing is the highest-leverage intervention: cortisol rhythm cannot normalize without consistent wake and sleep times.',
    warning: 'Drug interaction: Ashwagandha may interact with thyroid medications, sedatives, and immunosuppressants. Discuss with your provider before starting.',
  },
}

const HABITS = [
  { id: 'supps', label: 'Took my phase supplements today' },
  { id: 'movement', label: 'Hit my movement goal for this phase' },
  { id: 'sleep', label: 'Got 7+ hours of sleep last night' },
  { id: 'water', label: 'Drank 64+ oz of water today' },
  { id: 'phase_eating', label: 'Ate to support my current phase' },
]

function getPhaseKey(cycleDay: number): PhaseKey {
  if (cycleDay <= 5) return 'menstrual'
  if (cycleDay <= 13) return 'follicular'
  if (cycleDay <= 16) return 'ovulatory'
  return 'luteal'
}

function calcDays(setup: Setup): { challengeDay: number; cycleDay: number } {
  const daysSince = Math.floor((Date.now() - new Date(setup.setupDate).getTime()) / 86400000)
  const challengeDay = Math.min(Math.max(daysSince + 1, 1), 28)
  const cycleDay = ((setup.startCycleDay - 1 + daysSince) % 35) + 1
  return { challengeDay, cycleDay }
}

function ScorePicker({ label, value, onChange, color }: {
  label: string; value: number; onChange: (v: number) => void; color: string
}) {
  return (
    <div className={styles.scorePicker}>
      <div className={styles.scoreLabel}>{label}</div>
      <div className={styles.scoreDots}>
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            className={styles.scoreDot}
            style={value >= n ? { background: color, borderColor: color, color: '#fff' } : {}}
            onClick={() => onChange(n)}
            aria-label={`${label} score ${n}`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function HormoneChallengePage() {
  const [acknowledged, setAcknowledged] = useState(
    () => typeof window !== 'undefined' && localStorage.getItem(GATE_KEY) === 'true'
  )
  const [setup, setSetup] = useState<Setup | null>(() => {
    if (typeof window === 'undefined') return null
    const raw = localStorage.getItem(SETUP_KEY)
    return raw ? (JSON.parse(raw) as Setup) : null
  })
  const [setupForm, setSetupForm] = useState({ startCycleDay: 1, condition: '' as ConditionKey })

  const [progress, setProgress] = useState<ProgressRow[]>([])
  const [todayHabits, setTodayHabits] = useState<Set<string>>(new Set())
  const [moodScore, setMoodScore] = useState(0)
  const [energyScore, setEnergyScore] = useState(0)
  const [saving, setSaving] = useState(false)
  const [todayLogged, setTodayLogged] = useState(false)

  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  const { challengeDay, cycleDay } = setup ? calcDays(setup) : { challengeDay: 1, cycleDay: 1 }
  const phaseKey = getPhaseKey(cycleDay)
  const phase = PHASE_DATA[phaseKey]
  const conditionNote = setup?.condition ? CONDITION_NOTES[setup.condition] : null

  const streak = (() => {
    let s = 0
    for (let d = challengeDay; d >= 1; d--) {
      if (progress.some(p => p.challenge_day === d && (p.habits_completed as string[]).length > 0)) s++
      else break
    }
    return s
  })()

  const loadProgress = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('challenge_progress')
      .select('challenge_day, mood_score, energy_score, habits_completed')
      .eq('user_id', user.id)
      .order('challenge_day')
    if (data) {
      setProgress(data as ProgressRow[])
      const today = (data as ProgressRow[]).find(p => p.challenge_day === challengeDay)
      if (today) {
        setTodayLogged(true)
        setTodayHabits(new Set(today.habits_completed as string[]))
        setMoodScore(today.mood_score ?? 0)
        setEnergyScore(today.energy_score ?? 0)
      }
    }
  }, [challengeDay])

  useEffect(() => {
    if (setup) loadProgress()
  }, [setup, loadProgress])

  useEffect(() => {
    if (!chartRef.current || progress.length === 0) return
    const labels = Array.from({ length: 28 }, (_, i) => `D${i + 1}`)
    const moodData = Array.from({ length: 28 }, (_, i) =>
      progress.find(p => p.challenge_day === i + 1)?.mood_score ?? null
    )
    const energyData = Array.from({ length: 28 }, (_, i) =>
      progress.find(p => p.challenge_day === i + 1)?.energy_score ?? null
    )
    if (chartInstance.current) chartInstance.current.destroy()
    chartInstance.current = new Chart(chartRef.current, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Mood', data: moodData, borderColor: '#7c3aed',
            backgroundColor: 'rgba(124,58,237,0.08)', spanGaps: true, tension: 0.3,
            fill: true, pointRadius: 3,
          },
          {
            label: 'Energy', data: energyData, borderColor: '#0B9E8E',
            backgroundColor: 'rgba(11,158,142,0.08)', spanGaps: true, tension: 0.3,
            fill: true, pointRadius: 3,
          },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: {
          y: { min: 1, max: 5, ticks: { stepSize: 1 }, grid: { color: 'rgba(128,128,128,0.12)' } },
          x: { grid: { display: false } },
        },
        plugins: { legend: { position: 'bottom' }, tooltip: { mode: 'index', intersect: false } },
      },
    })
    return () => { chartInstance.current?.destroy(); chartInstance.current = null }
  }, [progress])

  function acknowledge() {
    localStorage.setItem(GATE_KEY, 'true')
    setAcknowledged(true)
  }

  function saveSetup(e: React.FormEvent) {
    e.preventDefault()
    const s: Setup = {
      startCycleDay: setupForm.startCycleDay,
      condition: setupForm.condition,
      setupDate: new Date().toISOString().split('T')[0],
    }
    localStorage.setItem(SETUP_KEY, JSON.stringify(s))
    setSetup(s)
  }

  function toggleHabit(id: string) {
    setTodayHabits(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function saveLog(e: React.FormEvent) {
    e.preventDefault()
    if (!setup) return
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { toast.error('Sign in to save your progress'); setSaving(false); return }
      const { error } = await supabase.from('challenge_progress').upsert({
        user_id: user.id,
        challenge_day: challengeDay,
        cycle_day: cycleDay,
        condition: setup.condition || null,
        mood_score: moodScore || null,
        energy_score: energyScore || null,
        habits_completed: Array.from(todayHabits),
        logged_at: new Date().toISOString(),
      }, { onConflict: 'user_id,challenge_day' })
      if (error) throw error
      toast.success('Day logged!')
      setTodayLogged(true)
      await loadProgress()
    } catch {
      toast.error('Could not save. Please try again.')
    }
    setSaving(false)
  }

  if (!acknowledged) {
    return (
      <div className={styles.gateOverlay}>
        <div className={styles.gateBox}>
          <p className={styles.gateBadge}>28-Day Challenge</p>
          <h1 className={styles.gateTitle}>Hormone Intelligence Challenge</h1>
          <p className={styles.gateBody}>
            This tool provides hormone cycle education and habit tracking to help you understand your cycle and its connection to energy, mood, and metabolic health.
          </p>
          <div className={styles.gateDisclaimer}>
            <strong>Educational use only.</strong> This is not medical advice and is not intended to diagnose, treat, cure, or prevent any disease or health condition. These statements have not been evaluated by the Food and Drug Administration. Supplement information is for educational purposes only. Always consult your healthcare provider before starting any new supplement or making changes to your health routine.
          </div>
          <button className={styles.gateBtn} onClick={acknowledge}>
            I understand. Start the Challenge
          </button>
        </div>
      </div>
    )
  }

  if (!setup) {
    return (
      <div className={styles.page}>
        <div className={styles.setupCard}>
          <p className={styles.badge}>28-Day Hormone Intelligence Challenge</p>
          <h1 className={styles.title}>Let's personalize your experience</h1>
          <p className={styles.subtitle}>Tell us where you are in your cycle today so we can show the right phase guidance.</p>
          <form onSubmit={saveSetup} className={styles.setupForm}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>What day of your cycle are you on today?</label>
              <p className={styles.fieldHint}>Day 1 = first day of your period. If your cycles are irregular or you are postmenopausal, enter your best estimate or choose 1.</p>
              <input
                type="number" min={1} max={40} value={setupForm.startCycleDay}
                onChange={e => setSetupForm(f => ({ ...f, startCycleDay: parseInt(e.target.value) || 1 }))}
                className={styles.fieldInput} required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Do you have a hormone-related condition? (optional)</label>
              <select
                value={setupForm.condition}
                onChange={e => setSetupForm(f => ({ ...f, condition: e.target.value as ConditionKey }))}
                className={styles.fieldSelect}
              >
                {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <button type="submit" className={styles.primaryBtn}>Start Day 1</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>

      <div className={styles.header}>
        <p className={styles.badge}>28-Day Hormone Intelligence Challenge</p>
        <h1 className={styles.title}>Day {challengeDay} of 28</h1>
        <div className={styles.metaRow}>
          <span className={styles.streakPill}>🔥 {streak} day{streak !== 1 ? 's' : ''} streak</span>
          <span className={styles.cyclePill}>Cycle Day {cycleDay}</span>
        </div>
      </div>

      <div className={styles.phaseCard} style={{ borderLeftColor: phase.color }}>
        <div className={styles.phaseTop}>
          <span className={styles.phaseDays} style={{ color: phase.color, borderColor: `${phase.color}40`, background: `${phase.color}10` }}>
            {phase.days}
          </span>
          <span className={styles.phaseName} style={{ color: phase.color }}>{phase.name}</span>
        </div>
        <p className={styles.phaseSubtitle}>{phase.subtitle}</p>
        <p className={styles.phaseDesc}>{phase.desc}</p>
        <div className={styles.phaseGrid}>
          {[
            { label: 'Movement', text: phase.movement },
            { label: 'Nutrition', text: phase.nutrition },
            { label: 'Supplement Focus', text: phase.supplement },
            { label: 'Self-Care', text: phase.selfCare },
          ].map(item => (
            <div key={item.label} className={styles.phaseGridItem} style={{ borderLeftColor: phase.color }}>
              <div className={styles.phaseGridLabel} style={{ color: phase.color }}>{item.label}</div>
              <p className={styles.phaseGridText}>{item.text}</p>
            </div>
          ))}
        </div>
        <p className={styles.phaseNote}>Educational purposes only. Not medical advice.</p>
      </div>

      {conditionNote && (
        <div className={styles.conditionCard}>
          <div className={styles.conditionTitle}>{conditionNote.title}</div>
          <p className={styles.conditionText}>{conditionNote.text}</p>
          {conditionNote.warning && (
            <div className={styles.conditionWarning}>{conditionNote.warning}</div>
          )}
          <p className={styles.dshea}>
            These statements have not been evaluated by the Food and Drug Administration. This information is not intended to diagnose, treat, cure, or prevent any disease.
          </p>
        </div>
      )}

      <div className={styles.logCard}>
        <h2 className={styles.logTitle}>Today's Check-In</h2>
        <form onSubmit={saveLog}>
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
            <ScorePicker label="Mood" value={moodScore} onChange={setMoodScore} color="#7c3aed" />
            <ScorePicker label="Energy" value={energyScore} onChange={setEnergyScore} color="#0B9E8E" />
          </div>
          <button type="submit" className={styles.saveBtn} disabled={saving}>
            {saving ? 'Saving...' : todayLogged ? 'Update Today' : `Log Day ${challengeDay}`}
          </button>
          {todayLogged && <p className={styles.loggedNote}>Day {challengeDay} logged. Come back tomorrow.</p>}
        </form>
      </div>

      {progress.length > 0 && (
        <div className={styles.chartCard}>
          <h2 className={styles.chartTitle}>Your 28-Day Mood and Energy Trend</h2>
          <div className={styles.chartWrap}>
            <canvas ref={chartRef} />
          </div>
        </div>
      )}

      {challengeDay >= 28 && (
        <div className={styles.ctaCard}>
          <h2 className={styles.ctaTitle}>You completed the 28-Day Challenge.</h2>
          <p className={styles.ctaText}>You now have 28 days of your own mood and energy data mapped to your cycle phases. That is your pattern. The next step is a clarity call with Dr. Hunter to build your personalized protocol around what you learned.</p>
          <a href="https://doxy.me/drshallandahunter" target="_blank" rel="noopener noreferrer" className={styles.ctaBtn}>
            Book Your Clarity Call
          </a>
        </div>
      )}

      <p className={styles.disclaimer}>
        For educational purposes only. Not medical advice. These statements have not been evaluated by the Food and Drug Administration. Supplement information is not intended to diagnose, treat, cure, or prevent any disease. Always consult your healthcare provider before starting any new supplement or health protocol.
      </p>
    </div>
  )
}
