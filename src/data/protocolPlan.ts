export type MealSlotType = 'beverage' | 'meal1' | 'meal2' | 'snack'

export type SynergyTag =
  | 'curcumin'
  | 'black_pepper'
  | 'iron'
  | 'vitamin_c'
  | 'omega3'
  | 'prebiotic'
  | 'cruciferous'
  | 'healthy_fat'
  | 'protein'
  | 'resistant_starch'

export interface ProtocolRecipe {
  id: string
  name: string
  type: MealSlotType
  calories: number
  servings: number
  servingSize?: string
  ingredients: string[]
  steps: string[]
  educationalNote: string
  synergyTags: SynergyTag[]
}

export interface ProtocolSynergy {
  id: string
  tags: [SynergyTag, SynergyTag]
  title: string
  boost: string
  mechanism: string
  color: string
}

export interface DayPlan {
  day: number
  beverage: string
  meal1: string
  meal2: string
  snack: string
}

export const PROTOCOL_SYNERGIES: ProtocolSynergy[] = [
  {
    id: 'ps-1',
    tags: ['curcumin', 'black_pepper'],
    title: 'Curcumin Activation',
    boost: '+2,000% bioavailability',
    mechanism: 'Piperine in black pepper inhibits the liver enzyme that clears curcumin before it can act, keeping it in circulation far longer.',
    color: '#c8a74b',
  },
  {
    id: 'ps-2',
    tags: ['iron', 'vitamin_c'],
    title: 'Iron Absorption Amplifier',
    boost: '+300% non-heme iron',
    mechanism: 'Vitamin C reduces ferric iron to ferrous iron, the only form that can cross the gut epithelium from plant sources.',
    color: '#e05c5c',
  },
  {
    id: 'ps-3',
    tags: ['omega3', 'prebiotic'],
    title: 'Gut-Brain Axis Stack',
    boost: 'Neural and microbiome support',
    mechanism: 'Prebiotic fiber feeds bacteria that produce short-chain fatty acids, which work alongside omega-3 EPA and DHA to support both gut lining integrity and brain membrane structure.',
    color: '#0b9e8e',
  },
  {
    id: 'ps-4',
    tags: ['cruciferous', 'healthy_fat'],
    title: 'Sulforaphane Unlock',
    boost: '+400% absorption',
    mechanism: 'Sulforaphane from broccoli, cabbage, and callaloo is fat-soluble. Healthy fat dramatically increases how much your body actually absorbs from these vegetables.',
    color: '#4be08a',
  },
  {
    id: 'ps-5',
    tags: ['resistant_starch', 'protein'],
    title: 'Blood Sugar Balance Stack',
    boost: 'Sustained glucose control',
    mechanism: 'Resistant starch slows glucose absorption from the gut. Protein buffers the insulin response. Together they create one of the most stable post-meal blood sugar curves possible.',
    color: '#9b59b6',
  },
  {
    id: 'ps-6',
    tags: ['omega3', 'cruciferous'],
    title: 'Anti-Inflammatory Trifecta',
    boost: 'Multi-pathway inflammation support',
    mechanism: 'Omega-3 EPA suppresses prostaglandin synthesis at COX-2. Sulforaphane precursors from cruciferous vegetables activate the Nrf2 protective pathway. Two separate mechanisms addressing inflammation simultaneously.',
    color: '#4b9ee0',
  },
]

export function detectProtocolSynergies(recipes: ProtocolRecipe[]): ProtocolSynergy[] {
  const allTags = new Set<SynergyTag>()
  recipes.forEach(r => r.synergyTags.forEach(t => allTags.add(t)))
  return PROTOCOL_SYNERGIES.filter(syn => allTags.has(syn.tags[0]) && allTags.has(syn.tags[1]))
}

export const PROTOCOL_RECIPES: ProtocolRecipe[] = [

  // --- Morning Beverages ---
  {
    id: 'b1', name: 'Matcha Green Tea', type: 'beverage',
    calories: 5, servings: 1, servingSize: '1 Cup',
    ingredients: ['1 tsp Matcha Powder', '8oz Hot Water (not boiling, about 175 F)'],
    steps: ['Sift matcha powder into a cup.', 'Add hot water. Whisk briskly in a W motion until frothy, about 30 seconds.'],
    educationalNote: 'Matcha contains EGCG (epigallocatechin gallate), one of the most studied antioxidant compounds in functional nutrition. EGCG supports metabolic rate and has demonstrated effects on cellular insulin efficiency without spiking blood sugar. L-theanine in matcha also modulates cortisol, supporting the morning fast period.',
    synergyTags: ['vitamin_c'],
  },
  {
    id: 'b2', name: 'Cardiovascular Black Tea', type: 'beverage',
    calories: 2, servings: 1, servingSize: '1 Cup',
    ingredients: ['1 Organic Black Tea bag', '8oz Boiling Water', 'Optional: Slice of lemon'],
    steps: ['Steep tea bag in boiling water for 3 to 5 minutes.', 'Remove bag. Add lemon slice if desired.'],
    educationalNote: 'Black tea theaflavins support cardiovascular health and have shown blood pressure-supporting effects in multiple human trials. Adding lemon is more than flavor: vitamin C increases the bioavailability of tea polyphenols by protecting them from oxidation in the gut.',
    synergyTags: ['vitamin_c'],
  },
  {
    id: 'b3', name: 'Turmeric and Cinnamon Spice Tea', type: 'beverage',
    calories: 5, servings: 1, servingSize: '1 Cup',
    ingredients: ['1/2 tsp Turmeric', '1 Cinnamon stick', '8oz Boiling Water', 'Pinch of black pepper (non-negotiable)'],
    steps: [
      'Simmer turmeric and cinnamon in water for 5 minutes.',
      'Pour into a cup. Add a pinch of black pepper before drinking.',
    ],
    educationalNote: 'This single cup activates the Curcumin Activation synergy on its own: black pepper piperine inhibits glucuronidation, keeping curcumin in your bloodstream up to 2,000% longer. Cinnamon supports GLUT4 transporter activity, the mechanism cells use to pull glucose in without needing extra insulin. Both compounds together make this the most functionally active beverage in the plan.',
    synergyTags: ['curcumin', 'black_pepper'],
  },

  // --- Meal 1 (12-2PM) ---
  {
    id: 'm1_1', name: 'Sweet Potato Waffle with Eggs', type: 'meal1',
    calories: 410, servings: 2, servingSize: '2 Waffles and 2 Eggs',
    ingredients: ['1 lb Sweet Potato (baked and mashed)', '4 Pasture-raised Eggs', '1 tsp Cinnamon', 'Coconut oil spray'],
    steps: [
      'Bake sweet potatoes ahead of time and mash completely.',
      'Mix mashed sweet potato with 2 eggs and cinnamon until combined.',
      'Spray waffle iron and cook until golden and crisp.',
      'Serve with remaining 2 eggs prepared as preferred.',
    ],
    educationalNote: 'Sweet potato provides slow-releasing complex carbohydrates that prevent glucose spikes. Cinnamon supports GLUT4 transporter activity. Eggs deliver all 9 essential amino acids plus choline, one of the most underconsumed nutrients for liver methylation and acetylcholine production.',
    synergyTags: ['resistant_starch', 'protein', 'healthy_fat'],
  },
  {
    id: 'm1_2', name: 'Tuna Lettuce Wraps with Avocado', type: 'meal1',
    calories: 310, servings: 2, servingSize: '3 Large Wraps',
    ingredients: ['2 cans Tuna in water (drained)', '1 ripe Avocado (mashed)', '1 stalk Celery (diced)', 'Large Romaine or Bibb lettuce leaves', 'Juice of 1 Lemon', 'Sea salt and pepper'],
    steps: [
      'Drain tuna thoroughly and mix with mashed avocado, diced celery, and lemon juice.',
      'Season with salt and pepper.',
      'Scoop into large lettuce leaves and serve immediately.',
    ],
    educationalNote: 'Tuna delivers omega-3 EPA and DHA that directly improve cellular insulin receptor function. Avocado provides monounsaturated fat that improves fat-soluble nutrient absorption. The lettuce base creates zero glycemic impact. Together they activate the Gut-Brain Axis synergy with any prebiotic food in the day.',
    synergyTags: ['omega3', 'healthy_fat', 'protein'],
  },
  {
    id: 'm1_3', name: 'Chia Seed Pudding with Coconut Milk', type: 'meal1',
    calories: 320, servings: 2, servingSize: '1 Bowl',
    ingredients: ['1/2 cup Chia Seeds', '2 cups Light Coconut Milk', '1 tsp Vanilla extract', 'Stevia or Monk Fruit to taste', '1/2 cup Mixed Berries'],
    steps: [
      'Whisk chia seeds and coconut milk together until no clumps remain.',
      'Sweeten with stevia or monk fruit.',
      'Refrigerate at least 4 hours or overnight until set.',
      'Top with mixed berries before serving.',
    ],
    educationalNote: 'Chia seeds form a hydrogel matrix in the gut that dramatically slows glucose absorption. As a soluble prebiotic fiber, chia feeds beneficial Bifidobacterium strains that produce butyrate, the primary fuel of the gut lining. Berries add anthocyanins that improve insulin signaling at the cellular level.',
    synergyTags: ['prebiotic', 'healthy_fat', 'vitamin_c'],
  },
  {
    id: 'm1_4', name: 'Eggs and Tomato with Sauteed Callaloo', type: 'meal1',
    calories: 380, servings: 2, servingSize: '1 Plate',
    ingredients: ['4 Eggs', '2 Medium Tomatoes (diced)', '2 cups Fresh Callaloo', '1 tsp Coconut Oil', 'Sea salt and pepper'],
    steps: [
      'Heat coconut oil in a skillet over medium heat.',
      'Sauté callaloo until wilted, about 2 to 3 minutes.',
      'Add diced tomatoes and cook 1 minute.',
      'Crack in eggs and scramble everything together until set.',
    ],
    educationalNote: 'Callaloo is exceptionally high in iron and contains indole-3-carbinol (I3C) for liver detoxification pathway support. Tomatoes add lycopene and vitamin C that directly amplifies iron absorption from the callaloo, activating the Iron Absorption Amplifier synergy in a single dish.',
    synergyTags: ['iron', 'vitamin_c', 'cruciferous', 'protein'],
  },
  {
    id: 'm1_5', name: 'Callaloo and Egg White Frittata', type: 'meal1',
    calories: 350, servings: 2, servingSize: '1/2 Frittata',
    ingredients: ['2 cups Liquid Egg Whites', '2 cups Fresh Callaloo', '1/2 Onion (diced)', '2 cloves Garlic', '1/2 Bell Pepper (diced)'],
    steps: [
      'Preheat oven to 350 F.',
      'Sauté onion, garlic, and bell pepper until soft.',
      'Add callaloo and cook until wilted.',
      'Pour egg whites over the vegetables.',
      'Transfer to oven and bake until set, about 20 minutes.',
    ],
    educationalNote: 'Egg whites provide leucine-dominant protein that activates mTOR signaling for muscle protein synthesis, critical for maintaining lean mass during a fasting protocol. Bell pepper provides significant vitamin C, pairing directly with callaloo iron to activate the Iron Absorption Amplifier synergy.',
    synergyTags: ['iron', 'vitamin_c', 'cruciferous', 'protein'],
  },
  {
    id: 'm1_6', name: 'Ginger Chicken Stir-fry with Cabbage', type: 'meal1',
    calories: 420, servings: 2, servingSize: '1.5 Cups',
    ingredients: ['1 lb Chicken Breast (sliced thin)', '3 cups Green Cabbage (shredded)', '1 inch Fresh Ginger (grated)', '2 cloves Garlic', 'Coconut Aminos', 'Coconut oil'],
    steps: [
      'Heat coconut oil in a large wok over high heat.',
      'Add chicken and stir-fry until cooked through, about 5 minutes. Remove.',
      'Add cabbage, ginger, and garlic. Stir-fry 3 to 4 minutes.',
      'Return chicken, add coconut aminos, and toss to combine.',
    ],
    educationalNote: 'Cabbage glucosinolates convert to isothiocyanates in the gut that activate Nrf2, the master antioxidant regulatory switch. Ginger gingerols are potent anti-inflammatory compounds acting through simultaneous COX-2 and NF-kB inhibition. Coconut aminos replace soy sauce without the blood sugar impact.',
    synergyTags: ['cruciferous', 'healthy_fat', 'protein'],
  },
  {
    id: 'm1_7', name: 'Curry Chickpeas with Boiled Green Banana', type: 'meal1',
    calories: 450, servings: 2, servingSize: '1 Bowl and Side',
    ingredients: ['1 can Chickpeas (drained)', '4 Green Bananas', 'Curry Powder', '1 Onion (diced)', '3 cloves Garlic'],
    steps: [
      'Boil green bananas in salted water until tender, about 15 to 20 minutes.',
      'Sauté onion and garlic until soft.',
      'Add curry powder and stir 1 minute.',
      'Add chickpeas with a splash of water. Simmer 10 minutes.',
      'Serve chickpeas alongside boiled green banana.',
    ],
    educationalNote: 'Green banana is one of the highest sources of resistant starch available: unlike ripe bananas, unripe ones are high in RS2 resistant starch that acts as a true prebiotic. Curry powder contains curcumin. This meal activates the Blood Sugar Balance Stack and sets up the Curcumin Activation synergy with any black pepper source in the day.',
    synergyTags: ['prebiotic', 'resistant_starch', 'curcumin'],
  },
  {
    id: 'm1_8', name: 'Curry Chickpeas with Sauteed Callaloo', type: 'meal1',
    calories: 410, servings: 2, servingSize: '1 Bowl',
    ingredients: ['1 can Chickpeas (drained)', '2 cups Fresh Callaloo', 'Curry Powder', '3 cloves Garlic', '1 tsp Coconut Oil'],
    steps: [
      'Sauté garlic in coconut oil until fragrant.',
      'Add callaloo and cook until wilted.',
      'Add chickpeas and curry powder. Stir, add a splash of water and simmer 8 to 10 minutes.',
    ],
    educationalNote: 'This dish stacks curcumin from curry powder with iron and I3C from callaloo. Coconut oil as the cooking fat activates the Sulforaphane Unlock synergy from the callaloo. Any vitamin C source in the day adds the Iron Absorption Amplifier on top of this.',
    synergyTags: ['iron', 'curcumin', 'prebiotic', 'cruciferous', 'healthy_fat'],
  },
  {
    id: 'm1_9', name: 'Coconut Lentils with Quinoa', type: 'meal1',
    calories: 440, servings: 2, servingSize: '1 Bowl',
    ingredients: ['1 cup Red Lentils', '1/2 cup Light Coconut Milk', '1/2 cup Quinoa (cooked)', '1/2 tsp Turmeric', '1 pinch Black Pepper'],
    steps: [
      'Cook quinoa separately per package instructions.',
      'Simmer red lentils in water until soft. Add coconut milk and turmeric.',
      'Add a pinch of black pepper to activate turmeric.',
      'Serve lentils over quinoa.',
    ],
    educationalNote: 'This bowl activates the Curcumin Activation synergy directly: turmeric plus black pepper in one dish. Red lentils have an exceptionally low glycemic index and high resistant starch content. Quinoa provides complete protein plus magnesium, a cofactor in insulin receptor kinase activation. Coconut milk fat supports fat-soluble compound absorption.',
    synergyTags: ['prebiotic', 'curcumin', 'black_pepper', 'resistant_starch', 'healthy_fat'],
  },
  {
    id: 'm1_10', name: 'Lentil Stew with Boiled Green Banana', type: 'meal1',
    calories: 430, servings: 2, servingSize: '1 Bowl and Side',
    ingredients: ['1 cup Brown Lentils', '4 Green Bananas', '2 Carrots (sliced)', 'Fresh Thyme', 'Garlic and Onion'],
    steps: [
      'Boil green bananas until tender.',
      'Simmer lentils with carrots, thyme, garlic, and onion until thick, about 25 minutes.',
      'Serve together.',
    ],
    educationalNote: 'Two prebiotic and resistant starch sources in one meal creates an unusually strong microbiome-supporting effect. Brown lentils are high in iron. Carrots add beta-carotene. Any vitamin C source in the day activates the Iron Absorption Amplifier synergy alongside this meal.',
    synergyTags: ['prebiotic', 'resistant_starch', 'iron'],
  },
  {
    id: 'm1_11', name: 'Boiled Green Banana with Eggs and Tomato', type: 'meal1',
    calories: 390, servings: 2, servingSize: '1 Plate',
    ingredients: ['4 Green Bananas', '4 Eggs', '2 Tomatoes (diced)', '2 Scallions (sliced)'],
    steps: [
      'Boil green bananas in salted water until tender.',
      'Sauté scallions and tomatoes until soft.',
      'Add eggs and scramble until cooked.',
      'Serve alongside boiled green banana.',
    ],
    educationalNote: 'Tomatoes contribute vitamin C that pairs with iron from eggs and plant foods in the day. Resistant starch from green banana feeds the gut lining directly. Eggs at first meal support muscle protein retention during the extended fasting window.',
    synergyTags: ['resistant_starch', 'protein', 'vitamin_c'],
  },
  {
    id: 'm1_12', name: 'Curry Chickpeas with Baked Sweet Potato', type: 'meal1',
    calories: 460, servings: 2, servingSize: '1 Bowl',
    ingredients: ['1 can Chickpeas (drained)', '2 Sweet Potatoes (baked)', 'Curry Powder', '3 cloves Garlic'],
    steps: [
      'Bake sweet potatoes at 400 F for 45 minutes until tender.',
      'Simmer chickpeas with curry powder, garlic, and a splash of water.',
      'Serve chickpeas over or alongside the sweet potato.',
    ],
    educationalNote: 'Sweet potatoes are rich in beta-carotene, complex fiber, and have a lower glycemic impact than white potato when eaten with protein and fat. Chickpeas provide prebiotic fiber plus plant protein. Curcumin from curry powder is active in this meal.',
    synergyTags: ['curcumin', 'prebiotic', 'resistant_starch'],
  },
  {
    id: 'm1_13', name: 'Lentil Stew with Sauteed Callaloo', type: 'meal1',
    calories: 420, servings: 2, servingSize: '1 Bowl',
    ingredients: ['1 cup Brown Lentils', '2 cups Fresh Callaloo', '1 Onion', '3 cloves Garlic'],
    steps: [
      'Simmer lentils with onion and garlic until tender.',
      'Sauté callaloo separately in a pan until wilted.',
      'Serve together in one bowl.',
    ],
    educationalNote: 'Lentils and callaloo together create one of the highest iron-plus-prebiotic combinations in functional nutrition. A vitamin C source any time in the day activates the Iron Absorption Amplifier synergy for this meal.',
    synergyTags: ['iron', 'prebiotic', 'cruciferous'],
  },
  {
    id: 'm1_14', name: 'Lentil Stew with Sweet Potato', type: 'meal1',
    calories: 440, servings: 2, servingSize: '1 Bowl',
    ingredients: ['1 cup Brown Lentils', '2 Sweet Potatoes (cubed)', 'Fresh Thyme', '1 Carrot (sliced)'],
    steps: [
      'Cube sweet potatoes and simmer with lentils, carrot, and thyme until thick, about 30 minutes.',
    ],
    educationalNote: 'One of the most glycemically stable meal combinations in the plan. Fiber and resistant starch from both lentils and sweet potato slow glucose absorption significantly. Thyme provides rosmarinic acid, an antioxidant compound with demonstrated anti-inflammatory properties.',
    synergyTags: ['iron', 'prebiotic', 'resistant_starch'],
  },
  {
    id: 'm1_15', name: 'Lentil Stew with Steamed Cabbage', type: 'meal1',
    calories: 400, servings: 2, servingSize: '1 Bowl',
    ingredients: ['1 cup Brown Lentils', '2 cups Green Cabbage', '3 cloves Garlic', '1 Onion'],
    steps: [
      'Simmer lentils with onion and garlic until tender.',
      'Steam cabbage with a pinch of salt until just tender.',
      'Serve together.',
    ],
    educationalNote: 'Cabbage glucosinolates and lentil resistant starch address both microbiome diversity and cruciferous detoxification support simultaneously. Any healthy fat in the day activates the Sulforaphane Unlock synergy from the cabbage.',
    synergyTags: ['iron', 'prebiotic', 'cruciferous'],
  },

  // --- Meal 2 (5-7PM) ---
  {
    id: 'm2_1', name: 'Grilled Salmon with Cabbage and Broccoli', type: 'meal2',
    calories: 440, servings: 2, servingSize: '1 Fillet and Vegetables',
    ingredients: ['12oz Wild Salmon fillets', '2 cups Green Cabbage (shredded)', '2 cups Broccoli florets', 'Extra Virgin Olive Oil', 'Lemon', 'Sea salt and pepper'],
    steps: [
      'Grill or pan-sear salmon with lemon, salt, and pepper. Cook 4 to 5 minutes per side.',
      'Steam or sauté cabbage and broccoli with a drizzle of EVOO.',
    ],
    educationalNote: 'This meal activates three synergies simultaneously. Omega-3 and prebiotic cruciferous fiber: Gut-Brain Axis. EVOO and cruciferous vegetables: Sulforaphane Unlock. Omega-3 and cruciferous compounds: Anti-Inflammatory Trifecta. Salmon omega-3 also directly improves cellular insulin receptor function.',
    synergyTags: ['omega3', 'cruciferous', 'healthy_fat', 'protein'],
  },
  {
    id: 'm2_2', name: 'Herb Roasted Chicken with Quinoa', type: 'meal2',
    calories: 460, servings: 2, servingSize: '1 Breast and 1/2 Cup Quinoa',
    ingredients: ['2 Chicken Breasts', '1 cup Quinoa (cooked)', 'Fresh Thyme and Rosemary', '3 cloves Garlic', 'Olive Oil'],
    steps: [
      'Rub chicken with olive oil, garlic, thyme, and rosemary.',
      'Roast at 400 F for 25 to 30 minutes.',
      'Serve over fluffy quinoa.',
    ],
    educationalNote: 'Quinoa provides all 9 essential amino acids plus magnesium, a mineral cofactor in over 300 enzymatic reactions including insulin receptor kinase activation. Rosemary contains carnosic acid, one of the most potent neuroprotective antioxidants found in herbs.',
    synergyTags: ['protein', 'healthy_fat'],
  },
  {
    id: 'm2_3', name: 'Baked Salmon with Cauliflower Rice', type: 'meal2',
    calories: 410, servings: 2, servingSize: '1 Fillet and Side',
    ingredients: ['12oz Wild Salmon', '1 head Cauliflower (processed into rice)', '2 cloves Garlic', 'Avocado oil', 'Lemon and herbs'],
    steps: [
      'Bake salmon at 400 F for 15 to 18 minutes.',
      'Sauté cauliflower rice with garlic and avocado oil until tender.',
    ],
    educationalNote: 'Cauliflower is a brassica. Avocado oil provides healthy fat that activates the Sulforaphane Unlock synergy. Salmon omega-3 and cauliflower cruciferous compounds activate the Anti-Inflammatory Trifecta. This single meal activates two synergies without any additional food for the day.',
    synergyTags: ['omega3', 'cruciferous', 'healthy_fat', 'protein'],
  },
  {
    id: 'm2_4', name: 'Jerk Chicken with Roasted Vegetables', type: 'meal2',
    calories: 480, servings: 2, servingSize: '6 Pieces and Vegetables',
    ingredients: ['12 Chicken Pieces', '1 tbsp Jerk Seasoning', '2 cups Mixed Vegetables (bell pepper, zucchini, onion)', 'Coconut oil'],
    steps: [
      'Preheat oven to 425 F.',
      'Rub chicken with jerk seasoning.',
      'Toss vegetables with coconut oil and spread on a sheet pan.',
      'Nestle chicken among vegetables. Roast 30 to 35 minutes until cooked through.',
    ],
    educationalNote: 'Jerk seasoning contains allspice and scotch bonnet, both rich in anti-inflammatory phytonutrients. Bell peppers in the roasted vegetables provide significant vitamin C, which pairs with any iron source in the day to activate the Iron Absorption Amplifier synergy.',
    synergyTags: ['protein', 'vitamin_c', 'healthy_fat'],
  },
  {
    id: 'm2_5', name: 'Baked Chicken with Quinoa', type: 'meal2',
    calories: 450, servings: 2, servingSize: '1 Breast and Side',
    ingredients: ['2 Chicken Breasts', '1 cup Quinoa (cooked)', 'Garlic Powder', 'Smoked Paprika', 'Olive oil'],
    steps: [
      'Season chicken with garlic powder and paprika.',
      'Bake at 400 F for 25 to 30 minutes.',
      'Serve over warm quinoa.',
    ],
    educationalNote: 'Smoked paprika contains capsanthin and zeaxanthin, carotenoids that support cellular antioxidant defense. Quinoa provides magnesium that directly activates the enzyme that starts the glucose uptake process in cells.',
    synergyTags: ['protein', 'healthy_fat'],
  },
  {
    id: 'm2_6', name: 'Herb Roasted Chicken with Sweet Potato', type: 'meal2',
    calories: 470, servings: 2, servingSize: '1 Breast and 1 Potato',
    ingredients: ['2 Chicken Breasts', '2 Sweet Potatoes (baked)', 'Fresh Herbs', 'Olive oil'],
    steps: [
      'Bake sweet potatoes at 400 F for 40 to 45 minutes.',
      'Rub chicken with herbs and olive oil. Bake alongside for the last 30 minutes.',
    ],
    educationalNote: 'Sweet potato and chicken together directly activate the Blood Sugar Balance Stack synergy: resistant starch slows glucose absorption, protein buffers the insulin response. This combination creates one of the most stable post-meal blood glucose curves possible.',
    synergyTags: ['resistant_starch', 'protein', 'healthy_fat'],
  },
  {
    id: 'm2_7', name: 'Baked Salmon with Quinoa', type: 'meal2',
    calories: 430, servings: 2, servingSize: '1 Fillet and Side',
    ingredients: ['12oz Wild Salmon', '1 cup Quinoa (cooked)', 'Lemon', 'Black pepper and herbs'],
    steps: [
      'Bake salmon at 400 F for 15 to 18 minutes.',
      'Serve over warm quinoa with fresh lemon.',
    ],
    educationalNote: 'Salmon plus quinoa creates a complete functional nutrition profile for overnight metabolic support: omega-3 for cellular membrane health, complete amino acids for muscle protein synthesis, and magnesium for insulin receptor function. Supports glucose control through the overnight fasting window.',
    synergyTags: ['omega3', 'protein', 'healthy_fat'],
  },
  {
    id: 'm2_8', name: 'Baked Chicken with Air-Fried Sweet Potato', type: 'meal2',
    calories: 455, servings: 2, servingSize: '1 Plate',
    ingredients: ['2 Chicken Breasts', '2 Sweet Potatoes (cubed)', 'Avocado oil', 'Garlic and herbs'],
    steps: [
      'Season and bake chicken at 400 F for 25 minutes.',
      'Cube sweet potato, toss with avocado oil, and air-fry at 400 F for 18 to 20 minutes.',
    ],
    educationalNote: 'Air-frying achieves a similar texture to traditional frying with significantly less oil. Avocado oil provides monounsaturated fat with a high smoke point. Resistant starch in sweet potato and chicken protein directly activate the Blood Sugar Balance Stack synergy.',
    synergyTags: ['resistant_starch', 'protein', 'healthy_fat'],
  },
  {
    id: 'm2_9', name: 'Grilled Salmon with Quinoa and Broccoli', type: 'meal2',
    calories: 445, servings: 2, servingSize: '1 Fillet and Sides',
    ingredients: ['12oz Wild Salmon', '1/2 cup Quinoa (cooked)', '2 cups Broccoli florets', 'Lemon and EVOO'],
    steps: [
      'Grill or pan-sear salmon 4 to 5 minutes per side.',
      'Steam broccoli until bright green and tender-crisp.',
      'Serve over quinoa with lemon and a drizzle of EVOO.',
    ],
    educationalNote: 'The highest-synergy meal in the entire plan. Activates three synergies: Gut-Brain Axis (omega-3 and prebiotic broccoli fiber), Sulforaphane Unlock (EVOO and broccoli), and Anti-Inflammatory Trifecta (omega-3 and cruciferous). Three separate mechanisms, one meal.',
    synergyTags: ['omega3', 'cruciferous', 'healthy_fat', 'protein'],
  },

  // --- Snacks ---
  {
    id: 's1', name: 'Raw Almonds', type: 'snack',
    calories: 160, servings: 1, servingSize: '1/4 Cup',
    ingredients: ['1/4 cup Raw Almonds'],
    steps: ['Serve as is.'],
    educationalNote: 'Almonds provide magnesium, vitamin E, and monounsaturated fat. Magnesium is required for over 300 enzymatic reactions including insulin receptor activation.',
    synergyTags: ['healthy_fat', 'protein'],
  },
  {
    id: 's2', name: 'Chia Seeds in Coconut Milk', type: 'snack',
    calories: 190, servings: 1, servingSize: '1 Small Bowl',
    ingredients: ['2 tbsp Chia Seeds', '1/2 cup Light Coconut Milk'],
    steps: ['Soak chia seeds in coconut milk for at least 2 hours or overnight.'],
    educationalNote: 'Chia seeds provide a significant prebiotic fiber dose. The hydrogel they form slows gastric emptying, buffering any late-day glucose variation. Also contain plant-based ALA omega-3.',
    synergyTags: ['prebiotic', 'healthy_fat'],
  },
  {
    id: 's3', name: 'Raw Walnuts', type: 'snack',
    calories: 185, servings: 1, servingSize: '1/4 Cup',
    ingredients: ['1/4 cup Raw Walnuts'],
    steps: ['Serve as is.'],
    educationalNote: 'Walnuts are the only nut with significant omega-3 ALA content. They also contain ellagitannins that gut bacteria convert into urolithins, compounds with studied effects on mitochondrial health and cellular energy.',
    synergyTags: ['omega3', 'healthy_fat'],
  },
  {
    id: 's4', name: 'Mixed Berries', type: 'snack',
    calories: 80, servings: 1, servingSize: '1/2 Cup',
    ingredients: ['1/2 cup Mixed Berries (blueberries, strawberries, raspberries)'],
    steps: ['Rinse and serve cold.'],
    educationalNote: 'Berries are among the lowest-glycemic fruits and highest in anthocyanins that improve insulin signaling. Strawberries provide significant vitamin C, activating the Iron Absorption Amplifier when paired with iron-rich meals in the day.',
    synergyTags: ['vitamin_c'],
  },
  {
    id: 's5', name: 'Hard-Boiled Egg', type: 'snack',
    calories: 75, servings: 1, servingSize: '1 Egg',
    ingredients: ['1 Pasture-raised Egg'],
    steps: ['Boil egg for 9 to 10 minutes. Cool in ice water. Peel and serve.'],
    educationalNote: 'A single hard-boiled egg provides 6g complete protein, 300mg choline (50% of daily requirement), and B12. Choline is essential for acetylcholine production and liver phosphatidylcholine synthesis.',
    synergyTags: ['protein'],
  },
]

export const PLAN_DATA: DayPlan[] = [
  { day: 1,  beverage: 'b1', meal1: 'm1_1',  meal2: 'm2_1', snack: 's1' },
  { day: 2,  beverage: 'b2', meal1: 'm1_2',  meal2: 'm2_2', snack: 's2' },
  { day: 3,  beverage: 'b3', meal1: 'm1_3',  meal2: 'm2_3', snack: 's3' },
  { day: 4,  beverage: 'b1', meal1: 'm1_4',  meal2: 'm2_4', snack: 's4' },
  { day: 5,  beverage: 'b2', meal1: 'm1_5',  meal2: 'm2_5', snack: 's5' },
  { day: 6,  beverage: 'b3', meal1: 'm1_6',  meal2: 'm2_1', snack: 's2' },
  { day: 7,  beverage: 'b1', meal1: 'm1_11', meal2: 'm2_6', snack: 's1' },
  { day: 8,  beverage: 'b2', meal1: 'm1_8',  meal2: 'm2_7', snack: 's3' },
  { day: 9,  beverage: 'b3', meal1: 'm1_2',  meal2: 'm2_4', snack: 's2' },
  { day: 10, beverage: 'b1', meal1: 'm1_6',  meal2: 'm2_8', snack: 's4' },
  { day: 11, beverage: 'b2', meal1: 'm1_9',  meal2: 'm2_9', snack: 's1' },
  { day: 12, beverage: 'b3', meal1: 'm1_10', meal2: 'm2_6', snack: 's2' },
  { day: 13, beverage: 'b1', meal1: 'm1_4',  meal2: 'm2_3', snack: 's3' },
  { day: 14, beverage: 'b2', meal1: 'm1_2',  meal2: 'm2_4', snack: 's5' },
  { day: 15, beverage: 'b3', meal1: 'm1_1',  meal2: 'm2_5', snack: 's2' },
  { day: 16, beverage: 'b1', meal1: 'm1_12', meal2: 'm2_1', snack: 's1' },
  { day: 17, beverage: 'b2', meal1: 'm1_13', meal2: 'm2_2', snack: 's4' },
  { day: 18, beverage: 'b3', meal1: 'm1_8',  meal2: 'm2_3', snack: 's2' },
  { day: 19, beverage: 'b1', meal1: 'm1_4',  meal2: 'm2_4', snack: 's3' },
  { day: 20, beverage: 'b2', meal1: 'm1_1',  meal2: 'm2_5', snack: 's5' },
  { day: 21, beverage: 'b3', meal1: 'm1_7',  meal2: 'm2_1', snack: 's2' },
  { day: 22, beverage: 'b1', meal1: 'm1_9',  meal2: 'm2_6', snack: 's1' },
  { day: 23, beverage: 'b2', meal1: 'm1_11', meal2: 'm2_7', snack: 's4' },
  { day: 24, beverage: 'b3', meal1: 'm1_2',  meal2: 'm2_4', snack: 's2' },
  { day: 25, beverage: 'b1', meal1: 'm1_8',  meal2: 'm2_8', snack: 's3' },
  { day: 26, beverage: 'b2', meal1: 'm1_14', meal2: 'm2_1', snack: 's5' },
  { day: 27, beverage: 'b3', meal1: 'm1_1',  meal2: 'm2_2', snack: 's2' },
  { day: 28, beverage: 'b1', meal1: 'm1_10', meal2: 'm2_3', snack: 's1' },
  { day: 29, beverage: 'b2', meal1: 'm1_12', meal2: 'm2_4', snack: 's4' },
  { day: 30, beverage: 'b3', meal1: 'm1_2',  meal2: 'm2_5', snack: 's2' },
]

export function getDayScore(daySynergies: ProtocolSynergy[], tags: Set<SynergyTag>, slotsFilledCount: number): number {
  let score = 20
  score += daySynergies.length * 15
  if (tags.has('protein')) score += 10
  if (tags.has('prebiotic') || tags.has('resistant_starch')) score += 10
  if (tags.has('omega3') || tags.has('cruciferous')) score += 10
  if (slotsFilledCount >= 3) score += 5
  return Math.min(100, score)
}
