// Open Food Facts: free, keyless, CORS-enabled product database, looked up
// directly from the browser. No new Vercel function needed, which matters
// since this project is already at its function cap on the Hobby plan.
import { withTimeout } from '@/lib/withTimeout'
import type { NutritionData } from '@/lib/openai'

const LOOKUP_TIMEOUT_MS = 10000

interface BarcodeLookupResult {
  productName: string
  nutrition: NutritionData
}

export async function lookupBarcode(barcode: string): Promise<BarcodeLookupResult | null> {
  try {
    const res = await withTimeout(
      fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json?fields=product_name,nutriments,serving_size`),
      LOOKUP_TIMEOUT_MS,
      'Barcode lookup'
    )
    if (!res.ok) return null
    const data = await res.json()
    if (data.status !== 1 || !data.product) return null

    const n = data.product.nutriments ?? {}
    // Prefer per-serving figures when the product declares them; otherwise
    // fall back to per-100g, which is still useful but should be labeled
    // honestly as an estimate for a typical serving, not the whole package.
    const hasServing = n['energy-kcal_serving'] != null
    const calories = hasServing ? n['energy-kcal_serving'] : n['energy-kcal_100g']
    if (calories == null) return null

    const nutrition: NutritionData = {
      calories: Math.round(calories),
      protein: Math.round((hasServing ? n.proteins_serving : n.proteins_100g) ?? 0),
      fat: Math.round((hasServing ? n.fat_serving : n.fat_100g) ?? 0),
      carbs: Math.round((hasServing ? n.carbohydrates_serving : n.carbohydrates_100g) ?? 0),
      fiber: Math.round((hasServing ? n.fiber_serving : n.fiber_100g) ?? 0),
      source: 'barcode',
      notes: hasServing
        ? `Per serving (${data.product.serving_size ?? 'as declared by the product'}), from Open Food Facts.`
        : 'Per 100g, this product does not declare a serving size. Use the servings field below to match your actual portion.',
    }
    return { productName: data.product.product_name || 'Scanned product', nutrition }
  } catch (err) {
    console.error('[barcode] lookup failed:', err)
    return null
  }
}
