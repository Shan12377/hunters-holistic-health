import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const VALID_EVENTS = ['daily_log', 'streak_bonus', 'challenge_checkin', 'feed_post', 'exercise_log'] as const
type PointEvent = typeof VALID_EVENTS[number]

// Max points claimable per event type — server enforces, client cannot override
const POINT_CAPS: Record<PointEvent, number> = {
  daily_log:        10,
  streak_bonus:     20,
  challenge_checkin: 5,
  feed_post:         5,
  exercise_log:      5,
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const supabaseUrl = process.env.SUPABASE_URL!
    const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const anonKey     = process.env.VITE_SUPABASE_ANON_KEY!

    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' })

    // Verify the caller's JWT to get their real user id
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user }, error: authError } = await userClient.auth.getUser()
    if (authError || !user) return res.status(401).json({ error: 'Unauthorized' })

    const { eventType, points, refId } = req.body
    if (!VALID_EVENTS.includes(eventType as PointEvent)) {
      return res.status(400).json({ error: 'Invalid event type' })
    }
    const cap = POINT_CAPS[eventType as PointEvent]
    if (typeof points !== 'number' || points <= 0 || points > cap) {
      return res.status(400).json({ error: 'Invalid points value' })
    }
    if (!refId || typeof refId !== 'string') {
      return res.status(400).json({ error: 'Missing refId' })
    }

    const admin = createClient(supabaseUrl, serviceKey)

    // Verify the underlying record actually exists and belongs to this user.
    // This prevents calling the endpoint with fake refIds to farm points.
    if (eventType === 'feed_post') {
      const { data } = await admin.from('feed_posts').select('id')
        .eq('id', refId).eq('user_id', user.id).single()
      if (!data) return res.status(403).json({ error: 'Invalid ref' })
    } else if (eventType === 'daily_log') {
      // refId is the log_date string e.g. "2026-07-05"
      const { data } = await admin.from('daily_logs').select('id')
        .eq('user_id', user.id).eq('log_date', refId).limit(1).maybeSingle()
      if (!data) return res.status(403).json({ error: 'Invalid ref' })
    } else if (eventType === 'streak_bonus') {
      // refId is "streak_YYYY-MM-DD" — extract the date
      const date = refId.replace(/^streak_/, '')
      const { data } = await admin.from('daily_logs').select('id')
        .eq('user_id', user.id).eq('log_date', date).limit(1).maybeSingle()
      if (!data) return res.status(403).json({ error: 'Invalid ref' })
    } else if (eventType === 'challenge_checkin') {
      // refId is "${challengeId}_${date}"
      const parts = refId.split('_')
      const challengeId = parts[0]
      const date = parts[1]
      const { data } = await admin.from('challenge_logs').select('id')
        .eq('user_id', user.id).eq('challenge_id', challengeId).eq('log_date', date).limit(1).maybeSingle()
      if (!data) return res.status(403).json({ error: 'Invalid ref' })
    } else if (eventType === 'exercise_log') {
      // refId is "${date}_${activityKey}". Movement logging moved from the old
      // exercise_logs table (one page, no relation to the Workout Tracker) onto
      // activity_sessions, the table the Workout Tracker's Movement tab already
      // wrote to, so a log made from either surface shows up on both.
      const idx = refId.indexOf('_')
      const date = refId.slice(0, idx)
      const activityKey = refId.slice(idx + 1)
      const { data } = await admin.from('activity_sessions').select('id')
        .eq('user_id', user.id).eq('session_date', date).eq('activity_key', activityKey).limit(1).maybeSingle()
      if (!data) return res.status(403).json({ error: 'Invalid ref' })
    }

    const { error } = await admin.from('points_log').insert({
      user_id:    user.id,
      event_type: eventType,
      points,
      ref_id:     refId,
    })

    if (error?.code === '23505') return res.status(200).json({ awarded: false, reason: 'already_awarded' })
    if (error) throw error

    return res.status(200).json({ awarded: true })
  } catch (err) {
    console.error('[award-points]', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
