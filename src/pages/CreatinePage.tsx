import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, Download, ChevronDown } from 'lucide-react'

const STORE_URL = 'https://tidycal.com/drshallandahunter/store'
import styles from './CreatinePage.module.css'

const BUNDLE_ITEMS = [
  { title: 'Quick Start Guide', detail: '2 pages. Loading vs. maintenance decision tree, your personal protocol setup, Day 1 checklist.' },
  { title: 'Creatine Science Guide', detail: '20+ pages. How it works at the cellular level, athletic performance, cognitive benefits, safety, myths debunked, supplement quality guide, primary sources cited.' },
  { title: 'Brain Health Bonus Guide', detail: '8 pages. The cognitive performance evidence, depression research, who benefits most, tracker guidance, and what the research does not yet show.' },
  { title: '30-Day Supplement Tracker', detail: 'Daily dose, water, workout, energy, mood, and notes, plus weekly reflection pages.' },
  { title: 'Workout Performance Log', detail: 'Baseline benchmarks plus Day 30, 60, and 90 re-tests for 10 key exercises.' },
  { title: 'Hydration and Nutrition Tracker', detail: 'Daily creatine, water, protein, carbs, fats, and calories with auto-calculated targets.' },
  { title: 'Supplement Stack Cheat Sheet', detail: '1 page. Evidence-graded pairings, what works, what to use with caution, what to skip.' },
  { title: 'Google Sheets Workbook', detail: '5 tabs, auto-calculating, progress charts that update as you log.' },
]

const WHO_LIST = [
  'You are starting creatine for the first time and want to do it right',
  'You are a woman who has seen the research on creatine and depression and wants the full picture',
  'You are a man who wants more than a generic dosing chart and actually wants to understand the science',
  'You are over 65 and using creatine for cognitive support and muscle preservation',
  'You are vegetarian or vegan with low dietary creatine and want to track the change',
  'You are a health coach, personal trainer, or clinician who wants a patient-facing resource that is actually cited',
  'You want a 90-day system, not a 30-row blank PDF',
]

const BRAND_PICKS = [
  { name: 'Thorne Creatine', notes: 'NSF Certified for Sport. Unflavored monohydrate. One of the most tested brands on the market.', url: 'https://amzn.to/4uN1sr6' },
  { name: 'Momentous Creatine (Creapure)', notes: 'Uses Creapure, the German-sourced monohydrate with the strongest purity track record. NSF Certified for Sport.', url: 'https://amzn.to/4eKKqoo' },
  { name: 'Onnit Creatine', notes: 'Informed Sport certified. Micronized monohydrate, mixes cleanly.', url: 'https://amzn.to/3Q6KnKp' },
  { name: 'Promix Creatine', notes: 'Informed Sport certified. Minimal ingredient list, no additives.', url: 'https://amzn.to/3QJElPU' },
  { name: 'Optimum Nutrition Creatine Capsules', notes: 'Good option if you prefer capsules over powder. Widely available.', url: 'https://amzn.to/4uPXOfR' },
]

const FAQS: { q: string; a: string }[] = [
  {
    q: 'Will this mess up my kidneys?',
    a: 'For healthy people without pre-existing kidney conditions, the evidence consistently shows that creatine supplementation at recommended doses does not harm kidney function. The confusion arises because creatine metabolism raises blood creatinine levels, and creatinine is one of the markers doctors use to assess kidney health. Higher creatinine looks concerning on a lab test, but in this case it reflects the supplement being processed, not actual kidney damage. Multiple systematic reviews and long-term trials in healthy adults have found no adverse effects on kidney markers including glomerular filtration rate, urea, albumin excretion, and novel biomarkers. The important exception: if you have a pre-existing kidney condition, kidney disease, diabetes affecting kidney function, or reduced glomerular filtration rate, talk to your doctor before taking creatine.',
  },
  {
    q: 'I gained 3 lb overnight. Is that normal?',
    a: 'Yes. You may notice a 1 to 3 lb increase on the scale in the first week. This is intracellular water retention. Water is drawn into the muscle cells where creatine is stored. This is the protocol working exactly as intended. Muscles may look slightly fuller. It is not fat gain. Over the following weeks and months, any additional weight reflects actual muscle mass built through training. Creatine does not directly build muscle by itself. It lets you train harder, and that extra training stimulus is what drives muscle growth.',
  },
  {
    q: 'Do I have to do a loading phase?',
    a: 'No. A loading phase is optional. Both approaches end up at the same place. The only difference is how fast you get there. Loading (20 g per day for 5 to 7 days in divided doses) saturates your muscles in about 7 days. Skipping the loading phase and going straight to 3 to 5 g per day takes about 3 to 4 weeks to reach the same saturation. Loading increases the risk of gastrointestinal symptoms like bloating and cramping. For most general users and anyone with GI sensitivity, the no-load protocol is the better starting point.',
  },
  {
    q: 'I take pre-workout with caffeine. Is that okay?',
    a: 'Most likely yes. Early lab studies suggested caffeine might blunt creatine\'s effect on muscle phosphocreatine resynthesis. More recent and better-controlled research has not confirmed this interaction as a meaningful real-world concern. Most current researchers and sports nutrition organizations conclude that taking creatine and caffeine together does not meaningfully reduce creatine\'s benefits. Many people use both daily without issue. The caution to keep in mind: avoid combining creatine with large amounts of caffeine or acidic drinks at the exact same time if you are sensitive to GI symptoms.',
  },
  {
    q: "I'm a woman. Is this actually for me?",
    a: 'Yes. Creatine monohydrate is safe for women at standard doses. The safety profile does not differ by sex. Women actually have lower baseline creatine stores than men, which means the relative benefit of supplementation may be equal to or greater than in men. Evidence supports improvements in strength, power, sprint performance, and cognitive function. Postmenopausal women show benefits for both muscle and bone health when combined with resistance training. The link between low dietary creatine and depression also appears stronger in women than in men, and early clinical trials adding creatine to antidepressant therapy have shown promising results.',
  },
]

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={styles.faqItem}>
      <button className={styles.faqBtn} onClick={() => setOpen(!open)} aria-expanded={open}>
        <span>{q}</span>
        <ChevronDown size={18} className={`${styles.faqChevron} ${open ? styles.faqChevronOpen : ''}`} />
      </button>
      {open && <div className={styles.faqAnswer}>{a}</div>}
    </div>
  )
}

export default function CreatinePage() {
  return (
    <div className={styles.page}>
      {/* Nav */}
      <nav className={styles.nav}>
        <Link to="/" className={styles.navLogo}>Hunter's Holistic Health</Link>
        <a href={STORE_URL} target="_blank" rel="noopener" className={styles.navCta}>Get the Bundle $47</a>
      </nav>

      {/* Hero */}
      <header className={styles.hero}>
        <div className={styles.heroBadge}>Digital Download</div>
        <h1 className={styles.heroH1}>Creatine does more than build muscle. Most people have no idea how much more.</h1>
        <p className={styles.heroSub}>
          A 90-day creatine system built by a PharmD. Evidence-based. Fully cited. Built for brain health, performance, and everyone the research actually covers.
        </p>
        <img
          src="/creatine-bundle-hero.jpeg"
          alt="Creatine Stack Bundle: Science Guide on tablet, 30-Day Supplement Tracker on phone, Workout Performance Log, Brain Health Bonus Guide, Hydration Tracker, and creatine jar"
          className={styles.heroImg}
        />
        <div className={styles.ctaWrap}>
          <a href={STORE_URL} target="_blank" rel="noopener" className={styles.ctaBtn}>
            <Download size={18} />
            Get Instant Access for $47
          </a>
          <span className={styles.ctaPrice}>One price. Instant download. 8 files included.</span>
        </div>
      </header>

      {/* IMPORTANT: Refund policy */}
      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <p className={styles.alertBox}>
            <strong>All sales are final. No refunds on digital downloads.</strong> If a file is missing or fails to download, email <a href="mailto:info@huntersholistichealth.com">info@huntersholistichealth.com</a> within 7 days and we will make it right. This is a digital download. No physical product is shipped. Files are available immediately after purchase. For personal and clinical use. Not for resale or redistribution.
          </p>
        </div>
      </section>

      {/* What this is */}
      <section className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionH2}>What this is</h2>
          <p className={styles.bodyText}>
            The Creatine Stack Bundle is 8 files covering everything from the science (what creatine actually does in your brain and body) to a full 90-day tracking system across PDF and Google Sheets.
          </p>
          <p className={styles.bodyText}>
            Every claim in the science guide is cited against peer-reviewed research. No marketing language. No proprietary blend hype. Just the mechanism, the evidence, and the tools to track your results.
          </p>
        </div>
      </section>

      {/* Who it's for */}
      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <h2 className={styles.sectionH2}>Who this is for</h2>
          <p className={styles.bodyText}>This bundle is for you if:</p>
          <ul className={styles.checkList}>
            {WHO_LIST.map((item) => (
              <li key={item} className={styles.checkItem}>
                <CheckCircle size={16} className={styles.checkIcon} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* The complete bundle */}
      <section className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionH2}>The complete bundle</h2>
          <p className={styles.bodyText}>Everything you need to start, track, and measure your creatine protocol over 90 days.</p>
          <div className={styles.bundleGrid}>
            {BUNDLE_ITEMS.map((item) => (
              <div key={item.title} className={styles.bundleItem}>
                <span className={styles.bundleItemTitle}>{item.title}</span>
                {item.detail}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Price + CTA */}
      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <div className={styles.priceCard}>
            <p className={styles.priceAmount}>$47</p>
            <p className={styles.priceLabel}>One price. Instant download. Everything included.</p>
            <a href={STORE_URL} target="_blank" rel="noopener" className={styles.ctaBtn}>
              <Download size={18} />
              Get Instant Access
            </a>
          </div>
        </div>
      </section>

      {/* Why Dr. Hunter built this */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.bioBlock}>
            <h2 className={styles.sectionH2}>Why Dr. Hunter built this</h2>
            <p className={styles.bodyText}>
              I am a licensed pharmacist. I have a PharmD and an MBA. I am a Certified Functional and Nutritional Medicine Practitioner.
            </p>
            <p className={styles.bodyText}>
              I also reversed my own metabolic condition using functional medicine principles when conventional options were not giving me answers.
            </p>
            <p className={styles.bodyText}>
              I built this bundle because I kept watching clients, mostly women, start creatine with no guidance, no baseline data, and no way to measure whether it was working. They would try it for two weeks, feel nothing obvious, and stop. Or they would gain a couple of pounds of water in week one and panic.
            </p>
            <p className={styles.bodyText}>
              The tracker and the science guide exist so that doesn't happen to you. You know what to expect. You know what to measure. You have 90 days of structure instead of guessing.
            </p>
            <p className={styles.bodyText}>
              And the brain health guide exists because the depression research on creatine is real, is significant, and almost nobody outside of a research database knows it exists.
            </p>
            <p className={styles.bodyText}>Now you do.</p>
          </div>
        </div>
      </section>

      {/* Formats */}
      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <h2 className={styles.sectionH2}>Formats and compatibility</h2>
          <div className={styles.formatGrid}>
            <div className={styles.formatCard}>
              <p className={styles.formatLabel}>PDFs</p>
              <p className={styles.formatDetail}>Fillable in Adobe Acrobat, Preview (Mac), GoodNotes, Notability, or any PDF viewer. Also printable.</p>
            </div>
            <div className={styles.formatCard}>
              <p className={styles.formatLabel}>Google Sheets</p>
              <p className={styles.formatDetail}>Open in Google Drive (free) or Microsoft Excel.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Brand picks comparison table */}
      <section className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionH2}>Brand picks</h2>
          <p className={styles.bodyText}>
            Look for NSF International, U.S. Pharmacopeia (USP), Informed Sport, or Informed Choice certification on the label. These five brands meet the label-reading checklist in the science guide.
          </p>
          <p className={styles.affiliateDisclosure}>
            Some links on this page are affiliate links. If you purchase through them, Hunter's Holistic Health may earn a small commission at no additional cost to you. I only link to products that meet the label-reading checklist above. As an Amazon Associate I earn from qualifying purchases. Dr. Shallanda Hunter, PharmD, CFNMP.
          </p>
          <div className={styles.tableWrap}>
            <table className={styles.compTable}>
              <thead>
                <tr>
                  <th>Brand</th>
                  <th>Notes</th>
                  <th>Link</th>
                </tr>
              </thead>
              <tbody>
                {BRAND_PICKS.map((pick) => (
                  <tr key={pick.name}>
                    <td style={{ fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap' }}>{pick.name}</td>
                    <td>{pick.notes}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <a href={pick.url} target="_blank" rel="noopener sponsored">View on Amazon</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Blog callout */}
      <section className={styles.section}>
        <div className={styles.container}>
          <p className={styles.bodyText} style={{ borderLeft: '3px solid var(--teal)', paddingLeft: '1rem' }}>
            Want the full science breakdown before you buy? Read:{' '}
            <Link to="/blog/creatine-not-what-you-think" style={{ color: 'var(--teal)', fontWeight: 600 }}>
              Creatine: Not What You Think It Is
            </Link>
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <h2 className={styles.sectionH2}>Common questions</h2>
          <div className={styles.faqList}>
            {FAQS.map((faq) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* FDA Disclaimer */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.disclaimer}>
            <p><strong>Disclaimer</strong></p>
            <p>These statements have not been evaluated by the FDA. This product is not intended to diagnose, treat, cure, or prevent any disease. Consult your physician before starting any new supplement.</p>
            <p>For educational purposes only. Not medical advice. I am a PharmD acting as a functional medicine educator, not your prescribing physician or clinical pharmacist. Always consult your doctor before changing your health routine.</p>
            <p>The creatine supplementation protocols, dosage trackers, and related resources provided are for general informational purposes only and are NOT medical advice. These materials are not intended to diagnose, treat, cure, or replace guidance from a qualified healthcare professional. Individual needs vary based on factors such as age, weight, activity level, and health conditions.</p>
            <p>Use of this material is at your own discretion and risk. Dr. Shallanda Hunter and Hunter's Holistic Health LLC are not liable for any outcomes from the use or misuse of this information.</p>
            <p>By using or purchasing this resource, you acknowledge and accept these terms.</p>
            <p><strong>Evidence Accuracy Statement.</strong> All clinical claims in this template have been reviewed against peer-reviewed literature as of 2025 to 2026. Claims are graded VERIFIED, PRELIMINARY, or PRECLINICAL. Where evidence is limited or still emerging, that is clearly stated. No claim in this template has been overstated.</p>
            <p><strong>Prepared by:</strong> Dr. Shallanda Hunter, PharmD, MBA, CFNMP · Hunter's Holistic Health LLC · huntersholistichealth.com · info@huntersholistichealth.com</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <p className={styles.footerName}>Dr. Shallanda Hunter, PharmD, MBA, RPh, CFNMP</p>
          <p className={styles.footerRole}>Functional Medicine Educator | Founder, Hunter's Holistic Health</p>
          <a href="https://huntersholistichealth.com" className={styles.footerLink}>huntersholistichealth.com</a>
          <a href="mailto:info@huntersholistichealth.com" className={styles.footerLink}>info@huntersholistichealth.com</a>
          <p className={styles.footerAffiliate}>
            Affiliate disclosure: Dr. Hunter may receive compensation from supplement purchases made through partner links on this site. All recommendations are based on evidence and clinical judgment, not affiliate status.
          </p>
          <p className={styles.footerCopy}>Page copy by Hunter's Holistic Health. All rights reserved. 2026.</p>
        </div>
      </footer>
    </div>
  )
}
