import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import styles from './Auth.module.css'
import shared from '../../styles/shared.module.css'

export default function SignupPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    age: '',
    displayHandle: '',
  })

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        first_name: form.firstName,
        last_name: form.lastName,
        age: form.age ? parseInt(form.age) : null,
        display_handle: form.displayHandle || null,
        role: 'client',
      })
      if (profileError) {
        toast.error('Account created but profile setup failed. Please contact support.')
      } else {
        toast.success('Account created! Welcome to Hunter\'s Holistic Health.')
        navigate('/dashboard')
      }
    }
    setLoading(false)
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <img src="/logo.png" alt="Hunter's Holistic Health" className={styles.logoImg} />
        </div>
        <h1 className={styles.title}>Create Your Account</h1>
        <p className={styles.subtitle}>Join your wellness education journey</p>

        {/* Privacy notice */}
        <div className={shared.alertInfo}>
          🔒 <strong>Privacy-first design:</strong> We collect only your first name, last name, and age; never your date of birth, address, or insurance information.{' '}
          <Link to="/privacy-scorecard" className={shared.textLink}>See our Privacy Scorecard.</Link>
        </div>

        <form onSubmit={handleSignup} className={styles.form}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>First Name *</label>
              <input className={styles.input} type="text" placeholder="Jane" value={form.firstName} onChange={set('firstName')} required maxLength={50} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Last Name *</label>
              <input className={styles.input} type="text" placeholder="Smith" value={form.lastName} onChange={set('lastName')} required maxLength={50} />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Age</label>
              <input className={styles.input} type="number" placeholder="42" value={form.age} onChange={set('age')} min={18} max={120} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Display Handle (optional)</label>
              <input className={styles.input} type="text" placeholder="WellnessWarrior" value={form.displayHandle} onChange={set('displayHandle')} maxLength={30} />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Email Address *</label>
            <input className={styles.input} type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Password *</label>
              <input className={styles.input} type="password" placeholder="Min. 8 characters" value={form.password} onChange={set('password')} required minLength={8} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Confirm Password *</label>
              <input className={styles.input} type="password" placeholder="••••••••" value={form.confirmPassword} onChange={set('confirmPassword')} required />
            </div>
          </div>

          <div className={styles.disclaimer}>
            By creating an account, you acknowledge that this platform provides <strong>educational content only</strong> and does not constitute medical advice, diagnosis, or treatment. Always consult your healthcare provider.
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" className={styles.footerLink}>Sign In</Link>
        </p>
      </div>
    </div>
  )
}
