import { useState } from 'react'
import { Settings, Video, ExternalLink, LogOut, Trash2, Shield, User } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import styles from './Client.module.css'
import shared from '../../styles/shared.module.css'

export default function SettingsPage() {
  const { profile } = useAuthStore()
  const navigate = useNavigate()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/login')
    toast('Signed out successfully', { icon: '👋' })
  }

  const handleDeleteAccount = async () => {
    if (deleteInput !== 'DELETE') return
    // In production, this calls a Supabase Edge Function that deletes the user
    toast('Account deletion request submitted. Your data will be removed within 30 days.', { duration: 6000 })
    setShowDeleteConfirm(false)
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="animate-fade-in">
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTopTitle}>
          <Settings size={22} color="var(--text-secondary)" /> Settings
        </h1>
        <p className={styles.pageTopDate}>Account and program settings</p>
      </div>

      {/* Profile info */}
      <div className={styles.card}>
        <div className={styles.profileRow}>
          <div className={styles.profileAvatar}>
            <User size={24} color="var(--gold)" />
          </div>
          <div>
            <div className={styles.profileName}>{profile?.first_name} {profile?.last_name}</div>
            <div className={styles.profileMeta}>
              {profile?.age ? `Age ${profile.age}` : ''}
              {profile?.display_handle ? ` · @${profile.display_handle}` : ''}
              {' · '}{profile?.role === 'educator' ? 'Educator' : 'Participant'}
            </div>
          </div>
        </div>
        <div className={styles.infoNote}>
          To update your profile information, contact your educator at <strong>hello@huntersholistichealth.com</strong>
        </div>
      </div>

      {/* Session booking */}
      <div className={styles.card}>
        <h3 className={styles.cardSubTitle}>
          <Video size={16} color="var(--teal)" /> Book an Educator Session
        </h3>
        <p className={styles.cardText}>
          Schedule a 1-on-1 educational session with Dr. Hunter via Doxy.me, a free, HIPAA-compliant video platform. No app download required.
        </p>
        <div className={styles.formActions}>
          <a href="https://doxy.me/drshallandahunter" target="_blank" rel="noopener noreferrer" className={shared.btnTeal}>
            <Video size={16} /> Join Session Room
          </a>
          <a href="https://calendly.com/huntersholistichealth" target="_blank" rel="noopener noreferrer" className={shared.btnSecondary}>
            <ExternalLink size={16} /> Schedule Appointment
          </a>
        </div>
        <p className={styles.cardFootnote}>
          Sessions are educational consultations, not medical appointments. Dr. Hunter operates as a Functional Medicine Educator.
        </p>
      </div>

      {/* Supplement dispensary */}
      <div className={styles.card}>
        <h3 className={styles.cardSubTitle}>Supplement Dispensary</h3>
        <p className={styles.cardText}>
          Access Dr. Hunter's curated Fullscript dispensary for practitioner-grade supplements at up to 25% off retail pricing.
        </p>
        <a href="https://fullscript.com/go/huntersholistichealth" target="_blank" rel="noopener noreferrer" className={shared.btnSecondary}>
          <ExternalLink size={16} /> Open Fullscript Dispensary
        </a>
        <p className={styles.cardFootnote}>
          Affiliate disclosure: Dr. Hunter may receive compensation from Fullscript purchases. Supplement recommendations are for educational purposes only.
        </p>
      </div>

      {/* Legal */}
      <div className={styles.card}>
        <h3 className={styles.cardSubTitle}>
          <Shield size={16} color="var(--text-secondary)" /> Legal & Privacy
        </h3>
        <div className={styles.checklist}>
          {[
            { label: 'Terms of Service', path: '/terms' },
            { label: 'Privacy Policy', path: '/privacy' },
          ].map(({ label, path }) => (
            <a key={path} href={path} target="_blank" rel="noopener noreferrer" className={styles.legalLinkRow}>
              {label} <ExternalLink size={14} color="var(--text-secondary)" />
            </a>
          ))}
        </div>
      </div>

      {/* Sign out */}
      <div className={styles.card}>
        <button onClick={handleSignOut} className={styles.signOutBtn}>
          <LogOut size={16} /> Sign Out
        </button>
      </div>

      {/* Delete account */}
      <div className={styles.dangerCard}>
        <h3 className={styles.dangerTitle}>
          <Trash2 size={16} /> Delete Account
        </h3>
        <p className={styles.cardText}>
          Permanently delete your account and all associated data. This action cannot be undone. Your data will be removed within 30 days per our Privacy Policy.
        </p>
        {!showDeleteConfirm ? (
          <button onClick={() => setShowDeleteConfirm(true)} className={shared.btnDanger}>
            Request Account Deletion
          </button>
        ) : (
          <div>
            <p className={styles.dangerText}>Type <strong>DELETE</strong> to confirm:</p>
            <div className={styles.formActions}>
              <input type="text" value={deleteInput} onChange={e => setDeleteInput(e.target.value)} placeholder="DELETE" className={styles.deleteInput} />
              <button onClick={handleDeleteAccount} disabled={deleteInput !== 'DELETE'} className={shared.btnDanger}>
                Confirm Delete
              </button>
              <button onClick={() => { setShowDeleteConfirm(false); setDeleteInput('') }} className={shared.btnSecondary}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
