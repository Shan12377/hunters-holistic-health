# Existing-Page Optimization Guide

These 7 pages exist but aren't well-indexed. They mostly need deployment, correct meta, canonicals, and (for two) careful content correction. Per your instruction, the old `/glycemic-calculator` phantom URL is being LEFT as-is.

## Per-page meta map

| Page | Title (≤60 chars) | Meta description (≤155 chars) |
|---|---|---|
| / | Hunter's Holistic Health \| Functional Medicine Education | Evidence-informed functional medicine education. Track your metabolic health, implement the ROOTS Framework, and understand your numbers with Dr. Shallanda Hunter, CFNMP. |
| /tools | Free Metabolic Health Tools \| Hunter's Holistic Health | Free calculators to understand your metabolic numbers, including HOMA-IR. Evidence-informed tools from Dr. Shallanda Hunter, CFNMP, PharmD. |
| /bp-simulator | Blood Pressure Zone Simulator \| Hunter's Holistic Health | Understand blood pressure zones with a free interactive simulator. Learn what your numbers mean, from Dr. Shallanda Hunter, CFNMP, PharmD. |
| /shop | Creatine Bundle \| Hunter's Holistic Health | Creatine does more than build muscle. Explore the education-first creatine bundle from Hunter's Holistic Health. |
| /blog/creatine-not-what-you-think | Creatine Does More Than Build Muscle \| Hunter's Holistic Health | Creatine isn't just for athletes. Understand the evidence on creatine for muscle and mind, from Dr. Shallanda Hunter, CFNMP, PharmD. |
| /blog/rebounding-benefits | Rebounding Benefits: What the Evidence Actually Shows | An honest, evidence-informed look at mini-trampoline benefits, from Dr. Shallanda Hunter, CFNMP, PharmD. |
| /protocol/parasite-cleanse | Parasites in Humans: Diagnosis and What Evidence Says | An evidence-informed education guide on intestinal parasites, real diagnosis, and when to see a clinician. Dr. Shallanda Hunter, CFNMP. |

Every page also needs: a self-referencing `<link rel="canonical">`, correct og:url (matching the page, not the homepage), and inclusion in sitemap.xml.

## Content actions per page

### / (homepage)
Deploy latest code so Wave 1 HTML carries the correct title/description. Add Organization + Person + FAQPage schema (see technical/schema file). Request re-indexing in GSC.

### /tools and /bp-simulator
The brief confirms meta tags are already correct here. Action is purely: add canonical, confirm in sitemap, request indexing. Add internal links from the new "understand your numbers" post into these (already done in the delivered post).

### /shop
Google is currently pulling the H1 as the title. Give it a real title/meta (above). Keep education framing; if the creatine bundle page makes any biochemical claims, attach the FDA disclaimer.

### /blog/creatine-not-what-you-think (optimize existing)
Keep it, strengthen it: add a FAQ section + FAQPage schema, add canonical, add internal links to the new /blog/creatine-for-women and /blog/understand-your-lab-numbers. Verify every cognition claim is framed as evidence-informed with certainty noted (moderate for memory, low for other domains) — do not let it drift into "creatine boosts your brain" absolutes.

### /blog/rebounding-benefits (optimize + CORRECT)
**Priority correction.** If the existing post repeats the common overstated claims ("clears lymph in 2 minutes," "68% more efficient than running," "removes X pounds of toxins," "detoxes you"), those must be removed or reframed. They're inaccurate and they undercut a PharmD's credibility. Replace with the honest, sourced framing used in the new /blog/does-rebounding-help-lymphatic-system post: movement supports lymph flow like other exercise; real studied benefits are balance, lower-limb strength, bone density, body composition, and joint-friendliness. Cross-link the two rebounding posts.

### /protocol/parasite-cleanse (REFRAME — flag)
**Handle with care.** The entire parasite-cleanse search landscape is split between sellers and debunking doctors (Cleveland Clinic, Northwestern, Ohio State all say: no evidence cleanses work, self-diagnosis is risky, real parasites need proper testing and prescription treatment). For a PharmD-led *education* platform, the only defensible and rankable angle is the honest, educational one. Recommended reframe:
- What intestinal parasites actually are and real symptoms
- How they're genuinely diagnosed (stool testing, tape test for pinworms)
- The honest state of evidence on herbal "cleanses" (lab/animal signals, no human efficacy trials; not FDA-evaluated)
- Clear "see a clinician / get tested, don't self-treat" guidance
- FDA disclaimer attached
This keeps Dr. Hunter's license safe AND fills a genuine content gap (an accurate, credentialed take), which is what actually out-ranks hype. **Recommend you or Dr. Hunter approve this reframe before publishing**, since it changes the page's angle. If the platform sells a parasite-related product, the education page must not make treatment/efficacy claims about it.

## Indexing request order (GSC, ~10/day quota)
1. /
2. /tools
3. /blog/roots-framework (new — entity page)
4. /blog/understand-your-lab-numbers (new — core positioning)
5. /bp-simulator
6. /blog/creatine-for-women (new)
7. /blog/does-rebounding-help-lymphatic-system (new)
8. /shop
9. /blog/creatine-not-what-you-think
10. /blog/rebounding-benefits
(next day) /protocol/parasite-cleanse after reframe approved
