import { Link } from 'react-router-dom'
import styles from './BlogPost.module.css'
import NewsletterEmbed from '@/components/ui/NewsletterEmbed'

const META_TITLE = 'PCOS Is Now PMOS: What the New Name Means for You'
const META_DESC = 'PCOS was renamed PMOS in a 2026 global consensus. A PharmD explains what polyendocrine metabolic ovarian syndrome means for your diagnosis and your care.'
const CANONICAL = 'https://www.huntersholistichealth.com/blog/pcos-now-pmos'

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
  setMeta('og:type', 'article', true)
  setMeta('og:url', CANONICAL, true)
  setMeta('twitter:card', 'summary')
  setMeta('twitter:title', META_TITLE)
  setMeta('twitter:description', META_DESC)
  let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
  if (!canonical) { canonical = document.createElement('link'); canonical.setAttribute('rel', 'canonical'); document.head.appendChild(canonical) }
  canonical.href = CANONICAL

  const ldId = 'hhh-pcos-now-pmos-ld'
  if (!document.getElementById(ldId)) {
    const s = document.createElement('script')
    s.type = 'application/ld+json'
    s.id = ldId
    s.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BlogPosting',
          '@id': `${CANONICAL}#article`,
          headline: META_TITLE,
          description: 'PCOS was renamed polyendocrine metabolic ovarian syndrome (PMOS) in a 2026 global consensus published in The Lancet. A PharmD explains what the change means for diagnosis and care.',
          author: {
            '@type': 'Person',
            name: 'Dr. Shallanda Hunter',
            jobTitle: 'PharmD, MBA, RPh, CFNMP',
          },
          publisher: {
            '@type': 'Organization',
            name: "Hunter's Holistic Health, LLC",
            url: 'https://www.huntersholistichealth.com',
          },
          datePublished: '2026-07-22',
          dateModified: '2026-07-22',
          mainEntityOfPage: CANONICAL,
          about: [
            {
              '@type': 'MedicalCondition',
              name: 'Polyendocrine Metabolic Ovarian Syndrome',
              alternateName: 'PMOS, formerly Polycystic Ovary Syndrome (PCOS)',
            },
          ],
        },
        {
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: 'What is PMOS?',
              acceptedAnswer: { '@type': 'Answer', text: 'PMOS stands for polyendocrine metabolic ovarian syndrome. It is the new name for the condition formerly called polycystic ovary syndrome (PCOS), adopted in a 2026 global consensus published in The Lancet. It is the same condition, renamed to reflect its hormonal and metabolic nature.' },
            },
            {
              '@type': 'Question',
              name: 'Is PMOS the same as PCOS?',
              acceptedAnswer: { '@type': 'Answer', text: 'Yes. PMOS and PCOS refer to the same condition. Only the name changed. If you were diagnosed with PCOS, you have PMOS. No new test or diagnosis is required.' },
            },
            {
              '@type': 'Question',
              name: 'Why was PCOS renamed?',
              acceptedAnswer: { '@type': 'Answer', text: 'The name polycystic ovary syndrome implied ovarian cysts that are often not present and framed the condition as gynecological. This contributed to diagnostic delays and fragmented care. The new name reflects that the condition is a multisystem hormonal and metabolic disorder.' },
            },
            {
              '@type': 'Question',
              name: 'Do I need to do anything now that PCOS is called PMOS?',
              acceptedAnswer: { '@type': 'Answer', text: 'Nothing urgent. Your diagnosis stands. You may see both terms for a while as guidelines and records update. It is a good prompt to ask your provider about the metabolic side, including insulin resistance and cardiometabolic risk.' },
            },
          ],
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.huntersholistichealth.com/' },
            { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://www.huntersholistichealth.com/blog' },
            { '@type': 'ListItem', position: 3, name: 'PCOS Is Now PMOS', item: CANONICAL },
          ],
        },
      ],
    })
    document.head.appendChild(s)
  }

  return null
}

export default function PcosNowPmos() {
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
          <h1 className={styles.h1}>PCOS Is Now PMOS: What the New Name Means for You</h1>
          <p className={styles.meta}>July 22, 2026 · Hormone Health · 6 min read</p>
        </header>

        <div className={styles.body}>
          <p>
            If you have spent years being told you have PCOS, here is news worth understanding: the condition has a new name. As of a global consensus published in{' '}
            <a href="https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(26)00717-8/fulltext" target="_blank" rel="noopener noreferrer">The Lancet</a>
            {' '}in May 2026, polycystic ovary syndrome is now polyendocrine metabolic ovarian syndrome, or PMOS. Same condition, more accurate name, and a name that finally says what many of us in clinical practice have known for a long time.
          </p>
          <p>I am a pharmacist and functional medicine educator, and I want to walk you through what actually changed, what did not, and why this particular rename is good news for how you get cared for.</p>

          <h2>The short version</h2>
          <ul>
            <li>The new name is polyendocrine metabolic ovarian syndrome (PMOS).</li>
            <li>It replaces polycystic ovary syndrome (PCOS).</li>
            <li>The change came from a global consensus of more than 50 patient and professional organizations, published in The Lancet.</li>
            <li>Your diagnosis has not changed. If you have PCOS, you have PMOS. It is the same condition.</li>
            <li>The new name puts hormones and metabolism at the center, where they belong.</li>
          </ul>

          <h2>Why the old name had to go</h2>
          <p>Here is the problem that bothered clinicians for decades. The name "polycystic ovary syndrome" told you the defining feature was cysts on the ovaries. It is not. What shows up on an ultrasound are not pathological cysts at all: they are arrested follicles, and plenty of people with the condition have none of them.</p>
          <p>That one misleading word did real damage. Research tied to the name change found that diagnostic delays affected a large share of people with the condition, in part because a patient without visible "cysts" was told they could not have a "cystic" disease. Care got fragmented across specialists who each saw one piece. And the metabolic and cardiovascular risks, which are arguably the most important part for long-term health, got treated as afterthoughts.</p>
          <p>This was not a small rename decided over a weekend. It came out of an 11-year process that gathered input from roughly 22,000 patients and professionals worldwide before landing on PMOS.</p>

          <h2>What the new name actually tells you</h2>
          <p>Break PMOS into its parts, because each word carries real clinical meaning.</p>
          <p><strong>Polyendocrine.</strong> More than one hormone system is involved. Not just reproductive hormones, but insulin, androgens like testosterone, and neuroendocrine signaling. This is a whole-body hormonal condition, not an ovary problem.</p>
          <p><strong>Metabolic.</strong> This is the word that matters most, and the one that changes how you should think about your own care. The condition is deeply tied to insulin resistance, which raises the risk of type 2 diabetes and related complications. The metabolic piece is not a side effect of PMOS. For many people it is the engine driving it.</p>
          <p><strong>Ovarian syndrome.</strong> The ovaries are still involved. The name keeps them in the picture, it just stops pretending they are the whole story.</p>
          <p>Put together, the name now leads with hormones and metabolism and treats the ovaries as one part of a larger system. That is a much more honest description of what people actually live with.</p>

          <h2>Why this matters for how you get cared for</h2>
          <p>When a condition is called "polycystic ovary syndrome," the mental model is gynecological. You go to one specialist, you talk about your ovaries, and the conversation often stops at fertility and periods. Meanwhile the insulin resistance quietly raising your risk of diabetes, the cardiovascular risk, the mental health impact, and the weight and skin changes get scattered or ignored.</p>
          <p>When the same condition is called "polyendocrine metabolic ovarian syndrome," the mental model changes. Now the name itself tells your provider to look at your metabolism, your blood sugar, your full hormone picture, and your long-term cardiometabolic risk. The name does some of the advocacy work for you.</p>
          <p>Insulin resistance sits at the center of this for a huge number of people with PMOS. That is exactly the territory functional medicine education is built to address: nutrition, movement, blood sugar stability, and the daily habits that move insulin sensitivity in the right direction. None of that replaces your physician. It makes you a sharper participant in your own care.</p>

          <h2>What you should do with this information</h2>
          <p><strong>Nothing urgent, and that is fine.</strong> Your diagnosis stands. You do not need a new test or a new appointment just because the name changed.</p>
          <p><strong>Update your own vocabulary when you are ready.</strong> You will see both terms for a while as clinical guidelines, medical records, and coding systems catch up. "PCOS, now called PMOS" is a perfectly good way to say it in the meantime.</p>
          <p><strong>Use the rename as a prompt to look at the metabolic side.</strong> If your PCOS care has been mostly about periods and fertility, the new name is your cue to ask about insulin resistance and cardiometabolic risk too. That conversation is worth having.</p>
          <p>
            If you want help walking into that appointment prepared, the{' '}
            <Link to="/tools/hormone-visit-prep">Hormone Visit Prep Tool</Link>
            {' '}builds you a printable one-page brief for PCOS/PMOS and 16 other conditions, so you spend your visit collaborating instead of explaining. And if insulin resistance is part of your picture, the{' '}
            <Link to="/tools/insulin-resistance-score">insulin resistance check</Link>
            {' '}is a free place to start understanding your numbers.
          </p>

          <h2>The bottom line</h2>
          <p>PCOS is now PMOS: polyendocrine metabolic ovarian syndrome. It is the same condition you already know, described more accurately. The new name leads with hormones and metabolism, which is where the real story of this condition has always been. For once, a medical rename makes things clearer instead of more confusing.</p>
          <p>This is the education your prescription did not come with.</p>

          <hr className={styles.rule} />

          <NewsletterEmbed />

          <hr className={styles.rule} />

          <p className={styles.sig}>
            <em>Dr. Shallanda Hunter, PharmD, MBA, RPh, CFNMP</em><br />
            Functional Medicine Educator | Founder, Hunter's Holistic Health<br />
            <a href="https://www.huntersholistichealth.com">huntersholistichealth.com</a>
          </p>

          <div className={styles.sources}>
            <p><strong>Sources:</strong></p>
            <ol>
              <li>
                Teede HJ, Bahri Khomami M, Morman R, et al. Polyendocrine metabolic ovarian syndrome, the new name for polycystic ovary syndrome: a multistep global consensus process. <em>The Lancet.</em> Published online May 12, 2026.{' '}
                <a href="https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(26)00717-8/fulltext" target="_blank" rel="noopener noreferrer">thelancet.com</a>
              </li>
              <li>
                Endocrine Society. PCOS name change announcement, 2026.{' '}
                <a href="https://www.endocrine.org/news-and-advocacy/news-room/2026/pcos-name-change" target="_blank" rel="noopener noreferrer">endocrine.org</a>
              </li>
              <li>
                University of Rochester Medicine. PCOS Is Now PMOS: Why This Name Change Matters.{' '}
                <a href="https://www.urmc.rochester.edu/news/publications/health-matters/pcos-is-now-pmos-why-this-name-change-matters" target="_blank" rel="noopener noreferrer">urmc.rochester.edu</a>
              </li>
            </ol>
          </div>

          <div className={styles.disclaimer}>
            <p>This article is educational and does not constitute medical advice, diagnosis, or treatment. Always work with your physician or licensed healthcare provider regarding your diagnosis and care.</p>
            <p>These statements have not been evaluated by the FDA. This is not intended to diagnose, treat, cure, or prevent any disease.</p>
          </div>
        </div>
      </article>
    </div>
  )
}
