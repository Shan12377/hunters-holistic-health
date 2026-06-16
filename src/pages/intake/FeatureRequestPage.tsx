import { useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './Intake.module.css'
import shared from '../../styles/shared.module.css'

const CATEGORIES = ['Tracking', 'Education', 'Community', 'Accountability', 'Other']

type FormState = {
  firstName: string
  email: string
  anonymous: boolean
  featureDescription: string
  category: string
  importance: number
}

const initial: FormState = {
  firstName: '', email: '', anonymous: false, featureDescription: '', category: '', importance: 0,
}

type Status = 'idle' | 'submitting' | 'success' | 'error'

interface FeatureRequestPageProps {
  embedded?: boolean
  onSuccess?: () => void
}

export default function FeatureRequestPage({ embedded = false, onSuccess }: FeatureRequestPageProps) {
  const [form, setForm] = useState<FormState>(initial)
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.featureDescription.trim()) { setErrorMsg('Please describe the feature you would like to see.'); return }
    if (!webhookUrl) { setErrorMsg('Webhook URL is not configured. Please set VITE_N8N_WEBHOOK_URL in your .env file.'); return }
    setStatus('submitting')
    setErrorMsg('')
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Webhook-Secret': import.meta.env.VITE_N8N_WEBHOOK_SECRET || '' },
        body: JSON.stringify({
          submissionType: 'feature_request',
          firstName: form.anonymous ? 'Anonymous' : (form.firstName || 'Anonymous'),
          email: form.anonymous ? null : (form.email || null),
          featureDescription: form.featureDescription,
          category: form.category || 'Other',
          importance: form.importance || null,
        }),
      })
      if (!res.ok) throw new Error('Network response was not ok')
      setStatus('success')
      if (onSuccess) onSuccess()
    } catch {
      setStatus('error')
      setErrorMsg('Something went wrong. Please try again or email info@huntersholistichealth.com.')
    }
  }

  if (status === 'success' && !embedded) {
    return (
      <div className={styles.successPage}>
        <div className={styles.successCard}>
          <div className={styles.successIconTeal}>✓</div>
          <h1 className={styles.successTitle}>Thank you for the feedback!</h1>
          <p className={styles.successText}>
            Your feature request has been received. Every submission is reviewed and helps shape the direction of the app.
          </p>
          <Link to="/" className={shared.btnPrimary}>
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  if (status === 'success' && embedded) {
    return (
      <div className={styles.embeddedSuccess}>
        <div className={styles.embeddedSuccessIcon}>✓</div>
        <p className={styles.embeddedSuccessText}>Feature request submitted. Thank you!</p>
      </div>
    )
  }

  const content = (
    <form onSubmit={handleSubmit} className={styles.form}>
      {/* Anonymous toggle */}
      <label className={styles.checkboxInline}>
        <input type="checkbox" checked={form.anonymous} onChange={e => setForm(f => ({ ...f, anonymous: e.target.checked }))} />
        <span className={styles.checkboxInlineText}>Submit anonymously</span>
      </label>

      {!form.anonymous && (
        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>First Name</label>
            <input className={styles.input} value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} placeholder="First name" />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Email <span className={styles.labelHint}>(optional)</span></label>
            <input className={styles.input} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@example.com" />
          </div>
        </div>
      )}

      <div className={styles.field}>
        <label className={styles.label}>What feature would you like to see? *</label>
        <textarea className={styles.textarea} required value={form.featureDescription}
          onChange={e => setForm(f => ({ ...f, featureDescription: e.target.value }))}
          placeholder="Describe the feature as clearly as you can..." />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Category</label>
        <div className={styles.pillGroup}>
          {CATEGORIES.map(c => (
            <button key={c} type="button"
              onClick={() => setForm(f => ({ ...f, category: c }))}
              className={`${styles.pill} ${form.category === c ? styles.pillActive : ''}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>How important is this to you?</label>
        <div className={styles.ratingRow}>
          {[1, 2, 3, 4, 5].map(n => (
            <button key={n} type="button"
              onClick={() => setForm(f => ({ ...f, importance: n }))}
              className={`${styles.ratingBtn} ${form.importance === n ? styles.ratingBtnActive : ''}`}>
              {n}
            </button>
          ))}
        </div>
        <div className={styles.ratingScale}>
          <span className={styles.ratingScaleText}>Nice to have</span>
          <span className={styles.ratingScaleText}>Must have</span>
        </div>
      </div>

      {errorMsg && (
        <div className={styles.errorMsg}>
          {errorMsg}
        </div>
      )}

      <button type="submit" disabled={status === 'submitting'} className={styles.submitBtn}>
        {status === 'submitting' ? 'Submitting...' : 'Submit Feature Request'}
      </button>
    </form>
  )

  if (embedded) {
    return (
      <div>
        <h2 className={styles.embeddedTitle}>Request a Feature</h2>
        <p className={styles.embeddedSubtitle}>
          What would make this app more useful for you? Every submission is reviewed.
        </p>
        {content}
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
            Product Feedback
          </div>
          <h1 className={styles.title}>Request a Feature</h1>
          <p className={styles.subtitle}>
            What would make this app more useful for your wellness journey? Every submission is reviewed and helps shape what gets built next.
          </p>
        </div>
        {content}
      </div>
    </div>
  )
}
