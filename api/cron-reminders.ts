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

  const now = new Date()
  // HH:MM in UTC — each user's reminder_settings stores times in their local HH:MM
  // We match on HH:MM UTC; users set times knowing they are in their local timezone.
  // For v1 we treat all times as UTC. A timezone field can be added to profiles later.
  const hhmm = `${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}`

  // Fetch all profiles with reminder_settings and their push subscriptions
  const { data: rows, error } = await supabase
    .from('profiles')
    .select('id, reminder_settings, push_subscriptions(subscription)')
    .not('push_subscriptions', 'is', null)

  if (error) return res.status(500).json({ error: error.message })

  let sent = 0
  const errors: string[] = []

  for (const row of (rows ?? [])) {
    const settings = row.reminder_settings as Record<string, { enabled: boolean; time: string }> | null
    if (!settings) continue
    const sub = (row.push_subscriptions as unknown as { subscription: webpush.PushSubscription }[])?.[0]?.subscription
    if (!sub) continue

    for (const [key, copy] of Object.entries(REMINDER_COPY)) {
      const cfg = settings[key]
      if (!cfg?.enabled) continue
      // Match HH:MM — cron runs every 30 min so we match on the nearest half-hour
      if (cfg.time !== hhmm) continue

      try {
        await webpush.sendNotification(sub, JSON.stringify({
          title: copy.title,
          body: copy.body,
          icon: '/pwa-192.png',
          badge: '/logo-mark.png',
          tag: key,
          url: '/app/daily-log',
        }))
        sent++
      } catch (e: unknown) {
        errors.push(`${row.id}:${key} — ${e instanceof Error ? e.message : String(e)}`)
        // If subscription expired, clean it up
        if (e instanceof Error && e.message.includes('410')) {
          await supabase.from('push_subscriptions').delete().eq('user_id', row.id)
        }
      }
    }
  }

  return res.status(200).json({ sent, errors, hhmm })
}
