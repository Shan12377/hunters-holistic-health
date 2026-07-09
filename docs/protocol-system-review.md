# Protocol System Review
## Educator side, client side, what's missing, and the GLP-1 question
### Prepared July 2026. From a full code audit of the protocol system plus healthcare adherence UX research.

---

## Part 1: How It Works Today (plain English)

**Educator side (Protocol Builder):** You pick a template (Parasite Cleanse or Blood Pressure live; four more marked coming soon), edit the ROOTS pillar content, toggle which sections and items the client sees (the shared flag), and save. Saving upserts ONE row per client: assigning a new protocol silently overwrites the old one. There is no draft state, no version history, and no way to preview what the client will see before assigning.

**Client side (My Protocol):** The client gets a phased, tabbed page (Phase 0 to 3, Overview, Supplements). It is read-only. On first open they face roughly 18 to 20 items and about 2,500 words with nothing to tap, check, or complete. The protocol has NO connection to the Daily Log or Supplement Log; the client is asked to follow a document in one part of the app and record their day in another, with nothing linking the two.

**The four-page confusion:** ProtocolPage (generic ROOTS education, same for everyone), MyProtocolPage (the assigned protocol), ProtocolPlanPage (a Metabolic Reset meal planner not connected to the assigned protocol), ProtocolMatrixPage (diet compatibility matrix). Four destinations that all sound like "my protocol" to a client.

---

## Part 2: The Fix List

### P0: Compliance and house-rule violations (this week)

1. **The Blood Pressure template contains Amazon affiliate links.** Your own operating manual says all supplement links point to huntersholistichealth.com protocol pages, never Amazon or Fullscript. Replace them.
2. **DSHEA disclaimer appears only in the page footer.** Supplement items with dosing need the disclaimer at the supplements section level at minimum. Per-item is safest for anything with a dose.
3. Blood Pressure and Hormone Balance template files are truncated/incomplete while one of them is a live, assignable template. Finish or pull.

### P1: The client experience (the "intuitive, not overwhelming" answer)

The research is consistent: health apps that drive adherence show only what matters today and let people tap deeper by choice (progressive disclosure), replace static documents with progress mechanics (streaks, completion, progress bars), and avoid the everything-at-once wall. Your current client view is the everything-at-once wall.

**The redesign, three layers:**

1. **Layer 1, Today (the default screen):** "Your protocol today: 4 items." Checkable. Morning supplements, one habit, one educational nugget, one tracking task. Checking items feeds the existing Daily Command Center progress ring and (server-side) points. The protocol stops being a document and becomes the day plan.
2. **Layer 2, This Phase:** tap into the current phase to see the week's picture and why this phase matters. One phase visible in full at a time; future phases show as locked previews with unlock timing ("Phase 2 opens day 15"). Locked content reduces overwhelm AND creates anticipation.
3. **Layer 3, The Full Map:** the complete protocol remains available behind an "overview" tap for people who want everything. Nobody lands there by default.

**Why this works:** the client only ever faces 3 to 5 actions, completion is visible daily, and the Weekly Report Card can include protocol adherence as a graded line. This also fixes the biggest structural gap: protocol and daily tracking finally feed each other.

**Also:** consolidate the four pages to two. "My Protocol" (the personalized three-layer experience) and "ROOTS Curriculum" (the education). The meal planner and diet matrix become tools linked FROM the protocol when relevant, not sibling destinations.

### P2: The educator experience

1. Preview-as-client button before assigning. You should never assign sight-unseen.
2. Draft state and an "assigned on" history (even a simple protocol_history table row per assignment). Overwrite-on-save with no history will eventually destroy work you needed.
3. Duplicate-to-client: build once, assign a copy to several clients, then personalize each. Right now every client is hand-built from the template.
4. An adherence view per client: which items get checked, which get skipped. The skipped items are your session agenda; that data is coaching gold you currently cannot see.

---

## Part 3: What Protocol Is Missing

Four of the six templates already have content files (Gut Healing and Metabolic Reset are substantially complete in code but marked coming soon). Per your own rule, they ship only after YOUR clinical review; that review is the fastest path to doubling your live catalog, no new writing needed.

**The genuinely missing one is the GLP-1 Exit Strategy protocol, and it should be your flagship.** The case:

- It is the term you are coining (authority-playbook Move 1). A named protocol IS the product form of the term. People who read the guide need somewhere to go; this is where.
- You already own the audience insight (two-thirds regain, Wilding 2021; lean mass loss) and the content pillars: protein targets during loss, resistance work to protect lean mass, blood sugar education, and the month-one-after-last-dose plan, all built BEFORE the last dose.
- It maps cleanly onto ROOTS phases, so it fits the existing builder with a new protocol_type of glp1_exit.
- Compliance shape: it is entirely education around the medication journey, never medication guidance. "Never change your medication without your prescriber" sits on every phase.

Per your hard-stop rule, I will not draft its clinical content; that is yours to write or approve. The engineering shell (template type, phases, item structure) can be scoped whenever you say go.

After GLP-1 Exit, the next gap worth considering is a Foundations/First 30 Days starter protocol every new member gets automatically, so nobody sits protocol-less between joining and their first educator assignment. Low clinical risk, high activation value.

---

## Part 4: The GLP-1 Positioning Answer (the confusion you named)

What happened: you went all-in on GLP-1 as the brand and it was not fruitful. The temptation now is to conclude GLP-1 was the wrong topic. It wasn't. The POSITION was wrong, not the topic.

**Why GLP-only as a brand underperforms:** the audience is transient (people leave the medication and leave the niche), the space is crowded with prescriber voices and med-spa marketing you don't want to compete with, and it caged you as "the GLP-1 person" when your actual method (ROOTS) is bigger than any one medication.

**Why GLP-1 as a wedge works:** it is the single most urgent, most searched, most underserved entry point into your real subject, metabolic health education. The person terrified of regaining weight after semaglutide is the same person who needs everything else you teach.

**The position, one sentence:** broad platform, narrow front door. Hunter's Holistic Health is metabolic health education for anyone with unexplained numbers; the GLP-1 Exit Strategy is the flagship doorway you are famous for. Niche gets them in; breadth keeps them for years. Your landing page already speaks broad ("you have had the numbers for years"); your content spike and coined term go narrow. That split is correct. Nothing to unwind, only to stop feeling like the earlier GLP-only chapter was wasted: it built the expertise the wedge now runs on.

---

## Part 5: Build Order

| # | Item | Priority | Size |
|---|---|---|---|
| 1 | Replace Amazon links in BP template with house links | P0 | Tiny |
| 2 | DSHEA disclaimer at supplements-section level in all templates | P0 | Tiny |
| 3 | Finish or pull truncated BP and Hormone templates | P0 | Small (your content review) |
| 4 | Today view: checkable daily protocol items feeding Daily Command Center | P1 | Medium |
| 5 | Phase locking with unlock timing | P1 | Small |
| 6 | Consolidate four protocol pages into two | P1 | Small |
| 7 | Educator preview-as-client + assignment history | P1 | Small |
| 8 | Your clinical review of Gut Healing + Metabolic Reset → flip live | P1 | Your time, not code |
| 9 | GLP-1 Exit Strategy protocol shell (content by you) | P1 | Medium |
| 10 | Duplicate-to-client + adherence view for educator | P2 | Medium |
| 11 | Auto-assigned First 30 Days starter protocol | P2 | Small |

Items 1 and 2 are compliance and should not wait. Item 4 is the single biggest client-experience upgrade in the whole system. Per your rules: scope agreement before any code, one change at a time, build passes before done.

Sources: [Progressive disclosure in mobile UX](https://www.digia.tech/post/progressive-disclosure-mobile-ux/), [Healthcare UX best practices 2026](https://fuselabcreative.com/healthcare-ux-design-best-practices-guide/), [Healthcare UI design 2026](https://www.eleken.co/blog-posts/user-interface-design-for-healthcare-applications), [UX principles transforming healthcare apps](https://ideatheorem.com/insights/blog/ui-ux-design/ux-design-principles-that-are-transforming-healthcare-apps-in-2026)
