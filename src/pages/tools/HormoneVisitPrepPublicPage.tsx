import { useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './HormoneVisitPrepPublic.module.css'

const META_TITLE = "Hormone Visit Prep Tool | Know What to Ask Your Doctor"
const META_DESC = "Symptom checklists, functional lab ranges, and a printable doctor brief for 17 hormone conditions. Built by a PharmD. Free to start."

function MetaTags() {
  if (typeof document === 'undefined') return null
  document.title = META_TITLE
  const setMeta = (name: string, content: string, prop?: boolean) => {
    const attr = prop ? 'property' : 'name'
    let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null
    if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el) }
    el.content = content
  }
  setMeta('description', META_DESC)
  setMeta('og:title', META_TITLE, true)
  setMeta('og:description', META_DESC, true)
  setMeta('og:type', 'website', true)
  setMeta('og:url', 'https://www.huntersholistichealth.com/tools/hormone-visit-prep', true)
  setMeta('twitter:card', 'summary_large_image')
  setMeta('twitter:title', META_TITLE)
  setMeta('twitter:description', META_DESC)
  let can = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
  if (!can) { can = document.createElement('link'); can.setAttribute('rel', 'canonical'); document.head.appendChild(can) }
  can.href = 'https://www.huntersholistichealth.com/tools/hormone-visit-prep'
  return null
}

interface Lab { name: string; unit: string; optimalRange: string; standardRange: string }
interface Condition {
  key: string; name: string; fullName: string; sex: 'female' | 'male'
  desc: string; symptoms: string[]; labs: Lab[]
}
interface QAItem { q: string; a: string }
type TabId = 'symptoms' | 'labs' | 'education' | 'prep'

const FEMALE = [
  { key: 'pcos', name: 'PCOS / PMMOS' },
  { key: 'hypothyroid', name: "Hypothyroidism / Hashimoto's" },
  { key: 'perimenopause', name: 'Perimenopause / Menopause' },
  { key: 'endo', name: 'Endometriosis' },
  { key: 'estrogendominance', name: 'Estrogen Dominance' },
  { key: 'adrenal', name: 'Adrenal / HPA Axis' },
  { key: 'hyperthyroid', name: "Hyperthyroidism / Graves'" },
  { key: 'fibroids', name: 'Uterine Fibroids' },
  { key: 'fertility_f', name: 'Female Fertility' },
]

const MALE = [
  { key: 'lowt', name: 'Low Testosterone' },
  { key: 'highe', name: 'High Estrogen / Gynecomastia' },
  { key: 'dht', name: 'DHT / BPH / Hair Loss' },
  { key: 'ed', name: 'ED / Sexual Function' },
  { key: 'burnout', name: 'High Cortisol / HPA Burnout' },
  { key: 'metabolic', name: 'Metabolic Syndrome / Belly Fat' },
  { key: 'sleep', name: 'Sleep Apnea / Poor Sleep' },
  { key: 'fertility_m', name: 'Male Fertility' },
]

const FREE_KEYS = new Set(['pcos', 'hypothyroid', 'perimenopause'])

const PREVIEW: Record<string, Condition> = {
  pcos: {
    key: 'pcos', name: 'PCOS / PMMOS', fullName: 'Polycystic Metabolic Ovarian Syndrome (PCOS / PMMOS)', sex: 'female',
    desc: 'A metabolic-hormonal disorder causing irregular periods, elevated androgens, and polycystic ovaries. Closely linked to insulin resistance and metabolic dysfunction.',
    symptoms: [
      'Irregular or missing periods', 'Acne / oily skin', 'Excess facial / body hair',
      'Hair thinning (scalp)', 'Weight gain (belly)', 'Difficulty losing weight',
      'Carb / sugar cravings', 'Fatigue', 'Mood swings',
      'Infertility / difficulty conceiving', 'Bloating', 'Low libido',
    ],
    labs: [
      { name: 'LH', unit: 'mIU/mL', optimalRange: '2-15 (follicular)', standardRange: '1-18' },
      { name: 'FSH', unit: 'mIU/mL', optimalRange: '3-10 (follicular)', standardRange: '2-15' },
      { name: 'LH:FSH Ratio', unit: 'ratio', optimalRange: '<2.0', standardRange: '<3.0' },
      { name: 'Free Testosterone', unit: 'pg/mL', optimalRange: '<6.0', standardRange: '0-8.5' },
      { name: 'Total Testosterone', unit: 'ng/dL', optimalRange: '15-70', standardRange: '10-80' },
      { name: 'SHBG', unit: 'nmol/L', optimalRange: '40-120', standardRange: '20-200' },
      { name: 'Fasting Insulin', unit: 'uIU/mL', optimalRange: '<5 (functional)', standardRange: '<25' },
      { name: 'HbA1c', unit: '%', optimalRange: '<5.4%', standardRange: '<5.7%' },
      { name: 'Fasting Glucose', unit: 'mg/dL', optimalRange: '70-85', standardRange: '70-100' },
      { name: 'AMH', unit: 'ng/mL', optimalRange: '1.0-3.5', standardRange: '0.3-5.0' },
    ],
  },
  hypothyroid: {
    key: 'hypothyroid', name: "Hypothyroidism / Hashimoto's", fullName: "Hypothyroidism / Hashimoto's Thyroiditis", sex: 'female',
    desc: "Underactive thyroid, often autoimmune (Hashimoto's). TSH, Free T3/T4, and antibody testing together reveal the full picture. Standard TSH range often misses subclinical dysfunction.",
    symptoms: [
      'Fatigue / sluggishness', 'Cold intolerance', 'Weight gain (unexplained)',
      'Constipation', 'Brain fog / poor memory', 'Depression / low mood',
      'Dry skin', 'Dry / brittle hair', 'Hair loss',
      'Slow heart rate', 'Muscle weakness or aching', 'Puffy face / eyelids',
      'Hoarse voice', 'Heavy periods',
    ],
    labs: [
      { name: 'TSH', unit: 'mIU/L', optimalRange: '0.5-2.0 (functional)', standardRange: '0.5-4.5' },
      { name: 'Free T3', unit: 'pg/mL', optimalRange: '3.2-4.4 (upper 1/3)', standardRange: '2.3-4.4' },
      { name: 'Free T4', unit: 'ng/dL', optimalRange: '1.1-1.8 (upper 1/2)', standardRange: '0.8-1.8' },
      { name: 'Reverse T3', unit: 'ng/dL', optimalRange: '<15', standardRange: '<25' },
      { name: 'TPO Antibodies', unit: 'IU/mL', optimalRange: '<35 (negative)', standardRange: '<35' },
      { name: 'Thyroglobulin Ab', unit: 'IU/mL', optimalRange: '<1 (negative)', standardRange: '<0.9' },
      { name: 'Ferritin', unit: 'ng/mL', optimalRange: '70-90 (thyroid conversion)', standardRange: '12-300' },
      { name: 'Vitamin D', unit: 'ng/mL', optimalRange: '60-80', standardRange: '30-100' },
      { name: 'Serum B12', unit: 'pg/mL', optimalRange: '600-1000', standardRange: '200-900' },
    ],
  },
  perimenopause: {
    key: 'perimenopause', name: 'Perimenopause / Menopause', fullName: 'Perimenopause / Menopause', sex: 'female',
    desc: 'The hormonal transition as estrogen and progesterone decline. The FDA removed the HRT black box warning in February 2026. The ROOTS protocol addresses vasomotor symptoms, bone, cardiovascular, and cognitive protection.',
    symptoms: [
      'Hot flashes', 'Night sweats', 'Irregular periods',
      'Sleep disturbance', 'Mood changes / irritability', 'Vaginal dryness',
      'Low libido', 'Brain fog', 'Fatigue',
      'Joint pain', 'Weight gain (belly)', 'Heart palpitations',
      'Anxiety', 'Hair thinning',
    ],
    labs: [
      { name: 'FSH', unit: 'mIU/mL', optimalRange: 'Peri: 10-40 / Meno: >40', standardRange: '<25 premenopause' },
      { name: 'Estradiol (E2)', unit: 'pg/mL', optimalRange: '50-200 (premenopause day 3)', standardRange: '15-350' },
      { name: 'Progesterone', unit: 'ng/mL', optimalRange: '>10 (day 21)', standardRange: '1-25 (luteal)' },
      { name: 'SHBG', unit: 'nmol/L', optimalRange: '40-120', standardRange: '20-200' },
      { name: 'Free Testosterone', unit: 'pg/mL', optimalRange: '2-5 (optimal)', standardRange: '0-8.5' },
      { name: 'DHEA-S', unit: 'ug/dL', optimalRange: '100-250', standardRange: '45-320' },
      { name: 'Vitamin D', unit: 'ng/mL', optimalRange: '60-80', standardRange: '30-100' },
      { name: 'Fasting Insulin', unit: 'uIU/mL', optimalRange: '<5', standardRange: '<25' },
      { name: 'TSH', unit: 'mIU/L', optimalRange: '0.5-2.0', standardRange: '0.5-4.5' },
    ],
  },
}

const EDUCATION: Record<string, { keyFacts: string[]; qa: QAItem[] }> = {
  pcos: {
    keyFacts: [
      'PCOS affects 1 in 10 women of reproductive age and is the most common cause of female infertility.',
      'Insulin resistance is present in up to 70% of women with PCOS, even those who are not overweight.',
      'A Mediterranean-style anti-inflammatory eating pattern is associated with improved insulin sensitivity, ovulation, and fertility outcomes in women with PCOS.',
      'Spearmint tea (2 cups daily) has two randomized controlled trials supporting its ability to reduce free testosterone levels.',
      'Myo-inositol at a 40:1 ratio with D-chiro inositol is the best-studied natural insulin sensitizer for PCOS.',
    ],
    qa: [
      { q: 'Do I have to take birth control to manage my PCOS?', a: 'No. Birth control suppresses PCOS symptoms by shutting down your hormone production entirely, but it does not address the root cause. Functional approaches target insulin resistance and androgen excess directly. Many women manage PCOS successfully without hormonal contraceptives using myo-inositol, dietary changes, and lifestyle modifications.' },
      { q: 'Can I still get pregnant with PCOS?', a: 'Yes. PCOS is a common cause of irregular ovulation but not permanent infertility. Restoring insulin sensitivity, optimizing Vitamin D, and following a Mediterranean diet allows the majority of women with PCOS to conceive. Studies show 40:1 myo-inositol improved ovulation rates significantly.' },
      { q: 'What labs do I need to diagnose and monitor PCOS?', a: 'At minimum: total and free testosterone, LH, FSH, DHEA-S, SHBG, fasting insulin, HbA1c, fasting glucose, and AMH. Also consider a pelvic ultrasound to assess ovarian morphology. Fasting insulin below 5 uIU/mL is the functional medicine target.' },
    ],
  },
  hypothyroid: {
    keyFacts: [
      'TSH alone misses significant thyroid dysfunction. Free T3, Free T4, Reverse T3, and TPO antibodies are all needed for a complete picture.',
      'Roughly 13 to 15% of people carry the homozygous DIO2 variant that impairs T4-to-T3 conversion, and some feel unwell despite normal TSH on levothyroxine alone.',
      "Selenium 200mcg/day has multiple meta-analyses confirming it reduces TPO antibody levels in Hashimoto's.",
      'Ferritin levels below 70 ng/mL impair T4-to-T3 conversion. Iron deficiency is a hidden driver of hypothyroid symptoms.',
      "A gluten-free diet may reduce TPO antibodies by 40 to 60% in some Hashimoto's patients due to molecular mimicry between gliadin and thyroid tissue.",
    ],
    qa: [
      { q: 'My doctor says my thyroid is normal but I still feel terrible. How is that possible?', a: 'Standard TSH testing has a wide range (0.5 to 4.5 mIU/L). Many patients feel best in the lower half of that range (0.5 to 2.0). TSH alone does not show whether your body is converting T4 (the storage form) into active T3. Free T3 and Reverse T3 testing reveals conversion problems.' },
      { q: 'I am taking levothyroxine but still feel exhausted. What is missing?', a: 'Levothyroxine provides only T4, the inactive storage form. Your body must convert it to active T3. This conversion requires selenium, zinc, iron (ferritin 70 to 90), magnesium, and adequate cortisol levels. Ask your practitioner to check Free T3 and Reverse T3 alongside your TSH.' },
      { q: "Will a gluten-free diet really help my thyroid?", a: "For some patients with Hashimoto's, yes, significantly. Molecular mimicry describes how the immune system can confuse gliadin (the protein in gluten) with thyroid tissue. Studies show a strict gluten-free diet reduces TPO antibody levels by 40 to 60% in a subset of Hashimoto's patients." },
    ],
  },
  perimenopause: {
    keyFacts: [
      'The FDA removed the HRT black box warning in February 2026, citing 25 years of data showing hormone therapy does not increase cardiac risk in women who begin within 10 years of menopause.',
      'Perimenopause can begin 8 to 12 years before the final menstrual period. FSH rising above 10 mIU/mL is an early marker of the transition.',
      'Bioidentical progesterone (not synthetic progestins) reduces breast cancer risk, improves sleep, and reduces anxiety. The PROMISE trial confirmed breast safety.',
      'Resistance training 3 to 4 times per week preserves bone density, improves insulin sensitivity, and maintains lean muscle mass through perimenopause.',
      'Magnesium glycinate 400mg nightly reduces hot flash frequency, improves sleep quality, and supports bone mineral density in perimenopausal women.',
    ],
    qa: [
      { q: 'Is it safe to take hormone therapy?', a: 'For most women under 60 who are within 10 years of menopause onset, hormone therapy has a favorable benefit-to-risk profile. The FDA removed the black box warning in February 2026. Bioidentical estradiol (patch, gel, or spray) carries the lowest cardiovascular and clot risk. The decision should be individualized with your provider based on your personal risk factors.' },
      { q: 'I am only 38. Can I already be in perimenopause?', a: 'Yes. Perimenopause typically begins in the early-to-mid 40s but can start as early as the mid-30s in some women. Signs include cycle length changes, new PMS or worsening mood symptoms, and sleep disruption. An FSH above 10 mIU/mL on day 2 to 3 of your cycle is an early sign of the transition.' },
      { q: 'What supplements help the most in perimenopause?', a: 'In order of evidence: magnesium glycinate 400mg nightly (sleep, anxiety, hot flashes, bone), Vitamin D to 60 to 80 ng/mL (bone, immune, mood), omega-3 fatty acids 2 to 3 grams daily (cardiovascular, mood), and creatine monohydrate 3 to 5 grams daily (muscle mass, cognitive function). These statements have not been evaluated by the FDA and are not intended to diagnose, treat, cure, or prevent any disease.' },
    ],
  },
}

function GateCard() {
  return (
    <div className={styles.gateCard}>
      <div className={styles.gateIcon}>🔒</div>
      <h3 className={styles.gateTitle}>This tool covers 17 conditions. You are seeing 3 of them.</h3>
      <p className={styles.gateDesc}>
        Members unlock all 17 conditions plus a printable doctor brief with the exact labs to request and the questions to ask at your appointment. Plans start at $37/mo.
      </p>
      <div className={styles.gateBtns}>
        <Link to="/join" className={styles.gatePrimary}>See Plans</Link>
        <Link to="/login" className={styles.gateSecondary}>Sign In</Link>
      </div>
    </div>
  )
}

function LabRow({ lab }: { lab: Lab }) {
  const [val, setVal] = useState('')
  return (
    <div className={`${styles.labRow} ${val ? styles.labRowActive : ''}`}>
      <div className={styles.labName}>{lab.name} <span className={styles.labUnit}>{lab.unit}</span></div>
      <input
        className={styles.labInput}
        type="text"
        placeholder="Enter your value"
        value={val}
        onChange={e => setVal(e.target.value)}
        aria-label={lab.name}
      />
      <div className={styles.labRanges}>
        <span className={styles.labOpt}>Functional: {lab.optimalRange}</span>
        <span className={styles.labStd}>Standard: {lab.standardRange}</span>
      </div>
    </div>
  )
}

export default function HormoneVisitPrepPublicPage() {
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabId>('symptoms')
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [openQA, setOpenQA] = useState<string | null>(null)

  const isFree = activeKey !== null && FREE_KEYS.has(activeKey)
  const isLocked = activeKey !== null && !FREE_KEYS.has(activeKey)
  const condition = isFree ? PREVIEW[activeKey!] : null
  const edu = isFree ? EDUCATION[activeKey!] : null

  function selectCondition(key: string) {
    setActiveKey(key)
    setActiveTab('symptoms')
    setChecked(new Set())
    setOpenQA(null)
  }

  function toggleSymptom(id: string) {
    setChecked(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const checkedCount = condition
    ? condition.symptoms.filter((_, i) => checked.has(`${activeKey}-${i}`)).length
    : 0

  return (
    <div className={styles.page}>
      <MetaTags />

      <nav className={styles.nav}>
        <Link to="/" className={styles.navLogo}>Hunter's Holistic Health</Link>
        <div className={styles.navRight}>
          <Link to="/login" className={styles.navSignIn}>Sign In</Link>
          <Link to="/join" className={styles.navCta}>See Plans</Link>
        </div>
      </nav>

      <header className={styles.hero}>
        <p className={styles.heroEyebrow}>17-Condition Hormone Reference</p>
        <h1 className={styles.heroTitle}>Know What to Ask Your Doctor</h1>
        <p className={styles.heroDesc}>
          Symptom checklists and functional lab ranges for 17 hormone conditions.
          Pick your condition from the sidebar. Nothing you enter is stored or sent anywhere.
        </p>
        <p className={styles.heroCred}>Built by Dr. Shallanda Hunter, PharmD, CFNMP</p>
      </header>

      <div className={styles.shell}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarSection}>
            <div className={styles.sidebarLabel}>Female Conditions</div>
            {FEMALE.map(c => (
              <button
                key={c.key}
                className={`${styles.condBtn} ${activeKey === c.key ? styles.condBtnActive : ''}`}
                onClick={() => selectCondition(c.key)}
              >
                <span className={`${styles.dot} ${styles.dotF}`} />
                <span className={styles.condBtnName}>{c.name}</span>
                {!FREE_KEYS.has(c.key) && <span className={styles.lock}>🔒</span>}
              </button>
            ))}
          </div>
          <div className={styles.sidebarSection}>
            <div className={styles.sidebarLabel}>Male Conditions</div>
            {MALE.map(c => (
              <button
                key={c.key}
                className={`${styles.condBtn} ${activeKey === c.key ? styles.condBtnActive : ''}`}
                onClick={() => selectCondition(c.key)}
              >
                <span className={`${styles.dot} ${styles.dotM}`} />
                <span className={styles.condBtnName}>{c.name}</span>
                {!FREE_KEYS.has(c.key) && <span className={styles.lock}>🔒</span>}
              </button>
            ))}
          </div>
          <div className={styles.sidebarNote}>
            Nothing stored. Nothing sent.<br />Educational use only, not medical advice.
          </div>
        </aside>

        <main className={styles.main}>
          {!activeKey && (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>◆</div>
              <div className={styles.emptyTitle}>Walk into your next appointment prepared</div>
              <p className={styles.emptyDesc}>
                Pick a hormone condition from the sidebar. Check your symptoms, compare your lab values,
                and get the exact questions to ask your doctor.
              </p>
              <div className={styles.emptyBadges}>
                <span className={styles.badgeF}>9 Female Conditions</span>
                <span className={styles.badgeM}>8 Male Conditions</span>
              </div>
            </div>
          )}

          {isLocked && <GateCard />}

          {condition && (
            <>
              <div className={styles.condHead}>
                <div className={`${styles.condType} ${condition.sex === 'female' ? styles.ctF : styles.ctM}`}>
                  {condition.sex === 'female' ? 'Female Condition' : 'Male Condition'}
                </div>
                <h2 className={styles.condTitle}>{condition.fullName}</h2>
                <p className={styles.condDesc}>{condition.desc}</p>
                <p className={styles.condEdu}>Educational only, not medical advice. Discuss all results with your clinician.</p>
              </div>

              <div className={styles.tabs}>
                <button className={`${styles.tab} ${activeTab === 'symptoms' ? styles.tabActive : ''}`} onClick={() => setActiveTab('symptoms')}>Symptom Check</button>
                <button className={`${styles.tab} ${activeTab === 'labs' ? styles.tabActive : ''}`} onClick={() => setActiveTab('labs')}>Check Your Labs</button>
                <button className={`${styles.tab} ${activeTab === 'education' ? styles.tabActive : ''}`} onClick={() => setActiveTab('education')}>Education / Q&A</button>
                <button className={`${styles.tab} ${styles.tabPrep} ${activeTab === 'prep' ? styles.tabActive : ''}`} onClick={() => setActiveTab('prep')}>
                  📋 Doctor Visit Prep
                </button>
              </div>

              {activeTab === 'symptoms' && (
                <div className={styles.card}>
                  <div className={styles.cardHead}>
                    Do any of these apply to you?
                    <span className={styles.cardNote}>Tap to check, nothing is saved</span>
                  </div>
                  <div className={styles.symptomGrid}>
                    {condition.symptoms.map((s, i) => {
                      const id = `${activeKey}-${i}`
                      const on = checked.has(id)
                      return (
                        <button key={i} className={`${styles.symptomItem} ${on ? styles.symptomOn : ''}`} onClick={() => toggleSymptom(id)} aria-pressed={on}>
                          <span className={`${styles.symptomBox} ${on ? styles.symptomBoxOn : ''}`}>
                            {on && (
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </span>
                          <span>{s}</span>
                        </button>
                      )
                    })}
                  </div>
                  {checkedCount > 0 && (
                    <p className={styles.checkedMsg}>
                      You selected <strong>{checkedCount}</strong> of {condition.symptoms.length} symptoms. Bring this list to your appointment.
                    </p>
                  )}
                </div>
              )}

              {activeTab === 'labs' && (
                <div className={styles.card}>
                  <div className={styles.cardHead}>
                    Functional Lab Reference
                    <span className={styles.cardNote}>Enter your value to compare</span>
                  </div>
                  <div className={styles.labGrid}>
                    {condition.labs.map((lab, i) => <LabRow key={i} lab={lab} />)}
                  </div>
                  <p className={styles.labFootnote}>
                    Functional ranges are wellness targets, not diagnostic thresholds. Nothing you enter is stored. Interpret all values with your clinician.
                  </p>
                </div>
              )}

              {activeTab === 'education' && edu && (
                <div>
                  <div className={styles.card}>
                    <div className={styles.cardHead}>Key Facts</div>
                    <ul className={styles.factList}>
                      {edu.keyFacts.map((f, i) => <li key={i} className={styles.factItem}>{f}</li>)}
                    </ul>
                  </div>
                  <div className={styles.card}>
                    <div className={styles.cardHead}>Common Questions</div>
                    {edu.qa.map((item, i) => {
                      const id = `${activeKey}-qa-${i}`
                      return (
                        <div key={i} className={styles.qaItem}>
                          <button className={styles.qaQ} onClick={() => setOpenQA(openQA === id ? null : id)}>
                            <span>{item.q}</span>
                            <span className={styles.qaChev}>{openQA === id ? '▲' : '▼'}</span>
                          </button>
                          {openQA === id && <p className={styles.qaA}>{item.a}</p>}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'prep' && <GateCard />}
            </>
          )}
        </main>
      </div>

      <footer className={styles.footer}>
        <p>For educational use only, not medical advice. Nothing you enter is stored, sent, or shared. Always consult your healthcare provider before making changes to your health regimen.</p>
        <p>These statements have not been evaluated by the Food and Drug Administration. This tool is not intended to diagnose, treat, cure, or prevent any disease. &copy; 2026 Hunter's Holistic Health.</p>
      </footer>
    </div>
  )
}
