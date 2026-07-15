import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import s from './Glp1Assessment.module.css'

type Code = 'STRONG' | 'FUNC' | 'CAUTION'
type Scores = Record<Code, number>
type Phase = 'intro' | 'quiz' | 'email' | 'result'

interface Opt {
  id: string
  text: string
  scores: Partial<Scores>
  exclusive?: boolean
  flags?: string[]
}

interface Question {
  text: string
  section: string
  note?: string
  multi?: boolean
  opts: Opt[]
}

const QUESTIONS: Question[] = [
  {
    text: 'What best describes your current weight situation?',
    section: 'Weight and medical profile',
    note: 'BMI at or above 30, or at or above 27 with a weight-related condition, is the FDA-approved threshold for GLP-1 weight indications.',
    opts: [
      { id: 'a', text: 'I want to lose 10-20 lb for aesthetic reasons; my doctor has not raised medical concern', scores: { FUNC: 3 } },
      { id: 'b', text: 'My BMI is roughly 27-29 and I have at least one weight-related condition (high blood pressure, pre-diabetes, high cholesterol, or sleep apnea)', scores: { STRONG: 3 } },
      { id: 'c', text: 'My BMI is 30 or above', scores: { STRONG: 3 } },
      { id: 'd', text: 'My doctor has expressed direct concern about my weight, or I have been referred for weight management', scores: { STRONG: 2 } },
    ],
  },
  {
    text: 'How long has significant excess weight been part of your picture?',
    section: 'Weight and medical profile',
    opts: [
      { id: 'a', text: 'Less than 2 years; relatively new, possibly tied to a specific event', scores: { FUNC: 2 } },
      { id: 'b', text: '2-5 years, without lasting results', scores: { STRONG: 1 } },
      { id: 'c', text: 'More than 5 years, long-standing and worsening', scores: { STRONG: 2 } },
      { id: 'd', text: 'My entire adult life', scores: { STRONG: 3 } },
    ],
  },
  {
    text: 'What have you tried for weight loss in the last 3 years? (Select all that apply)',
    section: 'Weight and medical profile',
    multi: true,
    opts: [
      { id: 'a', text: 'More than two structured calorie-restricted diets', scores: { STRONG: 2 } },
      { id: 'b', text: 'A medically supervised weight-loss program', scores: { STRONG: 2 } },
      { id: 'c', text: 'Prescription weight-loss medication (phentermine, topiramate, bupropion/naltrexone, or similar)', scores: { STRONG: 2 } },
      { id: 'd', text: 'Bariatric surgery evaluation or the surgery itself', scores: { STRONG: 3 } },
      { id: 'e', text: 'I have not yet committed to a serious structured approach', scores: { FUNC: 2 }, exclusive: true },
    ],
  },
  {
    text: 'Do you have any of these diagnosed conditions? (Select all that apply)',
    section: 'Weight and medical profile',
    multi: true,
    opts: [
      { id: 'a', text: 'Type 2 diabetes or pre-diabetes', scores: { STRONG: 4 } },
      { id: 'b', text: 'Non-alcoholic fatty liver disease (NAFLD, MASLD, NASH, or MASH)', scores: { STRONG: 3 } },
      { id: 'c', text: 'High blood pressure requiring medication', scores: { STRONG: 2 } },
      { id: 'd', text: 'Sleep apnea (diagnosed or strongly suspected)', scores: { STRONG: 2 } },
      { id: 'e', text: 'Insulin resistance or metabolic syndrome (clinician-diagnosed)', scores: { STRONG: 3 } },
      { id: 'f', text: 'PCOS', scores: { STRONG: 2 } },
      { id: 'g', text: 'Established cardiovascular disease (prior heart attack, stroke, or diagnosed coronary artery disease)', scores: { STRONG: 4 }, flags: ['cvd'] },
      { id: 'h', text: 'None of the above', scores: { FUNC: 2 }, exclusive: true },
    ],
  },
  {
    text: 'Critical safety screen. Please read each option carefully. (Select all that apply)',
    section: 'Safety screening',
    multi: true,
    note: 'Options A and B are formal FDA contraindications with a boxed warning for the entire GLP-1 class.',
    opts: [
      { id: 'a', text: 'Personal history of medullary thyroid carcinoma (MTC)', scores: { CAUTION: 6 }, flags: ['mtc'] },
      { id: 'b', text: 'Personal or family history of Multiple Endocrine Neoplasia type 2 (MEN 2)', scores: { CAUTION: 6 }, flags: ['men2'] },
      { id: 'c', text: 'Thyroid nodules or a history of any thyroid cancer (non-medullary)', scores: { CAUTION: 3 }, flags: ['thyroidNodules'] },
      { id: 'd', text: 'Personal history of pancreatitis', scores: { CAUTION: 4 }, flags: ['pancreatitis'] },
      { id: 'e', text: 'Gallbladder disease, gallstones, or gallbladder removal', scores: { CAUTION: 2 }, flags: ['gallbladder'] },
      { id: 'f', text: 'None of the above', scores: { STRONG: 1 }, exclusive: true },
    ],
  },
  {
    text: 'How would you describe your relationship with food and eating?',
    section: 'Eating patterns',
    opts: [
      { id: 'a', text: 'I eat reasonably but struggle with weight; hunger and cravings are real challenges', scores: { STRONG: 3 } },
      { id: 'b', text: 'I experience significant binge eating: large quantities, feeling out of control', scores: { CAUTION: 3 }, flags: ['binge'] },
      { id: 'c', text: 'History of restricting, intense fear of weight gain, or treatment for anorexia or bulimia', scores: { CAUTION: 4 }, flags: ['restrictiveED'] },
      { id: 'd', text: 'My eating is driven by stress, emotions, and environment more than hunger', scores: { FUNC: 3 } },
    ],
  },
  {
    text: 'Have you used a GLP-1 medication before?',
    section: 'GLP-1 history',
    opts: [
      { id: 'a', text: 'No; this would be my first time', scores: { STRONG: 1 } },
      { id: 'b', text: 'Yes; it worked well, but I stopped due to cost, insurance, or supply issues', scores: { STRONG: 4 }, flags: ['confirmedResponder'] },
      { id: 'c', text: 'Yes; I stopped because of side effects (nausea, vomiting, fatigue, or constipation)', scores: { CAUTION: 2 }, flags: ['priorSideEffects'] },
      { id: 'd', text: 'Yes; I completed therapeutic dosing with minimal weight loss', scores: { FUNC: 3 } },
      { id: 'e', text: 'Yes; I lost weight but regained most or all after stopping', scores: { FUNC: 3 } },
    ],
  },
  {
    text: 'What are your goals with GLP-1 therapy?',
    section: 'Goals and expectations',
    opts: [
      { id: 'a', text: 'Lose weight as fast as possible', scores: { FUNC: 2 } },
      { id: 'b', text: 'Reach and maintain a healthier metabolic weight and lower disease risk', scores: { STRONG: 3 } },
      { id: 'c', text: 'Get blood sugar, blood pressure, or other markers under control; weight is secondary', scores: { STRONG: 4 } },
      { id: 'd', text: 'Try it a few months, then stop once I hit my goal', scores: { CAUTION: 2 }, flags: ['expectationMismatch'] },
    ],
  },
  {
    text: 'What do you know about your kidney health?',
    section: 'Safety screening',
    opts: [
      { id: 'a', text: 'Recently tested, normal', scores: { STRONG: 1 } },
      { id: 'b', text: 'Chronic kidney disease, or my doctor has raised kidney concerns', scores: { CAUTION: 3 }, flags: ['ckd'] },
      { id: 'c', text: 'No recent kidney labs, or I do not know', scores: { CAUTION: 1 } },
    ],
  },
  {
    text: 'How is your digestive system on a typical day?',
    section: 'Safety screening',
    opts: [
      { id: 'a', text: 'Generally fine', scores: { STRONG: 2 } },
      { id: 'b', text: 'Some food sensitivity, but nothing disruptive', scores: { STRONG: 1 } },
      { id: 'c', text: 'Sensitive stomach; nausea, reflux, or discomfort is regular', scores: { CAUTION: 2 } },
      { id: 'd', text: 'Diagnosed gastroparesis, severe GERD, severe IBS, or another significant GI condition', scores: { CAUTION: 4 }, flags: ['gastroparesis'] },
    ],
  },
  {
    text: 'What does your cardiovascular picture look like?',
    section: 'Weight and medical profile',
    opts: [
      { id: 'a', text: 'Generally healthy, no significant history or risk factors', scores: { STRONG: 1 } },
      { id: 'b', text: 'Elevated risk factors (high blood pressure, high cholesterol, strong family history, or smoking)', scores: { STRONG: 3 } },
      { id: 'c', text: 'Established cardiovascular disease (prior heart attack, stroke, bypass, or stenting)', scores: { STRONG: 4 }, flags: ['cvd'] },
      { id: 'd', text: 'Heart failure or a complex cardiac condition under active management', scores: { CAUTION: 2 } },
    ],
  },
  {
    text: 'What medications are you currently taking? (Select all that apply)',
    section: 'Medication review',
    multi: true,
    opts: [
      { id: 'a', text: 'No prescription medications', scores: { STRONG: 1 }, exclusive: true },
      { id: 'b', text: 'Blood pressure, cholesterol, or other metabolic medications', scores: { STRONG: 2 } },
      { id: 'c', text: 'Insulin for diabetes', scores: { CAUTION: 3 }, flags: ['insulin'] },
      { id: 'd', text: 'Sulfonylureas (glipizide, glyburide, glimepiride, or similar)', scores: { CAUTION: 2 }, flags: ['sulfonylurea'] },
      { id: 'e', text: 'Antidepressants, antipsychotics, or mood stabilizers', scores: { CAUTION: 2 }, flags: ['psychMeds'] },
    ],
  },
  {
    text: 'How are you thinking about access and cost?',
    section: 'Goals and expectations',
    note: 'The FDA declared GLP-1 shortages resolved (tirzepatide December 2024, semaglutide February 2025). Routine compounding of these medications is no longer permitted for most patients; in April 2026 the FDA moved to bar bulk compounding entirely. For most people, an FDA-approved brand or oral option is the appropriate path.',
    opts: [
      { id: 'a', text: 'I have insurance that may cover GLP-1s and plan to pursue coverage', scores: { STRONG: 2 } },
      { id: 'b', text: 'I would pay out of pocket and have researched the brand-name cost', scores: { STRONG: 1 } },
      { id: 'c', text: 'I have been exploring compounded semaglutide or tirzepatide', scores: { STRONG: 1 } },
      { id: 'd', text: 'I want to explore this but am unsure I can sustain the cost long-term', scores: { CAUTION: 1 } },
    ],
  },
  {
    text: 'How do you understand the long-term commitment?',
    section: 'Goals and expectations',
    opts: [
      { id: 'a', text: 'I understand GLP-1 is typically long-term; regain is expected when stopped without a solid foundation', scores: { STRONG: 3 } },
      { id: 'b', text: 'I plan to take it until goal weight, then stop', scores: { FUNC: 3 }, flags: ['expectationMismatch'] },
      { id: 'c', text: 'I believe it will permanently reset my metabolism so I will not need it forever', scores: { FUNC: 3 }, flags: ['expectationMismatch'] },
      { id: 'd', text: 'I want to understand the full long-term picture before deciding', scores: { STRONG: 2 } },
    ],
  },
  {
    text: 'What does your weight-loss resistance feel like from the inside?',
    section: 'Root-cause signals',
    opts: [
      { id: 'a', text: 'Hunger and cravings are the main obstacle; I think about food constantly', scores: { STRONG: 4 } },
      { id: 'b', text: 'My eating is reasonable but my metabolism feels broken', scores: { FUNC: 3 } },
      { id: 'c', text: 'Stress, emotions, and environment drive my eating more than hunger', scores: { FUNC: 3 } },
      { id: 'd', text: 'I gained weight after a medication, surgery, or specific health event', scores: { CAUTION: 2 } },
    ],
  },
]

function hasFlag(answers: Record<number, string[]>, flag: string): boolean {
  return QUESTIONS.some((q, qi) => {
    const sel = answers[qi] ?? []
    return q.opts.some(o => sel.includes(o.id) && o.flags?.includes(flag))
  })
}

function tally(answers: Record<number, string[]>): Scores {
  const scores: Scores = { STRONG: 0, FUNC: 0, CAUTION: 0 }
  QUESTIONS.forEach((q, qi) => {
    const sel = answers[qi] ?? []
    sel.forEach(optId => {
      const opt = q.opts.find(o => o.id === optId)
      if (!opt) return
      for (const [code, pts] of Object.entries(opt.scores)) {
        scores[code as Code] += pts as number
      }
    })
  })
  return scores
}

type ResultCode = 'A' | 'B' | 'C'

function getResult(scores: Scores, answers: Record<number, string[]>): ResultCode {
  // Auto-triggers → always Result C
  if (hasFlag(answers, 'mtc')) return 'C'
  if (hasFlag(answers, 'men2')) return 'C'
  if (hasFlag(answers, 'restrictiveED')) return 'C'
  if (hasFlag(answers, 'gastroparesis')) return 'C'
  // CAUTION threshold
  if (scores.CAUTION >= 8) return 'C'
  // Primary
  if (scores.STRONG >= scores.FUNC) return 'A'
  return 'B'
}

// ---- Result A ----
function ResultA({
  confirmedResponder, priorSideEffects, expectationMismatch, hypoglycemiaRisk, cvd,
}: {
  confirmedResponder: boolean; priorSideEffects: boolean; expectationMismatch: boolean;
  hypoglycemiaRisk: boolean; cvd: boolean;
}) {
  return (
    <>
      {confirmedResponder && (
        <div className={s.carryFlag}>
          <div className={s.carryFlagTitle}>Prior Responder</div>
          <div className={s.carryFlagText}>Your prior positive response is the strongest single predictor of renewed benefit. Agent, dose, and titration should be reviewed with your prescriber to pick up where you left off most effectively.</div>
        </div>
      )}
      {priorSideEffects && (
        <div className={s.carryFlag}>
          <div className={s.carryFlagTitle}>Prior Side-Effect Stop</div>
          <div className={s.carryFlagText}>A previous intolerance does not close the door. Slower titration (often well below the package schedule), an alternative agent, or anti-nausea planning before day one resolves this for many people. Bring the specifics to your prescriber.</div>
        </div>
      )}
      {expectationMismatch && (
        <div className={s.carryFlag}>
          <div className={s.carryFlagTitle}>Expectation Mismatch to Address First</div>
          <div className={s.carryFlagText}>Your answers suggest you may be planning to stop GLP-1 at goal weight. In the STEP 1 extension, people who stopped semaglutide after 68 weeks regained about two-thirds of their lost weight within a year. GLP-1 does not permanently reset the metabolism: it suppresses appetite while active. The clinical model is to use the appetite-suppression window to address root causes and build lasting change, then manage long-term on the lowest effective dose. Discuss this explicitly with your prescriber before starting.</div>
        </div>
      )}
      {hypoglycemiaRisk && (
        <div className={s.flagCard}>
          <div className={s.flagTitle}>Hypoglycemia Risk: Pre-Plan Required</div>
          <div className={s.flagText}>Combining a GLP-1 with insulin or a sulfonylurea raises hypoglycemia risk meaningfully. The standard practice is a pre-planned dose reduction of the insulin or sulfonylurea with glucose-monitoring parameters set in advance, before you take the first GLP-1 dose. This is not optional: build the protocol with your prescriber and clinical pharmacist before starting.</div>
        </div>
      )}

      <div className={s.section}>
        <div className={s.sectionTitle}>What the evidence actually shows</div>
        <div className={s.sectionBody}>
          GLP-1 receptor agonists are the most effective FDA-approved weight medications developed to date, and when the clinical picture fits, the benefit-to-risk ratio is backed by some of the strongest trial data in obesity medicine. Two things most people never hear: first, the headline numbers are trial averages under protocol conditions, and real-world results vary with the agent, dose, titration, and what is happening metabolically underneath. Second, the most important factor is not which drug you pick. It is what you build while the drug is working.
        </div>
        <div className={s.sectionBody}>
          In the STEP 1 extension, the average participant who stopped semaglutide after 68 weeks regained about two-thirds of their lost weight within a year: not because the drug failed, but because the drivers of the original weight gain were never addressed alongside it. GLP-1 suppresses appetite while it is active; it does not permanently reset the body's set point. Used as a window of opportunity to address root causes and consolidate lasting changes, it produces durable results. Used as a standalone drug you stop at goal weight, it does not.
        </div>
      </div>

      <div className={s.section}>
        <div className={s.sectionTitle}>The current GLP-1 landscape (July 2026)</div>
        <div className={s.agentCard}>
          <div className={s.agentName}>Semaglutide: Wegovy (weight), Ozempic (diabetes), oral Wegovy (approved December 2025)</div>
          <div className={s.agentDetail}>GLP-1 receptor agonist, weekly injection or daily oral pill. Average weight loss approximately 15% in the STEP trials.{cvd ? ' The SELECT trial showed a 20% relative reduction in major cardiovascular events in adults with established CVD and overweight/obesity without diabetes, making this the strongest evidence in your profile.' : ' The SELECT trial confirmed cardiovascular benefit in adults with established CVD and overweight/obesity.'}</div>
        </div>
        <div className={s.agentCard}>
          <div className={s.agentName}>Tirzepatide: Zepbound (weight), Mounjaro (diabetes)</div>
          <div className={s.agentDetail}>Dual GIP plus GLP-1 agonist, weekly injection. Average weight loss approximately 20-21% in the SURMOUNT trials, the highest reported for any approved weight agent. Head-to-head comparisons with semaglutide have limitations.</div>
        </div>
        <div className={s.agentCard}>
          <div className={s.agentName}>Orforglipron: Foundayo</div>
          <div className={s.agentDetail}>FDA-approved April 1, 2026. Small-molecule oral GLP-1, once daily, no food or water timing restrictions. Average weight loss roughly 12% at the highest dose. A genuine option for needle reluctance or access barriers. Same MTC/MEN 2 boxed warning as the class.</div>
        </div>
        <div className={s.agentCard}>
          <div className={s.agentName}>Retatrutide <span className={s.investigationalBadge}>Not FDA-Approved</span></div>
          <div className={s.agentDetail}>Triple agonist (GLP-1, GIP, and glucagon) in Phase 3 trials. Phase 2 data showed up to 24.2% weight loss at the highest dose. Not available by prescription. Should never be sourced from peptide or research-chemical vendors: the appropriate path is trial participation or waiting for approval.</div>
        </div>
      </div>

      <div className={s.section}>
        <div className={s.sectionTitle}>What PharmD-guided management adds</div>
        <div className={s.sectionBody}>
          A rushed telehealth prescription gives you a drug. A PharmD-managed approach gives you a full medication review and interaction check, baseline labs and contraindication screening, agent and dose-selection rationale, a nausea-mitigation plan before day one, a managed titration (often slower than the package schedule; aggressive escalation is the most common reason people quit), concurrent root-cause work so the appetite-suppression window is actually used, and ongoing monitoring of blood pressure, glucose, kidney function, and thyroid markers.
        </div>
      </div>

      <div className={s.section}>
        <div className={s.sectionTitle}>Baseline labs to discuss with your prescriber</div>
        <div className={s.labsBox}>
          HbA1c and fasting glucose; fasting insulin and HOMA-IR; comprehensive metabolic panel; lipid panel; TSH with Free T3; hsCRP; urinalysis with microalbumin.
        </div>
      </div>

      <div className={s.ctaBlock}>
        <div className={s.ctaTitle}>Ready to build your GLP-1 strategy?</div>
        <div className={s.ctaBody}>
          The assessment confirmed you are a strong candidate. The next step is a protocol that uses GLP-1 as a window to address your specific root causes, not a standalone drug you stop at goal weight.
        </div>
        <a
          href="https://buy.stripe.com/eVqaEW59Sdjwa5O8P600003"
          className={s.ctaBtn}
        >
          Start Foundation Plan — $37/mo →
        </a>
        <div className={s.ctaSub}>
          Cancel anytime. &nbsp;·&nbsp; <Link to="/join" style={{ color: 'inherit', textDecoration: 'underline' }}>Have questions first?</Link>
        </div>
        <div className={s.ctaSub} style={{ marginTop: '0.5rem' }}>
          Bookmark this page to save your results (Cmd+D / Ctrl+D).
        </div>
      </div>
    </>
  )
}

// ---- Result B ----
function ResultB({ expectationMismatch }: { expectationMismatch: boolean }) {
  return (
    <>
      {expectationMismatch && (
        <div className={s.carryFlag}>
          <div className={s.carryFlagTitle}>Expectation Note</div>
          <div className={s.carryFlagText}>Your answers suggest you plan to stop GLP-1 at goal weight. This compounds the regain risk: the STEP 1 extension data shows about two-thirds of weight regained within a year of stopping. This is even more important when the root cause has not been addressed first.</div>
        </div>
      )}

      <div className={s.section}>
        <div className={s.sectionTitle}>Why starting with GLP-1 now is a setup for regain</div>
        <div className={s.sectionBody}>
          The most important number in GLP-1 therapy is not the weight-loss figure. It is the regain figure. In the STEP 1 extension, people who stopped semaglutide after 68 weeks regained about two-thirds of their lost weight within a year, quickly, because the hormonal, metabolic, and behavioral drivers were still present. The drug had suppressed them, not resolved them.
        </div>
        <div className={s.sectionBody}>
          Your pattern shows real weight-loss resistance and signals pointing toward underlying drivers that GLP-1 alone will not resolve. GLP-1 suppresses appetite. It does not, by itself, restore thyroid function, normalize insulin, recalibrate the cortisol rhythm, or repair gut dysbiosis. Addressing the root cause first builds the metabolic foundation that lets you either use GLP-1 far more effectively later, or in some cases reach your goals without it. Both paths are valid. The sequencing is what matters.
        </div>
      </div>

      <div className={s.section}>
        <div className={s.sectionTitle}>Your next step</div>
        <div className={s.sectionBody}>
          The Root-Cause Weight-Loss Assessment maps your specific driver: insulin resistance, cortisol and stress, thyroid slowdown, hormone transition, gut and inflammation, or a combination. That diagnosis shapes everything that comes after, including whether and when GLP-1 belongs in your protocol.
        </div>
      </div>

      <div className={s.ctaBlock}>
        <div className={s.ctaTitle}>Find your root cause first</div>
        <div className={s.ctaBody}>
          A PharmD-designed assessment maps the specific metabolic driver keeping you stuck, with the labs to request and the interventions with the strongest evidence for your pattern.
        </div>
        <Link to="/why-cant-i-lose-weight" className={s.ctaBtn}>Take the Root-Cause Assessment →</Link>
        <a
          href="https://buy.stripe.com/eVqaEW59Sdjwa5O8P600003"
          className={s.ctaBtnSecondary}
        >
          Start Foundation Plan →
        </a>
        <div className={s.ctaSub}>GLP-1 can still be part of your plan. The root cause shapes when and how.</div>
      </div>
    </>
  )
}

// ---- Result C ----
function ResultC({
  answers,
}: {
  answers: Record<number, string[]>
}) {
  const f = (flag: string) => hasFlag(answers, flag)
  return (
    <>
      <div className={s.section}>
        <div className={s.sectionTitle}>This is not a "no" — it is "not yet, without the right workup"</div>
        <div className={s.sectionBody}>
          GLP-1s are powerful, well-studied medications with a strong safety profile in appropriate candidates. The factors flagged below are exactly the ones rushed telehealth intakes tend to miss. Addressing them first protects your safety and improves the odds the therapy works.
        </div>
      </div>

      <div className={s.flagSection}>
        <div className={s.flagSectionTitle}>Factors flagged in your assessment</div>

        {f('mtc') && (
          <div className={s.flagCard}>
            <div className={s.flagTitle}>Medullary Thyroid Carcinoma (MTC) History</div>
            <div className={s.flagText}>All approved GLP-1 receptor agonists carry an FDA boxed warning and are contraindicated with a personal history of MTC. This is not a "discuss with your doctor" item: GLP-1s are off-limits without endocrinology clearance. This must be the first conversation with a specialist.</div>
          </div>
        )}
        {f('men2') && (
          <div className={s.flagCard}>
            <div className={s.flagTitle}>Multiple Endocrine Neoplasia Type 2 (MEN 2) History</div>
            <div className={s.flagText}>Personal or family history of MEN 2 is a formal FDA contraindication with a boxed warning for the GLP-1 class. GLP-1s are off-limits without endocrinology clearance and genetic counseling.</div>
          </div>
        )}
        {f('thyroidNodules') && (
          <div className={s.flagCard}>
            <div className={s.flagTitle}>Thyroid Nodules or Prior Non-Medullary Thyroid Cancer</div>
            <div className={s.flagText}>The class carries a boxed warning based on rodent C-cell tumor data. Large human trials (SELECT, STEP, SURMOUNT) have not shown a clinical MTC signal, but the conservative standard is endocrinology evaluation and thyroid ultrasound to characterize nodules before starting.</div>
          </div>
        )}
        {f('pancreatitis') && (
          <div className={s.flagCard}>
            <div className={s.flagTitle}>History of Pancreatitis</div>
            <div className={s.flagText}>GLP-1s carry a rare association with acute pancreatitis. A gastroenterology evaluation is appropriate; in many cases GLP-1 remains an option once the etiology and severity are cleared.</div>
          </div>
        )}
        {f('gallbladder') && (
          <div className={s.flagCard}>
            <div className={s.flagTitle}>Gallbladder Disease or Gallbladder Removal</div>
            <div className={s.flagText}>GLP-1s and rapid weight loss both independently raise gallbladder-event risk. If the gallbladder has been removed, discuss how to monitor for bile-related symptoms with your prescriber. If gallstones are active and symptomatic, GI evaluation should precede starting.</div>
          </div>
        )}
        {f('binge') && (
          <div className={s.flagCard}>
            <div className={s.flagTitle}>Active Binge-Eating Pattern</div>
            <div className={s.flagText}>Appetite suppression may temporarily reduce binge frequency but does not address the compulsive pattern. Establishing behavioral treatment (CBT-E or DBT for BED) before or alongside GLP-1 produces better outcomes. This is a sequencing recommendation, not a permanent contraindication.</div>
          </div>
        )}
        {f('restrictiveED') && (
          <div className={s.flagCard}>
            <div className={s.flagTitle}>Restrictive Eating-Disorder History</div>
            <div className={s.flagText}>A history of anorexia or bulimia is a clinical caution: the appetite-suppression mechanism can reactivate restriction in vulnerable individuals. Behavioral-health clearance and ongoing monitoring are the appropriate path before starting.</div>
          </div>
        )}
        {f('gastroparesis') && (
          <div className={s.flagCard}>
            <div className={s.flagTitle}>Gastroparesis or Severe GI Condition</div>
            <div className={s.flagText}>GLP-1s slow gastric emptying; in confirmed, symptomatic gastroparesis they are generally avoided. A March 2026 FDA label update added explicit gastroparesis-risk language for semaglutide and tirzepatide. GI evaluation is needed before this is reconsidered.</div>
          </div>
        )}
        {f('ckd') && (
          <div className={s.flagCard}>
            <div className={s.flagTitle}>Chronic Kidney Disease</div>
            <div className={s.flagText}>Severe dehydration from GI side effects (nausea, vomiting, diarrhea) can affect kidney function. Some GLP-1 agents may need dose adjustment or nephrology input for advanced CKD. Baseline kidney function labs are a standard pre-start requirement.</div>
          </div>
        )}
        {f('insulin') && (
          <div className={s.flagCard}>
            <div className={s.flagTitle}>Insulin: Hypoglycemia Protocol Required</div>
            <div className={s.flagText}>Combining a GLP-1 with insulin raises hypoglycemia risk meaningfully. A pre-planned dose reduction with glucose-monitoring parameters, set in advance by your prescriber and clinical pharmacist, is required before starting. This is not optional.</div>
          </div>
        )}
        {f('sulfonylurea') && (
          <div className={s.flagCard}>
            <div className={s.flagTitle}>Sulfonylurea: Hypoglycemia Protocol Required</div>
            <div className={s.flagText}>Combining a GLP-1 with a sulfonylurea raises hypoglycemia risk. A pre-planned dose reduction with monitoring parameters is required before starting.</div>
          </div>
        )}
        {f('priorSideEffects') && (
          <div className={`${s.flagCard} ${s.flagCardAmber}`}>
            <div className={`${s.flagTitle} ${s.flagTitleAmber}`}>Prior Side-Effect Stop: Reviewable</div>
            <div className={s.flagText}>A previous intolerance does not permanently close the door. Slower titration, an alternative agent, or anti-nausea planning resolves this for many people. A GLP-1 Strategy Consultation reviews which approach fits your experience.</div>
          </div>
        )}
      </div>

      <div className={s.ctaBlock}>
        <div className={s.ctaTitle}>Your path forward is a targeted pre-GLP-1 evaluation</div>
        <div className={s.ctaBody}>
          A GLP-1 Strategy Consultation reviews every flag above, maps which specialists and labs are needed, and builds your specific pre-GLP-1 roadmap.
        </div>
        <Link to="/join" className={s.ctaBtn}>Book a Strategy Consultation →</Link>
        <div className={s.ctaSub}>Available to Program and VIP members.</div>
      </div>
    </>
  )
}

// ---- Main Component ----

const RESULT_HEADS = {
  A: {
    badge: 'Strong Candidate',
    badgeClass: s.badgeStrong,
    heading: 'Your assessment suggests you are a strong clinical candidate for GLP-1 therapy.',
    subhead: 'Based on your metabolic profile, weight history, and goals, the research supports GLP-1 as a clinically appropriate approach. Here is what that actually means.',
  },
  B: {
    badge: 'Functional-First Candidate',
    badgeClass: s.badgeFunc,
    heading: 'GLP-1 may be ahead of you — but starting there now is a setup for regain.',
    subhead: 'Your assessment shows real, significant weight-loss resistance, and signals pointing toward underlying drivers that GLP-1 alone will not resolve.',
  },
  C: {
    badge: 'Targeted Evaluation First',
    badgeClass: s.badgeCaution,
    heading: 'Your assessment flagged specific factors that need clinical attention before GLP-1 is appropriate.',
    subhead: 'This is not a "no." It is "not yet, without the right workup." Here is what was flagged and what it means.',
  },
}

export default function Glp1Assessment() {
  const [phase, setPhase] = useState<Phase>('intro')
  const [qIdx, setQIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string[]>>({})
  const [emailVal, setEmailVal] = useState('')
  const [nameVal, setNameVal] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const progress = phase === 'intro' ? 0
    : phase === 'quiz' ? Math.round((qIdx / QUESTIONS.length) * 100)
    : phase === 'email' ? 95
    : 100

  const currentQ = QUESTIONS[qIdx]
  const currentSel = answers[qIdx] ?? []

  function toggleOpt(id: string) {
    const q = QUESTIONS[qIdx]
    if (q.multi) {
      const opt = q.opts.find(o => o.id === id)
      const exclusiveIds = q.opts.filter(o => o.exclusive).map(o => o.id)
      setAnswers(prev => {
        const sel = prev[qIdx] ?? []
        if (opt?.exclusive) {
          if (sel.includes(id)) return { ...prev, [qIdx]: sel.filter(x => x !== id) }
          return { ...prev, [qIdx]: [id] }
        }
        const withoutExclusive = sel.filter(x => !exclusiveIds.includes(x))
        if (withoutExclusive.includes(id)) {
          return { ...prev, [qIdx]: withoutExclusive.filter(x => x !== id) }
        }
        return { ...prev, [qIdx]: [...withoutExclusive, id] }
      })
    } else {
      setAnswers(prev => ({ ...prev, [qIdx]: [id] }))
    }
  }

  function handleNext() {
    if (qIdx < QUESTIONS.length - 1) {
      setQIdx(i => i + 1)
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

  const scores = useMemo(() => tally(answers), [answers])
  const totalScore = useMemo(() => Object.values(scores).reduce((a, b) => a + b, 0) || 1, [scores])
  const resultCode = useMemo(() => getResult(scores, answers), [scores, answers])
  const head = RESULT_HEADS[resultCode]

  const confirmedResponder = hasFlag(answers, 'confirmedResponder')
  const priorSideEffects = hasFlag(answers, 'priorSideEffects')
  const expectationMismatch = hasFlag(answers, 'expectationMismatch')
  const hypoglycemiaRisk = hasFlag(answers, 'insulin') || hasFlag(answers, 'sulfonylurea')
  const cvd = hasFlag(answers, 'cvd')

  const SCORE_LABELS: Record<Code, string> = {
    STRONG: 'GLP-1 Candidate',
    FUNC: 'Root-Cause First',
    CAUTION: 'Evaluation Needed',
  }

  const FILL_CLASS: Record<Code, string> = {
    STRONG: s.fillStrong,
    FUNC: s.fillFunc,
    CAUTION: s.fillCaution,
  }

  return (
    <div className={s.page}>
      <div className={s.progressWrap}>
        <div className={s.progressFill} style={{ width: `${progress}%` }} />
      </div>

      <div className={s.inner}>

        {/* INTRO */}
        {phase === 'intro' && (
          <div className={s.intro}>
            <img
              src="/images/ai/tool-glp1-assessment.jpg"
              alt="GLP-1 candidate assessment tool"
              className={s.heroImg}
            />
            <div className={s.introEyebrow}>PharmD, CFNMP Educational Assessment</div>
            <h1 className={s.introTitle}>Am I a GLP-1 Candidate?</h1>
            <p className={s.introSubhead}>
              Before starting Ozempic, Wegovy, Zepbound, or the new oral options: understand what the research says and whether your health profile, history, and goals align with the evidence.
            </p>
            <div className={s.introBody}>
              <p>The research on GLP-1 medications is clear on some questions and genuinely unsettled on others. Efficacy for weight reduction is well-documented. What the large trials do not always capture is how an individual's metabolic profile, medication history, and personal context interact with these medications over time.</p>
              <p>This assessment is built around the questions the research raises: what your metabolic picture looks like before you start, whether underlying drivers of weight resistance have been identified, what in your history shifts the risk-benefit picture, and whether your expectations align with what the evidence actually shows.</p>
              <p>Depending on your profile, the evidence-based educational direction might be GLP-1 therapy now, root-cause work first, or a specific evaluation before starting.</p>
              <div className={s.trustLine}>15 questions · PharmD, CFNMP educational framework · Based on published efficacy and safety research</div>
            </div>
            <button className={s.startBtn} onClick={() => setPhase('quiz')}>
              Take the 4-Minute Assessment →
            </button>
          </div>
        )}

        {/* QUIZ */}
        {phase === 'quiz' && (
          <div className={s.qWrap}>
            <div className={s.qMeta}>
              <span className={s.qNum}>Question {qIdx + 1} of {QUESTIONS.length}</span>
              <span className={s.qSection}>{currentQ.section}</span>
            </div>
            <div className={s.qText}>{currentQ.text}</div>
            {currentQ.note && <div className={s.qNote}>{currentQ.note}</div>}
            <ul className={s.optsList}>
              {currentQ.opts.map(opt => {
                const sel = currentSel.includes(opt.id)
                return (
                  <li
                    key={opt.id}
                    className={`${s.opt} ${sel ? s.optSelected : ''}`}
                    onClick={() => toggleOpt(opt.id)}
                    role={currentQ.multi ? 'checkbox' : 'radio'}
                    aria-checked={sel}
                    tabIndex={0}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleOpt(opt.id) } }}
                  >
                    <span className={`${s.optIndicator} ${currentQ.multi ? s.optCheckIndicator : ''}`}>
                      {sel && (
                        currentQ.multi
                          ? <span className={s.optCheckMark}>✓</span>
                          : <span className={s.optDot} />
                      )}
                    </span>
                    <span className={s.optLabel}>{opt.text}</span>
                  </li>
                )
              })}
            </ul>
            <button
              className={s.nextBtn}
              disabled={currentSel.length === 0}
              onClick={handleNext}
            >
              {qIdx < QUESTIONS.length - 1 ? 'Next →' : 'See My Assessment →'}
            </button>
          </div>
        )}

        {/* EMAIL GATE */}
        {phase === 'email' && (
          <div className={s.emailGate}>
            <div className={s.introEyebrow}>Your results are ready</div>
            <h2 className={s.emailTitle}>Your assessment: {head.badge}</h2>
            <p className={s.emailBody}>
              Your full assessment is on the next screen. Add your email to save it and receive Dr. Hunter's weekly educational insights from a PharmD, CFNMP perspective.
            </p>
            <form className={s.emailForm} onSubmit={handleEmailSubmit}>
              <div className={s.emailRow}>
                <input
                  className={s.emailInput}
                  type="text"
                  placeholder="First name (optional)"
                  value={nameVal}
                  onChange={e => setNameVal(e.target.value)}
                  autoComplete="given-name"
                />
                <input
                  className={s.emailInput}
                  type="email"
                  placeholder="Email address"
                  value={emailVal}
                  onChange={e => setEmailVal(e.target.value)}
                  autoComplete="email"
                />
              </div>
              <button className={s.emailSubmit} type="submit" disabled={submitting}>
                {submitting ? 'Sending...' : 'Show My Full Assessment →'}
              </button>
            </form>
            <button className={s.emailSkip} onClick={() => setPhase('result')}>
              Skip and see results now
            </button>
          </div>
        )}

        {/* RESULT */}
        {phase === 'result' && (
          <div className={s.result}>
            <button className={s.pdfBtn} onClick={() => window.print()}>
              ↓ Download as PDF
            </button>
            <div className={`${s.resultBadge} ${head.badgeClass}`}>{head.badge}</div>
            <h2 className={s.resultHeading}>{head.heading}</h2>
            <p className={s.resultSubhead}>{head.subhead}</p>

            {/* Score breakdown */}
            <div className={s.scoresCard}>
              <div className={s.scoresTitle}>Signal breakdown</div>
              <div className={s.scoreRows}>
                {(['STRONG', 'FUNC', 'CAUTION'] as Code[]).map(code => {
                  const pct = Math.round((scores[code] / totalScore) * 100)
                  return (
                    <div key={code} className={s.scoreRow}>
                      <span className={s.scoreLabel}>{SCORE_LABELS[code]}</span>
                      <div className={s.scoreBar}>
                        <div className={`${s.scoreFill} ${FILL_CLASS[code]}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className={s.scorePct}>{pct}%</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <hr className={s.divider} />

            {resultCode === 'A' && (
              <ResultA
                confirmedResponder={confirmedResponder}
                priorSideEffects={priorSideEffects}
                expectationMismatch={expectationMismatch}
                hypoglycemiaRisk={hypoglycemiaRisk}
                cvd={cvd}
              />
            )}
            {resultCode === 'B' && <ResultB expectationMismatch={expectationMismatch} />}
            {resultCode === 'C' && <ResultC answers={answers} />}

            <p className={s.disclaimer}>
              This assessment is for educational purposes only and is not medical advice, diagnosis, or treatment, and does not establish a provider-patient relationship. GLP-1 receptor agonists are prescription medications; all decisions about starting, dosing, adjusting, or stopping any medication are made by your prescribing physician. GLP-1 receptor agonists carry a boxed warning regarding thyroid C-cell tumors and are contraindicated in people with a personal or family history of medullary thyroid carcinoma or MEN 2. Consult your qualified healthcare provider before making any medical decision.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
