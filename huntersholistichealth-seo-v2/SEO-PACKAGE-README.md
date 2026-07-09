# SEO Package v2 — Hunter's Holistic Health
### Corrected against the Playwright-verified brief · July 7, 2026

**Business:** Hunter's Holistic Health — a private, subscription-based **functional medicine education platform** (not a clinical practice, coaching service, or app)
**Canonical URL:** https://www.huntersholistichealth.com (always www)
**Owner:** Dr. Shallanda Hunter, CFNMP, PharmD, MBA (list credentials in this order; never "MD" or "coach")
**Positioning:** Functional Medicine Education · "Lasting health starts at the roots."

---

## What changed from my first pass, and why

My first package was built on stale, JavaScript-delayed search cache data (the exact Wave 1 staleness your Playwright brief documents). It targeted the wrong niche (PCOS/Florida clinical), used the wrong ROOTS definitions, and framed the business as a clinical practice. **That package has been discarded.** This one is built on your brief as the source of truth.

Corrections applied throughout:
- Business is an **education platform**, not clinical care. Terminology rules enforced everywhere (see below).
- ROOTS = **Review, Optimize Nutrition, Optimize Biochemical Balance, Transform Lifestyle, Sustain and Adapt**.
- Content targets the **real** topic universe: metabolic tools, creatine, rebounding, parasites, "understand your numbers."
- Outcome language is strictly education-framed: no treat/cure/heal/fix, "evidence-informed" not "evidence-based," "understand your numbers" not "improve your health."

---

## Ranking reality (honest answer to "rank #1")

Nobody can guarantee a #1 position, and this brief actually explains why you're not indexed well yet: it's not a content problem, it's a **delivery problem**. Google is reading stale Wave 1 HTML because the latest code (commit `a7d5e5f`) likely isn't deployed and the SPA is intercepting robots.txt/sitemap.xml. Fix delivery first, then content wins compound. The single highest-leverage action in this whole package is deploying the code + `vercel.json` fix. Everything else is downstream of that.

---

## Optimize vs. build: the verdict

**Optimize (pages that exist but aren't indexed — get Google to catch up):**
- `/` — deploy correct title/meta, add canonical, request re-index
- `/tools` — already has correct meta per your brief; just needs indexing
- `/bp-simulator` — same
- `/shop` — Google pulled the H1; give it a proper title/meta
- `/blog/creatine-not-what-you-think`, `/blog/rebounding-benefits`, `/protocol/parasite-cleanse` — exist, not indexed; optimize + submit

**Build (new education posts to widen ranking surface around real topics):**
- 4 new posts delivered here, all in the education register, all ROOTS-aligned
- All target winnable, on-brand informational keywords

**Remove (do NOT rebuild — you said leave the old indexing):**
- `/glycemic-calculator` — old page, per your instruction I've left it; removal request stays optional in the checklist, not done here

---

## Terminology enforcement (applied to every file in this package)

| Used everywhere | Never used |
|---|---|
| Functional Medicine Educator, education platform | coach, clinical care, treatment, therapy |
| evidence-informed | evidence-based |
| understand your numbers | fix/cure/heal/treat your health |
| Dr. Shallanda Hunter, CFNMP, PharmD, MBA | MD, physician |
| www.huntersholistichealth.com | non-www |

Required supplement disclaimer appears on any biochemical/supplement content: *"These statements have not been evaluated by the Food and Drug Administration. This is not intended to diagnose, treat, cure, or prevent any disease."*

---

## Files in this package

- `SEO-PACKAGE-README.md` (this file)
- `keywords.csv` — on-brand keyword map (education/tools/supplement-education buckets)
- `content-calendar.csv` — publish plan with velocity discipline
- `optimization/existing-pages-optimization.md` — per-page fixes for the 7 pages that exist but aren't indexed
- `posts/` — 4 new publish-ready education posts (creatine follow-up, rebounding-honest, metabolic-numbers, ROOTS-explainer)
- `technical/vercel-and-routing-fix.md` — the vercel.json fix, canonical strategy, 404 handling
- `technical/schema-organization-person-faq.md` — Organization + Person + FAQPage JSON-LD
- `technical/sitemap.xml` — corrected sitemap with lastmod
- `technical/robots.txt`, `technical/llms.txt`

---

## Priority checklist (mirrors your brief, deduplicated)

**Week 1 — unblocks everything:**
1. Confirm commit `a7d5e5f`+ is deployed to Vercel.
2. Apply the `vercel.json` static-file exclusion (technical/vercel-and-routing-fix.md).
3. Verify /robots.txt returns text, /sitemap.xml returns XML, /google816d137015ebe10f.html returns the verification file.
4. Submit sitemap in GSC; request re-index of `/`.
5. (Left per your instruction: old /glycemic-calculator removal — optional.)

**Week 1 — high:**
6. Add Organization + Person + FAQPage schema to homepage (technical/schema file).
7. site: audit — note every indexed URL.

**Week 2 — fix + submit:**
8. Add canonical tags to every public page.
9. Request indexing for /tools, /bp-simulator, /shop, and the blog/protocol pages.
10. Publish new posts per calendar cadence (never batch-dump).
11. Add lastmod to sitemap on each update.

**Ongoing:** GSC monitoring, Core Web Vitals (SPA LCP risk — consider prerender/SSR for key landing pages), quarterly re-audit + AI-answer spot checks.
