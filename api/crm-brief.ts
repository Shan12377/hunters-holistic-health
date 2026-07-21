import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ─── CRM BRIEF VOICE ────────────────────────────────────────────────────────

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

This is not a clinical context. This is educational health content for adults 40+ navigating metabolic health.

CORRECTIONS (permanent rules from past mistakes — never repeat these):
- Credential intro: always "licensed pharmacist and Certified Functional Nutritional Medicine Practitioner." Never "clinical pharmacist."
- "adrenal fatigue" is banned. Use "HPA axis dysregulation" instead.
- "we adjust" implies clinical management. Write "adjustments you make to your routine."
- "what your labs indicate" is clinical scope. Write "how to read your own lab trends."
- Never call a supplement "natural [drug name]" (example: "natural Ozempic"). State the actual mechanism.
- DEXA measures lean soft tissue. Say "lean soft tissue loss on DEXA," not "lean muscle loss."
- GLP-1 is one topic. It is never her entire identity.
- Scarcity must be real. Never claim an audience size she does not have.
- Personal testimony: "reversed, addressed, focused on" — never "fixed, treated, managed, cured."
- Only include what was asked for. Do not add unrequested information to client messages.`

// ─── COMMS STUDIO VOICE + CHANNEL RULES ─────────────────────────────────────

const VOICE_CORE = `You are writing as Dr. Shallanda Hunter, PharmD, MBA, CFNMP — a licensed pharmacist and Certified Functional Nutritional Medicine Practitioner. She runs Hunter's Holistic Health, a metabolic health education platform in St. Petersburg, FL.

Her identity: root-cause metabolic health educator. She reversed her own metabolic condition. Her topics: hormone balance, thyroid, adrenal health, BHRT, metabolic health, GLP-1 education. GLP-1 is ONE topic, never her entire identity.

VOICE LAWS — non-negotiable:

1. NO DASHES AS PUNCTUATION. No em dashes (—), en dashes (–), or hyphens between clauses. Rewrite with a period, comma, or colon.

2. EDUCATOR FRAMING ONLY. She teaches. Never treats, diagnoses, prescribes, or manages.
   Say "client" not "patient." Say "session" not "appointment." Say "educational wellness roadmap" not "treatment plan."

3. FORBIDDEN WORDS: delve, tapestry, multifaceted, pivotal, intricate, meticulous, nuanced, showcase, ensure, realm, garner.
   Never open with: Moreover, Furthermore, Additionally, In conclusion, In summary.

4. ONE IDEA PER SENTENCE. Short sentences. Third-grade reading level for consumer content. Never nest two ideas in one sentence.

5. NO OUTLINE ENDINGS. End with a specific next step, human line, or CTA. Never summarize what you just wrote.

6. SIGN-OFF: "Dr. Hunter" only. Never warmly, best, sincerely.

Her authority framing: "I am a licensed pharmacist and Certified Functional Nutritional Medicine Practitioner. I reversed my own metabolic health twice."

DSHEA disclaimer required any time a supplement is mentioned: "These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease."

CORRECTIONS (permanent rules from past mistakes — never repeat these):
- Credential intro: always "licensed pharmacist and Certified Functional Nutritional Medicine Practitioner." Never "clinical pharmacist" — that signals an active clinical role.
- "adrenal fatigue" is banned. Use "HPA axis dysregulation" instead.
- "we adjust" implies clinical management. Write "adjustments you make to your routine."
- "what your labs indicate" is clinical scope. Write "how to read your own lab trends and ask better questions of your provider."
- Never call a supplement "natural [drug name]" (example: "natural Ozempic"). State the actual mechanism instead.
- DEXA studies measure lean soft tissue, not just muscle. Say "lean soft tissue loss on DEXA." Never say "lean muscle loss" or "muscle wasting."
- GLP-1 is one content topic. It is never her entire identity or specialty.
- Scarcity must be real. Never claim an audience size she does not have. For a new list, say "small exclusive group of founding readers."
- Personal testimony: "reversed, addressed, focused on" her own condition. Never "fixed, treated, managed, cured."
- Only include what was asked for. Never add unrequested information to client messages.`

const CHANNEL_RULES: Record<string, string> = {
  email: `EMAIL RULES:
- Subject line: curiosity or direct benefit. Under 60 chars. Split-test worthy.
- First sentence: rewrites what they think they know OR opens with a pointed question. Never "I hope this finds you well."
- One main mechanism explained fully. Nothing left abstract.
- CTA: one imperative line. No softening. No "feel free to."
- P.S.: second hook or "reply YES" engagement prompt.
- Footer on every email: "Educational content only, not medical advice. I'm a PharmD acting as a functional medicine educator, not your prescribing physician. Always consult your healthcare provider. Unsubscribe anytime: {{UNSUBSCRIBE_LINK}}"
- Under 250 words total.

Format response as:
SUBJECT: [subject line]

BODY:
[email body]`,

  sms: `SMS/TEXT RULES:
- Must fit on one screen. Under 160 characters if possible, 320 maximum.
- Template: "They say [common myth], but [her counter-evidence or personal story]. [Link or next step]. Dr. Hunter"
- No jargon. No explanation. One idea only.
- No paragraphs. No line breaks unless essential.
- Sound like a text from a knowledgeable friend, not a newsletter.

Format response as:
MESSAGE:
[text message]`,

  whatsapp: `WHATSAPP RULES:
- More conversational than SMS but still one screen.
- Can use 2-3 short sentences maximum.
- Warm but direct. Feels like a personal message, not a broadcast.
- Can include a question at the end to invite a reply.
- No links unless specifically asked for.
- Sign off: "Dr. Hunter"

Format response as:
MESSAGE:
[WhatsApp message]`,

  instagram: `INSTAGRAM RULES:
- Caption: one to three punchy sentences. Plain language. White space.
- The hook (first sentence) must stop the scroll. Stat, reversal, or relatable moment.
- Scientific citations go in the PINNED COMMENT, not the caption.
- End with a question or soft CTA ("Save this." or "Tag someone who needs to see this.")
- 3-5 hashtags at the bottom, relevant to functional/metabolic health.
- No em dashes, no bullet lists in the caption.

Format response as:
CAPTION:
[Instagram caption]

PINNED COMMENT:
[Citations and educational note for pinned comment]

HASHTAGS:
[hashtags]`,

  linkedin: `LINKEDIN RULES:
- Clinical authority voice. Technical terms are appropriate but always followed by a structured argument.
- Speak to peers and motivated health professionals.
- First line must hook a peer-level reader. No "Excited to share..."
- Format: hook then mechanism then implication then confident observation.
- Can be longer (200-400 words) but every paragraph must advance the argument.
- End with a confident observation or question for the professional community.
- No hashtag dump. 2-3 relevant professional hashtags only.

Format response as:
POST:
[LinkedIn post]

HASHTAGS:
[hashtags]`,

  facebook: `FACEBOOK RULES:
- Warm and direct. Community tone.
- Translate every technical term immediately after using it. "Cortisol (the stress hormone that drives belly fat storage)."
- First sentence: relatable moment or question the audience has asked themselves.
- Can be 100-200 words. Every paragraph: one idea.
- End with a question that invites comments from the community.
- No jargon left unexplained.

Format response as:
POST:
[Facebook post]`,

  twitter: `X (TWITTER) RULES:
- One punchy idea per post. Provocative when evidence supports it.
- Cite the stat and source inline. "In the STEP 1 trial (NEJM, 2021)..."
- Under 280 characters for a standalone post.
- If it needs to be a thread, format as a numbered series with "Thread:" at the start.
- Thread posts separated with dividers, never sequential numbers.
- No em dashes anywhere.

Format response as:
POST:
[Twitter/X post or thread]`,
}

const WORKSPACE_ID = '00000000-0000-0000-0000-000000000001'

const SOURCE_MAP: Record<string, string> = {
  early_access:     'intake_join',
  clinical_inquiry: 'intake_clinical_inquiry',
  support:          'intake_support',
  feature_request:  'intake_feature_request',
}

// ─── HANDLER ─────────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { action } = req.body as { action?: string }

    // ── WEBHOOK: Lead submission from n8n (webhook secret auth) ──────────────
    if (action === 'lead_submit') {
      const secret = process.env.VITE_N8N_WEBHOOK_SECRET
      const incoming = req.headers['x-webhook-secret']
      if (!secret || incoming !== secret) return res.status(401).json({ error: 'Unauthorized' })

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

      const { data: existing } = await supabase
        .from('leads')
        .select('id')
        .eq('workspace_id', WORKSPACE_ID)
        .eq('email', email)
        .neq('status', 'converted')
        .maybeSingle()

      let leadId: string
      if (existing) {
        await supabase.from('leads').update({ source, updated_at: new Date().toISOString() }).eq('id', existing.id)
        leadId = existing.id
      } else {
        const { data: newLead, error } = await supabase.from('leads').insert({
          workspace_id: WORKSPACE_ID,
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
          source,
          status: 'new',
        }).select('id').single()
        if (error || !newLead) return res.status(500).json({ error: 'Failed to create lead' })
        leadId = newLead.id
      }

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
    }

    // ── All other actions require educator JWT auth ───────────────────────────
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' })
    const token = authHeader.slice(7)

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) return res.status(401).json({ error: 'Unauthorized' })

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'educator') return res.status(403).json({ error: 'Forbidden' })

    // ── COMMS POLISH ────────────────────────────────────────────────────────
    if (action === 'comms_polish') {
      const { channel, draft, topic, audience } = req.body as {
        channel: string; draft: string; topic?: string; audience?: string
      }
      if (!draft) return res.status(400).json({ error: 'draft is required' })
      const polishPrompt = `You are editing a draft written by Dr. Shallanda Hunter. Your job is to polish it, not rewrite it.

Keep her words, her rhythm, her examples. Fix grammar, tighten sentences, remove filler, and make sure it sounds like her. Do not add new ideas she did not include. Do not change her meaning. Do not add em dashes.

Channel: ${channel}
${topic ? `Context / goal: ${topic}` : ''}
${audience ? `Audience: ${audience}` : ''}

DRAFT TO POLISH:
${draft}

Return only the polished version. No preamble, no explanation.`

      const message = await claude.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 900,
        system: VOICE_CORE,
        messages: [{ role: 'user', content: polishPrompt }],
      })
      const text = message.content[0].type === 'text' ? message.content[0].text.trim() : ''
      return res.status(200).json({ raw: text, message: text, body: text, post: text })
    }

    // ── COMMS STUDIO DRAFT ──────────────────────────────────────────────────
    if (action === 'comms_draft') {
      const {
        channel,
        topic,
        audience,
        contactName,
        contactStage,
        contactNotes,
        emailType: commsDraftEmailType,
      } = req.body as {
        channel: 'email' | 'sms' | 'whatsapp' | 'instagram' | 'linkedin' | 'facebook' | 'twitter'
        topic: string
        audience?: string
        contactName?: string
        contactStage?: string
        contactNotes?: string
        emailType?: string
      }

      if (!channel || !topic) return res.status(400).json({ error: 'channel and topic are required' })
      const channelRules = CHANNEL_RULES[channel]
      if (!channelRules) return res.status(400).json({ error: 'Unknown channel' })

      const contactContext = contactName
        ? `This is for a specific person: ${contactName}${contactStage ? ` (${contactStage.replace('client_', '').replace(/_/g, ' ')})` : ''}${contactNotes ? `. Notes: ${contactNotes}` : ''}.`
        : 'This is general content, not for a specific individual.'

      const emailTypeContext = channel === 'email' && commsDraftEmailType
        ? `Email purpose: ${({
            lead_outreach: 'First-touch outreach to a new lead.',
            consult_followup: 'Follow-up after a clarity call or consultation.',
            checkin: 'Check-in with an active client.',
            reengagement: 'Re-engagement message to someone who has gone quiet.',
            post_session: 'Post-session recap and next steps.',
            newsletter: 'General newsletter send to the list.',
            challenge_promo: 'Promoting a wellness challenge.',
          } as Record<string, string>)[commsDraftEmailType] ?? commsDraftEmailType}`
        : ''

      const userPrompt = `Write a ${channel} post/message in Dr. Hunter's voice.

Topic: ${topic}
Audience: ${audience || 'Adults 40+ navigating metabolic health, hormone balance, or weight management'}
${contactContext}
${emailTypeContext}

${channelRules}

Follow all voice laws. No em dashes. Educator framing only.`

      const message = await claude.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 700,
        system: VOICE_CORE,
        messages: [{ role: 'user', content: userPrompt }],
      })

      const text = message.content[0].type === 'text' ? message.content[0].text.trim() : ''
      const parsed: Record<string, string> = { raw: text }

      if (channel === 'email') {
        const subjectMatch = text.match(/^SUBJECT:\s*(.+)$/m)
        const bodyMatch = text.match(/BODY:\s*([\s\S]+)/m)
        parsed.subject = subjectMatch?.[1]?.trim() ?? ''
        parsed.body = bodyMatch?.[1]?.trim() ?? text
      } else if (channel === 'instagram') {
        const captionMatch = text.match(/CAPTION:\s*([\s\S]+?)(?=PINNED COMMENT:|HASHTAGS:|$)/m)
        const pinnedMatch = text.match(/PINNED COMMENT:\s*([\s\S]+?)(?=HASHTAGS:|$)/m)
        const hashtagsMatch = text.match(/HASHTAGS:\s*([\s\S]+?)$/m)
        parsed.caption = captionMatch?.[1]?.trim() ?? text
        parsed.pinned = pinnedMatch?.[1]?.trim() ?? ''
        parsed.hashtags = hashtagsMatch?.[1]?.trim() ?? ''
      } else if (channel === 'linkedin' || channel === 'facebook' || channel === 'twitter') {
        const postMatch = text.match(/POST:\s*([\s\S]+?)(?=HASHTAGS:|$)/m)
        const hashtagsMatch = text.match(/HASHTAGS:\s*([\s\S]+?)$/m)
        parsed.post = postMatch?.[1]?.trim() ?? text
        parsed.hashtags = hashtagsMatch?.[1]?.trim() ?? ''
      } else if (channel === 'sms' || channel === 'whatsapp') {
        const msgMatch = text.match(/MESSAGE:\s*([\s\S]+?)$/m)
        parsed.message = msgMatch?.[1]?.trim() ?? text
      }

      return res.status(200).json(parsed)
    }

    // ── CRM BRIEF / FOLLOWUP / EMAIL DRAFT ──────────────────────────────────
    const { emailType, contact, activities, appointments } = req.body as {
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

    } else if (action === 'objection_draft') {
      const { objectionType, prospectNotes } = req.body as {
        objectionType: string
        prospectNotes?: string
      }

      const OBJECTION_SCRIPTS: Record<string, string> = {
        too_expensive: `The objection is "too expensive." The prospect is comparing price to what they know, not to what this is worth.

Your response must:
- Acknowledge without apologizing
- Anchor to the real cost of NOT acting (time lost, money spent on things that didn't work, health decline continuing)
- Show the math: $4,997 for the 6-Month Overhaul vs. another year of trial-and-error, random supplements, and co-pays
- One sentence on real scarcity: only 3 Overhaul spots available, none until the next cohort
- Close with one question that reveals their actual priority`,

        not_right_time: `The objection is "not the right time." There is no perfect time. The real issue is priority.

Your response must:
- Validate the season they're in, genuinely
- Pivot to what they already told you about their health: if it matters enough to show up to a call, it matters enough to act
- Ask: "When would be the right time, and what would need to be different?"
- Offer a way to hold their spot (waitlist, application on file)
- No guilt, no pressure. Warm and direct.`,

        need_to_think: `The objection is "I need to think about it." This usually means they have a question they didn't ask.

Your response must:
- Name what thinking often masks: uncertainty about the outcome, wondering if they're the right fit, or a money question they haven't said yet
- Give them permission to name it: "What specifically would help you decide?"
- Remind them what they came to the call looking for
- One line on what happens while they wait (the health situation keeps going)
- Do not pressure. Do invite.`,

        need_spouse: `The objection is "I need to talk to my spouse." This is often real and should be respected.

Your response must:
- Acknowledge it immediately and genuinely
- Offer to help them have that conversation: give them 2-3 sentences they can actually say to their partner
- Give a clear deadline: the spot is held for 48 hours
- Offer a joint call if they want: 15 minutes, both of them, all questions answered
- No pressure. Clear timeline.`,
      }

      const script = OBJECTION_SCRIPTS[objectionType]
      if (!script) return res.status(400).json({ error: 'Unknown objection type' })

      const userPrompt = `${script}

${prospectNotes ? `About this prospect: ${prospectNotes}` : ''}

Pricing to reference if needed:
- Foundation: $37/month
- The Program: $97/month
- VIP Intensive: $997
- 6-Month Overhaul: $4,997 (only 3 spots, next cohort TBD)

Write a response script for Dr. Hunter to use on a sales call or in a follow-up message.
Requirements:
- Conversational, warm, direct. Not salesy.
- 100-200 words.
- Prose only, no bullet points in the output.
- No em dashes.
- End with one clear question or call to action.`

      const msg = await claude.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        system: VOICE_CORE,
        messages: [{ role: 'user', content: userPrompt }],
      })
      const objText = msg.content[0].type === 'text' ? msg.content[0].text.trim() : ''
      return res.status(200).json({ raw: objText })

    } else {
      return res.status(400).json({ error: 'Invalid action' })
    }

    const message = await claude.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      system: VOICE_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text.trim() : ''

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
