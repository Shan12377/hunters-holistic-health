import { useState, useMemo } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Tooltip, Legend, Filler,
} from 'chart.js'
import { Link } from 'react-router-dom'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler)

// ─── Types ───────────────────────────────────────────────────────────────────

interface PhaseData {
  energy: number
  energyLabel: string
  mood: string
  moodEmoji: string
  what: string[]
  eat: string[]
  move: string[]
  supp: string[]
  selfCare: string[]
  note: string
}

interface PhaseSet { menstrual: PhaseData; follicular: PhaseData; ovulatory: PhaseData; luteal: PhaseData }

type ConditionKey = 'healthy' | 'pmmos' | 'hypothyroid' | 'perimenopause' | 'endo' | 'fibroids' | 'fertility_f' | 'hyperthyroid' | 'estrogendominance' | 'adrenal'

// ─── Conditions ──────────────────────────────────────────────────────────────

const FEMALE_CONDITIONS: { key: ConditionKey; label: string }[] = [
  { key: 'healthy',           label: 'Healthy Cycle / No Condition' },
  { key: 'pmmos',             label: 'PCOS / PMMOS' },
  { key: 'hypothyroid',       label: 'Hypothyroidism / Hashimoto\'s' },
  { key: 'perimenopause',     label: 'Perimenopause / Menopause' },
  { key: 'endo',              label: 'Endometriosis' },
  { key: 'estrogendominance', label: 'Estrogen Dominance' },
  { key: 'adrenal',           label: 'Adrenal / HPA Axis Dysregulation' },
  { key: 'fibroids',          label: 'Uterine Fibroids' },
  { key: 'fertility_f',       label: 'Female Fertility / Conception' },
  { key: 'hyperthyroid',      label: 'Hyperthyroidism / Graves\' Disease' },
]

const CYCLE_LENGTHS = [24, 25, 26, 27, 28, 29, 30, 32, 35, 38]

const PHASES = [
  { key: 'menstrual',  name: 'Menstrual',  subtitle: 'Rest & Renew',     color: '#7c3aed', days: [1, 5] },
  { key: 'follicular', name: 'Follicular', subtitle: 'Rise & Build',     color: '#0891b2', days: [6, 13] },
  { key: 'ovulatory',  name: 'Ovulatory',  subtitle: 'Peak & Connect',   color: '#16a34a', days: [14, 16] },
  { key: 'luteal',     name: 'Luteal',     subtitle: 'Deepen & Restore', color: '#d97706', days: [17, 28] },
]

// ─── Hormone curve math ───────────────────────────────────────────────────────

function gauss(x: number, center: number, width: number, height: number) {
  return height * Math.exp(-Math.pow(x - center, 2) / (2 * Math.pow(width, 2)))
}

function generateCurves(conditionKey: string, cycleLength: number) {
  const ovDay = cycleLength - 14
  const e2: number[] = [], p4: number[] = [], lh: number[] = []
  for (let d = 1; d <= cycleLength; d++) {
    switch (conditionKey) {
      case 'pmmos':
        e2.push(Math.round(20 + gauss(d, ovDay - 1, 5, 40) + gauss(d, ovDay + 7, 3, 25)))
        p4.push(Math.round(10 + gauss(d, ovDay + 7, 4, 25)))
        lh.push(Math.round(28 + gauss(d, ovDay, 1.5, 30)))
        break
      case 'perimenopause':
        e2.push(Math.round(18 + gauss(d, ovDay - 1, 4, 55) + gauss(d, ovDay + 7, 4, 38) + gauss(d, 4, 3, 12)))
        p4.push(Math.round(8 + gauss(d, ovDay + 7, 4, 40)))
        lh.push(Math.round(14 + gauss(d, ovDay, 1, 65)))
        break
      case 'endo':
      case 'estrogendominance':
      case 'fibroids':
        e2.push(Math.round(22 + gauss(d, ovDay - 1, 3, 80) + gauss(d, ovDay + 7, 3, 50)))
        p4.push(Math.round(8 + gauss(d, ovDay + 7, 3.5, 55)))
        lh.push(Math.round(8 + gauss(d, ovDay, 0.8, 88)))
        break
      case 'adrenal':
        e2.push(Math.round(18 + gauss(d, ovDay - 1, 3, 65) + gauss(d, ovDay + 7, 3, 40)))
        p4.push(Math.round(8 + gauss(d, ovDay + 7, 3.5, 58)))
        lh.push(Math.round(8 + gauss(d, ovDay, 0.8, 82)))
        break
      case 'fertility_f':
        e2.push(Math.round(15 + gauss(d, ovDay - 1, 3, 82) + gauss(d, ovDay + 7, 3, 52)))
        p4.push(Math.round(6 + gauss(d, ovDay + 7, 3.5, 90)))
        lh.push(Math.round(6 + gauss(d, ovDay, 0.7, 100)))
        break
      case 'hyperthyroid':
        e2.push(Math.round(10 + gauss(d, ovDay - 1, 2, 45) + gauss(d, ovDay + 6, 2, 28)))
        p4.push(Math.round(5 + gauss(d, ovDay + 6, 2.5, 30)))
        lh.push(Math.round(10 + gauss(d, ovDay, 1, 70)))
        break
      default:
        e2.push(Math.round(18 + gauss(d, ovDay - 1, 3, 75) + gauss(d, ovDay + 7, 3, 45)))
        p4.push(Math.round(8 + gauss(d, ovDay + 7, 3.5, 82)))
        lh.push(Math.round(8 + gauss(d, ovDay, 0.8, 90)))
    }
  }
  const clamp = (v: number) => Math.min(100, Math.max(0, v))
  return {
    labels: Array.from({ length: cycleLength }, (_, i) => i + 1),
    e2: e2.map(clamp), p4: p4.map(clamp), lh: lh.map(clamp),
  }
}

// ─── Phase detection ──────────────────────────────────────────────────────────

function getPhase(cycleDay: number, cycleLength: number) {
  const ovDay = cycleLength - 14
  if (cycleDay <= 5) return PHASES[0]
  if (cycleDay <= ovDay - 2) return PHASES[1]
  if (cycleDay <= ovDay + 1) return PHASES[2]
  return PHASES[3]
}

function getCycleDay(lastPeriodDate: string, cycleLength: number): number {
  if (!lastPeriodDate) return 1
  const start = new Date(lastPeriodDate + 'T12:00:00')
  const today = new Date()
  const diff = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  const day = (diff % cycleLength) + 1
  return Math.max(1, Math.min(cycleLength, day))
}

// ─── Phase data ───────────────────────────────────────────────────────────────

const PHASE_DATA: Record<ConditionKey, PhaseSet> = {
  healthy: {
    menstrual: {
      energy: 2, energyLabel: 'Low - Rest Intentionally',
      mood: 'Introspective, reflective, drawn inward. A natural signal to slow down and renew.',
      moodEmoji: '🌑',
      what: ['Estrogen and progesterone drop to their lowest point, signaling the lining to shed', 'FSH begins rising to recruit next month\'s follicle cohort', 'Prostaglandins cause uterine contractions — mild cramping is normal for 1-2 days', 'Left brain and right brain are most connected this week — intuition is strongest'],
      eat: ['Iron-rich foods: grass-fed beef, lentils, spinach with Vitamin C', 'Anti-inflammatory: turmeric, ginger, fatty fish, bone broth', 'Warming cooked foods — soups, stews, roasted root vegetables', 'Dark chocolate 85%+ and pumpkin seeds — natural magnesium for cramping'],
      move: ['Restorative yoga: child\'s pose, supine twist, legs up the wall', 'Gentle walking 20-30 min — moves blood without taxing the body', 'Slow stretching — this is recovery, not performance'],
      supp: ['Magnesium glycinate 400mg — reduces uterine cramping and supports sleep', 'Omega-3 EPA/DHA 2g — anti-inflammatory, reduces prostaglandin-driven pain', 'Iron bisglycinate if bleeding is heavy', 'Vitamin B12 + methylfolate — supports energy and red blood cell renewal'],
      selfCare: ['Castor oil pack on lower abdomen 30-60 min', 'Heat therapy — low setting heating pad', 'Early bedtime — this is your body\'s monthly reset week', 'Journaling: what do I want to release this cycle?'],
      note: 'A healthy period lasts 3-7 days with moderate, manageable flow. Your period is your monthly report card on the previous cycle\'s hormone balance.'
    },
    follicular: {
      energy: 4, energyLabel: 'Rising - Best Building Phase',
      mood: 'Fresh start energy, optimistic, mentally sharp. Increasingly social and creative as estrogen climbs.',
      moodEmoji: '🌱',
      what: ['FSH recruits a cohort of 10-20 follicles — one will become dominant', 'Estrogen rises steadily as the dominant follicle grows', 'Serotonin and dopamine rise with estrogen — brain fog lifts completely', 'Cervical fluid progresses from dry to sticky to creamy as ovulation approaches'],
      eat: ['Fermented foods: kimchi, sauerkraut, kefir', 'Cruciferous vegetables: broccoli, Brussels sprouts — support liver estrogen metabolism', 'Leafy greens and sprouted legumes — folate for egg quality', 'Seed cycling: 1 tbsp ground flaxseed + 1 tbsp pumpkin seeds daily'],
      move: ['HIIT 2-3x this week — best phase for high-intensity training', 'Strength training 2-3x — build muscle while cortisol response is lowest', 'Cardio, cycling, dance — your body is at its most resilient'],
      supp: ['Methylfolate 400-800mcg — supports healthy ovulation and egg quality', 'B-complex (methylated) — cofactor for estrogen metabolism and energy', 'Vitamin D to maintain 60-80 ng/mL', 'Maca root 1-2g/day — adaptogen that supports hormonal tone'],
      selfCare: ['Start new projects, habits, or creative work — initiation energy is highest', 'Track cervical fluid daily', 'Schedule social plans, networking — anything requiring your best energy'],
      note: 'As the dominant follicle grows, it produces more estrogen — which is what makes you feel increasingly good. This phase is your monthly green light.'
    },
    ovulatory: {
      energy: 5, energyLabel: 'Peak - Maximum Output',
      mood: 'Confident, magnetic, charismatic, quick-thinking. Your most "on" days of the month.',
      moodEmoji: '✨',
      what: ['LH surge triggers the dominant follicle to release the egg — ovulation', 'Estrogen peaks at its highest point, then briefly dips just before ovulation', 'Testosterone spikes briefly — drives libido, motivation, and assertiveness', 'Egg is viable for only 12-24 hours — sperm can survive 3-5 days'],
      eat: ['Zinc-rich foods: pumpkin seeds, oysters, sesame', 'Cruciferous vegetables — DIM precursors to support estrogen metabolism', 'Antioxidants: berries, colorful vegetables — protect the egg from oxidative damage', 'Light, vibrant meals — digestion is efficient, energy is high'],
      move: ['Highest intensity training of your cycle — body is at its physical peak', 'Running, sprinting, heavy lifting, competitive sports', 'Group fitness or team sports — social and competitive drive is strongest'],
      supp: ['CoQ10 200mg — mitochondrial support for egg quality', 'Zinc 15mg — supports ovulation', 'Vitamin C 1g — supports ovarian function', 'NAC 600mg — antioxidant protection during ovulation'],
      selfCare: ['Schedule presentations, difficult conversations, dates, and creative peaks this week', 'OPK strips if tracking: test around Day 11-14', 'Mittelschmerz — a brief one-sided twinge is normal as the follicle ruptures'],
      note: 'Ovulation is not a guaranteed event — it must be confirmed. BBT rise the following morning is the only home confirmation that ovulation actually occurred.'
    },
    luteal: {
      energy: 3, energyLabel: 'Steady then Declining',
      mood: 'Focused and detail-oriented early on. Slower, more emotional, and deeply intuitive in the final week.',
      moodEmoji: '🌖',
      what: ['The empty follicle becomes the corpus luteum and produces progesterone', 'Progesterone peaks around Day 21 — its calming GABA effect supports sleep and mood', 'Body temperature rises 0.2-0.5°C and stays elevated until the day before the next period', 'Metabolism increases 100-300 calories per day'],
      eat: ['Complex carbs + protein combinations: sweet potato and chicken, rice and eggs', 'Magnesium-rich foods: dark chocolate, leafy greens, avocado, pumpkin seeds', 'Warm, cooked meals — digestion slows in luteal phase', 'Reduce caffeine in the final 5 days — worsens breast tenderness and PMS anxiety'],
      move: ['Pilates and yoga — best match for luteal energy', 'Swimming, long walks, hiking', 'Reduce HIIT intensity in the final week — recovery takes longer now'],
      supp: ['Magnesium glycinate 400mg — the #1 luteal supplement for cramp prevention and mood', 'B6 / P5P 50mg — reduces PMS, supports progesterone production', 'Evening Primrose Oil 1g (Days 14-ovulation only)', 'Seed cycling: 1 tbsp sunflower seeds + 1 tbsp sesame seeds daily'],
      selfCare: ['Complete projects and decisions in the first half of luteal', 'Journal: what is not working, what needs to change?', 'Sleep 8+ hours: progesterone supports deep sleep — protect this'],
      note: 'Healthy PMS is mild: a day or two of fatigue or slight moodiness. Severe PMS or PMDD-level mood changes are signals that something is off, not that you are "just hormonal."'
    },
  },
  pmmos: {
    menstrual: { energy: 2, energyLabel: 'Low - Rest Required', mood: 'Fatigued, crampy, emotionally flat. Blood sugar swings make mood unstable.', moodEmoji: '😔', what: ['LH remains chronically elevated (2-3x normal) even during period', 'Prostaglandin excess causes stronger cramping than average', 'Insulin resistance spikes during menstruation', 'Estrogen and progesterone drop to their lowest point'], eat: ['Protein + fat at every meal — prevents blood sugar crashes', 'Iron-rich foods: grass-fed beef, lentils, spinach with Vitamin C', 'Anti-inflammatory: turmeric, ginger, bone broth', 'Avoid sugar and refined carbs — they worsen cramps and mood'], move: ['Gentle walking 20-30 min', 'Restorative yoga — child\'s pose, legs up the wall', 'Avoid HIIT — cortisol already elevated, will spike LH further'], supp: ['Magnesium glycinate 400mg', 'NAC 1,800mg on empty stomach', 'Myo-inositol 4g (40:1 ratio) — continue throughout cycle', 'Omega-3 EPA/DHA 2-3g'], selfCare: ['Castor oil pack on lower abdomen 30-60 min', 'Heat therapy — heating pad on low', 'This is a biological signal to slow down — honor it'], note: 'PMMOS (Polycystic Metabolic Ovarian Syndrome): cycles may be irregular if longer than 35 days. Myo-inositol every day of the cycle is the single most important intervention.' },
    follicular: { energy: 3, energyLabel: 'Rebuilding - Moderate', mood: 'Gradually brighter, more motivated. Best cognitive window in PMMOS cycle.', moodEmoji: '🌱', what: ['Estrogen rises but may be irregular or blunted', 'LH:FSH ratio remains elevated — follicular development may be sluggish', 'Multiple small follicles may develop without one becoming dominant', 'Insulin sensitivity is slightly better in this phase'], eat: ['Mediterranean diet foundation: olive oil, colorful vegetables, legumes', 'Spearmint tea 2 cups daily — reduces free testosterone', 'Ground flaxseed 2 tbsp daily', 'Protein 1.2-1.6g/kg body weight across the day'], move: ['HIIT 2-3x/week — best phase for high-intensity (improves insulin sensitivity)', 'Strength training 2-3x/week — builds insulin-sensitive muscle', 'Dance, cycling, group fitness'], supp: ['Myo-inositol 4g + D-chiro inositol 100mg — continue daily', 'Berberine 500mg 3x with meals', 'Vitamin D to target 60-80 ng/mL', 'Zinc 30mg — inhibits excess androgen production'], selfCare: ['BBT charting begins Day 1 — follicular temps are lower', 'Cold shower finish in morning — boosts dopamine, reduces LH', 'Fertility apps if conception is a goal'], note: 'Berberine + myo-inositol combination is most studied for restoring follicular dominance and ovulation induction. LH:FSH ratio goal: below 2:1.' },
    ovulatory: { energy: 4, energyLabel: 'Peak - High Energy', mood: 'Most confident, social, and clear-headed phase.', moodEmoji: '✨', what: ['In PMMOS: ovulation may or may not occur — LH surge may be absent or blunted', 'If ovulating: estrogen peaks before the LH surge triggers egg release', 'Testosterone also peaks slightly — drives libido and motivation', 'Cervical mucus becomes egg-white consistency if ovulating'], eat: ['Cruciferous vegetables: broccoli, cauliflower, arugula', 'Zinc-rich foods: pumpkin seeds, oysters', 'Light, vibrant meals', 'Continue spearmint tea'], move: ['High-intensity training, running, challenging workouts', 'Social sports or group exercise', 'This is your strongest performance window'], supp: ['Continue myo-inositol 4g', 'CoQ10 600mg if trying to conceive', 'Vitex 400mg if cycles are long/irregular', 'NAC 1,800mg'], selfCare: ['OPK strips Days 10-20 to detect LH surge', 'Cervical mucus monitoring', 'High-quality sleep continues as priority'], note: 'In PMMOS, ovulation may be delayed (Day 18-25 in a 38-day cycle) or absent. If OPKs are never positive, discuss inositol + letrozole with your provider.' },
    luteal: { energy: 2, energyLabel: 'Declining - Restore', mood: 'Increasing moodiness, PMS symptoms, food cravings. Progesterone too low to counterbalance estrogen.', moodEmoji: '🌀', what: ['Progesterone often insufficient in PMMOS luteal phase', 'Estrogen without progesterone opposition = worsened PMS, bloating, breast tenderness', 'Blood sugar instability returns — carb cravings intensify', 'If ovulation occurred, progesterone rises but often lower than ideal'], eat: ['Complex carbs + protein combos to stabilize blood sugar', 'Magnesium-rich foods: dark chocolate, leafy greens, pumpkin seeds', 'Reduce caffeine — worsens breast tenderness and PMS anxiety', 'Bitter foods: arugula, dandelion greens — support liver estrogen clearance'], move: ['Moderate yoga, pilates, swimming', 'Reduce HIIT intensity as PMS approaches', 'Walking — regulates blood sugar, boosts serotonin'], supp: ['Magnesium glycinate 400mg', 'Vitex (Chaste Tree) 400mg — increases progesterone via LH effect', 'P5P (active B6) 50mg', 'Ashwagandha 300-600mg — cortisol dysregulation worsens luteal symptoms'], selfCare: ['Journaling — thoughts are more inward and insightful', 'Reduce social obligations in final 3-4 days before period', 'Castor oil packs preventively'], note: 'Normal luteal progesterone should exceed 10 ng/mL on Day 21. In anovulatory PMMOS cycles, progesterone may be near zero. Vitex takes 3-6 months to show benefit.' },
  },
  hypothyroid: {
    menstrual: { energy: 1, energyLabel: 'Very Low - Rest Essential', mood: 'Emotionally flat, heavy, fatigued beyond what is typical. Brain fog at its worst.', moodEmoji: '😴', what: ['Slowed thyroid function reduces the rate at which estrogen is cleared from the body', 'Heavier and longer periods are common — thyroid hormone regulates uterine lining shedding', 'Clots more likely due to impaired fibrinolysis when T3 is low', 'Cold intolerance worsens during menstruation'], eat: ['Warm, easy-to-digest foods: soups, stews, bone broth', 'Iron-rich foods — heavy periods deplete iron, which further impairs T4-to-T3 conversion', 'Selenium-rich Brazil nuts (2 per day)', 'Avoid raw cruciferous in large quantities — lightly steam instead'], move: ['Gentle walking only', 'Restorative yoga, slow stretching', 'Rest as needed — hypothyroidism + menstruation together demand more recovery'], supp: ['Selenium 200mcg (selenomethionine)', 'Iron bisglycinate if ferritin below 70', 'Magnesium glycinate 400mg', 'Vitamin D if not already optimized'], selfCare: ['Heat therapy — heating pad, warm baths with Epsom salts', 'Castor oil pack on lower abdomen and over thyroid area', 'Sleep as early as 9-10pm if possible'], note: 'Ferritin below 70 ng/mL impairs T4-to-T3 conversion — low ferritin from heavy periods creates a feedback loop that worsens hypothyroid symptoms. Test ferritin, not just hemoglobin.' },
    follicular: { energy: 3, energyLabel: 'Building - Use This Window', mood: 'Gradually improving with estrogen rise. Still cognitively sluggish if T3 is low.', moodEmoji: '🌤', what: ['Rising estrogen supports mood and energy — best phase for Hashimoto\'s patients', 'Thyroid antibody levels may fluctuate with immune activity', 'TSH should be rechecked in this phase (Days 6-10) for most accurate reading', 'Cortisol rise in follicular phase can worsen T4-to-T3 conversion if HPA is also dysregulated'], eat: ['Selenium: 200mcg from food + supplement', 'Zinc-rich foods: oysters, pumpkin seeds, beef', 'Adequate iodine from food only (seafood, seaweed in moderation)', 'Avoid gluten strictly if Hashimoto\'s — 90-day trial minimum'], move: ['Progressive increase in activity — best exercise window', 'Strength training supports thyroid function', 'Morning movement anchors circadian rhythm which supports TSH pattern'], supp: ['Selenium 200mcg (selenomethionine)', 'Zinc 25-30mg', 'Magnesium glycinate 400mg', 'Vitamin D3 + K2 to target 60-80 ng/mL'], selfCare: ['Schedule thyroid labs in this phase (Day 6-10)', 'Thyroid-supporting neck exercises', 'Reduce exposure to fluoride'], note: 'Selenium 200mcg/day has 12 meta-analyses supporting reduction in TPO antibodies. Takes 3-6 months of consistent use.' },
    ovulatory: { energy: 3, energyLabel: 'Moderate Peak', mood: 'Best mood in cycle — estrogen peak supports serotonin and dopamine.', moodEmoji: '😊', what: ['Estrogen peak at ovulation supports mood and cognition', 'LH surge may be blunted or delayed in hypothyroidism', 'Ovulatory window may be shorter than average', 'Progesterone begins to rise after ovulation — requires adequate thyroid for conversion'], eat: ['Protein emphasis for progesterone synthesis', 'Tyrosine-rich foods: chicken, eggs, almonds — thyroid hormone precursor', 'Continue selenium and zinc', 'Cruciferous vegetables lightly cooked'], move: ['Social, energizing activities — energy is highest now', 'High-intensity training if desired — T3 supports recovery', 'Outdoor exercise for Vitamin D'], supp: ['Continue selenium, zinc, magnesium, Vitamin D3+K2', 'Ashwagandha 300-600mg — supports thyroid T4/T3 levels', 'CoQ10 200mg — mitochondrial support for energy'], selfCare: ['Schedule important conversations and appointments in this phase', 'Creative work flows more easily', 'Good time for social reconnection'], note: 'Ashwagandha (KSM-66) increases both T3 and T4 levels and reduces TSH in subclinical hypothyroidism. Limit to 300-600mg/day.' },
    luteal: { energy: 2, energyLabel: 'Declining - Prioritize Sleep', mood: 'PMS amplified in hypothyroidism. Anxiety, depression, brain fog worsen pre-menstrually.', moodEmoji: '🌧', what: ['Low T3 impairs progesterone receptor sensitivity', 'Thyroid conversion worsens under the high cortisol of late luteal phase', 'Sleep disruption in late luteal compounds thyroid fatigue', 'Depression and anxiety before period — serotonin pathway requires T3'], eat: ['Iodine-containing foods: seaweed soup, baked potato with skin, eggs', 'Complex carbohydrates for serotonin support: oats, sweet potato', 'Magnesium-rich: dark chocolate, pumpkin seeds, leafy greens', 'Reduce alcohol — directly impairs thyroid hormone activity'], move: ['Moderate yoga, walking, swimming', 'Avoid overtraining — elevated cortisol inhibits T3 production', 'Evening walks reduce cortisol and support sleep'], supp: ['Magnesium glycinate 400-500mg', 'B complex with methylated B12 and folate', '5-HTP 100mg if depression is severe pre-menstrually', 'Continue selenium, zinc, Vitamin D'], selfCare: ['Sleep is the single most important intervention in this phase', 'Morning sunlight exposure to anchor circadian rhythm', 'Reduce screen time after 8pm — blue light suppresses melatonin AND TSH'], note: 'Short luteal phase (under 10 days) is a red flag for both thyroid dysfunction and low progesterone. If consistently 8 days or less, retest TSH, Free T3, and Day 21 progesterone together.' },
  },
  perimenopause: {
    menstrual: { energy: 1, energyLabel: 'Low - Heavier Than Before', mood: 'Grief, emotional processing, exhaustion. Periods are heavier and longer in perimenopause.', moodEmoji: '🌊', what: ['Periods may be heavier, longer, and more unpredictable than in earlier years', 'Estrogen drops sharply at period start but baseline is erratic', 'Progesterone deficiency throughout the luteal phase means estrogen dominance peak now releasing', 'Hot flashes and night sweats often worst during menstruation'], eat: ['Iron-rich foods — heavy periods deplete iron', 'Phytoestrogen foods: ground flaxseed 2 tbsp, edamame', 'Anti-inflammatory: turmeric, ginger, EVOO', 'Reduce alcohol and caffeine — both trigger hot flashes'], move: ['Rest-dominant: gentle yoga, walking only', 'Listen to your body — this is not the phase to push through fatigue', 'Heat/cold contrast therapy supports vasomotor symptoms'], supp: ['Magnesium glycinate 400-500mg — reduces hot flash severity, improves sleep', 'Black cohosh 40-80mg — 4-8 weeks to reduce vasomotor symptoms', 'Vitamin E 400 IU — shown to reduce hot flash frequency', 'Iron bisglycinate if ferritin is dropping'], selfCare: ['Track period changes — bring this data to provider', 'This is a threshold — honor what your body is going through', 'Warm baths with lavender for pain and transition support'], note: 'As of 2026, HRT is now first-line for bothersome perimenopausal symptoms. Transdermal estradiol + micronized progesterone (Prometrium) is the preferred bioidentical formulation.' },
    follicular: { energy: 3, energyLabel: 'Variable - Unpredictable', mood: 'Estrogen may surge HIGH or stay low. Energy is inconsistent day to day.', moodEmoji: '🎢', what: ['FSH is elevated as pituitary works harder to stimulate failing ovarian response', 'Estrogen rises erratically — may surge much higher than in earlier years', 'Cycle may be shortened — periods coming closer together', 'Hot flashes may lessen temporarily as estrogen rises'], eat: ['Mediterranean diet: most evidence for menopause symptom reduction', 'Phytoestrogens: soy isoflavones (edamame, tempeh), flaxseed', 'Protein 1.2-1.6g/kg — muscle preservation is critical', 'Calcium from food: dairy, sardines with bones (1,000mg/day)'], move: ['Resistance training 2-3x/week — non-negotiable for bone density', 'Walking increases bone density and reduces hot flash frequency', 'Best exercise window in perimenopausal cycle'], supp: ['Vitamin D3 5,000 IU + K2 MK-7 200mcg', 'Magnesium glycinate 400mg', 'DIM 200-300mg — improves estrogen metabolite ratio', 'DHEA 10-25mg if DHEA-S is low (assess first)'], selfCare: ['Vaginal estrogen (low-dose, local): safe even with contraindications to systemic HRT', 'Keep bedroom cool — 65-68°F', 'Best energy phase — use it wisely'], note: 'FSH above 10 suggests diminished ovarian reserve; above 40 confirms menopause. However FSH fluctuates dramatically in perimenopause — a single result is not definitive.' },
    ovulatory: { energy: 4, energyLabel: 'Highest in Cycle', mood: 'Clearer thinking, higher libido, more connected and outward-facing.', moodEmoji: '🌟', what: ['Ovulation may still occur but timing is erratic and fertility is declining', 'LH surge may be present but estrogen peak is less reliable', 'This phase shortens as perimenopause progresses', 'Testosterone still peaks slightly at ovulation — drives motivation and libido'], eat: ['Zinc-rich foods for hormonal synthesis', 'Cruciferous vegetables — 1-2 cups daily', 'Lean protein emphasis', 'Berries and antioxidants: protect mitochondria'], move: ['Peak performance window — challenging workouts', 'Yoga inversions support lymphatic and hormone clearance', 'Outdoor activities for Vitamin D and mood'], supp: ['Continue Vitamin D3+K2, Magnesium, DIM', 'Ashwagandha 300-600mg — reduces hot flashes', 'Black cohosh 40-80mg if vasomotor symptoms persist', 'Maca 1.5-3g — adaptogenic root shown to reduce menopause symptoms'], selfCare: ['Important conversations, negotiations, presentations — peak communication window', 'Connect with community and relationships', 'Libido may be present but declining — intimacy is still important for hormonal health'], note: 'Progesterone cream or oral micronized progesterone (50-200mg at bedtime) in the second half of the cycle is one of the most effective interventions for perimenopausal sleep disruption and mood.' },
    luteal: { energy: 2, energyLabel: 'Declining - Sleep Critical', mood: 'Sleep disrupted, irritable, night sweats may worsen. Pre-menstrual tension amplified.', moodEmoji: '🌙', what: ['Progesterone increasingly insufficient', 'Without adequate progesterone, sleep architecture is disrupted', 'Hot flashes and night sweats often worst in late luteal and around menstruation', 'Mood: anxiety, irritability, and depression can be severe'], eat: ['Magnesium-rich foods at dinner: pumpkin seeds, spinach, dark chocolate', 'Tryptophan-rich foods for serotonin: turkey, eggs + complex carb', 'Reduce caffeine after noon — worsens hot flashes and sleep fragmentation', 'Hibiscus tea: cooling, anti-inflammatory, supportive for hot flashes'], move: ['Evening walks — reduces cortisol, supports sleep onset', 'Gentle yoga / yin yoga', 'Avoid vigorous evening exercise — raises core temperature, worsens night sweats'], supp: ['Magnesium glycinate 400mg at bedtime', 'L-Theanine 200mg at bedtime — calming without drowsiness', 'Melatonin 0.5-1mg timed-release if sleep onset is the issue', 'Black cohosh 40-80mg for vasomotor symptoms'], selfCare: ['Bedroom: blackout curtains, 65-68°F, white noise or fan', 'Moisture-wicking sleepwear for night sweats', 'If sleep has been consistently poor for 3+ months, HRT consultation is warranted'], note: 'Oral micronized progesterone (Prometrium) 50-100mg at bedtime in the second half of the cycle is one of the most effective interventions for perimenopausal sleep disruption and mood.' },
  },
  endo: {
    menstrual: { energy: 1, energyLabel: 'Very Low - Severe Symptoms', mood: 'Pain-dominant. Exhaustion, nausea, emotional rawness. This is the highest-symptom phase.', moodEmoji: '😣', what: ['Endometrial-like lesions bleed along with the uterine lining — causing inflammation at lesion sites', 'Prostaglandins are markedly elevated — driving severe cramping and pelvic pain', 'Retrograde menstruation deposits debris on lesions, driving inflammatory cycle', 'Energy expenditure for pain processing is significant — fatigue is physiologic, not weakness'], eat: ['Omega-3 emphasis: wild salmon, sardines, mackerel — reduces prostaglandin E2 directly', 'Anti-inflammatory: turmeric 1 tsp with black pepper, ginger tea', 'Magnesium-rich foods: pumpkin seeds, dark chocolate', 'Avoid: dairy, gluten, red meat during period — all increase prostaglandins'], move: ['Rest. Gentle movement only if pain allows.', 'Legs up the wall (Viparita Karani) — reduces pelvic congestion', 'Gentle hip circles and child\'s pose only'], supp: ['Omega-3 EPA+DHA 3-4g daily', 'Magnesium glycinate 400-500mg', 'NAC 600mg 3x daily (1,800mg total) — shown in Italian RCT to reduce endometrioma size', 'Resveratrol 500mg — anti-angiogenic'], selfCare: ['Castor oil pack on lower abdomen for 45-60 min daily during period', 'Heat therapy: heating pad on abdomen AND lower back', 'Magnesium sulfate (Epsom) sitz bath for pelvic pain relief'], note: '2026 ACOG Guideline: Excision surgery is now preferred over ablation for endometriosis. Average diagnosis delay is 4-11 years — validate this client\'s pain history.' },
    follicular: { energy: 3, energyLabel: 'Building - Best Phase for Endo', mood: 'Pain subsides, energy returns, most livable phase of the cycle.', moodEmoji: '🌱', what: ['Estrogen rises to stimulate follicle development — lesions remain quiet as estrogen is still moderate', 'Inflammation subsides as period ends — this is the relative "window" in the endo cycle', 'Best time for restorative work, meaningful activities, medical appointments', 'Start anti-estrogen protocol NOW to prevent the ovulatory estrogen spike from feeding lesions'], eat: ['DIM-containing cruciferous vegetables daily: broccoli, cauliflower, kale', 'Calcium D-glucarate foods: grapefruit, apples, oranges', 'Ground flaxseed 2 tbsp', 'Minimize alcohol: even 1 drink increases estrogen clearance impairment'], move: ['This is the best exercise window — use it', 'Moderate-high intensity if pain is absent: hiking, cycling, swimming', 'Pelvic floor physiotherapy — if not in active treatment, start now'], supp: ['DIM 300-400mg daily', 'Calcium D-glucarate 500mg', 'Curcumin 500mg with piperine', 'Continue NAC 1,800mg and Omega-3s'], selfCare: ['Pelvic floor physiotherapy (seek provider who specializes in endo)', 'Somatic movement: gentle dance, Qigong', 'Journal physical symptoms to bring to next appointment'], note: 'The gut-estrogen connection: beta-glucuronidase-producing gut bacteria recirculate estrogen. Probiotics + calcium D-glucarate directly address this.' },
    ovulatory: { energy: 4, energyLabel: 'Higher Energy - Pain Possible', mood: 'Good energy but potential for ovulatory pain (Mittelschmerz) and intercourse pain.', moodEmoji: '⚡', what: ['Estrogen peaks — this is when lesions are most "activated"', 'LH surge and ovulation may cause sharp ovulatory pain', 'Intercourse pain (dyspareunia) is most likely around ovulation', 'Progesterone begins to rise after ovulation — this will help reduce lesion activity'], eat: ['Anti-inflammatory emphasis today: omega-3s, turmeric, berries', 'Liver support: beet root, dandelion greens, artichoke', 'Green tea 2-3 cups: EGCG is anti-estrogenic', 'Adequate fiber (35g) to bind and excrete estrogen metabolites'], move: ['Listen to your body — ovulatory pain may limit intensity', 'Swimming or cycling if no pain', 'Avoid deep yoga twists or inversions if experiencing ovulatory pain'], supp: ['Resveratrol 500mg', 'DIM 300mg', 'Omega-3s 3-4g', 'Progesterone cream (transdermal) post-ovulation if cycles confirmed'], selfCare: ['Track pain severity (1-10) in hormone tracker to document pattern for provider', 'Castor oil packs 3x/week prophylactically', 'Sexual positions that minimize deep penetration if dyspareunia is present'], note: 'Bioidentical progesterone beginning at ovulation (Day 14) and continuing through Day 28 can significantly reduce endo pain by opposing the estrogen dominance that drives lesion growth.' },
    luteal: { energy: 2, energyLabel: 'Declining - Pre-menstrual Inflammation', mood: 'Building dread as period approaches. Pre-menstrual spotting, pelvic pressure, fatigue.', moodEmoji: '⛈', what: ['Progesterone resistance: endo lesions may not respond normally to progesterone\'s anti-inflammatory signal', 'Pre-menstrual spotting is common in endo', 'Inflammation begins building 3-5 days before period', 'Endo belly bloating increases as pelvic inflammatory mediators accumulate'], eat: ['Ramp up anti-inflammatory protocol 5 days before expected period: omega-3s, turmeric, ginger', 'Magnesium-rich foods daily', 'Gut-healing foods: bone broth, cooked vegetables, slippery elm tea', 'Reduce histamine-containing foods if histamine intolerance is suspected'], move: ['Moderate, gentle: yin yoga, walking, swimming', 'Pelvic floor relaxation exercises (not Kegels — these may worsen pain in endo)', 'Avoid high impact as period approaches'], supp: ['Magnesium glycinate 400-500mg', 'Omega-3s 3-4g', 'Quercetin 500mg — anti-inflammatory, mast cell stabilizing', 'Iron bisglycinate if ferritin is dropping'], selfCare: ['Pre-emptive castor oil packing starting 5 days before expected period', 'Prepare heat therapy supplies for menstrual phase', 'Communicate needs to household/work — planning around cycle reduces stress'], note: 'High-dose DIM, resveratrol, and omega-3s all improve progesterone receptor sensitivity. Quercetin is a natural mast cell stabilizer — add in luteal phase if bloating and skin reactions worsen pre-menstrually.' },
  },
  fibroids: {
    menstrual: { energy: 1, energyLabel: 'Very Low - Heavy Blood Loss', mood: 'Exhausted, often anemic, possible flooding and clotting. Emotionally depleted.', moodEmoji: '🩸', what: ['Fibroids expand the uterine surface area — significantly heavier bleeding than normal', 'Clots larger than a quarter are a clinical sign of fibroid-driven heavy menstrual bleeding', 'Iron deficiency anemia from chronic heavy loss causes fatigue on top of hormonal fatigue', 'Submucosal fibroids cause the heaviest bleeding'], eat: ['Iron priority: grass-fed liver, beef, lentils, spinach ALWAYS with Vitamin C', 'Blackstrap molasses 1-2 tbsp: high iron, highly bioavailable', 'Nettle leaf tea: high in iron and Vitamin K', 'Avoid caffeine and alcohol during period — both worsen bleeding volume'], move: ['Rest completely if flooding. Light walking only if bleeding is controlled.', 'Any significant exertion increases blood pressure and can worsen bleeding'], supp: ['Iron bisglycinate 25-50mg on empty stomach', 'Vitamin C 500mg with iron to enhance absorption', 'Magnesium glycinate 400mg for cramping', 'Liquid Chlorophyll 1-2 tbsp in water daily — accelerates blood building'], selfCare: ['Period underwear + menstrual disc for managing heavy flow', 'Track flooding episodes (soaking a pad/tampon in under an hour = flooding)', 'Schedule CBC and ferritin check after period ends', 'Warm castor oil pack on lower abdomen 30-45 mins (light heat only)'], note: 'Uterine fibroids are the most common benign gynecological tumor, affecting up to 80% of Black women by age 50 and significantly underdiagnosed. Heavy menstrual bleeding from fibroids is the most common cause of iron deficiency anemia in reproductive-age women.' },
    follicular: { energy: 3, energyLabel: 'Rebuilding Post-Blood-Loss', mood: 'Gradually recovering. Iron and energy returning if diet is adequate.', moodEmoji: '🌿', what: ['Estrogen begins rising — estrogen is the primary driver of fibroid growth', 'This is the critical phase to aggressively support liver estrogen metabolism', 'DIM, fiber, and liver support now reduce the estrogen signal that feeds fibroid growth'], eat: ['Cruciferous vegetables 2 cups daily: broccoli, cauliflower, Brussels sprouts', 'Ground flaxseed 2 tbsp', 'High fiber: 35g daily minimum to bind and excrete estrogen metabolites', 'Green tea 2 cups: EGCG is anti-proliferative in fibroid cells'], move: ['Progressive return to normal activity after period ends', 'Rebounding 10 mins daily: stimulates lymphatic drainage through the pelvic basin', 'Yoga supports lymphatic drainage and pelvic circulation', 'Strength training: builds muscle that competes with fat for estrogen production'], supp: ['DIM 300-400mg', 'Calcium D-glucarate 1,000mg', 'NAC 1,200mg', 'Vitamin D3 5,000 IU — low Vitamin D is significantly associated with larger fibroids'], selfCare: ['Continue building iron stores from period blood loss', 'Avoid heated plastics, BPA, phthalates — xenoestrogens directly stimulate fibroid growth', 'Castor oil packs over lower abdomen 3x/week'], note: 'Vitamin D deficiency is strongly associated with uterine fibroids. Target serum Vitamin D: 60-80 ng/mL. Begin DIM and calcium D-glucarate NOW to blunt the estrogen surge coming at ovulation.' },
    ovulatory: { energy: 4, energyLabel: 'Moderate-High', mood: 'Energy relatively good. Pelvic pressure may worsen as fibroids are largest relative to cycle.', moodEmoji: '⚡', what: ['Estrogen peaks — fibroids respond most strongly to this hormonal signal', 'Fibroids may feel more prominent as estrogen increases water retention', 'Pelvic pressure or a sensation of fullness is common near ovulation', 'Ovulation itself is usually normal unless fibroids are very large'], eat: ['Maintain DIM-precursor vegetables: broccoli, arugula, kale', 'Beet juice or beet root: supports liver Phase 1 detox of estrogens', 'Berries + pomegranate: polyphenols with anti-proliferative effects on fibroid cells', 'Reduce animal fat intake this phase — saturated fat elevates estrogen production'], move: ['Normal activity level if no pelvic pain', 'Avoid high-impact activity if pelvic pressure is significant', 'Swimming and cycling are gentle on the pelvic floor'], supp: ['Continue DIM, calcium D-glucarate, NAC, Vitamin D', 'Progesterone cream (transdermal) starting Day 14 if ovulation confirmed', 'Resveratrol 500mg: anti-proliferative in fibroid cells', 'Curcumin 500-1000mg with black pepper: directly anti-proliferative in uterine fibroid cells'], selfCare: ['Schedule ultrasound monitoring of fibroid size if due', 'Track any changes in pelvic pressure or urinary frequency', 'Research UFE and myomectomy if fibroids are significantly impacting quality of life'], note: 'Bioidentical progesterone beginning at ovulation is one of the most overlooked functional interventions for fibroids. Estrogen grows fibroids; progesterone opposes this when applied correctly.' },
    luteal: { energy: 2, energyLabel: 'Declining', mood: 'Pre-menstrual heaviness, pelvic pressure, bloating. Anxiety about upcoming heavy period.', moodEmoji: '⛅', what: ['Progesterone rises — this phase is relatively estrogen-quieter for fibroids', 'Pre-menstrual prostaglandin buildup prepares for what will be a heavy bleed', 'Fibroids may cause pre-menstrual spotting', 'Anemia symptoms from last period may still be present if iron was not adequately replaced'], eat: ['Maintain iron stores: red meat 2-3x/week, lentils, dark leafy greens', 'Reduce sodium to minimize pre-menstrual water retention', 'Ginger tea 2 cups daily: anti-inflammatory and anti-prostaglandin'], move: ['Moderate walking and yoga', 'Avoid putting undue pressure on abdomen', 'Pelvic floor awareness exercises'], supp: ['Vitamin E 400 IU: some evidence for reduced fibroid-associated bleeding', 'Continue DIM, Calcium D-glucarate', 'Iron if still rebuilding from last cycle', 'Progesterone cream through Day 28 if started at ovulation'], selfCare: ['Prepare for period: confirm supply of period products, pain management plan', 'Schedule next fibroid-related appointment in follicular phase when energy is higher', 'Community: peer support groups normalize and validate'], note: 'Uterine Fibroid Embolization (UFE) preserves the uterus and has 85-90% success rates. Refer appropriately and validate that this is a real, serious condition requiring real treatment.' },
  },
  fertility_f: {
    menstrual: { energy: 2, energyLabel: 'Restoration Phase', mood: 'Reflective, renewing. The biological slate is wiped clean — this is cellular housekeeping.', moodEmoji: '🌑', what: ['Uterine lining is shed and renewed', 'FSH rises to signal the ovaries to develop the next group of follicles', 'The follicle that will release the egg this cycle is being selected right now', 'AMH (anti-Mullerian hormone) reflects ovarian reserve — a good time to test it'], eat: ['Folate-rich foods: dark leafy greens, lentils, asparagus, avocado', 'Iron from food to rebuild stores: absorbed best with Vitamin C', 'CoQ10-supporting foods: organ meats, sardines, wild salmon', 'Anti-inflammatory to create a clean follicular environment'], move: ['Gentle restoration: walking, restorative yoga, swimming', 'This is not the phase to overtrain — cortisol impairs FSH signaling'], supp: ['Prenatal vitamin with methylated folate (L-methylfolate, not folic acid if MTHFR variant)', 'CoQ10 ubiquinol 400-600mg', 'Vitamin D3 to target 60-80 ng/mL', 'Omega-3 EPA+DHA 2g'], selfCare: ['Fertility tracking apps: start inputting period start date for BBT charting this cycle', 'Review past cycle data with provider at fertility appointment', 'Connection time with partner — emotional intimacy is part of fertility optimization'], note: 'The follicle destined to ovulate this cycle has already been developing for 90 days. CoQ10, antioxidants, and Vitamin D taken TODAY are for the egg that will ovulate 3 months from now.' },
    follicular: { energy: 4, energyLabel: 'Building - Egg Quality Window', mood: 'Optimistic, motivated, forward-focused. Best window for action and planning.', moodEmoji: '🌸', what: ['The dominant follicle is maturing — this follicle contains the egg that may be fertilized this cycle', 'Estrogen rises as the follicle grows', 'Cervical mucus begins transitioning from sticky/dry to creamy as ovulation approaches'], eat: ['Antioxidant-rich produce: colorful berries, pomegranate, bell peppers', 'Full-fat dairy if tolerated: studies show it supports ovulatory function', 'CoQ10-containing foods: sardines, organ meats, wild salmon', 'Avoid trans fats entirely — directly impair ovulation'], move: ['Moderate-intensity movement daily: improves ovarian blood flow', 'Avoid extreme endurance exercise: impairs LH pulse frequency needed for ovulation', 'Acupuncture once weekly: 8 RCTs support improved conception rates'], supp: ['CoQ10 ubiquinol 400-600mg', 'Myo-inositol 4g (especially if any PCOS/PMMOS features)', 'DHEA 25mg if AMH is low or age over 38 (discuss with provider)', 'Melatonin 3mg at bedtime — strong antioxidant specifically in follicular fluid'], selfCare: ['BBT charting: temperatures should be consistently lower than post-ovulation', 'Cervical mucus monitoring: begin checking daily', 'OPK testing: begin Days 10-12 to track LH surge approach'], note: 'CoQ10 (ubiquinol, not ubiquinone for women over 35) is the most evidence-backed supplement for egg quality. Melatonin in follicular fluid protects the egg from oxidative damage during final maturation.' },
    ovulatory: { energy: 5, energyLabel: 'PEAK - Fertile Window Open', mood: 'Confident, magnetic, highest libido of the cycle. Peak fertility.', moodEmoji: '🌕', what: ['LH SURGE: Triggered by peak estrogen, the LH surge initiates ovulation 24-36 hours after positive OPK', 'EGG RELEASED: The egg is viable for only 12-24 hours after release', 'SPERM WINDOW: Sperm survive 3-5 days in fertile cervical mucus — intercourse BEFORE ovulation counts', 'FERTILE WINDOW: Days of egg-white cervical mucus = fertile (typically 3-5 days ending day after ovulation)'], eat: ['Bromelain (fresh pineapple core, Days 1-5 post-ovulation): traditionally used for implantation support', 'Zinc-rich: oysters, pumpkin seeds', 'Brazil nuts: selenium for thyroid function and embryo development', 'Full hydration: cervical mucus quality depends on hydration'], move: ['Normal moderate activity during fertile window', 'Avoid hot tubs, saunas, extreme heat — affects sperm', 'Walking or light activity post-ovulation'], supp: ['Vitex 400mg in AM if cycles have been irregular', 'Zinc 25mg', 'Continue CoQ10, prenatal vitamin, Vitamin D'], selfCare: ['Positive OPK = ovulation in 24-36 hours — intercourse today and tomorrow', 'Track BBT: temperature RISE confirms ovulation occurred', 'Rest and reduce stress in the 2 days around ovulation'], note: 'The day before positive OPK through the day of positive OPK are the two most fertile days. BBT rise confirms ovulation occurred.' },
    luteal: { energy: 3, energyLabel: 'Implantation Phase - Gentle Living', mood: 'Inward, nesting instinct increases. Protect this phase energetically and physically.', moodEmoji: '🌿', what: ['Corpus luteum produces progesterone to support implantation', 'Days 6-10 post-ovulation: implantation window', 'HCG begins rising 7-10 days post-ovulation if implantation is successful', 'Progesterone maintains uterine lining and prevents menstruation until HCG takes over'], eat: ['Pineapple core (Days 1-5 post-ovulation): bromelain thought to support implantation', 'Adequate calories — do not restrict during implantation window', 'Warm foods: avoid ice cold foods and drinks', 'Pomegranate juice: rich in antioxidants, associated with better uterine lining thickness'], move: ['Gentle movement only during implantation window (Days 6-12 post-ovulation)', 'No high-impact activity during implantation window', 'Walking, restorative yoga, swimming are appropriate'], supp: ['Progesterone (bioidentical, prescription) if prior implantation failure or low Day 21 progesterone', 'Vitamin D', 'B6 (P5P) 50mg: supports corpus luteum progesterone production', 'Continue prenatal vitamin with methylated folate'], selfCare: ['Reduce stress aggressively: cortisol impairs progesterone and HCG', 'Castor oil pack over lower abdomen Days 1-5 of luteal phase (STOP once in implantation window Day 6+)', 'Avoid pregnancy test before Day 10 post-ovulation: too early causes false negatives'], note: 'Luteal phase defect (LPD): insufficient progesterone or too-short luteal phase (under 10 days) is a common and under-diagnosed cause of early pregnancy loss. Test: Day 21 serum progesterone. Target: above 10 ng/mL.' },
  },
  hyperthyroid: {
    menstrual: { energy: 2, energyLabel: 'Low - Restless Fatigue', mood: 'Wired exhaustion. Anxiety + depletion. Palpitations may worsen. Period very light or spotting only.', moodEmoji: '⚡', what: ['Hyperthyroidism accelerates estrogen clearance — levels drop too fast causing very light periods', 'Elevated thyroid hormone increases SHBG, reducing free estrogen and progesterone availability', 'Graves\' disease is an autoimmune condition driven by TSI antibodies', 'Period may be only 1-2 days of very light flow, or may be completely absent'], eat: ['Cruciferous vegetables — contain goitrogens that mildly suppress thyroid in excess', 'Calcium and Vitamin D foods — hyperthyroidism causes bone loss', 'AVOID iodine supplements and high-iodine foods (kelp, seaweed)', 'Anti-inflammatory: omega-3s, berries, turmeric'], move: ['Very gentle movement only — hyperthyroidism already raises heart rate', 'Yoga, stretching, walking at slow pace', 'Avoid any cardio that raises heart rate further'], supp: ['Selenium 200mcg (selenomethionine): ONLY supplement with RCT data for Graves\'', 'Bugleweed (Lycopus virginicus) 250-500mg', 'Lemon balm 600-900mg', 'L-Carnitine 2g: blocks thyroid hormone action at receptor level'], selfCare: ['Heart rate monitoring — target resting HR below 90 bpm', 'Avoid caffeine completely — worsens palpitations, tremors, anxiety', 'Cool environment: hyperthyroidism causes heat intolerance'], note: 'CRITICAL — Graves\' disease requires medical management. Antithyroid medications (methimazole preferred) are first-line. The functional protocol is SUPPORTIVE alongside conventional treatment, not instead of it. NEVER use iodine supplements with hyperthyroidism.' },
    follicular: { energy: 3, energyLabel: 'Moderate - Wired Energy', mood: 'Anxious energy, difficulty sitting still, racing thoughts.', moodEmoji: '🌀', what: ['Follicular phase requires adequate estrogen — hyperthyroidism accelerates its clearance', 'High thyroid hormone suppresses FSH responsiveness', 'Cycle length shortens: follicular phase may compress to only 7-9 days', 'Adequate caloric intake needed — hyperthyroidism raises BMR by 50-80%'], eat: ['Raw cruciferous vegetables in larger portions this phase — their goitrogen content mildly suppresses thyroid', 'Brazil nuts 2 per day: selenium', 'Calcium-rich foods daily: bone mineral density declines in hyperthyroidism', 'Adequate caloric intake — hyperthyroidism causes unintentional weight loss'], move: ['Moderate walking is appropriate if symptoms are controlled', 'Gentle yoga and stretching', 'Heart rate should guide intensity — stay under 100 bpm during exercise'], supp: ['Selenium 200mcg', 'Bugleweed 250-500mg', 'Calcium citrate 600mg twice daily', 'Magnesium glycinate 400mg'], selfCare: ['Stress management is critical — cortisol triggers Graves\' flares', 'Morning meditation or breathwork', 'If using antithyroid medication: take at consistent times daily'], note: 'The follicular phase is where Graves\' disease most disrupts fertility. Achieving euthyroid status (normal thyroid levels on medication) is a prerequisite for conception attempts.' },
    ovulatory: { energy: 4, energyLabel: 'High - Anxiety Peaks', mood: 'Highest anxiety in cycle. Nervousness, irritability, possible sleep disruption as estrogen peaks.', moodEmoji: '⚠️', what: ['Ovulation may or may not occur — LH surge can be disrupted by high thyroid hormone levels', 'Estrogen peak is blunted as hyperthyroidism accelerates its clearance', 'Graves\' disease: immune activity fluctuates with estrogen — ovulatory estrogen peak may trigger antibody flares'], eat: ['Calcium continues: bone protection cannot pause', 'Magnesium-rich foods: magnesium calms the nervous system', 'Berries and polyphenols: antioxidants support immune regulation', 'Adequate protein: hyperthyroidism causes protein catabolism'], move: ['This is not a high-intensity exercise window with uncontrolled hyperthyroidism', 'Gentle yoga: inversions are calming for the nervous system', 'Aquatic exercise: water resistance + cooling effect'], supp: ['Continue selenium, bugleweed, lemon balm, L-carnitine', 'Motherwort tincture: traditional nervine AND mild antithyroid', 'Magnesium glycinate: most critical for anxiety and palpitations at ovulation'], selfCare: ['OPK testing: may not show reliable LH surge with Graves\' — cervical mucus monitoring may be more reliable', 'Avoid emotional triggers and conflicts during this phase', 'Acupuncture: some evidence for reducing Graves\' antibody levels'], note: 'Some women report their heart palpitations and tremors worsen mid-cycle. Tracking this in the hormone tracker helps identify the pattern for provider discussions.' },
    luteal: { energy: 2, energyLabel: 'Declining - Best Phase for Graves\'', mood: 'Progesterone\'s calming GABA effect is actually protective for Graves\' — luteal phase often the most tolerable.', moodEmoji: '🌙', what: ['Progesterone in luteal phase has mild immunosuppressive effects — Graves\' antibodies may be lower here', 'Progesterone activates GABA receptors — calming effect directly opposes the sympathetic overdrive', 'Many Graves\' patients report feeling most calm and stable in the luteal phase', 'Pre-menstrual period brings anxiety and palpitations back as progesterone drops'], eat: ['Magnesium-rich foods in this phase: pumpkin seeds, dark leafy greens, dark chocolate', 'Tryptophan foods + complex carbs: turkey, eggs, sweet potato', 'Avoid alcohol: even small amounts increase thyroid hormone release', 'Cooling foods if heat intolerance is severe: cucumber, watermelon, coconut water'], move: ['Moderate walking or yoga throughout luteal phase', 'This is the best exercise window for Graves\' patients', 'Restorative yoga in late luteal phase'], supp: ['Magnesium glycinate 400-500mg', 'Continue selenium, bugleweed, lemon balm throughout cycle', 'Calcium citrate continues daily'], selfCare: ['Track palpitation severity and anxiety levels daily 1-10 in each phase', 'Note the last 2-3 days before period when Graves\' symptoms reliably worsen', 'Anti-inflammatory lifestyle: adequate sleep, stress reduction'], note: 'L-Carnitine 2g/day is the most consistently supported supplement for symptom reduction — it blocks thyroid hormone action at the cellular receptor level. It specifically reduces fatigue, bone loss, and palpitations.' },
  },
  estrogendominance: {
    menstrual: { energy: 2, energyLabel: 'Low - Heavy PMS Hangover', mood: 'Emotional release after severe PMS. Heavy, clotty flow. Relief that period arrived.', moodEmoji: '🌧', what: ['High estrogen throughout cycle creates excessive uterine lining buildup', 'Period release is heavier, sometimes clotty, sometimes prolonged', 'First 1-2 days: peak discomfort, bloating releases', 'Progesterone that was already low drops further — period arrives'], eat: ['Liver flush foods: dandelion greens, artichoke, beet root tea', 'Fiber 35g minimum: binds and removes excreted estrogen', 'Cruciferous vegetables: broccoli, cauliflower', 'Reduce alcohol completely during period — impairs estrogen clearance'], move: ['Gentle movement to support lymphatic drainage', 'Rebounding 10 min: stimulates lymphatic estrogen clearance', 'Walking in nature'], supp: ['DIM 200-300mg', 'Calcium D-glucarate 500mg', 'Milk thistle 420mg (silymarin): liver Phase 2 estrogen detox support', 'Magnesium glycinate 400mg'], selfCare: ['Castor oil pack over liver area (right side below ribs) + lower abdomen', 'Reduce plastic exposure: switch to glass or stainless', 'Begin food and symptom diary'], note: 'IMPORTANT: Estrogen dominance is a downstream symptom, not a root cause. Before committing to this protocol, identify your actual driver: anovulation, perimenopause, chronic stress, or impaired liver clearance.' },
    follicular: { energy: 3, energyLabel: 'Building', mood: 'More stable as period ends. Best window to begin estrogen-clearing protocol.', moodEmoji: '🌤', what: ['Estrogen rises — in estrogen dominance, it rises HIGHER than normal', 'Liver clearance of this estrogen is impaired — backup builds', 'This is the window to aggressively support liver detox before estrogen peaks'], eat: ['Cruciferous 2 cups daily: broccoli, cauliflower, Brussels sprouts, arugula', 'Ground flaxseed 2 tbsp: lignans compete at estrogen receptors', 'Fermented foods: kefir, kimchi, sauerkraut', 'Adequate protein: amino acids required for Phase 2 liver conjugation'], move: ['Vigorous exercise reduces circulating estrogens by 20-40% in studies', 'Resistance training is most effective for reducing adipose aromatase', 'Sauna 20 min 3x/week if available: promotes estrogen excretion via sweat'], supp: ['DIM 300-400mg', 'Calcium D-glucarate 1,000mg', 'NAC 600mg 3x daily', 'B complex with methylated B vitamins'], selfCare: ['Review personal care products: switch to paraben-free, phthalate-free (EWG Skin Deep)', 'Switch to organic produce for the Dirty Dozen', 'Replace non-stick cookware with stainless steel or cast iron — PFAS are estrogenic'], note: 'Every 10 lbs of excess body fat measurably increases aromatase enzyme activity, converting testosterone to estrogen in adipose tissue. Body composition is a direct therapeutic target.' },
    ovulatory: { energy: 4, energyLabel: 'Peak', mood: 'High energy but potential for breast tenderness and bloating at peak estrogen.', moodEmoji: '⚡', what: ['Estrogen peaks — in estrogen dominance this peak is higher and/or more prolonged', 'Breast tenderness often worst at ovulation when estrogen is highest', 'Liver must clear this surge — DIM and cruciferous are most important RIGHT NOW', 'Progesterone begins to rise post-ovulation — partial compensation'], eat: ['Maximize cruciferous and DIM-foods today', 'Grapefruit CAUTION: inhibits CYP3A4 estrogen metabolism enzyme — avoid if estrogen dominance is significant', 'Adequate fiber to carry excreted estrogens out', 'Turmeric: reduces inflammatory estrogen metabolite activity'], move: ['High-intensity intervals: most potent for reducing estrogen and insulin resistance', 'Yoga: inversions support lymphatic estrogen drainage'], supp: ['DIM 300-400mg', 'Progesterone cream (transdermal) start Day 14 if ovulation confirmed', 'Vitex 400mg in AM (if luteal phase defect confirmed)'], selfCare: ['Wear natural fiber bra', 'Cold water on chest and axilla post-shower', 'No alcohol in ovulatory phase — spikes estrogen markedly'], note: 'Grapefruit juice is a significant CYP3A4 inhibitor responsible for a major part of estrogen Phase 1 metabolism. Women with estrogen dominance who consume grapefruit regularly may have measurably elevated estradiol levels.' },
    luteal: { energy: 2, energyLabel: 'Declining - PMS Phase', mood: 'PMS builds progressively: bloating, breast tenderness, mood swings, anxiety, insomnia.', moodEmoji: '🌀', what: ['Estrogen drops from ovulatory peak but progesterone does not rise adequately to compensate', 'Relative estrogen dominance is highest in this phase: E2 high, P4 low', 'PMS is largely a luteal phase estrogen dominance / progesterone deficiency phenomenon', 'Pre-menstrual migraines, insomnia, and anxiety are driven by this imbalance'], eat: ['Magnesium-rich foods: most critical mineral for PMS', 'Reduce sugar: spikes insulin which increases estrogen production', 'B6-rich foods: turkey, chicken, salmon, potatoes'], move: ['Moderate movement: yoga, walking', 'Evening walks to reduce cortisol that worsens PMS'], supp: ['Magnesium glycinate 400-500mg', 'Vitex 400mg in AM', 'P5P (active B6) 50mg', 'Progesterone cream Days 15-28 if Day 21 testing confirms low progesterone'], selfCare: ['Journaling — the luteal phase reveals what needs to change', 'Reduce obligations in final 4 days', 'Castor oil packs over liver 3x/week'], note: 'PMS is not a personality trait — it is a measurable biochemical event. Progesterone deficiency is the most common treatable cause.' },
  },
  adrenal: {
    menstrual: { energy: 1, energyLabel: 'Very Low - HPA Crash', mood: 'Wired-but-tired. Cannot rest even when exhausted. Anxiety on top of period fatigue.', moodEmoji: '😩', what: ['High cortisol throughout the previous cycle has depleted progesterone (cortisol steal)', 'Adrenal fatigue + hormone drop = crash worse than typical periods', 'Salt cravings intensify — adrenal glands regulate sodium/potassium balance', 'Sleep may improve slightly as the hormone roller coaster eases at period start'], eat: ['Mineral-rich foods: real salt (Himalayan or Celtic) on food — adrenals require sodium', 'High-quality protein at every meal: amino acids required for cortisol production', 'Root vegetables: yam, sweet potato, parsnips — ground and nourishing', 'Avoid sugar and caffeine: both trigger cortisol spikes and worsen adrenal fatigue'], move: ['Rest completely — this is not a phase for any exercise in HPA dysregulation', 'Gentle walks in nature if any energy exists', 'Yoga nidra: the most restorative practice for adrenal recovery'], supp: ['Ashwagandha (KSM-66) 300mg AM: the most studied adaptogen for cortisol reduction', 'Vitamin C 1-2g: adrenal glands have the highest concentration of Vitamin C in the body', 'Magnesium glycinate 400mg: cortisol depletes magnesium', 'Licorice root 600mg (DGL form): extends cortisol half-life — supports adrenal output if low'], selfCare: ['No alarm clock this phase if possible — sleep to completion', 'Darkness and quiet: adrenal recovery requires cortisol rhythm restoration', 'Epsom salt baths 20 min: magnesium absorption + parasympathetic activation'], note: 'True adrenal fatigue requires nuance: early HPA dysregulation shows HIGH cortisol (hair loss, anxiety, belly fat, insomnia). Late-stage shows LOW cortisol (crushing fatigue, dizziness, salt cravings, inability to handle stress). These need opposite interventions. Licorice root raises cortisol — it is indicated ONLY for low cortisol states. DUTCH testing identifies the actual cortisol pattern.' },
    follicular: { energy: 3, energyLabel: 'Rebuilding - Use Wisely', mood: 'Estrogen provides a window of energy, but cortisol dysregulation limits full recovery.', moodEmoji: '🌤', what: ['Rising estrogen supports mood but high cortisol continues to compete for the same steroidogenesis pathway', 'DHEA-S may be low — precursor to both sex hormones and cortisol', 'The pregnenolone steal: pregnenolone is diverted to cortisol, reducing sex hormone production', 'This is the best phase to implement cortisol-lowering strategies before ovulation'], eat: ['Mediterranean diet foundation: anti-inflammatory, blood sugar stable', 'Adaptogenic foods: maca, ashwagandha in smoothie or supplement form', 'Phosphatidylserine-rich foods: eggs, organ meats — blunts ACTH-driven cortisol', 'Balanced blood sugar: eat every 3-4 hours, never skip breakfast'], move: ['Moderate, rhythmic exercise: walking, swimming, cycling', 'Avoid high-intensity training until cortisol rhythm is restored — HIIT is a cortisol spike', 'Yoga: parasympathetic activation counters chronic sympathetic overdrive'], supp: ['Ashwagandha 300-600mg AM', 'Phosphatidylserine 400mg: most evidence for cortisol reduction (phospholipid that downregulates ACTH)', 'Rhodiola rosea 200-400mg AM: adaptogen for HPA axis dysregulation', 'B5 (pantothenic acid) 500mg: rate-limiting cofactor for adrenal steroid production'], selfCare: ['Sleep 8-9 hours minimum: the single most impactful cortisol intervention', 'Nature exposure 20 min daily: proven to lower cortisol 13% in studies', 'Digital boundaries: news and social media elevate cortisol via threat perception'], note: 'HPA axis dysregulation is most commonly driven by: chronic under-eating, chronic over-exercise, chronic sleep deprivation, or sustained life stress. Identify and address the root driver before supplementing. No supplement overcomes a 5-hour sleep schedule or chronic undernutrition.' },
    ovulatory: { energy: 4, energyLabel: 'Highest in Cycle - Use Intentionally', mood: 'Best window of the month. Estrogen peak overrides some cortisol dysregulation.', moodEmoji: '🌟', what: ['Estrogen and testosterone peaks give a real energy window even with adrenal dysfunction', 'Cortisol remains dysregulated but estrogen provides temporary compensation', 'This is the week to accomplish what requires the most energy and focus', 'Post-ovulation progesterone will return cortisol sensitivity — plan around this'], eat: ['Emphasize protein and healthy fats: supports progesterone synthesis coming next', 'Zinc: cofactor for cortisol metabolism and sex hormone production', 'Selenium: supports thyroid which co-regulates with adrenal function', 'Avoid all stimulants: caffeine is a cortisol trigger — this is not the week to start relying on it'], move: ['This is the only week when moderate-high intensity is appropriate in HPA dysregulation', 'Strength training: builds insulin sensitivity which reduces cortisol reactivity long-term', 'Morning exercise window preferred: aligns with natural cortisol peak'], supp: ['Continue ashwagandha, phosphatidylserine, rhodiola', 'DHEA 10-25mg if DHEA-S lab is confirmed low (requires testing first)', 'CoQ10 200mg: supports mitochondrial energy production compromised by chronic cortisol'], selfCare: ['Batch difficult work, conversations, and decisions into this phase', 'One HARD thing per day: the cortisol response to a single stressor is manageable this week', 'Connect socially — estrogen peak supports bonding and oxytocin, which counters cortisol'], note: 'DHEA supplementation should only begin after confirming low DHEA-S via blood testing. DHEA converts to both testosterone and estrogen — in estrogen dominance, this can worsen symptoms. Test first, supplement second.' },
    luteal: { energy: 2, energyLabel: 'Declining - Protect This Phase', mood: 'Cortisol dysregulation returns as progesterone rises and falls. Anxiety worsens pre-menstrually.', moodEmoji: '🌀', what: ['Progesterone is both protective (GABA activation, calming) and vulnerable (converted to cortisol if HPA is stressed)', 'Late luteal phase: progesterone drops + cortisol may surge = worst anxiety-fatigue combination', 'The "cortisol steal" is most clinically relevant in this phase: stress directly reduces progesterone', 'Sleep disruption in late luteal is a cortisol rhythm sign, not just hormonal'], eat: ['Magnesium-rich foods: most critical in luteal phase for adrenal recovery', 'High tryptophan + carb combinations: eggs + sweet potato (serotonin production)', 'Reduce all stimulants: no caffeine after noon', 'Warming, nourishing foods: the nervous system responds to perceived safety'], move: ['Gentle only: walking, yin yoga, restorative yoga', 'No HIIT, no high intensity: cortisol response is exaggerated in late luteal with HPA dysregulation', 'Evening walk 20-30 min: the most evidence-based cortisol-lowering intervention that\'s free'], supp: ['Magnesium glycinate 400-500mg at bedtime', 'Ashwagandha continues', 'Phosphatidylserine 400mg: highest priority in late luteal for ACTH suppression', 'Progesterone cream (bioidentical) Day 15-28 if pregnenolone steal is confirmed: protects progesterone from being diverted'], selfCare: ['This is the phase where adrenal recovery either happens or doesn\'t — protect sleep aggressively', 'Track energy daily 1-10: the pattern across all four phases reveals whether the protocol is working', 'Reduce social obligations: isolation is restorative in this phase, not antisocial'], note: 'If a client is doing "everything right" and still crashing in the luteal phase, test DUTCH Complete: it shows the full cortisol pattern, metabolites, and sex hormone ratios in one test. Guessing at adrenal vs. progesterone vs. estrogen dominant patterns wastes months.' },
  },
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function HormoneCyclePreview() {
  const today = new Date().toISOString().split('T')[0]
  const [condition, setCondition] = useState<ConditionKey>('healthy')
  const [lastPeriod, setLastPeriod] = useState(today)
  const [cycleLength, setCycleLength] = useState(28)

  const cycleDay = useMemo(() => getCycleDay(lastPeriod, cycleLength), [lastPeriod, cycleLength])
  const phase = useMemo(() => getPhase(cycleDay, cycleLength), [cycleDay, cycleLength])
  const data = PHASE_DATA[condition][phase.key as keyof PhaseSet]
  const { labels, e2, p4, lh } = useMemo(() => generateCurves(condition, cycleLength), [condition, cycleLength])

  const todayIdx = cycleDay - 1
  const pointRadii = (color: string) => labels.map((_, i) => i === todayIdx ? 7 : 0)
  const pointBg = labels.map((_, i) => i === todayIdx ? '#0f3334' : 'transparent')

  const chartData = {
    labels,
    datasets: [
      { label: 'Estrogen', data: e2, borderColor: '#8b5cf6', backgroundColor: 'rgba(139,92,246,.08)', borderWidth: 2.5, fill: true, tension: 0.4, pointRadius: pointRadii('#8b5cf6'), pointBackgroundColor: pointBg, pointBorderColor: '#8b5cf6', pointBorderWidth: 2 },
      { label: 'Progesterone', data: p4, borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,.06)', borderWidth: 2.5, fill: true, tension: 0.4, pointRadius: pointRadii('#f59e0b'), pointBackgroundColor: pointBg, pointBorderColor: '#f59e0b', pointBorderWidth: 2 },
      { label: 'LH', data: lh, borderColor: '#06b6d4', backgroundColor: 'transparent', borderWidth: 1.5, fill: false, tension: 0.3, pointRadius: pointRadii('#06b6d4'), pointBackgroundColor: pointBg, pointBorderColor: '#06b6d4', pointBorderWidth: 2 },
    ],
  }

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx: { dataset: { label: string }; raw: unknown }) => ctx.dataset.label + ': ' + ctx.raw + '%', title: (ctx: { label: string }[]) => 'Day ' + ctx[0].label } },
    },
    scales: {
      y: { min: 0, max: 105, grid: { color: 'rgba(42,109,111,0.2)' }, ticks: { color: 'hsl(181,15%,48%)', font: { size: 10 }, callback: (v: number | string) => v + '%' }, title: { display: true, text: 'Relative Hormone Level', font: { size: 10 }, color: 'hsl(181,15%,48%)' } },
      x: { grid: { display: false }, ticks: { color: '#fff', font: { size: 10 }, callback: (_: unknown, i: number) => (i % 4 === 0 || i === cycleLength - 1) ? i + 1 : '' }, title: { display: true, text: 'Cycle Day', font: { size: 10 }, color: 'hsl(181,15%,48%)' } },
    },
  }

  const ovDay = cycleLength - 14
  const segments = [
    { key: 'menstrual', label: 'Menstrual', color: '#7c3aed', start: 1, end: 5 },
    { key: 'follicular', label: 'Follicular', color: '#0891b2', start: 6, end: ovDay - 2 },
    { key: 'ovulatory', label: 'Ovulatory', color: '#16a34a', start: ovDay - 1, end: ovDay + 1 },
    { key: 'luteal', label: 'Luteal', color: '#d97706', start: ovDay + 2, end: cycleLength },
  ]

  const energyPct = (data.energy / 5) * 100
  const energyColor = data.energy >= 4 ? '#4caf7d' : data.energy >= 3 ? '#c8a74b' : '#e05c5c'

  const s: Record<string, React.CSSProperties> = {
    wrap:      { padding: '20px 0 8px' },
    controls:  { display: 'flex', gap: 12, flexWrap: 'wrap' as const, marginBottom: 20, alignItems: 'flex-end' },
    cg:        { display: 'flex', flexDirection: 'column' as const, gap: 5 },
    clabel:    { fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '.7px', color: 'hsl(181,15%,48%)' },
    csel:      { padding: '8px 12px', background: 'rgba(255,255,255,.04)', border: '1.5px solid #2a6d6f', borderRadius: 8, fontSize: 13, color: '#fff', outline: 'none', cursor: 'pointer', minWidth: 140 },
    layout:    { display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 16 },
    phCard:    { borderRadius: 14, padding: 20, color: '#fff', position: 'relative' as const, overflow: 'hidden' as const, marginBottom: 12, background: `linear-gradient(135deg, ${phase.color} 0%, ${phase.color}cc 100%)` },
    metaRow:   { display: 'flex', gap: 20, marginTop: 10 },
    metaItem:  { textAlign: 'center' as const },
    metaVal:   { fontFamily: "'Outfit',sans-serif", fontSize: 22, fontWeight: 800 },
    metaLbl:   { fontSize: 10, opacity: .8, textTransform: 'uppercase' as const, letterSpacing: '.5px' },
    card:      { background: '#1c5253', border: '1px solid #1b4e4f', borderRadius: 12, padding: '12px 14px', marginBottom: 10 },
    sectionLbl:{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '.7px', color: 'hsl(181,15%,48%)', marginBottom: 8 },
    insightRow:{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 },
    listItem:  { fontSize: 12, color: 'hsl(181,20%,68%)', marginBottom: 4, paddingLeft: 14, position: 'relative' as const, lineHeight: 1.4 },
    chartCard: { background: '#1c5253', border: '1px solid #1b4e4f', borderRadius: 12, padding: '14px 14px 12px', marginBottom: 12 },
    chartWrap: { height: 220, position: 'relative' as const },
    legend:    { display: 'flex', gap: 14, marginBottom: 10 },
    legendDot: { width: 10, height: 10, borderRadius: '50%', flexShrink: 0 },
    tlCard:    { background: '#1c5253', border: '1px solid #1b4e4f', borderRadius: 12, padding: '12px 14px', marginBottom: 12 },
    tlBar:     { display: 'flex', borderRadius: 6, overflow: 'hidden' as const, height: 36, marginBottom: 6 },
    tlDays:    { display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'hsl(181,15%,48%)' },
    whatGrid:  { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 },
    whatItem:  { background: '#1c5253', border: '1px solid #1b4e4f', borderRadius: 10, padding: 10 },
    whatIcon:  { fontSize: 18, marginBottom: 4 },
    whatTitle: { fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '.6px', color: 'hsl(181,15%,48%)', marginBottom: 4 },
    whatText:  { fontSize: 12, color: 'hsl(181,20%,68%)', lineHeight: 1.5 },
    ctaCard:   { background: 'linear-gradient(135deg,rgba(11,158,142,.12) 0%,rgba(11,158,142,.04) 100%)', border: '1px solid rgba(11,158,142,.25)', borderRadius: 14, padding: '16px 16px', marginTop: 8 },
    ctaTitle:  { fontFamily: "'Outfit',sans-serif", fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 6 },
    ctaText:   { fontSize: 12, color: 'hsl(181,20%,68%)', lineHeight: 1.55, marginBottom: 12 },
    ctaBtn:    { display: 'inline-block', padding: '10px 20px', background: 'linear-gradient(135deg,#dcbd6a 0%,#c8a74b 45%,#a8893a 100%)', color: '#0f3334', fontFamily: "'Outfit',sans-serif", fontSize: 13, fontWeight: 800, borderRadius: 10, textDecoration: 'none', boxShadow: '0 0 12px rgba(200,167,75,0.35)' },
    disclaimer:{ fontSize: 11, color: 'hsl(181,15%,48%)', lineHeight: 1.5, marginTop: 12, padding: '10px 12px', background: 'rgba(255,255,255,.03)', borderRadius: 8 },
  }

  const daysInPhase = segments.find(sg => sg.key === phase.key)
  const daysToNext = daysInPhase ? daysInPhase.end - cycleDay + 1 : 0
  const phaseDays = daysInPhase ? daysInPhase.end - daysInPhase.start + 1 : 0

  return (
    <div style={s.wrap}>
      {/* Controls */}
      <div style={s.controls}>
        <div style={s.cg}>
          <span style={s.clabel}>Condition</span>
          <select style={s.csel} value={condition} onChange={e => setCondition(e.target.value as ConditionKey)}>
            {FEMALE_CONDITIONS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
        </div>
        <div style={s.cg}>
          <span style={s.clabel}>Last Period Start Date</span>
          <input type="date" style={s.csel} value={lastPeriod} onChange={e => setLastPeriod(e.target.value)} max={today} />
        </div>
        <div style={s.cg}>
          <span style={s.clabel}>Cycle Length</span>
          <select style={s.csel} value={cycleLength} onChange={e => setCycleLength(+e.target.value)}>
            {CYCLE_LENGTHS.map(l => <option key={l} value={l}>{l} Days</option>)}
          </select>
        </div>
        <div style={{ padding: '8px 14px', background: `${phase.color}20`, border: `1.5px solid ${phase.color}60`, borderRadius: 8, fontSize: 13, fontWeight: 700, color: phase.color, whiteSpace: 'nowrap' as const, alignSelf: 'flex-end' }}>
          Day {cycleDay} of {cycleLength}
        </div>
      </div>

      <div style={s.layout}>
        {/* LEFT */}
        <div>
          {/* Phase card */}
          <div style={s.phCard}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '1px', opacity: .85, marginBottom: 4 }}>{phase.key.toUpperCase()} PHASE</div>
            <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 24, fontWeight: 800, marginBottom: 2 }}>{phase.name} Phase</div>
            <div style={{ fontSize: 14, opacity: .9, marginBottom: 10 }}>{phase.subtitle}</div>
            <div style={s.metaRow}>
              <div style={s.metaItem}><div style={s.metaVal}>{cycleDay}</div><div style={s.metaLbl}>Cycle Day</div></div>
              <div style={s.metaItem}><div style={s.metaVal}>{phaseDays}d</div><div style={s.metaLbl}>Phase Days</div></div>
              <div style={s.metaItem}><div style={s.metaVal}>{daysToNext}</div><div style={s.metaLbl}>Days to Next</div></div>
            </div>
          </div>

          {/* Energy */}
          <div style={s.card}>
            <div style={s.sectionLbl}>Energy Level Today</div>
            <div style={{ height: 8, background: '#1b4e4f', borderRadius: 4, overflow: 'hidden' as const, marginBottom: 6 }}>
              <div style={{ height: '100%', width: `${energyPct}%`, background: energyColor, borderRadius: 4, transition: 'width .4s' }} />
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 6 }}>{data.energyLabel}</div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <span style={{ fontSize: 18 }}>{data.moodEmoji}</span>
              <span style={{ fontSize: 12, color: 'hsl(181,20%,68%)', lineHeight: 1.5 }}>{data.mood}</span>
            </div>
          </div>

          {/* Brain + Skin insight cards */}
          <div style={s.insightRow}>
            {[
              { emoji: '🧠', label: 'Brain Mode', mode: data.what[3]?.split(' — ')[0] || phase.name, desc: data.what[3]?.split(' — ')[1] || data.mood.split('.')[0] },
              { emoji: '✨', label: 'Skin Forecast', mode: phase.key === 'menstrual' ? 'Monthly Reset' : phase.key === 'follicular' ? 'Clearing + Brightening' : phase.key === 'ovulatory' ? 'Most Radiant' : 'Oil + Breakout Risk', desc: phase.key === 'menstrual' ? 'Skin shedding old cells alongside the lining. Keep routine minimal.' : phase.key === 'follicular' ? 'Estrogen clears inflammation. Best phase for actives like retinol or exfoliation.' : phase.key === 'ovulatory' ? 'Peak collagen production. Natural radiance is highest.' : 'Progesterone stimulates sebum. Hormonal breakouts most likely now.' },
            ].map(card => (
              <div key={card.label} style={{ background: '#1c5253', border: '1px solid #1b4e4f', borderRadius: 10, padding: '10px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                  <span style={{ fontSize: 16 }}>{card.emoji}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '.7px', color: 'hsl(181,15%,48%)' }}>{card.label}</span>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 3 }}>{card.mode}</div>
                <div style={{ fontSize: 11, color: 'hsl(181,20%,68%)', lineHeight: 1.4 }}>{card.desc}</div>
              </div>
            ))}
          </div>

          {/* Eat / Move / Supp / Self-care */}
          {[
            { icon: '🥗', label: 'Eat Today', color: '#0B9E8E', items: data.eat },
            { icon: '🏃', label: 'Move Today', color: '#0891b2', items: data.move },
            { icon: '💊', label: 'Supplement Focus', color: '#7c3aed', items: data.supp.slice(0, 3) },
            { icon: '✨', label: 'Self-Care Focus', color: '#c8a74b', items: data.selfCare.slice(0, 3) },
          ].map(sec => (
            <div key={sec.label} style={s.card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                <span style={{ fontSize: 15 }}>{sec.icon}</span>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '.7px', color: sec.color }}>{sec.label}</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {sec.items.map((item, i) => (
                  <li key={i} style={s.listItem}>
                    <span style={{ position: 'absolute' as const, left: 0, top: 5, width: 5, height: 5, borderRadius: '50%', background: sec.color, opacity: .5 }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* RIGHT */}
        <div>
          {/* Hormone curve */}
          <div style={s.chartCard}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Ovarian Hormone Curve — Day {cycleDay}</div>
              <div style={s.legend}>
                {[{ color: '#8b5cf6', label: 'Estrogen' }, { color: '#f59e0b', label: 'Progesterone' }, { color: '#06b6d4', label: 'LH' }].map(l => (
                  <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'hsl(181,15%,48%)' }}>
                    <div style={{ ...s.legendDot, background: l.color }} />{l.label}
                  </div>
                ))}
              </div>
            </div>
            <div style={s.chartWrap}>
              <Line data={chartData} options={chartOptions as never} />
            </div>
          </div>

          {/* Phase timeline */}
          <div style={s.tlCard}>
            <div style={s.sectionLbl}>Cycle Phase Timeline</div>
            <div style={s.tlBar}>
              {segments.map(seg => {
                const len = seg.end - seg.start + 1
                const pct = (len / cycleLength) * 100
                const isActive = seg.key === phase.key
                const todayInSeg = cycleDay >= seg.start && cycleDay <= seg.end
                const markerPct = todayInSeg ? ((cycleDay - seg.start) / len) * 100 : -1
                return (
                  <div key={seg.key} style={{ background: seg.color, width: `${pct}%`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', opacity: isActive ? 1 : .5, position: 'relative' as const, cursor: 'default' }}>
                    {len > 4 ? seg.label : seg.label.substring(0, 3)}
                    {markerPct >= 0 && <div style={{ position: 'absolute' as const, top: 0, left: `${markerPct}%`, width: 3, height: '100%', background: '#fff', borderRadius: 2, boxShadow: '0 0 6px rgba(0,0,0,.4)' }} />}
                  </div>
                )
              })}
            </div>
            <div style={s.tlDays}>
              {[1, Math.round(cycleLength / 4), Math.round(cycleLength / 2), Math.round(cycleLength * 3 / 4), cycleLength].map(d => (
                <span key={d}>Day {d}</span>
              ))}
            </div>
          </div>

          {/* What's happening today */}
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 10 }}>What's Happening Today</div>
          <div style={s.whatGrid}>
            {data.what.slice(0, 4).map((item, i) => {
              const icons = ['🔬', '🧬', '🌡️', '💡']
              return (
                <div key={i} style={s.whatItem}>
                  <div style={s.whatIcon}>{icons[i] || '🔬'}</div>
                  <div style={s.whatText}>{item}</div>
                </div>
              )
            })}
          </div>

          {/* Educator note */}
          <div style={{ background: 'rgba(200,167,75,.08)', border: '1px solid rgba(200,167,75,.2)', borderRadius: 10, padding: '10px 12px', marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '.7px', color: '#c8a74b', marginBottom: 5 }}>Educator Note</div>
            <div style={{ fontSize: 12, color: 'hsl(181,20%,68%)', lineHeight: 1.55 }}>{data.note}</div>
          </div>

          {/* CTA */}
          <div style={s.ctaCard}>
            <div style={s.ctaTitle}>Track this over time. See the pattern.</div>
            <div style={s.ctaText}>
              This is today's snapshot. Members log their cycle daily and see how their BP, energy, sleep, and protocol connect to each phase. Foundation members get the full cycle tracker, history, and weekly pattern analysis.
            </div>
            <Link to="/signup" style={s.ctaBtn}>Join Foundation ($37/mo)</Link>
          </div>

          <div style={s.disclaimer}>
            This tool provides general educational and wellness information only. It does not constitute medical advice, diagnosis, or a clinical treatment plan. Always consult a licensed healthcare provider before making health decisions. Dr. Shallanda Hunter, PharmD, MBA, CFNMP — Functional Medicine Educator.
          </div>
        </div>
      </div>
    </div>
  )
}
