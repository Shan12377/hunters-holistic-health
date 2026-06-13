// AI Meal Guard: calls your backend proxy (never expose OpenAI key in frontend)
// The backend proxy is defined in /api/meal-guard.ts (Vercel serverless function)
//
// Photo analysis is TRANSIENT by design: the image is held in memory, sent for
// one analysis, and discarded. It is never uploaded to storage or saved to the
// database. Only the food name text and the AI result are ever logged.
//
// PRIVACY: goal text is passed through sanitizeGoalText() before leaving the browser.
// This removes clinical diagnosis language (e.g. "Type 2 diabetes") and replaces it
// with safe educational equivalents ("blood sugar management").

import { sanitizeMealGuardPayload } from '@/lib/deidSanitizer'

export interface NutritionData {
  calories: number
  protein: number
  fat: number
  carbs: number
  notes?: string
  source: 'local' | 'usda'
}

export interface MealGuardResult {
  identified_food?: string
  flagged: boolean
  risk_level: 'low' | 'medium' | 'high'
  warning: string | null
  alternatives: string[]
  educational_note: string
}

export async function checkMealGuard(
  foodName: string,
  primaryGoal: string,
  dietaryPreference: string,
  imageDataUrl?: string,
  nutrition?: NutritionData
): Promise<MealGuardResult> {
  try {
    const sanitized = sanitizeMealGuardPayload({
      food: foodName || undefined,
      primary_goal: primaryGoal || undefined,
      dietary_preference: dietaryPreference || undefined,
    })
    const response = await fetch('/api/meal-guard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        food: sanitized.food,
        primary_goal: sanitized.primary_goal,
        dietary_preference: sanitized.dietary_preference,
        image: imageDataUrl || undefined,
        nutrition_data: nutrition || undefined,
      }),
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

// Downscale a photo in the browser before sending it for analysis.
// Keeps the payload small and strips metadata; output is a JPEG data URL.
export function downscaleImage(file: File, maxSide = 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      const ctx = canvas.getContext('2d')
      if (!ctx) { URL.revokeObjectURL(url); reject(new Error('Canvas unavailable')); return }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.8))
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read photo')) }
    img.src = url
  })
}
