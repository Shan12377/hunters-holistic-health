import { useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './Intake.module.css'
import shared from '../../styles/shared.module.css'

type Status = 'idle' | 'submitting' | 'success' | 'error'

export default function ContactPage() {
  const [name,    setName]    = useState('')
  const [email,   setEmail]   = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [consent, setConsent] = useState(false)
  const [status,  setStatus]  = useState<Status>('idle')
  const [errMsg,  setErrMsg]  = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!consent) { setErrMsg('Please check the consent box to continue.'); return }
    const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL
    if (!webhookUrl) { setErrMsg('Webhook URL is not configured.'); return }
    setStatus('submitting')
    setErrMsg('')
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Webhook-Secret': import.meta.env.VITE_N8N_WEBHOOK_SECRET || '' },
        body: JSON.stringify({ submissionType: 'support', name, email, subject, description: message, consent: true }),
      })
      if (!res.ok) throw new Error('Network error')
      setStatus('success')
    } catch {
      setStatus('error')
      setErrMsg('Something went wrong. Please try again or email info@huntersholistichealth.com.')
    }
  }

  if (status === 'success') {
    return (
      <div className={styles.successPage}>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>✓</div>
          <h1 className={styles.successTitle}>Message received</h1>
          <p className={styles.successText}>Thank you for reaching out. You will hear back at the email you provided.</p>
          <Link to="/" className={shared.btnPrimary}>Back to Home</Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <Link to="/" className={styles.topbarLogo}>HUNTER'S HOLISTIC HEALTH</Link>
        <Link to="/login" className={styles.topbarLink}>Sign in</Link>
      </div>

      <div className={styles.wrap}>
        <div className={styles.header}>
          <div className={styles.kicker}>Contact</div>
          <h1 className={styles.title}>Get in touch</h1>
          <p className={styles.subtitle}>Questions about the app, the bundle, or anything else. We will get back to you by email.</p>
        </div>

        <div className={shared.alertGold}>
          Do not include health information, medication names, or lab results in this form. For clinical inquiries use the{' '}
          <Link to="/clinical-inquiry" className={styles.consentLink}>Clinical Inquiry form</Link> instead.
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Name *</label>
            <input className={styles.input} required value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Email Address *</label>
            <input className={styles.input} type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Subject *</label>
            <input className={styles.input} required value={subject} onChange={e => setSubject(e.target.value)} placeholder="What is this about?" />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Message *</label>
            <textarea className={styles.textarea} required value={message} onChange={e => setMessage(e.target.value)} placeholder="Your message..." />
          </div>

          <div className={styles.consentBox}>
            <label className={styles.consentRow}>
              <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} />
              <span className={styles.consentText}>
                I agree to be contacted by Hunter's Holistic Health. I have read and agree to the{' '}
                <Link to="/terms" target="_blank" className={styles.consentLink}>Terms of Service</Link> and{' '}
                <Link to="/privacy" target="_blank" className={styles.consentLink}>Privacy Policy</Link>.
              </span>
            </label>
          </div>

          {errMsg && <div className={styles.errorMsg}>{errMsg}</div>}

          <button type="submit" disabled={status === 'submitting'} className={styles.submitBtn}>
            {status === 'submitting' ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  )
}
