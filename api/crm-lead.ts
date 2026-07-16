import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const WORKSPACE_ID = '00000000-0000-0000-0000-000000000001'

const SOURCE_MAP: Record<string, string> = {
  early_access:      'intake_join',
  clinical_inquiry:  'intake_clinical_inquiry',
  support:           'intake_support',
  feature_request:   'intake_feature_request',
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const secret = process.env.VITE_N8N_WEBHOOK_SECRET
    const incoming = req.headers['x-webhook-secret']
    if (!secret || incoming !== secret) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const body = req.body ?? {}
    const submissionType: string = body.submissionType ?? body.submission_type ?? ''
    const email: string = (body.email ?? '').trim().toLowerCase()
    const fullName: string = (body.name ?? '').trim()
    const nameParts = fullName.split(' ')
    const firstName = nameParts[0] ?? ''
    const lastName = nameParts.slice(1).join(' ') || null
    const phone: string | null = body.phone ?? null
    const source = SOURCE_MAP[submissionType] ?? 'intake_join'

    if (!email) return res.status(400).json({ error: 'email is required' })

    // Check for existing non-converted lead with this email
    const { data: existing } = await supabase
      .from('leads')
      .select('id')
      .eq('workspace_id', WORKSPACE_ID)
      .eq('email', email)
      .neq('status', 'converted')
      .maybeSingle()

    let leadId: string

    if (existing) {
      // Touch existing lead
      await supabase
        .from('leads')
        .update({ source, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
      leadId = existing.id
    } else {
      // Create new lead
      const { data: newLead, error } = await supabase
        .from('leads')
        .insert({
          workspace_id: WORKSPACE_ID,
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
          source,
          status: 'new',
        })
        .select('id')
        .single()

      if (error || !newLead) {
        console.error('Lead insert error:', error)
        return res.status(500).json({ error: 'Failed to create lead' })
      }
      leadId = newLead.id
    }

    // Log form_submission activity
    const activityBody = [
      `Form: ${submissionType}`,
      body.message ? `Message: ${body.message}` : null,
      body.symptoms ? `Symptoms: ${body.symptoms}` : null,
      body.goals ? `Goals: ${body.goals}` : null,
      body.hearAbout ? `Heard about us: ${body.hearAbout}` : null,
    ].filter(Boolean).join(' | ')

    await supabase.from('activities').insert({
      workspace_id: WORKSPACE_ID,
      lead_id: leadId,
      type: 'form_submission',
      body: activityBody || `Submitted ${submissionType} form`,
    })

    return res.status(200).json({ ok: true, leadId })
  } catch (err) {
    console.error('crm-lead error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
