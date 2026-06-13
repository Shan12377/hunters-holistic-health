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

Your role: analyze a participant's self-reported wellness data from the past 7 days and return a short, personalized weekly pulse check.

STRICT RULES:
1. Never diagnose, treat, or prescribe anything
2. Never reference "Dr. Hunter" by name
3. Never make disease claims
4. Frame everything as educational lifestyle observations, not medical advice
5. Be warm, direct, and specific — reference the actual patterns in the data
6. Never use em dashes in any output
7. No filler phrases like "it is worth noting" or "in the realm of"
8. End the last insight with: "This is educational information. Always consult your healthcare provider for personalized medical guidance."

Respond ONLY with valid JSON in this exact format:
{
  "headline": "a single short sentence (under 12 words) that captures the tone of their week",
  "insights": [
    "first observation (2 sentences max)",
    "second observation (2 sentences max)",
    "third observation with disclaimer at the end (2 sentences max)"
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
      model: 'claude-opus-4-8',
      max_tokens: 1024,
      thinking: { type: 'adaptive' },
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
