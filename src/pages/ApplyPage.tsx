import { useState } from 'react'
import type { FormEvent } from 'react'
import toast from 'react-hot-toast'
import styles from './ApplyPage.module.css'

type Tier = 'intensive' | 'overhaul'

interface FormState {
  tier: Tier
  first_name: string
  last_name: string
  email: string
  phone: string
  health_challenge: string
  previous_attempts: string
  timeline: string
  investment_ready: string
  decision_maker: string
  goals: string
  hear_about: string
}

const TIERS = [
  {
    id: 'intensive' as Tier,
    name: 'VIP Intensive',
    price: '$997/mo',
    limit: 'Limited to 10 seats',
    description: '2x monthly 1:1 sessions, personalized ROOTS walkthrough, 24-hour response from Dr. Hunter.',
  },
  {
    id: 'overhaul' as Tier,
    name: '6-Month VIP Functional Overhaul',
    price: '$4,997',
    limit: 'Only 3 active clients',
    description: 'Direct 1:1 work with Dr. Hunter over 6 months. Full functional lab review, root-cause protocol build, and ongoing accountability.',
  },
]

const INITIAL: FormState = {
  tier: 'intensive',
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  health_challenge: '',
  previous_attempts: '',
  timeline: '',
  investment_ready: '',
  decision_maker: '',
  goals: '',
  hear_about: '',
}

export default function ApplyPage() {
  const [form, setForm]     = useState<FormState>(INITIAL)
  const [saving, setSaving] = useState(false)
  const [done, setDone]     = useState(false)

  function set(field: keyof FormState, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.first_name || !form.email || !form.health_challenge) {
      toast.error('Please fill in all required fields.')
      return
    }
    const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL
    if (!webhookUrl) {
      toast.error('Submission is not configured. Please contact us directly.')
      return
    }
    setSaving(true)
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Secret': import.meta.env.VITE_N8N_WEBHOOK_SECRET || '',
        },
        body: JSON.stringify({
          submissionType: 'vip_application',
          tier: form.tier,
          firstName: form.first_name.trim(),
          lastName: form.last_name.trim() || null,
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim() || null,
          healthChallenge: form.health_challenge.trim(),
          previousAttempts: form.previous_attempts.trim() || null,
          timeline: form.timeline || null,
          investmentReady: form.investment_ready || null,
          decisionMaker: form.decision_maker || null,
          goals: form.goals.trim() || null,
          hearAbout: form.hear_about.trim() || null,
        }),
      })
      if (!res.ok) throw new Error('Submission failed')
      setDone(true)
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (done) {
    return (
      <div className={styles.page}>
        <div className={styles.thankYou}>
          <div className={styles.thankYouIcon}>✓</div>
          <h1 className={styles.thankYouTitle}>Application Received</h1>
          <p className={styles.thankYouBody}>
            Thank you for taking the time to apply. Dr. Hunter personally reviews every application and will reach out within 2 to 3 business days with next steps.
          </p>
          <p className={styles.thankYouSub}>Educational support only, not medical advice. Nothing here replaces your physician's guidance.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.eyebrow}>Application</div>
        <h1 className={styles.title}>Work Directly with Dr. Hunter</h1>
        <p className={styles.subtitle}>
          A limited number of private client spots open each quarter. Dr. Hunter personally reviews every application. Tell her what is actually going on.
        </p>
        <p className={styles.disclaimer}>Educational support only, not medical advice. Nothing here replaces your physician's guidance.</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>

        {/* Tier Selection */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Which program interests you?</h2>
          <div className={styles.tierGrid}>
            {TIERS.map(t => (
              <button
                key={t.id}
                type="button"
                className={`${styles.tierCard} ${form.tier === t.id ? styles.tierCardActive : ''}`}
                onClick={() => set('tier', t.id)}
              >
                <div className={styles.tierPrice}>{t.price}</div>
                <div className={styles.tierName}>{t.name}</div>
                <div className={styles.tierLimit}>{t.limit}</div>
                <div className={styles.tierDesc}>{t.description}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Contact Info */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>About you</h2>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>First name <span className={styles.req}>*</span></label>
              <input
                className={styles.input}
                value={form.first_name}
                onChange={e => set('first_name', e.target.value)}
                placeholder="First name"
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Last name</label>
              <input
                className={styles.input}
                value={form.last_name}
                onChange={e => set('last_name', e.target.value)}
                placeholder="Last name"
              />
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Email <span className={styles.req}>*</span></label>
              <input
                className={styles.input}
                type="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Phone (optional)</label>
              <input
                className={styles.input}
                type="tel"
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                placeholder="555-000-0000"
              />
            </div>
          </div>
        </section>

        {/* Need */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>What is going on with your health?</h2>
          <div className={styles.field}>
            <label className={styles.label}>Describe your primary health challenge <span className={styles.req}>*</span></label>
            <textarea
              className={styles.textarea}
              value={form.health_challenge}
              onChange={e => set('health_challenge', e.target.value)}
              placeholder="What symptoms, conditions, or lab trends are you most concerned about right now?"
              rows={4}
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>What have you already tried?</label>
            <textarea
              className={styles.textarea}
              value={form.previous_attempts}
              onChange={e => set('previous_attempts', e.target.value)}
              placeholder="Diets, medications, supplements, other practitioners, programs..."
              rows={3}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>What does your ideal health outcome look like?</label>
            <textarea
              className={styles.textarea}
              value={form.goals}
              onChange={e => set('goals', e.target.value)}
              placeholder="What would change in your life if your health improved the way you want it to?"
              rows={3}
            />
          </div>
        </section>

        {/* Timing */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>When are you looking to start?</h2>
          <div className={styles.radioGroup}>
            {[
              { val: 'immediately', label: 'Ready to start now' },
              { val: '1_month', label: 'Within the next month' },
              { val: '3_months', label: 'Within 3 months' },
              { val: 'exploring', label: 'Just exploring for now' },
            ].map(opt => (
              <label key={opt.val} className={`${styles.radioCard} ${form.timeline === opt.val ? styles.radioCardActive : ''}`}>
                <input
                  type="radio"
                  name="timeline"
                  value={opt.val}
                  checked={form.timeline === opt.val}
                  onChange={e => set('timeline', e.target.value)}
                  className={styles.radioHidden}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </section>

        {/* Budget */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Investment readiness</h2>
          <p className={styles.sectionNote}>
            The VIP Intensive is $997/mo. The 6-Month Overhaul is $4,997. Dr. Hunter needs to know you are ready to invest before reserving a spot.
          </p>
          <div className={styles.radioGroup}>
            {[
              { val: 'yes', label: 'Yes, I am ready to invest' },
              { val: 'maybe', label: 'I may need to discuss options' },
              { val: 'not_yet', label: 'Not at this time' },
            ].map(opt => (
              <label key={opt.val} className={`${styles.radioCard} ${form.investment_ready === opt.val ? styles.radioCardActive : ''}`}>
                <input
                  type="radio"
                  name="investment_ready"
                  value={opt.val}
                  checked={form.investment_ready === opt.val}
                  onChange={e => set('investment_ready', e.target.value)}
                  className={styles.radioHidden}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </section>

        {/* Authority */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Decision-making</h2>
          <div className={styles.radioGroup}>
            {[
              { val: 'yes', label: 'I make this decision on my own' },
              { val: 'need_to_discuss', label: 'I need to discuss with a partner first' },
            ].map(opt => (
              <label key={opt.val} className={`${styles.radioCard} ${form.decision_maker === opt.val ? styles.radioCardActive : ''}`}>
                <input
                  type="radio"
                  name="decision_maker"
                  value={opt.val}
                  checked={form.decision_maker === opt.val}
                  onChange={e => set('decision_maker', e.target.value)}
                  className={styles.radioHidden}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </section>

        {/* How did you find us */}
        <section className={styles.section}>
          <div className={styles.field}>
            <label className={styles.label}>How did you hear about Hunter's Holistic Health?</label>
            <input
              className={styles.input}
              value={form.hear_about}
              onChange={e => set('hear_about', e.target.value)}
              placeholder="Instagram, referral, podcast, search..."
            />
          </div>
        </section>

        <div className={styles.submitWrap}>
          <button type="submit" className={styles.submitBtn} disabled={saving}>
            {saving ? 'Submitting...' : 'Submit Application'}
          </button>
          <p className={styles.submitNote}>
            Submitting does not guarantee a spot. Dr. Hunter reviews every application personally and will reach out within 2 to 3 business days.
          </p>
        </div>
      </form>
    </div>
  )
}
