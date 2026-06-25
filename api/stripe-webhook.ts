import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Map Stripe price IDs to plan names.
// Fill STRIPE_PRICE_* env vars from Stripe Dashboard > Products > each price.
const PRICE_TO_PLAN: Record<string, string> = {
  [process.env.STRIPE_PRICE_FOUNDATION_MONTHLY ?? '']: 'foundation',
  [process.env.STRIPE_PRICE_FOUNDATION_ANNUAL  ?? '']: 'foundation',
  [process.env.STRIPE_PRICE_PROGRAM_MONTHLY    ?? '']: 'program',
  [process.env.STRIPE_PRICE_PROGRAM_ANNUAL     ?? '']: 'program',
  [process.env.STRIPE_PRICE_VIP_MONTHLY        ?? '']: 'vip',
  [process.env.STRIPE_PRICE_VIP_ANNUAL         ?? '']: 'vip',
}

export const config = { api: { bodyParser: false } }

async function getRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const sig = req.headers['stripe-signature'] as string
  const rawBody = await getRawBody(req)

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature failed:', err)
    return res.status(400).json({ error: 'Invalid signature' })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    // Get the price ID from line items
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 1 })
    const priceId = lineItems.data[0]?.price?.id ?? ''
    const plan = PRICE_TO_PLAN[priceId]

    if (!plan) {
      console.warn('No plan mapped for price ID:', priceId)
      return res.status(200).json({ received: true })
    }

    const email = session.customer_details?.email
    const customerId = session.customer as string

    if (!email) {
      console.warn('No email on session:', session.id)
      return res.status(200).json({ received: true })
    }

    // Look up user by email via Supabase Auth admin API
    const { data: { users } } = await supabase.auth.admin.listUsers()
    const user = users.find(u => u.email === email)

    if (!user) {
      console.warn('No Supabase user found for email:', email)
      return res.status(200).json({ received: true })
    }

    await supabase
      .from('profiles')
      .update({ plan, stripe_customer_id: customerId })
      .eq('id', user.id)

    console.log(`Plan updated: ${email} → ${plan}`)
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription
    const customerId = sub.customer as string

    await supabase
      .from('profiles')
      .update({ plan: 'foundation' })
      .eq('stripe_customer_id', customerId)

    console.log(`Subscription cancelled, reverted to foundation: ${customerId}`)
  }

  return res.status(200).json({ received: true })
}
