import { Link } from 'react-router-dom'
import { CheckCircle, Lock, Download } from 'lucide-react'
import styles from './ShopPage.module.css'

const STORE_URL = 'https://tidycal.com/drshallandahunter/store'

const BUNDLE_ITEMS = [
  'Quick Start Guide (2 pages): Loading vs. maintenance decision tree, Day 1 checklist, your personal protocol setup',
  'Creatine Science Guide (20+ pages): How it works, athletic performance, cognitive benefits, women vs. men, safety, myths debunked, quality guide, and primary sources cited',
  'Brain Health Bonus Guide (8 pages): The cognitive performance evidence, depression research, who benefits most, tracker guidance, and what the research does not yet show',
  '30-Day Supplement Tracker: Daily dose, water, workout, energy, mood, and notes, plus weekly reflection pages',
  'Workout Performance Log: Baseline benchmarks plus Day 30, 60, and 90 re-tests for 10 key exercises',
  'Hydration and Nutrition Tracker: Daily creatine, water, protein, carbs, fats, and calories with auto-calculated targets',
  'Supplement Stack Cheat Sheet (1 page): Evidence-graded pairings, what works, what to use with caution, what to skip',
  'Google Sheets Workbook: 5 tabs, auto-calculating, progress charts that update as you log',
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

const FORMATS = [
  { label: 'PDFs', detail: 'Fillable in Adobe Acrobat, Preview (Mac), GoodNotes, Notability, or any PDF viewer. Also printable.' },
  { label: 'Google Sheets', detail: 'Open in Google Drive (free) or Microsoft Excel.' },
]

export default function ShopPage() {
  return (
    <div className={styles.page}>
      {/* Nav */}
      <header className={styles.nav}>
        <Link to="/" className={styles.navLogo}>Hunter's Holistic Health</Link>
        <a href={STORE_URL} target="_blank" rel="noopener" className={styles.navCta}>Get the Bundle $47</a>
      </header>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBadge}>
          <Download size={14} /> Digital Bundle
        </div>
        <h1 className={styles.heroH1}>
          Creatine does more than build muscle.<br className={styles.heroBreak} /> Most people have no idea how much more.
        </h1>
        <p className={styles.heroSub}>
          A 90-day creatine system built by a PharmD. Evidence-based. Fully cited. Built for brain health, performance, and everyone the research actually covers.
        </p>
      </section>

      {/* What this is */}
      <section className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionH2}>What This Is</h2>
          <p className={styles.bodyText}>
            The Creatine Stack Bundle is 8 files covering everything from the science (what creatine actually does in your brain and body) to a full 90-day tracking system across PDF and Google Sheets.
          </p>
          <p className={styles.bodyText}>
            Every claim in the science guide is cited against peer-reviewed research. No marketing language. No proprietary blend hype. Just the mechanism, the evidence, and the tools to track your results.
          </p>
        </div>
      </section>

      {/* Who this is for */}
      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <h2 className={styles.sectionH2}>Who This Is For</h2>
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

      {/* Single price + what's included */}
      <section className={styles.section} id="pricing">
        <div className={styles.container}>
          <h2 className={styles.sectionH2}>The Complete Bundle</h2>
          <div className={`${styles.tierCard} ${styles.tierCardFeatured}`} style={{ maxWidth: 560, margin: '0 auto' }}>
            <p className={styles.csnPrice} style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>$47</p>
            <p className={styles.tierTagline}>One price. Instant download. 8 files included. Everything to start, track, and measure your 90-day protocol.</p>
            <ul className={styles.tierList}>
              {BUNDLE_ITEMS.map((item) => (
                <li key={item} className={styles.tierItem}>
                  <CheckCircle size={14} className={styles.tierCheck} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className={styles.csnWrap}>
              <a href={STORE_URL} target="_blank" rel="noopener" className={styles.navCta} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.75rem', fontSize: '1rem', justifyContent: 'center' }}>
                <Download size={16} /> Get Instant Access
              </a>
              <p className={styles.csnNote}>Secure checkout. Files delivered immediately after purchase.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Dr. Hunter built this */}
      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <h2 className={styles.sectionH2}>Why Dr. Hunter Built This</h2>
          <div className={styles.bioBlock}>
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
            <p className={`${styles.bodyText} ${styles.bodyTextBold}`}>
              Now you do.
            </p>
          </div>
        </div>
      </section>

      {/* Formats */}
      <section className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionH2}>Formats and Compatibility</h2>
          <div className={styles.formatGrid}>
            {FORMATS.map(({ label, detail }) => (
              <div key={label} className={styles.formatCard}>
                <div className={styles.formatLabel}>{label}</div>
                <p className={styles.formatDetail}>{detail}</p>
              </div>
            ))}
          </div>
          <div className={styles.purchaseNote}>
            <Lock size={14} />
            <span>This is a digital download. No physical product is shipped. Files are available immediately after purchase. For personal use. Not for resale or redistribution.</span>
          </div>
          <p className={styles.legalDisclaimer}>
            This resource is for educational purposes only and does not constitute medical advice, diagnosis, or treatment. Consult a qualified healthcare provider before starting any supplement protocol.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <p className={styles.footerName}>Dr. Shallanda Hunter, PharmD, MBA, RPh, CFNMP</p>
          <p className={styles.footerRole}>Functional Medicine Educator | Founder, Hunter's Holistic Health</p>
          <Link to="/" className={styles.footerLink}>huntersholistichealth.com</Link>
          <p className={styles.footerAffiliate}>
            Affiliate disclosure: Dr. Hunter may receive compensation from supplement purchases made through partner links on this site. All recommendations are based on evidence and clinical judgment, not affiliate status.
          </p>
          <p className={styles.footerCopy}>Hunter's Holistic Health. All rights reserved. 2026.</p>
        </div>
      </footer>
    </div>
  )
}
