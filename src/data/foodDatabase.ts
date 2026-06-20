export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack'
export type FoodCategory = 'proteins' | 'vegetables' | 'healthy-fats' | 'complex-carbs' | 'fruits' | 'dairy-eggs' | 'spices-herbs'

export interface FoodItem {
  id: string
  name: string
  category: FoodCategory
  mealSlots: MealSlot[]
  calories: number
  proteinGrams: number
  fatGrams: number
  carbGrams: number
  protocols: string[]
  notes: string
}

export const FOOD_DATABASE: FoodItem[] = [
  // Proteins
  { id: 'f1',  name: 'Wild Salmon',            category: 'proteins',      mealSlots: ['lunch','dinner'],                         calories: 208, proteinGrams: 28, fatGrams: 10, carbGrams: 0,  protocols: ['mediterranean','anti_inflammatory','paleo','pescatarian','omnivore','low_fodmap','scd','dash'], notes: 'Rich in omega-3 EPA and DHA. Supports inflammation reduction, cardiovascular health, and brain function.' },
  { id: 'f2',  name: 'Chicken Breast',         category: 'proteins',      mealSlots: ['lunch','dinner'],                         calories: 165, proteinGrams: 31, fatGrams: 3,  carbGrams: 0,  protocols: ['mediterranean','paleo','low_fodmap','anti_inflammatory','scd','dash','omnivore'], notes: 'Lean protein with an excellent amino acid profile. Supports satiety and muscle protein synthesis.' },
  { id: 'f3',  name: 'Ground Turkey',          category: 'proteins',      mealSlots: ['lunch','dinner'],                         calories: 170, proteinGrams: 29, fatGrams: 6,  carbGrams: 0,  protocols: ['mediterranean','paleo','low_fodmap','anti_inflammatory','dash','omnivore'], notes: 'Lean and versatile. Lower in saturated fat than ground beef with comparable protein content.' },
  { id: 'f4',  name: 'Sardines',               category: 'proteins',      mealSlots: ['lunch','snack'],                          calories: 191, proteinGrams: 23, fatGrams: 11, carbGrams: 0,  protocols: ['mediterranean','anti_inflammatory','paleo','pescatarian','omnivore','low_fodmap'], notes: 'Exceptionally high omega-3 and CoQ10 content. One of the most nutrient-dense affordable proteins.' },
  { id: 'f5',  name: 'Grass-Fed Beef',         category: 'proteins',      mealSlots: ['lunch','dinner'],                         calories: 215, proteinGrams: 26, fatGrams: 12, carbGrams: 0,  protocols: ['paleo','omnivore','scd','low_fodmap','healthy_keto'], notes: 'Higher CLA content than grain-fed. CLA supports healthy body composition.' },
  { id: 'f6',  name: 'Tempeh',                 category: 'proteins',      mealSlots: ['breakfast','lunch','dinner'],              calories: 195, proteinGrams: 20, fatGrams: 11, carbGrams: 9,  protocols: ['vegan','vegetarian','mediterranean','anti_inflammatory'], notes: 'Fermented soy. The fermentation process pre-digests anti-nutrients and supports gut microbiome diversity.' },
  { id: 'f8',  name: 'Shrimp',                 category: 'proteins',      mealSlots: ['lunch','dinner'],                         calories: 99,  proteinGrams: 24, fatGrams: 0,  carbGrams: 0,  protocols: ['mediterranean','pescatarian','paleo','omnivore','low_fodmap','scd'], notes: 'Very low calorie with high protein density. Provides iodine and selenium for thyroid support.' },
  { id: 'f10', name: 'Tuna (light, canned)',   category: 'proteins',      mealSlots: ['lunch','snack'],                          calories: 130, proteinGrams: 29, fatGrams: 1,  carbGrams: 0,  protocols: ['mediterranean','pescatarian','paleo','omnivore','low_fodmap','dash'], notes: 'Convenient high-protein option. Choose BPA-free cans. Light tuna is lower in mercury than albacore.' },
  { id: 'f11', name: 'Bone Broth',             category: 'proteins',      mealSlots: ['breakfast','lunch','dinner','snack'],      calories: 45,  proteinGrams: 10, fatGrams: 1,  carbGrams: 0,  protocols: ['paleo','scd','anti_inflammatory','low_fodmap','omnivore'], notes: 'Collagen and glycine support gut lining integrity and joint health. Pairs with turmeric or ginger for gut lining repair.' },
  { id: 'f12', name: 'Edamame',                category: 'proteins',      mealSlots: ['snack','lunch'],                          calories: 188, proteinGrams: 18, fatGrams: 8,  carbGrams: 14, protocols: ['vegan','vegetarian','wfpb','mediterranean','anti_inflammatory','dash'], notes: 'Complete plant protein. Isoflavones support hormone balance. One of the few plants with all essential amino acids.' },
  { id: 'f13', name: 'Cod',                    category: 'proteins',      mealSlots: ['lunch','dinner'],                         calories: 105, proteinGrams: 23, fatGrams: 1,  carbGrams: 0,  protocols: ['mediterranean','pescatarian','paleo','omnivore','low_fodmap','scd','dash'], notes: 'Very lean white fish. High selenium content supports thyroid function and antioxidant defense.' },

  // Vegetables
  { id: 'v1',  name: 'Spinach',                category: 'vegetables',    mealSlots: ['breakfast','lunch','dinner','snack'],      calories: 23,  proteinGrams: 3,  fatGrams: 0,  carbGrams: 4,  protocols: ['mediterranean','vegan','vegetarian','wfpb','anti_inflammatory','paleo','low_fodmap','scd','anti_candida','dash','healthy_keto','omnivore','pescatarian'], notes: 'Exceptional source of folate, magnesium, and non-heme iron. Pairs with vitamin C foods for a 300% iron absorption boost.' },
  { id: 'v2',  name: 'Broccoli',               category: 'vegetables',    mealSlots: ['lunch','dinner'],                         calories: 55,  proteinGrams: 4,  fatGrams: 1,  carbGrams: 11, protocols: ['mediterranean','vegan','vegetarian','wfpb','anti_inflammatory','paleo','scd','anti_candida','dash','healthy_keto','omnivore','pescatarian'], notes: 'Sulforaphane supports liver detoxification via Nrf2 pathway. Bioavailability increases significantly with EVOO.' },
  { id: 'v3',  name: 'Kale',                   category: 'vegetables',    mealSlots: ['breakfast','lunch','dinner'],              calories: 49,  proteinGrams: 4,  fatGrams: 1,  carbGrams: 9,  protocols: ['mediterranean','vegan','vegetarian','wfpb','anti_inflammatory','paleo','scd','anti_candida','dash','healthy_keto','omnivore','pescatarian'], notes: 'Vitamin K1 and K2 support for bone density and arterial health. Best absorbed with dietary fat.' },
  { id: 'v4',  name: 'Zucchini',               category: 'vegetables',    mealSlots: ['lunch','dinner'],                         calories: 17,  proteinGrams: 1,  fatGrams: 0,  carbGrams: 3,  protocols: ['mediterranean','vegan','vegetarian','wfpb','anti_inflammatory','paleo','low_fodmap','scd','anti_candida','dash','healthy_keto','omnivore','pescatarian'], notes: 'Low-carb and high-potassium. Excellent pasta substitute for blood sugar management protocols.' },
  { id: 'v5',  name: 'Asparagus',              category: 'vegetables',    mealSlots: ['lunch','dinner'],                         calories: 27,  proteinGrams: 3,  fatGrams: 0,  carbGrams: 5,  protocols: ['mediterranean','vegan','vegetarian','wfpb','anti_inflammatory','paleo','low_fodmap','scd','anti_candida','dash','healthy_keto','omnivore','pescatarian'], notes: 'Prebiotic inulin feeds Bifidobacterium strains. Pairs with wild salmon for the Gut-Brain Axis synergy.' },
  { id: 'v6',  name: 'Cauliflower',            category: 'vegetables',    mealSlots: ['lunch','dinner'],                         calories: 25,  proteinGrams: 2,  fatGrams: 0,  carbGrams: 5,  protocols: ['mediterranean','vegan','vegetarian','wfpb','anti_inflammatory','paleo','low_fodmap','scd','anti_candida','dash','healthy_keto','omnivore','pescatarian'], notes: 'Versatile low-carb base. Good source of choline. Sulforaphane absorption increases with EVOO.' },
  { id: 'v7',  name: 'Bell Peppers',           category: 'vegetables',    mealSlots: ['breakfast','lunch','dinner','snack'],      calories: 31,  proteinGrams: 1,  fatGrams: 0,  carbGrams: 6,  protocols: ['mediterranean','vegan','vegetarian','wfpb','anti_inflammatory','paleo','scd','anti_candida','dash','healthy_keto','omnivore','pescatarian'], notes: 'Highest vitamin C of any vegetable per serving. Activates the iron absorption amplifier synergy with leafy greens.' },
  { id: 'v8',  name: 'Sweet Potato',           category: 'complex-carbs', mealSlots: ['breakfast','lunch','dinner'],              calories: 103, proteinGrams: 2,  fatGrams: 0,  carbGrams: 24, protocols: ['mediterranean','vegan','vegetarian','wfpb','anti_inflammatory','paleo','dash','omnivore','pescatarian'], notes: 'Rich in beta-carotene and potassium. Supports immune function and healthy blood pressure.' },
  { id: 'v9',  name: 'Cucumber',               category: 'vegetables',    mealSlots: ['breakfast','lunch','snack'],               calories: 16,  proteinGrams: 1,  fatGrams: 0,  carbGrams: 4,  protocols: ['mediterranean','vegan','vegetarian','wfpb','anti_inflammatory','paleo','low_fodmap','scd','anti_candida','dash','healthy_keto','omnivore','pescatarian'], notes: 'Hydrating and alkalizing. Silica content supports connective tissue repair.' },

  // Healthy Fats
  { id: 'hf1', name: 'Avocado',                category: 'healthy-fats',  mealSlots: ['breakfast','lunch','snack'],               calories: 234, proteinGrams: 3,  fatGrams: 21, carbGrams: 12, protocols: ['mediterranean','vegan','vegetarian','wfpb','anti_inflammatory','paleo','low_fodmap','scd','anti_candida','dash','healthy_keto','omnivore','pescatarian'], notes: 'Monounsaturated fats support hormone production and sustained satiety. Acts as a fat-soluble vitamin carrier.' },
  { id: 'hf2', name: 'Extra Virgin Olive Oil', category: 'healthy-fats',  mealSlots: ['breakfast','lunch','dinner','snack'],      calories: 120, proteinGrams: 0,  fatGrams: 14, carbGrams: 0,  protocols: ['mediterranean','vegan','vegetarian','wfpb','anti_inflammatory','paleo','low_fodmap','scd','anti_candida','dash','healthy_keto','omnivore','pescatarian'], notes: 'Oleocanthal inhibits the same COX-2 enzyme as ibuprofen. Unlocks sulforaphane, K2, and curcumin absorption.' },
  { id: 'hf3', name: 'Walnuts',                category: 'healthy-fats',  mealSlots: ['breakfast','snack'],                      calories: 185, proteinGrams: 4,  fatGrams: 18, carbGrams: 4,  protocols: ['mediterranean','vegan','vegetarian','wfpb','anti_inflammatory','paleo','low_fodmap','scd','anti_candida','dash','healthy_keto','omnivore','pescatarian'], notes: 'Only nut with significant ALA omega-3. Pairs with blueberries for Cognitive Synergy and tart cherries for sleep recovery.' },
  { id: 'hf4', name: 'Chia Seeds',             category: 'healthy-fats',  mealSlots: ['breakfast','snack'],                      calories: 138, proteinGrams: 5,  fatGrams: 9,  carbGrams: 12, protocols: ['mediterranean','vegan','vegetarian','wfpb','anti_inflammatory','paleo','low_fodmap','scd','anti_candida','dash','omnivore','pescatarian'], notes: 'Soluble fiber forms a hydrogel that slows glucose absorption. Excellent prebiotic substrate paired with Greek yogurt.' },
  { id: 'hf5', name: 'Flaxseeds (ground)',     category: 'healthy-fats',  mealSlots: ['breakfast','snack'],                      calories: 110, proteinGrams: 4,  fatGrams: 9,  carbGrams: 6,  protocols: ['vegan','vegetarian','wfpb','anti_inflammatory','mediterranean','dash','omnivore'], notes: 'Lignans support hormone balance. Must be ground for absorption. Pairs with fermented dairy for the prebiotic-probiotic synergy.' },
  { id: 'hf6', name: 'Almond Butter',          category: 'healthy-fats',  mealSlots: ['breakfast','snack'],                      calories: 196, proteinGrams: 7,  fatGrams: 18, carbGrams: 6,  protocols: ['mediterranean','vegan','vegetarian','wfpb','anti_inflammatory','paleo','scd','anti_candida','dash','healthy_keto','omnivore','pescatarian'], notes: 'Magnesium-rich. Magnesium deficiency directly impacts sleep quality and insulin sensitivity.' },

  // Complex Carbs
  { id: 'f7',  name: 'Lentils',                category: 'complex-carbs', mealSlots: ['lunch','dinner'],                         calories: 230, proteinGrams: 18, fatGrams: 1,  carbGrams: 40, protocols: ['vegan','vegetarian','mediterranean','dash','wfpb','anti_inflammatory'], notes: 'High in resistant starch that produces butyrate in the gut. Pairs with vitamin C foods for a major iron absorption boost.' },
  { id: 'cc1', name: 'Quinoa',                 category: 'complex-carbs', mealSlots: ['breakfast','lunch','dinner'],              calories: 222, proteinGrams: 8,  fatGrams: 4,  carbGrams: 39, protocols: ['mediterranean','vegan','vegetarian','wfpb','anti_inflammatory','dash','omnivore','pescatarian'], notes: 'Complete protein with all 9 essential amino acids. Naturally gluten-free. Lower glycemic index than most grains.' },
  { id: 'cc2', name: 'Rolled Oats',            category: 'complex-carbs', mealSlots: ['breakfast'],                              calories: 307, proteinGrams: 11, fatGrams: 5,  carbGrams: 55, protocols: ['mediterranean','vegan','vegetarian','wfpb','anti_inflammatory','dash','omnivore','pescatarian'], notes: 'Beta-glucan fiber has FDA-approved evidence for LDL cholesterol reduction. Overnight soaking improves mineral bioavailability.' },
  { id: 'cc3', name: 'Brown Rice',             category: 'complex-carbs', mealSlots: ['lunch','dinner'],                         calories: 216, proteinGrams: 5,  fatGrams: 2,  carbGrams: 45, protocols: ['mediterranean','vegan','vegetarian','wfpb','anti_inflammatory','low_fodmap','dash','omnivore','pescatarian'], notes: 'Gentle on digestion and FODMAP-friendly. Provides manganese for mitochondrial function.' },
  { id: 'cc4', name: 'Black Beans',            category: 'complex-carbs', mealSlots: ['lunch','dinner'],                         calories: 227, proteinGrams: 15, fatGrams: 1,  carbGrams: 41, protocols: ['vegan','vegetarian','wfpb','mediterranean','anti_inflammatory','dash','omnivore'], notes: 'Anthocyanins (the black pigment) provide antioxidant activity. High resistant starch feeds colonocytes.' },

  // Fruits
  { id: 'fr1', name: 'Wild Blueberries',       category: 'fruits',        mealSlots: ['breakfast','snack'],                      calories: 84,  proteinGrams: 1,  fatGrams: 0,  carbGrams: 21, protocols: ['mediterranean','vegan','vegetarian','wfpb','anti_inflammatory','paleo','scd','dash','omnivore','pescatarian'], notes: 'Highest antioxidant density of any common fruit. Anthocyanins cross the blood-brain barrier to support hippocampal function.' },
  { id: 'fr2', name: 'Strawberries',           category: 'fruits',        mealSlots: ['breakfast','snack'],                      calories: 49,  proteinGrams: 1,  fatGrams: 0,  carbGrams: 12, protocols: ['mediterranean','vegan','vegetarian','wfpb','anti_inflammatory','paleo','low_fodmap','scd','anti_candida','dash','omnivore','pescatarian'], notes: 'Fisetin supports cellular senescence clearance. High vitamin C activates the iron absorption synergy with spinach or kale.' },
  { id: 'fr3', name: 'Banana',                 category: 'fruits',        mealSlots: ['breakfast','snack'],                      calories: 89,  proteinGrams: 1,  fatGrams: 0,  carbGrams: 23, protocols: ['mediterranean','vegan','vegetarian','wfpb','dash','omnivore','pescatarian'], notes: 'Slightly green bananas are highest in resistant starch. Good source of B6 for neurotransmitter synthesis.' },
  { id: 'fr4', name: 'Pomegranate Seeds',      category: 'fruits',        mealSlots: ['breakfast','snack'],                      calories: 83,  proteinGrams: 2,  fatGrams: 1,  carbGrams: 19, protocols: ['mediterranean','vegan','vegetarian','wfpb','anti_inflammatory','dash','omnivore','pescatarian'], notes: 'Punicalagins are among the most potent anti-inflammatory polyphenols. Supports endothelial function and blood pressure.' },
  { id: 'fr5', name: 'Tart Cherries',          category: 'fruits',        mealSlots: ['breakfast','snack'],                      calories: 77,  proteinGrams: 2,  fatGrams: 0,  carbGrams: 19, protocols: ['mediterranean','vegan','vegetarian','wfpb','anti_inflammatory','dash','omnivore','pescatarian'], notes: 'Supply melatonin precursors and proanthocyanidins that reduce exercise-induced inflammation. Best paired with walnuts.' },

  // Dairy & Eggs
  { id: 'f9',  name: 'Pasture-Raised Eggs',   category: 'dairy-eggs',    mealSlots: ['breakfast','lunch','snack'],               calories: 155, proteinGrams: 13, fatGrams: 11, carbGrams: 1,  protocols: ['mediterranean','paleo','low_fodmap','anti_inflammatory','scd','healthy_keto','omnivore','vegetarian'], notes: 'Complete amino acid profile with superior choline content. Choline is the most commonly deficient nutrient in modern diets.' },
  { id: 'de1', name: 'Greek Yogurt',           category: 'dairy-eggs',    mealSlots: ['breakfast','snack'],                      calories: 130, proteinGrams: 17, fatGrams: 5,  carbGrams: 6,  protocols: ['mediterranean','scd','low_fodmap','anti_inflammatory','dash','omnivore','vegetarian'], notes: 'Live cultures support the microbiome. Casein protein digests slowly over 5 to 7 hours. Pairs with chia seeds for the prebiotic-probiotic synergy.' },
  { id: 'de2', name: 'Cottage Cheese',         category: 'dairy-eggs',    mealSlots: ['breakfast','snack'],                      calories: 98,  proteinGrams: 11, fatGrams: 4,  carbGrams: 3,  protocols: ['scd','low_fodmap','anti_inflammatory','dash','omnivore','vegetarian'], notes: 'High casein content makes it ideal as a pre-sleep protein. Pairs with avocado to unlock fat-soluble vitamin absorption.' },
  { id: 'de3', name: 'Kefir',                  category: 'dairy-eggs',    mealSlots: ['breakfast','snack'],                      calories: 99,  proteinGrams: 9,  fatGrams: 3,  carbGrams: 11, protocols: ['mediterranean','scd','anti_inflammatory','omnivore','vegetarian'], notes: 'Up to 61 strains of microorganisms. Superior probiotic diversity. Pairs with chia or flax for a powerful microbiome stack.' },

  // Spices & Herbs
  { id: 'sp1', name: 'Turmeric',               category: 'spices-herbs',  mealSlots: ['breakfast','lunch','dinner','snack'],      calories: 8,   proteinGrams: 0,  fatGrams: 0,  carbGrams: 1,  protocols: ['mediterranean','vegan','vegetarian','wfpb','anti_inflammatory','paleo','scd','anti_candida','dash','healthy_keto','omnivore','pescatarian'], notes: 'Curcumin inhibits the NF-kB inflammatory pathway. Bioavailability increases 2,000% when paired with black pepper.' },
  { id: 'sp2', name: 'Ginger',                 category: 'spices-herbs',  mealSlots: ['breakfast','lunch','dinner','snack'],      calories: 6,   proteinGrams: 0,  fatGrams: 0,  carbGrams: 1,  protocols: ['mediterranean','vegan','vegetarian','wfpb','anti_inflammatory','paleo','scd','anti_candida','dash','healthy_keto','omnivore','pescatarian'], notes: 'Gingerols reduce nausea and support digestive motility. Pairs with bone broth for gut lining repair.' },
  { id: 'sp3', name: 'Cinnamon (Ceylon)',       category: 'spices-herbs',  mealSlots: ['breakfast','snack'],                      calories: 6,   proteinGrams: 0,  fatGrams: 0,  carbGrams: 2,  protocols: ['mediterranean','vegan','vegetarian','wfpb','anti_inflammatory','paleo','scd','anti_candida','dash','healthy_keto','omnivore','pescatarian'], notes: 'Improves insulin sensitivity. Always choose Ceylon, not Cassia, to avoid high coumarin content.' },
  { id: 'sp4', name: 'Garlic',                 category: 'spices-herbs',  mealSlots: ['lunch','dinner'],                         calories: 13,  proteinGrams: 1,  fatGrams: 0,  carbGrams: 3,  protocols: ['mediterranean','vegan','vegetarian','wfpb','anti_inflammatory','paleo','scd','dash','omnivore','pescatarian'], notes: 'Allicin is both antimicrobial and cardiovascular protective. Let chopped garlic rest 10 minutes before cooking to maximize allicin.' },
]

export const CATEGORY_LABELS: Record<FoodCategory, string> = {
  proteins: 'Proteins',
  vegetables: 'Vegetables',
  'healthy-fats': 'Healthy Fats',
  'complex-carbs': 'Complex Carbs',
  fruits: 'Fruits',
  'dairy-eggs': 'Dairy and Eggs',
  'spices-herbs': 'Spices and Herbs',
}

export const MEAL_SLOT_LABELS: Record<MealSlot, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
}

export const CATEGORY_ORDER: FoodCategory[] = [
  'proteins', 'vegetables', 'healthy-fats', 'complex-carbs', 'fruits', 'dairy-eggs', 'spices-herbs',
]

export function searchFood(query: string): FoodItem | null {
  if (!query.trim()) return null
  const q = query.toLowerCase().trim()
  const exact = FOOD_DATABASE.find(f => f.name.toLowerCase() === q)
  if (exact) return exact
  const partial = FOOD_DATABASE.find(f => f.name.toLowerCase().includes(q) || q.includes(f.name.toLowerCase()))
  return partial ?? null
}
