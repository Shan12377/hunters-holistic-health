import { useState, useEffect } from 'react'
import { Bell, BellOff } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import {
  requestPushPermission, subscribeToPush, unsubscribeFromPush,
  getPushPermissionState,
  type ReminderSettings, DEFAULT_REMINDER_SETTINGS,
} from '@/lib/pushNotifications'
import toast from 'react-hot-toast'
import styles from '../../pages/client/Client.module.css'
import shared from '../../styles/shared.module.css'

const REMINDER_ROWS: { key: keyof ReminderSettings; label: string; desc: string }[] = [
  { key: 'fasting_open',  label: 'Fasting window opens',  desc: 'Notifies you when your fast begins (e.g. 7 PM)' },
  { key: 'fasting_close', label: 'Fasting window closes', desc: 'Notifies you when your eating window opens (e.g. 7 AM)' },
  { key: 'supplements',   label: 'Morning supplements',   desc: 'Reminder to take your supplement protocol' },
  { key: 'afternoon',     label: 'Afternoon check-in',    desc: 'Mid-day energy and hydration check' },
  { key: 'daily_log',     label: 'Daily log reminder',    desc: 'Nudge to complete your daily log before the day ends' },
]

export default function ReminderSettings() {
  const { profile, setProfile } = useAuthStore()
  const [permState, setPermState] = useState(getPushPermissionState())
  const [subscribed, setSubscribed] = useState(false)
  const [settings, setSettings] = useState<ReminderSettings>(
    (profile?.reminder_settings as unknown as ReminderSettings) ?? DEFAULT_REMINDER_SETTINGS
  )
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // Check if already subscribed
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then(reg =>
        reg.pushManager.getSubscription().then(sub => setSubscribed(!!sub))
      )
    }
    if (profile?.reminder_settings) {
      setSettings(profile.reminder_settings as unknown as ReminderSettings)
    }
  }, [profile?.id])

  const enablePush = async () => {
    if (!profile) return
    const result = await requestPushPermission()
    setPermState(getPushPermissionState())
    if (result !== 'granted') {
      toast.error('Notifications blocked. Enable them in your browser settings.')
      return
    }
    const ok = await subscribeToPush(profile.id)
    if (ok) {
      setSubscribed(true)
      toast.success('Notifications enabled!')
    } else {
      toast.error('Could not enable notifications. Try again.')
    }
  }

  const disablePush = async () => {
    if (!profile) return
    await unsubscribeFromPush(profile.id)
    setSubscribed(false)
    toast('Notifications turned off', { icon: '🔕' })
  }

  const updateReminder = (key: keyof ReminderSettings, field: 'enabled' | 'time', value: boolean | string) => {
    setSettings(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }))
  }

  const saveSettings = async () => {
    if (!profile) return
    setSaving(true)
    const { error } = await supabase.from('profiles')
      .update({ reminder_settings: settings })
      .eq('id', profile.id)
    if (error) {
      toast.error('Failed to save reminder settings')
    } else {
      setProfile({ ...profile, reminder_settings: settings as unknown as typeof profile.reminder_settings })
      toast.success('Reminder settings saved!')
    }
    setSaving(false)
  }

  const isUnsupported = permState === 'unsupported'

  return (
    <div className={styles.settingsSection}>
      <h3 className={styles.settingsSectionTitle}>
        <Bell size={16} color="var(--gold)" /> Reminders
      </h3>
      <p className={styles.settingsSectionNote}>
        Get push notifications for fasting windows, supplements, and daily check-ins. Works on your phone and desktop when the app is installed.
      </p>

      {isUnsupported ? (
        <div className={styles.infoNote}>
          Push notifications are not supported on this device or browser. Install the app to your home screen on iOS or Android to enable them.
        </div>
      ) : (
        <>
          {/* Master toggle */}
          <div className={styles.privacyToggleRow} style={{ marginBottom: 16 }}>
            <div>
              <div className={styles.privacyToggleLabel}>
                {subscribed ? 'Notifications on' : 'Notifications off'}
              </div>
              <div className={styles.privacyToggleDesc}>
                {subscribed
                  ? 'You will receive the reminders you enable below.'
                  : permState === 'denied'
                    ? 'Blocked in browser. Go to browser Settings to allow notifications for this site.'
                    : 'Tap to allow notifications for this app.'}
              </div>
            </div>
            {subscribed ? (
              <button onClick={disablePush} className={styles.reminderToggleBtn} aria-label="Disable notifications">
                <BellOff size={18} color="var(--text-secondary)" />
              </button>
            ) : (
              <button
                onClick={enablePush}
                className={shared.btnTeal}
                disabled={permState === 'denied'}
                style={{ fontSize: 13, padding: '7px 14px' }}
              >
                <Bell size={14} /> Enable
              </button>
            )}
          </div>

          {/* Per-reminder rows */}
          {subscribed && (
            <>
              {REMINDER_ROWS.map(({ key, label, desc }) => (
                <div key={key} className={styles.reminderRow}>
                  <label className={styles.toggle} style={{ marginRight: 10 }}>
                    <input
                      type="checkbox"
                      checked={settings[key].enabled}
                      onChange={e => updateReminder(key, 'enabled', e.target.checked)}
                    />
                    <span className={styles.toggleSlider} />
                  </label>
                  <div className={styles.reminderRowMeta}>
                    <div className={styles.privacyToggleLabel}>{label}</div>
                    <div className={styles.privacyToggleDesc}>{desc}</div>
                  </div>
                  <input
                    type="time"
                    value={settings[key].time}
                    disabled={!settings[key].enabled}
                    onChange={e => updateReminder(key, 'time', e.target.value)}
                    className={styles.reminderTimeInput}
                  />
                </div>
              ))}

              <div className={styles.reminderNote}>
                Times are in your local timezone. Reminders fire once per day at the time you set.
              </div>

              <button className={shared.btnPrimary} onClick={saveSettings} disabled={saving}>
                {saving ? 'Saving...' : 'Save Reminder Settings'}
              </button>
            </>
          )}
        </>
      )}
    </div>
  )
}
