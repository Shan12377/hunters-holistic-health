import { Link } from 'react-router-dom'
import styles from './Protocol.module.css'

function MetaTags() {
  if (typeof document === 'undefined') return null
  document.title = 'Metal Detox Protocol | Hunter\'s Holistic Health'
  let robots = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null
  if (!robots) { robots = document.createElement('meta'); robots.setAttribute('name', 'robots'); document.head.appendChild(robots) }
  robots.content = 'noindex, nofollow'
  return null
}

type Product = { name: string; brand: string; link: string; what: string; note?: string }
type Phase = { phase: string; subtitle: string; products: Product[] }

const PHASES: Phase[] = [
  {
    phase: 'Phase 1, Halt and Drain',
    subtitle: 'Mineral saturation and foundational support.',
    products: [
      {
        name: 'Vitamin D3 + K2 + Calcium',
        brand: 'Pure Micronutrients',
        link: 'https://www.puremicronutrients.com/products/pure-d3-k2?variant=48425626501436',
        what: 'Fills the bone matrix with calcium, the preferred mineral that lead and other metals try to mimic. Vitamin K2 (MK-7) directs calcium into bone tissue and away from arterial walls. Requires fat for absorption.',
      },
      {
        name: 'Selenium',
        brand: 'Thorne (NSF Certified for Sport)',
        link: 'https://amzn.to/4fDVjJa',
        what: 'Supports thyroid hormone conversion (T4 to T3) and provides antioxidant protection to thyroid tissue during the clearance process. Selenomethionine is the organic, food-derived form with the highest bioavailability. NSF Certified for Sport; appropriate for athletes and active individuals.',
      },
      {
        name: 'Brazil Nuts',
        brand: "I'm A Nut",
        link: 'https://amzn.to/4vwegCc',
        what: 'One of the richest natural food sources of selenium on the planet. Two to three nuts daily provides meaningful selenium to complement your supplement stack and support thyroid hormone conversion, antioxidant defense, and healthy hormone balance for both men and women. Selenium supports the enzymes that protect hormone-producing cells from oxidative stress, making it relevant across the full spectrum of hormonal health including thyroid, estrogen, and testosterone balance.',
        note: 'Do not exceed three to four nuts per day. Brazil nuts are so concentrated in selenium that too many can become counterproductive.',
      },
      {
        name: 'Glutaryl Topical Glutathione',
        brand: 'Auro Wellness',
        link: 'https://aurowellness.com/collections/all-products/products/glutaryl',
        what: 'Glutathione is a tri-peptide amino acid produced naturally in every cell of the body. Often called the Master Antioxidant, it supports detox pathways, liver health, immune function, mitochondrial energy, and protects cells from oxidative stress. Natural production begins to decline around age 30 while environmental exposure continues to rise. Auro GSH uses sub-nano technology for enhanced topical absorption, making this one of the most bioavailable glutathione delivery systems available.',
      },
      {
        name: 'Zinc',
        brand: 'Thorne',
        link: 'https://amzn.to/4wKPlMf',
        what: 'Essential cofactor for over 300 enzymatic processes. Supports immune function and hormone balance. Part of a structured mineral replenishment approach.',
        note: 'Specific dosing should be discussed with your licensed healthcare provider.',
      },
      {
        name: 'Copper Bisglycinate',
        brand: 'Thorne',
        link: 'https://amzn.to/3RaFQqP',
        what: 'Maintains healthy zinc-to-copper balance. Supports connective tissue integrity, immune function, and neurological health. Bisglycinate form is gentle and well absorbed.',
      },
      {
        name: 'Magnesium Glycinate',
        brand: "Doctor's Best",
        link: 'https://amzn.to/44wjhzW',
        what: 'Supports arterial relaxation, healthy blood pressure, and sleep quality. One of the most bioavailable and gentle forms of magnesium available.',
      },
    ],
  },
  {
    phase: 'Phase 2, Catch and Trap',
    subtitle: 'Gut-based binding to intercept metals before reabsorption.',
    products: [
      {
        name: 'PectaSol Modified Citrus Pectin (454g Powder)',
        brand: 'EcoNugenics',
        link: 'https://amzn.to/44BfP74',
        what: 'Acts as a molecular sponge in the bloodstream, binding circulating metals and supporting their natural excretion. One of the most studied gut-based metal-binding agents available.',
        note: 'Binders like MCP should always be separated from other supplements. Discuss spacing with your licensed healthcare provider.',
      },
      {
        name: 'Zeolite Pure',
        brand: 'ZeoHealth',
        link: 'https://amzn.to/4w1ZZhN',
        what: 'Clinoptilolite zeolite supports healthy metal clearance in the digestive tract by intercepting metals before they can be reabsorbed. Works alongside MCP for layered support.',
        note: 'As with all binders, spacing from other supplements is important. Discuss timing with your licensed healthcare provider.',
      },
    ],
  },
  {
    phase: 'Phase 3, Excrete',
    subtitle: 'Mobilization support once the foundational work is in place.',
    products: [
      {
        name: 'Liposomal Vitamin C',
        brand: 'Quicksilver Scientific',
        link: 'https://amzn.to/4aUQqZC',
        what: 'Liposomal delivery dramatically enhances cellular uptake compared to standard Vitamin C. Supports gentle tissue mobilization and antioxidant defense during the clearance phase.',
      },
      {
        name: 'Sun Chlorella A Tablets',
        brand: 'Sun Chlorella',
        link: 'https://amzn.to/3T2ue9S',
        what: 'Cracked-cell chlorella provides a secondary binding layer in the digestive tract and supports liver health while metals are in transit. Cracked cell wall (DYNO-Mill process) is essential for bioavailability. Whole-cell forms are largely indigestible. Always take with food.',
      },
    ],
  },
  {
    phase: 'Advanced Support, Deep Tissue',
    subtitle: 'Used at a specific stage within a structured protocol. Not a standalone supplement. Sequencing matters.',
    products: [
      {
        name: 'Cilantro Liquid Extract (Certified Organic)',
        brand: 'Herb Pharm',
        link: 'https://amzn.to/3RFH7pU',
        what: 'A powerful intracellular mobilizer studied for its ability to support clearance of metals stored in deep tissues. Research suggests cilantro works most effectively when gut binders are already established.',
        note: 'Sequencing within a protocol matters. Always discuss with your licensed healthcare provider before use.',
      },
    ],
  },
  {
    phase: 'Cardiovascular Support, Ongoing',
    subtitle: 'Foundational support for healthy blood flow and vascular health throughout the protocol and beyond.',
    products: [
      {
        name: 'Beet Root Powder',
        brand: 'Force Factor',
        link: 'https://amzn.to/4pkq8G4',
        what: 'Dietary nitrate source that converts to nitric oxide in the body, supporting healthy blood flow and vascular tone during and after the clearance process.',
      },
      {
        name: 'L-Citrulline',
        brand: "Doctor's Best",
        link: 'https://amzn.to/3RFkVMC',
        what: 'Nitric oxide precursor that works synergistically with beet root for sustained vasodilation and blood pressure support throughout the day.',
      },
    ],
  },
]

export default function MetalDetoxProtocol() {
  return (
    <div className={styles.page}>
      <MetaTags />
      <div className={styles.wrap}>

        <Link to="/" className={styles.logo}>Hunter's Holistic Health</Link>

        <h1 className={styles.title}>Metal Detox Protocol</h1>
        <p className={styles.subtitle}>
          This is an educational reference for the supplement products used in the metal detox
          protocol. Sequencing and dosing are highly individual. Follow the guidance specific to
          your situation. Questions? Email{' '}
          <a href="mailto:info@huntersholistichealth.com">info@huntersholistichealth.com</a>.
        </p>

        <div className={styles.disclosure}>
          <strong>Affiliate Disclosure:</strong> Product links below are affiliate links.
          If you purchase through one of these links, Hunter's Holistic Health may earn a small
          commission at no additional cost to you. All recommendations are based on research and
          trusted sources.
          <br /><br />
          <strong>These statements have not been evaluated by the Food and Drug Administration.
          These products are not intended to diagnose, treat, cure, or prevent any disease.</strong>{' '}
          Always consult your licensed healthcare provider before beginning any supplement,
          especially if you have a diagnosed condition or take prescription medications.
        </div>

        {PHASES.map(ph => (
          <div key={ph.phase} className={styles.phaseBlock}>
            <div className={styles.phaseHeader}>
              <h2 className={styles.phaseTitle}>{ph.phase}</h2>
            </div>
            <p className={styles.phaseNote}>{ph.subtitle}</p>
            <div className={styles.productList}>
              {ph.products.map(p => (
                <div key={p.name} className={styles.productCard}>
                  <p className={styles.productBrand}>{p.brand}</p>
                  <p className={styles.productName}>{p.name}</p>
                  <p className={styles.productDose}>{p.what}</p>
                  {p.note && (
                    <p className={styles.phaseNote} style={{ marginTop: '-0.25rem', marginBottom: '0.75rem' }}>{p.note}</p>
                  )}
                  <a
                    href={p.link}
                    target="_blank"
                    rel="noopener sponsored"
                    className={styles.productLink}
                  >
                    Shop Now
                  </a>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className={styles.footer}>
          <p><strong>Medical Disclaimer:</strong> The information on this page is for educational purposes only and does not constitute medical advice. Dr. Shallanda Hunter, PharmD, CFNMP, operates as a Functional Medicine Educator, not as your prescribing physician or pharmacist. The supplement brands and forms listed here represent the highest-quality options based on independent research; specific dosing, timing, and sequencing are highly individual and should always be discussed with your licensed physician or qualified healthcare professional before starting. This is especially important if you have a diagnosed condition, take prescription medications, or are managing a complex health history.</p>
          <p>These statements have not been evaluated by the FDA. These products are not intended to diagnose, treat, cure, or prevent any disease.</p>
          <p>Hunter's Holistic Health LLC | <a href="mailto:info@huntersholistichealth.com">info@huntersholistichealth.com</a></p>
        </div>

      </div>
    </div>
  )
}
