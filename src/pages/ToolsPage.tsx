import { useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './ToolsPage.module.css'
import shared from '@/styles/shared.module.css'

// --- Data ---
const GOALS = [
  { value: 'weight_loss',          label: 'Sustainable Weight Loss' },
  { value: 'regulate_cycle',       label: 'Regulate My Cycle and Hormones' },
  { value: 'increase_energy',      label: 'Increase Energy and End Afternoon Crashes' },
  { value: 'blood_sugar',          label: 'Improve My Blood Sugar' },
  { value: 'reduce_inflammation',  label: 'Reduce Inflammation and Joint Pain' },
]

type Symptom = { id: string; label: string; group: string }
const SYMPTOMS: Symptom[] = [
  { id: 'ir_fatigue',   label: 'Fatigue After Meals',               group: 'Blood Sugar' },
  { id: 'ir_cravings',  label: 'Sugar and Carb Cravings',           group: 'Blood Sugar' },
  { id: 'ir_belly',     label: 'Stubborn Belly Fat',                group: 'Blood Sugar' },
  { id: 'horm_cycles',  label: 'Irregular or Absent Cycles',        group: 'Hormonal' },
  { id: 'horm_acne',    label: 'Hormonal Acne (Jawline)',           group: 'Hormonal' },
  { id: 'horm_hair',    label: 'Unwanted Hair Growth',              group: 'Hormonal' },
  { id: 'dig_reflux',   label: 'Acid Reflux or GERD',              group: 'Digestive' },
  { id: 'dig_bloat',    label: 'Bloating and Gas',                  group: 'Digestive' },
  { id: 'dig_joints',   label: 'Joint Pain and Stiffness',          group: 'Digestive' },
  { id: 'eng_sleep',    label: 'Difficulty Falling or Staying Asleep', group: 'Energy' },
  { id: 'eng_fog',      label: 'Brain Fog',                        group: 'Energy' },
  { id: 'eng_fatigue',  label: 'Persistent Fatigue',               group: 'Energy' },
]
const SYMPTOM_GROUPS = ['Blood Sugar', 'Hormonal', 'Digestive', 'Energy']

function getBlueprint(syms: string[]) {
  let sugar = 0, hormonal = 0
  if (syms.includes('ir_fatigue'))  sugar++
  if (syms.includes('ir_cravings')) sugar++
  if (syms.includes('ir_belly'))    sugar++
  if (syms.includes('horm_cycles')) hormonal += 2
  if (syms.includes('horm_acne'))   hormonal++
  if (syms.includes('horm_hair'))   hormonal++
  if (syms.includes('dig_bloat') || syms.includes('dig_joints')) { sugar += 0.5; hormonal += 0.5 }

  if (hormonal > sugar && hormonal >= 2) return {
    name: 'Hormonally Stressed',
    key: 'hormonal' as const,
    desc: 'Your pattern points toward hormonal imbalances driven by insulin and stress. Your roadmap prioritizes hormone-balancing strategies first.',
  }
  if (sugar > 0) return {
    name: 'Classic Sugar Burner',
    key: 'sugar' as const,
    desc: 'Your pattern points toward blood sugar instability and insulin resistance. Your roadmap targets glycemic control and inflammation reduction first.',
  }
  return {
    name: 'Metabolically Balanced',
    key: 'balanced' as const,
    desc: 'Your foundation is solid. Your roadmap focuses on optimization, resilience, and long-term metabolic health.',
  }
}

const PHASES = [
  {
    phase: 'Phase 1 (Weeks 1 to 4)',
    theme: 'Foundation',
    steps: [
      'Build every meal around the PFF principle: Protein first, then healthy Fat, then Fiber.',
      'Eliminate added sugars and industrial seed oils.',
      'Take a 10 to 15 minute walk after your largest meal daily.',
      'Target a 12-hour overnight fast.',
    ],
  },
  {
    phase: 'Phase 2 (Weeks 5 to 8)',
    theme: 'Momentum',
    steps: [
      'Add one fermented food daily for gut diversity.',
      'Create a screen-free wind-down hour before bed.',
      'Practice 5 minutes of box breathing each morning.',
      'Extend your overnight fast to 14 hours two to three days per week.',
    ],
  },
  {
    phase: 'Phase 3 (Weeks 9 to 12)',
    theme: 'Sustain',
    steps: [
      'Build a go-to weekly meal template for busy weeks.',
      'Add 2 resistance training sessions per week.',
      'Identify your three non-negotiable habits and protect them.',
      'Build a maintenance plan for your primary goal.',
    ],
  },
]

function getAdditions(syms: string[]): string[] {
  const adds: string[] = []
  if (syms.includes('horm_cycles') || syms.includes('horm_acne'))
    adds.push('1 to 2 cups of spearmint tea daily is shown to support healthy androgen balance.')
  if (syms.includes('ir_belly') || syms.includes('ir_fatigue') || syms.includes('ir_cravings'))
    adds.push('Post-meal movement is especially important for your pattern. Even 5 minutes of squats after meals helps clear blood sugar.')
  if (syms.includes('eng_sleep'))
    adds.push('Magnesium glycinate is commonly used to support sleep quality. Discuss with your provider.')
  if (syms.includes('dig_bloat') || syms.includes('dig_reflux'))
    adds.push('Eating slowly and chewing thoroughly reduces bloating and reflux significantly. Start there before supplements.')
  return adds
}

// HOMA-IR
function calcHOMA(insulin: number, glucose: number, unit: 'mgdl' | 'mmol') {
  const glucoseMmol = unit === 'mgdl' ? glucose / 18.016 : glucose
  return (insulin * glucoseMmol) / 22.5
}

function homaLabel(score: number) {
  if (score < 1.0) return { label: 'Optimal insulin sensitivity', color: '#2ecc71' }
  if (score < 1.9) return { label: 'Borderline: discuss with your provider', color: '#f39c12' }
  if (score < 2.9) return { label: 'Early insulin resistance', color: '#e67e22' }
  return { label: 'Significant insulin resistance', color: '#e74c3c' }
}

type Tab = 'protocol' | 'homa'
type PGStep = 'goal' | 'symptoms' | 'gate' | 'results'

const TOOLS_META_TITLE = 'Free Metabolic Health Tools | Hunter\'s Holistic Health'
const TOOLS_META_DESC = 'Free health education tools: blood pressure simulator, metabolic blueprint quiz, Nourish Log, and more. Evidence-informed guidance from Dr. Shallanda Hunter, CFNMP.'

function ToolsMetaTags() {
  if (typeof document === 'undefined') return null
  document.title = TOOLS_META_TITLE
  function setMeta(name: string, content: string, prop?: boolean) {
    const attr = prop ? 'property' : 'name'
    let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null
    if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el) }
    el.content = content
  }
  setMeta('description', TOOLS_META_DESC)
  setMeta('og:title', TOOLS_META_TITLE, true)
  setMeta('og:description', TOOLS_META_DESC, true)
  setMeta('og:type', 'website', true)
  setMeta('og:url', 'https://www.huntersholistichealth.com/tools', true)
  setMeta('twitter:card', 'summary')
  setMeta('twitter:title', TOOLS_META_TITLE)
  setMeta('twitter:description', TOOLS_META_DESC)
  let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
  if (!canonical) { canonical = document.createElement('link'); canonical.setAttribute('rel', 'canonical'); document.head.appendChild(canonical) }
  canonical.href = 'https://www.huntersholistichealth.com/tools'
  return null
}

export default function ToolsPage() {
  const [tab, setTab] = useState<Tab>('protocol')

  // Protocol Generator state
  const [pgStep, setPgStep]         = useState<PGStep>('goal')
  const [pgGoal, setPgGoal]         = useState('')
  const [pgSymptoms, setPgSymptoms] = useState<string[]>([])
  const [pgEmail, setPgEmail]       = useState('')
  const [pgName, setPgName]         = useState('')
  const [pgSending, setPgSending]   = useState(false)
  const [pgDone, setPgDone]         = useState(false)

  // HOMA state
  const [homaInsulin, setHomaInsulin]   = useState('')
  const [homaGlucose, setHomaGlucose]   = useState('')
  const [homaUnit, setHomaUnit]         = useState<'mgdl' | 'mmol'>('mgdl')
  const [homaResult, setHomaResult]     = useState<number | null>(null)

  function toggleSymptom(id: string) {
    setPgSymptoms(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])
  }

  async function submitGate(e: React.FormEvent) {
    e.preventDefault()
    if (!pgEmail) return
    setPgSending(true)
    const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Secret': import.meta.env.VITE_N8N_WEBHOOK_SECRET || '',
          },
          body: JSON.stringify({
            submissionType: 'tool_lead',
            firstName: pgName || null,
            email: pgEmail,
            toolUsed: 'metabolic_protocol_generator',
            primaryGoal: pgGoal,
          }),
        })
      } catch {
        // Non-blocking: show results even if webhook fails
      }
    }
    setPgSending(false)
    setPgDone(true)
    setPgStep('results')
  }

  function calcHoma(e: React.FormEvent) {
    e.preventDefault()
    const ins = parseFloat(homaInsulin)
    const glc = parseFloat(homaGlucose)
    if (isNaN(ins) || isNaN(glc) || ins <= 0 || glc <= 0) return
    setHomaResult(calcHOMA(ins, glc, homaUnit))
  }

  const blueprint = pgStep === 'results' ? getBlueprint(pgSymptoms) : null
  const additions = pgStep === 'results' ? getAdditions(pgSymptoms) : []

  return (
    <div className={styles.page}>
      <ToolsMetaTags />
      <header className={styles.nav}>
        <Link to="/" className={styles.navLogo}>Hunter's Holistic Health</Link>
        <div className={styles.navRight}>
          <Link to="/login" className={styles.navLink}>Sign In</Link>
          <Link to="/join" className={shared.btnPrimary}>Join Free</Link>
        </div>
      </header>

      <section className={styles.hero}>
        <p className={styles.heroEyebrow}>Free Educational Tools</p>
        <h1 className={styles.heroTitle}>Know Your Metabolic Pattern</h1>
        <p className={styles.heroSub}>
          Free clinical tools built on functional-medicine research. No login required.
        </p>
      </section>

      <div className={styles.tabBar}>
        <button
          className={`${styles.tabBtn} ${tab === 'protocol' ? styles.tabBtnActive : ''}`}
          onClick={() => setTab('protocol')}
        >
          Protocol Generator
        </button>
        <button
          className={`${styles.tabBtn} ${tab === 'homa' ? styles.tabBtnActive : ''}`}
          onClick={() => setTab('homa')}
        >
          HOMA-IR Calculator
        </button>
      </div>

      <div className={styles.toolWrap}>

        {/* ===== PROTOCOL GENERATOR ===== */}
        {tab === 'protocol' && (
          <div className={styles.tool}>

            {pgStep === 'goal' && (
              <div className={styles.step}>
                <h2 className={styles.stepTitle}>Step 1 of 2: Your Primary Goal</h2>
                <p className={styles.stepSub}>What is your number one health goal right now?</p>
                <div className={styles.goalList}>
                  {GOALS.map(g => (
                    <button
                      key={g.value}
                      className={`${styles.goalBtn} ${pgGoal === g.value ? styles.goalBtnActive : ''}`}
                      onClick={() => setPgGoal(g.value)}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
                <div className={styles.stepNav}>
                  <span />
                  <button
                    className={shared.btnPrimary}
                    disabled={!pgGoal}
                    onClick={() => setPgStep('symptoms')}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {pgStep === 'symptoms' && (
              <div className={styles.step}>
                <h2 className={styles.stepTitle}>Step 2 of 2: Your Symptoms</h2>
                <p className={styles.stepSub}>Check everything you experience regularly. This personalizes your protocol.</p>
                {SYMPTOM_GROUPS.map(group => (
                  <div key={group} className={styles.symptomGroup}>
                    <p className={styles.symptomGroupLabel}>{group}</p>
                    {SYMPTOMS.filter(s => s.group === group).map(s => (
                      <label key={s.id} className={styles.checkLabel}>
                        <input
                          type="checkbox"
                          checked={pgSymptoms.includes(s.id)}
                          onChange={() => toggleSymptom(s.id)}
                          className={styles.checkInput}
                        />
                        {s.label}
                      </label>
                    ))}
                  </div>
                ))}
                <div className={styles.stepNav}>
                  <button className={shared.btnGhost} onClick={() => setPgStep('goal')}>Back</button>
                  <button className={shared.btnPrimary} onClick={() => setPgStep('results')}>
                    Generate My Protocol
                  </button>
                </div>
              </div>
            )}

            {pgStep === 'gate' && (
              <div className={styles.step}>
                <div className={styles.gateCard}>
                  <p className={styles.gateEyebrow}>Your protocol is ready.</p>
                  <h2 className={styles.gateTitle}>Enter your email to view your personalized 90-day roadmap.</h2>
                  <p className={styles.gateSub}>No spam. You will receive your roadmap plus periodic functional medicine education. Unsubscribe anytime.</p>
                  <form onSubmit={submitGate} className={styles.gateForm}>
                    <input
                      type="text"
                      placeholder="First name (optional)"
                      value={pgName}
                      onChange={e => setPgName(e.target.value)}
                      className={styles.gateInput}
                    />
                    <input
                      type="email"
                      placeholder="Your email address"
                      value={pgEmail}
                      onChange={e => setPgEmail(e.target.value)}
                      required
                      className={styles.gateInput}
                    />
                    <button type="submit" className={shared.btnPrimary} disabled={pgSending || !pgEmail}>
                      {pgSending ? 'Sending...' : 'View My Roadmap'}
                    </button>
                  </form>
                  <button className={styles.gateBack} onClick={() => setPgStep('symptoms')}>Back</button>
                </div>
              </div>
            )}

            {pgStep === 'results' && blueprint && (
              <div className={styles.results}>
                {pgDone && pgName && (
                  <p className={styles.resultsGreeting}>Here is your protocol, {pgName}.</p>
                )}

                <div className={`${styles.blueprintCard} ${styles[`blueprint_${blueprint.key}`]}`}>
                  <p className={styles.blueprintLabel}>Your Metabolic Blueprint</p>
                  <h2 className={styles.blueprintName}>{blueprint.name}</h2>
                  <p className={styles.blueprintDesc}>{blueprint.desc}</p>
                </div>

                <h3 className={styles.sectionTitle}>Your 90-Day Roadmap</h3>
                {PHASES.map(p => (
                  <div key={p.phase} className={styles.phaseCard}>
                    <div className={styles.phaseHeader}>
                      <span className={styles.phaseLabel}>{p.phase}</span>
                      <span className={styles.phaseTheme}>{p.theme}</span>
                    </div>
                    <ul className={styles.phaseList}>
                      {p.steps.map((step, i) => (
                        <li key={i} className={styles.phaseItem}>{step}</li>
                      ))}
                    </ul>
                  </div>
                ))}

                {additions.length > 0 && (
                  <div className={styles.additionsCard}>
                    <h3 className={styles.additionsTitle}>Personalized for Your Pattern</h3>
                    <ul className={styles.phaseList}>
                      {additions.map((a, i) => <li key={i} className={styles.phaseItem}>{a}</li>)}
                    </ul>
                  </div>
                )}

                <div className={styles.disclaimer}>
                  This is educational content, not medical advice. Coordinate any new protocol with your healthcare provider.
                </div>

                {!pgDone && (
                  <div className={styles.gateCard}>
                    <p className={styles.gateEyebrow}>Save your roadmap</p>
                    <h2 className={styles.gateTitle}>Get this roadmap in your inbox.</h2>
                    <p className={styles.gateSub}>We will send your personalized protocol plus weekly functional medicine education from Dr. Hunter. Unsubscribe anytime.</p>
                    <form onSubmit={submitGate} className={styles.gateForm}>
                      <input
                        type="text"
                        placeholder="First name (optional)"
                        value={pgName}
                        onChange={e => setPgName(e.target.value)}
                        className={styles.gateInput}
                      />
                      <input
                        type="email"
                        placeholder="Your email address"
                        value={pgEmail}
                        onChange={e => setPgEmail(e.target.value)}
                        required
                        className={styles.gateInput}
                      />
                      <button type="submit" className={shared.btnPrimary} disabled={pgSending || !pgEmail}>
                        {pgSending ? 'Sending...' : 'Send My Roadmap'}
                      </button>
                    </form>
                  </div>
                )}
                {pgDone && (
                  <p className={styles.gateSent}>Roadmap sent to {pgEmail}. Check your inbox.</p>
                )}

                <div className={styles.ctaCard}>
                  <h3 className={styles.ctaTitle}>Want the full version with labs and medication insights?</h3>
                  <p className={styles.ctaSub}>Members of Hunter's Holistic Health get the complete protocol generator with lab value interpretation, drug-nutrient depletion education, and a personalized supplement framework.</p>
                  <Link to="/join" className={shared.btnPrimary}>Join to Access the Full Tool</Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== HOMA-IR CALCULATOR ===== */}
        {tab === 'homa' && (
          <div className={styles.tool}>
            <div className={styles.homaIntro}>
              <h2 className={styles.stepTitle}>HOMA-IR: Your Insulin Resistance Score</h2>
              <p className={styles.stepSub}>
                HOMA-IR (Homeostatic Model Assessment of Insulin Resistance) uses two fasting lab values to estimate how well your body is responding to insulin. It is one of the most clinically useful numbers you are not being told about.
              </p>
            </div>
            <form onSubmit={calcHoma} className={styles.homaForm}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Fasting Insulin (µU/mL)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={homaInsulin}
                  onChange={e => setHomaInsulin(e.target.value)}
                  placeholder="e.g. 8"
                  className={styles.formInput}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Fasting Glucose</label>
                <div className={styles.unitToggle}>
                  <button
                    type="button"
                    className={`${styles.unitBtn} ${homaUnit === 'mgdl' ? styles.unitBtnActive : ''}`}
                    onClick={() => setHomaUnit('mgdl')}
                  >
                    mg/dL
                  </button>
                  <button
                    type="button"
                    className={`${styles.unitBtn} ${homaUnit === 'mmol' ? styles.unitBtnActive : ''}`}
                    onClick={() => setHomaUnit('mmol')}
                  >
                    mmol/L
                  </button>
                </div>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  value={homaGlucose}
                  onChange={e => setHomaGlucose(e.target.value)}
                  placeholder={homaUnit === 'mgdl' ? 'e.g. 90' : 'e.g. 5.0'}
                  className={styles.formInput}
                  required
                />
              </div>
              <button type="submit" className={shared.btnPrimary}>Calculate HOMA-IR</button>
            </form>

            {homaResult !== null && (() => {
              const { label, color } = homaLabel(homaResult)
              return (
                <div className={styles.homaResult}>
                  <p className={styles.homaScore} style={{ color }}>
                    {homaResult.toFixed(2)}
                  </p>
                  <p className={styles.homaLabel} style={{ color }}>{label}</p>
                  <div className={styles.homaScale}>
                    <div className={styles.homaScaleRow}>
                      <span>Under 1.0</span><span className={styles.homaGood}>Optimal</span>
                    </div>
                    <div className={styles.homaScaleRow}>
                      <span>1.0 to 1.9</span><span className={styles.homaWarn}>Borderline</span>
                    </div>
                    <div className={styles.homaScaleRow}>
                      <span>1.9 to 2.9</span><span className={styles.homaHigh}>Early IR</span>
                    </div>
                    <div className={styles.homaScaleRow}>
                      <span>Above 2.9</span><span className={styles.homaDanger}>Significant IR</span>
                    </div>
                  </div>
                  <p className={styles.homaNote}>
                    HOMA-IR is a non-diagnostic educational estimate. It is most useful when tracked over time as you implement lifestyle changes. Bring this number to your provider.
                  </p>
                </div>
              )
            })()}

            <div className={styles.homaEducation}>
              <h3 className={styles.homaEdTitle}>Why this number matters</h3>
              <p>Insulin resistance is the root driver of Type 2 diabetes, PCOS, fatty liver, and cardiovascular disease. Most people with insulin resistance have a normal fasting glucose for years before a diagnosis. HOMA-IR catches the pattern earlier because it measures how hard your pancreas is working to maintain that glucose number.</p>
              <p>A fasting glucose of 90 mg/dL with a fasting insulin of 15 µU/mL gives a HOMA-IR of 3.4: significant insulin resistance, despite a "normal" glucose. That is the gap this tool closes.</p>
            </div>

            <div className={styles.ctaCard}>
              <h3 className={styles.ctaTitle}>Track your HOMA-IR over time inside the app.</h3>
              <p className={styles.ctaSub}>Members log blood sugar and get a full metabolic protocol built around their pattern, including lab-specific education and supplement education.</p>
              <Link to="/join" className={shared.btnPrimary}>Join Hunter's Holistic Health</Link>
            </div>
          </div>
        )}
      </div>

      <section className={styles.moreTools}>
        <h2 className={styles.moreTitle}>More Free Tools</h2>
        <div className={styles.moreGrid}>
          <Link to="/why-cant-i-lose-weight" className={styles.moreCard}>
            <div className={styles.moreCardEyebrow}>18-Question Assessment</div>
            <div className={styles.moreCardName}>Root Cause Weight-Loss Quiz</div>
            <div className={styles.moreCardDesc}>Find the hormonal, thyroid, gut, or insulin driver keeping you stuck. Maps 6 root-cause patterns with labs to request.</div>
            <span className={styles.moreCardCta}>Take the Quiz →</span>
          </Link>
          <Link to="/tools/medication-nutrient-checker" className={styles.moreCard}>
            <div className={styles.moreCardEyebrow}>Drug-Nutrient Interactions</div>
            <div className={styles.moreCardName}>Medication Nutrient Checker</div>
            <div className={styles.moreCardDesc}>Select your medications and herbs. See which nutrients are depleted, with clinical evidence and a personalized supplement timing schedule.</div>
            <span className={styles.moreCardCta}>Check My Medications →</span>
          </Link>
          <Link to="/glp1-candidate-assessment" className={styles.moreCard}>
            <div className={styles.moreCardEyebrow}>15-Question Educational Assessment</div>
            <div className={styles.moreCardName}>Am I a GLP-1 Candidate?</div>
            <div className={styles.moreCardDesc}>Honest clinical read on whether Ozempic, Wegovy, Zepbound, or Foundayo fits your profile, or whether root-cause work should come first.</div>
            <span className={styles.moreCardCta}>Take the Assessment →</span>
          </Link>
          <Link to="/tools/supplement-timing" className={styles.moreCard}>
            <div className={styles.moreCardEyebrow}>PharmD Timing Reference</div>
            <div className={styles.moreCardName}>Supplement Timing Guide</div>
            <div className={styles.moreCardDesc}>When to take magnesium, iron, vitamin D, B vitamins, and more. Which nutrients cancel each other out. The pairings that actually boost absorption.</div>
            <span className={styles.moreCardCta}>View the Guide →</span>
          </Link>
          <Link to="/tools/hormone-challenge" className={styles.moreCard}>
            <div className={styles.moreCardEyebrow}>28-Day Challenge</div>
            <div className={styles.moreCardName}>Hormone Intelligence Challenge</div>
            <div className={styles.moreCardDesc}>Track your cycle phases, mood, energy, and daily habits over 28 days. Understand how your hormonal cycle drives your energy, mood, and metabolic patterns.</div>
            <span className={styles.moreCardCta}>Start the Challenge →</span>
          </Link>
          <Link to="/tools/flat-belly-reset" className={styles.moreCard}>
            <div className={styles.moreCardEyebrow}>5-Day Reset</div>
            <div className={styles.moreCardName}>Flat Belly Reset</div>
            <div className={styles.moreCardDesc}>The cortisol-belly connection explained. Dead bug core exercise, protein-first eating, and the 3-supplement cortisol stack. Not willpower.</div>
            <span className={styles.moreCardCta}>Start Day 1 →</span>
          </Link>
          <Link to="/tools/nervous-system-reset" className={styles.moreCard}>
            <div className={styles.moreCardEyebrow}>7-Day Reset</div>
            <div className={styles.moreCardName}>Nervous System Reset</div>
            <div className={styles.moreCardDesc}>7 days of HPA axis dysregulation education with daily breathing practices, vagal tone exercises, and the adaptogenic supplement stack for cortisol recovery.</div>
            <span className={styles.moreCardCta}>Start Day 1 →</span>
          </Link>
          <Link to="/tools/hormone-visit-prep" className={styles.moreCard}>
            <div className={styles.moreCardEyebrow}>17-Condition Visit Prep</div>
            <div className={styles.moreCardName}>Hormone Visit Prep Tool</div>
            <div className={styles.moreCardDesc}>Symptom checklists, functional lab ranges, and a printable doctor brief for 17 hormone conditions including PCOS, hypothyroidism, perimenopause, and more. Built by a PharmD.</div>
            <span className={styles.moreCardCta}>Use the Tool →</span>
          </Link>
        </div>
      </section>

      <section className={styles.moreTools}>
        <h2 className={styles.moreTitle}>Free Reading: From the Blog</h2>
        <div className={styles.moreGrid}>
          <Link to="/blog/why-meal-planning-apps-fail" className={styles.moreCard}>
            <div className={styles.moreCardEyebrow}>Platform Feature</div>
            <div className={styles.moreCardName}>Why Your Meal Planning App Has Never Actually Worked</div>
            <div className={styles.moreCardDesc}>The real reason AI food trackers fail, why the strategies from your 20s don't work anymore, and what a metabolic-first approach actually looks like.</div>
            <span className={styles.moreCardCta}>Read →</span>
          </Link>
          <Link to="/blog/metabolic-health-beyond-weight-loss" className={styles.moreCard}>
            <div className={styles.moreCardEyebrow}>Metabolic Health</div>
            <div className={styles.moreCardName}>Metabolic Health Is Not a Number on a Scale</div>
            <div className={styles.moreCardDesc}>Only 12% of American adults are metabolically healthy. Dr. Hunter, CFNMP, Functional Medicine Educator, explains the five markers, the insulin-resistance continuum, and why standard labs miss most of it.</div>
            <span className={styles.moreCardCta}>Read →</span>
          </Link>
          <Link to="/blog/glp1-side-effects-pharmacist-guide" className={styles.moreCard}>
            <div className={styles.moreCardEyebrow}>GLP-1 Education</div>
            <div className={styles.moreCardName}>GLP-1 Side Effects: Dr. Hunter's Complete Guide</div>
            <div className={styles.moreCardDesc}>Nausea, muscle loss, rebound weight — what the prescribing data actually shows and how to reduce each risk with a root-cause protocol running alongside.</div>
            <span className={styles.moreCardCta}>Read →</span>
          </Link>
          <Link to="/blog/glp1-muscle-loss-what-nobody-tells-you" className={styles.moreCard}>
            <div className={styles.moreCardEyebrow}>GLP-1 Education</div>
            <div className={styles.moreCardName}>GLP-1 and Muscle Loss: What Nobody Tells You</div>
            <div className={styles.moreCardDesc}>On average, 25 to 39% of weight lost on GLP-1s is lean mass. Dr. Hunter, PharmD, CFNMP, explains why this matters, and what the evidence says to do about it.</div>
            <span className={styles.moreCardCta}>Read →</span>
          </Link>
          <Link to="/blog/68-percent-glp1-weight-regain-how-to-beat-it" className={styles.moreCard}>
            <div className={styles.moreCardEyebrow}>GLP-1 Education</div>
            <div className={styles.moreCardName}>68% of GLP-1 Users Regain the Weight. Here Is How to Beat It.</div>
            <div className={styles.moreCardDesc}>The SURMOUNT-4 trial data is clear: most weight returns within a year of stopping. The research on what actually prevents rebound.</div>
            <span className={styles.moreCardCta}>Read →</span>
          </Link>
          <Link to="/blog/glp1-supplements-what-actually-works" className={styles.moreCard}>
            <div className={styles.moreCardEyebrow}>GLP-1 Education</div>
            <div className={styles.moreCardName}>GLP-1 Supplements: What Actually Works</div>
            <div className={styles.moreCardDesc}>Berberine, magnesium, B12, creatine, omega-3s. Which supplements have evidence behind them on GLP-1 therapy and which are noise.</div>
            <span className={styles.moreCardCta}>Read →</span>
          </Link>
          <Link to="/blog/functional-labs-glp1-what-to-test" className={styles.moreCard}>
            <div className={styles.moreCardEyebrow}>GLP-1 Education</div>
            <div className={styles.moreCardName}>Functional Labs for GLP-1 Users: What to Test Before You Start</div>
            <div className={styles.moreCardDesc}>HOMA-IR, fasting insulin, CRP, ferritin, B12. The labs that tell the full story before and during GLP-1 therapy.</div>
            <span className={styles.moreCardCta}>Read →</span>
          </Link>
          <Link to="/blog/glp1-comparison-ozempic-wegovy-mounjaro-zepbound" className={styles.moreCard}>
            <div className={styles.moreCardEyebrow}>GLP-1 Education</div>
            <div className={styles.moreCardName}>Ozempic vs. Wegovy vs. Mounjaro vs. Zepbound: What the Data Says</div>
            <div className={styles.moreCardDesc}>Dr. Hunter, PharmD, CFNMP, breaks down the head-to-head efficacy, side effect profiles, and cost differences between all four major GLP-1 options.</div>
            <span className={styles.moreCardCta}>Read →</span>
          </Link>
        </div>
      </section>

      <footer className={styles.footer}>
        <p>These tools are for educational purposes only and do not constitute medical advice. Always consult your healthcare provider before making changes to your health routine.</p>
        <div className={styles.footerLinks}>
          <Link to="/">Home</Link>
          <Link to="/join">Join</Link>
          <Link to="/shop">Shop</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/privacy">Privacy</Link>
        </div>
      </footer>
    </div>
  )
}
