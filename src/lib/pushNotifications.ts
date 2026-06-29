import { supabase } from './supabase'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)))
}

export async function requestPushPermission(): Promise<'granted' | 'denied' | 'unsupported'> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return 'unsupported'
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return 'denied'
  return 'granted'
}

export function getPushPermissionState(): 'granted' | 'denied' | 'default' | 'unsupported' {
  if (!('Notification' in window)) return 'unsupported'
  return Notification.permission
}

export async function subscribeToPush(userId: string): Promise<boolean> {
  try {
    const reg = await navigator.serviceWorker.ready
    const existing = await reg.pushManager.getSubscription()
    const sub = existing ?? await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as unknown as string,
    })
    const { error } = await supabase.from('push_subscriptions').upsert(
      { user_id: userId, subscription: sub.toJSON() },
      { onConflict: 'user_id' }
    )
    return !error
  } catch {
    return false
  }
}

export async function unsubscribeFromPush(userId: string): Promise<void> {
  try {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    if (sub) await sub.unsubscribe()
    await supabase.from('push_subscriptions').delete().eq('user_id', userId)
  } catch { /* ignore */ }
}

export interface ReminderSettings {
  fasting_open:  { enabled: boolean; time: string }
  fasting_close: { enabled: boolean; time: string }
  supplements:   { enabled: boolean; time: string }
  afternoon:     { enabled: boolean; time: string }
  daily_log:     { enabled: boolean; time: string }
}

export const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  fasting_open:  { enabled: false, time: '19:00' },
  fasting_close: { enabled: false, time: '07:00' },
  supplements:   { enabled: false, time: '08:00' },
  afternoon:     { enabled: false, time: '13:00' },
  daily_log:     { enabled: false, time: '18:00' },
}
