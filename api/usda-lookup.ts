// USDA FoodData Central lookup proxy
// Keeps the API key server-side. Returns normalized nutrition data for a food query.
// Educational use only — data is used as context for the Meal Guard AI assistant.
// Lane 1 (non-PHI). No user data is stored or transmitted in this function.
import type { VercelRequest, VercelResponse } from '@vercel/node'

const NUTRIENT_IDS = {
  calories: 1008,
  protein:  1003,
  fat:      1004,
  carbs:    1005,
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const q = req.query.q
  if (!q || typeof q !== 'string' || !q.trim()) {
    return res.status(400).json({ error: 'Query parameter q is required' })
  }

  const apiKey = process.env.USDA_API_KEY
  if (!apiKey) {
    // No key configured — return not-found so the app falls back gracefully
    return res.status(200).json({ found: false })
  }

  try {
    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(q.trim())}&pageSize=3&api_key=${apiKey}`
    const r = await fetch(url)
    if (!r.ok) return res.status(200).json({ found: false })
    const data = await r.json()

    const food = data.foods?.[0]
    if (!food) return res.status(200).json({ found: false })

    const get = (id: number): number => {
      const n = food.foodNutrients?.find((x: { nutrientId: number; value: number }) => x.nutrientId === id)
      return n ? Math.round(n.value * 10) / 10 : 0
    }

    return res.status(200).json({
      found: true,
      name: food.description as string,
      fdcId: food.fdcId as number,
      calories: Math.round(get(NUTRIENT_IDS.calories)),
      protein:  get(NUTRIENT_IDS.protein),
      fat:      get(NUTRIENT_IDS.fat),
      carbs:    get(NUTRIENT_IDS.carbs),
      source: 'usda' as const,
    })
  } catch {
    return res.status(200).json({ found: false })
  }
}
