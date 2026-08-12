import { Link } from 'react-router-dom'
import styles from './BlogIndex.module.css'

const META_TITLE = 'Blog | Hunter\'s Holistic Health, Functional Medicine Education'
const META_DESC = 'Evidence-informed articles on metabolic health, GLP-1 medications, nutrition, and functional medicine from Dr. Shallanda Hunter, PharmD, CFNMP.'

function MetaTags() {
  if (typeof document === 'undefined') return null
  document.title = META_TITLE
  function setMeta(name: string, content: string, prop?: boolean) {
    const attr = prop ? 'property' : 'name'
    let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null
    if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el) }
    el.content = content
  }
  setMeta('description', META_DESC)
  setMeta('og:title', META_TITLE, true)
  setMeta('og:description', META_DESC, true)
  setMeta('og:type', 'website', true)
  setMeta('og:url', 'https://www.huntersholistichealth.com/blog', true)
  let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
  if (!canonical) { canonical = document.createElement('link'); canonical.setAttribute('rel', 'canonical'); document.head.appendChild(canonical) }
  canonical.href = 'https://www.huntersholistichealth.com/blog'
  return null
}

const GLP1_POSTS = [
  {
    slug: '/blog/glp1-comparison-ozempic-wegovy-mounjaro-zepbound',
    tag: 'GLP-1 Education',
    img: 'blog-glp1-comparison.jpg',
    title: 'Ozempic vs. Wegovy vs. Mounjaro vs. Zepbound: What the Data Says',
    desc: 'Dr. Hunter, PharmD, CFNMP, breaks down the head-to-head efficacy, side effect profiles, and cost differences between all four major GLP-1 options.',
  },
  {
    slug: '/blog/glp1-side-effects-pharmacist-guide',
    tag: 'GLP-1 Education',
    img: 'blog-glp1-side-effects.jpg',
    title: 'GLP-1 Side Effects: Dr. Hunter\'s Complete Guide',
    desc: 'Nausea, muscle loss, rebound weight. What the prescribing data actually shows and how to reduce each risk with a root-cause protocol alongside.',
  },
  {
    slug: '/blog/glp1-muscle-loss-what-nobody-tells-you',
    tag: 'GLP-1 Education',
    img: 'blog-glp1-muscle.jpg',
    title: 'GLP-1 and Muscle Loss: What Nobody Tells You',
    desc: 'On average, 25 to 39% of weight lost on GLP-1s is lean mass. Dr. Hunter, PharmD, CFNMP, explains why this matters and what the evidence says to do about it.',
  },
  {
    slug: '/blog/68-percent-glp1-weight-regain-how-to-beat-it',
    tag: 'GLP-1 Education',
    img: 'blog-glp1-regain.jpg',
    title: '68% of GLP-1 Users Regain the Weight. Here Is How to Beat It.',
    desc: 'The SURMOUNT-4 trial data is clear: most weight returns within a year of stopping. The research on what actually prevents rebound.',
  },
  {
    slug: '/blog/glp1-supplements-what-actually-works',
    tag: 'GLP-1 Education',
    img: 'blog-glp1-supplements.jpg',
    title: 'GLP-1 Supplements: What Actually Works',
    desc: 'Berberine, magnesium, B12, creatine, omega-3s. Which supplements have real evidence on GLP-1 therapy and which are noise.',
  },
  {
    slug: '/blog/functional-labs-glp1-what-to-test',
    tag: 'GLP-1 Education',
    img: 'blog-glp1-labs.jpg',
    title: 'Functional Labs for GLP-1 Users: What to Test Before You Start',
    desc: 'HOMA-IR, fasting insulin, CRP, ferritin, B12. The labs that tell the full story before and during GLP-1 therapy.',
  },
  {
    slug: '/blog/glp1-cost-how-to-pay-less',
    tag: 'GLP-1 Education',
    img: 'blog-glp1-cost.jpg',
    title: 'GLP-1 Cost: How to Pay Less',
    desc: 'Manufacturer coupons, compounding pharmacies, international pricing, and how to talk to your prescriber about cost. Dr. Hunter\'s 2026 guide.',
  },
  {
    slug: '/blog/glp1-and-food-culture-navigating-your-heritage',
    tag: 'GLP-1 Education',
    img: 'blog-food-culture.jpg',
    title: 'GLP-1 and Food Culture: Navigating Your Heritage',
    desc: 'GLP-1 medications change your relationship with food. How to protect cultural food practices and family traditions while on therapy.',
  },
]

const METABOLIC_POSTS = [
  {
    slug: '/blog/metabolic-health-beyond-weight-loss',
    tag: 'Metabolic Health',
    img: 'blog-metabolic-health.jpg',
    title: 'Metabolic Health Is Not a Number on a Scale',
    desc: 'Only 12% of American adults are metabolically healthy. Dr. Hunter, CFNMP, Functional Medicine Educator, explains the five markers, the insulin-resistance continuum, and why standard labs miss most of it.',
  },
  {
    slug: '/blog/why-meal-planning-apps-fail',
    tag: 'Platform Feature',
    img: 'blog-meal-apps.jpg',
    title: 'The Real Reason Your Meal Planning App Has Never Actually Worked',
    desc: 'Why AI food trackers fail, why the strategies from your 20s stop working after 40, and what a metabolic-first approach to nutrition looks like.',
  },
]

const HORMONE_POSTS = [
  {
    slug: '/blog/pcos-now-pmos',
    tag: 'Hormone Health',
    img: 'blog-metabolic-health.jpg',
    title: 'PCOS Is Now PMOS: What the New Name Means for You',
    desc: 'A 2026 global consensus renamed polycystic ovary syndrome to polyendocrine metabolic ovarian syndrome (PMOS). Dr. Hunter, PharmD, CFNMP, explains what changed, what did not, and why it matters for your care.',
  },
]

const WELLNESS_POSTS = [
  {
    slug: '/blog/creatine-not-what-you-think',
    tag: 'Supplements',
    img: 'blog-creatine.jpg',
    title: 'Creatine Is Not What You Think',
    desc: 'Most people associate creatine with bodybuilders. Dr. Hunter, PharmD, CFNMP, explains what the evidence actually shows for women, aging adults, and metabolic health.',
  },
  {
    slug: '/blog/rebounding-benefits',
    tag: 'Movement',
    img: 'blog-rebounding.jpg',
    title: 'The Surprising Benefits of Rebounding for Metabolic Health',
    desc: 'Low-impact, high-return. What lymphatic drainage, bone density, and insulin sensitivity research says about rebounding as a daily practice.',
  },
]

export default function BlogIndexPage() {
  return (
    <div className={styles.page}>
      <MetaTags />

      <nav className={styles.nav}>
        <Link to="/" className={styles.navLogo}>Hunter's Holistic Health</Link>
        <Link to="/join" className={styles.navCta}>See Plans</Link>
      </nav>

      <div className={styles.hero}>
        <p className={styles.eyebrow}>Free Education</p>
        <h1 className={styles.heroTitle}>Evidence-Informed Articles on Metabolic Health</h1>
        <p className={styles.heroSub}>
          Written by Dr. Shallanda Hunter, PharmD, CFNMP. No opinions without citations. No recommendations without context.
        </p>
      </div>

      {/* Featured */}
      <div className={styles.section}>
        <p className={styles.sectionLabel}>Featured This Month</p>
        <Link to="/blog/why-meal-planning-apps-fail" className={styles.featuredCard}>
          <div className={styles.featuredBadge}>Platform Feature</div>
          <div className={styles.featuredTitle}>The Real Reason Your Meal Planning App Has Never Actually Worked</div>
          <p className={styles.featuredDesc}>
            You have photographed every meal you eat. The app tells you how many calories. Your blood pressure has not moved. Dr. Hunter, PharmD, CFNMP, explains why calorie counting strips food of its biological information, what metabolic-first nutrition actually looks like, and how to build a plate that teaches you something.
          </p>
          <span className={styles.featuredCta}>Read →</span>
        </Link>

        {/* GLP-1 Series */}
        <p className={styles.sectionLabel} style={{ marginTop: '2rem' }}>GLP-1 Medication Education</p>
        <div className={styles.grid}>
          {GLP1_POSTS.map(p => (
            <Link key={p.slug} to={p.slug} className={styles.card}>
              <div className={styles.cardContent}>
                <div className={styles.cardTag}>{p.tag}</div>
                <div className={styles.cardTitle}>{p.title}</div>
                <p className={styles.cardDesc}>{p.desc}</p>
              </div>
              <img src={`/images/ai/${p.img}`} alt={p.title} className={styles.cardThumb} />
            </Link>
          ))}
        </div>

        {/* Metabolic Health */}
        <p className={styles.sectionLabel} style={{ marginTop: '2rem' }}>Metabolic Health</p>
        <div className={styles.grid}>
          {METABOLIC_POSTS.map(p => (
            <Link key={p.slug} to={p.slug} className={styles.card}>
              <div className={styles.cardContent}>
                <div className={styles.cardTag}>{p.tag}</div>
                <div className={styles.cardTitle}>{p.title}</div>
                <p className={styles.cardDesc}>{p.desc}</p>
              </div>
              <img src={`/images/ai/${p.img}`} alt={p.title} className={styles.cardThumb} />
            </Link>
          ))}
        </div>

        {/* Hormone Health */}
        <p className={styles.sectionLabel} style={{ marginTop: '2rem' }}>Hormone Health</p>
        <div className={styles.grid}>
          {HORMONE_POSTS.map(p => (
            <Link key={p.slug} to={p.slug} className={styles.card}>
              <div className={styles.cardContent}>
                <div className={styles.cardTag}>{p.tag}</div>
                <div className={styles.cardTitle}>{p.title}</div>
                <p className={styles.cardDesc}>{p.desc}</p>
              </div>
              <img src={`/images/ai/${p.img}`} alt={p.title} className={styles.cardThumb} />
            </Link>
          ))}
        </div>

        {/* Wellness */}
        <p className={styles.sectionLabel} style={{ marginTop: '2rem' }}>Supplements and Movement</p>
        <div className={styles.grid}>
          {WELLNESS_POSTS.map(p => (
            <Link key={p.slug} to={p.slug} className={styles.card}>
              <div className={styles.cardContent}>
                <div className={styles.cardTag}>{p.tag}</div>
                <div className={styles.cardTitle}>{p.title}</div>
                <p className={styles.cardDesc}>{p.desc}</p>
              </div>
              <img src={`/images/ai/${p.img}`} alt={p.title} className={styles.cardThumb} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
