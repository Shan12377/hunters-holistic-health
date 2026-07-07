import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BPSimulatorWidget } from './BPSimulatorPage'
import HormoneCyclePreview from '../components/ui/HormoneCyclePreview'
import HeroParticles from '../components/HeroParticles'
import { Shield, Award, Users, BookOpen, Pill, Activity, Heart, ChevronRight, ExternalLink, ChevronDown, CheckCircle, Dumbbell, Zap } from 'lucide-react'
import styles from './LandingPage.module.css'
import shared from '../styles/shared.module.css'

// --- Types ---
type ToolTab = 'bp' | 'glucose' | 'symptom' | 'waist' | 'hormone'
type BillingCycle = 'monthly' | 'annual'

interface BPResult {
  zone: string
  color: string
  message: string
  elevating: string[]
  supporting: string[]
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

const WHO_FOR_PERSONAS = [
  {
    emoji: '👩🏾',
    name: 'Denise, 47',
    location: 'Atlanta, GA',
    scenario: 'Her doctor said "borderline hypertensive" and handed her a pamphlet. She left with no idea what to actually do next.',
  },
  {
    emoji: '👩🏽',
    name: 'Carmen, 53',
    location: 'Miami, FL',
    scenario: 'Managing blood sugar with two medications. She wants to understand what is driving her numbers, not just chase them.',
  },
  {
    emoji: '👨🏾',
    name: 'Marcus, 44',
    location: 'Houston, TX',
    scenario: 'Takes 11 supplements and has no idea which ones actually work or how they interact with his prescriptions.',
  },
  {
    emoji: '👩🏻',
    name: 'Sarah, 41',
    location: 'Chicago, IL',
    scenario: '"Borderline everything." Every appointment ends the same way. She is done waiting for a diagnosis to get serious.',
  },
  {
    emoji: '👨🏽',
    name: 'Raj, 50',
    location: 'Dallas, TX',
    scenario: 'Family history of metabolic disease. He wants a structured, evidence-informed framework before a diagnosis finds him.',
  },
  {
    emoji: '👩🏿',
    name: 'Nia, 36',
    location: 'Brooklyn, NY',
    scenario: 'Tired of generic wellness advice with no science behind it. Ready for education that actually explains the mechanism.',
  },
]

interface Bonus {
  name: string
  kills: string
  description: string
  disclaimer?: string
}

interface Tier {
  name: string
  tagline: string
  color: string
  monthly: string
  annual: string
  annualSavings: string
  stripeMonthly: keyof typeof STRIPE
  stripeAnnual: keyof typeof STRIPE
  core: string[]
  bonuses: Bonus[]
  timeToWin: string
  valueAnchor?: string
  cta: string
  popular?: boolean
  scarcity?: string
  oneTime?: boolean
  riskReversal: string
}

const TIERS: Tier[] = [
  {
    name: 'The 6-Month Functional Overhaul',
    tagline: '"Everything mapped, together."',
    color: '#c8a74b',
    monthly: '$4,997',
    annual: '$4,997',
    annualSavings: '',
    stripeMonthly: 'overhaul',
    stripeAnnual: 'overhaul',
    core: [
      '6 months of direct 1-on-1 educational engagement with Dr. Hunter',
      'A fully individualized functional wellness roadmap built for your goals',
      'Supplement and nutrition education specific to your history',
      'Structured accountability and follow-through in every session',
      'Full platform membership included for the entire 6 months',
    ],
    bonuses: [
      {
        name: 'Alumni Status',
        kills: 'What happens when it ends',
        description: 'Keep full Program access for 6 months after your Overhaul completes.',
      },
    ],
    timeToWin: 'Week 1 — you leave your first session with the plan in hand',
    cta: 'Apply for the Overhaul',
    scarcity: 'Limited to 3 active clients. A real waitlist forms when full.',
    oneTime: true,
    riskReversal: 'Application required. Scope and timeline are defined before you commit.',
  },
  {
    name: 'VIP: The Intensive',
    tagline: '"Her eyes on my situation, not a group\'s."',
    color: '#0b9e8e',
    monthly: '$997',
    annual: '$9,970',
    annualSavings: 'Save $1,994',
    stripeMonthly: 'vip_monthly',
    stripeAnnual: 'vip_annual',
    core: [
      'Everything in The Program',
      '2x monthly private 1-on-1 educational sessions with Dr. Hunter',
      'A personalized ROOTS educational roadmap built around your patterns and goals',
      'Direct educator messaging with a 24-hour response guarantee',
    ],
    bonuses: [
      {
        name: 'The Roadmap Session',
        kills: 'Not knowing where to start',
        description: 'Your first session builds your complete educational roadmap. You leave session one with the plan.',
      },
    ],
    timeToWin: 'Session 1 — your roadmap is complete before you leave',
    valueAnchor: 'A single 1-on-1 functional medicine session elsewhere runs $250. You get two per month here, plus everything in The Program.',
    cta: 'Apply for VIP',
    scarcity: 'By application only.',
    riskReversal: 'Application required. Accepted only when it is a genuine fit.',
  },
  {
    name: 'The Program',
    tagline: '"I stayed consistent. For the first time."',
    color: '#c8a74b',
    monthly: '$97',
    annual: '$797',
    annualSavings: 'Save $367',
    stripeMonthly: 'program_monthly',
    stripeAnnual: 'program_annual',
    core: [
      'Everything in Foundation, plus Unlimited AI Meal Guard',
      'Live monthly group education sessions with Dr. Hunter',
      'Weekly Pulse AI: your personalized health education summary',
      'Private cohort room and monthly challenges with recognition',
      'Priority access to all new classroom content',
    ],
    bonuses: [
      {
        name: 'The Session Vault',
        kills: 'Missing the live session',
        description: 'Every past recording, searchable anytime.',
      },
      {
        name: 'First-Week Momentum Call',
        kills: 'Getting lost on day one',
        description: 'One group onboarding session for new Program members each month.',
      },
      {
        name: 'The Ask-It Box',
        kills: 'Your question never getting picked',
        description: 'Submit one question per month, guaranteed to be answered in the live session.',
      },
    ],
    timeToWin: 'Your first live session',
    valueAnchor: 'A single 1-on-1 educational session runs $250. The Program gives you live group access every month for $97.',
    cta: 'Start My Program',
    popular: true,
    riskReversal: 'Cancel in two clicks from Settings. No emails, no phone calls, no guilt.',
  },
  {
    name: 'Foundation',
    tagline: '"Now I understand what my body has been telling me."',
    color: '#91a0ac',
    monthly: '$37',
    annual: '$297',
    annualSavings: 'Save $147',
    stripeMonthly: 'foundation_monthly',
    stripeAnnual: 'foundation_annual',
    core: [
      'The full ROOTS curriculum, self-paced',
      'VitaPlate AI Meal System (smart recipe builder + 5 daily Meal Guard queries)',
      'Metabolic Tracking Suite: BP, Blood Sugar, HOMA-IR, Daily Command Center',
      'Weekly Report Card to track your educational consistency',
      'Full Community Feed, Leaderboard, and Challenges',
    ],
    bonuses: [
      {
        name: 'Supplement Safety Starter',
        kills: 'Not knowing if your current stack is safe',
        description: 'PharmD educator-designed guide to common supplement and medication interactions.',
        disclaimer: 'These statements have not been evaluated by the Food and Drug Administration. This is not intended to diagnose, treat, cure, or prevent any disease.',
      },
      {
        name: 'The 30-Day Consistency Challenge',
        kills: 'Never sticking with anything long enough',
        description: 'Structured first-month challenge with points and leaderboard recognition.',
      },
      {
        name: 'The Pattern-to-Lesson Map',
        kills: 'Not knowing where to start in the curriculum',
        description: 'Your tool results map to the exact ROOTS lessons to begin with.',
      },
    ],
    timeToWin: 'Day 1 — the Pattern Map tells you exactly where to start',
    cta: 'Start My Foundation',
    riskReversal: 'Cancel in two clicks from Settings. No emails, no phone calls, no guilt.',
  },
]

const ROOTS_STEPS = [
  { letter: 'R', name: 'Review',               hint: 'Start with your full picture',              color: '#e05c5c' },
  { letter: 'O', name: 'Optimize Nutrition',   hint: 'Food as education, personalized',            color: '#c8a74b' },
  { letter: 'O', name: 'Optimize Biochemistry',hint: 'Supplements and interactions',               color: '#0b9e8e' },
  { letter: 'T', name: 'Transform Lifestyle',  hint: 'Evidence-informed change',                   color: '#9b59b6' },
  { letter: 'S', name: 'Sustain and Adapt',    hint: 'Habits that hold for life',                  color: '#4be08a' },
]

const PATTERN_QUESTIONS = [
  { id: 'q1', text: 'Do you feel sleepy or sluggish 1-2 hours after a carb-heavy meal?' },
  { id: 'q2', text: 'Do you get strong cravings for sweets or starchy foods, especially in the afternoon?' },
  { id: 'q3', text: 'Do you carry most of your extra weight around your belly rather than hips or thighs?' },
  { id: 'q4', text: 'Do you feel shaky, irritable, or hungry if you go more than 3-4 hours without eating?' },
  { id: 'q5', text: 'Do you experience brain fog or difficulty concentrating that was not always there?' },
  { id: 'q6', text: 'Do you have skin tags or dark, velvety patches on your neck, underarms, or skin folds?' },
  { id: 'q7', text: 'Do you feel persistently tired even when you get enough sleep?' },
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

const LANDING_META_TITLE = "Hunter's Holistic Health | Functional Medicine Education"
const LANDING_META_DESC = 'Evidence-informed functional medicine education. Track your metabolic health, implement the ROOTS Framework, and understand your numbers with Dr. Shallanda Hunter, CFNMP.'

function LandingMetaTags() {
  if (typeof document === 'undefined') return null
  document.title = LANDING_META_TITLE
  function setMeta(name: string, content: string, prop?: boolean) {
    const attr = prop ? 'property' : 'name'
    let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null
    if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el) }
    el.content = content
  }
  setMeta('description', LANDING_META_DESC)
  setMeta('og:title', LANDING_META_TITLE, true)
  setMeta('og:description', LANDING_META_DESC, true)
  setMeta('og:type', 'website', true)
  setMeta('og:url', 'https://www.huntersholistichealth.com/', true)
  setMeta('twitter:card', 'summary_large_image')
  setMeta('twitter:title', LANDING_META_TITLE)
  setMeta('twitter:description', LANDING_META_DESC)
  let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
  if (!canonical) { canonical = document.createElement('link'); canonical.setAttribute('rel', 'canonical'); document.head.appendChild(canonical) }
  canonical.href = 'https://www.huntersholistichealth.com/'
  return null
}

export default function LandingPage() {
  const [toolTab, setToolTab] = useState<ToolTab>('bp')
  const [billing, setBilling] = useState<BillingCycle>('monthly')

  const [patternAnswers, setPatternAnswers] = useState<Record<string, number>>({})
  const [patternResult, setPatternResult] = useState<{ score: number; level: 'low' | 'moderate' | 'high'; msg: string } | null>(null)

  const [glucoseVal, setGlucoseVal] = useState('')
  const [glucoseCtx, setGlucoseCtx] = useState<'fasting' | 'pre_meal' | 'post_meal' | 'bedtime'>('fasting')
  const [glucoseResult, setGlucoseResult] = useState<{ zone: string; color: string; msg: string; tip: string } | null>(null)

  const [waistVal, setWaistVal] = useState('')
  const [heightVal, setHeightVal] = useState('')
  const [waistUnit, setWaistUnit] = useState<'in' | 'cm'>('in')
  const [waistResult, setWaistResult] = useState<{ ratio: number; zone: string; color: string; msg: string } | null>(null)

  const [emailCapture, setEmailCapture] = useState('')
  const [emailSubmitting, setEmailSubmitting] = useState(false)
  const [emailSubmitted, setEmailSubmitted] = useState(false)
  const [showAllFeatures, setShowAllFeatures] = useState(false)

  const setPatternAnswer = (qid: string, val: number) => {
    setPatternAnswers(prev => ({ ...prev, [qid]: val }))
    setPatternResult(null)
  }

  const analyzePattern = () => {
    if (Object.keys(patternAnswers).length < 7) return
    const score = Object.values(patternAnswers).reduce((a, b) => a + b, 0)
    if (score <= 4) {
      setPatternResult({ score, level: 'low', msg: 'Few recognizable patterns are present. Your metabolic signaling appears relatively stable based on these responses. The ROOTS Framework helps you maintain and protect what is working.' })
    } else if (score <= 9) {
      setPatternResult({ score, level: 'moderate', msg: 'Several patterns associated with metabolic dysfunction are present. This combination often reflects blood sugar variability and early insulin signaling changes. These patterns are the starting point of the ROOTS curriculum.' })
    } else {
      setPatternResult({ score, level: 'high', msg: 'Multiple patterns strongly associated with insulin resistance are present together. This combination, including energy crashes, cravings, and persistent fatigue, is one of the most common presentations addressed through the ROOTS Framework.' })
    }
  }

  const checkGlucose = () => {
    const g = parseFloat(glucoseVal)
    if (isNaN(g) || g <= 0) return
    if (glucoseCtx === 'fasting') {
      if (g < 100)  setGlucoseResult({ zone: 'Optimal (Fasting)', color: '#4be08a', msg: 'A fasting glucose below 100 mg/dL reflects healthy insulin signaling. Cells are responding well to insulin, allowing efficient glucose uptake overnight.', tip: 'Protect this range by maintaining a consistent overnight fast of 10-12 hours and avoiding late-night eating.' })
      else if (g < 126) setGlucoseResult({ zone: 'Borderline (Fasting)', color: '#c8a74b', msg: 'A fasting glucose in this range places you in the prediabetes category per ADA guidelines. It signals that insulin sensitivity is under strain. Lifestyle factors carry the most influence here.', tip: 'A 10-minute walk after dinner each night lowers fasting glucose the next morning by improving insulin sensitivity overnight.' })
      else          setGlucoseResult({ zone: 'Elevated (Fasting)', color: '#e05c5c', msg: 'A fasting glucose at or above 126 mg/dL meets the ADA threshold for diabetes. This is important information to bring to your healthcare provider for proper evaluation.', tip: 'Bring this reading to your healthcare provider. Lifestyle changes have significant impact even at this range.' })
    } else if (glucoseCtx === 'pre_meal') {
      if (g < 100)  setGlucoseResult({ zone: 'Optimal (Pre-Meal)', color: '#4be08a', msg: 'A pre-meal glucose below 100 mg/dL shows your body is clearing glucose effectively between meals.', tip: 'Eating meals with protein and fiber first helps maintain this pattern by slowing glucose absorption.' })
      else if (g <= 130) setGlucoseResult({ zone: 'Borderline (Pre-Meal)', color: '#c8a74b', msg: 'A pre-meal reading above 100 suggests glucose is not clearing fully between meals. This is often an early sign of insulin resistance.', tip: 'Low-carbohydrate meals and consistent meal timing support better glucose clearance between eating windows.' })
      else          setGlucoseResult({ zone: 'Elevated (Pre-Meal)', color: '#e05c5c', msg: 'A pre-meal reading this high suggests significant carryover glucose or impaired fasting glucose. Share this with your healthcare provider.', tip: 'Discuss this reading with your healthcare provider. This level warrants further evaluation.' })
    } else if (glucoseCtx === 'post_meal') {
      if (g < 140)  setGlucoseResult({ zone: 'Optimal (2hr Post-Meal)', color: '#4be08a', msg: 'Below 140 mg/dL two hours after eating is the standard of optimal post-meal glucose clearance per ADA guidelines. Your body is processing the meal efficiently.', tip: 'A 10-minute walk after meals reduces post-meal glucose spikes by 20-30% on average.' })
      else if (g < 200) setGlucoseResult({ zone: 'Borderline (2hr Post-Meal)', color: '#c8a74b', msg: 'A post-meal reading between 140-199 mg/dL at two hours is classified as impaired glucose tolerance. Meal composition and post-meal movement have the most direct impact here.', tip: 'Try eating in this order at your next carb-heavy meal: vegetables first, protein second, carbohydrates last. This sequence can reduce the post-meal spike by up to 30%.' })
      else          setGlucoseResult({ zone: 'Elevated (2hr Post-Meal)', color: '#e05c5c', msg: 'A two-hour post-meal reading above 200 mg/dL meets the ADA threshold for diabetes diagnosis. This pattern is important to discuss with your healthcare provider.', tip: 'Share this reading with your healthcare provider. Post-meal glucose this high reflects significant impairment in glucose disposal.' })
    } else {
      if (g >= 90 && g <= 150) setGlucoseResult({ zone: 'Optimal (Bedtime)', color: '#4be08a', msg: 'A bedtime glucose in the 90-150 mg/dL range is generally considered a safe and metabolically stable range going into sleep.', tip: 'Avoid eating within 2-3 hours of bedtime. This supports overnight metabolic repair and healthy fasting glucose the next morning.' })
      else if (g < 90) setGlucoseResult({ zone: 'Low (Bedtime)', color: '#c8a74b', msg: 'A bedtime glucose below 90 mg/dL may be worth noting, especially if you experience nighttime waking. Some individuals experience overnight lows that disrupt sleep quality.', tip: 'If you regularly feel unrefreshed after sleep, discuss nighttime glucose patterns with your healthcare provider.' })
      else             setGlucoseResult({ zone: 'Elevated (Bedtime)', color: '#e05c5c', msg: 'A bedtime glucose above 150 mg/dL suggests the previous meal or day\'s eating pattern is still affecting glucose levels going into sleep. This can impair overnight metabolic recovery.', tip: 'Avoid carbohydrate-heavy meals within 3 hours of bed. A short walk after your last meal supports better overnight clearance.' })
    }
  }

  const checkWaist = () => {
    const w = parseFloat(waistVal)
    const h = parseFloat(heightVal)
    if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) return
    const ratio = w / h
    const ratioStr = ratio.toFixed(2)
    if (ratio < 0.5) {
      setWaistResult({ ratio, zone: 'Optimal', color: '#4be08a', msg: `A waist-to-height ratio of ${ratioStr} falls in the optimal range. Research published in Nature Reviews Endocrinology identifies WHtR below 0.5 as the zone associated with the lowest cardiometabolic risk. Your central fat distribution is not elevating your metabolic risk profile at this reading.` })
    } else if (ratio < 0.6) {
      setWaistResult({ ratio, zone: 'Elevated', color: '#c8a74b', msg: `A waist-to-height ratio of ${ratioStr} is in the elevated range. This zone is associated with increased visceral fat, which sits around the organs and is metabolically active in a way that subcutaneous fat is not. Visceral fat signals inflammation and insulin resistance earlier than BMI shows it.` })
    } else {
      setWaistResult({ ratio, zone: 'High', color: '#e05c5c', msg: `A waist-to-height ratio of ${ratioStr} is in the high-risk range for cardiometabolic disease. The research is consistent: central adiposity at this level is a stronger predictor of insulin resistance and metabolic syndrome than BMI. This is meaningful information to bring to a functional medicine conversation.` })
    }
  }

  const scrollToTools   = () => document.getElementById('free-tools')?.scrollIntoView({ behavior: 'smooth' })
  const scrollToPricing = () => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const delay = (entry.target as HTMLElement).dataset.delay || '0'
            setTimeout(() => entry.target.classList.add(styles.visible), parseInt(delay))
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -32px 0px' }
    )
    document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const submitEmailCapture = async () => {
    const email = emailCapture.trim()
    if (!email || !email.includes('@')) return
    setEmailSubmitting(true)
    try {
      const webhookUrl = import.meta.env.VITE_NEWSLETTER_WEBHOOK_URL || import.meta.env.VITE_N8N_WEBHOOK_URL
      if (webhookUrl) {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Secret': import.meta.env.VITE_N8N_WEBHOOK_SECRET || '',
          },
          body: JSON.stringify({ submissionType: 'newsletter', email }),
        })
      }
      setEmailSubmitted(true)
      setEmailCapture('')
    } catch {
      setEmailSubmitted(true)
    } finally {
      setEmailSubmitting(false)
    }
  }

  return (
    <div className={styles.page}>
      <LandingMetaTags />

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
        <HeroParticles />
        <img src="/dr-hunter-closer.jpg" className={styles.heroBgPhoto} aria-hidden="true" alt="" />
        <div className={styles.heroContent}>
          <div className={styles.heroDrPhotoWrap}>
            <span className={styles.heroRing} aria-hidden="true" />
            <span className={styles.heroRing2} aria-hidden="true" />
            <span className={styles.heroRing3} aria-hidden="true" />
            <img
              src="/S.HProfessionalBusinessPic.jpg"
              alt="Dr. Shallanda Hunter, CFNMP, PharmD — Functional Medicine Educator"
              className={styles.heroDrPhoto}
            />
          </div>
          <div className={styles.heroBadge}>Functional and Nutritional Medicine Education</div>
          <h1 className={styles.heroTitle}>
            You have had the numbers for years.<br />
            <span className={styles.heroGold}>Nobody explained them. That changes now.</span>
          </h1>
          <p className={styles.heroSerif}>
            Root cause education through the 5-phase ROOTS™ Framework. Built and taught by a PharmD and CFNMP who reversed her own metabolic condition.
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
        </div>
      </section>

      {/* Trust strip */}
      <section className={styles.trustStrip}>
        <div className={styles.trustLabel}>Created and led by Dr. Shallanda Hunter</div>
        <div className={styles.trustMarquee}>
          <div className={styles.trustTrack}>
            {[
              'CFNMP', 'PharmD', 'MBA', 'Privacy-first design', 'No ads. No data sales.',
              'HIPAA-aware platform', 'Evidence-informed curriculum', 'ROOTS Framework',
              'CFNMP', 'PharmD', 'MBA', 'Privacy-first design', 'No ads. No data sales.',
              'HIPAA-aware platform', 'Evidence-informed curriculum', 'ROOTS Framework',
            ].map((chip, i) => (
              <span key={i} className={styles.trustChip}>{chip}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Free Tools */}
      <section className={styles.section} id="free-tools">
        <div className={styles.sectionKicker}>No Account Needed</div>
        <h2 className={styles.sectionTitle}>Five Free Education Tools</h2>
        <p className={styles.sectionSubtitle}>These tools give you educational context about your numbers. They are not a clinical assessment and do not replace your healthcare provider.</p>

        <div className={styles.toolTabs}>
          {([
            { id: 'bp',      label: 'Blood Pressure Check' },
            { id: 'glucose', label: 'Blood Sugar Zone' },
            { id: 'symptom', label: 'Metabolic Pattern Check' },
            { id: 'waist',   label: 'Waist-to-Height Check' },
            { id: 'hormone', label: 'Hormone Cycle Snapshot' },
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

        {/* BP Tool — full simulator embedded */}
        {toolTab === 'bp' && <BPSimulatorWidget showFooter={true} />}

        {/* Blood Sugar Zone Checker */}
        {toolTab === 'glucose' && (
          <div className={styles.toolPanel}>
            <p className={styles.toolDesc}>Enter a glucose reading and the context when it was taken. You will get an educational zone and one actionable insight. No lab values required beyond a basic glucose meter reading.</p>
            <div className={styles.glucoseRow}>
              <div className={styles.homaField}>
                <label className={styles.toolLabel}>Reading Context</label>
                <select
                  className={styles.toolInput}
                  value={glucoseCtx}
                  onChange={e => { setGlucoseCtx(e.target.value as typeof glucoseCtx); setGlucoseResult(null) }}
                >
                  <option value="fasting">Fasting (no food for 8+ hours)</option>
                  <option value="pre_meal">Before a Meal</option>
                  <option value="post_meal">2 Hours After a Meal</option>
                  <option value="bedtime">Bedtime</option>
                </select>
              </div>
              <div className={styles.homaField}>
                <label className={styles.toolLabel}>Glucose Reading (mg/dL)</label>
                <input
                  className={styles.toolInput}
                  type="number"
                  placeholder="e.g. 105"
                  value={glucoseVal}
                  onChange={e => { setGlucoseVal(e.target.value); setGlucoseResult(null) }}
                  min={40}
                  max={600}
                />
              </div>
              <button className={styles.toolBtn} onClick={checkGlucose}>Check Zone</button>
            </div>
            {glucoseResult && (
              <div className={styles.toolResult}>
                <div className={styles.toolZoneBadge} style={{ background: `${glucoseResult.color}18`, border: `1px solid ${glucoseResult.color}40`, color: glucoseResult.color }}>
                  {glucoseResult.zone}
                </div>
                <p className={styles.toolResultMsg}>{glucoseResult.msg}</p>
                <div className={styles.toolTip}>
                  <span className={styles.toolTipLabel}>One thing to try:</span> {glucoseResult.tip}
                </div>
                <p className={styles.toolDisclaimer}>This is educational context, not a diagnosis. Glucose ranges are based on ADA guidelines. Discuss any reading of concern with your healthcare provider.</p>
                {!emailSubmitted ? (
                  <div className={styles.emailCapture}>
                    <p className={styles.emailCaptureText}>Want to track this number and learn what moves it? One insight, one tool, one practical step. Every week. Free.</p>
                    <div className={styles.emailCaptureRow}>
                      <input
                        className={styles.emailInput}
                        type="email"
                        placeholder="Your email address"
                        value={emailCapture}
                        onChange={e => setEmailCapture(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && submitEmailCapture()}
                        aria-label="Email address for weekly health insights"
                      />
                      <button
                        className={styles.emailBtn}
                        onClick={submitEmailCapture}
                        disabled={emailSubmitting || !emailCapture.includes('@')}
                      >
                        {emailSubmitting ? 'Sending...' : 'Send Me Weekly Insights'}
                      </button>
                    </div>
                    <p className={styles.emailCompliance}>Subscribe for weekly functional health education. By subscribing, you agree to receive educational content. Not medical advice.</p>
                  </div>
                ) : (
                  <div className={styles.emailSuccess}>You are on the list. One insight, one tool, one practical step. In your inbox weekly.</div>
                )}
                <div className={styles.toolCTA}>
                  <p className={styles.toolCTAText}>Track your readings over time and learn what drives them in the ROOTS curriculum.</p>
                  <button onClick={scrollToPricing} className={shared.btnPrimary}>See Membership Options <ChevronRight size={16} /></button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Metabolic Pattern Check */}
        {toolTab === 'symptom' && (
          <div className={styles.toolPanel}>
            <p className={styles.toolDesc}>Answer all seven questions to see which metabolic patterns are present in your responses.</p>
            <div className={styles.quizList}>
              {PATTERN_QUESTIONS.map((q, i) => (
                <div key={q.id} className={styles.quizQuestion}>
                  <p className={styles.quizText}><span className={styles.quizNum}>{i + 1}.</span> {q.text}</p>
                  <div className={styles.quizAnswers}>
                    {(['Yes', 'Sometimes', 'No'] as const).map((label, vi) => {
                      const val = vi === 0 ? 2 : vi === 1 ? 1 : 0
                      return (
                        <button
                          key={label}
                          className={patternAnswers[q.id] === val ? styles.quizBtnActive : styles.quizBtn}
                          onClick={() => setPatternAnswer(q.id, val)}
                        >
                          {label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
            <button
              className={styles.toolBtn}
              onClick={analyzePattern}
              disabled={Object.keys(patternAnswers).length < 7}
              style={{ opacity: Object.keys(patternAnswers).length < 7 ? 0.5 : 1 }}
            >
              Analyze My Pattern
            </button>
            {Object.keys(patternAnswers).length > 0 && Object.keys(patternAnswers).length < 7 && (
              <p className={styles.toolDesc} style={{ marginTop: '0.5rem', fontSize: '12px' }}>
                {7 - Object.keys(patternAnswers).length} question{7 - Object.keys(patternAnswers).length !== 1 ? 's' : ''} remaining
              </p>
            )}
            {patternResult && (
              <div className={styles.toolResult}>
                <div className={styles.toolZoneBadge} style={{
                  background: patternResult.level === 'low' ? '#4be08a18' : patternResult.level === 'moderate' ? '#c8a74b18' : '#e05c5c18',
                  border: `1px solid ${patternResult.level === 'low' ? '#4be08a' : patternResult.level === 'moderate' ? '#c8a74b' : '#e05c5c'}40`,
                  color: patternResult.level === 'low' ? '#4be08a' : patternResult.level === 'moderate' ? '#c8a74b' : '#e05c5c',
                }}>
                  {patternResult.level === 'low' ? 'Low Pattern' : patternResult.level === 'moderate' ? 'Moderate Pattern' : 'High Pattern'} ({patternResult.score} / 14)
                </div>
                <p className={styles.toolResultMsg}>{patternResult.msg}</p>
                <p className={styles.toolDisclaimer}>These patterns are for educational awareness only. This is not a clinical assessment and does not diagnose any condition. Discuss any health concerns with your licensed healthcare provider.</p>
                {!emailSubmitted ? (
                  <div className={styles.emailCapture}>
                    <p className={styles.emailCaptureText}>Want to understand what drives these patterns? One insight, one tool, one practical step. Every week. Free.</p>
                    <div className={styles.emailCaptureRow}>
                      <input
                        className={styles.emailInput}
                        type="email"
                        placeholder="Your email address"
                        value={emailCapture}
                        onChange={e => setEmailCapture(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && submitEmailCapture()}
                        aria-label="Email address for weekly health insights"
                      />
                      <button
                        className={styles.emailBtn}
                        onClick={submitEmailCapture}
                        disabled={emailSubmitting || !emailCapture.includes('@')}
                      >
                        {emailSubmitting ? 'Sending...' : 'Send Me Weekly Insights'}
                      </button>
                    </div>
                    <p className={styles.emailCompliance}>Subscribe for weekly functional health education. By subscribing, you agree to receive educational content. Not medical advice.</p>
                  </div>
                ) : (
                  <div className={styles.emailSuccess}>You are on the list. One insight, one tool, one practical step. In your inbox weekly.</div>
                )}
                <div className={styles.toolCTA}>
                  <p className={styles.toolCTAText}>The ROOTS Framework addresses each of these patterns through structured education, beginning with the metabolic systems that drive them.</p>
                  <button onClick={scrollToPricing} className={shared.btnPrimary}>See Membership Options <ChevronRight size={16} /></button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Waist-to-Height Check */}
        {toolTab === 'waist' && (
          <div className={styles.toolPanel}>
            <p className={styles.toolDesc}>Waist-to-height ratio is one of the most accurate body measurements for predicting metabolic risk. You only need a measuring tape and your height.</p>
            <div className={styles.homaInputRow}>
              <div className={styles.homaField}>
                <label className={styles.toolLabel}>Waist Circumference</label>
                <input
                  className={styles.toolInput}
                  type="number"
                  placeholder={waistUnit === 'in' ? 'e.g. 34' : 'e.g. 86'}
                  value={waistVal}
                  onChange={e => { setWaistVal(e.target.value); setWaistResult(null) }}
                  min={20}
                  max={300}
                />
              </div>
              <div className={styles.homaField}>
                <label className={styles.toolLabel}>Height (total {waistUnit === 'in' ? 'inches' : 'cm'})</label>
                <input
                  className={styles.toolInput}
                  type="number"
                  placeholder={waistUnit === 'in' ? 'e.g. 65' : 'e.g. 165'}
                  value={heightVal}
                  onChange={e => { setHeightVal(e.target.value); setWaistResult(null) }}
                  min={40}
                  max={300}
                />
              </div>
              <div>
                <label className={styles.toolLabel}>Unit</label>
                <div className={styles.unitToggle}>
                  <button type="button" className={waistUnit === 'in' ? styles.unitBtnActive : styles.unitBtn} onClick={() => { setWaistUnit('in'); setWaistResult(null) }}>in</button>
                  <button type="button" className={waistUnit === 'cm' ? styles.unitBtnActive : styles.unitBtn} onClick={() => { setWaistUnit('cm'); setWaistResult(null) }}>cm</button>
                </div>
              </div>
              <button className={styles.toolBtn} onClick={checkWaist}>Check Ratio</button>
            </div>
            <p className={styles.toolDesc} style={{ marginTop: '-0.5rem', fontSize: '12px' }}>
              Measure your waist at the narrowest point (just above the navel). Enter height in total {waistUnit === 'in' ? 'inches (example: 5\'5" = 65 in)' : 'centimeters'}.
            </p>
            {waistResult && (
              <div className={styles.toolResult}>
                <div className={styles.homaScore}>
                  <span className={styles.homaScoreVal} style={{ color: waistResult.color }}>{waistResult.ratio.toFixed(2)}</span>
                  <span className={styles.homaScoreLabel}>WHtR</span>
                </div>
                <div className={styles.toolZoneBadge} style={{ background: `${waistResult.color}18`, border: `1px solid ${waistResult.color}40`, color: waistResult.color }}>
                  {waistResult.zone}
                </div>
                <p className={styles.toolResultMsg}>{waistResult.msg}</p>
                <div className={styles.homaScale}>
                  <div className={styles.homaScaleBar}>
                    <div className={styles.homaScaleSeg} style={{ background: '#4be08a' }} />
                    <div className={styles.homaScaleSeg} style={{ background: '#c8a74b' }} />
                    <div className={styles.homaScaleSeg} style={{ background: '#e05c5c' }} />
                  </div>
                  <div className={styles.homaScaleLabels}>
                    <span>Optimal (under 0.5)</span><span>Elevated (0.5-0.6)</span><span>High (above 0.6)</span>
                  </div>
                </div>
                <p className={styles.toolDisclaimer}>Waist-to-height ratio is a research-validated screening measure for cardiometabolic risk. It is not a clinical assessment. Individual context matters. Discuss any measurement of concern with your healthcare provider.</p>
                {!emailSubmitted ? (
                  <div className={styles.emailCapture}>
                    <p className={styles.emailCaptureText}>Want to learn what drives central adiposity and how to move it? One insight, one tool, one practical step. Every week. Free.</p>
                    <div className={styles.emailCaptureRow}>
                      <input
                        className={styles.emailInput}
                        type="email"
                        placeholder="Your email address"
                        value={emailCapture}
                        onChange={e => setEmailCapture(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && submitEmailCapture()}
                        aria-label="Email address for weekly health insights"
                      />
                      <button
                        className={styles.emailBtn}
                        onClick={submitEmailCapture}
                        disabled={emailSubmitting || !emailCapture.includes('@')}
                      >
                        {emailSubmitting ? 'Sending...' : 'Send Me Weekly Insights'}
                      </button>
                    </div>
                    <p className={styles.emailCompliance}>Subscribe for weekly functional health education. By subscribing, you agree to receive educational content. Not medical advice.</p>
                  </div>
                ) : (
                  <div className={styles.emailSuccess}>You are on the list. One insight, one tool, one practical step. In your inbox weekly.</div>
                )}
                <div className={styles.toolCTA}>
                  <p className={styles.toolCTAText}>Learn what drives central adiposity and how to address it through the nutrition, supplement, and lifestyle education inside the ROOTS Framework.</p>
                  <button onClick={scrollToPricing} className={shared.btnPrimary}>See Membership Options <ChevronRight size={16} /></button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Hormone Cycle Snapshot */}
        {toolTab === 'hormone' && <HormoneCyclePreview />}
      </section>

      {/* Who This Is For */}
      <div className={styles.bgWhoFor}>
      <section className={`${styles.sectionDark} ${styles.reveal}`} data-reveal>
        <div className={styles.sectionKicker}>Is This For You?</div>
        <h2 className={styles.sectionTitle}>Does this sound like you?</h2>
        <p className={styles.sectionSubtitle}>Different backgrounds. Different starting points. One common thread: they wanted real answers.</p>
        <div className={styles.personaGrid}>
          {WHO_FOR_PERSONAS.map((p, i) => (
            <div key={i} className={`${styles.personaCard} ${styles.reveal}`} data-reveal data-delay={String(i * 70)}>
              <div className={styles.personaAvatar}>{p.emoji}</div>
              <div className={styles.personaName}>{p.name}</div>
              <div className={styles.personaLocation}>{p.location}</div>
              <p className={styles.personaScenario}>{p.scenario}</p>
            </div>
          ))}
        </div>
      </section>
      </div>

      {/* How It Works */}
      <section className={`${styles.section} ${styles.reveal}`} data-reveal>
        <div className={styles.sectionKicker}>How It Works</div>
        <h2 className={styles.sectionTitle}>Three steps. One clear path.</h2>
        <p className={styles.sectionSubtitle}>No guesswork. No overwhelming overhaul. A structured system you can start today.</p>
        <div className={styles.howGrid}>
          <div className={styles.howStep}>
            <div className={styles.howNum}>1</div>
            <h3 className={styles.howTitle}>Join and complete the Pattern Check</h3>
            <p className={styles.howDesc}>Answer a few questions about your current habits and numbers. This is your starting point. The platform maps where you are so you know exactly where to begin.</p>
          </div>
          <div className={styles.howArrow} aria-hidden="true">
            <svg width="48" height="32" viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polyline points="4,8 14,16 4,24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="18,8 28,16 18,24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="32,8 42,16 32,24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className={styles.howStep}>
            <div className={styles.howNum}>2</div>
            <h3 className={styles.howTitle}>Follow your curriculum and daily tracking</h3>
            <p className={styles.howDesc}>The Daily Command Center takes 10 minutes. The ROOTS curriculum modules take 20. Both are built around your schedule, not the other way around.</p>
          </div>
          <div className={styles.howArrow} aria-hidden="true">
            <svg width="48" height="32" viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polyline points="4,8 14,16 4,24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="18,8 28,16 18,24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="32,8 42,16 32,24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className={styles.howStep}>
            <div className={styles.howNum}>3</div>
            <h3 className={styles.howTitle}>Watch your Weekly Report Card</h3>
            <p className={styles.howDesc}>Every week you get a grade showing exactly what is improving and where to focus next. Progress becomes visible. That visibility is what keeps people consistent.</p>
          </div>
        </div>
      </section>

      {/* ROOTS Framework */}
      <div className={styles.bgRoots}>
      <section className={`${styles.section} ${styles.reveal}`} data-reveal>
        <div className={styles.sectionKicker}>The Method</div>
        <h2 className={styles.sectionTitle}>The ROOTS™ Framework</h2>
        <p className={styles.sectionSubtitle}>Five phases. A structured path through functional and nutritional medicine education. Evidence-informed at every step.</p>
        <div className={styles.rootsBand}>
          {ROOTS_STEPS.map(({ letter, name, hint, color }, i) => (
            <div key={name + i} className={`${styles.rootsTile} ${styles.reveal}`} data-reveal data-delay={String(i * 80)} style={{ '--roots-color': color } as React.CSSProperties}>
              <div className={styles.rootsLetter}>{letter}</div>
              <div className={styles.rootsName}>{name}</div>
              <div className={styles.rootsHint}>{hint}</div>
            </div>
          ))}
        </div>
      </section>
      </div>

      {/* Features */}
      <section className={styles.section}>
        <div className={styles.sectionKicker}>The Toolkit</div>
        <h2 className={styles.sectionTitle}>Every tool you need to track, learn, and understand.</h2>
        <p className={styles.sectionSubtitle}>Built for functional and nutritional medicine education participants. Not generic wellness. Specific and purposeful.</p>
        <div className={styles.featuresGrid}>
          {(showAllFeatures ? FEATURES : FEATURES.slice(0, 4)).map(({ img, title, desc }, i) => (
            <div key={title} className={`${styles.featureCard} ${styles.reveal}`} data-reveal data-delay={String(i * 60)}>
              <img src={img} alt={title} className={styles.featureImg} />
              <h3 className={styles.featureTitle}>{title}</h3>
              <p className={styles.featureDesc}>{desc}</p>
            </div>
          ))}
        </div>
        {!showAllFeatures && (
          <button className={styles.featuresExpandBtn} onClick={() => setShowAllFeatures(true)}>
            See everything included ({FEATURES.length - 4} more tools) <ChevronDown size={16} />
          </button>
        )}
      </section>

      {/* Origin Story */}
      <div className={styles.bgOrigin}>
      <section className={`${styles.sectionDark} ${styles.reveal}`} data-reveal>
        <div className={styles.originBlock}>
          <div className={styles.sectionKicker}>Why This Exists</div>
          <h2 className={styles.sectionTitle}>Dr. Hunter reversed her own metabolic condition using functional medicine when conventional answers were not coming.</h2>
          <p className={styles.originText}>
            She is a licensed pharmacist with a PharmD and an MBA. She is a Certified Functional and Nutritional Medicine Practitioner. She built this platform because the education she needed did not exist in one place.
          </p>
          <p className={styles.originText}>
            The ROOTS Framework is the system she built for herself, formalized and delivered to you. Every module, every tool, every recommendation has been reviewed through both lenses: the functional and nutritional medicine framework and the PharmD training that ensures the science behind it is read correctly.
          </p>
          <p className={styles.originText}>
            Where the research is strong, you will see the citation. Where evidence is emerging or traditional, that is stated honestly. That transparency is not a weakness. It is the standard.
          </p>
        </div>
      </section>
      </div>

      {/* Privacy */}
      <section className={`${styles.section} ${styles.reveal}`} data-reveal>
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

      {/* Member Outcomes */}
      <section className={styles.section}>
        <div className={styles.sectionKicker}>Member Outcomes</div>
        <h2 className={styles.sectionTitle}>Real people. Real progress.</h2>
        <p className={styles.sectionSubtitle}>These outcomes reflect individual client experience through the ROOTS Framework education program.</p>

        <div className={styles.testimonialsGrid}>

          {/* Outcome 1: Supplement optimization */}
          <div className={`${styles.testimonialCard} ${styles.reveal}`} data-reveal data-delay="0">
            <div className={styles.outcomeTag}>ROOTS Framework, Clinical Optimization</div>
            <div className={styles.outcomeHeadline}>42 supplements. 5 medications. Still in pain.</div>
            <div className={styles.outcomeStats}>
              <div className={styles.outcomeStat}>
                <span className={styles.outcomeStatVal}>42 → 16</span>
                <span className={styles.outcomeStatLabel}>Supplements</span>
              </div>
              <div className={styles.outcomeStat}>
                <span className={styles.outcomeStatVal}>5 → 3</span>
                <span className={styles.outcomeStatLabel}>Medications</span>
              </div>
            </div>
            <ul className={styles.outcomeList}>
              <li>Streamlined in coordination with her physician</li>
              <li>April 2026: joint and shoulder pain resolved</li>
              <li>May 2026: severe bloating resolved, waistline reduced</li>
            </ul>
          </div>

          {/* Outcome 2: Kidney markers */}
          <div className={`${styles.testimonialCard} ${styles.reveal}`} data-reveal data-delay="100">
            <div className={styles.outcomeTag}>ROOTS Stability Framework</div>
            <div className={styles.outcomeHeadline}>Six months. Kidney markers improving.</div>
            <ul className={styles.outcomeList}>
              <li>Measurable improvement in kidney function markers</li>
              <li>From symptom management to root-cause education</li>
            </ul>
          </div>

          {/* Review: Michael D. */}
          <div className={`${styles.testimonialCard} ${styles.reviewCard} ${styles.reveal}`} data-reveal data-delay="200">
            <div className={styles.reviewStars}>★★★★★</div>
            <blockquote className={styles.reviewQuote}>
              "Kind. Professional. Extremely knowledgeable about my health issues. The Zoom format was easy and convenient. Looking forward to working together."
            </blockquote>
            <div className={styles.reviewAuthor}>
              Michael <span className={styles.blurredName}>Duffy</span> &nbsp;&middot;&nbsp; Mar 31, 2026
            </div>
            <div className={styles.reviewResponse}>
              <span className={styles.reviewResponseLabel}>Dr. Hunter's response to Mike:</span>
              "You are asking all the right questions about your health. That level of dedication is exactly why you are going to see great results. Incredibly excited to continue working together."
            </div>
          </div>

        </div>

        <p className={styles.testimonialDisclaimer}>
          Individual results may vary and are not guaranteed. Not intended as medical advice.
        </p>
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
              {tier.valueAnchor && <p className={styles.pricingAnchor}>{tier.valueAnchor}</p>}

              <div className={styles.pricingStackLabel}>What's included:</div>
              <ul className={styles.pricingCore}>
                {tier.core.map(c => (
                  <li key={c}>
                    <span className={styles.pricingCheck} style={{ color: tier.color }}>✓</span> {c}
                  </li>
                ))}
              </ul>

              {tier.bonuses.length > 0 && (
                <>
                  <div className={styles.pricingBonusDivider}>Bonuses included:</div>
                  <ul className={styles.pricingBonusList}>
                    {tier.bonuses.map(b => (
                      <li key={b.name} className={styles.pricingBonusItem}>
                        <span className={styles.pricingBonusGift}>🎁</span>
                        <div className={styles.pricingBonusBody}>
                          <div className={styles.pricingBonusName}>{b.name}</div>
                          <div className={styles.pricingBonusKills}>Removes: "{b.kills}"</div>
                          <div className={styles.pricingBonusDesc}>{b.description}</div>
                          {b.disclaimer && <div className={styles.pricingBonusDisclaimer}>{b.disclaimer}</div>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              <div className={styles.pricingTimeWin}>
                First win: <strong>{tier.timeToWin}</strong>
              </div>

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

              <p className={styles.cancelNote}>{tier.riskReversal}</p>
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

      {/* FAQ */}
      <section className={`${styles.section} ${styles.reveal}`} data-reveal>
        <div className={styles.sectionKicker}>Questions</div>
        <h2 className={styles.sectionTitle}>Common questions, straight answers.</h2>
        <div className={styles.faqGrid}>
          <div className={styles.faqItem}>
            <h3 className={styles.faqQ}>Is this medical care?</h3>
            <p className={styles.faqA}>No. This is functional and nutritional medicine education. The platform helps you understand your numbers, build consistent habits, and follow a structured curriculum. It does not diagnose, treat, or replace your doctor.</p>
          </div>
          <div className={styles.faqItem}>
            <h3 className={styles.faqQ}>Do I need lab results to join?</h3>
            <p className={styles.faqA}>No. You can start with the free tools today, no account needed. Many members use the platform alongside their existing lab work to finally understand what the numbers mean.</p>
          </div>
          <div className={styles.faqItem}>
            <h3 className={styles.faqQ}>What if I am on medication?</h3>
            <p className={styles.faqA}>The platform is educational and does not advise changing any medication. Everything you learn here is meant to complement, not replace, your licensed provider's care. Some members share their progress reports directly with their physicians.</p>
          </div>
          <div className={styles.faqItem}>
            <h3 className={styles.faqQ}>Can I cancel?</h3>
            <p className={styles.faqA}>Monthly plans: yes, anytime, two clicks from your Settings page. No calls, no forms. Annual plans are non-refundable after 14 days, and you can pause for up to 3 months if life gets in the way.</p>
          </div>
          <div className={styles.faqItem}>
            <h3 className={styles.faqQ}>How much time does this take daily?</h3>
            <p className={styles.faqA}>Most members spend 10 to 15 minutes in the Daily Command Center. The ROOTS curriculum modules are designed for 20 to 30 minute sessions, once or twice a week. You do not need to clear your schedule.</p>
          </div>
          <div className={styles.faqItem}>
            <h3 className={styles.faqQ}>Is my health data private?</h3>
            <p className={styles.faqA}>Yes. The platform is HIPAA-aware by design: no ads, no data sales, no third-party sharing. Your information stays on the platform and is never sold or shared with advertisers.</p>
          </div>
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
