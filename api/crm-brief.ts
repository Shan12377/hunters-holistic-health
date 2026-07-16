import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    // Verify Supabase JWT and confirm educator role before touching OpenAI
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    const token = authHeader.slice(7)

    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) return res.status(401).json({ error: 'Unauthorized' })

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'educator') return res.status(403).json({ error: 'Forbidden' })

    const { action, contact, activities, appointments } = req.body as {
      action: 'brief' | 'followup'
      contact: { name: string; email: string; source: string; stage: string; notes: string }
      activities: Array<{ type: string; body: string; created_at: string }>
      appointments: Array<{ appointment_type: string | null; start_at: string; status: string }>
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) return res.status(500).json({ error: 'OpenAI key not configured' })

    const recentActs = activities
      .slice(0, 6)
      .map(a => `[${a.type}] ${a.body}`)
      .join('\n')

    const nextAppt = appointments.find(a => a.status === 'booked')
    const stageLabel = contact.stage.replace('client_', '').replace(/_/g, ' ')

    let systemPrompt = ''
    let userPrompt = ''

    if (action === 'brief') {
      systemPrompt = `You are an AI assistant for Dr. Shallanda Hunter, PharmD, CFNMP, a functional medicine educator. Generate concise session prep briefs. This is for educational planning only, not medical advice. Be specific and practical.`
      userPrompt = `Contact: ${contact.name} | Stage: ${stageLabel} | Source: ${contact.source}
Notes: ${contact.notes || 'None'}
Recent activity:
${recentActs || 'No activity logged yet'}
${nextAppt ? `Next session: ${nextAppt.appointment_type || 'Consultation'} on ${new Date(nextAppt.start_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}` : ''}

Write a 3-bullet session prep brief:
• Who this person is and where they are in their journey
• What they are looking for or what challenge they mentioned
• What to prioritize in this interaction

Each bullet: 1-2 sentences max. No medical advice. Educational context only.`
    } else {
      systemPrompt = `You are an AI assistant for Dr. Shallanda Hunter, PharmD, CFNMP, a functional medicine educator. Draft warm, personal follow-up messages. No medical advice. Educational context only. Write as if from Dr. Hunter directly.`
      userPrompt = `Contact: ${contact.name} | Stage: ${stageLabel}
Notes: ${contact.notes || 'None'}
Recent activity:
${recentActs || 'No activity logged yet'}

Draft a 2-3 sentence follow-up message that:
1. References where they are in the process or the last interaction
2. Offers a clear next step (book a session, check in on their progress, etc.)
3. Sounds warm and personal, not like a template

Do not include a greeting or sign-off. Just the body of the message.`
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      console.error('crm-brief: OpenAI returned', response.status)
      return res.status(502).json({ error: 'AI request failed' })
    }

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content?.trim() ?? ''
    return res.status(200).json({ text })

  } catch (err) {
    console.error('crm-brief: handler error', err instanceof Error ? err.message : 'unknown')
    return res.status(500).json({ error: 'Internal server error' })
  }
}
