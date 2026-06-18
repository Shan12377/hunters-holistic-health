import styles from './Legal.module.css'

const sections = [
  {
    title: '1. Information We Collect',
    content: `We practice data minimization: we collect only what is necessary to provide the educational program.\n\nAccount Information: First name, last name, age (not date of birth), and optional display handle. We do not collect full dates of birth, Social Security numbers, insurance information, or home addresses.\n\nSelf-Reported Health Metrics: Blood pressure readings, daily step counts, water intake, energy levels, meal logs, and supplement logs that you voluntarily enter into the Platform.\n\nUsage Data: Standard server logs including IP address, browser type, and pages visited, collected automatically.`,
  },
  {
    title: '2. How We Use Your Information',
    content: `We use your information solely to: (1) provide and improve the educational platform, (2) display your progress data to you and your Educator, (3) generate educational progress reports, and (4) communicate with you about the program.\n\nWe do not sell your personal information to third parties. We do not use your health metrics for advertising purposes.`,
  },
  {
    title: '3. Data Sharing',
    content: `Your Educator (Dr. Shallanda Hunter, PharmD) can view your self-reported health metrics for the purpose of providing educational guidance. Your full name is visible to your Educator. In the community feed, only your first name and last initial are displayed to other participants.\n\nWe use Supabase (supabase.com) as our database provider. Supabase is SOC 2 Type II certified. We use Vercel (vercel.com) for hosting. We use OpenAI's API for the AI Meal Guard feature; food items you submit are sent to OpenAI for analysis but are not linked to your personal identity.`,
  },
  {
    title: '4. Data Security',
    content: `All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We implement Row Level Security at the database level, meaning each user can only access their own data. Access to the educator dashboard requires authentication and is restricted to authorized educators only.`,
  },
  {
    title: '5. Your Rights',
    content: `You have the right to: (1) access all data we hold about you, (2) correct inaccurate data, (3) request deletion of all your data ("right to be forgotten"), and (4) export your data in a portable format.\n\nTo exercise any of these rights, email us at: info@huntersholistichealth.com. We will respond within 30 days.`,
  },
  {
    title: '6. HIPAA Notice',
    content: `Hunter's Holistic Health is an educational platform. Dr. Hunter operates as a Functional Medicine Educator, not as a covered healthcare provider under HIPAA. The Platform does not create, receive, maintain, or transmit Protected Health Information (PHI) as defined by HIPAA.\n\nHowever, we treat all health-related data with the same care and security standards as PHI, because your privacy matters to us regardless of legal requirements.`,
  },
  {
    title: '7. Children\'s Privacy',
    content: `This Platform is intended for adults 18 years of age and older. We do not knowingly collect information from anyone under 18. If you believe we have inadvertently collected information from a minor, please contact us immediately.`,
  },
  {
    title: '8. Contact',
    content: `Privacy questions or requests: info@huntersholistichealth.com`,
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
            <span>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
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
