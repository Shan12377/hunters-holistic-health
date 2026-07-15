import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import s from './NutrientFoodSources.module.css'

interface Food {
  name: string
  gem?: string
  note: string
  width: number
  strength: string
}

interface Nutrient {
  id: string
  icon: string
  name: string
  whyMatters: string
  depletedBy: string
  foods: Food[]
  rightForm: string
  rightFormTitle: string
  avoid: string
  avoidTitle: string
}

const NUTRIENTS: Nutrient[] = [
  {
    id: 'magnesium', icon: '🌱', name: 'Magnesium',
    whyMatters: 'Fuels over 300 enzymatic reactions: sleep, muscle relaxation, heart rhythm, blood pressure, blood sugar regulation. Deficiency is widespread and underdiagnosed.',
    depletedBy: 'Depleted by: PPIs, GLP-1 medications, loop diuretics, oral contraceptives, corticosteroids',
    foods: [
      { name: 'Pumpkin Seeds (raw)', gem: 'Richest Seed Source', note: '1 oz = 156mg, 37% of daily value in a small handful', width: 95, strength: 'Exceptional' },
      { name: 'Moringa Powder', gem: 'Multi-Nutrient', note: '1 tbsp covers magnesium plus 90+ additional nutrients, the most nutrient-dense addition to any meal', width: 88, strength: 'Exceptional' },
      { name: 'Dark Chocolate 70%+', gem: 'Multi-Nutrient', note: '1 oz = 64mg. Also provides zinc, iron, copper, potassium, and antioxidants', width: 80, strength: 'Outstanding' },
      { name: 'Spinach (cooked)', note: '1/2 cup cooked = 78mg (19% DV). Raw spinach has far less, cooking concentrates it', width: 72, strength: 'Outstanding' },
      { name: 'Black Beans / Legumes', note: '1/2 cup cooked = 60mg. Soak overnight to reduce phytic acid and improve mineral absorption', width: 60, strength: 'Excellent' },
      { name: 'Avocado', note: '1 whole = 58mg + potassium, folate, and healthy fat to carry fat-soluble vitamins', width: 55, strength: 'Excellent' },
      { name: 'Coconut Water', note: '1 cup = ~60mg magnesium + natural electrolytes. Isotonic with blood plasma, fastest absorption', width: 50, strength: 'Good' },
    ],
    rightFormTitle: 'Right Form', rightForm: 'Magnesium glycinate (sleep, anxiety, muscle cramps) or magnesium L-threonate (cognitive support, brain penetration)',
    avoidTitle: 'Avoid', avoid: 'Magnesium oxide, only ~4% absorption; primarily acts as a laxative. Most common form in drugstore vitamins.',
  },
  {
    id: 'b12', icon: '🩸', name: 'Vitamin B12',
    whyMatters: 'Nerve function, red blood cell formation, DNA synthesis, brain health, energy production. Deficiency is silent for years before showing symptoms.',
    depletedBy: 'Depleted by: Metformin (well-documented), PPIs, GLP-1 medications, oral contraceptives, SSRIs',
    foods: [
      { name: 'Clams', gem: 'Highest of All Foods', note: '3 oz cooked = 84mcg, 3,500% of daily value. Nothing comes close to clams for B12', width: 100, strength: 'Exceptional' },
      { name: 'Beef Liver', gem: 'Multi-Nutrient', note: '3 oz = 70mcg B12. Also covers iron, zinc, copper, CoQ10, folate. Nature\'s multivitamin.', width: 95, strength: 'Exceptional' },
      { name: 'Sardines', gem: 'Multi-Nutrient', note: '1 can = 8mcg B12 + omega-3, calcium, CoQ10, selenium, Vitamin D. Bone-in for calcium.', width: 80, strength: 'Outstanding' },
      { name: 'Salmon', note: '3 oz = 4.9mcg (204% DV). Wild-caught is significantly higher than farmed.', width: 68, strength: 'Outstanding' },
      { name: 'Grass-Fed Beef', note: '3 oz = 2.4mcg (100% DV). Higher than grain-fed. Also provides zinc, iron, CoQ10.', width: 55, strength: 'Excellent' },
      { name: 'Eggs (whole, cooked)', note: '2 eggs = 1.2mcg. B12 concentrated in yolk. Soft-cook to preserve bioactive nutrients.', width: 40, strength: 'Good' },
    ],
    rightFormTitle: 'Right Form', rightForm: 'Methylcobalamin, sublingual (under the tongue) preferred for best absorption, bypasses gut absorption issues caused by metformin or low stomach acid',
    avoidTitle: 'Avoid', avoid: 'Cyanocobalamin, a cheaper synthetic form the body converts to active B12. Effective for most people; some clinicians prefer methylcobalamin, particularly in older adults or those with absorption issues.',
  },
  {
    id: 'iron', icon: '🩺', name: 'Iron',
    whyMatters: 'Oxygen transport, energy production, immune function, cognitive performance. Hair loss, fatigue, and brain fog are early warning signs. Do not supplement without confirmed deficiency: excess iron is harmful.',
    depletedBy: 'Depleted by: GLP-1 medications (reduced food intake), PPIs (block heme liberation)',
    foods: [
      { name: 'Beef Liver', gem: 'Highest Heme Iron', note: '3 oz = 6.5mg heme iron (36% DV). Heme iron absorbs 2-3x better than plant (non-heme) iron. Also covers B12, zinc, copper, CoQ10.', width: 95, strength: 'Exceptional' },
      { name: 'White Beans / Lentils', gem: 'Best Plant Source', note: '1/2 cup white beans = 4mg. 1/2 cup lentils = 3.3mg. Soak overnight to reduce phytic acid that blocks iron absorption', width: 78, strength: 'Outstanding' },
      { name: 'Blackstrap Molasses', gem: 'Overlooked Gem', note: '1 tbsp = 3.5mg iron. Also provides calcium, magnesium, potassium. Sweeten oatmeal or smoothies.', width: 72, strength: 'Outstanding' },
      { name: 'Dark Chocolate 70%+', note: '1 oz = 3.4mg. Pair with Vitamin C source to enhance non-heme iron absorption significantly.', width: 65, strength: 'Excellent' },
      { name: 'Jamaican Callaloo / Spinach (cooked)', note: '1 cup cooked spinach = 6.4mg. Callaloo is even higher. Add lemon juice (Vitamin C) to double absorption.', width: 72, strength: 'Outstanding' },
      { name: 'Pumpkin Seeds', note: '1 oz = 2.5mg. Also provides magnesium and zinc in the same serving, efficient triple coverage.', width: 50, strength: 'Good' },
    ],
    rightFormTitle: 'Right Form', rightForm: 'Ferrous bisglycinate, gentlest on the stomach, significantly reduces constipation/nausea. Take with Vitamin C, 4 hours away from calcium and levothyroxine.',
    avoidTitle: 'Avoid', avoid: 'Ferrous sulfate, effective but causes GI distress (constipation, nausea, dark stools) that leads most people to stop taking it. Do not supplement without ferritin lab confirmation.',
  },
  {
    id: 'zinc', icon: '💪', name: 'Zinc',
    whyMatters: 'Immune defense, testosterone production, wound healing, taste and smell, hair growth, skin integrity. One of the most commonly depleted minerals in the metabolic patient.',
    depletedBy: 'Depleted by: PPIs, GLP-1 medications, loop diuretics, ACE inhibitors, oral contraceptives, corticosteroids',
    foods: [
      { name: 'Oysters', gem: 'Highest of All Foods', note: '3 oz = 74mg, nearly 700% of daily value. No other food comes close for zinc density. Also high in copper and B12.', width: 100, strength: 'Exceptional' },
      { name: 'Beef / Lamb (grass-fed)', note: '3 oz ground beef = 5.8mg (53% DV). Red meat is the most reliable dietary zinc source for most people.', width: 78, strength: 'Outstanding' },
      { name: 'Pumpkin Seeds', gem: 'Best Plant Source', note: '1 oz = 2.2mg (20% DV). Triple benefit: zinc + magnesium + iron. Soak to reduce phytic acid.', width: 62, strength: 'Excellent' },
      { name: 'Cashews', note: '1 oz = 1.6mg. Also provides magnesium, copper. Choose raw or dry-roasted over oil-roasted.', width: 50, strength: 'Good' },
      { name: 'Dark Chocolate 70%+', note: '1 oz = 1mg. One of the few plant-based foods providing meaningful zinc, along with magnesium, iron, and copper.', width: 40, strength: 'Good' },
      { name: 'Chickpeas / Lentils', note: '1/2 cup = 1.3mg. Soak overnight and discard water to remove phytates that block zinc absorption.', width: 38, strength: 'Moderate' },
    ],
    rightFormTitle: 'Right Form', rightForm: 'Zinc bisglycinate or zinc picolinate. Take with food, nausea is common on an empty stomach. Test copper alongside zinc if supplementing.',
    avoidTitle: 'Avoid', avoid: 'Zinc oxide (poor bioavailability). Excess zinc >40mg daily depletes copper, always test both together if supplementing for more than 4 weeks.',
  },
  {
    id: 'selenium', icon: '🧠', name: 'Selenium',
    whyMatters: 'Converts inactive T4 thyroid hormone to active T3. Supports thyroid health, immune function, and antioxidant defense. Research has examined selenium in Hashimoto\'s thyroiditis, though evidence for supplementation is mixed. The thyroid gland has the highest selenium concentration of any organ.',
    depletedBy: 'Depleted by: Oral contraceptives. May warrant monitoring in thyroid patients with low dietary selenium intake.',
    foods: [
      { name: 'Brazil Nuts', gem: 'Easiest Daily Fix', note: '1-2 nuts = 68-90mcg each, full daily value in 1 nut. Limit to 3 per day max (selenium toxicity is possible with excess). Soak to reduce phytic acid.', width: 100, strength: 'Exceptional' },
      { name: 'Oysters / Tuna', note: 'Tuna (3 oz) = 92mcg. Oysters = 130mcg per 3 oz. Highest animal sources alongside brazil nuts.', width: 88, strength: 'Exceptional' },
      { name: 'Sardines', gem: 'Multi-Nutrient', note: '1 can = 45mcg selenium + B12, calcium, CoQ10, Vitamin D. A remarkably efficient single food.', width: 72, strength: 'Outstanding' },
      { name: 'Raw Cocoa / Dark Chocolate', note: 'Raw cocoa is an underappreciated source of selenium alongside copper, zinc, and iron. Use raw cacao powder in smoothies.', width: 50, strength: 'Good' },
      { name: 'Eggs', note: '1 egg = 15mcg (27% DV). Selenium is in the yolk. One of few plant-accessible sources when meat is limited.', width: 42, strength: 'Good' },
    ],
    rightFormTitle: 'Right Form', rightForm: 'Selenomethionine, organic form, significantly better retained than inorganic forms. Or simply 1-2 Brazil nuts daily.',
    avoidTitle: 'Avoid', avoid: 'Sodium selenite / sodium selenate, inorganic, lower bioavailability. Avoid supplementing selenium beyond 400mcg daily, toxicity threshold is lower than most minerals.',
  },
  {
    id: 'coq10', icon: '⚡', name: 'Coenzyme Q10 (CoQ10)',
    whyMatters: 'The spark plug of every cell\'s energy production (mitochondrial ATP). Statins block the same pathway that produces CoQ10. Muscle pain and fatigue are among the symptoms that have been associated with statin-related CoQ10 reduction, though the clinical relationship continues to be studied.',
    depletedBy: 'Depleted by: Statins (all, dose-dependent and well-documented), beta-blockers',
    foods: [
      { name: 'Beef Heart (organ meat)', gem: 'Highest Source', note: '100g = 113mg CoQ10, by far the richest food source. Heart meat is dense, flavorful, and inexpensive.', width: 100, strength: 'Exceptional' },
      { name: 'Sardines', note: '100g = 64mg CoQ10, and simultaneously covers B12, calcium, selenium, Vitamin D. Tinned is fine.', width: 80, strength: 'Outstanding' },
      { name: 'Mackerel', note: '100g = 43mg CoQ10 + high omega-3. Smoked mackerel is one of the most nutrient-dense ready-to-eat foods.', width: 68, strength: 'Outstanding' },
      { name: 'Grass-Fed Beef', note: '100g = 31mg CoQ10. Much higher than chicken or pork. Red muscle meat is the most accessible everyday source.', width: 55, strength: 'Excellent' },
      { name: 'Peanuts / Peanut Butter', note: '100g = 27mg. One of the few plant-based CoQ10 sources. Choose natural, no added oils.', width: 45, strength: 'Good' },
      { name: 'Spinach', note: '100g cooked = 10mg. Lower than animal sources, but adds to cumulative intake when eating for CoQ10 recovery.', width: 28, strength: 'Moderate' },
    ],
    rightFormTitle: 'Right Form', rightForm: 'Ubiquinol (the active, reduced form) is an option for statin users or older adults who may convert ubiquinone less efficiently. Take with your largest fatty meal.',
    avoidTitle: 'Avoid', avoid: 'Ubiquinone is less efficient for some people at higher doses or with statin use, though the clinical difference between forms is still debated. Take with fat regardless of form.',
  },
  {
    id: 'chromium', icon: '🫘', name: 'Chromium + Vanadium',
    whyMatters: 'These two trace minerals support insulin signaling and glucose metabolism. Low intake is associated with reduced insulin sensitivity in some research, though large human trials are limited. Most people have never heard of vanadium.',
    depletedBy: 'Depleted by: Refined sugar, high-carb diets, stress, poor soil quality. Chromium lost in urine when blood sugar is high.',
    foods: [
      { name: 'String Beans (Green Beans)', gem: 'Richest in BOTH Minerals', note: 'Among the better-documented food sources of both chromium and vanadium. A practical daily addition for anyone focused on blood sugar support.', width: 100, strength: 'Exceptional' },
      { name: 'Broccoli', gem: 'Chromium', note: '1/2 cup cooked = 11mcg chromium (32% DV). One of the most chromium-dense vegetables. Also provides folate and Vitamin C.', width: 80, strength: 'Outstanding' },
      { name: 'Mushrooms (especially Shiitake)', note: 'Good source of vanadium. Also provides selenium, B vitamins, and CoQ10. Eat cooked, heat improves bioavailability.', width: 65, strength: 'Excellent' },
      { name: 'Nutritional Yeast', note: '2 tbsp = meaningful chromium + B vitamins, zinc, selenium. Can be added to soups, eggs, or popcorn.', width: 60, strength: 'Excellent' },
      { name: 'Whole Grains (oats, barley)', note: 'Chromium concentrates in the bran and germ, lost almost entirely in white flour processing. Choose intact whole grains.', width: 50, strength: 'Good' },
    ],
    rightFormTitle: 'Right Form', rightForm: 'Chromium picolinate, better absorbed than chromium chloride. Vanadyl sulfate for vanadium supplementation. Food-first is the preferred approach; the evidence base for chromium supplementation in non-deficient individuals is mixed.',
    avoidTitle: 'Avoid', avoid: 'Chromium chloride or chromium nicotinate, poorly absorbed. Sugar and refined carbohydrates actively deplete chromium, addressing diet simultaneously is essential for these minerals to work.',
  },
  {
    id: 'potassium', icon: '🥑', name: 'Potassium',
    whyMatters: 'Blood pressure, nerve signals, heart rhythm, muscle contraction, fluid balance. Daily requirement is 4,700mg, higher than almost any other mineral. Most people get less than half that. Cannot be replaced by supplements alone.',
    depletedBy: 'Depleted by: Loop diuretics (high priority, significant urinary loss), GLP-1 medications (reduced food intake), corticosteroids',
    foods: [
      { name: 'White Beans / Kidney Beans', gem: 'Highest Plant Source', note: '1/2 cup white beans = 829mg (18% DV). Beans are among the most potassium-dense foods per serving, and also cover iron and folate.', width: 95, strength: 'Exceptional' },
      { name: 'Beet Greens / Swiss Chard', gem: 'Overlooked Gem', note: '1/2 cup cooked beet greens = 655mg. Most people discard beet greens, they are nutritionally superior to the beet itself.', width: 88, strength: 'Exceptional' },
      { name: 'Avocado', note: 'Half avocado = 487mg + healthy fat that helps absorb fat-soluble vitamins. More potassium per gram than a banana.', width: 78, strength: 'Outstanding' },
      { name: 'Coconut Water', note: '1 cup = 600mg potassium + natural electrolytes. Isotonic, fastest absorption. Best post-exercise or morning rehydration.', width: 80, strength: 'Outstanding' },
      { name: 'Sweet Potato', note: '1 medium = 448mg + Vitamin A, C, B6. Baked with skin provides more potassium than without.', width: 68, strength: 'Excellent' },
      { name: 'Salmon', note: '3 oz = 414mg + omega-3, B12, CoQ10, selenium. One of the most efficient single-protein choices for potassium.', width: 62, strength: 'Excellent' },
    ],
    rightFormTitle: 'Right Approach', rightForm: 'Food-first is the only viable path. FDA caps OTC supplement tablets at 99mg per pill. You would need 47 pills daily to meet the requirement. Aim for 7+ cups of vegetables daily + avocado + coconut water.',
    avoidTitle: 'Avoid', avoid: 'Self-supplementing if on ACE inhibitors, ARBs, or spironolactone, these drugs retain potassium. High potassium on top of these medications risks hyperkalemia, which can be life-threatening. Confirm with labs first.',
  },
  {
    id: 'folate', icon: '🥬', name: 'Folate (Vitamin B9)',
    whyMatters: 'DNA synthesis, red blood cell formation, neurotransmitter production, and pregnancy-critical neural tube development. Approximately 40% of people carry MTHFR gene variants that reduce the efficiency of converting synthetic folic acid to active methylfolate.',
    depletedBy: 'Depleted by: Oral contraceptives (significant), metformin, SSRIs, corticosteroids',
    foods: [
      { name: 'Edamame', gem: 'Best Plant Source', note: '1 cup = 482mcg (121% DV). Highest folate content of any common plant food. Frozen edamame is as nutritious as fresh.', width: 100, strength: 'Exceptional' },
      { name: 'Beef Liver', gem: 'Highest Overall', note: '3 oz = 215mcg (54% DV). Also covers B12, iron, zinc, copper. 1-2 servings per week covers multiple depletions.', width: 90, strength: 'Exceptional' },
      { name: 'Asparagus', note: '1 cup = 268mcg (67% DV). One of the most folate-dense vegetables pound for pound.', width: 82, strength: 'Outstanding' },
      { name: 'Lentils', note: '1/2 cup cooked = 179mcg (45% DV). Also high in iron, B6, and potassium. One of the most nutritionally complete legumes.', width: 78, strength: 'Outstanding' },
      { name: 'Spinach (raw)', note: '1 cup raw = 58mcg. Cooking destroys folate, eat raw or lightly wilted for maximum retention.', width: 55, strength: 'Excellent' },
      { name: 'Avocado', note: 'Half avocado = 82mcg + potassium and healthy fat. A folate-rich food that helps absorb fat-soluble vitamins simultaneously.', width: 50, strength: 'Good' },
    ],
    rightFormTitle: 'Right Form', rightForm: 'Methylfolate (5-MTHF), active form. Essential if you have MTHFR variants. Women switching off hormonal contraceptives to conceive should start methylfolate 3+ months before trying.',
    avoidTitle: 'Avoid', avoid: 'Folic acid, synthetic form that requires conversion. People with MTHFR C677T or A1298C variants convert it less efficiently, and unmetabolized folic acid may accumulate at high intake levels.',
  },
  {
    id: 'vitamin_d', icon: '☀️', name: 'Vitamin D',
    whyMatters: 'Controls over 2,000 genes related to immunity, hormone production, calcium metabolism, and weight regulation. Functions more like a hormone than a vitamin. Deficiency is epidemic, estimated 1 billion people worldwide.',
    depletedBy: 'Depleted by: Corticosteroids (accelerate catabolism), statins, GLP-1 medications (reduced dietary fat intake reduces absorption)',
    foods: [
      { name: 'Sunlight (midday, skin exposed)', gem: 'Most Efficient Source', note: '30 minutes full-body = 10,000 IU. No food matches this. Morning and evening sun produces no Vitamin D, the UVB angle matters.', width: 100, strength: 'Exceptional' },
      { name: 'Swordfish / Salmon (wild-caught)', note: 'Swordfish (3 oz) = 566 IU. Wild salmon (3 oz) = 447 IU. Farmed salmon is significantly lower.', width: 82, strength: 'Outstanding' },
      { name: 'Sardines', gem: 'Multi-Nutrient', note: '1 can = 177 IU Vitamin D + CoQ10, selenium, B12, calcium. One of few foods covering this specific combination.', width: 62, strength: 'Excellent' },
      { name: 'UV-Exposed Mushrooms', gem: 'Only Plant Source', note: 'Mushrooms exposed to UV light for 15-20 min generate Vitamin D2. Place gill-side-up in direct noon sun. Portobello and shiitake work best.', width: 58, strength: 'Excellent' },
      { name: 'Egg Yolks (pasture-raised)', note: '1 egg = 41 IU. Pasture-raised hens produce eggs with 3-4x more Vitamin D than conventional. Soft-cook to preserve the yolk\'s bioactive nutrients.', width: 38, strength: 'Moderate' },
    ],
    rightFormTitle: 'Right Form', rightForm: 'Vitamin D3 (cholecalciferol) always paired with K2 (MK-7 form). K2 directs calcium into bone and away from arteries. Optimal target range is debated; many clinicians aim for 40-60 ng/mL serum 25-OH D. Dosing should be guided by baseline labs; 1,000-4,000 IU is a common maintenance range, higher doses require periodic testing.',
    avoidTitle: 'Avoid', avoid: 'Vitamin D2 (ergocalciferol), less potent, shorter half-life. D3 without K2, calcium can accumulate in soft tissue rather than bone. Take with fat, fat-soluble, poor absorption without it.',
  },
  {
    id: 'calcium', icon: '🦴', name: 'Calcium',
    whyMatters: 'Bone density, muscle contraction, nerve transmission, blood clotting. Chronic corticosteroid use is one of the leading causes of secondary osteoporosis. The form and cofactors matter as much as the dose.',
    depletedBy: 'Depleted by: Corticosteroids (long-term use, a priority), loop diuretics, PPIs (reduce absorption), oral contraceptives (with progestin-only formulations)',
    foods: [
      { name: 'Sardines (bone-in)', gem: 'Best Complete Source', note: '1 can = 351mg calcium, the bones are where the calcium is. Also covers B12, CoQ10, Vitamin D, selenium. Eat the bones.', width: 95, strength: 'Exceptional' },
      { name: 'Moringa Powder', gem: 'Multi-Nutrient', note: '1 tbsp moringa = 125mg calcium + iron, potassium, protein. Higher calcium density than milk per gram. Stir into smoothies.', width: 88, strength: 'Exceptional' },
      { name: 'Cooked Leafy Greens (collards, bok choy, kale)', note: '1 cup cooked collard greens = 268mg. Kale and bok choy are more bioavailable than spinach (spinach has oxalates that block calcium).', width: 75, strength: 'Outstanding' },
      { name: 'Almonds', note: '1 oz = 76mg. Soak overnight to reduce phytic acid. Also provides magnesium and Vitamin E.', width: 55, strength: 'Excellent' },
      { name: 'Tahini (sesame paste)', note: '2 tbsp = 130mg. Sesame seeds are one of the most calcium-dense plant foods. Use in dressings, sauces, and dips.', width: 65, strength: 'Excellent' },
      { name: 'Eggs (whole)', note: '1 egg = 56mg in the yolk + eggshell membrane supplement provides even more. Also provides Vitamin D and K2 cofactors.', width: 40, strength: 'Good' },
    ],
    rightFormTitle: 'Right Form', rightForm: 'Calcium citrate, absorbed with or without food (unlike carbonate). Pair with Vitamin D3 and K2, the cofactors that direct calcium into bone rather than arteries. Split doses of 500mg or less for better absorption.',
    avoidTitle: 'Avoid', avoid: 'Calcium carbonate on an empty stomach, requires stomach acid for absorption. Taking high doses all at once (absorption caps around 500mg per dose). Calcium supplements without K2 in patients with cardiovascular risk.',
  },
  {
    id: 'copper', icon: '🔶', name: 'Copper',
    whyMatters: 'Iron metabolism (copper must be adequate for iron to be utilized), connective tissue synthesis, immune function, nerve insulation (myelin), and antioxidant defense. Often missed because it\'s not on standard supplement panels.',
    depletedBy: 'Depleted by: High-dose zinc supplementation (competes for absorption), antacids. Often low in metabolic patients due to poor food diversity.',
    foods: [
      { name: 'Beef Liver', gem: 'Exceptional Source', note: '3 oz = 12mg, 1,333% of daily value. The most concentrated copper source of any food. Also covers B12, iron, zinc, folate.', width: 100, strength: 'Exceptional' },
      { name: 'Oysters', gem: 'Multi-Nutrient', note: '3 oz = 4.5mg copper + zinc, B12, selenium. Nearly complete trace mineral coverage in one serving.', width: 88, strength: 'Exceptional' },
      { name: 'Dark Chocolate 70%+ / Raw Cocoa', note: '1 oz dark chocolate = 0.9mg. Raw cacao powder = even higher. One of the few plant foods with meaningful copper content.', width: 70, strength: 'Outstanding' },
      { name: 'Cashews', note: '1 oz = 0.6mg copper. More copper than most other nuts. Also provides magnesium and zinc.', width: 58, strength: 'Excellent' },
      { name: 'Spirulina', note: '1 tbsp = 0.4mg + iron, B12 (plant form), magnesium. Blue-green algae is a dense trace-mineral source.', width: 48, strength: 'Good' },
    ],
    rightFormTitle: 'Right Form', rightForm: 'Copper bisglycinate or copper gluconate. Food-first is ideal. If you supplement zinc long-term (beyond 4 weeks), include 2mg copper to prevent depletion.',
    avoidTitle: 'Avoid', avoid: 'Supplementing copper without testing if you are also supplementing zinc. The ratio matters: typical safe ratio is 8:1 zinc to copper (e.g., 16mg zinc + 2mg copper).',
  },
  {
    id: 'vitamin_c', icon: '🍊', name: 'Vitamin C',
    whyMatters: 'Immune function, collagen synthesis, iron absorption (essential cofactor for non-heme plant iron), antioxidant defense, adrenal support (the adrenal glands are one of the highest-concentration organs). Also helps regenerate Vitamin E.',
    depletedBy: 'Depleted by: Oral contraceptives (significant), corticosteroids, smoking (doubles depletion rate). High-stress states increase urinary excretion.',
    foods: [
      { name: 'Guava', gem: 'Highest of All Fruits', note: '1 medium guava = 228mg, 253% of daily value. Fresh is best; heat destroys Vitamin C rapidly.', width: 100, strength: 'Exceptional' },
      { name: 'Bell Peppers (raw, red or yellow)', gem: 'Best Vegetable Source', note: '1 cup raw red bell pepper = 190mg. Yellow peppers are even higher. More Vitamin C than any citrus per gram.', width: 92, strength: 'Exceptional' },
      { name: 'Kiwi', note: '1 large kiwi = 84mg. One of the most Vitamin C dense fruits after guava. Eat the skin for even more.', width: 75, strength: 'Outstanding' },
      { name: 'Broccoli (raw)', note: '1 cup raw = 81mg. Cooking destroys 50%+ of Vitamin C. Eat raw or quickly stir-fried to preserve.', width: 72, strength: 'Outstanding' },
      { name: 'Strawberries', note: '1 cup = 89mg. Also provides folate and manganese. The whole berry, not juice.', width: 76, strength: 'Outstanding' },
      { name: 'Lemon / Lime Juice', note: 'Squeeze on iron-rich foods to double non-heme iron absorption. One lemon = 31mg + bioflavonoids that extend Vitamin C activity.', width: 45, strength: 'Good' },
    ],
    rightFormTitle: 'Right Form', rightForm: 'Liposomal Vitamin C for maximum absorption at high doses. Buffered ascorbate (calcium ascorbate) is gentler on the stomach than ascorbic acid. Take with meals. 500-1,000mg twice daily is commonly used for therapeutic ranges.',
    avoidTitle: 'Avoid', avoid: 'Mega-doses above 2,000mg daily without need, can cause osmotic diarrhea. Do not take Vitamin C within 2 hours of taking certain antibiotics (some forms bind and reduce absorption). Heat and cooking destroy it quickly.',
  },
  {
    id: 'iodine', icon: '🌊', name: 'Iodine',
    whyMatters: 'Thyroid hormone production. Without adequate iodine, the thyroid cannot produce T3 or T4, leading to hypothyroidism, goiter, and metabolic slowdown. Iodine deficiency is the leading preventable cause of intellectual disability worldwide. Particularly critical in pregnancy.',
    depletedBy: 'Depleted by: GLP-1 medications (reduced food intake), diets eliminating iodized salt and seafood, raw cruciferous vegetables in very large quantities (goitrogens that block iodine uptake when iodine is low).',
    foods: [
      { name: 'Seaweed (nori, wakame, kelp)', gem: 'Highest Source', note: 'Dried kelp = 2,000+ mcg per gram (far above daily need). Nori (sushi sheets) = 16-43mcg per sheet. Highly variable by species and source: use nori, not kelp, for daily iodine as kelp can provide excess.', width: 100, strength: 'Exceptional' },
      { name: 'Cod / Ocean Fish', note: '3 oz cod = 99mcg (66% DV). Ocean fish in general are excellent iodine sources because they concentrate iodine from seawater.', width: 80, strength: 'Outstanding' },
      { name: 'Eggs (pasture-raised)', note: '1 egg = 24mcg (16% DV). Iodine is in the yolk. Amount varies based on iodine content of hen\'s feed.', width: 58, strength: 'Excellent' },
      { name: 'Iodized Salt', note: '1/4 tsp = 71mcg (47% DV). The simplest daily source for most people. Sea salt and Himalayan salt do not contain iodine unless fortified.', width: 70, strength: 'Excellent' },
      { name: 'Dairy (milk, yogurt)', note: '1 cup milk = ~56mcg. Iodine in dairy comes from iodine-containing sanitizing solutions used on equipment in dairy production.', width: 55, strength: 'Excellent' },
    ],
    rightFormTitle: 'Right Form', rightForm: 'Potassium iodide for supplementation if needed, 150-220mcg/day (pregnancy: 220mcg/day, breastfeeding: 290mcg/day). Nori seaweed or iodized salt are the most practical daily sources.',
    avoidTitle: 'Avoid', avoid: 'Kelp supplements unless monitored, extremely variable iodine content can cause hyperthyroidism in susceptible individuals. Large amounts of raw cruciferous vegetables (kale, broccoli, cauliflower) if iodine is already low, as goitrogens temporarily block iodine uptake. Cooking neutralizes goitrogens.',
  },
]

const SUPERFOODS = [
  { icon: '🫀', name: 'Organ Meats (Liver, Heart)', nutrients: ['B12', 'Iron', 'Zinc', 'Copper', 'CoQ10', 'Folate', 'Vitamin D'] },
  { icon: '🌿', name: 'Moringa Powder', nutrients: ['Magnesium', 'Calcium', 'Iron', 'Potassium', 'Protein', '92+ nutrients'] },
  { icon: '🌰', name: 'Pumpkin Seeds', nutrients: ['Magnesium', 'Zinc', 'Iron', 'Copper', 'Selenium'] },
  { icon: '🍫', name: 'Dark Chocolate 70%+ / Raw Cocoa', nutrients: ['Magnesium', 'Iron', 'Zinc', 'Copper', 'Selenium', 'Potassium'] },
  { icon: '🐟', name: 'Sardines (bone-in)', nutrients: ['B12', 'CoQ10', 'Calcium', 'Selenium', 'Vitamin D', 'Omega-3'] },
  { icon: '🥚', name: 'Eggs (pasture-raised, soft-cooked)', nutrients: ['B12', 'Selenium', 'Vitamin D', 'Iodine', 'Biotin', 'Choline'] },
  { icon: '🥬', name: 'Leafy Greens (cooked)', nutrients: ['Magnesium', 'Calcium', 'Folate', 'Iron', 'Potassium', 'Vitamin C'] },
  { icon: '🌊', name: 'Spirulina', nutrients: ['Iron', 'Copper', 'Magnesium', 'B-vitamins', 'Protein'] },
]

const FAQS = [
  {
    q: 'What foods are highest in magnesium?',
    a: 'Pumpkin seeds, dark chocolate and raw cocoa, spinach and other leafy greens, avocado, nuts and legumes are among the densest sources. Soaking seeds, nuts and beans overnight reduces phytic acid, which otherwise blocks absorption.',
  },
  {
    q: 'Can I get enough B12 from food on metformin or a PPI?',
    a: 'B12 is found almost entirely in animal foods: organ meats, clams, oysters, sardines, eggs and beef. Metformin and PPIs can reduce B12 absorption, so long-term users may still need testing and sometimes a supplement or injection. Confirm with serum B12 plus methylmalonic acid.',
  },
  {
    q: 'Why should I soak nuts and seeds?',
    a: 'They contain phytic acid, which binds zinc, iron, calcium and magnesium and lowers absorption. Soaking overnight and discarding the water, or sprouting, reduces phytic acid. Cooking helps too.',
  },
  {
    q: 'Food or supplement, which is better?',
    a: 'Food first is a sensible default because whole foods carry cofactors that aid absorption. Supplements matter when a drug impairs absorption, when a lab confirms deficiency, or when a nutrient is hard to get from diet. Confirm deficiency with testing before high-dose supplementing.',
  },
]

const NAV_CHIPS = [
  { id: 'all', label: 'All Nutrients' },
  { id: 'magnesium', label: 'Magnesium' },
  { id: 'b12', label: 'Vitamin B12' },
  { id: 'iron', label: 'Iron' },
  { id: 'zinc', label: 'Zinc' },
  { id: 'selenium', label: 'Selenium' },
  { id: 'coq10', label: 'CoQ10' },
  { id: 'chromium', label: 'Chromium + Vanadium' },
  { id: 'potassium', label: 'Potassium' },
  { id: 'folate', label: 'Folate / B9' },
  { id: 'vitamin_d', label: 'Vitamin D' },
  { id: 'calcium', label: 'Calcium' },
  { id: 'copper', label: 'Copper' },
  { id: 'vitamin_c', label: 'Vitamin C' },
  { id: 'iodine', label: 'Iodine' },
  { id: 'superfoods', label: '★ Superstars' },
]

export default function NutrientFoodSources() {
  const [filter, setFilter] = useState<string>('all')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  useEffect(() => {
    document.title = 'Food Sources for Depleted Nutrients | PharmD Food Guide'
    const desc = document.querySelector('meta[name="description"]')
    if (desc) desc.setAttribute('content', 'The highest-density food sources for every nutrient your medications deplete, ranked by potency. B12, magnesium, iron, zinc, CoQ10, folate and more, with absorption tips from a PharmD. Eat it before you supplement it.')
  }, [])

  const showNutrients = filter === 'all' || (filter !== 'superfoods' && filter !== '')
  const showSuperfoods = filter === 'all' || filter === 'superfoods'
  const showBanner = filter === 'all' || filter === 'superfoods'

  const visibleNutrients = filter === 'all' || filter === 'superfoods'
    ? NUTRIENTS
    : NUTRIENTS.filter(n => n.id === filter)

  return (
    <div className={s.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'MedicalWebPage',
              '@id': 'https://www.huntersholistichealth.com/tools/nutrient-food-sources#webpage',
              url: 'https://www.huntersholistichealth.com/tools/nutrient-food-sources',
              name: 'Top Food Sources for Every Depleted Nutrient',
              description: 'Ranked food sources for nutrients commonly depleted by medications, with absorption guidance.',
              inLanguage: 'en-US',
              lastReviewed: '2026-07-14',
              reviewedBy: { '@type': 'Person', name: 'Dr. Shallanda Hunter, PharmD, CFNMP', jobTitle: 'Doctor of Pharmacy, Certified Functional Nutrition & Metabolism Practitioner' },
            },
            {
              '@type': 'FAQPage',
              mainEntity: FAQS.map(f => ({
                '@type': 'Question',
                name: f.q,
                acceptedAnswer: { '@type': 'Answer', text: f.a },
              })),
            },
          ],
        }) }}
      />

      {/* Hero */}
      <div className={s.hero}>
        <div className={s.eyebrow}>Educational PharmD Food Reference · Companion to the Depletion Checker</div>
        <h1 className={s.heroTitle}>Food Sources for Every Depleted Nutrient</h1>
        <p className={s.heroSubhead}>
          If your medications are lowering a nutrient, the first move is often the plate, not the pill. This educational guide ranks the densest real food sources for each nutrient, including the ones people overlook, plus the absorption rules that decide how much you actually keep.
        </p>
        <p className={s.heroBody}>
          It pairs with the <Link to="/tools/medication-nutrient-checker">Medication Nutrient Depletion Checker</Link>: run your medication list there to see which nutrients to prioritize, then come here to rebuild them through food.
        </p>
        <div className={s.heroBadge}>Dr. Shallanda Hunter, PharmD, CFNMP · Hunter's Holistic Health</div>
      </div>

      {/* Sticky Nav */}
      <div className={s.navWrap}>
        <div className={s.navScroll}>
          {NAV_CHIPS.map(chip => (
            <button
              key={chip.id}
              className={`${s.navChip} ${filter === chip.id ? s.navChipActive : ''}`}
              onClick={() => setFilter(chip.id)}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main */}
      <div className={s.main}>

        {/* Superfoods banner */}
        {showBanner && (
          <div className={s.sfBanner}>
            <div className={s.sfBannerIcon}>★</div>
            <div>
              <div className={s.sfBannerTitle}>Multi-Nutrient Superstars: Foods that cover multiple depletions at once</div>
              <div className={s.sfBannerChips}>
                {['Organ Meats / Liver', 'Moringa Powder', 'Pumpkin Seeds', 'Dark Chocolate 70%+', 'Sardines', 'Spirulina', 'Eggs', 'Leafy Greens'].map(name => (
                  <button key={name} className={s.sfBannerChip} onClick={() => setFilter('superfoods')}>{name}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Nutrient sections */}
        {showNutrients && visibleNutrients.map(nut => (
          <div key={nut.id}>
            <div className={s.nutCard}>
              <div className={s.nutCardTop}>
                <div className={s.nutTitle}>
                  <span>{nut.icon}</span>
                  {nut.name}
                </div>
                <p className={s.whyMatters}>{nut.whyMatters}</p>
                <span className={s.depletedBy}>{nut.depletedBy}</span>
              </div>

              {nut.foods.map((food, fi) => (
                <div key={fi} className={s.foodRow}>
                  <div className={s.foodMain}>
                    <div className={s.foodName}>
                      {food.name}
                      {food.gem && <span className={s.foodGem}>{food.gem}</span>}
                    </div>
                    <div className={s.foodNote}>{food.note}</div>
                  </div>
                  <div className={s.foodBarWrap}>
                    <div className={s.foodBarTrack}>
                      <div className={s.foodBarFill} style={{ width: `${food.width}%` }} />
                    </div>
                    <div className={s.foodStrength}>{food.strength}</div>
                  </div>
                </div>
              ))}

              <div className={s.suppRow}>
                <div className={s.suppRight}>
                  <div className={s.suppLabel}>✓ {nut.rightFormTitle}</div>
                  {nut.rightForm}
                </div>
                <div className={s.suppAvoid}>
                  <div className={s.suppLabel}>✕ {nut.avoidTitle}</div>
                  {nut.avoid}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Superfoods section */}
        {showSuperfoods && (
          <div className={s.sfSection}>
            <hr className={s.divider} />
            <div className={s.sectionLabel}>★ Multi-Nutrient Superstars</div>
            <div className={s.sfGrid}>
              {SUPERFOODS.map(sf => (
                <div key={sf.name} className={s.sfCard}>
                  <div className={s.sfIcon}>{sf.icon}</div>
                  <div className={s.sfName}>{sf.name}</div>
                  <div className={s.sfNutrients}>
                    {sf.nutrients.map(n => <span key={n} className={s.sfNut}>{n}</span>)}
                  </div>
                </div>
              ))}
            </div>

            <div className={s.absNote}>
              <div className={s.absNoteLabel}>⚠ The Absorption Rule: Phytic Acid (Anti-Nutrients)</div>
              <p className={s.absNoteText}>
                Nuts, seeds, and legumes contain phytic acid (phytates) that block mineral absorption, especially zinc, iron, calcium, and magnesium. <strong>Fix:</strong> Soak nuts, seeds, and beans overnight in water. Discard the soaking water. This removes phytic acid, germinates the seed, and allows your body to actually absorb the minerals you ate. Cooking also reduces phytates. Raw almonds, for example, block their own zinc and calcium, soaked or sprouted almonds do not.
              </p>
            </div>
          </div>
        )}

        {/* FAQ */}
        <div className={s.faqSection}>
          <div className={s.faqTitle}>Frequently asked questions</div>
          {FAQS.map((faq, i) => (
            <div key={i} className={s.faqItem}>
              <div className={s.faqQ} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <span>{faq.q}</span>
                <span className={s.faqToggle}>{openFaq === i ? '−' : '+'}</span>
              </div>
              {openFaq === i && <div className={s.faqA}>{faq.a}</div>}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className={s.ctaBlock}>
          <div className={s.ctaTitle}>Want a personalized nutrient protocol for your medications?</div>
          <p className={s.ctaBody}>
            A functional medicine educator maps your specific medication list to your actual food intake and lab values, then builds a targeted educational food and supplement protocol, not a generic list.
          </p>
          <a
            href={'https://buy.stripe.com/eVqaEW59Sdjwa5O8P600003'}
            className={s.ctaBtn}
          >
            Start Foundation Plan, $37/mo →
          </a>
        </div>

        {/* Related tools */}
        <div className={s.relatedSection}>
          <div className={s.relatedTitle}>Continue</div>
          <div className={s.relatedGrid}>
            <Link to="/tools/medication-nutrient-checker" className={s.relatedCard}>
              <div className={s.relatedLabel}>Start Here</div>
              <div className={s.relatedCardTitle}>Medication Nutrient Depletion Checker →</div>
              <div className={s.relatedCardSub}>See which nutrients your full medication list depletes.</div>
            </Link>
            <Link to="/tools/supplement-timing" className={s.relatedCard}>
              <div className={s.relatedLabel}>Companion Guide</div>
              <div className={s.relatedCardTitle}>Supplement Timing Guide →</div>
              <div className={s.relatedCardSub}>When and how to take each nutrient so it actually absorbs.</div>
            </Link>
          </div>
        </div>

        {/* Disclaimer */}
        <div className={s.disclaimer}>
          <strong>Absorption Note:</strong> All DV percentages are based on FDA reference values. Actual absorption varies based on food preparation method (cooking vs. raw), phytic acid content, co-consumed foods, gut health, and individual factors including MTHFR gene variants and digestive enzyme levels. Soak nuts, seeds, and legumes overnight to remove phytates that block mineral absorption. Pair iron with Vitamin C. Take fat-soluble nutrients (D, E, K, CoQ10) with fat.<br /><br />
          <strong>These statements have not been evaluated by the Food and Drug Administration. This content is not intended to diagnose, treat, cure, or prevent any disease.</strong> This guide is for educational reference only. It does not constitute medical advice or replace a clinical nutrition assessment. Discuss supplementation with your prescriber or pharmacist, especially if you take thyroid medications, anticoagulants, or medications with narrow therapeutic windows. Always confirm actual deficiency with appropriate laboratory testing before supplementing.
        </div>

      </div>
    </div>
  )
}
