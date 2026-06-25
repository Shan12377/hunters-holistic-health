import { useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js'
import annotationPlugin from 'chartjs-plugin-annotation'
import { supabase } from '@/lib/supabase'
import { format, parseISO } from 'date-fns'
import type { BPReading } from '@/types'
import { getBPZone, BP_ZONE_LABELS, BP_ZONE_COLORS } from '@/types'
import toast from 'react-hot-toast'
import { Heart, Plus, Info, ChevronDown, ChevronUp, Activity, Wind, Droplets } from 'lucide-react'
import BPGauge from '@/components/ui/BPGauge'
import styles from './Client.module.css'
import shared from '../../styles/shared.module.css'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, annotationPlugin)

const BP_EDU = [
  {
    id: 'vascular',
    title: 'How Blood Pressure Actually Works',
    sub: 'The vascular mechanism behind the numbers',
    body: [
      'Blood pressure is the force your blood exerts against the walls of your arteries with each heartbeat. The systolic number (top) is the pressure during a beat. The diastolic number (bottom) is the pressure between beats when the heart is resting.',
      'Blood vessels are not rigid pipes. They are living tissue that expands and contracts in response to chemical signals. The endothelium (the inner lining of your blood vessels) produces nitric oxide, which is the body\'s natural vasodilator. When nitric oxide production is sufficient, vessels relax and pressure stays lower.',
      'When the endothelium is damaged or inflamed, nitric oxide production drops. Vessels become stiffer and less responsive. Pressure rises to push the same blood through a narrower, more rigid channel.',
      'This is why blood pressure is often described as a downstream signal of upstream problems, not a standalone disease.',
    ],
  },
  {
    id: 'root',
    title: 'What Drives Blood Pressure Up',
    sub: 'The functional root causes, not just the symptoms',
    body: [
      'Insulin resistance and endothelial dysfunction: High circulating insulin damages the endothelial lining over time, reducing nitric oxide output and increasing vascular stiffness. This is why metabolic conditions and high blood pressure so often appear together.',
      'Chronic stress and cortisol: Cortisol is a vasoconstrictor. Sustained high cortisol from ongoing stress keeps blood vessels narrowed. The nervous system stays in sympathetic (fight-or-flight) mode, which keeps heart rate and pressure elevated.',
      'Sodium and potassium imbalance: Excess sodium causes water retention, increasing blood volume and therefore pressure. Potassium counterbalances sodium by helping the kidneys excrete it. Most people with high blood pressure consume far too little potassium.',
      'Magnesium deficiency: Magnesium is required for vascular smooth muscle relaxation. Without adequate magnesium, vessels cannot fully dilate. Studies estimate 50 to 80 percent of people with hypertension are magnesium insufficient.',
      'Kidney function: The kidneys regulate blood volume through the renin-angiotensin-aldosterone system (RAAS). When kidney function is reduced, the RAAS can become overactive, retaining fluid and raising pressure.',
      'Sleep disruption: Blood pressure drops naturally during deep sleep (nocturnal dipping). When sleep is poor or disrupted, this dip does not happen. Non-dippers have significantly higher cardiovascular risk than those whose pressure drops overnight.',
    ],
  },
  {
    id: 'exercise',
    title: 'Exercise Protocol for Blood Pressure',
    sub: 'The BJSM 2023 meta-analysis of 270 clinical trials',
    body: [
      'Isometric (static hold) training produces the strongest blood pressure reductions of any exercise type, outperforming aerobic and dynamic resistance training. The 2023 British Journal of Sports Medicine meta-analysis found an average reduction of 8.2/4.0 mmHg from isometric training alone.',
      'Wall Sit Protocol: 4 sets of 2-minute wall sits with 2 minutes of rest between sets. 3 times per week. You can spread the 4 sets throughout the day if needed.',
      'Why it works: During the static hold, blood vessels are compressed. When released, the rebound triggers a powerful burst of nitric oxide and vessel dilation. Repeated over time, this trains the endothelium to produce more nitric oxide at baseline.',
      'Post-meal walking: A 10 to 15 minute walk after your largest meal clears post-meal glucose and avoids the blood sugar spike that raises insulin and contributes to vascular inflammation. It also activates the parasympathetic nervous system, which lowers heart rate.',
      'Avoid breath-holding under heavy loads. Valsalva maneuver (holding breath while straining) sharply spikes pressure mid-set. Breathe steadily through all movement.',
    ],
    study: 'Reference: bjsm.bmj.com/content/57/20/1317',
  },
  {
    id: 'nutrition',
    title: 'Functional Nutrition for Blood Pressure',
    sub: 'Foods that support vascular health from the inside',
    body: [
      'Nitric oxide precursors: Beets, arugula, spinach, and pomegranate are among the highest-nitrate foods available. Dietary nitrates convert to nitric oxide in the gut and bloodstream, supporting vessel dilation. These are not supplements, they are food.',
      'Potassium-rich foods: Avocado, banana, sweet potato, white bean, and leafy greens help the kidneys excrete sodium and keep fluid balance in check. Aim for more potassium than sodium in your daily intake.',
      'Magnesium sources: Dark leafy greens, pumpkin seeds, black beans, and dark chocolate (70% or higher) are among the best dietary magnesium sources. Magnesium glycinate is the most bioavailable form if supplementing.',
      'Omega-3 fats: EPA and DHA from fatty fish (salmon, sardines, mackerel) reduce systemic inflammation, improving endothelial function over time. The anti-inflammatory effect on blood vessels is distinct from the cholesterol effect.',
      'Limit: Ultra-processed sodium (different from sea salt used in whole food cooking), alcohol (which disrupts sleep architecture and raises cortisol), and added sugars (which directly promote insulin resistance and endothelial damage).',
    ],
  },
]

const BP_LEVERS = [
  {
    id: 'volume',
    number: '01',
    title: 'Blood Volume',
    subtitle: 'Excess volume means the heart pushes more fluid through the same pipes. Pressure rises.',
    color: '#0b9e8e',
    disruptors: [
      'Processed and packaged sodium (triggers water retention)',
      'Late-night blue light (suppresses ADH, disrupting overnight fluid regulation)',
    ],
    fixes: [
      'Cucumber water (mild natural diuretic)',
      'Morning sunlight: 10 minutes within 1 hour of waking (anchors cortisol and ADH rhythm)',
      'Hourly calf raises (activates the venous pump to return blood from the legs)',
    ],
    question: 'Did I anchor my volume-regulating hormones with morning light today?',
  },
  {
    id: 'tone',
    number: '02',
    title: 'Vessel Tone',
    subtitle: 'Tight, contracted vessels create resistance. The heart works harder to push blood through.',
    color: '#c8a74b',
    disruptors: [
      'Mouth breathing (bypasses nitric oxide production in nasal passages)',
      'Chronic tension: jaw clenching, shoulder holding, unresolved stress',
    ],
    fixes: [
      'Beets and garlic: highest dietary sources of nitrate precursors that convert to nitric oxide',
      'Nasal breathing during all daily activity, not just exercise',
      'Mid-day movement break to clear cortisol buildup',
    ],
    question: 'Did I breathe through my nose and eat something that feeds my vessels today?',
  },
  {
    id: 'elasticity',
    number: '03',
    title: 'Vessel Elasticity',
    subtitle: 'Stiff vessel walls cannot absorb pressure changes. Baseline pressure stays chronically elevated.',
    color: '#4be08a',
    disruptors: [
      'Excess sugar and fried oils (glycate vessel walls, making them brittle over time)',
      'Prolonged sitting (reduces the shear stress that keeps vessels flexible)',
    ],
    fixes: [
      'Berries and walnuts: polyphenols and omega-3 directly reduce arterial stiffness',
      '30-second all-out effort burst: shear stress trains vessel wall flexibility',
      'Wall sit finisher: 2-minute hold then release triggers a nitric oxide surge',
    ],
    question: 'Did I create a shear stress event to train my vessel walls today?',
  },
]

// context tags appended to notes when logging a reading
const DIET_TAGS = ['Whole foods', 'Average day', 'Salty snacks', 'Fast food / heavy processed'] as const
const STRESS_TAGS = ['Very calm', 'Moderate', 'High stress', 'Very high stress'] as const
const MOVE_TAGS = ['No movement', 'Light walk', 'Moderate exercise', 'Intense workout'] as const

type DietTag = typeof DIET_TAGS[number]
type StressTag = typeof STRESS_TAGS[number]
type MoveTag = typeof MOVE_TAGS[number]

// derive gauge values from daily log data + last reading trend
function deriveGauges(energyLevel: number, steps: number, recentTrendDir: number) {
  // energy 1-10: low energy = high stress signal
  const sns = Math.round((11 - energyLevel) * 9)
  // steps: 8000+ = high flexibility, 0 = low
  const elas = Math.round(40 + Math.min(steps / 8000, 1) * 45)
  // tone: driven by stress + trend
  const tone = Math.round(sns * 0.6 + (recentTrendDir > 0 ? 15 : 0))
  // volume: neutral baseline, slightly elevated if trending up
  const vol = Math.round(50 + (recentTrendDir > 0 ? 12 : recentTrendDir < 0 ? -8 : 0))
  const clamp = (v: number) => Math.max(5, Math.min(95, v))
  return { vol: clamp(vol), tone: clamp(tone), elas: clamp(elas), sns: clamp(sns) }
}

export default function BPTrackerPage() {
  const [readings, setReadings] = useState<BPReading[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ systolic: '', diastolic: '', pulse: '', notes: '' })
  const [openEdu, setOpenEdu] = useState<string | null>(null)
  // context tags
  const [dietTag, setDietTag] = useState<DietTag | null>(null)
  const [stressTag, setStressTag] = useState<StressTag | null>(null)
  const [moveTag, setMoveTag] = useState<MoveTag | null>(null)
  // today's daily log for gauges
  const [todayEnergy, setTodayEnergy] = useState(5)
  const [todaySteps, setTodaySteps] = useState(0)

  useEffect(() => {
    fetchReadings()
    fetchTodayLog()
  }, [])

  const fetchTodayLog = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const today = new Date().toISOString().split('T')[0]
    const { data } = await supabase
      .from('daily_logs')
      .select('energy_level, steps')
      .eq('user_id', user.id)
      .eq('log_date', today)
      .maybeSingle()
    if (data) {
      setTodayEnergy(data.energy_level ?? 5)
      setTodaySteps(data.steps ?? 0)
    }
  }

  const fetchReadings = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('blood_pressure_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('logged_at', { ascending: true })
      .limit(60)
    setReadings((data as BPReading[]) ?? [])
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const sys = parseInt(form.systolic)
    const dia = parseInt(form.diastolic)
    if (isNaN(sys) || isNaN(dia) || sys < 60 || sys > 250 || dia < 40 || dia > 150) {
      toast.error('Please enter valid blood pressure values')
      return
    }
    setSubmitting(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('blood_pressure_logs').insert({
      user_id: user.id,
      systolic: sys,
      diastolic: dia,
      pulse: form.pulse ? parseInt(form.pulse) : null,
      notes: [
        dietTag && `Diet: ${dietTag}`,
        stressTag && `Stress: ${stressTag}`,
        moveTag && `Movement: ${moveTag}`,
        form.notes,
      ].filter(Boolean).join(' | ') || null,
      logged_at: new Date().toISOString(),
    })
    if (error) {
      toast.error('Failed to save reading')
    } else {
      toast.success('Blood pressure reading saved!')
      setForm({ systolic: '', diastolic: '', pulse: '', notes: '' })
      setDietTag(null); setStressTag(null); setMoveTag(null)
      setShowForm(false)
      fetchReadings()
    }
    setSubmitting(false)
  }

  const latest = readings[readings.length - 1]
  const latestZone = latest ? getBPZone(latest.systolic, latest.diastolic) : null

  const allTimeBest = readings.length > 0 ? {
    systolic: Math.min(...readings.map(r => r.systolic)),
    diastolic: Math.min(...readings.map(r => r.diastolic)),
  } : null

  const optimalCount = readings.filter(r => r.systolic < 120 && r.diastolic < 80).length

  const recentTrend = (() => {
    if (readings.length < 6) return null
    const last3 = readings.slice(-3)
    const prev3 = readings.slice(-6, -3)
    const avgLast = last3.reduce((s, r) => s + r.systolic, 0) / 3
    const avgPrev = prev3.reduce((s, r) => s + r.systolic, 0) / 3
    const diff = avgLast - avgPrev
    if (diff <= -4) return { label: 'Trending Down', color: '#4be08a', arrow: '↓' }
    if (diff >= 4) return { label: 'Trending Up', color: '#e05c5c', arrow: '↑' }
    return { label: 'Holding Steady', color: '#c8a74b', arrow: '→' }
  })()

  const trendDir = recentTrend?.arrow === '↑' ? 1 : recentTrend?.arrow === '↓' ? -1 : 0
  const gauges = deriveGauges(todayEnergy, todaySteps, trendDir)

  // Chart data
  const labels = readings.map(r => format(parseISO(r.logged_at), 'MMM d'))
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Systolic',
        data: readings.map(r => r.systolic),
        borderColor: '#c8a74b',
        backgroundColor: 'rgba(200,167,75,0.08)',
        borderWidth: 2,
        pointBackgroundColor: readings.map(r => BP_ZONE_COLORS[getBPZone(r.systolic, r.diastolic)]),
        pointRadius: 5,
        tension: 0.3,
        fill: false,
      },
      {
        label: 'Diastolic',
        data: readings.map(r => r.diastolic),
        borderColor: '#0b9e8e',
        backgroundColor: 'rgba(11,158,142,0.08)',
        borderWidth: 2,
        pointBackgroundColor: readings.map(r => BP_ZONE_COLORS[getBPZone(r.systolic, r.diastolic)]),
        pointRadius: 5,
        tension: 0.3,
        fill: false,
      },
      {
        label: 'Goal (120)',
        data: readings.map(() => 120),
        borderColor: 'rgba(75,224,138,0.4)',
        borderWidth: 1,
        borderDash: [6, 4],
        pointRadius: 0,
        fill: false,
      },
      {
        label: 'Goal (80)',
        data: readings.map(() => 80),
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
            const r = readings[idx]
            return [`Zone: ${BP_ZONE_LABELS[getBPZone(r.systolic, r.diastolic)]}`]
          }
        }
      },
      annotation: {
        annotations: {
          optimal: {
            type: 'box' as const,
            yMin: 50, yMax: 119,
            backgroundColor: 'rgba(75, 224, 138, 0.05)',
            borderWidth: 0,
            label: { display: true, content: 'Optimal', color: '#4be08a', font: { size: 10 }, position: { x: 'start' as const, y: 'start' as const } },
          },
          elevated: {
            type: 'box' as const,
            yMin: 120, yMax: 129,
            backgroundColor: 'rgba(224, 184, 75, 0.06)',
            borderWidth: 0,
            label: { display: true, content: 'Elevated', color: '#e0b84b', font: { size: 10 }, position: { x: 'start' as const, y: 'start' as const } },
          },
          high1: {
            type: 'box' as const,
            yMin: 130, yMax: 139,
            backgroundColor: 'rgba(224, 138, 75, 0.06)',
            borderWidth: 0,
            label: { display: true, content: 'High (Stage 1)', color: '#e08a4b', font: { size: 10 }, position: { x: 'start' as const, y: 'start' as const } },
          },
          high2: {
            type: 'box' as const,
            yMin: 140, yMax: 180,
            backgroundColor: 'rgba(224, 92, 92, 0.06)',
            borderWidth: 0,
            label: { display: true, content: 'High (Stage 2)', color: '#e05c5c', font: { size: 10 }, position: { x: 'start' as const, y: 'start' as const } },
          },
        },
      },
    },
    scales: {
      x: { ticks: { color: '#91a0ac', font: { size: 11 } }, grid: { color: '#1f3331' } },
      y: {
        ticks: { color: '#91a0ac', font: { size: 11 } },
        grid: { color: '#1f3331' },
        min: 50, max: 180,
      },
    },
  }

  return (
    <div className="animate-fade-in">
      <div className={styles.pageTop}>
        <div>
          <h1 className={styles.pageTopTitle}>
            <Heart size={22} color="#e05c5c" /> Blood Pressure Tracker
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
            {/* Zone color is derived from the live reading, so it stays inline */}
            <div className={styles.bpLatestValue} style={{ color: BP_ZONE_COLORS[latestZone!] }}>
              {latest.systolic}/{latest.diastolic}
            </div>
            <div className={styles.bpUnit}>mmHg</div>
          </div>
          <div>
            <div className={styles.bpZoneName} style={{ color: BP_ZONE_COLORS[latestZone!] }}>
              {BP_ZONE_LABELS[latestZone!]}
            </div>
            <div className={styles.bpMeta}>
              {latest.pulse && `Pulse: ${latest.pulse} bpm · `}
              {format(parseISO(latest.logged_at), 'MMM d, h:mm a')}
            </div>
            {(latestZone === 'high1' || latestZone === 'high2' || latestZone === 'crisis') && (
              <div className={styles.bpCrisisAlert}>
                Your recent reading is in a range that warrants attention. This is educational information only. Please contact your healthcare provider to discuss your readings.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Milestone stats */}
      {readings.length >= 2 && allTimeBest && (
        <div className={styles.bpMilestoneRow}>
          <div className={styles.bpMilestoneStat}>
            <div className={styles.bpMilestoneNum} style={{ color: '#4be08a' }}>{allTimeBest.systolic}</div>
            <div className={styles.bpMilestoneLabel}>Best Systolic</div>
          </div>
          <div className={styles.bpMilestoneStat}>
            <div className={styles.bpMilestoneNum} style={{ color: '#4be08a' }}>{allTimeBest.diastolic}</div>
            <div className={styles.bpMilestoneLabel}>Best Diastolic</div>
          </div>
          <div className={styles.bpMilestoneStat}>
            <div className={styles.bpMilestoneNum}>{readings.length}</div>
            <div className={styles.bpMilestoneLabel}>Total Readings</div>
          </div>
          <div className={styles.bpMilestoneStat}>
            <div className={styles.bpMilestoneNum} style={{ color: '#4be08a' }}>{optimalCount}</div>
            <div className={styles.bpMilestoneLabel}>Optimal Readings</div>
          </div>
          {recentTrend && (
            <div className={styles.bpMilestoneStat}>
              <div className={styles.bpMilestoneNum} style={{ color: recentTrend.color }}>{recentTrend.arrow}</div>
              <div className={styles.bpMilestoneLabel}>{recentTrend.label}</div>
            </div>
          )}
        </div>
      )}

      {/* Log form */}
      {showForm && (
        <div className={styles.card}>
          <h3 className={styles.cardTitleSolo}>New Reading</h3>
          <form onSubmit={handleSubmit} className={styles.logForm}>
            <div className={styles.inputRow3}>
              <div className={styles.field}>
                <label className={styles.label}>Systolic (top) *</label>
                <input className={styles.input} type="number" placeholder="120" value={form.systolic} onChange={e => setForm(f => ({...f, systolic: e.target.value}))} required min={60} max={250} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Diastolic (bottom) *</label>
                <input className={styles.input} type="number" placeholder="80" value={form.diastolic} onChange={e => setForm(f => ({...f, diastolic: e.target.value}))} required min={40} max={150} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Pulse (bpm)</label>
                <input className={styles.input} type="number" placeholder="72" value={form.pulse} onChange={e => setForm(f => ({...f, pulse: e.target.value}))} min={30} max={220} />
              </div>
            </div>
            {/* Context tags */}
            <div className={styles.field}>
              <label className={styles.label}>What did you eat today? (optional)</label>
              <div className={styles.tagRow}>
                {DIET_TAGS.map(t => (
                  <button key={t} type="button"
                    className={dietTag === t ? styles.tagActive : styles.tag}
                    onClick={() => setDietTag(dietTag === t ? null : t)}>{t}</button>
                ))}
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Stress level today? (optional)</label>
              <div className={styles.tagRow}>
                {STRESS_TAGS.map(t => (
                  <button key={t} type="button"
                    className={stressTag === t ? styles.tagActive : styles.tag}
                    onClick={() => setStressTag(stressTag === t ? null : t)}>{t}</button>
                ))}
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Movement today? (optional)</label>
              <div className={styles.tagRow}>
                {MOVE_TAGS.map(t => (
                  <button key={t} type="button"
                    className={moveTag === t ? styles.tagActive : styles.tag}
                    onClick={() => setMoveTag(moveTag === t ? null : t)}>{t}</button>
                ))}
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Additional notes (optional)</label>
              <input className={styles.input} type="text" placeholder="After morning walk, before coffee..." value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} maxLength={200} />
            </div>
            <div className={styles.formActions}>
              <button type="submit" className={shared.btnPrimary} disabled={submitting}>{submitting ? 'Saving...' : 'Save Reading'}</button>
              <button type="button" className={shared.btnSecondary} onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Chart */}
      <div className={styles.card}>
        <h3 className={styles.cardTitleSolo}>Trend (Last 60 Readings)</h3>
        {loading ? (
          <div className={styles.chartEmpty}>Loading chart...</div>
        ) : readings.length < 2 ? (
          <div className={styles.chartEmpty}>
            <Heart size={32} color="var(--border)" />
            <p>Log at least 2 readings to see your trend</p>
          </div>
        ) : (
          <div className={styles.chartWrap}>
            <Line data={chartData} options={chartOptions as never} />
          </div>
        )}
      </div>

      {/* BP Zone Reference */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardLabel}>
            <Info size={16} color="var(--text-secondary)" /> Blood Pressure Reference (Educational)
          </h3>
        </div>
        <div className={styles.zoneGrid}>
          {[
            { zone: 'Normal', range: 'Below 120/80', color: '#4be08a' },
            { zone: 'Elevated', range: '120-129 / below 80', color: '#e0b84b' },
            { zone: 'High Stage 1', range: '130-139 / 80-89', color: '#e08a4b' },
            { zone: 'High Stage 2', range: '140+ / 90+', color: '#e05c5c' },
            { zone: 'Very High', range: 'Above 180 / above 120', color: '#c0392b' },
          ].map(({ zone, range, color }) => (
            <div key={zone} className={styles.zoneItem}>
              {/* Dot color comes from the zone data, so it stays inline */}
              <div className={styles.dot} style={{ background: color }} />
              <div>
                <div className={styles.zoneItemName}>{zone}</div>
                <div className={styles.zoneItemRange}>{range}</div>
              </div>
            </div>
          ))}
        </div>
        <p className={styles.refNote}>
          This reference is for educational purposes only. Blood pressure classifications are based on AHA/ACC guidelines. Always consult your healthcare provider for clinical interpretation of your readings.
        </p>
      </div>

      {/* Live Artery Gauges */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardLabel}>
            <Activity size={16} color="var(--teal)" /> What Your Body Is Doing Right Now
          </h3>
        </div>
        <p className={styles.cardText} style={{ marginBottom: '1rem' }}>
          These gauges update based on today's energy level and step count from your Daily Log. Tag your readings with diet and stress context to see these shift over time.
        </p>
        <div className={styles.bpGaugeGrid}>
          <BPGauge label="Blood Volume" value={gauges.vol} color="#58a6ff" icon={<Droplets size={14} />}
            tip="Driven by sodium intake and hydration. More volume means more pressure on artery walls." />
          <BPGauge label="Artery Tightness" value={gauges.tone} color={gauges.tone > 65 ? '#e05c5c' : '#c8a74b'} icon={<Wind size={14} />}
            tip="Rises with stress and low energy. Movement and calm bring it down." />
          <BPGauge label="Artery Flexibility" value={gauges.elas} color={gauges.elas < 55 ? '#e05c5c' : '#0B9E8E'} icon={<Activity size={14} />}
            tip="Built by consistent daily movement. Estimated from your step count today." />
          <BPGauge label="Stress Signal" value={gauges.sns} color="#c8a74b" icon={<Heart size={14} />}
            tip="Inverted from your energy level today. Low energy often signals high nervous system load." />
        </div>
        <p className={styles.refNote} style={{ marginTop: '1rem' }}>
          Gauges are educational estimates derived from your Daily Log. Log your energy and steps daily for the most accurate picture. Not a clinical measurement.
        </p>
      </div>

      {/* 3 Levers Section */}
      <div className={styles.bpLeversSection}>
        <div className={styles.bpLeversSectionHead}>
          Your Optimization Protocol
          <span className={styles.bpLeversSubhead}>3 levers that directly control your blood pressure</span>
        </div>
        <div className={styles.bpLeversGrid}>
          {BP_LEVERS.map(({ id, number, title, subtitle, color, disruptors, fixes, question }) => (
            <div key={id} className={styles.bpLeverCard} style={{ borderTopColor: color }}>
              <div className={styles.bpLeverNum} style={{ color }}>{number}</div>
              <div className={styles.bpLeverTitle} style={{ color }}>{title}</div>
              <div className={styles.bpLeverSub}>{subtitle}</div>
              <div className={styles.bpLeverCols}>
                <div>
                  <div className={styles.bpLeverColHead} style={{ color: '#e05c5c' }}>Disruptors</div>
                  <ul className={styles.bpLeverList}>
                    {disruptors.map((d, i) => <li key={i}>{d}</li>)}
                  </ul>
                </div>
                <div>
                  <div className={styles.bpLeverColHead} style={{ color }}>Mechanical Fix</div>
                  <ul className={styles.bpLeverList}>
                    {fixes.map((f, i) => <li key={i}>{f}</li>)}
                  </ul>
                </div>
              </div>
              <div className={styles.bpLeverQuestion}>"{question}"</div>
            </div>
          ))}
        </div>
      </div>

      {/* BP Education Section */}
      <div className={styles.bpEduSection}>
        <div className={styles.bpEduSectionHead}>
          <Info size={16} color="var(--gold)" />
          <span>Understanding Blood Pressure: Functional Education</span>
        </div>
        {BP_EDU.map(({ id, title, sub, body, study }) => (
          <div key={id} className={styles.bpEduCard}>
            <button
              className={styles.bpEduCardBtn}
              onClick={() => setOpenEdu(openEdu === id ? null : id)}
            >
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
                {study && <div className={styles.bpEduStudy}>{study}</div>}
              </div>
            )}
          </div>
        ))}
        <p className={styles.refNote}>
          Educational context only. This is not medical advice. Dr. Shallanda Hunter, CFNMP, PharmD, MBA provides functional medicine education. Always work with your healthcare team on treatment decisions.
        </p>
      </div>
    </div>
  )
}
