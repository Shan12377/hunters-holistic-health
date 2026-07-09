---
name: seo-master
description: The complete end-to-end SEO domination system — keyword research, site architecture, blog posts at scale, service+city pages, on-page optimization (80+ signals), technical SEO (Core Web Vitals, sitemaps, schema), local SEO and Google Business Profile, off-page link building, AI/LLM search visibility (GEO), deployment, and rank tracking. Use this skill whenever the user mentions SEO, ranking on Google, keywords, blog posts for a website, service pages, landing pages for a local business, "why am I not ranking," site audits, Lighthouse or PageSpeed scores, Google Search Console, backlinks, local search, map pack, appearing in ChatGPT/Perplexity answers, organic traffic, or growing any business through search — even if they don't say "SEO" explicitly. Also trigger for "write a blog post for my site," "build me pages for my services," "audit my website," or "help my business get found online."
version: 1.0.0
---

# SEO Master

A complete operating system for ranking any business — local service, SaaS, e-commerce, content site, or personal brand — as high as possible on Google and in AI search answers. This skill condenses the playbooks of practitioners who generated $500K+ and ranked new sites in the top 3 within 24 hours, plus battle-tested audit, content, and local SEO frameworks.

**Core thesis:** Google's algorithm is a black box with 200+ signals, but it optimizes for one thing — serving content good enough that people come back. So the strategy is: (1) find winnable keywords, (2) reverse-engineer what already ranks, (3) produce genuinely better, more enjoyable content, (4) make the site technically flawless, (5) compound authority over time. Never promise the user a guaranteed #1 position — promise systematic execution of every controllable lever, faster than competitors can.

## Reality Check (internalize before every engagement)

- Top-of-funnel informational SEO is getting squeezed by AI Overviews. Prioritize mid/bottom-funnel and local.
- Local SEO is alive and thriving — map packs aren't going anywhere, and local competitors are usually unsophisticated (10-year-old sites, no technical optimization). This is the biggest arbitrage.
- Ranking well in SEO ≈ ranking well in AI SEO. LLMs cite what already ranks. There is no secret GEO trick beyond foundational SEO plus a few extras (see `references/ai-search.md`).
- Content is king, but only content people actually enjoy reading. AI slop bounces; bounce kills rankings.
- Velocity discipline: never dump hundreds of pages at once. Ramp publishing gradually (day 1: one post, day 3: two, week 2: 3-4/day max) or Google flags the spike.

## Intake — Gather Before Any Work

Ask only for what's missing from context:

1. **Business**: name, what it does, business type (local/service, SaaS, e-commerce, content, creator/agency)
2. **Location + service area** (if local): home city, all cities/municipalities served
3. **Services/products**: complete list
4. **Website state**: URL, platform/stack, or "doesn't exist yet"
5. **Goal + conversion event**: calls, form fills, purchases, signups
6. **Competitors**: top 3-5 (in business and in search results)
7. **Assets**: existing content, GBP status, Search Console access, review count
8. **Voice material**: LinkedIn posts, emails, call transcripts, videos — anything showing how the owner talks (critical for content that doesn't sound like AI)

If the user just says "make me rank," proceed with sensible defaults and state assumptions inline rather than interrogating them.

## The Master Workflow

Execute phases in order for a new engagement; jump to the relevant phase for a targeted request. Each phase points to a reference file — read it before executing that phase.

### Phase 0 — Site Foundation (new sites only)
Read `references/site-build.md`.
Build with **static site generation** (Next.js SSG or equivalent) — non-negotiable. Google must receive complete HTML instantly (the "pizza is already made" principle). Client-side rendering is an SEO death sentence. Clone a strong design reference (Dribbble screenshot or Figma export via Anima) so the site doesn't look vibe-coded. Set up GitHub + Vercel deployment from day one.

### Phase 1 — Keyword Research & Strategy
Read `references/keyword-research.md`.
Find winnable keywords: KD ≤ 30, volume ≥ 100, correct intent, not competitor brand names. Build three buckets: **money keywords** (service+city, commercial intent, high CPC), **informational keywords** (blog posts, keyword clusters), and **adjacent/funnel keywords** (capture prospects before they're ready to buy). Output a prioritized CSV the rest of the workflow consumes.

### Phase 2 — Content Strategy & Prioritization
Read `references/content-strategy.md`.
Bottom-funnel first, always. Organize into 5-8 topic clusters, each with a pillar page planned *after* 3+ supporting posts exist. Map every keyword to a content type and funnel stage. Set publishing cadence with velocity discipline.

### Phase 3 — Voice Training (before writing anything)
Read `references/voice-and-content.md`.
Build the voice reference system: `voice.md`, `humor.md`, `opinions.md`, `stats.md`, `stories.md` from the user's real material. This is what separates content people read from content people bounce off. If the user has no material, use the reference file's fallback humor framework. Never skip this phase — it is the single biggest quality differentiator.

### Phase 4 — Blog Posts at Scale
Read `references/blog-post-writer.md`.
For each keyword: build the keyword cluster → **steal the winning format** (analyze top 3 ranking pages: word count, H2 structure, image count, topics covered — take the average as your spec) → write in the trained voice → optimize against the on-page checklist → add images (Pexels API or equivalent, always with alt text) → internal + external links → meta title/description → FAQ section.

### Phase 5 — Service Pages (the money pages)
Read `references/service-pages.md`.
The zipper method: services × cities matrix, one page per cell. Each page genuinely unique — local landmarks, neighborhood lists, location-specific FAQs, common local problems — never find-and-replace city names. Reuse the proven highest-converting page layout for every service page. Be tasteful with volume: dozens are fine, thousands is a spam signal.

### Phase 6 — On-Page Optimization
Read `references/on-page-checklist.md`.
Run every page through the 80+ signal checklist: title tags, metas, heading hierarchy, keyword placement, internal/external links, image optimization, schema. Critical constraint: **optimize without destroying the voice.** If a fix makes the page boring, find another way to satisfy the signal.

### Phase 7 — Technical SEO
Read `references/technical-seo.md`.
Sitemap.xml, robots.txt, canonical strategy, Core Web Vitals, mobile-first, HTTPS, schema markup. Run Lighthouse/PageSpeed, paste the full report back into the loop, fix until 100/100/100/100 (or as close as the stack allows). Iterate — "we didn't hit 100, here's why" and go again.

### Phase 8 — Local SEO & Google Business Profile (local businesses)
Read `references/local-seo.md`.
GBP optimization checklist, NAP consistency audit, citation building (tiered directories), review generation campaign with SMS/email templates, LocalBusiness schema, map pack strategy. Keep GBP and website information perfectly consistent.

### Phase 9 — Off-Page & Authority
Read `references/off-page.md`.
Only the four legit methods: broken backlink swapping, guest posting, HARO-style journalist queries, paid placements on genuinely reputable domains. **Hard rule: never PBNs, never "100 backlinks for $5," never link farms** — these permanently damage or blacklist sites. When in doubt, skip off-page entirely and out-content the competition instead.

### Phase 10 — AI Search / LLM Visibility (GEO)
Read `references/ai-search.md`.
Foundational SEO is 90% of it. The extra 10%: llms.txt, conversational FAQ blocks, specific citable claims and structured data, entity/E-E-A-T pages, comprehensive homepage optimization.

### Phase 11 — Deploy, Index, Measure
Read `references/launch-and-measure.md`.
GitHub → Vercel deploy, custom domain, Search Console verification (HTML meta tag), sitemap submission, request indexing for priority pages (≈10/day limit), Google Analytics, rank tracking, landing page conversion testing. Set up the tracking log.

### Phase 12 — Automation & Skills
Read `references/automation.md`.
Once the manual loop is proven, bottle it: create a project-specific `blog` skill and `service-page` skill that chain the whole pipeline from a single keyword. Optionally wire external automations (Make/n8n: sheet-triggered content generation, social repurposing). Automation only after quality is proven — automating slop just produces slop faster.

## Audit Mode (existing sites)

When the user says "audit my site," "why am I not ranking," or similar — skip to `references/site-audit.md`. Priority order: (1) can Google find and index it, (2) is it fast and functional, (3) is content optimized, (4) does content deserve to rank, (5) does it have authority. Output format: executive summary (health verdict + top 3-5 killers + quick wins today), then per-issue: Issue / Impact / Evidence / Fix / Priority. No 50-page reports — fix-oriented, prioritized by impact.

## Non-Negotiable Quality Rules (apply to ALL content this skill produces)

1. **No AI slop.** Banned openers: "In today's fast-paced world," "In this comprehensive guide," "more important than ever." Banned words: delve, tapestry, landscape, realm, robust, seamlessly, leverage, game-changer, crucial, pivotal, holistic, cutting-edge, transformative, unlock, supercharge, navigate (metaphorical), elevate. No em-dash overuse. See the full list in `references/voice-and-content.md`.
2. **Voice survives optimization.** Every SEO pass ends with a read-aloud check: would a real person keep reading?
3. **Unique pages only.** Every service+city page must contain content that could not exist on any other page.
4. **Specificity over vagueness.** Real numbers, real stories, real opinions. Specific claims are also what LLMs cite.
5. **Never fabricate stats, reviews, credentials, or E-E-A-T signals.** Use the business's real data or none.
6. **Ethical only.** No cloaking, no doorway spam at scale, no PBNs, no fake reviews, no scraping competitor content verbatim. Reverse-engineering structure is fine; copying content is not.
7. **Velocity discipline** on publishing (see Reality Check).

## Output Conventions

- When building/editing a site: produce actual files, deploy-ready, static-generated.
- When writing content: deliver the full page/post as a file (markdown or the site's format), including meta title (≤60 chars), meta description (≤155 chars), URL slug, schema block, and internal link suggestions.
- When auditing: deliver the prioritized audit report format above.
- When strategizing: deliver the keyword CSV / content calendar / cluster map as real files the user can work from.
- Always end an engagement phase by stating what was done, what's next in the master workflow, and any decisions needed from the user.