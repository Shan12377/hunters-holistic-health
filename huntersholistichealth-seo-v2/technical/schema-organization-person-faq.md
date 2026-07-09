# Homepage Schema — Organization + Person + FAQPage

Place this JSON-LD block in the homepage `<head>`. It disambiguates the brand from the lookalike domains (huntsholistichealth.com, holistichealthhunter.com, huntersholistic.com) and feeds both Google and AI-search engines a clean entity.

Note: this uses `EducationalOrganization`, NOT a medical/clinical type, because the business is an education platform (per the brief's terminology rules). Do not add MedicalBusiness/Physician types.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "EducationalOrganization",
      "@id": "https://www.huntersholistichealth.com/#org",
      "name": "Hunter's Holistic Health",
      "url": "https://www.huntersholistichealth.com",
      "slogan": "Lasting health starts at the roots.",
      "description": "A functional medicine education platform teaching people to understand their metabolic health through the ROOTS framework.",
      "founder": { "@id": "https://www.huntersholistichealth.com/#drhunter" },
      "sameAs": [
        "https://www.linkedin.com/in/dr-shallanda-hunter-pharmd-rph-mba-cfnmp-03070ab8"
      ]
    },
    {
      "@type": "Person",
      "@id": "https://www.huntersholistichealth.com/#drhunter",
      "name": "Shallanda Hunter",
      "honorificPrefix": "Dr.",
      "honorificSuffix": "CFNMP, PharmD, MBA",
      "jobTitle": "Functional Medicine Educator",
      "description": "Certified Functional and Nutritional Medicine Practitioner and licensed pharmacist who teaches metabolic health education through the ROOTS framework.",
      "worksFor": { "@id": "https://www.huntersholistichealth.com/#org" },
      "url": "https://www.huntersholistichealth.com/about",
      "knowsAbout": [
        "functional medicine education",
        "metabolic health",
        "understanding lab results",
        "supplement education",
        "the ROOTS framework"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://www.huntersholistichealth.com/#website",
      "url": "https://www.huntersholistichealth.com",
      "name": "Hunter's Holistic Health",
      "publisher": { "@id": "https://www.huntersholistichealth.com/#org" }
    },
    {
      "@type": "FAQPage",
      "@id": "https://www.huntersholistichealth.com/#homepagefaq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is Hunter's Holistic Health?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Hunter's Holistic Health is a functional medicine education platform led by Dr. Shallanda Hunter, CFNMP, PharmD, MBA. It teaches people to understand their metabolic health and lab numbers through the ROOTS framework. It is an educational platform, not a clinical practice."
          }
        },
        {
          "@type": "Question",
          "name": "What is the ROOTS framework?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "ROOTS stands for Review, Optimize Nutrition, Optimize Biochemical Balance, Transform Lifestyle Factors, and Sustain and Adapt. It is a structured, evidence-informed way of understanding your metabolic health, taught at Hunter's Holistic Health."
          }
        },
        {
          "@type": "Question",
          "name": "Is Hunter's Holistic Health medical treatment?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No. It is an educational platform. The content helps you understand your health and make informed decisions in partnership with your own clinician, and does not diagnose, treat, cure, or prevent any disease."
          }
        }
      ]
    }
  ]
}
```

**Note on membership/pricing schema:** The brief lists tiers (Foundation $37/mo, The Program $97/mo, VIP $997/mo, 6-Month Overhaul $4,997). Only add `Offer`/`Product` schema for these if the pricing is publicly displayed on the page it marks up — schema must match visible content. If the tiers live behind a login, leave them out of markup.

**Do not add** AggregateRating/Review schema unless backed by real, verifiable, on-page reviews.
