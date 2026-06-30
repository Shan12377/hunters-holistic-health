import type { VercelRequest, VercelResponse } from '@vercel/node'

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(200).json({ ok: true, env: !!process.env.STRIPE_SECRET_KEY })
}
