import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BPSimulatorWidget } from './BPSimulatorPage'
import { Shield, Award, Users, BookOpen, Pill, Activity, Heart, ChevronRight, ExternalLink, ChevronDown, CheckCircle, Dumbbell, Zap } from 'lucide-react'
import styles from './LandingPage.module.css'
import shared from '../styles/shared.module.css'

// --- Types ---
type ToolTab = 'bp' | 'symptom' | 'homa'
type BillingCycle = 'monthly' | 'annual'

interface BPResult {
  zone: string
  color: string
  message: string
  elevating: string[]
  supporting: string[]
}

interface HomaResult {
  score: number
  zone: string
  color: string
  context: string
}

// --- Stripe Payment Links (add these in Vercel env vars when Stripe is live) ---
const STRIPE = {
  foundation_monthly: import.meta.env.VITE_STRIPE_FOUNDATION_MONTHLY || '',
  foundation_annual:  import.meta.env.VITE_STRIPE_FOUNDATION_ANNUAL  || '',
  program_monthly:    import.meta.env.VITE_STRIPE_PROGRAM_MONTHLY    || '',
  program_annual:     import.meta.env.VITE_STRIPE_PROGRAM_ANNUAL     || '',
  vip_monthly:        import.meta.env.VITE_STRIPE_VIP_MONTHLY        || '',
  vip_annual:         import.meta.env.VITE_STRIPE_VIP_ANNUAL         || '',
  overhaul:           '',
}
const checkoutUrl = (key: keyof typeof STRIPE) => STRIPE[key] || '/join'

// --- Static data ---
const FEATURES = [
  { img: '/features/blood-pressure-tracker.jpeg', title: 'Blood Pressure Tracker',   desc: 'Log readings and visualize trends with AHA-zone color-coding. Understand the pattern, not just the number.' },
  { img: '/features/ai-meal-guard.jpeg',           title: 'AI Meal Guard',             desc: 'Get instant educational context on a food choice before you eat. Grounded in functional and nutritional medicine.' },
  { img: '/features/daily-command-center.jpeg',    title: 'Daily Command Center',      desc: 'Fasting, meals, supplements, steps, and water in one 10-minute daily check-in.' },
  { img: '/features/weekly-report-card.jpeg',      title: 'Weekly Report Card',        desc: 'Your consistency score and grade across every tracked habit, every week.' },
  { img: '/features/community-rooms.jpeg',         title: 'Community Rooms',           desc: 'Private group rooms with levels, streaks, and a leaderboard. Progress is more visible when others see it.' },
  { img: '/features/roots-curriculum.jpeg',        title: 'ROOTS Curriculum',          desc: 'The structured functional and nutritional medicine curriculum. Evidence-informed. Fully cited where the science is strong.' },
  { img: '/features/supplement-log.jpeg',          title: 'Supplement Log',            desc: 'Track your daily protocol. Know what you took and when.' },
  { img: '/features/movement-log.jpeg',            title: 'Movement Log',              desc: 'Log exercise with condition-specific education on why that movement matters for your metabolic patterns.' },
  { img: '/features/challenges-events.jpeg',       title: 'Challenges and Events',     desc: 'Community challenges with points, accountability, and recognition for showing up consistently.' },
  { img: '/features/progress-reports.jpeg',        title: 'Progress Reports',          desc: 'A clean, printable summary of your progress to bring to your own healthcare appointments.' },
]

const WHO_FOR = [
  'You have been told your numbers are "borderline" and sent home with no real next steps',
  'You are managing blood pressure or blood sugar and want to understand what actually drives them',
  'You take supplements and want to know if they are doing anything or how they interact with your medications',
  'You are tired of generic wellness advice with no mechanism explained',
  'You want to be an educated participant in your own care, not just a patient following orders',
  'You are working through a metabolic condition using lifestyle and want a structured framework',
  'You want functional and nutritional medicine education with the science cited behind it',
]

interface Tier {
  name: string
  tagline: string
  color: string
  monthly: string
  annual: string
  annualSavings: string
  stripeMonthly: keyof typeof STRIPE
  stripeAnnual: keyof typeof STRIPE
  features: string[]
  cta: string
  ctaStyle: 'primary' | 'gold' | 'secondary'
  popular?: boolean
  scarcity?: string
  oneTime?: boolean
}

const TIERS: Tier[] = [
  {
    name: 'The 6-Month VIP Functional Overhaul',
    tagline: 'For complex wellness goals. A highly tailored 6-month educational engagement.',
    color: '#c8a74b',
    monthly: '$4,997',
    annual: '$4,997',
    annualSavings: '',
    stripeMonthly: 'overhaul',
    stripeAnnual: 'overhaul',
    features: [
      '6 months of direct 1-on-1 educational engagement with Dr. Hunter',
      'You learn to build a fully individualized functional wellness roadmap tailored to your specific context',
      'You receive supplement and nutrition education specific to your history and goals',
      'Structured accountability and follow-through built into every session',
      'Full platform membership included for the entire 6 months',
    ],
    cta: 'Apply for the VIP Overhaul',
    ctaStyle: 'gold',
    scarcity: 'Limited to 3 active clients at any time.',
    oneTime: true,
  },
  {
    name: 'VIP: The Intensive',
    tagline: 'For members who want to move fast. Direct 1-on-1 attention and custom educational mapping.',
    color: '#0b9e8e',
    monthly: '$997',
    annual: '$9,970',
    annualSavings: 'Save $1,994',
    stripeMonthly: 'vip_monthly',
    stripeAnnual:  'vip_annual',
    features: [
      'Everything in The Program',
      '2x monthly private 1-on-1 educational sessions with Dr. Hunter',
      'A personalized ROOTS educational wellness roadmap built around your patterns and goals',
      'Direct 1-on-1 educator messaging with a 24-hour response guarantee',
    ],
    cta: 'Apply for VIP',
    ctaStyle: 'secondary',
    scarcity: 'Limited to 10 active seats.',
  },
  {
    name: 'The Program',
    tagline: 'For accountability-driven learners. Get group support, live access, and unlimited tools.',
    color: '#c8a74b',
    monthly: '$97',
    annual: '$797',
    annualSavings: 'Save $367',
    stripeMonthly: 'program_monthly',
    stripeAnnual:  'program_annual',
    features: [
      'Everything in Foundation, plus Unlimited AI Meal Guard',
      'Live monthly group education sessions with Dr. Hunter',
      'Weekly Pulse AI: your personalized weekly health education summary',
      'Private cohort room and monthly group challenges with recognition',
      'Priority access to all new classroom content',
    ],
    cta: 'Start The Program',
    ctaStyle: 'primary',
    popular: true,
  },
  {
    name: 'Foundation',
    tagline: 'The complete self-paced educational system. Learn the framework and track exactly what moves the needle.',
    color: '#91a0ac',
    monthly: '$37',
    annual: '$297',
    annualSavings: 'Save $147',
    stripeMonthly: 'foundation_monthly',
    stripeAnnual:  'foundation_annual',
    features: [
      'Full ROOTS curriculum with self-paced access to every lesson',
      'The VitaPlate AI Meal System (Smart recipe builder and 5 daily Meal Guard queries)',
      'The Metabolic Tracking Suite (BP, Blood Sugar, HOMA-IR, and Daily Command Center)',
      'Weekly Report Card to track your educational consistency',
      'Full access to the Community Feed, Leaderboard, and Challenges',
    ],
    cta: 'Start Foundation',
    ctaStyle: 'secondary',
  },
]

const ROOTS_STEPS = [
  { letter: 'R', name: 'Review',               hint: 'Start with your full picture',              color: '#e05c5c' },
  { letter: 'O', name: 'Optimize Nutrition',   hint: 'Food as education, personalized',            color: '#c8a74b' },
  { letter: 'O', name: 'Optimize Biochemistry',hint: 'Supplements and interactions',               color: '#0b9e8e' },
  { letter: 'T', name: 'Transform Lifestyle',  hint: 'Evidence-informed change',                   color: '#9b59b6' },
  { letter: 'S', name: 'Sustain and Adapt',    hint: 'Habits that hold for life',                  color: '#4be08a' },
]

const SYMPTOM_LIST = [
  { id: 'tired_meals',         label: 'Fatigue after meals or mid-afternoon crashes' },
  { id: 'sugar_cravings',      label: 'Strong cravings for sugar, bread, or starchy foods' },
  { id: 'hangry',              label: 'Irritability or shakiness when skipping a meal' },
  { id: 'belly_weight',        label: 'Difficulty losing weight, especially around the midsection' },
  { id: 'skin_changes',        label: 'Skin changes: tags, dark patches, or breakouts' },
  { id: 'poor_sleep',          label: 'Poor sleep or waking frequently during the night' },
  { id: 'mood_swings',         label: 'Mood swings or irritability throughout the day' },
  { id: 'elevated_bp',         label: 'Known elevated blood pressure readings' },
  { id: 'bloating',            label: 'Bloating or digestive discomfort after meals' },
  { id: 'energy_inconsistent', label: 'Inconsistent energy with no clear cause' },
]

// --- BP zone logic (AHA/ACC 2017) ---
function getBPZone(sys: number, dia: number): BPResult {
  if (sys > 180 || dia > 120) return {
    zone: 'Hypertensive Crisis', color: '#e05c5c',
    message: 'A reading this high warrants prompt attention from your healthcare provider.',
    elevating: ['Extreme stress or anxiety response', 'Missed or changed medication (consult your provider)', 'Severe sleep disruption', 'Very high sodium intake in the preceding hours'],
    supporting: ['Contacting your healthcare provider today', 'Sitting quietly and re-measuring in a few minutes', 'Avoiding stimulants while awaiting guidance'],
  }
  if (sys >= 140 || dia >= 90) return {
    zone: 'Stage 2 Hypertension', color: '#e05c5c',
    message: 'This range reflects consistent cardiovascular workload. Understanding the lifestyle patterns that contribute is an important educational step.',
    elevating: ['Consistently high sodium intake from processed or restaurant food', 'Chronic stress with limited recovery practices', 'Low physical activity levels', 'Poor sleep quality over weeks or months', 'Excess alcohol intake', 'Caffeine sensitivity in high-consumption individuals'],
    supporting: ['Consistent movement (150 or more minutes per week of moderate activity)', 'Reducing sodium to under 2,300 mg per day', '7 to 9 hours of quality sleep', 'Stress awareness and regular decompression practices', 'Measuring at the same time each day for accurate trend data'],
  }
  if (sys >= 130 || dia >= 80) return {
    zone: 'Stage 1 Hypertension', color: '#e08a4b',
    message: 'This range is where lifestyle factors show the most measurable influence. There is significant opportunity here.',
    elevating: ['Moderate-to-high sodium intake from packaged foods', 'Inconsistent sleep schedule', 'Sedentary periods during the day', 'Ongoing background stress', 'Caffeine timing close to readings', 'Low potassium intake'],
    supporting: ['Adding daily movement even in 10-minute blocks', 'Swapping packaged foods for whole-food options', 'Consistent sleep and wake times', 'Deep breathing or short stress breaks', 'Foods rich in potassium: leafy greens, bananas, sweet potatoes'],
  }
  if (sys >= 120 && dia < 80) return {
    zone: 'Elevated', color: '#c8a74b',
    message: 'Readings in this zone often reflect early lifestyle patterns beginning to influence cardiovascular function. Awareness now creates options.',
    elevating: ['Higher-than-average sodium intake', 'Irregular sleep schedule', 'Sedentary desk-heavy lifestyle', 'Unmanaged daily stress'],
    supporting: ['30 minutes of moderate movement most days', 'Consistent sleep timing', 'Whole-food meals with reduced sodium', 'Regular measurement at the same time each morning'],
  }
  return {
    zone: 'Normal', color: '#4be08a',
    message: 'Your reading is in the normal range. The habits that brought you here are worth understanding and protecting.',
    elevating: ['Acute stress or poor sleep on any given day can produce a higher one-time reading', 'Caffeine within 30 minutes of measurement', 'Rushing or physical activity before measuring'],
    supporting: ['Continue your current sleep, movement, and nutrition habits', 'Measuring consistently at the same time reinforces accurate trend tracking'],
  }
}

export default function LandingPage() {
  const [toolTab, setToolTab] = useState<ToolTab>('bp')
  const [billing, setBilling] = useState<BillingCycle>('monthly')

  const [bpSys, setBpSys] = useState('')
  const [bpDia, setBpDia] = useState('')
  const [bpResult, setBpResult] = useState<BPResult | null>(null)

  const [symptoms, setSymptoms] = useState<Set<string>>(new Set())
  const [symptomPatterns, setSymptomPatterns] = useState<string[] | null>(null)

  const [homaGlucose, setHomaGlucose] = useState('')
  const [homaInsulin, setHomaInsulin] = useState('')
  const [homaResult, setHomaResult] = useState<HomaResult | null>(null)

  const checkBP = () => {
    const sys = parseInt(bpSys)
    const dia = parseInt(bpDia)
    if (isNaN(sys) || isNaN(dia) || sys < 60 || dia < 40) return
    setBpResult(getBPZone(sys, dia))
  }

  const toggleSymptom = (id: string) => {
    setSymptoms(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const analyzeSymptoms = () => {
    if (symptoms.size === 0) {
      setSymptomPatterns(['Your self-reported symptom load appears low. The ROOTS Framework helps you build on what is already working and stay ahead of patterns before they develop.'])
      return
    }
    const energy    = ['tired_meals','sugar_cravings','hangry','energy_inconsistent'].filter(s => symptoms.has(s)).length
    const metabolic = ['belly_weight','elevated_bp'].filter(s => symptoms.has(s)).length
    const hormonal  = ['poor_sleep','mood_swings','skin_changes'].filter(s => symptoms.has(s)).length
    const digestive = symptoms.has('bloating') ? 1 : 0
    const patterns: string[] = []
    if (energy >= 2)            patterns.push('Blood sugar variability: Energy crashes, cravings, and irritability between meals are classic signals. Blood sugar regulation is one of the first areas the ROOTS curriculum addresses through nutrition education.')
    if (metabolic >= 1 && energy >= 1) patterns.push('Metabolic overlap: Weight retention and energy patterns often share a common root in how the body processes and stores fuel. The ROOTS curriculum addresses this overlap systematically.')
    if (hormonal >= 2)          patterns.push('Hormonal rhythm: Sleep quality, mood patterns, and skin changes are all influenced by the same hormonal signaling systems. When two or more appear together, they point toward a shared area worth exploring through education.')
    if (digestive >= 1)         patterns.push('Gut-energy connection: Digestive discomfort after meals can reflect how the gut microbiome, nutrient absorption, and overall energy production interact, a core topic in the ROOTS nutritional phase.')
    if (symptoms.has('elevated_bp')) patterns.push('Cardiovascular awareness: Elevated blood pressure is one of the most information-rich numbers in metabolic health. Understanding the lifestyle factors that influence it is a dedicated section of the ROOTS curriculum.')
    if (patterns.length === 0)  patterns.push('Your responses do not fit one dominant pattern. This could reflect a mixed picture or early-stage changes. The ROOTS Framework approaches metabolic health comprehensively, addressing each system in sequence.')
    setSymptomPatterns(patterns)
  }

  const calcHOMA = () => {
    const g = parseFloat(homaGlucose)
    const i = parseFloat(homaInsulin)
    if (isNaN(g) || isNaN(i) || g <= 0 || i <= 0) return
    const score = parseFloat(((g * i) / 405).toFixed(2))
    if (score < 1.0) {
      setHomaResult({ score, zone: 'Optimal Sensitivity', color: '#4be08a', context: 'Your cells are responding well to insulin signals. This is the range associated with efficient metabolic function. Tracking this over time helps you see how lifestyle changes affect your baseline.' })
    } else if (score < 2.0) {
      setHomaResult({ score, zone: 'Borderline', color: '#c8a74b', context: 'This score suggests early changes in insulin sensitivity. Lifestyle factors carry the most influence in this range, which is precisely what the ROOTS curriculum is built to address through education.' })
    } else {
      setHomaResult({ score, zone: 'Elevated Resistance', color: '#e05c5c', context: 'A score in this range is commonly seen alongside metabolic symptoms like fatigue, weight retention, and energy crashes. The ROOTS Framework directly addresses the lifestyle and nutrition factors that influence this marker.' })
    }
  }

  const scrollToTools   = () => document.getElementById('free-tools')?.scrollIntoView({ behavior: 'smooth' })
  const scrollToPricing = () => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })

  return (
    <div className={styles.page}>

      {/* Nav */}
      <nav className={styles.nav}>
        <Link to="/" className={styles.navBrand}>
          <img src="/logo-mark.png" alt="Hunter's Holistic Health emblem" className={styles.navLogoImg} />
          <span className={styles.navLogo}>Hunter's Holistic Health</span>
        </Link>
        <div className={styles.navLinks}>
          <Link to="/tools" className={styles.navLink}>Free Tools</Link>
          <Link to="/login" className={styles.navLink}>Sign In</Link>
          <button onClick={scrollToPricing} className={shared.btnPrimary}>See Pricing</button>
        </div>
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <img src="/logo-mark.png" alt="" aria-hidden="true" className={styles.heroLogo} />
        <div className={styles.heroBadge}>Functional and Nutritional Medicine Education</div>
        <h1 className={styles.heroTitle}>
          You have had the numbers for years.<br />
          <span className={styles.heroGold}>Nobody explained them. That changes now.</span>
        </h1>
        <p className={styles.heroSerif}>
          Root cause education. Evidence-informed. Built and taught by a Certified Functional and Nutritional Medicine Practitioner and PharmD.
        </p>
        <p className={styles.heroSubtitle}>
          Lasting health starts at the roots. Join the platform to stop guessing and finally understand what your body is telling you.
        </p>
        <div className={styles.heroActions}>
          <button onClick={scrollToPricing} className={shared.btnPrimary}>
            See Membership Options <ChevronRight size={18} />
          </button>
          <button onClick={scrollToTools} className={shared.btnGhost}>
            Try Free Tools <ChevronDown size={16} />
          </button>
        </div>
        <p className={styles.heroNote}>
          Educational platform only. Not medical advice. Individual results vary.
        </p>
      </section>

      {/* Trust strip */}
      <section className={styles.trustStrip}>
        <div className={styles.trustLabel}>Created and led by Dr. Shallanda Hunter</div>
        <span className={styles.trustChip}>CFNMP, Certified Functional and Nutritional Medicine Practitioner</span>
        <span className={styles.trustChip}>PharmD, Doctor of Pharmacy</span>
        <span className={styles.trustChip}>MBA</span>
        <span className={styles.trustChip}>Privacy-first design</span>
        <span className={styles.trustChip}>No ads. No data sales.</span>
      </section>

      {/* Free Tools */}
      <section className={styles.section} id="free-tools">
        <div className={styles.sectionKicker}>No Account Needed</div>
        <h2 className={styles.sectionTitle}>Three Free Education Tools</h2>
        <p className={styles.sectionSubtitle}>These tools give you educational context about your numbers. They are not a clinical assessment and do not replace your healthcare provider.</p>

        <div className={styles.toolTabs}>
          {([
            { id: 'bp',      label: 'Blood Pressure Check' },
            { id: 'symptom', label: 'Metabolic Pattern Check' },
            { id: 'homa',    label: 'Insulin Resistance Check' },
          ] as { id: ToolTab; label: string }[]).map(t => (
            <button
              key={t.id}
              className={toolTab === t.id ? styles.toolTabActive : styles.toolTab}
              onClick={() => setToolTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* BP Tool */}
        {toolTab === 'bp' && (
          <div className={styles.toolPanel}>
            <p className={styles.toolDesc}>Enter your most recent reading to see where it falls on the AHA scale and learn about the lifestyle factors that may be influencing it.</p>
            <div className={styles.bpInputRow}>
              <div className={styles.bpField}>
                <label className={styles.toolLabel}>Systolic (top number)</label>
                <input className={styles.toolInput} type="number" placeholder="e.g. 128"
                  value={bpSys} onChange={e => { setBpSys(e.target.value); setBpResult(null) }} min={60} max={250} />
              </div>
              <div className={styles.bpSlash}>/</div>
              <div className={styles.bpField}>
                <label className={styles.toolLabel}>Diastolic (bottom number)</label>
                <input className={styles.toolInput} type="number" placeholder="e.g. 82"
                  value={bpDia} onChange={e => { setBpDia(e.target.value); setBpResult(null) }} min={40} max={150} />
              </div>
              <button className={styles.toolBtn} onClick={checkBP}>Check My Reading</button>
            </div>
            {bpResult && (
              <>
              <div className={styles.toolResult}>
                <div className={styles.toolZoneBadge} style={{ background: `${bpResult.color}18`, border: `1px solid ${bpResult.color}40`, color: bpResult.color }}>
                  {bpResult.zone}
                </div>
                <p className={styles.toolResultMsg}>{bpResult.message}</p>
                <div className={styles.bpFactorCols}>
                  <div className={styles.bpFactorCol}>
                    <div className={styles.bpFactorHeader} style={{ color: '#e08a4b' }}>Factors that may elevate readings</div>
                    <ul className={styles.bpFactorList}>{bpResult.elevating.map(f => <li key={f}>{f}</li>)}</ul>
                  </div>
                  <div className={styles.bpFactorCol}>
                    <div className={styles.bpFactorHeader} style={{ color: '#4be08a' }}>Factors that may support healthier readings</div>
                    <ul className={styles.bpFactorList}>{bpResult.supporting.map(f => <li key={f}>{f}</li>)}</ul>
                  </div>
                </div>
                <p className={styles.toolCTAText}>Now see how your everyday choices move this number:</p>
              </div>
              <BPSimulatorWidget initialSys={+bpSys} initialDia={+bpDia} showFooter={false} />
              </>
            )}
          </div>
        )}

        {/* Symptom Tool */}
        {toolTab === 'symptom' && (
          <div className={styles.toolPanel}>
            <p className={styles.toolDesc}>Check all that currently apply to you. Your selections identify educational patterns, not clinical findings.</p>
            <div className={styles.symptomGrid}>
              {SYMPTOM_LIST.map(s => (
                <label key={s.id} className={`${styles.symptomCheck} ${symptoms.has(s.id) ? styles.symptomCheckActive : ''}`}>
                  <input type="checkbox" checked={symptoms.has(s.id)} onChange={() => toggleSymptom(s.id)} className={styles.symptomCheckInput} />
                  {s.label}
                </label>
              ))}
            </div>
            <button className={styles.toolBtn} onClick={analyzeSymptoms}>Analyze My Patterns</button>
            {symptomPatterns && (
              <div className={styles.toolResult}>
                <div className={styles.symptomResultLabel}>Patterns identified in your responses:</div>
                {symptomPatterns.map((p, i) => (
                  <div key={i} className={styles.symptomPattern}>
                    <div className={styles.symptomPatternDot} />
                    <p>{p}</p>
                  </div>
                ))}
                <p className={styles.toolDisclaimer}>These patterns are for educational awareness only. This is not a clinical assessment. Discuss any health concerns with your licensed healthcare provider.</p>
                <div className={styles.toolCTA}>
                  <p className={styles.toolCTAText}>The ROOTS Framework addresses each of these patterns through structured education.</p>
                  <button onClick={scrollToPricing} className={shared.btnPrimary}>
                    See Membership Options <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* HOMA-IR Tool */}
        {toolTab === 'homa' && (
          <div className={styles.toolPanel}>
            <p className={styles.toolDesc}>The HOMA-IR score estimates insulin sensitivity using two fasting lab values. You will need a recent blood panel that includes fasting glucose and fasting insulin.</p>
            <div className={styles.homaInputRow}>
              <div className={styles.homaField}>
                <label className={styles.toolLabel}>Fasting Glucose (mg/dL)</label>
                <input className={styles.toolInput} type="number" placeholder="e.g. 95"
                  value={homaGlucose} onChange={e => { setHomaGlucose(e.target.value); setHomaResult(null) }} min={40} max={600} />
              </div>
              <div className={styles.homaField}>
                <label className={styles.toolLabel}>Fasting Insulin (uIU/mL)</label>
                <input className={styles.toolInput} type="number" placeholder="e.g. 8"
                  value={homaInsulin} onChange={e => { setHomaInsulin(e.target.value); setHomaResult(null) }} min={1} max={300} />
              </div>
              <button className={styles.toolBtn} onClick={calcHOMA}>Calculate Score</button>
            </div>
            {homaResult && (
              <div className={styles.toolResult}>
                <div className={styles.homaScore}>
                  <span className={styles.homaScoreVal} style={{ color: homaResult.color }}>{homaResult.score}</span>
                  <span className={styles.homaScoreLabel}>HOMA-IR</span>
                </div>
                <div className={styles.toolZoneBadge} style={{ background: `${homaResult.color}18`, border: `1px solid ${homaResult.color}40`, color: homaResult.color }}>
                  {homaResult.zone}
                </div>
                <p className={styles.toolResultMsg}>{homaResult.context}</p>
                <div className={styles.homaScale}>
                  <div className={styles.homaScaleBar}>
                    <div className={styles.homaScaleSeg} style={{ background: '#4be08a' }}>Under 1.0</div>
                    <div className={styles.homaScaleSeg} style={{ background: '#c8a74b' }}>1.0 to 1.9</div>
                    <div className={styles.homaScaleSeg} style={{ background: '#e05c5c' }}>2.0 and above</div>
                  </div>
                  <div className={styles.homaScaleLabels}>
                    <span>Optimal</span><span>Borderline</span><span>Elevated</span>
                  </div>
                </div>
                <p className={styles.toolDisclaimer}>HOMA-IR is an estimation tool based on published formulas. It is not a clinical assessment. Discuss your lab values with your healthcare provider before drawing conclusions.</p>
                <div className={styles.toolCTA}>
                  <p className={styles.toolCTAText}>Track your metabolic markers over time and learn the lifestyle factors that influence insulin sensitivity in the ROOTS curriculum.</p>
                  <button onClick={scrollToPricing} className={shared.btnPrimary}>
                    See Membership Options <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Who This Is For */}
      <section className={styles.sectionDark}>
        <div className={styles.sectionKicker}>Is This For You?</div>
        <h2 className={styles.sectionTitle}>This platform was built for a specific person.</h2>
        <p className={styles.sectionSubtitle}>If any of these sound like you, you are in the right place.</p>
        <div className={styles.whoGrid}>
          {WHO_FOR.map((item, i) => (
            <div key={i} className={styles.whoItem}>
              <CheckCircle size={16} className={styles.whoCheck} />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ROOTS Framework */}
      <section className={styles.section}>
        <div className={styles.sectionKicker}>The Method</div>
        <h2 className={styles.sectionTitle}>The ROOTS Framework</h2>
        <p className={styles.sectionSubtitle}>Five phases. A structured path through functional and nutritional medicine education. Evidence-informed at every step.</p>
        <div className={styles.rootsBand}>
          {ROOTS_STEPS.map(({ letter, name, hint, color }, i) => (
            <div key={name + i} className={styles.rootsTile} style={{ '--roots-color': color } as React.CSSProperties}>
              <div className={styles.rootsLetter}>{letter}</div>
              <div className={styles.rootsName}>{name}</div>
              <div className={styles.rootsHint}>{hint}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className={styles.section}>
        <div className={styles.sectionKicker}>The Toolkit</div>
        <h2 className={styles.sectionTitle}>Every tool you need to track, learn, and understand.</h2>
        <p className={styles.sectionSubtitle}>Built for functional and nutritional medicine education participants. Not generic wellness. Specific and purposeful.</p>
        <div className={styles.featuresGrid}>
          {FEATURES.map(({ img, title, desc }) => (
            <div key={title} className={styles.featureCard}>
              <img src={img} alt={title} className={styles.featureImg} />
              <h3 className={styles.featureTitle}>{title}</h3>
              <p className={styles.featureDesc}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Origin Story */}
      <section className={styles.sectionDark}>
        <div className={styles.originBlock}>
          <div className={styles.sectionKicker}>Why This Exists</div>
          <h2 className={styles.sectionTitle}>Dr. Hunter reversed her own metabolic condition using functional medicine when conventional answers were not coming.</h2>
          <p className={styles.originText}>
            She is a licensed pharmacist with a PharmD and an MBA. She is a Certified Functional and Nutritional Medicine Practitioner. She built this platform because the education she needed did not exist in one place.
          </p>
          <p className={styles.originText}>
            The ROOTS framework is the system she built for herself, formalized and delivered to you. Every module, every tool, every recommendation has been reviewed through both lenses: the functional and nutritional medicine framework and the PharmD training that ensures the science behind it is read correctly.
          </p>
          <p className={styles.originText}>
            Where the research is strong, you will see the citation. Where evidence is emerging or traditional, that is stated honestly. That transparency is not a weakness. It is the standard.
          </p>
        </div>
      </section>

      {/* Privacy */}
      <section className={styles.section}>
        <div className={styles.privacyBand}>
          <div className={styles.privacyBandInner}>
            <h2 className={styles.privacyTitle}>Privacy Is the Architecture, Not a Setting</h2>
            <p className={styles.privacySerif}>Most health apps collect everything. This one was built not to.</p>
            <ul className={styles.privacyPoints}>
              <li>Age only, never your date of birth</li>
              <li>No ads, no trackers, no data sales</li>
              <li>AI never sees identified health records</li>
              <li>One-click account deletion</li>
            </ul>
            <Link to="/privacy-scorecard" className={shared.btnSecondary}>
              See the Privacy Scorecard <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className={styles.section} id="pricing">
        <div className={styles.sectionKicker}>Membership</div>
        <h2 className={styles.sectionTitle}>Choose Your Track</h2>
        <p className={styles.sectionSubtitle}>Monthly or annual. Cancel monthly plans anytime. Annual plans are non-refundable after 14 days; pause up to 3 months.</p>

        {/* Billing toggle */}
        <div className={styles.billingToggle}>
          <button
            className={billing === 'monthly' ? styles.billingBtnActive : styles.billingBtn}
            onClick={() => setBilling('monthly')}
          >
            Monthly
          </button>
          <button
            className={billing === 'annual' ? styles.billingBtnActive : styles.billingBtn}
            onClick={() => setBilling('annual')}
          >
            Annual <span className={styles.billingSavePill}>Save up to $1,994</span>
          </button>
        </div>

        <div className={styles.pricingGrid}>
          {TIERS.map((tier) => (
            <div key={tier.name} className={tier.popular ? styles.pricingCardFeatured : styles.pricingCard}>
              {tier.popular && <div className={styles.pricingBadge}>Most Popular</div>}
              {tier.scarcity && <div className={styles.pricingScarcity}>{tier.scarcity}</div>}
              <div className={styles.pricingName} style={{ color: tier.color }}>{tier.name}</div>
              <p className={styles.pricingTagline}>{tier.tagline}</p>
              <div className={styles.pricingPrice}>
                {tier.oneTime ? tier.monthly : (billing === 'monthly' ? tier.monthly : tier.annual)}
                {!tier.oneTime && <span className={styles.pricingPeriod}>{billing === 'monthly' ? '/mo' : '/yr'}</span>}
              </div>
              {!tier.oneTime && billing === 'annual' && tier.annualSavings && (
                <div className={styles.pricingAnnualSave}>{tier.annualSavings}</div>
              )}
              <ul className={styles.pricingFeatures}>
                {tier.features.map(f => (
                  <li key={f}>
                    <span className={styles.pricingCheck} style={{ color: tier.color }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              {tier.oneTime ? (
                <Link to="/clinical-inquiry" className={`${shared.btnTeal} ${shared.btnFull}`}>
                  {tier.cta} <ChevronRight size={16} />
                </Link>
              ) : STRIPE[billing === 'monthly' ? tier.stripeMonthly : tier.stripeAnnual] ? (
                <a
                  href={checkoutUrl(billing === 'monthly' ? tier.stripeMonthly : tier.stripeAnnual)}
                  className={`${tier.popular ? shared.btnPrimary : shared.btnSecondary} ${shared.btnFull}`}
                >
                  {tier.cta}
                </a>
              ) : (
                <Link to="/join" className={`${tier.popular ? shared.btnPrimary : shared.btnSecondary} ${shared.btnFull}`}>
                  {tier.cta}
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Quality Promise */}
        <div className={styles.qualityBlock}>
          <div className={styles.qualityTitle}>The Standard</div>
          <p className={styles.qualityText}>
            This curriculum is built on functional and nutritional medicine principles. Where strong research supports a recommendation, you will see the citation. Where evidence is emerging or traditional, that is stated honestly. The functional and nutritional medicine framework is the lens. The PharmD training is what ensures the science is read correctly.
          </p>
          <p className={styles.qualityText}>
            Monthly memberships: cancel anytime from Settings. Annual memberships: non-refundable after 14 days from purchase. Pause your annual membership for up to 3 months if you need a break.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className={styles.ctaBand}>
        <div className={styles.ctaBandFrame}>
          <div className={styles.ctaBandInner}>
            <img src="/logo-mark.png" alt="" aria-hidden="true" className={styles.ctaEmblem} />
            <h2 className={styles.ctaTitle}>Lasting health starts at the roots.</h2>
            <p className={styles.ctaText}>
              Join the platform to stop guessing and finally understand what your body is telling you.
            </p>
            <div className={styles.ctaActions}>
              <button onClick={scrollToPricing} className={shared.btnPrimary}>
                See Membership Options <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className={styles.disclaimer}>
        <div className={styles.disclaimerInner}>
          <div className={styles.disclaimerTitle}>Important Disclaimer</div>
          <p className={styles.disclaimerText}>
            Hunter's Holistic Health is an educational platform operated by Dr. Shallanda Hunter, CFNMP, PharmD in her capacity as a Certified Functional and Nutritional Medicine Practitioner and Functional Medicine Educator. Nothing on this platform constitutes medical advice, diagnosis, or treatment. The free tools on this page are for educational pattern awareness only. Individual results vary. Always consult your licensed healthcare provider before making changes to your health regimen.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <img src="/logo-mark.png" alt="" aria-hidden="true" className={styles.footerEmblem} />
        <div className={styles.footerLinks}>
          <Link to="/tools" className={styles.footerLink}>Free Tools</Link>
          <Link to="/shop" className={styles.footerLink}>Shop</Link>
          <Link to="/join" className={styles.footerLink}>Join</Link>
          <Link to="/support" className={styles.footerLink}>Support</Link>
          <Link to="/feature-request" className={styles.footerLink}>Request a Feature</Link>
          <Link to="/clinical-inquiry" className={styles.footerLink}>Clinical Inquiry</Link>
          <Link to="/terms" className={styles.footerLink}>Terms of Service</Link>
          <Link to="/privacy" className={styles.footerLink}>Privacy Policy</Link>
          <Link to="/privacy-scorecard" className={styles.footerLink}>Privacy Scorecard</Link>
        </div>
        <p className={styles.footerCopy}>© {new Date().getFullYear()} Hunter's Holistic Health. Dr. Shallanda Hunter, CFNMP, PharmD. All rights reserved.</p>
      </footer>

    </div>
  )
}
