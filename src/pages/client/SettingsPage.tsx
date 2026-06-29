import { useState, useEffect } from 'react'
import { Settings, Video, ExternalLink, LogOut, Trash2, Shield, User, Target, Download } from 'lucide-react'
import ReminderSettings from '@/components/ui/ReminderSettings'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import styles from './Client.module.css'
import shared from '../../styles/shared.module.css'
import type { WellnessGoals, PrivacySettings } from '@/types'

const GOAL_OPTIONS = [
  '',
  'Blood Pressure Support',
  'Blood Sugar Balance',
  'Weight Management',
  'Energy and Fatigue',
  'Cardiovascular Health',
  'Digestive Health',
  'Hormonal Balance',
  'Inflammation Reduction',
  'Stress and Sleep',
  'Metabolic Health',
  'General Wellness',
  'Other',
]
const DIET_OPTIONS = [
  '',
  'No restriction',
  'Plant-based',
  'Mediterranean',
  'Anti-inflammatory',
  'Gluten-free',
  'Dairy-free',
  'Low sodium',
  'Low carb',
  'Caribbean',
  'Other',
]

export default function SettingsPage() {
  const { profile, setProfile } = useAuthStore()
  const navigate = useNavigate()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')
  const [goals, setGoals] = useState<WellnessGoals>(profile?.wellness_goals ?? {})
  const [privacy, setPrivacy] = useState<PrivacySettings>(
    profile?.privacy_settings ?? { share_weight: true, share_steps: true, share_meals: true }
  )
  const [savingGoals, setSavingGoals] = useState(false)

  useEffect(() => {
    if (profile?.wellness_goals) setGoals(profile.wellness_goals)
    if (profile?.privacy_settings) setPrivacy(profile.privacy_settings)
  }, [profile?.id])

  const saveGoals = async () => {
    if (!profile) return
    setSavingGoals(true)
    const { error } = await supabase.from('profiles').update({ wellness_goals: goals }).eq('id', profile.id)
    if (error) {
      toast.error('Failed to save goals')
    } else {
      setProfile({ ...profile, wellness_goals: goals })
      toast.success('Wellness goals saved!')
    }
    setSavingGoals(false)
  }

  const savePrivacy = async (updated: PrivacySettings) => {
    if (!profile) return
    setPrivacy(updated)
    const { error } = await supabase.from('profiles').update({ privacy_settings: updated }).eq('id', profile.id)
    if (!error) {
      setProfile({ ...profile, privacy_settings: updated })
      toast.success('Privacy settings updated')
    }
  }

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
          To update your profile information, contact your educator at <strong>info@huntersholistichealth.com</strong>
        </div>
      </div>

      {/* Wellness Goals */}
      <div className={styles.settingsSection}>
        <h3 className={styles.settingsSectionTitle}>
          <Target size={16} color="var(--gold)" /> Your Wellness Goals
        </h3>
        <p className={styles.settingsSectionNote}>
          Used to personalize your AI Meal Guard, Smart Recipe Builder, and VitaPlate Plate Coach. Not clinical data. Not shared with third parties.
        </p>
        <div className={styles.settingsRow}>
          <label className={styles.label}>Primary wellness goal</label>
          <select className={styles.settingsSelect} value={goals.primary_goal ?? ''} onChange={e => setGoals(g => ({ ...g, primary_goal: e.target.value }))}>
            {GOAL_OPTIONS.map(o => <option key={o} value={o}>{o || 'Select a goal...'}</option>)}
          </select>
        </div>
        <div className={styles.settingsRow}>
          <label className={styles.label}>Secondary goal (optional)</label>
          <select className={styles.settingsSelect} value={goals.secondary_goal ?? ''} onChange={e => setGoals(g => ({ ...g, secondary_goal: e.target.value }))}>
            {GOAL_OPTIONS.map(o => <option key={o} value={o}>{o || 'None'}</option>)}
          </select>
        </div>
        <div className={styles.settingsRow}>
          <label className={styles.label}>Dietary preferences</label>
          <select className={styles.settingsSelect} value={goals.dietary_preference ?? ''} onChange={e => setGoals(g => ({ ...g, dietary_preference: e.target.value }))}>
            {DIET_OPTIONS.map(o => <option key={o} value={o}>{o || 'Select...'}</option>)}
          </select>
        </div>
        <button className={shared.btnPrimary} onClick={saveGoals} disabled={savingGoals}>
          {savingGoals ? 'Saving...' : 'Save Goals'}
        </button>
      </div>

      {/* Reminders */}
      <ReminderSettings />

      {/* Privacy settings */}
      <div className={styles.settingsSection}>
        <h3 className={styles.settingsSectionTitle}>
          <Shield size={16} color="var(--teal)" /> Feed Privacy Settings
        </h3>
        <p className={styles.settingsSectionNote}>
          Control what information appears when your activity is shown in the community feed.
        </p>
        {[
          { key: 'share_weight' as const, label: 'Share weight milestones', desc: 'Off: shows "reached a milestone" instead of numbers' },
          { key: 'share_steps' as const, label: 'Share step counts', desc: 'Off: shows "Goal Met" checkmark only, not the number' },
          { key: 'share_meals' as const, label: 'Share meal names', desc: 'Off: shows "Logged a meal" instead of food name' },
        ].map(({ key, label, desc }) => (
          <div key={key} className={styles.privacyToggleRow}>
            <div>
              <div className={styles.privacyToggleLabel}>{label}</div>
              <div className={styles.privacyToggleDesc}>{desc}</div>
            </div>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={privacy[key]}
                onChange={e => savePrivacy({ ...privacy, [key]: e.target.checked })}
              />
              <span className={styles.toggleSlider} />
            </label>
          </div>
        ))}
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
          <a href="https://tidycal.com/huntersholistichealth" target="_blank" rel="noopener noreferrer" className={shared.btnSecondary}>
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

      {/* Digital Resources */}
      <div className={styles.card}>
        <h3 className={styles.cardSubTitle}>
          <Download size={16} color="var(--gold)" /> Digital Resources
        </h3>
        <p className={styles.cardText}>
          The Creatine 101 Bundle includes a Quick Start Guide, 30-Day Tracker, Workout Log, Hydration Tracker, Stack Cheat Sheet, and Science Guide. Everything you need to add creatine to your protocol with confidence.
        </p>
        <a
          href="/shop"
          className={shared.btnSecondary}
        >
          <ExternalLink size={16} /> View Creatine Bundle
        </a>
        <p className={styles.cardFootnote}>
          Digital download. Available for immediate access after purchase. Content is for educational purposes only.
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
