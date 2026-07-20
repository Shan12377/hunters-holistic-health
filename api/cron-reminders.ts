import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'

webpush.setVapidDetails(
  'mailto:info@huntersholistichealth.com',
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const REMINDER_COPY: Record<string, { title: string; body: string }> = {
  morning:       { title: "Good morning from Hunter's Holistic Health", body: "One small step starts the day. Log your water or your first meal and keep your rhythm going." },
  fasting_open:  { title: "Fasting window open", body: "Your fast starts now. Log your last meal and let the window begin." },
  fasting_close: { title: "Fasting window closed", body: "Time to break your fast. Log your first meal when you are ready." },
  supplements:   { title: "Supplement reminder", body: "Time for your supplements. Log them in the app to keep your streak." },
  afternoon:     { title: "Afternoon check-in", body: "How is your energy today? Log a quick check-in to stay on track." },
  daily_log:     { title: "Daily log reminder", body: "Did you log today? Take 60 seconds to complete your daily check-in." },
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Vercel cron sends GET with a special header; guard against public access
  if (req.headers['authorization'] !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).end()
  }

  // ponytail: Vercel Hobby allows one cron per day, so this runs once at 11:00 UTC
  // (7 AM Eastern in summer, 6 AM in winter) and sends ONE morning reminder to every
  // subscribed member with any reminder enabled, ignoring per-reminder HH:MM times.
  // Upgrade path: on Vercel Pro, set the schedule back to */30 and restore matching
  // each REMINDER_COPY key against its cfg.time (times are stored per user already).

  // Fetch all profiles with reminder_settings and their push subscriptions
  const { data: rows, error } = await supabase
    .from('profiles')
    .select('id, reminder_settings, push_subscriptions(subscription)')
    .not('push_subscriptions', 'is', null)

  if (error) return res.status(500).json({ error: error.message })

  const morning = REMINDER_COPY.morning

  let sent = 0
  const errors: string[] = []

  for (const row of (rows ?? [])) {
    const settings = row.reminder_settings as Record<string, { enabled: boolean; time: string }> | null
    if (!settings) continue
    // Any enabled reminder counts as opting in to the morning nudge.
    if (!Object.values(settings).some(cfg => cfg?.enabled)) continue
    const sub = (row.push_subscriptions as unknown as { subscription: webpush.PushSubscription }[])?.[0]?.subscription
    if (!sub) continue

    try {
      await webpush.sendNotification(sub, JSON.stringify({
        title: morning.title,
        body: morning.body,
        icon: '/pwa-192.png',
        badge: '/logo-mark.png',
        tag: 'morning',
        url: '/app/daily-log',
      }))
      sent++
    } catch (e: unknown) {
      errors.push(`${row.id} — ${e instanceof Error ? e.message : String(e)}`)
      // If subscription expired, clean it up
      if (e instanceof Error && e.message.includes('410')) {
        await supabase.from('push_subscriptions').delete().eq('user_id', row.id)
      }
    }
  }

  return res.status(200).json({ sent, errors })
}
