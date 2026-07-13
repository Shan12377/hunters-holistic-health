import { Link } from 'react-router-dom'
import styles from './BlogPost.module.css'
import NewsletterEmbed from '@/components/ui/NewsletterEmbed'

const META_TITLE = 'Ozempic vs Wegovy vs Mounjaro vs Zepbound: The Differences | Hunter\'s Holistic Health'
const META_DESC = 'A pharmacist explains how Ozempic, Wegovy, Mounjaro, Zepbound, and the new oral GLP-1s differ in approval, dosing, and results, updated for 2026.'

function MetaTags() {
  if (typeof document === 'undefined') return null
  document.title = META_TITLE

  function setMeta(name: string, content: string, prop?: boolean) {
    const attr = prop ? 'property' : 'name'
    let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null
    if (!el) {
      el = document.createElement('meta')
      el.setAttribute(attr, name)
      document.head.appendChild(el)
    }
    el.content = content
  }

  setMeta('description', META_DESC)
  setMeta('og:title', META_TITLE, true)
  setMeta('og:description', META_DESC, true)
  setMeta('og:type', 'article', true)
  setMeta('og:url', 'https://www.huntersholistichealth.com/blog/glp1-comparison-ozempic-wegovy-mounjaro-zepbound', true)
  setMeta('twitter:card', 'summary')
  setMeta('twitter:title', META_TITLE)
  setMeta('twitter:description', META_DESC)
  let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
  if (!canonical) { canonical = document.createElement('link'); canonical.setAttribute('rel', 'canonical'); document.head.appendChild(canonical) }
  canonical.href = 'https://www.huntersholistichealth.com/blog/glp1-comparison-ozempic-wegovy-mounjaro-zepbound'
  return null
}

export default function Glp1Comparison() {
  return (
    <div className={styles.page}>
      <MetaTags />

      <nav className={styles.nav}>
        <Link to="/" className={styles.navLogo}>Hunter's Holistic Health</Link>
        <Link to="/join" className={styles.navCta}>Join the Community</Link>
      </nav>

      <article className={styles.article}>
        <header className={styles.articleHeader}>
          <p className={styles.byline}>Dr. Shallanda Hunter, PharmD, CFNMP | Functional Medicine Educator</p>
          <h1 className={styles.h1}>Not All GLP-1s Are the Same: Ozempic vs Wegovy vs Mounjaro vs Zepbound (and the Oral Options)</h1>
          <p className={styles.meta}>June 2026 · 8 min read</p>
        </header>

        <div className={styles.body}>
          <p>These medications are not interchangeable, and as a pharmacist that distinction matters more than most people realize. Which one you are on affects your results, your side effects, your insurance coverage, and how you manage the adjustment period. Most people do not know which molecule they are taking or why it matters. Here is what you need to know.</p>

          <h2>The semaglutide family</h2>
          <p><strong>Ozempic (semaglutide)</strong> is FDA-approved for type 2 diabetes, not for weight loss. It initiates at 0.25 mg for four weeks, then moves to therapeutic doses of 0.5 mg, 1 mg, or 2 mg weekly.</p>
          <p><strong>Wegovy (semaglutide)</strong> is the same molecule at a higher dose ceiling, approved for chronic weight management in adults with a BMI of 30 or above, or 27 or above with a weight-related comorbidity. In the STEP 1 trial, participants on the 2.4 mg dose lost an average of about 14.9% of body weight at 68 weeks.</p>
          <p><strong>Wegovy HD (semaglutide 7.2 mg)</strong> was FDA-approved on March 19, 2026, for adults who have already tolerated the 2.4 mg dose for at least four weeks and need additional weight reduction. In the STEP UP trial, the 7.2 mg dose produced a mean weight loss of about 20.7%. It was the first GLP-1 approved under the FDA's Commissioner's National Priority Voucher program.</p>

          <h2>The tirzepatide family</h2>
          <p><strong>Mounjaro (tirzepatide)</strong> is FDA-approved for type 2 diabetes. It is a dual GIP and GLP-1 receptor agonist, meaning it works through two mechanisms rather than one. Doses range from 2.5 mg to 15 mg weekly. In SURMOUNT-1, the maximum 15 mg dose produced roughly 20.9% body-weight reduction.</p>
          <p><strong>Zepbound (tirzepatide)</strong> is the same molecule as Mounjaro, approved for chronic weight management. As of December 20, 2024, it is also approved for moderate-to-severe obstructive sleep apnea in adults with obesity, the first medication approved for that indication.</p>

          <h2>The oral options</h2>
          <p>The field has moved into pills, which changes access for people who cannot or prefer not to inject.</p>
          <p><strong>Wegovy pill (oral semaglutide 25 mg)</strong> was approved December 22, 2025, the first oral GLP-1 for weight management. In the OASIS 4 trial, it produced about 16.6% mean weight loss with full adherence, similar to injectable Wegovy. It must be taken in the morning on an empty stomach, with a 30-minute wait before other food, drink, or medications.</p>
          <p><strong>Foundayo (orforglipron)</strong> was approved April 1, 2026. It is a non-peptide small-molecule GLP-1 receptor agonist taken once daily with no food or water restrictions, which sets it apart from the oral semaglutide pill. It targets the same receptor as the others but has a different molecular structure and more flexible dosing. Clinical commentary has acknowledged that the oral pills do not match the efficacy of the strongest injectables, but the convenience and easier manufacturing are meaningful advantages. It carries the same class boxed warning for thyroid C-cell tumors.</p>

          <h2>The head-to-head data</h2>
          <p>Until recently, comparisons between semaglutide and tirzepatide were indirect, drawn from separate trials with different populations. SURMOUNT-5, published in the <em>New England Journal of Medicine</em> in 2025, was the first direct head-to-head. In adults with obesity but without diabetes, tirzepatide produced about 20.2% mean weight loss versus 13.7% with semaglutide at 72 weeks, and was superior across the key endpoints. Both are highly effective by historical standards; tirzepatide's dual mechanism produced the larger average result in that trial.</p>

          <h2>The class safety notes that apply to all of them</h2>
          <p>Every drug in this class carries a boxed warning for thyroid C-cell tumors based on rodent studies; the human relevance is not established per labeling. All are contraindicated in people with a personal or family history of medullary thyroid carcinoma or Multiple Endocrine Neoplasia syndrome type 2. The most common side effects across the class are gastrointestinal (nausea, vomiting, diarrhea, constipation), and all carry warnings for pancreatitis, gallbladder disease, and kidney injury related to dehydration. Any of these is a conversation for your prescriber, not something to manage alone.</p>

          <h2>The bottom line</h2>
          <p>Know what you are taking and know why. Semaglutide and tirzepatide are different molecules with different mechanisms; the branded name tells you the approved indication (diabetes vs weight management) and dose ceiling. The oral options trade some efficacy for convenience. The right choice depends on your indication, your insurance, your tolerance, and your goals, which is a discussion to have with your prescriber.</p>

          <h2>Frequently asked questions</h2>
          <p><strong>Is Ozempic the same as Wegovy?</strong><br />Same molecule (semaglutide), different approvals and dose ceilings. Ozempic is approved for type 2 diabetes; Wegovy for chronic weight management, including a higher 7.2 mg dose (Wegovy HD).</p>
          <p><strong>Is Mounjaro the same as Zepbound?</strong><br />Yes, both are tirzepatide. Mounjaro is approved for type 2 diabetes; Zepbound for chronic weight management and, since December 2024, for obstructive sleep apnea in adults with obesity.</p>
          <p><strong>Which causes more weight loss, semaglutide or tirzepatide?</strong><br />In the head-to-head SURMOUNT-5 trial, tirzepatide produced greater average weight loss (about 20.2% vs 13.7% at 72 weeks). Individual response varies, and both are effective.</p>
          <p><strong>Are the oral GLP-1 pills as effective as the injections?</strong><br />The oral Wegovy pill produced results similar to injectable Wegovy in its trial, while Foundayo (orforglipron) generally trends below the strongest injectables. The pills trade some efficacy for convenience.</p>
          <p><strong>Do I have to take the Wegovy pill on an empty stomach but not Foundayo?</strong><br />Correct. Oral semaglutide (Wegovy pill) must be taken in the morning on an empty stomach with a 30-minute wait. Foundayo (orforglipron) has no food or water restrictions.</p>

          <p>Related reading: <Link to="/blog/glp1-cost-how-to-pay-less">GLP-1 Medications Cost Too Much. Here Is How to Pay Less.</Link> | <Link to="/blog/glp1-side-effects-pharmacist-guide">GLP-1 Side Effects: A Pharmacist's Guide</Link> | <Link to="/blog/68-percent-glp1-weight-regain-how-to-beat-it">Why Most GLP-1 Users Regain Weight</Link></p>

          <hr className={styles.rule} />

          <NewsletterEmbed />

          <hr className={styles.rule} />

          <p className={styles.sig}><em>Dr. Shallanda Hunter, PharmD, CFNMP</em><br />Functional Medicine Educator, Founder of Hunter's Holistic Health<br /><a href="https://huntersholistichealth.com">huntersholistichealth.com</a></p>

          <div className={styles.sources}>
            <p><strong>References:</strong></p>
            <ol>
              <li>Wilding JPH et al. Once-weekly semaglutide in adults with overweight or obesity (STEP 1). <em>N Engl J Med.</em> 2021;384(11):989–1002.</li>
              <li>Jastreboff AM et al. Tirzepatide once weekly for the treatment of obesity (SURMOUNT-1). <em>N Engl J Med.</em> 2022;387(3):205–216.</li>
              <li>Aronne LJ et al. Tirzepatide as compared with semaglutide for the treatment of obesity (SURMOUNT-5). <em>N Engl J Med.</em> 2025;393(1):26–36.</li>
              <li>FDA. Approves first treatment for obstructive sleep apnea (Zepbound). December 20, 2024.</li>
              <li>Novo Nordisk. FDA approves Wegovy HD (semaglutide 7.2 mg). March 19, 2026.</li>
              <li>Novo Nordisk. FDA approves Wegovy pill (oral semaglutide 25 mg). December 22, 2025.</li>
              <li>Eli Lilly. FDA approves Foundayo (orforglipron). April 1, 2026.</li>
            </ol>
          </div>

          <div className={styles.disclaimer}>
            <p>For educational purposes only. Not medical advice. I am a PharmD acting as a functional medicine educator, not your prescribing physician or clinical pharmacist. Always consult your doctor before changing your health routine.</p>
            <p>These statements have not been evaluated by the FDA. This is not intended to diagnose, treat, cure, or prevent any disease.</p>
          </div>
        </div>
      </article>
    </div>
  )
}
