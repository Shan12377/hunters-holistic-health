import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'

export default function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const s = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'test')
    res.status(200).json({ ok: true, stripe: typeof s })
  } catch (err: unknown) {
    res.status(200).json({ ok: false, error: String(err) })
  }
}
