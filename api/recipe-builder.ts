import type { VercelRequest, VercelResponse } from '@vercel/node'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const COMPLIANCE_SUFFIX =
  ' This recipe is provided for educational purposes by a Functional Medicine Educator. It is not intended to diagnose, treat, cure, or prevent any disease. Consult your healthcare provider before making changes to your nutrition plan.'

const RESTRICTION_RULES: Record<string, string> = {
  dairy_free:      'STRICT EXCLUSION: Do NOT use any dairy (milk, cheese, butter, cream, yogurt, ghee, whey, casein). Use plant-based alternatives if needed.',
  gluten_free:     'STRICT EXCLUSION: Do NOT use wheat, barley, rye, spelt, or any gluten-containing ingredients. Use certified gluten-free grains only.',
  soy_free:        'STRICT EXCLUSION: Do NOT use soy, tofu, tempeh, edamame, soy sauce, miso, or any soy derivative.',
  nut_free:        'STRICT EXCLUSION: Do NOT use any tree nuts (almonds, walnuts, cashews, etc.) or peanuts.',
  shellfish_free:  'STRICT EXCLUSION: Do NOT use shrimp, crab, lobster, scallops, clams, oysters, or any shellfish.',
  nightshade_free: 'STRICT EXCLUSION: Do NOT use tomatoes, peppers, eggplant, potatoes, or goji berries.',
  vegan:           'STRICT EXCLUSION: Do NOT use any animal products (meat, poultry, fish, dairy, eggs, honey).',
  vegetarian:      'STRICT EXCLUSION: Do NOT use meat, poultry, or fish.',
  pescatarian:     'RESTRICTION: Do NOT use meat or poultry. Fish and seafood are permitted.',
}

const HIGH_GMO_TERMS = ['corn', 'soy', 'soybeans', 'canola', 'canola oil', 'cottonseed', 'cottonseed oil', 'sugar beet', 'beet sugar', 'papaya', 'summer squash', 'alfalfa', 'zucchini']

const SYSTEM_PROMPT_BASE = `You are the Smart Recipe Builder for Hunter's Holistic Health, powered by VitaPlate AI.
You are an educational tool created by a Certified Functional and Nutritional Medicine Practitioner and PharmD.

YOUR ROLE: Generate practical, whole-food recipes optimized for metabolic and functional health education.
Prioritize: nutrient density, blood sugar stability, anti-inflammatory ingredients, and real food over processed alternatives.
When a user provides a cultural dish (Caribbean, Southern, etc.), honor the flavors while optimizing the ingredients functionally.

COMPLIANCE RULES (non-negotiable):
1. You are NOT a medical device, prescribing physician, Registered Dietitian, or Nutritionist. Never claim to be.
2. Never use: treat, cure, diagnose, prescribe, heal, prevent. Use: support, optimize, promote, balance, nourish.
3. Every recipe description MUST end with this exact compliance notice:${COMPLIANCE_SUFFIX}
4. Never recommend stopping or changing medication.
5. Never use em dashes or hyphens as separators in sentences (do not write " - " between clauses). Use a comma or a period instead.

GMO FLAGGING: For each ingredient, set "gmoFlag": true if it is a commonly genetically modified crop (corn, soy, canola oil, cottonseed oil, beet sugar, conventional papaya, zucchini, summer squash). Otherwise set "gmoFlag": false.

NUTRITION SCORE: Generate a score out of 100 based on protein density (30pts), micronutrient richness (40pts), and whole-food quality (30pts).

Return ONLY valid JSON (no markdown, no code fences) matching this exact schema:
{
  "recipeName": string,
  "description": string,
  "instructions": string[],
  "nutritionScore": number,
  "ingredients": [
    { "name": string, "amountGrams": number, "displayAmount": string, "gmoFlag": boolean }
  ]
}`

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { prompt, restrictions, userGoal, dietaryStyle } = req.body as {
    prompt?: string
    restrictions?: string[]
    userGoal?: string
    dietaryStyle?: string
  }

  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({ error: 'A recipe prompt is required' })
  }

  const activeRestrictions = (restrictions ?? [])
    .map(r => RESTRICTION_RULES[r])
    .filter(Boolean)

  const restrictionBlock = activeRestrictions.length > 0
    ? `\n\nACTIVE DIETARY RESTRICTIONS (MUST BE HONORED — NO EXCEPTIONS):\n${activeRestrictions.join('\n')}`
    : ''

  const userContextBlock = (userGoal || dietaryStyle)
    ? `\n\nUSER CONTEXT (use this to personalize the recipe):\n${userGoal ? `- Primary health goal: ${userGoal}` : ''}${dietaryStyle ? `\n- Dietary style: ${dietaryStyle}` : ''}\nOptimize ingredient choices, portion guidance, and description to align with this context.`
    : ''

  const systemPrompt = SYSTEM_PROMPT_BASE + userContextBlock + restrictionBlock

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }],
    })

    const raw = response.content.find(b => b.type === 'text')?.text ?? ''
    const jsonStart = raw.indexOf('{')
    const jsonEnd = raw.lastIndexOf('}')
    const recipeData = JSON.parse(raw.slice(jsonStart, jsonEnd + 1))

    // Flag GMO ingredients
    if (Array.isArray(recipeData.ingredients)) {
      recipeData.ingredients = recipeData.ingredients.map((ing: { name: string; gmoFlag?: boolean }) => ({
        ...ing,
        gmoFlag: ing.gmoFlag ?? HIGH_GMO_TERMS.some(term => ing.name.toLowerCase().includes(term)),
      }))
    }

    const hasUsdaKey = !!process.env.USDA_API_KEY
    let totalProtein = 0, totalCarbs = 0, totalFat = 0
    let totalZinc = 0, totalIron = 0, totalVitaminD = 0, totalVitaminB12 = 0

    const ingredientsWithNutrition = await Promise.all(
      (recipeData.ingredients ?? []).map(async (ing: { name: string; amountGrams: number; displayAmount: string; gmoFlag: boolean }) => {
        if (!hasUsdaKey) {
          const mock = { protein: ing.amountGrams * 0.2, carbs: ing.amountGrams * 0.1, fat: ing.amountGrams * 0.05, zinc: 0.5, iron: 0.5, vitaminD: 0, vitaminB12: 0 }
          totalProtein += mock.protein; totalCarbs += mock.carbs; totalFat += mock.fat
          return { ...ing, nutrients: mock, matchedName: ing.name + ' (Estimated)' }
        }
        try {
          const usdaRes = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(ing.name)}&api_key=${process.env.USDA_API_KEY}&pageSize=1`)
          if (!usdaRes.ok) return { ...ing, nutrients: null }
          const usdaData = await usdaRes.json()
          const food = usdaData.foods?.[0]
          if (!food) return { ...ing, nutrients: null }
          const get = (re: RegExp) => {
            const n = food.foodNutrients?.find((fn: { nutrientName: string; value: number }) => re.test(fn.nutrientName))
            return n ? (n.value * ing.amountGrams) / 100 : 0
          }
          const nutrients = { protein: get(/Protein/i), carbs: get(/Carbohydrate/i), fat: get(/Total lipid \(fat\)/i), zinc: get(/Zinc/i), iron: get(/Iron/i), vitaminD: get(/Vitamin D/i), vitaminB12: get(/Vitamin B-12/i) }
          totalProtein += nutrients.protein; totalCarbs += nutrients.carbs; totalFat += nutrients.fat
          totalZinc += nutrients.zinc; totalIron += nutrients.iron; totalVitaminD += nutrients.vitaminD; totalVitaminB12 += nutrients.vitaminB12
          return { ...ing, nutrients, fdcId: food.fdcId, matchedName: food.description }
        } catch {
          return { ...ing, nutrients: null }
        }
      })
    )

    return res.status(200).json({
      recipe: { ...recipeData, ingredients: ingredientsWithNutrition },
      totals: {
        protein: Math.round(totalProtein), carbs: Math.round(totalCarbs), fat: Math.round(totalFat),
        zinc: Math.round(totalZinc * 10) / 10, iron: Math.round(totalIron * 10) / 10,
        vitaminD: Math.round(totalVitaminD * 10) / 10, vitaminB12: Math.round(totalVitaminB12 * 10) / 10,
        usdaVerified: hasUsdaKey,
      },
    })
  } catch (error) {
    console.error('Recipe Builder error:', error)
    return res.status(500).json({ error: 'Failed to build recipe. Please try again.' })
  }
}
