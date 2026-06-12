# Competitive Analysis: Hunter's Holistic Health (HHH)

Research date: June 2026. Sources: vendor sites, 2026 software comparisons (Capterra, GetApp, Software Advice, ProMealPlan), FTC enforcement records, and class action filings.

This document compares HHH against the major platforms serving functional medicine practitioners, health educators, dietitians, and consumer wellness users. It ends with a prioritized feature roadmap. Features no competitor has are ranked highest.

---

## Part 1: Competitor Profiles

### 1. Practice Better

**What it is:** The market leader for functional medicine and nutrition practice management. 50,000+ practitioners. Free Sprout plan (3 clients), Starter at $25/mo.

**Features they have:**
- Protocol builder and repeatable program delivery
- Client portal with journaling, habit tracking, goal setting
- Telehealth, scheduling, invoicing, charting
- Multi-jurisdiction compliance (HIPAA, PIPEDA, GDPR)
- Fullscript integration

**What they are missing (HHH opportunity):**
- No AI meal analysis for clients (HHH has AI Meal Guard)
- No letter-grade consistency scoring (HHH Weekly Grade Report Card)
- No "Late Slip" style structured accountability mechanic
- No built-in BP tracking with AHA/ACC educational zones
- Client engagement is passive; nothing gamified or social

**Compliance posture:** Strong on HIPAA. Their marketing uses "coach" and "practitioner" loosely, which creates scope-of-practice ambiguity HHH avoids with the Functional Medicine Educator framing.

### 2. Healthie

**What it is:** US-focused EHR for nutrition and wellness, now pivoting to enterprise via its API-first Healthie+ product. Core $19/mo to Group $149/mo.

**Features they have:**
- Insurance billing (CMS-1500), the strongest billing in the category
- Food journaling with photo logging
- Group coaching and shared care plans
- Extensive wearable integrations including Dexcom CGM
- Lab integrations and program builders

**What they are missing:**
- Enterprise pivot is leaving solo educators behind; onboarding is heavy for a one-person practice
- No AI-powered meal feedback
- No consistency grading or streak mechanics
- No structured non-PHI intake gateway separating wellness data from clinical data

**Compliance posture:** Solid HIPAA stack, but their model encourages all client data into one bucket. HHH's two-lane architecture (non-PHI app, separate covered clinical lane) is a structural advantage no competitor markets.

### 3. Noom

**What it is:** Consumer behavior-change weight loss app built on CBT principles. ~$59/mo or $199/yr. Color-coded food system, daily psychology lessons, human + group coaching.

**Features they have:**
- Daily CBT-based micro-lessons
- Personal coach assignment and group accountability
- Color-coded food guidance by calorie density

**What they are missing:**
- No practitioner side at all; coaches are not clinicians
- No supplement, BP, or lab awareness
- No data ownership or export culture

**Compliance posture (weakest in this analysis):** Noom paid a $56 million class action settlement (plus $6 million in credits) over dark-pattern auto-renewal and obstructed cancellation, with 1,000+ BBB complaints. The FTC has an active enforcement posture on dark patterns and weight loss claims. HHH avoids this entire category by design: transparent pricing, no trial traps, education framing instead of outcome promises, and an account deletion button in Settings.

### 4. Cronometer

**What it is:** The deepest consumer nutrient tracker. Tracks 84 micronutrients. Gold tier ~$6 to $9/mo. Has a Pro version for practitioners to view client logs.

**Features they have:**
- Best-in-class micronutrient depth (vitamins, minerals, amino acids, omega ratios)
- Accurate, verified food database
- Practitioner dashboard (Cronometer Pro)

**What they are missing:**
- Pure tracking; zero behavior change, accountability, or education layer
- No protocols, no telehealth, no follow-up automation
- Data without interpretation; clients see numbers, not meaning

**Compliance posture:** Clean. But its weakness is strategic: it answers "what did I eat" and never "what should I do next." HHH's educational framing fills that gap.

### 5. MyFitnessPal

**What it is:** The biggest consumer food database (20M+ items). Premium $19.99/mo. Mass-market tracker.

**Features they have:**
- Massive food database and barcode scanning
- Broad fitness device integration
- Community forums

**What they are missing:**
- No coaching or educator model
- Crowd-sourced database is famously inaccurate
- No clinical or functional medicine awareness at all

**Compliance posture:** Has faced criticism on data sharing with advertisers. HHH's privacy-first stance (age instead of DOB, data minimization, no ad model) is a direct counter-position.

### 6. Heads Up Health

**What it is:** AI-powered clinical intelligence platform for practitioners. Aggregates wearables, labs, and records from 30,000+ organizations. Halo AI copilot answers questions over client data.

**Features they have:**
- Deep data aggregation (labs, wearables, diagnostics)
- AI clinical copilot and practice-specific AI agents
- Automated cohort reports and outcome validation

**What they are missing:**
- Data-heavy, engagement-light; no accountability mechanics for clients
- Priced and positioned for data-rich clinics, not solo educators
- AI operates over PHI, which concentrates compliance risk

**Compliance posture:** Their AI-over-PHI model requires BAAs everywhere and makes every AI vendor a compliance dependency. HHH keeps AI in the non-PHI lane only (Meal Guard sees food descriptions, never identity-linked health records). That is a defensible structural difference.

### 7. Fullscript

**What it is:** The dominant supplement dispensary and lab ordering platform. 300+ brands, 20,000+ products, 30+ EHR integrations. Free for practitioners; revenue from dispensing margin.

**Features they have:**
- Vetted supplement catalog and patient plans
- Lab ordering catalog
- EHR integrations

**What they are missing:**
- Not a practice platform; no client engagement between orders
- No adherence tracking after the supplement ships
- No protocol intelligence (interaction checks, FTC language review)

**Compliance posture:** Fine as a dispensary. The gap is post-purchase: nobody closes the loop on whether the client actually takes the protocol. HHH's Supplement Log plus the planned Protocol Builder workflow does exactly that, and HHH already integrates Fullscript rather than competing with it.

### 8. Nutrium

**What it is:** Portuguese platform, 350,000+ registered dietitians in 90+ countries. $25/mo unlimited clients. Strong clinical nutrition analysis.

**Features they have:**
- Dietary assessment with micronutrient breakdowns
- Meal planning, scheduling, telehealth, invoicing
- Client app for logging and messaging, 7 languages

**What they are missing:**
- Dietitian-centric; no functional medicine framing, no supplement protocols
- No accountability or grading mechanics
- No AI features of note

**Compliance posture:** GDPR-centric. Less tuned to US FTC structure/function claim rules; HHH enforces those rules in its AI prompts by design.

### 9. Other notable players

- **LivingMatrix:** Holds the IFM Matrix and Timeline license but is not a full EHR. Industry reviews confirm no platform has the IFM Matrix as a living artifact inside a complete practice system. Open gap.
- **OptiMantra, Power2Practice, Pabau, Clinicea:** Integrative medicine EMRs. Reviews cite heavy setup, UX complaints (Power2Practice especially), e-prescribing as paid add-ons, and weak functional medicine reporting. None target the educator (non-prescriber) segment at all.

---

## Part 2: Structural Advantages HHH Already Has

These are positions competitors cannot easily copy because they are architecture, not features:

1. **Two-lane architecture.** The app and n8n never touch PHI. The covered Google Workspace lane handles clinical material. No competitor markets a clean non-PHI engagement layer. This lowers cost, risk, and breach surface simultaneously.
2. **Educator framing.** "Functional Medicine Educator" sidesteps the scope-of-practice ambiguity that "health coach" platforms carry, and it is enforced in every prompt and page.
3. **Educational context, never diagnosis.** BP zones and Meal Guard outputs are framed as education. Noom-style outcome promises and diagnosis-adjacent AI output are the two biggest FTC and liability traps in this market; HHH avoids both by design.
4. **Data minimization.** Age instead of DOB, no SSN, no addresses. Every competitor collects more than it needs.
5. **Transparent account deletion.** A one-click deletion path in Settings, the exact opposite of the dark patterns that cost Noom $62 million.

---

## Part 3: Prioritized Feature Roadmap (10 to 15 Features)

Ranked by: (Tier 1) no competitor has it, (Tier 2) only one competitor has it partially, (Tier 3) table stakes HHH should match. Compliance lane noted for each.

### Tier 1: No competitor has this (build first)

**1. Consistency Grading Engine, expanded (A+ to F) with predictive streak alerts.**
HHH's Weekly Grade Report Card is already unique. Extend it: notify the educator when a client's projected grade drops before the week ends, so outreach happens before the slip, not after. Lane 1, non-PHI (behavioral checklist data only).

**2. Late Slip 2.0: structured self-compassion accountability.**
The Late Slip mechanic (acknowledge a miss, state the reset plan, share to the feed) has no equivalent anywhere. Add educator-visible Late Slip patterns (frequency, day-of-week clustering) so the educator can adjust protocols. Lane 1.

**3. FTC Compliance Guard for protocol language.**
An automated pass over every supplement protocol and educator-facing output that flags disease claims and rewrites them as structure/function language. No platform does this. It is also a sellable standalone service to other practitioners. Lane 1 (operates on de-identified protocol text).

**4. Non-PHI Pre-Session Brief automation (Workflow 8).**
Heads Up generates briefs from PHI. HHH generates them from app engagement data plus a non-clinical intake form using client codes. Same educator value, none of the compliance weight. Lane 1.

**5. Privacy Scorecard as a marketing feature.**
A public, plain-language page showing exactly what HHH does and does not collect, side by side with the category norm. Turns the data minimization architecture into a sales asset. No competitor can publish this page without first changing their data model. Lane 1.

**6. Protocol Adherence Loop with Fullscript.**
Fullscript ends at checkout. HHH already logs supplement intake. Close the loop: protocol assigned, ordered via Fullscript, daily intake logged, adherence percentage on the educator dashboard, automated nudge when adherence drops below threshold. Lane 1 (supplement names without identity-linked clinical context, consistent with the existing Supplement Log; confirm scope with Dr. Hunter before adding any new fields).

### Tier 2: Only partial competitor coverage

**7. AI Meal Guard photo input.**
Healthie has photo food journaling without AI feedback; Noom has feedback without clinical grounding. Combine them: photo in, educational feedback out, through the existing Vercel proxy. Lane 1 (food photos with no identity-linked health data; flag to Dr. Hunter if photo storage is added).

**8. Group Programs and Cohort Challenges.**
Healthie does group coaching for clinics. HHH should do cohort challenges for educators: a 4-week ROOTS cohort with a shared feed, cohort-level grade averages, and a leaderboard by consistency (not by health outcomes, which keeps it educational). Lane 1.

**9. Wearable step and sleep import (Apple Health / Google Fit).**
The Daily Log asks for steps; importing them removes friction. Healthie and Heads Up have broad wearable support. Start with steps and sleep only, the two non-clinical metrics already in the 10-point checklist. HIPAA hard stop: any expansion beyond steps and sleep requires Dr. Hunter's review first. Lane 1 boundary case.

**10. Educator Outcome Reports (cohort-level, de-identified).**
Heads Up proves outcomes with PHI. HHH can prove engagement outcomes with none: average consistency grade improvement, streak length distribution, program completion rates. This is the educator's marketing asset. Lane 1.

**11. White-label mode for other educators.**
Practice Better and Healthie serve practitioners but at platform prices with platform branding. HHH's stack (Vite PWA, Supabase, n8n) is cheap to replicate per tenant. Selling configured instances pairs with the workflow service business in N8N_WORKFLOW_ROADMAP.md. Lane 1.

### Tier 3: Table stakes to match

**12. In-app secure messaging between client and educator.**
Practice Better, Healthie, and Nutrium all have it. Scope it to logistics and encouragement with a PHI disclaimer and auto-redirect to /clinical-inquiry for clinical topics, mirroring the /support form pattern. HIPAA hard stop: review message field design with Dr. Hunter before building.

**13. Scheduling with automated reminders.**
Every practitioner platform has scheduling. HHH currently leans on Doxy.me links. A lightweight booking page feeding the Session Follow-Ups sheet (Workflow 10) keeps it in Lane 1.

**14. Recipe and meal idea library tagged to the ROOTS Framework.**
Nutrium and Practice Better have meal planning. HHH does not need full meal plans (that is dietitian territory and a scope risk); a tagged educational recipe library fits the educator model. Lane 1.

**15. Offline-first PWA logging.**
No competitor's client app handles offline logging well. HHH is already a PWA; adding offline Daily Log capture with background sync is cheap and a real differentiator for daily-habit capture. Lane 1.

---

## Part 4: Positioning Summary

The market splits into data platforms (Heads Up, Cronometer), practice management (Practice Better, Healthie, Nutrium), consumer behavior apps (Noom, MyFitnessPal), and commerce (Fullscript). Nobody owns the intersection HHH sits in: a privacy-first, non-PHI engagement and accountability layer run by a credentialed educator, with AI kept safely in the educational lane.

The compliance failures in this market are repeatable and public: dark-pattern subscriptions (Noom, $62M), ad-driven data sharing (MyFitnessPal), AI over PHI (Heads Up's structural exposure), and outcome-promise marketing (the FTC's standing weight loss enforcement priority). HHH's architecture avoids all four. That should be said out loud in marketing, not just in legal pages.

---

## Sources

- [Healthie vs Practice Better (2026), ProMealPlan](https://www.promealplan.com/en/blog/healthie-vs-practice-better)
- [Practice Better vs. Healthie comparison](https://practicebetter.io/compare/practice-better-vs-healthie)
- [Practice Better Functional Medicine EHR](https://practicebetter.io/who-we-serve/functional-medicine-practitioners)
- [Heads Up Health platform](https://headsuphealth.com/product/)
- [Heads Up Functional Medicine Platform](https://headsuphealth.com/functional-medicine-platform/)
- [Fullscript](https://fullscript.com/)
- [Fullscript labs catalog](https://support.fullscript.com/articles/exploring-the-lab-catalog/)
- [Noom vs MyFitnessPal 2026, Nutrola](https://www.nutrola.app/en/blog/noom-vs-myfitnesspal-which-is-better-2026)
- [Cronometer vs MyFitnessPal 2026, ProMealPlan](https://www.promealplan.com/en/blog/cronometer-vs-myfitnesspal)
- [Nutrium Review 2026, ProMealPlan](https://www.promealplan.com/en/blog/nutrium-review-2026)
- [Nutrium professionals](https://nutrium.com/en/professionals)
- [Noom $56M settlement, NC Journal of Law and Technology](https://journals.law.unc.edu/ncjolt/blogs/diet-app-noom-agrees-to-pay-56-million-to-settle-class-suit/)
- [Noom settlement final approval, WMP Law](https://wittelslaw.com/cases/noom-weight-loss-program-auto-enrollment-class-action)
- [FTC weight loss enforcement](https://www.ftc.gov/weight-loss)
- [FTC dark patterns enforcement policy](https://www.privacyworld.blog/2021/10/breaking-ftc-announces-it-will-ramp-up-enforcement-against-dark-patterns-directed-at-consumers/)
- [Functional Medicine EMR roundup 2026, Pabau](https://pabau.com/blog/functional-medicine-emr/)
- [Top EMRs for Functional Medicine 2026, OptiMantra](https://www.optimantra.com/blog/top-9-best-electronic-medical-records-emrs-for-functional-medicine-practices-in-2025)
