import { useEffect } from 'react'
import RootCauseQuiz from '@/pages/tools/RootCauseQuiz'

const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'MedicalWebPage',
      name: 'Weight-Loss Resistance Root-Cause Assessment',
      about: { '@type': 'MedicalCondition', name: 'Weight-loss resistance' },
      audience: { '@type': 'Patient' },
      lastReviewed: '2026-07-12',
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Why am I not losing weight even though I eat well and exercise?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'An underlying driver is usually blocking results: insulin resistance, chronic cortisol elevation, a slow or subclinical thyroid, the perimenopausal hormone shift, gut inflammation, or several at once. Each needs a different approach, which is why a single generic plan often fails. This assessment identifies your most likely driver.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can hormones make it hard to lose weight?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Elevated insulin blocks fat release, chronic cortisol drives belly fat and cravings, low thyroid slows metabolism, and estrogen decline shifts fat storage. Identifying which is at play lets you target it specifically.',
          },
        },
        {
          '@type': 'Question',
          name: 'What labs should I ask for if I cannot lose weight?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Commonly overlooked tests include fasting insulin and HOMA-IR, a full thyroid panel (Free T3, Free T4, TPO antibodies, not just TSH), and hormone levels appropriate to your stage. The assessment gives you a tailored list based on your pattern.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is this a diagnosis?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. It is an educational assessment that maps likely patterns from your answers. Your labs and a clinician confirm the picture.',
          },
        },
      ],
    },
  ],
}

export default function WhyCantILoseWeight() {
  useEffect(() => {
    document.title = "Why Can't I Lose Weight? Find Your Root Cause Quiz | Hunter's Holistic Health"
    const desc = document.querySelector('meta[name="description"]')
    if (desc) {
      desc.setAttribute('content', "Eating well and exercising but the weight won't move? A PharmD-designed assessment finds the hidden hormonal, thyroid, gut, or insulin driver in about 3 minutes.")
    }
  }, [])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }}
      />
      <RootCauseQuiz />
    </>
  )
}
