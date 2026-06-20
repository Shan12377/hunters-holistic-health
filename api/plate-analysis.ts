import type { VercelRequest, VercelResponse } from '@vercel/node'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const COMPLIANCE_SUFFIX =
  'This analysis is provided for educational purposes by a Functional Medicine Educator. It is not intended to diagnose, treat, cure, or prevent any disease. Consult your healthcare provider before making changes to your nutrition plan.'

const SYSTEM_PROMPT = `You are a Functional Medicine Educator reviewing a client's daily food plate for educational purposes.

Rules:
- Never use the words: diagnose, treat, cure, prescribe, prevent, or heal.
- Use only: support, optimize, suggest, promote, balance.
- Keep your response to 3 short paragraphs.
- Paragraph 1: What the plate does well based on the foods chosen.
- Paragraph 2: One specific food swap or addition that would improve protocol fit or nutrient density.
- Paragraph 3: One practical tip for the next meal slot they have not filled.
- End every response with this exact sentence: "${COMPLIANCE_SUFFIX}"`

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { plateDescription, activeProtocols, vitaScore, synergiesDetected, dayTotals } = req.body

  if (!plateDescription) return res.status(400).json({ error: 'plateDescription is required' })

  const userContent = `
Plate: ${plateDescription}
Active protocols: ${activeProtocols?.length ? activeProtocols.join(', ') : 'None specified'}
VitaScore: ${vitaScore}/100
Active synergies: ${synergiesDetected?.length ? synergiesDetected.join(', ') : 'None detected'}
Day totals: Protein ${dayTotals?.protein ?? 0}g, Carbs ${dayTotals?.carbs ?? 0}g, Fat ${dayTotals?.fat ?? 0}g, Calories ${dayTotals?.calories ?? 0}
`.trim()

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 400,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userContent },
      ],
    })

    const analysis = completion.choices[0]?.message?.content ?? ''
    res.status(200).json({ analysis })
  } catch (err) {
    console.error('plate-analysis error', err)
    res.status(500).json({ error: 'Analysis failed. Please try again.' })
  }
}
