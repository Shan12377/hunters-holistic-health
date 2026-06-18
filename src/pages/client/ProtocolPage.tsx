import { ExternalLink } from 'lucide-react'
import styles from './Client.module.css'

const PILLARS = [
  {
    letter: 'R',
    title: 'Review',
    subtitle: 'You cannot build on what you do not understand.',
    body: 'You learn how to actually look at your own health picture. Most people have a stack of lab results they have never had explained to them in plain language. This is where that changes. You stop guessing and start understanding what your body is telling you. Your health history, your medications, your supplements, and your daily habits become one connected story rather than a list of separate problems.',
    checklist: [
      'Health history education and pattern recognition',
      'Medication and supplement interaction education',
      'Functional lab contextualization in plain language',
      'Metabolic history mapping',
      'Lifestyle and environmental factor assessment',
    ],
    fda: null,
    double_o: false,
  },
  {
    letter: 'O',
    title: 'Optimize Nutrition',
    subtitle: 'Not a generic handout. An education in how to eat for your body.',
    body: 'You learn how to fuel your body in a way that supports your metabolism, fits your culture, and works for your real life. Not a generic meal plan created for no one in particular. An actual understanding of why food choices matter and how to make them work for you specifically. Depending on your health goals and current metabolic picture, this education is tailored to where you are right now.',
    checklist: [
      'Meal structure education for your specific metabolism',
      'Understanding how food affects hormones and energy',
      'Strategic meal timing and its metabolic effects',
      'Culturally relevant food choice education',
      'Foods that support vs. undermine your goals',
    ],
    fda: null,
    double_o: true,
  },
  {
    letter: 'O',
    title: 'Optimize Biochemical Balance',
    subtitle: 'Supplement education. Interaction awareness. Quality standards.',
    body: 'You learn what might be quietly working against your progress and why. You stop taking supplements on faith and start understanding what the research actually says, how to read your own lab trends, and how to ask better questions of your provider. The supplement industry is largely unregulated. This pillar gives you the tools to tell the difference between what the evidence supports and what is marketing.',
    checklist: [
      'Evidence-informed supplement education',
      'Nutrient and supplement interaction awareness',
      'How to read your own lab trends over time',
      'USP-verified product quality standards education',
      'Gut microbiome and micronutrient support education',
    ],
    fda: 'These statements have not been evaluated by the FDA. Supplement information is educational only and is not intended to diagnose, treat, cure, or prevent any disease. Consult your physician before starting any new supplement.',
    double_o: true,
  },
  {
    letter: 'T',
    title: 'Transform Lifestyle Factors',
    subtitle: 'Most people never connect these dots. When you do, everything shifts.',
    body: 'You learn how sleep, stress, movement, and your body\'s internal clock are either building you up or breaking you down every single day. Most people never connect these dots. When you do, everything else starts to make more sense. This is not about rigid rules. It is about understanding the specific levers that drive how you feel, how you recover, and how your metabolism responds.',
    checklist: [
      'Sleep quality and circadian rhythm education',
      'Stress and cortisol awareness strategies',
      'Movement education for metabolic health',
      'Environmental toxin awareness (endocrine disruptors)',
      'Habit architecture for long-term consistency',
    ],
    fda: null,
    double_o: false,
  },
  {
    letter: 'S',
    title: 'Sustain and Adapt',
    subtitle: 'Not a one-time fix. A way of thinking that stays with you.',
    body: 'You learn how to keep going when the results come and how to course-correct when life inevitably shifts. This is not a protocol you follow perfectly for ninety days and then abandon. It is a way of thinking about your health that stays with you and evolves as your life does. The system you build here is what makes the difference between a result that lasts and one that fades.',
    checklist: [
      'Long-term metabolic monitoring education',
      'Course-correction strategies when life shifts',
      'Habit maintenance and accountability systems',
      'Progress tracking and milestone recognition',
      'Building a sustainable health infrastructure',
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
          "I am a licensed pharmacist and Certified Functional Nutritional Medicine Practitioner. Years in pharmacy showed me what a prescription can do. Functional medicine training showed me what it cannot. The gap between those two things is exactly where I focus my education. And I personally reversed my own metabolic condition twice. Not once. Twice. Because the first time, I reversed it without a complete framework. I addressed the symptoms. Changed my diet, lost weight, watched my labs normalize. Then life happened. Stress, cortisol, inconsistent habits, and I watched the metabolic drift begin again. The second time, I built the system first. I did not just change what I was eating. I changed the infrastructure my health was running on. That became the ROOTS Framework. And what I built for myself became the foundation for everything I teach."
        </blockquote>
        <div className={styles.rootsOriginAttrib}>Dr. Shallanda Hunter, CFNMP, PharmD, MBA</div>
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
        For educational purposes only. Not medical advice. Dr. Shallanda Hunter, CFNMP, PharmD, MBA is a Certified Functional Nutritional Medicine Practitioner and licensed pharmacist providing health education, not clinical pharmacy services. Always consult your doctor before changing your health routine.
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
