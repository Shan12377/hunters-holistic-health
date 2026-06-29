// Vercel Serverless Function: Weekly Pulse AI Backend
// Calls Claude (Anthropic) to generate personalized weekly wellness insights.
// The API key lives server-side only — never exposed to the browser.
// Results are cached in Supabase; this function fires at most once per user per week.
//
// PRIVACY DESIGN:
//   All raw clinical measurements (BP numbers, glucose values, names) are stripped
//   in the browser by src/lib/deidSanitizer.ts before this function is called.
//   This function receives only de-identified zone categories and behavioral counts.
//   No PHI reaches this function or Anthropic's API.

import type { VercelRequest, VercelResponse } from '@vercel/node'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are a functional medicine wellness educator assistant built for Hunter's Holistic Health.

Your role: analyze a participant's self-reported wellness data from the past 7 days and return a short, personalized weekly pulse check grounded in published research.

WRITING FORMAT — follow this pattern for every insight:
Lead with a published finding. Then connect it to their specific logged data. Then give one practical takeaway.

Example of the correct tone:
"Research shows that consistent daily hydration is linked to measurably better energy and cognitive performance in adults. You logged water intake on 6 of 7 days this week, which puts you in the range where the benefit compounds. Keep that habit anchored to the same time each day."

STRICT RULES:
1. Never diagnose, treat, or prescribe anything
2. Never reference any educator by name
3. Never make disease claims
4. Always lead each insight with a research anchor: "Research shows...", "Studies find...", "Evidence suggests...", "A published review found..."
5. Then connect it directly to their logged data (use the actual counts and patterns)
6. Be warm, direct, and specific
7. Never use em dashes or hyphens as separators in sentences (do not write " - " between clauses). Use a comma or a period instead
8. No filler phrases: no "it is worth noting", "in the realm of", "delve into", "leverage", "unlock"
9. End the last insight with: "This is educational information. Always consult your healthcare provider for personalized medical guidance."
10. Short sentences. Active voice. Write like a knowledgeable friend.

Respond ONLY with valid JSON in this exact format:
{
  "headline": "a single short sentence (under 12 words) that captures the tone of their week",
  "insights": [
    "research anchor + their data pattern + one takeaway (3 sentences max)",
    "research anchor + their data pattern + one takeaway (3 sentences max)",
    "research anchor + their data pattern + one takeaway + disclaimer (3 sentences max)"
  ]
}`

// Sanitized payload — no names, no raw clinical numbers. Only zone categories and behavioral counts.
interface SanitizedPulsePayload {
  primaryGoal: string
  logsCompleted: number
  totalDays: number
  avgSteps: number
  avgWaterOz: number
  avgEnergy: number
  fastingDays: number
  supplementDays: number
  bpSummary: string
  bsSummary: string
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const payload = req.body as SanitizedPulsePayload

  if (!payload || typeof payload.logsCompleted !== 'number') {
    return res.status(400).json({ error: 'Invalid request body' })
  }

  const userContent = `Participant wellness data for the past 7 days:

Goal: ${payload.primaryGoal || 'Not specified'}
Daily check-ins completed: ${payload.logsCompleted} of ${payload.totalDays} days
Average steps per logged day: ${payload.avgSteps.toFixed(0)} (goal: 8,000)
Average water intake per logged day: ${payload.avgWaterOz.toFixed(0)} oz (goal: 64 oz)
Average self-reported energy level: ${payload.avgEnergy > 0 ? payload.avgEnergy.toFixed(1) + '/10' : 'not logged'}
Days with morning fast completed: ${payload.fastingDays}
Days with AM supplements taken: ${payload.supplementDays}
${payload.bpSummary}
${payload.bsSummary}

Generate a personalized weekly pulse check based on these wellness patterns.`

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userContent }],
    })

    const textBlock = response.content.find(b => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('No text block in response')
    }

    const raw = textBlock.text.trim()
    const jsonStart = raw.indexOf('{')
    const jsonEnd = raw.lastIndexOf('}')
    const result = JSON.parse(raw.slice(jsonStart, jsonEnd + 1))

    if (!result.headline || !Array.isArray(result.insights)) {
      throw new Error('Unexpected response shape')
    }

    return res.status(200).json(result)
  } catch (error) {
    console.error('Weekly Pulse API error:', error)
    return res.status(200).json({
      headline: 'You showed up this week. That matters.',
      insights: [
        'Consistency over perfection: every day you log is a data point that builds your health picture.',
        'Small habits compound. Whether it was water, steps, or fasting, each choice adds up over time.',
        'Keep going. Progress is not always linear; each week is a chance to learn. This is educational information. Always consult your healthcare provider for personalized medical guidance.',
      ],
    })
  }
}
