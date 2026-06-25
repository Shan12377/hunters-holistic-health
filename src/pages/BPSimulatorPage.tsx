import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler,
} from 'chart.js'
import { Activity, Wind, Droplets, Heart, TrendingUp, Lock } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import BPGauge from '@/components/ui/BPGauge'
import NewsletterEmbed from '@/components/ui/NewsletterEmbed'
import styles from './BPSimulatorPage.module.css'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

// ---- types ----
type SaltLevel = 0 | 1 | 2 | 3
type ActivityLevel = 'none' | 'aerobic' | 'wallsquat'

interface BpPoint { stage: string; sys: number; dia: number }
interface Gauges { volume: number; tone: number; elasticity: number; sns: number }


// ---- core engine ----
function simulate(sys: number, dia: number, age: number, sex: string, salt: SaltLevel, stress: number, act: ActivityLevel): { points: BpPoint[]; gauges: Gauges } {
  let s = sys, d = dia
  const points: BpPoint[] = [{ stage: 'Your Baseline', sys: s, dia: d }]

  let vol = 50, tone = 50, elas = 90 - (age >= 60 ? 35 : age >= 40 ? 20 : 0)
  const sns = stress * 10
  const postMeno = sex === 'F' && age >= 50

  if (sex === 'F' && !postMeno) tone -= 10
  else if (postMeno) { tone += 15 }

  const saltMult = postMeno ? 1.5 : sex === 'F' ? 1.2 : 1.0
  if (salt === 0) { vol -= 10; s -= 4; d -= 2 }
  else if (salt === 2) { vol += 15; tone += 10; elas -= 5; s += 6 * saltMult; d += 2 * saltMult }
  else if (salt === 3) { vol += 30; tone += 20; elas -= 15; s += 14 * saltMult; d += 5 * saltMult }
  points.push({ stage: 'After Eating', sys: Math.round(s), dia: Math.round(d) })

  const sd = stress - 5
  tone += sd * 5; s += sd * 2.5; d += sd * 1.5
  points.push({ stage: 'After Stress', sys: Math.round(s), dia: Math.round(d) })

  if (act === 'aerobic') { tone -= 15; elas += 10; s -= 4.5; d -= 2.5 }
  else if (act === 'wallsquat') { tone -= 25; s -= 8.2; d -= 4.5 }
  points.push({ stage: 'After Movement', sys: Math.round(s), dia: Math.round(d) })

  const clamp = (v: number) => Math.max(5, Math.min(95, v))
  return {
    points,
    gauges: { volume: clamp(vol), tone: clamp(tone), elasticity: clamp(elas), sns: clamp(sns) },
  }
}

// ---- plain-English analysis ----
function buildAnalysis(sys: number, dia: number, salt: SaltLevel, stress: number, act: ActivityLevel, sex: string, age: number): string {
  const lines: string[] = []
  const postMeno = sex === 'F' && age >= 50

  lines.push(`You started at ${sys}/${dia}. Here is what each choice did to that number.`)

  if (salt === 0) lines.push('Eating a whole-food, low-sodium diet gives your blood vessels room to relax. Less sodium means your body holds less water, which lowers the pressure your heart has to work against.')
  if (salt === 2) lines.push('That bag of chips added roughly 400 to 800 mg of sodium in one sitting. Your body responds by holding extra water to balance it out, which raises the pressure inside your arteries within hours.')
  if (salt === 3) lines.push('A heavy processed food day can push your daily sodium over 4,500 mg. That is three times the recommended limit. Your blood vessels tighten and your body holds on to water, which is a double hit to your blood pressure.')
  if (postMeno) lines.push('After menopause, estrogen drops and your arteries lose some of their natural protection. This makes your body more sensitive to salt and stress than it was before.')

  if (stress >= 7) lines.push('High stress keeps your body in a "fight or flight" state. Your nervous system signals your blood vessels to stay tight, which raises resistance and pushes your pressure up.')
  else if (stress <= 3) lines.push('A calm nervous system lets your blood vessels stay relaxed. Lower stress is one of the most underrated tools for blood pressure.')

  if (act === 'wallsquat') lines.push('Wall squats create a brief squeeze followed by a rush of blood flow. That rush signals your arteries to release nitric oxide, which relaxes the vessel walls. Research shows this single move drops systolic pressure by an average of 8 points.')
  else if (act === 'aerobic') lines.push('Short bursts of movement push more blood through your vessels. That extra flow tells your arteries to open up and stay flexible. Even a 30-second effort makes a measurable difference.')
  else lines.push('Sitting still for long stretches reduces the blood flow that keeps your arteries flexible. Even short walks throughout the day help.')

  return lines.join('\n\n')
}

// ---- label helper ----
function rangeLabel(sys: number, dia: number): { text: string; color: string } {
  if (sys < 120 && dia < 80) return { text: 'Within the healthy range', color: 'var(--success)' }
  if (sys < 130 && dia < 80) return { text: 'Slightly above ideal', color: '#c8a74b' }
  if (sys < 140 || dia < 90) return { text: 'Elevated', color: '#e08c3a' }
  return { text: 'Well above the healthy range', color: 'var(--error)' }
}

const SALT_OPTIONS = [
  { value: 0 as SaltLevel, label: 'Mostly whole foods (low sodium)' },
  { value: 1 as SaltLevel, label: 'Average diet (~2,300 mg)' },
  { value: 2 as SaltLevel, label: 'Added chips or salty snacks today' },
  { value: 3 as SaltLevel, label: 'Fast food or heavy processed day' },
]
const ACT_OPTIONS: { value: ActivityLevel; label: string }[] = [
  { value: 'none', label: 'No movement today' },
  { value: 'aerobic', label: '30-second burst of movement' },
  { value: 'wallsquat', label: 'Wall squat (2 minutes)' },
]

export default function BPSimulatorPage() {
  const { profile } = useAuthStore()
  const isLoggedIn = !!profile
  const [sys, setSys] = useState(128)
  const [dia, setDia] = useState(82)
  const [age, setAge] = useState(45)
  const [sex, setSex] = useState('M')
  const [salt, setSalt] = useState<SaltLevel>(1)
  const [stress, setStress] = useState(5)
  const [act, setAct] = useState<ActivityLevel>('none')

  const { points, gauges } = useMemo(
    () => simulate(sys, dia, age, sex, salt, stress, act),
    [sys, dia, age, sex, salt, stress, act]
  )

  const analysis = useMemo(
    () => buildAnalysis(sys, dia, salt, stress, act, sex, age),
    [sys, dia, salt, stress, act, sex, age]
  )

  const final = points[points.length - 1]
  const range = rangeLabel(final.sys, final.dia)

  const chartData = {
    labels: points.map(p => p.stage),
    datasets: [
      {
        label: 'Systolic (top number)',
        data: points.map(p => p.sys),
        borderColor: '#e05c5c',
        backgroundColor: 'rgba(224,92,92,0.1)',
        borderWidth: 2.5,
        tension: 0.3,
        fill: true,
        pointRadius: 5,
        pointBackgroundColor: 'var(--bg-card)',
        pointBorderColor: '#e05c5c',
        pointBorderWidth: 2,
      },
      {
        label: 'Diastolic (bottom number)',
        data: points.map(p => p.dia),
        borderColor: '#0B9E8E',
        backgroundColor: 'transparent',
        borderWidth: 2.5,
        tension: 0.3,
        pointRadius: 5,
        pointBackgroundColor: 'var(--bg-card)',
        pointBorderColor: '#0B9E8E',
        pointBorderWidth: 2,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, labels: { color: 'hsl(181,20%,68%)', font: { size: 11 } } },
      tooltip: {
        backgroundColor: 'rgba(20,68,69,0.95)',
        titleColor: '#fff',
        bodyColor: 'hsl(181,20%,68%)',
        borderColor: '#2a6d6f',
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        min: Math.min(55, ...points.map(p => p.dia)) - 5,
        max: Math.max(175, ...points.map(p => p.sys)) + 10,
        grid: { color: 'rgba(42,109,111,0.25)' },
        ticks: { color: 'hsl(181,20%,68%)', font: { size: 10 } },
      },
      x: {
        grid: { display: false },
        ticks: { color: '#fff', font: { size: 11, weight: 'bold' as const } },
      },
    },
  }

  // scroll to top on mount
  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>Blood Pressure Simulator</h1>
        <p className={styles.heroSub}>
          Enter your baseline numbers and adjust the sliders to see how everyday choices move your blood pressure. No account needed.
        </p>
        <p className={styles.disclaimer}>
          Numbers shown are educational estimates based on published research averages. They are not a diagnosis and do not reflect your individual physiology. Always work with your own healthcare provider.
        </p>
      </div>

      <div className={styles.layout}>
        {/* LEFT: inputs */}
        <aside className={styles.inputs}>

          {/* Baseline */}
          <div className={styles.inputCard}>
            <div className={styles.inputCardTitle}><Heart size={15} /> Your Resting BP</div>
            <p className={styles.inputCardNote}>Enter the numbers you usually see at rest.</p>
            <div className={styles.bpRow}>
              <div className={styles.bpField}>
                <label className={styles.bpLabel}>Systolic (top)</label>
                <input
                  type="number"
                  value={sys}
                  onChange={e => setSys(Number(e.target.value))}
                  className={styles.bpInput}
                  style={{ color: '#e05c5c' }}
                />
              </div>
              <span className={styles.bpSlash}>/</span>
              <div className={styles.bpField}>
                <label className={styles.bpLabel}>Diastolic (bottom)</label>
                <input
                  type="number"
                  value={dia}
                  onChange={e => setDia(Number(e.target.value))}
                  className={styles.bpInput}
                  style={{ color: '#0B9E8E' }}
                />
              </div>
            </div>
          </div>

          {/* Demographics */}
          <div className={styles.inputCard}>
            <div className={styles.inputCardTitle}>About You</div>
            <div className={styles.demoRow}>
              <div className={styles.sliderGroup}>
                <div className={styles.sliderHeader}>
                  <span>Age</span>
                  <span className={styles.sliderVal}>{age}</span>
                </div>
                <input type="range" min={18} max={90} value={age} onChange={e => setAge(Number(e.target.value))} className={styles.slider} />
              </div>
              <div className={styles.sexGroup}>
                <span className={styles.sexLabel}>Biological Sex</span>
                <div className={styles.sexBtns}>
                  {(['M', 'F'] as const).map(s => (
                    <button
                      key={s}
                      className={sex === s ? styles.sexBtnActive : styles.sexBtn}
                      onClick={() => setSex(s)}
                    >
                      {s === 'M' ? 'Male' : 'Female'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Diet */}
          <div className={styles.inputCard}>
            <div className={styles.inputCardTitle}><Droplets size={15} /> What Did You Eat Today?</div>
            <div className={styles.optionList}>
              {SALT_OPTIONS.map(o => (
                <button
                  key={o.value}
                  className={salt === o.value ? styles.optionActive : styles.option}
                  onClick={() => setSalt(o.value)}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Stress */}
          <div className={styles.inputCard}>
            <div className={styles.inputCardTitle}><Wind size={15} /> Stress Level Today</div>
            <div className={styles.sliderHeader}>
              <span className={styles.sliderLabel}>1 = Very calm</span>
              <span className={styles.sliderVal} style={{ color: stress >= 7 ? '#e05c5c' : 'var(--gold)' }}>Level {stress}</span>
              <span className={styles.sliderLabel}>10 = Very stressed</span>
            </div>
            <input type="range" min={1} max={10} value={stress} onChange={e => setStress(Number(e.target.value))} className={styles.slider} />
          </div>

          {/* Activity */}
          <div className={styles.inputCard}>
            <div className={styles.inputCardTitle}><Activity size={15} /> Movement</div>
            <div className={styles.optionList}>
              {ACT_OPTIONS.map(o => (
                <button
                  key={o.value}
                  className={act === o.value ? styles.optionActive : styles.option}
                  onClick={() => setAct(o.value)}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* RIGHT: output */}
        <div className={styles.output}>

          {/* Final number */}
          <div className={styles.resultCard}>
            <div className={styles.resultLabel}>Simulated Result</div>
            <div className={styles.resultBp}>
              <span className={styles.resultSys} style={{ color: final.sys >= 130 ? '#e05c5c' : '#fff' }}>{final.sys}</span>
              <span className={styles.resultSlash}>/</span>
              <span className={styles.resultDia} style={{ color: final.dia >= 80 ? '#e05c5c' : '#0B9E8E' }}>{final.dia}</span>
            </div>
            <div className={styles.resultRange} style={{ color: range.color }}>{range.text}</div>
          </div>

          {/* Chart */}
          <div className={styles.chartCard}>
            <div className={styles.chartTitle}>How each choice moved your numbers</div>
            <div className={styles.chartWrap}>
              <Line data={chartData} options={chartOptions as never} />
            </div>
          </div>

          {/* Gauges */}
          <div className={styles.gaugesCard}>
            <div className={styles.gaugesTitle}>What is happening inside your arteries</div>
            <div className={styles.gaugeGrid}>
              <BPGauge label="Blood Volume" value={gauges.volume} color="#58a6ff" icon={<Droplets size={14} />}
                tip="Sodium makes your body hold water. More water means more pressure on your artery walls." />
              <BPGauge label="Artery Tightness" value={gauges.tone} color={gauges.tone > 65 ? '#e05c5c' : '#c8a74b'} icon={<Wind size={14} />}
                tip="Stress and high-sodium foods tighten your blood vessels. Movement and calm help them relax." />
              <BPGauge label="Artery Flexibility" value={gauges.elasticity} color={gauges.elasticity < 55 ? '#e05c5c' : '#0B9E8E'} icon={<Activity size={14} />}
                tip="Flexible arteries act as shock absorbers. Flexibility decreases with age and processed food over time." />
              <BPGauge label="Stress Signal Strength" value={gauges.sns} color="#c8a74b" icon={<Heart size={14} />}
                tip="Your nervous system controls how tight your vessels stay. High stress keeps them clamped." />
            </div>
          </div>

          {/* Analysis */}
          <div className={styles.analysisCard}>
            <div className={styles.analysisTitle}>What this means in plain terms</div>
            {analysis.split('\n\n').map((line, i) => (
              <p key={i} className={styles.analysisLine}>{line}</p>
            ))}
            <p className={styles.analysisFooter}>
              This tool is for educational purposes only and is operated by a Certified Functional and Nutritional Medicine Practitioner. It does not diagnose, treat, or prescribe. Consult your healthcare provider before making changes to your health routine.
            </p>
          </div>

          {/* Newsletter */}
          <NewsletterEmbed />

          {/* Upgrade CTA */}
          {isLoggedIn ? (
            <div className={styles.upgradeCard}>
              <TrendingUp size={20} color="var(--teal)" />
              <div className={styles.upgradeText}>
                <strong>You have the full BP Tracker.</strong> See your real readings, track your trend over time, and connect your daily habits to your numbers.
              </div>
              <Link to="/app/blood-pressure" className={styles.upgradeBtn}>Go to My BP Tracker</Link>
            </div>
          ) : (
            <div className={styles.upgradeCard}>
              <Lock size={20} color="var(--gold)" />
              <div className={styles.upgradeText}>
                <strong>This is the preview.</strong> Members track their real readings over time, see their trend chart, and get a personalized weekly pattern analysis tied to their daily habits.
              </div>
              <div className={styles.upgradeBtns}>
                <Link to="/signup" className={styles.upgradeBtn}>Start Foundation ($37/mo)</Link>
                <Link to="/#pricing" className={styles.upgradeBtnSecondary}>See All Plans</Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
