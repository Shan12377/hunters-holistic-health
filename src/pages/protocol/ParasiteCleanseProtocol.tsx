import styles from './Protocol.module.css'

const products = [
  {
    name: 'Biocidin Liquid',
    dose: 'Start with 1 drop twice daily. Increase by 1 drop every 2 days as tolerated, working toward the full dose recommended on the label. Take 30 minutes before meals.',
    link: 'https://amzn.to/4f09k3C',
  },
  {
    name: 'G.I. Detox+',
    dose: 'Take 2 capsules once daily, away from food and supplements by at least 2 hours. Best taken at bedtime. Drink a full glass of water.',
    link: 'https://amzn.to/4eCJstg',
  },
  {
    name: "Oregon's Wild Harvest Wormwood",
    dose: 'Take as directed on the label, typically 1 capsule up to 3 times daily with meals. Do not use for more than 4 consecutive weeks without a break.',
    link: 'https://amzn.to/4eKOvbd',
  },
  {
    name: "Oregon's Wild Harvest Cloves",
    dose: 'Take as directed on the label, typically 1 capsule up to 3 times daily with meals. Part of the traditional parasite cleanse triad alongside wormwood and black walnut.',
    link: 'https://amzn.to/3QmOGkW',
  },
  {
    name: 'Double Wood Mimosa Pudica',
    dose: 'Take 2 capsules twice daily on an empty stomach, ideally 30 minutes before breakfast and 30 minutes before dinner. Start with 1 capsule twice daily for the first week.',
    link: 'https://amzn.to/4oJK05b',
  },
]

export default function GutHealthProtocol() {
  return (
    <div className={styles.page}>
      <div className={styles.wrap}>

        <p className={styles.logo}>Hunter's Holistic Health</p>

        <h1 className={styles.title}>Parasite Cleanse Protocol</h1>
        <p className={styles.subtitle}>
          This is an educational reference for the supplement products discussed in your session.
          Dosing notes below are general starting points. Follow the guidance specific to your situation.
          Questions? Email <a href="mailto:info@huntersholistichealth.com">info@huntersholistichealth.com</a>.
        </p>

        <div className={styles.disclosure}>
          <strong>Affiliate Disclosure:</strong> Product links below are Amazon affiliate links.
          If you purchase through one of these links, Hunter's Holistic Health may earn a small
          commission at no additional cost to you. Only products I have personally researched and
          would recommend are listed here.
        </div>

        <div className={styles.productList}>
          {products.map(p => (
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

        <div className={styles.footer}>
          <p><strong>Medical Disclaimer:</strong> The information on this page is for educational purposes only and does not constitute medical advice. Dr. Shallanda Hunter, PharmD, CFNMP, operates as a Functional Medicine Educator, not as your prescribing physician or pharmacist. Always consult your doctor before starting any new supplement, especially if you are pregnant, nursing, managing a chronic condition, or taking prescription medications.</p>
          <p>These statements have not been evaluated by the FDA. These products are not intended to diagnose, treat, cure, or prevent any disease.</p>
          <p>Hunter's Holistic Health LLC | 30 N Gould St, Ste R, Sheridan, WY 82801 | <a href="mailto:info@huntersholistichealth.com">info@huntersholistichealth.com</a></p>
        </div>

      </div>
    </div>
  )
}
