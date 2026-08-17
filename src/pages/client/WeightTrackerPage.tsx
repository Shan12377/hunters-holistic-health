import { useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js'
import { supabase } from '@/lib/supabase'
import { format, parseISO } from 'date-fns'
import type { WeightLog } from '@/types'
import toast from 'react-hot-toast'
import { Scale, Plus, Info, ChevronDown, ChevronUp, Activity, Zap, Moon, Leaf } from 'lucide-react'
import PlanGate from '@/components/ui/PlanGate'
import BackButton from '@/components/BackButton'
import styles from './Client.module.css'
import shared from '../../styles/shared.module.css'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const WEIGHT_EDU = [
  {
    id: 'scale',
    title: 'Why the Scale Lies',
    sub: 'Daily weight fluctuates 2 to 5 lbs. Trend is what matters, not any single reading.',
    body: [
      'Your body weight is not a precise measure of fat. A single reading reflects fat, muscle, bone, water, food in your gut, and hormonal fluid retention, all at once. On any given morning you can weigh 3 to 5 lbs more than the day before without having gained an ounce of fat.',
      'Glycogen (your body\'s stored carbohydrate) holds 3 to 4 grams of water per gram stored. Eat a higher-carb day and your muscles fill with glycogen and water. The scale jumps. Eat lower-carb and it drops. Neither reflects actual fat change.',
      'For women, hormonal cycles cause water retention of 2 to 5 lbs in the luteal phase (week before a period). This is normal and not fat. Weighing only once a week or tracking a 7-day average removes most of this noise.',
      'The functional medicine view: weigh weekly at the same time under the same conditions. Track your waist measurement monthly. Track how your clothes fit and your energy level weekly. These together paint a far more accurate picture than a daily scale reading.',
    ],
  },
  {
    id: 'waist',
    title: 'Waist Circumference Is the Real Signal',
    sub: 'Waist inches predict metabolic risk better than total weight or BMI',
    body: [
      'Visceral fat, the fat stored inside the abdominal cavity around your organs, is metabolically active. It secretes pro-inflammatory cytokines (TNF-alpha, IL-6) that directly impair insulin signaling, suppress adiponectin, and elevate blood pressure. This is the fat that drives disease. It also happens to be the fat that responds fastest to lifestyle intervention.',
      'Waist circumference is your best proxy for visceral fat without expensive imaging. Measure at the narrowest point of your natural waist (about 1 inch above the navel), not at the hips. Functional medicine targets: below 35 inches for women, below 40 inches for men. The waist-to-hip ratio (waist divided by hip) should be below 0.85 in women.',
      'Many people report losing 1 to 2 inches from their waist before the scale changes. This is fat loss happening exactly as it should. Visceral fat releases before subcutaneous fat shifts. If your waist is shrinking and your scale is stuck, you are still progressing.',
      'Log both. Let the waist number tell the real story when the scale is not cooperating.',
    ],
  },
  {
    id: 'setpoint',
    title: 'The Set Point: Why Your Body Fights Back',
    sub: 'Metabolic adaptation is real. Knowing it prevents discouragement.',
    body: [
      'When you create a caloric deficit, your body initiates a homeostatic counter-response. Ghrelin (the hunger hormone) rises. Leptin (the satiety hormone) falls. Non-exercise activity thermogenesis (NEAT) drops unconsciously. You fidget less, sit more, and take fewer steps without realizing it. Resting metabolic rate decreases beyond what lean tissue loss alone would predict.',
      'Research shows 40% of the resting metabolic rate reduction during weight loss comes from metabolic adaptation, not tissue loss. This is the biological set point system at work. It evolved to prevent starvation. It does not know you are choosing to lose weight.',
      'This is not failure. It is physiology. The strategies that work with it: lose slowly (0.5 to 1 lb per week prevents extreme adaptation), resistance train to preserve muscle (muscle is metabolically expensive and delays rate reduction), take periodic maintenance breaks (2 to 4 weeks at maintenance calories partially resets the adaptive response), and address the hormonal root causes (thyroid, cortisol, insulin) that set your set point in the first place.',
      'Plateaus are the set point reasserting itself. They are not permanent unless you stop.',
    ],
  },
  {
    id: 'protein',
    title: 'Protein Is the Weight Loss Anchor',
    sub: 'The one macronutrient that preserves muscle, controls hunger, and costs calories to digest',
    body: [
      'Protein has the highest thermic effect of any macronutrient: your body burns 20 to 30% of protein calories just digesting it. A 500-calorie protein portion yields only 350 to 400 net calories after digestion. No other macronutrient comes close (fat: 0 to 3%; carbs: 5 to 10%).',
      'Protein activates the leucine threshold, the trigger for muscle protein synthesis. You need at least 2.5 to 3g of leucine in a single meal to turn on muscle building. This requires roughly 30 to 40g of complete protein per meal, not spread across the day in small amounts. First meal of the day is the most important: eating protein at breakfast sets muscle protein synthesis on for the entire day.',
      'During a caloric deficit, muscle is at risk. Every pound of muscle lost lowers your resting metabolic rate by 6 to 10 calories per day. That loss is permanent until the muscle is rebuilt. Lose 10 lbs of muscle and you have reduced your daily calorie burn by 60 to 100 calories. This compounds into progressively easier weight regain.',
      'Target: 1.6 to 2.2g protein per kg of body weight daily. On any medication reducing appetite (GLP-1 drugs), this becomes 1.6g minimum. The appetite reduction increases muscle loss risk by reducing total food intake, making protein density at every meal even more critical.',
    ],
  },
  {
    id: 'hunger',
    title: 'Your Hunger Is Not Willpower: It Is Hormones',
    sub: 'Ghrelin, leptin, and GLP-1 control appetite at the biological level',
    body: [
      'Ghrelin is the hunger hormone secreted by the stomach. It rises before meals and drops after eating. After significant weight loss, ghrelin increases chronically, meaning your body is biologically hungrier than before you lost weight. One night of 4 to 5 hours of sleep raises ghrelin by 24% and lowers leptin by 18% simultaneously. This is why sleep-deprived people eat more: they are hormonally driven to.',
      'Leptin is the satiety hormone produced by fat cells. As fat mass decreases, leptin decreases. The brain\'s hypothalamus gets less satiety signal from the same meal. This is leptin resistance in reverse. The fat mass that produced leptin is gone, so the signal fades. This is another reason weight loss becomes harder to sustain: the brain is getting less "I am full" message even when you are eating the same amount.',
      'GLP-1 (glucagon-like peptide-1) is produced by gut L cells after eating, especially after protein, fiber, and bitter foods. It slows gastric emptying, reduces appetite, and signals satiety to the brain. GLP-1 medications (semaglutide, tirzepatide) are pharmaceutical versions of this hormone. Naturally raising GLP-1 through diet: eat fiber first, then protein, then carbs at every meal; include bitter foods (arugula, dandelion, radicchio); consume polyphenol-rich foods (berries, pomegranate, green tea) that feed Akkermansia, which produces a natural GLP-1 stimulator.',
      'Tracking your hunger level daily gives you a window into your hormonal status. Persistent high hunger despite adequate food = possible leptin issue (assess with labs), sleep deficit, or insulin resistance still active. Persistent low hunger = possible GLP-1 effect, either from medication or from your nutritional approach working.',
    ],
  },
]

const WEIGHT_LEVERS = [
  {
    id: 'insulin',
    number: '01',
    title: 'Insulin',
    subtitle: 'High insulin is the fat storage gate. While insulin is elevated, your body cannot access stored fat for fuel.',
    color: '#0b9e8e',
    disruptors: [
      'Ultra-processed carbohydrates (white bread, crackers, cereals, packaged snacks)',
      'Eating carbohydrates first in a meal before protein and fiber',
      'Eating too frequently, because grazing keeps insulin elevated all day',
    ],
    fixes: [
      'Eat in the order: vegetables → protein → carbs last (reduces glucose spike 73%)',
      'Post-meal 10 minute walk activates GLUT4 glucose uptake without insulin',
      'Berberine 500mg with meals (activates AMPK, same pathway as metformin)',
    ],
    question: 'Did I eat in order and move after at least one meal today?',
  },
  {
    id: 'cortisol',
    number: '02',
    title: 'Cortisol',
    subtitle: 'Cortisol directly activates fat storage in visceral adipose tissue. Chronic stress means chronic belly fat accumulation.',
    color: '#c8a74b',
    disruptors: [
      'Chronic unresolved stress (even low-grade sustained stress counts)',
      'Under-sleeping (below 7 hours raises cortisol significantly)',
      'Skipping meals when already stressed (fasting under stress = cortisol spike)',
    ],
    fixes: [
      'Box breathing: 4 counts in, 4 hold, 4 out, 4 hold, for 5 minutes before the largest meal',
      'Morning sunlight within 30 minutes of waking (anchors the cortisol circadian rhythm)',
      'Ashwagandha (KSM-66) 300mg in the evening (reduces cortisol by 14 to 27% in RCTs)',
    ],
    question: 'Did I do something today that actively lowered my stress response?',
  },
  {
    id: 'sleep',
    number: '03',
    title: 'Sleep',
    subtitle: 'One short night raises ghrelin 24% and drops leptin 18%. You cannot out-discipline sleep-deprived hunger hormones.',
    color: '#4be08a',
    disruptors: [
      'Screens with blue light within 1 hour of bed (delays melatonin by 90+ minutes)',
      'Eating within 2 hours of sleep (raises core temperature, disrupts deep sleep entry)',
      'Alcohol (suppresses REM sleep and growth hormone release even at low doses)',
    ],
    fixes: [
      'Blackout curtains and room temperature 65 to 68°F for deep sleep',
      'Magnesium glycinate 300mg at bedtime (relaxes the nervous system, improves sleep quality)',
      '7 to 9 hours per night. Sleep is the single highest-leverage weight management tool for most people',
    ],
    question: 'Is my sleep environment set up to protect my hunger hormones tonight?',
  },
  {
    id: 'gut',
    number: '04',
    title: 'Gut Microbiome',
    subtitle: 'Your gut bacteria determine how much energy you extract from food, how hungry you feel, and how your body responds to GLP-1.',
    color: '#c882e8',
    disruptors: [
      'Ultra-processed food (starves beneficial bacteria within 3 to 4 days of exposure)',
      'Antibiotics (reduce microbiome diversity for 6 to 12 months per course)',
      'Fewer than 15 different plant foods per week (low diversity = low metabolic flexibility)',
    ],
    fixes: [
      '30 different plant foods per week (American Gut Project: above 30 plants = dramatically higher diversity)',
      'Polyphenol-rich foods daily: berries, pomegranate, green tea (feed Akkermansia muciniphila)',
      'Psyllium husk 5g before meals (soluble fiber → butyrate → AMPK activation = same pathway as berberine)',
    ],
    question: 'Did I eat at least 5 different plant foods and something fiber-rich today?',
  },
]

const HUNGER_LABELS: Record<number, string> = {
  1: 'Never hungry',
  2: 'Satisfied most of day',
  3: 'Normal hunger',
  4: 'Extra hungry',
  5: 'Cravings hit hard',
}
const HUNGER_COLORS: Record<number, string> = {
  1: '#4be08a', 2: '#4be08a', 3: '#c8a74b', 4: '#e08a4b', 5: '#e05c5c',
}

const FOOD_TAGS = ['Clean whole foods', 'Average day', 'Ate processed food', 'Social eating / off plan'] as const
const MOVE_TAGS = ['Rest day', 'Light movement', 'Moderate workout', 'Heavy training'] as const
type FoodTag = typeof FOOD_TAGS[number]
type MoveTag = typeof MOVE_TAGS[number]

export default function WeightTrackerPage() {
  const [logs, setLogs] = useState<WeightLog[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    weight_lbs: '', waist_in: '', hip_in: '',
    hunger_level: '' as string,
    protein_hit: '' as '' | 'yes' | 'no',
    water_cups: '', notes: '',
  })
  const [foodTag, setFoodTag] = useState<FoodTag | null>(null)
  const [moveTag, setMoveTag] = useState<MoveTag | null>(null)
  const [openEdu, setOpenEdu] = useState<string | null>(null)
  // Lets a missed day get logged after the fact instead of only "right now."
  // Noon on the chosen day avoids the entry landing on the wrong day near midnight
  // in any timezone.
  const todayStr = () => new Date().toISOString().split('T')[0]
  const [entryDate, setEntryDate] = useState(todayStr())

  useEffect(() => { fetchLogs() }, [])

  const fetchLogs = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user
    if (!user) return
    const { data } = await supabase
      .from('weight_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('logged_at', { ascending: true })
      .limit(90)
    setLogs((data as WeightLog[]) ?? [])
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const w = parseFloat(form.weight_lbs)
    if (isNaN(w) || w < 50 || w > 700) {
      toast.error('Please enter a valid weight between 50 and 700 lbs')
      return
    }
    setSubmitting(true)
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user
    if (!user) { setSubmitting(false); return }

    const notesParts = [
      foodTag && `Food: ${foodTag}`,
      moveTag && `Movement: ${moveTag}`,
      form.notes,
    ].filter(Boolean).join(' | ')

    const { error } = await supabase.from('weight_logs').insert({
      user_id: user.id,
      weight_lbs: w,
      waist_in: form.waist_in ? parseFloat(form.waist_in) : null,
      hip_in: form.hip_in ? parseFloat(form.hip_in) : null,
      hunger_level: form.hunger_level ? parseInt(form.hunger_level) : null,
      protein_hit: form.protein_hit === 'yes' ? true : form.protein_hit === 'no' ? false : null,
      water_cups: form.water_cups ? parseInt(form.water_cups) : null,
      notes: notesParts || null,
      logged_at: new Date(`${entryDate}T12:00:00`).toISOString(),
    })
    if (error) {
      toast.error('Failed to save entry')
    } else {
      toast.success(entryDate === todayStr() ? 'Entry saved!' : `Entry saved for ${format(parseISO(entryDate), 'MMM d')}!`)
      setForm({ weight_lbs: '', waist_in: '', hip_in: '', hunger_level: '', protein_hit: '', water_cups: '', notes: '' })
      setFoodTag(null); setMoveTag(null)
      setEntryDate(todayStr())
      setShowForm(false)
      fetchLogs()
    }
    setSubmitting(false)
  }

  const latest = logs[logs.length - 1]
  const first = logs[0]

  const totalLost = first && latest ? (first.weight_lbs - latest.weight_lbs) : null
  const waistFirst = logs.find(l => l.waist_in != null)?.waist_in ?? null
  const waistLatest = [...logs].reverse().find(l => l.waist_in != null)?.waist_in ?? null
  const waistLost = waistFirst != null && waistLatest != null ? (waistFirst - waistLatest) : null

  const hipLatest = [...logs].reverse().find(l => l.hip_in != null)?.hip_in ?? null
  const waistHipRatio = waistLatest != null && hipLatest != null
    ? (waistLatest / hipLatest).toFixed(2)
    : null

  const recentTrend = (() => {
    if (logs.length < 6) return null
    const last3 = logs.slice(-3)
    const prev3 = logs.slice(-6, -3)
    const avgLast = last3.reduce((s, l) => s + l.weight_lbs, 0) / 3
    const avgPrev = prev3.reduce((s, l) => s + l.weight_lbs, 0) / 3
    const diff = avgLast - avgPrev
    if (diff <= -1) return { label: 'Trending Down', color: '#4be08a', arrow: '↓' }
    if (diff >= 1) return { label: 'Trending Up', color: '#e05c5c', arrow: '↑' }
    return { label: 'Holding Steady', color: '#c8a74b', arrow: '→' }
  })()

  const labels = logs.map(l => format(parseISO(l.logged_at), 'MMM d'))

  const weightDataset = {
    label: 'Weight (lbs)',
    data: logs.map(l => l.weight_lbs),
    borderColor: '#c8a74b',
    backgroundColor: 'rgba(200,167,75,0.08)',
    borderWidth: 2,
    pointRadius: 4,
    tension: 0.3,
    fill: false,
    yAxisID: 'y',
  }

  const waistLogs = logs.filter(l => l.waist_in != null)
  const waistDataset = waistLogs.length > 1 ? {
    label: 'Waist (in)',
    data: logs.map(l => l.waist_in ?? null),
    borderColor: '#0b9e8e',
    backgroundColor: 'rgba(11,158,142,0.08)',
    borderWidth: 2,
    pointRadius: 4,
    tension: 0.3,
    fill: false,
    yAxisID: 'y2',
    spanGaps: true,
  } : null

  const chartData = {
    labels,
    datasets: [weightDataset, ...(waistDataset ? [waistDataset] : [])],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: { labels: { color: '#91a0ac', font: { size: 12 } } },
      tooltip: {
        backgroundColor: '#182a28',
        borderColor: '#1f3331',
        borderWidth: 1,
        titleColor: '#f7f7f7',
        bodyColor: '#91a0ac',
      },
    },
    scales: {
      x: { ticks: { color: '#91a0ac', font: { size: 11 } }, grid: { color: '#1f3331' } },
      y: {
        type: 'linear' as const,
        position: 'left' as const,
        ticks: { color: '#c8a74b', font: { size: 11 } },
        grid: { color: '#1f3331' },
        title: { display: true, text: 'lbs', color: '#c8a74b', font: { size: 11 } },
      },
      ...(waistDataset ? {
        y2: {
          type: 'linear' as const,
          position: 'right' as const,
          ticks: { color: '#0b9e8e', font: { size: 11 } },
          grid: { drawOnChartArea: false },
          title: { display: true, text: 'waist (in)', color: '#0b9e8e', font: { size: 11 } },
        },
      } : {}),
    },
  }

  return (
    <div className="animate-fade-in">
      <BackButton />
      <div className={styles.pageTop}>
        <div>
          <h1 className={styles.pageTopTitle}>
            <Scale size={22} color="#c8a74b" /> Weight Tracker
          </h1>
          <p className={styles.pageTopDate}>Track your trend, not just the number</p>
        </div>
        <button className={shared.btnPrimary} onClick={() => setShowForm(!showForm)}>
          <Plus size={16} /> Log Entry
        </button>
      </div>

      {/* Latest snapshot */}
      {latest && (
        <div className={styles.bpLatestCard}>
          <div>
            <div className={styles.bpLatestValue} style={{ color: '#c8a74b' }}>
              {latest.weight_lbs}
            </div>
            <div className={styles.bpUnit}>lbs</div>
          </div>
          <div style={{ flex: 1 }}>
            {waistLatest != null && (
              <div className={styles.bpZoneName} style={{ color: '#0b9e8e' }}>
                Waist: {waistLatest}&quot;
                {waistHipRatio && <span style={{ color: '#91a0ac', fontSize: '0.8rem', marginLeft: 8 }}>W:H {waistHipRatio}</span>}
              </div>
            )}
            <div className={styles.bpMeta}>
              {format(parseISO(latest.logged_at), 'MMM d, h:mm a')}
              {latest.hunger_level != null && (
                <span style={{ color: HUNGER_COLORS[latest.hunger_level], marginLeft: 8 }}>
                  · Hunger: {HUNGER_LABELS[latest.hunger_level]}
                </span>
              )}
            </div>
            {latest.notes && (
              <div style={{ fontSize: '0.75rem', color: '#91a0ac', marginTop: 4 }}>{latest.notes}</div>
            )}
          </div>
        </div>
      )}

      {/* Milestone stats */}
      {logs.length >= 2 && (
        <div className={styles.bpMilestoneRow}>
          {totalLost !== null && (
            <div className={styles.bpMilestoneStat}>
              <div className={styles.bpMilestoneNum}
                style={{ color: totalLost > 0 ? '#4be08a' : totalLost < 0 ? '#e05c5c' : '#91a0ac' }}>
                {totalLost > 0 ? '-' : totalLost < 0 ? '+' : ''}{Math.abs(totalLost).toFixed(1)}
              </div>
              <div className={styles.bpMilestoneLabel}>lbs since start</div>
            </div>
          )}
          {waistLost !== null && waistLost !== 0 && (
            <div className={styles.bpMilestoneStat}>
              <div className={styles.bpMilestoneNum}
                style={{ color: waistLost > 0 ? '#4be08a' : '#e05c5c' }}>
                {waistLost > 0 ? '-' : '+'}{Math.abs(waistLost).toFixed(1)}&quot;
              </div>
              <div className={styles.bpMilestoneLabel}>waist since start</div>
            </div>
          )}
          <div className={styles.bpMilestoneStat}>
            <div className={styles.bpMilestoneNum}>{logs.length}</div>
            <div className={styles.bpMilestoneLabel}>entries logged</div>
          </div>
          {recentTrend && (
            <div className={styles.bpMilestoneStat}>
              <div className={styles.bpMilestoneNum} style={{ color: recentTrend.color }}>{recentTrend.arrow}</div>
              <div className={styles.bpMilestoneLabel}>{recentTrend.label}</div>
            </div>
          )}
          {waistHipRatio && (
            <div className={styles.bpMilestoneStat}>
              <div className={styles.bpMilestoneNum}
                style={{ color: parseFloat(waistHipRatio) < 0.85 ? '#4be08a' : '#e08a4b' }}>
                {waistHipRatio}
              </div>
              <div className={styles.bpMilestoneLabel}>waist:hip ratio</div>
            </div>
          )}
        </div>
      )}

      {/* Log form */}
      {showForm && (
        <div className={styles.card}>
          <h3 className={styles.cardTitleSolo}>New Entry</h3>
          <form onSubmit={handleSubmit} className={styles.logForm}>
            {/* Date, defaults to today, back-dating a missed day is fine */}
            <div className={styles.field}>
              <label className={styles.label}>Date</label>
              <input className={styles.input} type="date"
                value={entryDate} max={todayStr()}
                onChange={e => setEntryDate(e.target.value)} required />
            </div>

            {/* Primary metrics */}
            <div className={styles.inputRow3}>
              <div className={styles.field}>
                <label className={styles.label}>Weight (lbs) *</label>
                <input className={styles.input} type="number" step="0.1" placeholder="165.0"
                  value={form.weight_lbs} onChange={e => setForm(f => ({...f, weight_lbs: e.target.value}))}
                  required min={50} max={700} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Waist (inches)</label>
                <input className={styles.input} type="number" step="0.25" placeholder="34.0"
                  value={form.waist_in} onChange={e => setForm(f => ({...f, waist_in: e.target.value}))}
                  min={20} max={80} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Hip (inches)</label>
                <input className={styles.input} type="number" step="0.25" placeholder="40.0"
                  value={form.hip_in} onChange={e => setForm(f => ({...f, hip_in: e.target.value}))}
                  min={25} max={80} />
              </div>
            </div>

            {/* Hunger level */}
            <div className={styles.field}>
              <label className={styles.label}>Hunger level today?</label>
              <div className={styles.tagRow}>
                {([1, 2, 3, 4, 5] as const).map(n => (
                  <button key={n} type="button"
                    className={form.hunger_level === String(n) ? styles.tagActive : styles.tag}
                    style={form.hunger_level === String(n) ? { borderColor: HUNGER_COLORS[n], color: HUNGER_COLORS[n] } : undefined}
                    onClick={() => setForm(f => ({...f, hunger_level: f.hunger_level === String(n) ? '' : String(n)}))}>
                    {HUNGER_LABELS[n]}
                  </button>
                ))}
              </div>
            </div>

            {/* Protein goal */}
            <div className={styles.field}>
              <label className={styles.label}>Hit your protein goal today?</label>
              <div className={styles.tagRow}>
                {(['yes', 'no'] as const).map(v => (
                  <button key={v} type="button"
                    className={form.protein_hit === v ? styles.tagActive : styles.tag}
                    onClick={() => setForm(f => ({...f, protein_hit: f.protein_hit === v ? '' : v}))}>
                    {v === 'yes' ? 'Yes, hit protein goal' : 'No, missed protein goal'}
                  </button>
                ))}
              </div>
            </div>

            {/* Food quality */}
            <div className={styles.field}>
              <label className={styles.label}>Food quality today?</label>
              <div className={styles.tagRow}>
                {FOOD_TAGS.map(t => (
                  <button key={t} type="button"
                    className={foodTag === t ? styles.tagActive : styles.tag}
                    onClick={() => setFoodTag(foodTag === t ? null : t)}>{t}</button>
                ))}
              </div>
            </div>

            {/* Movement */}
            <div className={styles.field}>
              <label className={styles.label}>Movement today?</label>
              <div className={styles.tagRow}>
                {MOVE_TAGS.map(t => (
                  <button key={t} type="button"
                    className={moveTag === t ? styles.tagActive : styles.tag}
                    onClick={() => setMoveTag(moveTag === t ? null : t)}>{t}</button>
                ))}
              </div>
            </div>

            {/* Water and notes */}
            <div className={styles.inputRow3}>
              <div className={styles.field}>
                <label className={styles.label}>Water today (cups)</label>
                <input className={styles.input} type="number" placeholder="8"
                  value={form.water_cups} onChange={e => setForm(f => ({...f, water_cups: e.target.value}))}
                  min={0} max={30} />
              </div>
              <div className={styles.field} style={{ gridColumn: 'span 2' }}>
                <label className={styles.label}>NSV or notes (optional)</label>
                <input className={styles.input} type="text"
                  placeholder="Jeans fit better, more energy, slept great..."
                  value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))}
                  maxLength={200} />
              </div>
            </div>

            <div className={styles.formActions}>
              <button type="submit" className={shared.btnPrimary} disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Entry'}
              </button>
              <button type="button" className={shared.btnSecondary} onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Chart */}
      <div className={styles.card}>
        <h3 className={styles.cardTitleSolo}>
          Trend (Last 90 Entries)
          {waistLogs.length > 1 && (
            <span style={{ fontSize: '0.75rem', color: '#91a0ac', fontWeight: 400, marginLeft: 8 }}>
              · gold = weight · teal = waist
            </span>
          )}
        </h3>
        {loading ? (
          <div className={styles.chartEmpty}>Loading chart...</div>
        ) : logs.length < 2 ? (
          <div className={styles.chartEmpty}>
            <Scale size={32} color="var(--border)" />
            <p>Log at least 2 entries to see your trend</p>
          </div>
        ) : (
          <div className={styles.chartWrap}>
            <Line data={chartData} options={chartOptions as never} />
          </div>
        )}
      </div>

      {/* Reference ranges */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardLabel}>
            <Info size={16} color="var(--text-secondary)" /> Waist Circumference Reference (Educational)
          </h3>
        </div>
        <div className={styles.zoneGrid}>
          {[
            { zone: 'Optimal',       range: 'Below 32" (women) / Below 37" (men)', color: '#4be08a',  alert: null },
            { zone: 'Acceptable',    range: '32 to 34.9" (women) / 37 to 39.9" (men)',   color: '#c8a74b',  alert: null },
            { zone: 'Elevated Risk', range: '35 to 39.9" (women) / 40 to 44.9" (men)',   color: '#e08a4b',  alert: 'Take action' },
            { zone: 'High Risk',     range: '40"+ (women) / 45"+ (men)',           color: '#e05c5c',  alert: 'Seek guidance' },
          ].map(({ zone, range, color, alert }) => (
            <div key={zone} className={styles.zoneItem}
              style={alert ? { background: `${color}12`, border: `1px solid ${color}40`, borderRadius: 8, padding: '0.5rem 0.75rem' } : undefined}>
              <div className={styles.dot} style={{ background: color }} />
              <div style={{ flex: 1 }}>
                <div className={styles.zoneItemName} style={alert ? { color, fontWeight: 700 } : undefined}>{zone}</div>
                <div className={styles.zoneItemRange}>{range}</div>
              </div>
              {alert && (
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color, background: `${color}20`, border: `1px solid ${color}50`, borderRadius: 4, padding: '2px 6px', whiteSpace: 'nowrap' }}>{alert}</span>
              )}
            </div>
          ))}
        </div>
        <p className={styles.refNote}>
          Waist-to-hip ratio target: below 0.85 for women, below 0.90 for men. A shrinking waist with a stable scale reading means visceral fat is releasing. This is real progress.
        </p>
        <p className={styles.refNote}>
          Educational reference only. Always discuss your measurements with your healthcare provider.
        </p>
      </div>

      {/* 4 Root Cause Levers, Program+ only */}
      <PlanGate requiredPlan="program" label="Your Weight Optimization Protocol is available on The Program and above.">
        <div className={styles.bpLeversSection}>
          <div className={styles.bpLeversSectionHead}>
            Your Optimization Protocol
            <span className={styles.bpLeversSubhead}>4 root cause levers that control body composition</span>
          </div>
          <div className={styles.bpLeversGrid}>
            {WEIGHT_LEVERS.map(({ id, number, title, subtitle, color, disruptors, fixes, question }) => (
              <div key={id} className={styles.bpLeverCard} style={{ borderTopColor: color }}>
                <div className={styles.bpLeverNum} style={{ color }}>{number}</div>
                <div className={styles.bpLeverTitle} style={{ color }}>{title}</div>
                <div className={styles.bpLeverSub}>{subtitle}</div>
                <div className={styles.bpLeverCols}>
                  <div>
                    <div className={styles.bpLeverColHead} style={{ color: '#e05c5c' }}>Disruptors</div>
                    <ul className={styles.bpLeverList}>{disruptors.map((d, i) => <li key={i}>{d}</li>)}</ul>
                  </div>
                  <div>
                    <div className={styles.bpLeverColHead} style={{ color }}>Mechanical Fix</div>
                    <ul className={styles.bpLeverList}>{fixes.map((f, i) => <li key={i}>{f}</li>)}</ul>
                  </div>
                </div>
                <div className={styles.bpLeverQuestion}>"{question}"</div>
              </div>
            ))}
          </div>
        </div>
      </PlanGate>

      {/* Education section */}
      <div className={styles.bpEduSection}>
        <div className={styles.bpEduSectionHead}>
          <Info size={16} color="var(--gold)" />
          <span>Understanding Weight: Functional Education</span>
        </div>
        {WEIGHT_EDU.map(({ id, title, sub, body }) => (
          <div key={id} className={styles.bpEduCard}>
            <button className={styles.bpEduCardBtn} onClick={() => setOpenEdu(openEdu === id ? null : id)}>
              <div>
                <div className={styles.bpEduCardTitle}>{title}</div>
                <div className={styles.bpEduCardSub}>{sub}</div>
              </div>
              <span className={styles.bpEduChevron}>
                {openEdu === id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </span>
            </button>
            {openEdu === id && (
              <div className={styles.bpEduCardBody}>
                {body.map((para, i) => <p key={i}>{para}</p>)}
              </div>
            )}
          </div>
        ))}
        <p className={styles.refNote}>
          Educational context only. This is not medical advice. Dr. Shallanda Hunter, CFNMP, PharmD, MBA provides functional medicine education. Always work with your healthcare team on treatment decisions.
        </p>
      </div>

      {/* Icon import usage (keeps tree-shaking happy) */}
      <span style={{ display: 'none' }}>
        <Activity size={0} /><Zap size={0} /><Moon size={0} /><Leaf size={0} />
      </span>
    </div>
  )
}
