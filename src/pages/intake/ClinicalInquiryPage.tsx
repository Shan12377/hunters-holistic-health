import { useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './Intake.module.css'
import shared from '../../styles/shared.module.css'

const SERVICE_INTERESTS = [
  'Lab Review Discussion',
  'Advanced Wellness Support',
  'Personalized Protocol',
  'Functional Medicine Education',
  'Other',
]

const CONTACT_METHODS = ['Email', 'Phone Call', 'Video Session']

type FormState = {
  firstName: string
  lastName: string
  email: string
  phone: string
  serviceInterest: string
  preferredContact: string
  briefDescription: string
  consent: boolean
}

const initial: FormState = {
  firstName: '', lastName: '', email: '', phone: '',
  serviceInterest: '', preferredContact: '', briefDescription: '', consent: false,
}

type Status = 'idle' | 'submitting' | 'success' | 'error'

export default function ClinicalInquiryPage() {
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
          submissionType: 'clinical_inquiry',
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          serviceInterest: form.serviceInterest,
          preferredContact: form.preferredContact,
          briefDescription: form.briefDescription,
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
          <h1 className={styles.successTitle}>Inquiry received</h1>
          <p className={styles.successText}>
            Your inquiry has been received and will be reviewed manually. If it is a good fit for advanced support, you will receive secure next steps via your preferred contact method.
          </p>
          <p className={styles.successNote}>
            Any sensitive records, lab documents, or detailed health information will be handled through a separate secure process. You will receive instructions for that after your inquiry is reviewed.
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
        {/* Top banner - HIPAA gateway notice */}
        <div className={styles.noticeTeal}>
          <div className={styles.noticeTealLabel}>
            Important Notice
          </div>
          <p className={styles.noticeTealText}>
            This form does not collect or transmit medical records, lab results, diagnoses, or private health information. After your inquiry is reviewed, you will receive secure next steps via your covered Google Workspace email. Sensitive records and documents are handled through a separate secure process, not through this form.
          </p>
        </div>

        <div className={styles.header}>
          <div className={styles.kicker}>
            Clinical Interest
          </div>
          <h1 className={styles.title}>Advanced Support Inquiry</h1>
          <p className={styles.subtitle}>
            Interested in lab review discussions, personalized protocols, or advanced wellness support? Submit this high-level inquiry and you will receive secure next steps after review.
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
            <label className={styles.label}>Phone Number *</label>
            <input className={styles.input} type="tel" required value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="555-000-0000" />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>What type of support are you interested in? *</label>
            <div className={styles.pillGroup}>
              {SERVICE_INTERESTS.map(s => (
                <button key={s} type="button"
                  onClick={() => setForm(f => ({ ...f, serviceInterest: s }))}
                  className={`${styles.pill} ${form.serviceInterest === s ? styles.pillActive : ''}`}>
                  {s}
                </button>
              ))}
            </div>
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

          <div className={styles.field}>
            <label className={styles.label}>Briefly describe what kind of support you are looking for *</label>
            {/* PHI warning directly above the text box */}
            <div className={styles.noticeRed}>
              Do not include medical records, lab values, diagnoses, medication names, or private health information in this field. Describe your interest in general terms only.
            </div>
            <textarea className={styles.textarea} required value={form.briefDescription}
              onChange={e => setForm(f => ({ ...f, briefDescription: e.target.value }))}
              placeholder="Example: I am interested in learning more about functional lab review and getting a personalized wellness protocol..." />
          </div>

          <div className={styles.consentBox}>
            <label className={styles.consentRow}>
              <input type="checkbox" checked={form.consent} onChange={e => setForm(f => ({ ...f, consent: e.target.checked }))} />
              <span className={styles.consentText}>
                I understand this form is a high-level interest inquiry only and does not collect medical records or create a clinical relationship. I agree to be contacted by Hunter's Holistic Health regarding next steps. I have read and agree to the{' '}
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
            {status === 'submitting' ? 'Submitting...' : 'Submit Inquiry'}
          </button>

          <p className={styles.legalNote}>
            This platform is an educational service. Submitting this form does not create a patient-provider relationship or guarantee services.
          </p>
        </form>
      </div>
    </div>
  )
}
