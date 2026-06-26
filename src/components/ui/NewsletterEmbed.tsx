import styles from './NewsletterEmbed.module.css'

const BEEHIIV_FORM_URL = 'https://embeds.beehiiv.com/0756866f-5af9-4d06-88b6-f2d13532faf4'

export default function NewsletterEmbed() {
  return (
    <div className={styles.wrap}>
      <p className={styles.label}>Get The ROOTS Report in your inbox every week.</p>
      <a
        href={BEEHIIV_FORM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.button}
      >
        Subscribe Free
      </a>
    </div>
  )
}
