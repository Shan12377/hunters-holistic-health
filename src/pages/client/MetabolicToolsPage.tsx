import { useState } from 'react'
import styles from './MetabolicToolsPage.module.css'
import shared from '@/styles/shared.module.css'

// --- Data ---
const GOALS = [
  { value: 'weight_loss',         label: 'Sustainable Weight Loss' },
  { value: 'regulate_cycle',      label: 'Regulate My Cycle and Hormones' },
  { value: 'increase_energy',     label: 'Increase Energy and End Afternoon Crashes' },
  { value: 'blood_sugar',         label: 'Improve My Blood Sugar' },
  { value: 'reduce_inflammation', label: 'Reduce Inflammation and Joint Pain' },
]

type Symptom = { id: string; label: string; group: string }
const SYMPTOMS: Symptom[] = [
  { id: 'ir_fatigue',  label: 'Fatigue After Meals',               group: 'Blood Sugar' },
  { id: 'ir_cravings', label: 'Sugar and Carb Cravings',           group: 'Blood Sugar' },
  { id: 'ir_belly',    label: 'Stubborn Belly Fat',                group: 'Blood Sugar' },
  { id: 'horm_cycles', label: 'Irregular or Absent Cycles',        group: 'Hormonal' },
  { id: 'horm_acne',   label: 'Hormonal Acne (Jawline)',           group: 'Hormonal' },
  { id: 'horm_hair',   label: 'Unwanted Hair Growth',              group: 'Hormonal' },
  { id: 'dig_reflux',  label: 'Acid Reflux or GERD',              group: 'Digestive' },
  { id: 'dig_bloat',   label: 'Bloating and Gas',                  group: 'Digestive' },
  { id: 'dig_joints',  label: 'Joint Pain and Stiffness',          group: 'Digestive' },
  { id: 'eng_sleep',   label: 'Difficulty Falling or Staying Asleep', group: 'Energy' },
  { id: 'eng_fog',     label: 'Brain Fog',                        group: 'Energy' },
  { id: 'eng_fatigue', label: 'Persistent Fatigue',               group: 'Energy' },
]
const SYMPTOM_GROUPS = ['Blood Sugar', 'Hormonal', 'Digestive', 'Energy']

const MEDICATIONS = [
  { id: 'metformin',   label: 'Metformin' },
  { id: 'statins',     label: 'Statin (e.g. Lipitor, Crestor)' },
  { id: 'ocp',         label: 'Oral Contraceptive (Birth Control Pill)' },
  { id: 'spiro',       label: 'Spironolactone' },
  { id: 'thyroid',     label: 'Thyroid Medication (e.g. Levothyroxine)' },
  { id: 'ppi',         label: 'Acid Reducer or PPI (e.g. Omeprazole)' },
  { id: 'glp1',        label: 'GLP-1 Agonist (e.g. Ozempic, Mounjaro)' },
]

type DepletionAlert = { nutrient: string; why: string; action: string }
const DEPLETIONS: Record<string, DepletionAlert[]> = {
  metformin: [{
    nutrient: 'Vitamin B12',
    why: 'Metformin reduces B12 absorption in the intestine by interfering with calcium-dependent transport. Long-term use can cause gradual depletion even without symptoms.',
    action: 'Ask your provider to check serum B12 and methylmalonic acid annually. A sublingual or methylcobalamin form absorbs better than standard cyanocobalamin.',
  }],
  statins: [{
    nutrient: 'CoQ10 (Ubiquinol)',
    why: 'Statins block the mevalonate pathway to reduce cholesterol, but CoQ10 is made by the same pathway. Muscle pain and fatigue are the most common symptoms of depletion.',
    action: 'Discuss CoQ10 supplementation with your provider. The ubiquinol form has better bioavailability than ubiquinone, especially in people over 40.',
  }],
  ocp: [
    {
      nutrient: 'B Vitamins (B2, B6, B12, Folate)',
      why: 'Oral contraceptives increase estrogen, which accelerates B vitamin metabolism. B6 depletion is the most clinically significant and is linked to mood changes and PMS.',
      action: 'A methylated B-complex covers the most common depletions. Look for methylfolate and methylcobalamin on the label, not folic acid and cyanocobalamin.',
    },
    {
      nutrient: 'Magnesium and Zinc',
      why: 'Estrogen increases urinary excretion of both minerals. Zinc depletion can affect skin, immunity, and cycle regularity. Magnesium depletion affects sleep and stress response.',
      action: 'Magnesium glycinate is the most absorbable form with the fewest GI side effects. Zinc picolinate or bisglycinate is preferred over zinc oxide.',
    },
  ],
  spiro: [{
    nutrient: 'Sodium (monitor potassium)',
    why: 'Spironolactone is a potassium-sparing diuretic. It can raise potassium levels (hyperkalemia) and lower sodium. Both need monitoring, especially if you also use potassium supplements or eat a high-potassium diet.',
    action: 'Do not take additional potassium supplements while on spironolactone without provider guidance. Monitor labs as directed by your prescriber.',
  }],
  thyroid: [{
    nutrient: 'Absorption window',
    why: 'Levothyroxine absorption is dramatically affected by food, supplements, and other medications. Calcium, iron, magnesium, and fiber all bind the medication and reduce absorption.',
    action: 'Take thyroid medication on an empty stomach, 30 to 60 minutes before eating. Wait at least 4 hours before taking calcium, iron, or magnesium supplements.',
  }],
  ppi: [
    {
      nutrient: 'Vitamin B12',
      why: 'Stomach acid is required to release B12 from food. PPIs reduce acid production, which reduces B12 absorption from dietary sources over time.',
      action: 'Sublingual B12 bypasses the need for stomach acid and is the preferred form for people on long-term PPIs.',
    },
    {
      nutrient: 'Magnesium, Zinc, and Calcium',
      why: 'All three require an acidic environment for optimal absorption. Long-term PPI use is associated with hypomagnesemia and increased fracture risk from calcium depletion.',
      action: 'Discuss monitoring magnesium and bone density with your provider if you have been on a PPI for more than 12 months.',
    },
  ],
  glp1: [{
    nutrient: 'Protein and Muscle Mass',
    why: 'GLP-1 agonists reduce appetite significantly, which often means less protein by default. Research shows 25 to 40 percent of weight lost on GLP-1 therapy can be lean soft tissue without a deliberate resistance program.',
    action: 'Target 1.2 to 1.6g of protein per kg of body weight daily. Prioritize resistance training 2 to 3 times per week. The medication suppresses appetite; it cannot create a training stimulus.',
  }],
}

// Lab interpretation (educational)
type LabFlag = { marker: string; value: number; label: string; note: string }
function interpretLabs(glucose: number, hba1c: number, tg: number, hdl: number): LabFlag[] {
  const flags: LabFlag[] = []

  if (glucose && glucose >= 100 && glucose < 126) flags.push({
    marker: 'Fasting Glucose', value: glucose,
    label: 'Elevated: discuss with provider',
    note: 'Fasting glucose 100 to 125 mg/dL meets the clinical threshold for prediabetes. Lifestyle intervention at this stage is highly effective.',
  })
  if (glucose && glucose >= 126) flags.push({
    marker: 'Fasting Glucose', value: glucose,
    label: 'Elevated: discuss with provider',
    note: 'Fasting glucose at or above 126 mg/dL meets the clinical criteria for diabetes evaluation. This requires provider follow-up.',
  })

  if (hba1c && hba1c >= 5.7 && hba1c < 6.5) flags.push({
    marker: 'HbA1c', value: hba1c,
    label: 'Elevated: discuss with provider',
    note: 'HbA1c 5.7 to 6.4% meets the clinical threshold for prediabetes. This reflects average blood sugar over 2 to 3 months.',
  })
  if (hba1c && hba1c >= 6.5) flags.push({
    marker: 'HbA1c', value: hba1c,
    label: 'Elevated: discuss with provider',
    note: 'HbA1c at or above 6.5% meets the clinical criteria for diabetes evaluation. This requires provider follow-up.',
  })

  if (tg && hdl && (tg / hdl) > 2.5) flags.push({
    marker: 'Triglyceride / HDL Ratio', value: parseFloat((tg / hdl).toFixed(1)),
    label: 'Elevated: strong insulin resistance signal',
    note: `A TG/HDL ratio above 2.5 is a clinically meaningful marker of insulin resistance. Your ratio is ${(tg / hdl).toFixed(1)}. Lifestyle intervention directly improves this number.`,
  })

  if (tg && tg >= 150) flags.push({
    marker: 'Triglycerides', value: tg,
    label: 'Elevated: discuss with provider',
    note: 'Elevated triglycerides are strongly linked to insulin resistance, excess refined carbohydrate intake, and low-grade inflammation. This typically responds well to dietary intervention.',
  })

  return flags
}

// Blueprint logic (same as public page)
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

function getAdditions(syms: string[], meds: string[]): string[] {
  const adds: string[] = []
  if (syms.includes('horm_cycles') || syms.includes('horm_acne'))
    adds.push('1 to 2 cups of spearmint tea daily is shown to support healthy androgen balance.')
  if (syms.includes('ir_belly') || syms.includes('ir_fatigue') || syms.includes('ir_cravings'))
    adds.push('Post-meal movement is especially important for your pattern. Even 5 minutes of squats after meals helps clear blood sugar.')
  if (syms.includes('eng_sleep'))
    adds.push('Magnesium glycinate is commonly used to support sleep quality. Discuss with your provider.')
  if (syms.includes('dig_bloat') || syms.includes('dig_reflux'))
    adds.push('Eating slowly and chewing thoroughly reduces bloating and reflux significantly. Start there before supplements.')
  if (meds.includes('glp1'))
    adds.push('Resistance training 2 to 3 times per week is non-negotiable on GLP-1 therapy to preserve lean mass.')
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

type AppTab = 'protocol' | 'homa' | 'depletions'
type PGStep = 'goal' | 'symptoms' | 'labs' | 'results'

export default function MetabolicToolsPage() {
  const [tab, setTab] = useState<AppTab>('protocol')

  // Protocol Generator
  const [pgStep, setPgStep]         = useState<PGStep>('goal')
  const [pgGoal, setPgGoal]         = useState('')
  const [pgSymptoms, setPgSymptoms] = useState<string[]>([])
  const [pgMeds, setPgMeds]         = useState<string[]>([])
  const [glucose, setGlucose]       = useState('')
  const [hba1c, setHba1c]           = useState('')
  const [tg, setTg]                 = useState('')
  const [hdl, setHdl]               = useState('')

  // HOMA
  const [homaInsulin, setHomaInsulin] = useState('')
  const [homaGlucose, setHomaGlucose] = useState('')
  const [homaUnit, setHomaUnit]       = useState<'mgdl' | 'mmol'>('mgdl')
  const [homaResult, setHomaResult]   = useState<number | null>(null)

  function toggleSymptom(id: string) {
    setPgSymptoms(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])
  }
  function toggleMed(id: string) {
    setPgMeds(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id])
  }

  function calcHoma(e: React.FormEvent) {
    e.preventDefault()
    const ins = parseFloat(homaInsulin)
    const glc = parseFloat(homaGlucose)
    if (isNaN(ins) || isNaN(glc) || ins <= 0 || glc <= 0) return
    setHomaResult(calcHOMA(ins, glc, homaUnit))
  }

  const blueprint    = pgStep === 'results' ? getBlueprint(pgSymptoms) : null
  const labFlags     = pgStep === 'results' ? interpretLabs(parseFloat(glucose), parseFloat(hba1c), parseFloat(tg), parseFloat(hdl)) : []
  const additions    = pgStep === 'results' ? getAdditions(pgSymptoms, pgMeds) : []
  const depletions   = pgMeds.flatMap(m => DEPLETIONS[m] ?? [])
  const activeDepls  = pgMeds.flatMap(m =>
    (DEPLETIONS[m] ?? []).map(d => ({ ...d, med: MEDICATIONS.find(med => med.id === m)?.label ?? m }))
  )

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Metabolic Tools</h1>
        <p className={styles.pageSub}>Clinical calculators and your personalized 90-day protocol, in one place.</p>
      </div>

      <div className={styles.tabBar}>
        <button className={`${styles.tabBtn} ${tab === 'protocol' ? styles.tabBtnActive : ''}`} onClick={() => setTab('protocol')}>
          Protocol Generator
        </button>
        <button className={`${styles.tabBtn} ${tab === 'homa' ? styles.tabBtnActive : ''}`} onClick={() => setTab('homa')}>
          HOMA-IR
        </button>
        <button className={`${styles.tabBtn} ${tab === 'depletions' ? styles.tabBtnActive : ''}`} onClick={() => setTab('depletions')}>
          Drug-Nutrient Education
        </button>
      </div>

      {/* ===== PROTOCOL GENERATOR ===== */}
      {tab === 'protocol' && (
        <div className={styles.tool}>

          {pgStep === 'goal' && (
            <div className={styles.step}>
              <h2 className={styles.stepTitle}>Step 1 of 3: Your Primary Goal</h2>
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
                <button className={shared.btnPrimary} disabled={!pgGoal} onClick={() => setPgStep('symptoms')}>Next</button>
              </div>
            </div>
          )}

          {pgStep === 'symptoms' && (
            <div className={styles.step}>
              <h2 className={styles.stepTitle}>Step 2 of 3: Your Symptoms</h2>
              <p className={styles.stepSub}>Check everything you experience regularly.</p>
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
                <button className={shared.btnPrimary} onClick={() => setPgStep('labs')}>Next</button>
              </div>
            </div>
          )}

          {pgStep === 'labs' && (
            <div className={styles.step}>
              <h2 className={styles.stepTitle}>Step 3 of 3: Labs and Medications</h2>
              <p className={styles.stepSub}>All optional. Enter what you have. This data stays in your browser and is never stored or transmitted.</p>

              <div className={styles.labSection}>
                <p className={styles.labSectionLabel}>Recent Lab Values (optional)</p>
                <div className={styles.labGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Fasting Glucose (mg/dL)</label>
                    <input type="number" value={glucose} onChange={e => setGlucose(e.target.value)} placeholder="e.g. 95" className={styles.formInput} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>HbA1c (%)</label>
                    <input type="number" step="0.1" value={hba1c} onChange={e => setHba1c(e.target.value)} placeholder="e.g. 5.4" className={styles.formInput} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Triglycerides (mg/dL)</label>
                    <input type="number" value={tg} onChange={e => setTg(e.target.value)} placeholder="e.g. 120" className={styles.formInput} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>HDL Cholesterol (mg/dL)</label>
                    <input type="number" value={hdl} onChange={e => setHdl(e.target.value)} placeholder="e.g. 55" className={styles.formInput} />
                  </div>
                </div>
              </div>

              <div className={styles.labSection}>
                <p className={styles.labSectionLabel}>Current Medications (optional)</p>
                <p className={styles.labSectionNote}>Selecting a medication adds personalized drug-nutrient depletion education to your protocol.</p>
                {MEDICATIONS.map(m => (
                  <label key={m.id} className={styles.checkLabel}>
                    <input
                      type="checkbox"
                      checked={pgMeds.includes(m.id)}
                      onChange={() => toggleMed(m.id)}
                      className={styles.checkInput}
                    />
                    {m.label}
                  </label>
                ))}
              </div>

              <div className={styles.stepNav}>
                <button className={shared.btnGhost} onClick={() => setPgStep('symptoms')}>Back</button>
                <button className={shared.btnPrimary} onClick={() => setPgStep('results')}>Generate My Protocol</button>
              </div>
            </div>
          )}

          {pgStep === 'results' && blueprint && (
            <div className={styles.results}>
              <div className={`${styles.blueprintCard} ${styles[`blueprint_${blueprint.key}`]}`}>
                <p className={styles.blueprintLabel}>Your Metabolic Blueprint</p>
                <h2 className={styles.blueprintName}>{blueprint.name}</h2>
                <p className={styles.blueprintDesc}>{blueprint.desc}</p>
              </div>

              {labFlags.length > 0 && (
                <div className={styles.labFlagsSection}>
                  <h3 className={styles.sectionTitle}>Lab Insights</h3>
                  {labFlags.map((f, i) => (
                    <div key={i} className={styles.labFlagCard}>
                      <div className={styles.labFlagHeader}>
                        <span className={styles.labFlagMarker}>{f.marker}</span>
                        <span className={styles.labFlagValue}>{f.value}</span>
                        <span className={styles.labFlagStatus}>{f.label}</span>
                      </div>
                      <p className={styles.labFlagNote}>{f.note}</p>
                    </div>
                  ))}
                </div>
              )}

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

              {activeDepls.length > 0 && (
                <div className={styles.deplSection}>
                  <h3 className={styles.sectionTitle}>Drug-Nutrient Education</h3>
                  <p className={styles.deplIntro}>Based on your medications. This is educational content. Discuss all supplement decisions with your prescribing provider.</p>
                  {activeDepls.map((d, i) => (
                    <div key={i} className={styles.deplCard}>
                      <div className={styles.deplHeader}>
                        <span className={styles.deplMed}>{d.med}</span>
                        <span className={styles.deplNutrient}>{d.nutrient}</span>
                      </div>
                      <p className={styles.deplWhy}><strong>Why:</strong> {d.why}</p>
                      <p className={styles.deplAction}><strong>What to know:</strong> {d.action}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className={styles.disclaimer}>
                This protocol is for educational purposes only. It does not constitute medical advice and does not create a patient-provider relationship. Coordinate any changes with your healthcare provider.
              </div>

              <button className={shared.btnGhost} onClick={() => { setPgStep('goal'); setPgGoal(''); setPgSymptoms([]); setPgMeds([]); setGlucose(''); setHba1c(''); setTg(''); setHdl('') }}>
                Start Over
              </button>
            </div>
          )}
        </div>
      )}

      {/* ===== HOMA-IR ===== */}
      {tab === 'homa' && (
        <div className={styles.tool}>
          <div className={styles.step}>
            <h2 className={styles.stepTitle}>HOMA-IR Calculator</h2>
            <p className={styles.stepSub}>Uses fasting insulin and fasting glucose to estimate insulin resistance. Most useful tracked over time as you implement lifestyle changes.</p>

            <form onSubmit={calcHoma} className={styles.homaForm}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Fasting Insulin (µU/mL)</label>
                <input type="number" step="0.1" min="0.1" value={homaInsulin} onChange={e => setHomaInsulin(e.target.value)} placeholder="e.g. 8" className={styles.formInput} required />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Fasting Glucose</label>
                <div className={styles.unitToggle}>
                  <button type="button" className={`${styles.unitBtn} ${homaUnit === 'mgdl' ? styles.unitBtnActive : ''}`} onClick={() => setHomaUnit('mgdl')}>mg/dL</button>
                  <button type="button" className={`${styles.unitBtn} ${homaUnit === 'mmol' ? styles.unitBtnActive : ''}`} onClick={() => setHomaUnit('mmol')}>mmol/L</button>
                </div>
                <input type="number" step="0.1" min="1" value={homaGlucose} onChange={e => setHomaGlucose(e.target.value)} placeholder={homaUnit === 'mgdl' ? 'e.g. 90' : 'e.g. 5.0'} className={styles.formInput} required />
              </div>
              <button type="submit" className={shared.btnPrimary}>Calculate</button>
            </form>

            {homaResult !== null && (() => {
              const { label, color } = homaLabel(homaResult)
              return (
                <div className={styles.homaResult}>
                  <p className={styles.homaScore} style={{ color }}>{homaResult.toFixed(2)}</p>
                  <p className={styles.homaStatusLabel} style={{ color }}>{label}</p>
                  <div className={styles.homaScale}>
                    {[
                      { range: 'Under 1.0', status: 'Optimal', cls: styles.homaGood },
                      { range: '1.0 to 1.9', status: 'Borderline', cls: styles.homaWarn },
                      { range: '1.9 to 2.9', status: 'Early IR', cls: styles.homaHigh },
                      { range: 'Above 2.9', status: 'Significant IR', cls: styles.homaDanger },
                    ].map(row => (
                      <div key={row.range} className={styles.homaScaleRow}>
                        <span>{row.range}</span>
                        <span className={row.cls}>{row.status}</span>
                      </div>
                    ))}
                  </div>
                  <p className={styles.homaNote}>Non-diagnostic educational estimate. Bring to your provider.</p>
                </div>
              )
            })()}
          </div>
        </div>
      )}

      {/* ===== DRUG-NUTRIENT EDUCATION ===== */}
      {tab === 'depletions' && (
        <div className={styles.tool}>
          <div className={styles.step}>
            <h2 className={styles.stepTitle}>Drug-Nutrient Depletion Education</h2>
            <p className={styles.stepSub}>Common medications that affect nutrient status. This is educational content. All supplement decisions should be made with your prescribing provider.</p>

            {MEDICATIONS.filter(m => DEPLETIONS[m.id]).map(m => (
              <div key={m.id} className={styles.deplFullCard}>
                <h3 className={styles.deplFullMed}>{m.label}</h3>
                {DEPLETIONS[m.id].map((d, i) => (
                  <div key={i} className={styles.deplFullItem}>
                    <p className={styles.deplFullNutrient}>{d.nutrient}</p>
                    <p className={styles.deplWhy}><strong>Why:</strong> {d.why}</p>
                    <p className={styles.deplAction}><strong>What to know:</strong> {d.action}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
