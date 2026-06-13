export type FoodCategory = 'proteins' | 'vegetables' | 'healthy-fats' | 'complex-carbs' | 'fruits' | 'dairy-eggs' | 'spices-herbs'

export interface FoodItem {
  id: string
  name: string
  category: FoodCategory
  calories: number
  proteinGrams: number
  fatGrams: number
  carbGrams: number
  notes: string
}

export const FOOD_DATABASE: FoodItem[] = [
  // ── Proteins ──────────────────────────────────────────────────────────────
  { id: 'f1',  name: 'Wild Salmon',              category: 'proteins',      calories: 208, proteinGrams: 28, fatGrams: 10, carbGrams: 0,  notes: 'Rich in omega-3s; supports inflammation reduction.' },
  { id: 'f2',  name: 'Chicken Breast',           category: 'proteins',      calories: 165, proteinGrams: 31, fatGrams: 3,  carbGrams: 0,  notes: 'Lean protein; excellent for satiety and muscle support.' },
  { id: 'f3',  name: 'Ground Turkey',            category: 'proteins',      calories: 170, proteinGrams: 29, fatGrams: 6,  carbGrams: 0,  notes: 'Lean, versatile protein source.' },
  { id: 'f4',  name: 'Sardines',                 category: 'proteins',      calories: 191, proteinGrams: 23, fatGrams: 11, carbGrams: 0,  notes: 'Exceptionally high omega-3 and CoQ10 content.' },
  { id: 'f5',  name: 'Grass-Fed Beef',           category: 'proteins',      calories: 215, proteinGrams: 26, fatGrams: 12, carbGrams: 0,  notes: 'Higher CLA content than grain-fed; supports metabolic health.' },
  { id: 'f6',  name: 'Tempeh',                   category: 'proteins',      calories: 195, proteinGrams: 20, fatGrams: 11, carbGrams: 9,  notes: 'Fermented soy; supports gut microbiome diversity.' },
  { id: 'f7',  name: 'Lentils',                  category: 'complex-carbs', calories: 230, proteinGrams: 18, fatGrams: 1,  carbGrams: 40, notes: 'High fiber; prebiotic support for gut health.' },
  { id: 'f8',  name: 'Shrimp',                   category: 'proteins',      calories: 99,  proteinGrams: 24, fatGrams: 0,  carbGrams: 0,  notes: 'Very low calorie, high protein. Ideal for metabolic health support.' },
  { id: 'f9',  name: 'Pasture-Raised Eggs',      category: 'dairy-eggs',    calories: 155, proteinGrams: 13, fatGrams: 11, carbGrams: 1,  notes: 'Complete amino acid profile; rich in choline.' },
  { id: 'f10', name: 'Tuna',                     category: 'proteins',      calories: 130, proteinGrams: 29, fatGrams: 1,  carbGrams: 0,  notes: 'Convenient high-protein option; choose BPA-free cans.' },
  { id: 'f11', name: 'Bone Broth',               category: 'proteins',      calories: 45,  proteinGrams: 10, fatGrams: 1,  carbGrams: 0,  notes: 'Collagen and glycine support gut lining integrity and joint health.' },
  { id: 'f12', name: 'Edamame',                  category: 'proteins',      calories: 188, proteinGrams: 18, fatGrams: 8,  carbGrams: 14, notes: 'Complete plant protein; isoflavones support hormone balance.' },
  { id: 'f13', name: 'Cod',                      category: 'proteins',      calories: 105, proteinGrams: 23, fatGrams: 1,  carbGrams: 0,  notes: 'Very lean white fish; high selenium content.' },

  // ── Vegetables ────────────────────────────────────────────────────────────
  { id: 'v1',  name: 'Spinach',                  category: 'vegetables',    calories: 23,  proteinGrams: 3,  fatGrams: 0,  carbGrams: 4,  notes: 'Exceptional source of folate, magnesium, and iron.' },
  { id: 'v2',  name: 'Broccoli',                 category: 'vegetables',    calories: 55,  proteinGrams: 4,  fatGrams: 1,  carbGrams: 11, notes: 'Sulforaphane content supports liver detoxification pathways.' },
  { id: 'v3',  name: 'Kale',                     category: 'vegetables',    calories: 49,  proteinGrams: 4,  fatGrams: 1,  carbGrams: 9,  notes: 'Vitamin K1 and K2 support; avoid excess if on blood thinners.' },
  { id: 'v4',  name: 'Zucchini',                 category: 'vegetables',    calories: 17,  proteinGrams: 1,  fatGrams: 0,  carbGrams: 3,  notes: 'Excellent low-carb option; rich in potassium.' },
  { id: 'v5',  name: 'Asparagus',                category: 'vegetables',    calories: 27,  proteinGrams: 3,  fatGrams: 0,  carbGrams: 5,  notes: 'Prebiotic fiber; supports kidney function and detox.' },
  { id: 'v6',  name: 'Cauliflower',              category: 'vegetables',    calories: 25,  proteinGrams: 2,  fatGrams: 0,  carbGrams: 5,  notes: 'Versatile low-carb base; good source of choline.' },
  { id: 'v7',  name: 'Bell Peppers',             category: 'vegetables',    calories: 31,  proteinGrams: 1,  fatGrams: 0,  carbGrams: 6,  notes: 'Highest vitamin C of any vegetable per serving.' },
  { id: 'v8',  name: 'Sweet Potato',             category: 'complex-carbs', calories: 103, proteinGrams: 2,  fatGrams: 0,  carbGrams: 24, notes: 'Rich in beta-carotene; supports immune function.' },
  { id: 'v9',  name: 'Cucumber',                 category: 'vegetables',    calories: 16,  proteinGrams: 1,  fatGrams: 0,  carbGrams: 4,  notes: 'Hydrating; silica content supports connective tissue.' },

  // ── Healthy Fats ──────────────────────────────────────────────────────────
  { id: 'hf1', name: 'Avocado',                  category: 'healthy-fats',  calories: 234, proteinGrams: 3,  fatGrams: 21, carbGrams: 12, notes: 'Monounsaturated fat supports hormone production and satiety.' },
  { id: 'hf2', name: 'Extra Virgin Olive Oil',   category: 'healthy-fats',  calories: 120, proteinGrams: 0,  fatGrams: 14, carbGrams: 0,  notes: 'Oleocanthal has anti-inflammatory properties.' },
  { id: 'hf3', name: 'Walnuts',                  category: 'healthy-fats',  calories: 185, proteinGrams: 4,  fatGrams: 18, carbGrams: 4,  notes: 'Only nut with significant plant-based omega-3 (ALA).' },
  { id: 'hf4', name: 'Chia Seeds',               category: 'healthy-fats',  calories: 138, proteinGrams: 5,  fatGrams: 9,  carbGrams: 12, notes: 'Soluble fiber forms gel; supports blood sugar regulation.' },
  { id: 'hf5', name: 'Flaxseeds',                category: 'healthy-fats',  calories: 110, proteinGrams: 4,  fatGrams: 9,  carbGrams: 6,  notes: 'Lignans support hormone balance; must be ground to absorb.' },
  { id: 'hf6', name: 'Almond Butter',            category: 'healthy-fats',  calories: 196, proteinGrams: 7,  fatGrams: 18, carbGrams: 6,  notes: 'Magnesium-rich; supports sleep quality and muscle recovery.' },

  // ── Complex Carbs ─────────────────────────────────────────────────────────
  { id: 'cc1', name: 'Quinoa',                   category: 'complex-carbs', calories: 222, proteinGrams: 8,  fatGrams: 4,  carbGrams: 39, notes: 'Complete protein with all 9 essential amino acids. Gluten-free.' },
  { id: 'cc2', name: 'Rolled Oats',              category: 'complex-carbs', calories: 307, proteinGrams: 11, fatGrams: 5,  carbGrams: 55, notes: 'Beta-glucan fiber supports LDL cholesterol reduction.' },
  { id: 'cc3', name: 'Brown Rice',               category: 'complex-carbs', calories: 216, proteinGrams: 5,  fatGrams: 2,  carbGrams: 45, notes: 'Gentle on digestion; FODMAP-friendly in standard servings.' },
  { id: 'cc4', name: 'Black Beans',              category: 'complex-carbs', calories: 227, proteinGrams: 15, fatGrams: 1,  carbGrams: 41, notes: 'Anthocyanins provide antioxidant activity.' },

  // ── Fruits ────────────────────────────────────────────────────────────────
  { id: 'fr1', name: 'Blueberries',              category: 'fruits',        calories: 84,  proteinGrams: 1,  fatGrams: 0,  carbGrams: 21, notes: 'Highest antioxidant density of any common fruit.' },
  { id: 'fr2', name: 'Strawberries',             category: 'fruits',        calories: 49,  proteinGrams: 1,  fatGrams: 0,  carbGrams: 12, notes: 'Fisetin content supports cellular health.' },
  { id: 'fr3', name: 'Banana',                   category: 'fruits',        calories: 89,  proteinGrams: 1,  fatGrams: 0,  carbGrams: 23, notes: 'Resistant starch (slightly green) feeds beneficial gut bacteria.' },
  { id: 'fr4', name: 'Pomegranate Seeds',        category: 'fruits',        calories: 83,  proteinGrams: 2,  fatGrams: 1,  carbGrams: 19, notes: 'Punicalagins are powerful anti-inflammatory polyphenols.' },
  { id: 'fr5', name: 'Tart Cherries',            category: 'fruits',        calories: 77,  proteinGrams: 2,  fatGrams: 0,  carbGrams: 19, notes: 'Melatonin precursors; supports sleep and exercise recovery.' },

  // ── Dairy / Eggs ──────────────────────────────────────────────────────────
  { id: 'de1', name: 'Greek Yogurt',             category: 'dairy-eggs',    calories: 130, proteinGrams: 17, fatGrams: 5,  carbGrams: 6,  notes: 'Live cultures support microbiome; casein protein is slow-digesting.' },
  { id: 'de2', name: 'Cottage Cheese',           category: 'dairy-eggs',    calories: 98,  proteinGrams: 11, fatGrams: 4,  carbGrams: 3,  notes: 'High casein content; ideal pre-sleep protein source.' },
  { id: 'de3', name: 'Kefir',                    category: 'dairy-eggs',    calories: 99,  proteinGrams: 9,  fatGrams: 3,  carbGrams: 11, notes: 'Up to 61 microbial strains; superior probiotic diversity.' },

  // ── Spices & Herbs ────────────────────────────────────────────────────────
  { id: 'sp1', name: 'Turmeric',                 category: 'spices-herbs',  calories: 8,   proteinGrams: 0,  fatGrams: 0,  carbGrams: 1,  notes: 'Curcumin inhibits inflammatory pathway. Best absorbed with black pepper.' },
  { id: 'sp2', name: 'Ginger',                   category: 'spices-herbs',  calories: 6,   proteinGrams: 0,  fatGrams: 0,  carbGrams: 1,  notes: 'Gingerols reduce nausea and support digestive motility.' },
  { id: 'sp3', name: 'Cinnamon',                 category: 'spices-herbs',  calories: 6,   proteinGrams: 0,  fatGrams: 0,  carbGrams: 2,  notes: 'Improves insulin sensitivity; use Ceylon variety.' },
  { id: 'sp4', name: 'Garlic',                   category: 'spices-herbs',  calories: 13,  proteinGrams: 1,  fatGrams: 0,  carbGrams: 3,  notes: 'Allicin is antimicrobial and cardiovascular protective.' },
]

export function searchFood(query: string): FoodItem | null {
  if (!query.trim()) return null
  const q = query.toLowerCase().trim()
  const exact = FOOD_DATABASE.find(f => f.name.toLowerCase() === q)
  if (exact) return exact
  const partial = FOOD_DATABASE.find(f => f.name.toLowerCase().includes(q) || q.includes(f.name.toLowerCase()))
  return partial ?? null
}
