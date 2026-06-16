import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Shield, Award, Users, BookOpen, Pill, Activity, Heart, ChevronRight, ExternalLink, ChevronDown } from 'lucide-react'
import styles from './LandingPage.module.css'
import shared from '../styles/shared.module.css'

// --- Types ---
type ToolTab = 'bp' | 'symptom' | 'homa'

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

// --- Static data ---
const FEATURES = [
  { icon: Heart,     color: '#e05c5c', title: 'Blood Pressure Tracker',  desc: 'Log readings and visualize trends with AHA-aligned zone color-coding.' },
  { icon: Shield,    color: '#c8a74b', title: 'AI Meal Guard',            desc: 'Get instant educational context on food choices before you eat.' },
  { icon: Activity,  color: '#0b9e8e', title: 'Daily Command Center',     desc: 'Track fasting, meals, supplements, steps, and water in one place.' },
  { icon: Award,     color: '#9b59b6', title: 'Weekly Report Card',       desc: 'See your consistency score and grade across all wellness habits.' },
  { icon: Users,     color: '#4be08a', title: 'Community Rooms',          desc: 'Share wins and ask questions in a private program group with levels and streaks.' },
  { icon: BookOpen,  color: '#c8a74b', title: 'ROOTS Protocol',           desc: 'Follow the structured 30-day functional medicine education curriculum.' },
  { icon: Pill,      color: '#9b59b6', title: 'Supplement Log',           desc: 'Track your daily supplement protocol with one-tap check-offs.' },
  { icon: ExternalLink, color: '#0b9e8e', title: 'Progress Reports',      desc: 'Download shareable HTML reports to review with your educator.' },
]

const TIERS = [
  { name: 'Free',        price: '$0',     period: '',    color: '#91a0ac', features: ['Daily Log', 'BP Tracker (7 days)', 'Protocol Viewer', 'Community Feed'],                                                          cta: 'Get Started Free', ctaClass: 'secondary' },
  { name: 'Participant', price: '$19.99', period: '/mo', color: '#c8a74b', features: ['Everything in Free', 'Unlimited BP History', 'AI Meal Guard', 'Weekly Report Card', 'Supplement Log', 'Progress Reports'],        cta: 'Start Program',    ctaClass: 'primary', popular: true },
  { name: 'VIP',         price: '$39.99', period: '/mo', color: '#0b9e8e', features: ['Everything in Participant', '1-on-1 Educator Sessions', 'Custom Protocol', 'Priority Support', 'Fullscript 25% Discount'],        cta: 'Apply for VIP',   ctaClass: 'teal' },
]

const ROOTS_STEPS = [
  { letter: 'R', name: 'Review',              hint: 'We start with your full picture',        color: '#e05c5c' },
  { letter: 'O', name: 'Optimize Nutrition',  hint: 'Food as education, personalized',         color: '#c8a74b' },
  { letter: 'O', name: 'Optimize Biochemistry', hint: 'Supplements and interactions reviewed', color: '#0b9e8e' },
  { letter: 'T', name: 'Transform Lifestyle', hint: 'Evidence-informed change',                color: '#9b59b6' },
  { letter: 'S', name: 'Sustain and Adapt',   hint: 'Habits that last for life',               color: '#4be08a' },
]

const SYMPTOM_LIST = [
  { id: 'tired_meals',        label: 'Fatigue after meals or mid-afternoon crashes' },
  { id: 'sugar_cravings',     label: 'Strong cravings for sugar, bread, or starchy foods' },
  { id: 'hangry',             label: 'Irritability or shakiness when skipping a meal' },
  { id: 'belly_weight',       label: 'Difficulty losing weight, especially around the midsection' },
  { id: 'skin_changes',       label: 'Skin changes: tags, dark patches, or breakouts' },
  { id: 'poor_sleep',         label: 'Poor sleep or waking frequently during the night' },
  { id: 'mood_swings',        label: 'Mood swings or irritability throughout the day' },
  { id: 'elevated_bp',        label: 'Known elevated blood pressure readings' },
  { id: 'bloating',           label: 'Bloating or digestive discomfort after meals' },
  { id: 'energy_inconsistent',label: 'Inconsistent energy with no clear cause' },
]

const CTA_CLASSES: Record<string, string> = {
  primary: shared.btnPrimary,
  secondary: shared.btnSecondary,
  teal: shared.btnTeal,
}

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
    const energy   = ['tired_meals','sugar_cravings','hangry','energy_inconsistent'].filter(s => symptoms.has(s)).length
    const metabolic = ['belly_weight','elevated_bp'].filter(s => symptoms.has(s)).length
    const hormonal  = ['poor_sleep','mood_swings','skin_changes'].filter(s => symptoms.has(s)).length
    const digestive = symptoms.has('bloating') ? 1 : 0
    const patterns: string[] = []
    if (energy >= 2) patterns.push('Blood sugar variability: Energy crashes, cravings, and irritability between meals are classic signals. Blood sugar regulation is one of the first areas the ROOTS curriculum addresses through nutrition education.')
    if (metabolic >= 1 && energy >= 1) patterns.push('Metabolic overlap: Weight retention and energy patterns often share a common root in how the body processes and stores fuel. The ROOTS curriculum addresses this overlap systematically.')
    if (hormonal >= 2) patterns.push('Hormonal rhythm: Sleep quality, mood patterns, and skin changes are all influenced by the same hormonal signaling systems. When two or more appear together, they point toward a shared area worth exploring through education.')
    if (digestive >= 1) patterns.push('Gut-energy connection: Digestive discomfort after meals can reflect how the gut microbiome, nutrient absorption, and overall energy production interact, a core topic in the ROOTS nutritional phase.')
    if (symptoms.has('elevated_bp')) patterns.push('Cardiovascular awareness: Elevated blood pressure is one of the most information-rich numbers in metabolic health. Understanding the lifestyle factors that influence it is a dedicated section of the ROOTS curriculum.')
    if (patterns.length === 0) patterns.push('Your responses do not fit one dominant pattern. This could reflect a mixed picture or early-stage changes. The ROOTS Framework approaches metabolic health comprehensively, addressing each system in sequence.')
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

  const scrollToTools = () => {
    document.getElementById('free-tools')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className={styles.page}>
      {/* Nav */}
      <nav className={styles.nav}>
        <Link to="/" className={styles.navBrand}>
          <img src="/logo-mark.png" alt="Hunter's Holistic Health emblem" className={styles.navLogoImg} />
          <span className={styles.navLogo}>Hunter's Holistic Health</span>
        </Link>
        <div className={styles.navLinks}>
          <Link to="/login" className={styles.navLink}>Sign In</Link>
          <Link to="/signup" className={shared.btnPrimary}>Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <img src="/logo-mark.png" alt="" aria-hidden="true" className={styles.heroLogo} />
        <div className={styles.heroBadge}>Functional Medicine Education Platform</div>
        <h1 className={styles.heroTitle}>
          Understand Your Health.<br /><span className={styles.heroGold}>One Root at a Time.</span>
        </h1>
        <p className={styles.heroSerif}>Rooted in science. Guided by a PharmD. Grown by you.</p>
        <p className={styles.heroSubtitle}>
          Dr. Shallanda Hunter, PharmD teaches you the root causes most providers do not have time to explain. Use the free tools below to start understanding your numbers today.
        </p>
        <div className={styles.heroActions}>
          <Link to="/signup" className={shared.btnPrimary}>
            Join the Platform <ChevronRight size={18} />
          </Link>
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
        <span className={styles.trustChip}>PharmD, Doctor of Pharmacy</span>
        <span className={styles.trustChip}>MBA</span>
        <span className={styles.trustChip}>CFNMP, Functional Medicine</span>
        <span className={styles.trustChip}>Privacy-first design</span>
        <span className={styles.trustChip}>No ads, no data sales</span>
      </section>

      {/* Free Tools */}
      <section className={styles.section} id="free-tools">
        <div className={styles.sectionKicker}>No Account Needed</div>
        <h2 className={styles.sectionTitle}>Three Free Education Tools</h2>
        <p className={styles.sectionSubtitle}>These tools provide educational context about your numbers. They are not a diagnosis and do not replace your healthcare provider.</p>

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
                <input
                  className={styles.toolInput}
                  type="number"
                  placeholder="e.g. 128"
                  value={bpSys}
                  onChange={e => { setBpSys(e.target.value); setBpResult(null) }}
                  min={60} max={250}
                />
              </div>
              <div className={styles.bpSlash}>/</div>
              <div className={styles.bpField}>
                <label className={styles.toolLabel}>Diastolic (bottom number)</label>
                <input
                  className={styles.toolInput}
                  type="number"
                  placeholder="e.g. 82"
                  value={bpDia}
                  onChange={e => { setBpDia(e.target.value); setBpResult(null) }}
                  min={40} max={150}
                />
              </div>
              <button className={styles.toolBtn} onClick={checkBP}>Check My Reading</button>
            </div>

            {bpResult && (
              <div className={styles.toolResult}>
                <div className={styles.toolZoneBadge} style={{ background: `${bpResult.color}18`, border: `1px solid ${bpResult.color}40`, color: bpResult.color }}>
                  {bpResult.zone}
                </div>
                <p className={styles.toolResultMsg}>{bpResult.message}</p>
                <div className={styles.bpFactorCols}>
                  <div className={styles.bpFactorCol}>
                    <div className={styles.bpFactorHeader} style={{ color: '#e08a4b' }}>Factors that may elevate readings</div>
                    <ul className={styles.bpFactorList}>
                      {bpResult.elevating.map(f => <li key={f}>{f}</li>)}
                    </ul>
                  </div>
                  <div className={styles.bpFactorCol}>
                    <div className={styles.bpFactorHeader} style={{ color: '#4be08a' }}>Factors that may support healthier readings</div>
                    <ul className={styles.bpFactorList}>
                      {bpResult.supporting.map(f => <li key={f}>{f}</li>)}
                    </ul>
                  </div>
                </div>
                <div className={styles.toolCTA}>
                  <p className={styles.toolCTAText}>Track your trend over time and learn the ROOTS approach to cardiovascular education.</p>
                  <Link to="/signup" className={shared.btnPrimary}>
                    Start Tracking Free <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Symptom Tool */}
        {toolTab === 'symptom' && (
          <div className={styles.toolPanel}>
            <p className={styles.toolDesc}>Check all that currently apply to you. Your selections will be used to identify educational patterns, not to assess or evaluate your health.</p>
            <div className={styles.symptomGrid}>
              {SYMPTOM_LIST.map(s => (
                <label key={s.id} className={`${styles.symptomCheck} ${symptoms.has(s.id) ? styles.symptomCheckActive : ''}`}>
                  <input
                    type="checkbox"
                    checked={symptoms.has(s.id)}
                    onChange={() => toggleSymptom(s.id)}
                    className={styles.symptomCheckInput}
                  />
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
                <p className={styles.toolDisclaimer}>These patterns are for your educational awareness only. This is not a medical assessment. Discuss any health concerns with your licensed healthcare provider.</p>
                <div className={styles.toolCTA}>
                  <p className={styles.toolCTAText}>The ROOTS Framework addresses each of these patterns through structured education over 30 days.</p>
                  <Link to="/signup" className={shared.btnPrimary}>
                    Start Learning Free <ChevronRight size={16} />
                  </Link>
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
                <input
                  className={styles.toolInput}
                  type="number"
                  placeholder="e.g. 95"
                  value={homaGlucose}
                  onChange={e => { setHomaGlucose(e.target.value); setHomaResult(null) }}
                  min={40} max={600}
                />
              </div>
              <div className={styles.homaField}>
                <label className={styles.toolLabel}>Fasting Insulin (uIU/mL)</label>
                <input
                  className={styles.toolInput}
                  type="number"
                  placeholder="e.g. 8"
                  value={homaInsulin}
                  onChange={e => { setHomaInsulin(e.target.value); setHomaResult(null) }}
                  min={1} max={300}
                />
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
                  <Link to="/signup" className={shared.btnPrimary}>
                    Join the Platform <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ROOTS Framework */}
      <section className={styles.section}>
        <div className={styles.sectionKicker}>The Method</div>
        <h2 className={styles.sectionTitle}>The ROOTS Framework</h2>
        <p className={styles.sectionSubtitle}>Five phases. Thirty days. One structured path through functional medicine education.</p>
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
        <h2 className={styles.sectionTitle}>Everything You Need to Track Your Progress</h2>
        <p className={styles.sectionSubtitle}>Built specifically for functional medicine education participants.</p>
        <div className={styles.featuresGrid}>
          {FEATURES.map(({ icon: Icon, color, title, desc }) => (
            <div key={title} className={styles.featureCard}>
              <div className={styles.featureIcon} style={{ background: `${color}15`, borderColor: `${color}30` }}>
                <Icon size={20} color={color} />
              </div>
              <h3 className={styles.featureTitle}>{title}</h3>
              <p className={styles.featureDesc}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Privacy band */}
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
      <section className={styles.section}>
        <div className={styles.sectionKicker}>Membership</div>
        <h2 className={styles.sectionTitle}>Simple, Transparent Pricing</h2>
        <p className={styles.sectionSubtitle}>Cancel anytime. No hidden fees.</p>
        <div className={styles.pricingGrid}>
          {TIERS.map(({ name, price, period, color, features, cta, ctaClass, popular }) => (
            <div key={name} className={popular ? styles.pricingCardFeatured : styles.pricingCard}>
              {popular && <div className={styles.pricingBadge}>Most Popular</div>}
              <div className={styles.pricingName} style={{ color }}>{name}</div>
              <div className={styles.pricingPrice}>{price}<span className={styles.pricingPeriod}>{period}</span></div>
              <ul className={styles.pricingFeatures}>
                {features.map(f => (
                  <li key={f}>
                    <span className={styles.pricingCheck} style={{ color }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link to="/signup" className={`${CTA_CLASSES[ctaClass]} ${shared.btnFull}`}>{cta}</Link>
            </div>
          ))}
        </div>
        <p className={styles.pricingNote}>
          Stripe-secured billing. Cancel anytime from your account settings.<br />
          Subscription billing coming soon. Currently accepting applications.
        </p>
      </section>

      {/* Final CTA */}
      <section className={styles.ctaBand}>
        <div className={styles.ctaBandFrame}>
          <div className={styles.ctaBandInner}>
            <img src="/logo-mark.png" alt="" aria-hidden="true" className={styles.ctaEmblem} />
            <h2 className={styles.ctaTitle}>Your roots grow one day at a time</h2>
            <p className={styles.ctaText}>
              Join the early access list and be among the first to build your daily practice with the ROOTS Framework.
            </p>
            <Link to="/join" className={shared.btnPrimary}>
              Join Early Access <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className={styles.disclaimer}>
        <div className={styles.disclaimerInner}>
          <div className={styles.disclaimerTitle}>Important Disclaimer</div>
          <p className={styles.disclaimerText}>
            Hunter's Holistic Health is an educational platform operated by Dr. Shallanda Hunter, PharmD in her capacity as a Functional Medicine Educator. Nothing on this platform constitutes medical advice, diagnosis, or treatment. The free tools on this page are for educational pattern awareness only. Individual results vary. These statements have not been evaluated by the FDA. Always consult your licensed healthcare provider before making changes to your health regimen.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <img src="/logo-mark.png" alt="" aria-hidden="true" className={styles.footerEmblem} />
        <div className={styles.footerLinks}>
          <Link to="/join" className={styles.footerLink}>Early Access</Link>
          <Link to="/support" className={styles.footerLink}>Support</Link>
          <Link to="/feature-request" className={styles.footerLink}>Request a Feature</Link>
          <Link to="/clinical-inquiry" className={styles.footerLink}>Clinical Inquiry</Link>
          <Link to="/terms" className={styles.footerLink}>Terms of Service</Link>
          <Link to="/privacy" className={styles.footerLink}>Privacy Policy</Link>
          <Link to="/privacy-scorecard" className={styles.footerLink}>Privacy Scorecard</Link>
          <a href="https://www.drshallandahunter.com" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>drshallandahunter.com</a>
        </div>
        <p className={styles.footerCopy}>© {new Date().getFullYear()} Hunter's Holistic Health. Dr. Shallanda Hunter, PharmD. All rights reserved.</p>
        <p className={styles.footerAgency}>
          Interested in this system for your practice?{' '}
          <Link to="/support" className={styles.footerAgencyLink}>Contact us.</Link>
        </p>
      </footer>
    </div>
  )
}
