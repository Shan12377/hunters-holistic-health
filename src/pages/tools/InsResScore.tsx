import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import s from './InsResScore.module.css'

interface Option {
  label: string
  points: number
}
interface Question {
  id: number
  text: string
  hint?: string
  options: Option[]
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: 'Where does your body primarily store weight?',
    options: [
      { label: 'Hips, thighs, lower body; upper body proportionally smaller', points: 0 },
      { label: 'Fairly even distribution', points: 1 },
      { label: 'Primarily abdomen/midsection, belly weight even when the rest of me is not heavy', points: 4 },
      { label: 'All over, including face and arms, with a puffy or swollen quality', points: 2 },
    ],
  },
  {
    id: 2,
    text: 'Approximate waist circumference?',
    hint: 'Measuring instructions: stand with bare skin, tape flat at navel level (midpoint between lowest rib and top of hip bone), measure after a normal exhale. Do not suck in or pull the tape tight.',
    options: [
      { label: 'Under 32 in (81 cm)', points: 0 },
      { label: '32-35 in (81-88 cm)', points: 2 },
      { label: '35-40 in (88-102 cm)', points: 4 },
      { label: 'Over 40 in (102 cm)', points: 6 },
      { label: "Haven't measured", points: 1 },
    ],
  },
  {
    id: 3,
    text: 'Fasting blood glucose history?',
    options: [
      { label: 'Under 90 mg/dL consistently', points: 0 },
      { label: '90-99 mg/dL, normal but higher end', points: 2 },
      { label: '100-125 mg/dL, pre-diabetic range', points: 5 },
      { label: '126 mg/dL or above, or diagnosed type 2 diabetes', points: 6 },
      { label: 'Never tested / do not know', points: 2 },
    ],
  },
  {
    id: 4,
    text: 'Cholesterol and triglyceride numbers?',
    options: [
      { label: 'Triglycerides under 100 AND HDL over 60', points: 0 },
      { label: 'Triglycerides 100-149 OR HDL 50-60', points: 1 },
      { label: 'Triglycerides 150-199 OR HDL under 50 (women)', points: 3 },
      { label: 'Triglycerides 200+ OR HDL under 40', points: 5 },
      { label: 'High triglycerides AND low HDL at the same time', points: 6 },
      { label: "Don't know my numbers", points: 1 },
    ],
  },
  {
    id: 5,
    text: 'Blood pressure history?',
    options: [
      { label: 'Consistently under 120/80', points: 0 },
      { label: 'Occasionally 120-129 / under 80', points: 1 },
      { label: '130-139 / 80-89', points: 2 },
      { label: '140/90 or above (treated or not)', points: 3 },
      { label: "Don't know", points: 1 },
    ],
  },
  {
    id: 6,
    text: 'Family history of diabetes or metabolic disease?',
    options: [
      { label: 'None that I am aware of', points: 0 },
      { label: 'One second-degree relative (grandparent / aunt / uncle)', points: 2 },
      { label: 'One first-degree relative (parent / sibling)', points: 3 },
      { label: 'Multiple first-degree relatives, or higher-risk background (South Asian, Hispanic, African American, Pacific Islander)', points: 5 },
    ],
  },
  {
    id: 7,
    text: 'Reproductive and hormonal history?',
    options: [
      { label: 'Regular cycles, no PCOS, no gestational diabetes', points: 0 },
      { label: 'Irregular periods or suspected but undiagnosed PCOS', points: 3 },
      { label: 'Diagnosed PCOS', points: 5 },
      { label: 'Gestational diabetes in a pregnancy', points: 5 },
      { label: 'Post-menopausal with new abdominal weight gain in the last 2-5 years', points: 3 },
      { label: 'Post-menopausal, no significant abdominal change', points: 0 },
    ],
  },
  {
    id: 8,
    text: 'Skin signs of insulin excess?',
    options: [
      { label: 'Neither of the following', points: 0 },
      { label: 'Skin tags at neck, armpits, or groin', points: 4 },
      { label: 'Dark, velvety patches under arms, on neck, or in groin (acanthosis nigricans)', points: 6 },
      { label: 'Both skin tags and dark patches', points: 7 },
    ],
  },
  {
    id: 9,
    text: 'Blood sugar stability between meals?',
    options: [
      { label: 'I comfortably go 5-6 hours without symptoms', points: 0 },
      { label: 'Hungry after 3-4 hours, no major symptoms', points: 1 },
      { label: 'Within 2-3 hours I get irritable, anxious, shaky, or headachy', points: 4 },
      { label: 'Dizzy, nauseous, or unwell if a meal is delayed; I keep snacks with me', points: 5 },
    ],
  },
  {
    id: 10,
    text: 'Carbohydrate response and cravings?',
    options: [
      { label: 'Minimal cravings', points: 0 },
      { label: 'Some afternoon cravings, manageable', points: 2 },
      { label: 'Strong afternoon or evening carb and sugar cravings', points: 3 },
      { label: 'Once I start carbs or sugar it feels almost automatic, hard to stop', points: 5 },
    ],
  },
  {
    id: 11,
    text: 'Energy after meals?',
    options: [
      { label: 'Energized or neutral after a balanced meal', points: 0 },
      { label: 'Mildly sleepy after large meals only', points: 1 },
      { label: 'Significant energy drop 30-90 minutes after most meals', points: 3 },
      { label: 'Need to nap after most substantial meals', points: 4 },
    ],
  },
  {
    id: 12,
    text: 'Exercise and physical activity?',
    options: [
      { label: '3 or more sessions per week, moderate to vigorous (strength or cardio)', points: 0 },
      { label: 'Regular walking, generally active, no structured exercise', points: 2 },
      { label: 'Mostly sedentary', points: 4 },
      { label: 'Want to be active but fatigue, pain, or low energy prevent consistency', points: 3 },
    ],
  },
  {
    id: 13,
    text: 'Weight and BMI context?',
    options: [
      { label: 'Healthy weight range', points: 0 },
      { label: 'BMI approximately 25-27', points: 2 },
      { label: 'BMI approximately 27-30', points: 3 },
      { label: 'BMI over 30', points: 5 },
    ],
  },
  {
    id: 14,
    text: 'Age?',
    options: [
      { label: 'Under 35', points: 0 },
      { label: '35-44', points: 1 },
      { label: '45-54', points: 2 },
      { label: '55 or older', points: 3 },
    ],
  },
  {
    id: 15,
    text: 'Prior clinical diagnosis or concern?',
    options: [
      { label: 'None raised', points: 0 },
      { label: '"Borderline blood sugar," "pre-diabetes," or "watch your sugar"', points: 4 },
      { label: 'Diagnosed metabolic syndrome', points: 6 },
      { label: 'A clinician has told me I have insulin resistance', points: 6 },
      { label: 'Told I have "high insulin" / hyperinsulinemia, or flagged elevated fasting insulin', points: 6 },
    ],
  },
]

type Phase = 'intro' | 'hasLabs' | 'quiz' | 'email' | 'result'

function getTier(score: number) {
  if (score <= 12) return 1
  if (score <= 22) return 2
  if (score <= 33) return 3
  return 4
}

const TIER_META = {
  1: {
    badge: 'Tier 1: Low Risk',
    badgeClass: 'tier1Badge',
    heading: 'Your insulin-resistance risk score is in the low range.',
    subhead: 'Your current pattern shows minimal signals of insulin dysregulation. Here\'s what keeps it that way.',
  },
  2: {
    badge: 'Tier 2: Early / Borderline',
    badgeClass: 'tier2Badge',
    heading: 'Your score suggests early to borderline insulin resistance.',
    subhead: 'This is the most reversible window there is. Here\'s what the evidence supports.',
  },
  3: {
    badge: 'Tier 3: Likely Insulin Resistance',
    badgeClass: 'tier3Badge',
    heading: 'Your score is consistent with significant insulin resistance.',
    subhead: 'Your profile shows clear signals of insulin dysregulation. Here\'s the clinical picture and what the evidence says about addressing it.',
  },
  4: {
    badge: 'Tier 4: High-Load IR',
    badgeClass: 'tier4Badge',
    heading: 'Your score is in the high-load insulin-resistance range.',
    subhead: 'This is a metabolic condition, not a willpower problem, and it\'s highly responsive to the right intervention.',
  },
}

export default function InsResScore() {
  useEffect(() => {
    document.title = 'Insulin Resistance Risk Score | Free 4-Minute Assessment'
    const desc = document.querySelector('meta[name="description"]')
    if (desc) desc.setAttribute('content', 'Get a numeric insulin-resistance risk score and find out which labs to request. A clinically weighted assessment using the same variables that predict IR in the research literature.')
  }, [])

  const [phase, setPhase] = useState<Phase>('intro')
  const [hasLabs, setHasLabs] = useState<boolean>(false)
  const [qIndex, setQIndex] = useState<number>(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [selected, setSelected] = useState<number | null>(null)
  const [nameVal, setNameVal] = useState('')
  const [emailVal, setEmailVal] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const totalScore = Object.values(answers).reduce((a, b) => a + b, 0)
  const tier = getTier(totalScore)
  const meta = TIER_META[tier as keyof typeof TIER_META]
  const progress = phase === 'quiz' ? ((qIndex) / QUESTIONS.length) * 100 : phase === 'email' ? 95 : phase === 'result' ? 100 : 0

  function handleOptionSelect(pts: number) {
    setSelected(pts)
  }

  function handleNext() {
    if (selected === null) return
    const newAnswers = { ...answers, [qIndex]: selected }
    setAnswers(newAnswers)
    setSelected(null)
    if (qIndex + 1 < QUESTIONS.length) {
      setQIndex(qIndex + 1)
    } else {
      setPhase('email')
    }
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!emailVal) { setPhase('result'); return }
    setSubmitting(true)
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 4000)
      await fetch('/api/beehiiv-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailVal, firstName: nameVal }),
        signal: controller.signal,
      })
      clearTimeout(timer)
    } catch { /* show result regardless */ }
    setSubmitting(false)
    setPhase('result')
  }

  return (
    <div className={s.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'MedicalWebPage',
              name: 'Insulin Resistance Risk Score',
              about: { '@type': 'MedicalCondition', name: 'Insulin resistance' },
              lastReviewed: '2026-07-14',
              reviewedBy: { '@type': 'Person', name: 'Dr. Shallanda Hunter, PharmD, CFNMP' },
            },
            {
              '@type': 'FAQPage',
              mainEntity: [
                { '@type': 'Question', name: 'Can you have insulin resistance with normal blood sugar?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. The pancreas produces extra insulin to keep glucose normal, so glucose can look fine while insulin is elevated. Fasting insulin and HOMA-IR are designed to catch this.' } },
                { '@type': 'Question', name: 'Why is fasting insulin not on standard bloodwork?', acceptedAnswer: { '@type': 'Answer', text: 'Standard panels measure fasting glucose, not insulin. Because insulin rises years before glucose, a normal glucose can hide insulin resistance. Fasting insulin must be requested specifically.' } },
                { '@type': 'Question', name: 'What is a good HOMA-IR?', acceptedAnswer: { '@type': 'Answer', text: 'Under 1.0 suggests optimal insulin sensitivity; around 2.0 or above is commonly used as an insulin-resistance threshold in research, though ranges vary by lab and population.' } },
              ],
            },
          ],
        }) }}
      />

      {/* Progress bar (quiz and email phases) */}
      {(phase === 'quiz' || phase === 'email') && (
        <div className={s.progressWrap}>
          <div className={s.progressTrack}>
            <div className={s.progressFill} style={{ width: `${progress}%` }} />
          </div>
          {phase === 'quiz' && (
            <div className={s.progressLabel}>Question {qIndex + 1} of {QUESTIONS.length}</div>
          )}
        </div>
      )}

      <div className={s.inner}>

        {/* INTRO */}
        {phase === 'intro' && (
          <div className={s.intro}>
            <div className={s.eyebrow}>PharmD, CFNMP Clinical Assessment</div>
            <h1 className={s.introTitle}>What's Your Insulin Resistance Risk Score?</h1>
            <p className={s.introSubhead}>
              Insulin resistance is one of the most common metabolic problems in women, and one of the most commonly missed on standard bloodwork.
            </p>
            <p className={s.introBody}>
              A routine metabolic panel measures fasting glucose, and glucose often stays normal for years while insulin quietly climbs to keep it there. Fasting insulin, the test that catches this early, is almost never included unless you specifically ask.
            </p>
            <p className={s.introBody}>
              This assessment identifies insulin-resistance risk from the signals that show up long before glucose does: the weight patterns, symptoms, lab values, and history that predict elevated insulin even when blood sugar looks "normal."
            </p>

            <div className={s.whatYouGet}>
              <div className={s.whatYouGetTitle}>What you will get</div>
              <ul className={s.whatYouGetList}>
                <li>A numeric risk score mapped to four clinical tiers (Low to High-Load)</li>
                <li>The exact labs to request, including the fasting insulin test most panels skip</li>
                <li>A prescriber script with the words to use at your appointment</li>
                <li>Evidence-informed next steps matched to your tier</li>
              </ul>
            </div>

            <div className={s.trustLine}>Weighted on real clinical predictors · PharmD, CFNMP framework · 4 minutes</div>
            <button className={s.startBtn} onClick={() => setPhase('hasLabs')}>
              Get My Score →
            </button>
          </div>
        )}

        {/* HAS LABS GATE */}
        {phase === 'hasLabs' && (
          <div className={s.hasLabsWrap}>
            <div className={s.eyebrow}>Before we begin</div>
            <div className={s.hasLabsTitle}>Do you have your most recent lab results available?</div>
            <p className={s.hasLabsBody}>
              Specifically: fasting glucose from any metabolic panel and fasting insulin (this one is rarely on a standard panel and must be ordered separately). If you have both, you can calculate your HOMA-IR at the end.
            </p>
            <div className={s.hasLabsBtns}>
              <button className={s.hasLabsBtn} onClick={() => { setHasLabs(true); setPhase('quiz') }}>
                Yes, I have my labs
              </button>
              <button className={s.hasLabsBtn} onClick={() => { setHasLabs(false); setPhase('quiz') }}>
                No, proceed without labs
              </button>
            </div>
          </div>
        )}

        {/* QUIZ */}
        {phase === 'quiz' && (
          <div className={s.qWrap}>
            <div className={s.qNumber}>Question {qIndex + 1} of {QUESTIONS.length}</div>
            <div className={s.qText}>{QUESTIONS[qIndex].text}</div>
            {QUESTIONS[qIndex].hint && (
              <div className={s.qHint}>{QUESTIONS[qIndex].hint}</div>
            )}
            <div className={s.options}>
              {QUESTIONS[qIndex].options.map((opt, i) => (
                <button
                  key={i}
                  className={`${s.optionBtn} ${selected === opt.points && answers[qIndex] === undefined ? s.optionSelected : ''} ${selected !== null && selected === opt.points ? s.optionSelected : ''}`}
                  onClick={() => handleOptionSelect(opt.points)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <button className={s.nextBtn} disabled={selected === null} onClick={handleNext}>
              {qIndex + 1 < QUESTIONS.length ? 'Next →' : 'See My Results →'}
            </button>
          </div>
        )}

        {/* EMAIL GATE */}
        {phase === 'email' && (
          <div className={s.emailGate}>
            <div className={s.emailTitle}>Your results are ready.</div>
            <p className={s.emailBody}>
              Your full risk breakdown is on the next screen. Add your email to also receive Dr. Hunter's weekly functional medicine insights.
            </p>
            <form onSubmit={handleEmailSubmit} className={s.emailForm}>
              <input
                className={s.emailInput}
                type="text"
                placeholder="First name (optional)"
                value={nameVal}
                onChange={e => setNameVal(e.target.value)}
              />
              <input
                className={s.emailInput}
                type="email"
                placeholder="Email address"
                value={emailVal}
                onChange={e => setEmailVal(e.target.value)}
              />
              <button type="submit" className={s.emailSubmitBtn} disabled={submitting}>
                {submitting ? 'One moment...' : 'See My Results →'}
              </button>
            </form>
            <button className={s.emailSkip} onClick={() => setPhase('result')}>
              Skip and see results
            </button>
          </div>
        )}

        {/* RESULT */}
        {phase === 'result' && (
          <div className={s.result}>
            <button className={s.pdfBtn} onClick={() => window.print()}>
              ↓ Download as PDF
            </button>

            <div className={`${s.scoreBadge} ${s[meta.badgeClass]}`}>{meta.badge}</div>
            <h2 className={s.resultHeading}>{meta.heading}</h2>
            <p className={s.resultSubhead}>{meta.subhead}</p>

            <div className={s.scoreDisplay}>
              <div className={s.scoreNumber}>{totalScore}</div>
              <div className={s.scoreContext}>
                <strong>Your score</strong>
                <br />
                {tier === 1 && 'Range 0-12: Low risk'}
                {tier === 2 && 'Range 13-22: Early / borderline'}
                {tier === 3 && 'Range 23-33: Likely insulin resistance'}
                {tier === 4 && 'Range 34+: High-load IR'}
              </div>
            </div>

            {/* HOMA-IR CTA if user has labs */}
            {hasLabs && (
              <div className={s.homaCtaBox}>
                <div className={s.homaCtaTitle}>You have labs: calculate your actual HOMA-IR</div>
                <p className={s.homaCtaBody}>
                  HOMA-IR = (fasting insulin in µIU/mL x fasting glucose in mg/dL) divided by 405. A value under 1.0 suggests optimal sensitivity; around 2.0 or above suggests insulin resistance. The HOMA-IR calculator is available on the Foundation platform.
                </p>
                <a href={import.meta.env.VITE_STRIPE_FOUNDATION_MONTHLY || '/join'} className={s.homaCtaLink}>
                  Access HOMA-IR Calculator →
                </a>
              </div>
            )}

            {/* Tier 1 content */}
            {tier === 1 && (
              <>
                <div className={s.resultSection}>
                  <div className={s.resultSectionTitle}>What protects insulin sensitivity</div>
                  <div className={s.resultBody}>
                    Your profile does not suggest significant insulin resistance right now. Cells appear to respond normally to insulin, blood sugar is stable, and the downstream signs of hyperinsulinemia are not prominent. Insulin sensitivity is dynamic, not fixed, so the habits that protect it are worth knowing.
                  </div>
                  <div className={s.resultCard}>
                    <div className={s.resultCardTitle}>Resistance training</div>
                    <div className={s.resultCardBody}>Muscle contraction activates GLUT4 glucose transport independent of insulin. 2-3 sessions per week improves insulin sensitivity over time.</div>
                  </div>
                  <div className={s.resultCard}>
                    <div className={s.resultCardTitle}>Protein-first, carbohydrate-last meal structure</div>
                    <div className={s.resultCardBody}>Eating protein and vegetables before carbohydrates measurably blunts the post-meal glucose and insulin response. Same food, different order.</div>
                  </div>
                  <div className={s.resultCard}>
                    <div className={s.resultCardTitle}>Sleep</div>
                    <div className={s.resultCardBody}>Even a single night of short sleep can reduce insulin sensitivity by roughly 25% the next day in controlled studies. The effect reverses with restored sleep.</div>
                  </div>
                </div>
                <div className={s.resultSection}>
                  <div className={s.resultSectionTitle}>Optional baseline labs to know your number</div>
                  <div className={s.resultBody}>
                    Fasting insulin (request specifically, not on standard panels), fasting glucose, HOMA-IR, fasting lipid panel (triglycerides and HDL).
                  </div>
                </div>
              </>
            )}

            {/* Tier 2 content */}
            {tier === 2 && (
              <>
                <div className={s.resultSection}>
                  <div className={s.resultSectionTitle}>What early IR may be producing</div>
                  <div className={s.resultBody}>
                    Early IR means your cells need more insulin than normal to respond, but your pancreas is still compensating, so fasting glucose can look completely normal while fasting insulin is already climbing. This is the gap standard bloodwork misses: a clinician sees a fasting glucose of 88 and says "perfect," without seeing the insulin that produced it.
                    <br /><br />
                    The significance of Tier 2 is timing: intervention here has the highest probability of reversal, before beta-cell strain and downstream damage accumulate. Possible signs include difficulty losing weight despite effort, afternoon energy crashes, disproportionate carb cravings, and in PCOS, worsening androgenic symptoms.
                  </div>
                </div>
                <div className={s.resultSection}>
                  <div className={s.resultSectionTitle}>Labs to request</div>
                  <div className={s.resultBody}>
                    Fasting insulin, fasting glucose, HOMA-IR, HbA1c, fasting lipid panel (triglycerides and HDL), hsCRP. If PCOS is present or suspected: LH/FSH, free and total testosterone, DHEA-S, estradiol.
                  </div>
                  <div className={s.scriptBox}>
                    <div className={s.scriptLabel}>Prescriber script</div>
                    <div className={s.scriptText}>"I scored in the early insulin-resistance range on a screening tool. I'd like to rule out subclinical insulin resistance with a fasting insulin and HOMA-IR, not just fasting glucose: my glucose may be normal even if my insulin is elevated."</div>
                  </div>
                </div>
                <div className={s.resultSection}>
                  <div className={s.resultSectionTitle}>What the evidence supports at Tier 2</div>
                  <div className={s.resultCard}>
                    <div className={s.resultCardTitle}>Protein-first, carbohydrate-last sequencing</div>
                    <div className={s.resultCardBody}>Eating protein and vegetables before carbohydrates lowered post-meal glucose excursions by roughly half in clinical crossover studies. Same food, different order, meaningful result.</div>
                  </div>
                  <div className={s.resultCard}>
                    <div className={s.resultCardTitle}>Resistance training 2-3 times per week</div>
                    <div className={s.resultCardBody}>Improves insulin sensitivity via GLUT4 translocation, independent of diet. The most potent non-drug intervention available.</div>
                  </div>
                  <div className={s.resultCard}>
                    <div className={s.resultCardTitle}>Magnesium glycinate 300-400mg nightly</div>
                    <div className={s.resultCardBody}>Magnesium is a cofactor in insulin-receptor signaling, deficiency is common in IR, and supplementation improved HOMA-IR in randomized trials. Discuss with your clinician before starting.</div>
                  </div>
                </div>
              </>
            )}

            {/* Tier 3 content */}
            {tier === 3 && (
              <>
                <div className={s.resultSection}>
                  <div className={s.resultSectionTitle}>What Tier 3 IR does</div>
                  <div className={s.resultBody}>
                    At this level your pancreas is still compensating but working overtime, and the cellular resistance is significant enough to drive the classic cluster: visceral fat, lipid dysregulation, creeping blood pressure, and hormonal disruption.
                  </div>
                  <div className={s.resultCard}>
                    <div className={s.resultCardTitle}>Weight-loss resistance</div>
                    <div className={s.resultCardBody}>Chronically elevated insulin suppresses lipolysis, your fat cells are partially locked, which is why calorie restriction alone underperforms here.</div>
                  </div>
                  <div className={s.resultCard}>
                    <div className={s.resultCardTitle}>PCOS amplification (if applicable)</div>
                    <div className={s.resultCardBody}>Insulin stimulates ovarian androgen production, often before testosterone reads as abnormal on labs.</div>
                  </div>
                  <div className={s.resultCard}>
                    <div className={s.resultCardTitle}>Cardiovascular risk</div>
                    <div className={s.resultCardBody}>The triglyceride/HDL pattern is atherogenic dyslipidemia. Risk can be elevated even when LDL looks fine.</div>
                  </div>
                </div>
                <div className={s.resultSection}>
                  <div className={s.resultSectionTitle}>Labs (now a clinical priority)</div>
                  <div className={s.resultBody}>
                    Fasting insulin; fasting glucose; HOMA-IR; HbA1c; full lipid panel (triglycerides, HDL, LDL particle count where available); hsCRP and homocysteine; comprehensive metabolic panel; TSH, Free T3, Free T4, TPO antibodies. If PCOS suspected: LH/FSH, free testosterone, DHEA-S, estradiol, progesterone.
                  </div>
                  <div className={s.scriptBox}>
                    <div className={s.scriptLabel}>Prescriber script</div>
                    <div className={s.scriptText}>"I scored in the likely insulin-resistance range and would like a fasting insulin, HOMA-IR, full lipid panel, hsCRP, comprehensive metabolic panel, and a full thyroid panel. I understand blood sugar can look normal with significant insulin resistance." (If your doctor declines fasting insulin, major labs including LabCorp and Quest offer consumer-ordered testing in many states.)</div>
                  </div>
                </div>
                <div className={s.resultSection}>
                  <div className={s.resultSectionTitle}>What the evidence supports at Tier 3</div>
                  <div className={s.resultBody}>
                    Protein-first, lower-glycemic-load eating (30-40g protein per meal); resistance training (non-negotiable at this tier, the GLUT4 pathway bypasses IR at the cell level); and a conversation with your clinician about metformin (off-label use for insulin resistance without diabetes is well-established preventive practice, but it is a prescription decision made with a clinician, not a recommendation this tool can make). If BMI is 27 or above with comorbidities, GLP-1 evaluation may be appropriate alongside root-cause work.
                  </div>
                </div>
              </>
            )}

            {/* Tier 4 content */}
            {tier === 4 && (
              <>
                <div className={s.resultSection}>
                  <div className={s.resultSectionTitle}>What high-load IR does</div>
                  <div className={s.resultBody}>
                    High-load IR is what happens when early signals go unaddressed for years: the pancreas has been pushed toward its limit, and metabolic syndrome is either diagnosed or present subclinically. This is a turning point, not the end of the story. Even long-standing, high-load IR responds meaningfully to aggressive lifestyle plus targeted support, in the right sequence with the right monitoring.
                    <br /><br />
                    Lipolysis is nearly fully suppressed between meals (which is why very-low-calorie diets do little at this stage). Cardiovascular risk is understated by standard LDL-based calculators. The Diabetes Prevention Program showed intensive lifestyle intervention reduced progression from prediabetes to type 2 diabetes by 58%, versus 31% for metformin, over roughly 3 years. Both work, and combined they work better.
                  </div>
                </div>
                <div className={s.resultSection}>
                  <div className={s.resultSectionTitle}>Labs (order now, not at your next annual)</div>
                  <div className={s.resultBody}>
                    Fasting insulin; fasting glucose; HOMA-IR; HbA1c; full lipid panel with LDL particle count; comprehensive metabolic panel (ALT/AST, fatty liver is near-universal here); hsCRP, homocysteine, fibrinogen; TSH/Free T3/Free T4/TPO antibodies; uric acid; Vitamin D, RBC magnesium, zinc. If PCOS features are present: full androgen panel and LH/FSH.
                  </div>
                  <div className={s.scriptBox}>
                    <div className={s.scriptLabel}>Prescriber script</div>
                    <div className={s.scriptText}>"I scored in the high-load insulin-resistance range. I would like a comprehensive workup including fasting insulin, HOMA-IR, full lipid panel with particle count, comprehensive metabolic panel with liver enzymes, full thyroid panel, hsCRP, and uric acid. I understand this needs monitoring, not just a recheck at my next annual."</div>
                  </div>
                </div>
                <div className={s.resultSection}>
                  <div className={s.resultSectionTitle}>The intervention framework (clinical, monitored)</div>
                  <div className={s.resultBody}>
                    <strong>Foundational:</strong> 30-40g protein per meal; resistance training 3 times per week; 7,000-10,000 steps daily; 7-9 hours of sleep with sleep-apnea evaluation if indicated.
                    <br /><br />
                    <strong>Nutraceutical (discuss with a clinician before starting):</strong> magnesium glycinate approximately 400mg nightly; myo-inositol 2-4g per day. Chromium and alpha-lipoic acid have more modest, mixed evidence and are adjunctive. Correct Vitamin D and zinc deficiencies if confirmed by labs.
                    <br /><br />
                    <strong>Pharmacological (prescription decisions with a clinician only):</strong> off-label metformin is a strongly warranted conversation at this tier (improves HOMA-IR, well-tolerated, 60+ year safety record). GLP-1 evaluation is clinically appropriate if BMI criteria are met. These are decisions your clinician makes with you, not recommendations this tool can provide.
                  </div>
                </div>
              </>
            )}

            <hr className={s.divider} />

            {/* CTA */}
            <div className={s.ctaBlock}>
              <div className={s.ctaTitle}>Ready to build a protocol around your root cause?</div>
              <p className={s.ctaBody}>
                The assessment tells you where you likely fall on the spectrum. A functional medicine educator maps the sequence: which interventions to prioritize, in which order, at the right approach for your specific situation.
              </p>
              <a href={import.meta.env.VITE_STRIPE_FOUNDATION_MONTHLY || '/join'} className={s.ctaBtn}>
                Start Foundation Plan, $37/mo →
              </a>
              <div className={s.ctaSub}>
                Cancel anytime. &nbsp;·&nbsp; <Link to="/join" style={{ color: 'inherit', textDecoration: 'underline' }}>Have questions first?</Link>
              </div>
              <div className={s.ctaSub} style={{ marginTop: '0.5rem' }}>
                Bookmark this page to save your results (Cmd+D / Ctrl+D).
              </div>
            </div>

            {/* Companion tools */}
            <div className={s.resultSection}>
              <div className={s.resultSectionTitle}>Companion assessments</div>
              <div className={s.resultBody}>
                <Link to="/why-cant-i-lose-weight" style={{ color: 'var(--teal)', textDecoration: 'underline' }}>Root Cause Weight-Loss Assessment</Link> · <Link to="/glp1-candidate-assessment" style={{ color: 'var(--teal)', textDecoration: 'underline' }}>GLP-1 Candidate Assessment</Link>
              </div>
            </div>

            <div className={s.dshea}>
              <strong>These statements have not been evaluated by the Food and Drug Administration. This content is not intended to diagnose, treat, cure, or prevent any disease.</strong> This tool is educational and is not medical advice, diagnosis, or treatment. Scores are estimates from self-reported data and do not constitute a diagnosis of insulin resistance or any condition. Talk with your qualified healthcare provider before starting any supplement or making medical decisions, especially if you take other medications, are pregnant, or are breastfeeding.
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
