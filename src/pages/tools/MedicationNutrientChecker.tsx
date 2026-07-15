import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import styles from './MedicationNutrientChecker.module.css'

// ─── META ──────────────────────────────────────────────────────────────────
const META_TITLE = 'Medication Nutrient Depletion Checker | Hunter\'s Holistic Health'
const META_DESC = 'Free PharmD-built tool that stacks nutrient depletions across your entire medication list. See what to replace, the right supplement form, timing, and labs to request.'

function MetaTags() {
  if (typeof document === 'undefined') return null
  document.title = META_TITLE
  function setMeta(name: string, content: string, prop?: boolean) {
    const attr = prop ? 'property' : 'name'
    let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null
    if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el) }
    el.content = content
  }
  setMeta('description', META_DESC)
  setMeta('og:title', META_TITLE, true)
  setMeta('og:description', META_DESC, true)
  setMeta('og:type', 'website', true)
  setMeta('og:url', 'https://www.huntersholistichealth.com/tools/medication-nutrient-checker', true)
  setMeta('twitter:card', 'summary')
  setMeta('twitter:title', META_TITLE)
  setMeta('twitter:description', META_DESC)
  let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
  if (!canonical) { canonical = document.createElement('link'); canonical.setAttribute('rel', 'canonical'); document.head.appendChild(canonical) }
  canonical.href = 'https://www.huntersholistichealth.com/tools/medication-nutrient-checker'
  return null
}

// ─── TYPES ─────────────────────────────────────────────────────────────────
type MedId = 'glp1'|'metformin'|'statin'|'betab'|'ace'|'loop'|'thiazide'|'ppi'|'thyroid'|'ocp'|'ssri'|'cortico'
type HerbId = 'berberine'|'stjohns'|'ginkgo'|'ashwagandha'
type SxId = 'fatigue'|'hair_loss'|'muscle'|'brain_fog'|'mood'|'immunity'|'skin'|'heart'|'bone'|'wound'|'sleep'|'anxiety'|'taste'|'nails'|'nerve'|'gi'
type NutId = 'b12'|'coq10'|'magnesium'|'zinc'|'vitamin_d'|'iron'|'potassium'|'folate'|'calcium'|'b1'|'b6'|'b2'|'vitamin_c'|'selenium'|'biotin'
type Sev = 'H'|'M'|'L'
type Priority = 'high'|'mod'|'mon'

interface Medication { id: MedId; name: string; eg: string; cat: string }
interface Herb { id: HerbId; name: string; danger: boolean }
interface Symptom { id: SxId; label: string }
interface NutrientInfo {
  name: string; symptoms: SxId[]
  right_form: string; wrong_form: string
  timing: string; food: string; note: string; lab: string
}
interface NutrientResult { count: number; maxSev: Sev; meds: MedId[] }
interface Alert { severity: 'red'|'amber'; title: string; body: string }

// ─── DATA ──────────────────────────────────────────────────────────────────
const MEDICATIONS: Medication[] = [
  { id:'glp1',     name:'GLP-1 Medications',          eg:'Ozempic, Wegovy, Mounjaro, Zepbound',      cat:'metabolic' },
  { id:'metformin',name:'Metformin',                  eg:'Glucophage, Fortamet',                      cat:'metabolic' },
  { id:'statin',   name:'Statins',                    eg:'Atorvastatin, Rosuvastatin, Simvastatin',   cat:'cardio' },
  { id:'betab',    name:'Beta-Blockers',              eg:'Metoprolol, Carvedilol, Atenolol',          cat:'cardio' },
  { id:'ace',      name:'ACE Inhibitors',             eg:'Lisinopril, Enalapril, Captopril',          cat:'cardio' },
  { id:'loop',     name:'Loop Diuretics',             eg:'Furosemide (Lasix), Bumetanide',            cat:'cardio' },
  { id:'thiazide', name:'Thiazide Diuretics',         eg:'Hydrochlorothiazide (HCTZ), Chlorthalidone',cat:'cardio' },
  { id:'ppi',      name:'Proton Pump Inhibitors',     eg:'Omeprazole, Pantoprazole, Lansoprazole',    cat:'gi' },
  { id:'thyroid',  name:'Thyroid Medication',         eg:'Levothyroxine, Synthroid, Armour Thyroid',  cat:'hormonal' },
  { id:'ocp',      name:'Birth Control / OCP',        eg:'Oral contraceptives, NuvaRing, Patch',      cat:'hormonal' },
  { id:'ssri',     name:'Antidepressants (SSRI/SNRI)',eg:'Sertraline, Escitalopram, Venlafaxine',     cat:'psych' },
  { id:'cortico',  name:'Corticosteroids',            eg:'Prednisone, Methylprednisolone',             cat:'inflam' },
]

const HERBS: Herb[] = [
  { id:'berberine',   name:'Berberine',       danger:true  },
  { id:'stjohns',     name:"St. John's Wort", danger:true  },
  { id:'ginkgo',      name:'Ginkgo Biloba',   danger:false },
  { id:'ashwagandha', name:'Ashwagandha',     danger:false },
]

const SYMPTOMS: Symptom[] = [
  { id:'fatigue',   label:'Fatigue / Low Energy' },       { id:'hair_loss', label:'Hair Loss / Thinning' },
  { id:'muscle',    label:'Muscle Cramps / Weakness' },   { id:'brain_fog', label:'Brain Fog / Memory' },
  { id:'mood',      label:'Mood Changes / Low Mood' },    { id:'immunity',  label:'Frequent Illness' },
  { id:'skin',      label:'Dry Skin / Rashes' },          { id:'heart',     label:'Palpitations / Irregular Heartbeat' },
  { id:'bone',      label:'Bone / Joint Pain' },          { id:'wound',     label:'Slow Wound Healing' },
  { id:'sleep',     label:'Poor Sleep' },                 { id:'anxiety',   label:'Anxiety / Restlessness' },
  { id:'taste',     label:'Loss of Taste / Smell' },      { id:'nails',     label:'Brittle Nails' },
  { id:'nerve',     label:'Numbness / Tingling' },        { id:'gi',        label:'Digestive Issues / Nausea' },
]

const DEPLETIONS_MAP: Record<MedId, Partial<Record<NutId, Sev>>> = {
  glp1:      { iron:'M', vitamin_d:'M', b12:'L', magnesium:'L', zinc:'L', potassium:'L', folate:'L', biotin:'L', calcium:'L' },
  metformin: { b12:'H', folate:'M', coq10:'L', b6:'L' },
  statin:    { coq10:'M', vitamin_d:'L', selenium:'L' },
  betab:     { coq10:'M', b6:'L' },
  ace:       { zinc:'M' },
  loop:      { b1:'H', potassium:'H', magnesium:'H', calcium:'M', zinc:'M' },
  thiazide:  { potassium:'H', magnesium:'M', zinc:'L', coq10:'L' },
  ppi:       { b12:'M', magnesium:'H', calcium:'M', vitamin_c:'L', iron:'M', zinc:'L' },
  thyroid:   {},
  ocp:       { folate:'M', b6:'M', b2:'M', b12:'L', vitamin_c:'L', zinc:'L', magnesium:'L', selenium:'L' },
  ssri:      { folate:'L', b6:'L', b12:'L', coq10:'L' },
  cortico:   { calcium:'H', vitamin_d:'H', potassium:'M', magnesium:'M', zinc:'M', vitamin_c:'M', folate:'L', b6:'L' },
}

const NUTRIENT_EVIDENCE: Record<NutId, 'strong'|'mod'|'limited'> = {
  b12:'strong', magnesium:'strong', coq10:'mod', iron:'mod', folate:'mod', calcium:'mod',
  vitamin_d:'mod', potassium:'strong', zinc:'mod', b1:'mod', b6:'limited', b2:'limited',
  vitamin_c:'limited', selenium:'limited', biotin:'limited',
}

const NUTRIENTS: Record<NutId, NutrientInfo> = {
  b12: {
    name:'Vitamin B12', symptoms:['fatigue','brain_fog','mood','nerve','hair_loss'],
    right_form:'Methylcobalamin or cyanocobalamin both raise B12 effectively. Sublingual or oral high-dose works for most people; injections are used when absorption is severely impaired.',
    wrong_form:'',
    timing:'Morning, with or without food. Water-soluble, no strict timing.',
    food:'Organ meats, eggs, sardines, beef, clams, B12-fortified nutritional yeast.',
    note:'Metformin is the strongest driver: the ADA Standards of Care recommend considering B12 monitoring in long-term metformin users, especially at doses of 1,500 mg per day or more, or after roughly 4 to 5 years. PPIs reduce B12 absorption by lowering stomach acid. If you are on both metformin and a GLP-1, the GLP-1 contribution is mostly through reduced food intake rather than a direct drug effect. Request serum B12 plus methylmalonic acid (MMA), which catches deficiency that serum alone can miss.',
    lab:'Serum B12 + Methylmalonic Acid (MMA). Note: biotin supplements and some GLP-1 assays can interfere with B12 lab results.',
  },
  coq10: {
    name:'Coenzyme Q10 (CoQ10)', symptoms:['fatigue','muscle','heart'],
    right_form:'Ubiquinol (reduced form) has better bioavailability than ubiquinone for many people, particularly over age 40. Either form is reasonable to trial.',
    wrong_form:'',
    timing:'With your largest, fattiest meal. CoQ10 is fat-soluble and poorly absorbed without dietary fat.',
    food:'Organ meats (especially heart), sardines, mackerel, beef, spinach, peanuts.',
    note:'Statins lower circulating CoQ10 by blocking the mevalonate pathway that also produces it. Whether CoQ10 supplementation improves statin-associated muscle symptoms is genuinely contested: some meta-analyses show modest benefit and others show none. It is reasonable to trial in statin users with muscle symptoms, but present it as a trial, not a guarantee. Beta-blockers may also modestly lower CoQ10.',
    lab:'No routine clinical test. In statin users with muscle symptoms, a monitored trial is the usual approach.',
  },
  magnesium: {
    name:'Magnesium', symptoms:['muscle','sleep','heart','anxiety','gi'],
    right_form:'Magnesium glycinate (sleep, cramps, calm) or magnesium L-threonate (cognitive support). Choose by your main symptom.',
    wrong_form:'Magnesium oxide is poorly absorbed (roughly 4%) and mostly acts as a laxative. It is a common reason people think magnesium "did nothing."',
    timing:'Evening, away from caffeine. Glycinate before bed suits sleep and cramps.',
    food:'Pumpkin seeds, dark chocolate, avocado, spinach and other leafy greens, nuts.',
    note:'The FDA warned in 2011 that long-term PPI use can cause hypomagnesemia (low magnesium), with rare but serious effects including arrhythmia, tetany, and seizures. Loop and thiazide diuretics also increase urinary magnesium loss. Serum magnesium can look normal while tissue stores are low. RBC magnesium is a more sensitive test.',
    lab:'RBC (red blood cell) magnesium is more informative than serum magnesium, which is tightly buffered.',
  },
  zinc: {
    name:'Zinc', symptoms:['hair_loss','immunity','taste','skin','wound','nails'],
    right_form:'Zinc bisglycinate or zinc picolinate. Chelated forms have good absorption.',
    wrong_form:'Zinc oxide is poorly bioavailable and common in inexpensive supplements.',
    timing:'With food. Zinc on an empty stomach commonly causes nausea. Do not take with iron; they compete for the same transporter.',
    food:'Oysters (by far the richest source), pumpkin seeds, grass-fed beef, cashews, chickpeas.',
    note:'Zinc and copper compete for the same transporter. Zinc above about 40 mg daily long term can cause copper deficiency. Test copper if you supplement zinc for an extended period. ACE inhibitors can lower zinc through thiol-group binding. Some depletion associations (OCP, PPI) are weaker and additive rather than large on their own.',
    lab:'Serum zinc and serum copper together.',
  },
  vitamin_d: {
    name:'Vitamin D', symptoms:['fatigue','bone','immunity','mood','hair_loss'],
    right_form:'Vitamin D3 (cholecalciferol), ideally paired with vitamin K2 (MK-7) when supplementing higher doses long term.',
    wrong_form:'Vitamin D2 (ergocalciferol) raises 25-OH D levels less efficiently than D3.',
    timing:'With your largest, fattiest meal. Fat-soluble.',
    food:'Sunlight (skin synthesis), fatty fish, egg yolks, UV-exposed mushrooms, fortified foods.',
    note:'Corticosteroids accelerate vitamin D breakdown and reduce calcium absorption, raising fracture risk on chronic use. This is well documented. In GLP-1 users, low vitamin D was the most commonly observed shortfall in a 2026 narrative review, driven largely by reduced food intake. Labs commonly flag deficiency below 20 ng per mL; confirm with testing before dosing.',
    lab:'25-hydroxyvitamin D (25-OH D) serum level.',
  },
  iron: {
    name:'Iron', symptoms:['fatigue','hair_loss','brain_fog','nerve','nails','gi'],
    right_form:'Ferrous bisglycinate (gentle, well absorbed) or ferrous gluconate.',
    wrong_form:'Ferrous sulfate works but often causes constipation and nausea that lead people to quit.',
    timing:'Empty stomach with vitamin C. Keep away from calcium, dairy, coffee, tea, antacids, and levothyroxine (separate by 4 hours). Bisglycinate can be taken with food if needed.',
    food:'Liver, red meat, shellfish, lentils, spinach, pumpkin seeds. Pair plant iron with vitamin C to improve absorption.',
    note:'Do not supplement iron without confirming deficiency on labs. Excess iron is harmful. A 2025 pilot study found semaglutide reduced intestinal iron absorption, and iron shortfall was common in a 2026 GLP-1 review, partly from eating less. PPIs reduce the stomach acid needed to absorb dietary iron. Iron deficiency is especially common in menstruating women.',
    lab:'Ferritin (most sensitive early marker) plus serum iron, TIBC, and transferrin saturation. Hemoglobin alone misses early deficiency.',
  },
  potassium: {
    name:'Potassium', symptoms:['muscle','heart','fatigue'],
    right_form:'Potassium from food. Over-the-counter tablets are capped at 99 mg, far below daily needs, so food is the practical route.',
    wrong_form:'High-dose potassium without prescriber oversight is dangerous, especially alongside an ACE inhibitor or ARB, which retain potassium.',
    timing:'Food-based, spread through the day.',
    food:'Avocado, leafy greens, beans, salmon, potatoes, coconut water, dried apricots.',
    note:'Loop and thiazide diuretics deplete potassium; ACE inhibitors and ARBs retain it. If you take both a potassium-wasting and a potassium-retaining drug, these push in opposite directions. Self-supplementation is genuinely risky. Use current labs and prescriber guidance.',
    lab:'Serum potassium (part of a basic or comprehensive metabolic panel).',
  },
  folate: {
    name:'Folate (Vitamin B9)', symptoms:['fatigue','mood','brain_fog','nerve'],
    right_form:'Methylfolate (5-MTHF) or folic acid. For most people folic acid works well. Methylfolate may be preferable for those with the homozygous MTHFR C677T variant and elevated homocysteine.',
    wrong_form:'',
    timing:'Morning with food.',
    food:'Dark leafy greens, lentils, asparagus, avocado, chickpeas, beans.',
    note:'Hormonal contraceptives and metformin can both lower folate, so the two together are additive. On MTHFR: the C677T variant is common, but only the homozygous (TT) genotype consistently affects folate metabolism. Major medical bodies do not recommend routine MTHFR screening. If you are planning pregnancy, adequate folate before conception is important regardless of form.',
    lab:'RBC folate is more accurate than serum folate. MTHFR genotyping is optional and not routinely recommended.',
  },
  calcium: {
    name:'Calcium', symptoms:['bone','muscle'],
    right_form:'Food-sourced calcium where possible, or calcium citrate. Pair with vitamin D and consider K2 for long-term supplementation.',
    wrong_form:'Very high-dose isolated calcium supplements without vitamin D or K2 context. Food sources are preferable.',
    timing:'With meals. Separate from iron by 2 hours and from levothyroxine by 4 hours.',
    food:'Leafy greens, sardines and canned salmon with bones, sesame seeds, dairy, fortified foods.',
    note:'Corticosteroids increase calcium excretion and reduce absorption, raising fracture risk. Patients on chronic steroids warrant bone protection. Long-term PPI use can impair calcium absorption by reducing stomach acid.',
    lab:'Serum calcium routinely. DEXA bone density scan for higher-risk patients (chronic steroids, postmenopausal, age 65+).',
  },
  b1: {
    name:'Thiamin (Vitamin B1)', symptoms:['fatigue','nerve','heart','brain_fog'],
    right_form:'Benfotiamine (fat-soluble, better tissue penetration, useful for neurological symptoms) or thiamine HCl.',
    wrong_form:'',
    timing:'With food, morning preferred.',
    food:'Pork, sunflower seeds, legumes, whole grains, nutritional yeast.',
    note:'Loop-diuretic-associated thiamin loss is well documented, especially in heart failure. Thiamin deficiency impairs cardiac function, making it an under-recognized issue in exactly this population. Thiamin deficiency (and rarely Wernicke encephalopathy) has been reported with severe vomiting or very low intake during GLP-1 therapy. This is a medical urgency and warrants immediate care.',
    lab:'Whole blood thiamine or erythrocyte transketolase activity.',
  },
  b6: {
    name:'Vitamin B6', symptoms:['mood','nerve','brain_fog','immunity'],
    right_form:'Pyridoxal-5-phosphate (P5P), the active form.',
    wrong_form:'Pyridoxine HCl at high chronic doses (above roughly 200 mg per day) can itself cause peripheral neuropathy. More is not better with B6.',
    timing:'Morning with food.',
    food:'Chicken, turkey, salmon, potatoes, bananas, chickpeas.',
    note:'B6 is a cofactor in serotonin and dopamine synthesis. Oral contraceptive users have shown lower B6 in some studies. The association with mood is plausible but not firmly established. Keep total B6 modest to avoid the neuropathy risk of over-supplementation.',
    lab:'Plasma P5P level.',
  },
  b2: {
    name:'Vitamin B2 (Riboflavin)', symptoms:['fatigue','skin','mood'],
    right_form:'Riboflavin or riboflavin-5-phosphate. Both are reasonably absorbed.',
    wrong_form:'',
    timing:'Morning with food. Bright yellow urine afterward is normal and harmless.',
    food:'Organ meats, eggs, dairy, almonds, leafy greens, nutritional yeast.',
    note:'Some studies report lower riboflavin status in oral contraceptive users. The effect is generally mild.',
    lab:'Erythrocyte glutathione reductase activity (EGRAC).',
  },
  vitamin_c: {
    name:'Vitamin C', symptoms:['immunity','wound','skin','fatigue'],
    right_form:'Ascorbate with bioflavonoids, or liposomal vitamin C for higher doses with less GI upset.',
    wrong_form:'Large single doses of plain ascorbic acid can cause GI distress. Buffered forms are gentler.',
    timing:'Morning with food. Pairs well with iron to boost iron absorption.',
    food:'Bell peppers, guava, kiwi, citrus, broccoli, strawberries.',
    note:'This is a lower-strength association. Corticosteroids can increase urinary vitamin C loss and PPIs may reduce ascorbate in gastric juice, but the clinical significance for most people is modest.',
    lab:'Serum ascorbate (rarely ordered). Clinical picture usually guides decisions.',
  },
  selenium: {
    name:'Selenium', symptoms:['fatigue','skin','immunity','hair_loss'],
    right_form:'Selenomethionine (organic form) is well retained.',
    wrong_form:'',
    timing:'With food, any time.',
    food:'2 to 3 Brazil nuts daily is the simplest source. Do not exceed 5 to 6 daily. Selenium toxicity is real.',
    note:'Selenium supports the enzymes that convert T4 to active T3 thyroid hormone, so it is of interest in Hashimoto\'s and thyroid disease. Any OCP-related depletion is mild and mainly matters when dietary intake is already low.',
    lab:'Serum selenium.',
  },
  biotin: {
    name:'Biotin (Vitamin B7)', symptoms:['hair_loss','nails','skin'],
    right_form:'Standard biotin. Any form is adequate.',
    wrong_form:'',
    timing:'Any time, with or without food.',
    food:'Cooked egg yolk, organ meats, sweet potato, almonds, sunflower seeds.',
    note:'Important lab caution: biotin supplements can distort many blood tests, including thyroid panels and troponin (a heart marker). Stop biotin 3 to 5 days before blood work. Hair shedding after starting a GLP-1 is common and usually reflects rapid weight loss (telogen effluvium) rather than a specific biotin deficiency.',
    lab:'Serum biotin is rarely needed. Hair and nail changes are the usual clinical cue.',
  },
}

const TIMING_SLOTS: Record<NutId, { slot:'morning'|'food'|'evening'; note:string }> = {
  b12:       { slot:'morning', note:'With or without food' },
  b1:        { slot:'morning', note:'With food' },
  b6:        { slot:'morning', note:'With food' },
  b2:        { slot:'morning', note:'With food (yellow urine is normal)' },
  folate:    { slot:'morning', note:'With food' },
  vitamin_c: { slot:'morning', note:'With food; pair with iron' },
  iron:      { slot:'food',    note:'Empty stomach + vitamin C; 4 hrs from calcium, thyroid, coffee' },
  zinc:      { slot:'food',    note:'With food (nausea on empty stomach)' },
  coq10:     { slot:'food',    note:'With largest fattiest meal' },
  vitamin_d: { slot:'food',    note:'With largest fattiest meal; consider K2' },
  selenium:  { slot:'food',    note:'With any meal' },
  biotin:    { slot:'food',    note:'Any time; stop 3-5 days before blood work' },
  calcium:   { slot:'food',    note:'With meals; 2 hrs from iron, 4 hrs from thyroid' },
  potassium: { slot:'food',    note:'Food-based through the day' },
  magnesium: { slot:'evening', note:'Evening, away from caffeine' },
}

// Drug interaction alerts — reviewed for clinical accuracy per CLAUDE.md compliance rules
function getAlerts(meds: Set<MedId>, herbs: Set<HerbId>): Alert[] {
  const alerts: Alert[] = []
  if (meds.has('thyroid')) alerts.push({
    severity:'amber', title:'Levothyroxine Timing Alert',
    body:'Levothyroxine must be taken on an empty stomach, 30 to 60 minutes before food. Calcium, iron, magnesium, fiber, coffee, antacids, and PPIs all reduce its absorption. Separate all of these by at least 4 hours. Taking a PPI and thyroid medication together without spacing can meaningfully reduce thyroid medication effectiveness.',
  })
  if (meds.has('ace') && meds.has('loop')) alerts.push({
    severity:'red', title:'Competing Potassium Forces: ACE Inhibitor + Loop Diuretic',
    body:'Your loop diuretic lowers potassium while your ACE inhibitor retains it. These forces oppose each other. Do not supplement potassium without current serum potassium labs and prescriber guidance. The balance between these drugs makes self-supplementation high-risk.',
  })
  if (meds.has('ace') && !meds.has('loop')) alerts.push({
    severity:'amber', title:'Potassium Retention: ACE Inhibitor',
    body:'ACE inhibitors retain potassium by blocking aldosterone. Do not add potassium supplements or potassium-based salt substitutes without confirmed low potassium on labs. Elevated potassium (hyperkalemia) from ACE inhibitors is a known and potentially serious risk.',
  })
  if (herbs.has('berberine') && (meds.has('glp1') || meds.has('metformin'))) alerts.push({
    severity:'red', title:'Blood Sugar Risk: Berberine + GLP-1 or Metformin',
    body:'Berberine lowers blood glucose through AMPK activation, overlapping with metformin\'s mechanism and adding to GLP-1 glucose lowering. Combining it with these medications can increase the risk of low blood sugar. Monitor closely and discuss with your prescriber before combining.',
  })
  if (herbs.has('stjohns') && (meds.has('ocp') || meds.has('ssri') || meds.has('statin'))) alerts.push({
    severity:'red', title:'Significant Drug Interaction: St. John\'s Wort',
    body:"St. John's Wort strongly induces CYP3A4 and P-glycoprotein, reducing blood levels of oral contraceptives (risk of contraceptive failure), many statins, and several antidepressants. Combining St. John's Wort with an SSRI also raises serotonin syndrome risk. This combination generally requires prescriber oversight.",
  })
  if (herbs.has('ginkgo') && meds.has('betab')) alerts.push({
    severity:'amber', title:'Interaction: Ginkgo Biloba + Cardiovascular Medications',
    body:'Ginkgo has antiplatelet activity and may affect drug metabolism. Alongside cardiovascular medications, discuss ginkgo use with your prescriber, particularly if you also take a blood thinner.',
  })
  return alerts
}

const CAT_LABELS: Record<string, string> = {
  metabolic:'Metabolic', cardio:'Cardiovascular', gi:'GI', hormonal:'Hormonal', psych:'Psychiatric', inflam:'Inflammatory'
}
const EV_LABEL: Record<string, string> = { strong:'Well-documented', mod:'Moderate evidence', limited:'Limited / emerging' }
const SEV_ORDER: Record<Sev, number> = { H:3, M:2, L:1 }

function getPriority(data: NutrientResult): Priority {
  if (data.count >= 2) return 'high'
  if (data.maxSev === 'H') return 'high'
  if (data.maxSev === 'M') return 'mod'
  return 'mon'
}

// ─── COMPONENT ─────────────────────────────────────────────────────────────
export default function MedicationNutrientChecker() {
  const [selMeds, setSelMeds] = useState<Set<MedId>>(new Set())
  const [selHerbs, setSelHerbs] = useState<Set<HerbId>>(new Set())
  const [selSx, setSelSx] = useState<Set<SxId>>(new Set())
  const [showHerbs, setShowHerbs] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [openCards, setOpenCards] = useState<Set<NutId>>(new Set())
  const [openFaq, setOpenFaq] = useState<Set<number>>(new Set())

  function toggleMed(id: MedId) {
    setSelMeds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
    if (showResults) setShowResults(false)
  }
  function toggleHerb(id: HerbId) {
    setSelHerbs(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
    if (showResults) setShowResults(false)
  }
  function toggleSx(id: SxId) { setSelSx(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n }) }
  function toggleCard(id: NutId) { setOpenCards(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n }) }
  function toggleFaq(i: number) { setOpenFaq(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n }) }

  function handleStartOver() {
    setSelMeds(new Set()); setSelHerbs(new Set()); setSelSx(new Set())
    setShowResults(false); setOpenCards(new Set())
  }

  const { sorted, high, mod, mon, alerts } = useMemo(() => {
    const nutrientData: Record<string, NutrientResult> = {}
    selMeds.forEach(medId => {
      const map = DEPLETIONS_MAP[medId] || {}
      Object.entries(map).forEach(([nutId, sev]) => {
        if (!nutrientData[nutId]) nutrientData[nutId] = { count:0, maxSev:'L', meds:[] }
        nutrientData[nutId].count++
        nutrientData[nutId].meds.push(medId)
        if (SEV_ORDER[sev as Sev] > SEV_ORDER[nutrientData[nutId].maxSev]) nutrientData[nutId].maxSev = sev as Sev
      })
    })
    const sorted = Object.entries(nutrientData).sort((a, b) => {
      const po = { high:3, mod:2, mon:1 }
      const pa = getPriority(a[1]), pb = getPriority(b[1])
      if (po[pa] !== po[pb]) return po[pb] - po[pa]
      return b[1].count - a[1].count
    }) as [NutId, NutrientResult][]
    return {
      sorted,
      high: sorted.filter(([,d]) => getPriority(d) === 'high'),
      mod:  sorted.filter(([,d]) => getPriority(d) === 'mod'),
      mon:  sorted.filter(([,d]) => getPriority(d) === 'mon'),
      alerts: getAlerts(selMeds, selHerbs),
    }
  }, [selMeds, selHerbs])

  const schedItems = useMemo(() => {
    const items = { morning: [] as {name:string;note:string}[], food: [] as {name:string;note:string}[], evening: [] as {name:string;note:string}[] }
    if (selMeds.has('thyroid')) items.morning.push({ name:'Levothyroxine / Thyroid Med', note:'Empty stomach, 30-60 min BEFORE food. No coffee, calcium, iron, or other supplements for 4 hours.' })
    sorted.forEach(([id]) => {
      const rule = TIMING_SLOTS[id], nut = NUTRIENTS[id]
      if (rule && nut) items[rule.slot].push({ name:nut.name, note:rule.note })
    })
    return items
  }, [sorted, selMeds])

  const medNames = [...selMeds].map(id => MEDICATIONS.find(m => m.id === id)?.name || id)

  const faqs = [
    { q:'Can medications really cause nutrient deficiencies?', a:'Yes, though the strength of evidence varies by drug. Some links are settled: the FDA warned that long-term PPI use can cause low magnesium, and the ADA recommends considering B12 monitoring in long-term metformin users. Others, like GLP-1 medications and micronutrient status, are largely explained by reduced food intake rather than a direct drug effect. The tool labels each depletion by evidence strength so you can tell the two apart.' },
    { q:'Does Ozempic, Wegovy, or Mounjaro deplete nutrients?', a:'GLP-1 and dual GIP/GLP-1 medications are not established to directly block nutrient absorption. The nutritional risk comes mainly from eating much less and from nausea or vomiting. A 2026 narrative review found vitamin D and iron were the most commonly observed shortfalls in GLP-1 users, and a 2025 pilot study found reduced intestinal iron absorption with semaglutide. The practical takeaway: protect protein and micronutrient intake while eating less.' },
    { q:'Should I stop my medication if it depletes a nutrient?', a:'No. This tool never recommends stopping a prescribed medication. Depletion is managed by replacing the nutrient, adjusting timing, or monitoring labs. Stopping a medication on your own can be far more dangerous than the depletion. Always talk to your prescriber or pharmacist first.' },
    { q:'Why does the form of a supplement matter?', a:'For some nutrients the form affects absorption or tolerability. Magnesium oxide, for example, is poorly absorbed and mostly acts as a laxative, while magnesium glycinate is better tolerated. For B12 and folate, form preference matters most for people who may convert poorly. The tool flags a preferred form only where there is a real clinical rationale.' },
    { q:'Does this replace lab testing?', a:'No. The tool identifies which nutrients are at risk given your medications. It cannot tell you whether you are actually deficient. Only a lab test can confirm that. Each nutrient card lists the specific test worth requesting so you and your clinician can confirm before supplementing.' },
  ]

  return (
    <div className={styles.page}>
      <MetaTags />

      <nav className={styles.nav}>
        <Link to="/" className={styles.navLogo}>Hunter's Holistic Health</Link>
        <Link to="/join" className={styles.navCta}>Join the Community</Link>
      </nav>

      <img
        src="/images/ai/tool-medication-nutrient.jpg"
        alt="Medication nutrient depletion checker"
        className={styles.heroImg}
      />

      {/* ── SEO INTRO ── */}
      <div className={styles.intro}>
        <p className={styles.eyebrow}>PharmD Clinical Tool · Drug-Induced Nutrient Depletion</p>
        <h1 className={styles.h1}>Medication Nutrient Depletion Checker: What Your Drugs Are Quietly Taking</h1>
        <p className={styles.lede}>Most depletion charts show one drug at a time. This one stacks the depletions across your entire medication list, because the nutrients two or three of your drugs share are the ones worth acting on first.</p>
        <p className={styles.byline}>Dr. Shallanda Hunter, PharmD, CFNMP | Functional Medicine Educator · Reviewed July 2026</p>
      </div>

      <div className={styles.keypoints}>
        <p className={styles.keypointsTitle}>What this tool does differently</p>
        <ul>
          <li><strong>Stacks your whole list.</strong> If two drugs deplete the same nutrient, that nutrient moves to the top as high priority instead of getting lost.</li>
          <li><strong>Names the right form.</strong> The form on the shelf is not always the form your body uses well. Where that distinction is clinically meaningful, the tool says so.</li>
          <li><strong>Grades the evidence honestly.</strong> Some depletions are FDA-warned or guideline-backed. Others are plausible but rest on smaller studies. Each is labeled so you know which is which.</li>
          <li><strong>Flags herb interactions</strong> for berberine, St. John's Wort, and ginkgo alongside your medications.</li>
        </ul>
      </div>

      <div className={styles.prose}>
        <p>Drug-induced nutrient depletion is a documented pharmacology topic, not a wellness invention. Some of the strongest examples are settled: the U.S. Food and Drug Administration issued a safety communication warning that long-term proton pump inhibitor use can cause low blood magnesium, and the American Diabetes Association's Standards of Care recommend considering vitamin B12 monitoring in people on metformin long term.</p>
        <p>Other associations are more nuanced. GLP-1 medications such as semaglutide (Ozempic, Wegovy) and tirzepatide (Mounjaro, Zepbound) are not established to directly block absorption. Their nutritional risk comes mostly from eating less food and from gastrointestinal side effects. This tool keeps those distinctions visible rather than treating every association as equally proven.</p>
        <div className={styles.evidenceNote}><strong>How to read results:</strong> Every nutrient card carries an evidence label. <em>Well-documented</em> means guideline or regulatory backing. <em>Moderate</em> means consistent studies. <em>Limited / emerging</em> means the association is plausible but rests on smaller or observational data. None of this confirms a deficiency in <em>you</em>. Only a lab test can do that.</div>
      </div>

      {/* ── TOOL WIDGET ── */}
      <div className={styles.widget}>
        <div className={styles.widgetHeader}>
          <p className={styles.widgetEyebrow}>PharmD Clinical Tool</p>
          <h2 className={styles.widgetTitle}>What's My Medication Stealing From Me?</h2>
          <p className={styles.widgetSub}>Select your medications below. This tool stacks depletions across your entire list and identifies which nutrients are at greatest risk based on your specific combination.</p>
          <div className={styles.widgetBadge}>Dr. Shallanda Hunter, PharmD, CFNMP · Hunter's Holistic Health</div>
        </div>

        {!showResults && (
          <>
            {/* Step 1: Medications */}
            <div className={styles.step}>
              <p className={styles.stepLabel}>Step 1</p>
              <h3 className={styles.stepTitle}>Select Your Medications</h3>
              <p className={styles.stepSub}>Choose all medications you currently take. The more complete your list, the more accurate the depletion picture.</p>
              <div className={styles.medGrid}>
                {MEDICATIONS.map(m => (
                  <button key={m.id} onClick={() => toggleMed(m.id)} className={`${styles.medCard} ${selMeds.has(m.id) ? styles.medCardSel : ''}`}>
                    <div className={`${styles.medCat} ${styles[`cat_${m.cat}`]}`}>
                      <span className={`${styles.catDot} ${styles[`dot_${m.cat}`]}`} />
                      {CAT_LABELS[m.cat]}
                      {selMeds.has(m.id) && <span className={styles.check}>✓</span>}
                    </div>
                    <div className={styles.medName}>{m.name}</div>
                    <div className={styles.medEg}>{m.eg}</div>
                  </button>
                ))}
              </div>

              <button className={`${styles.herbToggle} ${showHerbs ? styles.herbToggleOpen : ''}`} onClick={() => setShowHerbs(h => !h)}>
                <span className={styles.herbArrow}>{showHerbs ? '▲' : '▼'}</span>
                Also taking herbal supplements? (Berberine, St. John's Wort, Ginkgo)
              </button>
              {showHerbs && (
                <div className={styles.herbGrid}>
                  {HERBS.map(h => (
                    <button key={h.id} onClick={() => toggleHerb(h.id)} className={`${styles.herbChip} ${h.danger ? styles.herbChipDanger : ''} ${selHerbs.has(h.id) ? styles.herbChipSel : ''}`}>
                      {h.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Step 2: Symptoms */}
            <div className={styles.step}>
              <p className={styles.stepLabel}>Step 2 (Optional)</p>
              <h3 className={styles.stepTitle}>Any of These Sound Like You?</h3>
              <p className={styles.stepSub}>Select symptoms you've been experiencing. The tool will flag which ones may be connected to your medication depletions. Symptoms have many causes. This is a prompt for discussion, not a diagnosis.</p>
              <div className={styles.sxWrap}>
                {SYMPTOMS.map(s => (
                  <button key={s.id} onClick={() => toggleSx(s.id)} className={`${styles.sxChip} ${selSx.has(s.id) ? styles.sxChipSel : ''}`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <div className={styles.btnWrap}>
              <button className={styles.generateBtn} disabled={selMeds.size === 0} onClick={() => setShowResults(true)}>
                {selMeds.size === 0
                  ? 'Select at least one medication to see your results'
                  : `Show My Nutrient Depletion Report (${selMeds.size} medication${selMeds.size > 1 ? 's' : ''})`}
              </button>
              {selMeds.size > 0 && <p className={styles.btnCount}>{selMeds.size} medication{selMeds.size > 1 ? 's' : ''} selected</p>}
            </div>
          </>
        )}

        {/* ── RESULTS ── */}
        {showResults && (
          <>
            <div className={styles.resultsHeader}>
              <h3 className={styles.resultsTitle}>Your Nutrient Depletion Report</h3>
              <p className={styles.resultsSub}>Based on: <strong>{medNames.join(', ')}</strong><br />We identified <strong>{sorted.length} nutrient{sorted.length !== 1 ? 's' : ''} worth discussing</strong> across your medication list. This reflects risk, not a diagnosis.</p>
              <div className={styles.priorityBar}>
                {high.length > 0 && <span className={styles.pbHigh}>{high.length} High Priority</span>}
                {mod.length > 0  && <span className={styles.pbMod}>{mod.length} Moderate</span>}
                {mon.length > 0  && <span className={styles.pbMon}>{mon.length} Monitor</span>}
              </div>
            </div>

            {/* Interaction Alerts */}
            {alerts.map((alert, i) => (
              <div key={i} className={alert.severity === 'red' ? styles.alertRed : styles.alertAmber}>
                <strong>⚠ {alert.title}:</strong> {alert.body}
              </div>
            ))}

            {/* DSHEA Notice */}
            <div className={styles.dsheaBanner}>
              These statements have not been evaluated by the Food and Drug Administration. This educational information is not intended to diagnose, treat, cure, or prevent any disease. Supplement recommendations reflect nutrient replacement for drug-induced depletion risk, not treatment of any condition.
            </div>

            {/* Nutrient Cards */}
            <div className={styles.cards}>
              {sorted.length === 0 && (
                <p className={styles.noResults}>No common depletions are mapped for your current selection. A full PharmD review can assess your complete picture.</p>
              )}
              {high.length > 0 && <div className={styles.sectionLabel} data-priority="high">High Priority — Discuss First</div>}
              {high.map(([id, data]) => <NutrientCard key={id} nutId={id} data={data} selSx={selSx} priority="high" open={openCards.has(id)} onToggle={() => toggleCard(id)} />)}
              {mod.length > 0  && <div className={styles.sectionLabel} data-priority="mod">Moderate — Worth Monitoring</div>}
              {mod.map(([id, data])  => <NutrientCard key={id} nutId={id} data={data} selSx={selSx} priority="mod"  open={openCards.has(id)} onToggle={() => toggleCard(id)} />)}
              {mon.length > 0  && <div className={styles.sectionLabel} data-priority="mon">Monitor — Lower Risk</div>}
              {mon.map(([id, data])  => <NutrientCard key={id} nutId={id} data={data} selSx={selSx} priority="mon"  open={openCards.has(id)} onToggle={() => toggleCard(id)} />)}
            </div>

            {/* Timing Schedule */}
            {(schedItems.morning.length > 0 || schedItems.food.length > 0 || schedItems.evening.length > 0) && (
              <div className={styles.schedule}>
                <h4 className={styles.schedTitle}>Your Suggested Timing Schedule</h4>
                <p className={styles.schedSub}>Based on your medications and identified depletions. Discuss with your prescriber or pharmacist before starting new supplements.</p>
                <div className={styles.schedGrid}>
                  <SchedCol label="Morning / Before Food" emoji="☀️" items={schedItems.morning} />
                  <SchedCol label="With Food (any meal)" emoji="🍽️" items={schedItems.food} />
                  <SchedCol label="Evening" emoji="🌙" items={schedItems.evening} />
                </div>
                <p className={styles.schedNote}>⚠️ <strong>Key spacing rules:</strong> Iron and calcium block each other — separate by 2+ hours. Both block thyroid medication — separate by 4+ hours. Keep magnesium away from caffeine. Fat-soluble nutrients (D, E, K, CoQ10) need fat in the same meal to absorb.</p>
              </div>
            )}

            {/* CTA (Hormozi: give value, capture lead, make offer) */}
            <div className={styles.cta}>
              <h4 className={styles.ctaTitle}>Ready to Turn These Findings Into a Protocol?</h4>
              <p className={styles.ctaSub}>Knowing which nutrients you may be low in is the starting point. A personalized protocol pairs the right forms and timing with a lifestyle framework that addresses the root drivers. That is what membership is built around.</p>
              <Link to="/join" className={styles.ctaBtn}>Build My Protocol</Link>
            </div>

            <button className={styles.startOver} onClick={handleStartOver}>← Start Over / Change Medications</button>

            <div className={styles.widgetDisclaimer}>
              <strong>Medical Disclaimer:</strong> This tool is for educational reference only and does not constitute medical advice, diagnosis, or treatment. It identifies risk, not deficiency. Depletion patterns vary by dose, duration, diet, genetics, and other factors not captured here. Never stop a prescribed medication based on this tool. Always discuss supplementation with your prescriber or pharmacist before making changes, especially if you take thyroid medication, anticoagulants, or drugs with a narrow therapeutic window. Only laboratory testing can confirm an actual deficiency.
            </div>
          </>
        )}
      </div>

      {/* ── FAQ ── */}
      <section className={styles.faq}>
        <h2 className={styles.faqTitle}>Frequently asked questions</h2>
        {faqs.map((item, i) => (
          <div key={i} className={styles.faqItem}>
            <button className={styles.faqQ} onClick={() => toggleFaq(i)}>
              {item.q}
              <span>{openFaq.has(i) ? '−' : '+'}</span>
            </button>
            {openFaq.has(i) && <div className={styles.faqA}>{item.a}</div>}
          </div>
        ))}
      </section>

      {/* ── SOURCES ── */}
      <section className={styles.sources}>
        <h2 className={styles.sourcesTitle}>Selected clinical sources</h2>
        <ol className={styles.sourcesList}>
          <li>U.S. Food &amp; Drug Administration. Drug Safety Communication: Low magnesium levels can be associated with long-term use of proton pump inhibitor drugs (PPIs). March 2, 2011.</li>
          <li>American Diabetes Association Professional Practice Committee. Standards of Care in Diabetes 2025/2026 (metformin and vitamin B12 monitoring). <em>Diabetes Care.</em></li>
          <li>Urbina S, et al. Micronutrient and Nutritional Deficiencies Associated With GLP-1 Receptor Agonist Therapy: A Narrative Review. <em>Clinical Obesity.</em> 2026.</li>
          <li>Melis P, et al. The Effect of Semaglutide on Intestinal Iron Absorption in Patients With Type 2 Diabetes: A Pilot Study. <em>Diabetes, Obesity and Metabolism.</em> 2025.</li>
          <li>Kovacic S, Habicht SD, Eckert GP. Effects of coenzyme Q10 supplementation on myopathy in statin-treated patients: a systematic review and meta-analysis. <em>J Nutr Sci.</em> 2025.</li>
          <li>Pelton R, LaValle JB. <em>Drug-Induced Nutrient Depletion Handbook.</em> Reference text.</li>
        </ol>
      </section>

      {/* ── RELATED ── */}
      <section className={styles.related}>
        <h2 className={styles.relatedTitle}>Keep going</h2>
        <div className={styles.relatedGrid}>
          <Link to="/tools/nutrient-food-sources" className={styles.relatedCard}>
            <p className={styles.relatedLabel}>Companion Guide</p>
            <p className={styles.relatedCardTitle}>Top Food Sources for Every Depleted Nutrient →</p>
            <p className={styles.relatedSub}>Replace it at the table before you reach for a bottle.</p>
          </Link>
          <Link to="/tools/supplement-timing" className={styles.relatedCard}>
            <p className={styles.relatedLabel}>Companion Guide</p>
            <p className={styles.relatedCardTitle}>Supplement Timing Guide →</p>
            <p className={styles.relatedSub}>The right nutrient at the wrong time is a wasted nutrient.</p>
          </Link>
        </div>
      </section>

      <div className={styles.footer}>
        <p><strong>About the author.</strong> Dr. Shallanda Hunter is a Doctor of Pharmacy (PharmD, RPh) and Certified Functional Nutritional Medicine Practitioner (CFNMP) operating as a Functional Medicine Educator. This page is educational and is not a substitute for individualized medical advice. Content reviewed July 2026.</p>
        <p>These statements have not been evaluated by the Food and Drug Administration. This information is not intended to diagnose, treat, cure, or prevent any disease.</p>
        <p>Hunter's Holistic Health LLC | 30 N Gould St, Ste R, Sheridan, WY 82801 | <a href="mailto:info@huntersholistichealth.com">info@huntersholistichealth.com</a></p>
      </div>
    </div>
  )
}

// ─── SUB-COMPONENTS ────────────────────────────────────────────────────────
function NutrientCard({ nutId, data, selSx, priority, open, onToggle }: {
  nutId: NutId; data: NutrientResult; selSx: Set<SxId>
  priority: Priority; open: boolean; onToggle: () => void
}) {
  const nut = NUTRIENTS[nutId]
  if (!nut) return null
  const medNames = data.meds.map(id => MEDICATIONS.find(m => m.id === id)?.name || id)
  const sxMatches = nut.symptoms.filter(s => selSx.has(s))
  const sxLabels = SYMPTOMS.filter(s => sxMatches.includes(s.id)).map(s => s.label)
  const ev = NUTRIENT_EVIDENCE[nutId]
  const stackNote = data.count >= 2
    ? `${data.count} of your medications are linked to lower levels of this nutrient`
    : `Linked to: ${medNames[0]}`

  return (
    <div className={`${styles.card} ${open ? styles.cardOpen : ''}`}>
      <button className={styles.cardHeader} onClick={onToggle}>
        <div className={`${styles.cardStrip} ${styles[`strip_${priority}`]}`} />
        <div className={styles.cardInfo}>
          <div className={styles.cardName}>
            {nut.name}
            {ev && <span className={`${styles.evBadge} ${styles[`ev_${ev}`]}`}>{EV_LABEL[ev]}</span>}
          </div>
          <div className={styles.cardCause}>{stackNote}</div>
          <div className={styles.cardBadges}>
            {priority === 'high' && <span className={`${styles.badge} ${styles.badgeHigh}`}>HIGH PRIORITY</span>}
            {priority === 'mod'  && <span className={`${styles.badge} ${styles.badgeMod}`}>MODERATE</span>}
            {priority === 'mon'  && <span className={`${styles.badge} ${styles.badgeMon}`}>MONITOR</span>}
            {data.count >= 2 && <span className={`${styles.badge} ${styles.badgeStack}`}>{data.count} drugs stacked</span>}
            {sxMatches.length > 0 && <span className={`${styles.badge} ${styles.badgeSx}`}>Symptom Match</span>}
          </div>
        </div>
        <span className={styles.cardChevron}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className={styles.cardBody}>
          {sxLabels.length > 0 && (
            <div className={styles.cardSection}>
              <p className={styles.sectionLabel2}>Symptom Connection</p>
              <p className={styles.sxNote}>Symptoms you selected that <em>can</em> relate to this nutrient (many other causes exist):</p>
              <div className={styles.sxTags}>{sxLabels.map(l => <span key={l} className={styles.sxTag}>▲ {l}</span>)}</div>
            </div>
          )}
          <div className={styles.cardSection}>
            <p className={styles.sectionLabel2}>Linked To (Your Medications)</p>
            <p className={styles.cardText}>{medNames.join(', ')}</p>
          </div>
          <div className={styles.cardSection}>
            <p className={styles.sectionLabel2}>Form and How to Replace It</p>
            <div className={styles.formGood}><strong>✓ Use:</strong> {nut.right_form}</div>
            {nut.wrong_form && <div className={styles.formBad}><strong>⊘ Watch out:</strong> {nut.wrong_form}</div>}
          </div>
          <div className={styles.cardSection}>
            <p className={styles.sectionLabel2}>When to Take It</p>
            <div className={styles.timingBox}>⏰ {nut.timing}</div>
          </div>
          <div className={styles.cardSection}>
            <p className={styles.sectionLabel2}>Food Sources</p>
            <p className={styles.cardText}>{nut.food}</p>
          </div>
          {nut.note && (
            <div className={styles.pharmNote}>
              💬 <strong>PharmD Note:</strong> {nut.note}
            </div>
          )}
          {nut.lab && (
            <div className={styles.cardSection}>
              <p className={styles.sectionLabel2}>Lab Test to Request</p>
              <p className={styles.labText}>📋 {nut.lab}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function SchedCol({ label, emoji, items }: { label: string; emoji: string; items: {name:string;note:string}[] }) {
  return (
    <div className={styles.schedCol}>
      <p className={styles.schedTime}>{emoji} {label}</p>
      {items.length === 0
        ? <p className={styles.schedEmpty}>Nothing scheduled</p>
        : items.map((item, i) => (
          <div key={i} className={styles.schedItem}>
            <strong>{item.name}</strong>
            <span className={styles.schedItemNote}>{item.note}</span>
          </div>
        ))
      }
    </div>
  )
}
