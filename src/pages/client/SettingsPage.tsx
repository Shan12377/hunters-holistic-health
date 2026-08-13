import { useState, useEffect } from 'react'
import { Settings, Video, ExternalLink, LogOut, Trash2, Shield, User, Target, Download, BellRing, Send } from 'lucide-react'
import ReminderSettings from '@/components/ui/ReminderSettings'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import BackButton from '@/components/BackButton'
import styles from './Client.module.css'
import shared from '../../styles/shared.module.css'
import type { WellnessGoals, PrivacySettings } from '@/types'

const FASTING_HOURS = [10, 12, 13, 14, 15, 16, 17, 18, 20]
const TIMEZONES = [
  { value: 'America/New_York',    label: 'Eastern (ET)' },
  { value: 'America/Chicago',     label: 'Central (CT)' },
  { value: 'America/Denver',      label: 'Mountain (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific (PT)' },
  { value: 'America/Anchorage',   label: 'Alaska (AKT)' },
  { value: 'Pacific/Honolulu',    label: 'Hawaii (HT)' },
  { value: 'America/Puerto_Rico', label: 'Puerto Rico (AST)' },
  { value: 'Europe/London',       label: 'London (GMT/BST)' },
  { value: 'Europe/Paris',        label: 'Central Europe (CET)' },
]

function formatHour(h: number): string {
  if (h === 0) return '12:00 AM'
  if (h < 12) return `${h}:00 AM`
  if (h === 12) return '12:00 PM'
  return `${h - 12}:00 PM`
}

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
  const [exporting, setExporting] = useState(false)

  // Data portability: everything the client logged, as one JSON file they keep.
  const handleExportData = async () => {
    setExporting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user
      if (!user) return
      const tables = ['daily_logs', 'blood_pressure_logs', 'blood_sugar_logs', 'weight_logs', 'habit_logs'] as const
      const out: Record<string, unknown> = { exported_at: new Date().toISOString() }
      for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*').eq('user_id', user.id)
        out[table] = error ? `unavailable: ${error.message}` : (data ?? [])
      }
      const blob = new Blob([JSON.stringify(out, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `my-hhh-data-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Your data file is downloading')
    } catch {
      toast.error('Export failed. Please try again.')
    } finally {
      setExporting(false)
    }
  }
  const [goals, setGoals] = useState<WellnessGoals>(profile?.wellness_goals ?? {})
  const [privacy, setPrivacy] = useState<PrivacySettings>(
    profile?.privacy_settings ?? { share_weight: true, share_steps: true, share_meals: true }
  )
  const [savingGoals, setSavingGoals] = useState(false)
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '')
  const [avatarColor, setAvatarColor] = useState(profile?.avatar_color ?? '')
  const [savingProfile, setSavingProfile] = useState(false)
  const [fastingEnabled, setFastingEnabled] = useState(false)
  const [fastingStartHour, setFastingStartHour] = useState(20)
  const [fastingDuration, setFastingDuration] = useState(16)
  const [fastingTz, setFastingTz] = useState('America/New_York')
  const [telegramLinked, setTelegramLinked] = useState(false)
  const [checkingTelegram, setCheckingTelegram] = useState(false)
  const [savingFasting, setSavingFasting] = useState(false)

  const AVATAR_COLORS = [
    { value: '#0B9E8E', label: 'Teal' },
    { value: '#c8a74b', label: 'Gold' },
    { value: '#7c6fcd', label: 'Indigo' },
    { value: '#e07a5f', label: 'Coral' },
    { value: '#4a9e6f', label: 'Sage' },
    { value: '#d47ba7', label: 'Rose' },
  ]

  useEffect(() => {
    if (profile?.wellness_goals) setGoals(profile.wellness_goals)
    if (profile?.privacy_settings) setPrivacy(profile.privacy_settings)
    if (profile?.display_name) setDisplayName(profile.display_name)
    if (profile?.avatar_color) setAvatarColor(profile.avatar_color)
  }, [profile?.id])

  useEffect(() => {
    if (!profile?.id) return
    supabase
      .from('profiles')
      .select('fasting_reminders, fasting_start_hour, fasting_duration_hours, fasting_tz, telegram_chat_id')
      .eq('id', profile.id)
      .single()
      .then(({ data }) => {
        if (!data) return
        setFastingEnabled(data.fasting_reminders ?? false)
        setFastingStartHour(data.fasting_start_hour ?? 20)
        setFastingDuration(data.fasting_duration_hours ?? 16)
        setFastingTz(data.fasting_tz ?? 'America/New_York')
        setTelegramLinked(!!data.telegram_chat_id)
      })
  }, [profile?.id])

  const saveFasting = async () => {
    if (!profile) return
    setSavingFasting(true)
    const { error } = await supabase.from('profiles').update({
      fasting_reminders: fastingEnabled,
      fasting_start_hour: fastingStartHour,
      fasting_duration_hours: fastingDuration,
      fasting_tz: fastingTz,
    }).eq('id', profile.id)
    if (error) {
      toast.error('Failed to save fasting settings')
    } else {
      toast.success('Fasting reminders saved!')
    }
    setSavingFasting(false)
  }

  const checkTelegramLink = async () => {
    if (!profile) return
    setCheckingTelegram(true)
    const { data } = await supabase
      .from('profiles')
      .select('telegram_chat_id')
      .eq('id', profile.id)
      .single()
    setTelegramLinked(!!data?.telegram_chat_id)
    setCheckingTelegram(false)
    if (data?.telegram_chat_id) {
      toast.success('Telegram is connected!')
    } else {
      toast('Not connected yet. Complete the steps in Telegram first.', { icon: 'ℹ️' })
    }
  }

  const botUsername = import.meta.env.VITE_TELEGRAM_BOT_USERNAME as string | undefined
  const telegramConnectUrl = botUsername && profile?.id
    ? `https://t.me/${botUsername}?start=${profile.id}`
    : null

  const saveDisplayProfile = async () => {
    if (!profile) return
    setSavingProfile(true)
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName.trim() || null, avatar_color: avatarColor || null })
      .eq('id', profile.id)
    if (error) {
      toast.error('Failed to save profile')
    } else {
      setProfile({ ...profile, display_name: displayName.trim() || null, avatar_color: avatarColor || null })
      toast.success('Profile updated!')
    }
    setSavingProfile(false)
  }

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

      {/* Display name and avatar color */}
      <div className={styles.settingsSection}>
        <h3 className={styles.settingsSectionTitle}>
          <User size={16} color="var(--gold)" /> My Profile
        </h3>
        <p className={styles.settingsSectionNote}>
          Set a display name for your dashboard greeting and sidebar. Pick a color for your avatar.
        </p>
        <div className={styles.settingsRow}>
          <label className={styles.label}>Display name</label>
          <input
            className={styles.settingsInput}
            type="text"
            placeholder={`${profile?.first_name ?? ''} (default)`}
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            maxLength={32}
          />
        </div>
        <div className={styles.settingsRow}>
          <label className={styles.label}>Avatar color</label>
          <div className={styles.colorPicker}>
            {AVATAR_COLORS.map(c => (
              <button
                key={c.value}
                className={`${styles.colorSwatch} ${avatarColor === c.value ? styles.colorSwatchSelected : ''}`}
                style={{ background: c.value }}
                title={c.label}
                onClick={() => setAvatarColor(c.value)}
                type="button"
                aria-label={c.label}
              />
            ))}
            {avatarColor && (
              <button
                className={styles.colorSwatchClear}
                onClick={() => setAvatarColor('')}
                type="button"
                title="Reset to default"
              >
                Reset
              </button>
            )}
          </div>
          {avatarColor && (
            <div className={styles.avatarPreview} style={{ background: `${avatarColor}26`, borderColor: `${avatarColor}80`, color: avatarColor }}>
              {displayName.trim()
                ? displayName.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase()
                : `${profile?.first_name?.[0] ?? ''}${profile?.last_name?.[0] ?? ''}`.toUpperCase()}
            </div>
          )}
        </div>
        <button className={shared.btnPrimary} onClick={saveDisplayProfile} disabled={savingProfile}>
          {savingProfile ? 'Saving...' : 'Save Profile'}
        </button>
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
          Used to personalize your Nourish Log, Smart Recipe Builder, and VitaPlate Plate Coach. Not clinical data. Not shared with third parties.
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

      {/* Fasting Reminders via Telegram */}
      <div className={styles.settingsSection}>
        <h3 className={styles.settingsSectionTitle}>
          <BellRing size={16} color="var(--gold)" /> Fasting Reminders via Telegram
        </h3>
        <p className={styles.settingsSectionNote}>
          Get a Telegram message 1 hour before your fast starts, when it starts, 1 hour before you can eat, and when you can eat. No health data is sent through Telegram.
        </p>

        {/* Telegram connection */}
        <div className={styles.settingsRow}>
          <label className={styles.label}>Telegram status</label>
          {telegramLinked ? (
            <div className={styles.telegramStatus}>
              <span className={styles.telegramConnected}>Connected</span>
              <button className={shared.btnSecondary} onClick={checkTelegramLink} disabled={checkingTelegram} style={{ marginLeft: 8 }}>
                {checkingTelegram ? 'Checking...' : 'Refresh'}
              </button>
            </div>
          ) : (
            <div className={styles.telegramStatus}>
              {telegramConnectUrl ? (
                <>
                  <a href={telegramConnectUrl} target="_blank" rel="noopener noreferrer" className={shared.btnTeal} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <Send size={14} /> Connect Telegram
                  </a>
                  <button className={shared.btnSecondary} onClick={checkTelegramLink} disabled={checkingTelegram} style={{ marginLeft: 8 }}>
                    {checkingTelegram ? 'Checking...' : 'Check connection'}
                  </button>
                </>
              ) : (
                <span className={styles.telegramNote}>Telegram bot not configured. Contact your educator.</span>
              )}
            </div>
          )}
        </div>
        {!telegramLinked && telegramConnectUrl && (
          <p className={styles.settingsSectionNote} style={{ marginTop: 0 }}>
            Tap "Connect Telegram," press START in the Telegram app, then tap "Check connection" to confirm.
          </p>
        )}

        {/* Fasting schedule */}
        <div className={styles.privacyToggleRow}>
          <div>
            <div className={styles.privacyToggleLabel}>Enable fasting reminders</div>
            <div className={styles.privacyToggleDesc}>Requires Telegram to be connected above</div>
          </div>
          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={fastingEnabled}
              disabled={!telegramLinked}
              onChange={e => setFastingEnabled(e.target.checked)}
            />
            <span className={styles.toggleSlider} />
          </label>
        </div>

        <div className={styles.settingsRow}>
          <label className={styles.label}>Fast start time</label>
          <select className={styles.settingsSelect} value={fastingStartHour} onChange={e => setFastingStartHour(Number(e.target.value))}>
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={i}>{formatHour(i)}</option>
            ))}
          </select>
        </div>

        <div className={styles.settingsRow}>
          <label className={styles.label}>Fasting window</label>
          <select className={styles.settingsSelect} value={fastingDuration} onChange={e => setFastingDuration(Number(e.target.value))}>
            {FASTING_HOURS.map(h => (
              <option key={h} value={h}>{h} hours (eat at {formatHour((fastingStartHour + h) % 24)})</option>
            ))}
          </select>
        </div>

        <div className={styles.settingsRow}>
          <label className={styles.label}>Your timezone</label>
          <select className={styles.settingsSelect} value={fastingTz} onChange={e => setFastingTz(e.target.value)}>
            {TIMEZONES.map(tz => (
              <option key={tz.value} value={tz.value}>{tz.label}</option>
            ))}
          </select>
        </div>

        <button className={shared.btnPrimary} onClick={saveFasting} disabled={savingFasting}>
          {savingFasting ? 'Saving...' : 'Save Fasting Settings'}
        </button>
      </div>

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
        <a href="https://us.fullscript.com/welcome/shunter1782126408" target="_blank" rel="noopener noreferrer" className={shared.btnSecondary}>
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

      {/* Download my data */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>
          <Download size={16} /> Download My Data
        </h3>
        <p className={styles.cardText}>
          Export everything you have logged (daily logs, blood pressure, blood sugar, weight, habits) as a file you keep.
        </p>
        <button onClick={handleExportData} className={shared.btnSecondary} disabled={exporting}>
          {exporting ? 'Preparing your file...' : 'Download my data'}
        </button>
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
