import { useEffect } from 'react'
import Glp1Assessment from '@/pages/tools/Glp1Assessment'

const SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'MedicalWebPage',
      name: 'Am I a GLP-1 Candidate? The Clinical Assessment',
      about: { '@type': 'MedicalTherapy', name: 'GLP-1 receptor agonist therapy' },
      audience: { '@type': 'Patient' },
      lastReviewed: '2026-07-12',
      description: 'A PharmD-designed clinical assessment of GLP-1 candidacy: Ozempic, Wegovy, Zepbound, and Foundayo.',
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Who is a candidate for GLP-1 medications?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'FDA-approved GLP-1 weight medications are indicated for adults with a BMI of 30 or higher, or 27 or higher with at least one weight-related condition such as high blood pressure, pre-diabetes, high cholesterol, or sleep apnea. Candidacy also depends on your history and safety screen, which this assessment walks through.',
          },
        },
        {
          '@type': 'Question',
          name: 'What is the difference between Ozempic, Wegovy, Zepbound, and Foundayo?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Ozempic and Wegovy are semaglutide (a GLP-1 agonist); Zepbound and Mounjaro are tirzepatide (a dual GIP/GLP-1 agonist with somewhat higher average weight loss); Foundayo (orforglipron) is a once-daily oral GLP-1 approved in April 2026. An oral semaglutide was also approved in late 2025. Which fits you depends on your metabolic profile, cost and coverage, and injection tolerance.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I still get compounded semaglutide or tirzepatide?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Generally no, not routinely. The FDA declared these shortages resolved (tirzepatide December 2024, semaglutide February 2025), and mass compounding of copycat versions is no longer permitted. In April 2026 the FDA moved to bar bulk compounding entirely. Narrow, documented patient-specific exceptions remain. For most people the appropriate path is an FDA-approved brand or oral option.',
          },
        },
        {
          '@type': 'Question',
          name: 'Will I regain the weight if I stop a GLP-1?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Often yes, unless the underlying drivers were addressed. In the STEP 1 extension study, people who stopped semaglutide regained about two-thirds of their lost weight within a year. That is why this assessment weighs whether root-cause work should come first or alongside.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is this medical advice?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. This is an educational assessment. It does not diagnose or prescribe, and all medication decisions are made with your prescribing physician.',
          },
        },
      ],
    },
  ],
}

export default function Glp1CandidateLanding() {
  useEffect(() => {
    document.title = 'Am I a GLP-1 Candidate? Free Clinical Assessment | Hunter\'s Holistic Health'
    const desc = document.querySelector('meta[name="description"]')
    if (desc) {
      desc.setAttribute('content', 'A PharmD-designed assessment tells you whether Ozempic, Wegovy, Zepbound, or Foundayo fits your profile, or whether to address the root cause first.')
    }
  }, [])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }}
      />
      <Glp1Assessment />
    </>
  )
}
