import { useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './Intake.module.css'
import shared from '../../styles/shared.module.css'

const CATEGORIES = [
  'App Access or Login Help',
  'Technical Issue',
  'Billing or Membership',
  'Program or Educational Content Question',
  'Feature Suggestion',
  'General Feedback',
  'Other',
]

const CONTACT_METHODS = ['Email', 'Phone Call', 'Video Session']

type FormState = {
  firstName: string
  lastName: string
  email: string
  category: string
  description: string
  preferredContact: string
  consent: boolean
}

const initial: FormState = {
  firstName: '', lastName: '', email: '', category: '', description: '', preferredContact: '', consent: false,
}

type Status = 'idle' | 'submitting' | 'success' | 'error'

export default function SupportPage() {
  const [form, setForm] = useState<FormState>(initial)
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.consent) { setErrorMsg('Please check the consent box to continue.'); return }
    if (!webhookUrl) { setErrorMsg('Webhook URL is not configured. Please set VITE_N8N_WEBHOOK_URL in your .env file.'); return }
    setStatus('submitting')
    setErrorMsg('')
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Webhook-Secret': import.meta.env.VITE_N8N_WEBHOOK_SECRET || '' },
        body: JSON.stringify({
          submissionType: 'support',
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          category: form.category,
          description: form.description,
          preferredContact: form.preferredContact,
          consent: true,
        }),
      })
      if (!res.ok) throw new Error('Network response was not ok')
      setStatus('success')
    } catch {
      setStatus('error')
      setErrorMsg('Something went wrong. Please try again or email info@huntersholistichealth.com.')
    }
  }

  if (status === 'success') {
    return (
      <div className={styles.successPage}>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>✓</div>
          <h1 className={styles.successTitle}>Request received</h1>
          <p className={styles.successText}>
            Your support request has been received and will be reviewed. You will hear back via your preferred contact method.
          </p>
          <Link to="/" className={shared.btnPrimary}>
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <Link to="/" className={styles.topbarLogo}>
          HUNTER'S HOLISTIC HEALTH
        </Link>
        <Link to="/login" className={styles.topbarLink}>Sign in</Link>
      </div>

      <div className={styles.wrap}>
        <div className={styles.header}>
          <div className={styles.kicker}>
            Support and Feedback
          </div>
          <h1 className={styles.title}>How can we help?</h1>
          <p className={styles.subtitle}>
            Use this form for app access help, technical issues, billing questions, program questions, or feature suggestions.
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>First Name *</label>
              <input className={styles.input} required value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} placeholder="First name" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Last Name *</label>
              <input className={styles.input} required value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} placeholder="Last name" />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Email Address *</label>
            <input className={styles.input} type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@example.com" />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>What do you need help with? *</label>
            <select className={styles.input} required value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              <option value="">Select a category...</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Brief description *</label>
            {/* PHI disclaimer directly above the text box */}
            <div className={shared.alertGold}>
              Please do not include medical or private health information in this form. For clinical or health-related inquiries, use the{' '}
              <Link to="/clinical-inquiry" className={styles.consentLink}>Clinical Inquiry form</Link>.
            </div>
            <textarea className={styles.textarea} required value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Describe what you need help with..." />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Preferred contact method *</label>
            <div className={styles.pillGroup}>
              {CONTACT_METHODS.map(m => (
                <button key={m} type="button"
                  onClick={() => setForm(f => ({ ...f, preferredContact: m }))}
                  className={`${styles.pill} ${form.preferredContact === m ? styles.pillActive : ''}`}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.consentBox}>
            <label className={styles.consentRow}>
              <input type="checkbox" checked={form.consent} onChange={e => setForm(f => ({ ...f, consent: e.target.checked }))} />
              <span className={styles.consentText}>
                I agree to be contacted by Hunter's Holistic Health regarding my request. I have read and agree to the{' '}
                <Link to="/terms" target="_blank" className={styles.consentLink}>Terms of Service</Link> and{' '}
                <Link to="/privacy" target="_blank" className={styles.consentLink}>Privacy Policy</Link>.
              </span>
            </label>
          </div>

          {errorMsg && (
            <div className={styles.errorMsg}>
              {errorMsg}
            </div>
          )}

          <button type="submit" disabled={status === 'submitting'} className={styles.submitBtn}>
            {status === 'submitting' ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>
    </div>
  )
}
