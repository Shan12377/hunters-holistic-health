import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import s from './RootCauseQuiz.module.css'

type Code = 'IR' | 'CR' | 'TH' | 'HT' | 'GU' | 'CP'
type Scores = Record<Code, number>
type Phase = 'intro' | 'quiz' | 'email' | 'result'

interface Opt {
  id: string
  text: string
  scores: Partial<Scores>
  flags?: Array<'pcos' | 'lipedema' | 'sleep_apnea' | 'medication'>
  exclusive?: boolean
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
    text: 'Despite real effort, how long have you struggled to lose weight?',
    section: 'Weight-loss history',
    opts: [
      { id: 'a', text: 'Less than 6 months', scores: { CP: 1 } },
      { id: 'b', text: '6 months to 2 years', scores: { IR: 1, CR: 1 } },
      { id: 'c', text: 'More than 2 years, getting harder over time', scores: { IR: 2, HT: 2 } },
      { id: 'd', text: 'Weight gain accelerated after a specific event (pregnancy, prolonged stress, surgery, or turning 40)', scores: { CR: 2, HT: 2, TH: 1 } },
    ],
  },
  {
    text: 'Where does your body tend to store most of its weight?',
    section: 'Weight-loss history',
    opts: [
      { id: 'a', text: 'Relatively even, no strong pattern', scores: { GU: 1 } },
      { id: 'b', text: 'Belly and midsection, even when the rest of me is not heavy', scores: { IR: 3 } },
      { id: 'c', text: 'Hips, thighs, and lower body; feels impossible to move', scores: { HT: 2, CP: 2 } },
      { id: 'd', text: 'All over, including face and arms; puffy and swollen rather than just heavy', scores: { TH: 3 } },
      { id: 'e', text: 'Belly AND lower body, but the lower-body fat feels different: dense, tender, padding that will not budge', scores: { CP: 4 }, flags: ['lipedema'] },
    ],
  },
  {
    text: 'Last time you committed to a diet, what happened?',
    section: 'Weight-loss history',
    opts: [
      { id: 'a', text: 'Lost it and kept it off', scores: {} },
      { id: 'b', text: 'Lost at first, then hit a wall despite sticking with it', scores: { IR: 2, CR: 1 } },
      { id: 'c', text: 'Barely lost anything despite strict adherence and a real deficit', scores: { TH: 3, IR: 2 } },
      { id: 'd', text: 'Lost it, then regained all (sometimes more) the moment I stopped', scores: { IR: 2, HT: 2 } },
      { id: 'e', text: 'Only worked during calm periods; stress derailed it every time', scores: { CR: 3 } },
    ],
  },
  {
    text: 'How is your energy through the day?',
    section: 'Energy and daily patterns',
    opts: [
      { id: 'a', text: 'Reasonably stable', scores: {} },
      { id: 'b', text: 'Exhausted no matter how much I sleep', scores: { TH: 3 } },
      { id: 'c', text: 'Okay in the morning, then crash around 2-4pm and again after dinner', scores: { IR: 2, CR: 2 } },
      { id: 'd', text: 'Tired all day but wired at night', scores: { CR: 3 } },
      { id: 'e', text: 'Foggy and slow, like thinking through mud', scores: { TH: 2, HT: 2 } },
    ],
  },
  {
    text: 'How is your sleep?',
    section: 'Energy and daily patterns',
    opts: [
      { id: 'a', text: 'I sleep well and feel rested', scores: {} },
      { id: 'b', text: 'Fall asleep fine but wake at 2-4am and cannot get back to sleep', scores: { CR: 3 } },
      { id: 'c', text: 'Slow to fall asleep, never refreshed even after 8 or more hours', scores: { TH: 2, CP: 1 } },
      { id: 'd', text: 'Told I snore, gasp, or stop breathing; or I wake unrefreshed after a full night', scores: { CP: 4 }, flags: ['sleep_apnea'] },
      { id: 'e', text: 'Sleep changed in the last 2-5 years: restless, night sweats, or vivid dreams', scores: { HT: 3 } },
    ],
  },
  {
    text: 'What happens when you go 4-5 hours without eating?',
    section: 'Energy and daily patterns',
    opts: [
      { id: 'a', text: 'Nothing significant', scores: {} },
      { id: 'b', text: 'Hungry but manageable', scores: {} },
      { id: 'c', text: 'Shaky, anxious, irritable, or headachy within 2-3 hours', scores: { IR: 3 } },
      { id: 'd', text: 'Dizzy, nauseous, or unwell past 2-3 hours', scores: { IR: 3, CP: 1 } },
    ],
  },
  {
    text: 'How do you handle chronic stress?',
    section: 'Energy and daily patterns',
    opts: [
      { id: 'a', text: 'Reasonably well; stress does not affect my weight', scores: {} },
      { id: 'b', text: 'Under stress I gain quickly, even without eating more', scores: { CR: 3 } },
      { id: 'c', text: 'Stress makes me eat uncontrollably', scores: { CR: 3, GU: 1 } },
      { id: 'd', text: 'Sustained high stress for over a year, with clear body-composition change', scores: { CR: 4 } },
    ],
  },
  {
    text: 'Your relationship with carbs and sugar?',
    section: 'Hunger, cravings, and blood sugar',
    opts: [
      { id: 'a', text: 'Can skip them or eat small amounts without wanting more', scores: {} },
      { id: 'b', text: 'Crave them in the afternoons or evenings but can resist', scores: { IR: 2 } },
      { id: 'c', text: 'Once I start, it is hard to stop; like a switch flips', scores: { IR: 3, GU: 2 } },
      { id: 'd', text: 'Cravings spike the week before my period', scores: { HT: 3, IR: 1 } },
      { id: 'e', text: 'I crave salt and savory foods more than sweets', scores: { CR: 2 } },
    ],
  },
  {
    text: '1-2 hours after a typical meal, how do you feel?',
    section: 'Hunger, cravings, and blood sugar',
    opts: [
      { id: 'a', text: 'Satisfied and energized', scores: {} },
      { id: 'b', text: 'Hungry again within 1-2 hours, especially after carbs', scores: { IR: 3 } },
      { id: 'c', text: 'Bloated, gassy, or uncomfortable regardless of what I ate', scores: { GU: 3 } },
      { id: 'd', text: 'Fine for an hour, then suddenly tired or needing to nap', scores: { IR: 2, CR: 1 } },
    ],
  },
  {
    text: 'Any of these confirmed diagnoses or lab results? (Select all that apply)',
    section: 'Hunger, cravings, and blood sugar',
    multi: true,
    opts: [
      { id: 'a', text: 'Pre-diabetes, type 2 diabetes, or insulin resistance', scores: { IR: 4 } },
      { id: 'b', text: 'Diagnosed or suspected PCOS', scores: { IR: 4 }, flags: ['pcos'] },
      { id: 'c', text: 'High triglycerides (above 150) and/or low HDL', scores: { IR: 3 } },
      { id: 'd', text: 'High or borderline blood pressure', scores: { IR: 2, CR: 1 } },
      { id: 'e', text: 'Fasting blood sugar "normal but high" (above 90)', scores: { IR: 3 } },
      { id: 'f', text: 'None of the above', scores: {}, exclusive: true },
    ],
  },
  {
    text: 'Skin or hair changes? (Select all that apply)',
    section: 'Hormonal patterns',
    multi: true,
    opts: [
      { id: 'a', text: 'Thinning or loss on top or crown of head', scores: { TH: 2, IR: 2 } },
      { id: 'b', text: 'New or increased hair on chin, jaw, sideburns, or abdomen', scores: { IR: 3 }, flags: ['pcos'] },
      { id: 'c', text: 'Dark, velvety patches under arms, on neck, or in groin', scores: { IR: 4 } },
      { id: 'd', text: 'Skin tags at neck, armpits, or groin', scores: { IR: 3 } },
      { id: 'e', text: 'Adult-onset jawline or chin acne, especially cyclical', scores: { IR: 2 }, flags: ['pcos'] },
      { id: 'f', text: 'Dry, rough, pale, or slightly yellowish skin that has changed over time', scores: { TH: 3 } },
      { id: 'g', text: 'None of the above', scores: {}, exclusive: true },
    ],
  },
  {
    text: 'Your menstrual cycle experience? (Select all that apply)',
    section: 'Hormonal patterns',
    multi: true,
    opts: [
      { id: 'a', text: 'Regular and predictable; not in menopause', scores: {} },
      { id: 'b', text: 'Irregular: often late, early, or skipped', scores: { IR: 3 }, flags: ['pcos'] },
      { id: 'c', text: 'Heavy, painful, or diagnosed endometriosis', scores: { IR: 2, HT: 2 } },
      { id: 'd', text: 'Cycle changed in the last 2-5 years (shorter, longer, heavier, or erratic)', scores: { HT: 3 } },
      { id: 'e', text: 'Entered perimenopause or menopause in the last 5 years', scores: { HT: 4 } },
      { id: 'f', text: 'Completed menopause more than 5 years ago', scores: { HT: 2 } },
      { id: 'g', text: 'No periods (hysterectomy, ablation, or IUD)', scores: { HT: 1 } },
    ],
  },
  {
    text: 'Experienced in the last year? (Select all that apply)',
    section: 'Hormonal patterns',
    multi: true,
    opts: [
      { id: 'a', text: 'Hot flashes or night sweats', scores: { HT: 3 } },
      { id: 'b', text: 'Vaginal dryness or discomfort', scores: { HT: 3 } },
      { id: 'c', text: 'Significant loss of interest in sex', scores: { HT: 2, TH: 1 } },
      { id: 'd', text: 'New or worsening brain fog', scores: { HT: 2, TH: 2, CR: 1 } },
      { id: 'e', text: 'Feeling colder than everyone around me', scores: { TH: 4 } },
      { id: 'f', text: 'Palpitations or anxiety that feels physical rather than situational', scores: { HT: 2, CR: 2 } },
      { id: 'g', text: 'None of the above', scores: {}, exclusive: true },
    ],
  },
  {
    text: 'Currently taking, or taken in the last 2 years? (Select all that apply)',
    section: 'Hormonal patterns',
    multi: true,
    opts: [
      { id: 'a', text: 'Hormonal birth control (pill, hormonal IUD, implant, or shot)', scores: { HT: 2, IR: 1 } },
      { id: 'b', text: 'Antidepressants or antipsychotics', scores: { CP: 3 }, flags: ['medication'] },
      { id: 'c', text: 'Corticosteroids (prednisone or prednisolone)', scores: { CP: 3, IR: 2 }, flags: ['medication'] },
      { id: 'd', text: 'Beta blockers or other blood pressure medications', scores: { CP: 2, TH: 1 } },
      { id: 'e', text: 'None of the above', scores: {}, exclusive: true },
    ],
  },
  {
    text: 'How is your digestive health?',
    section: 'Gut and inflammation',
    opts: [
      { id: 'a', text: 'Generally good, no significant issues', scores: {} },
      { id: 'b', text: 'Bloating regularly, especially after wheat, dairy, or high-carb meals', scores: { GU: 3 } },
      { id: 'c', text: 'Alternating constipation and loose stools, or diagnosed IBS', scores: { GU: 3, TH: 1 } },
      { id: 'd', text: 'Significant history of antibiotics, long-term antacid or PPI use, or a gut-wrecking stress period', scores: { GU: 3 } },
      { id: 'e', text: 'Diagnosed SIBO, leaky gut, Crohn\'s, ulcerative colitis, or celiac disease', scores: { GU: 4 } },
    ],
  },
  {
    text: 'Do you experience any of these? (Select all that apply)',
    section: 'Gut and inflammation',
    multi: true,
    opts: [
      { id: 'a', text: 'Frequent headaches or migraines', scores: { CR: 2, GU: 1 } },
      { id: 'b', text: 'Joint pain or morning stiffness', scores: { GU: 2, TH: 2 } },
      { id: 'c', text: 'Skin conditions: eczema, psoriasis, hives, or unexplained rashes', scores: { GU: 3 } },
      { id: 'd', text: 'Frequent colds, infections, or a weak-feeling immune system', scores: { GU: 2, CR: 1 } },
      { id: 'e', text: 'Labs showing elevated CRP, ESR, or homocysteine', scores: { GU: 3 } },
      { id: 'f', text: 'None of the above', scores: {}, exclusive: true },
    ],
  },
  {
    text: 'How has stress affected you in the last 1-2 years?',
    section: 'Stress and exercise response',
    opts: [
      { id: 'a', text: 'Manageable; not a major factor', scores: {} },
      { id: 'b', text: 'High sustained stress for over a year', scores: { CR: 3 } },
      { id: 'c', text: 'Used to handle stress well; now small stressors overwhelm me', scores: { CR: 3, TH: 1 } },
      { id: 'd', text: 'Completely burned out and depleted most days', scores: { CR: 4 } },
      { id: 'e', text: 'Stress feels hormonally driven, worse around my cycle', scores: { HT: 3, CR: 2 } },
    ],
  },
  {
    text: 'When you exercise consistently, what happens?',
    section: 'Stress and exercise response',
    opts: [
      { id: 'a', text: 'It helps me maintain or lose; it works', scores: {} },
      { id: 'b', text: 'I exercise regularly with almost no results', scores: { IR: 3, TH: 2 } },
      { id: 'c', text: 'Helps when stress is low; when life is chaotic, exercise makes me gain', scores: { CR: 3 } },
      { id: 'd', text: 'Intense exercise makes me feel worse for days', scores: { CR: 3, TH: 1 } },
      { id: 'e', text: 'Too exhausted to exercise consistently', scores: { TH: 2, CR: 2 } },
    ],
  },
]

const CODE_LABELS: Record<Code, string> = {
  IR: 'Insulin & Metabolic',
  CR: 'Cortisol & Stress',
  TH: 'Thyroid Slowdown',
  HT: 'Hormone Transition',
  GU: 'Gut & Inflammation',
  CP: 'Complex Multi-Root',
}

const FILL_CLASS: Record<Code, string> = {
  IR: s.fillIR,
  CR: s.fillCR,
  TH: s.fillTH,
  HT: s.fillHT,
  GU: s.fillGU,
  CP: s.fillCP,
}

function tally(answers: Record<number, string[]>): Scores {
  const scores: Scores = { IR: 0, CR: 0, TH: 0, HT: 0, GU: 0, CP: 0 }
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

function hasFlag(answers: Record<number, string[]>, flag: string): boolean {
  return QUESTIONS.some((q, qi) => {
    const sel = answers[qi] ?? []
    return q.opts.some(o => sel.includes(o.id) && o.flags?.includes(flag as never))
  })
}

function getResult(scores: Scores): { primary: Code; secondary: Code | null } {
  const ordered = (Object.entries(scores) as [Code, number][]).sort((a, b) => b[1] - a[1])
  const [first, second] = ordered
  const primary = first[0]
  let secondary: Code | null = null
  if (second && second[1] >= 4 && second[1] >= first[1] * 0.6) {
    secondary = second[0]
  }
  return { primary, secondary }
}

// ---- Result content components ----

function ResultA({ hasPcos }: { hasPcos: boolean }) {
  return (
    <>
      {hasPcos && (
        <div className={s.flagCard}>
          <div className={s.flagTitle}>PCOS Pattern Detected</div>
          <div className={s.flagText}>
            Your answers suggest PCOS may be the underlying driver of your insulin resistance. PCOS changes the protocol significantly: the 40:1 myo-inositol/d-chiro-inositol ratio has the strongest single-intervention evidence for this pattern. High-dose d-chiro-inositol alone should be avoided, as it may impair oocyte quality. Confirm with a clinician.
          </div>
        </div>
      )}
      <div className={s.section}>
        <div className={s.sectionTitle}>What you may recognize</div>
        <ul className={s.ul}>
          <li className={s.li}>Belly-centered weight even when the rest of you is not heavy</li>
          <li className={s.li}>Intense carb or sugar cravings, especially in the afternoon or evening</li>
          <li className={s.li}>Shaky, anxious, or headachy 2-3 hours after eating</li>
          <li className={s.li}>High triglycerides, low HDL, or fasting blood sugar that "runs 90-99 but is fine"</li>
          <li className={s.li}>Skin tags or dark velvety patches under arms, at the neck, or in the groin</li>
        </ul>
      </div>
      <div className={s.section}>
        <div className={s.sectionTitle}>Why standard approaches stall</div>
        <div className={s.sectionBody}>
          Calorie restriction temporarily lowers insulin, so you lose weight at first. But it does not change why insulin stays elevated. The moment normal eating resumes, the fat-storage signal returns. This is why restriction works short-term but never holds.
        </div>
      </div>
      <div className={s.section}>
        <div className={s.sectionTitle}>Labs to request</div>
        <div className={s.labsBox}>
          Fasting insulin; HOMA-IR; HbA1c; fasting glucose; full lipid panel (triglycerides and HDL); hsCRP.
          {hasPcos && ' If PCOS is suspected: free and total testosterone, DHEA-S, LH/FSH, and estradiol.'}
        </div>
        <div className={s.scriptBox}>
          "I want to be screened for insulin resistance with a fasting insulin and HOMA-IR, not just fasting glucose."
        </div>
      </div>
      <div className={s.section}>
        <div className={s.sectionTitle}>What the evidence supports</div>
        <div className={s.sectionBody}>
          Protein-first eating (30-40 g protein per meal) blunts the insulin response. Resistance training increases insulin sensitivity via GLUT4 in muscle. Targeted support: berberine or DHB (note: berberine inhibits CYP450 enzymes, adds to hypoglycemia risk with insulin or sulfonylureas, and is contraindicated in pregnancy and breastfeeding); myo-inositol at the 40:1 ratio; and magnesium glycinate.
        </div>
        <div className={s.dshea}>
          These statements have not been evaluated by the Food and Drug Administration. This is not intended to diagnose, treat, cure, or prevent any disease.
        </div>
      </div>
    </>
  )
}

function ResultB() {
  return (
    <>
      <div className={s.section}>
        <div className={s.sectionTitle}>What you may recognize</div>
        <ul className={s.ul}>
          <li className={s.li}>Rapid weight gain during stressful periods without eating more</li>
          <li className={s.li}>Intense comfort-food cravings and difficulty stopping once you start</li>
          <li className={s.li}>Waking at 2-4am with a racing mind</li>
          <li className={s.li}>Exhausted during the day but unable to wind down at night</li>
          <li className={s.li}>Feeling worse after intense workouts; burnout and depletion</li>
        </ul>
      </div>
      <div className={s.section}>
        <div className={s.sectionTitle}>Why standard approaches stall</div>
        <div className={s.sectionBody}>
          Severe calorie restriction and high-intensity exercise are read by the body as additional threats, raising cortisol further. The cortisol pattern is also the one most often missed in standard bloodwork: a single 8am cortisol reading gives a poor picture of the daily rhythm.
        </div>
      </div>
      <div className={s.section}>
        <div className={s.sectionTitle}>Labs to request</div>
        <div className={s.labsBox}>
          Diurnal cortisol assessment (salivary or urinary, sampled across the day; a single morning blood draw is insufficient); DHEA-S; fasting insulin and HOMA-IR; TSH, Free T3, Free T4; hsCRP. Multi-point salivary cortisol is used in functional practice to map the daily rhythm; interpretation is not universally standardized, so review results with a clinician.
        </div>
        <div className={s.scriptBox}>
          "I am concerned about HPA-axis dysregulation and want a cortisol assessment that covers multiple time points across the day, not just a single morning draw."
        </div>
      </div>
      <div className={s.section}>
        <div className={s.sectionTitle}>What the evidence supports</div>
        <div className={s.sectionBody}>
          Ashwagandha (KSM-66 or Sensoril) has clinical evidence reducing cortisol in chronically stressed adults. Phosphatidylserine has older, smaller studies showing it blunts the cortisol response to acute stress; evidence for chronic stress is more limited. Walking (7,000-10,000 steps per day) tends to outperform intense cardio for this pattern, because high-intensity exercise adds another cortisol spike.
        </div>
        <div className={s.interactionNote}>
          Ashwagandha can raise T3 and T4. If you take levothyroxine or any thyroid medication, your dose may need monitoring after starting ashwagandha. Avoid in hyperthyroidism, Graves' disease, or an active Hashimoto's flare unless cleared by your clinician.
        </div>
        <div className={s.dshea}>
          These statements have not been evaluated by the Food and Drug Administration. This is not intended to diagnose, treat, cure, or prevent any disease.
        </div>
      </div>
    </>
  )
}

function ResultC() {
  return (
    <>
      <div className={s.section}>
        <div className={s.sectionTitle}>What you may recognize</div>
        <ul className={s.ul}>
          <li className={s.li}>Exhaustion regardless of sleep; waking unrefreshed no matter how long you sleep</li>
          <li className={s.li}>Feeling colder than everyone around you</li>
          <li className={s.li}>Hair thinning, especially at the crown or hairline; loss of the outer third of the eyebrows</li>
          <li className={s.li}>Slowed bowels or constipation; brain fog; a scale that barely moves despite a real deficit</li>
        </ul>
      </div>
      <div className={s.section}>
        <div className={s.sectionTitle}>Why standard approaches stall</div>
        <div className={s.sectionBody}>
          When thyroid output is diminished, even within the "normal" lab range, resting metabolic rate drops and calorie deficits that should work produce little. Significant caloric restriction also worsens thyroid output by raising Reverse T3.
        </div>
        <div className={`${s.sectionBody} ${s.bodySpaced}`}>
          Note: a TSH of 3.5 mIU/L is "within range" at most labs. Some functional practitioners use a tighter target around 2.0 and correlate higher TSH with symptoms. This is a functional interpretation, not the standard diagnostic threshold. TSH should be read alongside Free T4/T3 and antibodies, not against a single universal cutoff.
        </div>
      </div>
      <div className={s.section}>
        <div className={s.sectionTitle}>Labs to request</div>
        <div className={s.labsBox}>
          TSH (baseline only, not sufficient alone); Free T3 (the active hormone; often low even when TSH is normal); Free T4; Reverse T3; TPO antibodies (screens for Hashimoto's); anti-thyroglobulin antibodies (a second Hashimoto's marker often missed on standard panels).
        </div>
        <div className={s.scriptBox}>
          "I want a comprehensive thyroid panel: Free T3, Free T4, TPO and anti-thyroglobulin antibodies; not just TSH, to rule out autoimmune thyroiditis and T4-to-T3 conversion issues."
        </div>
      </div>
      <div className={s.section}>
        <div className={s.sectionTitle}>What the evidence supports</div>
        <div className={s.sectionBody}>
          Selenium (200 mcg per day) supports T4-to-T3 conversion and reduces TPO antibodies in Hashimoto's in multiple trials. Do not exceed 400 mcg per day from all sources. Zinc and vitamin D sufficiency support thyroid function. Adequate protein and resistance training provide the best metabolic support. Pair selenium before adding any iodine; iodine without adequate selenium can worsen autoimmune thyroid disease.
        </div>
        <div className={s.interactionNote}>
          Ashwagandha raises T3 and T4 and is sometimes used for subclinical hypothyroidism. If you are on levothyroxine, monitor thyroid levels after starting, as your dose may need adjustment.
        </div>
        <div className={s.dshea}>
          These statements have not been evaluated by the Food and Drug Administration. This is not intended to diagnose, treat, cure, or prevent any disease.
        </div>
      </div>
    </>
  )
}

function ResultD() {
  return (
    <>
      <div className={s.section}>
        <div className={s.sectionTitle}>What you may recognize</div>
        <ul className={s.ul}>
          <li className={s.li}>Body composition changing in your 40s without diet or exercise changes</li>
          <li className={s.li}>Weight migrating from hips and thighs to the abdomen</li>
          <li className={s.li}>A changing cycle: shorter, longer, heavier, or erratic</li>
          <li className={s.li}>Hot flashes, night sweats, or new sleep disruption</li>
          <li className={s.li}>Mood and anxiety shifts that feel hormonal, not situational</li>
        </ul>
      </div>
      <div className={s.section}>
        <div className={s.sectionTitle}>Why standard approaches stall</div>
        <div className={s.sectionBody}>
          "Eat less, move more" was designed for metabolically young adults and does not account for estrogen-driven changes in fat distribution, insulin sensitivity, and sleep. Estrogen is not only reproductive: it influences how fat cells respond to insulin, where fat is stored, and how the brain regulates cortisol. As it declines, this pattern requires metabolic support, not more restriction.
        </div>
      </div>
      <div className={s.section}>
        <div className={s.sectionTitle}>Labs to request</div>
        <div className={s.labsBox}>
          Estradiol (day 3 if still cycling; any day if not); progesterone (day 21 if cycling); FSH; LH; total and free testosterone; DHEA-S; TSH, Free T3, Free T4 (estrogen decline can unmask thyroid issues); fasting insulin.
        </div>
      </div>
      <div className={s.section}>
        <div className={s.sectionTitle}>On hormone therapy: an important clarification</div>
        <div className={s.sectionBody}>
          Menopausal hormone therapy (MHT) is a well-established treatment for menopausal symptoms, such as hot flashes, sleep disruption, and vaginal changes. It may modestly influence fat distribution. However, MHT is not primarily a weight-loss treatment, and the evidence that it causes weight loss is weak. It is a prescription decision best made with a menopause-trained clinician who can weigh your personal history, risk factors, and goals.
        </div>
        <div className={`${s.sectionBody} ${s.bodySpaced}`}>
          If pursued, FDA-approved transdermal estradiol plus oral micronized progesterone (Prometrium) are the evidence-based forms. Observational evidence indicates transdermal estradiol carries a lower blood-clot risk than oral estrogen. Compounded "bioidentical" hormones are a separate category that major menopause societies generally discourage in favor of FDA-approved products.
        </div>
      </div>
      <div className={s.section}>
        <div className={s.sectionTitle}>What you directly control</div>
        <div className={s.sectionBody}>
          These are the levers with the strongest evidence for this pattern:
        </div>
        <ul className={s.ul}>
          <li className={s.li}>Resistance training: protects bone and muscle, improves insulin sensitivity; this matters more as estrogen declines</li>
          <li className={s.li}>Protein priority: 30-40 g per meal, with at least 3 g leucine per serving to trigger muscle protein synthesis (harder as estrogen falls)</li>
          <li className={s.li}>Sleep and stress support: both cortisol and insulin sensitivity worsen with sleep disruption</li>
        </ul>
      </div>
    </>
  )
}

function ResultE() {
  return (
    <>
      <div className={s.section}>
        <div className={s.sectionTitle}>What you may recognize</div>
        <ul className={s.ul}>
          <li className={s.li}>Bloating regularly after foods most people tolerate</li>
          <li className={s.li}>History of IBS, SIBO, Crohn's, colitis, or celiac disease</li>
          <li className={s.li}>Significant antibiotic or long-term PPI use that changed your digestion</li>
          <li className={s.li}>Skin conditions (eczema, psoriasis, hives) alongside digestive complaints</li>
          <li className={s.li}>A weak-feeling immune system; frequent colds or slow healing</li>
        </ul>
      </div>
      <div className={s.section}>
        <div className={s.sectionTitle}>Why standard approaches stall</div>
        <div className={s.sectionBody}>
          In dysbiosis, the microbial population may extract more calories from identical foods and send pro-inflammatory signals that block fat release. A calorie-restricted diet without gut support does not address these drivers. The sequence of gut repair also matters: starting prebiotics before reducing inflammatory load often worsens symptoms.
        </div>
      </div>
      <div className={s.section}>
        <div className={s.sectionTitle}>Labs to consider</div>
        <div className={s.labsBox}>
          Comprehensive stool analysis with microbiome mapping (GI-MAP or Genova GI Effects); zonulin (intestinal permeability); hsCRP; calprotectin (intestinal inflammation); secretory IgA. SIBO breath test (hydrogen/methane) if bloating is severe and post-meal. Note: IgG-based food sensitivity panels are controversial; major allergy societies advise against using IgG testing to diagnose food allergy or intolerance. Treat any results as hypotheses, not diagnoses.
        </div>
      </div>
      <div className={s.section}>
        <div className={s.sectionTitle}>What the evidence supports (sequence matters)</div>
        <ul className={s.ul}>
          <li className={s.li}>Phase 1: Remove identified triggers; add a high-quality probiotic (Lactobacillus/Bifidobacterium strains with human research)</li>
          <li className={s.li}>Phase 2: Rebuild the mucosa with L-glutamine, zinc carnosine, and collagen peptides</li>
          <li className={s.li}>Phase 3: Introduce prebiotic fiber gradually (starting at 2-3 g per day). Rule out SIBO first; prebiotic fiber worsens SIBO</li>
        </ul>
        <div className={s.interactionNote}>
          Glucomannan must be taken with at least 8 oz of water. Taken dry or with too little liquid it can swell and cause choking or esophageal obstruction.
        </div>
        <div className={s.dshea}>
          These statements have not been evaluated by the Food and Drug Administration. This is not intended to diagnose, treat, cure, or prevent any disease.
        </div>
      </div>
    </>
  )
}

function ResultF({
  primary, secondary, hasLipedema, hasSleepApnea, hasMedication,
}: {
  primary: Code; secondary: Code | null;
  hasLipedema: boolean; hasSleepApnea: boolean; hasMedication: boolean;
}) {
  const combo = secondary
    ? `${CODE_LABELS[primary]} plus ${CODE_LABELS[secondary]}`
    : CODE_LABELS[primary]
  return (
    <>
      <div className={s.section}>
        <div className={s.sectionTitle}>What this means</div>
        <div className={s.sectionBody}>
          Your results show significant signals across more than one category. In practice, many women with real weight-loss resistance have two or three simultaneous drivers, each reinforcing the others so that single-approach interventions stall. Your pattern suggests: {combo}.
        </div>
        <div className={`${s.sectionBody} ${s.bodySpaced}`}>
          Common combinations: insulin resistance plus cortisol (stress-spiked belly fat); hormone transition plus thyroid (perimenopause unmasking subclinical thyroid issues); gut plus insulin resistance; cortisol plus thyroid (stress suppressing thyroid conversion).
        </div>
      </div>
      {(hasLipedema || hasSleepApnea || hasMedication) && (
        <div className={s.section}>
          <div className={s.sectionTitle}>Additional flags from your answers</div>
          {hasLipedema && (
            <div className={s.flagCard}>
              <div className={s.flagTitle}>Lipedema Pattern Possible</div>
              <div className={s.flagText}>
                If your lower-body fat is distinctly different: dense, tender, painful under pressure, and unresponsive to diet and exercise, lipedema may be a component. Estimates suggest lipedema affects roughly 1 in 9 women, though it is frequently misdiagnosed as obesity. It needs a different clinical approach; mention it to your practitioner.
              </div>
            </div>
          )}
          {hasSleepApnea && (
            <div className={s.flagCard}>
              <div className={s.flagTitle}>Sleep Apnea Risk</div>
              <div className={s.flagText}>
                Untreated sleep apnea drives cortisol elevation, insulin resistance, leptin dysregulation, and inflammation simultaneously. If you wake unrefreshed and have been told you snore or stop breathing, a sleep study is a critical first step before any weight protocol.
              </div>
            </div>
          )}
          {hasMedication && (
            <div className={s.flagCard}>
              <div className={s.flagTitle}>Medication-Induced Weight Gain</div>
              <div className={s.flagText}>
                Antidepressants, antipsychotics, or corticosteroids can drive weight gain through mechanisms that need specific protocol adjustments. Discuss with your prescribing physician or a clinical pharmacist before changing anything.
              </div>
            </div>
          )}
        </div>
      )}
      <div className={s.section}>
        <div className={s.sectionTitle}>Labs to request</div>
        <div className={s.labsBox}>
          Fasting insulin and HOMA-IR; TSH, Free T3, Free T4, and TPO antibodies; estradiol, progesterone, FSH, DHEA-S; diurnal cortisol assessment; hsCRP; comprehensive metabolic panel; vitamin D, B12, and RBC magnesium.
        </div>
      </div>
      <div className={s.section}>
        <div className={s.sectionTitle}>Why this pattern needs a sequenced approach</div>
        <div className={s.sectionBody}>
          Addressing drivers in the right order matters: each step should build on the last. Treating cortisol while ignoring insulin resistance, for example, produces partial results. A consultation maps the sequence for your specific combination.
        </div>
      </div>
    </>
  )
}

// ---- Main Component ----

export default function RootCauseQuiz() {
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
          // Selecting "none" clears all others; deselecting removes it
          if (sel.includes(id)) return { ...prev, [qIdx]: sel.filter(x => x !== id) }
          return { ...prev, [qIdx]: [id] }
        }
        // Selecting a real option clears any "exclusive/none" options
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
      await fetch('/api/beehiiv-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailVal, firstName: nameVal }),
      })
    } catch { /* silent; show result regardless */ }
    setSubmitting(false)
    setPhase('result')
  }

  const scores = useMemo(() => tally(answers), [answers])
  const totalScore = useMemo(() => Object.values(scores).reduce((a, b) => a + b, 0) || 1, [scores])
  const { primary, secondary } = useMemo(() => getResult(scores), [scores])
  const isComplex = primary === 'CP' || (secondary !== null && scores[primary] === scores[secondary])
  const hasPcos = primary === 'IR' && hasFlag(answers, 'pcos')
  const hasLipedema = hasFlag(answers, 'lipedema')
  const hasSleepApnea = hasFlag(answers, 'sleep_apnea')
  const hasMedication = hasFlag(answers, 'medication')

  const RESULT_HEADS: Record<string, { heading: string; subhead: string }> = {
    IR: {
      heading: 'Insulin and Metabolic Resistance',
      subhead: 'Your body may be stuck in fat-storage mode. Willpower does not override a metabolic signal.',
    },
    CR: {
      heading: 'Cortisol and Stress Overload',
      subhead: 'When the stress-hormone system is dysregulated, calorie restriction is fighting the wrong battle.',
    },
    TH: {
      heading: 'Thyroid and Metabolic Slowdown',
      subhead: 'When thyroid output is diminished, even "subclinically," weight loss can become physiologically hard regardless of effort.',
    },
    HT: {
      heading: 'Hormone Transition',
      subhead: 'The shift into perimenopause or menopause is one of the most powerful and least-explained metabolic events in a woman\'s life.',
    },
    GU: {
      heading: 'Gut and Inflammation',
      subhead: 'When the microbiome and inflammatory signals are dysregulated, your metabolism receives a constant fat-storage message no diet alone can override.',
    },
    CP: {
      heading: 'Complex Multi-Root Pattern',
      subhead: 'You are not dealing with one root cause; you are dealing with several. Which is exactly why nothing has worked.',
    },
  }

  const displayCode = isComplex ? 'CP' : primary
  const head = RESULT_HEADS[displayCode]

  return (
    <div className={s.page}>
      <div className={s.progressWrap}>
        <div className={s.progressFill} style={{ width: `${progress}%` }} />
      </div>

      <div className={s.inner}>

        {/* INTRO */}
        {phase === 'intro' && (
          <div className={s.intro}>
            <div className={s.introEyebrow}>PharmD-Designed Assessment</div>
            <h1 className={s.introTitle}>What's Really Blocking Your Weight Loss?</h1>
            <p className={s.introSubhead}>
              18 questions to identify the hidden metabolic, hormonal, or biochemical pattern keeping you stuck, even when your effort is real.
            </p>
            <div className={s.introBody}>
              <p>Most weight-loss advice is built for the average person. But if you have been eating well, exercising consistently, and still not seeing results, you are not average: you are dealing with a root cause the standard playbook was never designed to address.</p>
              <p style={{ margin: '0.75rem 0 0' }}>This assessment uses the same root-cause framework used in functional-medicine clinics. It takes about three minutes and identifies your most likely underlying driver, and what to actually do about it.</p>
              <p className={s.trustLine}>18 questions · Functional-PharmD framework · Maps 6 root-cause patterns</p>
            </div>
            <button className={s.startBtn} onClick={() => setPhase('quiz')}>
              Find My Root Cause →
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
              {qIdx < QUESTIONS.length - 1 ? 'Next →' : 'See My Results →'}
            </button>
          </div>
        )}

        {/* EMAIL GATE */}
        {phase === 'email' && (
          <div className={s.emailGate}>
            <div className={s.introEyebrow}>Your results are ready</div>
            <h2 className={s.emailTitle}>Your primary pattern: {RESULT_HEADS[displayCode].heading}</h2>
            <p className={s.emailBody}>
              Enter your email to receive your full breakdown, the specific labs to request, and the prescriber script to use with your doctor.
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
                {submitting ? 'Sending...' : 'Show My Full Results →'}
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
            <div className={`${s.resultBadge} ${s.primaryBadge}`}>Your Root Cause</div>
            <h2 className={s.resultHeading}>{head.heading}</h2>
            <p className={s.resultSubhead}>{head.subhead}</p>

            {/* Score breakdown */}
            <div className={s.scoresCard}>
              <div className={s.scoresTitle}>Pattern breakdown</div>
              <div className={s.scoreRows}>
                {(Object.entries(scores) as [Code, number][])
                  .sort((a, b) => b[1] - a[1])
                  .map(([code, pts]) => {
                    const pct = Math.round((pts / totalScore) * 100)
                    return (
                      <div key={code} className={s.scoreRow}>
                        <span className={s.scoreLabel}>{CODE_LABELS[code]}</span>
                        <div className={s.scoreBar}>
                          <div className={`${s.scoreFill} ${FILL_CLASS[code]}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className={s.scorePct}>{pct}%</span>
                      </div>
                    )
                  })}
              </div>
            </div>

            {/* Secondary pattern */}
            {secondary && secondary !== displayCode && (
              <div className={s.secondaryCard}>
                <div className={s.secondaryLabel}>Secondary pattern</div>
                <div className={s.secondaryName}>{CODE_LABELS[secondary]}: this pattern is also active and should be addressed in sequence.</div>
              </div>
            )}

            <hr className={s.divider} />

            {/* Result-specific content */}
            {displayCode === 'IR' && <ResultA hasPcos={hasPcos} />}
            {displayCode === 'CR' && <ResultB />}
            {displayCode === 'TH' && <ResultC />}
            {displayCode === 'HT' && <ResultD />}
            {displayCode === 'GU' && <ResultE />}
            {displayCode === 'CP' && (
              <ResultF
                primary={primary}
                secondary={secondary}
                hasLipedema={hasLipedema}
                hasSleepApnea={hasSleepApnea}
                hasMedication={hasMedication}
              />
            )}

            {/* CTA */}
            <div className={s.ctaBlock}>
              <div className={s.ctaTitle}>Ready to build a protocol around your root cause?</div>
              <div className={s.ctaBody}>
                The assessment tells you what the pattern is. A functional-medicine educator maps the sequence: which interventions to layer in, in which order, at the right doses for your specific situation.
              </div>
              <Link to="/join" className={s.ctaBtn}>Join Hunter's Holistic Health →</Link>
              <div className={s.ctaSub}>Start with the Foundation plan. Cancel anytime.</div>
            </div>

            {/* Disclaimer */}
            <p className={s.disclaimer}>
              This assessment is educational and is not medical advice, diagnosis, or treatment. It maps likely patterns from self-reported information and does not establish a provider-patient relationship or diagnose any condition. Supplement references describe research findings to discuss with a qualified provider; they are not claims to diagnose, treat, cure, or prevent disease, and supplement statements have not been evaluated by the FDA. Talk with your healthcare provider before starting any supplement, hormone therapy, or medication, especially if you are pregnant, breastfeeding, or taking other medications.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
