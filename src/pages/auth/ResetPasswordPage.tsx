import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import styles from './Auth.module.css'

type View = 'request' | 'sent' | 'reset'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [view, setView] = useState<View>('request')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setView('reset')
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const sendReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setLoading(false)
    if (error) {
      toast.error(error.message)
    } else {
      setView('sent')
    }
  }

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) {
      toast.error('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Password updated. Please sign in.')
      await supabase.auth.signOut()
      navigate('/login')
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <img src="/logo-mark.png" alt="Hunter's Holistic Health" className={styles.logoImg} />
        </div>

        {view === 'request' && (
          <>
            <h1 className={styles.title}>Reset Password</h1>
            <p className={styles.subtitle}>Enter your email and we will send a reset link.</p>
            <form onSubmit={sendReset} className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>Email Address</label>
                <input
                  className={styles.input}
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
            <p className={styles.footer}>
              Remember it?{' '}
              <Link to="/login" className={styles.footerLink}>Sign In</Link>
            </p>
          </>
        )}

        {view === 'sent' && (
          <>
            <h1 className={styles.title}>Check Your Email</h1>
            <p className={styles.subtitle}>
              A password reset link was sent to <strong>{email}</strong>. Click the link in that email to set a new password.
            </p>
            <p className={styles.footer}>
              <Link to="/login" className={styles.footerLink}>Back to Sign In</Link>
            </p>
          </>
        )}

        {view === 'reset' && (
          <>
            <h1 className={styles.title}>Set New Password</h1>
            <p className={styles.subtitle}>Choose a strong password for your account.</p>
            <form onSubmit={updatePassword} className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>New Password</label>
                <input
                  className={styles.input}
                  type="password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Confirm Password</label>
                <input
                  className={styles.input}
                  type="password"
                  placeholder="Same password again"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </>
        )}

        <div className={styles.disclaimer}>
          This platform is for educational purposes only and does not constitute medical advice.
        </div>
      </div>
    </div>
  )
}
