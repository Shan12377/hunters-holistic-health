import styles from './Legal.module.css'

const LAST_UPDATED = 'June 25, 2026'

const sections = [
  {
    title: '1. Information We Collect',
    content: `We practice data minimization: we collect only what is necessary to provide the educational program.

Account Information: First name, last name, age (not date of birth), and optional display handle. We do not collect full dates of birth, Social Security numbers, insurance information, or home addresses.

Self-Reported Health Metrics: Blood pressure readings, daily step counts, water intake, energy levels, meal logs, and supplement logs that you voluntarily enter into the Platform.

Usage Data: Standard server logs including IP address, browser type, and pages visited, collected automatically.`,
  },
  {
    title: '2. How We Use Your Information',
    content: `We use your information solely to: (1) provide and improve the educational platform, (2) display your progress data to you and your Educator, (3) generate educational progress reports, and (4) communicate with you about the program.

We do not sell your personal information to third parties. We do not use your health metrics for advertising purposes.`,
  },
  {
    title: '3. Data Sharing',
    content: `Your Educator (Dr. Shallanda Hunter, CFNMP, PharmD) can view your self-reported health metrics for the purpose of providing educational guidance. Your full name is visible to your Educator. In the community feed, only your first name and last initial are displayed to other participants.

The following third-party providers receive your data only to the extent necessary to operate the Platform:

Supabase: database and authentication; SOC 2 Type II certified; stores account data and health metrics.

Vercel: hosting; receives IP address and usage data.

Anthropic: AI Meal Guard and recipe features; receives food items you submit, not linked to your identity.

Stripe: payment processing; receives billing information. We do not store your card number.

Fullscript: supplement dispensary; receives your email when you click through. We earn a commission on purchases.

TidyCal: appointment scheduling; receives your name, email, and appointment details.

Doxy.me: video sessions; processes audio and video during live educational sessions.

We do not authorize any of these providers to use your data for their own marketing or purposes beyond operating the Platform.`,
  },
  {
    title: '4. Data Security',
    content: `All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We implement Row Level Security at the database level, meaning each user can only access their own data. Access to the educator dashboard requires authentication and is restricted to authorized educators only.`,
  },
  {
    title: '5. Your Rights',
    content: `You have the right to: (1) access all data we hold about you, (2) correct inaccurate data, (3) request deletion of all your data ("right to be forgotten"), and (4) export your data in a portable format.

To exercise any of these rights, email us at: info@huntersholistichealth.com. We will respond within 30 days.`,
  },
  {
    title: '6. HIPAA Notice',
    content: `Hunter's Holistic Health LLC is a direct-pay educational platform, not a covered healthcare entity under HIPAA. Dr. Hunter operates as a Functional Medicine Educator, not as a covered healthcare provider. The Platform does not create, receive, maintain, or transmit Protected Health Information (PHI) as defined under HIPAA.

We implement strong data security measures including TLS 1.3 encryption in transit, AES-256 encryption at rest, and role-based access controls as a matter of voluntary business practice. These measures do not make this Platform HIPAA-compliant and do not create a HIPAA-covered provider relationship.`,
  },
  {
    title: '7. Children\'s Privacy',
    content: `This Platform is intended for adults 18 years of age and older. We do not knowingly collect information from anyone under 18. If you believe we have inadvertently collected information from a minor, please contact us immediately.`,
  },
  {
    title: '8. Cookies and Tracking Technologies',
    content: `We use the following types of cookies:

Strictly Necessary Cookies: Required for login, sessions, and basic Platform function. Cannot be disabled.

Analytics Cookies: We collect anonymized data about how users navigate the Platform to improve the experience. We do not use advertising cookies or track you across other websites.

You can disable non-essential cookies in your browser settings. Doing so may affect certain Platform features. We do not respond to browser "Do Not Track" signals at this time.`,
  },
  {
    title: '9. Health Data Special Protections',
    content: `The health metrics you enter (blood pressure, supplement logs, energy levels, meal entries) are treated as sensitive personal information. We will not share this data with advertisers, data brokers, employers, or insurers. We will not use it to train AI models. Period. We will not disclose it to government agencies unless required by law.`,
  },
  {
    title: '10. Your State Privacy Rights',
    content: `Residents of California (CCPA/CPRA) and Wyoming have the right to know what personal data we collect, the right to request deletion, the right to correct inaccurate data, and the right to opt out of the sale of personal data. We do not sell personal data.

To exercise any of these rights, email info@huntersholistichealth.com with subject line "Privacy Rights Request" and your state of residence. We will respond within 45 days.`,
  },
  {
    title: '11. Changes to This Policy',
    content: `When we make material changes to this Privacy Policy, we will notify you by email at least 14 days before changes take effect. The "Last Updated" date at the top reflects the most recent revision. Your continued use of the Platform after changes take effect constitutes acceptance of the revised Policy.`,
  },
  {
    title: '12. Contact',
    content: `Privacy questions or requests: info@huntersholistichealth.com

Hunter's Holistic Health LLC
30 N Gould St, Ste R
Sheridan, WY 82801`,
  },
]

export default function PrivacyPage() {
  return (
    <div className={styles.page}>
      <div className={styles.wrap}>
        <div className={styles.header}>
          <div className={styles.kicker}>Hunter's Holistic Health</div>
          <h1 className={styles.title}>Privacy Policy</h1>
          <div className={styles.meta}>
            <span>Last updated: {LAST_UPDATED}</span>
          </div>
        </div>

        <div className={styles.body}>
          {sections.map(({ title, content }) => (
            <div key={title} className={styles.section}>
              <h2 className={styles.sectionTitle}>{title}</h2>
              {content.split('\n\n').map((para, i) => (
                <p key={i} className={styles.sectionText}>{para}</p>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
