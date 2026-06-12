import { BookOpen, ExternalLink } from 'lucide-react'
import styles from './Client.module.css'

const ROOTS = [
  {
    letter: 'R',
    title: 'Remove',
    color: '#e05c5c',
    description: 'Identify and eliminate root causes: inflammatory foods, environmental toxins, chronic stressors, and disruptive lifestyle patterns that undermine your health.',
    items: ['Processed seed oils', 'Ultra-processed foods', 'Refined sugars', 'Chronic sleep deprivation', 'Unmanaged stress'],
  },
  {
    letter: 'O',
    title: 'Optimize',
    color: '#c8a74b',
    description: 'Optimize your body\'s core systems (nutrition, sleep architecture, movement, and circadian rhythm) to restore natural balance.',
    items: ['Whole food nutrition', '7 to 9 hours quality sleep', 'Daily movement (8,000+ steps)', 'Morning sunlight exposure', 'Consistent meal timing'],
  },
  {
    letter: 'O',
    title: 'Observe',
    color: '#0b9e8e',
    description: 'Track and observe your body\'s signals. Your symptoms are data. Consistent logging reveals patterns that guide your educational journey.',
    items: ['Daily BP readings', 'Energy level tracking', 'Symptom journaling', 'Food-mood connections', 'Lab marker trends'],
  },
  {
    letter: 'T',
    title: 'Transform',
    color: '#9b59b6',
    description: 'Implement targeted, evidence-informed lifestyle interventions that create lasting transformation, not temporary fixes.',
    items: ['Targeted supplementation', 'Stress resilience practices', 'Gut microbiome support', 'Hormonal balance strategies', 'Community accountability'],
  },
  {
    letter: 'S',
    title: 'Sustain',
    color: '#4be08a',
    description: 'Build systems and habits that make your new health behaviors automatic and sustainable for life, not just for the program duration.',
    items: ['Habit stacking', 'Environmental design', 'Social accountability', 'Progress celebration', 'Ongoing education'],
  },
]

const DISCLAIMER = 'This protocol content is provided for educational purposes only. It does not constitute medical advice, diagnosis, or treatment. Dr. Shallanda Hunter, PharmD operates as a Functional Medicine Educator. Individual results vary. Always consult your licensed healthcare provider before making changes to your health regimen, medications, or supplement routine.'

export default function ProtocolPage() {
  return (
    <div className="animate-fade-in">
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTopTitle}>
          <BookOpen size={22} color="#9b59b6" /> My Educational Protocol
        </h1>
        <p className={styles.pageTopDate}>
          The ROOTS Framework™: Your Functional Medicine Education Roadmap
        </p>
      </div>

      {/* ROOTS Framework */}
      <div className={styles.rootsList}>
        {ROOTS.map(({ letter, title, color, description, items }) => (
          /* Accent colors come from each ROOTS step's data, so they stay inline */
          <div key={letter + title} className={styles.rootsCard} style={{ borderLeft: `3px solid ${color}` }}>
            <div className={styles.rootsRow}>
              <div className={styles.rootsIcon} style={{ background: `${color}20`, color }}>
                {letter}
              </div>
              <div className={styles.rootsBody}>
                <h3 className={styles.rootsTitle}>{title}</h3>
                <p className={styles.rootsDesc}>{description}</p>
                <div className={styles.rootsTags}>
                  {items.map(item => (
                    <span key={item} className={styles.rootsTag} style={{ background: `${color}15`, border: `1px solid ${color}30`, color }}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 30-Day Phases */}
      <div className={styles.card}>
        <h3 className={styles.cardTitleSolo}>30-Day Education Program Structure</h3>
        <div className={styles.phaseGrid}>
          {[
            { phase: 'Week 1', title: 'Foundation', desc: 'Baseline assessments, habit audit, and removing the top 3 inflammatory triggers from your environment.', color: '#c8a74b' },
            { phase: 'Week 2', title: 'Optimize', desc: 'Nutrition timing, sleep optimization, and implementing your personalized supplement protocol.', color: '#0b9e8e' },
            { phase: 'Week 3', title: 'Deepen', desc: 'Stress resilience, gut health focus, movement progression, and tracking pattern recognition.', color: '#9b59b6' },
            { phase: 'Week 4', title: 'Sustain', desc: 'Systems building, habit stacking, community integration, and 30-day progress review.', color: '#4be08a' },
          ].map(({ phase, title, desc, color }) => (
            <div key={phase} className={styles.phaseCard} style={{ borderColor: `${color}30` }}>
              <div className={styles.phaseLabel} style={{ color }}>{phase}</div>
              <div className={styles.phaseTitle}>{title}</div>
              <div className={styles.phaseDesc}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Resources */}
      <div className={styles.card}>
        <h3 className={styles.cardTitleSolo}>Educational Resources</h3>
        <div className={styles.resourceList}>
          {[
            { label: 'Schedule a Session (Doxy.me)', url: 'https://doxy.me', desc: 'HIPAA-compliant video education sessions' },
            { label: 'Supplement Dispensary (Fullscript)', url: 'https://fullscript.com', desc: 'Practitioner-grade supplements at a discount' },
            { label: 'Dr. Hunter\'s Main Website', url: 'https://www.drshallandahunter.com', desc: 'Additional educational content and resources' },
          ].map(({ label, url, desc }) => (
            <a key={url} href={url} target="_blank" rel="noopener noreferrer" className={styles.resourceLink}>
              <div className={styles.resourceBody}>
                <div className={styles.resourceLabel}>{label}</div>
                <div className={styles.resourceDesc}>{desc}</div>
              </div>
              <ExternalLink size={16} color="var(--text-secondary)" />
            </a>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className={styles.disclaimerBox}>
        <p className={styles.disclaimerText}>
          <strong>Important Notice:</strong> {DISCLAIMER}
        </p>
      </div>
    </div>
  )
}
