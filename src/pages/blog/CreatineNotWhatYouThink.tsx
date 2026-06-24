import { useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './BlogPost.module.css'

const META_TITLE = 'Creatine: Not What You Think It Is | Hunter\'s Holistic Health'
const META_DESC = 'Creatine is not a gym supplement. It is a cellular energy supplement. Here is what the research actually shows, and what I now recommend.'

// ponytail: injecting meta tags directly — no react-helmet installed, this is the only blog post
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
  setMeta('og:url', 'https://huntersholistichealth.com/blog/creatine-not-what-you-think', true)
  setMeta('twitter:card', 'summary')
  setMeta('twitter:title', META_TITLE)
  setMeta('twitter:description', META_DESC)
  return null
}

type OptInStatus = 'idle' | 'submitting' | 'success' | 'error'

function EmailOptIn() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<OptInStatus>('idle')
  const [errMsg, setErrMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL
    if (!webhookUrl) { setErrMsg('Webhook not configured.'); setStatus('error'); return }
    setStatus('submitting')
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Secret': import.meta.env.VITE_N8N_WEBHOOK_SECRET || '',
        },
        body: JSON.stringify({
          submissionType: 'early_access',
          email,
          source: 'blog_creatine_optin',
          consent: true,
        }),
      })
      if (!res.ok) throw new Error('Network error')
      setStatus('success')
    } catch {
      setStatus('error')
      setErrMsg('Something went wrong. Try again or email info@huntersholistichealth.com.')
    }
  }

  if (status === 'success') {
    return (
      <div className={styles.optIn}>
        <p className={styles.optInSuccess}>Got it. Check your inbox.</p>
      </div>
    )
  }

  return (
    <div className={styles.optIn}>
      <p className={styles.optInHeadline}>Want the 1-page Creatine Quick Start? Drop your email.</p>
      <form onSubmit={handleSubmit} className={styles.optInForm}>
        <input
          className={styles.optInInput}
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <button type="submit" disabled={status === 'submitting'} className={styles.optInBtn}>
          {status === 'submitting' ? 'Sending...' : 'Send it'}
        </button>
      </form>
      {status === 'error' && <p className={styles.optInError}>{errMsg}</p>}
    </div>
  )
}

export default function CreatineNotWhatYouThink() {
  return (
    <div className={styles.page}>
      <MetaTags />

      <nav className={styles.nav}>
        <Link to="/" className={styles.navLogo}>Hunter's Holistic Health</Link>
        <Link to="/creatine" className={styles.navCta}>Get the Bundle $47</Link>
      </nav>

      <article className={styles.article}>
        <header className={styles.articleHeader}>
          <p className={styles.byline}>Dr. Shallanda Hunter, PharmD, CFNMP | Functional Medicine Educator</p>
          <h1 className={styles.h1}>Creatine: Not What You Think It Is</h1>
        </header>

        <div className={styles.body}>
          <p>Creatine sat in the same mental bucket as protein shakes and pre-workout. A gym supplement. Something that did not come up much in everyday practice.</p>
          <p>Then the research caught up. And it turns out creatine is not a gym supplement at all. It is a cellular energy supplement that happens to show up everywhere your body needs ATP, which is everywhere your body does anything.</p>
          <p>Here is what I now recommend, and why.</p>

          <img
            src="https://picsum.photos/seed/creatine-brain/900/420"
            alt="Abstract representation of cellular energy and brain activity"
            className={styles.blogImg}
          />

          <h2>Is Creatine Good for Brain Fog?</h2>
          <p>Your brain runs on a molecule called ATP. ATP is cellular energy. Creatine is one of the primary ways your body stores and rapidly regenerates ATP. When brain creatine is low, your neurons work harder to do the same amount of thinking. That shows up as brain fog, slow processing, word-finding struggles, and mental fatigue by 3 p.m.</p>
          <p>This happens in a lot of populations. Sleep-deprived adults. Shift workers. People under chronic mental load. Vegetarians and vegans (because dietary creatine comes almost entirely from meat and fish). Adults over 65. And anyone whose brain is going through a metabolic transition, including perimenopause and menopause.</p>
          <p>A 2024 meta-analysis of sixteen randomized trials confirmed that creatine improves memory, attention, and processing speed across these populations. A 2025 randomized trial in perimenopausal and menopausal women specifically showed measurable increases in brain creatine and improved reaction time after eight weeks. A 2024 study showed creatine can offset the cognitive damage of sleep deprivation in healthy adults.</p>
          <p>The dose in the research is small. Three to five grams a day.</p>

          <img
            src="https://picsum.photos/seed/creatine-mood/900/420"
            alt="Woman sitting calmly, representing mood and mental wellbeing"
            className={styles.blogImg}
          />

          <h2>Can Creatine Help with Mood?</h2>
          <p>Depression is partly an energy problem. Not a willpower problem. Not a personality problem. When the brain cannot make and maintain enough ATP, mood regulation suffers.</p>
          <p>A 2025 meta-analysis in the British Journal of Nutrition found a measurable reduction in depression scores with creatine supplementation. An earlier trial found that adding creatine to standard antidepressant treatment improved response in women with major depressive disorder. Newer pilot work has tested it alongside cognitive behavioral therapy with consistent directional results.</p>
          <p>The effect size is modest, not magical. Creatine does not replace mental health care. What it does is support the cellular energy underneath it, which is the part most protocols ignore.</p>
          <p>If you are already in treatment for mood and you have flat energy, brain fog, or low motivation that has not fully resolved, this is a conversation to have with your prescriber.</p>

          <h2>What Does Creatine Do for Muscle and Bone?</h2>
          <p>After about age thirty, adults begin to lose muscle mass at a measurable rate. Less muscle means slower metabolism, worse glucose control, and less protection around the skeleton. The rate accelerates with age and accelerates further when hormones shift, which is why postmenopausal women and older men both need to pay attention to it.</p>
          <p>Creatine directly supports the energy your muscle fibers use to contract. That means you can train slightly harder, recover slightly faster, and hold onto the muscle you have.</p>
          <p>The pairing that matters: creatine plus resistance training. Creatine without training does very little. The training is what unlocks the response. This applies regardless of sex, age, or starting point.</p>
          <p>A 2025 study in postmenopausal women added a vascular angle: creatine increased muscle microvascular blood flow and supported fat mobilization. Small study, short duration, but a signal worth knowing.</p>

          <img
            src="https://picsum.photos/seed/creatine-muscle/900/420"
            alt="Person doing resistance training with weights"
            className={styles.blogImg}
          />

          <h2>Does Creatine Cause Bloating or Weight Gain?</h2>
          <p>The first week or two, you may see the scale go up one to three pounds. That is water drawn into your muscle cells, not fat. It is creatine doing exactly what it is supposed to do.</p>
          <p>If you get stomach discomfort, two things usually fix it: switch to micronized monohydrate, and split your dose with food. Most gastrointestinal complaints come from taking a large dose at once on an empty stomach.</p>
          <p>Skip the loading phase. You do not need it. Three to five grams a day builds the same tissue creatine level in three to four weeks without the bloating.</p>

          <img
            src="https://picsum.photos/seed/creatine-supplement/900/420"
            alt="White powder supplement in a scoop, representing creatine monohydrate"
            className={styles.blogImg}
          />

          <h2>What Form Should I Buy?</h2>
          <p>Creatine has been over-complicated. There are twenty forms on the market. The honest answer is that creatine monohydrate has more human research than every other form combined. That is the one to buy.</p>
          <p>Look for three things on the label:</p>
          <ul>
            <li><strong>Creatine monohydrate</strong> as the single ingredient</li>
            <li><strong>Creapure</strong> sourcing, which is the German-manufactured 99.9% purity standard</li>
            <li><strong>NSF Certified for Sport</strong> or Informed Sport or Informed Choice seal</li>
          </ul>
          <p>Skip creatine HCl, ethyl ester, buffered (Kre-Alkalyn), and anything labeled a proprietary blend. None have outperformed monohydrate in well-controlled trials, and the blends hide their dosing.</p>
          <p>Gummies are convenient but most deliver one gram or less per piece. If you go that route, do the math so you actually hit the three to five gram range.</p>
          <p><strong>My number one pick: <a href="https://amzn.to/4uN1sr6" target="_blank" rel="noopener sponsored">Thorne Creatine</a>.</strong> Single ingredient, NSF Certified for Sport, Creapure sourced. This is what I recommend in my practice.</p>
          <p>For the full comparison table with all five vetted brands, including budget and capsule options, see the brand picks at <Link to="/creatine">huntersholistichealth.com/creatine</Link>.</p>
          <p>If you want the full 90-day protocol with the tracker, science guide, brand checklist, and the brain health deep dive, that is what the <Link to="/creatine">Creatine Stack Bundle</Link> is for.</p>

          <h2>How to Take It</h2>
          <p>Three to five grams a day. With water, in a smoothie, in coffee, in juice. Micronized monohydrate is tasteless and dissolves into anything.</p>
          <p>Timing matters less than consistency. Take it whenever you will actually take it daily. Post-workout is slightly better for muscle uptake, but the cognitive benefits show up regardless of timing.</p>
          <p>This is a long-term supplement. Give it ninety days before you decide whether it works for you.</p>

          <h2>Who Should Be Taking This?</h2>
          <p>Consider creatine if any of these apply:</p>
          <ul>
            <li>Brain fog, slow thinking, word-finding struggles</li>
            <li>Fatigue that does not respond to sleep</li>
            <li>Heavy cognitive load, shift work, or chronic sleep restriction</li>
            <li>Resistance training or any sport that requires strength and power</li>
            <li>Mood disruption that has not fully resolved on its current treatment</li>
            <li>Difficulty maintaining muscle or strength as you age</li>
            <li>Vegetarian or vegan diet (your baseline creatine stores are lower)</li>
            <li>Perimenopause, menopause, or any hormonal transition that affects energy</li>
            <li>Blood sugar regulation concerns (muscle is your primary glucose disposal tissue)</li>
            <li>Bone density concerns</li>
          </ul>
          <p>If you have a kidney condition, are pregnant, or are taking medications that affect the kidneys (long-term NSAIDs, certain diuretics, lithium, trimethoprim), talk to your pharmacist or prescriber before starting.</p>

          <h2>Want the Full Protocol?</h2>
          <p>I built the <Link to="/creatine">Creatine Stack Bundle</Link> for the people in my practice and community who want more than a blog post. It includes the full Creatine Science Guide with every claim cited and graded, the 30-day and 90-day trackers, the workout performance log, the hydration tracker, the supplement stack cheat sheet, and a brain health deep dive.</p>
          <p>If you want it done for you, that is where to go.</p>

          <hr className={styles.rule} />

          <EmailOptIn />

          <hr className={styles.rule} />

          <p className={styles.sig}><em>Dr. Shallanda Hunter, PharmD, CFNMP</em><br />Functional Medicine Educator, Founder of Hunter's Holistic Health<br /><a href="https://huntersholistichealth.com">huntersholistichealth.com</a></p>

          <div className={styles.sources}>
            <p><strong>Selected sources:</strong></p>
            <ul>
              <li>Korovljev D et al. CONCRET-MENOPA randomized trial, <em>Journal of the American Nutrition Association</em>, 2025.</li>
              <li>Naderi A et al. Postmenopausal microvascular blood flow and lipid mobilization, <em>Journal of the International Society of Sports Nutrition</em>, 2025.</li>
              <li>Pereira RM et al. Creatine supplementation for treating symptoms of depression: systematic review and meta-analysis (11 trials, n=1,093), <em>British Journal of Nutrition</em>, 2025.</li>
              <li>Xu C et al. Effects of creatine supplementation on cognitive function in adults: systematic review and meta-analysis (16 RCTs, n=492), <em>Frontiers in Nutrition</em>, 2024. (A 2026 published commentary noted methodological limitations; direction of effect is consistent with other reviews.)</li>
              <li>Gordji-Nejad A et al. Single-dose creatine improves cognitive performance during sleep deprivation, <em>Scientific Reports</em>, 2024.</li>
              <li>Lak M et al. Does creatine cause hair loss? A 12-week RCT, <em>JISSN</em>, 2024.</li>
            </ul>
          </div>

          <div className={styles.disclaimer}>
            <p>These statements have not been evaluated by the FDA. This product is not intended to diagnose, treat, cure, or prevent any disease. Consult your physician before starting any new supplement.</p>
            <p>For educational purposes only. Not medical advice. I am a PharmD acting as a functional medicine educator, not your prescribing physician or pharmacist. Always consult your doctor before changing your health routine.</p>
            <p>The creatine supplementation protocols and related resources provided are for general informational purposes only and are NOT medical advice. Individual needs vary based on factors such as age, weight, activity level, and health conditions.</p>
            <p>Use of this material is at your own discretion and risk. Dr. Shallanda Hunter and Hunter's Holistic Health LLC are not liable for any outcomes from the use or misuse of this information.</p>
            <p>As an Amazon Associate I earn from qualifying purchases on linked products.</p>
            <p>Questions? <a href="mailto:info@huntersholistichealth.com">info@huntersholistichealth.com</a></p>
          </div>
        </div>
      </article>
    </div>
  )
}
