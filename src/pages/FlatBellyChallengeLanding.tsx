import { useState } from 'react'
import s from './FlatBellyChallengeLanding.module.css'

// Dr. Hunter's WhatsApp accountability group. Clearing this hides the line
// on the confirmation screen rather than showing a broken link.
const WHATSAPP_LINK = 'https://wa.me/15619457540'
const WHATSAPP_DISPLAY = '(561) 945-7540'

const DISCLAIMER =
  'For educational purposes only. Not medical advice. Always consult your licensed healthcare provider before making changes to your health routine.'

export default function FlatBellyChallengeLanding() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [joined, setJoined] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const cleanEmail = email.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Please enter a valid email address.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/beehiiv-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          firstName: name.trim(),
          source: 'flat_belly_challenge',
        }),
      })
      if (!res.ok) throw new Error(String(res.status))
      setJoined(true)
    } catch {
      setError('Something went wrong on our end. Please try again in a moment.')
    } finally {
      setSubmitting(false)
    }
  }

  if (joined) {
    return (
      <div className={s.page}>
        <main className={s.confirmWrap}>
          <div className={s.confirmCard}>
            <h1 className={s.confirmTitle}>You are in.</h1>
            <p className={s.confirmLead}>Your first email arrives Monday morning at 7 AM.</p>
            <p className={s.confirmBody}>
              In the meantime, save {WHATSAPP_DISPLAY} in your phone as &ldquo;Dr. Hunter
              HHH&rdquo;
              {WHATSAPP_LINK ? ' and join the WhatsApp accountability group:' : '.'}
            </p>
            {WHATSAPP_LINK && (
              <a className={s.waLink} href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                Join the WhatsApp group
              </a>
            )}
            <p className={s.confirmSignoff}>
              See you Monday.
              <br />
              Dr. Hunter
            </p>
          </div>
          <p className={s.disclaimer}>{DISCLAIMER}</p>
        </main>
      </div>
    )
  }

  return (
    <div className={s.page}>
      <main className={s.wrap}>
        <header className={s.hero}>
          <p className={s.eyebrow}>Free 14-Day Challenge</p>
          <h1 className={s.headline}>
            Your belly is not the problem.
            <span className={s.headlineAccent}>
              What your body is doing with stress, protein, and sleep is.
            </span>
          </h1>
          <p className={s.sub}>
            Join the free 14-Day Flat Belly Challenge and learn exactly why your middle holds on,
            and what to do about it starting Monday.
          </p>
        </header>

        <section className={s.formSection} id="join">
          <form className={s.form} onSubmit={handleSubmit} noValidate>
            <label className={s.label} htmlFor="fbc-name">
              First name
            </label>
            <input
              id="fbc-name"
              className={s.input}
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              autoComplete="given-name"
              placeholder="Your first name"
            />

            <label className={s.label} htmlFor="fbc-email">
              Email address
            </label>
            <input
              id="fbc-email"
              className={s.input}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
              required
            />

            {error && (
              <p className={s.error} role="alert">
                {error}
              </p>
            )}

            <button className={s.cta} type="submit" disabled={submitting}>
              {submitting ? 'Saving your spot...' : 'Yes, I want my free spot. Start me Monday.'}
            </button>

            <p className={s.finePrint}>
              By joining, you will receive 14 daily educational emails from Hunter&rsquo;s Holistic
              Health. Unsubscribe at any time. This challenge is for educational purposes only and
              does not constitute medical advice, diagnosis, or a clinical treatment plan. Always
              consult your licensed healthcare provider before making changes to your health
              routine.
            </p>
          </form>
        </section>

        <section className={s.section}>
          <p className={s.lead}>You have tried cutting calories.</p>
          <p className={s.lead}>You have tried more cardio.</p>
          <p className={s.lead}>Your belly did not get the memo.</p>
          <p className={s.leadStrong}>Here is why.</p>
          <p className={s.body}>
            Belly fat in women over 35 is not a willpower problem. It is a biology problem. Three
            specific things keep your belly inflated regardless of how clean you eat:
          </p>

          <div className={s.reasons}>
            <div className={s.reason}>
              <h2 className={s.reasonTitle}>Cortisol</h2>
              <p className={s.reasonText}>
                The stress hormone that signals your body to store fat in the middle when you are
                running on empty.
              </p>
            </div>
            <div className={s.reason}>
              <h2 className={s.reasonTitle}>Protein timing</h2>
              <p className={s.reasonText}>
                Most women eat 70 percent of their protein at dinner. Your body cannot use what it
                cannot absorb at the right time.
              </p>
            </div>
            <div className={s.reason}>
              <h2 className={s.reasonTitle}>Sleep quality</h2>
              <p className={s.reasonText}>
                Your fat-burning window opens between 10 PM and 2 AM. If you miss it, you miss it.
              </p>
            </div>
          </div>

          <p className={s.body}>This challenge teaches you how to address all three.</p>
        </section>

        <section className={s.section}>
          <h2 className={s.sectionTitle}>What you get</h2>
          <p className={s.body}>14 days. One email each morning at 7 AM.</p>
          <p className={s.bodyMuted}>Each day:</p>
          <ul className={s.list}>
            <li>The reason why your belly does what it does (the root cause, not the symptom)</li>
            <li>One action you can take today in 15 minutes or less</li>
            <li>No starvation. No cleanses. No meal replacement shakes.</li>
          </ul>
        </section>

        <section className={s.twoUp}>
          <div className={s.forCard}>
            <h2 className={s.sectionTitle}>Who this is for</h2>
            <ul className={s.list}>
              <li>Women who are eating reasonably well but still cannot budge the belly.</li>
              <li>Women who are tired, inflamed, and bloated more often than not.</li>
              <li>
                Women who want to understand what is happening in their body, not just be told what
                to do.
              </li>
            </ul>
          </div>
          <div className={s.notForCard}>
            <h2 className={s.sectionTitle}>Who this is not for</h2>
            <ul className={s.list}>
              <li>Anyone looking for a quick fix with no education behind it.</li>
              <li>
                Anyone who needs individualized medical advice. For that, you need your physician.
                This is education, not treatment.
              </li>
            </ul>
          </div>
        </section>

        <section className={s.aboutSection}>
          <h2 className={s.sectionTitle}>About Dr. Hunter</h2>
          <p className={s.credential}>
            Dr. Shallanda Hunter, PharmD, MBA, CFNMP, Licensed Pharmacist and Certified Functional
            Nutritional Medicine Practitioner
          </p>
          <p className={s.body}>
            I spent years in pharmacy watching women fill prescriptions that managed their symptoms
            but never touched the root. Functional medicine training showed me what prescriptions
            cannot do. That gap is where I focus.
          </p>
          <p className={s.body}>
            I reversed my own metabolic condition. The same principles I used on myself are the
            foundation of this challenge.
          </p>
        </section>

        <section className={s.closer}>
          <a className={s.ctaLink} href="#join">
            Yes, I want my free spot. Start me Monday.
          </a>
        </section>

        <p className={s.disclaimer}>{DISCLAIMER}</p>
      </main>
    </div>
  )
}
