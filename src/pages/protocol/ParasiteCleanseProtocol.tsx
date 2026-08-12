import { Link } from 'react-router-dom'
import styles from './Protocol.module.css'

const PC_META_TITLE = 'Parasite Cleanse Protocol | Hunter\'s Holistic Health'
const PC_META_DESC = 'The ROOTS-based Parasite Cleanse protocol from Dr. Shallanda Hunter, CFNMP. Evidence-informed supplement and lifestyle education for gut health and immune support.'

function ParasiteMetaTags() {
  if (typeof document === 'undefined') return null
  document.title = PC_META_TITLE
  function setMeta(name: string, content: string, prop?: boolean) {
    const attr = prop ? 'property' : 'name'
    let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null
    if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el) }
    el.content = content
  }
  setMeta('description', PC_META_DESC)
  setMeta('og:title', PC_META_TITLE, true)
  setMeta('og:description', PC_META_DESC, true)
  setMeta('og:type', 'website', true)
  setMeta('og:url', 'https://www.huntersholistichealth.com/protocol/parasite-cleanse', true)
  setMeta('twitter:card', 'summary')
  setMeta('twitter:title', PC_META_TITLE)
  setMeta('twitter:description', PC_META_DESC)
  let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
  if (!canonical) { canonical = document.createElement('link'); canonical.setAttribute('rel', 'canonical'); document.head.appendChild(canonical) }
  canonical.href = 'https://www.huntersholistichealth.com/protocol/parasite-cleanse'
  return null
}

const phases = [
  {
    phase: 'Phase 0: Open Drainage',
    weeks: 'Weeks 1 to 2',
    note: 'Start these two weeks before any antiparasitic herbs begin. The liver and glutathione system must be primed before die-off toxins start moving.',
    products: [
      {
        name: 'Thorne Milk Thistle Phytosome',
        dose: '1 capsule daily with food. The phytosome form delivers silymarin at 4 to 10x better absorption than standard milk thistle. Protects and pre-loads the liver before parasite die-off begins.',
        link: 'https://amzn.to/4vrgov0',
      },
      {
        name: 'Jarrow NAC Sustain 600mg',
        dose: '1 capsule in the morning. Replenishes glutathione, your primary detox molecule, before die-off starts flooding the system. Also breaks down the biofilm parasites use to hide from the immune system.',
        link: 'https://amzn.to/3QOQqDO',
      },
    ],
  },
  {
    phase: 'Phase 1: Kill Phase',
    weeks: 'Weeks 3 to 10',
    note: 'Two 3-week kill cycles with rest weeks at Week 6 and Week 10. During rest weeks, stop Biocidin, Wormwood, Cloves, and Mimosa Pudica. Continue G.I. Detox+, S. boulardii, Milk Thistle, and NAC.',
    products: [
      {
        name: 'NOW Foods Black Walnut Hulls 500mg',
        dose: '1 capsule 3 times daily (1,500mg total), taken with meals. Juglone, the active compound in black walnut hull, disrupts parasite cell membranes and is particularly effective against intestinal worms and protozoa. Works synergistically with wormwood and cloves to cover multiple parasite life stages.',
        link: 'https://amzn.to/4wZVCE3',
      },
      {
        name: "Oregon's Wild Harvest Cloves",
        dose: '3 capsules daily (1,500mg total), taken with meals. Eugenol in cloves destroys parasite eggs and larvae, the stage wormwood does not reach as effectively. These two work as a team.',
        link: 'https://amzn.to/3QmOGkW',
      },
      {
        name: "Oregon's Wild Harvest Wormwood",
        dose: '3 capsules daily (780mg total), taken with meals. Artemisia absinthium disrupts parasite mitochondria. Do not exceed 4 consecutive weeks; rest weeks are built into the protocol for this reason.',
        link: 'https://amzn.to/4eKOvbd',
      },
      {
        name: 'Biocidin Liquid',
        dose: 'Start with 1 drop twice daily. Increase by 1 drop every 2 days as tolerated, working toward the full dose recommended on the label. Take 30 minutes before meals.',
        link: 'https://amzn.to/4f09k3C',
      },
      {
        name: 'Double Wood Mimosa Pudica',
        dose: 'Start with 2 capsules daily on an empty stomach. Build to 4 capsules daily by Week 2. Take 30 minutes before breakfast. Forms a sticky gel that physically traps parasites and tears through biofilm.',
        link: 'https://amzn.to/4oJK05b',
      },
      {
        name: 'G.I. Detox+',
        dose: '1 capsule 3 times daily, taken between meals, at least 2 hours away from all other supplements and food. Binds the toxins released by dying parasites so they exit in stool rather than recirculating into the bloodstream.',
        link: 'https://amzn.to/4eCJstg',
      },
      {
        name: 'Jarrow S. boulardii',
        dose: '1 capsule daily with food throughout the kill phase. Saccharomyces boulardii is a probiotic yeast. Antiparasitic herbs cannot kill it. Bridges gut protection while the kill herbs clear everything else out.',
        link: 'https://amzn.to/44nNZLx',
      },
    ],
  },
  {
    phase: 'Phase 2: Gut Healing (Optional Additions)',
    weeks: 'Weeks 11 to 14',
    note: 'Stop all antiparasitics. The kill phase is done. These three products repair the intestinal damage parasites left behind and recolonize the terrain.',
    products: [
      {
        name: 'Thorne L-Glutamine Powder',
        dose: '5 to 10g powder on an empty stomach each morning. Mix in water or a smoothie. L-Glutamine is the primary fuel for enterocytes, the cells that line and rebuild the intestinal wall. Parasites punch holes in tight junctions as they die; this is what closes them.',
        link: 'https://amzn.to/450hwLr',
      },
      {
        name: "Oregon's Wild Harvest Slippery Elm Organic",
        dose: '2 capsules 30 minutes before meals. Slippery elm\'s mucilage coating physically soothes and covers inflamed intestinal mucosa while the structural repair happens underneath. Also acts as a prebiotic to feed the beneficial bacteria coming in during Phase 2.',
        link: 'https://amzn.to/4bFZ9z3',
      },
      {
        name: 'Microbiome Labs MegaSporeBiotic',
        dose: 'Start with 1 capsule daily with food for the first week, then increase to 2 capsules daily. Begin only after the kill phase is completely finished. Bacillus spore strains are armor-plated; they survive stomach acid where most probiotics do not. Recolonizes the cleared terrain before opportunistic bacteria move back in.',
        link: 'https://amzn.to/4phRvAL',
      },
    ],
  },
]

export default function GutHealthProtocol() {
  return (
    <div className={styles.page}>
      <ParasiteMetaTags />
      <div className={styles.wrap}>

        <Link to="/" className={styles.logo}>Hunter's Holistic Health</Link>

        <h1 className={styles.title}>Parasite Cleanse Protocol</h1>
        <p className={styles.subtitle}>
          This is an educational reference for the supplement products discussed in your session.
          Dosing notes below are general starting points. Follow the guidance specific to your situation.
          Questions? Email <a href="mailto:info@huntersholistichealth.com">info@huntersholistichealth.com</a>.
        </p>

        <div className={styles.disclosure}>
          <strong>Affiliate Disclosure:</strong> Product links below are Amazon affiliate links.
          If you purchase through one of these links, Hunter's Holistic Health may earn a small
          commission at no additional cost to you. All recommendations are based on research and
          trusted sources.
          <br /><br />
          <strong>These statements have not been evaluated by the Food and Drug Administration.
          These products are not intended to diagnose, treat, cure, or prevent any disease.</strong>{' '}
          Always consult your licensed healthcare provider before beginning any supplement,
          especially if you have a diagnosed condition or take prescription medications.
        </div>

        {phases.map(ph => (
          <div key={ph.phase} className={styles.phaseBlock}>
            <div className={styles.phaseHeader}>
              <h2 className={styles.phaseTitle}>{ph.phase}</h2>
              <span className={styles.phaseWeeks}>{ph.weeks}</span>
            </div>
            <p className={styles.phaseNote}>{ph.note}</p>
            <div className={styles.productList}>
              {ph.products.map(p => (
                <div key={p.name} className={styles.productCard}>
                  <p className={styles.productName}>{p.name}</p>
                  <p className={styles.productDose}>{p.dose}</p>
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

        <div className={styles.footer}>
          <p><strong>Medical Disclaimer:</strong> The information on this page is for educational purposes only and does not constitute medical advice. Dr. Shallanda Hunter, PharmD, CFNMP, operates as a Functional Medicine Educator, not as your prescribing physician or pharmacist. Always consult your doctor before starting any new supplement, especially if you are pregnant, nursing, managing a chronic condition, or taking prescription medications.</p>
          <p>These statements have not been evaluated by the FDA. These products are not intended to diagnose, treat, cure, or prevent any disease.</p>
          <p>Hunter's Holistic Health LLC | <a href="mailto:info@huntersholistichealth.com">info@huntersholistichealth.com</a></p>
        </div>

      </div>
    </div>
  )
}
