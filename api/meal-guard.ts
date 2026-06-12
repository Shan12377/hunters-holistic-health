// Vercel Serverless Function: AI Meal Guard Backend Proxy
// This keeps your OpenAI API key server-side and never exposed to the browser.
// Deploy path: /api/meal-guard

import type { VercelRequest, VercelResponse } from '@vercel/node'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { food, health_profile } = req.body as { food: string; health_profile: string[] }

  if (!food || typeof food !== 'string') {
    return res.status(400).json({ error: 'Food name is required' })
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant for Hunter's Holistic Health, a functional medicine education platform. 
Your role is to provide EDUCATIONAL insights about food choices, not medical advice.
You help participants understand potential considerations with their food choices from a functional medicine education perspective.

IMPORTANT RULES:
1. Never diagnose, treat, or prescribe
2. Always frame insights as educational information, not medical advice
3. Be encouraging and non-judgmental
4. Flag concerns with risk_level: "low", "medium", or "high"
5. Always suggest alternatives when flagging
6. Include an educational note about WHY a food may be worth considering
7. Keep responses concise and practical

Respond ONLY with valid JSON in this exact format:
{
  "flagged": boolean,
  "risk_level": "low" | "medium" | "high",
  "warning": string | null,
  "alternatives": string[],
  "educational_note": string
}`,
        },
        {
          role: 'user',
          content: `Food item: "${food}"
Health context: ${health_profile.length > 0 ? health_profile.join(', ') : 'General wellness program participant'}

Analyze this food from a functional medicine education perspective. Consider: inflammatory potential, blood sugar impact, gut health, and alignment with a whole-food, anti-inflammatory approach.`,
        },
      ],
      temperature: 0.3,
      max_tokens: 400,
      response_format: { type: 'json_object' },
    })

    const result = JSON.parse(completion.choices[0].message.content ?? '{}')
    return res.status(200).json(result)
  } catch (error) {
    console.error('Meal Guard API error:', error)
    // Graceful fallback; never block the user
    return res.status(200).json({
      flagged: false,
      risk_level: 'low',
      warning: null,
      alternatives: [],
      educational_note: 'AI analysis temporarily unavailable. Please use your best judgment.',
    })
  }
}
