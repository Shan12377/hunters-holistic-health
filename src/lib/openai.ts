// AI Meal Guard: calls your backend proxy (never expose OpenAI key in frontend)
// The backend proxy is defined in /api/meal-guard.ts (Vercel serverless function)

export interface MealGuardResult {
  flagged: boolean
  risk_level: 'low' | 'medium' | 'high'
  warning: string | null
  alternatives: string[]
  educational_note: string
}

export async function checkMealGuard(
  foodName: string,
  healthProfile: string[]
): Promise<MealGuardResult> {
  try {
    const response = await fetch('/api/meal-guard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ food: foodName, health_profile: healthProfile }),
    })
    if (!response.ok) throw new Error('Meal Guard API error')
    return await response.json()
  } catch {
    // Graceful fallback; never block the user from logging food
    return {
      flagged: false,
      risk_level: 'low',
      warning: null,
      alternatives: [],
      educational_note: '',
    }
  }
}
