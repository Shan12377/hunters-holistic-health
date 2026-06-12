import { useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './Intake.module.css'
import shared from '../../styles/shared.module.css'

const APP_GOALS = [
  'Build consistent daily habits',
  'Improve energy and focus',
  'Support weight management',
  'Balance hormones naturally',
  'Improve gut health',
  'Manage stress and sleep',
  'Understand my lab results',
  'General wellness education',
  'Other',
]

const FEATURE_OPTIONS = [
  'Daily habit tracking',
  'Blood pressure monitoring',
  'Meal and nutrition guidance',
  'Supplement tracking',
  'Progress charts and reports',
  'Accountability community feed',
  'Educational protocols',
  'Weekly progress grades',
  'Direct educator check-ins',
  'Video session scheduling',
]

type FormState = {
  firstName: string
  lastName: string
  email: string
  phone: string
  accessType: string
  appGoal: string
  featureWishlist: string[]
  topFeature: string
  consent: boolean
}

const initial: FormState = {
  firstName: '', lastName: '', email: '', phone: '',
  accessType: '', appGoal: '', featureWishlist: [], topFeature: '', consent: false,
}

type Status = 'idle' | 'submitting' | 'success' | 'error'

export default function JoinPage() {
  const [form, setForm] = useState<FormState>(initial)
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL

  function toggle(feature: string) {
    setForm(f => ({
      ...f,
      featureWishlist: f.featureWishlist.includes(feature)
        ? f.featureWishlist.filter(x => x !== feature)
        : [...f.featureWishlist, feature],
      topFeature: f.topFeature === feature ? '' : f.topFeature,
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.consent) { setErrorMsg('Please check the consent box to continue.'); return }
    if (!webhookUrl) { setErrorMsg('Webhook URL is not configured. Please set VITE_N8N_WEBHOOK_URL in your .env file.'); return }
    setStatus('submitting')
    setErrorMsg('')
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionType: 'early_access',
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone || null,
          accessType: form.accessType,
          appGoal: form.appGoal,
          featureWishlist: form.featureWishlist.join(', '),
          topFeature: form.topFeature,
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
          <h1 className={styles.successTitle}>You're on the list!</h1>
          <p className={styles.successText}>
            Thank you for joining the Hunter's Holistic Health early access list. You will receive updates as the app develops and when early access opens. Your input helps shape what gets built first.
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
      {/* Header */}
      <div className={styles.topbar}>
        <Link to="/" className={styles.topbarLogo}>
          HUNTER'S HOLISTIC HEALTH
        </Link>
        <Link to="/login" className={styles.topbarLink}>Already have an account? Sign in</Link>
      </div>

      <div className={styles.wrap}>
        <div className={styles.header}>
          <div className={styles.kicker}>
            Early Access
          </div>
          <h1 className={styles.title}>Join Hunter's Holistic Health</h1>
          <p className={styles.subtitle}>
            Be among the first to access the accountability app built for functional wellness education. Your input shapes what gets built first.
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Name */}
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

          {/* Email */}
          <div className={styles.field}>
            <label className={styles.label}>Email Address *</label>
            <input className={styles.input} type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@example.com" />
          </div>

          {/* Phone */}
          <div className={styles.field}>
            <label className={styles.label}>Phone Number <span className={styles.labelHint}>(optional)</span></label>
            <input className={styles.input} type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="555-000-0000" />
          </div>

          {/* Access type */}
          <div className={styles.field}>
            <label className={styles.label}>What would you like? *</label>
            <div className={styles.pillGroup}>
              {['Early Access', 'Launch Updates'].map(opt => (
                <button key={opt} type="button"
                  onClick={() => setForm(f => ({ ...f, accessType: opt }))}
                  className={`${styles.pill} ${form.accessType === opt ? styles.pillActive : ''}`}>
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* App goal */}
          <div className={styles.field}>
            <label className={styles.label}>What are you hoping the app helps you with? *</label>
            <select className={styles.input} required value={form.appGoal} onChange={e => setForm(f => ({ ...f, appGoal: e.target.value }))}>
              <option value="">Select one...</option>
              {APP_GOALS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          {/* Feature wishlist */}
          <div className={styles.field}>
            <label className={styles.label}>Which features matter most to you? <span className={styles.labelHint}>(select all that apply)</span></label>
            <div className={styles.pillGroup}>
              {FEATURE_OPTIONS.map(feat => (
                <button key={feat} type="button"
                  onClick={() => toggle(feat)}
                  className={`${styles.pill} ${form.featureWishlist.includes(feat) ? styles.pillActive : ''}`}>
                  {feat}
                </button>
              ))}
            </div>
          </div>

          {/* Top feature */}
          {form.featureWishlist.length > 0 && (
            <div className={styles.field}>
              <label className={styles.label}>Which one feature is most important to you? *</label>
              <select className={styles.input} required value={form.topFeature} onChange={e => setForm(f => ({ ...f, topFeature: e.target.value }))}>
                <option value="">Select one...</option>
                {form.featureWishlist.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          )}

          {/* Consent */}
          <div className={styles.consentBox}>
            <label className={styles.consentRow}>
              <input type="checkbox" checked={form.consent} onChange={e => setForm(f => ({ ...f, consent: e.target.checked }))} />
              <span className={styles.consentText}>
                I agree to be contacted by Hunter's Holistic Health regarding early access and updates. I understand this is an educational platform and does not provide medical advice. I have read and agree to the{' '}
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
            {status === 'submitting' ? 'Submitting...' : 'Join the Early Access List'}
          </button>
        </form>
      </div>
    </div>
  )
}
