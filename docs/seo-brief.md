# SEO Brief — Hunter's Holistic Health
### Playwright-Verified Audit · July 7, 2026

**Business:** Hunter's Holistic Health  
**URL:** https://www.huntersholistichealth.com  
**Owner:** Dr. Shallanda Hunter, CFNMP, PharmD, MBA  
**Audited by:** Live browser inspection of the deployed site using Playwright automation

---

## What Was Actually Found on the Live Site

This brief is based on direct inspection of the deployed website, not assumptions. Every finding below was confirmed by either loading the page in a browser, reading the DOM, or checking Google search results directly.

---

## Critical Problems (Fix These First)

### Problem 1: robots.txt and sitemap.xml Are Not Accessible

**What should happen:** A crawler visiting `https://www.huntersholistichealth.com/robots.txt` should receive a plain text file. A crawler visiting `/sitemap.xml` should receive an XML file.

**What actually happens:** Both URLs return the homepage HTML. The SPA's catch-all routing is intercepting these requests before the static files can be served.

**Confirmed:** Playwright navigation to both URLs redirected to `https://www.huntersholistichealth.com/` and returned the React app instead of the files.

**Why this matters:** Google cannot read your robots.txt or sitemap. It has never successfully fetched your sitemap. Every crawl directive and every page submission in that sitemap has been invisible to Google.

**The fix:** Update `vercel.json`. The current catch-all rewrite intercepts everything:

```json
{ "source": "/(.*)", "destination": "/index.html" }
```

It needs to explicitly exclude static files so they are served before the SPA fallback kicks in:

```json
{ "source": "/((?!robots\\.txt|sitemap\\.xml|google.*\\.html|\\.well-known).*)", "destination": "/index.html" }
```

**Note to developer:** The `public/robots.txt` and `public/sitemap.xml` files exist in the local repo. The most likely root cause is that the latest code (commit `a7d5e5f` — "SEO: robots.txt, sitemap.xml, per-page meta tags") has not been deployed to Vercel. Deploying the current code will fix this if the vercel.json is also updated.

---

### Problem 2: An Old Page Is Still Indexed by Google

**What Google has indexed:** `https://www.huntersholistichealth.com/glycemic-calcu...` (a glycemic calculator page from the old website).

**What happens when you visit it now:** Playwright confirmed that navigating to `/glycemic-calculator` returns a 200 OK response with the homepage content — not a 404. This is because the SPA serves `index.html` for every unknown path.

**Why this is a problem:** Google sees a page with a URL that suggests a glycemic calculator, but the content is the homepage. This creates a duplicate content signal, wastes crawl budget, and confuses what your site is about. Google will not remove it automatically. It must be explicitly requested.

**The fix (two steps):**
1. Submit a URL removal request in Google Search Console for `https://www.huntersholistichealth.com/glycemic-calculator` (and any variation of that URL that appears indexed).
2. If possible, configure Vercel to return a proper 404 response for paths that do not match any known route. This prevents old URLs from silently returning the homepage.

---

### Problem 3: Google Is Showing the Wrong Homepage Title and Description

**What Google shows:**
- Title: `Hunter's Holistic Health`
- Description: `Hunter's Holistic Health - Functional Medicine Education Platform.`

**What the title and description should say:**
- Title: `Hunter's Holistic Health | Functional Medicine Education`
- Description: `Evidence-informed functional medicine education. Track your metabolic health, implement the ROOTS Framework, and understand your numbers with Dr. Shallanda Hunter, CFNMP.`

**Why this is happening:** Google operates in two waves when crawling a JavaScript-rendered site.

- **Wave 1 (fast):** Google fetches the raw HTML file from the server. Before React loads, the page contains whatever is in `index.html`. The currently deployed `index.html` appears to have the old title and description from before the SEO updates. This is what Google indexed.
- **Wave 2 (slow, days to weeks):** Google renders the JavaScript. At this point, React mounts and the correct meta tags are injected. But Google may not have completed this pass yet, or may be preferring the Wave 1 data.

**Confirmed by Playwright:** A fresh navigation to the homepage showed the old title ("Hunter's Holistic Health") and wrong description before React had time to mount. A subsequent evaluation after React mounted showed the correct tags. This gap is exactly what Google's Wave 1 crawl sees.

**The fix:**
1. Deploy the latest code — the current local `index.html` has the correct title, description, and Open Graph tags.
2. After deploying, go to Google Search Console → URL Inspection → enter `https://www.huntersholistichealth.com/` → click "Request Indexing." This forces Google to re-crawl with updated content.

---

### Problem 4: No Canonical Tags on Any Page

**What was found:** Not a single page on the site has a `<link rel="canonical">` tag. Confirmed for the homepage, /tools, and /bp-simulator.

**Why this matters:** Without a canonical tag, Google cannot confirm which URL is the authoritative version of a page. Since the apex domain redirects to www, there are two URLs that could resolve to the same content. Google has to guess which is canonical. If it guesses wrong, link equity gets split.

**The fix:** Add `<link rel="canonical" href="https://www.huntersholistichealth.com/[path]">` to the `<head>` of every public page. This is a developer task. Each page's React component already sets its own meta tags — the canonical tag should be added in the same place.

---

## What Was Confirmed Working

These items are functioning correctly and do not need to be rebuilt — just need Google to catch up.

| Item | Status | Notes |
|------|--------|-------|
| Homepage H1 | ✅ Correct | "You have had the numbers for years. Nobody explained them. That changes now." |
| /tools meta tags | ✅ Correct | Title, description, OG tags all set correctly by React |
| /bp-simulator meta tags | ✅ Correct | Title, description, OG tags all set correctly by React |
| Homepage OG tags (after React mounts) | ✅ Correct | All present when React has fully loaded |
| Theme color | ✅ Present | `#0B9E8E` in meta |
| Google verification file | ✅ In repo | `google816d137015ebe10f.html` — but may have same static-file serving problem as robots.txt |

---

## What Google Currently Has Indexed

Confirmed by running `site:huntersholistichealth.com` in Google:

| Indexed URL | Title Google Shows | Notes |
|-------------|-------------------|-------|
| `https://www.huntersholistichealth.com/` | Hunter's Holistic Health | Wrong — missing "Functional Medicine Education" |
| `https://www.huntersholistichealth.com/privacy` | Privacy Policy - Hunter's Holistic Health | Acceptable — content pulled from page body |
| `https://www.huntersholistichealth.com/shop` | Creatine does more than build muscle. Most people have no... | Google pulled the page's H1 |
| `https://www.huntersholistichealth.com/glycemic-calcu...` | Hunter's Holistic Health | **OLD PAGE — does not exist. Must be removed.** |

**Pages NOT yet indexed** (should be, once sitemap is fixed):
- `/tools`
- `/bp-simulator`
- `/blog/creatine-not-what-you-think`
- `/blog/rebounding-benefits`
- `/protocol/parasite-cleanse`

---

## The Correct Content (Source of Truth)

### Business Overview

Hunter's Holistic Health is a private, subscription-based functional medicine education platform. It is **not** a clinical practice, a coaching service, or a health app.

- **Dr. Hunter's correct title:** Dr. Shallanda Hunter, CFNMP, PharmD, MBA — Certified Functional and Nutritional Medicine Practitioner. Licensed pharmacist. Always list in this order.
- **Canonical domain:** `https://www.huntersholistichealth.com` — always use www. All links and listings must use www.
- **Tagline:** "Lasting health starts at the roots."

### The ROOTS Framework — Correct Definitions

> **Warning:** An older version using "Repair, Oxygenate, Toxin Removal, Sleep and Stress" has been in circulation and is likely what appeared in early indexed content. Use ONLY the definitions below.

**R — Review**  
*"You cannot build on what you do not understand."*  
Understanding your health history, lab results in plain language, medications, supplements, and daily habits as one connected picture. Not a list of separate problems.

**O — Optimize Nutrition**  
*"Not a generic handout. An education in how to eat for your body."*  
Nutrition education tailored to an individual's metabolism. Covers meal structure, food and hormone relationships, strategic meal timing, and culturally relevant food choices.

**O — Optimize Biochemical Balance**  
*"Supplement education. Interaction awareness. Quality standards."*  
Evidence-informed supplement education, nutrient interaction awareness, reading lab trends, and USP product quality standards.  
*Required disclaimer:* "These statements have not been evaluated by the Food and Drug Administration. This is not intended to diagnose, treat, cure, or prevent any disease."

**T — Transform Lifestyle Factors**  
*"Most people never connect these dots. When you do, everything shifts."*  
Sleep quality, circadian rhythm, stress and cortisol awareness, movement for metabolic health, environmental toxin awareness, and habit architecture.

**S — Sustain and Adapt**  
*"Not a one-time fix. A way of thinking that stays with you."*  
Long-term metabolic monitoring, course-correction when life shifts, habit maintenance, and building a sustainable health infrastructure.

---

## Pages to Index

| URL | Priority | Correct Title Format |
|-----|----------|---------------------|
| `/` | High | Hunter's Holistic Health \| Functional Medicine Education |
| `/tools` | High | Free Metabolic Health Tools \| Hunter's Holistic Health |
| `/bp-simulator` | High | Blood Pressure Zone Simulator \| Hunter's Holistic Health |
| `/shop` | Medium | Creatine Bundle \| Hunter's Holistic Health |
| `/blog/creatine-not-what-you-think` | Medium | (from page) |
| `/blog/rebounding-benefits` | Medium | (from page) |
| `/protocol/parasite-cleanse` | Medium | (from page) |
| `/privacy` | Low | Privacy Policy \| Hunter's Holistic Health |
| `/terms` | Low | Terms of Service \| Hunter's Holistic Health |

## Pages to Block from Indexing

- `/login`, `/signup`, `/reset-password`
- `/dashboard`, `/app/*`, `/client/*`, `/coach/*`
- `/support`, `/feature-request`, `/clinical-inquiry`
- `/api/*`

---

## Membership Tiers (for schema markup accuracy)

| Tier | Monthly | Annual |
|------|---------|--------|
| Foundation | $37/mo | $297/yr |
| The Program | $97/mo | $797/yr |
| VIP: The Intensive | $997/mo | $9,970/yr |
| 6-Month Functional Overhaul | $4,997 one-time | — |

---

## Terminology Rules

| Use | Never Use |
|-----|-----------|
| Functional Medicine Educator | Coach, health coach, wellness coach |
| Educational platform | Medical care, treatment, therapy, clinical services |
| Evidence-informed | Evidence-based |
| Understand your numbers | Improve your health, fix your, cure, treat, heal |
| Dr. Shallanda Hunter, CFNMP, PharmD, MBA | MD, physician, doctor of medicine |
| www.huntersholistichealth.com | huntersholistichealth.com (no www) |

---

## Priority Checklist for the Specialist

**Week 1 (critical — blocks everything else):**
- [ ] Confirm with developer that latest code is deployed to Vercel (commit `a7d5e5f` or later)
- [ ] Verify `robots.txt` is accessible at `https://www.huntersholistichealth.com/robots.txt` (should return plain text, not HTML)
- [ ] Verify `sitemap.xml` is accessible at `https://www.huntersholistichealth.com/sitemap.xml` (should return XML, not HTML)
- [ ] If either is broken, ask developer to update `vercel.json` (see Problem 1 above)
- [ ] Submit sitemap in Google Search Console once it is accessible
- [ ] Submit URL removal request for `https://www.huntersholistichealth.com/glycemic-calculator` in Google Search Console

**Week 1 (high priority):**
- [ ] Use URL Inspection in Google Search Console to request re-indexing of the homepage
- [ ] Check whether the Google verification file `/google816d137015ebe10f.html` is accessible (likely has the same problem as robots.txt)
- [ ] Search `site:huntersholistichealth.com` and document every indexed URL — remove any that do not exist on the current site
- [ ] Audit any Google Business Profile, Healthgrades, or directory listings that may contain old website content

**Week 2 (fix and submit):**
- [ ] Ask developer to add `<link rel="canonical">` to every public page
- [ ] Submit individual URL inspection requests for `/tools`, `/bp-simulator`, and both blog posts once sitemap is working
- [ ] Implement `Organization` and `Person` schema markup on the homepage
- [ ] Implement `FAQPage` schema for the FAQ section on the homepage (FAQ content already exists on the page)
- [ ] Add `lastmod` dates to the sitemap entries

**Ongoing:**
- [ ] Monitor Google Search Console for crawl errors and indexing status
- [ ] Review Core Web Vitals — the SPA architecture can affect LCP scores
- [ ] Consider whether the site would benefit from server-side rendering or prerendering for key landing pages — this would make Wave 1 crawl data correct without relying on JavaScript execution

---

## Technical Context for the Specialist

**Platform:** Vite + React (SPA — Single Page Application). Content is rendered by JavaScript in the browser. Google processes this in two waves: a fast raw HTML pass (Wave 1) and a slower JavaScript rendering pass (Wave 2, can take days to weeks). The title and description Google currently shows are from Wave 1, using stale data.

**Deployment:** Vercel. API routes live in `/api/*.ts`. Static files live in `/public/` and should be served from `/dist/` after build. The `vercel.json` file controls routing.

**Key file locations:**
- `public/robots.txt` — crawl directives
- `public/sitemap.xml` — 9 URLs listed
- `public/google816d137015ebe10f.html` — Google Search Console verification
- `index.html` — the SPA shell served to all routes; contains default meta tags
- `vercel.json` — routing and build configuration

---

*Hunter's Holistic Health — Dr. Shallanda Hunter, CFNMP, PharmD, MBA — www.huntersholistichealth.com — Playwright-audited July 7, 2026*
