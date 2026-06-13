import { ExternalLink } from 'lucide-react'
import styles from './Client.module.css'

const PILLARS = [
  {
    letter: 'R',
    title: 'Review',
    subtitle: 'We start where most programs stop — with your full picture.',
    body: 'The journey toward metabolic health does not begin with a one-size-fits-all diet or exercise plan. It begins with a meticulous review of your unique biological and personal landscape. Metabolic dysfunction is not a random occurrence. It is a signal of an underlying imbalance. Most clients have never had a PharmD review their full medication and supplement picture simultaneously. This is where that changes. You stop guessing and start understanding what your body is telling you.',
    checklist: [
      'Full medication and supplement interaction review',
      'Functional lab education and contextualization (beyond standard panels)',
      'Metabolic history mapping',
      'Lifestyle and environmental factor review',
      'Medication and protocol education review',
    ],
    fda: null,
    double_o: false,
  },
  {
    letter: 'O',
    title: 'Optimize Nutrition',
    subtitle: 'Food as medicine. Personalized. Evidence-informed.',
    body: 'Nutrition is not merely a source of fuel. It is a profound form of communication with the body\'s metabolic machinery. The nutritional protocol is built around the Functional Plate Framework: 50% protein first, strategic meal timing, and food choices that support muscle preservation, gut health, and metabolic flexibility. This approach moves beyond the simplistic calories in, calories out model to a nuanced understanding of how food influences your genes, hormones, and cellular processes.',
    checklist: [
      'The Functional Plate Framework (50% protein first methodology)',
      'Personalized meal planning',
      'Protein targets by body weight and activity level',
      'Strategic meal timing and coordination',
      'Foods that support vs. undermine your protocol\'s efficacy',
    ],
    fda: null,
    double_o: true,
  },
  {
    letter: 'O',
    title: 'Optimize Biochemistry',
    subtitle: 'Supplement education. Drug interactions reviewed. USP standards applied.',
    body: 'The supplement industry is largely unregulated. The metabolic health client population is particularly vulnerable to products that interact with their medication, deplete critical nutrients, or simply do not contain what the label claims. This protocol applies evidence-based PharmD educator-level review to every recommendation. You stop taking supplements on faith and start understanding what the research actually says, what your labs actually indicate, and what is worth your time and money.',
    checklist: [
      'Evidence-based supplement protocols for metabolic health',
      'Drug-nutrient and drug-supplement interaction education review',
      'USP-verified product recommendations only',
      'Micronutrient support education (B12, magnesium, zinc, D3)',
      'Gut microbiome support during active protocols',
    ],
    fda: 'These statements have not been evaluated by the FDA. Supplement recommendations are not intended to diagnose, treat, cure, or prevent any disease. Consult your physician before starting any new supplement.',
    double_o: true,
  },
  {
    letter: 'T',
    title: 'Transform Lifestyle',
    subtitle: 'The factors that determine whether your results hold.',
    body: 'True metabolic health cannot be achieved through diet and exercise alone. The modern energy balance model, which attributes weight gain solely to consuming more calories than are expended, fails to account for the role of external stressors that disrupt the body\'s metabolic set point. Sleep quality, chronic stress, movement patterns, environmental toxin exposure, and circadian rhythm disruption all directly affect insulin sensitivity, cortisol levels, and metabolic rate. This protocol addresses the lifestyle infrastructure that most programs overlook.',
    checklist: [
      'Sleep optimization and circadian rhythm protocols',
      'Stress and cortisol management strategies',
      'Movement programming for muscle preservation',
      'Environmental toxin reduction (endocrine disruptors)',
      'Behavioral and habit architecture for long-term adherence',
    ],
    fda: null,
    double_o: false,
  },
  {
    letter: 'S',
    title: 'Sustain and Adapt',
    subtitle: 'The exit strategy most clients are never given.',
    body: 'The 68% weight regain statistic is not a client failure. It is a system failure, specifically, the failure to build the metabolic infrastructure that makes results durable. The final pillar focuses on making health a sustainable, lifelong practice. The goal is not to impose a rigid set of rules that break under pressure, but to create flexible systems and habits that can evolve with your life. This covers long-term monitoring, transition planning education, and the adaptation strategies that keep results intact as your needs and protocol evolve.',
    checklist: [
      'Long-term metabolic monitoring framework',
      'Protocol transition planning education and coordination support with your prescriber',
      'Muscle mass preservation strategies for maintenance phase',
      'Hormonal and metabolic adaptation awareness and support strategies',
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
