import { Link } from 'react-router-dom'
import { CheckCircle, XCircle } from 'lucide-react'
import styles from './legal/Legal.module.css'

const COMPARISON_ROWS = [
  {
    dataPoint: 'Date of birth',
    typical: 'Collected and stored',
    ours: 'Age only. No birthdate stored.',
  },
  {
    dataPoint: 'Home address',
    typical: 'Required at signup or billing',
    ours: 'Never requested.',
  },
  {
    dataPoint: 'Social Security number or insurance details',
    typical: 'Collected for billing or identity verification',
    ours: 'Never requested.',
  },
  {
    dataPoint: 'Ad tracking or selling your data',
    typical: 'Data shared with advertisers or sold to third parties',
    ours: 'We do not sell your data. We do not use it for advertising.',
  },
  {
    dataPoint: 'AI processing of identified health records',
    typical: 'AI may process your full profile linked to your name or account',
    ours: 'The AI Meal Guard feature receives food descriptions only. No name, no account ID, no health history is sent to the AI.',
  },
  {
    dataPoint: 'Account deletion',
    typical: 'Often buried in settings or requires contacting support',
    ours: 'One click in Settings. All data removed within 30 days.',
  },
]

const COLLECTED_DATA = [
  {
    name: 'First name and last name',
    why: 'To identify your account and display your name to your educator. In the community feed, only your first name and last initial are visible to other participants.',
  },
  {
    name: 'Age',
    why: 'Used to contextualize educational content. We collect age as a number, not your date of birth.',
  },
  {
    name: 'Optional display handle',
    why: 'Shown in the community feed in place of your real name, at your choice.',
  },
  {
    name: 'Self-reported habit data',
    why: 'Blood pressure readings, step counts, water intake, energy levels, meal notes, and supplement logs that you voluntarily enter. Visible only to you and your educator.',
  },
  {
    name: 'Usage data',
    why: 'Standard server logs (IP address, browser type, pages visited). Used only to maintain and improve the platform.',
  },
]

const RIGHTS = [
  { title: 'Access', desc: 'Request a copy of all data we hold about you.' },
  { title: 'Correction', desc: 'Ask us to correct any inaccurate information.' },
  { title: 'Deletion', desc: 'Request removal of all your data. We respond within 30 days.' },
  { title: 'Export', desc: 'Receive your data in a portable format.' },
]

export default function PrivacyScorecardPage() {
  return (
    <div className={styles.page}>
      <div className={styles.wrap}>
        <div className={styles.header}>
          <div className={styles.kicker}>Hunter's Holistic Health</div>
          <h1 className={styles.title}>Privacy Scorecard</h1>
          <p className={styles.sectionText}>
            Most privacy policies are written for lawyers. This page is written for you. Here is exactly what we collect, what we do not collect, and why.
          </p>
        </div>

        <div className={styles.body}>

          {/* Comparison table */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>How We Compare</h2>
            <p className={styles.sectionText}>
              Common data collection practices in health and wellness apps, compared to what we actually do.
            </p>
            <div className={styles.scorecardWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Data Point</th>
                    <th>Typical Health Apps</th>
                    <th>Hunter's Holistic Health</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map(row => (
                    <tr key={row.dataPoint}>
                      <td><strong>{row.dataPoint}</strong></td>
                      <td>
                        <span className={styles.tdCross}>
                          <XCircle size={15} />
                          {row.typical}
                        </span>
                      </td>
                      <td>
                        <span className={styles.tdCheck}>
                          <CheckCircle size={15} />
                          {row.ours}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* What we collect */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>What We Collect and Why</h2>
            <p className={styles.sectionText}>Every field we store has a specific, stated reason.</p>
            <div className={styles.collectGrid}>
              {COLLECTED_DATA.map(item => (
                <div key={item.name} className={styles.collectItem}>
                  <span className={styles.collectItemName}>{item.name}</span>
                  <span className={styles.collectItemWhy}>{item.why}</span>
                </div>
              ))}
            </div>
          </div>

          {/* What never enters this app */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>What Never Enters This App</h2>
            <p className={styles.sectionText}>
              This platform is an educational tool. It does not process Protected Health Information (PHI) as defined by HIPAA. The following types of information are never stored here:
            </p>
            <ul className={styles.list}>
              <li>Lab results or blood work</li>
              <li>Clinical diagnoses or assessments</li>
              <li>Medical history or prescription records</li>
              <li>Insurance, billing, or payment details</li>
            </ul>
            <div className={styles.highlightBox}>
              <strong>Clinical support uses a separate process.</strong> When clients work with Dr. Hunter on clinical matters, that workflow uses a dedicated HIPAA-aware environment outside this app. This app is the educational layer only.
            </div>
          </div>

          {/* Your rights */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Your Rights</h2>
            <p className={styles.sectionText}>
              You have these rights regardless of where you live. Email <a href="mailto:hello@huntersholistichealth.com">hello@huntersholistichealth.com</a> and we will respond within 30 days.
            </p>
            <div className={styles.rightsGrid}>
              {RIGHTS.map(r => (
                <div key={r.title} className={styles.rightCard}>
                  <div className={styles.rightCardTitle}>{r.title}</div>
                  <div className={styles.rightCardText}>{r.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer links */}
          <div className={styles.footer}>
            <div className={styles.footerLinks}>
              <Link to="/privacy" className={styles.footerLink}>Full Privacy Policy</Link>
              <Link to="/terms" className={styles.footerLink}>Terms of Service</Link>
              <Link to="/" className={styles.footerLink}>Back to Home</Link>
            </div>
            <p className={styles.footerCopy}>
              Questions? Email{' '}
              <a href="mailto:hello@huntersholistichealth.com" className={styles.footerLink}>
                hello@huntersholistichealth.com
              </a>
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
