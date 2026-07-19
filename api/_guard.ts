// Shared request guard for money-spending API routes (see CLAUDE.md, API Endpoint Auth Rule).
// Files starting with an underscore are not exposed as endpoints by Vercel.
//
// Usage at the top of a handler:
//   const user = await requireUser(req, res)
//   if (!user) return   // 401/429 response already sent

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import type { User } from '@supabase/supabase-js'

// In-memory IP rate limit, same pattern as api/beehiiv-subscribe.ts.
// Resets on cold start, which is acceptable for these endpoints.
const ipHits: Record<string, { count: number; resetAt: number }> = {}
const RATE_LIMIT = 10
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

/**
 * Rate-limits by IP, then verifies the Supabase Bearer token.
 * Returns the authenticated user, or null after sending a 401/429 response.
 */
export async function requireUser(req: VercelRequest, res: VercelResponse): Promise<User | null> {
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? 'unknown'
  if (isRateLimited(ip)) {
    res.status(429).json({ error: 'Too many requests' })
    return null
  }

  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' })
    return null
  }

  // Client is created inside the function, never at module level (see CLAUDE.md).
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: { user }, error } = await supabase.auth.getUser(authHeader.slice(7))
  if (error || !user) {
    res.status(401).json({ error: 'Unauthorized' })
    return null
  }

  return user
}
