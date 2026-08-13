import { Play } from 'lucide-react'
import styles from './Workout.module.css'

interface Props {
  url: string | null
  channel: string | null
  /** 'inline' is the small link on a list row. 'block' is the one in the modal. */
  variant?: 'inline' | 'block'
}

/**
 * A demonstration video for one exercise.
 *
 * The channel name is always shown. These are other people's videos, and a link
 * sitting inside Dr. Hunter's app without attribution reads as though she made
 * it. Renders nothing when there is no video, so an exercise somebody added
 * themselves simply has no link rather than a dead button.
 */
export default function ExerciseVideoLink({ url, channel, variant = 'inline' }: Props) {
  if (!url) return null

  if (variant === 'block') {
    return (
      <div className={styles.videoBlock}>
        <a className={styles.videoLink} href={url} target="_blank" rel="noopener noreferrer">
          <Play size={14} /> Watch how to do it
        </a>
        <p className={styles.videoNote}>
          {channel ? `Video by ${channel}. ` : ''}
          Not filmed by Dr. Hunter. Watch the movement, then use the weight that is right for you.
          Stop if anything hurts.
        </p>
      </div>
    )
  }

  return (
    <a
      className={styles.videoInline}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={e => e.stopPropagation()}
    >
      <Play size={12} /> Watch
    </a>
  )
}
