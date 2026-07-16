import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

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

DSHEA disclaimer required any time a supplement is mentioned: "These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease."`

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
- Format: hook → mechanism → implication → confident observation.
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

    const {
      channel,
      topic,
      audience,
      contactName,
      contactStage,
      contactNotes,
      emailType,
    } = req.body as {
      channel: 'email' | 'sms' | 'whatsapp' | 'instagram' | 'linkedin' | 'facebook' | 'twitter'
      topic: string
      audience: string
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

    const emailTypeContext = channel === 'email' && emailType
      ? `Email purpose: ${({
          lead_outreach: 'First-touch outreach to a new lead.',
          consult_followup: 'Follow-up after a clarity call or consultation.',
          checkin: 'Check-in with an active client.',
          reengagement: 'Re-engagement message to someone who has gone quiet.',
          post_session: 'Post-session recap and next steps.',
          newsletter: 'General newsletter send to the list.',
          challenge_promo: 'Promoting a wellness challenge.',
        }[emailType] ?? emailType)}`
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

    // Parse structured sections for each channel
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

  } catch (err) {
    console.error('comms-draft: handler error', err instanceof Error ? err.message : 'unknown')
    return res.status(500).json({ error: 'Internal server error' })
  }
}
