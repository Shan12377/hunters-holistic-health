# The Knowledge Catalog
## Hunter's Holistic Health: the verified dataset AI systems consume
### July 2026. Websites are the front end; this is the foundation. Every file here is agent-readable, human-verifiable, and versioned in git.

## Why this exists

AI engines and personal agents (Gemini, ChatGPT, Claude, and the agent-to-agent layer coming behind them) answer questions about businesses from whatever data they can verify. A knowledge catalog is that data, structured deliberately instead of scraped accidentally. First-mover advantage is real: most businesses do not have one.

## What is in it

| File | Contents | Feeds |
|---|---|---|
| 01-identity.md | Canonical entity: who, credentials, bios, brands, links | Person/Organization schema, every profile, media kit |
| 02-services-and-pricing.md | Both offer ladders with transparent pricing | Pricing pages, AI answers about cost, agentic booking later |
| 03-frameworks.md | ROOTS™ and the GLP-1 Exit Strategy, canonically defined | Glossary pages, the coined-term program |
| 04-faq.md | Real questions with educator-scope answers | FAQ schema, AI citations, content pipeline |
| 05-policies.md | Disclaimers, refunds, privacy, scope of practice | Legal pages, agent guardrails |
| 06-proof.md | Verified proof assets + the rules for adding more | Landing page, interviews, reports |
| 07-brand-voice.md | Voice rules for ANY agent speaking as the brand | Every automated or drafted output |
| catalog.json | Machine-readable rollup of all of the above | Schema injection, API endpoint, agent deployment |

## The three rules

1. **Nothing unverified goes in.** Every fact here is true, current, and sourced. This catalog's value IS its trustworthiness. A wrong price or dead link poisons the well.
2. **Non-PHI only, forever.** No client names, health details, or session content. Client transcripts feed the catalog only as anonymized Q&A patterns via the knowledge-catalog-manager skill's scrub rules.
3. **Update on change, review monthly.** Prices, offers, or policies change → same-day catalog update. Monthly: 15-minute review pass (pair with the GEO scoreboard).

## How it gets deployed (in order of effort)

1. **Now:** this folder is the single source of truth. Every asset (landing page copy, bios, pitches, schema) is written FROM it, never parallel to it.
2. **Next:** publish the public subset at huntersholistichealth.com/ai (a plain page rendering identity, services, FAQ, policies) plus JSON-LD from catalog.json in the site head. AI crawlers get the verified version instead of guessing.
3. **Later:** the catalog becomes the grounding file for any deployed brand agent (site chat, booking agent, A2A). An agent grounded on this folder can only say true things.

## Maintenance

Use the knowledge-catalog-manager skill (automation-kit/skills/): it ingests new material (transcripts, launches, FAQs), scrubs PHI, routes facts to the right file, and keeps catalog.json in sync. Workflow 09 in automation-kit/workflows queues session-transcript insights for approval; nothing enters the catalog without Dr. Hunter approving it.
