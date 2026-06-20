export type TrendSource = 'tiktok' | 'reddit' | 'instagram' | 'youtube'

export interface TrendingMeal {
  id: string
  name: string
  sources: Array<{ platform: TrendSource; community: string; trendScore: number }>
  description: string
  keyIngredients: string[]
  mealSlots: string[]
  protocols: string[]
  calories: number
  proteinGrams: number
  fatGrams: number
  carbGrams: number
  whyItWorks: string
  quickSwap?: string
}

export const PLATFORM_LABELS: Record<TrendSource, string> = {
  tiktok: 'TikTok',
  reddit: 'Reddit',
  instagram: 'Instagram',
  youtube: 'YouTube',
}

export const PLATFORM_COLORS: Record<TrendSource, string> = {
  tiktok: '#ec4899',
  reddit: '#f97316',
  instagram: '#9333ea',
  youtube: '#ef4444',
}

export const TRENDING_MEALS: TrendingMeal[] = [
  {
    id: 'tm1',
    name: 'Dense Bean Salad',
    sources: [
      { platform: 'tiktok', community: '#DenseBeanSalad', trendScore: 97 },
      { platform: 'reddit', community: 'r/MealPrepSunday', trendScore: 91 },
    ],
    description: 'Chickpeas, kidney beans, black beans, cucumber, red onion, parsley, lemon and EVOO. Ferments slightly overnight and flavor intensifies massively.',
    keyIngredients: ['Chickpeas', 'Kidney Beans', 'Black Beans', 'Cucumber', 'Parsley', 'Lemon', 'Extra Virgin Olive Oil'],
    mealSlots: ['lunch', 'dinner', 'snack'],
    protocols: ['mediterranean', 'vegan', 'vegetarian', 'wfpb', 'anti_inflammatory', 'dash'],
    calories: 390, proteinGrams: 18, fatGrams: 12, carbGrams: 54,
    whyItWorks: "Three different legume families deliver diverse prebiotic fibers that feed different Bifidobacterium strains. EVOO's oleocanthal suppresses the same COX-2 enzyme as ibuprofen. Parsley provides apigenin, a flavonoid that crosses the blood-brain barrier.",
    quickSwap: 'Sub red onion with scallions (green tops only) to make this Low-FODMAP compatible.',
  },
  {
    id: 'tm2',
    name: 'High-Protein Cottage Cheese Bowl',
    sources: [
      { platform: 'tiktok', community: '#CottageCheeseRecipes', trendScore: 96 },
      { platform: 'instagram', community: '@highproteinmeals', trendScore: 89 },
    ],
    description: 'Full-fat cottage cheese layered with Everything Bagel seasoning, cherry tomatoes, cucumber, fresh dill, and a drizzle of EVOO. Eaten cold, ready in 90 seconds.',
    keyIngredients: ['Cottage Cheese', 'Cherry Tomatoes', 'Cucumber', 'Fresh Dill', 'Everything Bagel Seasoning', 'EVOO'],
    mealSlots: ['breakfast', 'lunch', 'snack'],
    protocols: ['mediterranean', 'low_fodmap', 'anti_inflammatory', 'scd', 'omnivore', 'vegetarian'],
    calories: 280, proteinGrams: 26, fatGrams: 14, carbGrams: 12,
    whyItWorks: 'Casein protein (primary protein in cottage cheese) digests slowly over 5 to 7 hours, providing sustained amino acid delivery. The fat-soluble vitamins in EVOO are absorbed better alongside cottage cheese fat.',
    quickSwap: 'For keto: remove tomatoes, add sliced avocado and smoked salmon. Pushes protein to 34g.',
  },
  {
    id: 'tm3',
    name: 'Greek Chicken Rice Bowl',
    sources: [
      { platform: 'tiktok', community: '#GreekChicken', trendScore: 95 },
      { platform: 'youtube', community: 'Meal Prep Monday', trendScore: 88 },
      { platform: 'reddit', community: 'r/EatCheapAndHealthy', trendScore: 85 },
    ],
    description: 'Lemon-oregano marinated chicken thigh over rice, tzatziki, cucumber, kalamata olives, cherry tomatoes, and feta. A complete Mediterranean meal in one bowl.',
    keyIngredients: ['Chicken Thigh', 'Brown Rice', 'Greek Yogurt', 'Cucumber', 'Kalamata Olives', 'Lemon', 'Oregano', 'Feta'],
    mealSlots: ['lunch', 'dinner'],
    protocols: ['mediterranean', 'anti_inflammatory', 'omnivore', 'dash'],
    calories: 520, proteinGrams: 38, fatGrams: 18, carbGrams: 48,
    whyItWorks: 'Oregano contains carvacrol and rosmarinic acid, some of the most potent anti-microbial phytonutrients known. Kalamata olives deliver hydroxytyrosol (one of the strongest antioxidants per gram). The yogurt base is probiotic and lemon vitamin C supports iron absorption from the chicken.',
    quickSwap: 'Swap brown rice for cauliflower rice to reduce net carbs to roughly 12g.',
  },
  {
    id: 'tm4',
    name: 'Marry Me Salmon',
    sources: [
      { platform: 'tiktok', community: '#MarryMeSalmon', trendScore: 94 },
      { platform: 'instagram', community: '@paleomeals', trendScore: 87 },
    ],
    description: "Pan-seared salmon in a sun-dried tomato cream sauce with spinach, garlic, and basil. Ready in 20 minutes. The internet's current obsession.",
    keyIngredients: ['Wild Salmon', 'Sun-Dried Tomatoes', 'Spinach', 'Garlic', 'Coconut Cream', 'Fresh Basil'],
    mealSlots: ['dinner'],
    protocols: ['mediterranean', 'pescatarian', 'anti_inflammatory', 'paleo', 'omnivore'],
    calories: 460, proteinGrams: 35, fatGrams: 28, carbGrams: 14,
    whyItWorks: 'Sun-dried tomatoes have 10x the lycopene concentration of fresh tomatoes, and lycopene bioavailability increases dramatically when cooked with fat. Spinach and garlic deliver the iron plus allicin activation stack. The omega-3 EPA and DHA from wild salmon completes the anti-inflammatory trifecta.',
  },
  {
    id: 'tm5',
    name: 'TikTok Green Goddess Salad',
    sources: [
      { platform: 'tiktok', community: '#GreenGoddessSalad', trendScore: 93 },
      { platform: 'reddit', community: 'r/PlantBasedDiet', trendScore: 82 },
    ],
    description: 'Shredded cabbage, cucumber, green onion, edamame, and herbs blitzed into a creamy tahini-herb dressing. Addictive, plant-based, microbiome gold.',
    keyIngredients: ['Green Cabbage', 'Cucumber', 'Edamame', 'Fresh Chives', 'Basil', 'Tahini', 'Apple Cider Vinegar'],
    mealSlots: ['lunch', 'dinner', 'snack'],
    protocols: ['vegan', 'vegetarian', 'wfpb', 'anti_inflammatory', 'mediterranean', 'dash'],
    calories: 310, proteinGrams: 14, fatGrams: 16, carbGrams: 30,
    whyItWorks: "Cabbage glucosinolates convert to isothiocyanates in the gut that activate Nrf2, the master antioxidant switch. Tahini delivers sesamin and sesamolin, unique lignans with demonstrated blood pressure-lowering effects.",
    quickSwap: 'Add 4oz chopped grilled chicken to hit 30g protein and make it a complete anti-inflammatory meal.',
  },
  {
    id: 'tm6',
    name: 'Sheet Pan Mediterranean Chicken',
    sources: [
      { platform: 'reddit', community: 'r/MealPrepSunday', trendScore: 92 },
      { platform: 'youtube', community: 'Healthy Meal Prep', trendScore: 86 },
    ],
    description: 'Chicken thighs, zucchini, bell peppers, cherry tomatoes, and red onion roasted with EVOO, oregano, and lemon. Batch-prep for 5 days of lunches.',
    keyIngredients: ['Chicken Thigh', 'Zucchini', 'Bell Peppers', 'Cherry Tomatoes', 'EVOO', 'Oregano', 'Lemon'],
    mealSlots: ['lunch', 'dinner'],
    protocols: ['mediterranean', 'anti_inflammatory', 'paleo', 'low_fodmap', 'omnivore', 'dash'],
    calories: 410, proteinGrams: 34, fatGrams: 22, carbGrams: 18,
    whyItWorks: 'Roasting concentrates lycopene in cherry tomatoes and increases carotenoid bioavailability from bell peppers. The fat from EVOO acts as a carrier for these fat-soluble compounds. Chicken thighs provide carnosine, a dipeptide that buffers lactic acid during exercise recovery.',
    quickSwap: 'Sub chicken for wild-caught cod for a pescatarian version with lower fat and higher selenium.',
  },
  {
    id: 'tm7',
    name: 'Anti-Inflammatory Golden Bowl',
    sources: [
      { platform: 'instagram', community: '@antiinflammatorydiet', trendScore: 91 },
      { platform: 'tiktok', community: '#AntiInflammatoryDiet', trendScore: 90 },
    ],
    description: 'Turmeric-roasted cauliflower over brown rice with shredded kale, pickled ginger, chickpeas, and a tahini-turmeric dressing. Vibrant. Deeply functional.',
    keyIngredients: ['Cauliflower', 'Brown Rice', 'Kale', 'Chickpeas', 'Turmeric', 'Ginger', 'Tahini', 'Black Pepper'],
    mealSlots: ['lunch', 'dinner'],
    protocols: ['vegan', 'vegetarian', 'wfpb', 'anti_inflammatory', 'mediterranean', 'dash'],
    calories: 440, proteinGrams: 16, fatGrams: 14, carbGrams: 66,
    whyItWorks: 'The curcumin (turmeric) and piperine (black pepper) synergy in this bowl is the most studied anti-inflammatory food combination in clinical nutrition, with curcumin bioavailability increasing 2,000%. Kale provides sulforaphane precursors that activate the Nrf2 protective pathway.',
    quickSwap: 'Add 4oz wild salmon on top for the omega-3 anti-inflammatory amplifier.',
  },
  {
    id: 'tm8',
    name: 'Overnight Oat Protein Jars',
    sources: [
      { platform: 'tiktok', community: '#OvernightOats', trendScore: 95 },
      { platform: 'reddit', community: 'r/MealPrepSunday', trendScore: 93 },
      { platform: 'instagram', community: '@mealprep', trendScore: 88 },
    ],
    description: 'Rolled oats, chia seeds, protein powder, almond milk, and wild blueberries. Made in 5 minutes Sunday night. 5 breakfasts done. The king of meal prep.',
    keyIngredients: ['Rolled Oats', 'Chia Seeds', 'Protein Powder', 'Almond Milk', 'Wild Blueberries', 'Almond Butter'],
    mealSlots: ['breakfast'],
    protocols: ['vegan', 'vegetarian', 'wfpb', 'anti_inflammatory', 'mediterranean', 'dash', 'omnivore'],
    calories: 420, proteinGrams: 28, fatGrams: 12, carbGrams: 52,
    whyItWorks: 'Overnight soaking activates enzymes that break down phytic acid in oats, increasing mineral bioavailability. Chia seeds form a hydrogel matrix that slows glucose absorption. Beta-glucan (oat fiber) is one of only a handful of foods with FDA-approved heart health claims.',
    quickSwap: 'Swap protein powder for Greek yogurt to add probiotics and shift to slower casein-dominant protein digestion.',
  },
  {
    id: 'tm9',
    name: 'Shakshuka',
    sources: [
      { platform: 'reddit', community: 'r/EatCheapAndHealthy', trendScore: 90 },
      { platform: 'instagram', community: '@mediterraneanfood', trendScore: 89 },
    ],
    description: 'Eggs poached in spiced tomato sauce with cumin, smoked paprika, and garlic. North African street food that has conquered the internet. One pan, 25 minutes.',
    keyIngredients: ['Pasture-Raised Eggs', 'Crushed Tomatoes', 'Bell Peppers', 'Garlic', 'Cumin', 'Smoked Paprika', 'EVOO'],
    mealSlots: ['breakfast', 'lunch'],
    protocols: ['mediterranean', 'anti_inflammatory', 'vegetarian', 'omnivore', 'low_fodmap', 'paleo', 'dash'],
    calories: 310, proteinGrams: 20, fatGrams: 18, carbGrams: 22,
    whyItWorks: 'Cooking tomatoes in EVOO dramatically increases lycopene absorption. Cumin contains thymoquinone, which has demonstrated anti-inflammatory properties in preliminary research. Eggs provide choline, the most commonly deficient nutrient in modern diets.',
  },
  {
    id: 'tm10',
    name: 'Turkey White Bean Soup',
    sources: [
      { platform: 'reddit', community: 'r/MealPrepSunday', trendScore: 88 },
      { platform: 'youtube', community: 'Healthy Winter Meals', trendScore: 84 },
    ],
    description: "Ground turkey, cannellini beans, kale, rosemary, and bone broth. 8 servings from one pot. The internet's most popular winter meal prep.",
    keyIngredients: ['Ground Turkey', 'Cannellini Beans', 'Kale', 'Bone Broth', 'Rosemary', 'Garlic'],
    mealSlots: ['lunch', 'dinner'],
    protocols: ['anti_inflammatory', 'mediterranean', 'dash', 'omnivore'],
    calories: 340, proteinGrams: 30, fatGrams: 8, carbGrams: 36,
    whyItWorks: 'Bone broth provides glycine and proline, the two amino acids that form collagen triple-helix structure. These directly support intestinal epithelial cell repair. White beans deliver resistant starch that feeds colonocytes.',
    quickSwap: 'Add a Parmesan rind while simmering for umami depth without processed ingredients. Remove before serving.',
  },
  {
    id: 'tm11',
    name: 'Smash Burger Protein Bowl',
    sources: [
      { platform: 'tiktok', community: '#SmashBurger', trendScore: 94 },
      { platform: 'reddit', community: 'r/Fitness', trendScore: 80 },
    ],
    description: 'The viral smash burger deconstructed into a rice bowl: smashed lean beef patty, Greek yogurt special sauce, shredded lettuce, pickles, tomato, onion.',
    keyIngredients: ['Lean Ground Beef', 'Brown Rice', 'Greek Yogurt', 'Yellow Mustard', 'Romaine', 'Pickles', 'Tomato'],
    mealSlots: ['lunch', 'dinner'],
    protocols: ['omnivore', 'paleo', 'anti_inflammatory'],
    calories: 490, proteinGrams: 40, fatGrams: 16, carbGrams: 42,
    whyItWorks: "Grass-fed beef contains CLA (conjugated linoleic acid), a rare fatty acid with genuine evidence for supporting body composition. Greek yogurt swaps out processed mayo while adding casein protein and probiotics. The vinegar in pickles slightly reduces the glycemic impact of the rice.",
    quickSwap: 'Use 90/10 ground bison instead of beef for a lower saturated fat option with the same CLA content.',
  },
  {
    id: 'tm12',
    name: 'One-Pan Ginger Miso Salmon',
    sources: [
      { platform: 'tiktok', community: '#HealthySalmon', trendScore: 91 },
      { platform: 'instagram', community: '@glutenfreemeals', trendScore: 86 },
    ],
    description: 'Wild salmon filets glazed in white miso and ginger, roasted alongside asparagus and edamame. Ready in 18 minutes. Zero cleanup.',
    keyIngredients: ['Wild Salmon', 'White Miso', 'Fresh Ginger', 'Sesame Oil', 'Asparagus', 'Edamame'],
    mealSlots: ['dinner'],
    protocols: ['mediterranean', 'pescatarian', 'anti_inflammatory', 'omnivore', 'dash'],
    calories: 420, proteinGrams: 42, fatGrams: 22, carbGrams: 16,
    whyItWorks: "This activates the Gut-Brain Axis synergy: omega-3 EPA and DHA from wild salmon feeds neural membranes, while asparagus inulin (prebiotic) and miso live cultures (probiotic) support the enteric nervous system. Ginger's gingerols simultaneously reduce intestinal inflammation.",
  },
  {
    id: 'tm13',
    name: 'Viral Cottage Cheese Flatbread',
    sources: [
      { platform: 'tiktok', community: '#CottageCheeseFlatbread', trendScore: 95 },
      { platform: 'reddit', community: 'r/ketorecipes', trendScore: 87 },
    ],
    description: 'Two ingredients: cottage cheese and egg. Blend, pour thin on parchment, bake 30 min. Top with anything. High-protein, grain-free, and genuinely delicious.',
    keyIngredients: ['Cottage Cheese', 'Pasture-Raised Eggs', 'Garlic Powder', 'Italian Herbs'],
    mealSlots: ['breakfast', 'lunch', 'snack'],
    protocols: ['healthy_keto', 'low_fodmap', 'scd', 'omnivore', 'vegetarian'],
    calories: 220, proteinGrams: 24, fatGrams: 10, carbGrams: 6,
    whyItWorks: 'A near-perfect high-protein, low-carb meal. The egg and cottage cheese combination provides all 9 essential amino acids in optimal ratios for muscle protein synthesis.',
  },
  {
    id: 'tm14',
    name: 'Mediterranean Lentil Soup',
    sources: [
      { platform: 'reddit', community: 'r/veganrecipes', trendScore: 89 },
      { platform: 'youtube', community: 'Budget Healthy Meals', trendScore: 86 },
      { platform: 'tiktok', community: '#HighProteinVegan', trendScore: 82 },
    ],
    description: 'Red lentils simmered with cumin, turmeric, lemon, spinach, and garlic in vegetable broth. Ready in 35 minutes. 20g plant protein per serving.',
    keyIngredients: ['Red Lentils', 'Spinach', 'Cumin', 'Turmeric', 'Lemon', 'Garlic', 'Vegetable Broth'],
    mealSlots: ['lunch', 'dinner'],
    protocols: ['vegan', 'vegetarian', 'wfpb', 'mediterranean', 'anti_inflammatory', 'dash'],
    calories: 350, proteinGrams: 20, fatGrams: 4, carbGrams: 62,
    whyItWorks: 'Red lentils are uniquely high in resistant starch, a prebiotic fiber that colonocytes ferment into butyrate. Turmeric plus black pepper activates the 2,000% curcumin synergy. Spinach plus lemon activates the iron absorption amplifier. Two powerful synergies in one bowl.',
    quickSwap: 'Add a poached egg on top (+6g protein, choline) or a drizzle of tahini for healthy fat and curcumin absorption.',
  },
  {
    id: 'tm15',
    name: 'Protein Chia Pudding Parfait',
    sources: [
      { platform: 'tiktok', community: '#ChiaPudding', trendScore: 90 },
      { platform: 'instagram', community: '@highproteinbreakfast', trendScore: 88 },
    ],
    description: "Chia seeds soaked in almond milk overnight, layered with wild blueberries, walnuts, and a drizzle of almond butter. The internet's smartest breakfast.",
    keyIngredients: ['Chia Seeds', 'Almond Milk', 'Vanilla Protein Powder', 'Wild Blueberries', 'Walnuts', 'Almond Butter'],
    mealSlots: ['breakfast', 'snack'],
    protocols: ['vegan', 'vegetarian', 'wfpb', 'anti_inflammatory', 'mediterranean', 'omnivore'],
    calories: 390, proteinGrams: 26, fatGrams: 18, carbGrams: 34,
    whyItWorks: "This single bowl activates the Cognitive Synergy (blueberries and walnuts), the Prebiotic-Probiotic Stack (chia fiber), and delivers ALA omega-3 from both chia and walnuts. Chia's hydrogel formation slows gastric emptying.",
  },
]

export function getTrendScore(meal: TrendingMeal): number {
  return Math.round(meal.sources.reduce((s, src) => s + src.trendScore, 0) / meal.sources.length)
}
