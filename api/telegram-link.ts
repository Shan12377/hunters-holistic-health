import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import { timingSafeEqual } from 'crypto'

// Called by the n8n Telegram bot workflow when a user sends /start <userId> to the bot.
// n8n extracts the chat_id and the userId payload, then POST here to link the accounts.
//
// Uses N8N_INBOUND_SECRET (no VITE_ prefix) — server-only, never bundled to the client.
// Set this in Vercel env vars and in the n8n HTTP Request node header.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const secret = process.env.N8N_INBOUND_SECRET
  const incoming = String(req.headers['x-webhook-secret'] ?? '')

  // Constant-time comparison prevents timing attacks that could leak the secret length.
  if (!secret) return res.status(500).json({ error: 'Server misconfigured' })
  const secretBuf = Buffer.from(secret)
  const incomingBuf = Buffer.alloc(secretBuf.length)
  Buffer.from(incoming).copy(incomingBuf)
  if (!timingSafeEqual(secretBuf, incomingBuf) || incoming.length !== secret.length) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { userId, chatId } = req.body as { userId?: string; chatId?: string }
  if (!userId?.trim() || !chatId?.trim()) {
    return res.status(400).json({ error: 'userId and chatId are required' })
  }

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Verify the userId is a real profile before writing — prevents linking to arbitrary IDs.
    const { data: profile, error: lookupError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId.trim())
      .single()

    if (lookupError || !profile) {
      return res.status(404).json({ error: 'User not found' })
    }

    const { error } = await supabase
      .from('profiles')
      .update({ telegram_chat_id: chatId.trim() })
      .eq('id', userId.trim())

    if (error) {
      console.error('telegram-link error', error)
      return res.status(500).json({ error: 'Failed to link Telegram account' })
    }

    res.status(200).json({ ok: true })
  } catch (err) {
    console.error('telegram-link error', err)
    res.status(500).json({ error: 'Server error' })
  }
}

// To generate a value for N8N_INBOUND_SECRET, run once in your terminal:
// node -e "const {randomBytes}=require('crypto');console.log(randomBytes(32).toString('hex'))"
