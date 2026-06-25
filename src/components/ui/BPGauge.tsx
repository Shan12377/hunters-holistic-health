import styles from './BPGauge.module.css'

interface Props {
  label: string
  value: number
  color: string
  icon: React.ReactNode
  tip: string
}

export default function BPGauge({ label, value, color, icon, tip }: Props) {
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div className={styles.gauge}>
      <div className={styles.header}>
        <span className={styles.icon} style={{ color }}>{icon}</span>
        <span className={styles.label}>{label}</span>
        <span className={styles.val} style={{ color }}>{Math.round(pct)}%</span>
      </div>
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${pct}%`, background: color }} />
      </div>
      <p className={styles.tip}>{tip}</p>
    </div>
  )
}
