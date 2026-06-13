import { useState } from 'react'
import { MessageSquare, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import styles from './Client.module.css'

const CATEGORIES = [
  { id: 'bug',     label: 'Something is broken' },
  { id: 'feature', label: 'Feature request' },
  { id: 'question',label: 'Question about the app' },
  { id: 'general', label: 'General feedback' },
  { id: 'win',     label: 'Sharing a win' },
]

const APP_AREAS = [
  'Dashboard',
  'Daily Log',
  'BP Tracker',
  'Meal Guard',
  'Classroom',
  'Community Feed',
  'Challenges',
  'Weekly Grade',
  'Supplements',
  'Something else',
]

export default function FeedbackPage() {
  const { profile } = useAuthStore()
  const [category, setCategory] = useState('')
  const [area, setArea]         = useState('')
  const [message, setMessage]   = useState('')
  const [status, setStatus]     = useState<'idle' | 'sending' | 'done' | 'error'>('idle')

  const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!category || !message.trim()) return
    setStatus('sending')

    const firstName = profile?.first_name ?? 'App user'

    // Save to Supabase
    await supabase.from('feedback').insert({
      user_id:    profile?.id ?? null,
      first_name: firstName,
      category,
      message:    message.trim(),
      app_area:   area || null,
    })

    // Fire n8n webhook for email notification
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            submissionType: 'app_feedback',
            firstName,
            category,
            appArea: area || null,
            message: message.trim(),
          }),
        })
      } catch {
        // Supabase already saved it; webhook failure is non-fatal
      }
    }

    setStatus('done')
  }

  if (status === 'done') {
    return (
      <div className={styles.feedbackPage}>
        <div className={styles.feedbackSuccess}>
          <CheckCircle size={44} color="#4be08a" />
          <h2 className={styles.feedbackSuccessTitle}>Thank you.</h2>
          <p className={styles.feedbackSuccessSub}>
            Your feedback goes directly to Dr. Hunter. It shapes what gets built next.
          </p>
          <button
            className={styles.feedbackSubmitBtn}
            onClick={() => { setCategory(''); setArea(''); setMessage(''); setStatus('idle') }}
          >
            Send more feedback
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.feedbackPage}>
      <div className={styles.feedbackHeader}>
        <h1 className={styles.feedbackTitle}>
          <MessageSquare size={22} color="var(--gold)" /> Give Feedback
        </h1>
        <p className={styles.feedbackSub}>
          This goes directly to Dr. Hunter. No one else sees it. Say exactly what you think.
        </p>
      </div>

      <form className={styles.feedbackForm} onSubmit={handleSubmit}>

        <div className={styles.feedbackSection}>
          <label className={styles.feedbackLabel}>What kind of feedback is this?</label>
          <div className={styles.feedbackCategoryGrid}>
            {CATEGORIES.map(c => (
              <button
                key={c.id}
                type="button"
                className={`${styles.feedbackCategoryBtn} ${category === c.id ? styles.feedbackCategoryBtnActive : ''}`}
                onClick={() => setCategory(c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.feedbackSection}>
          <label className={styles.feedbackLabel}>Which part of the app? (optional)</label>
          <div className={styles.feedbackAreaGrid}>
            {APP_AREAS.map(a => (
              <button
                key={a}
                type="button"
                className={`${styles.feedbackAreaBtn} ${area === a ? styles.feedbackAreaBtnActive : ''}`}
                onClick={() => setArea(prev => prev === a ? '' : a)}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.feedbackSection}>
          <label className={styles.feedbackLabel}>Your message</label>
          <textarea
            className={styles.feedbackTextarea}
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Be as specific as you want. What happened? What would help? What did you love?"
            rows={5}
            maxLength={2000}
            required
          />
          <div className={styles.feedbackCharCount}>{message.length} / 2000</div>
        </div>

        {status === 'error' && (
          <p className={styles.feedbackError}>Something went wrong. Please try again.</p>
        )}

        <button
          type="submit"
          className={styles.feedbackSubmitBtn}
          disabled={!category || !message.trim() || status === 'sending'}
        >
          {status === 'sending' ? 'Sending...' : 'Send Feedback'}
        </button>
      </form>
    </div>
  )
}
