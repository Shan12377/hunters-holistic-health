import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { SAMPLE_WEEK, SAMPLE_WEEK_RATIONALE } from '@/lib/activity'
import styles from './Workout.module.css'

/**
 * A worked example of a week, with the reason each day is what it is.
 * Nobody is asked to follow it. It exists so the routine list is not just names
 * hanging there with no shape around them.
 */
export default function SampleWeek() {
  const [showWhy, setShowWhy] = useState(false)

  return (
    <div className={styles.weekCard}>
      <div className={styles.sectionHead}>
        <div>
          <h2 className={styles.sectionTitle}>A sample week</h2>
          <p className={styles.sectionSub}>
            One way to lay it out. Move the days around to fit your life, the shape is what matters.
          </p>
        </div>
      </div>

      <div className={styles.weekGrid}>
        {SAMPLE_WEEK.map(d => (
          <div key={d.day} className={styles.weekDay}>
            <div className={styles.weekDayHead}>
              <span className={styles.weekEmoji}>{d.emoji}</span>
              <span className={styles.weekDayName}>{d.day}</span>
            </div>
            <span className={styles.weekFocus}>{d.focus}</span>
            <span className={styles.weekTargets}>{d.targets}</span>
            <p className={styles.weekDetail}>{d.detail}</p>
          </div>
        ))}
      </div>

      <button
        className={styles.mathToggle}
        onClick={() => setShowWhy(v => !v)}
        aria-expanded={showWhy}
      >
        Why this shape
        <ChevronDown size={14} className={showWhy ? styles.mathChevOpen : ''} />
      </button>

      {showWhy && (
        <div className={styles.mathPanel}>
          <p className={styles.mathLine}>{SAMPLE_WEEK_RATIONALE}</p>
          <p className={styles.mathSource}>
            Training frequency: Schoenfeld, Ogborn and Krieger, Sports Medicine 2016, found muscle groups trained
            twice a week grew more than once a week at matched volume. Weekly minimums: Physical Activity Guidelines
            for Americans, 2nd edition, which asks for 150 minutes of moderate activity plus muscle strengthening on
            two or more days.
          </p>
          <p className={styles.disclaimer}>
            Educational only, not medical advice. Talk to your own physician before starting any new exercise
            programme, particularly if you have blood pressure, heart or joint concerns.
          </p>
        </div>
      )}
    </div>
  )
}
