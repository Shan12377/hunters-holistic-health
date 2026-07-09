import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const apiKey = process.env.BEEHIIV_API_KEY
    const pubId = process.env.BEEHIIV_PUBLICATION_ID

    if (!apiKey || !pubId) {
      console.error('[beehiiv-subscribe] Missing BEEHIIV_API_KEY or BEEHIIV_PUBLICATION_ID')
      return res.status(500).json({ error: 'Server configuration error' })
    }

    const { email, firstName } = req.body
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'email is required' })
    }

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
          first_name: firstName || undefined,
          reactivate_existing: false,
          send_welcome_email: false,
          utm_source: 'app_signup',
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
