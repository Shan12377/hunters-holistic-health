import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

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
  try {
    return await handleWebhook(req, res)
  } catch (err: unknown) {
    console.error('stripe-webhook: unhandled error:', err)
    return res.status(500).json({ error: 'Unhandled error', detail: String(err) })
  }
}

async function handleWebhook(req: VercelRequest, res: VercelResponse) {
  console.log('stripe-webhook: handler started')

  if (req.method !== 'POST') return res.status(405).end()

  let stripe: Stripe
  try {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  } catch (err) {
    console.error('stripe-webhook: failed to init Stripe client:', err)
    return res.status(500).json({ error: 'Stripe init failed', detail: String(err) })
  }

  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
  const supabase = createClient(
    supabaseUrl!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const PRICE_TO_PLAN: Record<string, string> = {
    [process.env.STRIPE_PRICE_FOUNDATION_MONTHLY ?? '']: 'foundation',
    [process.env.STRIPE_PRICE_FOUNDATION_ANNUAL  ?? '']: 'foundation',
    [process.env.STRIPE_PRICE_PROGRAM_MONTHLY    ?? '']: 'program',
    [process.env.STRIPE_PRICE_PROGRAM_ANNUAL     ?? '']: 'program',
    [process.env.STRIPE_PRICE_VIP_MONTHLY        ?? '']: 'vip',
    [process.env.STRIPE_PRICE_VIP_ANNUAL         ?? '']: 'vip',
  }

  const sig = req.headers['stripe-signature'] as string

  let rawBody: Buffer
  try {
    rawBody = await getRawBody(req)
  } catch (err) {
    console.error('stripe-webhook: getRawBody failed:', err)
    return res.status(500).json({ error: 'Body read failed', detail: String(err) })
  }

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

    // Look up user by email — fetch up to 1000 users to avoid missing paginated results
    const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 })
    const user = users.find(u => u.email === email)

    if (!user) {
      console.warn('No Supabase user found for email:', email)
      return res.status(200).json({ received: true })
    }

    await supabase
      .from('profiles')
      .update({ plan, stripe_customer_id: customerId })
      .eq('id', user.id)

    // CRM: convert any open lead with this email
    const { data: lead } = await supabase
      .from('leads')
      .select('id')
      .eq('email', email)
      .neq('status', 'converted')
      .limit(1)
      .maybeSingle()

    if (lead) {
      await supabase
        .from('leads')
        .update({ status: 'converted', converted_to_profile_id: user.id })
        .eq('id', lead.id)
      await supabase
        .from('activities')
        .insert({ lead_id: lead.id, type: 'stage_change', body: `Converted to client on ${plan} plan` })
      console.log(`CRM: lead ${lead.id} converted for ${email}`)
    }

    console.log(`Plan updated: ${email} → ${plan}`)
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription
    const customerId = sub.customer as string

    await supabase
      .from('profiles')
      .update({ plan: 'free' })
      .eq('stripe_customer_id', customerId)

    console.log(`Subscription cancelled, reverted to free: ${customerId}`)
  }

  return res.status(200).json({ received: true })
}
