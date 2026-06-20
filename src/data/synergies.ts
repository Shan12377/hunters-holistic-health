export interface FoodSynergy {
  id: string
  foodAIds: string[]
  foodBIds: string[]
  title: string
  mechanism: string
  boost: string
  color: string
}

export const SYNERGIES: FoodSynergy[] = [
  {
    id: 'syn-1',
    foodAIds: ['sp1'],
    foodBIds: ['sp4'],
    title: 'Curcumin Activation',
    mechanism: 'Piperine in black pepper and sulfur compounds in garlic inhibit glucuronidation, keeping curcumin in circulation far longer.',
    boost: '+2,000% curcumin bioavailability',
    color: '#c8a74b',
  },
  {
    id: 'syn-2',
    foodAIds: ['v1', 'v3'],
    foodBIds: ['fr2', 'v7'],
    title: 'Iron Absorption Amplifier',
    mechanism: 'Vitamin C reduces ferric iron to ferrous iron, the only form transportable across gut epithelium.',
    boost: '+300% non-heme iron absorption',
    color: '#e05c5c',
  },
  {
    id: 'syn-3',
    foodAIds: ['fr1'],
    foodBIds: ['hf3'],
    title: 'Cognitive Synergy',
    mechanism: 'Anthocyanins cross the blood-brain barrier; omega-3 DHA provides the structural phospholipid matrix for neuronal membranes.',
    boost: 'Memory and neuroplasticity support',
    color: '#818cf8',
  },
  {
    id: 'syn-4',
    foodAIds: ['f1'],
    foodBIds: ['v5'],
    title: 'Gut-Brain Axis Stack',
    mechanism: 'Prebiotic inulin in asparagus feeds Bifidobacterium strains that produce short-chain fatty acids, which modulate the enteric nervous system alongside omega-3 EPA/DHA.',
    boost: 'Gut microbiome and neural signaling',
    color: '#0b9e8e',
  },
  {
    id: 'syn-5',
    foodAIds: ['v2', 'v6'],
    foodBIds: ['hf2'],
    title: 'Sulforaphane Unlock',
    mechanism: 'Sulforaphane is fat-soluble; dietary fat dramatically improves absorption. EVOO also delivers oleocanthal which synergizes on the Nrf2 pathway.',
    boost: '+400% sulforaphane absorption',
    color: '#22c55e',
  },
  {
    id: 'syn-6',
    foodAIds: ['de1', 'de3'],
    foodBIds: ['hf4', 'hf5'],
    title: 'Prebiotic and Probiotic Stack',
    mechanism: 'Soluble fiber from chia and flax acts as prebiotic substrate that selectively feeds the Lactobacillus and Bifidobacterium strains delivered by fermented dairy.',
    boost: 'Microbiome diversity and colonization',
    color: '#a855f7',
  },
  {
    id: 'syn-7',
    foodAIds: ['de2', 'de1'],
    foodBIds: ['hf1'],
    title: 'Fat-Soluble Vitamin Carrier',
    mechanism: 'Vitamins A, D, E, and K require dietary fat to form chylomicrons for lymphatic absorption. Avocado provides the ideal monounsaturated carrier.',
    boost: 'A, D, E, K absorption unlocked',
    color: '#eab308',
  },
  {
    id: 'syn-8',
    foodAIds: ['fr5'],
    foodBIds: ['hf3'],
    title: 'Sleep and Recovery Protocol',
    mechanism: 'Tart cherries supply melatonin precursors and proanthocyanidins that reduce exercise-induced inflammation. Walnuts contribute direct melatonin and omega-3.',
    boost: 'Sleep quality and muscle recovery',
    color: '#3b82f6',
  },
  {
    id: 'syn-9',
    foodAIds: ['v3', 'v1'],
    foodBIds: ['hf2', 'hf1'],
    title: 'Vitamin K2 Activation',
    mechanism: 'Vitamin K1 is fat-soluble and requires dietary fat for absorption and conversion to K2 in tissues, which directs calcium into bones rather than arteries.',
    boost: 'Bone density and arterial protection',
    color: '#84cc16',
  },
  {
    id: 'syn-10',
    foodAIds: ['sp1', 'sp2'],
    foodBIds: ['f11'],
    title: 'Gut Lining Repair Stack',
    mechanism: 'Glycine and collagen peptides in bone broth provide raw substrate for intestinal epithelial repair; curcumin and gingerols reduce mucosal inflammation via NF-kB and COX-2 inhibition simultaneously.',
    boost: 'Intestinal permeability support',
    color: '#f97316',
  },
]

export function detectSynergies(foodIds: string[]): FoodSynergy[] {
  return SYNERGIES.filter(syn => {
    const hasA = syn.foodAIds.some(id => foodIds.includes(id))
    const hasB = syn.foodBIds.some(id => foodIds.includes(id))
    return hasA && hasB
  })
}
