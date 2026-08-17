import { useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js'
import { supabase } from '@/lib/supabase'
import { format, parseISO } from 'date-fns'
import type { BSReading } from '@/types'
import { getBSZone, BS_ZONE_LABELS, BS_ZONE_COLORS } from '@/types'
import toast from 'react-hot-toast'
import { Droplet, Plus, Info, ChevronDown } from 'lucide-react'
import BackButton from '@/components/BackButton'
import styles from './Client.module.css'
import shared from '../../styles/shared.module.css'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const CONTEXT_LABELS: Record<string, string> = {
  fasting: 'Fasting',
  before_meal: 'Before Meal',
  post_meal_2hr: 'Post-Meal (2 hr)',
  bedtime: 'Bedtime',
}

const MEAL_TAGS = ['Low Carb / Keto', 'Balanced (protein + veg + carbs)', 'Higher Carb Meal', 'Sugary / Processed', 'Fasted (skipped meal)']
const STRESS_TAGS = ['Relaxed', 'Mild Stress', 'High Stress / Anxious', 'Poor Sleep Last Night']
const WALK_TAGS = ['Yes, walked 10+ min', 'No walk']

type ChartMode = 'all' | 'fasting' | 'post_meal'

const EDU_MAIN = [
  {
    id: 'hba1c',
    title: 'Why HbA1c Misses the Picture',
    sub: 'The average that hides dangerous spikes and the two patterns it never captures',
    body: [
      'HbA1c is a 90-day average. Two people can have an identical HbA1c of 5.6% and have completely different metabolic situations. One has stable glucose ranging between 80 and 100 mg/dL all day. The other spikes to 180 mg/dL after every meal, then crashes to 72 mg/dL, and the average lands at 5.6%. The first person is metabolically healthy. The second is driving significant oxidative stress, vascular inflammation, and insulin overproduction with every meal, despite a reassuring lab value.',
      'Time in Range (TIR) is the metric that captures what HbA1c hides. TIR measures the percentage of time your glucose stays between 70 and 140 mg/dL. Optimal TIR is above 90%. The ZOE PREDICT study of 4,805 participants found that an optimized TIR target of 70 to 100 mg/dL is discriminatory of cardiovascular disease risk despite normal fasting HbA1c.',
      'HbA1c also cannot detect reactive hypoglycemia: after a large spike, overproduced insulin drives glucose below your baseline, causing fatigue, brain fog, anxiety, and intense sugar cravings. The average looks fine on paper while the person feels terrible. Ask your provider to add FASTING INSULIN to your next blood panel. HOMA-IR = (fasting glucose x fasting insulin) divided by 405. Optimal HOMA-IR is below 1.5.',
    ],
    study: 'ZOE PREDICT Studies (4,805 participants): "An optimized TIR target of 70 to 100 mg/dL is discriminatory of cardiovascular disease risk despite normal fasting HbA1c"',
  },
  {
    id: 'dawn',
    title: 'Dawn Phenomenon and Reactive Hypoglycemia',
    sub: 'Two patterns hidden in your logged data that standard tests never capture',
    body: [
      'Dawn phenomenon: between 4 and 8 AM, cortisol and growth hormone surge naturally to prepare your body to wake up. These hormones signal the liver to release glucose. For people with insulin resistance, this morning release is exaggerated. Fasting glucose is higher in the morning than at bedtime, even without eating. Log both bedtime and morning readings to spot this pattern.',
      'Reactive hypoglycemia: eating a high-sugar or high-carb meal without protein or fiber causes a sharp glucose spike, which triggers an insulin overresponse. Glucose crashes 2 to 3 hours later, landing at 65 to 80 mg/dL. Symptoms include shakiness, irritability, brain fog, strong sugar cravings, and anxiety, often mistaken for hunger, driving another high-carb intake and restarting the cycle.',
    ],
    study: null,
  },
  {
    id: 'supps',
    title: 'Targeted Supplementation for Blood Sugar and Insulin Sensitivity',
    sub: 'Berberine, ALA, Magnesium, and Chromium: evidence, dosing, and mechanisms',
    body: [
      'Berberine 500mg taken 2 to 3 times daily with meals: activates AMPK, the same cellular energy sensor targeted by metformin. Multiple meta-analyses show it reduces fasting glucose, post-meal glucose, and HOMA-IR comparably to metformin in pre-diabetic individuals. It also shifts the gut microbiome toward Akkermansia muciniphila, which produces butyrate, a natural AMPK activator.',
      'Alpha-lipoic acid (ALA) 300 to 600mg per day: a mitochondrial antioxidant that regenerates glutathione, reduces oxidative damage from glucose spikes, and improves insulin-stimulated glucose uptake in muscle. Most effective for people with significant post-meal spikes and neuropathy symptoms.',
      'Magnesium glycinate or malate 300 to 400mg per day, taken at night: required as a cofactor in over 300 enzymatic reactions, including insulin receptor signaling. Deficiency directly impairs insulin\'s ability to bind to receptors and also worsens cortisol response and sleep quality.',
      'Chromium picolinate 200 to 400mcg per day: enhances insulin receptor sensitivity and glucose tolerance. Most effective in individuals who are chromium-deficient, which is common in high-stress, high-sugar dietary patterns.',
      'DSHEA notice: these statements have not been evaluated by the Food and Drug Administration. Supplement suggestions are not intended to diagnose, treat, cure, or prevent any disease. Always review all supplements with your healthcare provider before starting, especially if you are on any prescription medication.',
    ],
    study: null,
    isDSHEA: true,
  },
  {
    id: 'labs',
    title: 'What Your Labs Say About Your Blood Sugar',
    sub: 'The markers that reveal insulin resistance years before HbA1c changes',
    body: [
      'HOMA-IR (requires fasting glucose and fasting insulin on the same draw): the gold standard functional medicine marker for insulin resistance. Optimal: below 1.5. Standard lab "normal": below 2.5. The gap between those two thresholds represents years of preventable damage.',
      'Fasting insulin alone: optimal below 10 uIU/mL. Most standard labs flag it as normal up to 25, meaning the majority of people with significant insulin resistance will be told everything looks fine.',
      'Triglyceride-to-HDL ratio: calculate from your standard lipid panel. Triglycerides divided by HDL. Optimal: below 1.0. Above 2.0 is a strong signal of insulin resistance. Above 3.0 is a red flag.',
      'C-peptide: measures your body\'s own insulin production. Distinguishes low production (type 1 pattern), overproduction (early type 2), and normal.',
    ],
    study: 'IFM functional medicine reference ranges; Rupa Health optimal lab values guide; ZOE PREDICT 4,805-person study on TIR and cardiovascular risk',
  },
]

const EDU_OTHER = [
  {
    id: 'crp',
    title: 'hs-CRP: The Inflammation Lab Marker That\'s Missing From Most Panels',
    sub: 'Direct readout of the inflammatory load driving insulin resistance',
    body: [
      'hs-CRP (high-sensitivity C-reactive protein) is produced by the liver in response to IL-6 from inflamed adipose tissue. It is the most direct single-lab readout of the inflammatory load that is driving insulin resistance, yet most standard blood sugar panels do not include it.',
      'Optimal hs-CRP: below 0.5 mg/L. Standard lab normal: below 1.0 to 3.0 mg/L. At 1.0 mg/L you already have a measurable inflammatory burden that is impairing insulin receptor signaling.',
      'When hs-CRP is elevated alongside a high HOMA-IR, you have confirmed both the inflammatory mechanism and the downstream outcome. Ask your provider to add it to your next panel alongside fasting insulin.',
    ],
    study: 'Institute for Functional Medicine (IFM): Connections between Inflammation and Insulin Resistance',
  },
  {
    id: 'inositol',
    title: 'Myo-Inositol: Especially If You Have PCOS',
    sub: '2025 research: directly suppresses TNF-alpha-induced inflammation in fat tissue',
    body: [
      'Myo-inositol is a naturally occurring compound involved in insulin signal transduction. Women with PCOS have a specific deficiency in the myo-inositol to D-chiro-inositol conversion ratio, which directly impairs insulin receptor signaling in a way that standard insulin resistance markers may not fully capture.',
      'A June 2025 PMC study showed that myo-inositol suppresses TNF-alpha-induced inflammation in adipocytes, making it anti-inflammatory and insulin-sensitizing through two separate mechanisms. Some trials show it outperforming metformin for PCOS insulin resistance.',
      'Typical protocol: 2g myo-inositol twice daily (4g total). Best taken with meals. Often combined with D-chiro-inositol at a 40:1 ratio.',
    ],
    study: 'PMC12431848 (myo-inositol and TNF-alpha suppression 2025); r/PCOS community signal (274 upvotes, June 2026)',
  },
  {
    id: 'gut',
    title: 'Gut Health as a Root Cause of Insulin Resistance',
    sub: 'Leaky gut lets bacterial toxins into your bloodstream. They trigger the inflammation that blocks insulin',
    body: [
      'When the gut barrier becomes permeable (leaky gut), bacterial lipopolysaccharides (LPS), fragments of bacterial cell walls, enter your bloodstream. LPS activates the same NF-kB inflammatory pathway that directly blocks insulin receptor signaling. This is one of the primary mechanisms by which gut dysbiosis causes insulin resistance, independent of diet.',
      'The good news: butyrate, produced when gut bacteria ferment soluble fiber, activates AMPK, the exact same cellular pathway as berberine and metformin. This is why soluble fiber is so powerful for blood sugar: it creates compounds that improve insulin sensitivity through a pharmaceutical-grade mechanism, naturally.',
      'Practical: 25 to 35g soluble fiber daily (oats, flaxseed, chicory, psyllium husk), rotating probiotic strains including Lactobacillus acidophilus and Bifidobacterium longum, and removing processed seed oils and ultra-processed foods that damage the gut lining.',
    ],
    study: 'FASEB BioAdvances 2026: The Gut Microbiota-Insulin Resistance Axis; PMC10879501 (gut microbiome regulates inflammation and insulin resistance)',
  },
  {
    id: 'osa',
    title: 'Sleep Apnea as a Hidden Root Cause',
    sub: 'If your numbers do not respond to diet and lifestyle, this may be why',
    body: [
      'Obstructive sleep apnea (OSA) is one of the most underdiagnosed root causes of insulin resistance. 2026 research from Marshall University identified the exact mechanism: intermittent hypoxia (repeated oxygen drops during apnea episodes) activates CD11b+ monocytes and macrophages, triggering chronic systemic inflammation that directly impairs insulin receptor signaling.',
      'The relationship is bidirectional: insulin resistance increases visceral fat, which increases tissue around the airway, which worsens apnea. Apnea worsens inflammation, which worsens insulin resistance. The loop compounds.',
      'Screening question: Do you snore loudly, stop breathing in your sleep (witnessed), or wake unrefreshed despite 7 to 8 hours? If yes, ask your provider for a sleep study. Treating OSA alone improves HOMA-IR and fasting glucose in multiple RCTs.',
    ],
    study: 'Sleep Review 2026: Key Inflammatory Mechanism Linking Sleep Apnea to Metabolic Disease; Frontiers in Endocrinology: Bidirectional Relationship Between OSA and Metabolic Disease',
  },
  {
    id: 'toxins',
    title: 'Environmental Toxins and Endocrine Disruptors',
    sub: 'BPA, phthalates, and heavy metals directly disrupt insulin receptor signaling',
    body: [
      'BPA (found in plastic containers, receipts, canned food linings): disrupts insulin-secreting beta cells and alters insulin release. Studies link BPA exposure to reduced beta cell function and impaired insulin signaling. Switch to glass or stainless for food and drink storage.',
      'Phthalates (found in fragrances, cosmetics, food packaging, PVC): impair insulin-signaling pathways at the receptor level. Epidemiological studies associate phthalate exposure with increased HOMA-IR. Fragrance-free personal care products and glass/stainless food storage reduce exposure significantly.',
      'Heavy metals: Cadmium (cigarette smoke, some seafood, non-organic grains), Mercury (large fish like tuna and swordfish), Arsenic (contaminated water, rice). All cause pancreatic beta-cell dysfunction and impair insulin receptor activity. Testing via blood or urine heavy metals panel.',
    ],
    study: 'PMC10656111: The Hidden Threat: Endocrine Disruptors and Insulin Resistance; PMC12974275: Heavy Metals as Endocrine Disruptors (2026)',
  },
  {
    id: 'sarco',
    title: 'The Muscle Loss Loop: Why Building Muscle Is Therapeutic, Not Optional',
    sub: 'Insulin resistance causes muscle loss, and muscle loss worsens insulin resistance',
    body: [
      'Sarcopenia (progressive muscle loss) and insulin resistance perpetuate each other through a bidirectional inflammatory loop. Direction 1: insulin resistance reduces the rate of muscle protein synthesis. Elevated TNF-alpha and IL-6 from inflamed adipose tissue directly suppress muscle protein production while accelerating protein degradation. Muscles become anabolically resistant. They do not respond normally to protein intake or exercise.',
      'Direction 2: muscle loss worsens insulin resistance. Skeletal muscle accounts for 70 to 80% of glucose uptake after a meal. Less muscle mass means less glucose disposal capacity, which means glucose stays in your bloodstream longer after every meal. This is why weight loss through caloric restriction alone can make insulin resistance worse if it causes muscle loss.',
      'The prescription: resistance training 3 to 4 days per week, 1.6 to 2.2g protein per kg of body weight daily, and creatine monohydrate 3 to 5g daily (improves insulin sensitivity and preserves muscle mass in multiple RCTs).',
    ],
    study: 'PMC12386518: Inflammatory Crosstalk Between Type 2 Diabetes and Sarcopenia (2025); PubMed 42353211: Insulin Resistance as Systemic Metabolic Risk State for Cancer (IJMS 2026)',
  },
]

function computeStats(readings: BSReading[]) {
  const fasting = readings.filter(r => r.reading_context === 'fasting')
  const bestFasting = fasting.length ? Math.min(...fasting.map(r => r.glucose_mg_dl)) : null
  const avgFasting = fasting.length ? Math.round(fasting.reduce((s, r) => s + r.glucose_mg_dl, 0) / fasting.length) : null
  const inRange = readings.filter(r => {
    const g = r.glucose_mg_dl
    if (r.reading_context === 'post_meal_2hr') return g >= 70 && g < 140
    return g >= 70 && g <= 140
  })
  const tir = readings.length ? Math.round((inRange.length / readings.length) * 100) : null
  return { bestFasting, avgFasting, tir, count: readings.length }
}

function trendLabel(readings: BSReading[]) {
  if (readings.length < 6) return null
  const half = Math.floor(readings.length / 2)
  const first = readings.slice(0, half).map(r => r.glucose_mg_dl)
  const second = readings.slice(half).map(r => r.glucose_mg_dl)
  const avgFirst = first.reduce((s, v) => s + v, 0) / first.length
  const avgSecond = second.reduce((s, v) => s + v, 0) / second.length
  const diff = avgSecond - avgFirst
  if (diff < -3) return { label: 'Trending Down', color: '#4be08a', arrow: '↓' }
  if (diff > 3) return { label: 'Trending Up', color: '#e05c5c', arrow: '↑' }
  return { label: 'Stable', color: '#c8a74b', arrow: '→' }
}

function EduAccordion({ items, openId, setOpenId }: {
  items: typeof EDU_MAIN
  openId: string | null
  setOpenId: (id: string | null) => void
}) {
  return (
    <>
      {items.map(item => (
        <div key={item.id} className={styles.bpEduCard}>
          <button
            className={styles.bpEduCardBtn}
            onClick={() => setOpenId(openId === item.id ? null : item.id)}
          >
            <div>
              <div className={styles.bpEduCardTitle}>{item.title}</div>
              <div className={styles.bpEduCardSub}>{item.sub}</div>
            </div>
            <ChevronDown
              size={16}
              className={styles.bpEduChevron}
              style={{ transform: openId === item.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
            />
          </button>
          {openId === item.id && (
            <div className={styles.bpEduCardBody}>
              {item.body.map((p, i) => (
                <p key={i} className={item.isDSHEA && i === item.body.length - 1 ? styles.bpEduStudy : undefined}>{p}</p>
              ))}
              {item.study && <p className={styles.bpEduStudy}>Source: {item.study}</p>}
            </div>
          )}
        </div>
      ))}
    </>
  )
}

export default function BloodSugarPage() {
  const [readings, setReadings] = useState<BSReading[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [chartMode, setChartMode] = useState<ChartMode>('all')
  const [openEdu, setOpenEdu] = useState<string | null>(null)
  const [form, setForm] = useState({
    glucose: '',
    context: 'fasting',
    mealTag: '',
    stressTag: '',
    walkTag: '',
    notes: '',
  })
  // Lets a missed day get logged after the fact. Noon on the chosen day avoids
  // the entry landing on the wrong day near midnight in any timezone.
  const todayStr = () => new Date().toISOString().split('T')[0]
  const [entryDate, setEntryDate] = useState(todayStr())

  useEffect(() => { fetchReadings() }, [])

  const fetchReadings = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user
    if (!user) return
    const { data } = await supabase
      .from('blood_sugar_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('logged_at', { ascending: true })
      .limit(60)
    setReadings((data as BSReading[]) ?? [])
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const glucose = parseInt(form.glucose)
    if (isNaN(glucose) || glucose < 20 || glucose > 600) {
      toast.error('Please enter a valid glucose value (20 to 600 mg/dL)')
      return
    }
    setSubmitting(true)
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user
    if (!user) return
    const { error } = await supabase.from('blood_sugar_logs').insert({
      user_id: user.id,
      glucose_mg_dl: glucose,
      reading_context: form.context,
      meal_tag: form.mealTag || null,
      stress_tag: form.stressTag || null,
      walk_tag: form.walkTag || null,
      notes: form.notes || null,
      logged_at: new Date(`${entryDate}T12:00:00`).toISOString(),
    })
    if (error) {
      toast.error('Failed to save reading')
    } else {
      toast.success(entryDate === todayStr() ? 'Blood sugar reading saved!' : `Reading saved for ${format(parseISO(entryDate), 'MMM d')}!`)
      setForm({ glucose: '', context: 'fasting', mealTag: '', stressTag: '', walkTag: '', notes: '' })
      setEntryDate(todayStr())
      setShowForm(false)
      fetchReadings()
    }
    setSubmitting(false)
  }

  const latest = readings[readings.length - 1]
  const latestZone = latest ? getBSZone(latest.glucose_mg_dl, latest.reading_context) : null
  const stats = computeStats(readings)
  const trend = trendLabel(readings)

  const chartReadings = readings.filter(r => {
    if (chartMode === 'fasting') return r.reading_context === 'fasting'
    if (chartMode === 'post_meal') return r.reading_context === 'post_meal_2hr'
    return true
  })

  const labels = chartReadings.map(r => format(parseISO(r.logged_at), 'MMM d'))
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Blood Sugar (mg/dL)',
        data: chartReadings.map(r => r.glucose_mg_dl),
        borderColor: '#c8a74b',
        backgroundColor: 'rgba(200,167,75,0.08)',
        borderWidth: 2,
        pointBackgroundColor: chartReadings.map(r => BS_ZONE_COLORS[getBSZone(r.glucose_mg_dl, r.reading_context)]),
        pointRadius: 5,
        tension: 0.3,
        fill: false,
      },
      {
        label: chartMode === 'post_meal' ? 'Typical Upper (140)' : 'Typical Upper (99)',
        data: chartReadings.map(() => chartMode === 'post_meal' ? 140 : 99),
        borderColor: 'rgba(75,224,138,0.4)',
        borderWidth: 1,
        borderDash: [6, 4],
        pointRadius: 0,
        fill: false,
      },
      {
        label: 'Typical Lower (70)',
        data: chartReadings.map(() => 70),
        borderColor: 'rgba(75,224,138,0.4)',
        borderWidth: 1,
        borderDash: [6, 4],
        pointRadius: 0,
        fill: false,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#91a0ac', font: { size: 12 } } },
      tooltip: {
        backgroundColor: '#182a28',
        borderColor: '#1f3331',
        borderWidth: 1,
        titleColor: '#f7f7f7',
        bodyColor: '#91a0ac',
        callbacks: {
          afterBody: (items: { dataIndex: number }[]) => {
            const idx = items[0]?.dataIndex
            if (idx === undefined) return []
            const r = chartReadings[idx]
            const lines = [
              `Context: ${CONTEXT_LABELS[r.reading_context]}`,
              `Zone: ${BS_ZONE_LABELS[getBSZone(r.glucose_mg_dl, r.reading_context)]}`,
            ]
            if (r.meal_tag) lines.push(`Meal: ${r.meal_tag}`)
            if (r.stress_tag) lines.push(`Feeling: ${r.stress_tag}`)
            if (r.walk_tag) lines.push(`Walk: ${r.walk_tag}`)
            return lines
          }
        }
      },
    },
    scales: {
      x: { ticks: { color: '#91a0ac', font: { size: 11 } }, grid: { color: '#1f3331' } },
      y: {
        ticks: { color: '#91a0ac', font: { size: 11 } },
        grid: { color: '#1f3331' },
        min: 40, max: 300,
      },
    },
  }

  return (
    <div className="animate-fade-in">
      <BackButton />
      <div className={styles.pageTop}>
        <div>
          <h1 className={styles.pageTopTitle}>
            <Droplet size={22} color="#0b9e8e" /> Blood Sugar Tracker
          </h1>
          <p className={styles.pageTopDate}>Log and visualize your readings over time</p>
        </div>
        <button className={shared.btnPrimary} onClick={() => setShowForm(!showForm)}>
          <Plus size={16} /> Log Reading
        </button>
      </div>

      {/* Latest reading card */}
      {latest && (
        <div className={styles.bpLatestCard}>
          <div>
            <div className={styles.bpLatestValue} style={{ color: BS_ZONE_COLORS[latestZone!] }}>
              {latest.glucose_mg_dl}
            </div>
            <div className={styles.bpUnit}>mg/dL</div>
          </div>
          <div>
            <div className={styles.bpZoneName} style={{ color: BS_ZONE_COLORS[latestZone!] }}>
              {BS_ZONE_LABELS[latestZone!]}
            </div>
            <div className={styles.bpMeta}>
              {CONTEXT_LABELS[latest.reading_context]} · {format(parseISO(latest.logged_at), 'MMM d, h:mm a')}
            </div>
            {latest.glucose_mg_dl < 70 && (
              <div className={styles.bpCrisisAlert}>
                If you feel shaky, confused, or sweaty, treat low blood sugar now and contact your provider.
              </div>
            )}
            {latest.glucose_mg_dl > 240 && (
              <div className={styles.bpCrisisAlert}>
                Reading is significantly elevated. Contact your healthcare provider.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats grid */}
      {readings.length >= 2 && (
        <div className={styles.card} style={{ padding: '14px 18px', marginBottom: 'var(--space-5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Droplet size={14} color="var(--teal)" />
            {trend && (
              <span className={styles.trendPill} style={{ color: trend.color }}>
                {trend.arrow} {trend.label}
              </span>
            )}
          </div>
          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Best Fasting</div>
              <div className={styles.statValue} style={{ color: '#4be08a' }}>
                {stats.bestFasting ?? '--'}
                <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-muted)' }}> mg/dL</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Avg Fasting</div>
              <div className={styles.statValue} style={{ color: 'var(--gold)' }}>
                {stats.avgFasting ?? '--'}
                <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-muted)' }}> mg/dL</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Time in Range</div>
              <div className={styles.statValue} style={{ color: stats.tir && stats.tir >= 90 ? '#4be08a' : stats.tir && stats.tir >= 70 ? '#c8a74b' : '#e05c5c' }}>
                {stats.tir ?? '--'}
                <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-muted)' }}>%</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Readings Logged</div>
              <div className={styles.statValue} style={{ color: 'var(--teal)' }}>
                {stats.count}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Log form */}
      {showForm && (
        <div className={styles.card}>
          <h3 className={styles.cardTitleSolo}>New Reading</h3>
          <form onSubmit={handleSubmit} className={styles.logForm}>
            {/* Date, defaults to today, back-dating a missed reading is fine */}
            <div className={styles.field}>
              <label className={styles.label}>Date</label>
              <input className={styles.input} type="date"
                value={entryDate} max={todayStr()}
                onChange={e => setEntryDate(e.target.value)} required />
            </div>

            <div className={styles.inputRow}>
              <div className={styles.field}>
                <label className={styles.label}>Blood Sugar (mg/dL) *</label>
                <input
                  className={styles.input}
                  type="number"
                  placeholder="95"
                  value={form.glucose}
                  onChange={e => setForm(f => ({ ...f, glucose: e.target.value }))}
                  required
                  min={20}
                  max={600}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Reading Context *</label>
                <select
                  className={styles.select}
                  value={form.context}
                  onChange={e => setForm(f => ({ ...f, context: e.target.value }))}
                >
                  <option value="fasting">Fasting</option>
                  <option value="before_meal">Before Meal</option>
                  <option value="post_meal_2hr">Post-Meal (2 hr)</option>
                  <option value="bedtime">Bedtime</option>
                </select>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>What did you eat? (optional)</label>
              <div className={styles.tagRow}>
                {MEAL_TAGS.map(t => (
                  <button
                    key={t}
                    type="button"
                    className={form.mealTag === t ? styles.tagActive : styles.tag}
                    onClick={() => setForm(f => ({ ...f, mealTag: f.mealTag === t ? '' : t }))}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>How are you feeling? (optional)</label>
              <div className={styles.tagRow}>
                {STRESS_TAGS.map(t => (
                  <button
                    key={t}
                    type="button"
                    className={form.stressTag === t ? styles.tagActive : styles.tag}
                    onClick={() => setForm(f => ({ ...f, stressTag: f.stressTag === t ? '' : t }))}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Post-meal walk? (optional)</label>
              <div className={styles.tagRow}>
                {WALK_TAGS.map(t => (
                  <button
                    key={t}
                    type="button"
                    className={form.walkTag === t ? styles.tagActive : styles.tag}
                    onClick={() => setForm(f => ({ ...f, walkTag: f.walkTag === t ? '' : t }))}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Notes (optional)</label>
              <input
                className={styles.input}
                type="text"
                placeholder="Any other context..."
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                maxLength={200}
              />
            </div>
            <div className={styles.formActions}>
              <button type="submit" className={shared.btnPrimary} disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Reading'}
              </button>
              <button type="button" className={shared.btnSecondary} onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Chart */}
      <div className={styles.card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h3 className={styles.cardTitleSolo} style={{ margin: 0 }}>Trend (Last 60 Readings)</h3>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['all', 'fasting', 'post_meal'] as ChartMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setChartMode(mode)}
                style={{
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid',
                  borderColor: chartMode === mode ? 'var(--teal)' : 'var(--border)',
                  background: chartMode === mode ? 'rgba(11,158,142,0.12)' : 'var(--bg-page)',
                  color: chartMode === mode ? 'var(--teal)' : 'var(--text-muted)',
                  fontSize: '0.75rem',
                  fontWeight: chartMode === mode ? 600 : 400,
                  cursor: 'pointer',
                }}
              >
                {mode === 'all' ? 'All' : mode === 'fasting' ? 'Fasting' : 'Post-Meal'}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <div className={styles.chartEmpty}>Loading chart...</div>
        ) : chartReadings.length < 2 ? (
          <div className={styles.chartEmpty}>
            <Droplet size={32} color="var(--border)" />
            <p>Log at least 2 readings to see your trend</p>
          </div>
        ) : (
          <div className={styles.chartWrap}>
            <Line data={chartData} options={chartOptions as never} />
          </div>
        )}
      </div>

      {/* Reference card */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardLabel}>
            <Info size={16} color="var(--text-secondary)" /> Blood Sugar Reference (Educational)
          </h3>
        </div>
        <div className={styles.zoneGrid}>
          {[
            { zone: 'Low (Below Typical Range)', range: 'Below 70 mg/dL', color: '#e08a4b' },
            { zone: 'In Typical Range (Fasting / Before Meal)', range: '70 to 99 mg/dL', color: '#4be08a' },
            { zone: 'Above Typical Range (Fasting / Before Meal)', range: '100 to 125 mg/dL', color: '#e0b84b' },
            { zone: 'Elevated: Discuss With Provider (Fasting)', range: '126 mg/dL or above', color: '#e05c5c' },
            { zone: 'In Typical Range (Post-Meal 2 hr)', range: 'Below 140 mg/dL', color: '#4be08a' },
            { zone: 'Above Typical Range (Post-Meal 2 hr)', range: '140 to 199 mg/dL', color: '#e0b84b' },
            { zone: 'Elevated: Discuss With Provider (Post-Meal 2 hr)', range: '200 mg/dL or above', color: '#e05c5c' },
          ].map(({ zone, range, color }) => (
            <div key={zone} className={styles.zoneItem}>
              <div className={styles.dot} style={{ background: color }} />
              <div>
                <div className={styles.zoneItemName}>{zone}</div>
                <div className={styles.zoneItemRange}>{range}</div>
              </div>
            </div>
          ))}
        </div>
        <p className={styles.refNote}>
          These ranges are for educational reference only, based on ADA-aligned reference values for fasting and pre-meal glucose in adults. Post-meal ranges (2 hours after eating) are listed separately above. Individual goals vary. Always consult your healthcare provider for clinical interpretation of your readings.
        </p>
      </div>

      {/* Education: main section */}
      <div className={styles.bpEduSection}>
        <div className={styles.bpEduSectionHead}>
          <Info size={15} color="var(--text-muted)" />
          <span>Understanding Blood Sugar: Functional Education</span>
        </div>
        <EduAccordion items={EDU_MAIN} openId={openEdu} setOpenId={setOpenEdu} />
      </div>

      {/* Education: other connections */}
      <div className={styles.card} style={{ border: '1px solid rgba(200,167,75,0.3)', marginTop: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <div className={styles.cardLabel} style={{ margin: 0 }}>Other Connections Worth Knowing</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <EduAccordion items={EDU_OTHER} openId={openEdu} setOpenId={setOpenEdu} />
        </div>
      </div>
    </div>
  )
}
