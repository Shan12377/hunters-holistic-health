// Vercel Serverless Function: AI Meal Guard Backend Proxy
// This keeps your OpenAI API key server-side and never exposed to the browser.
// Deploy path: /api/meal-guard
//
// PRIVACY RULE (transient photo analysis): when a photo is included, it exists
// only inside this request. It is sent to the AI for identification, the
// response is returned, and the image is discarded. It is never written to
// disk, never stored in the database, and never logged. Do not add storage
// here without Dr. Hunter's review; stored photos move this feature to Lane 2.

import type { VercelRequest, VercelResponse } from '@vercel/node'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

function buildSystemPrompt(primaryGoal: string, dietaryPref: string): string {
  const goalLine = primaryGoal ? `The user's primary wellness goal is: ${primaryGoal}.` : 'The user has not specified a primary wellness goal.'
  const dietLine = dietaryPref ? `Their dietary preference is: ${dietaryPref}.` : ''
  return `You are a functional medicine nutrition educator assistant. ${goalLine} ${dietLine}

When a user logs a food item, provide educational context about how it aligns or conflicts with their stated goals. Always frame responses as educational information, never as medical advice or diagnosis. If a food conflicts with their goals, suggest 2 to 3 alternatives. Keep responses under 3 sentences.

STRICT RULES:
1. Never diagnose, treat, or prescribe
2. Never reference "Dr. Hunter" by name or say "Dr. Hunter recommends"
3. Never make disease claims
4. Always frame insights as educational information, not medical advice
5. Be encouraging and non-judgmental
6. Flag concerns with risk_level: "low", "medium", or "high"
7. Never use the em dash character in any output
8. End the educational_note with: "This is educational information only. Please consult your healthcare provider for personalized medical advice."

Respond ONLY with valid JSON in this exact format:
{
  "identified_food": string,
  "flagged": boolean,
  "risk_level": "low" | "medium" | "high",
  "warning": string | null,
  "alternatives": string[],
  "educational_note": string
}`
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { food, primary_goal, dietary_preference, image, nutrition_data } = req.body as {
    food?: string
    primary_goal?: string
    dietary_preference?: string
    image?: string
    nutrition_data?: { calories: number; protein: number; fat: number; carbs: number; notes?: string; source: string }
  }

  if ((!food || typeof food !== 'string') && !image) {
    return res.status(400).json({ error: 'A food name or a photo is required' })
  }

  // Guard payload size: reject images above ~5MB base64 to protect the function
  if (image && image.length > 5_000_000) {
    return res.status(413).json({ error: 'Photo too large. Please retake at a smaller size.' })
  }

  const nutritionContext = nutrition_data
    ? `Known nutritional data (per 100g serving): ${nutrition_data.calories} calories, ${nutrition_data.protein}g protein, ${nutrition_data.fat}g fat, ${nutrition_data.carbs}g carbs.${nutrition_data.notes ? ` Educational notes: ${nutrition_data.notes}` : ''} Source: ${nutrition_data.source === 'local' ? 'curated food database' : 'USDA FoodData Central'}.`
    : ''

  const context = `Analyze this food from a functional medicine education perspective. Consider: inflammatory potential, blood sugar impact, gut health, and alignment with a whole-food, anti-inflammatory approach.${nutritionContext ? ` ${nutritionContext}` : ''}`

  try {
    const userContent: OpenAI.Chat.ChatCompletionContentPart[] = []
    if (image) {
      userContent.push({
        type: 'text',
        text: `Identify the food or meal in this photo, then analyze it.${food ? ` The participant describes it as: "${food}".` : ''}
${context}`,
      })
      userContent.push({ type: 'image_url', image_url: { url: image, detail: 'low' } })
    } else {
      userContent.push({
        type: 'text',
        text: `Food item: "${food}"
${context}`,
      })
    }

    const SYSTEM_PROMPT = buildSystemPrompt(primary_goal ?? '', dietary_preference ?? '')

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userContent },
      ],
      temperature: 0.3,
      max_tokens: 400,
      response_format: { type: 'json_object' },
    })

    const result = JSON.parse(completion.choices[0].message.content ?? '{}')
    // The image variable goes out of scope here and is garbage collected.
    // Nothing from the photo is persisted or logged.
    return res.status(200).json(result)
  } catch (error) {
    console.error('Meal Guard API error (no photo data is ever logged)')
    // Graceful fallback; never block the user
    return res.status(200).json({
      identified_food: food ?? '',
      flagged: false,
      risk_level: 'low',
      warning: null,
      alternatives: [],
      educational_note: 'AI analysis temporarily unavailable. Please use your best judgment.',
    })
  }
}
