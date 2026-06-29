import type { VercelRequest, VercelResponse } from '@vercel/node'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const COMPLIANCE_SUFFIX =
  'This analysis is provided for educational purposes by a Certified Functional and Nutritional Medicine Practitioner and PharmD. It is not intended to diagnose, treat, cure, or prevent any disease. Consult your healthcare provider before making changes to your nutrition plan.'

const SYSTEM_PROMPT = `You are the VitaPlate AI Plate Coach for Hunter's Holistic Health.
You are an educational tool created by a Certified Functional and Nutritional Medicine Practitioner and PharmD.

YOUR ROLE: Review a user's daily food plate and provide specific, personalized educational feedback grounded in functional and nutritional medicine.
Prioritize: blood sugar stability, anti-inflammatory foods, micronutrient density, protein adequacy, and food synergies.
Be direct, warm, and specific. Reference the actual foods on their plate. Never be generic.

COMPLIANCE RULES (non-negotiable):
1. Never use: diagnose, treat, cure, prescribe, prevent, heal. Use: support, optimize, suggest, promote, balance, nourish.
2. Never recommend stopping or changing medication.
3. Never use em dashes or hyphens as separators in sentences (do not write " - " between clauses). Use a comma or a period instead.
4. Keep response to 3 focused paragraphs.

STRUCTURE:
- Paragraph 1: What this plate does well based on the specific foods chosen and any active synergies.
- Paragraph 2: One specific food swap or addition that would best serve this user's goal and improve the plate.
- Paragraph 3: One practical tip for their next meal or the rest of their day.
- End with: "${COMPLIANCE_SUFFIX}"`

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { plateDescription, activeProtocols, vitaScore, synergiesDetected, dayTotals, userGoal, dietaryStyle } = req.body

  if (!plateDescription) return res.status(400).json({ error: 'plateDescription is required' })

  const userContextBlock = (userGoal || dietaryStyle)
    ? `\nUser health goal: ${userGoal || 'not specified'}\nDietary style: ${dietaryStyle || 'not specified'}\nUse this context to make your feedback specific to what this person is working toward.\n`
    : ''

  const userContent = `${userContextBlock}
Plate for today:
${plateDescription}

Active protocols: ${activeProtocols?.length ? activeProtocols.join(', ') : 'None specified'}
VitaScore: ${vitaScore}/100
Active food synergies detected: ${synergiesDetected?.length ? synergiesDetected.join(', ') : 'None'}
Day totals so far: Protein ${dayTotals?.protein ?? 0}g, Carbs ${dayTotals?.carbs ?? 0}g, Fat ${dayTotals?.fat ?? 0}g, Calories ${dayTotals?.calories ?? 0}

Give personalized educational feedback on this plate.`.trim()

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userContent }],
    })

    const analysis = response.content.find(b => b.type === 'text')?.text ?? ''
    res.status(200).json({ analysis })
  } catch (err) {
    console.error('plate-analysis error', err)
    res.status(500).json({ error: 'Analysis failed. Please try again.' })
  }
}
