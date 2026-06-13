import { ExternalLink } from 'lucide-react'
import styles from './Client.module.css'

const PILLARS = [
  {
    letter: 'R',
    title: 'Review',
    subtitle: 'We start where most programs stop: your full picture.',
    body: 'Before anything changes, you get the full picture. You learn how to look at your health history, your medications, your supplements, and your daily habits as one connected story rather than a list of separate problems. Most people have never had someone put all of that together for them in plain language, showing how each piece influences the others. This is where that starts. You leave this pillar understanding where you are and why, which is the only honest starting point for real change.',
    checklist: [
      'Medication and supplement interaction education',
      'Functional lab contextualization (beyond standard panels)',
      'Metabolic history mapping',
      'Lifestyle and environmental factor assessment',
      'Health history education and pattern recognition',
    ],
    fda: null,
    double_o: false,
  },
  {
    letter: 'O',
    title: 'Optimize Nutrition',
    subtitle: 'Food as medicine. Personalized. Evidence-informed.',
    body: 'You learn how food actually communicates with your body beyond calories in and calories out. How it influences your hormones, your energy, and your inflammatory load. The Functional Plate Framework gives you a practical structure: 50% protein first, strategic timing, and food choices built around your real life, your culture, and your specific goals. This is not a generic meal plan created for no one in particular. It is an education in how to eat in a way your body can actually use.',
    checklist: [
      'The Functional Plate Framework (50% protein first methodology)',
      'Meal structure education and practical planning',
      'Protein targets by body weight and activity level',
      'Strategic meal timing and its metabolic effects',
      'Foods that support vs. undermine your goals',
    ],
    fda: null,
    double_o: true,
  },
  {
    letter: 'O',
    title: 'Optimize Biochemistry',
    subtitle: 'Supplement education. Interaction awareness. Quality standards.',
    body: 'You learn what is happening beneath the surface. Gut health, targeted supplementation, and the research behind both. The supplement industry is largely unregulated, and the gap between what a label claims and what research supports can be significant. You stop taking supplements on faith and start understanding what the evidence actually says, what quality standards to look for, and what is worth your time and money. Your physician guides your clinical care. This pillar gives you the education to be an informed participant in that conversation.',
    checklist: [
      'Evidence-based supplement education for metabolic health',
      'Nutrient and supplement interaction awareness',
      'USP-verified product quality standards education',
      'Micronutrient support education (B12, magnesium, zinc, D3)',
      'Gut microbiome support education',
    ],
    fda: 'These statements have not been evaluated by the FDA. Supplement information is educational only and is not intended to diagnose, treat, cure, or prevent any disease. Consult your physician before starting any new supplement.',
    double_o: true,
  },
  {
    letter: 'T',
    title: 'Transform Lifestyle',
    subtitle: 'The factors that determine whether your results hold.',
    body: 'You learn how sleep, stress, movement, and your environment are either building your health or quietly working against it every single day. No nutrition protocol holds long-term without addressing the lifestyle infrastructure beneath it. This is not about rigid rules. It is about understanding the specific levers that drive how you feel, how you recover, and how your metabolism responds, so you can make adjustments that actually hold when real life happens.',
    checklist: [
      'Sleep quality and circadian rhythm education',
      'Stress and cortisol awareness strategies',
      'Movement education for muscle preservation',
      'Environmental toxin awareness (endocrine disruptors)',
      'Habit architecture for long-term consistency',
    ],
    fda: null,
    double_o: false,
  },
  {
    letter: 'S',
    title: 'Sustain and Adapt',
    subtitle: 'The exit strategy most participants are never given.',
    body: 'You learn how to keep going when results come and how to course-correct when life shifts. The 68% weight regain statistic is not a personal failure. It is what happens when people are handed results without a system to maintain them. The goal is not a protocol you follow perfectly for ninety days and then abandon. It is a way of thinking about your health that stays with you and evolves as your life does. This pillar builds that system.',
    checklist: [
      'Long-term metabolic monitoring education',
      'Transition planning education and prescriber coordination support',
      'Muscle mass preservation strategies for maintenance',
      'Metabolic adaptation awareness and support strategies',
      'Accountability and progress tracking systems',
    ],
    fda: null,
    double_o: false,
  },
]

export default function ProtocolPage() {
  const doubleOPillars = PILLARS.filter(p => p.double_o)
  const otherPillars = PILLARS.filter(p => !p.double_o)

  return (
    <div className={styles.rootsPage}>

      {/* Page header */}
      <div className={styles.rootsPageHeader}>
        <div className={styles.rootsPageBadge}>Powered by the proprietary R.O.O.T.S.™ Educational Framework</div>
        <h1 className={styles.rootsPageTitle}>Hunter's ROOTS™ Framework</h1>
        <p className={styles.rootsPageSub}>A prescription tells you what to take. This protocol tells you how to live.</p>
      </div>

      {/* Origin story */}
      <div className={styles.rootsOriginCard}>
        <blockquote className={styles.rootsOriginQuote}>
          "I personally reversed my own metabolic condition twice. Not once. Twice. The first time, I reversed it without a complete framework. I addressed the symptoms, changed my diet, lost weight, watched my labs normalize. Then life happened. Stress, cortisol, inconsistent habits, and I watched the metabolic drift begin again. The second time, I built the system first. That became the ROOTS Framework. What I built for myself became the foundation for everything I teach."
        </blockquote>
        <div className={styles.rootsOriginAttrib}>Dr. Shallanda Hunter, PharmD, MBA, CFNMP</div>
      </div>

      {/* R, T, S pillars + double-O group */}
      <div className={styles.rootsPillarList}>

        {/* R */}
        <PillarCard pillar={PILLARS[0]} />

        {/* Double-O group */}
        <div className={styles.rootsDoubleOWrap}>
          <div className={styles.rootsDoubleOLabel}>Core Protocol Pillars</div>
          {doubleOPillars.map((p, i) => (
            <PillarCard key={p.title} pillar={p} isLast={i === doubleOPillars.length - 1} />
          ))}
        </div>

        {/* T */}
        <PillarCard pillar={PILLARS[3]} />

        {/* S */}
        <PillarCard pillar={PILLARS[4]} />

      </div>

      {/* Resources */}
      <div className={styles.rootsResourcesCard}>
        <h3 className={styles.rootsResourcesTitle}>Educational Resources</h3>
        <div className={styles.resourceList}>
          {[
            { label: 'Schedule a Session (Doxy.me)', url: 'https://doxy.me/drshallandahunter', desc: 'HIPAA-compliant video education sessions' },
            { label: 'Supplement Dispensary (Fullscript)', url: 'https://fullscript.com/go/huntersholistichealth', desc: 'Practitioner-grade supplements at a discount' },
            { label: "Dr. Hunter's Main Website", url: 'https://www.drshallandahunter.com', desc: 'Additional educational content and resources' },
          ].map(({ label, url, desc }) => (
            <a key={url} href={url} target="_blank" rel="noopener noreferrer" className={styles.resourceLink}>
              <div className={styles.resourceBody}>
                <div className={styles.resourceLabel}>{label}</div>
                <div className={styles.resourceDesc}>{desc}</div>
              </div>
              <ExternalLink size={16} color="var(--text-secondary)" />
            </a>
          ))}
        </div>
      </div>

      {/* Full-width disclaimer */}
      <div className={styles.rootsFullDisclaimer}>
        For educational purposes only. Not medical advice. Dr. Shallanda Hunter, PharmD, MBA, CFNMP is a licensed pharmacist and Certified Functional Nutritional Medicine Practitioner providing health education, not clinical pharmacy services. Always consult your doctor before changing your health routine.
      </div>

    </div>
  )
}

function PillarCard({ pillar, isLast }: { pillar: typeof PILLARS[0]; isLast?: boolean }) {
  return (
    <div className={`${styles.rootsPillarCard} ${isLast ? styles.rootsPillarCardLast : ''}`}>
      <div className={styles.rootsPillarTop}>
        <div className={styles.rootsPillarBadge}>{pillar.letter}</div>
        <div className={styles.rootsPillarMeta}>
          <h2 className={styles.rootsPillarTitle}>{pillar.title}</h2>
          <p className={styles.rootsPillarSubtitle}>{pillar.subtitle}</p>
        </div>
      </div>

      <p className={styles.rootsPillarBody}>{pillar.body}</p>

      {pillar.fda && (
        <div className={styles.rootsFdaCallout}>
          {pillar.fda}
        </div>
      )}

      <div className={styles.rootsChecklist}>
        <div className={styles.rootsChecklistLabel}>This Protocol Includes</div>
        {pillar.checklist.map(item => (
          <div key={item} className={styles.rootsCheckItem}>
            <span className={styles.rootsCheckMark}>◆</span>
            {item}
          </div>
        ))}
      </div>
    </div>
  )
}
