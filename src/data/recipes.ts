export type RootsPhase = 'Remove' | 'Optimize' | 'Observe' | 'Transform' | 'Sustain'

export interface Recipe {
  id: string
  name: string
  rootsPhase: RootsPhase
  tags: string[]
  ingredients: string[]
  steps: string[]
  educationalNote: string
}

export const RECIPES: Recipe[] = [
  // --- Remove ---
  {
    id: 'r01',
    name: 'Cucumber Mint Water',
    rootsPhase: 'Remove',
    tags: ['5-minute', 'hydration', 'anti-inflammatory'],
    ingredients: [
      '1/2 medium cucumber, thinly sliced',
      '8 to 10 fresh mint leaves',
      '1 lemon, thinly sliced',
      '4 cups cold filtered water',
      'Ice, to serve',
    ],
    steps: [
      'Add cucumber slices, mint leaves, and lemon slices to a large glass pitcher.',
      'Pour in cold filtered water.',
      'Refrigerate for at least 1 hour to let the flavors develop, or serve immediately over ice.',
      'Refill with water up to two more times before discarding the produce.',
    ],
    educationalNote:
      'Starting your day with plain, herb-infused water is a simple Remove-phase habit. Cucumber provides silica and plant compounds that function as antioxidants. Replacing sweetened beverages with infused water reduces your daily refined sugar load, which is a foundational step in the Remove phase.',
  },
  {
    id: 'r02',
    name: 'Arugula Salad with Lemon and Pumpkin Seeds',
    rootsPhase: 'Remove',
    tags: ['10-minute', 'anti-inflammatory', 'whole-food'],
    ingredients: [
      '3 cups fresh arugula',
      '1 tbsp extra-virgin olive oil',
      'Juice of half a lemon',
      '2 tbsp raw pumpkin seeds',
      'Pinch of flaky sea salt',
      'Pinch of black pepper',
    ],
    steps: [
      'Wash and dry arugula thoroughly.',
      'Whisk olive oil and lemon juice together in a small bowl.',
      'Toss arugula with the dressing.',
      'Top with pumpkin seeds, sea salt, and black pepper. Serve immediately.',
    ],
    educationalNote:
      'Arugula belongs to the cruciferous family and contains glucosinolates, compounds studied for their role in supporting the liver\'s phase-2 detoxification pathways. Extra-virgin olive oil provides oleocanthal, a polyphenol studied for its role in supporting a balanced inflammatory response. This salad uses no seed oils and no refined ingredients, making it a clean Remove-phase template.',
  },
  {
    id: 'r03',
    name: 'Sheet Pan Roasted Root Vegetables',
    rootsPhase: 'Remove',
    tags: ['meal-prep', 'whole-food', 'anti-inflammatory'],
    ingredients: [
      '2 medium beets, peeled and cubed (1-inch pieces)',
      '2 medium carrots, chopped',
      '1 medium sweet potato, cubed',
      '2 tbsp extra-virgin olive oil',
      '1 tsp ground cumin',
      '1 tsp sea salt',
      'Black pepper to taste',
    ],
    steps: [
      'Preheat oven to 400 F (205 C).',
      'Toss all vegetables with olive oil, cumin, salt, and pepper in a large bowl.',
      'Spread in a single layer on a parchment-lined baking sheet. Avoid crowding.',
      'Roast 30 to 35 minutes, flipping once halfway through, until tender and lightly caramelized.',
      'Store leftovers refrigerated up to 4 days.',
    ],
    educationalNote:
      'Root vegetables are rich in beta-carotene and other carotenoid pigments that function as antioxidants in the body. Roasting with olive oil (rather than refined seed oils high in omega-6 fatty acids) keeps the inflammatory load low. Batch roasting a tray of vegetables at the start of the week removes daily decision fatigue, a habit that supports consistency across all ROOTS phases.',
  },

  // --- Optimize ---
  {
    id: 'r04',
    name: 'Overnight Oats with Berries and Flaxseed',
    rootsPhase: 'Optimize',
    tags: ['blood-sugar-friendly', 'fiber-rich', 'meal-prep'],
    ingredients: [
      '1/2 cup rolled oats (not instant)',
      '1/2 cup unsweetened almond milk (or other non-dairy milk)',
      '2 tbsp ground flaxseed',
      '1/4 tsp ground cinnamon',
      '1 tbsp natural almond butter',
      '1/2 cup mixed berries (fresh or thawed from frozen)',
    ],
    steps: [
      'Combine oats, almond milk, ground flaxseed, and cinnamon in a mason jar or container with a lid.',
      'Stir well, making sure the flaxseed is evenly distributed.',
      'Seal and refrigerate overnight, or for at least 4 hours.',
      'Before serving, top with almond butter and berries.',
    ],
    educationalNote:
      'Rolled oats provide beta-glucan, a soluble fiber that slows gastric emptying and supports a gradual rise in blood glucose rather than a sharp post-meal spike. This helps sustain steady energy through the morning. Ground flaxseed adds plant-based omega-3 ALA and lignans. Preparing this the evening before removes the barrier to a consistent, balanced breakfast, a core Optimize-phase habit.',
  },
  {
    id: 'r05',
    name: 'Three-Egg Spinach and Tomato Scramble',
    rootsPhase: 'Optimize',
    tags: ['protein-rich', '10-minute', 'blood-sugar-friendly'],
    ingredients: [
      '3 large eggs',
      '1 cup fresh baby spinach',
      '1/2 cup cherry tomatoes, halved',
      '1 clove garlic, minced',
      '1 tbsp extra-virgin olive oil',
      'Pinch of sea salt',
      'Black pepper to taste',
    ],
    steps: [
      'Heat olive oil in a non-stick skillet over medium heat.',
      'Add garlic and cherry tomatoes. Cook 2 minutes, stirring occasionally, until tomatoes soften.',
      'Add spinach and toss until wilted, about 1 minute.',
      'Whisk eggs with a pinch of salt. Pour into the skillet.',
      'Stir gently with a spatula, folding the eggs until just set. Remove from heat.',
      'Season with black pepper and serve immediately.',
    ],
    educationalNote:
      'Eggs provide all nine essential amino acids and are one of the few dietary sources of choline, a nutrient that supports liver function and the production of acetylcholine in the nervous system. Including adequate protein at breakfast supports satiety signaling and reduces the likelihood of high-carbohydrate snacking mid-morning. Pairing protein with vegetables also supports consistent energy levels through the day.',
  },
  {
    id: 'r06',
    name: 'Lemon Herb Baked Salmon with Steamed Broccoli',
    rootsPhase: 'Optimize',
    tags: ['omega-3-rich', 'anti-inflammatory', 'whole-food'],
    ingredients: [
      '2 salmon fillets (about 6 oz each)',
      '1 lemon, thinly sliced',
      '2 cloves garlic, minced',
      '2 tbsp fresh dill (or 1 tsp dried dill)',
      '1 tbsp extra-virgin olive oil',
      '2 cups broccoli florets',
      'Sea salt and black pepper to taste',
    ],
    steps: [
      'Preheat oven to 375 F (190 C).',
      'Place salmon fillets on a parchment-lined baking sheet.',
      'Rub each fillet with olive oil and minced garlic. Season with salt, pepper, and dill.',
      'Lay lemon slices on top of the salmon.',
      'Bake 14 to 16 minutes until the salmon flakes easily with a fork.',
      'While salmon bakes, steam broccoli florets 4 to 5 minutes until bright green and tender-crisp.',
      'Serve salmon alongside broccoli with a wedge of lemon.',
    ],
    educationalNote:
      'Wild-caught salmon is among the richest dietary sources of EPA and DHA, the long-chain omega-3 fatty acids that are incorporated into cell membranes throughout the body and support a healthy inflammatory response. Broccoli provides sulforaphane, a sulfur compound studied for its role in supporting cellular antioxidant pathways. Together, this meal provides a broad spectrum of Optimize-phase nutrients in a single, simple preparation.',
  },

  // --- Observe ---
  {
    id: 'r07',
    name: 'Green Observation Smoothie',
    rootsPhase: 'Observe',
    tags: ['5-minute', 'fiber-rich', 'whole-food'],
    ingredients: [
      '1 cup baby spinach',
      '1/2 medium cucumber, chopped',
      '1/2 cup frozen pineapple chunks',
      '1 tbsp chia seeds',
      '1 cup unsweetened coconut water',
      'Juice of half a lime',
    ],
    steps: [
      'Add all ingredients to a blender in the order listed.',
      'Blend on high for 60 seconds until smooth.',
      'Pour and serve immediately.',
      'Optional: note how you feel 30 to 60 minutes after drinking it in your daily log.',
    ],
    educationalNote:
      'Keeping a smoothie simple with just a few identifiable ingredients makes it easier to observe how your body responds to each one. This food-mood awareness practice is central to the Observe phase. Chia seeds provide soluble fiber, plant-based omega-3 ALA, and calcium. Coconut water provides potassium and natural electrolytes to support fluid balance.',
  },
  {
    id: 'r08',
    name: 'One-Pan Herb Chicken Thighs with Zucchini',
    rootsPhase: 'Observe',
    tags: ['elimination-friendly', 'protein-rich', 'whole-food'],
    ingredients: [
      '4 bone-in, skin-on chicken thighs',
      '2 medium zucchini, sliced into half-moons',
      '3 cloves garlic, minced',
      '2 tbsp extra-virgin olive oil, divided',
      '1 tsp dried oregano',
      '1 tsp dried thyme',
      'Sea salt and black pepper to taste',
    ],
    steps: [
      'Preheat oven to 400 F (205 C).',
      'Pat chicken thighs dry with a paper towel. Season generously with salt, pepper, oregano, and thyme.',
      'Heat 1 tbsp olive oil in an oven-safe skillet over medium-high heat.',
      'Place chicken skin-side down and sear 5 minutes without moving, until skin is golden.',
      'Flip chicken. Add zucchini, garlic, and remaining olive oil around the chicken in the pan.',
      'Transfer the skillet to the oven. Roast 22 to 25 minutes until chicken reaches an internal temperature of 165 F.',
    ],
    educationalNote:
      'Simple, single-source recipes with minimal seasonings are ideal for the Observe phase because they make it easier to identify which specific foods or spices your body responds well to. Chicken thighs provide iron, zinc, and B vitamins including B12, which supports nerve function and red blood cell production. Logging your energy and digestion after simple meals builds personal data over time.',
  },
  {
    id: 'r09',
    name: 'Sauteed Lacinato Kale with Lemon and Garlic',
    rootsPhase: 'Observe',
    tags: ['10-minute', 'anti-inflammatory', 'elimination-friendly'],
    ingredients: [
      '1 large bunch lacinato (dinosaur) kale, stems removed, leaves chopped',
      '3 cloves garlic, thinly sliced',
      '1 tbsp extra-virgin olive oil',
      'Juice of half a lemon',
      'Pinch of sea salt',
      'Pinch of red pepper flakes (optional)',
    ],
    steps: [
      'Heat olive oil in a large skillet over medium heat.',
      'Add sliced garlic and cook 1 minute until fragrant, stirring often.',
      'Add kale and toss to coat with oil and garlic.',
      'Cover the pan and cook 3 to 4 minutes until kale wilts.',
      'Uncover, add lemon juice and salt. Toss and taste. Add red pepper flakes if desired.',
      'Serve immediately as a side dish or base for a grain bowl.',
    ],
    educationalNote:
      'Lacinato kale is one of the most nutrient-dense vegetables available, providing vitamins K, A, and C along with calcium and magnesium. Magnesium is involved in over 300 enzymatic processes in the body, including those supporting healthy energy metabolism and muscle function. The simplicity of this recipe makes it easy to observe whether cruciferous vegetables in this form agree with your digestion.',
  },

  // --- Transform ---
  {
    id: 'r10',
    name: 'Miso Soup with Silken Tofu and Wakame',
    rootsPhase: 'Transform',
    tags: ['gut-supportive', '10-minute', 'anti-inflammatory'],
    ingredients: [
      '4 cups water',
      '3 tbsp white or yellow miso paste',
      '4 oz silken tofu, cut into small cubes',
      '2 tbsp dried wakame seaweed',
      '2 green onions, thinly sliced',
    ],
    steps: [
      'Bring water to a gentle simmer in a medium saucepan. Do not bring to a full boil.',
      'Add dried wakame and silken tofu. Simmer 2 minutes until wakame is rehydrated.',
      'Place miso paste in a small bowl. Ladle 1/4 cup of the hot broth over the miso and whisk until fully dissolved.',
      'Remove the saucepan from heat. Stir in the dissolved miso.',
      'Ladle into bowls and top with sliced green onions. Serve immediately.',
    ],
    educationalNote:
      'Miso is a fermented soybean paste that contains live bacterial cultures which contribute to microbial diversity in the gut. Keeping the temperature below a full boil preserves those live cultures. Wakame sea vegetables provide iodine, a mineral essential for thyroid hormone synthesis. This simple soup is one of the most studied traditional foods in the context of gut and metabolic health.',
  },
  {
    id: 'r11',
    name: 'Golden Milk Chia Pudding',
    rootsPhase: 'Transform',
    tags: ['meal-prep', 'anti-inflammatory', 'gut-supportive'],
    ingredients: [
      '1 1/2 cups full-fat coconut milk (from a can)',
      '1/4 cup chia seeds',
      '1 tsp ground turmeric',
      '1/2 tsp ground ginger',
      '1/4 tsp ground cinnamon',
      'Pinch of black pepper',
      '1 tbsp pure maple syrup',
      '1 tsp pure vanilla extract',
      'Sliced mango or berries to top (optional)',
    ],
    steps: [
      'Whisk coconut milk, turmeric, ginger, cinnamon, black pepper, maple syrup, and vanilla together in a bowl.',
      'Add chia seeds and stir well to distribute evenly.',
      'Divide into two mason jars or containers.',
      'Seal and refrigerate at least 4 hours, or overnight.',
      'Stir before serving. Top with sliced mango or berries if desired.',
    ],
    educationalNote:
      'Curcumin, the active compound in turmeric, has been extensively studied for its role in supporting a balanced inflammatory response. The black pepper in this recipe contains piperine, which research suggests can increase curcumin bioavailability significantly. Chia seeds form a gel in liquid through soluble fiber that slows digestion and supports gut motility. This is an ideal Transform-phase breakfast or snack prepared in advance.',
  },
  {
    id: 'r12',
    name: 'Herb-Crusted Baked Chicken Breast',
    rootsPhase: 'Transform',
    tags: ['protein-rich', 'meal-prep', 'whole-food'],
    ingredients: [
      '2 boneless, skinless chicken breasts',
      '2 tbsp extra-virgin olive oil',
      '2 cloves garlic, minced',
      '1 tsp dried rosemary',
      '1 tsp dried thyme',
      '1/2 tsp paprika',
      'Sea salt and black pepper to taste',
    ],
    steps: [
      'Preheat oven to 375 F (190 C).',
      'Mix olive oil, garlic, rosemary, thyme, paprika, salt, and pepper in a small bowl.',
      'Coat each chicken breast on all sides with the herb mixture.',
      'Place on a parchment-lined baking sheet.',
      'Bake 22 to 26 minutes until the internal temperature reaches 165 F.',
      'Rest 5 minutes before slicing. Store sliced chicken refrigerated up to 4 days.',
    ],
    educationalNote:
      'Adequate dietary protein is a foundation of the Transform phase. Chicken breast is a lean source of leucine, an amino acid that supports the mTOR signaling pathway involved in muscle protein synthesis and repair. Rosemary and thyme both contain rosmarinic acid and other polyphenols studied for their role in supporting a balanced inflammatory response. Batch-cooking protein at the start of the week supports consistent daily intake.',
  },

  // --- Sustain ---
  {
    id: 'r13',
    name: 'Big-Batch Lentil and Vegetable Soup',
    rootsPhase: 'Sustain',
    tags: ['meal-prep', 'fiber-rich', 'budget-friendly'],
    ingredients: [
      '2 cups green or brown lentils, rinsed',
      '1 large yellow onion, diced',
      '3 cloves garlic, minced',
      '3 medium carrots, diced',
      '3 stalks celery, diced',
      '1 can (14 oz) diced tomatoes',
      '6 cups low-sodium vegetable broth',
      '2 tbsp extra-virgin olive oil',
      '1 tsp ground cumin',
      '1 tsp ground turmeric',
      'Sea salt and black pepper to taste',
    ],
    steps: [
      'Heat olive oil in a large pot over medium heat.',
      'Add onion and saute 5 minutes until softened and translucent.',
      'Add garlic, carrots, and celery. Cook 3 minutes, stirring occasionally.',
      'Add cumin and turmeric. Stir 30 seconds until fragrant.',
      'Add lentils, diced tomatoes, and vegetable broth. Stir to combine.',
      'Bring to a boil, then reduce heat. Simmer uncovered 25 to 30 minutes until lentils are fully tender.',
      'Season with salt and pepper. Store refrigerated up to 5 days, or freeze individual portions.',
    ],
    educationalNote:
      'Lentils are among the most fiber-dense foods available, providing both soluble and insoluble fiber that support gut motility, microbial diversity, and steady post-meal energy. Batch cooking a large pot at the start of the week is a systems-building habit, the core principle of the Sustain phase. Environmental design (having ready-made food available) removes the need for willpower in food decisions.',
  },
  {
    id: 'r14',
    name: 'No-Bake Almond Butter Energy Bites',
    rootsPhase: 'Sustain',
    tags: ['no-bake', 'snack', '10-minute'],
    ingredients: [
      '1 cup rolled oats',
      '1/2 cup natural almond butter (no added sugar)',
      '3 tbsp pure honey',
      '2 tbsp ground flaxseed',
      '2 tbsp dark chocolate chips (70 percent cacao or higher)',
      '1/2 tsp pure vanilla extract',
      'Pinch of sea salt',
    ],
    steps: [
      'Stir all ingredients together in a mixing bowl until fully combined.',
      'If the mixture seems dry, add 1 tsp of water and stir again.',
      'Refrigerate the bowl for 30 minutes until the mixture firms up.',
      'Using a tablespoon measure, roll into 14 to 16 balls.',
      'Store in an airtight container in the refrigerator for up to 1 week.',
    ],
    educationalNote:
      'These bites provide a combination of natural sugars, complex carbohydrates, healthy fats, and soluble fiber in a single portable package. This combination slows glucose absorption and supports steady energy rather than a sharp spike and crash. Having pre-made snacks available is a form of environmental design, a core Sustain-phase strategy for reducing reliance on willpower.',
  },
  {
    id: 'r15',
    name: 'Turkey and Sweet Potato Power Bowl',
    rootsPhase: 'Sustain',
    tags: ['protein-rich', 'blood-sugar-friendly', 'meal-prep'],
    ingredients: [
      '1 lb ground turkey',
      '2 medium sweet potatoes, peeled and cubed',
      '2 cups baby kale or arugula',
      '1/2 avocado, sliced',
      '2 tbsp extra-virgin olive oil, divided',
      '1 tsp chili powder',
      '1/2 tsp garlic powder',
      '1/2 tsp ground cumin',
      'Juice of 1 lime',
      'Sea salt to taste',
    ],
    steps: [
      'Preheat oven to 400 F (205 C).',
      'Toss sweet potato cubes with 1 tbsp olive oil, chili powder, and a pinch of salt.',
      'Spread on a parchment-lined baking sheet and roast 25 minutes until tender.',
      'While sweet potatoes roast, heat remaining olive oil in a skillet over medium-high.',
      'Add ground turkey and cook, breaking it apart, until no longer pink (about 8 minutes).',
      'Season turkey with garlic powder, cumin, and salt.',
      'Assemble bowls: layer greens, roasted sweet potato, and seasoned turkey. Top with avocado and a squeeze of lime.',
    ],
    educationalNote:
      'This bowl is intentionally a template, not a rigid recipe. Swap turkey for salmon, sweet potato for roasted beets, or arugula for spinach depending on what is available. Building one flexible weekly template is more sustainable than memorizing dozens of different recipes, which is the spirit of the Sustain phase. Avocado provides monounsaturated fats, potassium, and fiber that together support cell membrane health and steady energy.',
  },
]
