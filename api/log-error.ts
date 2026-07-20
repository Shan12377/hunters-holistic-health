// Client crash reporter. The frontend ErrorBoundary posts here so crashes show
// up in Vercel function logs instead of vanishing in users' browsers.
//
// PUBLIC BY DESIGN (approved, July 2026): errors can fire before login, this
// endpoint spends no money, touches no user data, stores nothing, and returns
// nothing. It only writes to the function log. Rate limited below.

import type { VercelRequest, VercelResponse } from '@vercel/node'

// Same in-memory limiter pattern as api/beehiiv-subscribe.ts
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? 'unknown'
  if (isRateLimited(ip)) return res.status(429).end()

  try {
    const { message, url } = req.body as { message?: string; url?: string }
    // Cap sizes so the log stays readable and the endpoint stays abuse-proof.
    console.error(
      '[client-error]',
      String(url ?? '').slice(0, 200),
      String(message ?? '').slice(0, 500)
    )
  } catch {
    // Nothing to do: logging must never throw.
  }

  return res.status(204).end()
}
