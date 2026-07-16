import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Voice rules embedded so every CRM communication sounds like Dr. Hunter
const VOICE_SYSTEM_PROMPT = `You are writing as Dr. Shallanda Hunter, PharmD, MBA, CFNMP — a licensed pharmacist and Certified Functional Nutritional Medicine Practitioner. She runs Hunter's Holistic Health, a metabolic health education platform.

VOICE LAWS — violating these is not optional:

1. NO DASHES AS PUNCTUATION. Never use em dashes (—), en dashes (–), or hyphens between clauses. Rewrite the sentence to avoid the dash. Use a comma, period, or colon instead.
   WRONG: "Your ferritin dropped 300 points — that is not small."
   RIGHT: "Your ferritin dropped 300 points. That is not small."

2. EDUCATOR FRAMING ONLY. She teaches. She does not treat, diagnose, prescribe, or manage.
   Never say: "patient," "appointment," "treatment plan," "I'll help you manage your condition."
   Always say: "client" or "individual," "session" or "clarity call," "educational wellness roadmap," "navigate your health."

3. FORBIDDEN WORDS. Never use: delve, tapestry, multifaceted, pivotal, intricate, meticulous, nuanced, showcase, ensure, realm, garner.
   Never open paragraphs with: Moreover, Furthermore, Additionally, In conclusion, In summary.

4. SHORT SENTENCES. One idea per sentence. Third-grade reading level for any consumer-facing content. Never nest two ideas in one sentence.

5. NO OUTLINE-STYLE ENDINGS. End every piece of content with a specific next step, a human line, or a CTA. Never summarize what you just said.

6. NO NEGATIVE PARALLELISM. Never write "It is not X, it is Y." Write "It works alongside your doctor, never instead of them."

7. SIGN-OFF: Always "Dr. Hunter" only. Never "warmly," "best," or "sincerely."

8. FOOTER DISCLAIMER on every email: "Educational content only, not medical advice. I'm a PharmD acting as a functional medicine educator, not your prescribing physician. Always consult your healthcare provider. Unsubscribe anytime: {{UNSUBSCRIBE_LINK}}"

EMAIL VOICE PATTERNS — study these:
- Opens with a question OR a one-sentence reversal of what they think they know. Never starts with "I hope this finds you well" or any preamble.
- Data appears in the same sentence as emotion. Not a stat followed by a feeling. They arrive together.
- One mechanism per email, fully explained, nothing left abstract.
- The CTA is one imperative line. No softening, no "feel free to."
- P.S. is used for a second hook or a "reply YES" engagement prompt.

Example of her opening patterns:
- "Quick question. What did your fasting glucose measure this morning? Not your dinner. Not your discipline. Your liver."
- "You asked for clarity. Here it is."
- "The scale weighs everything: muscle, water, bone, that salty dinner. It cannot tell you the one thing that matters most."

This is not a clinical context. This is educational health content for adults 40+ navigating metabolic health.`

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' })
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

    const { action, emailType, contact, activities, appointments } = req.body as {
      action: 'brief' | 'followup' | 'email_draft'
      emailType?: 'lead_outreach' | 'consult_followup' | 'checkin' | 'reengagement' | 'post_session'
      contact: { name: string; email: string; source: string; stage: string; notes: string }
      activities: Array<{ type: string; body: string; created_at: string }>
      appointments: Array<{ appointment_type: string | null; start_at: string; status: string }>
    }

    const recentActs = activities
      .slice(0, 6)
      .map(a => `[${a.type}] ${a.body}`)
      .join('\n')

    const nextAppt = appointments.find(a => a.status === 'booked')
    const stageLabel = contact.stage.replace('client_', '').replace(/_/g, ' ')
    const firstName = contact.name.split(' ')[0] || contact.name

    let userPrompt = ''

    if (action === 'brief') {
      userPrompt = `Contact: ${contact.name} | Stage: ${stageLabel} | Source: ${contact.source}
Notes: ${contact.notes || 'None'}
Recent activity:
${recentActs || 'No activity logged yet'}
${nextAppt ? `Next session: ${nextAppt.appointment_type || 'Consultation'} on ${new Date(nextAppt.start_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}` : ''}

Write a 3-bullet session prep brief for Dr. Hunter:
- Who this person is and where they are in their journey
- What they are looking for or what challenge they mentioned
- What to prioritize in this interaction

Each bullet: 1-2 sentences max. Educational context only. No medical advice.`

    } else if (action === 'followup') {
      userPrompt = `Contact: ${firstName} | Stage: ${stageLabel}
Notes: ${contact.notes || 'None'}
Recent activity:
${recentActs || 'No activity logged yet'}

Draft a 2-3 sentence follow-up message in Dr. Hunter's voice. Requirements:
- References where they are in the process or the last interaction
- Offers one clear next step
- No greeting, no sign-off — just the body of the message
- No dashes as punctuation
- Short sentences, warm and direct`

    } else if (action === 'email_draft') {
      const emailContext: Record<string, string> = {
        lead_outreach: `This is a first-touch email. ${firstName} just joined the list or was added manually. They have not yet booked a clarity call. Goal: warm them up, deliver immediate value, and invite them to take one small step.`,
        consult_followup: `${firstName} booked a clarity call. This is the follow-up email after the consultation. Goal: recap the key insight from the session, reinforce the educational value, and offer the next step (joining the platform or a follow-up session).`,
        checkin: `${firstName} is an active client. This is a check-in email. Goal: acknowledge where they are, celebrate any momentum, and keep the relationship warm with a specific question or resource.`,
        reengagement: `${firstName} has gone quiet. Last activity was a while ago. This is a re-engagement email. Goal: no guilt, no pressure. Open with something valuable. One gentle CTA.`,
        post_session: `${firstName} just completed a session. This is the post-session follow-up. Goal: reference the most important thing discussed, give them one clear action to take before the next session.`,
      }

      const context = emailContext[emailType ?? 'lead_outreach']

      userPrompt = `Contact: ${firstName} | Stage: ${stageLabel}
Notes: ${contact.notes || 'None'}
Recent activity:
${recentActs || 'No activity logged yet'}

Email context: ${context}

Write a complete email in Dr. Hunter's voice. Format your response exactly like this:

SUBJECT: [subject line here]

BODY:
[email body here]

Requirements:
- Subject line: curiosity or direct benefit. No clickbait. Under 60 characters.
- First sentence: rewrites what they think they know OR opens with a pointed question. Never "I hope this finds you well."
- One main idea or mechanism. Fully explained. Nothing left abstract.
- Short sentences. One idea per sentence.
- No em dashes, no en dashes, no hyphens as punctuation.
- CTA: one imperative sentence. No softening.
- Sign off: "Dr. Hunter"
- P.S.: one line, second hook or reply prompt.
- Final line: "Educational content only, not medical advice. I'm a PharmD acting as a functional medicine educator, not your prescribing physician. Always consult your healthcare provider. Unsubscribe anytime: {{UNSUBSCRIBE_LINK}}"
- Under 250 words total.`
    }

    const message = await claude.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      system: VOICE_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text.trim() : ''

    // For email drafts, parse subject and body separately
    if (action === 'email_draft') {
      const subjectMatch = text.match(/^SUBJECT:\s*(.+)$/m)
      const bodyMatch = text.match(/BODY:\s*([\s\S]+)/m)
      return res.status(200).json({
        text,
        subject: subjectMatch?.[1]?.trim() ?? '',
        body: bodyMatch?.[1]?.trim() ?? text,
      })
    }

    return res.status(200).json({ text })

  } catch (err) {
    console.error('crm-brief: handler error', err instanceof Error ? err.message : 'unknown')
    return res.status(500).json({ error: 'Internal server error' })
  }
}
