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

    // For feed posts, verify the post exists and belongs to this user
    if (eventType === 'feed_post') {
      const { data: post } = await admin
        .from('feed_posts')
        .select('id')
        .eq('id', refId)
        .eq('user_id', user.id)
        .single()
      if (!post) return res.status(403).json({ error: 'Invalid ref' })
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
