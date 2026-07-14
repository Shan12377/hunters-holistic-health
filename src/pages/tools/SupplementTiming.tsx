import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import s from './SupplementTiming.module.css'

const SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'MedicalWebPage',
      '@id': 'https://huntersholistichealth.com/tools/supplement-timing#webpage',
      url: 'https://huntersholistichealth.com/tools/supplement-timing',
      name: 'Supplement Timing Guide: When to Take What, and What Never to Combine',
      description: 'When to take common supplements for best absorption, which combinations to avoid, and absorption-boosting pairings, from a PharmD.',
      inLanguage: 'en-US',
      lastReviewed: '2026-07-14',
      reviewedBy: { '@type': 'Person', name: 'Dr. Shallanda Hunter, PharmD, CFNMP', jobTitle: 'Doctor of Pharmacy, Certified Functional Nutrition & Metabolism Practitioner' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'When should I take magnesium?',
          acceptedAnswer: { '@type': 'Answer', text: 'Magnesium is generally best in the evening, away from caffeine, because it supports the calming, parasympathetic side of the nervous system. Magnesium glycinate before bed suits sleep and muscle cramps. Avoid taking it with coffee, which can blunt the effect.' },
        },
        {
          '@type': 'Question',
          name: 'Can I take iron and calcium together?',
          acceptedAnswer: { '@type': 'Answer', text: 'No. Iron and calcium compete for absorption, so separate them by at least two hours. Take iron on an empty stomach with vitamin C for best absorption, and keep it away from coffee, tea, dairy and antacids. Both also block thyroid medication, so separate either from levothyroxine by four hours.' },
        },
        {
          '@type': 'Question',
          name: 'What supplements should never be taken together?',
          acceptedAnswer: { '@type': 'Answer', text: 'Common conflicting pairs include iron and calcium, zinc and copper in large amounts, and any mineral taken close to thyroid medication. Fat-soluble vitamins need dietary fat to absorb, and magnesium is better kept away from caffeine.' },
        },
        {
          '@type': 'Question',
          name: 'Do I need to take vitamin D with food?',
          acceptedAnswer: { '@type': 'Answer', text: 'Yes. Vitamin D is fat-soluble, so it absorbs best when taken with your largest, fattiest meal. The same applies to vitamins A, E and K and to CoQ10. Taking them on an empty stomach reduces how much you absorb.' },
        },
      ],
    },
  ],
}

const FAQS = [
  {
    q: 'When should I take magnesium?',
    a: 'Generally in the evening, away from caffeine, because magnesium supports the calming side of the nervous system. Magnesium glycinate before bed suits sleep and muscle cramps. Taking it with coffee can blunt the effect.',
  },
  {
    q: 'Can I take iron and calcium together?',
    a: 'No. They compete for absorption, so separate them by at least two hours. Take iron on an empty stomach with vitamin C, away from coffee, tea, dairy, and antacids. Both also block thyroid medication, so keep either at least four hours from levothyroxine.',
  },
  {
    q: 'What supplements should never be taken together?',
    a: 'Common conflicts include iron with calcium, large doses of zinc with copper, and any mineral taken close to thyroid medication. Fat-soluble vitamins need dietary fat, and magnesium is best kept away from caffeine. The Never Together section lists the exact spacing.',
  },
  {
    q: 'Does vitamin D need to be taken with food?',
    a: 'Yes. Vitamin D is fat-soluble and absorbs best with your largest, fattiest meal. The same is true for vitamins A, E and K and for CoQ10. On an empty stomach you absorb noticeably less.',
  },
]

export default function SupplementTiming() {
  const [openFaqs, setOpenFaqs] = useState<Set<number>>(new Set())

  useEffect(() => {
    document.title = 'Supplement Timing Guide: When to Take What | Hunter\'s Holistic Health'
    const desc = document.querySelector('meta[name="description"]')
    if (desc) {
      desc.setAttribute(
        'content',
        'Stop wasting supplements on bad timing. A PharmD guide to when to take magnesium, iron, vitamin D, B vitamins, and more. Which nutrients cancel each other out. The pairings that actually work.',
      )
    }
  }, [])

  function toggleFaq(i: number) {
    setOpenFaqs(prev => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  return (
    <div className={s.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }}
      />

      <nav className={s.nav}>
        <Link to="/" className={s.navLogo}>Hunter's Holistic Health</Link>
        <Link to="/join" className={s.navCta}>Join the Community</Link>
      </nav>

      <div className={s.seoIntro}>
        <div className={s.seoEyebrow}>PharmD Timing Reference · Companion to the Depletion Checker</div>
        <h1 className={s.seoH1}>Supplement Timing Guide: When to Take What, and What Never to Combine</h1>
        <p className={s.seoLede}>A good supplement taken at the wrong time, or next to a mineral that blocks it, can go from effective to pointless. Timing is not a detail here. It is often the difference between a supplement working and a supplement you are quietly flushing away.</p>
        <p className={s.seoBody}>This guide covers the five most common timing mistakes, a simple morning-to-night schedule, the pairs that cancel each other out, and the combinations that boost absorption. It pairs with the <Link to="/tools/medication-nutrient-checker">Medication Nutrient Depletion Checker</Link> and the food sources guide: find what your medications deplete, learn where to eat it, then use this page to take it correctly. Doses shown are general starting references only and are not a prescription; confirm your own needs with your prescriber or pharmacist.</p>
      </div>

      <div className={s.header}>
        <div className={s.headerInner}>
          <div className={s.headerEye}>PharmD Timing Reference</div>
          <h2 className={s.headerH2}>Stop Wasting Your Supplements. Timing Changes Everything.</h2>
          <p className={s.headerSub}>Most people take the right supplements wrong. A supplement taken at the wrong time, without the right cofactor, or alongside a mineral that blocks it can go from effective to irrelevant. Here is what actually matters and why.</p>
          <div className={s.headerBadge}>Dr. Shallanda Hunter, PharmD, CFNMP, Hunter's Holistic Health</div>
        </div>
      </div>

      <div className={s.chipNav}>
        <div className={s.chipNavScroll}>
          <a className={s.chip} href="#mistakes">5 Biggest Mistakes</a>
          <a className={s.chip} href="#schedule">Daily Schedule</a>
          <a className={s.chip} href="#conflicts">Never Together</a>
          <a className={s.chip} href="#boosters">Absorption Boosters</a>
          <a className={s.chip} href="#thyroid">Thyroid Med Rules</a>
          <a className={s.chip} href="#doses">Right Doses</a>
        </div>
      </div>

      <div className={s.main}>

        {/* MISTAKES */}
        <div id="mistakes" />
        <div className={s.opener}>
          <div className={s.openerLabel}>The 5 Timing Mistakes Most People Make Every Day</div>
          <p className={s.openerQuote}>"You change the timing, you change the results. Stop paying to deplete yourself faster."</p>
          <div className={s.mistakeList}>

            <div className={s.mistake}>
              <div className={s.mWrong}>
                <div className={s.mLabel}>What most people do</div>
                <div className={s.mText}>Take magnesium in the morning with their coffee</div>
                <div className={s.mWhy}>Caffeine is a magnesium antagonist. It actively flushes magnesium out of cells. You are paying to deplete yourself faster.</div>
              </div>
              <div className={s.mRight}>
                <div className={s.mLabel}>The fix</div>
                <div className={s.mText}>Magnesium glycinate or L-threonate in the evening, away from caffeine. Magnesium is parasympathetic. It belongs at night, not at 7am.</div>
              </div>
            </div>

            <div className={s.mistake}>
              <div className={s.mWrong}>
                <div className={s.mLabel}>What most people do</div>
                <div className={s.mText}>Take Vitamin D on an empty stomach, first thing in the morning</div>
                <div className={s.mWhy}>Vitamin D is fat-soluble. Without dietary fat present, you absorb a fraction of what you paid for.</div>
              </div>
              <div className={s.mRight}>
                <div className={s.mLabel}>The fix</div>
                <div className={s.mText}>Vitamin D3 with your largest, fattiest meal. Always paired with K2 (MK-7 form) to direct calcium into bone, not arteries.</div>
              </div>
            </div>

            <div className={s.mistake}>
              <div className={s.mWrong}>
                <div className={s.mLabel}>What most people do</div>
                <div className={s.mText}>Take zinc on an empty stomach</div>
                <div className={s.mWhy}>Zinc on an empty stomach causes nausea in the majority of people. Most people blame the supplement, not the timing.</div>
              </div>
              <div className={s.mRight}>
                <div className={s.mLabel}>The fix</div>
                <div className={s.mText}>Zinc with food, always. Never take zinc at the same time as iron or calcium (they compete for the same transporter).</div>
              </div>
            </div>

            <div className={s.mistake}>
              <div className={s.mWrong}>
                <div className={s.mLabel}>What most people do</div>
                <div className={s.mText}>Take iron with breakfast, next to their calcium supplement</div>
                <div className={s.mWhy}>Calcium blocks iron absorption by 50-60%. Taking them together cuts your iron dose in half. Coffee at the same time makes it worse.</div>
              </div>
              <div className={s.mRight}>
                <div className={s.mLabel}>The fix</div>
                <div className={s.mText}>Iron on an empty stomach with Vitamin C (dramatically increases absorption). Separate from calcium, coffee, and dairy by at least 2 hours.</div>
              </div>
            </div>

            <div className={s.mistake}>
              <div className={s.mWrong}>
                <div className={s.mLabel}>What most people do</div>
                <div className={s.mText}>Take fish oil at random, or in the morning before anything</div>
                <div className={s.mWhy}>Omega-3 oils absorb poorly without food enzymes to stabilize them. Morning fish oil also causes the fishy aftertaste that makes people stop using it.</div>
              </div>
              <div className={s.mRight}>
                <div className={s.mLabel}>The fix</div>
                <div className={s.mText}>Fish oil with your biggest meal of the day. Digestive enzymes emulsify the oil, improve absorption, and dramatically reduce the fishy aftertaste.</div>
              </div>
            </div>

          </div>
        </div>

        {/* DAILY SCHEDULE */}
        <div id="schedule" />
        <div className={s.sLabel}>When to Take What</div>
        <div className={s.secTitle}>Your Complete Daily Supplement Schedule</div>
        <p className={s.secSub}>Organized by when your body can actually use each supplement. Fat-soluble nutrients require fat. Stimulating nutrients belong in the morning. Calming nutrients belong at night.</p>

        <div className={s.timeGrid}>

          <div className={s.timeBlock}>
            <div className={s.tbHeader}>
              <div className={`${s.tbAccent} ${s.accWake}`} />
              <div className={s.tbIcon}>🌅</div>
              <div>
                <div className={s.tbTitle}>Wake — Before Food (Empty Stomach)</div>
                <div className={s.tbSub}>30–60 min before breakfast. Requires nothing in your stomach.</div>
              </div>
            </div>
            <div>
              <div className={s.tbRow}>
                <div>
                  <div className={s.tbName}>Thyroid Medication (Levothyroxine / Synthroid / Armour)</div>
                  <div className={s.tbNote}>Empty stomach, 30–60 min before food or coffee. Calcium, iron, magnesium, zinc, fiber, and antacids all block absorption. Separate by 4 hours.</div>
                  <div className={s.tbWhy}>Absorption drops 20–40% when taken with food or competing minerals.</div>
                </div>
                <div className={`${s.tbPriority} ${s.pCritical}`}>Critical</div>
              </div>
              <div className={s.tbRow}>
                <div>
                  <div className={s.tbName}>Iron (standard ferrous forms)</div>
                  <div className={s.tbNote}>Empty stomach + Vitamin C. Pair with 250–500mg Vitamin C to increase non-heme iron absorption. If nausea is a problem, switch to ferrous bisglycinate (can be taken with food).</div>
                  <div className={s.tbWhy}>Acid environment + Vitamin C converts Fe3+ to the more absorbable Fe2+ form. Food and calcium block this conversion.</div>
                </div>
                <div className={`${s.tbPriority} ${s.pImportant}`}>Important</div>
              </div>
              <div className={s.tbRow}>
                <div>
                  <div className={s.tbName}>Probiotics (most strains)</div>
                  <div className={s.tbNote}>30 min before breakfast on empty stomach, or before bed. Cold water is fine. Avoid hot liquids which kill live cultures. Spore-based strains (Bacillus coagulans) are acid-resistant and can be taken any time.</div>
                  <div className={s.tbWhy}>Stomach acid is lowest before food. Organisms have a better chance of surviving to reach the colon.</div>
                </div>
                <div className={`${s.tbPriority} ${s.pStandard}`}>Standard</div>
              </div>
            </div>
          </div>

          <div className={s.timeBlock}>
            <div className={s.tbHeader}>
              <div className={`${s.tbAccent} ${s.accMorning}`} />
              <div className={s.tbIcon}>☕</div>
              <div>
                <div className={s.tbTitle}>Breakfast — Morning With Food</div>
                <div className={s.tbSub}>Take with food to buffer absorption. Energizing nutrients belong in the morning.</div>
              </div>
            </div>
            <div>
              <div className={s.tbRow}>
                <div>
                  <div className={s.tbName}>B-Complex / B Vitamins (B1, B2, B3, B5, B6, B12, Folate)</div>
                  <div className={s.tbNote}>Morning with food. B vitamins are energizing. Evening B vitamins cause insomnia in sensitive individuals. Take B12 sublingual under the tongue for best absorption (bypasses gut issues from metformin or low stomach acid).</div>
                  <div className={s.tbWhy}>B vitamins are cofactors for mitochondrial energy production. You want that energy cycle running during the day, not disrupting sleep at night.</div>
                </div>
                <div className={`${s.tbPriority} ${s.pImportant}`}>Important</div>
              </div>
              <div className={s.tbRow}>
                <div>
                  <div className={s.tbName}>Vitamin C</div>
                  <div className={s.tbNote}>Morning with food. If also taking iron, take them together. Can split doses throughout the day as Vitamin C is water-soluble with a short half-life (~2 hours).</div>
                  <div className={s.tbWhy}>Water-soluble. Excess is excreted. Splitting doses maintains more consistent blood levels than one large dose.</div>
                </div>
                <div className={`${s.tbPriority} ${s.pStandard}`}>Standard</div>
              </div>
              <div className={s.tbRow}>
                <div>
                  <div className={s.tbName}>Collagen Peptides</div>
                  <div className={s.tbNote}>Morning with food and Vitamin C. Vitamin C is not optional here. It is a required cofactor for the enzymatic reactions that convert collagen peptides into structural collagen.</div>
                  <div className={s.tbWhy}>Prolyl hydroxylase and lysyl hydroxylase require Vitamin C as a cofactor. Collagen without Vitamin C is like building a wall without mortar.</div>
                </div>
                <div className={`${s.tbPriority} ${s.pStandard}`}>Standard</div>
              </div>
              <div className={s.tbRow}>
                <div>
                  <div className={s.tbName}>Methylfolate / Folate B9</div>
                  <div className={s.tbNote}>Morning with food. Especially critical for women of reproductive age or those on hormonal contraceptives or metformin.</div>
                  <div className={s.tbWhy}>Folate is used for DNA synthesis and repair throughout the day. Morning dosing aligns with daily metabolic demand.</div>
                </div>
                <div className={`${s.tbPriority} ${s.pStandard}`}>Standard</div>
              </div>
              <div className={s.tbRow}>
                <div>
                  <div className={s.tbName}>Iodine / Potassium Iodide</div>
                  <div className={s.tbNote}>With food, any time of day. Thyroid function is relatively constant throughout the day. Timing matters less than consistency.</div>
                  <div className={s.tbWhy}>Food reduces GI irritation from iodine supplementation.</div>
                </div>
                <div className={`${s.tbPriority} ${s.pOptional}`}>Flexible</div>
              </div>
            </div>
          </div>

          <div className={s.timeBlock}>
            <div className={s.tbHeader}>
              <div className={`${s.tbAccent} ${s.accFood}`} />
              <div className={s.tbIcon}>🍽️</div>
              <div>
                <div className={s.tbTitle}>With Your Largest or Fattiest Meal</div>
                <div className={s.tbSub}>Fat-soluble nutrients require dietary fat for absorption. This is non-negotiable.</div>
              </div>
            </div>
            <div>
              <div className={s.tbRow}>
                <div>
                  <div className={s.tbName}>Vitamin D3 + K2 (MK-7) — Take Together</div>
                  <div className={s.tbNote}>Always paired. D3 without K2 increases calcium absorption without ensuring it goes to bone. Take with meal containing eggs, avocado, olive oil, salmon, or nuts.</div>
                  <div className={s.tbWhy}>Vitamin D3 requires fat for micelle formation and lymphatic absorption. Studies show D3 absorption increases up to 32% with a fatty meal versus a fat-free meal.</div>
                </div>
                <div className={`${s.tbPriority} ${s.pCritical}`}>Critical</div>
              </div>
              <div className={s.tbRow}>
                <div>
                  <div className={s.tbName}>CoQ10 (Ubiquinol)</div>
                  <div className={s.tbNote}>With largest fatty meal. For statin users or those over 40, ubiquinol is the active form. Can split across two meals for higher doses (200mg+).</div>
                  <div className={s.tbWhy}>CoQ10 is highly lipophilic. Bioavailability from an empty stomach is less than 30% of fed-state absorption. Ubiquinol absorbs significantly better than ubiquinone.</div>
                </div>
                <div className={`${s.tbPriority} ${s.pCritical}`}>Critical</div>
              </div>
              <div className={s.tbRow}>
                <div>
                  <div className={s.tbName}>Omega-3 Fish Oil</div>
                  <div className={s.tbNote}>With biggest meal. Digestive enzymes emulsify the oil, improving absorption and eliminating fishy reflux. Refrigerate after opening to prevent oxidation.</div>
                  <div className={s.tbWhy}>Omega-3 fatty acids require bile salt emulsification for lymphatic absorption. Fatty meals maximally stimulate bile release.</div>
                </div>
                <div className={`${s.tbPriority} ${s.pImportant}`}>Important</div>
              </div>
              <div className={s.tbRow}>
                <div>
                  <div className={s.tbName}>Vitamin A (Retinol)</div>
                  <div className={s.tbNote}>With fat-containing meal. Only supplement if confirmed deficient. Vitamin A toxicity is possible with excess supplementation, unlike beta-carotene from food.</div>
                  <div className={s.tbWhy}>Fat-soluble retinol accumulates in the liver. Take with care and with fat for absorption.</div>
                </div>
                <div className={`${s.tbPriority} ${s.pStandard}`}>Standard</div>
              </div>
              <div className={s.tbRow}>
                <div>
                  <div className={s.tbName}>Vitamin E (Full Spectrum — all tocopherols + tocotrienols)</div>
                  <div className={s.tbNote}>With fat-containing meal. Must be full-spectrum. Isolated alpha-tocopherol blocks absorption of the other 7 Vitamin E forms and has been associated with increased cancer risk in studies on the synthetic version.</div>
                  <div className={s.tbWhy}>Alpha-tocopherol competes with and displaces gamma-tocopherol. Gamma and delta-tocopherol have important independent anti-inflammatory roles.</div>
                </div>
                <div className={`${s.tbPriority} ${s.pImportant}`}>Important</div>
              </div>
              <div className={s.tbRow}>
                <div>
                  <div className={s.tbName}>Curcumin / Turmeric</div>
                  <div className={s.tbNote}>With fatty meal + black pepper (piperine). Turmeric without fat and piperine has nearly 0% bioavailability. Phospholipid-complexed formulations (Meriva, Theracurmin) absorb better without needing added pepper.</div>
                  <div className={s.tbWhy}>Piperine inhibits hepatic glucuronidation of curcumin, increasing bioavailability by 2,000%. Plain curcumin powder is largely inert without these cofactors.</div>
                </div>
                <div className={`${s.tbPriority} ${s.pImportant}`}>Important</div>
              </div>
              <div className={s.tbRow}>
                <div>
                  <div className={s.tbName}>Zinc</div>
                  <div className={s.tbNote}>With any food. Not the same food as iron or calcium (competition for intestinal transporters). Zinc bisglycinate is the gentlest form for those with sensitive stomachs.</div>
                  <div className={s.tbWhy}>Zinc requires stomach acid for optimal absorption. Food triggers acid secretion. Empty stomach zinc reliably causes nausea.</div>
                </div>
                <div className={`${s.tbPriority} ${s.pImportant}`}>Important</div>
              </div>
            </div>
          </div>

          <div className={s.timeBlock}>
            <div className={s.tbHeader}>
              <div className={`${s.tbAccent} ${s.accEvening}`} />
              <div className={s.tbIcon}>🌙</div>
              <div>
                <div className={s.tbTitle}>Evening — Before Bed</div>
                <div className={s.tbSub}>Calming, parasympathetic nutrients. Let the body downshift for sleep and recovery.</div>
              </div>
            </div>
            <div>
              <div className={s.tbRow}>
                <div>
                  <div className={s.tbName}>Magnesium Glycinate or L-Threonate</div>
                  <div className={s.tbNote}>1–2 hours before bed. Glycinate for sleep and muscle relaxation. L-threonate for cognitive support and brain magnesium levels. Do not pair with caffeine at any point in the day.</div>
                  <div className={s.tbWhy}>Magnesium activates GABA receptors. It also regulates melatonin synthesis. Taking it in the morning with stimulants works directly against what the mineral does.</div>
                </div>
                <div className={`${s.tbPriority} ${s.pCritical}`}>Critical</div>
              </div>
              <div className={s.tbRow}>
                <div>
                  <div className={s.tbName}>Calcium (if supplementing — use food first)</div>
                  <div className={s.tbNote}>With dinner, if taking. Split total calcium dose across 2 meals. Absorption maxes out at ~500mg per sitting. Separate from iron by 2+ hours, from levothyroxine by 4+ hours. K2 must be present (with D3).</div>
                  <div className={s.tbWhy}>Some evidence supports calcium absorption being higher in the evening. Splitting doses also reduces the arterial calcification risk associated with large single bolus doses.</div>
                </div>
                <div className={`${s.tbPriority} ${s.pStandard}`}>Standard</div>
              </div>
              <div className={s.tbRow}>
                <div>
                  <div className={s.tbName}>Melatonin (0.5–1mg, not 5–10mg)</div>
                  <div className={s.tbNote}>30–60 min before target sleep time, in a darkened room. Most people dramatically overdose melatonin. Pharmacological doses (5–10mg) can disrupt sleep architecture. 0.5–1mg is typically as effective or more effective.</div>
                  <div className={s.tbWhy}>Melatonin is a circadian signal, not a sedative. More melatonin past the signaling threshold does not produce proportionally more sleep. It produces longer grogginess the next morning.</div>
                </div>
                <div className={`${s.tbPriority} ${s.pImportant}`}>Important</div>
              </div>
              <div className={s.tbRow}>
                <div>
                  <div className={s.tbName}>L-Theanine (100–200mg)</div>
                  <div className={s.tbNote}>Evening or 30–60 min before a stressful event. Can be combined with magnesium glycinate for a calming evening protocol. Does not cause drowsiness on its own.</div>
                  <div className={s.tbWhy}>L-theanine promotes alpha brain wave activity by increasing GABA, serotonin, and dopamine while reducing cortisol response. Synergistic with magnesium's GABA-modulatory effects.</div>
                </div>
                <div className={`${s.tbPriority} ${s.pOptional}`}>Optional</div>
              </div>
              <div className={s.tbRow}>
                <div>
                  <div className={s.tbName}>Berberine (if using for blood sugar)</div>
                  <div className={s.tbNote}>With your largest carbohydrate-containing meal, not in a supplement stack or on an empty stomach. Berberine's primary effect is reducing post-meal glucose spikes, so it must be taken with the meal it is meant to buffer.</div>
                  <div className={s.tbWhy}>Berberine activates AMPK and inhibits hepatic glucose output. These effects are most relevant during and immediately after carbohydrate consumption.</div>
                </div>
                <div className={`${s.tbPriority} ${s.pImportant}`}>Important</div>
              </div>
            </div>
          </div>

          <div className={s.timeBlock}>
            <div className={s.tbHeader}>
              <div className={`${s.tbAccent} ${s.accSpecial}`} />
              <div className={s.tbIcon}>🔄</div>
              <div>
                <div className={s.tbTitle}>Any Time With Food — Flexible</div>
                <div className={s.tbSub}>Consistency matters more than specific timing for these. Pick one time and stick to it.</div>
              </div>
            </div>
            <div>
              <div className={s.tbRow}>
                <div>
                  <div className={s.tbName}>Multivitamin</div>
                  <div className={s.tbNote}>With food, morning preferred for the B vitamin energy benefit. Avoid taking multivitamins at the same time as standalone iron supplements. Multivitamins typically contain calcium which competes with iron in the same product.</div>
                  <div className={s.tbWhy}>The iron in most multivitamins is already partially neutralized by the calcium in the same pill. If you need therapeutic iron, a standalone supplement away from food is more effective.</div>
                </div>
                <div className={`${s.tbPriority} ${s.pOptional}`}>Flexible</div>
              </div>
              <div className={s.tbRow}>
                <div>
                  <div className={s.tbName}>Alpha-Lipoic Acid (ALA)</div>
                  <div className={s.tbNote}>Empty stomach or 30 min before meals for glycemic support. With food if GI sensitivity. R-ALA (the active natural form) is more potent than synthetic racemic ALA.</div>
                  <div className={s.tbWhy}>ALA has a short bioavailability window (~30 min peak). For glucose metabolism benefits, taking before a carbohydrate meal targets the relevant metabolic window.</div>
                </div>
                <div className={`${s.tbPriority} ${s.pOptional}`}>Flexible</div>
              </div>
              <div className={s.tbRow}>
                <div>
                  <div className={s.tbName}>Chromium Picolinate</div>
                  <div className={s.tbNote}>With largest carbohydrate meal. Chromium's role is insulin receptor sensitization. Taking it with carbohydrates directly targets the metabolic moment where it acts.</div>
                  <div className={s.tbWhy}>Chromium is a cofactor for the insulin receptor signaling complex. Its effects are most relevant when insulin is actually being released in response to carbohydrate intake.</div>
                </div>
                <div className={`${s.tbPriority} ${s.pOptional}`}>Flexible</div>
              </div>
            </div>
          </div>

        </div>

        {/* CONFLICTS */}
        <hr className={s.hr} />
        <div id="conflicts" />
        <div className={s.sLabel}>What Blocks What</div>
        <div className={s.secTitle}>Never Take These Together</div>
        <p className={s.secSub}>These combinations significantly reduce absorption or create clinical risk. Timing separation is the fix in most cases.</p>

        <div className={s.conflictWrap}>
          <table className={s.conflictTable}>
            <thead>
              <tr>
                <th>Pair to Avoid</th>
                <th>Impact</th>
                <th>Severity</th>
                <th>The Fix</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={s.pair}>Iron + Calcium</td>
                <td>Calcium competes with iron at the DMT1 intestinal transporter, reducing iron absorption by 50–60% at supplemental doses</td>
                <td><span className={`${s.severity} ${s.sevHigh}`}>Critical</span></td>
                <td className={s.solution}>Separate by 2+ hours minimum. Take iron with Vitamin C instead.</td>
              </tr>
              <tr>
                <td className={s.pair}>Iron + Coffee or Tea</td>
                <td>Polyphenols (chlorogenic acid in coffee, tannins in tea) bind iron and prevent absorption. Effect begins within minutes.</td>
                <td><span className={`${s.severity} ${s.sevHigh}`}>Critical</span></td>
                <td className={s.solution}>Separate by 1–2 hours. Iron before coffee is fine; coffee before iron is not.</td>
              </tr>
              <tr>
                <td className={s.pair}>Iron + Thyroid Medication</td>
                <td>Iron chelates levothyroxine and substantially reduces thyroid hormone absorption, documented to reduce T4 by 20–40%</td>
                <td><span className={`${s.severity} ${s.sevHigh}`}>Critical</span></td>
                <td className={s.solution}>Separate thyroid medication and iron by at least 4 hours.</td>
              </tr>
              <tr>
                <td className={s.pair}>Magnesium + Caffeine</td>
                <td>Caffeine increases urinary magnesium excretion and antagonizes magnesium at cellular receptors, effectively canceling the calming effects</td>
                <td><span className={`${s.severity} ${s.sevHigh}`}>Critical</span></td>
                <td className={s.solution}>Take magnesium in the evening, well after your last caffeine.</td>
              </tr>
              <tr>
                <td className={s.pair}>Fat-Soluble Vitamins + Empty Stomach</td>
                <td>Vitamins D, E, K, A and CoQ10 require bile-salt emulsification for lymphatic absorption. No fat means no bile release means no absorption.</td>
                <td><span className={`${s.severity} ${s.sevHigh}`}>Critical</span></td>
                <td className={s.solution}>Always take D, E, K, A, CoQ10, and fish oil with a fat-containing meal.</td>
              </tr>
              <tr>
                <td className={s.pair}>Zinc + Iron (high doses)</td>
                <td>At supplemental doses, zinc and iron compete for the same intestinal transporter (DMT1). Each reduces the other's absorption.</td>
                <td><span className={`${s.severity} ${s.sevMod}`}>Moderate</span></td>
                <td className={s.solution}>Separate by 2+ hours when taking both as supplements. From food, co-consumption is fine.</td>
              </tr>
              <tr>
                <td className={s.pair}>Zinc + Copper (long-term)</td>
                <td>Long-term zinc supplementation (&gt;40mg/day) depletes copper by competing for intestinal absorption proteins</td>
                <td><span className={`${s.severity} ${s.sevMod}`}>Moderate</span></td>
                <td className={s.solution}>Test serum zinc AND copper together if on zinc supplements. Keep zinc under 40mg/day unless clinically directed.</td>
              </tr>
              <tr>
                <td className={s.pair}>Calcium + Thyroid Medication</td>
                <td>Calcium directly binds levothyroxine in the GI tract, reducing absorption by 20–40%</td>
                <td><span className={`${s.severity} ${s.sevHigh}`}>Critical</span></td>
                <td className={s.solution}>4+ hours between thyroid medication and any calcium supplement or calcium-rich food.</td>
              </tr>
              <tr>
                <td className={s.pair}>Vitamin D (high dose) + Calcium without K2</td>
                <td>High-dose Vitamin D increases intestinal calcium absorption. Without K2 to route it to bone, calcium can accumulate in blood vessels and soft tissue.</td>
                <td><span className={`${s.severity} ${s.sevMod}`}>Moderate</span></td>
                <td className={s.solution}>Always pair D3 with K2 (MK-7 form). This is not optional at supplemental doses above 2,000 IU.</td>
              </tr>
              <tr>
                <td className={s.pair}>B Vitamins (evening)</td>
                <td>In sensitive individuals, B vitamins stimulate neurotransmitter and energy production that delays sleep onset and affects dream intensity</td>
                <td><span className={`${s.severity} ${s.sevLow}`}>Low–Moderate</span></td>
                <td className={s.solution}>Move B complex to morning with breakfast. P5P (B6) specifically causes vivid dreams when taken at night in some people.</td>
              </tr>
              <tr>
                <td className={s.pair}>Probiotics + Antibiotics (together)</td>
                <td>Antibiotics kill the probiotic organisms before they can colonize. The probiotic goes from potentially therapeutic to definitively inert.</td>
                <td><span className={`${s.severity} ${s.sevHigh}`}>Critical</span></td>
                <td className={s.solution}>Separate probiotics and antibiotics by at least 2–3 hours. Take probiotics at midday if antibiotic is morning and evening.</td>
              </tr>
              <tr>
                <td className={s.pair}>Isolated Alpha-Tocopherol (synthetic Vitamin E)</td>
                <td>Isolated alpha-tocopherol displaces and blocks the other 7 Vitamin E forms, especially gamma-tocopherol which has independent anti-inflammatory roles</td>
                <td><span className={`${s.severity} ${s.sevMod}`}>Moderate</span></td>
                <td className={s.solution}>Use full-spectrum Vitamin E containing mixed tocopherols and tocotrienols. "Vitamin E as alpha-tocopherol" is the form to avoid in isolation.</td>
              </tr>
              <tr>
                <td className={s.pair}>Curcumin / Turmeric without Fat + Piperine</td>
                <td>Curcumin bioavailability from plain turmeric powder without fat and piperine is approximately 1%. Nearly all of it passes through unabsorbed.</td>
                <td><span className={`${s.severity} ${s.sevHigh}`}>Critical</span></td>
                <td className={s.solution}>Pair with black pepper (piperine increases absorption 2,000%) and a fatty meal. Or use phospholipid-complexed curcumin (Meriva, Theracurmin).</td>
              </tr>
              <tr>
                <td className={s.pair}>Berberine + GLP-1 / Insulin / Metformin</td>
                <td>Berberine + blood sugar medications creates additive hypoglycemia risk. Berberine activates AMPK and inhibits hepatic glucose production through mechanisms that stack with these medications.</td>
                <td><span className={`${s.severity} ${s.sevHigh}`}>Clinical Risk</span></td>
                <td className={s.solution}>Discuss with your prescriber before combining. If combining, monitor blood glucose closely and recognize hypoglycemia symptoms.</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* BOOSTERS */}
        <hr className={s.hr} />
        <div id="boosters" />
        <div className={s.sLabel}>What Helps What</div>
        <div className={s.secTitle}>Absorption Boosters — Strategic Pairings</div>
        <p className={s.secSub}>These combinations actively improve each other's absorption or function. Build them into your routine deliberately.</p>

        <div className={s.boosterGrid}>
          <div className={s.boosterCard}>
            <div className={s.bcCombo}>Iron <span className={s.bcPlus}>+</span> Vitamin C</div>
            <div className={s.bcResult}>↑ Absorption 2–3x</div>
            <div className={s.bcWhy}>Vitamin C reduces Fe3+ to the more absorbable Fe2+ form and keeps it soluble in the small intestine. Take together, not separately.</div>
          </div>
          <div className={s.boosterCard}>
            <div className={s.bcCombo}>Vitamin D3 <span className={s.bcPlus}>+</span> K2 (MK-7)</div>
            <div className={s.bcResult}>↑ Bone benefit + CV safety</div>
            <div className={s.bcWhy}>D3 increases calcium absorption. K2 activates Matrix Gla Protein which directs calcium into bone and prevents calcification of arteries. Non-separable for safe D3 use at higher doses.</div>
          </div>
          <div className={s.boosterCard}>
            <div className={s.bcCombo}>Turmeric <span className={s.bcPlus}>+</span> Black Pepper</div>
            <div className={s.bcResult}>↑ Curcumin absorption 20x</div>
            <div className={s.bcWhy}>Piperine in black pepper inhibits glucuronidation, the liver process that rapidly clears curcumin. Without piperine, the liver clears curcumin before it can act.</div>
          </div>
          <div className={s.boosterCard}>
            <div className={s.bcCombo}>Fat-Soluble Vitamins <span className={s.bcPlus}>+</span> Dietary Fat</div>
            <div className={s.bcResult}>↑ Absorption up to 32%</div>
            <div className={s.bcWhy}>Vitamins D, E, K, A and CoQ10 dissolve in fat and require bile-salt micelle formation to cross the intestinal wall into lymphatics. Fat triggers bile release.</div>
          </div>
          <div className={s.boosterCard}>
            <div className={s.bcCombo}>Collagen <span className={s.bcPlus}>+</span> Vitamin C</div>
            <div className={s.bcResult}>Required for collagen synthesis</div>
            <div className={s.bcWhy}>Prolyl hydroxylase requires Vitamin C as an obligate cofactor to convert proline to hydroxyproline, the step that stabilizes the collagen triple helix.</div>
          </div>
          <div className={s.boosterCard}>
            <div className={s.bcCombo}>B12 Sublingual <span className={s.bcPlus}>+</span> Methylcobalamin</div>
            <div className={s.bcResult}>Bypasses gut absorption barriers</div>
            <div className={s.bcWhy}>B12 normally requires intrinsic factor for gut absorption. Metformin, PPIs, and low stomach acid all impair this. Sublingual methylcobalamin absorbs directly through oral mucosa.</div>
          </div>
          <div className={s.boosterCard}>
            <div className={s.bcCombo}>Selenium <span className={s.bcPlus}>+</span> Iodine</div>
            <div className={s.bcResult}>Supports thyroid T4 to T3 conversion</div>
            <div className={s.bcWhy}>Selenium is required by the deiodinase enzymes that convert inactive T4 to active T3. Iodine is required to build the thyroid hormones. Both are needed for the thyroid system to function.</div>
          </div>
          <div className={s.boosterCard}>
            <div className={s.bcCombo}>Magnesium <span className={s.bcPlus}>+</span> L-Theanine (evening)</div>
            <div className={s.bcResult}>Synergistic calming effect</div>
            <div className={s.bcWhy}>Both upregulate GABA signaling through different mechanisms. Together they produce a deeper parasympathetic shift than either alone.</div>
          </div>
        </div>

        {/* THYROID PROTOCOL */}
        <hr className={s.hr} />
        <div id="thyroid" />
        <div className={s.specialBox}>
          <h3 className={s.specialBoxH3}>⚠️ Special Protocol: Thyroid Medication Users</h3>
          <p className={s.specialNote}>Levothyroxine is one of the most absorption-sensitive medications prescribed. More supplements block it than almost any other drug. If you take thyroid medication, this schedule is not optional. It is clinical management.</p>
          <div className={s.schedTimeline}>
            <div className={s.schedRow}>
              <div className={s.schedTime}>Wake-up<br />6:00–7:00am</div>
              <div>
                <div className={s.schedItem}><strong>Thyroid medication, empty stomach, with water only</strong></div>
                <div className={s.schedWarn}>No coffee, no supplements, no food for 30–60 minutes minimum</div>
              </div>
            </div>
            <div className={s.schedRow}>
              <div className={s.schedTime}>Breakfast<br />7:00–8:00am</div>
              <div>
                <div className={s.schedItem}><strong>B vitamins, Vitamin C, methylfolate, collagen</strong> — these are safe with thyroid medication at 4+ hours apart</div>
                <div className={s.schedWarn}>No calcium, iron, magnesium, or zinc yet</div>
              </div>
            </div>
            <div className={s.schedRow}>
              <div className={s.schedTime}>Lunch<br />12:00–1:00pm</div>
              <div>
                <div className={s.schedItem}><strong>Zinc, CoQ10, Vitamin D3 + K2, fish oil, selenium</strong> — 4+ hours after thyroid medication, safely separated</div>
              </div>
            </div>
            <div className={s.schedRow}>
              <div className={s.schedTime}>Dinner</div>
              <div>
                <div className={s.schedItem}><strong>Calcium (with dinner if supplementing), chromium</strong></div>
                <div className={s.schedWarn}>Still 10+ hours before next morning's thyroid dose, fully cleared</div>
              </div>
            </div>
            <div className={s.schedRow}>
              <div className={s.schedTime}>Bedtime</div>
              <div>
                <div className={s.schedItem}><strong>Magnesium glycinate, L-theanine, melatonin if needed</strong></div>
              </div>
            </div>
            <div className={s.schedRow}>
              <div className={s.schedTimeRed}>Never with thyroid med</div>
              <div>
                <div className={s.schedItemAmber}>Calcium, Iron, Magnesium, Zinc, Fiber supplements, Antacids / PPIs taken at same time, Coffee or espresso, High-fiber foods (bran, flaxseed)</div>
                <div className={s.schedWarn}>Each of these reduces levothyroxine absorption. The clinical consequence is under-treated hypothyroidism despite taking medication correctly.</div>
              </div>
            </div>
          </div>
        </div>

        {/* DOSE REFERENCE */}
        <hr className={s.hr} />
        <div id="doses" />
        <div className={s.doseNote}>
          <h3 className={s.doseNoteH3}>Common Starting Doses — General Reference Only</h3>
          <p className={s.doseNoteIntro}>These are population-level starting reference points, not individualized prescriptions. Lab testing before supplementing is the only way to dose accurately. Always discuss with your prescriber or pharmacist before starting or adjusting supplements.</p>
          <div className={s.doseGrid}>
            <div className={s.doseCard}>
              <div className={s.doseName}>Vitamin D3</div>
              <div className={s.doseAmount}>5,000–10,000</div>
              <div className={s.doseUnit}>IU/day for deficient adults</div>
              <div className={s.doseCardNote}>Test first. Target 25-OH D: 50–80 ng/mL. Always with K2 MK-7 (100–200mcg).</div>
            </div>
            <div className={s.doseCard}>
              <div className={s.doseName}>Magnesium Glycinate</div>
              <div className={s.doseAmount}>200–400</div>
              <div className={s.doseUnit}>mg/day elemental magnesium</div>
              <div className={s.doseCardNote}>Evening. Start low. Loose stool indicates too much.</div>
            </div>
            <div className={s.doseCard}>
              <div className={s.doseName}>CoQ10 (Ubiquinol)</div>
              <div className={s.doseAmount}>100–300</div>
              <div className={s.doseUnit}>mg/day</div>
              <div className={s.doseCardNote}>200mg for statin users. With largest fatty meal. Split 2x for higher doses.</div>
            </div>
            <div className={s.doseCard}>
              <div className={s.doseName}>Omega-3 Fish Oil</div>
              <div className={s.doseAmount}>2–4</div>
              <div className={s.doseUnit}>g EPA+DHA/day (not total oil)</div>
              <div className={s.doseCardNote}>Read the EPA+DHA content on the label, not the total fish oil amount. Most 1g capsules contain only 300mg EPA+DHA.</div>
            </div>
            <div className={s.doseCard}>
              <div className={s.doseName}>Vitamin B12 (Methylcobalamin)</div>
              <div className={s.doseAmount}>1,000</div>
              <div className={s.doseUnit}>mcg/day sublingual</div>
              <div className={s.doseCardNote}>For metformin or PPI users: 1,000mcg sublingual. Higher supplemental doses are safe. B12 has no upper limit.</div>
            </div>
            <div className={s.doseCard}>
              <div className={s.doseName}>Zinc Bisglycinate</div>
              <div className={s.doseAmount}>15–30</div>
              <div className={s.doseUnit}>mg/day elemental zinc</div>
              <div className={s.doseCardNote}>Do not exceed 40mg/day long-term without monitoring copper. Test both together.</div>
            </div>
            <div className={s.doseCard}>
              <div className={s.doseName}>Melatonin</div>
              <div className={s.doseAmount}>0.5–1</div>
              <div className={s.doseUnit}>mg, 30–60 min before sleep</div>
              <div className={s.doseCardNote}>Most people overdose at 5–10mg. Physiological dose is 0.1–0.3mg. Start at 0.5mg.</div>
            </div>
            <div className={s.doseCard}>
              <div className={s.doseName}>Methylfolate</div>
              <div className={s.doseAmount}>400–1,000</div>
              <div className={s.doseUnit}>mcg/day</div>
              <div className={s.doseCardNote}>400mcg standard. Up to 1mg for those with confirmed MTHFR variants or on OCP/metformin.</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className={s.cta}>
          <h4 className={s.ctaH4}>Want a Personalized Supplement Protocol for Your Specific Situation?</h4>
          <p className={s.ctaP}>The timing guide is the starting point. A full protocol maps your medication list, health goals, and lab values to specific supplement forms, doses, and timing, not a generic chart.</p>
          <Link to="/join" className={s.ctaBtn}>Get Your Personalized Protocol →</Link>
        </div>

      </div>

      {/* FAQ */}
      <div className={s.faqSection}>
        <h2 className={s.faqH2}>Frequently asked questions</h2>
        {FAQS.map((faq, i) => (
          <div className={s.faqItem} key={i}>
            <div
              className={s.faqQ}
              onClick={() => toggleFaq(i)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && toggleFaq(i)}
            >
              {faq.q}
              <span className={s.faqToggle}>{openFaqs.has(i) ? '−' : '+'}</span>
            </div>
            {openFaqs.has(i) && <div className={s.faqA}>{faq.a}</div>}
          </div>
        ))}
      </div>

      {/* Related */}
      <div className={s.relatedSection}>
        <h2 className={s.relatedH2}>Keep going</h2>
        <div className={s.relatedGrid}>
          <Link to="/tools/medication-nutrient-checker" className={s.relatedCard}>
            <div className={s.relatedEyebrow}>Start Here</div>
            <div className={s.relatedTitle}>Medication Nutrient Depletion Checker →</div>
            <div className={s.relatedSub}>See which nutrients your full medication list depletes.</div>
          </Link>
          <Link to="/tools/nutrient-food-sources" className={s.relatedCard}>
            <div className={s.relatedEyebrow}>Companion Guide</div>
            <div className={s.relatedTitle}>Food Sources for Every Depleted Nutrient →</div>
            <div className={s.relatedSub}>Rebuild depleted nutrients through food first.</div>
          </Link>
        </div>
      </div>

      {/* Disclaimer */}
      <div className={s.disclaimer}>
        <strong className={s.disclaimerStrong}>Medical Disclaimer:</strong> This guide is for educational reference only and does not constitute medical advice. Individual supplement needs vary based on health status, medications, genetics (including MTHFR variants), lab values, diet, and gut function. Discuss all supplementation with your prescriber or pharmacist, especially if you take thyroid medications, anticoagulants, blood pressure medications, diabetes medications, or any medication with a narrow therapeutic window. Do not stop prescribed medications to take supplements without clinical guidance.
        <br /><br />
        <strong className={s.disclaimerStrong}>These statements have not been evaluated by the Food and Drug Administration. This is not intended to diagnose, treat, cure, or prevent any disease.</strong>
      </div>

    </div>
  )
}
