import { useEffect, useRef } from 'react'
import styles from './NewsletterEmbed.module.css'

export default function NewsletterEmbed() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const script = document.createElement('script')
    script.src = 'https://subscribe-forms.beehiiv.com/v3/loader.js'
    script.async = true
    script.setAttribute('data-beehiiv-form', '0756866f-5af9-4d06-88b6-f2d13532faf4')
    ref.current.appendChild(script)
    return () => { script.remove() }
  }, [])

  return (
    <div className={styles.wrap}>
      <p className={styles.label}>Get The ROOTS Report in your inbox every week.</p>
      <div ref={ref} />
    </div>
  )
}
