import type { VercelRequest, VercelResponse } from '@vercel/node'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are a research literacy educator at Hunter's Holistic Health.
Summarize what published research says about a supplement. Never tell users what to do.

Return a JSON object with exactly this shape:
{
  "strength": "strong" | "moderate" | "emerging" | "limited",
  "strengthLabel": "One sentence describing the quality and quantity of evidence",
  "findings": ["finding 1", "finding 2", "finding 3"],
  "cautions": ["caution 1", "caution 2"],
  "populations": "One sentence about who has been studied",
  "disclaimer": "These statements have not been evaluated by the Food and Drug Administration. This content is for educational purposes only and is not intended to diagnose, treat, cure, or prevent any disease. Consult your healthcare provider before starting any supplement."
}

Rules:
- Use "research suggests" or "studies show" not "this will" or "you should"
- Never use the words diagnose, treat, cure, prescribe, or prevent
- Never recommend starting or stopping medication
- No em dashes in any text
- Findings and cautions must be short, under 20 words each
- Return valid JSON only, no markdown code fences`

interface ResearchData {
  strength: string
  strengthLabel: string
  findings: string[]
  cautions: string[]
  populations: string
  disclaimer: string
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Verify the caller is an authenticated user with a qualifying plan.
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' })
    const token = authHeader.slice(7)

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) return res.status(401).json({ error: 'Unauthorized' })

    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single()

    if (!profile || (profile.plan !== 'program' && profile.plan !== 'vip')) {
      return res.status(403).json({ error: 'Research Check requires a Program or VIP plan' })
    }

    const { supplementName, dose } = req.body as { supplementName?: string; dose?: string }
    if (!supplementName?.trim()) return res.status(400).json({ error: 'supplementName is required' })

    const response = await claude.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `Supplement: ${supplementName.trim()}\nDose: ${dose?.trim() || 'not specified'}\n\nSummarize the current research evidence.`,
      }],
    })

    const text = response.content.find(b => b.type === 'text')?.text ?? ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return res.status(500).json({ error: 'Could not parse research data' })

    const data = JSON.parse(jsonMatch[0]) as ResearchData
    res.status(200).json(data)
  } catch (err) {
    console.error('supplement-research error', err)
    res.status(500).json({ error: 'Research lookup failed. Please try again.' })
  }
}
