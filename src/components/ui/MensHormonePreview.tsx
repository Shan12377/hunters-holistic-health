import { Link } from 'react-router-dom'
import styles from './MensHormonePreview.module.css'

const TIME_BLOCKS = [
  { time: '6–9 AM', label: 'Peak Testosterone', color: '#1D5FA0', note: 'Highest drive, strength, and focus. Best window for hard training and big decisions.' },
  { time: '9 AM–12 PM', label: 'Cortisol Plateau', color: '#0E6060', note: 'Cortisol supports alertness and problem-solving. Ideal for complex work and meetings.' },
  { time: '12–3 PM', label: 'Transition Zone', color: '#2A6E45', note: 'Both hormones begin their afternoon decline. Lighter activity, meals, and learning work well here.' },
  { time: '3–8 PM', label: 'Second Wind', color: '#8B5F0A', note: 'Body temperature peaks. Coordination and reaction time are at their best. Evening training window.' },
  { time: '8 PM–6 AM', label: 'Recovery Mode', color: '#3E2E8E', note: 'Testosterone rebuilds during deep sleep. Late cortisol spikes from screens or stress block this process.' },
]

export default function MensHormonePreview() {
  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div className={styles.eyebrow}>Men's Hormone Education</div>
        <h3 className={styles.title}>Your 24-Hour Hormone Rhythm</h3>
        <p className={styles.subtitle}>
          Testosterone and cortisol follow a predictable daily pattern. The full tool shows what is happening in your body right now and how to train, eat, and rest with it, not against it.
        </p>
      </div>

      <div className={styles.blocks}>
        {TIME_BLOCKS.map(block => (
          <div key={block.time} className={styles.block} style={{ borderLeftColor: block.color }}>
            <div className={styles.blockTime} style={{ color: block.color }}>{block.time}</div>
            <div className={styles.blockLabel}>{block.label}</div>
            <div className={styles.blockNote}>{block.note}</div>
          </div>
        ))}
      </div>

      <div className={styles.conditions}>
        <div className={styles.condLabel}>Tool covers these focus areas:</div>
        <div className={styles.condList}>
          {['Low Testosterone', 'ED and Sexual Function', 'High Cortisol and Burnout', 'Metabolic Syndrome', 'High Estrogen', 'Sleep Apnea', 'Hair Loss and Prostate', 'Male Fertility'].map(c => (
            <span key={c} className={styles.condTag}>{c}</span>
          ))}
        </div>
      </div>

      <div className={styles.cta}>
        <Link to="/tools/mens-hormone-rhythm" className={styles.ctaBtn}>
          Open Men's Hormone Rhythm Tool
        </Link>
        <p className={styles.ctaNote}>Free. Private. Nothing stored.</p>
      </div>
    </div>
  )
}
