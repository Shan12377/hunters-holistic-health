import { Link } from 'react-router-dom'
import styles from './Protocol.module.css'

const FB_META_TITLE = 'Flat Belly Challenge Supplement Stack | Hunter\'s Holistic Health'
const FB_META_DESC = 'The optional supplement stack for the 14-Day Flat Belly Challenge from Dr. Shallanda Hunter, CFNMP. Four products, five doses, timed to the cortisol curve.'
const FB_URL = 'https://www.huntersholistichealth.com/flat-belly-supplements'

function FlatBellyMetaTags() {
  if (typeof document === 'undefined') return null
  document.title = FB_META_TITLE
  function setMeta(name: string, content: string, prop?: boolean) {
    const attr = prop ? 'property' : 'name'
    let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null
    if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el) }
    el.content = content
  }
  setMeta('description', FB_META_DESC)
  setMeta('og:title', FB_META_TITLE, true)
  setMeta('og:description', FB_META_DESC, true)
  setMeta('og:type', 'website', true)
  setMeta('og:url', FB_URL, true)
  setMeta('twitter:card', 'summary')
  setMeta('twitter:title', FB_META_TITLE)
  setMeta('twitter:description', FB_META_DESC)
  let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
  if (!canonical) { canonical = document.createElement('link'); canonical.setAttribute('rel', 'canonical'); document.head.appendChild(canonical) }
  canonical.href = FB_URL
  return null
}

const ASHWAGANDHA_LINK = 'https://amzn.to/3UatK1T'

// Shown in full on both ashwagandha doses. Thyroid is the one interaction people are
// most likely to have and least likely to know about, so it does not get shortened.
const ASHWAGANDHA_THYROID_WARNING =
  'THYROID WARNING: Ashwagandha can raise thyroid hormone levels. If you have hypothyroidism, Hashimoto\'s, or any thyroid condition, or you take levothyroxine, Synthroid, Armour, or any thyroid medication, do not start this until your prescriber clears it. Combined with thyroid medication it can push your levels too high, which shows up as a racing heart, anxiety, trouble sleeping, or unexplained weight loss. Also not for use in pregnancy, and clear it first if you take sedatives or immunosuppressants.'

interface Product {
  name: string
  dose: string
  link: string
  warning?: string
}

interface DoseBlock {
  phase: string
  weeks: string
  note: string
  products: Product[]
}

const doses: DoseBlock[] = [
  {
    phase: 'Morning, with breakfast',
    weeks: 'Dose 1',
    note: 'Take with food. Morning dosing works with the natural cortisol rise instead of against it.',
    products: [
      {
        name: 'Jarrow Formulas KSM-66 Ashwagandha 300mg',
        dose: 'One capsule with breakfast. KSM-66 is the most-studied full-spectrum root extract for cortisol reduction. It can cause mild nausea on an empty stomach in the first week, so always take it with food.',
        warning: ASHWAGANDHA_THYROID_WARNING,
        link: ASHWAGANDHA_LINK,
      },
    ],
  },
  {
    phase: 'Afternoon, 2 to 3 PM',
    weeks: 'Dose 2',
    note: 'That window targets the secondary cortisol rise most women feel as the afternoon crash.',
    products: [
      {
        name: 'Swanson Full Spectrum Lemon Balm 500mg',
        dose: 'One capsule with a glass of water. Taken much later in the day it can cause mild evening drowsiness.',
        warning: 'THYROID WARNING: Lemon balm may lower thyroid hormone activity and can interfere with thyroid medication. If you have a thyroid condition or take thyroid medication, clear this with your prescriber before starting. It also interacts with sedatives and other GABA-active medications.',
        link: 'https://amzn.to/4z6s7Cx',
      },
    ],
  },
  {
    phase: 'Evening, with dinner',
    weeks: 'Doses 3 and 4',
    note: 'IMPORTANT: vitamin K2 works directly against warfarin and other blood thinners. If you take one, do not start the D3/K2 until your prescriber clears it. This is the most important warning on this page.',
    products: [
      {
        name: 'Jarrow Formulas KSM-66 Ashwagandha 300mg, second dose',
        dose: 'One capsule with dinner. Same product as the morning dose, so one bottle covers both.',
        warning: ASHWAGANDHA_THYROID_WARNING,
        link: ASHWAGANDHA_LINK,
      },
      {
        name: 'Thorne Vitamin D/K2 Liquid',
        dose: 'Two drops with dinner. This one is fat soluble and needs the fat in the meal to absorb, which is why it goes with the fattiest meal of the day rather than on an empty stomach.',
        link: 'https://amzn.to/4hYL0B1',
      },
    ],
  },
  {
    phase: 'Bedtime, around 9:30 PM',
    weeks: 'Dose 5',
    note: 'The dose is deliberate. The tolerable upper intake level for supplemental magnesium is 350mg per day, separate from dietary magnesium, which has no upper limit. 200mg sits comfortably under it and still does the job.',
    products: [
      {
        name: "Doctor's Best High Absorption Magnesium, 200mg serving",
        dose: 'One 2-tablet serving, 30 to 45 minutes before sleep. It takes about that long to work. If it upsets your stomach, take it with a small snack. Space it 2 to 4 hours from tetracycline and quinolone antibiotics and from bisphosphonates. Caution with kidney disease. If the tablets are hard to swallow, magnesium bisglycinate powder is about 200mg per scoop and mixes into water.',
        link: 'https://amzn.to/4wjlI42',
      },
    ],
  },
]

export default function FlatBellySupplements() {
  return (
    <div className={styles.page}>
      <FlatBellyMetaTags />
      <div className={styles.wrap}>

        <Link to="/" className={styles.logo}>Hunter's Holistic Health</Link>

        <h1 className={styles.title}>Flat Belly Challenge Supplement Stack</h1>
        <p className={styles.subtitle}>
          Four products, five doses, timed to the cortisol curve. None of this is required to
          do the challenge. The habits do the heavy lifting, the stack supports them. We start
          taking it on Day 7, not before, so order around Day 3 to give it time to arrive.
          Questions? Email <a href="mailto:info@huntersholistichealth.com">info@huntersholistichealth.com</a>.
        </p>

        <div className={styles.disclosure}>
          <strong>Affiliate Disclosure:</strong> Product links below are Amazon affiliate links.
          If you purchase through one of these links, Hunter's Holistic Health may earn a small
          commission at no additional cost to you. I only recommend what I use and teach.
          <br /><br />
          <strong>These statements have not been evaluated by the Food and Drug Administration.
          These products are not intended to diagnose, treat, cure, or prevent any disease.</strong>{' '}
          Always consult your licensed healthcare provider before beginning any supplement,
          especially if you have a diagnosed condition or take prescription medications.
        </div>

        {doses.map(d => (
          <div key={d.phase} className={styles.phaseBlock}>
            <div className={styles.phaseHeader}>
              <h2 className={styles.phaseTitle}>{d.phase}</h2>
              <span className={styles.phaseWeeks}>{d.weeks}</span>
            </div>
            <p className={styles.phaseNote}>{d.note}</p>
            <div className={styles.productList}>
              {d.products.map(p => (
                <div key={p.name} className={styles.productCard}>
                  <p className={styles.productName}>{p.name}</p>
                  <p className={styles.productDose}>{p.dose}</p>
                  {p.warning && <p className={styles.productWarning}>{p.warning}</p>}
                  <a
                    href={p.link}
                    target="_blank"
                    rel="noopener sponsored"
                    className={styles.productLink}
                  >
                    View on Amazon
                  </a>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className={styles.phaseBlock}>
          <div className={styles.phaseHeader}>
            <h2 className={styles.phaseTitle}>Before you start</h2>
          </div>
          <p className={styles.phaseNote}>
            All supplements with food or water. Never with alcohol. Not during pregnancy.
            With your doctor's permission, of course. Bring them this list and ask. That is the
            right way to do it and it takes one message to their office. Give the stack 30 days
            before judging it. Most of the cortisol research shows meaningful change between
            weeks 4 and 8.
          </p>
        </div>

        <div className={styles.footer}>
          <p><strong>Medical Disclaimer:</strong> The information on this page is for educational purposes only and does not constitute medical advice. Dr. Shallanda Hunter, PharmD, MBA, CFNMP, operates as a Functional Medicine Educator, not as your prescribing physician or pharmacist. Always consult your doctor before starting any new supplement, especially if you are pregnant, nursing, managing a chronic condition, or taking prescription medications.</p>
          <p>These statements have not been evaluated by the FDA. These products are not intended to diagnose, treat, cure, or prevent any disease.</p>
          <p>Hunter's Holistic Health LLC | <a href="mailto:info@huntersholistichealth.com">info@huntersholistichealth.com</a></p>
        </div>

      </div>
    </div>
  )
}
