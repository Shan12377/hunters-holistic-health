import type { VercelRequest, VercelResponse } from '@vercel/node'

// Simple in-memory rate limit: max 5 requests per IP per 60 seconds.
// Resets on cold start (acceptable for a serverless subscribe endpoint).
const ipHits: Record<string, { count: number; resetAt: number }> = {}
const RATE_LIMIT = 5
const RATE_WINDOW_MS = 60_000

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = ipHits[ip]
  if (!entry || now > entry.resetAt) {
    ipHits[ip] = { count: 1, resetAt: now + RATE_WINDOW_MS }
    return false
  }
  entry.count += 1
  return entry.count > RATE_LIMIT
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  // Rate limit by IP
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? 'unknown'
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many requests' })
  }

  try {
    const apiKey = process.env.BEEHIIV_API_KEY
    const pubId  = process.env.BEEHIIV_PUBLICATION_ID

    if (!apiKey || !pubId) {
      console.error('[beehiiv-subscribe] Missing BEEHIIV_API_KEY or BEEHIIV_PUBLICATION_ID')
      return res.status(500).json({ error: 'Server configuration error' })
    }

    const { email, firstName, source } = req.body ?? {}

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'email is required' })
    }

    // Validate email format before forwarding
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' })
    }

    // firstName must be a non-empty string if provided
    const safeFirstName = typeof firstName === 'string' && firstName.trim().length > 0
      ? firstName.trim().slice(0, 100)
      : undefined

    const beehiivRes = await fetch(
      `https://api.beehiiv.com/v2/publications/${pubId}/subscriptions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          first_name: safeFirstName,
          reactivate_existing: false,
          send_welcome_email: false,
          utm_source: typeof source === 'string' && source.trim() ? source.trim().slice(0, 50) : 'app_signup',
          utm_medium: 'organic',
        }),
      }
    )

    if (!beehiivRes.ok) {
      const body = await beehiivRes.text()
      console.error('[beehiiv-subscribe] Beehiiv API error:', beehiivRes.status, body)
      return res.status(502).json({ error: 'Beehiiv API error', status: beehiivRes.status })
    }

    const data = await beehiivRes.json()
    return res.status(200).json({ ok: true, id: data.data?.id })
  } catch (err) {
    console.error('[beehiiv-subscribe] Unexpected error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
