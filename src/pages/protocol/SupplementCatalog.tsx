import { Link } from 'react-router-dom'
import styles from './Protocol.module.css'

function MetaTags() {
  if (typeof document === 'undefined') return null
  document.title = 'Recommended Supplement Catalog | Hunter\'s Holistic Health'
  let robots = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null
  if (!robots) { robots = document.createElement('meta'); robots.setAttribute('name', 'robots'); document.head.appendChild(robots) }
  robots.content = 'noindex, nofollow'
  return null
}

type Product = { name: string; brand: string; link: string; what: string; note?: string }
type Section = { icon: string; title: string; products: Product[] }

const SECTIONS: Section[] = [
  {
    icon: '🫀',
    title: 'Cardiovascular and Blood Pressure',
    products: [
      { name: 'Olive Leaf Extract', brand: 'Island Nutrition', link: 'https://amzn.to/3SXSH05', what: 'Supports healthy blood pressure and arterial flexibility; contains oleuropein, a polyphenol studied for cardiovascular and antioxidant support.' },
      { name: 'Aged Garlic Extract', brand: 'ELARE', link: 'https://amzn.to/4fgCXfR', what: 'Supports cardiovascular health and healthy circulation; studied for its effects on arterial flexibility and blood pressure.' },
      { name: 'Beetroot 5-in-1', brand: 'NutraHarmony', link: 'https://amzn.to/4fBEdeV', what: 'Dietary nitrate source that converts to nitric oxide; supports blood pressure and circulation.' },
      { name: 'L-Citrulline', brand: "Doctor's Best", link: 'https://amzn.to/3RFkVMC', what: 'Nitric oxide precursor; synergizes with beetroot for enhanced vasodilation and blood flow.' },
      { name: 'L-Arginine', brand: 'NOW', link: 'https://amzn.to/3SSCGbP', what: 'Direct nitric oxide precursor; supports vasodilation and cardiovascular function.' },
      { name: 'Taurine', brand: 'NOW Foods', link: 'https://amzn.to/4hczUIf', what: 'Cardiovascular amino acid; supports blood pressure regulation and electrolyte balance.' },
      { name: 'Electrolytes', brand: 'Dr. Berg', link: 'https://amzn.to/4waFMGI', what: 'Potassium, magnesium, and trace mineral support for hydration and cardiovascular health.' },
    ],
  },
  {
    icon: '🔬',
    title: 'Lipid Support and Antioxidant Protection',
    products: [
      { name: 'Astaxanthin', brand: 'Double Wood', link: 'https://amzn.to/3RFjIF4', what: 'Potent lipophilic antioxidant; supports antioxidant protection of LDL particles, healthy HDL levels, and microvascular blood flow.' },
      { name: 'Omega-3 Fish Oil', brand: 'Nordic Naturals', link: 'https://amzn.to/4vvkRgg', what: 'Supports healthy triglyceride levels, reduces systemic inflammation, and promotes cardiovascular health.' },
      { name: 'Red Yeast Rice + CoQ10', brand: 'NOW Foods', link: 'https://amzn.to/4aWqgpl', what: 'Traditional fermented rice preparation studied for its role in supporting healthy lipid levels and cardiovascular wellness. CoQ10 included to support mitochondrial energy, as red yeast rice use may affect CoQ10 levels.', note: 'Consult your provider before use if taking any cholesterol or cardiovascular medications.' },
      { name: 'Black Seed Oil', brand: 'Amazing Herbs', link: 'https://amzn.to/3QZu5U6', what: 'Anti-inflammatory, cardiovascular support, and mild lipid optimization.' },
      { name: 'Quercetin', brand: 'Jarrow', link: 'https://amzn.to/4bLxwVk', what: 'Flavonoid antioxidant; supports antioxidant protection of LDL particles, healthy inflammatory response, and immune health.' },
    ],
  },
  {
    icon: '🍬',
    title: 'Blood Sugar and Insulin Sensitivity',
    products: [
      { name: 'Berberine', brand: 'Thorne', link: 'https://amzn.to/4wCgRf4', what: 'AMPK activator; supports healthy fasting glucose, insulin sensitivity, and lipid metabolism.', note: 'Consult your provider before use if taking blood sugar medications, cyclosporine, or antibiotics.' },
      { name: 'Chromium Picolinate', brand: 'Life Extension', link: 'https://amzn.to/4vAaUhU', what: 'Enhances insulin receptor sensitivity; supports glucose disposal and metabolic health.' },
      { name: 'Fisetin', brand: "Doctor's Best", link: 'https://amzn.to/4vvPrq2', what: 'SIRT1 and AMPK activator; studied for its role in supporting insulin sensitivity, healthy cellular renewal, and vascular protection.' },
    ],
  },
  {
    icon: '🧠',
    title: 'Methylation and Homocysteine Support',
    products: [
      { name: 'B-Complex Basic', brand: 'Thorne', link: 'https://amzn.to/4f53ePx', what: 'Methylated B12 (methylcobalamin), Folate (L-methylfolate), and B6 (P5P); supports healthy homocysteine clearance and methylation pathways.' },
    ],
  },
  {
    icon: '🦴',
    title: 'Uric Acid and Joint Support',
    products: [
      { name: 'Vitamin C (buffered)', brand: 'NutriBiotic', link: 'https://amzn.to/4vBVObF', what: 'Supports renal excretion of uric acid and healthy immune function.' },
      { name: 'Tart Cherry Extract', brand: 'Zazzee', link: 'https://amzn.to/4fD8hqE', what: 'Studied for its role in supporting healthy uric acid levels; provides antioxidant and anti-inflammatory joint support.' },
    ],
  },
  {
    icon: '🔋',
    title: 'Mitochondrial and Cellular Energy',
    products: [
      { name: 'CoQ10 Ubiquinol + PQQ', brand: 'Jarrow Formulas', link: 'https://amzn.to/4yvaGeD', what: 'Mitochondrial electron transport and biogenesis; supports heart muscle energy and cellular vitality.' },
      { name: 'PQQ', brand: 'Life Extension', link: 'https://amzn.to/4f4QKaM', what: 'Stimulates mitochondrial biogenesis; supports neuroprotection and cellular energy production.' },
      { name: 'Acetyl-L-Carnitine', brand: 'Life Extension', link: 'https://amzn.to/4pkdLd0', what: 'Shuttles fatty acids into mitochondria for energy production; supports cognitive function and fat metabolism.' },
      { name: 'Spermidine', brand: 'Double Wood', link: 'https://amzn.to/4wKuHfd', what: 'Autophagy activator; studied for its role in supporting cellular renewal, cardiovascular health, and healthy aging.' },
      { name: 'Ursolic Acid', brand: 'Genex Formulas', link: 'https://amzn.to/3TBeqei', what: 'AMPK activator; supports muscle preservation, fat metabolism, and metabolic health.' },
    ],
  },
  {
    icon: '🦠',
    title: 'Gut Health and Digestive Support',
    products: [
      { name: 'Super Enzymes', brand: 'NOW Foods', link: 'https://amzn.to/4bLJdeG', what: 'Comprehensive digestive enzyme blend; supports nutrient absorption and digestive comfort.' },
      { name: 'Proteolytic Enzymes', brand: "Doctor's Best", link: 'https://amzn.to/4yGdVjx', what: 'Systemic enzyme support; promotes healthy inflammatory response and digestive wellness.' },
      { name: 'Apple Cider Vinegar', brand: "Lucy's", link: 'https://amzn.to/44AoSFl', what: 'Supports healthy stomach pH, post-meal glucose balance, and gut health.' },
    ],
  },
  {
    icon: '🛡️',
    title: 'Immune and Inflammation Support',
    products: [
      { name: 'Vitamin D3 5000 IU + K2', brand: 'Sports Research', link: 'https://amzn.to/4pkcHWy', what: 'Immune modulation, bone density support; K2 routes calcium into bones and away from arteries.' },
      { name: 'Copper Bisglycinate', brand: 'Thorne', link: 'https://amzn.to/4pn4Asg', what: 'Supports zinc-copper balance, immune function, and connective tissue health.' },
    ],
  },
  {
    icon: '🏋️',
    title: 'Muscle, Recovery and Protein',
    products: [
      { name: 'Prime Protein', brand: 'Equip Foods', link: 'https://amzn.to/4w0ckTG', what: 'Clean grass-fed beef protein isolate; supports muscle maintenance and recovery.' },
      { name: 'PerfectAmino', brand: 'BodyHealth', link: 'https://amzn.to/4vDheoJ', what: 'Essential amino acids; supports muscle recovery with minimal kidney load.' },
      { name: 'Magnesium Glycinate', brand: "Doctor's Best", link: 'https://amzn.to/44wjhzW', what: 'Highly bioavailable magnesium; supports sleep quality, muscle recovery, and relaxation.' },
    ],
  },
  {
    icon: '🚨',
    title: 'As-Needed and Travel Support',
    products: [
      { name: 'Activated Charcoal', brand: "Nature's Way", link: 'https://amzn.to/4vxfOfy', what: 'Gut binder; supports digestive comfort after off-protocol meals.' },
      { name: 'Magnesium Oxide', brand: 'Global Healing', link: 'https://amzn.to/4fgC1Ip', what: 'Osmotic laxative; supports bowel motility and occasional constipation relief.' },
      { name: 'Fiber', brand: 'Quality Choice', link: 'https://amzn.to/4wKs8Ki', what: 'Prebiotic fiber; supports bowel regularity and healthy gut microbiome.' },
      { name: 'Quicksilver Ultra Binder', brand: 'Quicksilver Scientific', link: 'https://amzn.to/44wef6y', what: 'Broad-spectrum binder; supports healthy detoxification pathways and environmental wellness.' },
      { name: 'Tums (Calcium)', brand: 'Tums', link: 'https://amzn.to/4aUIE1W', what: 'Occasional acid relief and calcium supplementation.' },
    ],
  },
  {
    icon: '🥤',
    title: 'Dietary Essentials and Oral Care',
    products: [
      { name: 'Organic Beet Juice', brand: 'Lakewood Organic', link: 'https://amzn.to/4gGDGJN', what: 'Dietary nitrate source; supports nitric oxide production and cardiovascular health.' },
      { name: 'Ground Flaxseed', brand: "Bob's RedMill", link: 'https://amzn.to/4wHGWZY', what: 'Prebiotic fiber, plant-based omega-3 (ALA), and lignans for hormonal and digestive health.' },
      { name: 'Hibiscus Tea', brand: 'Traditional Medicinals', link: 'https://amzn.to/3QSYofa', what: 'Studied for its role in supporting healthy blood pressure; contains anthocyanins and hibiscus acid.' },
      { name: 'TheraBreath Mouthwash', brand: 'TheraBreath', link: 'https://amzn.to/4pkNdsa', what: 'Blood pressure-safe oral rinse; free of CPC and chlorhexidine, preserves beneficial nitric oxide-producing oral bacteria.' },
    ],
  },
]

export default function SupplementCatalog() {
  return (
    <div className={styles.page}>
      <MetaTags />
      <div className={styles.wrap}>

        <Link to="/" className={styles.logo}>Hunter's Holistic Health</Link>

        <h1 className={styles.title}>Recommended Supplement Catalog</h1>
        <p className={styles.subtitle}>
          An educational reference for the supplements discussed in sessions and protocols.
          This catalog is updated as new research emerges. Questions? Email{' '}
          <a href="mailto:info@huntersholistichealth.com">info@huntersholistichealth.com</a>.
        </p>

        <div className={styles.disclosure}>
          <strong>Affiliate Disclosure:</strong> Product links below are Amazon affiliate links.
          If you purchase through one of these links, Hunter's Holistic Health may earn a small
          commission at no additional cost to you. Only products that have been personally
          researched and vetted are listed here.
          <br /><br />
          <strong>These statements have not been evaluated by the Food and Drug Administration.
          These products are not intended to diagnose, treat, cure, or prevent any disease.</strong>{' '}
          Always consult your licensed healthcare provider before beginning any supplement,
          especially if you have a diagnosed condition or take prescription medications.
        </div>

        {SECTIONS.map(sec => (
          <div key={sec.title} className={styles.phaseBlock}>
            <div className={styles.phaseHeader}>
              <h2 className={styles.phaseTitle}>
                <span className={styles.sectionIcon}>{sec.icon}</span>
                {sec.title}
              </h2>
            </div>
            <div className={styles.productList}>
              {sec.products.map(p => (
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
                    Shop on Amazon
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
