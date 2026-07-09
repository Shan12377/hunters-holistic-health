# Landing Page Optimization Brief
## For the developer. Hunter's Holistic Health, huntersholistichealth.com
### Prepared July 2026. Based on a full audit of LandingPage.tsx.

---

## The One-Sentence Diagnosis

The page is credible but faceless, and it asks cold visitors to buy before it asks them to trust. The gurus do it in the opposite order: face, story, proof, free value, email, then the offer.

---

## Part 1: The 5-Second Test (what pulls people in at one glance)

A visitor decides in under 5 seconds whether to scroll. Right now the first screen shows: a logo mark, a badge, a headline, two buttons. No human. No proof. No number.

What the highest-converting health education pages show in the first screen:

1. A face. The founder, looking at the camera. People trust people, not logos. This is the single biggest gap on the page.
2. One specific promise. The current headline is good ("You have had the numbers for years. Nobody explained them. That changes now."). Keep the idea, sharpen the specificity. Options below.
3. One proof element. A number, a credential, or a result. The credentials exist but sit below the fold in a gray strip.
4. One primary CTA. Right now there are two equal buttons. Make "Try Free Tools" visually secondary so the eye has one job.

Look at the transcript you sent. In the first 30 seconds he does exactly this: pattern-interrupt claim ("I don't buy it"), then instant authority in one breath ("I trained as a monk, then MIT, then CEO"), then a promised payoff ("learn all five and you'll feel like a genius"). That is the formula: interrupt, authority, payoff. Your hero needs all three in the first screen.

### Hero headline options (pick one, A/B test if possible)

- Option A (specificity): "Your doctor gets 7 minutes with you. Your numbers need more than that."
- Option B (keep current, add sub-proof): keep the existing headline, add a line under it: "Taught by a PharmD and Certified Functional and Nutritional Medicine Practitioner who reversed her own metabolic condition."
- Option C (pattern interrupt, guru style): "Borderline is not a diagnosis. It is a warning nobody explained to you."

All three are educational framing, no disease-treatment claims, compliant as written.

---

## Part 2: Should People Be On The Page?

Yes. This is not optional for conversion. Here is exactly where and why.

1. Hero section: a professional photo of Dr. Hunter (white coat optional, warm and direct eye contact beats clinical stiffness). The entire authority positioning of this brand is "a real PharmD built this." A logo mark cannot carry that.
2. Origin story section: a second, more personal photo. This section currently has her strongest asset (she reversed her own condition) buried in text with no face attached. The guru transcript works because a person is telling you their story. Same principle.
3. Trust strip: move it up, add her headshot thumbnail next to "Created and led by Dr. Shallanda Hunter."
4. Testimonials (new section, see Part 4): real member faces if permission is granted, first name and last initial otherwise.
5. Optional but high-impact: a 60 to 90 second face-to-camera video in the hero. Script outline in Part 6.

Photo shot list to hand off:
- 1 hero portrait, direct eye contact, clean background, brand colors
- 1 casual working shot (desk, notes, or teaching) for the origin story
- 1 square headshot crop for trust strip and social proof areas

---

## Part 3: What the Gurus Do That This Page Does Not

Mapped from the transcript pattern to this page:

| Guru move | What he did | What the page does | Fix |
|---|---|---|---|
| Pattern interrupt | "I don't buy it" in second 3 | Headline is a statement, not an interrupt | Hero option A or C |
| Authority in one breath | Monk, MIT, CEO in one sentence | Credentials in a low gray strip | Move trust strip directly under hero CTA, add face |
| Named framework | "The five distortions," "ASC" | ROOTS exists but appears halfway down | Tease ROOTS in the hero sub-line: "the 5-phase ROOTS™ Framework" |
| Free value first | Whole video is free lessons | Free tools exist and are genuinely good | Keep, but change what happens after the result (see email capture) |
| Email capture mid-value | "One insight, one tool, one practice, every Tuesday, free" | ZERO email capture on the entire page | Highest-priority fix, Part 4 |
| Specific numbers as proof | $25M, $9B, 12 years, 11-year sentence | No numbers anywhere | Add member count, lesson count, citation count when true |
| Open loops | "That's where we go next" | Sections are self-contained | Add transition lines between sections |
| Story with stakes | Arup, Theranos | Origin story exists but is low and faceless | Move story above features, add photo |

---

## Part 4: What Is Missing Entirely (in priority order)

### P0-1: Email capture. The page has no way to catch the 97% who do not buy today.

This is the biggest revenue leak. A cold visitor lands, plays with a free tool, leaves, and you have no way to reach them again. Every guru page captures the email before or immediately after delivering free value.

Build this:
- After every free tool result, add an inline opt-in: "Want to track this number and learn what moves it? Get one insight, one tool, and one practical step every week. Free." Email field plus button.
- Required compliance line under the field: "Subscribe for weekly functional health education. By subscribing, you agree to receive educational content. Not medical advice."
- Wire it to the existing n8n webhook flow (same pattern as the intake forms, new submission type like `newsletter`).
- Optional: exit-intent version of the same offer. One trigger only, not aggressive.

The free tools are already the lead magnet. They just currently give away the value and ask for nothing.

### P0-2: Social proof section. Zero testimonials anywhere.

Proof beats promise. Even 3 short member quotes outperform another paragraph of copy. Place it between the free tools and the pricing section.

Rules for every testimonial (non-negotiable, FTC):
- Real, verifiable, shared with written permission
- No health outcome guarantees, no "reversed my diabetes" claims. Frame around understanding, consistency, and confidence: "I finally understand what my numbers mean" is compliant and powerful
- Required disclaimer under the section: "Shared with permission. Individual results may vary and are not guaranteed. Not intended as medical advice."

If there are no testimonials yet, use a stat bar instead until there are: "X lessons in the ROOTS curriculum. X citations. Built by a PharmD, CFNMP, MBA." Only real numbers.

### P0-3: Dr. Hunter's face (see Part 2).

### P1-4: A "How it works" 3-step section.

Cold visitors do not know what happens after paying. Add three steps between Who This Is For and pricing: 1. Join and take the pattern check. 2. Start the ROOTS curriculum and daily tracking. 3. Watch your Weekly Report Card show what is moving. Reduces perceived effort, which is one of the four levers in the value equation.

### P1-5: FAQ section (objection handling).

Add above the final CTA. Questions to answer: Is this medical care? (No, education, and that is the point.) Do I need labs? What if I am on medication? Can I cancel? How much time per day? Each answer is 2 to 3 sentences, educational framing throughout.

### P1-6: Risk reversal, made loud.

"Cancel anytime" is buried in the pricing subtitle. Put it directly under the two main tier buttons: "Monthly plans: cancel anytime, two clicks, from Settings." If a trial or first-month guarantee is ever offered, it goes here. Do not invent one without deciding the terms first.

### P2-7: Open-loop transitions.

One line at the end of each section pointing to the next, guru style. Example after free tools: "The tools show you the pattern. The framework explains it. Here is how." Cheap to add, keeps the scroll going.

---

## Part 5: Section-by-Section Redlines (existing content)

1. Nav: fine. Consider changing "See Pricing" to "Become a Member" (identity language converts better than transaction language).
2. Hero: apply Part 1. One primary CTA, demote the second. Add photo or video.
3. Trust strip: move directly under the hero. Add headshot. Add one real number if available.
4. Free tools: strongest section on the page. Two changes: add the email capture after results (P0-1), and change the post-result CTA from "See Membership Options" to something with less commitment jump, like "See how members track this" for tools, keeping one pricing CTA per tool rather than two.
5. Who This Is For: good. Keep.
6. ROOTS Framework: keep, but tease it earlier in the hero sub-line so the name lands twice.
7. Features grid: 10 cards is a wall. Lead with the top 4 (BP Tracker, AI Meal Guard, Daily Command Center, Weekly Report Card) and put the remaining 6 behind a "See everything included" expander. Fewer choices, more scroll momentum.
8. Origin story: move above the features grid, add photo, and open with the story line first, credentials second. The current version leads with credentials, which is backwards for story impact.
9. Privacy band: genuinely differentiating, keep as is. Almost no competitor can claim it. Consider one line sharper: "Most health apps sell your data. This one cannot, because it never collects it."
10. Pricing: keep high-to-low anchoring (the $4,997 tier makes $97 feel small; that is working as intended). Verify the scarcity claims are literally true ("Limited to 3 active clients," "10 seats"). If they are not actively enforced, remove them; fake scarcity is an FTC problem and a trust killer. Add risk reversal line under CTAs (P1-6).
11. Final CTA: add the face here too, or a one-line testimonial above the button.
12. Footer and disclaimers: compliant, keep.

---

## Part 6: Optional Hero Video (60 to 90 seconds, guru structure)

If Dr. Hunter records one, this is the outline. Face to camera, no production tricks needed.

1. 0:00-0:08 interrupt: "If your doctor ever said the word borderline and then said nothing else, this is for you."
2. 0:08-0:20 authority, one breath: "I am a Doctor of Pharmacy and a Certified Functional and Nutritional Medicine Practitioner, and I reversed my own metabolic condition when the standard answers were not coming."
3. 0:20-0:50 the payoff promise: what ROOTS is, what members actually do daily, one specific example.
4. 0:50-1:15 free value bridge: "Try the five free tools below right now, no account needed."
5. 1:15-1:30 CTA: "When you are ready to go deeper, membership starts at $37 a month."

End card disclaimer: "For educational purposes only. Not medical advice."

---

## Part 7: Compliance Guardrails for All New Copy

Every new line the developer adds must pass these:
- "Clients" or "members," never "patients." "Sessions" or "clarity calls," never "consultations" or "appointments."
- No diagnose, treat, cure, manage (a condition), prescribe, or heal. Use support, understand, optimize, educate.
- No health outcome guarantees anywhere, including testimonials.
- Testimonial disclaimer (exact text in P0-2) on any proof section.
- Email opt-in disclaimer (exact text in P0-1) on any capture form.
- Scarcity claims must be literally true and enforced.
- No em dashes in any copy. House style.

---

## Part 8: The Punch List (hand this to the developer as-is)

| # | Change | Priority | Effort |
|---|---|---|---|
| 1 | Email capture after free tool results, wired to n8n | P0 | Medium |
| 2 | Dr. Hunter photo in hero and origin story | P0 | Small (needs photos) |
| 3 | Testimonial/proof section above pricing, with disclaimer | P0 | Small |
| 4 | Hero: one primary CTA, sharpened headline, ROOTS teased in sub-line | P0 | Small |
| 5 | Move trust strip under hero, add headshot | P1 | Small |
| 6 | How It Works 3-step section | P1 | Small |
| 7 | FAQ section above final CTA | P1 | Small |
| 8 | Risk reversal line under pricing CTAs | P1 | Tiny |
| 9 | Features grid: top 4 plus expander | P1 | Small |
| 10 | Move origin story above features, story-first rewrite | P1 | Small |
| 11 | Verify or remove scarcity claims | P1 | Tiny |
| 12 | Open-loop transition lines between sections | P2 | Tiny |
| 13 | Hero video (needs recording first) | P2 | Medium |

Ship order: 1 through 4 first. Those four alone change the page from "informational" to "converting." Everything else compounds on top.

---

## Part 9: What Is Working Right Now (2026 research, not opinion)

Current published data on converting pages, checked July 2026:

- Health and wellness landing pages convert at a 5.1% median; top performers hit 8 to 10%. Course and membership pages run 5 to 15%. Below 2% means the page needs work. Baseline your current rate before shipping anything.
- Headlines that speak to the visitor's outcome beat credential-led headlines. This confirms the hero rewrite: lead with their problem ("your numbers"), put the credentials one line below.
- Video testimonials outperform text testimonials by roughly 80%. If any member will record 30 seconds on a phone, use it over a written quote.
- 92% of consumers read testimonials before buying, and proof placed early beats proof near the footer. Confirms placing the proof section before pricing, not after.
- Social proof and value proposition need to land within the first 8 seconds, and pages loading around 2.4 seconds convert about twice as well as slow ones. Ask the developer to check the Lighthouse score after adding images; compress the feature JPEGs.
- First-person CTAs convert up to 90% better. Change button copy from "Start The Program" to "Start My Program," "See Membership Options" to "Show Me the Membership Options" where it reads naturally.
- A visible guarantee can lift conversions 30%+. Reinforces P1-6: make "cancel anytime" loud, and consider a defined first-14-days promise on monthly plans if you decide to offer one.
- Mobile-optimized pages convert 67% better; roughly 73% of course buyers research on mobile. Have the developer QA every new section on a phone first, especially the tool inputs and email capture.
- Forms with 3 fields or fewer win. The email capture should be email only, nothing else.

Sources:
[Landerlab benchmarks](https://landerlab.io/blog/landing-page-conversion-rate), [SEO Sherpa landing page statistics](https://seosherpa.com/landing-page-statistics/), [COREPPC 2026 benchmarks](https://coreppc.com/blog/landing-page-conversion-rate-benchmarks-2026/), [ConvertFlow health landing pages](https://www.convertflow.com/campaigns/health-landing-pages), [Landingi healthcare best practices](https://landingi.com/landing-page/healthcare-best-practices/), [New Zenler creator best practices 2026](https://www.newzenler.com/blog/landing-page-best-practices-creators-2026), [Unicorn Platform course pages 2026](https://unicornplatform.com/blog/online-course-landing-pages-in-2026/), [LearnWorlds course landing pages](https://www.learnworlds.com/course-landing-page-with-examples/), [MemberPress optimization tips](https://memberpress.com/blog/optimize-course-landing-page/)

---

## Success Metrics (check 30 days after shipping P0 items)

- Email opt-in rate on free tool results (target: 10%+ of tool completions)
- Scroll depth past the hero (target: 60%+ reach pricing)
- Free tool completion rate
- Visitor-to-paid conversion (baseline it now, before changes, or there is nothing to compare against)
